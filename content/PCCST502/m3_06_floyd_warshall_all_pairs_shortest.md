---
id: m3_06_floyd_warshall_all_pairs_shortest
courseCode: PCCST502
module: 3
sequence: 6
title: 'Floyd-Warshall: All Pairs, One Recurrence'
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - Relax every pair through every midpoint with one recurrence
  - Hand-trace the distance table on three vertices honestly
  - Catch negative cycles on the diagonal and rebuild paths
concepts:
  - Floyd-Warshall algorithm
  - all-pairs shortest paths
  - path reconstruction
prerequisites:
  - m3_04_dynamic_programming_matrix_chain_knapsack
examRelevance: high
tags:
  - dynamic-programming
  - shortest-paths
---
# Floyd-Warshall: All Pairs, One Recurrence

**Every pair, every midpoint — the $D^k$ table hand-traced on three vertices, the single relaxation that pays, and $O(V^3)$ honesty.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Transfer Hubs Opening in Turn
Round $k$ opens vertex $k$ as a permitted transfer hub: every pair re-asks "direct, or via the new hub?" Dijkstra (M3.3) flies one source nonstop; Floyd-Warshall connects *all* airports by inducting hubs one at a time — slower per query ($O(V^3)$ prep), instant answers after ($O(1)$ lookup), and tolerant of negative edges (just not negative cycles).
:::

::: anim floyd-via-k Direct 8 Loses to Via-2's 5
Round $k = 2$ admits vertex $2$ as midpoint: $D[1][3] = \min(8, 3 + 2) = 5$ — the matrix below traces all three rounds.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Recurrence and complexity

$D^k[i][j] = \min(D^{k-1}[i][j],\, D^{k-1}[i][k] + D^{k-1}[k][j])$ — best path using intermediate vertices from $\{1..k\}$. Run $k = 1..V$; time $\Theta(V^3)$, space $\Theta(V^2)$ (in-place updates safe: round $k$ reads its own row/column consistently). Handles negative weights; a negative diagonal entry at the end convicts a negative cycle. Versus $V \times$ Dijkstra ($O(VE\log V)$, non-negative only): Floyd wins on dense graphs and simplicity, loses on sparse ones.

### 2.2 Path reconstruction

Keep predecessors $\Pi[i][j]$ (last updated alongside $D$); follow pointers home. Without $\Pi$, distances only — "how far" without "which way".

::: callout-formula KTU Formula Vault: Floyd-Warshall
$D^k = \min(D^{k-1}, D^{k-1}[i][k] + D^{k-1}[k][j])$ · $\Theta(V^3)/\Theta(V^2)$ · negative edges OK, negative cycles detected via diagonal · $\Pi$ rebuilds paths.
:::

In-place safety is subtle but real: $D[i][k]$ and $D[k][j]$ are frozen during round $k$ (paths through $k$ twice can't improve without negative cycles) — overwriting needs no copy, a favourite viva trap.

::: callout-pitfall Dijkstra-for-All-Pairs Reflex
Running Dijkstra from every source fails on negative edges (its greedy settling assumes non-negativity) — Floyd's DP makes no such assumption. An option prescribing $V \times$ Dijkstra "for all weights" smuggles non-negativity into a negative-edge problem.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Digraph: $1 \to 2$ ($3$), $2 \to 3$ ($2$), $1 \to 3$ ($8$). Trace all $D^k$ rounds and name every entry that changes.
:::

::: step [Step 2: Execution] Three Rounds, One Change
$D^0 = [[0,3,8],[\infty,0,2],[\infty,\infty,0]]$. $k = 1$ (via $1$): only paths *starting*... candidates $D[i][1] + D[1][j]$ need incoming-to-$1$ (none finite except $D[1][1] = 0$) — no changes. $k = 2$ (via $2$): $D[1][3] = \min(8, D[1][2] + D[2][3] = 3 + 2) = 5$ ✓ (the single improvement); $D[1][1] = \min(0, 3 + \infty) = 0$; $D[3][3]$ untouched. $k = 3$ (via $3$): column/row $3$ offer no outgoing ($D[3][\cdot] = \infty$ off-diagonal) — no changes. Final $D = [[0,3,5],[\infty,0,2],[\infty,\infty,0]]$; diagonal clean (no negative cycle).
:::

::: step [Step 3: Conclusion] Final Result
Exactly one entry moved ($D[1][3]$: $8 \to 5$); rounds $1$ and $3$ changed nothing. Sparse graphs trace mostly-quiet rounds — the work concentrates where midpoints actually bridge, which is why $V \times$ Dijkstra wins sparse races while Floyd wins dense simplicity.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Recurrence Drill
$D^{2} = [[0,4,9],[1,0,2],[7,5,0]]$. Compute $D^{3}[1][2]$ (1-indexed, via vertex $3$).
(A) $14$, detours always win
(*B) $\min(4, D[1][3] + D[3][2] = 9 + 5) = \min(4, 14) = 4$ — the via-$3$ detour ($14$) loses honestly to direct ($4$); the min keeps the champion, and quiet rounds are normal output, not errors
(C) $9$, copy the hub row
(D) $0$, diagonals reset
::: explanation
Plug the recurrence mechanically: direct $4$ against detour $9 + 5 = 14$. Round $3$ re-asks every pair with hub $3$; most entries (especially late $k$) correctly sit still — students forcing "every round improves something" fabricate changes.
:::

::: quiz Q2: Better Detour
Same matrix: $D^{3}[2][1]$ via vertex $3$?
(A) $1$, direct always wins
(*B) $\min(1, D[2][3] + D[3][1] = 2 + 7) = \min(1, 9) = 1$ — the $9$-detour loses to direct $1$; the min keeps the champion regardless of direction, new hubs don't gift improvements
(C) $9$, detours always win
(D) $\infty$, unreachable now
::: explanation
$\min$ is unsentimental: $1$ beats $9$, entry holds. Students forcing "every round improves something" fabricate changes — most entries in most rounds (especially late $k$) correctly sit still.
:::

::: quiz Q3: Negative-Cycle Verdict
Final diagonal reads $[0, -2, 0]$. Meaning?
(A) Distances need one more round
(*B) Negative cycle exists through vertex $2$ — a path from $2$ back to $2$ totalling $-2$ means infinite profitable looping, so shortest paths are undefined (unbounded below) wherever the cycle is reachable; report, don't route
(C) Normal for negative edges
(D) Rerun with bigger integers
::: explanation
$D[V][i][i] < 0$ is the conviction: $2 \leadsto 2$ at $-2$ loops profitably forever. Negative *edges* are legal input; negative *cycles* void the question — detection (not repair) is Floyd's verdict, and the exam's favourite diagonal reading.
:::
