"""
Random baseline for the CUA eval harness.

Executes random click actions to establish a 0% baseline score.
No VLM or API key required.

Usage:
    python eval/run_random_baseline.py
    python eval/run_random_baseline.py --headless
"""

import asyncio
import json
import random
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from env import JetBlueEnv

TASKS_PATH = Path(__file__).parent / "tasks.json"
RESULTS_DIR = Path(__file__).parent / "results"


async def run_random_baseline(headless: bool = True):
    with open(TASKS_PATH) as f:
        tasks = json.load(f)

    env = JetBlueEnv(headless=headless)
    run_id = datetime.now().strftime("%Y%m%d_%H%M%S")

    RESULTS_DIR.mkdir(exist_ok=True)

    print(f"=== Random Baseline [{run_id}] ===")
    print(f"Tasks: {[t['id'] for t in tasks]}\n")

    try:
        await env.start()
        results = []

        for task in tasks:
            task_id = task["id"]
            max_steps = task.get("max_steps", 15)
            print(f"  Running: {task_id} ({max_steps} steps)...", end=" ", flush=True)

            obs = await env.reset(task)
            steps = []
            done = False

            for step_idx in range(max_steps):
                # Random action: click at random coordinates
                x = random.randint(0, 1279)
                y = random.randint(0, 899)
                action = {"action": "left_click", "coordinate": [x, y]}

                obs, reward, done, info = await env.step(action)
                steps.append({"step": step_idx, "action": action})

                if done:
                    break

                # Check goal
                if await env.evaluate() >= 1.0:
                    done = True
                    break

            score = await env.evaluate()
            final_state = await env.get_state()

            status = "PASS" if score >= 1.0 else "FAIL"
            print(f"{status} (score={score:.1f}, steps={len(steps)}, final_step={final_state.get('step', '?')})")

            results.append({
                "task_id": task_id,
                "instruction": task["instruction"],
                "difficulty": task.get("difficulty", "?"),
                "score": score,
                "success": score >= 1.0,
                "steps_taken": len(steps),
                "max_steps": max_steps,
                "final_app_step": final_state.get("step", "?"),
                "agent": "random",
            })

        # Summary
        print()
        print("=" * 60)
        print(f"RANDOM BASELINE RESULTS  [{run_id}]")
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
            "model": "random",
            "success_rate": rate,
            "n_tasks": len(results),
            "n_pass": n_pass,
            "results": results,
        }
        results_file = RESULTS_DIR / f"baseline_random_{run_id}.json"
        results_file.write_text(json.dumps(out, indent=2))
        print(f"\nResults saved -> {results_file}")

    finally:
        await env.close()


if __name__ == "__main__":
    headless = "--headless" in sys.argv or True  # default headless
    asyncio.run(run_random_baseline(headless=headless))
