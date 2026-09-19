---
id: m4_02_random_walk_gambler_ruin
courseCode: GAMAT301
module: 4
sequence: 2
title: Random Walk Model & Gambler's Fortune
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Model positions as binomial sums with mean and variance
  - Apply the ruin formula with the losers-over-winners ratio
  - Recognize walks as Markov chains from the present-only update
concepts:
  - random walk
  - gambler's ruin
prerequisites:
  - m1_03_binomial_distribution_problems
  - m4_01_markov_chains_transition_matrix
examRelevance: medium
tags:
  - markov-chains
  - random-walk
---
# Random Walk Model & Gambler's Fortune

**Simple symmetric and biased walks — position as a sum, and ruin probabilities.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Drunk Lamppost Steps
A drunk steps right (+1, prob $p$) or left (−1, $q = 1-p$) each second: position after $n$ steps is the sum of $n$ independent $\pm1$ variables — a binomial walk in disguise. Fair coins ($p = 1/2$) wander with zero drift but $\sqrt{n}$ spread; biased coins march away. Barriers (ruin at $0$, target at $N$) turn wandering into a gambler's fate with an exact formula.
:::

::: anim ruin-walk Wiggle Between Walls
Stake $k$ wanders to absorption — fate by formula in $k$, $p$, $N$, not by path-watching.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Walk as a sum

$S_n = Y_1+\dots+Y_n$, $Y_i = \pm1$: $E[S_n] = n(p-q)$, $Var(S_n) = 4npq$ (each step variance $4pq$). Symmetric: mean $0$, variance $n$.

### 2.2 Gambler's ruin (standard result)

Fortune $0$–$N$, win prob $p$ per bet, ruin at $0$, goal $N$. From $k$:

$$P_k(\text{ruin}) = \frac{(q/p)^N - (q/p)^k}{(q/p)^N - 1}\;(p\ne q), \qquad P_k = 1 - k/N\;(p = q = 1/2)$$

Unfavourable $p < 1/2$ with big $N$: ruin near-certain even from deep pockets.

::: callout-formula KTU Formula Vault: Random Walk
$S_n = \sum\pm1$ · mean **$n(p-q)$**, var **$4npq$** · ruin from $k$: **$[(q/p)^N-(q/p)^k]/[(q/p)^N-1]$**, fair case **$1-k/N$**.
:::

::: callout-pitfall $p$ Is the Up-Step, $q/p$ the Ratio
Ruin uses $r = q/p$ (losers over winners), not $p/q$. Inverting the ratio mirrors the answer (target instead of ruin) — label $r$ explicitly before substituting.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Fair walk, $10$ steps from $0$: $E[S_{10}]$, $Var(S_{10})$, $P(S_{10} = 2)$? Then gambler: $p = 0.5$, $k = 3$, $N = 10$ — ruin probability?
:::

::: step [Step 2: Execution] Sum Statistics, Then Ruin
1. Mean $0$, var $10$. $S_{10} = 2$ needs $6$ ups, $4$ downs: $\binom{10}{6}/2^{10} = 210/1024 \approx 0.2051$.
2. Fair ruin: $1 - 3/10 = 0.7$.
:::

::: step [Step 3: Conclusion] Final Result
Walk positions are binomial counts shifted ($S_n = 2B - n$); ruin is one formula with a fair-case shortcut. Convert positions to up-counts first — every walk probability is binomial underneath.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Symmetric walk, $n = 16$. $Var(S_{16})$ and $P(S_{16} = 0)$?
(A) $16$ and $0.5$
(*B) Var $= 16$; return needs $8$–$8$: $\binom{16}{8}/2^{16} = 12870/65536 \approx 0.1964$
(C) $4$ and $0.1964$
(D) $16$ and $0$
::: explanation
Each fair step has variance $1$, summing to $16$ (sd $4$ — spread, not certainty). Exact return is the central binomial term $\approx 0.196$ — the walk spreads as $\sqrt{n}$ while return odds decay as $1/\sqrt{n}$.
:::

::: quiz Q2: Numerical Drill
$p = 0.4$, $k = 5$, $N = 10$. Ruin probability?
(A) $0.5$
(*B) $r = 1.5$: $(1.5^{10}-1.5^5)/(1.5^{10}-1) = (57.67-7.59)/56.67 \approx 0.8837$
(C) $0.1163$
(D) $0.4$
::: explanation
$r = q/p = 0.6/0.4 = 1.5$; formula gives $\approx 0.884$ ruin — the $0.116$ complement is the *success* probability. Unfavourable odds plus a far goal grind almost everyone down.
:::

::: quiz Q3: Foundational Concept
Why is the simple random walk a Markov chain?
(A) Steps are identically distributed
(*B) Next position = present $\pm 1$ regardless of path history — the present screens off the past
(C) It has only two states
(D) It never revisits states
::: explanation
$S_{n+1} = S_n \pm 1$ with fixed probabilities: conditional on $S_n$, history is irrelevant. Infinite state space ($\dots,-1,0,1,\dots$) is fine — Markov cares about memory, not finiteness.
:::
