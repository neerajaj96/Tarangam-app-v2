---
id: m3_05_backtracking_n_queens_state_space
courseCode: PCCST502
module: 3
sequence: 5
title: 'Backtracking: N-Queens & State-Space Search'
difficulty: beginner
estimatedMinutes: 10
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
## 1. Start from zero — the problem first

**Problem first.** Place $n$ queens on an $n \times n$ board so none attack another — or enumerate *all* ways. Trying all $n^n$ placements is hopeless; but most partial placements already show a conflict (two queens sharing a diagonal), making every completion underneath pointless. **Backtracking** exploits exactly this: build row by row, abandon a branch the moment it provably fails, rewind to the last fork, try the next column.

::: callout-intuition Core Mental Model: The Maze with String
Brute force walks *every* path to its end. **Backtracking** ties string at the entrance: advance while promising; the moment a path *provably* fails (dead end, or a bound worse than best), rewind to the last fork and try the next branch — *pruning* whole subtrees unvisited. The string (recursion stack) plus dead-end detectors (**bounding functions**) turn exhaustive search from impossible into merely expensive. Drop the maze now: state-space trees and attack tests below are the exact machinery.
:::

**Tiny toy example (2-Queens).** $2 \times 2$ board: place Q1 at (1,1); row 2 offers columns 1 (same column ✗) and 2 (diagonal $|2-1| = |2-1|$ ✗) — dead end, backtrack. Q1 at (1,2): symmetric dead end. Zero solutions after visiting 2 partial placements instead of $2^2 = 4$ full ones — pruning on a tiny board.

::: toggle What are `candidate`, `partial solution`, `constraint`, `decision`, `backtrack`, `pruning`?
`Candidate` = one complete placement (a full column vector — possibly illegal). `Partial solution` = placed-so-far rows (a prefix like [2,4] — legality checked incrementally). `Constraint` = a rule candidates must satisfy (explicit: each column 1..n; implicit: no shared column/diagonal). `Decision` = choosing the next row's column (a fork in the tree). `Backtrack` = rewind to the last fork when the partial solution provably fails. `Pruning` = abandoning the whole subtree beneath a dead partial placement (never visited — the savings).
:::

::: toggle Why check the new queen only against earlier rows?
Attacks are symmetric (if queen 5 attacks queen 2, queen 2 attacks queen 5) and future rows are empty, so any conflict involving queen $k+1$ must touch queens $1..k$ — checking backward catches everything exactly once. Forward-checking would test empty rows (vacuous) and re-test old pairs (duplicate work). Backward-only is complete and cheapest: $k$ attack tests per placement, never $n$.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols and abbreviations:** state-space tree = tree of all candidate vectors $(x_1, \dots, x_n)$, level $i$ fixing $x_i$; DFS = depth-first walk of that tree; $|x_i - x_j|$, $|i - j|$ = column/row gaps in the attack test.

**State-space tree and constraints — numbered ideas:**

1. The tree enumerates candidates level by level; DFS visits solution and dead-end leaves alike.
2. **Explicit constraints** bound each $x_i$ to a finite set (queen $i$ sits in some column $1..n$).
3. **Implicit constraints** relate variables (no shared row/column/diagonal) — the rules that *prune*.
4. **Bounding function:** at a live node, prove no descendant is worth finding (infeasible or dominated); kill the subtree unvisited.

**N-Queens formulation.** Fix queen $i$ in row $i$ (rows handled by construction); choose columns $x_i \in \{1..n\}$. Queen $i$ attacks $j$ iff $x_i = x_j$ (column) or $|x_i - x_j| = |i - j|$ (diagonal: equal rise over run). Key economy: queen $k+1$ is checked *only against queens $1..k$* (earlier rows) — future rows are empty, attacks are symmetric, so backward-only checking is complete and cheapest.

```text
4-Queens solution [2,4,1,3] (row i -> column):

. Q . .     row 1: queen at col 2
. . . Q     row 2: queen at col 4
Q . . .     row 3: queen at col 1
. . Q .     row 4: queen at col 3
(check: no shared column; diagonals |dx|=|dy| never match)
```

**Backtracking vs cousins:** vs **brute force** — same worst case (whole tree), far better typical case (pruning): brute force *with a brain*. Vs **branch & bound** (Module 4) — backtracking prunes by *feasibility*; B&B adds *cost bounds* vs the incumbent (backtracking = B&B with cost machinery off). Vs **DP** — no overlapping-subproblem structure is exploited; branches explore independently.

::: callout-formula KTU Formula Vault: Backtracking Facts
Search a **state-space tree** DFS-style · prune by **explicit** (domain) + **implicit** (relations) constraints · N-Queens attack test: **same column or |Δcol| = |Δrow|** · check new queen **only against earlier rows** · worst case still **exponential** (pruning is typical-case salvation, not a complexity cure).
:::

::: callout-pitfall Pruning Cuts Typical Cost, Never Worst-Case Guarantees
A lucky instance prunes to near-linear; a hostile one (contradictions hidden at maximum depth) still walks the whole tree. "Backtracking is exponential" and "backtracking beats brute force" are *both* true — worst-case vs typical-case. Never promise exponential escape; never dismiss practical pruning.
:::

---

<a id="worked-example"></a>
## 3. Worked example — 4-Queens to both solutions

::: step [Step 1: Setup] Formulating the Problem
Solve 4-Queens by backtracking (rows fixed 1–4, columns ascending). Find all solutions, showing prunes.
:::

::: step [Step 2: Execution] Walking the Tree
$x_1 = 1$: $x_2 \in \{3,4\}$ (col 1 shares a column; col 2 is diagonal since $|2-1| = |2-1|$). Try $x_2 = 3$: $x_3$ vs {(1,1),(2,3)} — col 1 shares column ✗; col 2 diagonal vs (2,3) ✗; col 3 shares column ✗; col 4 diagonal vs (2,3) ✗ → **dead end, backtrack**. Try $x_2 = 4$: $x_3$ vs {(1,1),(2,4)} — col 2 passes both tests ($|2-1| \ne |3-1|$, $|2-4| \ne |3-2|$) → $x_3 = 2$. $x_4$ vs {(1,1),(2,4),(3,2)}: col 3 is column-free and diagonal-free vs (1,1) and (2,4), but vs (3,2): $|3-2| = |4-3| = 1$ ✗ attacked; cols 1, 2, 4 fail likewise → **dead end**. Restart $x_1 = 2$: symmetric search yields $(2,4,1,3)$ ✓ and $(3,1,4,2)$ ✓ — mirror images.
:::

::: step [Step 3: Conclusion] Final Result
4-Queens has exactly **2 solutions**: $[2,4,1,3]$ and $[3,1,4,2]$. The trace visited a fraction of the $4^4 = 256$ naive vectors — every dead end pruned 4+ descendants sight unseen. That gap (visited vs possible) *is* backtracking's value.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Checking against *future* (empty) rows buys nothing and costs comparisons per node — backward-only is already complete.
- Diagonal test needs *both* gaps: $|x_i - x_j| = |i - j|$, not column equality alone.
- 4-Queens has exactly 2 solutions (mirrors) — claiming more (or symmetric duplicates as distinct) loses marks unless the question counts symmetries.

| Similar pair | Distinction that earns marks |
|---|---|
| Explicit vs implicit constraints | Domain per variable ($1..n$) vs relations between variables (attack rules) |
| Backtracking vs branch & bound | Feasibility pruning vs + cost-vs-incumbent pruning |
| Worst-case vs typical-case | Exponential bound stands vs pruning usually collapses the tree |

**Exam recap (facts an examiner rewards):** attack test (column or equal gaps); backward-only checking with symmetry justification; state-space DFS + bounding functions; exponential worst case preserved; the two 4-Queens solutions.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

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
