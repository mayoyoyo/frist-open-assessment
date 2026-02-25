# CUA Eval Harness

Evaluates a computer use agent against the JetBlue v3 booking clone.

The agent is **vision-only** — it receives screenshots and outputs actions.
Goal checking is done by the runner via `window.__state__()`, which is invisible to the agent.

## Setup

```bash
pip install -r requirements.txt
playwright install chromium
cd ../jetblue-v3 && bun install
```

## Configuration

Set three environment variables before running:

```bash
export OPENAI_API_KEY="your-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"   # or any compatible endpoint
export MODEL="your-model-name"
```

## Run

```bash
# All tasks
python run.py

# Specific tasks
python run.py search-to-results select-flight-to-cart

# Headless (no browser window)
python run.py --headless
```

## Tasks

| ID | Instruction | Difficulty | Goal |
|----|-------------|------------|------|
| `search-to-results` | Search for a flight and reach the results page | easy | `step == "results"` |
| `select-flight-to-cart` | Select a flight and fare to reach checkout | medium | `step == "cart"` |
| `cart-to-traveler` | Proceed through checkout to traveler info | medium | `step == "traveler"` |
| `traveler-to-seats` | Fill in traveler form and proceed to seat selection | hard | `step == "seats"` |

## Output

Results are saved to `results/run_<timestamp>.json`.
Screenshots of each step are saved to `results/screenshots/<task_id>/`.

## How it works

```
agent.reset()
obs = env.reset(task)          # sets start state via window.__setState__()

for step in range(max_steps):
    response, actions = agent.predict(instruction, obs)   # vision only
    obs, _, done, _ = env.step(action)                    # executes via Playwright
    if env.evaluate() >= 1.0: break                       # checks window.__state__()

score = env.evaluate()         # 1.0 = success, 0.0 = failure
```

The separation is intentional:
- **`agent.py`**: calls your model API with screenshots, parses actions
- **`env.py`**: drives the browser, checks goal state
- **`run.py`**: the loop that connects them and writes results
