# GroundCUA: Grounding Computer Use Agents on Human Demonstrations

**Paper:** arXiv:2511.07332v1, November 10, 2025
**Authors:** Aarash Feizi, Shravan Nayak, et al. (Mila, McGill, ServiceNow Research, UWaterloo, Oxford, NUS)
**Project Page:** https://groundcua.github.io

---

## 1. Core Thesis

GroundCUA argues that **high-quality, densely-annotated human demonstrations dramatically outperform larger synthetic or automatically-harvested datasets** for training GUI grounding models. They demonstrate that 700K carefully curated instruction-tuning samples from expert human demonstrations beat JEDI's 9M synthetic samples, achieving state-of-the-art results across five benchmarks with less than one-tenth the training data. The paper's central claim is that annotation density and quality -- not raw data volume -- is the bottleneck for reliable desktop grounding.

---

## 2. Key Quantitative Claims

### Dataset Scale (Section 3)
- **56K screenshots** across **87 open-source applications** in **12 categories**
- **3.56M+ human-verified annotations** total
- **64 annotations per screenshot on average** (some up to 542)
- Mean resolution: 2.03 megapixels (range: 0.39 to 7.0 MP)
- Average bounding box area: **0.13%** of image (extremely fine-grained)
- **700K SFT samples**, **10K RL samples**
- Over **10,000 task demonstrations** recorded

### Comparison with JEDI (Table 1, Section 5.1)
| Metric | GroundCUA | JEDI |
|--------|-----------|------|
| Total elements | 3.56M | 4M (but 9M instruction-tuning set) |
| Screenshots | 55K | 575K |
| Desktop elements | 3.56M (all desktop) | 2.4M |
| Avg elements/screen | **64.1** | **7.0** |
| Avg element area | **0.13%** | not reported |
| Resolution range | 0.4-7.0 MP | 0.9-2.1 MP |
| Human annotations | Yes | No (synthetic) |
| Training data used | **700K** | **9M** |

### Benchmark Results (Tables 2, 3)

**SFT-only, 3B scale (Table 2):**
- GroundNext-3B (SFT) avg: **66.4** vs JEDI-3B: 52.2 (+14.2 points)
- GroundNext-3B (SFT) avg w/o UI-V: **68.4** vs JEDI-3B: not stated explicitly

**SFT-only, 7B scale (Table 2):**
- GroundNext-7B (SFT) avg: **69.2** vs JEDI-7B: 56.1 (+13.1 points)

**After RL, 3B scale (Table 3):**
- GroundNext-3B (RL) avg: **68.4**

**After RL, 7B scale (Table 3):**
- GroundNext-7B (RL) avg: **70.5**

**UI-Vision (in-domain, Table 2):**
- GroundNext-3B: **58.2** vs JEDI-3B: 18.7 (+39.5 points)
- GroundNext-7B: **58.7** vs JEDI-7B: 24.8 (+33.9 points)

**ScreenSpotPro (Table 2):**
- GroundNext-3B: **48.6** vs JEDI-3B: 36.1
- GroundNext-7B: **50.2** vs JEDI-7B: 39.5

### Agentic Performance (Table 4, OSWorld-Verified)
- GroundNext-3B w/ o3: **50.6** overall
- JEDI-7B w/ o3: **51.0** overall (comparable despite 2x+ size difference)
- OpenCUA-72B: **46.1** (GroundNext-3B surpasses this)
- Claude-4-Sonnet: **41.4** (GroundNext-3B surpasses this)
- GroundNext-3B beats JEDI-7B in 3/5 categories (OS: 62.5 vs 50.0, Office: 47.0 vs 46.1, Workflow: 36.5 vs 35.3)

### 100K Fair Comparison (Figure 3, Section 5.1)
When training the same base model (Qwen2.5-VL-3B-Instruct) on exactly 100K samples from each dataset with identical hyperparameters:
- **GroundCUA: ~57.5 avg** (highest)
- OS-Atlas Desktop: ~48
- JEDI: ~47
- Aguvis: ~45
- UGround: ~43

### RL Gains Analysis (Figure 3)
- GroundCUA SFT + RL: **+1.7** points (smallest gain -- already strong from SFT)
- OS-Atlas SFT + RL: **+4.3** points
- JEDI SFT + RL: **+4.3** points
- Aguvis SFT + RL: **+4.9** points
- UGround SFT + RL: **+5.1** points

The pattern: **weaker SFT data benefits more from RL**, suggesting GroundCUA's SFT captures most learnable signal already.

---

## 3. Methodology

### Human Demonstration Collection (Section 3)
1. **Application Selection:** 87 open-source apps across 12 categories (Table 5): Education (5), Browsers (4), Development (14), Productivity (19), Graphics & Design (8), Video/Audio Production (8), Communication (7), Entertainment (3), System Utilities (7), Security (2), Finance/Business Analytics (3), Scientific (7)
2. **Task Design:** Annotators designed and executed "everyday computer-use tasks" (drafting documents, editing spreadsheets, running simulations). Over 10,000 task demonstrations total.
3. **Keyframe Extraction:** From screen recordings, keyframes extracted "immediately before a user action (e.g., a mouse click or text entry) that would trigger a change."
4. **Dense Annotation:** Annotators labeled **every visible element** in each keyframe with bounding boxes. Each element got:
   - Textual label (element name, displayed text, or concise summary for long text)
   - OCR via PaddleOCR for long text segments
   - Category assignment (~50% of elements) into 8 categories: Input Element, Sidebar, Information Display, Button, Navigation, Visual Elements, Menu, Others (Table 6)

### Annotation Team (Section A.2)
- Partnered with professional data labeling vendor
- ~70 annotators organized in tiers (annotators, QA specialists, project managers)
- Located primarily in India and Latin America, ages 20-35, balanced gender
- All held bachelor's degrees in CS/Engineering
- Compensated hourly, each task 60-90 minutes including QC
- Three phases: pilot study with iterative feedback, production, QA review

### Instruction Generation Pipeline (Section 3, Appendix B)
From the 3.56M annotations, deduplicated to ~900K unique elements via text matching + perceptual image similarity (pHash). Then generated three instruction types:

1. **Direct Instructions (50% of 700K):** Describe element attributes, position, context
   - Textual elements: ~100 templates embedding OCR text
   - Visual elements: Captions generated by Qwen2.5-VL-72B from crops
   - General: ~120 heuristic templates + MLLM-generated

2. **Functional Instructions (35% of 700K):** Describe purpose rather than name (e.g., "Open a new tab" instead of "Click the '+' button"). Focus on Buttons and Menus. Generated via Qwen2.5-VL-72B prompting.

3. **Spatial Instructions (15% of 700K):** Use relative positioning to anchor elements (e.g., "Click the icon to the left of 'Files'"). Generated with templates using dense annotation context.

### GroundNext Architecture (Section 4.1)
- **Base model:** Qwen2.5-VL-Instruct (3B and 7B variants)
- **Full fine-tuning** of both vision encoder and language model (preliminary experiments showed this beats LLM-only fine-tuning)
- **Task definition:** Given screenshot I and instruction x, predict 2D point p = (u, v). Correct if point falls within ground-truth bounding box B.

### Training Details (Appendix C)
- **SFT:** Single node with 8 H100 GPUs, global batch size 128, learning rate 3e-6, cosine decay, warmup ratio 0.05, 2 epochs, gradient accumulation 16, per-device batch size 1. Used LlamaFactory.
- **RL:** RLOO (Relative Leave-One-Out) method, 10K samples unseen during SFT, group size n=8, batch size 64, 1 epoch on same H100 node.

### Reward Function (Section 4.1, Appendix C.4)
A **6-level discrete reward** based on normalized distance from predicted point to ground-truth bounding box:

```
D_norm = D(predicted, bbox) / D_max(bbox, image)

Reward:
  -1.0  if D_norm < -0.5      (far outside box)
  -0.5  if -0.5 <= D_norm < -0.1  (moderately outside)
  -0.1  if -0.1 <= D_norm < 0    (just outside box)
  +0.1  if 0 <= D_norm < 0.1    (inside but near edge)
  +0.5  if 0.1 <= D_norm < 0.5  (inside, moving toward center)
  +1.0  if D_norm >= 0.5       (near center)
```

They tested three alternatives:
1. **Continuous reward** (r = 1 - d): Suffered from sparsity and weak gradient signals
2. **Binary reward** (1 if inside bbox, 0 otherwise): More stable but insensitive to error magnitude
3. **Discrete 6-level (final choice):** Best empirical performance. Captures dominant error modes: mild penalty for near misses, strong penalty for far misses, encourages centering within box.

They explicitly **exclude reward model-based approaches** citing unreliable judges (Feizi et al., 2025; Lu et al., 2025).

---

## 4. Quality vs Quantity Argument

### The Central Evidence

The paper's strongest evidence is the **100K head-to-head comparison** (Figure 3): same base model, same hyperparameters, same sample count from each dataset. GroundCUA beats JEDI, OS-Atlas, Aguvis, and UGround by significant margins.

### Why Annotation Density Matters

**Key numbers from Table 1:**
- GroundCUA: **64.1 elements per screenshot** (human-verified)
- JEDI: **7.0 elements per screenshot** (synthetic)
- OS-Atlas: **7.8 elements per screenshot** (accessibility tree)
- UGround: **11.6 elements per screenshot** (automated)
- Aguvis: **8.5 elements per screenshot**

This 9x density advantage enables:
1. **Contextual instruction generation:** With 64 labeled elements per screen, the LLM can generate instructions that reference surrounding context, spatial relationships, and disambiguation cues
2. **Fine-grained targets:** Average element area of 0.13% (vs JEDI's unreported but larger elements) means the model learns to locate tiny icons and controls
3. **Realistic distribution:** Keyframes captured from actual task execution reflect real-world usage patterns, unlike random interface states from DFS/BFS exploration

### The RL Gain Inversion (Figure 3)
Models trained with GroundCUA SFT gain the least from subsequent RL (+1.7), while models trained on weaker data gain more (+4.3 to +5.1). This suggests GroundCUA's SFT already captures most learnable signal, **leaving fewer correctable errors for RL**.

### Against JEDI Specifically
- JEDI achieves scale through **synthetic interface generation** (UI decomposition and synthesis), creating 575K screenshots with 4M elements
- GroundCUA argues these "simplified screens underrepresent genuine desktop complexity" (Section 2)
- JEDI's 7.0 elements/screenshot vs GroundCUA's 64.1 means JEDI screenshots capture only ~11% of visible UI elements
- Despite using 700K training samples vs JEDI's 9M (13x less), GroundNext outperforms JEDI across all benchmarks

### The Icon Recognition Advantage (Section 5.3, Table 7)
GroundCUA shows the largest gains on **icon recognition** -- exactly the element type that automated pipelines miss. On ScreenSpotPro, GroundNext outperforms most models by an average of 10.7% on icons. This reflects the human annotators' ability to label small visual elements that DOM/accessibility tree crawlers skip.

---

## 5. The Grounder + Planner Architecture

### Architecture (Section 5.3, Table 4)
The agentic setup separates:
- **Planner: OpenAI o3** -- consumes task instructions and action history, generates grounding commands
- **Grounder: GroundNext-3B** -- takes screenshots + planner's natural language commands, predicts click coordinates

### Interface Boundaries
The o3 planner generates natural language grounding commands (e.g., "Click the green swatch in the color grid"). GroundNext receives these commands along with the current screenshot and outputs (u, v) coordinates. The planner never sees raw pixels for grounding -- it works purely from task context and action history.

### Why Separation is Better than Monolithic

1. **Resource efficiency:** The 3B grounder runs locally/cheaply while o3 handles complex planning. GroundNext-3B (50.6 on OSWorld-Verified) matches JEDI-7B (51.0) at less than half the parameters.

2. **Specialization:** Grounding is a perception task (find this element in pixels); planning is a reasoning task (what to do next). Different model architectures excel at each.

3. **Practical deployment:** A 3B grounder fits on edge devices. The paper explicitly notes "significant practical utility for real-world, resource-constrained systems."

4. **Evidence of superiority:**
   - GroundNext-3B + o3: **50.6** overall on OSWorld-Verified
   - Monolithic OpenCUA-72B: **46.1**
   - Monolithic Claude-4-Sonnet: **41.4**
   - Monolithic UI-TARS-1.5-7B: **29.6**
   - The 3B grounder + frontier planner beats monolithic models 20-70x its size

5. **Composability:** You can upgrade the planner independently of the grounder, and vice versa. As better planners emerge, the grounder's value compounds.

### Comparison with JEDI's Agentic Setup
JEDI-7B also uses o3 as planner. With their 7B grounder, they achieve 51.0 overall. GroundNext-3B achieves 50.6 -- essentially matching at <50% parameters. GroundNext-3B wins on OS (62.5 vs 50.0), Office (47.0 vs 46.1), and Workflow (36.5 vs 35.3).

---

## 6. Limitations & Weaknesses

### Acknowledged by Authors (Section 6, Appendix F)

1. **Coverage gaps:** 87 applications "may not fully represent the diversity of desktop software, as it is biased toward commonly used applications"
2. **Static keyframes only:** "misses dynamic elements like animations and real-time updates"
3. **Annotation inconsistencies at scale:** Despite QA, human labeling introduces some inconsistencies
4. **Cost and scalability:** "the time and cost of annotation limit scalability" -- this is the elephant in the room
5. **Robustness untested:** Evaluation focuses on benchmark accuracy; robustness to "changes in distribution, new app versions, and UI updates" unexplored
6. **No end-to-end agentic testing for task completion** beyond OSWorld-Verified
7. **Simple reward function:** Authors acknowledge "more sophisticated reward functions... could lead to more substantial RL gains"
8. **Cross-domain limitations:** "falls behind on web" for ScreenSpot-v2; trained only on desktop data
9. **Limited scale and compute:** "We train models with limited scale and compute"

### Unacknowledged Weaknesses

1. **Human demonstration cost:** They partnered with a professional labeling company with ~70 annotators. The cost per annotated screenshot is not disclosed, but at 60-90 minutes per task and 10,000+ tasks, this is an enormous investment. The paper does not discuss whether this approach is reproducible for organizations without such resources.

2. **Instruction generation dependency on Qwen2.5-VL-72B:** The quality of their instruction-tuning data depends on a proprietary/large model for generating functional and visual descriptions. This creates a hidden dependency.

3. **UI-Vision overlap:** They acknowledge UI-Vision "overlaps with our dataset in platform coverage" and treat it as in-domain. The massive UI-Vision gains (+39.5 points over JEDI-3B) may partly reflect this overlap rather than pure quality advantage.

4. **Deduplication aggressiveness:** Using "strict thresholds" in pHash deduplication "may remove some valid cases" -- this could bias the training set toward visually distinct elements while underrepresenting common but important repeated UI patterns.

5. **Open-source software bias:** All 87 applications are open-source. While they argue these mirror closed-source UIs, the gap between LibreOffice and Microsoft Office (or GIMP and Photoshop) is non-trivial in terms of UI density, polish, and element styling.

6. **No ablation on annotation density:** They show 64 elements/screenshot beats 7 elements/screenshot, but they never test what happens at 32 or 16 elements/screenshot. The quality-vs-quantity argument would be strengthened by showing the marginal value of denser annotation.

---

## 7. Key Figures/Tables

### Table 1: Dataset Comparison (Section 2, p.3)
The most important table in the paper. Compares GroundCUA against 10 other grounding datasets across dimensions: human annotation (H), desktop coverage (Desk), element count, screenshot count, resolution range, average element area, average elements per screen, and license permissiveness. **GroundCUA's standout numbers: 64.1 avg elements/screen (3-9x higher than all others), 0.13% avg element area (smallest = finest-grained), and the only dataset with both human annotations and full desktop coverage.**

### Table 4: Agentic Performance on OSWorld-Verified (Section 5.3, p.9)
Demonstrates the practical payoff of the grounder+planner architecture. Shows GroundNext-3B + o3 (50.6) matching or beating models up to 72B parameters. This is the table that makes the practical argument for small specialized grounders. Categories broken down: OS, Office, Daily, Pro, Workflow.

### Figure 3: SFT Quality Comparison + RL Gain Analysis (Section 5.1-5.2, p.8)
Bar chart showing mean SFT scores when training the same base model on 100K samples from each dataset, with RL gains overlaid. This is the cleanest evidence for the quality-over-quantity thesis. GroundCUA has highest SFT average AND smallest RL gain, supporting the interpretation that its SFT data already captures maximal signal.

### Figure 5: Resolution and Bounding Box Distribution Comparison (Appendix A.4, p.18-19)
Two plots comparing GroundCUA against UGround, Aguvis, OS-Atlas, and JEDI. Left: pixel distribution showing GroundCUA spans a much wider and higher resolution range. Right: log-scale bounding box area distribution showing GroundCUA's median element size is significantly smaller than all competitors. Visually demonstrates why GroundCUA captures fine-grained desktop elements that others miss.

---

## 8. Connection to Other Papers

### vs. JEDI (Scaling Computer-Use Grounding)
GroundCUA **directly challenges JEDI's scaling hypothesis.** JEDI argues that grounding can be improved by scaling synthetic data through UI decomposition and synthesis (4M elements, 575K screenshots, 9M training samples). GroundCUA demonstrates that 700K high-quality human-annotated samples beat 9M synthetic samples:
- On every benchmark at both 3B and 7B scales
- In the controlled 100K head-to-head comparison
- In agentic performance (50.6 vs 51.0 with a model half the size)

JEDI's synthetic pipeline generates simplified screens with ~7 elements per screenshot. GroundCUA's real screens have ~64 elements. The paper argues this sparsity means JEDI misses the dense, overlapping, visually-similar elements that make desktop grounding hard.

### vs. OpenCUA
GroundCUA **complements OpenCUA** rather than competing with it. OpenCUA is an end-to-end agentic framework; GroundCUA focuses purely on the grounding component. In Table 4, GroundNext-3B + o3 (50.6) significantly outperforms OpenCUA-A3B (17.7), OpenCUA-7B (27.0), and OpenCUA-72B (46.1). This suggests OpenCUA's planning may be strong, but its grounding is weak -- exactly the gap GroundCUA fills. A natural combination would be OpenCUA's planning with GroundNext's grounding.

### vs. OS-Atlas
OS-Atlas uses accessibility-tree traversal for annotations, which GroundCUA argues is "often incomplete or inconsistent, leading to missing or imprecise element labels." OS-Atlas has 14.5M elements across 1.85M screenshots but only 7.8 elements per screen and 0.53% avg element area. In the 100K controlled comparison, GroundCUA beats OS-Atlas by ~10 points.

### vs. AutoWebWorld / InfiniteWeb
GroundCUA's environment focus is fundamentally different. AutoWebWorld and InfiniteWeb generate synthetic web environments for training; GroundCUA captures real desktop environments via human demonstrations. Key contrasts:
- **Domain:** Desktop (87 apps) vs Web (synthetic websites)
- **Data source:** Human demonstrations vs procedural generation
- **Element types:** Dense desktop UIs with icons, toolbars, context menus vs web forms, navigation, text
- **Resolution:** Up to 7MP desktop screenshots vs standard web viewport sizes
- GroundCUA's cross-platform results show decent web generalization despite training only on desktop, suggesting desktop-trained grounders may transfer to web better than expected

### vs. GUI-R1, GUI-G2, InfiGUI-G1 (RL-based approaches)
These papers apply DeepSeek-R1-style RL to grounding. GroundCUA shows that **good SFT data reduces the need for sophisticated RL.** GroundNext-3B (SFT only, no RL) at 66.4 avg already beats all RL-tuned 3B baselines (best: InfiGUI-G1-3B at 56.3). The RL stage adds only +2.0 points on top, while these RL methods get +5-15 points from RL because their SFT starting points are weaker.

---

## 9. Connection to Practical CUA Building (Capture-Clone-Crawl-Train Pipeline)

### Demonstration Quality Insights

GroundCUA validates a key intuition for the capture-clone-crawl-train pipeline: **the quality and density of annotations per captured state matters more than the number of captured states.**

Specific parallels:
1. **Keyframe extraction strategy:** GroundCUA extracts keyframes "immediately before a user action that would trigger a change." This is analogous to capturing DOM snapshots at interaction points in the browser extension pipeline. The lesson: **capture at action boundaries, not at fixed time intervals.**

2. **Dense annotation > sparse annotation:** At 64 elements per screenshot vs JEDI's 7, GroundCUA proves that annotating (nearly) every visible element creates dramatically better training signal. For the clone pipeline, this suggests that **full DOM tree extraction (which naturally captures all elements) is inherently higher quality than selective element extraction** -- the pipeline's extract-dom.js approach of walking the full DOM tree and shadow roots is exactly right.

3. **Element-level metadata:** GroundCUA annotates each element with name, text, category, and bounding box. The clone pipeline's PropertySpec (bounding boxes, computed styles, DOM structure) provides even richer per-element metadata. This is a natural advantage.

### Annotation Density Lessons

- GroundCUA's **0.13% average element area** indicates the critical importance of capturing small UI elements (icons, toolbar buttons, controls). The pipeline's extract-dom.js recursive DOM walking + shadow root traversal captures these; the key is that the **generated training data must reference them.**
- The **3 instruction types** (direct, functional, spatial) map directly to how a CUA would need to interact with cloned websites: by element text (direct), by intended action (functional), and by layout position (spatial).
- For generating training instructions from captured DOM data, GroundCUA's approach of using a large VLM (Qwen2.5-VL-72B) to generate diverse instructions from annotated screenshots + bounding boxes could be directly applied to the pipeline's captured screenshots + DOM-extracted bounding boxes.

### Grounder Training Implications

1. **Resolution matters:** GroundCUA's wide resolution range (0.39-7.0 MP) and the model's ability to handle varying resolutions suggests training data should preserve original viewport resolutions rather than normalizing to a standard size.

2. **Deduplication is important but dangerous:** GroundCUA deduplicates via pHash on element crops. The clone pipeline should consider similar deduplication when generating training data from crawled pages, but preserve enough repeated elements (navigation bars, common buttons) to avoid distribution gaps.

3. **Open-source software mirrors closed-source:** GroundCUA's finding that LibreOffice-trained models generalize to Office Suite benchmarks suggests that **cloned website training data can generalize beyond the specific sites crawled**, especially when capturing diverse UI patterns.

4. **SFT data composition:** 50% direct + 35% functional + 15% spatial instructions proved optimal. For a web CUA, the functional instruction ratio might need to be higher since web interactions are more action-oriented.

5. **RL with 10K samples is sufficient** when SFT data is high quality. This dramatically reduces the RL data collection burden for the pipeline.

### Specific Pipeline Applications

- **extract-dom.js bounding boxes** are directly analogous to GroundCUA's human annotations. The pipeline already captures what GroundCUA spent significant human effort creating -- a potential efficiency advantage.
- **State-diff.ts** for tracking UI state changes across rrweb snapshots parallels GroundCUA's keyframe extraction at action boundaries.
- **The omni-tree structure** provides the dense per-element metadata (bounding boxes, styles, hierarchy) that GroundCUA identifies as the key quality differentiator.
- **Transform-fidelity.ts** scroll-aware viewport matching is relevant because GroundCUA's bounding boxes are viewport-relative (from screenshots), similar to the GT bboxes from getBoundingClientRect in rrweb replay.

---

## 10. What's Missing / Open Questions

1. **Cost analysis:** What does it cost to annotate 56K screenshots with 3.56M elements? Is this reproducible outside a well-funded research lab? The paper is silent on economics.

2. **Annotation density ablation:** They never test the marginal value of annotation density. Is 64 elements/screen the right number? Would 30 elements/screen achieve 90% of the gains?

3. **Dynamic UI handling:** Keyframe-only annotation misses hover states, animations, transitions, loading states, drag operations. These are critical for real CUA deployment.

4. **Multi-step grounding:** The grounding task is single-step (one instruction -> one click). Real tasks require sequential grounding where context from previous actions matters.

5. **Error compounding in agentic setting:** The paper reports agentic results but doesn't analyze how grounding errors compound across multi-step tasks. What's the per-step accuracy needed for 90% task completion?

6. **Web and mobile gaps:** GroundNext "falls behind on web" for ScreenSpot-v2. How much web/mobile data would close this gap without degrading desktop performance?

7. **Instruction quality sensitivity:** How much of the performance comes from the instruction generation (Qwen2.5-VL-72B prompting) vs the raw annotations? What if you used a weaker model for instruction generation?

8. **Temporal context:** Does showing previous screenshots (action history) improve grounding? The current setup is purely single-screenshot.

9. **Generalization to unseen applications:** Performance on applications not in the 87 is not systematically evaluated. How does the model handle a completely novel desktop application?

10. **Comparison with DOM-based approaches:** The paper focuses on pixel-only grounding. How does this compare to approaches that combine pixel + DOM information (like the capture pipeline provides)?

11. **Reward function design space:** They acknowledge their 6-level reward is simple. What gains are possible with element-type-aware rewards (e.g., different penalties for missing icons vs text fields)?

12. **Data freshness:** Desktop applications update their UIs frequently. How quickly does grounding performance degrade as applications evolve?

13. **Planner dependency:** The agentic results depend entirely on o3. How sensitive is performance to planner quality? Would a weaker/cheaper planner (e.g., GPT-4o) with the same grounder still outperform monolithic approaches?

14. **End-to-end training signal:** Could the grounder be trained end-to-end on task completion rather than element-level accuracy? The paper only trains on point-in-box accuracy.
