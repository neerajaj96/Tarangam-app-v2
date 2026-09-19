# Expectation, Mean & Variance

**The weighted average, the spread, and the shortcut formulas — plus every property KTU tests.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Loaded Seesaw
**Expectation** $E[X]$ is the balance point of a seesaw with probability-weights: values far out pull harder per unit mass. **Variance** is how scattered the weights sit around that pivot — all mass at the centre (constant) means zero wobble; split extremes mean wild swinging. The shortcut $Var = E[X^2] - \mu^2$ just says: average the squares, then subtract the square of the average.
:::

::: anim seesaw-mean Masses Balance at μ = 0.4
Probability blocks ($-1$: $0.2$, $0$: $0.5$, $2$: $0.3$) teeter exactly at the worked mean — move any block and the pivot must follow.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Definitions

$$\mu = E[X] = \sum_x x\,p(x), \qquad \sigma^2 = Var(X) = E[(X-\mu)^2] = \sum_x (x-\mu)^2 p(x)$$

Shortcut (always faster):

$$Var(X) = E[X^2] - (E[X])^2, \qquad \sigma = \sqrt{Var}$$

### 2.2 Properties (memorise all four)

* $E[aX + b] = aE[X] + b$; $Var(aX + b) = a^2Var(X)$ (shifts don't spread).
* $E[X+Y] = E[X]+E[Y]$ always; $Var(X+Y) = Var(X)+Var(Y)$ only if independent (M1 needs the independent case).
* $Var(X) = 0$ iff $X$ is constant almost surely.

::: callout-formula KTU Formula Vault: Mean/Spread
**$E[X]=\sum xp$** · **$Var=E[X^2]-\mu^2$** · $E[aX+b]=aE+b$ · **$Var(aX+b)=a^2Var$** · sums add; variances add iff independent.
:::

::: callout-pitfall The Missing Square on $a$
$Var(3X) = 9Var(X)$, not $3Var(X)$ — spread scales quadratically because deviations triple *and* get squared. And $+b$ vanishes entirely from variance. These two slips cost a mark each, every exam.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$X$: $-1$ with prob $0.2$, $0$ with $0.5$, $2$ with $0.3$. Find $\mu$, $\sigma^2$, and $E[4X+1]$, $Var(4X+1)$.
:::

::: step [Step 2: Execution] Two Passes
1. $E[X] = (-1)(0.2) + 0 + 2(0.3) = -0.2 + 0.6 = 0.4$.
2. $E[X^2] = 1(0.2) + 0 + 4(0.3) = 0.2 + 1.2 = 1.4$. $Var = 1.4 - 0.16 = 1.24$, $\sigma \approx 1.114$.
3. $E[4X+1] = 4(0.4)+1 = 2.6$; $Var(4X+1) = 16(1.24) = 19.84$.
:::

::: step [Step 3: Conclusion] Final Result
Always compute $E[X]$ and $E[X^2]$ first — mean, variance, and every linear transformation follow in one line each.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$X$ takes $1, 2, 3$ with probs $0.5, 0.3, 0.2$. $E[X]$?
(A) $2.0$
(*B) $1(0.5)+2(0.3)+3(0.2) = 0.5+0.6+0.6 = 1.7$
(C) $6.0$
(D) $1.0$
::: explanation
Weighted average, weights = probabilities: $0.5 + 0.6 + 0.6 = 1.7$. The unweighted average $2.0$ is the trap — probabilities, not positions, decide.
:::

::: quiz Q2: Numerical Drill
$E[X] = 5$, $E[X^2] = 30$. $Var(X)$ and $Var(2X-3)$?
(A) $5$ and $10$
(*B) $30-25 = 5$; $4\times5 = 20$
(C) $30$ and $60$
(D) $5$ and $7$
::: explanation
$Var = E[X^2]-\mu^2 = 30-25 = 5$. Then $Var(2X-3) = 2^2\times5 = 20$ — square the scale, drop the shift.
:::

::: quiz Q3: Foundational Concept
$Var(X) = 0$. What does this mean?
(A) $X$ is standard normal
(*B) $X$ equals a constant with probability $1$
(C) $X$ has no mean
(D) $X$ is always negative
::: explanation
Zero spread means no deviation from the mean is possible — all mass sits exactly at $\mu$. Any non-degenerate distribution has strictly positive variance.
:::
