# OpenCUA: Open Foundations for Computer-Use Agents -- Deep Analysis

**Paper**: arXiv:2508.09123v3 (Oct 4, 2025)
**Venue**: NeurIPS 2025
**Authors**: Xinyuan Wang, Bowen Wang, Dunjie Lu, Junlin Yang, Tianbao Xie, et al.
**Affiliations**: XLANG Lab (HKU), Moonshot AI, Stanford, Waterloo, CMU

---

## 1. Core Thesis (2-3 sentences)

Training computer-use agents (CUAs) on raw state-action demonstrations alone produces dismal performance (4.4% success rate on OSWorld), and scaling data volume does not help. The critical missing ingredient is **reflective long Chain-of-Thought (CoT) reasoning** synthesized per step, which -- combined with multi-image history, mixed-level CoT training, and general-domain data mixtures -- unlocks data scaling laws that push an open-source 72B model to 45.0% on OSWorld-Verified, matching proprietary systems. The paper provides the first fully open end-to-end framework: annotation tool, 22.6K trajectory dataset, CoT synthesis pipeline, training recipes, and models.

---

## 2. Key Quantitative Claims

### The Dramatic Improvement
- **4.4% -> 45.0%** on OSWorld-Verified (100 steps): Qwen2.5-VL-72B-Instruct base achieves 5.0%; OpenCUA-72B achieves 45.0% (Section 4.2, Table 3)
- The 4.4% figure specifically refers to the "Base Recipe" (SFT on state-action pairs only, no CoT) shown in Figure 1 Left

### Model Performance (Table 3 -- OSWorld-Verified)
| Model | 15 Steps | 50 Steps | 100 Steps |
|-------|----------|----------|-----------|
| Claude 4 Sonnet | 31.2 | 43.9 | 41.5 |
| Claude Sonnet 4.5 | - | - | 61.4 |
| OpenCUA-72B | 39.0 | 44.9 | 45.0 (+/- 1.1) |
| OpenCUA-32B | 29.7 | 34.1 | 34.8 |
| OpenCUA-7B | 24.3 | 28.1 | 26.6 |
| UI-TARS-72B-DPO | 24.0 | 27.1 | 27.1 (estimated) |
| Qwen2.5-VL-72B base | 4.4 | 5.0 | 5.0 |

### Pass@N Test-Time Scaling (Section 5, Figure 8)
- OpenCUA-Qwen2-7B, temp=0.1, 50 steps: Pass@1 = 18.4%, Pass@16 = 39.2% (+113%)
- OpenCUA-32B: Pass@1 = 34.2%, Pass@3 = 45.6%
- OpenCUA-72B: Pass@1 = 45.0%, Pass@3 = 53.2% (Table 11)

### Dataset Scale
- **22,625 tasks** total (AgentNet): 12K Windows, 5K macOS, 5K Ubuntu
- **41,428 trajectories** for training 7B and 32B models; 27,804 for Qwen2-7B and A3B
- Average **18.6 steps per trajectory** (higher than all compared datasets)
- 140+ applications, 190+ websites, 3 operating systems
- 200+ applications/websites in annotation list

### Training Compute
- OpenCUA-72B: Stage 1 = 250B tokens (480x A100), Stage 2 = 16B tokens (480x A100)
- OpenCUA-7B: 200B tokens total (128x A100, 8 days)
- OpenCUA-32B: Stage 1 = 35B tokens (224x A100), Stage 2 = 60B tokens (128x A100)

### GUI Grounding (Table 5)
- OpenCUA-72B: ScreenSpot-Pro 60.8%, UI-Vision 37.3% (SOTA)
- OpenCUA-32B: ScreenSpot-Pro 55.3%

### Data Scaling (Section 4.2, Figure 7)
- Ubuntu 3K -> 10K: average performance improves by 72%
- Win/Mac 3K -> 14K: average performance improves by 125%
- Cross-domain (different OS) data provides positive transfer, not negative

### CoT Synthesis Cost
- USD 0.6 per task average (using claude-3-7-sonnet)
- Total dataset build cost: ~USD 32,000
- Annotation: ~USD 20,000 (6 months, 634 part-time annotators)

---

## 3. Methodology

### Reflective Long Chain-of-Thought (Section 3.1)

A three-level CoT hierarchy synthesized per state-action pair:
- **L3 (Observation + Thought + Action)**: Detailed visual description of screen state, then reasoning, then action
- **L2 (Thought + Action)**: Reflective reasoning analyzing state transitions, recalling previous steps, planning next actions, then action
- **L1 (Action)**: Concise executable action description only

The hierarchy mirrors **perceptual-to-agentic decision flow**: L3 -> L2 -> L1.

### CoT Synthesis Pipeline (Figure 5)

Three components, all powered by `claude-3-7-sonnet-20250219`:

1. **Reflector**: Inspects each step by comparing screenshots before/after the action. Checks:
   - Did the environment change?
   - Was the action effective?
   - Was the action necessary?
   - When step is incorrect/redundant: generates explanation and marks step to be **ignored during training**
   - When step is correct: explains state transition differences

2. **Generator**: Conditions on full agent context (previous reflections, action history, task goal, screenshots, action code) to produce structured CoT. Uses visual cues:
   - Red marker on mouse action coordinate
   - Zoomed-in image patch around action target (inspired by V* [43])

3. **Summarizer**: Refines vague user-written goals into precise task objectives. Scores each trajectory on alignment, efficiency, and difficulty.

### Key Modeling Detail: Reflection Augmentation for L2

The paper explicitly embraces annotation errors as training signal (Section 2.2): "annotation error is not all bad, as long as we can identify and utilize them." Steps where the reflector identifies errors get reflection reasoning that teaches the model to detect mistakes and course-correct. The reflection includes:
- Memory of previous steps
- Analysis of what went wrong
- Plan adjustment for recovery

Ablation result (Table 6): Reflective long CoT improves OSWorld SR from 11.5% (short CoT, Aguvis-style) to 15.3% on a controlled comparison.

### Context Encoding (Section 3.2)

- **Visual history**: 3 screenshots by default (Figure 10 shows 3 > 1, but 5 offers marginal gains at 3K more tokens)
- **Textual history**: L1 CoT (Action only) for previous steps -- more token-efficient, avoids hallucination propagation from verbose L2 history
- **Inference format**: L2 CoT at test time despite training on mixed L1/L2/L3 -- because L2's richer reasoning helps planning

### Training Data Mixtures (Section 3.3)

Training uses **all three CoT levels** simultaneously:
- L1 reinforces direct action prediction
- L2 reinforces planning and prediction
- L3 reinforces perception (but can introduce irrelevant descriptions)
- Ablation: L2-only training = 13.1% vs. mixture = 18.5% on OSWorld (Table 6)

Data composition for Stage 2 (main recipe): 70% CUA data (4:1 planning:grounding ratio), 30% general SFT data.

General text data **improves** agent performance (Figure 11): adding 35% general text from totally different domains helps generalization and instruction understanding.

---

## 4. The GRPO Details

**OpenCUA does NOT use GRPO.** This is a critical finding for the cross-paper analysis.

OpenCUA is a **pure SFT paper**. The entire training pipeline is supervised fine-tuning on synthesized CoT trajectories. There is no reinforcement learning, no GRPO, no reward model, no online RL loop.

The closest thing to RL is:
- **Rollout trajectories** used in OpenCUA-72B: "8k trajectories rolled out in an Ubuntu environment using o3 + Jedi" (Section 4.1). These are rollouts from a strong model (o3) used as additional SFT data, not RL training signal.
- **Pass@N analysis** showing headroom for "future post-training, reranking or multi-agent methods" (Section 4.2) -- explicitly acknowledging RL as future work.

The paper's contribution is orthogonal to GRPO: it provides the **data pipeline, CoT format, and training recipe** that would serve as the SFT foundation before any RL fine-tuning.

---

## 5. Data Curation

### Trajectory Filtering
- Tasks required **>15 steps**; tasks with **<5 steps were rejected** (Section 2.2)
- All tasks manually verified and labeled: rejected, ok, good, or excellent
- Labels based on goal clarity, diversity, and complexity
- Data split: Windows/macOS vs Ubuntu, ensuring **no overlap with OSWorld tasks** (prevents data leakage)

### Action Reduction Pipeline
Raw demonstrations produce thousands of low-level events. The pipeline:
1. Mouse moves -> retained only as start/end positions for clicks/drags
2. Consecutive scrolls -> merged into single-directional with accumulated counts
3. Consecutive key presses -> merged into text input strings
4. Modifier combos (Ctrl+C) -> abstracted to hotkey actions
5. Multi-step gestures (double-clicks, drags) -> combined

### State-Action Matching
Critical detail: For mouse clicks, they **backtrack** to the beginning of the mouse pre-movement phase and search backward for the last visually distinct frame. This prevents information leakage where the mouse is already positioned over the target in the screenshot.

### Quality Scoring by Summarizer
Each trajectory scored on:
- Alignment (does trajectory match task goal)
- Efficiency (are steps non-redundant)
- Difficulty (task complexity)

### Task Complexity Distribution (Appendix C.1.2)
- GPT-4o rates complexity 1-10; most tasks are medium-to-high
- 30.6% require multiple apps/websites
- 12.9% involve professional knowledge
- 12.9% use uncommon features

### Why Task Complexity Matters
Simple tasks (<5 steps) are rejected because they don't teach multi-step planning and error recovery. The average of 18.6 steps per trajectory is intentionally high -- the paper argues complex tasks are essential for learning reflective reasoning.

---

## 6. Limitations & Weaknesses

### Explicitly Acknowledged (Appendix A)
1. **Scalability limited by human annotation**: Despite the tool's efficiency, expanding beyond 22K tasks requires more human effort. Semi-automated methods suggested but not implemented.
2. **Annotator expertise gaps**: Annotators may not know optimal approaches (shortcuts, scripting). Trajectories may contain suboptimal but successful solutions.
3. **Selection bias**: Ethical requirement for informed consent excludes users who don't want to participate, limiting data diversity.

### Not Acknowledged but Evident

4. **CoT synthesis quality ceiling**: All CoT is generated by claude-3-7-sonnet. The quality is bounded by Claude's understanding of GUI tasks. Errors in synthesized CoT propagate directly into training data. No human verification of CoT quality is reported.

5. **No RL component**: The paper is pure SFT. The Pass@3 jump (45.0% -> 53.2% for 72B) explicitly suggests substantial headroom for RL fine-tuning, but this is left entirely to future work.

6. **Model scale requirements**: The 72B model requires 480x A100 GPUs. The 7B model achieves only 26.6% at 100 steps -- roughly half the 72B performance. The method's effectiveness appears heavily scale-dependent.

7. **Error recovery still weak**: Even at 72B, the error study (Appendix E) reveals persistent failure modes:
   - Action repetition loops
   - Termination misjudgment (premature or delayed)
   - Insufficient error perception (one character off, judged correct)
   - Long-horizon coherence breakdown (>30-50 gold steps)

8. **Robustness concerns**: At temperature=0, Pass@1 vs Pass@16 gap is >18% absolute (Figure 9). Minor environmental perturbations (system date changes) cause dramatically different trajectories. The model is fragile.

9. **No web-specific evaluation**: All online evaluation is desktop-focused (OSWorld, WAA). No WebArena or similar web-only benchmarks.

10. **1D RoPE substitution**: They replaced M-RoPE in Qwen models with 1D RoPE to align with Kimi infrastructure. Impact on spatial reasoning not analyzed.

---

## 7. Key Figures/Tables

### Figure 1: Data Scaling Curves (Most Important)
Left panel shows the dramatic contrast: "Base Recipe" (state-action SFT only) achieves 4.4% and doesn't scale with data. "OpenCUA Recipe" (with reflective CoT) achieves 18.5% at same data scale and continues scaling. Adding more data and model size pushes to 45.0%. This is the paper's central visual argument that CoT is the key to unlocking data scaling.

Right panel shows OSWorld-Verified leaderboard comparison: OpenCUA-72B at 45.0% vs Claude 4 Sonnet at 43.9% (100 steps).

### Table 3: OSWorld-Verified Main Results
The definitive results table showing step-budget analysis (15/50/100 steps) across proprietary and open-source models. Key insight: most agents gain significantly from 15->50 steps but plateau or even regress from 50->100, suggesting current models waste additional steps on hallucination and loops rather than productive recovery.

### Figure 5: Reflective CoT Synthesis Pipeline
Shows the generator-reflector loop. For each step, the reflector examines before/after screenshots and action correctness. If the step is incorrect, it generates reflection reasoning and the step is excluded from training. If correct, the generator produces structured CoT conditioned on full context. This is the methodological core of the paper.

### Table 6: CoT Ablation Results
Demonstrates three critical findings:
- CoT Mixture (L1+L2+L3) = 18.5% vs L2-only = 13.1%
- Reflective long CoT = 15.3% vs short CoT (Aguvis-style) = 11.5%
- L2 reasoning format at inference outperforms L1 and L3

---

## 8. Connection to Other Papers

### Relationship to Scaling-CUA-Grounding / GroundCUA (Reference [48])
- OpenCUA uses grounding data from the approach described in [48] (Xie et al., "Scaling computer-use grounding via user interface decomposition and synthesis")
- **189K bounding-box samples** parsed from collected AXTree structures are used for grounding training (Section 3.3)
- Additional grounding datasets: ShowUI [24], UGround [16]
- Stage 1 training heavily focuses on grounding as foundation
- The Jedi system from [48] is used alongside o3 for the 8K rollout trajectories in OpenCUA-72B

### Relationship to AutoWebWorld / InfiniteWeb
- **No direct connection found** in the paper. OpenCUA does not reference AutoWebWorld or InfiniteWeb.
- OpenCUA collects data from **real personal computing environments**, not synthesized web environments
- The environments for evaluation are real desktop VMs (OSWorld, WAA), not synthetic

### Relationship to Aguvis [52]
- OpenCUA's CoT synthesis extends Aguvis's pipeline
- Aguvis proposed the two-stage curriculum (Stage 1: grounding, Stage 2: planning)
- OpenCUA's key advance over Aguvis: **reflective reasoning** in L2 CoT (error detection + correction)
- Aguvis's short CoT = 11.5% vs OpenCUA's reflective long CoT = 15.3% (Table 6)

### Relationship to UI-TARS [32]
- UI-TARS-72B-DPO: 27.1% at 100 steps on OSWorld-Verified
- OpenCUA-72B: 45.0% at 100 steps -- significant improvement
- UI-TARS uses DPO (a form of offline RL), while OpenCUA is pure SFT
- Both emphasize reasoning but OpenCUA's reflective CoT appears more effective

---

## 9. Connection to Practical CUA Building (Capture->Clone->Crawl->Train Pipeline)

### Direct Insights for Training Loops

1. **SFT before RL is mandatory**: OpenCUA demonstrates that even with 22K trajectories, raw state-action SFT produces only 4.4% success rate. The CoT augmentation is what makes SFT work. For a capture->clone->crawl->train pipeline, this means the quality of reasoning annotations on trajectories is more important than trajectory volume.

2. **Data scaling works but only with CoT**: Without reasoning traces, more data doesn't help (Figure 1 left, flat "Base Recipe" line). With CoT, clear scaling laws emerge. Implication: if you're generating training trajectories by crawling cloned websites, you must also synthesize reasoning traces for each step.

3. **Cross-domain transfer is positive**: Windows/Mac data helps Ubuntu performance (Section 4.2, Figure 7). For a pipeline that clones specific websites, training on diverse websites should improve performance on held-out sites rather than causing negative transfer.

4. **State-action matching is critical**: The backtracking technique for mouse click screenshots (Section 2.2) prevents trivial prediction where the cursor is already on the target. Any capture pipeline must carefully choose which frame to pair with each action.

### Reward Shaping Insights

5. **The reflector IS a reward signal**: Though OpenCUA doesn't use RL, the reflector (comparing before/after screenshots, checking action effectiveness) is essentially a per-step reward function. It labels steps as correct, incorrect, or redundant. This same mechanism could serve as a reward model for GRPO training on cloned website trajectories.

6. **Error steps have value**: OpenCUA explicitly includes error steps in the CoT (with reflection reasoning) rather than filtering them out. For RL training, this suggests the reward function should distinguish between "wrong action" (negative reward) and "wrong action followed by successful recovery" (positive trajectory-level reward).

7. **Multi-criteria evaluation**: The AgentNet Bench uses fine-grained action matching:
   - Coordinate actions: bounding-box containment
   - Content actions: edit distance
   - Keyboard actions: exact match
   - Scroll: direction + location match
   These criteria could directly inform reward functions for RL training.

### Reasoning Format Insights

8. **L2 is the sweet spot for inference**: The observation-heavy L3 format introduces irrelevant descriptions that distract the model. The action-only L1 format lacks reasoning context. L2 (Thought + Action) provides reflective planning without visual noise. For a training pipeline: synthesize all three levels but use L2 at inference.

9. **Train mixed, infer focused**: Training on all three CoT levels (L1+L2+L3) outperforms training on any single level. This is a form of data augmentation through reasoning diversity.

10. **History format matters**: Use L1 (action-only) for textual history of previous steps, not L2/L3. Verbose history causes hallucination propagation. Use 3 screenshots for visual history -- more is diminishing returns.

### Pipeline Architecture Insights

11. **Action space design**: OpenCUA uses PyAutoGUI-compatible actions (Table 1): click, doubleClick, scroll, write, press, hotkey, dragTo, moveTo, wait, terminate. This is deliberately OS-agnostic. For cloned website training, the action space could be even simpler (click, type, scroll, done).

12. **Resolution handling**: Models are evaluated at 1920x1080. Training data spans 720p-4K. Coordinates are normalized (0-1 range based on the code examples like `pyautogui.click(x=0.988, y=0.081)`).

13. **Trajectory complexity threshold**: Tasks with <5 steps are rejected; >15 steps preferred. Short tasks don't teach planning or error recovery. For synthetic trajectory generation on cloned websites, prioritize complex multi-step workflows over simple single-action tasks.

---

## 10. What's Missing

### GRPO / RL Questions (Unanswered by This Paper)
- **OpenCUA is pure SFT** -- it provides zero information about GRPO, entropy regularization, or mode collapse. The Pass@3 gap (45.0% -> 53.2%) explicitly suggests RL would help, but no experiments are presented.
- The paper does not explore reward modeling, preference learning, or online RL at all. UI-TARS uses DPO and is substantially worse; the comparison is not controlled enough to draw conclusions about RL utility.

### Entropy Regularization
- Not discussed. The temperature ablation (Section 5) shows higher temp increases Pass@N but decreases Pass@1. No entropy bonus in training is mentioned.

### Mode Collapse on Small Action Spaces
- Not studied. The action space has ~12 action types (Table 1), but the diversity of targets (any pixel coordinate) prevents classical mode collapse. For cloned websites with smaller target spaces (e.g., only a few buttons), this is a real concern not addressed.

### Outstanding Questions

1. **CoT quality verification**: How often does claude-3-7-sonnet produce incorrect CoT? What's the hallucination rate in synthesized reasoning? No human evaluation of CoT accuracy is reported.

2. **Reflector accuracy**: How often does the reflector incorrectly classify correct steps as errors (or vice versa)? The paper reports no precision/recall for the reflector.

3. **Curriculum ordering**: Would training on easy tasks first, then hard tasks, improve results? The paper mentions this is possible but doesn't test it.

4. **Model forgetting**: With 200B tokens of training (7B model), how much general capability is lost? No benchmarks on standard VLM tasks post-training.

5. **Rollout data quality**: The 8K o3+Jedi rollout trajectories used for 72B -- how do they compare to human demonstrations? Are they higher quality? The paper doesn't ablate their contribution separately.

6. **Coordinate prediction accuracy**: The paper shows end-to-end success rates but doesn't report raw coordinate prediction accuracy. How much of the failure comes from grounding errors vs. planning errors?

7. **Token efficiency**: At 200B training tokens for a 7B model, this is ~28 epochs over the data. Is this efficient? What's the optimal compute-to-data ratio?

8. **Transfer to web-only tasks**: All online evaluation is desktop-focused. How would these models perform on WebArena or similar web benchmarks?

---

## Key Takeaways for Pipeline Design

1. **CoT synthesis is the highest-leverage investment** -- it's what converts useless data into useful data (4.4% -> 18.5% at constant data volume).

2. **The reflector pattern** (before/after screenshot comparison + action effectiveness check) is directly applicable as a reward model for RL training on cloned websites.

3. **SFT scales with data only when paired with reasoning traces** -- this is the paper's central empirical contribution and has major implications for any data-hungry training pipeline.

4. **Cross-domain data helps** -- training on diverse websites/applications improves performance on specific targets, suggesting a broad-then-narrow training curriculum is optimal.

5. **The 72B scale matters** -- 7B achieves roughly half the performance. For practical deployment, either accept the compute cost or invest heavily in RL post-training to close the gap at smaller scales.
