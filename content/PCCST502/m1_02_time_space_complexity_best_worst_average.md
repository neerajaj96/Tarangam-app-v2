---
id: m1_02_time_space_complexity_best_worst_average
courseCode: PCCST502
module: 1
sequence: 2
title: 'Time & Space Complexity: Best, Worst, and Average Cases'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Count primitive operations with memory allocation overhead
  - Separate best, worst and average cases for a given algorithm
  - Defend worst-case priority for critical systems
concepts:
  - operation counting
  - case analysis
  - worst-case priority
prerequisites:
  - m1_01_algorithm_definition_and_criteria
examRelevance: medium
tags:
  - complexity
  - case-analysis
---
# Time & Space Complexity: Best, Worst, and Average Cases

**Primitive operations count, memory allocation overhead, and case sensitivity analysis.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** The same algorithm can be fast or slow depending on *which* input of a given size it receives. Searching exam papers top-to-bottom for a friend's name is instant if the name starts with "A" (first page!) and exhausting if it starts with "Z" (whole stack). Reporting a single number like "takes 50 flips" is therefore meaningless unless we say *which scenario* we mean. This note defines exactly what we count, then splits "how long" into three precise cases.

::: callout-intuition Core Mental Model
Best case = luckiest possible input of size $n$. Worst case = unluckiest possible input of size $n$ (the guarantee engineers buy). Average case = expected work over all inputs of size $n$, under an assumed distribution (usually "every input equally likely"). Symbols: $T(n)$ = time (operation count) as a function of input size $n$; $T_{best}$, $T_{worst}$, $T_{avg}$ = the three cases.
:::

**Tiny toy example (4 papers).** Names [Asha, Bina, Chetan, Divya], searching for each in turn: finding Asha costs 1 flip (best), Divya costs 4 flips (worst), and the average over the four equally-likely targets is $(1+2+3+4)/4 = 2.5$ flips.

::: toggle Expand `T(n) = 3n + 2` symbol by symbol
`T` = time (operation count — the cost function being defined). `(n)` = "as a function of input size n" (the expression varies with n). `3n` = three operations per input element (the `3×` multiplication scales with size — e.g. 3 loop-body steps each). `+ 2` = two one-time setup operations (the addition is size-independent overhead). `=` = "is counted as" (a cost model, not wall-clock seconds). Whole meaning: this algorithm's work grows linearly — double n, roughly double the work. Tiny numbers: n=10 → 32 operations; n=100 → 302.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Primitive operations.** The fixed-cost building blocks the RAM (Random Access Machine) model counts: assignment, arithmetic operation, comparison, array/pointer access, and one method call's overhead. Time complexity is (proportional to) the *total number of primitive operations* executed, as a function of input size $n$.

**Best case** $T_{best}(n)$: minimum operations over *all* inputs of size $n$ — the most favourable input. Example: target is the first array element — 1 comparison regardless of $n$.

**Worst case** $T_{worst}(n)$: maximum operations over all inputs of size $n$ — the least favourable input. The most reported measure, because it is a *guarantee*: "never slower than this, no matter the input". Safety-critical and time-sensitive systems (airline booking, medical devices) need exactly this promise — "usually fast but occasionally very slow" is unacceptable there.

**Average case** $T_{avg}(n)$: *expected* operations averaged over all inputs of size $n$ under an assumed probability distribution (typically uniform). Mathematically harder (needs the distribution) and only as trustworthy as the assumption — if real inputs skew differently, the average-case number misleads.

**Space complexity** counts memory cells used as a function of $n$: input storage + *auxiliary* space (extra variables, temporary arrays, recursion call stack) + output storage. "$O(1)$ space" / "in-place" means the *auxiliary* part is constant — the input itself must exist regardless and is not counted against the algorithm.

::: toggle What do `best`, `worst`, and `average` case mean in one breath each?
`Best` = luckiest input of size n (minimum work — promises nothing about other inputs). `Worst` = unluckiest input (maximum work — the unconditional guarantee engineers buy; the default measure). `Average` = expected work over a stated input distribution (usually "all inputs equally likely" — only as trustworthy as that assumption). Tiny example: linear search best 1, worst n, average (n+1)/2.
:::

::: toggle What is `auxiliary space` vs total space?
Total space = input + auxiliary (working memory) + output. Auxiliary = only the extra the algorithm allocates while running (a few variables, temp arrays, recursion stack). "In-place / O(1) space" constrains the auxiliary part alone — input and output storage always exist and are never counted against the algorithm.
:::

**Why worst case dominates:** average case needs a distribution assumption that may not match reality; best case promises nothing about unlucky inputs. Worst case is distribution-free with an unconditional upper bound — the default in textbooks, interviews, and system design unless stated otherwise.

---

<a id="worked-example"></a>
## 3. Worked example — linear search, all three cases

::: step [Step 1: Setup] Formulating the Problem
Analyse Linear Search — scan left to right, compare each element to the target, stop at the first match (or at the end) — on an array of $n$ elements. Give $T_{best}$, $T_{worst}$, $T_{avg}$.
:::

::: step [Step 2: Execution] Applying Core Algorithm
**Best case:** target is the first element — 1 comparison, exit. $T_{best}(n) = O(1)$ (constant, the $O(1)$ symbol means "bounded by a constant"). **Worst case:** target is last or absent — all $n$ comparisons. $T_{worst}(n) = O(n)$. **Average case** (target present, equally likely anywhere): about half the array on average, roughly $\frac{n+1}{2}$ comparisons — still $O(n)$, same growth rate as worst case with a smaller constant.
:::

::: step [Step 3: Conclusion] Final Result
Best $O(1)$, worst and average $O(n)$: typical and worst performance degrade linearly even though lucky inputs are instant. Never judge suitability by the best case alone — one lucky test run says nothing about the input that matters.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Average case is *not* "run it once and see": it is a mathematical expectation over a distribution you must state.
- $O(1)$ space never means "zero memory": input/output storage always exists; only the *extra* working memory is constant.
- Worst case $\ne$ "the input I happened to test": it is the maximum over *all* inputs of size $n$.

| Similar pair | Distinction that earns marks |
|---|---|
| Best vs worst vs average | Minimum (lucky) vs maximum (guarantee) vs expectation (needs distribution) |
| Total vs auxiliary space | Includes input vs extra working memory only ("in-place" = auxiliary $O(1)$) |
| $O(1)$ time vs $O(1)$ space | Constant operations vs constant extra memory |

**Exam recap (facts an examiner rewards):** primitive operations are the counted unit; worst case gives the unconditional guarantee and is the default; average case assumes (usually uniform) distribution; linear search is $O(1)$ best, $O(n)$ worst and average.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Why do engineers usually prioritise worst-case complexity over average-case complexity when choosing an algorithm for a critical system?
() Worst-case analysis is always numerically smaller than average-case
(*) Worst-case gives an unconditional guarantee that holds for every possible input, while average-case depends on an assumed input distribution that may not match reality
() Average-case complexity cannot be calculated mathematically
() Worst-case is easier to compute in all situations
::: explanation
Worst-case bounds are distribution-free — they hold no matter what the input looks like. Average-case analysis requires assuming a probability distribution over inputs (e.g., "every arrangement is equally likely"), and if real-world inputs don't follow that assumption, the average-case guarantee can be misleading. For anything safety- or time-critical, the unconditional worst-case guarantee is far more valuable.
:::

::: quiz For linear search on an array of size $n$, what is the best-case time complexity?
() $O(n)$
(*) $O(1)$
() $O(\log n)$
() $O(n^2)$
::: explanation
In the best case, the target element is the very first one checked, so the algorithm does exactly one comparison regardless of how large $n$ is — a constant amount of work, $O(1)$.
:::

::: quiz "In-place" or "$O(1)$ auxiliary space" for an algorithm typically means:
() The algorithm uses zero memory at all, including for the input
(*) The algorithm uses only a constant amount of *extra* memory beyond what's needed to store the input and output
() The algorithm can only run on machines with exactly 1 unit of RAM
() The algorithm never modifies the input array
::: explanation
Space complexity discussions usually separate the space needed to hold the input/output (which any algorithm needs regardless) from the auxiliary space the algorithm additionally allocates while working (extra variables, temporary structures, recursion stack). "In-place" means this auxiliary part stays constant, not growing with $n$.
:::
