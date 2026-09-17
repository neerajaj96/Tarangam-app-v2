# Linear & Binary Search with Analysis

**Scan everything vs halve everything — sortedness as the price of logarithms.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Shelf Hunt
**Linear:** unsorted shelf — check books one by one ($O(n)$, works anywhere, also finds *all* copies). **Binary:** dictionary — open middle, discard the wrong half, repeat ($O(\log n)$, but the shelf *must* be sorted; one misfiled book breaks every decision after it).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Algorithms and costs

* **Linear:** scan to first match; worst/average $\Theta(n)$ (average $(n+1)/2$ uniform), best $\Theta(1)$. Unsorted OK; finds all occurrences with full scan.
* **Binary (iterative):** `while lo<=hi: mid; compare; halve`. $\Theta(\log n)$ worst/average; $\Theta(1)$ best; $O(1)$ space. Variants: first/last occurrence (don't stop at match — record and continue inward).

::: callout-formula KTU Formula Vault: Search
Linear **$\Theta(n)$, unsorted OK** · binary **$\Theta(\log n)$, sorted mandatory** · iterations **$\approx \log_2 n$**.
:::

::: callout-pitfall Binary on Unsorted Data
Binary search *assumes* order at every halving — unsorted input yields wrong "absent" verdicts silently (no error raised). Verify sortedness is the zeroth step, worth stating explicitly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Binary-search $23$ in $[2, 5, 8, 12, 16, 23, 38, 56]$. Show lo/mid/hi per iteration. How many iterations worst-case for $n = 1000$?
:::

::: step [Step 2: Execution] Halving Walk
1. lo$0$hi$7$ mid$3$ ($12<23$) → lo$4$. mid$5$ ($23$ hit). Two iterations.
2. $\lceil\log_2 1000\rceil = 10$ worst-case.
:::

::: step [Step 3: Conclusion] Final Result
Trace tables (lo, mid, value, action) are the graded artefact; $\log_2 n$ ceilings answer all "how many steps" follow-ups.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Binary search, $n = 10^6$ sorted. Worst-case comparisons?
(A) $10^6$
(*B) $\lceil\log_2 10^6\rceil = 20$ — a million entries in twenty probes
(C) $500{,}000$
(D) $10^3$
::: explanation
$2^{20} \approx 10^6$: twenty halvings exhaust a million. That ratio ($10^6$ vs $20$) is the entire commercial for logarithmic search — quote both numbers.
:::

::: quiz Q2: Foundational Concept
When is linear search preferable to binary?
(A) Never
(*B) Unsorted small data (sorting costs more than scanning), linked lists (no $O(1)$ mid access), or all-occurrences retrieval
(C) Huge sorted arrays
(D) Always
::: explanation
Binary needs sorted random-access arrays; sorting $n$ items to search once costs $n\log n$ vs one $n$ scan. Lists can't midpoint-jump — linear is structural, not a fallback.
:::

::: quiz Q3: Numerical Drill
First occurrence of $7$ in $[2, 7, 7, 7, 9]$ via binary search. Result index?
(A) $2$ (first hit, stop)
(*B) $1$ — record hit at $2$, continue left (hi = mid$-1$); hit $1$, continue; miss left; answer $1$
(C) $3$
(D) $4$
::: explanation
Duplicates need the inward-continuing variant: never stop at a match, squeeze toward the target edge. Plain binary returns *some* $7$ (index $2$) — first/last variants pin the edge.
:::
