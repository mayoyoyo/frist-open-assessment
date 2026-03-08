# Arc Synthesis: Five CUA Papers and This Repo

## 1. The Cumulative Arc

The five papers tell a single story about building computer-use agents, and each paper removes one layer of naivete about what it takes.

**Scaling-CUA-Grounding (JEDI)** establishes the foundation: GUI grounding -- the ability to map natural language to specific pixel coordinates -- is the critical bottleneck. Not reasoning. Not planning. Grounding. They prove this by pairing a small grounder (3B-7B) with a large planner (o3) and watching the system outperform monolithic models 10-70x its size. Their 4M-example synthetic dataset, built by decomposing UIs into icons/components/layouts and rendering them programmatically, shows no saturation in scaling curves. The claim is bold: synthesize enough grounding data and performance follows.

**AutoWebWorld** picks up the question JEDI ignores -- where do training *environments* come from? -- and proposes modeling websites as finite state machines. The FSM specification makes BFS traversal produce *verified* trajectories (correct by construction), eliminating the need for expensive external verifiers. The paper validates the core architectural pattern this repo implements: hash state as (page_id, signature), BFS-expand actions, record transitions, filter with Playwright. It also shows that training on synthetic website trajectories transfers to real websites (27.42% on WebVoyager), confirming the sim-to-real bridge is crossable. But AutoWebWorld relies on JEDI's unstated assumption: that synthetic environments, no matter how simplified, produce transferable signal. Its own environments are Vue apps generated from theme names, visually simpler than anything on the real web.

**InfiniteWeb** extends AutoWebWorld's environment synthesis but shifts the focus to reward design. Its headline contribution is not the environment generator -- it is the dense checkpoint-based reward system that makes 4.4x more tasks produce learning signal for GRPO compared to binary success/failure. This directly challenges AutoWebWorld's implicit assumption that trajectory-level correctness is sufficient for training. InfiniteWeb shows that *within* a single failing trajectory, partial credit for intermediate checkpoints creates meaningful gradients. The scaling curve (+6.9% on OSWorld with only 600 tasks, no saturation) validates a startling efficiency: you need fewer environments than you think, but you need much richer reward signals from each one. InfiniteWeb also quietly establishes that environment diversity (via Common Crawl screenshots as style references) matters for generalization -- though it never ablates visual realism against training effectiveness.

**OpenCUA** then demolishes the assumption that data volume is the primary lever. Training on raw state-action demonstrations produces 4.4% success. The *same data* wrapped in reflective chain-of-thought reasoning reaches 45.0% -- a 10x improvement from annotation format alone. OpenCUA is pure SFT, no RL, and yet it outperforms RL-trained systems. Its central revelation: data *without reasoning traces* does not scale (the flat blue line in Figure 1 left). Data *with reasoning traces* scales cleanly. This reframes every prior paper: JEDI's grounding data works because it is inherently formatted as instruction-action pairs (a form of reasoning). AutoWebWorld and InfiniteWeb's trajectory data is only useful if paired with CoT synthesis. The bottleneck is not data volume or environment count -- it is the quality of reasoning annotations per step.

**GroundCUA** completes the arc by directly challenging JEDI's scaling thesis. 700K human-annotated samples beat JEDI's 9M synthetic samples on every benchmark at every model size, including a controlled 100K head-to-head. The key differentiator: annotation density. GroundCUA's human annotators label 64 elements per screenshot; JEDI's synthetic pipeline generates 7. GroundCUA's screens are dense, overlapping, realistic desktop environments; JEDI's are simplified renders with sparse elements. GroundCUA also shows an inversion in RL gains: models trained on high-quality SFT data benefit *least* from subsequent RL (+1.7 points), while models on weak data benefit most (+5.1 points). The implication is sharp: high-quality SFT captures most learnable signal, leaving little for RL to correct. This does not invalidate RL -- OpenCUA's Pass@3 gap (45% to 53%) shows RL headroom remains -- but it means SFT quality determines the starting point RL optimizes from.

---

## 2. Code Mapping Table

| Paper Concept | Repo File / Function | Status | Notes |
|---|---|---|---|
| **FSM state = (page_id, signature)** | `crawler.js:hashState()` (line 48) | **Implemented** | Hashes pathname + JSON state. Directly mirrors AutoWebWorld's `key(s) = (p, hash(sigma))` |
| **BFS traversal of state graph** | `crawler.js` main loop (lines 276-355) | **Implemented** | Parallel BFS with work queue and deduplication. Matches AutoWebWorld's BFS expansion |
| **State coloring/deduplication** | `crawler.js:states` map (line 239) + null placeholder (line 309) | **Implemented** | Immediately colors discovered states to prevent re-capture |
| **Interactive annotation enumeration** | `crawler.js:captureState()` (lines 102-113) via `window.__annotations__()` | **Implemented** | Annotations declared in `main.tsx` (lines 186-227) with `data-ann` selectors |
| **Action execution (click/type/select/scroll)** | `crawler.js:performAction()` (lines 115-148) | **Implemented** | 4 action types. Smaller than AutoWebWorld's 9-type action space and OpenCUA's 10-type space |
| **State restoration for BFS** | `crawler.js:restoreState()` (lines 150-154) via `window.__setState__()` | **Implemented** | Navigate + inject state. Equivalent to AutoWebWorld's deterministic state reset |
| **Gymnasium RL environment** | `env.py:WebNavEnv` (line 79) | **Implemented** | Reads state_graph.json, provides obs/reward/done. Pure graph lookup -- no browser needed |
| **Binary task completion reward** | `env.py:step()` (line 456): `+1.0` on goal, `-0.01` per step | **Implemented** | This is InfiniteWeb's "sparse reward" -- papers show it wastes ~75% of training signal |
| **Distance-based reward shaping** | `env.py:_compute_goal_distances()` (lines 341-378) | **Implemented** | BFS-backward from goal states, reward += `(prev_dist - curr_dist) * 0.1`. Better than binary but not dense checkpoints |
| **Goal predicate evaluation** | `env.py:_evaluate_predicate()` (lines 25-37), `eval/env.py:_check_goal()` (lines 20-41) | **Implemented** | Supports equals/not_equals/contains/gte/lte/gt/lt. Matches AutoWebWorld's `G(s)` goal predicates |
| **Discrete action space (annotation index)** | `env.py:Discrete(max_annotations)` (line 148) | **Implemented** | Agent selects annotation index, not pixel coordinates. This is the *opposite* of what all 5 papers train -- they train coordinate-level grounding |
| **Vision-based CUA agent** | `eval/agent.py:CUAAgent` (line 91) | **Implemented** | Screenshot-only, OpenAI function-calling API, `computer_use` tool with pixel coordinates. Matches JEDI/GroundCUA planner+grounder pattern |
| **Live browser eval environment** | `eval/env.py:JetBlueEnv` (line 44) | **Implemented** | Playwright-controlled clone, `window.__state__()` for goal checking. OSWorld-style evaluation |
| **Task definitions with start state + goal** | `eval/tasks.json` (4 tasks) | **Implemented** | search->results, results->cart, cart->traveler, traveler->seats. Linear booking flow |
| **Sliding-window visual history** | `eval/agent.py:_build_messages()` (lines 171-218) | **Implemented** | 4-screenshot window, text-only summaries outside window. Matches OpenCUA's "3 screenshots" finding |
| **Clone website with state APIs** | `jetblue-v3/src/main.tsx` (lines 240-256) | **Implemented** | `__state__()`, `__setState__()`, `__annotations__()`, `__reset__()`, `__meta__()` |
| **Dense checkpoint rewards** | -- | **Missing** | InfiniteWeb's 4.4x multiplier. Repo has BFS-distance shaping but no per-task weighted checkpoints |
| **Chain-of-thought synthesis** | -- | **Missing** | OpenCUA's 10x improvement. No reasoning traces on trajectories |
| **Grounder-planner decomposition for training** | -- | **Missing** | eval/agent.py uses it for *evaluation* (VLM -> pixel actions) but env.py trains on *annotation indices* -- incompatible |
| **Grounding training data generation** | -- | **Missing** | JEDI/GroundCUA: screenshot + instruction -> bbox. The clone has annotations with bboxes but no instruction generation pipeline |
| **Reflective CoT (error detection + recovery)** | -- | **Missing** | OpenCUA's reflector pattern. No mechanism for step-level correctness assessment |
| **GRPO training loop** | -- | **Missing** | AutoWebWorld and InfiniteWeb both use GRPO. No training loop exists in the repo |
| **CoT-level data mixing (L1/L2/L3)** | -- | **Missing** | OpenCUA's mixed-level training. Not applicable without CoT synthesis |
| **Visual diversity / style variation** | -- | **Missing** | InfiniteWeb uses Common Crawl screenshots. Repo has a single clone (JetBlue) |
| **Refusal/infeasible action training** | -- | **Missing** | JEDI's 2.6M refusal examples. No mechanism for training on impossible tasks |
| **Instrumentation variables** | -- | **Missing** | InfiniteWeb injects tracking flags into business logic for anti-shortcut evaluation |
| **Cross-domain training data** | -- | **Missing** | OpenCUA shows cross-OS data helps. Repo has one domain (airline booking) |
| **Precondition-gated BFS** | -- | **Partially missing** | AutoWebWorld checks preconditions before expanding. Crawler tries all interactive annotations regardless |

---

## 3. The Collective Argument

These five papers, read together, argue for a specific recipe for building a CUA that works:

**Step 1: Build environments that expose their state.** The agent trains against a known state graph, not a live browser. This makes training microseconds-per-step instead of seconds-per-step, enables programmatic verification (no LLM judge needed), and allows BFS-complete exploration of the action space. AutoWebWorld and this repo's crawler both implement this. The environment must expose five APIs: current state, state restoration, available actions, action execution, and goal checking.

**Step 2: Generate dense reward signals, not binary ones.** InfiniteWeb proves that binary success/failure wastes ~75% of potential training signal. Dense checkpoint rewards -- weighted partial credit for intermediate progress -- make 4.4x more tasks produce meaningful GRPO gradients. The repo's BFS-distance shaping is a step in this direction but is topological (how many graph edges to the goal) rather than semantic (which subtask milestones has the agent reached).

**Step 3: Annotate trajectories with reasoning, not just actions.** OpenCUA's central result: state-action pairs alone don't scale (4.4% success, flat with more data). Reflective chain-of-thought that explains *why* each action was taken and *what changed* after it unlocks scaling (18.5% at same data volume, 45% at full scale). Every trajectory from the state graph needs CoT synthesis before it becomes useful training data.

**Step 4: Train grounding separately from planning.** JEDI and GroundCUA independently prove that a small specialized grounder (3B) paired with a large planner (o3) beats monolithic models many times their combined size. The grounder maps "click the blue search button" to pixel coordinates (470, 312). The planner decides what to do next. They are different skills requiring different training data.

**Step 5: Prioritize annotation quality over volume.** GroundCUA's 700K human-annotated samples beat JEDI's 9M synthetic samples. The differentiator is density (64 elements per screenshot vs 7) and realism (real desktop screenshots vs simplified renders). For this repo, the implication is: the clone's DOM already contains dense element-level data (bounding boxes, labels, hierarchy). Extracting high-quality grounding pairs from this rich source is higher-leverage than generating more synthetic screenshots.

**Step 6: SFT first, RL second.** OpenCUA achieves 45% with pure SFT. RL (GRPO) improves upon SFT -- InfiniteWeb shows +6.9%, AutoWebWorld shows scaling from 5.6% to 27.4% -- but only when the SFT foundation is strong. GroundCUA confirms: models with strong SFT benefit least from RL because SFT already captured most learnable signal. The practical order is: CoT-augmented SFT to establish capability, then GRPO with dense rewards to push beyond.

---

## 4. Tensions and Contradictions

### Synthetic vs. Human Data

JEDI argues synthetic data scales grounding (4M examples, no saturation). GroundCUA argues human data wins at every sample count (700K beats 9M). Both are right, but about different things. JEDI's synthetic data works for *breadth* -- covering many UI patterns, icon styles, layout types. GroundCUA's human data wins on *depth* -- capturing the dense, overlapping, fine-grained elements that make real UIs hard. The resolution: synthetic data for environment diversity (many website types), human-quality data for grounding density (many elements per screenshot). This repo's clone, with its full DOM tree and `data-ann` annotations, sits closer to GroundCUA's quality but JEDI's scale potential -- every element's bounding box is already captured programmatically, at human-like density.

### SFT vs. RL

OpenCUA achieves 45% with pure SFT and explicitly defers RL. AutoWebWorld and InfiniteWeb use GRPO and show scaling improvements. The tension is temporal: SFT is the foundation, RL is the refinement. But GroundCUA's RL-gain-inversion finding (weaker SFT data benefits more from RL) suggests the relationship is subtler: RL primarily fixes what SFT got wrong, so better SFT means less RL headroom. The unresolved question: at what SFT quality level does RL become essential rather than incremental?

### FSM Determinism vs. Real-World Stochasticity

AutoWebWorld assumes deterministic transitions -- given state and action, the next state is uniquely determined. This repo's crawler makes the same assumption. Real websites are non-deterministic: A/B tests, session-dependent content, network timing, lazy loading. InfiniteWeb sidesteps this by also generating from scratch. None of the papers addresses how to train agents robust to environmental non-determinism. GroundCUA partially addresses this through real-application diversity but doesn't formalize it.

### Monolithic vs. Modular Architecture

JEDI and GroundCUA prove the grounder+planner split wins. OpenCUA trains a monolithic model (72B) that handles both planning and grounding. At 72B scale, the monolithic approach achieves 45% on OSWorld. At 3B scale with o3, the modular approach achieves 50.6%. The modular architecture is more practical (cheaper inference, composable upgrades) but the papers don't compare them at equal training compute. It is possible that a 72B monolithic model trained with OpenCUA's CoT recipe *and* GroundCUA's grounding data would exceed both.

### Environment Complexity vs. Training Efficiency

AutoWebWorld generates simple Vue apps. InfiniteWeb generates richer HTML/CSS/JS with localStorage. This repo uses a high-fidelity React clone of a real website. The papers show transfer improves with environment diversity but never ablate visual fidelity. InfiniteWeb's 85.6% on WebGen-Bench is measured against code quality, not visual realism. The unanswered question for this repo: does the clone's high fidelity actually help training, or would a simpler functional replica transfer equally well?

---

## 5. Gaps That Matter for This Repo (Ordered by Leverage)

### 1. No Dense Checkpoint Rewards (Highest Leverage)

The repo uses BFS-distance shaping (`env.py` lines 460-465: `(prev_dist - curr_dist) * 0.1`). InfiniteWeb shows dense checkpoint rewards make 4.4x more tasks produce GRPO learning signal. The four tasks in `eval/tasks.json` all use binary goal predicates (`step == "results"`, `step == "cart"`, etc.). For the traveler-to-seats task (hardest, 20 max steps), a binary reward means the agent either fills the entire form correctly or gets nothing. A checkpoint-based reward would give partial credit: `0.25` for entering first name, `0.5` for completing the name section, `0.75` for filling all required fields, `1.0` for reaching seats. This is implementable today: the `BookingState` in `main.tsx` already tracks each form field. The evaluator in `eval/env.py:evaluate()` currently returns `1.0 or 0.0`. Extending it to return weighted partial scores against intermediate state predicates is a direct application of InfiniteWeb's approach.

### 2. Training/Eval Action Space Mismatch (High Leverage)

The training environment (`env.py`) uses `Discrete(max_annotations)` -- the agent selects an annotation index (0, 1, 2...). The eval agent (`eval/agent.py`) outputs pixel coordinates via `computer_use` tool calls. These are fundamentally different action spaces. An agent trained on annotation indices cannot be evaluated on pixel coordinates, and vice versa. Every paper in the arc trains on pixel coordinates (JEDI: `[x, y]` point prediction; AutoWebWorld: bounding box center; OpenCUA: normalized `pyautogui.click(x, y)`). The annotation-index action space is an environment-specific shortcut that does not produce transferable grounding skill. Bridging this gap requires either: (a) changing `env.py` to accept pixel coordinates and map them to annotations via bounding-box containment, or (b) training a separate grounder model on the annotation bounding boxes as JEDI/GroundCUA-style grounding data.

### 3. No Chain-of-Thought Synthesis (High Leverage)

OpenCUA shows CoT is the difference between 4.4% and 45%. The crawler produces raw state-action trajectories with no reasoning annotations. Before these trajectories become useful SFT data, each step needs CoT synthesis: what is the agent seeing, what did the previous action change, what should it do next and why. The repo has all the ingredients: screenshots per state (captured by crawler), action descriptions (annotation labels), and before/after state diffs (computable from `state_graph.json` transitions). A CoT synthesis pipeline using Claude or GPT-4o to generate L2-level reasoning ("I need to click the 'Search' button to submit the flight search form. The origin is already set to SEA and the destination to JFK.") per transition is the missing step.

### 4. No GRPO Training Loop (Medium Leverage)

No training loop exists. AutoWebWorld and InfiniteWeb both use GRPO (Group Relative Policy Optimization) with Qwen2.5-VL as backbone. The recipe: sample a group of trajectories per task, compute advantages relative to the group mean, update policy. Key hyperparameters from InfiniteWeb: learning rate 1e-6, batch size 16, PPO epochs 1, clip ratio 0.2-0.3, 8 trajectories per task, temperature 1.0. The composite reward from AutoWebWorld: action-type accuracy + coordinate grounding (bbox check) + format compliance. Without this loop, the environment and state graph serve only as an evaluation tool, not a training tool.

### 5. Single Domain, Single Clone (Medium Leverage)

The repo has one website clone (JetBlue booking). OpenCUA shows cross-domain training data provides positive transfer. InfiniteWeb shows environment diversity matters for generalization. GroundCUA trains on 87 applications. Even at the modest scale of 5-10 cloned websites across different domains (e-commerce, social media, productivity), the papers predict meaningful generalization improvements. However, this is a scaling investment -- the architectural gaps above are higher leverage for a single-clone setup.

### 6. No Grounding Data Generation Pipeline (Medium Leverage)

The clone has 40 annotations with `data-ann` selectors, each with `id`, `label`, `category`, and computed bounding boxes. This is the raw material for JEDI/GroundCUA-style grounding data: screenshot + natural language instruction -> predicted point. What is missing is the instruction generation pipeline: taking each annotation's label, category, and visual context, and using a VLM to generate diverse natural language instructions ("Click the blue search button", "Find the departure date field", "Select the Basic fare option"). GroundCUA's recipe: 50% direct instructions (reference element text), 35% functional instructions (reference intended action), 15% spatial instructions (reference relative position).

### 7. No Reflector/Error Recovery Training (Lower Leverage)

OpenCUA's reflector compares before/after screenshots per action and labels steps as correct, incorrect, or redundant. Incorrect steps get reflection reasoning that teaches the model to detect and recover from mistakes. The repo has no equivalent. For the JetBlue booking flow, error recovery matters: the agent might click the wrong fare, select a wrong departure city, or type in the wrong form field. Training on error-and-recovery sequences requires: (a) generating intentionally suboptimal trajectories, (b) identifying the error point via state comparison, (c) synthesizing reflective reasoning about what went wrong and how to fix it.

### 8. No Precondition Gating on BFS (Lower Leverage)

AutoWebWorld only expands actions whose preconditions are satisfied (e.g., "Add to cart" requires product selected). The repo's crawler tries every interactive annotation on every state, leading to wasted BFS expansions and self-loop transitions. Adding preconditions (perhaps derived from annotation categories -- `FARE_SELECT` only meaningful on results page, `FORM_INPUT` only on traveler page) would prune the search space and produce a cleaner state graph. However, the current 40-annotation, ~7-step booking flow is small enough that brute-force BFS is tractable.
