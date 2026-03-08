# Postmortem

## The questions that drove the project

Three debugging questions cracked open the major blockers. Each exposed a gap between what the system reported and what actually happened.

**"Why does the crawler find only 15 states when there should be hundreds?"**

The clone has seven booking steps (search → results → cart → signin → traveler → seats → extras). The crawler stopped at traveler — 15 states, 85 transitions, no error. I traced through `crawler.js`'s `performAction` function and found it filters annotations by `a.interactive`. The annotations in `main.tsx` had `id`, `label`, `category`, and `route`, but not `interactive` or `action`. The filter returned an empty array. The crawler had nothing to click. Adding those fields was a one-line-per-annotation fix.

**"Where is the 'Next' button actually located on the page?"**

After fixing the annotations, the crawler still couldn't reach seats. Every click on the "Next: Seats" button recorded a self-transition — same state to same state, no error. I checked the button's bounding box: y=1499. The viewport was 900px. Playwright clicked at the correct coordinates, but those coordinates pointed to empty space 600px below the visible window. No exception. The fix: check if the target is below the viewport, scroll it into view, re-query the bbox (scroll changes coordinates), then click. States went from 15 to 169.

**"Why does 98% training accuracy drop to 75% on live eval?"**

The trained policy succeeds on all four tasks in the state graph environment. On the live browser, it fails on traveler→seats. The state graph doesn't model viewports — all annotations are always accessible regardless of scroll position. The policy learned to select annotation index 7 (the "Next: Seats" button) and it's correct. But in the live browser, that button is at y=1499, the eval bridge clicks at the bbox center, and the click misses. The same viewport problem, in a different part of the codebase. The scroll fix from `crawler.js` applies directly — I just didn't carry it over to `eval/run_trained.py`.

## What these questions reveal

All three are about silent failures. The crawler doesn't crash when annotations lack `interactive` — it runs with an empty work queue and exits normally. Playwright doesn't throw when you click below the viewport — it clicks into nothing. The training loop doesn't detect when the eval environment diverges from the training environment — it reports 98% and moves on.

The common structure: correct code producing wrong results because of an unmodeled assumption. The annotations have the right fields for the clone but not for the crawler. The bounding box reports correct coordinates in a space that extends past the visible window. The training environment models the right transitions but not viewport visibility.

This is the same structure as every sim-to-real gap in robotics. The simulation is correct in every dimension you modeled, and wrong in the one you didn't think to model.

## Design decisions that mattered

**Entropy coefficient: 0.05.** I asked: "What happens to GRPO when the group has zero variance?" If entropy collapses and all rollouts produce identical returns, the normalizing denominator hits epsilon, advantages become meaningless, and the policy freezes. A coefficient of 0.01 would be too low — the policy would lock in before exploring enough. Using 0.05 held entropy at ~1.0 (out of max 2.2 for 9 actions). The policy became selective without collapsing.

This matters because GRPO's simplicity is also its vulnerability. It skips the value network — the group mean is the baseline. That only works when group members produce different returns. The entropy bonus is the load-bearing mechanism that prevents degenerate groups.

**BFS-distance reward shaping vs binary success/failure.** The environment awards +0.1 for each BFS edge closer to the goal, -0.01 per step, and +1.0 for reaching the goal. This gives gradient signal for partial progress. Without it, the agent gets nothing until it stumbles into the goal state, which makes GRPO's group normalization useless for the harder tasks.

## Results

GRPO converged in ~10 epochs, ~10 seconds total. Live eval against the browser: 3/4 tasks pass (75% vs 0% random baseline). search→results in 2 steps, results→cart in 11, cart→traveler in 5. traveler→seats: fail at 20 steps.

## What I'd do next

**Fix the eval bridge.** Add the same scroll-into-view logic from `crawler.js` to `eval/run_trained.py`. This is the obvious one — it likely makes it 4/4.

**Dense checkpoint rewards.** The traveler form has ~10 fields. Currently the agent gets nothing until it reaches seats — fill nine fields correctly and miss the tenth, same penalty as random clicking. Each filled field should be a checkpoint worth +0.05. The `BookingState` already tracks every field. This is InfiniteWeb's core finding: dense checkpoints yield 4.4x more trainable tasks than binary rewards.

**A real vision model on real screenshots.** The CNN sees 84x84 synthetic colored rectangles. It's learning a state-ID classifier, not visual reasoning. The papers converge: a 3B vision-language model paired with a frontier planner outperforms monolithic 72B models. But that requires GPU infrastructure I didn't have for this assessment.
