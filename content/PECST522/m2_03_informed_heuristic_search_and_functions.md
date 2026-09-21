---
id: m2_03_informed_heuristic_search_and_functions
courseCode: PECST522
module: 2
sequence: 3
title: 'Informed (Heuristic) Search & Designing Heuristic Functions'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Test heuristics for admissibility against true cheapest cost
  - Enforce consistency across every successor with step costs
  - Dominate weak heuristics with relaxed-problem designs
concepts:
  - heuristic functions
  - admissibility
  - consistency
prerequisites:
  - m2_01_uninformed_search_dfs_bfs_ucs
examRelevance: high
tags:
  - search
  - heuristics
---
# Informed (Heuristic) Search & Designing Heuristic Functions

**Problem: blind search expands far too much. Can domain knowledge guess remaining cost to aim the search? By the end you can test any heuristic for admissibility and consistency, design 8-puzzle heuristics from relaxed problems, and rank heuristics by dominance.**

<a id="start-zero"></a>
## 1. Start From Zero: Compass vs. Blindfold

Blind search touches every wall in a dark room. Informed search carries a compass: a guessed distance to the exit that prioritizes promising paths. The compass may err, so its error contract decides everything.

**Definitions:** a **heuristic function** `h(n)` estimates the cheapest remaining cost from node `n` to a goal. The true cheapest cost is written `h*(n)` (h-star). At any goal `G`, `h(G) = 0` must hold. Blind methods (BFS/DFS/UCS) use no `h`; informed methods order by it.

::: callout-intuition Core Mental Model: Compass vs. Blindfold
The compass points but obstacles remain — guidance prunes, it does not teleport. Drop the image after this; the contracts below are the technical content.
:::

**Tiny beginner example:** driving to a city 100 km away. `h = straight-line distance` (say 80 km) underestimates road distance — optimistic, hence safe for optimal search. `h = 150 km` overestimates and could discard the true best route — unsafe.

::: toggle What are `h(n)`, `h*(n)`, `g(n)`, `admissible`, `consistent`?
`h(n)` = guessed cheapest remainder from `n` (the compass reading). `h*(n)` = true cheapest remainder (unknown — the territory). `g(n)` = price already paid start-to-`n` (the odometer). Admissible = $h \le h^*$ everywhere (never overestimates — optimism license). Consistent = $h(n) \le c + h(n')$ on every edge (triangle inequality — estimates cohere across steps; implies admissible, strictly stronger). Tiny check: true 8, guess 7 admissible; guess 9 voids the license at that one node.
:::

::: toggle How do `h1` and `h2` work, and why does one dominate?
`h1` (misplaced tiles) = count of tiles off-goal (relaxation: any tile teleports in one move — each misplaced tile needs ≥ 1 real move). `h2` (Manhattan) = sum of per-tile grid distances home (relaxation: tiles slide through each other — each unit of grid distance needs ≥ 1 real move). Dominance: every misplaced tile contributes ≥ 1 to Manhattan, so $h_2 \ge h_1$ pointwise while both stay ≤ $h^*$ — dominant admissible heuristics expand no more A* nodes (up to ties). More informed = fewer expansions, never fewer guarantees.
:::

<a id="basics"></a>
## 2. Basic Layer: Admissibility (Never Overestimate)

**Data/state:** current node `n`. **Goal:** estimate remaining cost without exceeding truth.

**Meaning, variables, intuition, formula:** admissibility means optimism everywhere. Variables: `h(n)` your estimate, `h*(n)` the true cheapest remainder:

$$h(n) \le h^*(n) \quad \text{for all } n$$

Intuition: under-promising keeps the optimal path looking affordable so it is never skipped. Overestimation (`h > h*`) inflates the optimum's price tag and the search may settle for worse — optimality lost.

::: callout-formula Admissibility Contract
Admissible iff never overestimates on any node, with h(goal) = 0. Tiny check: true cost 8, guess 7 passes; guess 9 fails at that one node (one violation voids the license everywhere).
:::

::: callout-pitfall Why Overestimation Breaks Optimality
An inflated optimal path looks worse than a mediocre alternative. A* then returns the alternative — fast, wrong-priced. Admissibility is the optimality license; dominance (below) only ranks licensed heuristics.
:::

<a id="formal-model"></a>
## 3. Formal Layer: Consistency, Design, Dominance

**Consistency (monotonicity)** is stronger: heuristic differences along any edge cannot exceed the edge cost. For node `n`, successor `n'` via action `a` with step cost `c(n,a,n')`:

$$h(n) \le c(n, a, n') + h(n')$$

Intuition (triangle inequality): the estimate here cannot exceed "pay one step plus the estimate there." Consequence: `f(n) = g(n) + h(n)` never decreases along paths. **Theorem: every consistent heuristic is admissible; the converse is false** (some admissible heuristics wiggle inconsistently).

**Design by relaxed problems:** drop constraints to get an optimistic simplification whose exact cost is an admissible guess.
- `h1` (misplaced tiles): count of tiles off-goal (blank excluded). Relaxation: any tile teleports anywhere in one move.
- `h2` (Manhattan/city-block): sum over tiles of horizontal-plus-vertical grid distance home. Relaxation: tiles slide through each other.

```text
Current:  1 2 3 | 8 _ 4 | 7 6 5     Goal: 1 2 3 | 8 _ 4 | 7 6 5
```

Both are admissible (neither exceeds true moves). **Dominance:** for admissible `h1, h2`, `h2` dominates `h1` iff `h2(n) >= h1(n)` everywhere (still `<= h*`). Dominant heuristics expand no more A* nodes (up to ties). Since each misplaced tile needs >= 1 move, `h2 >= h1` always — Manhattan dominates misplaced tiles.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

**KTU procedure:** on a given board, count misplaced (compare cells), sum Manhattan distances per tile, verify each `<= h*`, then state dominance pointwise.

| Similar pair | Distinction |
|---|---|
| Admissible vs. consistent | Never-overestimate vs. triangle inequality on every edge (consistent implies admissible) |
| `h` vs. `h*` vs. `g` | Guessed remainder vs. true remainder vs. paid-so-far |
| Relaxed vs. real problem | Fewer constraints (optimistic, admissible) vs. full rules |

**Watch out:** (1) One overestimate anywhere voids admissibility. (2) Dominance needs two admissible rivals — inadmissible ones are disqualified before ranking. (3) Consistency is about edges, not just nodes.

**Limitations:** tighter heuristics cost more per node; dominance ignores computation time. Admissibility buys optimality only with the right search (A* with proper goal-testing) — heuristics alone solve nothing.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What is the fundamental requirement for a heuristic function $h(n)$ to be classified as Admissible?
() It must equal zero for all nodes in the state space.
(*) It must never overestimate the true cost to reach the goal ($h(n) \le h^*(n)$).
() It must compute the exact optimal path cost in constant time.
() It must be calculated using straight-line Euclidean distance.
::: explanation
Admissibility is optimism everywhere: a valid lower bound on true remaining cost. Euclidean distance is one example, not the definition.
:::

::: quiz In the 8-puzzle problem, why does the Manhattan Distance heuristic ($h_2$) dominate the Misplaced Tiles heuristic ($h_1$)?
() Because Manhattan distance is computationally faster to evaluate.
(*) Because for every board configuration, the Manhattan distance value is always greater than or equal to the misplaced tile count ($h_2(n) \ge h_1(n)$), providing a tighter lower bound.
() Because Manhattan distance ignores diagonal moves.
() Because Misplaced Tiles is an inadmissible heuristic.
::: explanation
Each misplaced tile contributes at least 1 to Manhattan distance, so h2 >= h1 pointwise while both stay <= h*. Tighter bounds mean fewer A* expansions.
:::

::: quiz What is the mathematical relationship between Consistency (Monotonicity) and Admissibility of a heuristic?
() Admissibility and consistency are mutually exclusive.
() Every admissible heuristic is guaranteed to be consistent.
(*) Every consistent heuristic is guaranteed to be admissible, but not all admissible heuristics are consistent.
() Consistency only applies to tree search, not graph search.
::: explanation
The triangle inequality implies never-overestimating, but optimism alone does not enforce smooth edge-to-edge behaviour.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: define admissibility and its A* role. 7 marks: compute h1/h2 on a board, prove h2 dominates h1, state consistency.
:::

**Recap facts examiners reward:** `h(n) <= h*(n)`; `h(n) <= c + h(n')`; consistent-implies-admissible; relaxed-problem derivations; `h2 >= h1` dominance line.

### Sample 3-Mark Question
**Q: Define admissible heuristic. Why necessary?**

**Model Answer:** h(n) <= h*(n) everywhere with h(G)=0. It keeps optimal paths looking affordable so A* never discards them for worse alternatives.

### Sample 7-Mark Question
**Q: Compare h1 and h2 on the 8-puzzle with dominance.**

**Model Answer:** h1 counts misplaced tiles (teleport relaxation); h2 sums grid distances (through-move relaxation); both <= h*. Each misplaced tile has Manhattan >= 1, so h2 >= h1 everywhere: h2 dominates, expanding no more A* nodes.
:::
