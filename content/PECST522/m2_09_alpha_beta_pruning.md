---
id: m2_09_alpha_beta_pruning
courseCode: PECST522
module: 2
sequence: 9
title: 'Alpha-Beta Pruning: Same Move, Less Work'
difficulty: beginner
estimatedMinutes: 7
learningObjectives:
  - Cut branches with the alpha-beta window mechanics
  - Prove identical minimax values on every input
  - Double effective depth with best-first move ordering
concepts:
  - alpha-beta pruning
  - move ordering
prerequisites:
  - m2_08_games_minimax_optimal_play
examRelevance: high
tags:
  - search
  - game-playing
---
# Alpha-Beta Pruning: Same Move, Less Work

**Problem: minimax prices branches whose verdict is already sealed. Can we skip them with zero change to the move? By the end you can run the alpha-beta window by hand, prove exactness, and price ordering.**

<a id="start-zero"></a>
## 1. Start From Zero: The Already-Beaten Escape Hatch

While exploring a MIN branch, the moment it proves worse-or-equal to an option MAX already holds, remaining leaves cannot change the decision — stop looking. Best ordering (strong moves first) seals verdicts fastest.

**Definitions:** `alpha` = best value MAX is assured so far (only rises along the path). `beta` = best value MIN is assured so far (only falls). The pair `[alpha, beta]` is the window. A **beta-cutoff** at a MIN node fires when its running minimum `<= alpha` (MAX already holds better elsewhere). An **alpha-cutoff** at a MAX node fires when its running maximum `>= beta`. Bounds come from already-explored siblings, so left-to-right order decides everything.

::: callout-intuition Core Mental Model: Already-Beaten Escape Hatch
Feel "quit proven-losers" here, then drop the image; window updates plus the cutoff inequality below are the technical content.
:::

::: anim alphabeta-cut Two Leaves Never Born
The left branch sets alpha = 3; the right branch's first leaf (2) falls below it and the remaining two leaves are cut — identical move, one-third less work.
:::

**Tiny beginner example:** MAX holds 5 from the left branch (alpha = 5). Right MIN branch opens with 4 — already below 5, so its unborn siblings cannot rescue it. Cut.

::: toggle What are `alpha`, `beta`, `window`, `beta-cutoff`, `alpha-cutoff`?
Alpha = best value MAX is assured so far (starts −∞, only rises — a growing floor). Beta = best value MIN is assured so far (starts +∞, only falls — a shrinking ceiling). Window [alpha, beta] = the relevance interval passed down the current path (values outside cannot affect decisions above). Beta-cutoff (at MIN): running minimum ≤ inherited alpha → prune rest (MAX already holds better elsewhere). Alpha-cutoff (at MAX): running maximum ≥ inherited beta → prune rest (MIN already holds better elsewhere). Tiny check above: running min 4 ≤ alpha 5 fires the beta-cutoff — siblings unborn, decision unchanged.
:::

::: toggle Node-by-node trace with A, B, C, D labels and live bounds
Tree: MAX root R over MIN A (leaves 3, 12, 8) and MIN B (leaves 2, 4, 6), left-to-right. A inherits (α=−∞, β=+∞): leaf 3 → running min 3; leaves 12, 8 cannot lower it → A returns 3 (fully evaluated — first branch never cuts). R updates α = max(−∞, 3) = 3. B inherits (α=3, β=+∞): leaf 2 → running min 2 ≤ α=3 → beta-cutoff fires; leaves 4, 6 never generated (label them cut, not evaluated). B returns ≤ 2. R = max(3, ≤2) = 3 — identical to minimax, 4 leaves instead of 6. Reversed order (B first): α still −∞ at B → no cutoff anywhere (bounds arrive too late) — ordering is half the topic.
:::

<a id="basics"></a>
## 2. Basic Layer: Window Mechanics

**Data/state:** current path's alpha/beta plus running node value. **Goal:** same minimax value with fewer leaf evaluations.

**Procedure (steps):** Step 1: pass (alpha, beta) down (root starts -infinity, +infinity). Step 2: at MIN, track running min; the moment it <= alpha, prune the rest (beta-cutoff) and return the min. Step 3: at MAX, track running max; the moment it >= beta, prune the rest (alpha-cutoff) and return the max. Step 4: on return, tighten the parent's window (MAX raises alpha, MIN lowers beta).

**Cutoff direction trap:** MIN nodes cut using the *inherited* alpha, not their own running minimum alone. Comparing against the wrong bound prunes branches that could still matter.

<a id="formal-model"></a>
## 3. Formal Layer: Ordering Economics and Exactness Proof

**Ordering economics (qualified):** perfect order (best moves first): `O(b^(m/2))` — effective depth doubled. Random order: about `O(b^(3m/4))` — good. Worst order (worst first): `O(b^m)` — zero cuts plus overhead. Iterative deepening feeds ordering almost free (shallow results sort deep search).

::: callout-formula KTU Formula Vault: Alpha-Beta
Alpha rises (MAX assured). Beta falls (MIN assured). Cut when beta <= alpha. Same value as minimax on every input, always. Best order `O(b^(m/2))`, worst `O(b^m)`.
:::

::: callout-pitfall Pruning the Best Move
Alpha-beta prunes only branches proven irrelevant to the root decision. "Risks missing the optimum for speed" confuses exact pruning with cutoff-and-evaluate approximations (depth caps). Exactness here is by proof: cutoff inequality certifies irrelevance, not luck.
:::

**Full trace on the minimax tree (MAX root over MIN A [3,12,8], MIN B [2,4,6], left to right):** A inherits alpha -inf: leaf 3 sets running min 3; 12 and 8 cannot lower it — A returns 3. Root alpha rises to 3. B inherits alpha 3: first leaf 2 sets running min 2 <= 3 — cutoff; leaves 4, 6 never generated. B returns at most 2. Root = max(3,2) = 3. Four leaves evaluated instead of 6. Exploring B first would cut nothing (alpha still -inf) — ordering is half the topic.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Exact pruning vs. cutoff approximation | Proven-irrelevant skip (same move) vs. depth-cap guess (move may change) |
| Best-first vs. worst-first order | Tight windows early (max cuts) vs. bounds arrive too late (no cuts, same value) |
| Alpha vs. beta | MAX-assured lower bound vs. MIN-assured upper bound |

**Watch out:** (1) Cutoffs need already-explored siblings — first branch never cuts. (2) Returned values of cut branches are bounds ("at most"), not exact — sufficient for the parent, never quoted as node values. (3) Same value on all inputs does not mean same speed.

**Limitations:** worst case still `O(b^m)`; needs move ordering to pay; exactness assumes exact minimax underneath (with evaluation cutoffs, guarantees become approximate). Transposition tables and quiescence handling (beyond syllabus) address repeats and horizon effects.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Q1: Cutoff Arithmetic
MIN node, inherited alpha = 5, children evaluated so far: 7. Next child returns 4. Action?
(A) Continue, 4 may still improve MIN below 7
(*B) Prune the rest — running min is now 4 <= alpha = 5, so MAX already holds 5 elsewhere and this branch cannot be chosen regardless of remaining leaves
(C) Raise alpha to 7
(D) Reorder the evaluated children
::: explanation
The window test fires on running minimum versus inherited alpha. Waiting for all children reverts to minimax — the cutoff exists to skip that labour.
:::

::: quiz Q2: Ordering Economics
Same tree, 6 leaves, worst-first order. Evaluations?
(A) 3, ordering never matters
(*B) All 6 — bounds arrive too late to cut anything (every branch looks best until refuted), so worst order pays full minimax price with alpha-beta overhead added
(C) 0, everything prunes
(D) 6 but a different move results
::: explanation
Cuts need early good news. Worst-first explores doomed branches fully before learning better; value stays 3 either way.
:::

::: quiz Q3: Exactness Guarantee
"Alpha-beta may change the chosen move." Verdict?
(A) True under time pressure
(*B) False — pruned branches are proven unable to affect the root value, so the returned move equals minimax's on every input; speed differs, decisions never
(C) True with iterative deepening
(D) True past depth 4
::: explanation
Beta <= alpha is a proof of irrelevance, not a heuristic guess. Identical values on all inputs is the theorem; approximations live in cutoff play, one topic over.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: alpha/beta meanings plus cutoff inequality. 7 marks: full 4-of-6 trace with bound updates plus ordering economics.
:::

**Recap facts examiners reward:** alpha/beta directions; beta <= alpha trigger; 4-vs-6 count; same-move theorem; `O(b^(m/2))` best / `O(b^m)` worst with ordering cause.

### Sample 3-Mark Question
**Q: Define alpha, beta, and the cutoff condition.**

**Model Answer:** Alpha: MAX-assured best (rises). Beta: MIN-assured best (falls). Cut remaining children when beta <= alpha at the node — proven irrelevant to the root.

### Sample 7-Mark Question
**Q: Trace alpha-beta on the 3-vs-2 tree and explain the ordering role.**

**Model Answer:** A returns 3 raising root alpha to 3; B's first leaf 2 triggers cutoff, pruning 4 and 6; root 3 with 4 evaluations. B-first order cuts nothing since alpha starts -inf — best-first ordering doubles effective depth, worst-first pays full price.
:::
