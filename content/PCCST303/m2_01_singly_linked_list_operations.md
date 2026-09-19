---
id: m2_01_singly_linked_list_operations
courseCode: PCCST303
module: 2
sequence: 1
title: Singly Linked Lists & Core Operations
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Build nodes and chase heads with exact operation costs
  - Perform insert-after and delete-after pointer surgery in order
  - Quote head versus positional costs for exam answers
concepts:
  - singly linked list
  - pointer surgery
  - operation costs
prerequisites: []
examRelevance: high
tags:
  - linked-lists
  - pointers
---
# Singly Linked Lists & Core Operations

**Nodes, head chasing, and insert/delete at every position — with exact pointer surgery.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Treasure Hunt
Each node is a clue-card: a value plus the *location* of the next card. The `head` is the first clue; `NULL` says "hunt over". Inserting mid-hunt means re-pointing two arrows (new card points where the old one did, predecessor points at the new card) — lose an arrow and the trail's tail vanishes forever (memory leak).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Node and operation costs

Node: (data, next). Insert/delete at head: $O(1)$. At position $k$ or by value: $O(n)$ search + $O(1)$ surgery. Traversal/search: $O(n)$. No shifting (arrays' $O(n)$ tax) — the linked payoff; price is no indexing ($a[i]$ impossible).

### 2.2 Pointer surgery (insert after $p$, delete after $p$)

Insert $q$ after $p$: `q->next = p->next; p->next = q;` — order matters (reversing orphans the tail). Delete after $p$: `tmp = p->next; p->next = tmp->next; free(tmp);`.

::: callout-formula KTU Formula Vault: Singly LL
Head $O(1)$ · search/position $O(n)$ · insert: **new-next first, then predecessor** · delete: **bypass, then free**.
:::

::: callout-pitfall Surgery Order
`p->next = q` *before* `q->next = p->next` aims $q$ at itself and drops the tail. New node's arrow first, old arrow second — chant it while writing code.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
List $10\to20\to30$. Insert $25$ after $20$, then delete the node after $10$. Show arrows after each step.
:::

::: step [Step 2: Execution] Two Surgeries
1. $q(25)$: `q->next` = $20$'s next ($30$); $20$'s next = $q$. Now $10\to20\to25\to30$.
2. After $10$ sits $20$: bypass → $10\to25\to30$; free $20$.
:::

::: step [Step 3: Conclusion] Final Result
$10\to25\to30$. Every list-manipulation answer is arrows-before/after pairs — draw both states, never just the finale.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why can't a singly linked list support $O(1)$ indexed access $a[i]$?
(A) Nodes are too big
(*B) Nodes scatter in memory with no address arithmetic — reaching $i$ needs $i$ hops from head
(C) Data is unsorted
(D) Head pointer is constant
::: explanation
Arrays compute addresses ($base + i\times size$); lists only store *next* hops, forcing sequential chase. Indexing is $O(n)$ — the fundamental array-vs-list trade.
:::

::: quiz Q2: Numerical Drill
Insert at head $n$ times, then traverse once. Total cost?
(A) $\Theta(n^2)$
(*B) $n\times O(1) + O(n) = \Theta(n)$
(C) $\Theta(1)$
(D) $\Theta(n\log n)$
::: explanation
Head inserts are $O(1)$ each ($n$ total) plus one $O(n)$ walk. Repeated *tail-without-tail-pointer* inserts would instead cost $\Theta(n^2)$ — know which end you pay at.
:::

::: quiz Q3: Foundational Concept
What happens if `free` is skipped after bypassing a node?
(A) Nothing ever
(*B) Memory leak — unreachable but allocated memory the program can never reclaim
(C) List reverses
(D) Head resets
::: explanation
The bypassed block has no incoming pointer yet still counts as used. Repeated leaks exhaust the heap — bypass *and* free are one atomic habit.
:::
