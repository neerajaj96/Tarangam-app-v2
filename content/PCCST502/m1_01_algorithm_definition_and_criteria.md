---
id: m1_01_algorithm_definition_and_criteria
courseCode: PCCST502
module: 1
sequence: 1
title: 'Algorithms: Characteristics & Analysis Criteria'
difficulty: beginner
estimatedMinutes: 7
learningObjectives:
  - Test instructions against finiteness, definiteness and effectiveness
  - Separate space from time efficiency with input and output contracts
  - Count in the RAM model of computation
concepts:
  - algorithm criteria
  - RAM model
  - efficiency measures
prerequisites: []
examRelevance: medium
tags:
  - foundations
  - algorithms
---
# Algorithms: Characteristics & Analysis Criteria

**Finiteness, definiteness, input, output, effectiveness, space vs time efficiency, and RAM model of computation.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model
Think of an algorithm like a recipe for making tea. A real recipe has to: (1) actually end — it can't say "keep stirring forever," (2) every instruction has to be crystal clear — "add sugar" is vague, "add 2 teaspoons of sugar" is not, (3) it needs ingredients to start with (input) — you can't make tea from nothing, (4) it needs to produce tea at the end (output) — a recipe that produces nothing is useless, and (5) every step has to be something you can *actually do* with what you have — "add a pinch of moon dust" fails this, because moon dust isn't a real, obtainable ingredient.

An algorithm in computer science is judged by exactly these five properties. If even one is missing, it's not a valid algorithm — it might be a vague idea, or an infinite process, or a wish list, but not something a computer (or a person) can reliably execute and get a guaranteed result from. This section pins down these five properties precisely, and then introduces the **RAM model** — a simplified, idealised computer we imagine when analysing algorithms, so that our analysis doesn't depend on which actual physical machine the code runs on.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

**Definition.** An algorithm is a *finite* sequence of well-defined, unambiguous instructions to solve a problem or perform a computation.

**The five defining criteria** (all must hold):

1. **Finiteness** — the algorithm must terminate after a finite number of steps, for every valid input. A process that can run forever (like an operating system's main loop) is *not* an algorithm in this strict sense — it's sometimes called a "computational procedure" instead.
2. **Definiteness** — every instruction must be precisely and unambiguously specified. There should be no room for a person or machine to interpret a step in two different ways.
3. **Input** — an algorithm has zero or more quantities supplied to it externally, before or during execution.
4. **Output** — an algorithm produces at least one quantity as a result, and this output must have a specified, provable relationship to the inputs (i.e., it must actually solve the stated problem).
5. **Effectiveness** — every operation used in the algorithm must be basic enough to be done, in principle, exactly and in a finite amount of time, by a person using pencil and paper. "Guess the right answer" is not effective; "add two numbers" is.

**The RAM (Random Access Machine) model.** To analyse algorithms mathematically, we imagine a simplified idealised computer:
- It has an unlimited amount of memory, organised as a sequence of numbered cells, each holding one value, and each cell can be accessed ("randomly accessed," hence the name) in exactly one unit of time regardless of its address.
- Basic operations — addition, subtraction, comparison, assignment, array indexing — each take exactly one unit of time ("$O(1)$," a constant amount of work), regardless of the size of the numbers involved.
- Instructions execute one at a time, sequentially (no parallelism).

This model deliberately ignores real-world complications like CPU cache effects, pipelining, or memory hierarchy, because including them would make analysis depend on a specific physical machine. The RAM model gives every algorithm a fair, hardware-independent playing field.

**Space vs time efficiency — the fundamental trade-off.** *Time efficiency* asks "how many basic operations does this algorithm perform, as a function of input size $n$?" *Space efficiency* asks "how much extra memory does it need, beyond the input itself, as a function of $n$?" These two often trade off against each other: e.g., you can speed up a computation by *pre-computing and storing* results (using more space to save time — "memoization"), or save space by *recomputing* values instead of storing them (using more time to save space). Neither is "better" in general — the right choice depends on what resource (time or memory) is scarcer for the situation at hand.

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Consider this pseudo-procedure: "To find the largest number in a list, keep guessing numbers until you feel confident you've found the biggest one." We want to check whether this qualifies as an algorithm.
:::

::: step [Step 2: Execution] Applying Core Algorithm
Check it against all five criteria: Finiteness — "keep guessing until you feel confident" has no guaranteed stopping point; it could run forever if you're never confident. Definiteness — "feel confident" is not a precise, checkable condition; two different people (or the same person twice) could stop at different points. Input — the list is given input, so this criterion is fine. Output — a number is produced, so this is fine. Effectiveness — "guessing" a number without a rule for which number to guess isn't a well-defined, mechanically executable operation.
:::

::: step [Step 3: Conclusion] Final Result
This procedure fails Finiteness, Definiteness, and Effectiveness — so it is *not* a valid algorithm. A valid algorithm for the same task: "Set max = first element. For each remaining element, if it is greater than max, set max = that element. Return max." This version terminates after exactly $n-1$ comparisons (finite), has an unambiguous rule at every step (definite), and every operation (compare, assign) is basic and mechanically executable (effective).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz A set of instructions that includes the step "repeat until the result looks good enough" fails which criterion of a valid algorithm?
() Input
() Output
(*) Definiteness (and possibly Finiteness, since "good enough" has no guaranteed stopping point)
() Effectiveness only
::: explanation
"Looks good enough" is subjective and not precisely specified — two executions could stop at different points, or never stop at all. This directly violates Definiteness, and since there's no guarantee it ever terminates, it also threatens Finiteness.
:::

::: quiz In the RAM model of computation, an operation like adding two numbers or comparing two array elements is assumed to take:
() Time proportional to the size of the numbers involved
(*) A constant amount of time, $O(1)$, regardless of input size
() Time proportional to the total memory available on the machine
() An unpredictable, machine-dependent amount of time
::: explanation
The RAM model's whole purpose is to give a hardware-independent baseline: it assumes basic operations (arithmetic, comparison, assignment, memory access) each cost exactly one unit of time, so that analysis of an algorithm's growth rate isn't muddied by real machine quirks like cache misses or clock speed.
:::

::: quiz Which statement best captures the relationship between time efficiency and space efficiency?
() They always improve together — a faster algorithm always uses less memory
(*) They often trade off against each other — using extra memory to store precomputed results can save time, and vice versa
() Space efficiency is irrelevant in modern computing and can be ignored
() Time efficiency only matters for recursive algorithms
::: explanation
A classic example is memoization: storing (caching) previously computed results uses more space, but saves the time of recomputing them. Conversely, recomputing values on the fly instead of storing them saves memory at the cost of extra computation time. Good algorithm design often means consciously choosing where on this trade-off you want to sit.
:::
