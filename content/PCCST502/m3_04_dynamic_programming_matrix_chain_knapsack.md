---
id: m3_04_dynamic_programming_matrix_chain_knapsack
courseCode: PCCST502
module: 3
sequence: 4
title: 'Dynamic Programming: Matrix Chain & Knapsack'
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Diagnose greed failure into overlapping subproblems plus substructure
  - Fill matrix-chain tables in increasing length order
  - Redeem knapsack with take-or-skip tabulation
concepts:
  - dynamic programming
  - matrix-chain order
  - knapsack recurrence
prerequisites:
  - m3_01_greedy_strategy_control_abstraction
examRelevance: high
tags:
  - dynamic-programming
  - optimization
---
# Dynamic Programming: Matrix Chain & Knapsack

**When greed fails, remember: optimal substructure plus overlapping subproblems, memoization vs. tabulation, matrix-chain parenthesization, and 0/1 knapsack.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Greedy fails 0/1 knapsack because whole-item choices *interact* through shared capacity. Naive recursion on such problems recomputes the same subproblems exponentially often (Fibonacci $F(10)$ re-derived dozens of times). **Dynamic programming (DP)** fixes exactly this: solve each *distinct* subproblem *once*, store it, reuse it — a whiteboard next to the recursion.

::: callout-intuition Core Mental Model: The Forgetful vs. Note-Taking Mathematician
The **forgetful** mathematician recomputes $F(10)$ from scratch every time (plain recursion on overlapping subproblems — exponential waste). The **note-taking** one writes each $F(k)$ on a whiteboard once and *reads* it after. Same recursion, exponentially less work. DP applies precisely when subproblems **overlap** (recursion revisits them) and the problem has **optimal substructure** (optima built from optima). Drop the mathematicians now: memo tables and recurrences below are the exact machinery.
:::

**Tiny toy example (Fibonacci).** Naive $F(5) = F(4)+F(3)$ recomputes $F(3)$ twice, $F(2)$ three times. Note-taking: compute $F(0)..F(5) = 0,1,1,2,3,5$ once each — 6 writes, zero repeats. That gap (exponential vs linear) is DP's entire value.

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**DP vs Divide-and-Conquer vs Greedy (the trichotomy):**

| | Subproblems overlap? | Optimal substructure? | Method |
|---|---|---|---|
| Merge sort (D&C) | No (disjoint halves) | Yes | Recurse directly |
| Greedy-solvable | (irrelevant) | Yes + greedy choice | Commit locally, never revisit |
| DP territory | **Yes** | Yes | Solve each once, memoize/tabulate |

* **Memoization** (top-down): recurse + cache ("remember what you computed").
* **Tabulation** (bottom-up): fill the table smallest-first, no recursion overhead. Same complexity, opposite direction.

**Matrix chain multiplication.** Parenthesize $A_1 \dots A_n$ (dimensions $p_0 \times p_1, p_1 \times p_2, \dots$ — symbol-by-symbol: $p_{i-1}, p_i$ are the rows/columns of $A_i$) to minimise scalar multiplications. All parenthesizations are exponential (Catalan-counted) — but subchains repeat, so DP over intervals:
$$m[i][j] = \min_{i \le k < j} \big(m[i][k] + m[k+1][j] + p_{i-1}\,p_k\,p_j\big), \quad m[i][i] = 0$$
Read: cheapest cost for chain $i..j$ = best split $k$ of (left optimal + right optimal + multiply-the-two-results cost $p_{i-1}p_kp_j$). Fill by chain length $2 \to n$; split table $s[i][j]$ records the winning $k$ for reconstruction. Time $\Theta(n^3)$, space $\Theta(n^2)$.

**0/1 knapsack (DP redemption arc).** Capacity $W$, items $(v_i, w_i)$ ($v$ = value, $w$ = weight), take/skip each whole item: $dp[i][w] = \max(dp[i-1][w],\, v_i + dp[i-1][w-w_i])$ — best using first $i$ items at capacity $w$ = max(skip $i$, take $i$ + best of rest). Pseudopolynomial $\Theta(nW)$ — the Module-3 greedy-killer, now solved exactly. (Fractional variant never needed DP.)

::: callout-formula KTU Formula Vault: DP Signatures
Needs: **overlapping subproblems + optimal substructure** · memoize (top-down) or tabulate (bottom-up) · matrix chain: **$m[i][j] = \min_k$ split + $p_{i-1}p_kp_j$**, $\Theta(n^3)$ · knapsack: **take-or-skip max**, $\Theta(nW)$ · greedy fails where choices **interact** (0/1), DP remembers the interaction.
:::

::: callout-pitfall Overlapping Is the Price of Admission
Optimal substructure *alone* does not justify DP — merge sort has it and needs no table (disjoint subproblems never repeat). If recursion never revisits a subproblem, memoization caches write-only entries: correct but pointless overhead. Diagnose overlap *first*, then reach for the whiteboard.
:::

---

<a id="worked-example"></a>
## 3. Worked example — the classic six-matrix chain

::: step [Step 1: Setup] Formulating the Problem
Chain $A_1(30\times35)\, A_2(35\times15)\, A_3(15\times5)\, A_4(5\times10)\, A_5(10\times20)\, A_6(20\times25)$ (the classic CLRS — Cormen, Leiserson, Rivest, Stein — instance). Compute optimal cost and parenthesization.
:::

::: step [Step 2: Execution] Filling by Chain Length
Length-2: $m[1][2] = 30\cdot35\cdot15 = 15{,}750$; $m[2][3] = 2{,}625$; $m[3][4] = 750$; $m[4][5] = 1{,}000$; $m[5][6] = 5{,}000$. Length-3+: each $m[i][j]$ tries every split $k$ (left + right + $p_{i-1}p_kp_j$), keeping the min and its $k$ in $s[i][j]$. Decisive late split: $m[1][6]$ wins at $k=3$: $m[1][3] + m[4][6] + 30\cdot5\cdot25 = 7{,}875 + 3{,}500 + 3{,}750 = \mathbf{15{,}125}$.
:::

::: step [Step 3: Conclusion] Final Result
Optimal **15,125** multiplications, parenthesization $((A_1(A_2A_3))((A_4A_5)A_6))$ — far below naive left-to-right. The $s$-table returns *decisions*, not just values: it reconstructs the bracketing.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Fill by *increasing chain length*: $m[i][j]$ reads strictly shorter intervals — any other order reads uninitialised neighbours and corrupts silently.
- $\Theta(nW)$ is pseudopolynomial (depends on $W$'s *value*, not its bit-length) — still exponential in input *size* for huge $W$.
- Memoization and tabulation give the same complexity; "which direction" is implementation, not theory.

| Similar pair | Distinction that earns marks |
|---|---|
| Overlap vs substructure | Revisited subproblems (DP's trigger) vs optima-from-optima (shared with D&C/greedy) |
| Memoize vs tabulate | Top-down cache vs bottom-up order — same bounds, opposite direction |
| 0/1 vs fractional knapsack | Coupled whole choices (DP $\Theta(nW)$) vs decoupled slices (greedy) |

**Exam recap (facts an examiner rewards):** both DP preconditions; the $m[i][j]$ recurrence read symbol-by-symbol; length-order filling; knapsack take-or-skip with $\Theta(nW)$; 15,125 with its bracketing.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Merge sort has optimal substructure but needs no DP table, while matrix chain does. What distinguishes them?
() Merge sort lacks optimal substructure entirely
(*) Merge sort's subproblems are disjoint (never revisited — memoization would cache write-only entries); matrix chain's interval subproblems overlap exponentially, so remembering pays
() Matrix chain has no optimal substructure and needs DP anyway
() DP tables only work for sorting problems
::: explanation
The price of admission is *overlap*: D&C halves never repeat, so a cache helps nothing. Interval subproblems ($m[2][4]$ needed by many larger intervals) repeat constantly — each remembered entry kills an exponential subtree. Diagnose overlap first, whiteboard second.
:::

::: quiz In the worked example, why must m[i][j] be filled in order of increasing chain length rather than arbitrary order?
() Arbitrary order works identically; ordering is cosmetic
(*) $m[i][j]$ depends on strictly shorter intervals $m[i][k]$, $m[k+1][j]$ — increasing length guarantees every dependency is already final when needed (tabulation's topological discipline)
() Longer chains must be computed first to allocate memory
() Chain length ordering only matters for memoization, never tabulation
::: explanation
Tabulation replaces recursion with *ordering*: dependencies (shorter chains) before dependents (longer chains). Fill out of order and entries read garbage (still-zero) neighbors — silently wrong answers from a correct recurrence. Length-increasing is the topological sort of interval DAG.
:::

::: quiz 0/1 knapsack is solved by DP in Θ(nW) while fractional knapsack falls to greedy. What single property draws this boundary?
() The value of W being even or odd
(*) Divisibility: fractional choices decouple (greedy exchange holds per unit); whole items couple decisions (taking one precludes combinations), creating interacting subproblems that only remembering can untangle
() 0/1 knapsack has no optimal substructure at all
() Fractional knapsack is NP-hard, requiring greed as an approximation
::: explanation
Fractions let every unit decide independently — no interaction, no memory needed. Whole items interact through shared capacity (take $i$ ⇒ $W - w_i$ left changes everything downstream) — exactly the overlapping-subproblem structure DP exists to remember. Same problem family, opposite methods, one boundary: divisibility.
:::
