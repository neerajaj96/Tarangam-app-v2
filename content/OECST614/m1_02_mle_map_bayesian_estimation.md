---
id: m1_02_mle_map_bayesian_estimation
courseCode: OECST614
module: 1
sequence: 2
title: 'MLE, MAP & the Bayesian View of Fitting'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Estimate coins with likelihood and log-likelihood discipline
  - Add Beta priors into MAP with washout arithmetic
  - Work one fully counted coin example end to end
concepts:
  - maximum likelihood
  - MAP estimation
  - Beta-Binomial pair
prerequisites: []
examRelevance: medium
tags:
  - probability
  - estimation
---
# MLE, MAP & the Bayesian View of Fitting

**Counting what the data says versus counting what prior belief adds — likelihood, log-likelihood, MLE, MAP with a Beta prior, and one fully worked coin.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Votes Plus Seeded Ballots
**MLE** counts only the votes actually cast (the data). **MAP** adds a few **seeded ballots** (the prior) before counting, so tiny samples cannot swing the result wildly. With handfuls of data the seeds matter; with truckloads they wash out. Bayes' rule is the ballot box: posterior is proportional to likelihood times prior.
:::

This is the estimation engine behind the S5 ML course's regression module (`PCCST503` M1) — same mathematics, restated for engineers with a coin instead of a line.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Likelihood and MLE

For i.i.d. data $D$ and parameter $\theta$, the likelihood is $L(\theta) = P(D \mid \theta)$. The **MLE** is $\hat{\theta}_{MLE} = \arg\max_{\theta} L(\theta)$, found in practice by maximizing the log-likelihood $\ell(\theta) = \log L(\theta)$, since $\log$ is monotone and turns products into sums.

### 2.2 MAP and the Beta–Binomial pair

Bayes' rule gives $P(\theta \mid D) \propto P(D \mid \theta) \, P(\theta)$. The **MAP** estimate is $\hat{\theta}_{MAP} = \arg\max_{\theta} P(D \mid \theta) \, P(\theta)$. For a coin with a $\mathrm{Beta}(a, b)$ prior and $h$ heads in $N$ tosses, the MAP has closed form $\hat{p}_{MAP} = (h + a - 1) / (N + a + b - 2)$, while the MLE is simply $h / N$.

::: callout-formula KTU Formula Vault: Estimation
$L(\theta) = P(D \mid \theta)$ · maximize $\ell = \log L$ · MLE $= h/N$ for a coin · MAP $= (h+a-1)/(N+a+b-2)$ under $\mathrm{Beta}(a,b)$ · big $N$ washes the prior out.
:::

A flat (uniform) prior makes MAP equal MLE — the prior only bites when it is genuinely informative or the data is scarce.

::: callout-pitfall Prior Strength Confusion
A $\mathrm{Beta}(2,2)$ prior adds exactly one phantom head and one phantom tail (pseudo-counts $a - 1$ and $b - 1$), not two of each. Students who add $a$ and $b$ raw double-count the seeds and shift every MAP answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A sensor packet decoder sees 10 bits with 7 ones and 3 zeros. Model each bit as Bernoulli with unknown $p$. Compute (a) the MLE of $p$ and (b) the MAP under a $\mathrm{Beta}(2,2)$ prior.
:::

::: step [Step 2: Execution] Counting Votes and Seeds
(a) MLE $= h/N = 7/10 = 0.7$. (b) The $\mathrm{Beta}(2,2)$ prior contributes $a - 1 = 1$ phantom one and $b - 1 = 1$ phantom zero. MAP $= (7 + 1)/(10 + 2) = 8/12 = 2/3 \approx 0.6667$. The prior pulls $0.7$ toward $0.5$, as one extra zero outweighs one extra one here.
:::

::: step [Step 3: Conclusion] Final Result
MLE $0.7$, MAP $\approx 0.6667$. Sanity: the MAP sits strictly between the MLE ($0.7$) and the prior mean ($0.5$) — any MAP outside that bracket signals arithmetic error.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
8 heads in 10 tosses, $\mathrm{Beta}(2,2)$ prior. MAP?
(A) $8/10 = 0.8$
(*B) $(8+1)/(10+2) = 9/12 = 0.75$, pulled from the MLE toward the prior mean $0.5$
(C) $(8+2)/(10+4) = 10/14 \approx 0.714$
(D) $0.5$ always under any symmetric prior
::: explanation
Pseudo-counts are $a - 1$ and $b - 1$, one phantom head and one phantom tail. Adding raw $a$ and $b$ double-counts the seeds; the MAP must sit between MLE and prior mean.
:::

::: quiz Q2: Foundational Concept
Why maximize the log-likelihood instead of the raw likelihood?
(A) Logs change the argmax to something nicer
(*B) $\log$ is monotone so the argmax is identical, while products become sums that differentiate cleanly and resist underflow
(C) MLE is only defined on log scale by KTU convention
(D) Raw likelihoods cannot be computed at all
::: explanation
Monotonicity preserves the maximizer; the sum form splits over i.i.d. samples and keeps tiny probabilities in a sane range. Same peak, far friendlier arithmetic.
:::

::: quiz Q3: Prior Washout
Same coin, now 700 heads in 1000 tosses, $\mathrm{Beta}(2,2)$ prior. What happens?
(A) MAP stays near $0.5$ regardless of data
(*B) MLE $= 0.7$ and MAP $= 701/1002 \approx 0.6996$, so the two seeded ballots are negligible against 1000 real tosses
(C) MAP becomes $702/1004$ by adding raw $a, b$
(D) The prior mean moves to $0.7$
::: explanation
Two phantom tosses against a thousand real ones shift the answer by about $0.0004$. Data swamps weak priors — the washout property that makes MAP safe, not dogmatic.
:::
