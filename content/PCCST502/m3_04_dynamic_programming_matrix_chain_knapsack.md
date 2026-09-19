---
id: m3_04_dynamic_programming_matrix_chain_knapsack
courseCode: PCCST502
module: 3
sequence: 4
title: 'Dynamic Programming: Matrix Chain & Knapsack'
difficulty: beginner
estimatedMinutes: 5
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
## 1. The Intuition

::: callout-intuition Core Mental Model: The Forgetful vs. Note-Taking Mathematician
Two mathematicians compute Fibonacci numbers recursively. The **forgetful** one recomputes $F(10)$ dozens of times from scratch (plain divide-and-conquer on overlapping subproblems — exponential waste). The **note-taking** one writes each $F(k)$ on a whiteboard the first time and just *reads* it thereafter — same recursion, exponentially less work. **Dynamic programming** is exactly that whiteboard: solve each distinct subproblem *once*, store it, reuse it. DP applies precisely when subproblems **overlap** (recursion revisits them) and the problem has **optimal substructure** (optima built from optima).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 DP vs. Divide-and-Conquer vs. Greedy (the Trichotomy)

| | Subproblems overlap? | Optimal substructure? | Method |
|---|---|---|---|
| Merge sort (D&C) | No (disjoint halves) | Yes | Recurse directly |
| Greedy-solvable | (irrelevant) | Yes + greedy choice | Commit locally, never revisit |
| DP territory | **Yes** | Yes | Solve each once, memoize/tabulate |

* **Memoization** (top-down): recurse + cache ("remember what you computed").
* **Tabulation** (bottom-up): fill the table smallest-first, no recursion overhead. Same complexity, different direction.

### 2.2 Matrix Chain Multiplication

Parenthesize $A_1 \dots A_n$ (dims $p_0 \times p_1, \dots$) to minimize scalar multiplications. Trying all parenthesizations is exponential (Catalan-counted) — but subchains repeat, so DP over intervals:

$$m[i][j] = \min_{i \le k < j} \big(m[i][k] + m[k+1][j] + p_{i-1}\,p_k\,p_j\big), \quad m[i][i] = 0$$

Fill by chain length $2 \to n$; split table $s[i][j]$ records the winning $k$ for reconstruction. Time $\Theta(n^3)$, space $\Theta(n^2)$.

### 2.3 0/1 Knapsack (DP Redemption Arc)

Capacity $W$, items $(v_i, w_i)$, take/skip each whole item: $dp[i][w] = \max(dp[i-1][w],\, v_i + dp[i-1][w-w_i])$. Pseudopolynomial $\Theta(nW)$ — the same greedy-killer from topic 1, now solved exactly by remembering (compare: fractional variant never needed DP at all).

::: callout-formula KTU Formula Vault: DP Signatures
Needs: **overlapping subproblems + optimal substructure** · memoize (top-down) or tabulate (bottom-up) · matrix chain: **$m[i][j] = \min_k$ split + $p_{i-1}p_kp_j$**, $\Theta(n^3)$ · knapsack: **take-or-skip max**, $\Theta(nW)$ · greedy fails where choices **interact** (0/1), DP remembers the interaction.
:::

::: callout-pitfall Overlapping Is the Price of Admission
Optimal substructure *alone* does not justify DP — merge sort has it and needs no table (disjoint subproblems never repeat). If recursion never revisits a subproblem, memoization caches write-only entries: correct but pointless overhead. Diagnose overlap *first*, then reach for the whiteboard.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Chain $A_1(30\times35)\, A_2(35\times15)\, A_3(15\times5)\, A_4(5\times10)\, A_5(10\times20)\, A_6(20\times25)$ — the classic CLRS instance. Compute the optimal cost and parenthesization.
:::

::: step [Step 2: Execution] Filling by Chain Length
Length-2 winners: $m[1][2] = 30\cdot35\cdot15 = 15{,}750$; $m[2][3] = 35\cdot15\cdot5 = 2{,}625$; $m[3][4] = 15\cdot5\cdot10 = 750$; $m[4][5] = 5\cdot10\cdot20 = 1{,}000$; $m[5][6] = 10\cdot20\cdot25 = 5{,}000$. Length-3+: each $m[i][j]$ tries every split $k$ (cost left + cost right + $p_{i-1}p_kp_j$), keeping the min and its $k$ in $s[i][j]$. Key late decisions: $m[1][6]$ tries $k=1..5$ with split costs $15{,}750+(\dots)$, and the winner is $k=3$: $m[1][3] + m[4][6] + 30\cdot5\cdot25 = 7{,}875 + 3{,}500 + 3{,}750 = \mathbf{15{,}125}$.
:::

::: step [Step 3: Conclusion] Final Result
Optimal **15,125** scalar multiplications with parenthesization $((A_1(A_2A_3))((A_4A_5)A_6))$ — versus $(((\dots)))$ naive left-to-right at $30\cdot35\cdot15 + \dots$ far higher. The $s$-table doesn't just give the number; it *reconstructs the bracketing* — DP returns decisions, not just values.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
