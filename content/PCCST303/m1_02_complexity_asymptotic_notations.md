---
id: m1_02_complexity_asymptotic_notations
courseCode: PCCST303
module: 1
sequence: 2
title: Time/Space Complexity & Asymptotic Notations
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Count time and space costs across best, worst and average cases
  - Apply Big-O, Omega and Theta with their upper, lower and tight meanings
  - Rank growth orders from constant to factorial for analysis questions
concepts:
  - asymptotic notation
  - growth ranking
  - worst-case analysis
prerequisites:
  - m1_01_data_structures_adt_abstraction
examRelevance: high
tags:
  - complexity
  - big-o
---
# Time/Space Complexity & Asymptotic Notations

**Counting operations, Big-O/Omega/Theta, and the ranking every analysis question assumes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Recipe Scaling
A recipe's cost isn't "30 minutes" (your oven differs) but "per guest": chopping scales with guests (linear), tasting pairwise scales with guest-pairs (quadratic). **Asymptotics** ignore ovens and constants, keeping only the scaling shape as $n \to \infty$. Big-O is the "at most this bad" promise; Omega "at least this bad"; Theta "exactly this shape".
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Time vs space, best/worst/average

Count primitive operations as $T(n)$; extra memory as $S(n)$. Worst-case (guarantee), average-case (needs input distribution), best-case (optimistic, rarely quoted). KTU analyses default to worst-case unless stated.

### 2.2 The three notations

* $f = O(g)$: $f \le c\cdot g$ eventually (upper bound).
* $f = \Omega(g)$: $f \ge c\cdot g$ eventually (lower bound).
* $f = \Theta(g)$: both (tight bound).

### 2.3 The ranking (memorise in order)

$$1 < \log n < n < n\log n < n^2 < n^3 < 2^n < n!$$

Loop rules: single loop $\to n$; nested $k$ loops $\to n^k$; halving $\to \log n$; divide-and-conquer halves with linear combine $\to n\log n$.

::: callout-formula KTU Formula Vault: Growth Ladder
**$1<\log n<n<n\log n<n^2<n^3<2^n<n!$** · $O$ upper, $\Omega$ lower, $\Theta$ tight · analyse **worst-case** by default.
:::

::: callout-pitfall $O$ Is Not $\Theta$
"Binary search is $O(n)$" is *true* but *loose* (it's $\Theta(\log n)$). KTU asks for the *tight* bound — an $O$ answer two rungs up the ladder loses the mark. Always tighten to $\Theta$ when you can prove both sides.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Analyse: (a) single pass summing an array; (b) two nested loops over $n$; (c) loop with $i$ doubling ($i = 1, 2, 4, \dots$).
:::

::: step [Step 2: Execution] Count the Shape
1. $n$ iterations, $O(1)$ each → $\Theta(n)$ time, $\Theta(1)$ extra space.
2. $n \times n$ inner hits → $\Theta(n^2)$.
3. $i$ doubles: $\log_2 n$ iterations → $\Theta(\log n)$.
:::

::: step [Step 3: Conclusion] Final Result
Count iterations, multiply nesting, halve for doubling. State time *and* space — the pair is the full analysis answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$f(n) = 3n^2 + 10n + 5$. Tight bound?
(A) $\Theta(n)$
(*B) $\Theta(n^2)$ — leading term dominates; constants and lowers vanish asymptotically
(C) $\Theta(n^3)$
(D) $\Theta(2^n)$
::: explanation
For large $n$, $3n^2$ dwarfs the rest; $c_1n^2 \le f \le c_2n^2$ eventually, so both $O$ and $\Omega$ agree at $n^2$. Keep the fastest grower only.
:::

::: quiz Q2: Foundational Concept
Best, worst and average case of linear search are $O(1)$, $O(n)$, $O(n)$. Which is quoted and why?
(A) Best — optimistic
(*B) Worst $O(n)$ — the only guarantee valid for every input; average needs a distribution assumption
(C) Average always
(D) None are valid
::: explanation
Worst-case bounds hold unconditionally, which is what "analyse the algorithm" means by default. Average-case ($O(n)$ here too, for uniform targets) is quoted only when the distribution is specified.
:::

::: quiz Q3: Numerical Drill
A loop runs $n$ times; inside, a second loop runs up to the outer index ($1+2+\dots+n$ total). Complexity?
(A) $\Theta(n\log n)$
(*B) $\Theta(n^2)$ — triangular sum $n(n+1)/2$
(C) $\Theta(n)$
(D) $\Theta(n^3)$
::: explanation
$1+2+\dots+n = n(n+1)/2 = \Theta(n^2)$. Triangular nesting is still quadratic (half the square) — constants like $1/2$ never change the rung.
:::
