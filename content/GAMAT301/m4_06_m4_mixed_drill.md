---
id: m4_06_m4_mixed_drill
courseCode: GAMAT301
module: 4
sequence: 6
title: 'M4 Mixed Drill: Matrices to Steady State'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Run the five-station chain assembly line in order
  - Split 9-marker time across stations evenly
  - Separate periodicity oscillation from balance existence
concepts:
  - chain assembly line
  - ergodic chains
prerequisites:
  - m4_01_markov_chains_transition_matrix
  - m4_02_random_walk_gambler_ruin
  - m4_03_chapman_kolmogorov_equations
  - m4_04_classification_states_irreducible_recurrent
  - m4_05_long_run_stationary_distribution
examRelevance: high
tags:
  - markov-chains
  - m4-drill
---
# M4 Mixed Drill: Matrices to Steady State

**Full-chain workout — $n$-step via C-K, ruin, classification, and stationary in one sitting.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Chain Assembly Line
Station 1: write $P$, audit rows. Station 2: short-term ($P^n$, C-K layovers). Station 3: gambler's ends (ruin). Station 4: geography (classes, closed, recurrent). Station 5: eternity ($\pi = \pi P$). Every M4 question is a subset of stations in order — run the line, stop where asked.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Assembly checklist

Rows sum $1$ → $P^n$/C-K for finite horizons → ruin formula at barriers → $\leftrightarrow$ classes → closed? → recurrent/transient → $\pi = \pi P + \sum\pi = 1$ → fractions and $1/\pi$ return times.

::: callout-formula KTU Formula Vault: M4 Line
Rows **$1$** · $P_{ij}^{(m+n)}=\sum_k$ middles · ruin **$r=q/p$** · classes → closed → **$f=1$?** · **$\pi=\pi P$**.
:::

::: callout-exam KTU Exam Focus
The 9-marker is typically $(P^2$ entry$)$ + (classification of a 3-state chain) or (ruin) + (2-state stationary). Split marks evenly — never spend all time perfecting one station.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$P = \begin{pmatrix}0&1&0\\0.5&0&0.5\\0&1&0\end{pmatrix}$ on $\{1,2,3\}$. (a) $P_{11}^{(2)}$? (b) Classes/period? (c) Stationary?
:::

::: step [Step 2: Execution] Whole Line
1. Via $2$ only: $1\times0.5 = 0.5$ (via $1$: $0$; via $3$: $0$).
2. All communicate (1↔2↔3): irreducible; bipartite returns (even steps only) → period $2$.
3. $\pi_1 = 0.5\pi_2$, $\pi_3 = 0.5\pi_2$, sum $2\pi_2 = 1$: $\pi = (0.25, 0.5, 0.25)$.
:::

::: step [Step 3: Conclusion] Final Result
Short-term $0.5$, one class with period $2$ (so $P^n$ oscillates — no $n\to\infty$ limit!), yet $\pi$ still solves the balance. Periodicity versus stationarity coexistence is the deep point examiners probe.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Above chain: long-run fraction in state $2$ and mean return time?
(A) $0.25$ and $4$
(*B) $0.5$ and $2$ steps — the hub state carries half the time despite period $2$
(C) $1$ and $1$
(D) $0$ and infinite
::: explanation
$\pi_2 = 0.5$ from balance; return time $1/0.5 = 2$ (there-and-back through either side). Stationary fractions exist even when $P^n$ won't converge — balance is algebraic, convergence dynamical.
:::

::: quiz Q2: Mixed Drill
$p = 0.55$ gambler, $k = 4$, $N = 10$. Success probability?
(A) $0.4$
(*B) $r = 0.45/0.55 \approx 0.8182$: ruin $= (r^{10}-r^4)/(r^{10}-1) \approx (0.134-0.448)/(0.134-1) \approx 0.362$; success $\approx 0.638$
(C) $0.55$
(D) $0.818$
::: explanation
Ruin $\approx 0.362$, so success $\approx 0.638$ — favourable odds plus modest goal beat the house edge. Always convert ruin↔success by complement; questions mix which they ask.
:::

::: quiz Q3: Mixed Drill
Which chain has a unique stationary distribution with $P^n \to$ rows of $\pi$?
(A) Reducible with two closed classes
(*B) Finite irreducible aperiodic — ergodic: unique $\pi$ and start-independent convergence
(C) Periodic irreducible
(D) Chain with all transient states
::: explanation
Ergodic = irreducible + aperiodic (+finite): one $\pi$, and memory of the start washes out. Each dropped adjective breaks something — periodicity oscillates, reducibility traps, transience drains.
:::
