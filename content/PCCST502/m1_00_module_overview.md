---
id: m1_00_module_overview
courseCode: PCCST502
module: 1
sequence: 0
title: Algorithm Analysis — Module 1 Overview
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Map every Module 1 topic onto the analysis-to-recurrence journey
  - Explain why abstract notation beats stopwatch timing
  - Preview how Module 1 founds the entire course
concepts:
  - analysis roadmap
  - abstract notation
prerequisites: []
examRelevance: medium
tags:
  - overview
  - m1-foundations
---
# Algorithm Analysis — Module 1 Overview

**A beginner's map of everything Module 1 covers, and why it is the foundation for the entire course.**

<a id="the-intuition"></a>
## 1. Start from zero — what problem does this module solve?

**Problem first.** You and a friend both write a program that finds a word in a dictionary. Yours checks every page one by one from page 1. Your friend's opens the middle, asks "does the word come before or after this page?", and repeats on the correct half — the way you would really search a dictionary. Both programs *work*. Both eventually find the word. But your friend's is obviously smarter — and if the dictionary grew from a thousand pages to a million, the gap would explode from "finishes a bit sooner" to "finishes in a blink while you are still flipping pages".

**The question Module 1 answers:** how do we compare two solutions *fairly and mathematically*, without running both on a real computer (whose speed depends on processor model, other apps running, programming language — none of which should matter to the comparison)? The answer is a measuring stick built in stages: first define what an "algorithm" even is, then define how to count its work (time and space complexity), then learn a compact notation for that work (Big-O and friends), then calculate it for loops and for recursive functions, and finally apply all of it to a real data structure — the AVL (Adelson-Velsky and Landis) tree — where keeping the work bounded is the entire point of the design.

::: callout-intuition Core Mental Model
Think "it works" versus "it works *well*". Module 1 turns the second phrase from a vague feeling into a provable fact: a number like $O(n)$ (read "order n": the work grows at most linearly with input size $n$) or $O(\log n)$ (the work grows only logarithmically — doubling the input adds just one more step).
:::

**Tiny toy example (8 pages).** Linear checking on 8 pages takes up to 8 looks. Halving takes at most 3 looks ($8 \to 4 \to 2 \to 1$). Small gap. Now scale to $n = 1{,}000{,}000$: linear takes up to 1,000,000 looks; halving takes about $\log_2(1{,}000{,}000) \approx 20$ looks. Same two ideas, wildly different scaling — and scaling is what this module measures.

::: toggle What do `O(n)` and `O(log n)` say in plain words?
`O(n)` = work grows at most proportionally with input size (double the input, at most double the work — "order n"). `O(log n)` = work grows with the number of halvings (double the input, one extra step — "order log n"). Why halves give logs: each step discards half the candidates, so $n$ candidates need $\log_2 n$ halvings ($\log_2$ asks "how many halvings to reach 1?").
:::

::: toggle Why is a stopwatch comparison unfair?
Stopwatches measure one machine, one language, one load: a slow algorithm on a fast laptop beats a fast algorithm on a tired phone, saying nothing about the ideas. Analysis counts operations as a function of $n$ in the imaginary RAM model — same ruler for both programs, so the verdict travels across all real machines.
:::

---

<a id="the-math"></a>
## 2. The roadmap — each topic answers one question

Module 1 of PCCST502 (Design and Analysis of Algorithms, KTU — APJ Abdul Kalam Technological University — 2024 scheme) is a chain: each topic depends on the one before it.

1. **Algorithm definition and criteria** — what qualifies as an algorithm at all (finiteness, definiteness, effectiveness, input, output) and the RAM (Random Access Machine) model, our imaginary standard computer.
2. **Time and space complexity, best/worst/average case** — what we are actually measuring: operation counts and memory use, on lucky, unlucky, and typical inputs.
3. **Asymptotic notations** ($O$, $\Omega$, $\Theta$, $o$, $\omega$) — the mathematical language for describing measurements cleanly, ignoring constants and small-input noise.
4. **Complexity of iterative algorithms** — applying the above to plain loops via summation (arithmetic and geometric series).
5. **Recurrence relations and three ways to solve them** — substitution (guess and prove by induction), iteration/expansion (unroll level by level), and recursion trees (draw and sum levels) — for algorithms that call themselves.
6. **The Master Theorem** — a shortcut formula solving a huge family of recurrences instantly, once you recognise the pattern (plus honest coverage of where it goes silent).
7. **AVL trees** — a real data structure whose reason for existing is to *guarantee* good complexity by staying balanced: the concrete case study tying the whole module together.

**Basic understanding to carry forward:** analysis always asks "how does the work grow as input size $n$ grows?" — never "how many seconds on my laptop?". By the end of this module you should be able to look at *any* piece of code, loop-based or recursive, and state its time complexity with a proof, not a guess.

---

<a id="worked-example"></a>
## 3. Worked example — linear search versus binary search

::: step [Step 1: Setup] Formulating the Problem
Consider linear search (check every element one by one) versus binary search (repeatedly halve the search space) on a sorted array of $n = 1{,}000{,}000$ elements. Predict, *before running either*, roughly how many steps each takes in the worst case.
:::

::: step [Step 2: Execution] Applying Core Algorithm
Linear search's worst case is "the item is last, or not present" — it inspects all $n$ elements, so work grows as $n$. Binary search halves the remaining space each step, so steps equal the number of halvings of $n$ down to $1$ — exactly $\log_2 n$. For $n = 1{,}000{,}000$: linear search does up to 1,000,000 comparisons; binary search does about $\log_2(1{,}000{,}000) \approx 20$ comparisons.
:::

::: step [Step 3: Conclusion] Final Result
Linear search is $O(n)$; binary search is $O(\log n)$. One comparison — 1,000,000 steps versus 20 — motivates the whole module: without asymptotic notation and complexity analysis, "which is faster" would be a vague guess instead of a provable fact.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- A stopwatch measures one run on one machine; Big-O describes growth on *every* machine. Never answer "which algorithm is better?" with timing stories.
- Best case describes lucky inputs only — it gives no guarantee. Worst case is the default in textbooks, interviews, and exams unless stated otherwise.
- Big-O (upper bound) is not Big-Theta (tight bound): "$O(n^2)$" allows faster, "$\Theta(n^2)$" pins the rate exactly.

| Similar pair | Distinction that earns marks |
|---|---|
| Stopwatch timing vs asymptotic analysis | One run on one machine vs growth law for all machines and sizes |
| Best vs worst vs average case | Lucky input vs unluckiest input (guarantee) vs expected over a distribution |
| $O$ vs $\Theta$ | "At most this fast-growing" vs "exactly this rate, above and below" |

**Exam recap (facts an examiner rewards):** Module 1 order is definition → measurement → notation → loops → recurrences (3 methods) → Master Theorem → AVL case study. Linear search $O(n)$ vs binary search $O(\log n)$ is the canonical motivation example. AVL height stays $O(\log n)$ by the balance invariant.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Why do we analyse algorithms using abstract notation (like "$O(n)$") instead of just timing them with a stopwatch on a real computer?
() Stopwatches are not accurate enough for any measurement
(*) A stopwatch result depends on the specific machine, language, and system load, and doesn't tell us how the algorithm scales as input size grows
() Because real computers cannot run algorithms larger than a few hundred elements
() Abstract notation is only used when no computer is available
::: explanation
A stopwatch measures one run on one machine at one input size. It can't answer "what happens if the input is 100× bigger?" — and it conflates the algorithm's inherent efficiency with hardware speed. Asymptotic analysis strips away machine-specific detail and directly answers "how does the work grow with input size," which is the question that actually matters when choosing between two algorithms.
:::

::: quiz Which of these best describes the overall structure of Module 1?
() A random collection of unrelated topics
(*) A build-up from defining what an algorithm is, to measuring its cost, to a notation for describing that cost, to techniques for calculating it in loops and recursion, ending in a real worked case (AVL trees)
() A single topic (Big-O notation) repeated with different examples
() A history of who invented each algorithm
::: explanation
Each topic in Module 1 is a prerequisite for the next: you can't use Big-O notation meaningfully until you know what you're measuring (time/space complexity), and you can't calculate the complexity of a recursive AVL insertion until you know how to solve recurrences. The module is deliberately sequential.
:::
