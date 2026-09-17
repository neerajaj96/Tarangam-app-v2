# Queues, Circular Queues & Deques

**FIFO discipline — the false-overflow fix, modulo arithmetic, and double-ended variants.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ticket Counter Line
Customers join the back (enqueue) and leave from the front (dequeue) — first-in-first-out, no queue-jumping. A straight rope-line wastes the space freed up front (**false overflow**: back hits the wall while the front stands empty). Bend the rope into a **ring** (circular queue): the back wraps to freed slots via modulo — no inch of rope wasted. A **deque** opens both ends as entrance *and* exit.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Linear queue pain

`front`/`rear` march right; after dequeues, cells before `front` are dead — `rear == MAX-1` cries overflow though space sits free. Resetting pointers on empty helps once; the ring fixes it permanently.

### 2.2 Circular queue mechanics

`rear = (rear+1) % MAX`, `front = (front+1) % MAX`. Full: `(rear+1) % MAX == front`; empty: `front == -1` (or a count/size field). Full vs empty ambiguity resolved by sacrificing one cell or keeping `count`.

### 2.3 Deque variants

Input-restricted (one entry end) vs output-restricted (one exit end); palindrome checking and sliding-window maxima are the classic deque showcases. Priority queues differ (service by key, not order) — M3's heaps cover them.

::: callout-formula KTU Formula Vault: Queue Ring
Enqueue/dequeue **$O(1)$** · wrap **$\%MAX$** · full **$(rear+1)\%MAX==front$** · one cell sacrificed (or count kept).
:::

::: callout-pitfall Full Looks Like Empty
`front == rear` after wraps is ambiguous (one element? full ring?). The sacrificed-cell rule (full = *next*-rear hits front) disambiguates — forgetting *why* one cell stays empty is the theory mark most missed.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Circular queue, MAX $= 4$ (holds $3$): enqueue A, B, C; dequeue; enqueue D, E. Show indices ($\%4$) and flag any overflow.
:::

::: step [Step 2: Execution] Wrapping Walk
1. A@0, B@1, C@2 (rear $= 2$; next $3 \ne$ front $0$ — not full since one cell rule? $(2+1)\%4 = 3 \ne 0$, room for one more).
2. Dequeue A (front $0\to1$). Enqueue D@3. Enqueue E: $(3+1)\%4 = 0$? front is $1$ — $(rear+1)\%4 = 0 \ne 1$, so E@0. Queue [E@0, B@1, C@2, D@3]... wait capacity holds $3$ with one sacrificed: rear $= 0$, $(0+1)\%4 = 1 ==$ front → **full** exactly. No overflow; ring absorbed the freed cell.
:::

::: step [Step 3: Conclusion] Final Result
Modulo reuses freed front cells; the sacrificed cell separates full from empty. Simulations must show *indices*, not just contents.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What is false overflow in a linear queue?
(A) Queue memory corrupts
(*B) `rear` hits the array end while free cells freed by dequeues sit unused before `front`
(C) Enqueue on an empty queue
(D) Dequeue returns wrong data
::: explanation
Marching pointers abandon the front region — the queue reports full with space available. Circular wrapping (or shifting) reclaims it; the "false" marks the overflow as spurious.
:::

::: quiz Q2: Numerical Drill
Circular MAX $= 5$, front $= 2$, rear $= 1$. Full or holding how many?
(A) Empty
(*B) Full — $(1+1)\%5 = 2 ==$ front (one cell sacrificed, holds $4$)
(C) Holds $1$
(D) Overflow error state
::: explanation
Next-rear meets front: the ring is full with $MAX-1 = 4$ elements. Reading `(rear+1)%MAX==front` mechanically beats intuition here.
:::

::: quiz Q3: Foundational Concept
Which task fits a deque but not a plain queue?
(A) Printer spooling
(*B) Palindrome checking — consuming from both ends toward the centre
(C) BFS frontier
(D) Call handling in order
::: explanation
Deques allow both-end access; matching outer pairs inward needs exactly that. FIFO-only structures (queues, spoolers, BFS) never need rear-side removal.
:::
