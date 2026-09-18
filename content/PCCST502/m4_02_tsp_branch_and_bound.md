# TSP Branch & Bound: Reduced Matrices

**Tour cost, assignment-style lower bounds by row/column reduction, include/exclude branching, incumbent pruning, and a fully traced 4-city optimum.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Salesperson's Price Floor
A salesperson must visit 4 cities and return. Before planning any route, a clever assistant computes a **price floor**: "every city must be *left* (≥ cheapest outgoing road) and *entered* (≥ cheapest incoming road) — sum those minima and no tour on Earth costs less." That floor (≈ assignment bound via row+column reduction) then judges every partial route: any branch whose floor already exceeds the best complete tour found is abandoned unbuilt. Floors first, tours second, pruning always.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Problem and Bound Machinery

* Tour $1 \to \dots \to 1$ visiting each city once; cost = edge sum. $(n-1)!/2$ tours (symmetric) — brute force dies early.
* **Row reduction:** subtract each row's minimum from that row (every tour uses exactly one entry per row — cost drops by exactly the subtracted total, so the reduction total is a valid lower bound).
* **Column reduction** on the result (every tour uses exactly one entry per column). **Bound = row total + column total.** Forbid used edges/self-loops with $\infty$ (never the minimum — reductions skip infinities).
* **Branch:** pick an edge $e$: *include* it (delete its row/column, ban the return edge to forbid subtours) vs. *exclude* it (set cost $\infty$), recompute bounds, prune branches $\ge$ incumbent (start incumbent = any heuristic tour, e.g. nearest-neighbor).

### 2.2 The Worked Instance

Cost matrix (row $i$ → column $j$):

```text
       1    2    3    4
  1  [ -   10   15   20 ]
  2  [ 5    -    9   10 ]
  3  [ 6   13    -   12 ]
  4  [ 8    8    9    - ]
```

Row minima (off-diagonal): $10, 5, 6, 8$ → reduce total $29$. Column minima of the row-reduced matrix: $0, 0, 1, 5$ → reduce total $6$. **Root bound $= 29 + 6 = 35$.** Nearest-neighbor tour from 1: $1 \to 2\ (10) \to 3\ (9) \to 4\ (12) \to 1\ (8) = 39$ — incumbent $39$.

::: callout-formula KTU Formula Vault: TSP B&B Facts
Bound = **row-reduction + column-reduction totals** (assignment relaxation) · branch **include vs exclude** an edge · prune when **bound ≥ incumbent** · infinities for **used rows/columns, diagonal, return edges** (subtour killer) · optimal proven when **bound == incumbent**.
:::

::: callout-pitfall The Bound Is Optimistic Because It Allows Subtours
Row+column reduction solves the *assignment* problem (each city one in-edge + one out-edge), which permits disjoint subtours (1→2→1 plus 3→4→3) that no TSP tour allows. The bound is valid (a real tour is a feasible assignment, so optimum ≥ bound) but loose exactly when subtours win — include/exclude branching exists to kill them one by one.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Using the matrix above (root bound 35, incumbent 39): branch on edge $1 \to 2$. Compute the exclude-branch bound (edge banned) and resolve the include side down to a tour.
:::

::: step [Step 2: Execution] Branching
**Exclude $1 \to 2$:** set $M[1][2] = \infty$, re-reduce — bound rises to **39**, equal to the incumbent: nothing down this branch can *beat* 39, so prune it unexpanded (it can only tie, never improve).
**Include $1 \to 2$:** delete row 1 / column 2, ban return $2 \to 1$ (subtour guard), continue branching — the surviving line resolves to tour $1 \to 2 \to 4 \to 3 \to 1$ costing $10 + 10 + 9 + 6 = \mathbf{35}$. New incumbent 35 **equals the root bound** — optimality proven, search over.
:::

::: step [Step 3: Conclusion] Final Result
Optimum **35** ($1 \to 2 \to 4 \to 3 \to 1$), certified by the root floor: no tour exists below 35 (bound), one exists at 35 (tour) — squeeze complete. One exclusion-prune + one inclusion-descent solved a 3-tour problem with barely any search — bounds doing the exponential heavy lifting.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
