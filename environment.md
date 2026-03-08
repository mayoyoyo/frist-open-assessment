# Milestone 2: Environment Setup

## What Was Done

### 1. Clone Configuration (`game.json`)
Created `game.json` at the repo root to configure the crawler and training environment:
- Points to `jetblue-v3/` clone with `bun run dev` as the dev server
- Defines 4 tasks matching `eval/tasks.json`: search→results, results→cart, cart→traveler, traveler→seats
- Task start states use minimal matching (just `step` field) so they match any state at that booking step

### 2. Annotation Updates (`jetblue-v3/src/main.tsx`)
The existing annotations lacked fields the crawler needs (`interactive`, `action`, `metadata`). Fixed by:
- Adding `action: "click"|"type"` and `metadata: { text }` for form inputs to each annotation
- Computing `interactive` dynamically from `getBoundingClientRect()` — an annotation is interactive only when its DOM element is visible with non-zero dimensions. This means the crawler only tries actions for elements actually present on the current page
- Added the missing `search_flights` annotation — the "Search flights" button had `data-ann="search_flights"` in BookingBar.tsx but wasn't in the annotations list, blocking the search→results transition entirely

### 3. Crawler Scroll Fix (`crawler.js`)
The first crawler run produced 15 states but never reached `/seats`. Root cause: the "Next: Seats & Extras" button (ann-32) sat at `y=1499` in a `900px` viewport. The crawler clicks at bbox center coordinates, which for off-screen elements miss entirely.

Fix: added scroll-into-view logic in `performAction()`. When `cy > viewport.height`, the crawler scrolls down, re-queries the bbox via `getBoundingClientRect()`, and clicks the updated position. This discovered 169 states vs the initial 15.

### 4. State Graph (`state_graph.json`)
Final crawl: **169 states, 500 transitions** (limited by `MAX_BFS_ACTIONS`).

| Step | States | Notes |
|------|--------|-------|
| search | 1 | Home page with booking form |
| results | 2 | Flight listings (expanded/collapsed) |
| cart | 2 | Shopping cart with fare selected |
| signin | 2 | Sign-in prompt (bypassed via "Continue as guest") |
| traveler | 16 | Form field combinations (name, email, etc.) |
| seats | 94 | Seat map permutations (outbound/return, seat choices) |
| extras | 52 | Add-on options after seat selection |

### 5. Baseline Evaluation

**Eval harness (live browser, random pixel clicks):**
All 4 tasks: **0% success**. Random coordinates on 1280x900 viewport almost never hit interactive elements.

**Training env (state graph, random annotation indices):**
| Task | Success Rate |
|------|-------------|
| search→results | 91% |
| results→cart | 78% |
| cart→traveler | 71% |
| traveler→seats | 93% |
| **Overall** | **83%** |

The gap between 0% (eval) and 83% (training) reflects the action-space mismatch: training selects from ~9 annotation indices, while eval clicks on ~1.15M pixel coordinates.

## Architectural Insight

The state graph makes training feasible. Each `env.step()` is a dict lookup (~microseconds). A live browser step (navigate, render, screenshot, settle) takes ~500ms. For 1M training steps: **17 minutes** on the state graph vs **6 days** in a live browser.

The trade-off: the state graph is finite. The crawler pays the exploration cost once (8 minutes), then training runs infinitely fast against the result. This is AutoWebWorld's core pattern — and the reason `env.py` and `eval/env.py` exist as separate systems.
