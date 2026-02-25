"""
Game-agnostic Gymnasium environment for web navigation RL.

Loads game.json (metadata + tasks) and state_graph.json (states + transitions)
from a game directory. Screenshots are loaded from the game's screenshots/ folder.

Step = dict lookup + array copy. No browser, microseconds per step.

Usage:
    env = WebNavEnv(game_dir="../games/_template")
    obs, info = env.reset()
    obs, reward, terminated, truncated, info = env.step(action)
"""

import json
import os
from collections import deque
from pathlib import Path

import gymnasium
import numpy as np
from gymnasium.spaces import Box, Discrete


def _evaluate_predicate(state: dict, goal: dict) -> bool:
    """Evaluate a goal predicate against a state dict.

    Top-level keys are AND-ed. Each value is a predicate object like
    {"equals": v}, {"contains": v}, {"gte": n}, etc.
    """
    for key, predicate in goal.items():
        if key not in state:
            return False
        actual = state[key]
        if not _check_predicate(actual, predicate):
            return False
    return True


def _check_predicate(actual, predicate: dict) -> bool:
    """Check a single predicate against an actual value."""
    if not isinstance(predicate, dict):
        # Direct value comparison (shorthand for equals)
        return actual == predicate

    for op, expected in predicate.items():
        if op == "equals":
            if actual != expected:
                return False
        elif op == "not_equals":
            if actual == expected:
                return False
        elif op == "contains":
            if isinstance(actual, list):
                if expected not in actual:
                    return False
            elif isinstance(actual, str):
                if expected not in actual:
                    return False
            else:
                return False
        elif op == "gte":
            if not (isinstance(actual, (int, float)) and actual >= expected):
                return False
        elif op == "lte":
            if not (isinstance(actual, (int, float)) and actual <= expected):
                return False
        elif op == "gt":
            if not (isinstance(actual, (int, float)) and actual > expected):
                return False
        elif op == "lt":
            if not (isinstance(actual, (int, float)) and actual < expected):
                return False
        else:
            raise ValueError(f"Unknown predicate operator: {op}")
    return True


class WebNavEnv(gymnasium.Env):
    """Gymnasium environment for navigating a captured web state graph.

    Observation: RGB screenshot resized to (H, W, 3) as uint8 numpy array.
    Action: Integer index into the current state's interactive annotations.
            Out-of-range indices are treated as no-ops.
    Reward: +1.0 for reaching a goal state, -0.01 per step.
            Optional dense shaping via BFS distance to goal.
    """

    metadata = {"render_modes": ["rgb_array"]}

    def __init__(
        self,
        game_dir: str = None,
        game_dirs: list = None,
        render_mode: str = "rgb_array",
    ):
        super().__init__()
        self.render_mode = render_mode

        # Support single game_dir or list of game_dirs
        if game_dirs is not None:
            self._game_dirs = [os.path.abspath(d) for d in game_dirs]
        elif game_dir is not None:
            self._game_dirs = [os.path.abspath(game_dir)]
        else:
            # Default to _template
            self._game_dirs = [
                os.path.abspath(
                    os.path.join(os.path.dirname(__file__), "..", "games", "_template")
                )
            ]

        # Load all games
        self._games = []
        max_interactive = 0
        obs_width = None
        obs_height = None
        max_steps = 20

        for gdir in self._game_dirs:
            game = self._load_game(gdir)
            self._games.append(game)

            if game["max_interactive"] > max_interactive:
                max_interactive = game["max_interactive"]

            # Use first game's observation size as canonical
            if obs_width is None:
                obs_width = game["obs_width"]
                obs_height = game["obs_height"]
                max_steps = game["max_steps"]

        self.obs_width = obs_width
        self.obs_height = obs_height
        self.max_steps = max_steps
        self.max_annotations = max_interactive

        if self.max_annotations == 0:
            raise ValueError("No interactive annotations found in any game")

        # Spaces
        self.observation_space = Box(
            low=0, high=255,
            shape=(self.obs_height, self.obs_width, 3),
            dtype=np.uint8,
        )
        self.action_space = Discrete(self.max_annotations)

        # Pre-load screenshots for all games
        self._screenshots = {}
        for game in self._games:
            self._load_screenshots(game)

        # Collect all tasks across games
        self._all_tasks = []
        for game in self._games:
            for task in game["tasks"]:
                self._all_tasks.append((game, task))

        if not self._all_tasks:
            raise ValueError("No tasks found in any game")

        # Episode state
        self._current_game = None
        self._current_state = None
        self._current_task = None
        self._step_count = 0
        self._prev_distance = None
        self._goal_distances = None
        self._rng = np.random.default_rng()

        # PufferLib compatibility
        self.buf = None

    def _load_game(self, game_dir: str) -> dict:
        """Load a single game from its directory."""
        game_json_path = os.path.join(game_dir, "game.json")
        state_graph_path = os.path.join(game_dir, "state_graph.json")

        with open(game_json_path) as f:
            game_manifest = json.load(f)

        with open(state_graph_path) as f:
            state_graph = json.load(f)

        states = state_graph["states"]
        transitions = state_graph["transitions"]
        sg_metadata = state_graph.get("metadata", {})

        # Observation size from game manifest
        obs_size = game_manifest.get("observationSize", {"width": 640, "height": 480})
        obs_width = obs_size["width"]
        obs_height = obs_size["height"]

        # Viewport from game manifest
        viewport = game_manifest.get("viewport", {"width": 1280, "height": 900})

        # Max steps
        max_steps = game_manifest.get("maxStepsPerEpisode", 20)

        # Pre-compute interactive annotations per state
        state_interactive = {}
        for state_id, state_data in states.items():
            interactive = [
                a["id"] for a in state_data["annotations"]
                if a.get("interactive", False)
            ]
            state_interactive[state_id] = interactive

        # Max interactive annotations
        max_interactive = sg_metadata.get(
            "maxInteractiveAnnotations",
            max((len(anns) for anns in state_interactive.values()), default=0),
        )

        # Resolve tasks: find start state by matching pathname + state
        tasks = []
        for task_def in game_manifest.get("tasks", []):
            start_pathname = task_def["start"]["pathname"]
            start_state_data = task_def["start"]["state"]

            # Find the state that matches pathname + state
            start_state_key = None
            for sid, sdata in states.items():
                if (sdata["pathname"] == start_pathname
                        and self._states_match(sdata["state"], start_state_data)):
                    start_state_key = sid
                    break

            if start_state_key is None:
                # Try partial match (start state may have extra keys)
                for sid, sdata in states.items():
                    if (sdata["pathname"] == start_pathname
                            and self._state_subset_match(start_state_data, sdata["state"])):
                        start_state_key = sid
                        break

            if start_state_key is None:
                continue  # Skip tasks with no matching start state

            tasks.append({
                "id": task_def["id"],
                "prompt": task_def["prompt"],
                "start_state": start_state_key,
                "goal": task_def["goal"],
                "difficulty": task_def.get("difficulty", "medium"),
                "reward_shaping": task_def.get("reward", {}).get("shaping", "none"),
            })

        return {
            "game_dir": game_dir,
            "name": game_manifest["name"],
            "states": states,
            "transitions": transitions,
            "state_interactive": state_interactive,
            "max_interactive": max_interactive,
            "obs_width": obs_width,
            "obs_height": obs_height,
            "viewport": viewport,
            "max_steps": max_steps,
            "tasks": tasks,
        }

    @staticmethod
    def _states_match(a: dict, b: dict) -> bool:
        """Check if two state dicts are equivalent."""
        return json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)

    @staticmethod
    def _state_subset_match(subset: dict, full: dict) -> bool:
        """Check if all keys in subset match their values in full."""
        for key, value in subset.items():
            if key not in full:
                return False
            if json.dumps(value, sort_keys=True) != json.dumps(full[key], sort_keys=True):
                return False
        return True

    def _load_screenshots(self, game: dict):
        """Load screenshots for a game, generating synthetic ones for missing files."""
        screenshot_dir = os.path.join(game["game_dir"], "screenshots")
        for state_id, state_data in game["states"].items():
            screenshot_rel = state_data.get("screenshot", "")
            screenshot_path = os.path.join(
                game["game_dir"], screenshot_rel
            ) if screenshot_rel else ""

            cache_key = (game["name"], state_id)
            if screenshot_path and os.path.exists(screenshot_path):
                from PIL import Image
                img = Image.open(screenshot_path).convert("RGB")
                img = img.resize((self.obs_width, self.obs_height))
                self._screenshots[cache_key] = np.array(img, dtype=np.uint8)
            else:
                self._screenshots[cache_key] = self._generate_synthetic(
                    state_id, state_data, game["viewport"]
                )

    def _generate_synthetic(
        self, state_id: str, state_data: dict, viewport: dict
    ) -> np.ndarray:
        """Generate a synthetic colored screenshot for a state."""
        seed_val = hash(state_id) & 0xFFFFFFFF
        rng = np.random.default_rng(seed=seed_val)

        bg_color = rng.integers(30, 180, size=3, dtype=np.uint8)
        img = np.full(
            (self.obs_height, self.obs_width, 3), bg_color, dtype=np.uint8
        )

        vp_w = viewport.get("width", 1280)
        vp_h = viewport.get("height", 900)

        for ann in state_data.get("annotations", []):
            bbox = ann.get("bbox", {})
            x = int(bbox.get("x", 0) * self.obs_width / vp_w)
            y = int(bbox.get("y", 0) * self.obs_height / vp_h)
            w = int(bbox.get("width", 10) * self.obs_width / vp_w)
            h = int(bbox.get("height", 10) * self.obs_height / vp_h)
            x = max(0, min(x, self.obs_width - 1))
            y = max(0, min(y, self.obs_height - 1))
            w = max(1, min(w, self.obs_width - x))
            h = max(1, min(h, self.obs_height - y))

            if ann.get("interactive", False):
                ann_color = np.clip(
                    bg_color.astype(np.int16) + 80, 0, 255
                ).astype(np.uint8)
            else:
                ann_color = np.clip(
                    bg_color.astype(np.int16) + 40, 0, 255
                ).astype(np.uint8)
            img[y : y + h, x : x + w] = ann_color

        return img

    def _get_obs(self) -> np.ndarray:
        cache_key = (self._current_game["name"], self._current_state)
        return self._screenshots[cache_key].copy()

    def _compute_goal_distances(self, game: dict, goal: dict) -> dict:
        """BFS from every goal-satisfying state backward to compute distances.

        Returns dict mapping state_key -> shortest distance to any goal state.
        """
        # Find all goal states
        goal_states = set()
        for sid, sdata in game["states"].items():
            if _evaluate_predicate(sdata["state"], goal):
                goal_states.add(sid)

        if not goal_states:
            return {}

        # Build reverse adjacency: target -> list of (source, annotation_id)
        reverse_adj = {}
        for src, ann_map in game["transitions"].items():
            for ann_id, tdata in ann_map.items():
                target = tdata["nextState"]
                if target not in reverse_adj:
                    reverse_adj[target] = []
                reverse_adj[target].append(src)

        # BFS backward from goal states
        distances = {}
        queue = deque()
        for gs in goal_states:
            distances[gs] = 0
            queue.append(gs)

        while queue:
            current = queue.popleft()
            for predecessor in reverse_adj.get(current, []):
                if predecessor not in distances:
                    distances[predecessor] = distances[current] + 1
                    queue.append(predecessor)

        return distances

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        if seed is not None:
            self._rng = np.random.default_rng(seed)

        # Pick a random task (optionally filtered by task_id)
        task_id = (options or {}).get("task_id")
        if task_id is not None:
            matching = [
                (g, t) for g, t in self._all_tasks if t["id"] == task_id
            ]
            if not matching:
                raise ValueError(f"Task '{task_id}' not found")
            game, task = matching[self._rng.integers(len(matching))]
        else:
            game, task = self._all_tasks[
                self._rng.integers(len(self._all_tasks))
            ]

        self._current_game = game
        self._current_task = task
        self._current_state = task["start_state"]
        self._step_count = 0

        # Pre-compute distances for dense shaping
        if task["reward_shaping"] == "distance":
            self._goal_distances = self._compute_goal_distances(
                game, task["goal"]
            )
            self._prev_distance = self._goal_distances.get(
                self._current_state
            )
        else:
            self._goal_distances = None
            self._prev_distance = None

        obs = self._get_obs()
        state_data = game["states"][self._current_state]
        interactive = game["state_interactive"][self._current_state]
        info = {
            "state_key": self._current_state,
            "pathname": state_data["pathname"],
            "state": state_data["state"],
            "task_id": task["id"],
            "step_count": 0,
            "interactive_annotations": [
                a for a in state_data["annotations"]
                if a.get("interactive", False)
            ],
            "goal_met": False,
        }
        return obs, info

    def step(self, action):
        action = int(action)
        self._step_count += 1
        game = self._current_game
        interactive = game["state_interactive"][self._current_state]

        # Determine next state
        is_noop = True
        if action < len(interactive):
            annotation_id = interactive[action]
            state_transitions = game["transitions"].get(self._current_state, {})
            transition = state_transitions.get(annotation_id)
            if transition is not None:
                self._current_state = transition["nextState"]
                is_noop = False

        # Check goal
        state_data = game["states"][self._current_state]
        goal_met = _evaluate_predicate(state_data["state"], self._current_task["goal"])

        # Reward
        reward = -0.01  # step penalty

        if goal_met:
            reward += 1.0

        # Dense shaping
        if self._goal_distances is not None:
            curr_distance = self._goal_distances.get(self._current_state)
            if self._prev_distance is not None and curr_distance is not None:
                shaping = (self._prev_distance - curr_distance) * 0.1
                reward += shaping
            self._prev_distance = curr_distance

        # Termination
        terminated = goal_met
        truncated = self._step_count >= self.max_steps

        obs = self._get_obs()
        info = {
            "state_key": self._current_state,
            "pathname": state_data["pathname"],
            "state": state_data["state"],
            "task_id": self._current_task["id"],
            "step_count": self._step_count,
            "interactive_annotations": [
                a for a in state_data["annotations"]
                if a.get("interactive", False)
            ],
            "goal_met": goal_met,
        }

        return obs, reward, terminated, truncated, info

    def render(self):
        if self._current_state is not None:
            return self._get_obs()
        return np.zeros(
            (self.obs_height, self.obs_width, 3), dtype=np.uint8
        )

    def close(self):
        pass
