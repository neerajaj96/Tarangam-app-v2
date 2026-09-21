---
id: m2_04_divide_and_conquer_merge_sort_and_strassen
courseCode: PCCST502
module: 2
sequence: 4
title: Divide & Conquer: Merge Sort & Strassen
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Run the divide-conquer-combine skeleton on every instance
  - Price merge sort through its recursion tree to n log n
  - Cut matrix multiplication to seven products with Strassen
concepts:
  - divide and conquer
  - merge sort
  - Strassen multiplication
prerequisites:
  - m1_08_master_theorem_and_cases
examRelevance: high
tags:
  - divide-and-conquer
  - sorting
---
# Divide & Conquer: Merge Sort & Strassen

**The divide-conquer-combine skeleton, merge sort's Θ(n log n) via the recursion tree, and how Strassen multiplies matrices with 7 products instead of 8.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Sorting 1,000 files alone takes all weekend — so split the pile in half, hand each half to a friend with the *same* instructions, then merge their sorted piles by repeatedly taking the smaller front file. Nobody sorts more than a handful directly; all the magic is in the merge. Matrix multiplication gets the same treatment pushed further: reorganise the arithmetic so one of 8 recursive multiplications cancels out — same answer, asymptotically faster.

::: callout-intuition Core Mental Model: Sorting by Delegation
Divide (split), conquer (recurse on smaller copies), combine (merge results). Merge sort delegates halves and merges linearly; Strassen delegates 7 — not 8 — half-size products after clever additions. The skeleton is identical; only the combine step's cleverness differs. Drop the delegation story now: recurrences and the $M_1..M_7$ formulas below are the exact content.
:::

**Tiny toy example (4 numbers).** Sort $[4, 1, 3, 2]$: split $[4,1]$ / $[3,2]$ → sort to $[1,4]$ / $[2,3]$ → merge by front-comparison: 1, 2, 3, 4. Three levels, every level touching all 4 elements once.

::: toggle Trace the merge: why does front-comparison work?
Both halves arrive sorted, so each half's front is its smallest remaining. Comparing fronts picks the global smallest unfinished element (anything smaller would sit at some front — contradiction otherwise). Emit it, advance that half, repeat: each element moves once per level, total $\Theta(n)$ per level. Why it matters: the linear merge is what makes every level cost $n$ (not $n^2$), giving $\log_2 n$ equal levels and $\Theta(n \log n)$.
:::

::: toggle What do `A₁₁`, `M₁`, and `C₁₁` name in Strassen?
$A_{11}$ = top-left quarter-block of $A$ (matrices split into 4 half-size blocks; subscripts name quadrants). $M_1$ = first clever product, $(A_{11}+A_{22})(B_{11}+B_{22})$ (sums computed first in $\Theta(n^2)$, then one half-size multiplication). $C_{11}$ = top-left quarter of the answer, recombined as $M_1+M_4-M_5+M_7$ (additions reassemble what the 7 products encoded). Why 7 beats 8: branching factor 7 vs 8 changes the watershed $n^{\log_2 7} \approx n^{2.81}$ vs $n^3$ — additions stay in $f(n)$, never in the exponent.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**The D&C skeleton (all three steps, always) — numbered steps:**

1. **Divide** size $n$ into $a$ subproblems of size $n/b$.
2. **Conquer** by solving subproblems recursively (base case: trivially small).
3. **Combine** sub-solutions into the answer — cost $f(n)$.

General recurrence: $T(n) = aT(n/b) + f(n)$ — the Master Theorem's home shape ($a, b, f$ as in Module 1).

**Merge sort: $T(n) = 2T(n/2) + \Theta(n)$.** Split in half, sort each half, **merge** two sorted runs in one linear pass (compare fronts, emit smaller — each element moves once per level).

```text
Level 0:              [8 3 9 1 7 2]              merge cost n
                     /            \
Level 1:        [8 3 9]        [1 7 2]           merge cost n
                /     \        /     \
Level 2:     [8 3]  [9]    [1 7]  [2]           merge cost n
             ... one-element lists: trivially sorted (base case)
```

Every level costs $\Theta(n)$; $\log_2 n$ levels → $\Theta(n \log n)$ (Master Case 2: $n^{\log_2 2} = n$ matches $f = \Theta(n)$). Stable and guaranteed — but not in-place (merge needs $\Theta(n)$ auxiliary space).

**Strassen: 7 multiplications suffice.** Naive block multiplication needs **8** half-size products: $T(n) = 8T(n/2) + \Theta(n^2) = \Theta(n^3)$. Strassen's 7 products (additions are $\Theta(n^2)$, absorbed into $f(n)$):

$$M_1 = (A_{11}+A_{22})(B_{11}+B_{22}) \qquad M_2 = (A_{21}+A_{22})B_{11}$$
$$M_3 = A_{11}(B_{12}-B_{22}) \qquad\qquad\qquad M_4 = A_{22}(B_{21}-B_{11})$$
$$M_5 = (A_{11}+A_{12})B_{22} \qquad\qquad M_6 = (A_{21}-A_{11})(B_{11}+B_{12})$$
$$M_7 = (A_{12}-A_{22})(B_{21}+B_{22})$$

$$C_{11} = M_1+M_4-M_5+M_7 \quad C_{12} = M_3+M_5 \quad C_{21} = M_2+M_4 \quad C_{22} = M_1-M_2+M_3+M_6$$

Recurrence $T(n) = 7T(n/2) + \Theta(n^2)$: $n^{\log_2 7} \approx n^{2.81}$ dominates $f = n^2$ → Master Case 1 → $\Theta(n^{2.81})$, the first crack in the $n^3$ wall (constants keep naive winning for small $n$; crossover around the hundreds).

::: callout-formula KTU Formula Vault: D&C Complexities
Merge: $2T(n/2)+\Theta(n) \to \Theta(n\log n)$ (Case 2). Strassen: $7T(n/2)+\Theta(n^2) \to \Theta(n^{2.81})$ (Case 1, $\log_2 7 \approx 2.81$). Binary search: $T(n/2)+\Theta(1) \to \Theta(\log n)$. Read any D&C recurrence straight into its Master case — that reflex is the exam.
:::

::: callout-pitfall Strassen's Fine Print
Strassen needs square matrices with power-of-2 dimensions (pad otherwise), uses *more* additions, is **not in-place friendly**, and loses numerically on stability for some inputs. "7 < 8 so always faster" ignores constants, padding, and memory traffic — the vault's crossover warning is the complete answer.
:::

---

<a id="worked-example"></a>
## 3. Worked example — Strassen on 2×2, verified against naive

::: step [Step 1: Setup] Formulating the Problem
Multiply $A = \begin{pmatrix}1 & 2 \\\\ 3 & 4\end{pmatrix}$, $B = \begin{pmatrix}5 & 6 \\\\ 7 & 8\end{pmatrix}$ via Strassen (each block is one number, so sub-"multiplications" are scalar products). Verify against naive.
:::

::: step [Step 2: Execution] Computing the 7 Products
$M_1 = (1+4)(5+8) = 65$. $M_2 = (3+4)\times 5 = 35$. $M_3 = 1\times(6-8) = -2$. $M_4 = 4\times(7-5) = 8$. $M_5 = (1+2)\times 8 = 24$. $M_6 = (3-1)(5+6) = 22$. $M_7 = (2-4)(7+8) = -30$. Then $C_{11} = 65+8-24-30 = 19$; $C_{12} = -2+24 = 22$; $C_{21} = 35+8 = 43$; $C_{22} = 65-35-2+22 = 50$.
:::

::: step [Step 3: Conclusion] Final Result
$C = \begin{pmatrix}19 & 22 \\\\ 43 & 50\end{pmatrix}$ — matches naive ($1\cdot5+2\cdot7 = 19$, etc.) with 7 scalar multiplications instead of 8. Trivial at $2\times2$; compounded recursively to $1024\times1024$ it becomes the $n^{2.81}$ vs $n^3$ gap.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Merge's $\Theta(n)$-per-level holds because one level's disjoint pieces tile the whole array — shrinking pieces do not mean cheaper levels.
- Strassen's additions never appear in the exponent: they live in $f(n) = \Theta(n^2)$, dominated by the 7-way branching.
- Padding to powers of 2 is mandatory overhead, not optional polish.

| Similar pair | Distinction that earns marks |
|---|---|
| Merge sort vs Strassen recurrence | $2T(n/2)+\Theta(n)$ (Case 2) vs $7T(n/2)+\Theta(n^2)$ (Case 1) |
| Asymptotic win vs practical win | $n^{2.81}$ eventually vs constants/padding rule small $n$ |
| Stable vs in-place (merge) | Equal keys keep order (stable) but merge needs $\Theta(n)$ extra (not in-place) |

**Exam recap (facts an examiner rewards):** the three-step skeleton; merge $\Theta(n\log n)$ via equal $\Theta(n)$ levels; Strassen's 7-product recurrence and $\Theta(n^{2.81})$; crossover/padding fine print.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Why does merge sort's merge step cost Θ(n) at every recursion level, and what total does that imply?
() Each level merges fewer elements as subarrays shrink, so levels get cheaper — total Θ(n)
(*) Each level collectively processes all n elements once (disjoint subarrays tile the array), and with log₂n levels the total is Θ(n log n)
() The merge allocates a fresh array per element, giving Θ(n²)
() Merge sort never merges; it only divides
::: explanation
Partition the array however you like — one level's disjoint pieces always sum to $n$ elements, each moved once during merging. $\log_2 n$ identical-cost levels multiply to $\Theta(n\log n)$, the textbook Case-2 balance (compare the iteration-method walkthrough in Module 1).
:::

::: quiz Strassen computes 7 half-size products where naive block multiplication uses 8. Why don't the extra additions needed to form the Mᵢ combinations ruin the speedup?
() Additions are free on modern hardware
(*) Additions cost Θ(n²) per level and are absorbed into f(n); the recurrence's growth is set by the 7-way branching (n^2.81), which dominates any quadratic overhead
() Strassen actually uses no additions at all
() The additions cancel out to zero
::: explanation
Recurrence $T(n) = 7T(n/2) + \Theta(n^2)$: leaf-driven growth $n^{\log_2 7} \approx n^{2.81}$ polynomially outruns the quadratic combine cost (Master Case 1). The trick works precisely because additions scale slower than the saved recursion branch.
:::

::: quiz For small matrices (say 32×32), naive multiplication usually beats Strassen in practice. Why?
() Strassen gives wrong answers below a size threshold
(*) Recursion overhead, padding to powers of 2, extra additions, and worse memory locality dominate at small n — constants and lower-order terms the asymptotic bound deliberately ignores
() Small matrices cannot be partitioned into blocks
() Strassen requires infinite precision unavailable for small inputs
::: explanation
$\Theta$-notation erases the constants that rule small inputs: Strassen's bookkeeping, temporary submatrices, and cache-hostile access patterns cost more than one extra product branch saves — until $n$ grows into the hundreds and the exponent gap takes over. Asymptotics describe the marathon, not the sprint.
:::
