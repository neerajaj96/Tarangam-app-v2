# Algorithm Analysis — Module 1 Overview

**A beginner's map of everything Module 1 covers, and why it's the foundation for the entire course.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model
Imagine you and a friend both write a program to search for a word in a dictionary. Yours checks every single page one by one, starting from page 1. Your friend's opens the dictionary in the middle, checks if the word comes before or after, and repeats — like you'd actually search a real dictionary. Both programs *work*. Both eventually find the word. But your friend's program is obviously smarter, and if the dictionary had a million pages instead of a thousand, the difference would go from "friend finishes a bit sooner" to "friend finishes in the time it takes you to blink, while you're still flipping pages."

That gap — between "it works" and "it works *well*" — is exactly what Module 1 is about. Before you can compare two solutions to a problem, you need a fair, mathematical way to measure "how much work" each one does, *without* actually running both on a real computer (whose speed depends on things like processor model, other apps running, etc. — none of which should matter to the comparison). This module builds that measuring stick from the ground up: first defining what an "algorithm" even is precisely, then defining how to count its work (time and space complexity), then giving you a compact notation to describe that work cleanly (Big-O and friends), then teaching you to actually calculate it for loops and for recursive functions, and finally applying all of that machinery to a real, non-trivial data structure — the AVL tree — where keeping the "work" bounded is the entire point of the design.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

Module 1 of PCCST502 (Design and Analysis of Algorithms, KTU 2024 scheme) is built as a chain — each topic depends on the one before it:

1. **Algorithm definition & criteria** — what qualifies as an algorithm at all (finiteness, definiteness, effectiveness, input, output).
2. **Time & space complexity, best/worst/average case** — what we're actually trying to measure.
3. **Asymptotic notations** (O, Ω, Θ, o, ω) — the mathematical language used to *describe* that measurement cleanly, ignoring constants and small-input noise.
4. **Complexity of iterative algorithms** — applying the above to plain loops (the easy case).
5. **Recurrence relations and three ways to solve them** — substitution, iteration/expansion, and recursion tree — for when an algorithm calls itself (the harder case).
6. **The Master Theorem** — a shortcut formula that solves a huge chunk of recurrences instantly, once you recognise the pattern.
7. **AVL trees** — a real data structure whose entire reason for existing is to *guarantee* good complexity (by staying balanced), used as a concrete, worked case study tying the whole module together.

By the end of this module you should be able to look at *any* piece of code — loop-based or recursive — and state its time complexity with a proof, not a guess.

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Consider linear search (check every element one by one) versus binary search (repeatedly halve the search space) on a sorted array of $n = 1{,}000{,}000$ elements. We want a way to predict, *before running either*, roughly how many steps each will take in the worst case.
:::

::: step [Step 2: Execution] Applying Core Algorithm
Linear search's worst case is "the item is last, or not present" — it must inspect all $n$ elements, so its work grows as $n$. Binary search halves the remaining space each step, so the number of steps is the number of times you can halve $n$ before reaching $1$ — this is exactly $\log_2 n$. For $n=1{,}000{,}000$: linear search does up to 1,000,000 comparisons; binary search does about $\log_2(1{,}000{,}000) \approx 20$ comparisons.
:::

::: step [Step 3: Conclusion] Final Result
Linear search is $O(n)$; binary search is $O(\log n)$. This single comparison — 1,000,000 steps versus 20 — is the entire motivation for this module: without the tools built here (asymptotic notation, complexity analysis), "which is faster" would be a vague guess instead of a provable fact.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
