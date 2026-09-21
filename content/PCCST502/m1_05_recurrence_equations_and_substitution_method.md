---
id: m1_05_recurrence_equations_and_substitution_method
courseCode: PCCST502
module: 1
sequence: 5
title: 'Analysis of Recursive Algorithms: Substitution Method'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Formulate recurrence relations with load-bearing base cases
  - Guess and prove upper and lower bounds by induction in order
  - Solve linear first-order recurrences like time-plus-n
concepts:
  - recurrence relations
  - substitution method
  - induction proofs
prerequisites:
  - m1_03_asymptotic_notations_and_properties
examRelevance: high
tags:
  - recurrences
  - substitution-method
---
# Analysis of Recursive Algorithms: Substitution Method

**Formulating recurrence relations and mathematical induction proofs for upper/lower bounds.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Loops are costed by sums — but what about a function that *calls itself*? You cannot "sum its loop" because there is no loop: the cost of size $n$ is defined *in terms of* the cost of a smaller size. We need an equation that captures that self-reference (a *recurrence relation*), then a method to turn it into a plain bound like $O(n^2)$.

::: callout-intuition Core Mental Model
Picture Russian nesting dolls: each doll contains a smaller identical doll, down to a tiny solid one. A recursive algorithm is the same: solving size $n$ does a little direct work, then hands a smaller copy to itself — until the problem is small enough to solve directly (the base case, the solid doll). A recurrence writes this as an equation: "cost($n$) = work here + cost(smaller)". The substitution method then *guesses* the answer's shape and *proves* it by mathematical induction.
:::

**Tiny toy example.** Recursive countdown: $T(n) = T(n-1) + 1$, $T(1) = 1$ ("to count down from $n$, print once, then count down from $n-1$"). Unroll for $n = 3$: $T(3) = T(2)+1 = T(1)+1+1 = 3$. The answer smells like $T(n) = n$ — substitution will prove such guesses airtight.

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols:** $T(n)$ = cost of solving size $n$; $a$ = number of recursive calls; $f(n)$ = non-recursive work at the current level; $c$, $n_0$ = the Big-O witness constants.

**Recurrence shapes.** Divide-and-conquer (shrinks by fraction): $T(n) = a\cdot T(n/b) + f(n)$ (binary search: $T(n) = T(n/2) + O(1)$). Linear recursion (shrinks by fixed amount): $T(n) = T(n-k) + f(n)$ (factorial: $T(n) = T(n-1) + O(1)$). Every recurrence needs a **base case** (e.g. $T(1) = O(1)$) — without one the recursion never bottoms out, violating Finiteness.

**Substitution method, numbered steps:**

1. **Guess** the solution's form ("$T(n) \le cn$ for some $c$, all $n \ge n_0$").
2. **Assume** the guess for all values smaller than $n$ (inductive hypothesis).
3. **Substitute** into the recurrence's right-hand side and simplify.
4. **Verify** the result fits the guessed form at $n$ — success proves it by induction; near-miss means adjust (often subtract a lower-order term) and retry.

Guesses come from intuition, unrolling a few levels (the iteration method, next), or experience — substitution's power is confirming or refuting a candidate rigorously.

::: anim substitution-pipeline Guess, Assume, Substitute, Verify
Watch the four stations light in order — each station's output feeds the next, and a miss at Verify loops all the way back to a weaker Guess.
:::

---

<a id="worked-example"></a>
## 3. Worked example — $T(n) = T(n-1) + n$ by substitution

::: step [Step 1: Setup] Formulating the Problem
Solve $T(n) = T(n-1) + n$, $T(1) = 1$ (each call does $n$ work, then recurses one smaller). Guess, assume, substitute, verify.
:::

::: step [Step 2: Execution] Applying Core Algorithm
**Guess:** levels add $n, n-1, \dots, 1$ (arithmetic shape) → claim $T(n) \le cn^2$. **Assume** $T(n-1) \le c(n-1)^2$. **Substitute:** $T(n) \le c(n-1)^2 + n = cn^2 - 2cn + c + n$. Need $-2cn + c + n \le 0$; with $c = 1$: $-n + 1 \le 0$ for all $n \ge 1$. ✓
:::

::: step [Step 3: Conclusion] Final Result
Base case $T(1) = 1 \le 1$ holds and the inductive step succeeds with $c = 1$ — so $T(n) = O(n^2)$ for all $n \ge 1$. (Exact form is $\frac{n(n+1)}{2} = \Theta(n^2)$: the recursive and iterative versions of "add 1..$n$" agree, as they must.)
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Proving only the upper bound gives $O$, not $\Theta$ — tight claims need the matching lower-bound induction too.
- A failed verification does not mean the guess's *rate* is wrong: often the same rate with a tweaked guess (minus a lower-order term) goes through.
- Never skip the base case in the proof — induction without an anchor proves nothing.

| Similar pair | Distinction that earns marks |
|---|---|
| Guess vs proof | Candidate shape vs inductive certificate — substitution needs both |
| $O$ (one induction) vs $\Theta$ (two) | Upper only vs upper + lower inductions |
| Substitution vs iteration method | Guess-then-verify vs unroll-then-sum |

**Exam recap (facts an examiner rewards):** the four steps in order (guess, assume, substitute, verify); base case = Finiteness anchor; $T(n) = T(n-1)+n \Rightarrow O(n^2)$ with witness $c = 1$.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz In the substitution method, what is the correct order of steps?
() Prove the answer directly with no guess needed, then verify with an example
(*) Guess the form of the solution, assume it holds for smaller inputs (inductive hypothesis), substitute into the recurrence, then verify the guess holds for $n$
() Run the algorithm many times and average the results
() Convert the recurrence into a loop first, then analyse the loop
::: explanation
The substitution method is "guess and verify by induction": you propose a candidate closed-form bound, assume it's already true for smaller sub-problems (the inductive hypothesis), plug that assumption into the recurrence's right-hand side, and algebraically confirm the result still fits your guessed bound for the current size $n$.
:::

::: quiz Why must every recurrence include a base case (e.g. $T(1) = O(1)$)?
() Base cases make the algorithm run faster
(*) Without a base case, the recursion has no defined stopping point, violating the Finiteness requirement of a valid algorithm
() Base cases are optional and only used for style
() Base cases determine the time complexity entirely, regardless of the recursive step
::: explanation
A recurrence describes how a problem of size $n$ reduces to a smaller one, but if this reduction never bottoms out at a directly-solvable case, the recursion would never terminate — exactly the Finiteness violation discussed in the very first Module 1 topic. The base case is what anchors the induction proof and guarantees the algorithm actually stops.
:::

::: quiz For the recurrence $T(n) = T(n-1) + n$ with $T(1)=1$, the substitution method proves the solution is:
() $O(n)$
(*) $O(n^2)$
() $O(\log n)$
() $O(2^n)$
::: explanation
The worked example above shows that guessing $T(n) \le cn^2$ and carrying out the inductive step (with $c=1$) successfully proves the bound, matching the recurrence's true closed form $T(n) = \frac{n(n+1)}{2} = \Theta(n^2)$.
:::
