# Markov & Chebyshev Inequalities

**Distribution-free guarantees — bounding tails from mean alone, or mean plus variance.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Budget Ceiling
**Markov:** if the class average is $50$, at most half the class can score $\ge 100$ — big values "spend" the average budget, capping how many can be huge. **Chebyshev:** if spread $\sigma$ is small, hardly anyone strays $k$ spreads from the mean (at most $1/k^2$) — tight piles can't have fat tails. Both buy certainty with minimal information, so the bounds are loose but universal.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Statements

Markov (needs $X \ge 0$, mean $\mu$):

$$P(X \ge a) \le \frac{E[X]}{a}, \quad a > 0$$

Chebyshev (needs $\mu$, $\sigma^2$):

$$P(|X-\mu| \ge k\sigma) \le \frac{1}{k^2}, \qquad P(|X-\mu| \ge d) \le \frac{\sigma^2}{d^2}$$

Chebyshev follows from Markov applied to $(X-\mu)^2$. Bounds are one-sided guarantees, often far above the true probability.

::: callout-formula KTU Formula Vault: Inequalities
Markov **$P(X\ge a)\le\mu/a$** ($X\ge0$ only!) · Chebyshev **$P(|\cdot|\ge k\sigma)\le1/k^2$** · distance form **$\sigma^2/d^2$**.
:::

::: callout-pitfall Markov Needs Non-Negativity
Applying Markov to wages-minus-debts or errors (which go negative) is invalid — shift or use Chebyshev instead. Examiners plant negative-capable variables precisely to test this gate.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Mean income $₹40{,}000$ (non-negative). (a) Markov-bound $P(X \ge 100{,}000)$? (b) If $\sigma = 10{,}000$, Chebyshev-bound $P(|X-40{,}000| \ge 30{,}000)$? Compare with exact normal value.
:::

::: step [Step 2: Execution] Two Divisions
1. $40{,}000/100{,}000 = 0.4$ — at most $40\%$ earn that much.
2. $k = 3$: bound $1/9 \approx 0.111$. Exact normal $\approx 0.0027$ — Chebyshev is $\sim 40\times$ loose, the price of universality.
:::

::: step [Step 3: Conclusion] Final Result
Markov from one number, Chebyshev from two. Always remark on looseness when the true law is known — the comparison is a bonus mark.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$X \ge 0$, $E[X] = 20$. Upper bound on $P(X \ge 50)$?
(A) $0.5$
(*B) $20/50 = 0.4$
(C) $50/20 = 2.5$
(D) $0.04$
::: explanation
Markov: $\mu/a = 20/50 = 0.4$. Bounds above $1$ are vacuous (e.g. $a < \mu$) — here $0.4$ is informative but weak, as expected.
:::

::: quiz Q2: Numerical Drill
$\mu = 100$, $\sigma = 10$. Bound $P(|X-100| \ge 25)$?
(A) $0.16$
(*B) $k = 2.5$: $1/6.25 = 0.16$
(C) $0.05$
(D) $0.25$
::: explanation
$k = 25/10 = 2.5$ spreads, bound $1/k^2 = 0.16$. Equivalently $\sigma^2/d^2 = 100/625 = 0.16$ — both forms agree; use whichever the question's numbers fit.
:::

::: quiz Q3: Foundational Concept
Chebyshev with $k = 1$ gives bound $1$. Useful?
(A) Yes, proves concentration
(*B) No — probabilities never exceed $1$, so the bound is vacuous; need $k > 1$ for information
(C) Yes for all distributions
(D) It disproves the variance
::: explanation
$P(\cdot) \le 1$ says nothing. Chebyshev bites only beyond one spread ($k = 2$ gives $0.25$, $k = 3$ gives $\approx 0.11$). KTU uses this to check you read bounds critically.
:::
