---
id: m1_06_recurrence_iteration_method
courseCode: PCCST502
module: 1
sequence: 6
title: 'Solution of Recurrences: Iteration / Expansion Method'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Expand recurrences level by level to a generalized kth step
  - Read the stopping depth off the shrinking argument
  - Close arithmetic and geometric sums into exact totals
concepts:
  - iteration method
  - expansion levels
  - series summation
prerequisites:
  - m1_05_recurrence_equations_and_substitution_method
examRelevance: medium
tags:
  - recurrences
  - iteration-method
---
# Solution of Recurrences: Iteration / Expansion Method

**Repeated substitution, identifying generalized patterns at step k, arithmetic and geometric series summation.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model
If the substitution method is "guess the answer, then prove it," the iteration (expansion) method is "unroll the recursion by hand, a few levels at a time, until you *see* the pattern yourself — no guessing required." It's like pulling apart those nesting dolls one at a time and laying them all out in a row: doll 1 contains doll 2, which contains doll 3, which contains doll 4... After unrolling a few, you notice "oh, doll $k$ is always exactly $2$ centimetres smaller than doll $k-1$" — a pattern you can now write down as a general formula for the $k$-th doll, and from there, figure out exactly how many dolls there are in total (which tells you when the recursion bottoms out).

Concretely, you take the recurrence $T(n) = T(n-1) + f(n)$, and instead of leaving $T(n-1)$ as a mystery, you *substitute its own definition back in* — replacing $T(n-1)$ with $T(n-2) + f(n-1)$, then replacing that inner $T(n-2)$ with $T(n-3) + f(n-2)$, and so on. Each substitution "expands" the expression by one more level. After doing this enough times, you spot the general pattern at an arbitrary level $k$, and finally you know exactly when the expansion must stop (usually when the argument hits the base case, like $n-k=1$) — giving you a plain sum to evaluate.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

**The mechanical procedure:**
1. Write the recurrence: $T(n) = T(n-1) + f(n)$ (or the divide-and-conquer form $T(n) = aT(n/b) + f(n)$).
2. Expand one level: substitute the recurrence's own definition for the recursive term. E.g. $T(n) = [T(n-2) + f(n-1)] + f(n)$.
3. Expand again: $T(n) = [T(n-3)+f(n-2)] + f(n-1) + f(n)$.
4. Continue for a few more levels until the pattern at a general level $k$ becomes clear: $T(n) = T(n-k) + \sum_{i=0}^{k-1} f(n-i)$.
5. Determine the value of $k$ at which the recursion reaches its base case (e.g. $n-k=1 \Rightarrow k=n-1$), and substitute that value of $k$ back in.
6. What remains is a plain summation — evaluate it using standard series formulas (arithmetic: $\sum_{i=1}^n i = \frac{n(n+1)}{2}$; geometric: $\sum_{i=0}^{k} r^i = \frac{r^{k+1}-1}{r-1}$ for $r\ne1$), and finally simplify to Big-O/Big-Theta form.

**For divide-and-conquer recurrences** $T(n) = aT(n/b) + f(n)$, the same idea applies but the argument shrinks by *division* rather than subtraction: level $k$ has $a^k$ sub-problems, each of size $n/b^k$, and the total "extra work" summed across levels becomes $\sum_{i=0}^{k-1} a^i f(n/b^i)$, with recursion bottoming out once $n/b^k = 1$, i.e. $k = \log_b n$.

**Why this method is valuable even though the Master Theorem (next topic) often gives shortcuts:** the Master Theorem only applies to recurrences of a specific standard shape, and even then only tells you the *answer*, not *why* it's true. The iteration method works on a wider variety of recurrences (including non-standard ones the Master Theorem can't handle) and builds genuine intuition for *why* the final complexity comes out the way it does, because you watch the total work accumulate level by level.

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Solve $T(n) = 2T(n/2) + n$, with base case $T(1) = 1$, using the iteration method. (This recurrence describes algorithms like Merge Sort: split into 2 halves, recurse on each, then do $O(n)$ work to combine.)
:::

::: step [Step 2: Execution] Applying Core Algorithm
**Level 0:** $T(n) = 2T(n/2) + n$.
**Level 1 (expand $T(n/2)$):** $T(n/2) = 2T(n/4) + n/2$, so $T(n) = 2[2T(n/4)+n/2] + n = 4T(n/4) + n + n = 4T(n/4) + 2n$.
**Level 2 (expand $T(n/4)$):** similarly, $T(n) = 8T(n/8) + 3n$.
**Spotting the pattern at level $k$:** $T(n) = 2^k T(n/2^k) + kn$ — at each level, the "extra work" contributed is exactly $n$ (not growing, not shrinking — this is the key feature of this particular recurrence), and there are $k$ levels so far.
**Finding when recursion bottoms out:** the recursion reaches the base case when $n/2^k = 1$, i.e. $2^k = n$, i.e. $k = \log_2 n$.
**Substituting $k = \log_2 n$:** $T(n) = 2^{\log_2 n} \cdot T(1) + (\log_2 n)\cdot n = n \cdot 1 + n\log_2 n = n + n\log_2 n$.
:::

::: step [Step 3: Conclusion] Final Result
$T(n) = n + n\log_2 n$. As $n$ grows large, $n\log_2 n$ dominates the smaller $n$ term, so the final asymptotic answer is $T(n) = \Theta(n\log n)$ — exactly the well-known complexity of Merge Sort, derived here from first principles by literally watching the recursion unfold level by level, rather than quoting a memorised formula.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz In the iteration/expansion method, what determines the number of levels $k$ you expand before stopping?
() You always stop after exactly 3 levels
(*) You stop once the recursive argument reaches the base case (e.g. $n/2^k = 1$ or $n-k=1$), and solve for $k$ accordingly
() You stop as soon as the pattern looks complicated
() The number of levels is always equal to $n$
::: explanation
The whole point of finding the "general pattern at level $k$" is to then determine exactly which value of $k$ makes the recursive term hit its base case (a directly solvable, non-recursive instance) — this is what lets you convert the infinite-looking pattern into a concrete, finite formula.
:::

::: quiz For the recurrence $T(n) = 2T(n/2) + n$, the iteration method reveals that at every level of expansion, the total "extra work" contributed (outside the recursive calls) is:
() Increasing with each level
(*) Exactly $n$ at every level, because the halving of problem size is exactly compensated by the doubling of the number of sub-problems
() Decreasing with each level
() Zero at every level except the last
::: explanation
At level $k$ there are $2^k$ sub-problems, each contributing $n/2^k$ extra work (from the $f(n)=n$ term evaluated at the sub-problem's size), and $2^k \times \frac{n}{2^k} = n$ — the level count and the per-problem shrinkage exactly cancel, so every level contributes the same total, $n$. This is exactly the "Case 2" balance point of the Master Theorem, covered next.
:::

::: quiz Using the iteration method's result $T(n) = n + n\log_2 n$ for the Merge-Sort-style recurrence, the final Big-Theta complexity is:
() $\Theta(n)$
(*) $\Theta(n \log n)$
() $\Theta(n^2)$
() $\Theta(\log n)$
::: explanation
Between the two terms $n$ and $n\log_2 n$, the second dominates as $n$ grows (since $\log_2 n$ grows without bound, however slowly), so asymptotic notation keeps only the dominant term, giving $\Theta(n\log n)$.
:::
