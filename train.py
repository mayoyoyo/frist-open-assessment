"""
GRPO (Group Relative Policy Optimization) training loop for JetBlue booking agent.

GRPO works by:
1. For each task, run G episodes ("group") with the current policy
2. Compute the return (total reward) for each episode
3. Normalize returns within each group: advantage = (return - mean) / std
4. Update the policy to increase probability of actions with positive advantage,
   decrease probability of actions with negative advantage
5. Clip the policy ratio (like PPO) to prevent large updates

This is simpler than PPO because it doesn't need a learned value function —
the group mean acts as the baseline. The key insight from DeepSeekMath (2024)
is that grouping rollouts from the same prompt/task and normalizing within
the group produces stable training without a critic.

Usage:
    uv run python train.py
    uv run python train.py --epochs 100 --group-size 16
"""

import argparse
import copy
import json
import os
import time
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.distributions import Categorical

from env import WebNavEnv


# ── Policy Network ───────────────────────────────────────────────────────────

class CNNPolicy(nn.Module):
    """Small CNN policy: screenshot → action probabilities.

    Resizes 640x480 observations to 84x84 for tractability.
    Architecture matches classic Atari DQN-style conv layers.
    """

    def __init__(self, n_actions: int, input_size: int = 84):
        super().__init__()
        self.input_size = input_size
        self.conv = nn.Sequential(
            nn.Conv2d(3, 32, 8, stride=4),
            nn.ReLU(),
            nn.Conv2d(32, 64, 4, stride=2),
            nn.ReLU(),
            nn.Conv2d(64, 64, 3, stride=1),
            nn.ReLU(),
        )
        # Compute conv output size
        dummy = torch.zeros(1, 3, input_size, input_size)
        conv_out = self.conv(dummy).view(1, -1).shape[1]
        self.fc = nn.Sequential(
            nn.Linear(conv_out, 256),
            nn.ReLU(),
            nn.Linear(256, n_actions),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Returns logits (unnormalized log-probabilities)."""
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        return self.fc(x)

    def get_action_and_logprob(self, obs: np.ndarray) -> tuple[int, float]:
        """Sample an action from the policy and return (action, log_prob)."""
        x = self._preprocess(obs)
        with torch.no_grad():
            logits = self.forward(x)
            dist = Categorical(logits=logits)
            action = dist.sample()
            log_prob = dist.log_prob(action)
        return action.item(), log_prob.item()

    def evaluate_actions(self, obs_batch: torch.Tensor, actions: torch.Tensor):
        """Compute log_probs and entropy for a batch of (obs, action) pairs."""
        logits = self.forward(obs_batch)
        dist = Categorical(logits=logits)
        log_probs = dist.log_prob(actions)
        entropy = dist.entropy()
        return log_probs, entropy

    def _preprocess(self, obs: np.ndarray) -> torch.Tensor:
        """Convert HWC uint8 numpy array to NCHW float32 tensor, resized."""
        # obs: (H, W, 3) uint8
        x = torch.from_numpy(obs).float() / 255.0
        x = x.permute(2, 0, 1).unsqueeze(0)  # (1, 3, H, W)
        x = F.interpolate(x, size=(self.input_size, self.input_size), mode="bilinear", align_corners=False)
        return x


# ── Episode Collection ───────────────────────────────────────────────────────

def collect_episode(env: WebNavEnv, policy: CNNPolicy, task_id: str = None):
    """Run one episode, return trajectory data."""
    options = {"task_id": task_id} if task_id else None
    obs, info = env.reset(options=options)

    observations = []
    actions = []
    log_probs = []
    rewards = []

    done = False
    while not done:
        action, log_prob = policy.get_action_and_logprob(obs)
        observations.append(obs)
        actions.append(action)
        log_probs.append(log_prob)

        obs, reward, terminated, truncated, info = env.step(action)
        rewards.append(reward)
        done = terminated or truncated

    return {
        "observations": observations,
        "actions": actions,
        "log_probs": log_probs,
        "rewards": rewards,
        "total_reward": sum(rewards),
        "success": info.get("goal_met", False),
        "task_id": task_id or info.get("task_id", "unknown"),
        "steps": len(actions),
    }


# ── GRPO Update ──────────────────────────────────────────────────────────────

def grpo_update(
    policy: CNNPolicy,
    ref_policy: CNNPolicy,
    optimizer: torch.optim.Optimizer,
    episodes: list[dict],
    clip_eps: float = 0.2,
    kl_beta: float = 0.01,
    entropy_coef: float = 0.01,
) -> dict:
    """
    GRPO policy gradient update.

    Groups episodes by task_id, normalizes returns within each group,
    then updates the policy with clipped advantages.
    """
    # Group episodes by task
    from collections import defaultdict
    groups = defaultdict(list)
    for ep in episodes:
        groups[ep["task_id"]].append(ep)

    # Compute group-normalized advantages
    all_obs = []
    all_actions = []
    all_old_logprobs = []
    all_advantages = []

    for task_id, group in groups.items():
        returns = [ep["total_reward"] for ep in group]
        mean_r = np.mean(returns)
        std_r = np.std(returns) + 1e-8

        for ep in group:
            advantage = (ep["total_reward"] - mean_r) / std_r
            # Apply same advantage to all steps in this episode
            for obs, action, old_lp in zip(ep["observations"], ep["actions"], ep["log_probs"]):
                all_obs.append(obs)
                all_actions.append(action)
                all_old_logprobs.append(old_lp)
                all_advantages.append(advantage)

    if not all_obs:
        return {"loss": 0.0, "kl": 0.0, "entropy": 0.0}

    # Convert to tensors
    obs_tensor = torch.stack([policy._preprocess(o).squeeze(0) for o in all_obs])
    action_tensor = torch.tensor(all_actions, dtype=torch.long)
    old_logprob_tensor = torch.tensor(all_old_logprobs, dtype=torch.float32)
    advantage_tensor = torch.tensor(all_advantages, dtype=torch.float32)

    # Forward pass
    new_logprobs, entropy = policy.evaluate_actions(obs_tensor, action_tensor)

    # Reference policy log probs (for KL penalty)
    with torch.no_grad():
        ref_logprobs, _ = ref_policy.evaluate_actions(obs_tensor, action_tensor)

    # Policy ratio
    ratio = torch.exp(new_logprobs - old_logprob_tensor)

    # Clipped surrogate loss (PPO-style)
    surr1 = ratio * advantage_tensor
    surr2 = torch.clamp(ratio, 1 - clip_eps, 1 + clip_eps) * advantage_tensor
    policy_loss = -torch.min(surr1, surr2).mean()

    # KL divergence penalty (approximate)
    kl = (ref_logprobs - new_logprobs).mean()

    # Entropy bonus (prevent collapse)
    entropy_loss = -entropy.mean()

    # Total loss
    loss = policy_loss + kl_beta * kl + entropy_coef * entropy_loss

    optimizer.zero_grad()
    loss.backward()
    torch.nn.utils.clip_grad_norm_(policy.parameters(), 1.0)
    optimizer.step()

    return {
        "loss": loss.item(),
        "policy_loss": policy_loss.item(),
        "kl": kl.item(),
        "entropy": entropy.mean().item(),
    }


# ── Main Training Loop ──────────────────────────────────────────────────────

def train(args):
    print("=" * 60)
    print("GRPO Training — JetBlue Booking Agent")
    print("=" * 60)

    # Setup
    env = WebNavEnv(game_dir=".")
    n_actions = env.action_space.n
    task_ids = [t["id"] for _, t in env._all_tasks]

    print(f"Action space: Discrete({n_actions})")
    print(f"Obs shape: {env.observation_space.shape}")
    print(f"Tasks: {task_ids}")
    print(f"Epochs: {args.epochs}, Group size: {args.group_size}")
    print(f"LR: {args.lr}, Clip: {args.clip_eps}, KL beta: {args.kl_beta}")
    print()

    # Initialize policy and reference
    policy = CNNPolicy(n_actions)
    ref_policy = copy.deepcopy(policy)
    ref_policy.eval()
    for p in ref_policy.parameters():
        p.requires_grad = False

    optimizer = torch.optim.Adam(policy.parameters(), lr=args.lr)

    # Training log
    log = {
        "config": vars(args),
        "epochs": [],
    }

    results_dir = Path("training_results")
    results_dir.mkdir(exist_ok=True)

    best_reward = -float("inf")
    start_time = time.time()

    for epoch in range(1, args.epochs + 1):
        policy.eval()

        # ── Collect episodes (GRPO groups) ──
        episodes = []
        for task_id in task_ids:
            for _ in range(args.group_size):
                ep = collect_episode(env, policy, task_id=task_id)
                episodes.append(ep)

        # ── Compute stats ──
        mean_reward = np.mean([ep["total_reward"] for ep in episodes])
        mean_steps = np.mean([ep["steps"] for ep in episodes])
        success_rate = np.mean([ep["success"] for ep in episodes])

        per_task = {}
        for task_id in task_ids:
            task_eps = [ep for ep in episodes if ep["task_id"] == task_id]
            per_task[task_id] = {
                "mean_reward": np.mean([ep["total_reward"] for ep in task_eps]),
                "success_rate": np.mean([ep["success"] for ep in task_eps]),
            }

        # ── GRPO update ──
        policy.train()
        update_stats = grpo_update(
            policy, ref_policy, optimizer, episodes,
            clip_eps=args.clip_eps,
            kl_beta=args.kl_beta,
            entropy_coef=args.entropy_coef,
        )

        # ── Log ──
        elapsed = time.time() - start_time
        epoch_data = {
            "epoch": epoch,
            "mean_reward": float(mean_reward),
            "success_rate": float(success_rate),
            "mean_steps": float(mean_steps),
            "loss": update_stats["loss"],
            "policy_loss": update_stats["policy_loss"],
            "kl": update_stats["kl"],
            "entropy": update_stats["entropy"],
            "elapsed": elapsed,
            "per_task": per_task,
        }
        log["epochs"].append(epoch_data)

        if mean_reward > best_reward:
            best_reward = mean_reward
            torch.save(policy.state_dict(), results_dir / "best_policy.pt")

        # Print progress
        task_str = "  ".join(
            f"{tid[:8]}:{per_task[tid]['success_rate']:.0%}"
            for tid in task_ids
        )
        print(
            f"[{epoch:3d}/{args.epochs}]  "
            f"reward={mean_reward:+.3f}  "
            f"success={success_rate:.0%}  "
            f"steps={mean_steps:.1f}  "
            f"entropy={update_stats['entropy']:.2f}  "
            f"loss={update_stats['loss']:.4f}  "
            f"| {task_str}"
        )

        # Update reference policy periodically
        if epoch % args.ref_update_freq == 0:
            ref_policy.load_state_dict(policy.state_dict())

    # ── Save final results ──
    torch.save(policy.state_dict(), results_dir / "final_policy.pt")

    with open(results_dir / "training_log.json", "w") as f:
        json.dump(log, f, indent=2, default=str)

    # ── Plot reward curve ──
    epochs_list = [e["epoch"] for e in log["epochs"]]
    rewards_list = [e["mean_reward"] for e in log["epochs"]]
    success_list = [e["success_rate"] for e in log["epochs"]]
    entropy_list = [e["entropy"] for e in log["epochs"]]

    fig, axes = plt.subplots(1, 3, figsize=(15, 4))

    axes[0].plot(epochs_list, rewards_list, "b-", alpha=0.7)
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Mean Reward")
    axes[0].set_title("Reward Curve")
    axes[0].grid(True, alpha=0.3)

    axes[1].plot(epochs_list, success_list, "g-", alpha=0.7)
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Success Rate")
    axes[1].set_title("Success Rate")
    axes[1].set_ylim(-0.05, 1.05)
    axes[1].grid(True, alpha=0.3)

    axes[2].plot(epochs_list, entropy_list, "r-", alpha=0.7)
    axes[2].set_xlabel("Epoch")
    axes[2].set_ylabel("Entropy")
    axes[2].set_title("Policy Entropy")
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(results_dir / "reward_curve.png", dpi=150)
    print(f"\nReward curve saved to {results_dir / 'reward_curve.png'}")

    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"Training complete in {elapsed:.0f}s")
    print(f"Best reward: {best_reward:+.3f}")
    print(f"Final success rate: {success_rate:.0%}")
    print(f"Policy saved to {results_dir / 'final_policy.pt'}")
    print(f"{'='*60}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GRPO training for JetBlue booking agent")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--group-size", type=int, default=8, help="Episodes per task per epoch (G)")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning rate")
    parser.add_argument("--clip-eps", type=float, default=0.2, help="PPO clip epsilon")
    parser.add_argument("--kl-beta", type=float, default=0.01, help="KL penalty coefficient")
    parser.add_argument("--entropy-coef", type=float, default=0.05, help="Entropy bonus coefficient")
    parser.add_argument("--ref-update-freq", type=int, default=10, help="Update reference policy every N epochs")
    args = parser.parse_args()
    train(args)
