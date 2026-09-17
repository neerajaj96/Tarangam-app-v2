# Uniform Distribution & Problems

**Total ignorance on $[a,b]$ — flat density, midpoint mean, and $(b-a)^2/12$ variance.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Fair Spinner
A spinner landing anywhere on a dial arc with equal likelihood, a bus equally likely in the next $10$ minutes, rounding error anywhere in $\pm 0.5$ — whenever "no reason to favour any sub-interval", the sand pile is flat. Mean sits dead centre; spread grows with the square of the width.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 pdf, cdf, moments

$$f(x) = \frac{1}{b-a},\; a \le x \le b \qquad F(x) = \frac{x-a}{b-a}$$

$$\mu = \frac{a+b}{2}, \qquad \sigma^2 = \frac{(b-a)^2}{12}$$

Interval probability = favourable length / total length (geometry replaces integration).

::: callout-formula KTU Formula Vault: Uniform
**$1/(b-a)$** · mean **midpoint** · variance **$(b-a)^2/12$** · probabilities = **length ratios**.
:::

::: callout-pitfall Variance Divisor 12
$(b-a)^2/12$, not $/4$ or $/6$. Derive once ($\int$ of $(x-\mu)^2$ over the flat pile) and the $12$ sticks — guessing the divisor is how marks evaporate.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Bus arrives uniformly in $[0,10]$ min. (a) $P(\text{wait} > 7)$? (b) $P(2 < \text{wait} < 5)$? (c) Mean and variance of the wait?
:::

::: step [Step 2: Execution] Lengths and Midpoints
1. $(10-7)/10 = 0.3$.
2. $3/10 = 0.3$.
3. $\mu = 5$ min; $\sigma^2 = 100/12 \approx 8.33$ ($\sigma \approx 2.89$ min).
:::

::: step [Step 3: Conclusion] Final Result
Uniform questions are ruler fractions plus midpoint arithmetic — the fastest marks in Module 2 if the variance divisor is memorised.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$X \sim U[2, 8]$. $P(X > 5)$ and $E[X]$?
(A) $0.5$ and $4$
(*B) $(8-5)/6 = 0.5$; mean $(2+8)/2 = 5$
(C) $0.3$ and $6$
(D) $0.6$ and $5$
::: explanation
Favourable length $3$ of $6$ gives $0.5$; midpoint of $[2,8]$ is $5$. Symmetry makes "above midpoint" always $1/2$ — answer before computing.
:::

::: quiz Q2: Numerical Drill
$X \sim U[0, 12]$. Variance?
(A) $12$
(*B) $144/12 = 12$ — yes, genuinely $12$ here ($[0,12]$ is the coincidence case)
(C) $6$
(D) $144$
::: explanation
$(12-0)^2/12 = 144/12 = 12$. The number equals the width only for width $12$ — don't generalise the coincidence; keep the formula.
:::

::: quiz Q3: Foundational Concept
Rounding error is modelled $U[-0.5, 0.5]$. Mean and variance?
(A) $0$ and $1$
(*B) $\mu = 0$ by symmetry; $\sigma^2 = 1/12$
(C) $0.5$ and $1/12$
(D) $0$ and $1/4$
::: explanation
Midpoint $0$; width $1$ gives $1^2/12 = 1/12$. This $1/12$ quantisation-noise variance echoes through signal processing — remember the pair $(0, 1/12)$.
:::
