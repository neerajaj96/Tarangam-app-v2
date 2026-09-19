---
id: m2_05_memory_allocation_fits
courseCode: PCCST303
module: 2
sequence: 5
title: 'Memory Allocation: First, Best & Worst Fit'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Place requests with first, best and worst fit strategies
  - Split blocks on allocation and coalesce holes on free
  - Compute fragmentation outcomes for exam arithmetic
concepts:
  - fit strategies
  - fragmentation
prerequisites: []
examRelevance: medium
tags:
  - memory-management
  - allocation
---
# Memory Allocation: First, Best & Worst Fit

**Placing requests into free holes — the three fit strategies, splitting, and fragmentation arithmetic.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Parking Lot
Free memory holes are parking gaps; each job is a car. **First-fit** takes the first gap that fits (fast, front of the lot clutters). **Best-fit** hunts the *tightest* gap (slow search, tiny useless slivers everywhere). **Worst-fit** takes the *roomiest* gap hoping leftovers stay usable (often backfires). Splitting parks the car and re-signs the remainder; merging rejoins neighbours on exit.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The three strategies

* **First-fit:** scan from start, use first hole $\ge$ request. $O(n)$ worst, low search overhead, accumulates small holes up front.
* **Best-fit:** smallest sufficient hole. Least waste per placement but leaves micro-slivers; full scan always.
* **Worst-fit:** largest hole. Tries to preserve usable remainders; full scan + counter-intuitive failures.

Split larger holes (allocated + smaller free remainder); coalesce adjacent free blocks on release. **External fragmentation** = scattered free total that no single request can use.

::: callout-formula KTU Formula Vault: Fits
First = **first sufficient** · best = **tightest** · worst = **roomiest** · split on alloc, **coalesce on free**.
:::

::: callout-pitfall Best-Fit Isn't Best Overall
"Best" minimises *this* placement's waste but litters unusable slivers, often losing long-term. Strategy questions ask for simulation fidelity, not advocacy — trace the rule, don't editorialise.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Holes (in order): $20, 35, 10, 40$ KB. Requests: $15$, then $30$ KB. Place by first-fit and by best-fit; state leftovers.
:::

::: step [Step 2: Execution] Two Parkings
1. **First-fit:** $15\to20$ (leaves $5$); $30\to35$ (leaves $5$). Holes: $5, 5, 10, 40$.
2. **Best-fit:** $15\to20$ (tightest sufficient; leaves $5$); $30\to35$ (leaves $5$). Same here — then $10$ KB request would expose the difference ($10\to10$ exact under best-fit vs $10\to5$? no — first-fit scans $5,5$ (too small), then $10$ exact; identical again — differences need crafted sequences, which is itself the exam lesson).
:::

::: step [Step 3: Conclusion] Final Result
Simulate strictly in order with splitting; leftovers narrate fragmentation. When traces coincide, say *why* (order + sizes) — comparison insight earns the analysis mark.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Holes $25, 10, 30$; request $12$. Placements under each fit?
(A) All choose $25$
(*B) First-fit $25$ (first sufficient in order); best-fit $25$ (tighter than $30$); worst-fit $30$ (roomiest)
(C) All choose $30$
(D) All choose $10$
::: explanation
First-fit stops at the first hole $\ge 12$ ($25$). Best-fit compares sufficient holes $\{25, 30\}$ and takes $25$. Worst-fit takes the largest ($30$). $10$ is never chosen (too small). Read each rule literally per request — no lookahead.
:::

::: quiz Q2: Foundational Concept
What is external fragmentation?
(A) Corrupted memory chips
(*B) Free memory split into scattered holes, none big enough alone, though the total suffices
(C) Stack overflow
(D) Duplicate allocations
::: explanation
Usable-in-sum but unusable-in-pieces — the placement-level consequence of splitting without (or despite) coalescing. Compaction (next topic) is the cure.
:::

::: quiz Q3: Foundational Concept
Why coalesce freed blocks with neighbours?
(A) To speed the CPU
(*B) To fuse adjacent free holes into bigger ones, fighting external fragmentation at release time
(C) To encrypt memory
(D) To shrink programs
::: explanation
Release-time merging converts two small neighbours into one useful hole for free (boundary-tag bookkeeping). Without it, every split permanently litters — fragmentation by design.
:::
