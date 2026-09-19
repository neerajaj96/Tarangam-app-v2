---
id: m1_04_stacks_multistacks_applications
courseCode: PCCST303
module: 1
sequence: 4
title: Stacks, Multi-Stacks & Applications
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Implement array stacks with exact overflow and underflow guards
  - Share one array between two stacks with the meeting-tops condition
  - Point at the hidden stacks behind calls, undo and parsing
concepts:
  - LIFO discipline
  - multi-stack sharing
  - stack applications
prerequisites:
  - m1_01_data_structures_adt_abstraction
examRelevance: medium
tags:
  - stacks
  - adt-implementation
---
# Stacks, Multi-Stacks & Applications

**LIFO discipline — array implementation, overflow/underflow, two stacks in one array, and where stacks secretly run the machine.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Cafeteria Plates
Clean plates stack; you take the *top* one (pop), staff add to the *top* (push) — last-in-first-out, no reaching inside. The spring underneath is the `top` pointer. **Multi-stacks** split one long shelf into two plate piles growing toward each other (two tops, one shared overflow) — shelf space is shared instead of half-wasted.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Array stack and its errors

`top = -1` empty; push: `stack[++top] = x` if `top < MAX-1` else **overflow**; pop: `return stack[top--]` if `top >= 0` else **underflow**; peek reads `stack[top]`. All $O(1)$.

### 2.2 Two stacks, one array

Stack A grows from the left (`topA`), stack B from the right (`topB`); overflow only when `topA + 1 == topB`. Utilisation doubles versus fixed halves.

### 2.3 Applications (exam list)

Function calls/recursion (call stack), undo, back-button, bracket matching, expression conversion/evaluation (next topics), DFS frontier, backtracking state.

::: callout-formula KTU Formula Vault: Stack
Push/pop/peek **$O(1)$** · empty `top=-1` · overflow `top==MAX-1` · dual stacks meet at **`topA+1==topB`**.
:::

::: callout-pitfall Overflow vs Underflow Direction
Push-on-full = overflow; pop-on-empty = underflow. Swapping the names (or the guard conditions) is the most penalised two-line error in implementation questions.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Simulate pushes/pops on capacity-$4$ stack for: push 10, push 20, pop, push 30, push 40, push 50, pop, pop, pop, pop. Flag errors and final state.
:::

::: step [Step 2: Execution] Top Pointer Walk
1. [10] → [10,20] → pop 20 → [10] → push 30, 40 → [10,30,40] → push 50 → [10,30,40,50] (full).
2. pop 50, 40, 30, 10 → empty. Final pop → **underflow**. Popped order $20, 50, 40, 30, 10$ — reverse of arrival, LIFO confirmed.
:::

::: step [Step 3: Conclusion] Final Result
Track `top` after every op; full-array push and empty pop are the only two alarms. Simulation questions grade the *sequence* of states, not just the finale.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Push 5, 9; pop; push 7; pop; pop. Popped sequence and final state?
(A) 5, 9, 7 — empty
(*B) 9, 7, 5 — empty (LIFO: last pushed leaves first among residents)
(C) 5, 7, 9 — one left
(D) 9, 5, 7 — underflow
::: explanation
After push 5,9: pop takes $9$; push 7: pop takes $7$; pop takes $5$. Order $9,7,5$, stack empty, no errors — the canonical LIFO trace.
:::

::: quiz Q2: Foundational Concept
Why do two stacks share one array from opposite ends?
(A) To double speed
(*B) To share free space — overflow happens only when the *combined* contents fill the array, not when one fixed half fills
(C) To sort elements
(D) To allow middle access
::: explanation
Fixed halves waste the emptier side; opposite growth pools slack. The single meeting condition `topA+1==topB` is the whole mechanism.
:::

::: quiz Q3: Foundational Concept
Which uses a stack: queue, recursion, or binary search (iterative)?
(A) Queue
(*B) Recursion — return addresses and locals stack per call, unwinding LIFO
(C) Iterative binary search
(D) None
::: explanation
Each call pushes a frame; returns pop in reverse — recursion *is* stack discipline. Iterative binary search loops with $O(1)$ state; queues are FIFO by definition.
:::
