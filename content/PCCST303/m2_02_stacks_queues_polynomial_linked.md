# Stacks, Queues & Polynomials via Linked Lists

**Rebuilding M1's ADTs on nodes — unbounded stacks, two-pointer queues, and exponent-ordered polynomial lists.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Same Menu, New Kitchen
The stack/queue *contracts* don't change — only the machinery swaps from arrays to nodes. Bonus: node-stacks never overflow (heap-sized, not array-sized); queues gain a `rear` arrow for $O(1)$ entries. Polynomials become exponent-sorted node chains where addition is, again, the merge walk — now with pointer surgery instead of index arithmetic.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Linked stack and queue

* **Stack:** push = insert-at-head, pop = delete-head — all $O(1)$, no capacity, no overflow (only heap exhaustion).
* **Queue:** keep `front` + `rear`; enqueue at rear ($O(1)$), dequeue at front ($O(1)$); single-node queue needs both reset to NULL.

### 2.2 Polynomial lists

Node (coeff, exp, next), descending exponents; add by merge-walking two chains, splicing or summing; zero-sum terms freed, not stored.

::: callout-formula KTU Formula Vault: Linked ADTs
Stack = **head ops** · queue = **rear-in, front-out** · poly = **merge-walk on exp chains**.
:::

::: callout-pitfall The Lonely-Node Queue
Dequeuing the last node must NULL *both* `front` and `rear` — a dangling `rear` later grafts new nodes onto freed memory. One-node cases deserve their own test line in every queue routine.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Linked queue: enqueue X, Y; dequeue; enqueue Z. Show front/rear. Then add $4x^2+1$ and $3x+2$ as node chains.
:::

::: step [Step 2: Execution] Arrows and Exponents
1. X(f,r) → X(f),Y(r) → dequeue X → Y(f,r) → enqueue Z → Y(f),Z(r).
2. Chains $[4,2]\to[1,0]$ and $[3,1]\to[2,0]$: exponents $2>1$ emit $4x^2$; $1$ only in B emit $3x$; $0$: $1+2 = 3$. Result $4x^2+3x+3$.
:::

::: step [Step 3: Conclusion] Final Result
Queue answers track *two* pointers; polynomial answers walk *two* chains. Dual tracking is the whole skill — narrate both sides per step.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why can't a linked stack overflow like an array stack?
(A) It is slower
(*B) Nodes come from the heap on demand — capacity grows until system memory, not a fixed MAX
(C) It has no top
(D) Pointers prevent pushes
::: explanation
Array stacks pre-commit MAX cells; linked stacks allocate per push. "Overflow" needs a fixed bound — none exists (only eventual heap exhaustion, a different failure).
:::

::: quiz Q2: Foundational Concept
Why does a linked queue keep a `rear` pointer?
(A) For decoration
(*B) Without it, enqueue scans $O(n)$ to the tail; `rear` makes entry $O(1)$ like exit
(C) To reverse the queue
(D) To count elements
::: explanation
Singly lists only move forward — tail access from head costs a full walk. `rear` caches the tail; both ends then serve in $O(1)$, matching the queue contract.
:::

::: quiz Q3: Numerical Drill
Add $5x^3+x$ and $2x^3+4$ via chains. Terms emitted?
(A) $7x^6+4$
(*B) $7x^3$, then $x$ (B lacks it), then $4$ (A lacks it): $7x^3+x+4$
(C) $5x^3+2x^3+x+4$ unmerged
(D) $7x^3+5$
::: explanation
Equal exponents ($3$) sum to $7x^3$; loners $x$ and $4$ splice through. Merge-walk, identical to the array version — only the splicing mechanics differ.
:::
