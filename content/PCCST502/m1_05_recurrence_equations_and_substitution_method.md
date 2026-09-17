# Analysis of Recursive Algorithms: Substitution Method

**Formulating recurrence relations and mathematical induction proofs for upper/lower bounds.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model
Picture a recursive algorithm like a set of Russian nesting dolls (matryoshka) — a big doll contains a slightly smaller identical doll, which contains an even smaller one, and so on, until you reach the tiniest doll that doesn't open any further. A recursive *algorithm* works the same way: to solve a problem of size $n$, it does a little bit of its own work, and then hands off a smaller version of the *same* problem to itself (a smaller doll) — until the problem is small enough to solve directly, with no further recursion (the innermost doll).

A **recurrence relation** is just a mathematical equation that captures this nesting pattern: "the cost to solve a problem of size $n$ equals some cost for the current step, plus the cost of solving the smaller sub-problem(s)." For example, $T(n) = T(n-1) + 1$ says "solving a size-$n$ problem costs 1 unit of work plus whatever it costs to solve a size-$(n-1)$ problem" — this is exactly the pattern for something like finding the maximum of a list recursively (compare the last element to the max of the rest).

The **substitution method** is one way to solve such a recurrence — turn the abstract equation into a concrete formula like $T(n) = O(n)$. The idea: *guess* the answer's general shape first, then *prove* your guess is correct using mathematical induction, exactly the way you'd verify a claimed pattern by checking it holds for a small case and then holds "one step later" too.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

**What a recurrence relation is.** A recurrence expresses $T(n)$ (the cost of solving a problem of size $n$) in terms of $T$ evaluated at smaller inputs, plus some extra work done at the current level. General form:
$$T(n) = a \cdot T(n/b) + f(n) \qquad \text{or} \qquad T(n) = T(n-k) + f(n)$$
depending on whether the problem shrinks by a *fraction* (divide-and-conquer, e.g. binary search: $T(n) = T(n/2) + O(1)$) or by a *fixed amount* (linear recursion, e.g. factorial: $T(n) = T(n-1) + O(1)$). A **base case** is also required — e.g. $T(1) = O(1)$ — since without one, the recursion would never terminate, mirroring the Finiteness requirement from earlier in this module.

**The substitution method, step by step:**
1. **Guess** the form of the solution (e.g. "I believe $T(n) = O(n)$," or more precisely, "$T(n) \le cn$ for some constant $c$ and all $n \ge n_0$").
2. **Assume** the guess holds for all values *smaller* than $n$ (this is the inductive hypothesis).
3. **Substitute** this assumption into the recurrence's right-hand side, and simplify algebraically.
4. **Verify** that the result matches (or is bounded by) the guessed form for $n$ itself — if it does, the guess is proven correct by induction; if it doesn't quite work, adjust the guess (often by subtracting a lower-order term) and retry.

This is mathematical induction applied directly to algorithm analysis: the base case anchors the proof, and the inductive step shows the pattern is self-sustaining — if it holds for all smaller sizes, it holds for size $n$ too, so by induction it holds for every $n$.

::: anim substitution-pipeline Guess, Assume, Substitute, Verify
Watch the four stations light in order — each station's output feeds the next, and a miss at Verify loops all the way back to a weaker Guess.
:::

**Why "guess, then prove" and not "just prove directly"?** Recurrences don't have an obvious closed-form answer sitting in plain sight — you generally need *some* candidate answer to test before you can verify it algebraically. The guess often comes from intuition, from an unrolled few levels of recursion (a sneak peek at the iteration method, covered next), or from experience with similar recurrences. The substitution method's power is that once you have a plausible guess, it gives you an airtight, rigorous way to confirm — or refute — it.

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Solve the recurrence $T(n) = T(n-1) + n$, with base case $T(1) = 1$, using the substitution method. This recurrence describes, for example, an algorithm that does $n$ units of work at the current call, then recurses on a problem one smaller.
:::

::: step [Step 2: Execution] Applying Core Algorithm
**Guess:** based on the pattern (each level adds roughly $n$, $n-1$, $n-2, \dots$ down to 1 — an arithmetic-series shape), guess $T(n) = O(n^2)$, specifically claim $T(n) \le cn^2$ for some constant $c$ and all $n \ge 1$.
**Inductive hypothesis:** assume $T(n-1) \le c(n-1)^2$ holds for the smaller case.
**Substitute:** $T(n) = T(n-1) + n \le c(n-1)^2 + n = c(n^2 - 2n + 1) + n = cn^2 - 2cn + c + n$.
**Simplify toward the goal:** we want to show this is $\le cn^2$. That requires $-2cn + c + n \le 0$, i.e. $n(1-2c) \le -c$, which holds for any $c \ge 1$ and $n \ge 1$ (choosing, say, $c=1$: $-2n+1+n = -n+1 \le 0$ for all $n \ge 1$). So $T(n) \le cn^2$ is confirmed.
:::

::: step [Step 3: Conclusion] Final Result
The inductive step succeeds with $c=1$, and the base case $T(1)=1 \le c(1)^2=1$ also holds — so by mathematical induction, $T(n) = O(n^2)$ is proven rigorously for all $n \ge 1$. (In fact this recurrence's exact closed form is $T(n) = \frac{n(n+1)}{2}$, the same arithmetic series seen in the previous topic's dependent-nested-loop example — confirming that a recursive version and an iterative nested-loop version of "add up 1 through $n$" share the same $\Theta(n^2)$ complexity, as they should, since they're doing the same underlying work.)
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
