# The CUA Challenge: 0 → 1

> *"We honestly didn't think it would work."*

You've been given a repo, five research papers, and access to Claude.

Your job is to go from zero to one — to train an agent that can navigate a website, evaluate whether it actually learned anything, and explain what happened.

You probably don't know how to do this yet. That's the point.

---

## What's In This Repo

```
jetblue-v3/     A cloned React replica of a real booking website
crawler.js      Crawls the clone and builds a state graph of every reachable screen
env.py          A fast training environment that reads the state graph
eval/           A pre-built eval harness — runs tasks, measures success
papers/         Five research papers on CUA training
```

This is everything you need. You don't need access to any external codebase.

---

## The Rules

**Use Claude aggressively.** This assessment is not testing what you already know about reinforcement learning, vision-language models, or browser automation. It's testing whether you can navigate deep unfamiliarity — whether you ask good questions, build correct mental models quickly, and keep moving when things break.

The human still has to steer. Claude will not know what question to ask next. That's you.

There is no prize for suffering through this alone.

---

## Milestone 1 — The Papers

In `papers/` you'll find five PDFs. They form a deliberate arc:

| File | What it argues |
|------|---------------|
| `scaling-cua-grounding.pdf` | Why synthetic training data works — and how far it scales |
| `autowebworld.pdf` | How cloned/synthesized websites transfer to real-world performance, even when imperfect |
| `infiniteweb.pdf` | How to design and generate synthetic web training environments at scale |
| `opencua.pdf` | A complete open-source blueprint for training CUA agents end-to-end |
| `groundcua.pdf` | How grounding — mapping instructions to UI elements — is trained and why it matters |

You are not expected to read all five cover-to-cover. You are expected to *understand* all five.

**Use Claude to do it.** Feed it pages. Ask it to explain figures. Ask it what the paper assumes you already know. Ask it how the papers connect to the code sitting next to them. Ask it what the authors would say is the weakest part of their own work.

The skill being assessed here is not reading comprehension. It's knowing what to ask, and knowing when you actually understand something versus when you just recognize the words.

**Deliverable:** A one-page (max) synthesis. Not a summary of each paper — a synthesis. What do these five papers collectively argue about how you build something that works? What tensions exist between them? Where does this repo fit in that landscape?

---

## Milestone 2 — The Environment

Before training anything, you need a working environment to train against.

Your job is to get `crawler.js` to run against the `jetblue-v3` clone and produce a state graph. This state graph is the foundation everything else builds on — it maps every reachable screen in the booking flow, what actions are available on each screen, and where each action leads.

Once you have it, run the pre-built eval harness in `eval/` to establish a baseline. The eval harness is already wired up — your job is to understand what it's doing, get it running, and produce a baseline score.

Ask Claude what a state graph is and why it exists. Ask it why you'd want one instead of just running a live browser during training. The answer to that question is the architectural insight that makes this whole system work.

**Deliverable:** A `state_graph.json` in the appropriate location, and eval harness output showing a baseline score (even a random policy baseline counts).

---

## Milestone 3 — Train Something

You have an environment (`env.py`), a state graph, and a reward signal. Now build a training loop.

The papers, particularly `opencua.pdf`, describe the approach. The environment interface in `env.py` is your starting point. The training method is GRPO — Group Relative Policy Optimization — applied to a vision-language model. Claude can explain what that means and help you implement it.

The bar is not convergence. The bar is:

- A training loop runs without crashing
- You have a reward curve (even a flat or noisy one)
- You can run the eval harness against your trained policy and compare it to the baseline

The agent will probably not be good. That's fine. Understanding *why* it's not good — and what you'd do with more time — is the actual work.

**Deliverable:** Training logs or a reward curve. Eval harness results before and after training, side by side.

---

## Milestone 4 — Postmortem

Write 500–1000 words. Not a technical report. A story.

Cover:

- What confused you most, and the specific question you asked Claude that finally unlocked it
- What the papers said, and where the reality of the code diverged from the theory
- What your eval results showed — did training help? By how much? Why do you think that is?
- What you would do with another week

Be honest. The most interesting postmortems are from people who got stuck, not people who found it easy.

**Deliverable:** The postmortem as a markdown file.

---

## What We're Evaluating

Not whether it converged.

- **Navigational instinct** — can you orient in an unfamiliar codebase without someone walking you through it?
- **Question quality** — the questions you asked Claude reveal how you think. Vague questions produce vague answers. Sharp questions unlock real progress.
- **The synthesis** — can you connect what the papers say to what the code does? Theory and implementation are different things. Noticing the gap is the skill.
- **Honest articulation** — can you explain what happened, and what you'd do differently, in plain language?

---

## Getting Stuck

You will get stuck. When you are:

Describe the problem to Claude as precisely as you can. Paste the error. Paste the relevant code. Ask what's happening, then ask *why*, then ask what you'd need to understand to fix it yourself next time.

Getting unstuck is not cheating. Getting unstuck is the job.

---

*Good luck. Ask good questions.*
