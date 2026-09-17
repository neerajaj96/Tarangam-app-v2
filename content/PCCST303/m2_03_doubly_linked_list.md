# Doubly Linked Lists

**Two-way arrows — $O(1)$ deletion with the node itself, at the price of double pointer upkeep.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Double-Ended Chain
Singly links are one-way streets (to remove $X$ you must drive from town start to $X$'s predecessor). Doubly links pave the return lane: each node knows its predecessor, so deletion given *only the node* rewires both neighbours in $O(1)$. Cost: every surgery now moves *four* arrows (two per side) instead of two — double the bookkeeping, double the bug surface.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Node and delete-given-node

Node: (prev, data, next). Delete $p$: `p->prev->next = p->next; p->next->prev = p->prev; free(p);` — $O(1)$ with no search. Insert before/after similarly touches four links. Edge nodes need NULL guards (head's prev, tail's next).

### 2.2 Trade table vs singly

Bidirectional traversal; $O(1)$ delete-given-node and $O(1)$ insert-at-both-ends (with tail pointer); costs extra memory per node + heavier surgery + trickier edge cases.

::: callout-formula KTU Formula Vault: Doubly LL
Delete-given-node **$O(1)$** · surgery touches **4 links** · NULL-guard **both ends**.
:::

::: callout-pitfall Half-Rewired Neighbours
Updating `next` arrows but forgetting the mirrored `prev` arrows corrupts backward traversal silently — forward tests pass, backward walks crash. Every surgery must state *both* directions' rewiring.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
DLL $A\leftrightarrow B\leftrightarrow C$. Delete $B$ given only $B$'s address. Then insert $D$ before $A$ (new head).
:::

::: step [Step 2: Execution] Four Arrows, Then Head Swap
1. $A$.next $= C$; $C$.prev $= A$; free $B$. Result $A\leftrightarrow C$.
2. $D$.next $= A$; $A$.prev $= D$; $D$.prev $=$ NULL; head $= D$. Result $D\leftrightarrow A\leftrightarrow C$.
:::

::: step [Step 3: Conclusion] Final Result
No search anywhere — addresses suffice. DLL answers list *both* arrows per seam; single-direction answers are incomplete by definition.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Singly needs $O(n)$ to delete by value; doubly deletes in $O(1)$ given the node. Why the gap?
(A) Doubly nodes are smaller
(*B) The node's own `prev` reaches the predecessor directly — singly must walk from head to find it
(C) Doubly lists are sorted
(D) Singly lists lack data
::: explanation
Deletion rewires the *predecessor*; singly locates it by $O(n)$ search, doubly reads it in $O(1)$ from the node. Given-node deletion is the doubly list's raison d'être.
:::

::: quiz Q2: Foundational Concept
What is the main cost of doubly over singly linked lists?
(A) Slower traversal
(*B) Extra `prev` pointer per node plus four-link surgery with more edge cases
(C) No backward walk
(D) Fixed capacity
::: explanation
Memory $+1$ pointer/node; every insert/delete rewires both directions with NULL guards at both ends. Pay it only when backward moves or given-node deletes dominate.
:::

::: quiz Q3: Numerical Drill
DLL with head + tail pointers: insert at tail cost?
(A) $O(n)$
(*B) $O(1)$ — tail pointer gives the end directly; splice and advance tail
(C) $O(\log n)$
(D) $O(n^2)$
::: explanation
Cached tail eliminates the walk: link after tail, move tail. Head+tail doubly lists serve both ends in $O(1)$ — the deque-grade structure (next topic's circular cousin).
:::
