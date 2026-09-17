# Divide & Conquer: Merge Sort & Strassen

**The divide-conquer-combine skeleton, merge sort's Θ(n log n) via the recursion tree, and how Strassen multiplies matrices with 7 products instead of 8.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Sorting by Delegation
Sorting 1,000 files alone takes all weekend — so you split the pile in half, hand each half to a friend with the *same instructions* ("sort your pile the same way"), then merge their two sorted piles by repeatedly taking the smaller front file. Nobody ever sorts more than a handful directly; the magic is all in the **merge**. Strassen's matrix trick is the same spirit pushed further: reorganize the arithmetic so one of the 8 recursive multiplications *cancels out* — less delegation, same answer, asymptotically faster.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The D&C Skeleton (all three steps, always)

1. **Divide** the size-$n$ problem into $a$ subproblems of size $n/b$.
2. **Conquer** by solving subproblems recursively (base case: trivially small).
3. **Combine** the sub-solutions into the full answer — cost $f(n)$.

General recurrence: $T(n) = aT(n/b) + f(n)$ — the exact shape the Master Theorem (Module 1) was built for.

### 2.2 Merge Sort: $T(n) = 2T(n/2) + \Theta(n)$

Split the array in half, recursively sort each half, then **merge** two sorted runs in one linear pass (compare front elements, emit the smaller — each element moves exactly once per level).

```text
Level 0:              [8 3 9 1 7 2]              merge cost n
                     /            \
Level 1:        [8 3 9]        [1 7 2]           merge cost n
                /     \        /     \
Level 2:     [8 3]  [9]    [1 7]  [2]           merge cost n
             ... one-element lists: trivially sorted (base case)
```

Every level costs $\Theta(n)$ total and there are $\log_2 n$ levels → $\Theta(n \log n)$ (Master Case 2: $n^{\log_2 2} = n$ matches $f(n) = \Theta(n)$). Stable, guaranteed — but not in-place (merge needs $\Theta(n)$ auxiliary space).

### 2.3 Strassen: 7 Multiplications Suffice

Naive block multiplication needs **8** half-size products: $T(n) = 8T(n/2) + \Theta(n^2) = \Theta(n^3)$ — no better than brute force. Strassen's 7 clever products (additions/subtractions are $\Theta(n^2)$ and fade into $f(n)$):

$$M_1 = (A_{11}+A_{22})(B_{11}+B_{22}) \qquad M_2 = (A_{21}+A_{22})B_{11}$$
$$M_3 = A_{11}(B_{12}-B_{22}) \qquad\qquad\qquad M_4 = A_{22}(B_{21}-B_{11})$$
$$M_5 = (A_{11}+A_{12})B_{22} \qquad\qquad M_6 = (A_{21}-A_{11})(B_{11}+B_{12})$$
$$M_7 = (A_{12}-A_{22})(B_{21}+B_{22})$$

$$C_{11} = M_1+M_4-M_5+M_7 \quad C_{12} = M_3+M_5 \quad C_{21} = M_2+M_4 \quad C_{22} = M_1-M_2+M_3+M_6$$

Recurrence $T(n) = 7T(n/2) + \Theta(n^2)$: $n^{\log_2 7} \approx n^{2.81}$ dominates $f(n) = n^2$ → Master Case 1 gives $\Theta(n^{\log_2 7}) \approx \Theta(n^{2.81})$ — the first crack ever in the $n^3$ wall (constants keep naive winning for small $n$; crossover sits around $n \approx$ hundreds).

::: callout-formula KTU Formula Vault: D&C Complexities
Merge: $2T(n/2)+\Theta(n) \to \Theta(n\log n)$ (Case 2). Strassen: $7T(n/2)+\Theta(n^2) \to \Theta(n^{2.81})$ (Case 1, $\log_2 7 \approx 2.81$). Binary search: $T(n/2)+\Theta(1) \to \Theta(\log n)$. Read any D&C recurrence straight into its Master case — that reflex is the exam.
:::

::: callout-pitfall Strassen's Fine Print
Strassen needs square matrices with power-of-2 dimensions (pad otherwise), uses *more* additions, is **not in-place friendly**, and loses numerically on stability for some inputs. "7 < 8 so always faster" ignores constants, padding, and memory traffic — the vault's crossover warning is the complete answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Multiply $A = \begin{pmatrix}1 & 2 \\\\ 3 & 4\end{pmatrix}$ and $B = \begin{pmatrix}5 & 6 \\\\ 7 & 8\end{pmatrix}$ with Strassen's formulas (here each "block" is a single number, so sub-"multiplications" are plain products). Verify against the naive result.
:::

::: step [Step 2: Execution] Computing the 7 Products
$M_1 = (1+4)(5+8) = 5 \times 13 = 65$. $M_2 = (3+4)\times 5 = 35$. $M_3 = 1\times(6-8) = -2$. $M_4 = 4\times(7-5) = 8$. $M_5 = (1+2)\times 8 = 24$. $M_6 = (3-1)(5+6) = 22$. $M_7 = (2-4)(7+8) = -30$.
$C_{11} = 65+8-24-30 = 19$. $C_{12} = -2+24 = 22$. $C_{21} = 35+8 = 43$. $C_{22} = 65-35-2+22 = 50$.
:::

::: step [Step 3: Conclusion] Final Result
$C = \begin{pmatrix}19 & 22 \\\\ 43 & 50\end{pmatrix}$ — matches naive multiplication ($1\cdot5+2\cdot7 = 19$, etc.) exactly, using 7 scalar multiplications instead of 8. On $2\times2$ the saving is trivial; applied recursively to $1024\times1024$, one fewer product per level compounds into the $n^{2.81}$ vs $n^3$ gap.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
