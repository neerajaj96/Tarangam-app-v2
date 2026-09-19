# Radix Sort & Sorting Comparison Drill

**Non-comparative sorting by digits — counting-sort passes, place-value order, and the full six-sort showdown.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Post Office Pigeonholes
Sort mail by street (ones), re-gather *stably*, then by town (tens), then city (hundreds) — after the most-significant pass, everything stands ordered, and stability preserved earlier passes' work. Cost = digits × (n + base) instead of comparisons — beats $n\log n$ when keys are short digit-strings. The $n\log n$ "limit" binds only *comparison* sorts; counting digits isn't comparing.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Radix mechanics

$d$ digit passes (LSD first), each a stable counting sort over base $b$: $\Theta(d(n+b))$. Stability *between passes* is load-bearing — unstable passes destroy lower-digit order. Needs fixed-width keys (pad with leading zeros).

### 2.2 Six-sort showdown

| Sort | Avg | Worst | Space | Stable | Note |
|---|---|---|---|---|---|
| Selection | $n^2$ | $n^2$ | $1$ | No | min-pick, swap-light |
| Insertion | $n^2$ | $n^2$ | $1$ | Yes | adaptive $\Theta(n)$ best |
| Quick | $n\log n$ | $n^2$ | $\log n$ | No | fastest in practice |
| Merge | $n\log n$ | $n\log n$ | $n$ | Yes | lists + external |
| Heap | $n\log n$ | $n\log n$ | $1$ | No | in-place guarantee |
| Radix | $d(n+b)$ | $d(n+b)$ | $n+b$ | Yes | non-comparative |

::: callout-formula KTU Formula Vault: Radix + Table
Passes **LSD→MSD, stable counting** · cost **$\Theta(d(n+b))$** · comparison lower bound **$\Omega(n\log n)$** doesn't apply.
:::

::: callout-pitfall Unstable Passes Wreck Radix
An unstable digit pass reorders equals from earlier (less-significant) passes — final output wrong despite correct per-pass buckets. Stability isn't a bonus here; it's the mechanism.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Radix-sort $[170, 45, 75, 90, 802, 24, 2, 66]$ (LSD, base $10$). Show state after ones and tens passes.
:::

::: step [Step 2: Execution] Pigeonhole Twice
1. Ones: buckets $0$:{170,90} $2$:{802,2} $4$:{24} $5$:{45,75} $6$:{66} → $[170,90,802,2,24,45,75,66]$.
2. Tens: $0$:{802,2} $2$:{24} $4$:{45} $6$:{66} $7$:{170,75} $9$:{90} → $[802,2,24,45,66,170,75,90]$. Hundreds pass finishes: $[2,24,45,66,75,90,170,802]$.
:::

::: step [Step 3: Conclusion] Final Result
Stable re-gathering is the step students skip in traces — show bucket contents *and* gathered order per pass, both graded.
:::

::: anim radix-buckets Radix Pigeonholes, Ones to Hundreds
Watch each digit pass bucket then re-gather stably — buckets and gathered order both shown, since both are graded and stability is the mechanism.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why must radix passes go LSD-first (least significant digit)?
(A) Tradition
(*B) Later (more-significant) passes re-bucket stably, preserving earlier order within equal higher digits — MSD-first would need recursion into buckets instead
(C) LSD is faster alone
(D) MSD-first is impossible
::: explanation
LSD-first + stability composes: each pass refines by a bigger place value while keeping ties' prior order. MSD-first works only with recursive bucket-sorting (MSD radix) — different algorithm, same stability demand inside.
:::

::: quiz Q2: Mixed Drill
Nearly-sorted $10^5$ array, $O(1)$ space, stability wanted. Pick?
(A) Merge sort
(*B) Insertion sort — $\Theta(n)$-ish on near-order, in-place, stable
(C) Heap sort
(D) Selection sort
::: explanation
Constraints intersect at insertion: adaptive linearity exploits near-order, $O(1)$ space fits, stability keeps ties. Merge wants $O(n)$ space; heap/quick break stability; selection ignores near-order.
:::

::: quiz Q3: Mixed Drill
$10^6$ fixed-width $32$-bit ints, speed paramount. Pick and cost?
(A) Quicksort $\Theta(n\log n)$
(*B) Radix ($4$ base-$2^8$ passes): $\Theta(4(n+256))$ — linear, beating comparison sorts by constants that matter at $10^6$
(C) Insertion sort
(D) Selection sort
::: explanation
Short fixed keys unlock non-comparative linear sorting: $4$ counting passes over $n+256$ buckets each. The $\Omega(n\log n)$ bound never applied — it governs comparisons, not digit buckets.
:::
