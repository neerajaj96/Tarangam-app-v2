---
id: m3_05_backtracking_n_queens_state_space
courseCode: PCCST502
module: 3
sequence: 5
title: 'Backtracking: N-Queens & State-Space Search'
difficulty: beginner
estimatedMinutes: 7
learningObjectives:
  - Search state-space trees DFS-style with intelligent retreat
  - Prune with explicit domain and implicit relational constraints
  - Trace 4-Queens to both solutions with minimal attack checks
concepts:
  - backtracking
  - state-space tree
  - bounding functions
prerequisites: []
examRelevance: high
tags:
  - backtracking
  - state-space
---
# Backtracking: N-Queens & State-Space Search

**Systematic trial with intelligent retreat: state-space trees, bounding functions, explicit vs. implicit constraints, and 4-Queens traced to both solutions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Maze with String
Brute force explores a maze by walking *every* path to its end. **Backtracking** walks with string tied at the entrance: advance while promising, and the moment a path *provably* can't work (dead end, or a bound worse than your best), rewind the string to the last fork and try the next branch — *pruning* whole subtrees without visiting them. The string (recursion stack) plus the noses for dead ends (**bounding functions**) turn exhaustive search from impossible into merely expensive.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 State-Space Tree and Constraints

* The **state-space tree** enumerates all candidate vectors $(x_1, \dots, x_n)$ level by level (level $i$ fixes $x_i$); a depth-first walk visits solution and dead-end leaves alike.
* **Explicit constraints** bound each $x_i$ to a finite set (e.g. queen $i$ sits in some column $1..n$); **implicit constraints** relate variables (no two queens share a row/column/diagonal) — the rules that *prune*.
* **Bounding function:** at a live node, prove no descendant can beat/improve the goal (or satisfy constraints at all); if so, **kill the subtree** — prune now, never revisit.

### 2.2 N-Queens Formulation

Place $n$ queens so none attack another. Fix queen $i$ in row $i$ (rows handled by construction); choose columns $x_i \in \{1..n\}$. Queen $i$ attacks queen $j$ iff $x_i = x_j$ (same column) or $|x_i - x_j| = |i - j|$ (same diagonal — equal rise over run). The killer observation: placing queen $k+1$ needs checking *only against queens $1..k$* (earlier rows), so infeasibility surfaces at the shallowest possible depth.

```text
4-Queens solution [2,4,1,3] (row i -> column):

. Q . .     row 1: queen at col 2
. . . Q     row 2: queen at col 4
Q . . .     row 3: queen at col 1
. . Q .     row 4: queen at col 3
(check: no shared column; diagonals |dx|=|dy| never match)
```

### 2.3 Backtracking vs. Cousins

* vs. **brute force:** identical worst case (whole tree), wildly better typical case (pruning) — backtracking is brute force *with a brain*.
* vs. **branch & bound** (Module 4): backtracking prunes by *feasibility*; B&B additionally prunes by *cost bounds* against the best solution so far (backtracking is B&B with the cost machinery switched off).
* vs. **DP:** no overlapping-subproblem structure is exploited — each live path is explored independently; memoization across branches generally doesn't apply.

::: callout-formula KTU Formula Vault: Backtracking Facts
Search a **state-space tree** DFS-style · prune by **explicit** (domain) + **implicit** (relations) constraints · N-Queens attack test: **same column or |Δcol| = |Δrow|** · check new queen **only against earlier rows** · worst case still **exponential** (pruning is typical-case salvation, not a complexity cure).
:::

::: callout-pitfall Pruning Cuts Typical Cost, Never Worst-Case Guarantees
A lucky instance prunes to near-linear; a hostile one (no early contradictions) still walks the whole tree. "Backtracking is exponential" and "backtracking beats brute force" are *both* true — worst-case vs. typical-case, the eternal pair. Never promise exponential escape; never dismiss practical pruning.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Solve 4-Queens by backtracking (rows fixed 1–4, try columns ascending). Find all solutions, showing prunes.
:::

::: step [Step 2: Execution] Walking the Tree
$x_1 = 1$: $x_2 \in \{3,4\}$ (col 1 shares a column with $(1,1)$; col 2 sits on its diagonal since $|2-1| = |2-1|$). Try $x_2 = 3$: $x_3$ candidates vs {(1,1),(2,3)}: col 1 shares column ✗; col 2: vs (2,3): $|2-3|=|3-2|$ diagonal ✗; col 3 shares column ✗; col 4: vs (2,3) $|4-3|=|3-2|$ diagonal ✗ → **dead end, backtrack**. Try $x_2 = 4$: $x_3$ vs {(1,1),(2,4)}: col 1 ✗ column; col 2: vs (1,1)? $|2-1|=|3-1|$? $1 \ne 2$ ✓ pass; vs (2,4)? $|2-4|=|3-2|$? $2 \ne 1$ ✓ pass → $x_3 = 2$. $x_4$ vs {(1,1),(2,4),(3,2)}: col 3: column free ✓; diagonals: vs (1,1): $|3-1|=|4-1|$? $2 \ne 3$ ✓; vs (2,4): $|3-4|=|4-2|$? $1 \ne 2$ ✓; vs (3,2): $|3-2|=|4-3|$? $1 = 1$ ✗ attacked! col 1,2,4 also fail (column/diagonal) → **dead end**. Backtrack fully: $x_1 = 2$: symmetric search yields $x = (2,4,1,3)$ ✓ and $(3,1,4,2)$ ✓ — the two solutions (mirror images).
:::

::: step [Step 3: Conclusion] Final Result
4-Queens has exactly **2 solutions**: $[2,4,1,3]$ and $[3,1,4,2]$. The trace visited a fraction of the $4^4 = 256$ naive vectors — every dead end above pruned 4+ descendants sight unseen. That gap (visited vs. possible) *is* backtracking's entire value proposition.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz In N-Queens with queen i fixed in row i, a new queen is placed in row k+1. Against which queens must it be checked, and why is that sufficient?
() Against all n queens, including unplaced future rows
(*) Only against queens 1..k (earlier rows) — future rows are empty so nothing can attack from them, and mutual attacks are symmetric so checking one direction covers the pair
() Against no one — rows alone prevent all attacks
() Only against queen 1, the most dangerous one
::: explanation
Attacks are symmetric pairs; with rows $k+2..n$ empty, any attack involving the newcomer must partner a placed queen $1..k$. Checking only backward is complete *and* cheapest — forward checks would test empty squares. (This asymmetry is why row-fixing + backward-checking is the standard formulation.)
:::

::: quiz What is the precise role of a bounding function, and how does backtracking differ from branch & bound on this axis?
() Bounding functions enumerate all solutions exhaustively
(*) A bounding function proves a live subtree cannot contain anything worth finding (infeasible or dominated) so it is pruned unvisited; backtracking bounds on feasibility while branch & bound additionally bounds on cost versus the best solution so far
() Bounding functions only apply to sorting problems
() There is no difference; the terms are synonyms
::: explanation
Prune = prove-then-skip. Backtracking's bounds are logical (constraint violation ahead ⇒ dead); B&B adds numeric bounds (even the best completion here loses to the incumbent ⇒ dead). B&B strictly generalizes — backtracking is its feasibility-only special case.
:::

::: quiz Backtracking is called "brute force with a brain," yet remains exponential in the worst case. Reconcile the praise with the bound.
() The praise is marketing; the bound is the only truth
(*) Pruning slashes typical-case exploration (dead subtrees skipped sight unseen) while hostile instances with no early contradictions still force full-tree walks — worst-case analysis and practical performance describe different distributions
() Exponential worst case means it never outperforms brute force on any instance
() The brain refers to using more memory, which changes the complexity class
::: explanation
Worst-case = adversarial input (contradictions hide at maximum depth); typical-case = early pruning collapses the tree. Both statements quantify over *different* input sets — no contradiction, just the standard worst-vs-typical distinction from Module 1 applied to search.
:::
