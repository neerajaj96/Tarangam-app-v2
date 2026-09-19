---
id: m1_04_poisson_distribution_binomial_limit
courseCode: GAMAT301
module: 1
sequence: 4
title: Poisson Distribution & Binomial Limit
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - State the Poisson pmf and its mean-equals-variance moments
  - Apply the binomial-to-Poisson limit rule for large n and small p
  - Triage binomial versus Poisson models from question symptoms
  - Rescale the rate lambda over different time intervals
concepts:
  - Poisson distribution
  - rate parameter
  - binomial limit
  - interval counts
prerequisites:
  - m1_02_expectation_mean_variance
  - m1_03_binomial_distribution_problems
examRelevance: high
tags:
  - probability
  - poisson-distribution
---
# Poisson Distribution & Binomial Limit

**Rare events over time/space — pmf, the $np \to \lambda$ bridge, and when to switch models.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Raindrops on Tiles
Binomial counts heads in $n$ flips; Poisson counts raindrops hitting a tile per minute. Chop time into $n \to \infty$ microscopic slices, each with a drop-chance $p \to 0$ but steady drizzle rate $np = \lambda$ — the binomial formula melts into $e^{-\lambda}\lambda^x/x!$. One parameter $\lambda$ runs everything: mean *and* variance both equal $\lambda$.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 pmf and moments

$$p(x;\lambda) = \frac{e^{-\lambda}\lambda^x}{x!}, \quad x = 0, 1, 2, \dots$$

$$\mu = \lambda, \qquad \sigma^2 = \lambda$$

### 2.2 Poisson as limit of binomial

$n \to \infty$, $p \to 0$, $np = \lambda$ fixed: $\binom{n}{x}p^x(1-p)^{n-x} \to e^{-\lambda}\lambda^x/x!$. Working rule: $n \ge 20$–$50$ with $p \le 0.05$–$0.1$ (and $np$ modest) → Poisson with $\lambda = np$ is exam-acceptable.

### 2.3 Recognition

Counts in a fixed interval (calls/hour, typos/page, arrivals/minute) with no natural $n$; rate $\lambda$ given or $= np$. $P(X = 0) = e^{-\lambda}$ is the most-used single value.

### Binomial or Poisson? (triage table)

| Symptom | Model | First move |
|---|---|---|
| fixed $n$ trials, stable $p$ | Binomial | $\binom{n}{x}p^xq^{n-x}$ |
| $n \ge 50$, $p \le 0.05$ | Poisson ($\lambda = np$) | $e^{-\lambda}\lambda^x/x!$ |
| interval counts, no $n$ | Poisson (rate given) | rescale $\lambda t$ first |
| mean $\ne$ variance claimed | neither — recheck | Poisson forces $\mu = \sigma^2$ |

::: callout-formula KTU Formula Vault: Poisson
**$e^{-\lambda}\lambda^x/x!$** · **$\mu=\sigma^2=\lambda$** · limit needs **$n$ large, $p$ small, $np=\lambda$** · $P(0)=e^{-\lambda}$.
:::

::: callout-pitfall Mean Equals Variance — Use It
If a computed Poisson variance differs from its mean, the arithmetic is wrong — period. This self-check catches more errors than any re-derivation, so verify $\mu = \sigma^2$ before boxing the answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Call centre: $3$ calls/minute average. (a) $P(\text{exactly }5\text{ in a minute})$? (b) $P(\text{none in }2\text{ minutes})$? (c) $2000$ packets, loss prob $0.002$ — approximate $P(3\text{ losses})$ via Poisson.
:::

::: step [Step 2: Execution] Rate In, Terms Out
1. $\lambda = 3$: $e^{-3}3^5/120 = 0.0498\times243/120 \approx 0.1008$.
2. New interval $\lambda = 6$: $e^{-6} \approx 0.00248$.
3. $n$ huge, $p$ tiny: $\lambda = np = 4$. $e^{-4}4^3/6 = 0.0183\times64/6 \approx 0.1954$ (exact binomial $0.1955$ — the approximation earns its keep).
:::

::: step [Step 3: Conclusion] Final Result
Rescale $\lambda$ with the interval, then read off terms. The (c) near-match is the standard "justify the approximation" evidence — quote both values.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$X \sim \text{Poisson}(2)$. $P(X = 0)$ and $P(X = 2)$?
(A) $0$ and $0.5$
(*B) $e^{-2} \approx 0.1353$; $e^{-2}2^2/2 = 2e^{-2} \approx 0.2707$
(C) $0.5$ and $0.25$
(D) $1$ and $0$
::: explanation
$P(0) = e^{-\lambda} = e^{-2} \approx 0.1353$; $P(2) = e^{-2}\times4/2 = 2e^{-2} \approx 0.2707$. Note $P(2) = 2\times P(0)$ here via the $\lambda^2/2$ factor — term ratios shortcut repeated $e^{-\lambda}$ evaluation.
:::

::: quiz Q2: Numerical Drill
$n = 100$, $p = 0.02$. Poisson approximation for $P(X = 1)$?
(A) $0.02$
(*B) $\lambda = 2$: $2e^{-2} \approx 0.2707$
(C) $0.98^{100}$
(D) $2.0$
::: explanation
$n \ge 50$, $p \le 0.05$ → Poisson($2$): $P(1) = \lambda e^{-\lambda} = 2e^{-2} \approx 0.2707$ (exact binomial $0.2707$ to 4 dp — textbook agreement).
:::

::: quiz Q3: Foundational Concept
 arrivals are counted per hour with no fixed trial count. Binomial or Poisson?
(A) Binomial with $n = 60$ minutes always
(*B) Poisson — interval counts with rate $\lambda$ and no natural $n$ are its home ground
(C) Neither fits
(D) Normal always
::: explanation
Binomial needs a fixed number of identical trials; arrivals stream continuously, so $n$ is undefined. Poisson models exactly this: events in a continuum at constant average rate.
:::
