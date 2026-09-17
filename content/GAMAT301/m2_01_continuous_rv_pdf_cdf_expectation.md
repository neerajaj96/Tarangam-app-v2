# Continuous RVs: pdf, cdf & Expectation

**Density instead of mass — area under the curve, cdf by integration, and why $P(X = x) = 0$.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Sand Pile
A pmf stacks discrete bricks; a pdf spreads a sand pile — the height at one grain means nothing, but the *area* over an interval is the probability. The cdf is the sand swept up to point $x$. A single exact point has zero width, hence zero area: $P(X = x) = 0$ for every $x$ — only intervals count.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 pdf and cdf

$$f(x) \ge 0, \quad \int_{-\infty}^{\infty} f = 1, \quad P(a \le X \le b) = \int_a^b f(x)\,dx$$

$$F(x) = P(X \le x) = \int_{-\infty}^{x} f(t)\,dt, \qquad f(x) = F'(x)$$

$F$ is continuous (no jumps); strict vs non-strict inequalities are interchangeable.

### 2.2 Expectation and variance

$$E[X] = \int x f(x)\,dx, \qquad Var(X) = E[X^2] - \mu^2 = \int x^2 f\,dx - \mu^2$$

Linear-transform rules identical to discrete: $E[aX+b] = aE+b$, $Var(aX+b) = a^2Var$.

::: callout-formula KTU Formula Vault: Continuous Basics
**Area = probability** · $F' = f$ · $P(X=x)=0$ · moments by **integrals**, same $E$/$Var$ algebra.
:::

::: callout-pitfall Density Is Not Probability
$f(x)$ can exceed $1$ (tall narrow pile still has area $1$) — only *areas* are probabilities. Calling a density value a probability is the signature error of this topic.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$f(x) = 2x$ on $[0,1]$ (0 else). Verify validity, find $F(x)$, $P(X > 0.5)$, $E[X]$, $Var(X)$.
:::

::: step [Step 2: Execution] Integrate Everything
1. $\int_0^1 2x\,dx = 1$. Valid.
2. $F(x) = x^2$ on $[0,1]$. $P(X>0.5) = 1 - 0.25 = 0.75$.
3. $E[X] = \int_0^1 2x^2 dx = 2/3$. $E[X^2] = \int_0^1 2x^3 dx = 1/2$. $Var = 1/2 - 4/9 = 1/18 \approx 0.0556$.
:::

::: step [Step 3: Conclusion] Final Result
Validity → cdf → tail via complement → two moments → variance. This five-step chain answers any "given pdf" question in full.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
For continuous $X$, $P(X = 2) = 0$. Why?
(A) $2$ is outside every range
(*B) A point has zero width, so the area (integral) over it is zero — only intervals carry probability
(C) Continuous variables avoid integers
(D) The pdf is zero at $2$
::: explanation
Probability is area under $f$: $\int_2^2 f = 0$ regardless of $f(2)$. Hence $P(X \le 2) = P(X < 2)$ — endpoints never matter for continuous variables.
:::

::: quiz Q2: Numerical Drill
$f(x) = 3x^2$ on $[0,1]$. $E[X]$?
(A) $1/2$
(*B) $\int_0^1 3x^3 dx = 3/4$
(C) $1$
(D) $3$
::: explanation
$E[X] = \int x\cdot3x^2 dx = 3\int_0^1 x^3 dx = 3/4$. The mass leans right (density grows with $x$), so the mean exceeds the midpoint $1/2$ — shape predicts the number.
:::

::: quiz Q3: Foundational Concept
Given $F(x) = 1 - e^{-2x}$ for $x \ge 0$, what is $f(x)$?
(A) $e^{-2x}$
(*B) $F'(x) = 2e^{-2x}$ for $x \ge 0$
(C) $1 - e^{-2x}$
(D) $2x$
::: explanation
Density is the cdf's derivative: $d/dx\,[1-e^{-2x}] = 2e^{-2x}$. (This is the Exponential(2) law — the next-but-one topic.)
:::
