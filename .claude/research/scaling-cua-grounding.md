# Scaling Computer-Use Grounding via UI Decomposition and Synthesis

**Paper:** "Scaling Computer-Use Grounding via User Interface Decomposition and Synthesis"
**Authors:** Tianbao Xie, Jiaqi Deng, Xiaochuan Li, Junlin Yang, et al. (University of Hong Kong + Salesforce AI Research)
**Venue:** NeurIPS 2025 Track on Datasets and Benchmarks
**URL:** https://osworld-grounding.github.io

---

## 1. Core Thesis

GUI grounding -- the ability to map natural language instructions to specific actions on graphical user interfaces -- is the critical bottleneck in computer use agent (CUA) development. Current benchmarks and datasets oversimplify grounding as short referring expressions (e.g., "click the search icon"), failing to capture real-world complexity that requires software commonsense, layout understanding, and fine-grained manipulation. The authors argue that by **decomposing UI grounding into constituent element types** (icons, components, layouts) and **synthesizing training data for each type at scale** (4M examples), they can train small models (3B-7B) that achieve state-of-the-art grounding and, when plugged into a planner+grounder architecture, dramatically improve end-to-end agent performance (23% to 51% on OSWorld).

---

## 2. Key Quantitative Claims

### Dataset Scale
- **JEDI dataset:** 4 million newly synthesized examples (Section 2.2, Table 9)
- **OSWorld-G benchmark:** 564 finely annotated samples, 32 UI element types, ~0.5 human-hours per annotation (Section 2.1.1)
- **Refusal data:** 2.6 million mismatched instruction-screenshot pairs for infeasible action rejection (Section 2.2.5)
- Icon data: 267K captioning images, 202K grounding images (Table 9)
- Component data: ~89K images from Material UI, Ant Design, Chakra, Mantine libraries (Table 9, Table 11)
- Layout data: 8K images from Figma designs + OS rollouts (Table 9, Tables 12-13)
- Previous datasets integrated (AGUVIS++): ~684K additional images (Table 9)

### Grounding Benchmarks
- **ScreenSpot-v2** (Table 2): JEDI-7B achieves 91.7% overall avg, surpassing UI-TARS-7B (91.6%) and matching UI-TARS-72B (90.3%)
- **ScreenSpot-Pro** (Table 3): JEDI-7B achieves 39.5% overall avg vs. UI-TARS-72B at 38.1% and Operator at 36.6%
- **OSWorld-G** (Table 5): JEDI-7B achieves 54.1% overall; JEDI-3B at 50.9%. Best prior: Seed1.5-VL at 62.9%, UI-TARS-72B at 57.1%
- **UI-Vision** (Table 4): JEDI-7B achieves 24.8% final avg vs. UI-TARS-72B at 25.5%

### Agentic Benchmarks (Table 6)
- **OSWorld:** GPT-4o + JEDI-7B = 27.0% (+/- 1.81) avg SR; o3 + JEDI-7B = **51.0%** SR
- **WindowsAgentArena:** GPT-4o + JEDI-7B = 33.7% (+/- 0.82) avg SR
- Baseline GPT-4o alone = 5.0% on OSWorld; GPT-4o + Aguvis-72B = 17.0%
- **The jump from 23% (baseline) to 51% (o3 + JEDI-7B) represents a 2.2x improvement** purely from better grounding
- Claude 4 Sonnet (monolithic) = 43.9% on OSWorld; Operator = 32.6%

### Training Compute
- 3B model: ~20 hours on 64 NVIDIA H100 GPUs (128 CPU cores, 512GB memory)
- 7B model: ~30 hours on the same cluster (Section 3)
- Backbone: Qwen2.5-VL, max pixel limit ~1080p

### Data Scaling (Section 4.2, Figure 6)
- Performance continues to improve from 10% to 100% of data with **no sign of saturation**
- Single data type scaling causes fluctuations; mixed data types produce stable improvements

---

## 3. Methodology

### UI Decomposition (the "JEDI" approach)
The core insight is that GUIs can be decomposed into three hierarchical levels of visual elements, and training data should be synthesized separately for each:

1. **Icons** (Section 2.2.1): Compact visual symbols that convey functionality
   - Sources: GitHub repositories, specialized icon websites (crawled), reverse-engineered from executables (Windows, macOS, Ubuntu DLLs/apps using tools like IconsExtract)
   - LLMs generate detailed descriptions; training scenarios involve identifying icons from text descriptions
   - Covers flat design, fluent design, skeuomorphism paradigms

2. **Components** (Section 2.2.2): Functional units composed of icons, UI elements, and text
   - **Code-and-rendering pipeline:** Take production UI component libraries (Material UI, Ant Design, Chakra UI, Mantine), use LLMs to synthesize functional cases from example code, render in React, extract metadata (element position tree, component names, coordinates)
   - **Real-world augmentation:** Screenshots from real websites/apps, HTML parsing, python-pptx for slides
   - Table 11 lists 200+ component types across 4 libraries with ~60K+ total images

3. **Layouts** (Section 2.2.3): Spatial arrangement of elements at application/OS level
   - **Figma prototype designs:** Export production app designs (VSCode, Zoom, MS365 templates) via API, preserving hierarchical relationships and positional data
   - **Real-world OS screenshots:** Agent rollout data from OSWorld/WindowsAgentArena, then OmniParser-v2 for bounding box detection
   - ~5K app layout images + ~3K OS layout images (Tables 12-13)

### Data Processing (Section 2.2.4)
- VisualSketchpad-like prompting with GPT-4o and Claude to generate enriched annotations from screenshots + metadata
- Two complementary formats:
  - **Grounding format:** Screenshot + instruction --> predict action/bounding box
  - **Description format:** Screenshot + bounding box --> describe the element
- Multi-turn conversations compressed into single conversations for training efficiency

### Refusal Data (Section 2.2.5)
- Mismatched instructions with unrelated screenshots, yielding 2.6M examples
- Only 5% sampled during training (Table 9)
- Manually inspected subset to verify truly infeasible

### Model Architecture
- **Backbone:** Qwen2.5-VL (3B and 7B variants)
- **Training:** Supervised fine-tuning (SFT) on JEDI dataset
- No specialized architecture changes -- pure data-driven improvement
- Output format: `<tool_call>{"name": "computer_use", "arguments": {"action": "left_click", "coordinate": [x, y]}}</tool_call>`

---

## 4. The Pipeline: How Grounding Fits into a CUA System

The paper explicitly describes a **planner + grounder architecture** (Section 3.2):

```
High-level instruction (user task)
        |
        v
  [Planner Model] (GPT-4o, o3, or similar foundation model)
    - Receives high-level instruction
    - At each step, observes current screenshot + action history
    - Predicts next low-level natural language instruction
        |
        v
  [Grounder Model] (JEDI-3B or JEDI-7B)
    - Takes the low-level instruction + current screenshot
    - Predicts concrete action with coordinates
    - Outputs: action type + (x,y) point or (x,y,w,h) bounding box
        |
        v
  [Environment] (OSWorld, WindowsAgentArena, real desktop)
    - Executes the action
    - Returns next screenshot
```

Key design decisions:
- "To control for confounding variables, we do not introduce any specialized agent architecture or model scheduling" (Section 3.2)
- The planner is a general foundation model NOT specialized for computer use
- All the "computer use" capability comes from the grounder
- The system achieves SOTA by simply pairing a good reasoner (o3) with a good grounder (JEDI-7B)

---

## 5. Limitations & Weaknesses

### Author-Acknowledged Limitations (Section 7)

1. **Refusal modeling remains unsolved:** Models show limited improvement on infeasible action rejection despite dedicated refusal data. "Refusal modeling in GUI grounding remains a significant challenge, as models show limited improvement due to the inherent limitations in pretraining and the hallucination phenomenon in VLMs." On OSWorld-G, JEDI-7B scores only 7.4% on refusal (Table 5), same as JEDI-3B. Most models score 0.0% on refusal. Only Gemini-2.5-Pro (38.9%) handles refusal meaningfully.

2. **Data scaling left unexplored:** "Screen capture data can be extracted from internet images and videos by neural networks, which can further expand the dataset... Due to resource restrictions, we leave this for further scaling through industrial efforts."

3. **No autonomous traversal:** They note that the grounding model could be deployed as "human-like traversers that interact in the digital world" to collect more interaction data, but leave this for future work.

### Implicit Weaknesses

4. **Fine-grained manipulation is still the weakest capability:** Even JEDI-7B only reaches 46.9% on fine-grained manipulation (Table 5), compared to 65.9% on text matching. The gap from text matching to fine-grained ops is ~20 points.

5. **Artistic/stylized UI elements:** Failure case 13d shows the model cannot handle artistic fonts, attributed to "lack of art and design data in the current training corpus."

6. **Active vs. inactive state distinction:** Failure case 13b shows the model confusing white (active) and gray (inactive) versions of the same element.

7. **Benchmark self-selection bias:** OSWorld-G screenshots come from model rollout failures on OSWorld, which may overrepresent certain failure modes.

8. **The grounding model does NOT reason about what to do** -- it only executes. The planner (GPT-4o/o3) does all reasoning. If the planner gives a bad instruction, the grounder faithfully executes the wrong action.

9. **Desktop-only focus:** JEDI's layout data comes entirely from desktop OS environments. Mobile grounding is covered only through inherited datasets (Rico, Android).

---

## 6. Key Figures/Tables

### Figure 1 (Overview)
Shows the full taxonomy: five capability categories (text matching, element recognition, layout understanding, fine-grained manipulation, refusal) with example instructions for each. Illustrates the benchmark-dataset-model pipeline.

### Table 6 (Agentic Results -- most important table)
The headline result: Demonstrates that grounding quality directly translates to agent performance.
- GPT-4o alone: 5.0% OSWorld SR
- GPT-4o + JEDI-3B: 24.0% (+/- 1.05)
- GPT-4o + JEDI-7B: 27.0% (+/- 1.81)
- o3 + JEDI-7B: 51.0%
- For comparison: Operator 32.6%, Claude 4 Sonnet 43.9%, OpenCUA-32B 34.8%
- WindowsAgentArena: GPT-4o + JEDI-7B: 33.7% (+/- 0.82)

### Figure 6 (Data Scaling Curves)
Shows performance on ScreenSpot-v2 and OSWorld-G as training data scales from 10% to 100%. All curves are monotonically increasing with no plateau. Mixed data types (red "All" line) improve most stably. Individual data types (icon-only, component-only, layout-only) show noisier improvements.

### Figure 5 (Knowledge vs. Pure Grounding)
Compares model performance on OSWorld-G with original instructions vs. "refined" instructions that remove software knowledge requirements. Key finding: after refinement, JEDI-7B (~63.8%) matches UI-TARS-72B (~63.7%), suggesting the remaining gap is knowledge, not grounding ability.

### Table 5 (OSWorld-G Breakdown)
Shows the per-capability breakdown, revealing that text matching is easiest (67.4% for JEDI-3B), element recognition next (53.0%), layout understanding close behind (53.8%), fine-grained manipulation hardest (44.3%), and refusal essentially unsolved (7.4%).

---

## 7. Connection to Related Papers

### OpenCUA (ref [43])
- Directly compared in Table 6: OpenCUA-32B achieves 34.8% on OSWorld
- JEDI takes a complementary approach: instead of building a full CUA system, it provides a grounding module that can be plugged into any planner
- JEDI-7B + o3 (51.0%) significantly outperforms OpenCUA-32B (34.8%)
- OpenCUA likely includes its own grounding; JEDI shows that a dedicated grounding module can surpass integrated approaches

### AutoWebWorld / InfiniteWeb
- These papers focus on generating synthetic web environments for training
- JEDI's component synthesis pipeline (Section 2.2.2) is directly analogous: they render React components from Material UI/Ant Design/Chakra templates with LLM-generated functional cases
- The key difference: JEDI renders isolated components for grounding training, while AutoWebWorld/InfiniteWeb generate full websites for navigation training
- JEDI's approach validates that **synthetic UI rendering is effective for training** -- a core assumption shared by these works

### GroundCUA
- JEDI essentially IS a grounding paper for CUAs. If "GroundCUA" refers to the grounding component of CUA systems, this paper provides both the benchmark (OSWorld-G) and the dataset (JEDI) for building it
- The planner+grounder decomposition is the same architecture pattern

### UI-TARS (ref [32])
- The primary competitor. UI-TARS uses unpublished data and manual annotation
- JEDI matches or exceeds UI-TARS-72B with a 7B model on most benchmarks
- Key difference: JEDI's data is fully synthesized and open-sourced; UI-TARS's is not

### Operator (OpenAI, ref [30])
- Compared on OSWorld (32.6%) and ScreenSpot-Pro (36.6%)
- JEDI's modular approach (smaller grounder + strong planner) outperforms Operator's likely monolithic approach

---

## 8. Connection to Practical CUA Building (Capture-Clone-Crawl-Train Pipeline)

### Direct Relevance to the Concierge Pipeline

1. **Component rendering pipeline is directly reusable.** JEDI synthesizes UI components by taking production component libraries (Material UI, Ant Design), using LLMs to generate functional cases, rendering in React, and extracting metadata (coordinates, element trees). This is essentially the same as the Concierge clone generation pipeline but in reverse: Concierge captures real sites and generates React replicas, while JEDI generates React components and captures screenshots. The metadata extraction approach (rendering code --> bounding boxes --> grounding pairs) could be applied to Concierge's clones to generate training data.

2. **Clone-generated screenshots are valid grounding training data.** If your clones faithfully reproduce real UI layouts, you can generate grounding data from them by: (a) extracting all interactive element bounding boxes from the React DOM, (b) using LLMs to generate natural language instructions for each element, (c) pairing screenshot + instruction + bbox as training examples. This is exactly what JEDI does with their component pipeline.

3. **The omni-tree structure maps directly to JEDI's decomposition.** JEDI decomposes UIs into icons, components, and layouts. Your omni-tree already captures this hierarchy (individual elements with bboxes, state diffs, layout relationships). The omni-tree could serve as the "metadata" that JEDI extracts from Figma designs and React renders.

4. **BFS crawl state graphs provide layout training data.** The state graph from BFS crawling captures different application states (modals open, tabs selected, dropdowns expanded). These transitions are exactly the kind of "layout understanding" data that JEDI sources from OS rollouts and Figma designs. Each state in the graph is a screenshot with known element positions.

5. **The planner+grounder architecture is the target training objective.** The paper shows that even a 3B grounder, when paired with a strong planner, achieves SOTA. This suggests the RL training target should be the grounder specifically: train a small model on your clone-generated data to precisely execute low-level instructions.

6. **Refusal data from clone mismatches.** JEDI creates refusal training data by mismatching instructions with unrelated screenshots. Your clone pipeline naturally generates these: instructions valid for state A but shown state B's screenshot. The state graph explicitly encodes which actions are available in which states.

7. **Data scaling has not plateaued.** Figure 6 shows no saturation at 4M examples. This means more clones = more training data = better grounding, with no diminishing returns yet visible. This justifies investing in broader website coverage in the capture pipeline.

### Specific Technical Insights

- **Resolution matters:** Screen size set to 720p/1080p. Max pixel limit ~1080p for the VLM. Your clone screenshots should match these resolutions.
- **The code-and-render loop works:** Rendering UI code and extracting metadata is a valid (and the most effective) way to generate grounding data. This validates the approach of generating React replicas and harvesting training data from them.
- **Multi-turn compression:** JEDI compresses multiple query-answer pairs per screenshot into single conversations. When generating training data from clones with many interactive elements, batch them similarly.
- **VisualSketchpad prompting:** Using GPT-4o/Claude with screenshots + metadata to generate enriched annotations. Apply this to your clone screenshots: feed screenshot + omni-tree metadata to an LLM to generate natural instruction-action pairs.
- **Component libraries to train on:** Material UI, Ant Design, Chakra, Mantine -- if your clones use these, the model will have seen similar patterns. If your target sites use other design systems, you may need to add those.

---

## 9. What's Missing

### Questions This Paper Does NOT Answer

1. **How to generate grounding data from real website captures (as opposed to designed components).** JEDI's component data comes from known UI libraries with clean code. Real-world sites have custom CSS, overlapping elements, z-index complexities, and shadow DOM -- none of which are addressed.

2. **How grounding quality degrades on unseen design systems.** They test on standard benchmarks but don't measure performance on novel UI frameworks or heavily customized designs (e.g., JetBlue's custom jb-* Angular components).

3. **How to handle dynamic/animated UI elements.** Sliders, auto-complete dropdowns, drag-and-drop, and scroll-dependent elements are mentioned but the dataset doesn't cover animated transitions or timing-dependent interactions.

4. **How to train the planner.** The paper treats the planner (GPT-4o, o3) as a black box. It does not discuss how to train or fine-tune a planning model, only the grounder. For a practitioner building a full CUA, this is half the problem.

5. **How grounding interacts with state tracking.** The model operates on single screenshots with no memory. Multi-step tasks where the agent needs to remember what it already did (and where it already clicked) are handled entirely by the planner.

6. **How to handle scrolling and viewport management.** The paper does not discuss how the agent decides to scroll or how grounding works for off-screen elements. This is critical for real-world use.

7. **Cost of the LLM-based data synthesis pipeline.** They use GPT-4o and Claude extensively for annotation generation but don't report API costs. For someone replicating this at scale, this is a practical concern.

8. **How to handle overlapping or occluded elements.** Real UIs frequently have tooltips, modals, and overlapping panels. The paper does not address how grounding handles ambiguity from visual overlap.

9. **Mobile and cross-platform transfer.** The JEDI dataset is heavily desktop-focused. Whether the learned grounding transfers to mobile (different UI paradigms, touch vs. click) is not evaluated on JEDI-trained models specifically.

10. **How to integrate with accessibility trees or HTML structure.** JEDI is purely vision-based (no DOM access). Whether combining visual grounding with structural information (a11y trees, HTML) improves performance is not explored. This is directly relevant to the Concierge pipeline, which has full DOM access through rrweb recordings.

11. **RL training on top of SFT grounding.** The paper only does supervised fine-tuning. Whether RL (e.g., on success/failure signals from the environment) can further improve grounding beyond SFT is left open -- and is the logical next step for the Concierge train phase.
