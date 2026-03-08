# Paper Synthesis

These five papers form a deliberate arc. Each dismantles an assumption the previous one left standing.

**JEDI** claims grounding is *the* bottleneck. A 7B grounder + o3 planner hits 51% on OSWorld, beating monolithic 72B models. Separate the grounder from the planner; data scaling shows "no sign of saturation" (Section 4.2). Problem solved?

**AutoWebWorld** picks up what JEDI ignores — where do training *environments* come from? It models websites as FSMs where "the environment's internal state [is] a pair of page identity and a page signature" (Section 3). BFS produces trajectories "correct at the FSM level by construction" (Section 4.3) at $0.04 each versus $0.15-$1.00 for real-world pipelines. This is exactly what `crawler.js` implements: `hashState(pathname, stateObj)` mirrors AutoWebWorld's `(page_id, signature)` pair. But it treats correctness as binary: "a trajectory is accepted only if all steps can be carried out successfully" (Section 4.4).

**InfiniteWeb** challenges that binary thinking. Dense checkpoint evaluators enable learning from "767 tasks compared to 174 with binary reward — a 4.4x increase" in effective training signal (Section 4.6). This exposes a gap in this repo: `env.py` uses BFS-distance shaping (+0.1 per edge closer to goal), which is topological, not semantic. The clone's `BookingState` tracks each form field — converting those into weighted checkpoints would directly apply InfiniteWeb's finding.

**OpenCUA** delivers the sharpest result: raw state-action SFT yields 4.4% on OSWorld; the same data with reflective chain-of-thought reaches 45.0% — 10x from annotation format alone, pure SFT with no RL. Without CoT, "training on state-action pairs alone yields limited performance gains even as the dataset size scales" (Section 3). More trajectories from `crawler.js` won't help unless each step is annotated with reasoning.

**GroundCUA** loops back to challenge JEDI. Training on "only 700K instructions, far below multi-million-sample corpora (e.g., JEDI 9M)" outperforms on every benchmark (Section 5.1), because human annotations average "64 per screenshot, more than three times that of OS-Atlas" versus JEDI's 7 (Section 2). The key finding: "models trained with GroundCUA during SFT show the smallest performance gains from RL" (Section 5.2) — quality SFT captures most learnable signal before RL enters the picture.

**The collective argument** reveals three bottlenecks, each visible only once the previous is solved. First, **environments**: you can't train without controllable, verifiable environments — AutoWebWorld's FSM-BFS pattern solves it. Second, **signal**: raw trajectories don't scale (OpenCUA's flat curve) and binary rewards waste 75% of training signal (InfiniteWeb). You need dense rewards *and* reasoning annotations. Third, **architecture**: a monolithic model wastes good signal. JEDI and GroundCUA independently show small grounders + frontier planners beat monolithic models.

**Where this repo sits:** it implements the first bottleneck well (FSM-BFS crawling). What's missing: dense checkpoint rewards from the clone's existing state tracking, a CoT synthesis pipeline, and bridging the action-space gap — `env.py` trains on annotation indices while `eval/agent.py` evaluates on pixel coordinates, which are fundamentally incompatible.
