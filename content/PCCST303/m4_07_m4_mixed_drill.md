---
id: m4_07_m4_mixed_drill
courseCode: PCCST303
module: 4
sequence: 7
title: 'M4 Drill: Sort Traces, Search Counts & Hash Tables'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Trace one sort per family with exact intermediate states
  - Count search probes and iterations across both searches
  - Fill hash tables slot by slot with the load factor quoted
concepts:
  - sort traces
  - probe counting
prerequisites:
  - m4_04_radix_sort_comparison_drill
  - m4_05_linear_binary_search
  - m4_06_hashing_functions_collisions
examRelevance: high
tags:
  - sorting
  - m4-drill
---
# M4 Drill: Sort Traces, Search Counts & Hash Tables

**Full-module workout — one trace per family, one count per search, one table per hash.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Machines
Sorter (show states), searcher (count probes), hasher (show slots). M4 exams run all three machines — feed each its canonical demo and narrate the mechanism, not just the output.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Machine settings

Sorts: quadratics $n^2$ (insertion adaptive/stable) vs $n\log n$ (quick avg, merge/heap guaranteed) vs radix $d(n+b)$ · search: linear $n$ vs binary $\log n$ (sorted!) · hash: $\alpha = n/m$, chain $1+\alpha$, probe walks, tombstones, rehash $\approx 0.7$.

::: callout-formula KTU Formula Vault: M4 Machines
Trace **states** · count **probes** · fill **slots** · quote **$\alpha$**.
:::

::: callout-exam KTU Exam Focus
The 9-marker is a sort trace (passes with the working zone marked) plus hashing inserts with collision handling, or binary-search steps. States-per-step grading — input→output alone earns a third.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Insertion-sort pass states for $[5, 2, 4, 6, 1, 3]$ up to the third card. (b) Binary probes for $6$ in $[1,2,3,4,5,6,7]$? (c) $m = 5$, insert $7, 12$ (division) with chaining?
:::

::: step [Step 2: Execution] Three Machines
1. $[5]$ → $2$ shifts past: $[2,5]$ → $4$ past $5$: $[2,4,5]$ (third card placed; $2$ shifts so far).
2. mid$3$ ($4<6$) → mid$5$ ($6$ hit): $2$ probes.
3. $7\bmod5 = 2$; $12\bmod5 = 2$ → chain at slot $2$: $[7,12]$.
:::

::: step [Step 3: Conclusion] Final Result
Shifts counted, probes halved, chains appended — one verb per machine, all visible in the trace.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Which sort for linked lists, and why?
(A) Heap sort
(*B) Merge sort — sequential access fits list traversal, $O(1)$ extra via pointer relinking, stable $n\log n$
(C) Quick sort with arrays logic
(D) Selection sort
::: explanation
Merge needs no random access (halving by pointer chase, zipping by relink) — lists erase its $O(n)$-space tax while keeping guarantees. Quicksort's indexing and heap's jumping both fight list structure.
:::

::: quiz Q2: Mixed Drill
$n = 2^{20}$ sorted array. Linear vs binary worst-case probes?
(A) Equal
(*B) $\approx 10^6$ vs $20$ — five orders of magnitude from one sortedness assumption
(C) $20$ vs $10^6$
(D) Both $20$
::: explanation
$1{,}048{,}576$ scans vs $20$ halvings. This single comparison justifies every sorting investment before searching — preprocessing pays per query.
:::

::: quiz Q3: Mixed Drill
Chained table $m = 10$, $n = 30$. Expected search probes and action?
(A) $1$, nothing
(*B) $\approx 1+\alpha = 4$ — rehash ($\alpha = 3$ is far past healthy; double $m$ repeatedly toward $\le 0.7$–$1$)
(C) $30$, rebuild as BST
(D) $0.33$, shrink table
::: explanation
$1+\alpha = 4$ average probes and worsening — chains this long signal gross overload. Rehash bigger (target $\alpha \lesssim 1$ for chaining); shrinking would detonate it further.
:::
