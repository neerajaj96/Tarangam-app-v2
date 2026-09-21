---
id: m2_99_practice_lab_search_strategies_drills
courseCode: PECST522
module: 2
sequence: 99
title: 'Module 2 Practice Lab: Search Strategy Drills'
difficulty: intermediate
estimatedMinutes: 9
learningObjectives:
  - Count the eleven-percent IDS miracle against BFS exactly
  - Spring the hundred-cost shortcut trap for UCS verdicts
  - Admit or expel heuristics in admissibility court
concepts:
  - IDS-BFS accounting
  - UCS shortcut trap
  - heuristic court
prerequisites:
  - m2_01_uninformed_search_dfs_bfs_ucs
  - m2_02_iterative_deepening_and_depth_limited
  - m2_03_informed_heuristic_search_and_functions
examRelevance: high
tags:
  - search
  - m2-lab
---
# Module 2 Practice Lab: Search Strategy Drills

**Problem: turn search theory into exam arithmetic and strategy choice. By the end you can price IDS overhead, spring cost traps, try heuristics, and explain tree-vs-graph gaps.**

<a id="start-zero"></a>
## 1. Start From Zero: Three Autopsies

**Problem first:** students memorize verdicts without numbers. **Method:** count one case fully per strategy family, then generalize.

**Scenario 1 — The 11% miracle (IDS vs. BFS, counted):** branching b = 10, goal depth d = 5. BFS builds levels 0..5: 1 + 10 + 100 + 1000 + 10,000 + 100,000 = 111,111 nodes. IDS re-walks upper tiers: 5x10 + 4x100 + 3x1000 + 2x10,000 + 1x100,000 = 123,450 — ~11% more — for linear `O(b*d)` memory instead of `O(b^d)`, plus uniform-cost optimality. Upper tiers are exponentially tiny, so re-walking crumbs costs crumbs.

**Scenario 2 — The \$100 shortcut trap (BFS vs. UCS):** start-goal direct toll \$100 (1 step); start-A-goal backroad \$1 + \$1 (2 steps). BFS (counts steps) takes the toll; UCS (counts dollars) takes the backroad. "Fewest edges" answers BFS; "cheapest" answers UCS; "both" is correct only at uniform cost.

**Scenario 3 — Heuristic court:** true costs h*(A) = 8, h*(B) = 4. Candidate h1: A 7, B 5 — fails at B (5 > 4), hence **inadmissible** everywhere as a license (A* may go suboptimal). Candidate h2: A 6, B 3 — passes both, hence admissible. Dominance needs two admissible rivals, so with h1 disqualified no dominance relation exists; among admissible rivals, higher-never-over wins node by node.

<a id="basics"></a>
## 2. Basic Layer: Do-Not-Confuse Table

| Pair | Exam distinction |
|---|---|
| BFS vs. UCS optimum | Fewest steps vs. cheapest cost (split exactly when costs vary) |
| DFS vs. IDS memory | `O(b*m)` deep stack with loop risk vs. `O(b*d)` with completeness restored |
| DLS vs. IDS | One capped shot (cutoff past l) vs. deepening loop to completeness |
| IDS overhead | ~11% extra at b=10 (geometric tiers make regeneration cheap) |
| Admissible vs. consistent | `h <= h*` everywhere vs. triangle `h(n) <= c + h(n')` (consistent implies admissible) |
| Dominance | Both admissible first, then pointwise >= everywhere |
| `g` vs. `h` vs. `f` | Paid-so-far vs. guessed-to-go vs. `g+h` priority |
| Tree vs. graph search | Re-expand states via every path vs. explored-set prune (exponential savings where paths rejoin) |
| Complete vs. optimal | Finds a solution vs. finds the cheapest (independent axes) |
| Step vs. path cost | One-edge price vs. accumulated total |

**Limitations of drills:** counts assume uniform branching and stated costs; real frontiers vary. Admissibility verdicts assume exact `h*` knowledge — in exams it is given; in practice it is bounded, not known.

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz IDS regenerates the top tiers on every iteration, yet costs only ~11% more nodes than BFS at b=10, d=5. A student calls this "obviously wasteful anyway." Refute with the series.
() Agree — regeneration is pure waste regardless of series
(*) Upper tiers are exponentially tiny (50 + 400 + … against 100,000 at the bottom): re-walking crumbs costs crumbs — 123,450 vs. 111,111 buys linear memory plus uniform-cost optimality for 11%
() IDS is wasteful and BFS should always be preferred
() The 11% figure is fabricated; real overhead exceeds 500%
::: explanation
Level i dwarfs all levels above combined (b^d vs. sum ~ b^d/(b-1)). Regeneration re-pays only crumbs while the bottom tier dominates both totals.
:::

::: quiz h₁ overestimates at one node but is elsewhere admissible and dominant; h₂ is admissible everywhere but lower. An A* implementation must pick one heuristic. Which, and why is there no contest?
() h₁ — dominance outweighs one small overestimate
(*) h₂ — admissibility is a license (optimality guarantee), dominance a ranking *among the licensed*; one overestimate voids the license, disqualifying h₁ before comparison begins
() Neither — mix them by averaging to cancel the error
() h₁, because higher heuristics always preserve optimality
::: explanation
Optimality proofs need h <= h* everywhere — one violation breaks the chain silently. Dominance compares admissible rivals only. License first, ranking second.
:::

::: quiz DFS dives down the leftmost path on a graph with a 1-step goal on the far right (branching 10, depth 3). BFS finds it expanding ~111 nodes; DFS explores the entire left subtree first. What does this show about completeness and optimality together?
() DFS is complete and optimal here; BFS is neither
(*) Neither DFS property holds in general (infinite paths kill completeness; first-found ≠ cheapest kills optimality) while BFS on uniform cost has both — strategy choice, not effort, decides guarantees
() Both strategies share identical guarantees on all graphs
() BFS is incomplete on finite graphs
::: explanation
Completeness and optimality are independent: DFS can miss forever and returns whatever it stumbles on; level-order BFS certifies both under uniform cost.
:::

::: quiz Tree search on a grid with many rejoining paths (transpositions) explodes exponentially while graph search stays polynomial-ish. What single mechanism explains the gap?
() Graph search uses a faster programming language
(*) The explored/closed set: tree search re-expands the same state via every distinct path (exponentially many routes to deep states); graph search expands each state once, pruning all rediscoveries — memoization across paths, same whiteboard moral as DP
() Tree search cannot handle grids by definition
() Grids forbid heuristics, crippling tree search uniquely
::: explanation
Many paths sharing states turn trees exponential while state sets stay put. The explored set converts path-counting into state-counting — the dynamic-programming moral in search form.
:::

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
3 marks: any table row (BFS-vs-UCS and admissibility lead) or the IDS figure with reasoning. 7 marks: counted traces, admissibility trials, or per-strategy verdict tables.
:::

**Recap facts examiners reward:** 111,111 vs. 123,450 derivation; toll-vs-backroad verdict rule; one-violation disqualification; explored-set mechanism; complete-vs-optimal independence.

### Essay Question 1 (7 Marks)
**Q: For b = 10, d = 5, compute BFS and IDS counts, explain the 11%, state what IDS buys.**

**Model Answer:** BFS sum = 111,111. IDS weighted sum = 123,450, ratio ~1.11. Upper tiers exponentially small so regeneration costs crumbs. Buys linear O(b*d) memory plus uniform-cost completeness/optimality — depth-first footprint with breadth-first guarantees.

### Essay Question 2 (7 Marks)
**Q: Judge h1 = {A:7, B:5} and h2 = {A:6, B:3} against h* = {A:8, B:4} for dominance and A* consequences.**

**Model Answer:** h1 fails at B (5 > 4): inadmissible, A* may return suboptimal paths. h2 passes both: admissible. No dominance exists (needs two licensed rivals). Run A* on h2 for guaranteed optimality with no more expansions than any weaker admissible rival.
:::
