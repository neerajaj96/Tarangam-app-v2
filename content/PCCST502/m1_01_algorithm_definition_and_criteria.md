---
id: m1_01_algorithm_definition_and_criteria
courseCode: PCCST502
module: 1
sequence: 1
title: 'Algorithms: Characteristics & Analysis Criteria'
difficulty: beginner
estimatedMinutes: 10
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
## 1. Start from zero — the problem first

**Problem first.** Before comparing algorithms, we must agree on what counts as one. "Keep guessing until it looks right" is advice, not an algorithm: two people following it do different things, and it might never finish. A computer needs instructions so precise that *no interpretation* is possible and finishing is *guaranteed*.

::: callout-intuition Core Mental Model
Think of an algorithm like a recipe for making tea. A real recipe must: (1) actually end — never "keep stirring forever", (2) make every instruction crystal clear — "add 2 teaspoons of sugar", not "add sugar", (3) name its ingredients up front (input) — you cannot make tea from nothing, (4) produce tea at the end (output) — a recipe producing nothing is useless, and (5) use only steps you can *actually perform* with what you have (effectiveness) — "add a pinch of moon dust" fails because moon dust is not obtainable. Drop the food analogy now: the five technical criteria below are the exact, testable version of this intuition.
:::

**Tiny toy example.** "To find the biggest of 3 numbers: compare the first two, keep the winner, compare it with the third, return the winner." Finite (2 comparisons, then stop), definite (every step says exactly what to compare), has input (3 numbers) and output (the biggest), and every step is executable. That is an algorithm. Replace "compare" with "stare at them until the biggest becomes obvious" and it stops being one.

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Definition.** An algorithm is a *finite* sequence of well-defined, unambiguous instructions to solve a problem or perform a computation. All five criteria below must hold:

1. **Finiteness** — terminates after finitely many steps, for every valid input. A process that may run forever (like an operating system's main loop) is a "computational procedure", not an algorithm in this strict sense.
2. **Definiteness** — every instruction is precisely specified; nobody can interpret a step two ways.
3. **Input** — zero or more quantities supplied externally, before or during execution.
4. **Output** — at least one quantity produced, with a specified, provable relationship to the inputs (it must actually solve the stated problem).
5. **Effectiveness** — every operation is basic enough to do exactly, in finite time, with pencil and paper. "Guess the answer" is not effective; "add two numbers" is.

**Symbols and abbreviations used here:** $n$ = input size (e.g. number of list elements); $O(1)$ = constant work, independent of $n$ (defined fully in the asymptotics note).

**The RAM (Random Access Machine) model.** To analyse algorithms fairly, we imagine a simplified ideal computer: unlimited memory of numbered cells, each readable in one unit of time ("random access", hence the name); basic operations — addition, subtraction, comparison, assignment, array indexing — each cost exactly one unit ($O(1)$), regardless of number sizes; instructions run sequentially, with no parallelism. This deliberately ignores caches, pipelining, and memory hierarchy so that analysis does not depend on any physical machine.

**Space vs time efficiency.** *Time efficiency* asks "how many basic operations, as a function of $n$?" *Space efficiency* asks "how much extra memory beyond the input, as a function of $n$?" They often trade off: *memoization* (storing precomputed results) spends space to save time; recomputing on the fly spends time to save space. Neither is always better — it depends on which resource is scarcer.

---

<a id="worked-example"></a>
## 3. Worked example — testing a procedure step by step

::: step [Step 1: Setup] Formulating the Problem
Consider: "To find the largest number in a list, keep guessing numbers until you feel confident you have found the biggest one." Check whether this qualifies as an algorithm.
:::

::: step [Step 2: Execution] Applying Core Algorithm
Finiteness — "until you feel confident" has no guaranteed stopping point. Definiteness — "feel confident" is not checkable; two runs stop differently. Input — the list is given, fine. Output — a number is produced, fine. Effectiveness — "guessing" with no rule is not mechanically executable.
:::

::: step [Step 3: Conclusion] Final Result
Fails Finiteness, Definiteness, and Effectiveness — *not* a valid algorithm. A valid version: "Set max = first element. For each remaining element, if it exceeds max, set max to it. Return max." It terminates after exactly $n-1$ comparisons (finite), is unambiguous at every step (definite), and uses only compare-and-assign (effective).
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- "Zero inputs allowed" does not mean "no output allowed": input may be empty, but at least one output is mandatory.
- Definiteness vs effectiveness: definiteness is about *clarity of the instruction* ("add 2 teaspoons"); effectiveness is about *executability of the operation* ("moon dust" is clear but unobtainable — it fails effectiveness, not definiteness).
- The RAM model counts *operations*, not seconds — never convert "5 operations" into milliseconds.

| Similar pair | Distinction that earns marks |
|---|---|
| Definiteness vs effectiveness | Unambiguous wording vs physically executable operation |
| Time vs space efficiency | Operation count vs extra memory, both as functions of $n$ |
| Algorithm vs computational procedure | Must terminate (finite) vs allowed to run forever (OS loop) |

**Exam recap (facts an examiner rewards):** name all five criteria (finiteness, definiteness, input, output, effectiveness); RAM = one-unit basic operations, random access, sequential execution; time/space trade-off example is memoization versus recomputation.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

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
