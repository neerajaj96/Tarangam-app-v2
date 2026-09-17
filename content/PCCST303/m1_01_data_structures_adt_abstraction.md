# Data Structures, ADTs & Data Abstraction

**What a data structure is, what an ADT promises, and why abstraction walls make programs survivable.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Restaurant Menu vs Kitchen
An **ADT** is the menu (lists dishes, hides recipes); a **data structure** is the kitchen (stoves, pans, actual cooking). Diners order from the menu and never enter the kitchen — change the kitchen (array → linked list) and regulars notice nothing as long as the menu holds. **Data abstraction** is this wall: use the *what*, hide the *how*.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Definitions

* **Data type:** set of values + allowed operations (e.g. integers + arithmetic).
* **ADT:** *logical* specification of values and operations with no implementation (Stack: push/pop/peek; Queue: enqueue/dequeue; List: insert/delete/traverse).
* **Data structure:** *physical* implementation (arrays, linked storage) realising one or more ADTs, with concrete time/space costs.
* **Data abstraction:** exposing interface while hiding representation — enables independent reasoning, safe reuse, and painless reimplementation.

### 2.2 Classification snapshot

Primitive (int, char, float) vs composite; linear (arrays, stacks, queues, lists — one-by-one order) vs non-linear (trees, graphs — branching). Performance analysis (next topic) is how kitchens get compared.

::: callout-formula KTU Formula Vault: ADT Wall
ADT = **interface (what)** · structure = **implementation (how)** · linear: **one successor**; non-linear: **many**.
:::

::: callout-pitfall ADT vs Structure Swap
"Stack is a data structure" loses the distinction mark: Stack is an *ADT* (LIFO contract); an *array* or *linked list* is the structure implementing it. Name both sides whenever asked to "define with example".
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Define ADT. Identify the ADT, the data structure, and the abstraction benefit when a browser's back-button history switches from array to linked implementation."
:::

::: step [Step 2: Execution] Menu, Kitchen, Payoff
1. **ADT:** history with visit/go-back operations (stack behaviour).
2. **Structure:** array first, linked list later — both honour the same push/pop contract.
3. **Benefit:** browser code calls go-back identically; the swap fixes growth limits with zero caller changes — abstraction localises the edit.
:::

::: step [Step 3: Conclusion] Final Result
One definition, one mapping, one benefit sentence — the complete 3-mark ADT answer template.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What is the difference between an ADT and a data structure?
(A) They are synonyms
(*B) ADT specifies operations logically without implementation; a data structure is the concrete implementation with real costs
(C) ADTs are slower
(D) Data structures have no operations
::: explanation
ADT = contract (Stack: LIFO push/pop); structure = machinery (array/linked). Multiple structures can serve one ADT with different performance — the freedom abstraction buys.
:::

::: quiz Q2: Foundational Concept
Arrays, stacks and queues are called linear because:
(A) They use straight memory
(*B) Elements form a single ordered sequence — each (except ends) has exactly one predecessor and one successor
(C) They are drawn as lines
(D) They sort quickly
::: explanation
Linearity is about logical order, not memory layout: one-in-line traversal. Trees/graphs break this (branching/multiple neighbours) and are non-linear.
:::

::: quiz Q3: Foundational Concept
Why does data abstraction help large programs?
(A) It removes all bugs
(*B) Callers depend only on the stable interface, so implementations can change without rewriting callers
(C) It makes code run faster automatically
(D) It deletes documentation needs
::: explanation
The wall contains change: optimise or swap the kitchen while the menu (and every diner) stays put. Reasoning also splits — correctness of use vs correctness of implementation, checked separately.
:::
