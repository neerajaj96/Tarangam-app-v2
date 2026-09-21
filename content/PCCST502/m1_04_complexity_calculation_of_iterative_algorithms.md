---
id: m1_04_complexity_calculation_of_iterative_algorithms
courseCode: PCCST502
module: 1
sequence: 4
title: Complexity Analysis of Iterative Loops
difficulty: beginner
estimatedMinutes: 10
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
## 1. Start from zero — the problem first

**Problem first.** Given raw code with loops, how do we read off its Big-O without running it? The recipe: look at *how the loop variable changes* each iteration (up by 1? doubling? inner range depending on the outer variable?) and translate that pattern into a sum — then into a bound.

::: callout-intuition Core Mental Model
Counting loop iterations is like counting staircase steps. One flight of $n$ steps = $n$ steps. But if *each* of $n$ floors also demands climbing $n$ steps, you climb $n \times n = n^2$. And if each step doubles your floor ($1 \to 2 \to 4 \to 8 \dots$), you top $n$ floors in only about $\log_2 n$ steps — multiplicative growth beats additive climbing.
:::

**Tiny toy example ($n = 8$).** `for i in 1..8` runs 8 times. `i = 1; while i <= 8: i *= 2` visits $1, 2, 4, 8$ — 4 iterations $\approx \log_2 8 + 1$. Same limit, half the trips.

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols:** $n$ = loop bound (input size); $i, j$ = loop counters; $\Theta(\cdot)$ = tight bound. Every $O(1)$ body below means "constant work per iteration".

**Single loop, constant increment:**
```
for i = 1 to n:
    do O(1) work
```
Runs $n$ times → total $\Theta(n)$.

**Nested loops, independent ranges:**
```
for i = 1 to n:
    for j = 1 to m:
        do O(1) work
```
Inner runs $m$ times per each of $n$ outer iterations → $\Theta(nm)$; with $m = n$, the classic $\Theta(n^2)$.

**Dependent nested loops (inner range uses outer variable):**
```
for i = 1 to n:
    for j = 1 to i:
        do O(1) work
```
Total $= 1 + 2 + \dots + n = \frac{n(n+1)}{2}$ — the **arithmetic series**, $\Theta(n^2)$. Same rate as fully independent nesting, roughly half the absolute work.

**Logarithmic loops (multiplicative change):**
```
i = 1
while i <= n:
    do O(1) work
    i = i * 2
```
$i = 1, 2, 4, \dots = 2^0, 2^1, \dots$; stops when $2^k > n$, i.e. $k > \log_2 n$ → $\Theta(\log n)$. Symmetrically, halving $n$ down to 1 (binary search's core) is also $\Theta(\log n)$.

**Amortized preview.** One operation may look expensive alone but be cheap *averaged over a sequence*. A dynamic array doubling when full pays $O(n)$ per resize, but only $O(\log n)$ resizes occur across $n$ insertions, totalling $O(n)$ (geometric series $1 + 2 + 4 + \dots + n \approx 2n$) — amortized $O(1)$ per insertion.

**Summation method:** write total work as a sum, evaluate with series formulas (arithmetic $\sum_{i=1}^n i = \frac{n(n+1)}{2}$; geometric $\sum_{i=0}^{k} 2^i = 2^{k+1}-1$), keep the dominant term.

::: callout-formula KTU Formula Vault: The Two Series You Must Memorize
Arithmetic: $\sum_{i=1}^{n} i = \frac{n(n+1)}{2} = \Theta(n^2)$ (dependent nested loops). Geometric: $\sum_{i=0}^{k} r^i = \frac{r^{k+1}-1}{r-1}$, so $1+2+4+\dots+n = 2n-1 = \Theta(n)$ (doubling loops, dynamic-array resizes). Nine out of ten loop-counting questions reduce to recognising which sum you face.
:::

---

<a id="worked-example"></a>
## 3. Worked example — dependent nested loop, fully costed

::: step [Step 1: Setup] Formulating the Problem
Determine the time complexity of:
```
for i = 1 to n:
    for j = 1 to i:
        print(i, j)
```
where the inner bound depends on the outer variable.
:::

::: step [Step 2: Execution] Applying Core Algorithm
$i = 1$ → 1 print; $i = 2$ → 2 prints; …; $i = n$ → $n$ prints. Total $= 1 + 2 + \dots + n = \frac{n(n+1)}{2} = \frac{n^2+n}{2}$.
:::

::: step [Step 3: Conclusion] Final Result
$\frac{1}{2}n^2 + \frac{1}{2}n$: the $n^2$ term dominates, constants drop → $\Theta(n^2)$ — same rate as independent $n \times n$ nesting at half the absolute work. Big-Theta tracks growth, not exact counts.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Dependent loops ($j$ to $i$) still give $\Theta(n^2)$ — "roughly half" changes constants, never the degree.
- Doubling from 1 and halving from $n$ are the *same* $\Theta(\log n)$ — direction does not matter.
- Amortized $O(1)$ does not mean "every operation is cheap": single resizes still cost $O(n)$.

| Similar pair | Distinction that earns marks |
|---|---|
| Arithmetic vs geometric series | Dependent nesting $\Theta(n^2)$ vs doubling/amortization $\Theta(n)$ total |
| $\Theta(n^2)$ dependent vs independent nesting | Same growth rate, ~half the constant — asymptotics equate them |
| Worst-case $O(n)$ vs amortized $O(1)$ | Single operation vs average over a sequence |

**Exam recap (facts an examiner rewards):** both series formulas with closed forms; halving/doubling $\Rightarrow \log n$; dependent nesting sums to $n(n+1)/2$; amortized dynamic-array insertion is $O(1)$ via the geometric sum.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

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
