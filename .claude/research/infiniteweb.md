# InfiniteWeb: Scalable Web Environment Synthesis for GUI Agent Training

**Paper**: arXiv:2601.04126v2, 8 Jan 2026
**Authors**: Ziyun Zhang (Peking U.), Zezhou Wang (Nanjing U.), Xiaoyi Zhang, Zongyu Guo, Jiahao Li, Bin Li, Yan Lu (Microsoft Research Asia)
**Project lead**: Xiaoyi Zhang
**Backbone**: GPT-5 with reasoning effort "high"

---

## 1. Core Thesis

InfiniteWeb is an agentic system that automatically generates functional web environments at scale for GUI agent training, addressing three intertwined challenges: **consistency** (cross-page data/interface coherence), **correctness** (bug-free task-relevant code), and **diversity** (varied visual styles and task patterns). The system also generates verifiable task evaluators that emit **dense reward signals** for reinforcement learning, enabling GRPO-based training that yields a +6.9% improvement on OSWorld (24.5% -> 31.4%) with only 600 training tasks. The central argument is that environment synthesis (not just trajectory synthesis) is the scalability bottleneck for GUI agent training, and that LLM-based code generation can solve it when combined with unified specifications, test-driven development, and Common Crawl-sourced visual diversity.

---

## 2. Key Quantitative Claims

### Website Generation Quality (Table 1, Section 4.2)
- InfiniteWeb achieves **85.6% overall** on WebGen-Bench (101 websites), vs:
  - Codex v0.46.0: 81.2%
  - Claude-Code v2.0.0: 74.3%
  - Bolt.diy v0.0.7: 67.0%
- Functional Testing subcategory: **80.9%** (vs Codex 72.8%)
- Design Validation: **82.8%** (vs Codex 76.4%)
- Statistical significance: vs Bolt.diy (t=14.81, p<0.001), vs Claude-Code (t=6.33, p<0.01), vs Codex (t=6.57, p<0.05) (Appendix C.1)

### Agent Training Results (Table 2, Section 4.4, Figure 1)
- **OSWorld** (out-of-domain, 15 max steps): UI-TARS-1.5-7B improves from **24.5% -> 31.4%** (+6.9%) with 600 InfiniteWeb tasks
  - +200 tasks: 27.3% (+2.8%)
  - +400 tasks: 29.7% (+5.2%)
  - +600 tasks: 31.4% (+6.9%)
  - Scaling curve shows no saturation (dashed lines in Figure 1 suggest further gains)
- **Online-Mind2Web** (in-domain): **+5.7%** improvement (Table 7)
  - Easy: 46.9% -> 56.8%, Medium: 18.9% -> 23.1%, Hard: 5.3% -> 9.2%
  - Overall: 23.0% -> 28.7%
- Cross-domain transfer: web training improves GIMP (+20.6 pp), VLC (+13.3 pp), Thunderbird (+11.0 pp) on OSWorld

### Environment Quality (Table 3, Section 4.5)
- InfiniteWeb environments are **2-3x harder** than OSWorld:
  - UI-TARS-1.5-7B: 7.4% on InfiniteWeb vs 24.5% on OSWorld
  - Agent S2: 14.1% on InfiniteWeb vs 27.3% on OSWorld
- Better discriminability: 6.7pp gap between Agent S2 and UI-TARS on InfiniteWeb vs 2.8pp on OSWorld
- Successful tasks require longer trajectories: 10.3-10.9 avg steps on InfiniteWeb vs 9.0-9.3 on OSWorld

### Dense vs Sparse Rewards (Figure 7, Section 4.6)
- Dense reward enables learning from **767 discriminative tasks** vs **174 with binary reward** = **4.4x increase**
- Evaluated on 4,000 tasks with 4 trajectories per task

### Visual Quality (Section 4.3, Figure 5)
- Win rate vs Codex: **69.3%**, vs Claude-Code: **85.4%**, vs Bolt.diy: **84.2%**
- Human-LLM agreement: **91%** (Appendix D)

### Ablation Studies (Figure 6, Section 4.6)
- Removing TCTDD: -5.0 points (85.6% -> 80.6%)
- Replacing GPT-5 with GPT-4.1: -8.2 points (85.6% -> 77.4%)
- Even GPT-4.1 + InfiniteWeb (77.4%) outperforms Claude-Code + GPT-5 (75.8%)

### Generation Cost (Section 4.7)
- ~0.36M input tokens + 0.34M output tokens per website
- ~$1.93 per website (GPT-5 batch pricing: $0.625/M input, $5.00/M output)
- Median generation time: ~20 minutes per website
- 8-10 tasks per website, max 12 pages per website

### TCTDD Statistics (Appendix E)
- 98.5% of websites pass all tests within 8 iterations
- Most websites require 1-3 iterations
- 95/100 tasks pass human verification for quality and evaluator correctness

---

## 3. Methodology

### Pipeline Overview (Figure 2)
Four stages, with backend and frontend executing in parallel:

1. **Unified Specification Stage** (Section 3.2)
   - Input: website seed (e.g., "online bookstore") + design image (screenshot from Common Crawl)
   - Generates 8-10 realistic user tasks specific to the seed
   - Derives unified data models (entities, attributes, relationships)
   - Derives unified programming interfaces (shared API signatures across all pages)
   - Key design: interfaces are user-facing (system params like userId/sessionId auto-managed via localStorage)
   - Example: `addToCart(userId, sessionId, productId, quantity)` wrapped to `addToCart(productId, quantity)`

2. **Task-Centric Backend** (Section 3.3) — runs in parallel with frontend
   - **Data Preparation**: generates concrete data instances consistent with tasks and models. If a task requires "products under $50", the catalog contains such items.
   - **TCTDD Loop**: Test cases and implementation code generated in parallel from the same pre-generated data. Tests run, failures are fed back to LLM with expected vs actual + code context. Iterate until all pass (max 8 iterations).
   - Key insight: **task-centric correctness** — only verify functionality on task-relevant execution paths, not the entire website. This makes verification tractable.
   - Implementation: `BusinessLogic` class with localStorage-based persistence, works in both browser and Node.js

3. **Design-Guided Frontend** (Section 3.4)
   - **Visual Style Extraction**: VLM analyzes design image for color system, typography, spacing, component patterns (Figure 20)
   - **Page Framework**: shared header/footer/CSS variables generated first
   - **Page Realization**: per-page HTML structure, CSS, and JavaScript UI layer with `data-populate`, `data-action`, `data-component` attributes
   - Data initialization script injected into homepage writes to localStorage

4. **Automatic Evaluator Generation** (Section 3.5)
   - Two types of variables:
     - **Existing variables**: state naturally stored (cart contents, preferences)
     - **Instrumentation variables**: explicitly added checkpoints tracking task-specific progress
   - Instrumentation analysis determines which tasks need new tracking variables vs can use existing localStorage
   - Instrumentation code wrapped in try-catch, injected into business logic functions
   - Evaluator returns weighted sum of checkpoint passes (0.0 to 1.0)

### TCTDD (Task-Centric Test-Driven Development)
Inspired by classic TDD (Williams et al., 2003), but scoped to task-relevant paths only:
- Tests are flow-based integration tests, not unit tests
- Tests chain API calls: call API -> capture response -> extract values -> use in next call
- Tests use the same pre-generated data as implementation
- Focus on happy path (successful scenarios)
- Never hardcode expected values; extract from actual API responses

### Common Crawl Usage (Appendix B)
- Web pages sampled from Common Crawl
- Each page rendered in headless browser, screenshot captured as design image
- LLM analyzes screenshot to generate concise natural language description = website seed
- Pages violating robots.txt or containing illegal content are filtered out
- This provides the diversity source: millions of visually distinct websites

---

## 4. Dense vs Sparse Rewards

### This is the paper's most practically impactful contribution.

**The Problem**: Standard RL evaluators for GUI agents use **binary (sparse) rewards** — 0 for failure, 1 for success. For complex multi-step web tasks, most trajectories fail entirely, producing zero learning signal. With GRPO, learning only occurs on "discriminative tasks" where at least one trajectory in a group receives a different score than the others.

**Dense Reward Design** (Figure 11):
- Each task evaluator has **weighted checkpoints** (e.g., 3 checkpoints with weights 0.35, 0.30, 0.35)
- Checkpoints validate different aspects:
  1. **Instrumentation flags**: Did the agent perform required actions? (prevents shortcuts like directly writing to localStorage)
  2. **Data consistency**: Were records properly created?
  3. **Confirmation state**: Did the full workflow complete?
- Reward = weighted sum of passed checkpoints (continuous 0.0 to 1.0)
- Example: agent that initiates subscription but fails to complete gets 0.35 reward instead of 0

**Quantitative Impact** (Figure 7, Section 4.6):
- 4,000 tasks evaluated with 4 trajectories each
- **Dense reward: 767 discriminative tasks** (where GRPO can learn)
- **Binary reward: 174 discriminative tasks**
- **4.4x more trainable tasks** with dense reward
- This means dense reward makes the same set of environments ~4.4x more training-efficient

**Why This Matters for GRPO**:
- GRPO computes advantages relative to the group: `advantage_i = (reward_i - mean(rewards)) / std(rewards)`
- With sparse rewards, a group where all trajectories fail (reward=0) or all succeed (reward=1) produces zero gradient
- Dense rewards create differentiation within groups: one trajectory completing 2/3 checkpoints vs 1/3 checkpoints produces meaningful gradients
- This is especially critical for hard tasks where no trajectory fully succeeds — sparse reward gives zero signal, dense reward still trains

**Anti-Shortcut Design**:
- Instrumentation checks prevent the agent from directly manipulating localStorage to fake completion
- The evaluator verifies both the process (instrumentation flags from function execution) and the outcome (data records in storage)

---

## 5. Limitations & Weaknesses

### Acknowledged by Authors (Limitations section, p.9)

1. **Single-Website Scope**: All tasks operate within individual websites. No cross-website tasks (e.g., comparing prices across shopping sites, aggregating from multiple sources). This limits the realism of training scenarios.

2. **Mobile Evaluation**: Websites use responsive layouts, but evaluation is desktop-only. No mobile agent evaluation.

3. **Generation Cost**: Multi-stage LLM calls are expensive. ~$1.93/website and ~20 min/website. Parallel processing helps but cost optimization is future work.

### Unacknowledged/Implicit Weaknesses

4. **Visual Realism Gap**: The paper addresses visual *diversity* (via Common Crawl reference images) but the generated websites are still LLM-generated HTML/CSS/JS. They use data-attribute patterns, localStorage, no real backend. The visual fidelity to reference images is measured by win rate (69-85%) but the absolute quality of matching real production websites is not measured. The 69.3% win rate against Codex is the lowest, suggesting visual quality has a ceiling.

5. **Sim-to-Real Gap**: The paper demonstrates transfer from synthetic web environments to real desktop apps (OSWorld) and real websites (Online-Mind2Web), but the transfer is from *functional* capability (exploration persistence, flow completeness, loop avoidance) not from visual recognition of real-world UI patterns. The three transfer mechanisms identified (Section A.1) are domain-agnostic behavioral patterns, not web-specific visual grounding.

6. **No Real Backend**: All websites use localStorage. No server-client interaction, no API calls, no authentication, no database. This means agents never learn to handle loading states, network errors, authentication flows, CAPTCHAs, or real async behavior.

7. **GPT-5 Dependency**: The system requires GPT-5 with "high" reasoning for best results. GPT-4.1 drops 8.2 points. The system's quality is tightly coupled to the backbone LLM.

8. **Task Diversity Ceiling**: 8-10 tasks per website, all derived from the website seed. The tasks are LLM-generated and may have systematic biases (e.g., over-representing e-commerce patterns).

9. **No Compositional Task Structure**: Unlike AgentSynth which composes long-horizon tasks from atomic subtasks, InfiniteWeb generates monolithic tasks. No explicit curriculum or difficulty progression.

10. **Evaluator Reliability**: 95% human verification pass rate means 5% of evaluators are incorrect. At scale (thousands of tasks), this introduces reward noise.

---

## 6. Key Figures/Tables

### Figure 1: Scaling Curve (p.1)
Shows GUI agent performance (OSWorld score and Online-Mind2Web score) as a function of training tasks (0, 200, 400, 600). Both curves are monotonically increasing with no sign of saturation. Dashed lines indicate potential for further scaling. This is the paper's headline result — more synthetic environments = better agents, and the scaling hasn't plateaued.

### Figure 7: Reward Density Comparison (p.8)
Bar chart comparing "discriminative tasks" for GRPO training under dense vs sparse (binary) reward. Dense reward: 767 tasks. Binary reward: 174 tasks. The 4.4x multiplier is the key number. This figure demonstrates why dense rewards are critical for training efficiency — they don't change the environments, they change how much learning signal can be extracted from the same environments.

### Table 2: OSWorld Per-Domain Results (p.7)
Shows UI-TARS-1.5-7B baseline vs +200/400/600 InfiniteWeb training tasks across 10 OSWorld domains (Chrome, GIMP, Calc, Impress, Writer, Multi-Apps, Thunderbird, VLC, VSCode). Key observations:
- Chrome (web): 22.9% -> 36.9% (+14.0pp) — direct domain transfer
- GIMP: 51.9% -> 69.2% (+17.3pp) — strongest cross-domain transfer
- Multi-Apps: 3.8% -> 9.7% (+5.9pp) — hardest category, still improves
- Some domains show non-monotonic scaling (Thunderbird peaks at +200, VSCode dips at +200)

### Table 3: Environment Quality Comparison (p.8)
Compares agent scores on InfiniteWeb vs OSWorld. InfiniteWeb is 2-3x harder (7.4% vs 24.5% for UI-TARS) and more discriminative (6.7pp gap between agents vs 2.8pp). This validates that InfiniteWeb generates meaningfully challenging environments, not trivial ones.

### Figure 11: Dense Reward Evaluator Example (Appendix, p.14)
Shows actual JavaScript evaluator code with 3 weighted checkpoints for a "subscribe to newsletter" task. Demonstrates the instrumentation + data consistency + confirmation pattern. This is the most concrete artifact in the paper for understanding how dense rewards work in practice.

---

## 7. Connection to Other Papers

### vs AutoWebWorld (environment synthesis)
AutoWebWorld also generates synthetic web environments but takes a fundamentally different approach. InfiniteWeb uses LLM code generation guided by unified specifications and TCTDD, producing static HTML/CSS/JS websites with localStorage. AutoWebWorld (if it follows the pattern of prior work) likely focuses on cloning or templating existing websites. InfiniteWeb's advantage is scalability and diversity (any website seed from Common Crawl), while its disadvantage is the sim-to-real gap (generated websites lack real backend complexity). InfiniteWeb explicitly acknowledges it generates *environments themselves* rather than generating *training data within existing environments* (Section 2, paragraph on Synthetic Environment and Data Generation).

### vs OpenCUA-style Training
InfiniteWeb's training setup directly feeds into an OpenCUA-style pipeline:
- Uses UI-TARS-1.5-7B as base model (same family as CUA agents)
- Trains with GRPO (Group Relative Policy Optimization), same algorithm used in DeepSeek and CUA training
- 128 parallel environments for rollout, 8 trajectories per task, 15 max steps per episode
- The dense reward evaluators are the key differentiator — OpenCUA uses similar RL training but InfiniteWeb's contribution is making it work with 4.4x more effective training signal

### vs WebSailor-V2 and AgentSynth
These generate *trajectories* or *tasks* within existing environments. InfiniteWeb generates the environments themselves. The paper positions this as solving "the environment scalability problem at its source" (Section 2). WebSailor-V2 uses synthetic trajectories + scalable RL. AgentSynth synthesizes long-horizon desktop tasks from atomic subtasks. InfiniteWeb is complementary — it could provide environments for these trajectory/task synthesis methods.

### vs MiniWoB++, WebArena, OSWorld
These are manually constructed benchmarks (tens to hundreds of apps). InfiniteWeb can generate environments at the scale of hundreds of websites with 8-10 tasks each. The paper uses these benchmarks for evaluation, not as training environments.

---

## 8. Connection to Practical CUA Building (capture->clone->crawl->train pipeline)

### Direct Relevance to Your Pipeline

Your pipeline: capture (record real websites) -> clone (generate React replicas via RCM/omni-tree) -> crawl (BFS state exploration) -> train (RL on state graphs).

InfiniteWeb takes the opposite approach — generate websites from scratch rather than clone real ones. But several insights transfer directly:

**Reward Design (CRITICAL)**:
- **Dense > Sparse by 4.4x for GRPO training.** This is immediately applicable. If your cloned websites only have binary success/failure evaluators, you're leaving ~75% of training signal on the table.
- **Weighted checkpoint pattern**: Break each task into 3-5 weighted checkpoints. Track intermediate progress. Example from paper: subscription task has (attempt recorded: 0.35, data created: 0.30, confirmation shown: 0.35).
- **Instrumentation variables**: Inject tracking code into your React clones' state management. When a function executes (add to cart, form submit), write a flag to localStorage/state. The evaluator checks both the instrumentation flags AND the resulting data records.
- **Anti-shortcut design**: Verify *process* (did the agent actually click through the UI?) not just *outcome* (is the right data in storage?). This prevents reward hacking where agents learn to directly manipulate state.

**Environment Generation**:
- **Task-centric correctness** is a pragmatic insight for your pipeline. You don't need pixel-perfect clones. You need clones where *the task-relevant interaction paths work correctly*. A booking website clone doesn't need a working "About Us" page — it needs the search -> select -> checkout flow to function.
- **Unified specification pattern**: Your omni-tree already captures the state graph. The equivalent of InfiniteWeb's "unified interface design" is your state transitions. Make sure all pages in a clone share consistent data models.
- **Visual diversity from Common Crawl**: InfiniteWeb uses CC screenshots as *style references*, not as clone sources. You're doing something more ambitious (actual cloning), but the insight that visual diversity matters for generalization is confirmed.

**Training Efficiency**:
- **600 tasks = +6.9% on OSWorld**. This suggests relatively small amounts of high-quality synthetic data can produce meaningful improvements.
- **Scaling hasn't saturated** at 600 tasks. Your pipeline could potentially generate thousands of tasks from cloned websites.
- **GRPO config**: learning rate 1e-6, batch 16, PPO epochs 1, clip ratio 0.2-0.3, gamma 0.95, 8 trajectories/task, 128 parallel environments, temperature 1.0. These hyperparameters are directly reusable.
- **20 min / $1.93 per website** is their generation cost. Compare with your capture->clone cost to assess relative efficiency.

**What Your Pipeline Does Better Than InfiniteWeb**:
- **Visual realism**: Your clones reproduce real website DOM/CSS, including shadow DOM, scroll containers, sticky elements. InfiniteWeb generates from scratch, resulting in simpler HTML.
- **Real website complexity**: Your clones capture Angular/React component trees, real API patterns, complex state management. InfiniteWeb uses localStorage-only, no real backend.
- **State graph structure**: Your BFS crawl produces an explicit state graph. InfiniteWeb doesn't expose state graphs — tasks are linear step sequences.

**What InfiniteWeb Does Better Than Your Pipeline**:
- **Evaluator generation**: Automatic, scalable, dense. This is the biggest gap in your pipeline. You need to build evaluator generation into your clone pipeline.
- **Task diversity**: Can generate unlimited website types from seeds. Your pipeline is limited to websites you've captured.
- **TCTDD for correctness**: Your clones may have functional bugs (extraction failures, shadow DOM issues). InfiniteWeb's test-driven approach catches these automatically.

### Specific Implementation Recommendations

1. **Add dense reward evaluators to your clone pipeline**: For each task on a cloned website, define 3-5 weighted checkpoints. Use your state graph transitions as the checkpoint sequence. Inject instrumentation into the React clone's event handlers.

2. **Adopt task-centric correctness**: Don't try to make clones pixel-perfect everywhere. Focus on verifying the task-relevant state transitions. Write tests for the paths agents will actually traverse.

3. **Use the 4.4x multiplier as a planning number**: If you have N tasks with binary rewards, switching to dense rewards effectively gives you 4.4N tasks worth of training signal.

4. **Consider hybrid approach**: Use InfiniteWeb-style generation for breadth (many website types) and your clone pipeline for depth (high-fidelity replicas of specific websites). Train on both.

---

## 9. What's Missing / Unanswered Questions

1. **No ablation on reward density granularity**: How many checkpoints is optimal? 3? 5? 10? The paper always uses a specific number per task but never studies the effect of checkpoint count on training efficiency.

2. **No comparison with curriculum learning**: Would training on easy tasks first, then hard tasks, outperform random task sampling? The scaling curve (Figure 1) adds tasks but doesn't discuss ordering.

3. **No analysis of failure modes**: What kinds of tasks/websites does InfiniteWeb fail to generate? The 1.5% that fail TCTDD after 8 iterations — what characterizes them?

4. **No comparison with real-website-based training**: How does training on InfiniteWeb compare to training on captured/cloned real websites? This is the key comparison for your pipeline.

5. **No measurement of visual realism vs training effectiveness**: Does visual fidelity to real websites matter for agent transfer? The paper shows visual diversity helps, but doesn't ablate visual realism (e.g., would training on wireframe-style websites work equally well?).

6. **No analysis of reward hacking**: With dense rewards, do agents learn shortcuts? The paper mentions anti-shortcut design but doesn't measure whether reward hacking occurs in practice.

7. **No long-horizon evaluation**: Max 15 steps per episode. Real web tasks often require 30-50+ steps. How does the training transfer to longer-horizon tasks?

8. **No multi-website tasks**: Acknowledged limitation. Real CUA agents need to navigate across websites (e.g., search Google, click result, interact with destination site).

9. **No dynamic content**: All websites are static HTML/CSS/JS with localStorage. No AJAX, no server-side rendering, no WebSockets, no real-time updates.

10. **No comparison with RL on real websites**: How does training on synthetic environments compare to training directly on real websites (with appropriate safety measures)?

11. **Checkpoint weight assignment**: How are the checkpoint weights (e.g., 0.35/0.30/0.35) determined? Are they manually set per task, LLM-generated, or computed from task structure? This is crucial for automation but not explained.

12. **Code instrumentation side effects**: Does adding instrumentation variables to business logic ever change application behavior? The paper says it's wrapped in try-catch, but doesn't measure whether instrumented code passes the same tests as uninstrumented code.

13. **Generalization of TCTDD**: Could TCTDD be applied to your clone pipeline? Instead of generating tests from scratch, generate tests from the state graph of the original website.
