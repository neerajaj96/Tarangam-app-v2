---
id: m4_02_tsp_branch_and_bound
courseCode: PCCST502
module: 4
sequence: 2
title: 'TSP Branch & Bound: Reduced Matrices'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Lower-bound tours with row-plus-column reduction totals
  - Branch include-versus-exclude with used-row and diagonal infinities
  - Prune against the incumbent through a fully traced optimum
concepts:
  - TSP lower bounds
  - matrix reduction
  - incumbent pruning
prerequisites:
  - m4_01_branch_and_bound_control_abstraction
examRelevance: high
tags:
  - branch-and-bound
  - tsp
---
# TSP Branch & Bound: Reduced Matrices

**Tour cost, assignment-style lower bounds by row/column reduction, include/exclude branching, incumbent pruning, and a fully traced 4-city optimum.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** The Travelling Salesperson Problem (TSP): visit each of $n$ cities once and return to the start, minimising total road cost. Brute force tries $(n-1)!/2$ tours (symmetric distances) — dead by $n = 20$. B&B instead computes a cheap **price floor** (no tour costs less), then kills every partial route whose floor already exceeds the best complete tour in hand.

::: callout-intuition Core Mental Model: The Salesperson's Price Floor
Before planning any route, an assistant computes a floor: "every city must be *left* (≥ cheapest outgoing road) and *entered* (≥ cheapest incoming road) — sum those minima and no tour on Earth costs less." That floor (row+column reduction) then judges every partial route: branches floored above the best known tour are abandoned unbuilt. Floors first, tours second, pruning always. Drop the assistant now: reduction totals and infinities below are the exact mechanism.
:::

**Tiny toy example (3 cities).** Costs: $1\to2$ (5), $2\to3$ (5), $3\to1$ (5), all returns (50). Row minima $5,5,5$ → floor 15. The tour $1\to2\to3\to1$ costs exactly 15 = floor → optimal proven with zero search. Floors certify; tours cash in.

::: toggle What are `tour`, `Hamiltonian cycle`, `edge cost`, `bound`, `incumbent`?
`Tour` = a route visiting every city exactly once and returning to start. `Hamiltonian cycle` = the graph name for such a closed visit-all loop (TSP asks for the cheapest one). `Edge cost` = road price $M[i][j]$ (asymmetric allowed — $i \to j$ may differ from $j \to i$). `Bound` = reduction-total floor (no tour costs less — optimistic by construction). `Incumbent` = best complete tour found so far (e.g. nearest-neighbour 39 — prunes everything floored at or above it).
:::

::: toggle Trace the root bound: where do `29` and `6` come from?
Row minima (ignore diagonal $-$): row 1 min 10, row 2 min 5, row 3 min 6, row 4 min 8 → subtract each from its row, running total 29 (every tour uses one entry per row, so every tour costs ≥ 29 less than the original — floor banked). Column minima of the reduced matrix: 0, 0, 1, 5 → total 6 (every tour uses one entry per column — another 6 banked). Bound $29 + 6 = 35$: no tour under 35 exists; incumbent 39 leaves the window [35, 39) to search.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols:** cost matrix $M$ ($M[i][j]$ = road $i \to j$); $\infty$ = forbidden (never the minimum — reductions skip infinities); incumbent = best complete tour so far; bound = reduction-total floor.

**Bound machinery — numbered steps:**

1. **Row reduction:** subtract each row's minimum from that row. Every tour uses exactly one entry per row, so every tour's cost drops by exactly the subtracted total — the running total is a valid lower bound.
2. **Column reduction** on the result (every tour uses exactly one entry per column). **Bound = row total + column total.**
3. Forbid used edges/self-loops with $\infty$.
4. **Branch** on an edge $e$: *include* it (delete its row/column, ban the return edge to forbid subtours) vs. *exclude* it (set cost $\infty$); recompute bounds; prune branches with bound $\ge$ incumbent (start from any heuristic tour, e.g. nearest-neighbour: always go to the closest unvisited city).

**The worked instance.** Cost matrix (row $i$ → column $j$):

```text
       1    2    3    4
  1  [ -   10   15   20 ]
  2  [ 5    -    9   10 ]
  3  [ 6   13    -   12 ]
  4  [ 8    8    9    - ]
```

Row minima (off-diagonal): $10, 5, 6, 8$ → total $29$. Column minima of the row-reduced matrix: $0, 0, 1, 5$ → total $6$. **Root bound $= 29 + 6 = 35$.** Nearest-neighbour from 1: $1 \to 2\ (10) \to 3\ (9) \to 4\ (12) \to 1\ (8) = 39$ — incumbent $39$.

::: callout-formula KTU Formula Vault: TSP B&B Facts
Bound = **row-reduction + column-reduction totals** (assignment relaxation) · branch **include vs exclude** an edge · prune when **bound ≥ incumbent** · infinities for **used rows/columns, diagonal, return edges** (subtour killer) · optimal proven when **bound == incumbent**.
:::

::: callout-pitfall The Bound Is Optimistic Because It Allows Subtours
Row+column reduction solves the *assignment* problem (each city one in-edge + one out-edge), which permits disjoint subtours (1→2→1 plus 3→4→3) that no TSP tour allows. The bound is valid (a real tour is a feasible assignment, so optimum ≥ bound) but loose exactly when subtours win — include/exclude branching exists to kill them one by one.
:::

---

<a id="worked-example"></a>
## 3. Worked example — branching on edge 1→2 to certified optimum

::: step [Step 1: Setup] Formulating the Problem
Matrix above (root bound 35, incumbent 39): branch on edge $1 \to 2$. Bound the exclude side; resolve the include side to a tour.
:::

::: step [Step 2: Execution] Branching
**Exclude $1 \to 2$:** set $M[1][2] = \infty$, re-reduce — bound rises to **39** = incumbent: nothing here *beats* 39, prune unexpanded (at best ties). **Include $1 \to 2$:** delete row 1 / column 2, ban return $2 \to 1$ (subtour guard), continue branching — the surviving line resolves to $1 \to 2 \to 4 \to 3 \to 1$ costing $10 + 10 + 9 + 6 = \mathbf{35}$. New incumbent 35 **equals the root bound** — optimality proven, search over.
:::

::: step [Step 3: Conclusion] Final Result
Optimum **35** ($1 \to 2 \to 4 \to 3 \to 1$), certified by the floor: nothing below 35 exists (bound), one tour at 35 exists (tour) — squeeze complete. One exclusion-prune + one inclusion-descent; bounds did the exponential heavy lifting.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Pruning needs "cannot *beat*" ($\ge$), not "strictly worse" ($>$): equality prunes are where B&B saves the most time.
- Forgetting the return-edge ban lets the relaxation "complete" a 2-cycle and report a fake low bound.
- A heuristic incumbent is a starting ceiling, not a floor — better heuristics only prune more, never less.

| Similar pair | Distinction that earns marks |
|---|---|
| Include vs exclude branch | Fix edge (delete row/col, ban return) vs ban edge ($\infty$) and re-reduce |
| Bound vs incumbent | Certified floor (optimistic) vs best tour in hand (achieved) |
| Assignment vs tour | Subtours allowed (bound) vs single cycle required (answer) |

**Exam recap (facts an examiner rewards):** bound = row + column totals; include/exclude mechanics with infinities; prune on $\ge$; optimum certified when bound == incumbent; trace numbers 29 + 6 = 35, NN 39, optimum 35.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Row reduction subtracts each row's minimum and adds it to a running total claimed as part of the lower bound. Why is this total valid (never overestimating)?
() Subtraction makes all entries non-negative, which is sufficient
(*) Every feasible tour uses exactly one entry per row, so each tour's cost drops by exactly the subtracted amounts — the reduction total is a cost every tour must pay, hence a true lower bound
() Row minima are always zero in valid TSP instances
() Validity requires column reduction first; rows alone prove nothing
::: explanation
The bound's legitimacy is one-to-one usage: one entry per row per tour means subtracting row-minimum $m_i$ removes exactly $m_i$ from *every* tour's cost — $\sum m_i$ is donc unavoidable cost, a floor no tour ducks under. Same logic, transposed, for columns.
:::

::: quiz In the worked trace, the exclude-1→2 branch (bound 39, incumbent 39) was pruned. Why is pruning on equality correct rather than merely safe?
() Equality pruning is actually incorrect and the trace cheats
(*) The branch promises cost ≥ 39 while 39 is already in hand — expanding it can at best tie the incumbent, never improve it, so skipping loses no optimal solution
() Equal bounds always indicate arithmetic errors
() The incumbent 39 was itself unproven at that point
::: explanation
Pruning needs "cannot *beat*" — ties don't beat. Bound $\ge$ incumbent (not strictly $>$) is the correct kill condition: the subtree holds no *strictly better* tour by the bound's own certificate. Equality prunes are where B&B saves its most time.
:::

::: quiz Why must the return edge be banned (∞) when an edge is included in the partial tour?
() To make the matrix symmetric for faster reduction
(*) Without the ban, the assignment relaxation happily closes a premature subtour (e.g. 1→2→1) and reports an invalid "tour" with an artificially low bound — the ban forces genuine single-cycle completion
() Banning speeds up row reduction by removing large entries
() Return edges are illegal in all graphs by definition
::: explanation
The bound's optimism *includes* subtour-shaped assignments; include-branching without return-bans lets the relaxation "complete" a 2-cycle and claim victory. The $\infty$ kills exactly the premature closure, forcing the search toward true Hamiltonian cycles.
:::
