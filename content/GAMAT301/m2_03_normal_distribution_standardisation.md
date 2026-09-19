---
id: m2_03_normal_distribution_standardisation
courseCode: GAMAT301
module: 2
sequence: 3
title: Normal Distribution & Standardisation
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Standardise any normal variable to Z scores
  - Read tail, interval, and inverse probabilities from the table
  - Apply the 68-95-99.7 rule and symmetry shortcuts
concepts:
  - normal distribution
  - z-scores
  - standard normal table
  - empirical rule
prerequisites:
  - m2_01_continuous_rv_pdf_cdf_expectation
examRelevance: high
tags:
  - probability
  - normal-distribution
---
# Normal Distribution & Standardisation

**The bell curve, $Z$-scores, table lookups, and the 68-95-99.7 rule — the heaviest numerical topic in M2.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Universal Pile Shape
Heights, errors, exam scores — sums of many small independent nudges all relax into the same bell. **Standardisation** $Z = (X-\mu)/\sigma$ just re-centres the pile at $0$ and re-scales its width to $1$, so one printed table answers every bell question ever: convert units to "standard deviations from the mean", then read area.
:::

::: anim normal-bell Bands at 68-95-99.7
$\sigma$-bands shaded with empirical percentages — standardise first, then read the area your $z$ falls in.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 pdf and the $Z$ transform

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/2\sigma^2}, \qquad Z = \frac{X-\mu}{\sigma} \sim N(0,1)$$

$$P(X \le x) = P\left(Z \le \frac{x-\mu}{\sigma}\right) = \Phi(z)$$

Symmetry: $\Phi(-z) = 1 - \Phi(z)$. Key values: $\Phi(1) \approx 0.8413$, $\Phi(1.645) \approx 0.95$, $\Phi(1.96) \approx 0.975$, $\Phi(2.575) \approx 0.995$. Empirical rule: $68\%$ within $\pm1\sigma$, $95\%$ within $\pm2\sigma$, $99.7\%$ within $\pm3\sigma$.

### 2.2 Lookup procedure

Standardise → split at $0$ if needed → table → complement for upper tails: $P(Z > z) = 1 - \Phi(z)$; intervals $\Phi(b)-\Phi(a)$.

::: callout-formula KTU Formula Vault: Normal
**$Z=(X-\mu)/\sigma$** · $\Phi(-z)=1-\Phi(z)$ · **0.8413 / 0.95 / 0.975 / 0.995** at $1 / 1.645 / 1.96 / 2.575$ · **68-95-99.7**.
:::

::: callout-pitfall Standardise Before You Table
Feeding raw $x$ into $\Phi$ (forgetting $-\mu$, $/\sigma$) is the #1 normal error. Write the $z$-value line explicitly — examiners award it a step mark even if the table read slips.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Scores $\sim N(70, 10^2)$. Find $P(X > 85)$, $P(60 < X < 80)$, and the 95th percentile.
:::

::: step [Step 2: Execution] Three Table Trips
1. $z = 1.5$: $1 - \Phi(1.5) = 1 - 0.9332 = 0.0668$.
2. $z = \pm1$: $\Phi(1)-\Phi(-1) = 0.8413 - 0.1587 = 0.6826$ ($\approx 68\%$ rule, exact).
3. $z_{0.95} = 1.645$: $x = 70 + 1.645(10) = 86.45$.
:::

::: step [Step 3: Conclusion] Final Result
Tail, interval, inverse — the three normal moves. Percentiles run the machine backwards ($z$ first, then $x = \mu + z\sigma$).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$X \sim N(50, 5^2)$. $P(X < 55)$?
(A) $0.5$
(*B) $z = 1$: $\Phi(1) \approx 0.8413$
(C) $0.1587$
(D) $0.95$
::: explanation
$z = (55-50)/5 = 1$, and $\Phi(1) \approx 0.8413$ is the single most-used table value. $0.1587$ is the complementary upper tail — pick sides carefully.
:::

::: quiz Q2: Numerical Drill
$X \sim N(100, 15^2)$. Value exceeding $99\%$ of the population?
(A) $115$
(*B) $100 + 2.33(15) \approx 134.9$ (using $z_{0.99} \approx 2.33$)
(C) $100$
(D) $130$ exactly
::: explanation
Inverse lookup: $z = 2.33$ for $0.99$, then $x = \mu + z\sigma = 100 + 34.95 \approx 135$. Memorise $2.33$ alongside $1.645/1.96$.
:::

::: quiz Q3: Foundational Concept
Why does symmetry $\Phi(-z) = 1-\Phi(z)$ matter?
(A) It proves normality
(*B) Tables list only $z \ge 0$; symmetry recovers all negative-side and interval probabilities from one half
(C) It makes variance zero
(D) It removes the need to standardise
::: explanation
One-sided tables plus symmetry generate every tail and interval: lower tails mirror to upper tails of $|z|$. Without it you'd need double the tables.
:::
