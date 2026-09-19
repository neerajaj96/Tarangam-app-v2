---
id: m1_06_expectation_functions_m1_drill
courseCode: GAMAT301
module: 1
sequence: 6
title: Expectation of Functions & M1 Drill
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Apply the law of the unconscious statistician for E[g(X)] and E[h(X,Y)]
  - Compute covariance with Cov(X,Y) = E[XY] - E[X]E[Y]
  - Decompose the variance of sums with the covariance term
  - Run the mixed Module 1 drill across all five distributions
concepts:
  - law of the unconscious statistician
  - covariance
  - variance of sums
prerequisites:
  - m1_02_expectation_mean_variance
  - m1_05_joint_pmf_marginals_independence
examRelevance: high
tags:
  - probability
  - covariance
  - m1-drill
---
# Expectation of Functions & M1 Drill

**$E[g(X)]$, $E[h(X,Y)]$, covariance shortcut — then a mixed Module 1 drill over every distribution.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Prize Converter
$E[X]$ averages raw tickets; $E[X^2]$ averages *squared* tickets (for variance); $E[XY]$ averages *paired* tickets. The rule never changes — weight the *transformed* value by its probability (law of the unconscious statistician). Covariance then measures whether paired tickets rise together (positive), oppose (negative), or ignore each other (zero, guaranteed if independent).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 LOTUS and covariance

$$E[g(X)] = \sum_x g(x)p(x), \qquad E[h(X,Y)] = \sum_x\sum_y h(x,y)p(x,y)$$

$$Cov(X,Y) = E[XY] - E[X]E[Y], \qquad Var(X+Y) = Var(X)+Var(Y)+2Cov(X,Y)$$

Independent ⇒ $Cov = 0$ (converse false in general — KTU's favourite true/false).

### 2.2 M1 drill map

pmf/cdf validity → mean/variance + linear transforms → binomial terms/complements → Poisson terms + $np$ bridge → joint margins + independence → $E[g]$, $E[XY]$, covariance.

::: callout-formula KTU Formula Vault: Functions + Drill
**$E[g]=\sum g(x)p$** · **$Cov=E[XY]-E[X]E[Y]$** · $Var(X\pm Y)=Var(X)+Var(Y)$ iff independent (else $\pm2Cov$).
:::

::: callout-pitfall $E[X^2] \ne (E[X])^2$
Squaring after averaging vs averaging after squaring differ by exactly the variance. Confusing them zeroes every variance computation — always average the *squares*.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$X$: $0$ (0.5), $1$ (0.3), $2$ (0.2). Find $E[X^2]$, $Var(X)$, and $E[(X-1)^2]$ two ways.
:::

::: step [Step 2: Execution] Transform Then Average
1. $E[X] = 0 + 0.3 + 0.4 = 0.7$. $E[X^2] = 0 + 0.3 + 0.8 = 1.1$. $Var = 1.1 - 0.49 = 0.61$.
2. Direct: $(0-1)^2(0.5)+(0)^2(0.3)+(1)^2(0.2) = 0.5+0+0.2 = 0.7$. Via shift: $E[(X-1)^2] = Var(X) + (E[X]-1)^2 = 0.61 + 0.09 = 0.7$. Match confirms.
:::

::: step [Step 3: Conclusion] Final Result
$E[(X-c)^2] = Var + (\mu-c)^2$ decomposes any shifted-square expectation — minimum at $c = \mu$, a fact that reappears in estimation theory.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$X$: $1$ (0.6), $3$ (0.4). $E[X^2]$?
(A) $2.8^2 = 7.84$
(*B) $1(0.6)+9(0.4) = 0.6+3.6 = 4.2$
(C) $1.8$
(D) $4.0$
::: explanation
Average the squares ($1$ and $9$), not the square of the average ($1.8^2 = 3.24$). $E[X^2] = 4.2$, and $Var = 4.2-3.24 = 0.96$ follows.
:::

::: quiz Q2: Numerical Drill
$E[X]=2$, $E[Y]=3$, $E[XY]=7$. $Cov(X,Y)$ and $Var(X+Y)$ if $Var(X)=1$, $Var(Y)=2$?
(A) $1$ and $3$
(*B) $Cov = 7-6 = 1$; $Var = 1+2+2(1) = 5$
(C) $6$ and $3$
(D) $0$ and $3$
::: explanation
$Cov = E[XY]-E[X]E[Y] = 1 \ne 0$, so $X,Y$ are dependent and the sum's variance needs the $+2Cov$ term: $5$, not $3$.
:::

::: quiz Q3: Mixed Drill
$X \sim B(6, 0.5)$. $P(X = 3)$?
(A) $0.5$
(*B) $\binom{6}{3}/64 = 20/64 = 0.3125$
(C) $0.125$
(D) $0.75$
::: explanation
At $p = 1/2$ every one of $64$ patterns is equiprobable; $\binom{6}{3} = 20$ give three heads: $20/64 = 0.3125$ — the distribution's peak, as symmetry demands.
:::
