"""
CUA Eval Runner — JetBlue v3 clone.

Usage:
    python run.py                        # run all tasks
    python run.py search-to-results      # run specific task(s) by ID
    python run.py --headless             # run without browser window

Required env vars:
    OPENAI_API_KEY      API key for your model endpoint
    OPENAI_BASE_URL     Base URL (e.g. https://api.openai.com/v1)
    MODEL               Model name to use

Example:
    MODEL=gpt-4o OPENAI_API_KEY=sk-... python run.py
"""

import argparse
import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from agent import CUAAgent
from env import JetBlueEnv

TASKS_PATH = Path(__file__).parent / "tasks.json"
RESULTS_DIR = Path(__file__).parent / "results"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("eval")


async def run_task(
    agent: CUAAgent,
    env: JetBlueEnv,
    task: dict,
    save_screenshots: bool = True,
) -> dict:
    """Run a single task episode. Returns a result dict."""
    task_id = task["id"]
    task_logger = logging.getLogger(f"task.{task_id}")

    task_logger.info(f"Starting — {task['instruction']}")
    agent.reset(task_logger)
    obs = await env.reset(task)

    max_steps = task.get("max_steps", 15)
    steps = []
    done = False
    info = {}

    # Optionally save screenshots for review
    screenshots_dir = RESULTS_DIR / "screenshots" / task_id
    if save_screenshots:
        screenshots_dir.mkdir(parents=True, exist_ok=True)

    for step_idx in range(max_steps):
        if save_screenshots:
            shot_path = screenshots_dir / f"step_{step_idx:02d}.png"
            shot_path.write_bytes(obs["screenshot"])

        response, actions = agent.predict(task["instruction"], obs)

        for action in actions:
            obs, reward, done, info = await env.step(action)
            steps.append({"step": step_idx, "action": action, "info": info})
            if done:
                break

        # Check goal state after every step (runner-level, not visible to agent)
        goal_reached = await env.evaluate() >= 1.0
        if goal_reached:
            task_logger.info("Goal reached.")
            done = True
            break

        if done:
            break

    if save_screenshots:
        # Save final screenshot
        final_shot = screenshots_dir / f"step_{len(steps):02d}_final.png"
        final_shot.write_bytes(obs["screenshot"])

    score = await env.evaluate()

    # Log the final app state for debugging
    final_state = await env.get_state()
    task_logger.info(
        f"Done — score={score:.1f}  steps={len(steps)}  "
        f"final_step={final_state.get('step', '?')}"
    )

    return {
        "task_id": task_id,
        "instruction": task["instruction"],
        "difficulty": task.get("difficulty", "?"),
        "score": score,
        "success": score >= 1.0,
        "steps_taken": len(steps),
        "max_steps": max_steps,
        "agent_called_done": info.get("done", False),
        "agent_called_fail": info.get("fail", False),
        "final_app_step": final_state.get("step", "?"),
    }


def _check_env():
    missing = [v for v in ("OPENAI_API_KEY", "OPENAI_BASE_URL", "MODEL") if not os.environ.get(v)]
    if missing:
        print(f"Error: missing required environment variables: {', '.join(missing)}")
        print(__doc__)
        sys.exit(1)


async def main():
    parser = argparse.ArgumentParser(description="Run JetBlue CUA eval")
    parser.add_argument("task_ids", nargs="*", help="Task IDs to run (default: all)")
    parser.add_argument("--headless", action="store_true", help="Run browser headlessly")
    parser.add_argument("--no-screenshots", action="store_true", help="Skip saving screenshots")
    args = parser.parse_args()

    _check_env()

    with open(TASKS_PATH) as f:
        all_tasks = json.load(f)

    tasks = [t for t in all_tasks if not args.task_ids or t["id"] in args.task_ids]
    if not tasks:
        print(f"No tasks matched. Available: {[t['id'] for t in all_tasks]}")
        sys.exit(1)

    RESULTS_DIR.mkdir(exist_ok=True)
    run_id = datetime.now().strftime("%Y%m%d_%H%M%S")

    agent = CUAAgent()
    env = JetBlueEnv(headless=args.headless)

    logger.info(f"Run ID: {run_id}")
    logger.info(f"Model:  {os.environ['MODEL']}")
    logger.info(f"Tasks:  {[t['id'] for t in tasks]}")

    try:
        await env.start()
        results = []

        for task in tasks:
            result = await run_task(
                agent,
                env,
                task,
                save_screenshots=not args.no_screenshots,
            )
            results.append(result)

        # ── Summary ──────────────────────────────────────────────────────
        print()
        print("=" * 60)
        print(f"EVAL RESULTS  [{run_id}]  model={os.environ['MODEL']}")
        print("=" * 60)
        for r in results:
            status = "PASS" if r["success"] else "FAIL"
            diff = r.get("difficulty", "")
            print(
                f"  {'✓' if r['success'] else '✗'} {status:<4}  "
                f"{r['task_id']:<28}  "
                f"{r['steps_taken']:>2}/{r['max_steps']} steps  "
                f"[{diff}]"
            )
        print("-" * 60)
        n_pass = sum(r["success"] for r in results)
        rate = n_pass / len(results) if results else 0.0
        print(f"  Success rate: {rate:.0%}  ({n_pass}/{len(results)})")
        print("=" * 60)

        # ── Save JSON ─────────────────────────────────────────────────────
        out = {
            "run_id": run_id,
            "model": os.environ["MODEL"],
            "success_rate": rate,
            "n_tasks": len(results),
            "n_pass": n_pass,
            "results": results,
        }
        results_file = RESULTS_DIR / f"run_{run_id}.json"
        results_file.write_text(json.dumps(out, indent=2))
        print(f"\nResults saved → {results_file}")
        if not args.no_screenshots:
            print(f"Screenshots  → {RESULTS_DIR / 'screenshots'}/")

    finally:
        await env.close()


if __name__ == "__main__":
    asyncio.run(main())
