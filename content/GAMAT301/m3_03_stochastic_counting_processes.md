---
id: m3_03_stochastic_counting_processes
courseCode: GAMAT301
module: 3
sequence: 3
title: 'Stochastic Processes: Discrete, Continuous & Counting'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Define a stochastic process as time-indexed random variables
  - Classify processes on the time-by-state grid
  - Test counting checklists and stationary independent increments
concepts:
  - stochastic process
  - counting process
  - stationary increments
prerequisites: []
examRelevance: medium
tags:
  - probability
  - stochastic-processes
---
# Stochastic Processes: Discrete, Continuous & Counting

**Collections of random variables indexed by time — the taxonomy M3's processes live in.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Film vs Photo
A random variable is one photo (one uncertain number); a **stochastic process** $\{X(t)\}$ is the whole film (an uncertain number *at every instant*). Freeze time $t$ → one RV $X(t)$; run time → a random path. **Counting processes** only tick upward ($0,1,2,\dots$ arrivals); whether the film runs in frames (discrete $n = 0,1,2,\dots$) or continuously decides the family.
:::

::: anim process-grid Two Axes, Four Families
Time type $\times$ state type with residents named — classify first, model second.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Basic taxonomy

* **Discrete-time:** $X_n$, $n = 0,1,2,\dots$ (Markov chains — M4).
* **Continuous-time:** $X(t)$, $t \ge 0$ (Poisson process — next topic).
* **State space** discrete (counts, chain states) vs continuous (Brownian motion, outside syllabus detail).
* **Counting process** $N(t)$: integer-valued, non-decreasing, $N(0) = 0$, jumps of size $1$; increments $N(t+s)-N(s)$ = arrivals in $(s, t]$.

### 2.2 Stationary and independent increments (Poisson preview)

Stationary: increment law depends only on interval *length*; independent: disjoint intervals don't influence each other. Together they force the Poisson law (next topic derives the consequences).

::: callout-formula KTU Formula Vault: Process Types
Process = **$\{X(t)\}$**, RV per instant · counting: **integer, non-decreasing, unit jumps** · increments over **lengths** (stationary) and **disjoint = independent**.
:::

::: callout-pitfall $X(t)$ vs a Single RV
$X(3)$ (queue at 3 pm) is one RV with a distribution; $\{X(t)\}$ is the whole evolving system. "Find the distribution of the process" is meaningless until a time is fixed — always ask "at what $t$?".
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Classify: (a) daily closing price sequence, (b) calls arrived by time $t$, (c) gambler's fortune after $n$ bets. Which are counting processes?
:::

::: step [Step 2: Execution] Time × State Grid
1. (a) discrete-time (days), continuous-state (price) — not counting (goes down).
2. (b) continuous-time, discrete-state, non-decreasing unit jumps — counting process.
3. (c) discrete-time, discrete-state (fortune), not counting (losses decrease it) — a Markov chain preview.
:::

::: step [Step 3: Conclusion] Final Result
Two axes (time type × state type) plus the counting checklist (integer/upward/unit). Every "classify" answer is one row of this grid.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What is a stochastic process?
(A) A single random variable
(*B) A collection $\{X(t)\}$ of random variables indexed by time — one RV per instant, with sample paths over time
(C) A deterministic function
(D) A probability table
::: explanation
Fix $t$ → RV $X(t)$; fix randomness $\omega$ → path $X(t,\omega)$. Both views are tested: distributions at instants, behaviour of paths.
:::

::: quiz Q2: Foundational Concept
Which is a counting process?
(A) Temperature over the day
(*B) Emails arrived by time $t$ — integer, non-decreasing, unit jumps from $0$
(C) Stock price each minute
(D) Coin bias estimate
::: explanation
Counts only accumulate upward in ones from zero. Temperatures and prices move both ways — disqualified by monotonicity.
:::

::: quiz Q3: Foundational Concept
What do stationary independent increments mean for arrivals?
(A) Arrivals stop after a while
(*B) Counts in an interval depend only on its length, and disjoint intervals are independent
(C) Exactly one arrival per interval
(D) Intervals must overlap
::: explanation
Stationarity = rate doesn't drift with the clock; independence = non-overlapping windows don't interact. These two assumptions alone generate Poisson statistics (next topic).
:::
