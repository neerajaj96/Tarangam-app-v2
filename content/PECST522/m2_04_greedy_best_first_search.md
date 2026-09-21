---
id: m2_04_greedy_best_first_search
courseCode: PECST522
module: 2
sequence: 4
title: 'Greedy Best-First Search: Chasing the Heuristic'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Expand minimum heuristic nodes with the f-equals-h rule
  - Trace the small graph where greed goes provably wrong
  - Keep the explored set mandatory despite the speed
concepts:
  - greedy best-first search
  - heuristic expansion
prerequisites:
  - m2_03_informed_heuristic_search_and_functions
examRelevance: medium
tags:
  - search
  - greedy-search
---
# Greedy Best-First Search: Chasing the Heuristic

**Problem: what if we expand whatever looks closest to the goal and ignore cost paid so far? By the end you can run greedy best-first by hand, prove it non-optimal on four nodes, and state its incompleteness.**

<a id="start-zero"></a>
## 1. Start From Zero: The Moth and the Lamp

A moth flies toward whichever lamp looks nearest, never checking distance already flown. When the guess points true it lands fast; when optimism hides a ravine it lands expensively — or loops down a corridor that always looks promising.

**Definitions:** Greedy best-first search orders its frontier (the set of unexpanded nodes) by the heuristic alone. Evaluation function `f(n) = h(n)` where `h(n)` is the estimated remaining cost from node `n` and `f(n)` is the expansion priority. `g(n)` (paid-so-far cost) is ignored. Best-first is a family name: greedy uses `h`, UCS uses `g`, A* uses `g + h`.

::: callout-intuition Core Mental Model: Moth to the Closest Lamp
Feel "guess-only ordering" here, then drop the insect; the formula `f = h` plus the failure trace below is the examinable content.
:::

**Tiny beginner example:** from S, road to A looks 5 away, road to B looks 3 away. Greedy picks B sight unseen — never asking what S-to-A vs. S-to-B already cost.

<a id="basics"></a>
## 2. Basic Layer: Algorithm and Price

**Data/state:** frontier ordered by `h`, plus an explored set (visited states) against re-expansion loops. **Goal:** reach a goal quickly, with no optimality promise.

**Procedure (steps):** Step 1: push start with its `h`. Step 2: pop smallest-`h` node; if goal, return its path. Step 3: expand it, push successors with their `h` values. Step 4: repeat. Graph version checks the explored set before re-expanding.

**Meaning, variables, formula:** `f(n) = h(n)` only. Time and space `O(b^m)` worst case (branching `b`, max depth `m`) — like DFS, since greed can dive. **Incomplete** in infinite spaces (endless promising descent never returns). **Non-optimal** even with admissible-looking heuristics, proven below.

::: callout-formula KTU Formula Vault: Greedy
`f(n) = h(n)` only. Expand min-h. `O(b^m)` time/space worst case. Incomplete, non-optimal. Explored set still mandatory.
:::

<a id="formal-model"></a>
## 3. Formal Layer: The Four-Node Conviction

**Setup:** start S to A (`g = 1`, `h = 5`) and to B (`g = 4`, `h = 3`). A-to-goal costs 2 more; B-to-goal costs 6 more. True optimum via A: 3. Greedy path via B: 10.

**Trace:** expand S: frontier {A(h=5), B(h=3)}. Pop B (3 < 5), expand to goal with h = 0 — return S-B-G at cost 4 + 6 = 10. The `h`-gap (3 vs. 5) decided; the `g`-gap (4 vs. 1 already paid) was invisible to `f = h`. Over three times worse on four nodes.

**Reading the failure:** greed trusts `h` absolutely. Any underestimate pointing at a trap is obeyed. Optimality needs the paid bill added back — that repair is A* (`f = g + h`, next topic).

::: callout-pitfall Calling Greedy Optimal
"Greedy with an admissible heuristic is optimal" smuggles A*'s theorem onto greedy's body. Admissibility buys greedy nothing — only `g + h` ordering plus admissibility yields optimality. Memorize this trap line.
:::

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Greedy (`h`) vs. UCS (`g`) vs. A* (`g+h`) | Future-guess only vs. past-bill only vs. both (fast-fooled vs. optimal-blind vs. optimal-guided) |
| Frontier ordering vs. guarantee | Same machinery, different price tags; guarantees follow the price tag |

**Watch out:** (1) Explored set prevents loops but cannot fix wrong choices. (2) Infinite `h`-descent defeats completeness without depth bounds. (3) Ties need a stated policy; silent tie-breaking hides behaviour.

**Limitations:** no optimality under any standard heuristic contract; no completeness in infinite spaces; worst-case memory equals DFS. Use greedy for speed where suboptimality is acceptable, never where cheapest is contractually required.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Q1: Numerical Drill
S to A (g=2, h=9), S to B (g=8, h=1), both reach G for 1 more each. Greedy's pick and cost?
(A) A, total 3
(*B) B with total 9, because h(B) = 1 < 9 = h(A) decides alone — the g-gap (8 vs 2) is invisible to f = h
(C) A, total 11
(D) It expands both simultaneously
::: explanation
Greedy compares 9 against 1 and never sees 2 against 8. Returned 9 versus optimal 3 — nose-following with different digits.
:::

::: quiz Q2: Completeness Trap
Infinite corridor where every node's h decreases toward a dead end that never arrives. Greedy's fate?
(A) Finds the goal anyway
(*B) Descends forever, because each step looks strictly better than every alternative — incompleteness needs no adversary, just endless optimism
(C) Runs out of memory first, which counts as completeness
(D) Switches to BFS automatically
::: explanation
Completeness needs eventual success on solvable tasks. Infinite h-descent never returns; explored sets cannot save depth-infinite chases.
:::

::: quiz Q3: Family Sorting
Greedy (h), A* (g+h), UCS (g). Which uses only the past, only the future, both?
(A) Greedy past, UCS future
(*B) UCS past only (g), greedy future only (h), A* both (g+h) — the three frontier orderings are exactly the three combinations of bill and guess
(C) All three use both
(D) A* uses neither
::: explanation
g is money spent (past), h is money guessed (future). Past-only is optimal-but-blind, future-only fast-but-fooled, both optimal-and-guided given admissibility.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: `f = h` rule with complexity and verdicts. 7 marks: hand-trace the S-A-B-G graph, compute 10 vs. 3, explain why admissibility does not save greedy.
:::

**Recap facts examiners reward:** `f(n) = h(n)`; min-h expansion; `O(b^m)`; incomplete and non-optimal with qualifications; explored-set necessity; family ordering line.

### Sample 3-Mark Question
**Q: State greedy best-first's rule and guarantees.**

**Model Answer:** Expand min-h with f = h. Worst-case O(b^m) time/space. Incomplete in infinite spaces; non-optimal in general — admissibility does not repair it.

### Sample 7-Mark Question
**Q: Trace greedy on S-A/B-G and contrast with A*.**

**Model Answer:** Frontier {A:5, B:3} pops B, returns cost 10 vs. optimum 3 via A. Cause: h-only ordering ignores paid g. A* with f = g+h compares 6 vs. 10 at decision time and picks A — the billed repair.
:::
