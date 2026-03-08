# AutoWebWorld: Synthesizing Infinite Verifiable Web Environments via Finite State Machines

**Paper:** arXiv:2602.14296v1, February 15, 2026
**Authors:** Yifan Wu et al. (HKUST-GZ, DeepWisdom, Peking University, Universite de Montreal/Mila)
**Correspondence:** Bang Liu, Chenglin Wu, Yuyu Luo

---

## 1. Core Thesis

AutoWebWorld argues that the fundamental bottleneck in training web GUI agents is the "verifier bottleneck": real websites hide their internal state, so trajectory correctness must be judged by expensive, inconsistent external verifiers (humans or LLMs). The paper proposes modeling web environments as explicit Finite State Machines (FSMs) where all states, actions, and transitions are pre-defined, enabling **programmatic verification** of trajectory correctness by checking FSM preconditions and goal-state reachability. This shifts data collection from stochastic exploration on real websites to systematic BFS traversal of a known transition graph, yielding verified trajectories at $0.04/trajectory vs. $0.15-$1.00 for real-world methods.

---

## 2. Key Quantitative Claims

### Dataset Scale
- **29 synthesized web environments** across diverse domains (Section 4.5, Table 1)
- **11,663 verified trajectories** total (Abstract, Table 1)
- **Average trajectory length: 21.94 steps** -- significantly longer than prior work (6.9-12.1 range) (Table 1)
- **1,215 distinct trajectories** after deduplication (one per parallel trajectory set), containing **12,585 interaction steps** (Section 5.1)
- Final training set: **~16K total training steps** (trajectory + grounding examples) for GRPO (Section 5.1)

### Cost
- **$0.04 per trajectory** vs. Explorer $0.15, AgentTrek $0.55, Fara $1.00, Mind2Web $0.80 (Table 1)
- **Total pipeline cost: $447.37** for all 29 environments (Table 7)
  - FSM Generation (GPT-5.1): $57.10
  - Web Generation (Gemini3-Pro): $52.26
  - Query Generation (DeepSeek-V3.2): $65.84
  - **Thinking Generation (Gemini2.5-Flash): $272.17** -- dominant cost (Table 2)

### Benchmark Performance
- **WebVoyager (15-step limit):** Ours-7B achieves **27.42%** overall, beating UI-TARS-1.5-7B (26.51%) and drastically improving over base Qwen2.5-VL-7B (5.62%) (Table 3)
- **Ours-3B: 15.09%**, surpassing several 7B+ baselines (UI-Venus-7B at 9.73%, TongUI-7B at 9.83%) despite training on only 16K steps vs. UI-Venus's ~1M SFT samples and TongUI's ~350K RL samples (Section 5.2.1)
- **ScreenSpot-V2:** Ours-7B improves from 84.83 to 86.16 (+1.33); Ours-3B from 61.87 to 65.88 (+4.01) (Table 4)
- **ScreenSpot-Pro:** Ours-7B improves from 23.2 to 27.5 (+4.3); Ours-3B from 13.3 to 18.0 (+4.7) (Table 5)

### Scaling Law
- Training sample sizes: 8, 256, 1,024, 16,253 samples (Section 5.3)
- WebVoyager success rate: 3.92% -> 17.59% -> 19.09% -> 27.42% (monotonic) (Figure 4)
- Online-Mind2Web: 1.22% -> 7.32% -> 7.93% -> 14.02% (monotonic) (Figure 4)
- Polynomial fitting shows consistent predicted improvement in higher-sample regime

### AutoWebWorld as Benchmark
- Claude-4-Sonnet: 16.00% on AWW vs. 26.11% on WebVoyager (Table 6)
- UI-TARS-1.5-7B: 20.00% on AWW vs. 26.51% on WebVoyager (Table 6)
- Synthesized environments are **not trivially easier** than real-world benchmarks

---

## 3. Methodology

### Overall Pipeline (Figure 2, 4 Steps)

**Step 1: FSM Generation**
- Input: Web theme name (e.g., "GitHub", "Gmail") + reference website name
- Multi-agent framework: FSM Proposer -> FSM Validator -> FSM Improver (loop until valid)
- All agents are **GPT-5.1**
- Output: `fsm.json` with meta, pages, actions, nav_skeleton
- Validator checks: terminal reachability, precondition validity, deterministic effects, pagination reset rules (Appendix A.1.6)

**Step 2: Web Environment Generation**
- Input: Final FSM + reference website name (style anchor)
- Coding agent: **Gemini3-Pro**
- 4-stage pipeline:
  1. **Guidelines generation**: style spec, task checklist, FSM runtime module, mock data file
  2. **Web pages synthesis**: Vue components in batches, generate-review-revise loop
  3. **Web building**: Build and run check
  4. **Self-repair**: Build-log-driven fix loop until compilation succeeds
- Output: Runnable Vue front-end project

**Step 3: Automatic Trajectory Collection (BFS)**
- BFS over FSM state graph: nodes = (page_id, signature), edges = executable actions
- Deduplication key: `(p, hash(sigma))` using canonical serialization
- Returns **shortest goal-reaching paths** as action sequences
- Each FSM action has a pre-defined `gui_procedure` (sequence of atomic UI ops)
- **Shared selector namespace**: FSM assigns unique CSS selectors; web project implements them
- Expansion: BFS action sequence -> concatenated GUI procedures -> Playwright replay
- At each step: locate element via selector, get bounding box, execute atomic operation

**Step 4: Automatic Trajectory Filtering**
- Batch replay all BFS trajectories on actual website using **Playwright**
- **Strict acceptance**: trajectory accepted only if ALL steps execute successfully
- Failure modes: missing elements, non-functional buttons, selector mismatches
- After filtering: queries generated from complete paths using **DeepSeek-V3.2**

### Training
- Model: Qwen2.5-VL-7B (and 3B variant)
- Method: **GRPO** (Group Relative Policy Optimization)
- 8x NVIDIA A800 GPUs, DeepSpeed ZeRO-3
- Effective batch size: 256, 8 rollouts per prompt
- Training mix: 2:8 ratio grounding:navigation data (fixed across scales)
- Composite reward: action-type accuracy + coordinate grounding (bbox check) + format compliance (Appendix D.4)

---

## 4. The FSM Model

### State Definition (Section 3, Appendix A.1.2)

A state is a pair: **s = (p, sigma)** where:
- `p` is a discrete page ID (e.g., "HOME", "SEARCH_RESULTS", "DETAIL")
- `sigma` is the **page signature** -- an assignment of structured variables capturing the page's controllable configuration

```
sigma = { v1^(p), v2^(p), ..., vK(p)^(p) }
```

Signature variables cover: query text, filter/sorting options, pagination index, form field values, selected items, cart contents.

**Signature requirements:**
- **Minimality**: only variables affecting task success or future reachability (no UI noise)
- **Stability**: fixed variable names, deterministic defaults, unique serialization order for reproducible hashing

### Transition Definition (Section 3, Appendix A.1.3)

Deterministic transition function: `s' = T(s, a)` where:

1. **Precondition check**: `pre(s, a) in {0, 1}` -- conjunction of boolean constraints on signature paths (e.g., `$.sort_by == "recent"`)
   - If `pre(s, a) = 0`: no-op (state unchanged)
   - Preconditions reference only signature paths (starting with `$.`), never screenshot-level element existence

2. **Effect application**: If preconditions hold, apply deterministic effects:
   - Allowed operations: assignment, counter increment/decrement, boolean toggle, enum switch, set insert/delete
   - **Local-update constraint**: action may only update fields it explicitly declares

3. **Two transition types**:
   - **Intra-page**: page ID unchanged, signature updated via effects
   - **Navigation**: page switches to target `p'`, signature initialized to defaults then merged with carry-over variables
   ```
   T(s, a) = (p, Apply(sigma, eff(s, a)))           [in-page]
   T(s, a) = (p', Init(p') + Carry(sigma'))          [cross-page]
   ```

4. **Pagination reset rule**: actions that change result sets (search/filter/sort) must reset pagination fields

### State Hashing (Appendix A.1.2, A.2.1)

- Deduplication key: `key(s) = (p, hash(sigma))`
- `hash(sigma)` computed by **canonical serialization** (fixed field order, fixed representation)
- A BFS node is expanded at most once per key
- This prevents redundant exploration of semantically identical states

### Handling Non-Determinism

The paper **explicitly assumes determinism** by construction:
- Transition function is deterministic: given (s, a), next state is uniquely determined
- Effects are restricted to enumerable, dependency-free update patterns
- No stochastic elements in the FSM specification
- Non-determinism is handled by **not modeling it** -- the FSM is a controlled synthetic environment, not a model of real websites

### Verification Process

**Two-level verification:**

1. **FSM-level (intrinsic):** BFS paths are correct by construction. Verification replays semantic transitions: for every step t, re-check preconditions hold at s_{t-1} and applying effects yields s_t. Goal satisfaction checked via `G(s_T)` (terminal page membership or signature constraint conjunction). Zero marginal human cost.

2. **Execution-level (filtering):** Replay GUI procedures on actual generated website via Playwright. Strict pass/fail -- any step failure discards entire trajectory. Catches FSM-to-frontend implementation mismatches.

### GUI Procedure (Appendix A.1.4)

Each FSM action has a `gui_procedure` field:
- Sequence of atomic GUI operations: click, hover, type_text, scroll
- Uses CSS selectors for element targeting
- Normalized coordinate system [0,1]^2 for coordinate-level supervision
- Semantic correctness defined by preconditions/effects, NOT by GUI procedure success

### Goal Predicates (Appendix A.2.3)

Tasks expressed as goal predicates `G(s)` on semantic states:
- Simplest: reaching a terminal page: `G(s) = I[p in meta.terminal_pages]`
- General: conjunctions of signature constraints ("cart contains item X", "form field Y is filled")
- All constraints reference explicit signature paths -- no screenshot-level heuristics

---

## 5. Limitations & Weaknesses

### Acknowledged by Authors
- Total trajectory count (11,663) is smaller than largest real-world corpora (Fara: 145,603)
- Performance still below frontier closed-source models on WebVoyager (GPT-5.1: 18.96%, Claude-4-Sonnet: 26.11%, but these are also limited)
- Thinking generation is the dominant cost ($272.17 / $447.37 total)

### Unacknowledged / Implicit Weaknesses

1. **FSM expressiveness gap**: Real websites have continuous state spaces (scroll positions, dynamic content loading, animation states, async operations). The discrete signature model cannot represent:
   - Lazy-loaded infinite scroll content
   - Time-dependent state (session timeouts, rate limits, CAPTCHA triggers)
   - Server-side state that affects rendering (A/B tests, personalization)
   - Complex form validation with interdependent fields
   - Async operations (file uploads, background processes)

2. **Synthetic-to-real domain gap**: Generated Vue websites are stylistically simpler than production websites. The paper uses a "reference website name" as a style anchor but acknowledges these are synthesized, not clones. Key gaps:
   - No complex CSS layouts (grid, flexbox edge cases)
   - No third-party widget integrations
   - No responsive design challenges
   - No authentication flows with real OAuth
   - No dynamic content from APIs

3. **BFS limitations**:
   - Only finds shortest paths -- real users take suboptimal paths
   - State space explosion not thoroughly addressed (max depth cap L mentioned but not specified)
   - Combinatorial explosion with many signature variables (e.g., e-commerce with many filter combinations)

4. **Selector fragility**: The approach assumes a shared selector namespace between FSM and generated website. This works for synthesized sites but breaks for real-world sites where selectors are dynamic, minified, or framework-generated.

5. **Single-page assumption**: The FSM model treats each "page" as discrete. Multi-tab workflows, popups, iframes, and SPAs with complex routing are not modeled.

6. **Static data**: `data.js` is pre-specified and static. No database interactions, no user-generated content, no search relevance ranking.

7. **Evaluation concerns**: WebVoyager evaluation uses Gemini-3-Flash as judge -- the same type of LLM judge they criticize as inconsistent. The 15-step limit also constrains what can be evaluated.

---

## 6. Key Figures/Tables

### Figure 2 (Most Important): Four-Step Generation Process
Shows the complete AutoWebWorld pipeline:
- Step 1: Multi-agent FSM generation (Proposer -> Validator -> Improver loop)
- Step 2: Coding agent translates FSM to Vue website (4-stage pipeline with self-repair)
- Step 3: BFS traversal of FSM graph producing candidate trajectories (S_I -> S_1 -> S_2 -> ... -> S_E)
- Step 4: Playwright-based execution filtering, retaining only fully successful trajectories
- Also shows the action space (Search, Checkbox, Slider, Sort) and automatic trajectory selection

### Table 1: Dataset Comparison
Compares AutoWebWorld against Explorer, AgentTrek, Fara, Mind2Web across:
- Website/page counts, trajectory counts, env type (real vs. synthesized)
- Verifier type (external vs. inherent)
- Average steps (AWW: 21.9 vs. others: 6.9-12.1)
- Cost per trajectory (AWW: $0.04 vs. others: $0.15-$1.00)
Key insight: AWW is orders of magnitude cheaper per trajectory with longer horizons

### Figure 4: Scaling Law
Two monotonically increasing curves (WebVoyager and Online-Mind2Web) showing performance vs. log(sample size). Polynomial fits predict continued improvement. This is the paper's strongest empirical contribution -- evidence that synthetic data scales.

### Table 7: Cost Breakdown by Website (Appendix)
29 websites across 5 categories (Travelling, Commerce, Productivity, Media, Communication). Shows per-website costs for Web/FSM/Queries/Thinking generation. GitHub is most expensive ($46.08 total, 1685 trajectories). Thinking dominates cost across all sites.

---

## 7. Connection to Other Papers

### InfiniteWeb (Zhang et al., 2026, arXiv:2601.04126)
- Cited by AutoWebWorld as related work in synthetic GUI environments
- InfiniteWeb does "scalable web environment synthesis for GUI agent training" but does NOT explicitly model a fully known state-transition structure
- Key difference: AutoWebWorld's FSM-based approach provides **intrinsic verification** -- InfiniteWeb presumably relies on external verification
- AutoWebWorld positions itself as pushing further in the "transition-driven formulation" direction

### OpenCUA (Wang et al., 2025, arXiv:2508.09123)
- OpenCUA-7B is a baseline in Table 3: achieves 16.74% on WebVoyager vs. AutoWebWorld's 27.42%
- OpenCUA provides "open foundations for computer-use agents"
- AutoWebWorld's data could potentially be used to train OpenCUA-style agents
- The papers are complementary: OpenCUA provides agent architecture, AutoWebWorld provides training data pipeline

### Scaling-CUA-Grounding / GroundCUA
- Not directly cited in this paper
- However, AutoWebWorld's grounding supervision (Section 5.1, 5.4) is directly relevant: they extract individual steps from trajectories and rewrite queries to create grounding examples for UI element localization
- The ablation study (Figure 5) shows grounding data is critical for GRPO training: coordinate reward grows faster and plateaus higher with grounding data
- The paper's ScreenSpot-V2/Pro results (Tables 4-5) demonstrate grounding transfer

### WebFactory (Anonymous, 2025, ICLR under review)
- Cited as "WebFactory: Automated compression of foundational language intelligence into grounded web agents"
- Also couples environment generation with trajectory synthesis but "operates at limited scale" and doesn't model fully known state-transition structure

---

## 8. Connection to Practical CUA Building

This section addresses the reader who builds a capture -> clone -> crawl -> train pipeline using BFS crawling of React website clones to generate state graphs for RL agent training.

### Direct Architectural Parallels

**Your pipeline vs. AutoWebWorld:**

| Your Pipeline | AutoWebWorld | Key Difference |
|---|---|---|
| Capture real websites (rrweb) | Generate from theme name | You start from real; they start from spec |
| Clone via React (omni-tree) | Generate Vue components (Gemini3-Pro) | You reconstruct; they synthesize |
| BFS crawl with state graph | BFS over FSM graph | Nearly identical traversal strategy |
| PropertySpec (RCM) | fsm.json | Your spec is extracted; theirs is generated |
| Playwright for interaction | Playwright for interaction | Same tool |

### Specific Implementation Details That Matter

1. **State Definition -- (page_id, signature) pair**: AutoWebWorld's state representation is directly applicable. Your PropertySpec already captures similar information, but their explicit formalization of "signature variables" as the minimal set affecting task success is valuable. Their **minimality constraint** (only variables that affect task success or future reachability) addresses the state space explosion you face.

2. **Canonical state hashing**: They use `key(s) = (p, hash(sigma))` with canonical serialization (fixed field order, fixed representation). This is critical for BFS deduplication. If you're not already doing deterministic hashing of your state representations, this is a high-leverage improvement.

3. **Precondition-gated BFS expansion**: They only expand actions whose preconditions are satisfied. This prunes the search tree significantly. In your crawler, this maps to checking whether an action is currently valid before attempting it (e.g., "Add to cart" is only expanded after product options are selected).

4. **Shared selector namespace**: Their key bridge between FSM and website is CSS selectors assigned during FSM specification and implemented in the generated website. Your pipeline uses rrwebId-based selectors from the omni-tree. The principle is the same: a deterministic mapping from abstract actions to concrete DOM interactions.

5. **Two-level verification**: FSM-level correctness (state evolution) + execution-level filtering (Playwright replay). You should consider implementing both: (a) verify that your state graph transitions are consistent with the omni-tree structure, and (b) filter out trajectories where Playwright execution fails on the clone.

6. **gui_procedure as action decomposition**: Each high-level action decomposes into a sequence of atomic GUI operations. This is exactly what you need for your training data: high-level semantic actions paired with low-level coordinate-based operations.

7. **Pagination reset rule**: When an action changes the result set (search/filter/sort), pagination fields must reset. This is a subtle but important correctness constraint for BFS -- without it, you get semantically invalid states.

8. **Navigation vs. intra-page transitions**: Their explicit distinction with carry-over variable semantics (`Init(p') + Carry(sigma')`) is useful. When navigating to a new page, some state persists (e.g., cart contents) while page-specific state resets to defaults.

9. **BFS depth cap and per-page/per-goal caps**: They impose practical constraints to keep enumeration bounded. You likely need similar caps given the combinatorial explosion in real website state spaces.

10. **Query generation from trajectories**: After BFS produces action sequences, they use DeepSeek-V3.2 to generate natural language task descriptions. This is how they create the "instruction" part of instruction-following training data.

### What You Can Directly Adopt

- **The fsm.json schema** (Appendix A.3) as a specification format for your extracted PropertySpecs
- **The BFS expansion algorithm** with signature-based deduplication (Appendix A.2)
- **The two-level verification pattern**: graph-level + execution-level
- **The trajectory -> training data pipeline**: dedup parallel trajectories, extract grounding examples, mix at 2:8 ratio
- **GRPO training with coordinate reward**: their reward function (action type match + bbox containment + format) is directly usable

### What Doesn't Apply

- Their FSM is generated from a theme name; yours is extracted from real websites. This means your FSMs are more complex and may not satisfy their strict determinism requirements.
- Their Vue websites are simpler than your React clones of real sites. Their assumption that selectors are stable and reliable may not hold for your clones.
- Their static `data.js` approach doesn't model the dynamic data your clones contain.

---

## 9. What's Missing / Unanswered Questions

1. **State space explosion**: How do they handle websites with many combinatorial signature variables? The paper mentions depth caps but doesn't quantify the actual state space sizes for their 29 environments. How many BFS nodes are expanded per environment?

2. **FSM generation failure rate**: How often does the Proposer-Validator-Improver loop fail to produce a valid FSM? What's the average number of revision iterations?

3. **Web generation failure rate**: How often does the self-repair loop fail? What fraction of generated websites are ultimately unusable?

4. **Trajectory filtering rate**: What fraction of BFS-generated trajectories are filtered out during Playwright execution? This would quantify the FSM-to-frontend alignment quality.

5. **Diversity of synthesized websites**: The paper shows 29 sites across 5 categories, but how visually diverse are they? Are they all Bootstrap-style templates? How do they compare to real website complexity in CSS/layout?

6. **Multi-step reasoning**: With 21.9 average steps, how complex are the actual tasks? Are they truly compositional multi-step tasks or repeated simple operations (e.g., scrolling + clicking)?

7. **Negative transfer**: Is there any evidence of negative transfer from synthetic data? Does training on oversimplified websites hurt performance on complex real sites?

8. **State coverage**: Does BFS achieve adequate coverage of the FSM state space? What fraction of reachable states are actually visited?

9. **Generalization to unseen websites**: The WebVoyager evaluation tests on 9 websites. How does performance generalize to website categories NOT represented in the 29 synthesized environments?

10. **Real website FSM extraction**: Could their framework be applied to extract FSMs from real websites (rather than generating them)? This would directly bridge their approach to the capture->clone pipeline.

11. **Action space limitations**: Their unified action space (Table 8) covers click, hover, drag, type_text, press_enter, scroll, hotkey, wait, answer. Missing: file upload, drag-and-drop to specific targets, right-click context menus, touch gestures.

12. **Reproducibility of LLM-generated components**: FSMs generated by GPT-5.1 and websites by Gemini3-Pro are inherently non-deterministic across runs. How consistent are the outputs? Can the same theme name produce qualitatively different environments?

13. **Long-tail distribution**: Real web interactions follow a long-tail distribution of actions. BFS produces shortest paths, which may over-represent common actions and under-represent rare but important interactions.

---

## Appendix: Website Categories (Table 7)

| Category | Websites | Total Trajectories |
|---|---|---|
| Travelling | Skyscanner | 1,300 |
| Commerce | Aliexpress, JD, Revolut, Shopee, Shopify, Walmart | 2,493 |
| Productivity | Airtable, Asana, Bitbucket, FreshDesk, Github, Onenote, Optimizely | 3,244 |
| Media | Coursera, Headspace, Health, Spotify, Youtube | 2,850 |
| Communication | Facebook, Medium, Microsoft Team, Outlook, Quora, Signal, Slack, Zoom | 1,751 |
| **Total** | **29** | **11,663** |

Most trajectories come from Github (1,685), Skyscanner (1,300), Headspace (1,217), and Slack (900).
