---
id: m2_04_circular_linked_list_variations
courseCode: PCCST303
module: 2
sequence: 4
title: Circular Linked Lists & Variations Drill
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Run ring structures with tail-to-head links and self-loop singles
  - Trace Josephus-style elimination without losing the ring
  - Pick the right list family for each exam scenario
concepts:
  - circular linked list
  - list-family selection
prerequisites:
  - m2_01_singly_linked_list_operations
  - m2_03_doubly_linked_list
examRelevance: medium
tags:
  - linked-lists
  - circular-list
---
# Circular Linked Lists & Variations Drill

**No NULL ends — round-robin structures, Josephus-style elimination, and the list-family decision drill.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ring of Chairs
Line up chairs in a ring: no first, no last — walk forever, and any chair reaches any other going forward. Keep one `tail` arrow (whose next *is* the head) and both ends serve in $O(1)$. Round-robin schedulers and multiplayer turns live here; the ring truly shines when the task itself is cyclic.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Ring mechanics

Last node's next = first (singly-circular); doubly-circular closes both directions. Empty = NULL; single node points to itself. Insert/delete mirror linear cases with wrap-aware edge handling (deleting the sole node NULLs the ring).

### 2.2 Family decision drill

| Need | Pick |
|---|---|
| $O(1)$ head ops, minimal memory | singly |
| delete-given-node $O(1)$, two-way walk | doubly |
| cyclic tasks, $O(1)$ both ends, one pointer | circular (tail-kept) |
| indexed access, cache locality | array, not a list |

::: callout-formula KTU Formula Vault: Circular
Tail's next **= head** · single node **self-loops** · empty **= NULL** · rotation is **free**.
:::

::: callout-pitfall Infinite Traversal
`while (p != NULL)` never ends on a ring — loop `do...while (p != start)` or count nodes first. Non-terminating traversal is the circular list's signature bug; state the stop rule in every walk.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Circular singly ring $1\to2\to3\to1$ (tail at $3$). Delete $1$ (head). Then insert $0$ as new head. Show tail throughout.
:::

::: step [Step 2: Execution] Ring Surgery
1. Head $= 1$'s next ($2$); tail($3$).next $=$ head($2$). Ring $2\to3\to2$, tail $3$.
2. $0$.next $=$ head($2$); tail($3$).next $= 0$; head $= 0$. Ring $0\to2\to3\to0$.
:::

::: step [Step 3: Conclusion] Final Result
Head moves are $O(1)$, but the *tail's* arrow must follow every head change — the one extra invariant rings demand over lines.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
How do you detect the end of a circular list traversal?
(A) NULL check
(*B) Return-to-start check (`p == start`) or a pre-counted node count — NULL never appears
(C) It cannot be traversed
(D) Exception handler
::: explanation
Rings have no NULL terminator; `!= NULL` loops forever. Anchor the start (do-while) or count first — termination condition is structural, not sentinel-based.
:::

::: quiz Q2: Foundational Concept
Round-robin CPU scheduling uses a circular list because:
(A) Processes are sorted
(*B) The scheduler cycles uniformly forever with $O(1)$ rotation and no end-of-list resets
(C) Memory is saved massively
(D) Priorities need heaps
::: explanation
Cyclic fairness *is* ring traversal: each turn advances one node, wrapping free. Linear lists would special-case the wrap every cycle — the ring absorbs it.
:::

::: quiz Q3: Mixed Drill
Need $O(1)$ insert at both ends + backward walk, memory secondary. Pick?
(A) Singly + tail
(*B) Doubly with head and tail — both-end $O(1)$ plus reverse traversal
(C) Circular singly, head only
(D) Array
::: explanation
Two-way + two-end requirements jointly force doubly-with-tail (or doubly-circular). Singly can't walk back; arrays can't $O(1)$-prepend. Match *all* stated needs, not just one.
:::
