"""
Evaluate a trained GRPO policy against the live JetBlue clone.

Bridges the action-space gap: the policy outputs annotation indices
(Discrete(9) from training), but the live browser needs pixel coordinates.
At each step, we query window.__annotations__() to map the predicted
annotation index to a bbox center click.

Usage:
    uv run python eval/run_trained.py
    uv run python eval/run_trained.py --policy training_results/best_policy.pt
"""

import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F

# Import eval/env.py (not root env.py)
import importlib.util
_eval_env_spec = importlib.util.spec_from_file_location("eval_env", Path(__file__).parent / "env.py")
_eval_env = importlib.util.module_from_spec(_eval_env_spec)
_eval_env_spec.loader.exec_module(_eval_env)
JetBlueEnv = _eval_env.JetBlueEnv

sys.path.insert(0, str(Path(__file__).parent.parent))
from train import CNNPolicy

TASKS_PATH = Path(__file__).parent / "tasks.json"
RESULTS_DIR = Path(__file__).parent / "results"


async def run_trained_eval(policy_path: str, headless: bool = True):
    # Load policy
    n_actions = 9  # matches training env
    policy = CNNPolicy(n_actions)
    policy.load_state_dict(torch.load(policy_path, map_location="cpu", weights_only=True))
    policy.eval()
    print(f"Loaded policy from {policy_path}")

    with open(TASKS_PATH) as f:
        tasks = json.load(f)

    env = JetBlueEnv(headless=headless)
    run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    RESULTS_DIR.mkdir(exist_ok=True)

    print(f"\n=== Trained Policy Eval [{run_id}] ===")
    print(f"Tasks: {[t['id'] for t in tasks]}\n")

    try:
        await env.start()
        results = []

        for task in tasks:
            task_id = task["id"]
            max_steps = task.get("max_steps", 15)
            print(f"  Running: {task_id} ({max_steps} steps)...", end=" ", flush=True)

            obs = await env.reset(task)
            steps_taken = 0
            done = False

            for step_idx in range(max_steps):
                # Get screenshot and run policy
                screenshot = obs["screenshot"]
                # Convert PNG bytes to numpy array
                from PIL import Image
                import io
                img = Image.open(io.BytesIO(screenshot)).convert("RGB")
                # Resize to match training observation size
                img = img.resize((640, 480))
                obs_array = np.array(img, dtype=np.uint8)

                # Get action from policy
                action, _ = policy.get_action_and_logprob(obs_array)

                # Bridge: map annotation index to pixel coordinates
                # Query the live page for current annotations
                annotations = await env._page.evaluate("""
                    () => window.__annotations__().filter(a => a.interactive)
                """)

                if action < len(annotations):
                    ann = annotations[action]
                    bbox = ann["bbox"]
                    cx = bbox["x"] + bbox["width"] / 2
                    cy = bbox["y"] + bbox["height"] / 2

                    # Click at the annotation's center
                    browser_action = {
                        "action": "left_click",
                        "coordinate": [int(cx), int(cy)]
                    }
                else:
                    # Out of range — click center of screen as fallback
                    browser_action = {
                        "action": "left_click",
                        "coordinate": [640, 450]
                    }

                obs, reward, done, info = await env.step(browser_action)
                steps_taken += 1

                if done:
                    break

                if await env.evaluate() >= 1.0:
                    done = True
                    break

            score = await env.evaluate()
            final_state = await env.get_state()

            status = "PASS" if score >= 1.0 else "FAIL"
            print(f"{status} (score={score:.1f}, steps={steps_taken}, "
                  f"final_step={final_state.get('step', '?')})")

            results.append({
                "task_id": task_id,
                "instruction": task["instruction"],
                "difficulty": task.get("difficulty", "?"),
                "score": score,
                "success": score >= 1.0,
                "steps_taken": steps_taken,
                "max_steps": max_steps,
                "final_app_step": final_state.get("step", "?"),
                "agent": "trained_grpo",
            })

        # Summary
        print()
        print("=" * 60)
        print(f"TRAINED POLICY RESULTS  [{run_id}]")
        print("=" * 60)
        for r in results:
            status = "PASS" if r["success"] else "FAIL"
            print(
                f"  {'v' if r['success'] else 'x'} {status:<4}  "
                f"{r['task_id']:<28}  "
                f"{r['steps_taken']:>2}/{r['max_steps']} steps  "
                f"[{r['difficulty']}]"
            )
        print("-" * 60)
        n_pass = sum(r["success"] for r in results)
        rate = n_pass / len(results) if results else 0.0
        print(f"  Success rate: {rate:.0%}  ({n_pass}/{len(results)})")
        print("=" * 60)

        # Save
        out = {
            "run_id": run_id,
            "model": "trained_grpo",
            "policy_path": str(policy_path),
            "success_rate": rate,
            "n_tasks": len(results),
            "n_pass": n_pass,
            "results": results,
        }
        results_file = RESULTS_DIR / f"trained_{run_id}.json"
        results_file.write_text(json.dumps(out, indent=2))
        print(f"\nResults saved -> {results_file}")

    finally:
        await env.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--policy", default="training_results/best_policy.pt")
    parser.add_argument("--headless", action="store_true", default=True)
    args = parser.parse_args()
    asyncio.run(run_trained_eval(args.policy, headless=args.headless))
