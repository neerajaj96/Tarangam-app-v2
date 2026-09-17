# Quick Sort & Analysis

**Partition around a pivot, conquer the sides — average $n\log n$, worst $n^2$, and why pivots decide.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Classroom Split
Pick one student (pivot), send shorter left and taller right (partition), then sort each side the same way. Balanced splits halve the class each round ($n\log n$ total); a terrible pivot (already-sorted + first-element) peels one student per round ($n^2$). Random/median pivots make bad luck exponentially unlikely — speed through fairness.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Partition (Lomuto sketch) and recurrence

Scan with boundary $i$: elements $< $ pivot compact left; final swap puts pivot at $i+1$ (its sorted home — one element *placed* per partition). $T(n) = T(k)+T(n-k-1)+\Theta(n)$: balanced $k\approx n/2$ → $\Theta(n\log n)$ average; degenerate $k = 0$ → $\Theta(n^2)$ worst. Space $O(\log n)$ stack average, $O(n)$ worst; unstable; in-place.

### 2.2 Pivot defences

Random pivot, median-of-three, shuffle-first — expected $\Theta(n\log n)$ regardless of input order. Already-sorted input is the classic killer of naive first-element quicksort.

::: callout-formula KTU Formula Vault: Quick
Partition **$\Theta(n)$, places pivot** · avg **$\Theta(n\log n)$** · worst **$\Theta(n^2)$** (sorted + naive pivot) · randomise to survive.
:::

::: callout-pitfall Sorted Input Is Quicksort's Kryptonite
First/last-pivot quicksort on sorted data degrades to $n^2$ with $n$ stack depth (stack overflow territory). "Quicksort is always $n\log n$" is false — average-case qualifier is mandatory.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Quicksort $[24, 10, 36, 15, 28]$ with first-element pivot (Lomuto). Show partition 1 result and the two subproblems.
:::

::: step [Step 2: Execution] Scan and Split
1. Pivot $24$: scan compacts $\{10, 15\}$ left ($i$ advances twice), $\{36, 28\}$ stay right. Swap pivot into slot $2$: $[10, 15, 24, 36, 28]$ — $24$ home.
2. Recurse left $[10,15]$ (pivot $10$: already home, right $[15]$) and right $[36,28]$ (pivot $36$ → $[28,36]$). Final $[10,15,24,28,36]$.
:::

::: step [Step 3: Conclusion] Final Result
Each partition *places* its pivot permanently — track placed pivots to verify progress. Recursion depth mirrors split quality; balanced here, $2$ deep.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
After one Lomuto partition, what is guaranteed about the pivot?
(A) Array is sorted
(*B) The pivot sits at its final sorted index, with smaller-or-equal left and larger right
(C) Nothing at all
(D) Both sides are sorted
::: explanation
Partitioning is placement, not sorting: the pivot is home, sides merely separated. Recursion sorts the sides later — progress is one certified slot per partition.
:::

::: quiz Q2: Foundational Concept
First-element quicksort on sorted ascending input of size $n$ costs:
(A) $\Theta(n\log n)$
(*B) $\Theta(n^2)$ — each partition peels one element ($k = 0$ split), summing $n+(n-1)+\dots$
(C) $\Theta(n)$
(D) $\Theta(\log n)$
::: explanation
Degenerate splits recurse on $n-1, n-2, \dots$ with $\Theta$ work each — triangular $n^2/2$. Random pivot or pre-shuffle restores expectation $n\log n$; naive + sorted is the textbook worst case.
:::

::: quiz Q3: Numerical Drill
Balanced quicksort recurrence $T(n) = 2T(n/2)+\Theta(n)$ solves to:
(A) $\Theta(n^2)$
(*B) $\Theta(n\log n)$ — $\log n$ levels of $\Theta(n)$ partition work each
(C) $\Theta(n)$
(D) $\Theta(2^n)$
::: explanation
Halving depth $\log n$ times, each level partitioning all $n$ elements once: $n\times\log n$. Same shape as mergesort's recurrence — compare the two explicitly when asked.
:::
