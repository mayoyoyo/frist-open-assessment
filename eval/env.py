"""
JetBlue clone environment for CUA evaluation.

The agent is vision-only — it receives screenshots and outputs actions.
Goal checking is done by the runner via window.__state__(), which is
transparent to the agent.
"""

import asyncio
import json
import subprocess
import time
from pathlib import Path

from playwright.async_api import async_playwright, Page, Browser, BrowserContext

CLONE_PATH = Path(__file__).parent.parent / "jetblue-v3"


def _check_goal(state: dict, goal: dict) -> bool:
    """Evaluate a goal predicate dict against the current app state."""
    for key, predicate in goal.items():
        value = state.get(key)
        if isinstance(predicate, dict):
            op, target = next(iter(predicate.items()))
            if op == "equals" and value != target:
                return False
            elif op == "not_equals" and value == target:
                return False
            elif op == "contains" and (value is None or target not in value):
                return False
            elif op == "gte" and not (value is not None and value >= target):
                return False
            elif op == "gt" and not (value is not None and value > target):
                return False
            elif op == "lte" and not (value is not None and value <= target):
                return False
        else:
            if value != predicate:
                return False
    return True


class JetBlueEnv:
    """
    Wraps the JetBlue v3 React clone as a Gymnasium-style environment.

    The agent only ever receives:
      - obs["screenshot"]: raw PNG bytes of the current viewport
      - obs["instruction"]: the task instruction string

    Goal evaluation is done by the runner via page.evaluate("window.__state__()").
    The agent has no visibility into this.
    """

    PORT = 5174

    def __init__(
        self,
        headless: bool = False,
        viewport: dict = None,
    ):
        self.headless = headless
        self.viewport = viewport or {"width": 1280, "height": 900}
        self._server: subprocess.Popen | None = None
        self._playwright = None
        self._browser: Browser | None = None
        self._context: BrowserContext | None = None
        self._page: Page | None = None
        self._current_task: dict | None = None

    async def start(self):
        """Start the Vite dev server and launch the browser. Call once before running tasks."""
        self._server = subprocess.Popen(
            ["bun", "run", "dev", "--port", str(self.PORT)],
            cwd=str(CLONE_PATH),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        # Wait for dev server to be ready
        await asyncio.sleep(4)

        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(headless=self.headless)
        self._context = await self._browser.new_context(
            viewport=self.viewport,
            device_scale_factor=1,
        )
        self._page = await self._context.new_page()

    async def reset(self, task: dict) -> dict:
        """
        Reset to the task's start state. Returns the initial observation.

        The start state is set via window.__setState__(), which the clone
        handles internally — routing and app state are both updated.
        """
        self._current_task = task

        # Navigate to root first to ensure a clean page load
        await self._page.goto(f"http://localhost:{self.PORT}/")
        await self._page.wait_for_load_state("networkidle")
        await asyncio.sleep(0.5)

        # Inject the start state
        if "start" in task and task["start"]:
            start_state = task["start"]
            await self._page.evaluate(
                f"window.__setState__({json.dumps(start_state)})"
            )
            await asyncio.sleep(0.8)

        return await self._get_obs()

    async def step(self, action: dict) -> tuple[dict, float, bool, dict]:
        """
        Execute one action. Returns (obs, reward, done, info).

        Reward is always 0.0 mid-episode — success is determined by evaluate()
        at episode end, matching the OSWorld pattern.

        Action format:
          { "action": "left_click", "coordinate": [x, y] }
          { "action": "type", "text": "hello" }
          { "action": "key", "text": "Enter" }
          { "action": "scroll", "coordinate": [x, y], "direction": "down", "amount": 300 }
          { "action": "wait" }
          { "action": "done" }
          { "action": "fail" }
        """
        done = False
        info = {}

        action_type = action.get("action", "")

        if action_type == "done":
            done = True
            info["done"] = True

        elif action_type == "fail":
            done = True
            info["fail"] = True

        elif action_type == "left_click":
            x, y = action["coordinate"]
            await self._page.mouse.click(x, y)

        elif action_type == "double_click":
            x, y = action["coordinate"]
            await self._page.mouse.dblclick(x, y)

        elif action_type == "type":
            await self._page.keyboard.type(action["text"], delay=30)

        elif action_type == "key":
            await self._page.keyboard.press(action["text"])

        elif action_type == "scroll":
            x, y = action.get("coordinate", [640, 450])
            direction = action.get("direction", "down")
            amount = action.get("amount", 300)
            await self._page.mouse.move(x, y)
            delta = amount if direction == "down" else -amount
            await self._page.mouse.wheel(0, delta)

        elif action_type == "wait":
            await asyncio.sleep(1.5)

        # Brief settle after any action
        if not done:
            await asyncio.sleep(0.6)

        obs = await self._get_obs()
        return obs, 0.0, done, info

    async def evaluate(self) -> float:
        """
        Check whether the current app state satisfies the task's goal predicate.

        This is runner-level instrumentation — the agent never calls this.
        Returns 1.0 on success, 0.0 on failure.
        """
        if not self._current_task or "goal" not in self._current_task:
            return 0.0
        state = await self._page.evaluate("window.__state__()")
        return 1.0 if _check_goal(state, self._current_task["goal"]) else 0.0

    async def get_state(self) -> dict:
        """Return the raw app state dict. For debugging and logging only."""
        return await self._page.evaluate("window.__state__()")

    async def _get_obs(self) -> dict:
        screenshot = await self._page.screenshot(type="png")
        return {
            "screenshot": screenshot,
            "instruction": self._current_task.get("instruction", "") if self._current_task else "",
        }

    async def close(self):
        if self._context:
            await self._context.close()
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()
        if self._server:
            self._server.terminate()
            self._server.wait()
