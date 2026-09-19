---
id: m2_06_garbage_compaction_m2_drill
courseCode: PCCST303
module: 2
sequence: 6
title: Garbage Collection, Compaction & M2 Drill
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Reclaim unreachable nodes with mark-sweep and reference counting
  - Compact with sliding moves plus pointer fixes
  - Run the M2 drill across list variants and memory schemes
concepts:
  - mark-sweep collection
  - compaction
prerequisites:
  - m2_01_singly_linked_list_operations
  - m2_05_memory_allocation_fits
examRelevance: high
tags:
  - memory-management
  - m2-drill
---
# Garbage Collection, Compaction & M2 Drill

**Reclaiming the unreachable — mark-sweep, reference counting, sliding compaction, and the module drill.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: City Cleanup
Leaked nodes are abandoned buildings (no road from `head` reaches them). **Mark-sweep** census-walks from every root, paints the reachable, and bulldozes the unpainted. **Reference counting** posts a guard per building counting incoming roads — zero guards, demolish immediately (but roundabout rings of guards fool it forever). **Compaction** then slides survivors together, reforming one grand vacant lot from scattered gaps.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Collectors

* **Mark-sweep:** mark phase traces roots ($O(\text{reachable})$); sweep frees unmarked. Handles cycles; pauses the program (stop-the-world).
* **Reference counting:** counter per block, adjust on pointer ops; frees at zero instantly, distributed cost — fails on cyclic garbage (mutual counts never hit zero).
* **Compaction:** moves live blocks contiguously, updates pointers — kills external fragmentation at the price of moving cost + pointer fixups.

### 2.2 M2 drill map

Singly surgery order → linked stack/queue pointers → doubly four-link rule → ring stop-rule → fit simulations → collector choice (cycles? → mark-sweep).

::: callout-formula KTU Formula Vault: Reclaim
Mark-sweep: **trace roots, free unmarked** · refcount: **zero-count frees, cycles survive** · compaction: **slide + fix pointers**.
:::

::: callout-pitfall Cycles Kill Refcounting
$A\leftrightarrow B$ isolated from roots: counts stay $\ge 1$ forever — leaked but "guarded". Any question mentioning cyclic structures answers mark-sweep (or backup tracing), never pure refcounting.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Heap: root $R\to A\to B$; $C\leftrightarrow D$ isolated pair; $E$ isolated single. (a) Mark-sweep outcome? (b) Pure refcount outcome? (c) Compact the survivors.
:::

::: step [Step 2: Execution] Two Cleanups
1. **Mark-sweep:** marks $R,A,B$; frees $C,D,E$ (pair + single alike — reachability is all that matters).
2. **Refcount:** $E$ (count $0$) freed; $C,D$ keep counts $\ge 1$ mutually — leaked survivors, collector defeated.
3. **Compaction:** slide $R,A,B$ to one end; one free block of size $|C|+|D|+|E|$ forms.
:::

::: step [Step 3: Conclusion] Final Result
Reachability beats counting whenever cycles exist. Hew to the question's structure words ("cyclic", "isolated pair") — they select the collector.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why does reference counting fail on cyclic garbage?
(A) Counters overflow
(*B) Mutual references keep every member's count $\ge 1$ though nothing outside reaches them — zero-count never triggers
(C) Cycles run faster
(D) Roots are ignored
::: explanation
Freeness needs *external* unreachability, but counters only see *local* incoming edges. The ring sustains itself numerically while leaked semantically — tracing collectors see through it.
:::

::: quiz Q2: Foundational Concept
What does compaction achieve that sweeping alone doesn't?
(A) Faster marking
(*B) Contiguous free space — sliding live blocks together converts scattered holes into one usable block, curing external fragmentation
(C) Cycle detection
(D) Smaller pointers
::: explanation
Sweep frees cells in place (fragmented); compaction *relocates* the living and fuses the gaps. Price: moving cost plus updating every affected pointer — done during pauses.
:::

::: quiz Q3: Mixed Drill
Doubly list $P\leftrightarrow Q$: delete $P$ as head given head pointer. Arrows?
(A) Head $= Q$ only
(*B) Head $= Q$; $Q$.prev $=$ NULL; free $P$ — both the head move and the orphaned backward link
(C) Free $P$ only
(D) $Q$.next $=$ NULL
::: explanation
Head advance plus NULLing the new head's `prev` (else backward walks step into freed $P$). DLL head deletion = singly's move + the mirror-link cleanup — both halves for the mark.
:::
