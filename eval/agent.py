"""
OpenAI API-compatible Computer Use Agent.

Configured entirely via environment variables — no model names are
hardcoded here. Point it at any OpenAI-compatible endpoint.

Required env vars:
  OPENAI_API_KEY     - API key (use a placeholder if your endpoint doesn't need one)
  OPENAI_BASE_URL    - Base URL for the API (e.g. http://localhost:11434/v1)
  MODEL              - Model identifier to request

The agent is vision-only: it receives screenshots and outputs structured
actions via function calling. It has no access to the app's internal state.
"""

import base64
import json
import logging
import os
from typing import Any

from openai import OpenAI

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are a computer use agent. You will be shown a screenshot of a web application \
and given a task to complete. Use the computer_use tool to interact with the page.

Guidelines:
- Look carefully at the screenshot before acting. Identify the relevant UI elements.
- Click on elements by their visible center coordinates.
- After typing into a field, press Enter or click the next button to proceed.
- If you need to scroll to see more content, scroll down first.
- When the task is complete, call computer_use with action="done".
- If you determine the task cannot be completed from the current state, call action="fail".
- Be deliberate — one action per turn.\
"""

# Tool definition in OpenAI function-calling format.
# No model-specific formats — any API that supports tool_use will work.
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "computer_use",
            "description": "Interact with the browser to complete the task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": [
                            "left_click",
                            "double_click",
                            "type",
                            "key",
                            "scroll",
                            "wait",
                            "done",
                            "fail",
                        ],
                        "description": "The action to perform.",
                    },
                    "coordinate": {
                        "type": "array",
                        "items": {"type": "integer"},
                        "description": "[x, y] pixel coordinates on the 1280x900 viewport. Required for left_click, double_click, and scroll.",
                    },
                    "text": {
                        "type": "string",
                        "description": "Text to type (for 'type'), or key name (for 'key', e.g. 'Enter', 'Tab', 'Escape').",
                    },
                    "direction": {
                        "type": "string",
                        "enum": ["up", "down"],
                        "description": "Scroll direction. Required for 'scroll'.",
                    },
                    "amount": {
                        "type": "integer",
                        "description": "Scroll amount in pixels. Default 300.",
                    },
                },
                "required": ["action"],
            },
        },
    }
]


class CUAAgent:
    """
    Stateful computer use agent. Maintains a sliding-window conversation
    history across steps within a single task episode.

    Mirrors the OSWorld mm_agents interface:
      agent.reset()
      response, actions = agent.predict(instruction, obs)
    """

    def __init__(
        self,
        max_tokens: int = 2048,
        history_n: int = 4,
    ):
        self.max_tokens = max_tokens
        self.history_n = history_n

        self._client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY", ""),
            base_url=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        )
        self._model = os.environ["MODEL"]

        # Per-episode state (cleared on reset)
        self._screenshots: list[str] = []   # base64 PNGs
        self._responses: list[str] = []      # raw assistant responses
        self._actions: list[str] = []        # text descriptions for logging
        self._logger: logging.Logger = logger

    def reset(self, _logger: logging.Logger | None = None) -> None:
        """Clear episode state. Call before each new task."""
        self._screenshots = []
        self._responses = []
        self._actions = []
        self._logger = _logger or logger

    def predict(self, instruction: str, obs: dict) -> tuple[str, list[dict]]:
        """
        Given the current screenshot, return (raw_response, [action_dict]).

        The agent is called once per step. It receives:
          obs["screenshot"]: raw PNG bytes
          obs["instruction"]: the task goal string (same as `instruction`)

        Returns:
          response: raw string from the model (for logging)
          actions:  list of action dicts (usually length 1)
        """
        screenshot_b64 = base64.standard_b64encode(obs["screenshot"]).decode("utf-8")
        self._screenshots.append(screenshot_b64)

        messages = self._build_messages(instruction, screenshot_b64)

        self._logger.debug(f"Calling API with {len(messages)} messages")

        completion = self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            tools=TOOLS,
            tool_choice="required",
            max_tokens=self.max_tokens,
        )

        message = completion.choices[0].message
        response_text = message.content or ""

        actions = self._parse_actions(message)
        if not actions:
            self._logger.warning("No tool call returned, defaulting to wait")
            actions = [{"action": "wait"}]

        # Log the action description for history
        action_desc = self._describe_action(actions[0])
        self._actions.append(action_desc)
        self._responses.append(response_text or json.dumps(actions[0]))

        self._logger.info(f"  → {action_desc}")
        return response_text, actions

    def _build_messages(self, instruction: str, current_screenshot_b64: str) -> list[dict]:
        """
        Build a sliding-window multi-turn conversation.

        Steps inside the window: full screenshot + response.
        Steps outside the window: text-only summary (images dropped to save tokens).
        Current step: screenshot only (instruction provided on first turn).
        """
        messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]

        n_history = len(self._screenshots) - 1  # exclude current step
        window_start = max(0, n_history - self.history_n + 1)

        for i in range(n_history):
            hist_b64 = self._screenshots[i]
            hist_response = self._responses[i] if i < len(self._responses) else ""

            if i < window_start:
                # Outside window: drop image, keep action summary
                user_content: list[dict[str, Any]] = [
                    {"type": "text", "text": f"[Step {i + 1}: {self._actions[i] if i < len(self._actions) else 'action taken'}]"},
                ]
            else:
                # Inside window: include screenshot
                user_content = [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{hist_b64}"},
                    }
                ]
                if i == 0:
                    user_content.append({"type": "text", "text": f"Task: {instruction}"})

            messages.append({"role": "user", "content": user_content})
            messages.append({"role": "assistant", "content": hist_response})

        # Current step
        current_content: list[dict[str, Any]] = [
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{current_screenshot_b64}"},
            }
        ]
        if n_history == 0:
            current_content.append({"type": "text", "text": f"Task: {instruction}"})

        messages.append({"role": "user", "content": current_content})
        return messages

    def _parse_actions(self, message: Any) -> list[dict]:
        """Extract action dicts from tool_calls on the response message."""
        actions = []
        if message.tool_calls:
            for tool_call in message.tool_calls:
                if tool_call.function.name == "computer_use":
                    try:
                        action = json.loads(tool_call.function.arguments)
                        actions.append(action)
                    except json.JSONDecodeError as e:
                        self._logger.error(f"Failed to parse tool call args: {e}")
        return actions

    def _describe_action(self, action: dict) -> str:
        """Human-readable one-liner for an action dict."""
        t = action.get("action", "?")
        if t in ("left_click", "double_click"):
            coord = action.get("coordinate", "?")
            return f"{t} at {coord}"
        elif t == "type":
            text = action.get("text", "")
            return f"type '{text[:40]}{'...' if len(text) > 40 else ''}'"
        elif t == "key":
            return f"key '{action.get('text', '?')}'"
        elif t == "scroll":
            return f"scroll {action.get('direction', 'down')} {action.get('amount', 300)}px at {action.get('coordinate', '?')}"
        else:
            return t
