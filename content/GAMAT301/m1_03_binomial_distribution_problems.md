# Binomial Distribution & Problems

**Repeated yes/no trials — pmf, mean $np$, and the four standard question shapes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Coin Factory
Flip a biased coin $n$ times ($P(\text{head}) = p$ each flip, independent). Pick *which* $x$ flips land heads ($\binom{n}{x}$ ways), then charge $p^x(1-p)^{n-x}$ for that exact pattern. Mean $np$ just scales one flip's average; the distribution piles symmetrically only at $p = 1/2$, skewing otherwise.
:::

::: anim binomial-shapes Same n, Moved p
$n = 4$ symmetric at $p = 1/2$ versus piled-left at $p = 0.2$ ($np = 0.8$) — the mean drags the pile it scales.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 pmf, mean, variance

$$b(x;n,p) = \binom{n}{x}p^x(1-p)^{\,n-x}, \quad x = 0,\dots,n$$

$$\mu = np, \qquad \sigma^2 = np(1-p)$$

### 2.2 Recognition checklist (all four needed)

Fixed $n$ · two outcomes per trial · constant $p$ · independent trials. Sampling *without* replacement from a small population breaks it (that's hypergeometric — KTU's favourite "why not binomial" trap).

### 2.3 The four question shapes

Exactly $x$ (one term) · at most/at least (sum tails, or complement $1 - $) · mean/variance fill-in · "identify the distribution" justification.

::: callout-formula KTU Formula Vault: Binomial
**$\binom{n}{x}p^xq^{n-x}$**, $q=1-p$ · **$\mu=np$, $\sigma^2=npq$** · at-least = $1 - $ (at-most $x-1$).
:::

::: callout-pitfall Complement Direction
$P(X \ge 1) = 1 - P(X = 0) = 1 - q^n$ — one term instead of $n$. Students who expand all $n$ terms waste ten minutes; always ask "is the complement shorter?" first.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A packet is lost with $p = 0.1$; $n = 5$ sent independently. Find $P(\text{exactly }2\text{ lost})$, $P(\text{at least }1\text{ lost})$, mean and variance of losses.
:::

::: step [Step 2: Execution] Term, Complement, Moments
1. $\binom{5}{2}(0.1)^2(0.9)^3 = 10\times0.01\times0.729 = 0.0729$.
2. $1 - 0.9^5 = 1 - 0.59049 = 0.40951 \approx 0.41$.
3. $\mu = 5(0.1) = 0.5$; $\sigma^2 = 5(0.1)(0.9) = 0.45$.
:::

::: step [Step 3: Conclusion] Final Result
One term, one complement, two moments — the complete binomial answer in three lines. Quote $\mu = np$ directly; never re-sum the distribution for moments.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$X \sim B(4, 0.25)$. $P(X = 1)$?
(A) $0.25$
(*B) $\binom{4}{1}(0.25)(0.75)^3 = 4\times0.25\times0.421875 = 0.421875$
(C) $0.75$
(D) $0.421875/4$
::: explanation
$\binom{4}{1} = 4$ patterns, each with probability $0.25\times0.75^3 = 0.1055$; total $0.4219$. Dropping $\binom{n}{x}$ is the classic undercount.
:::

::: quiz Q2: Numerical Drill
$X \sim B(10, 0.3)$. Mean and variance?
(A) $3$ and $3$
(*B) $\mu = 3$, $\sigma^2 = 10(0.3)(0.7) = 2.1$
(C) $0.3$ and $0.21$
(D) $10$ and $3$
::: explanation
$\mu = np = 3$; variance multiplies by the extra $q = 0.7$ giving $2.1$. Variance is always below the mean for $q < 1$ — a quick sanity check.
:::

::: quiz Q3: Foundational Concept
Draws are made *without* replacement from $10$ items ($3$ defective), $n = 4$. Binomial?
(A) Yes, always
(*B) No — $p$ changes after each draw, breaking constant-$p$; use hypergeometric (binomial only approximates it for large populations)
(C) Yes, with $p = 0.3$ exactly
(D) No distributions apply
::: explanation
Without replacement the composition shifts, so trials aren't identical. Binomial needs constant $p$ — small-population sampling violates it, and KTU explicitly tests this distinction.
:::
