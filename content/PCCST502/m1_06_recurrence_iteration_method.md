---
id: m1_06_recurrence_iteration_method
courseCode: PCCST502
module: 1
sequence: 6
title: 'Solution of Recurrences: Iteration / Expansion Method'
difficulty: beginner
estimatedMinutes: 9
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
## 1. Start from zero — the problem first

**Problem first.** Substitution needs a *guess* — but where do guesses come from? The iteration (expansion) method finds the answer with no guessing: unroll the recursion by hand a few levels, spot the pattern at a general level $k$, then compute exactly when the unrolling must stop (the base case). The leftover is a plain sum you already know how to evaluate.

::: callout-intuition Core Mental Model
If substitution is "guess, then prove", iteration is "unroll until you *see* it". Lay the nesting dolls in a row: doll 1 holds doll 2 holds doll 3… after a few you notice "doll $k$ is always exactly the same amount smaller" — a formula for the $k$-th doll — and counting the row tells you when it ends. Concretely: replace $T(n-1)$ by its own definition, then replace the new inner term again, and again, until level $k$'s shape is obvious.
:::

**Tiny toy example.** $T(n) = T(n-1) + 1$, $T(1) = 1$: $T(n) = T(n-2)+1+1 = T(n-3)+1+1+1$. At level $k$: $T(n) = T(n-k) + k$. Stop when $n-k = 1$ ($k = n-1$): $T(n) = 1 + (n-1) = n$. No guess was ever needed.

::: toggle Trace three levels of `T(n) = T(n−1) + 1` and read off level `k`
Level 0: $T(n)$ (original call). Level 1: replace $T(n)$ by its definition shifted: $T(n-1) + 1$. Level 2: replace $T(n-1)$ likewise: $T(n-2) + 1 + 1$. Level 3: $T(n-3) + 1 + 1 + 1$. Pattern at level $k$: $T(n-k) + k$ (argument shrunk by $k$, ones accumulated $k$ times). Stop rule: level ends when the argument hits the base case ($n−k = 1$), giving $k = n−1$ and $T(n) = 1 + (n−1) = n$.
:::

::: toggle Why is `k` solved for, never chosen?
Levels are not a free parameter — the recursion dictates exactly when it bottoms out. Setting the shrunken argument equal to the base case ($n−k = 1$ or $n/b^k = 1$) and solving yields the true depth ($\log_b n$ here). Choosing $k$ arbitrarily (say 3) leaves an unsolved $T(n−3)$ behind — an unfinished answer wearing finished clothes.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Numbered steps (linear form $T(n) = T(n-k) + f(n)$):**

1. Write the recurrence.
2. Expand one level: $T(n) = [T(n-2) + f(n-1)] + f(n)$.
3. Expand again: $T(n) = [T(n-3) + f(n-2)] + f(n-1) + f(n)$.
4. Generalise to level $k$: $T(n) = T(n-k) + \sum_{i=0}^{k-1} f(n-i)$.
5. Stop at the base case ($n-k = 1 \Rightarrow k = n-1$) and substitute $k$ back.
6. Evaluate the remaining sum (arithmetic $\sum i = n(n+1)/2$; geometric $\sum r^i = (r^{k+1}-1)/(r-1)$) and simplify to Big-O/Theta.

**Divide-and-conquer form** $T(n) = aT(n/b) + f(n)$: the argument shrinks by *division*. Level $k$ has $a^k$ sub-problems of size $n/b^k$; extra work sums to $\sum_{i=0}^{k-1} a^i f(n/b^i)$; recursion bottoms out at $n/b^k = 1$, i.e. $k = \log_b n$ (logarithm base $b$: the power to which $b$ is raised to get $n$).

**Why learn this when the Master Theorem (next) shortcuts it?** The Master Theorem covers one standard shape and gives only the *answer*. Iteration handles non-standard recurrences too, and shows *why* the answer holds — you watch work accumulate level by level.

---

<a id="worked-example"></a>
## 3. Worked example — $T(n) = 2T(n/2) + n$ (merge-sort shape)

::: step [Step 1: Setup] Formulating the Problem
Solve $T(n) = 2T(n/2) + n$, $T(1) = 1$ by iteration. (Split into 2 halves, recurse, do $O(n)$ combine work.)
:::

::: step [Step 2: Execution] Applying Core Algorithm
**Level 0:** $T(n) = 2T(n/2) + n$. **Level 1:** $T(n/2) = 2T(n/4) + n/2$, so $T(n) = 4T(n/4) + n + n = 4T(n/4) + 2n$. **Level 2:** $T(n) = 8T(n/8) + 3n$. **Pattern at level $k$:** $T(n) = 2^k T(n/2^k) + kn$ — every level contributes exactly $n$ extra (halving size cancels doubling count). **Stop:** $n/2^k = 1 \Rightarrow k = \log_2 n$. **Substitute:** $T(n) = n \cdot 1 + n\log_2 n$.
:::

::: step [Step 3: Conclusion] Final Result
$T(n) = n + n\log_2 n = \Theta(n \log n)$ — merge sort's complexity derived by watching recursion unfold, not by quoting formulas.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- The stopping depth $k$ is *solved for*, not chosen: set the shrunken argument equal to the base case ($n-k = 1$ or $n/b^k = 1$).
- Track *both* the growing sub-problem count ($a^k$) and the shrinking size ($n/b^k$) — dropping either breaks the level total.
- The final sum still needs the series formulas; unrolling without summing is an unfinished answer.

| Similar pair | Distinction that earns marks |
|---|---|
| Stopping rule, subtractive vs divisive | $k = n-1$ (linear) vs $k = \log_b n$ (divide-and-conquer) |
| Iteration vs substitution | Discovers the bound (no guess) vs verifies a guessed bound |
| Level total vs grand total | One row's work ($n$ here) vs sum over all rows ($n \log n$) |

**Exam recap (facts an examiner rewards):** level-$k$ pattern $2^kT(n/2^k) + kn$ for the merge-sort recurrence; stopping condition $n/2^k = 1$; final $\Theta(n \log n)$; iteration works beyond the Master Theorem's shape.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

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
