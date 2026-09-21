---
id: m3_06_floyd_warshall_all_pairs_shortest
courseCode: PCCST502
module: 3
sequence: 6
title: 'Floyd-Warshall: All Pairs, One Recurrence'
difficulty: beginner
estimatedMinutes: 8
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
## 1. Start from zero — the problem first

**Problem first.** Dijkstra finds routes from *one* source. But a distance table for *every* pair (road atlas, network routing tables) needs all-pairs answers — and the graph may hold negative edges (discounts, not just costs), which Dijkstra forbids. Floyd-Warshall (named after Robert Floyd and Stephen Warshall) answers all pairs with one DP (dynamic programming) recurrence, tolerating negative edges (though not negative cycles).

::: callout-intuition Core Mental Model: Transfer Hubs Opening in Turn
Round $k$ opens vertex $k$ as a permitted transfer hub: every pair re-asks "direct, or via the new hub?" Dijkstra flies one source nonstop; Floyd-Warshall connects *all* airports by inducting hubs one at a time — slower prep ($O(V^3)$), instant answers after ($O(1)$ lookup), tolerant of negative edges but not negative cycles. Drop the airports now: the $D^k$ recurrence below is the exact mechanism.
:::

::: anim floyd-via-k Direct 8 Loses to Via-2's 5
Round $k = 2$ admits vertex $2$ as midpoint: $D[1][3] = \min(8, 3 + 2) = 5$ — the matrix below traces all three rounds.
:::

**Tiny toy example (2 vertices).** Edges $1 \to 2$ (7), $2 \to 1$ ($-2$). $D^0 = [[0,7],[-2,0]]$. Round 1 (hub 1): $D[2][2] = \min(0, -2+7) = 0$ — no change. Round 2 (hub 2): $D[1][1] = \min(0, 7-2) = 0$ — no change, diagonal clean, no negative cycle. Two rounds, zero drama, correct table.

::: toggle Expand `D[k][i][j] = min(D[k−1][i][j], D[k−1][i][k] + D[k−1][k][j])` symbol by symbol
$D^k[i][j]$ = best $i \to j$ distance using intermediate vertices only from $\{1..k\}$ (the growing permission set). $D^{k-1}[i][j]$ = best path ignoring the new hub (keep the old answer). $D^{k-1}[i][k] + D^{k-1}[k][j]$ = best path forced through new hub $k$ (arrive + depart). $\min$ = keep whichever is shorter (hub helps or it doesn't — one comparison per pair). $k = 1..V$ rounds induct one hub at a time; after round $V$ all intermediates allowed = true shortest paths. Tiny check above: $D[1][3] = \min(8, 3+2) = 5$ — via-2 beats direct-8.
:::

::: toggle What do `intermediate vertex`, `negative cycle`, and `Π` mean?
`Intermediate vertex` = any vertex strictly between start and end on a path (hubs admitted round by round — $D^k$'s permission set). `Negative cycle` = a directed loop with total negative cost (looping forever keeps improving — shortest paths then undefined; convicted by a negative diagonal entry at the end). $\Pi[i][j]$ = predecessor of $j$ on the current best $i \to j$ path (follow pointers home to rebuild "which way", not just "how far").
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols:** $D^k[i][j]$ = shortest path from $i$ to $j$ using intermediate vertices only from $\{1..k\}$; $V$ = vertex count; $\Pi[i][j]$ = predecessor table for rebuilding paths.

**Recurrence and complexity — numbered steps:**

1. Initialise $D^0$ = direct edge weights ($\infty$ where no edge, $0$ on the diagonal).
2. For $k = 1..V$: $D^k[i][j] = \min(D^{k-1}[i][j],\, D^{k-1}[i][k] + D^{k-1}[k][j])$ — best old path vs best via new hub $k$.
3. Time $\Theta(V^3)$, space $\Theta(V^2)$ (in-place updates are safe: round $k$'s row/column reads stay consistent since paths using $k$ twice cannot improve without negative cycles — a favourite viva trap).
4. Negative weights allowed; a negative diagonal entry at the end convicts a **negative cycle** (looping profitably forever — shortest paths then undefined).
5. Versus $V \times$ Dijkstra ($O(VE\log V)$, non-negative only): Floyd wins on dense graphs and simplicity, loses on sparse ones.

**Path reconstruction.** Keep predecessors $\Pi[i][j]$, updated alongside $D$; follow pointers home. Without $\Pi$: distances only — "how far" without "which way".

::: callout-formula KTU Formula Vault: Floyd-Warshall
$D^k = \min(D^{k-1}, D^{k-1}[i][k] + D^{k-1}[k][j])$ · $\Theta(V^3)/\Theta(V^2)$ · negative edges OK, negative cycles detected via diagonal · $\Pi$ rebuilds paths.
:::

In-place safety is subtle but real: $D[i][k]$ and $D[k][j]$ are frozen during round $k$ (paths through $k$ twice can't improve without negative cycles) — overwriting needs no copy, a favourite viva trap.

::: callout-pitfall Dijkstra-for-All-Pairs Reflex
Running Dijkstra from every source fails on negative edges (its greedy settling assumes non-negativity) — Floyd's DP makes no such assumption. An option prescribing $V \times$ Dijkstra "for all weights" smuggles non-negativity into a negative-edge problem.
:::

---

<a id="worked-example"></a>
## 3. Worked example — three vertices, three rounds, one change

::: step [Step 1: Setup] Formulating the Problem
Digraph: $1 \to 2$ ($3$), $2 \to 3$ ($2$), $1 \to 3$ ($8$). Trace all $D^k$ rounds; name every entry that changes.
:::

::: step [Step 2: Execution] Three Rounds, One Change
$D^0 = [[0,3,8],[\infty,0,2],[\infty,\infty,0]]$. $k = 1$ (via $1$): candidates $D[i][1]+D[1][j]$ need incoming-to-$1$ (none finite except $D[1][1]=0$) — no changes. $k = 2$ (via $2$): $D[1][3] = \min(8, 3+2) = 5$ ✓ (the single improvement); $D[1][1] = \min(0, 3+\infty) = 0$; $D[3][3]$ untouched. $k = 3$ (via $3$): row/column 3 offer no outgoing ($D[3][\cdot] = \infty$ off-diagonal) — no changes. Final $D = [[0,3,5],[\infty,0,2],[\infty,\infty,0]]$; diagonal clean (no negative cycle).
:::

::: step [Step 3: Conclusion] Final Result
Exactly one entry moved ($D[1][3]$: $8 \to 5$); rounds $1$ and $3$ changed nothing. Sparse graphs trace mostly-quiet rounds — work concentrates where midpoints actually bridge, which is why $V \times$ Dijkstra wins sparse races while Floyd wins dense simplicity.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Quiet rounds are normal output, not errors — most entries in most rounds (especially late $k$) correctly sit still. Never fabricate improvements.
- Negative *edges* are legal input; negative *cycles* void the question (report, don't route).
- $D^k$ indexes the hub set $\{1..k\}$, not "paths of length $k$" — $k$ counts admitted midpoints.

| Similar pair | Distinction that earns marks |
|---|---|
| Negative edge vs negative cycle | Tolerated input vs undefined shortest paths (diagonal $< 0$) |
| Floyd vs $V \times$ Dijkstra | All weights + dense-friendly vs non-negative + sparse-friendly |
| $D$ vs $\Pi$ tables | How far (distances) vs which way (rebuilt paths) |

**Exam recap (facts an examiner rewards):** the one-line recurrence with $k = 1..V$; $\Theta(V^3)/\Theta(V^2)$; diagonal negative ⟺ negative cycle; $\Pi$ for reconstruction; the $8 \to 5$ via-2 improvement.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Recurrence drill: $D^{2} = [[0,4,9],[1,0,2],[7,5,0]]$. Compute $D^{3}[1][2]$ (1-indexed, via vertex $3$).
() $14$, detours always win
(*) $\min(4, D[1][3] + D[3][2] = 9 + 5) = \min(4, 14) = 4$ — the via-$3$ detour ($14$) loses honestly to direct ($4$); the min keeps the champion, and quiet rounds are normal output, not errors
() $9$, copy the hub row
() $0$, diagonals reset
::: explanation
Plug the recurrence mechanically: direct $4$ against detour $9 + 5 = 14$. Round $3$ re-asks every pair with hub $3$; most entries (especially late $k$) correctly sit still — students forcing "every round improves something" fabricate changes.
:::

::: quiz Better detour: same matrix, what is $D^{3}[2][1]$ via vertex $3$?
() $1$, direct always wins
(*) $\min(1, D[2][3] + D[3][1] = 2 + 7) = \min(1, 9) = 1$ — the $9$-detour loses to direct $1$; the min keeps the champion regardless of direction, new hubs don't gift improvements
() $9$, detours always win
() $\infty$, unreachable now
::: explanation
$\min$ is unsentimental: $1$ beats $9$, entry holds. Students forcing "every round improves something" fabricate changes — most entries in most rounds (especially late $k$) correctly sit still.
:::

::: quiz Negative-cycle verdict: final diagonal reads $[0, -2, 0]$. Meaning?
() Distances need one more round
(*) Negative cycle exists through vertex $2$ — a path from $2$ back to $2$ totalling $-2$ means infinite profitable looping, so shortest paths are undefined (unbounded below) wherever the cycle is reachable; report, don't route
() Normal for negative edges
() Rerun with bigger integers
::: explanation
$D[V][i][i] < 0$ is the conviction: $2 \leadsto 2$ at $-2$ loops profitably forever. Negative *edges* are legal input; negative *cycles* void the question — detection (not repair) is Floyd's verdict, and the exam's favourite diagonal reading.
:::
