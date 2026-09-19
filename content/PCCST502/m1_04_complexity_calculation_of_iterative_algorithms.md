---
id: m1_04_complexity_calculation_of_iterative_algorithms
courseCode: PCCST502
module: 1
sequence: 4
title: Complexity Analysis of Iterative Loops
difficulty: beginner
estimatedMinutes: 7
learningObjectives:
  - Cost single, nested and logarithmic-increment loops exactly
  - Sum dependent inner loops with arithmetic series
  - Bound doubling loops with geometric series and amortization
concepts:
  - loop analysis
  - arithmetic series
  - geometric series
prerequisites:
  - m1_02_time_space_complexity_best_worst_average
  - m1_03_asymptotic_notations_and_properties
examRelevance: high
tags:
  - complexity
  - loop-analysis
---
# Complexity Analysis of Iterative Loops

**Single loops, nested loops, logarithmic increment loops, dependent inner loops, and amortized loop bounds.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model
Counting how many times a loop runs is a bit like counting steps on a staircase. A single flight of $n$ steps takes $n$ steps to climb — simple. But now imagine a building where, for *each* of the $n$ floors, you also have to climb a separate flight of $n$ steps just to check something on that floor before moving up — now you're doing $n \times n = n^2$ steps total, because the work is *nested*. And if, instead of climbing linearly, each step you take lets you skip to double your current floor (floor 1 → 2 → 4 → 8 → 16...), you'll reach the top in only about $\log_2 n$ steps — dramatically fewer, because the loop variable *grows multiplicatively* rather than by fixed increments.

This section teaches you a systematic recipe: look at how the loop variable changes each iteration (does it go up by 1? by doubling? does the inner loop's range depend on the outer loop's current value?), and translate that pattern directly into a Big-O bound — without needing to run the code or guess.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

**Single loop, incrementing by a constant:**
```
for i = 1 to n:
    do O(1) work
```
Runs exactly $n$ times, each iteration doing constant work → total $\Theta(n)$.

**Nested loops, independent ranges:**
```
for i = 1 to n:
    for j = 1 to m:
        do O(1) work
```
The inner loop runs $m$ times for *each* of the $n$ outer iterations, giving $n \times m$ total iterations → $\Theta(nm)$. When both loops run to $n$ (i.e. $m=n$), this becomes the very common $\Theta(n^2)$.

**Dependent nested loops (inner range depends on outer variable):**
```
for i = 1 to n:
    for j = 1 to i:
        do O(1) work
```
The inner loop runs $i$ times, and $i$ itself ranges from $1$ to $n$. Total iterations $= 1 + 2 + 3 + \dots + n = \frac{n(n+1)}{2}$ — this is the classic **arithmetic series** sum, which is $\Theta(n^2)$ (the leading term dominates; the constant $\frac{1}{2}$ is dropped by asymptotic notation, but the *degree*, $n^2$, survives).

**Logarithmic loops (variable changes multiplicatively):**
```
i = 1
while i <= n:
    do O(1) work
    i = i * 2
```
$i$ takes values $1, 2, 4, 8, \dots$ — i.e. $2^0, 2^1, 2^2, \dots$ — and the loop stops once $2^k > n$, i.e. once $k > \log_2 n$. So the loop runs $\Theta(\log n)$ times. (The same logic applies symmetrically to a loop that starts at $n$ and *divides* by 2 each time until reaching 1 — this is exactly what happens inside binary search.)

**Amortized analysis (a brief preview).** Sometimes a single operation looks expensive in isolation, but happens rarely enough that its cost, *averaged over a long sequence of operations*, is actually small. Classic example: a dynamic array (like Python's list or Java's ArrayList) that doubles its capacity whenever it's full. A single "resize" copies all $n$ existing elements — an $O(n)$ operation — but resizes only happen $O(\log n)$ times total across $n$ insertions, and the total cost of all resizes across $n$ insertions sums to $O(n)$ (a geometric series: $1+2+4+\dots+n \approx 2n$). So the *amortized* (averaged) cost per insertion is $O(1)$, even though occasional individual insertions cost $O(n)$.

**General technique — the summation method:** express the total work as a sum over the loop's range, then evaluate that sum using standard series formulas (arithmetic series $\sum_{i=1}^n i = \frac{n(n+1)}{2}$, geometric series $\sum_{i=0}^{k} 2^i = 2^{k+1}-1$), and finally express the result in Big-O by keeping only the dominant (fastest-growing) term.

::: callout-formula KTU Formula Vault: The Two Series You Must Memorize
Arithmetic: $\sum_{i=1}^{n} i = \frac{n(n+1)}{2} = \Theta(n^2)$ (dependent nested loops). Geometric: $\sum_{i=0}^{k} r^i = \frac{r^{k+1}-1}{r-1}$, so $1+2+4+\dots+n = 2n-1 = \Theta(n)$ (doubling loops, dynamic-array resizes). Nine out of ten loop-counting questions reduce to recognizing which of these two sums you are looking at.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Determine the time complexity of the following nested loop, where the inner loop's bound depends on the outer loop variable:
```
for i = 1 to n:
    for j = 1 to i:
        print(i, j)
```
:::

::: step [Step 2: Execution] Applying Core Algorithm
For $i=1$, the inner loop runs $1$ time. For $i=2$, it runs $2$ times. ... For $i=n$, it runs $n$ times. The total number of `print` calls is $1 + 2 + 3 + \dots + n$. Using the arithmetic series formula, $\sum_{i=1}^{n} i = \frac{n(n+1)}{2} = \frac{n^2+n}{2}$.
:::

::: step [Step 3: Conclusion] Final Result
Expanding $\frac{n^2+n}{2} = \frac{1}{2}n^2 + \frac{1}{2}n$. As $n$ grows large, the $n^2$ term dominates the $n$ term, and asymptotic notation drops both the constant factor $\frac{1}{2}$ and the lower-order term $\frac{1}{2}n$. Final answer: $\Theta(n^2)$ — the *same* asymptotic complexity as two fully independent nested loops running $n$ times each, even though this version does roughly half the total work in absolute terms. This illustrates why Big-Theta cares about growth rate, not exact operation counts.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz A loop where the control variable doubles each iteration (e.g. `i = i * 2`) until it exceeds $n$ has time complexity:
() $\Theta(n)$
(*) $\Theta(\log n)$
() $\Theta(n^2)$
() $\Theta(n \log n)$
::: explanation
If $i$ doubles each iteration starting from 1, after $k$ iterations $i = 2^k$. The loop stops once $2^k$ exceeds $n$, which happens at $k \approx \log_2 n$. So the number of iterations grows logarithmically with $n$.
:::

::: quiz A nested loop where the inner loop runs from $1$ to the current value of the outer loop variable $i$ (which itself ranges from 1 to $n$) has a total number of iterations equal to which sum, and what is its asymptotic complexity?
() $\sum_{i=1}^{n} n$, giving $\Theta(n^2)$
(*) $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$, giving $\Theta(n^2)$
() $\sum_{i=1}^{n} \log i$, giving $\Theta(n \log n)$
() $\sum_{i=1}^{n} 1$, giving $\Theta(n)$
::: explanation
The inner loop runs $i$ times for each outer value of $i$, so total iterations $= 1+2+\dots+n = \frac{n(n+1)}{2}$ (the arithmetic series sum). Once expanded, the dominant term is $n^2$, and asymptotic notation drops the constant $\frac12$ and the lower-order $n$ term, giving $\Theta(n^2)$ — the same growth rate as a fully independent $n \times n$ nested loop.
:::

::: quiz In amortized analysis of a dynamic array that doubles its size whenever full, why is the *amortized* cost per insertion $O(1)$ even though a single resize operation costs $O(n)$?
() Resizes never actually happen in practice
(*) Resizes happen rarely (only $O(\log n)$ times across $n$ insertions), and their total cost across all insertions sums to $O(n)$, which averages to $O(1)$ per insertion
() The cost of a resize is always exactly 1 operation
() Amortized analysis ignores expensive operations entirely
::: explanation
Even though an individual resize copies up to $n$ elements ($O(n)$ for that one operation), resizes become exponentially rarer as the array grows (doubling means only $\log_2 n$ resizes total for $n$ insertions), and the sum of all resize costs across the whole sequence is a geometric series that totals $O(n)$. Spread over $n$ insertions, that's $O(1)$ per insertion on average — which is what "amortized $O(1)$" means.
:::
