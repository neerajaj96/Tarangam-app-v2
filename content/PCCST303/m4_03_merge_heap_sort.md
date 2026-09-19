# Merge Sort & Heap Sort with Analysis

**Guaranteed $n\log n$ two ways — stable merging at $O(n)$ space vs heap-powered in-place instability.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Sorted Piles vs Champion Draft
**Merge:** split the deck to singletons, then zip sorted piles pairwise (two-pointer merge, always linear) — halving depth $\log n$ × linear zips = $n\log n$ *every* time, stable, but needs a spare table ($O(n)$). **Heap:** build a max-heap ($\Theta(n)$), then draft the champion to the end $n$ times ($\log n$ each) — $n\log n$ in-place, but champion-swaps scramble equals (unstable).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Costs and properties

* **Merge:** $T(n) = 2T(n/2)+\Theta(n)$ → $\Theta(n\log n)$ best/avg/worst; stable (left pile wins ties); $O(n)$ aux; sequential access → linked-list friendly, external-sort king.
* **Heap:** build $\Theta(n)$ + $n$ extract-max $O(\log n)$ → $\Theta(n\log n)$ all cases; in-place $O(1)$; unstable (long root swaps leapfrog equals).

::: callout-formula KTU Formula Vault: Guaranteed Sorts
Merge: **$n\log n$ always, stable, $O(n)$ space** · heap: **$n\log n$ always, in-place, unstable**.
:::

::: callout-pitfall Merge Space vs Heap Stability — Don't Cross
Merge's tax is *space*; heap's tax is *stability*. Swapping the drawbacks ("merge unstable", "heap needs $O(n)$ space") fails both halves — attach each tax to its owner permanently.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Merge-sort $[38, 27, 43, 3]$: show splits and merges. Then one heapsort extraction from max-heap $[43, 38, 27, 3]$.
:::

::: step [Step 2: Execution] Zip and Draft
1. Split $[38,27]\,[43,3]$ → $[38][27]\,[43][3]$ → merge $[27,38]\,[3,43]$ → merge $[3,27,38,43]$.
2. Swap root/last: $[3,38,27]\,|\,43$; sift-down $3$ past $38$: $[38,3,27]\,|\,43$. $43$ placed; $n-1$ to go.
:::

::: step [Step 3: Conclusion] Final Result
Merge traces show pile pairs per level; heap traces show array + placed suffix. Both traces are level/state sequences — never just input→output.
:::

::: anim merge-zip Merge-Sort 38, 27, 43, 3 Level by Level
Watch the deck split to singletons then zip back pairwise — even halves every level is why the guarantee holds regardless of input order.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Merge sort's worst case is $\Theta(n\log n)$ while quicksort's is $\Theta(n^2)$. Why the guarantee?
(A) Merge uses less memory
(*B) Merge always halves evenly — split quality is input-independent, so every level does $\Theta(n)$ over exactly $\log n$ levels
(C) Merge is stable
(D) Quicksort has bugs
::: explanation
Quicksort's splits depend on data (pivot luck); merge's splits are positional (always half). Data-independent halving locks the recurrence at $2T(n/2)+n$ — the guarantee is structural.
:::

::: quiz Q2: Foundational Concept
Heapsort is in-place but unstable. Explain both in one breath:
(A) It copies arrays stably
(*B) It reuses the input array for heap + placed suffix ($O(1)$ extra), but root-to-end swaps fling equal keys past each other, breaking arrival order
(C) It needs $O(n)$ stack
(D) It is adaptive
::: explanation
Space: array doubles as heap (front) and output (back). Instability: a far-leaping swap moves equals out of sequence — the same long-swap disease as selection sort.
:::

::: quiz Q3: Numerical Drill
Merge of two sorted runs of lengths $m, n$ costs at most:
(A) $m\times n$
(*B) $m+n-1$ comparisons (one side exhausts; last element needs no compare)
(C) $\log(m+n)$
(D) $m+n$ swaps always
::: explanation
Each comparison emits one element; when a run empties, the rest append free — at most $m+n-1$ compares. Linear merging is the engine inside merge sort's $n\log n$ (and inside poly-add, M1–M2's merge walks).
:::
