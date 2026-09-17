# Exponential Distribution & Memoryless Property

**Waiting times with no memory — pdf, $1/\lambda$ mean, and the property that defines it.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ageless Bulb
A new bulb and a bulb that survived $1000$ hours have the *same* remaining-life distribution — the bulb "forgets" its age. That is memorylessness: surviving $s$ hours tells you nothing, because failures strike as a steady Poisson rain, not by wearing out. Mean wait $1/\lambda$ is just the rain rate inverted.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 pdf, cdf, moments

$$f(x) = \lambda e^{-\lambda x},\; x \ge 0 \qquad F(x) = 1 - e^{-\lambda x}$$

$$\mu = \frac{1}{\lambda}, \qquad \sigma^2 = \frac{1}{\lambda^2}$$

### 2.2 Memoryless property (only continuous law with it)

$$P(X > s+t \mid X > s) = P(X > t)$$

Proof in one line: $e^{-\lambda(s+t)}/e^{-\lambda s} = e^{-\lambda t}$. It is also the interarrival law of the Poisson process (M3 reuses this).

::: callout-formula KTU Formula Vault: Exponential
**$\lambda e^{-\lambda x}$**, $F=1-e^{-\lambda x}$ · **$\mu=1/\lambda$, $\sigma^2=1/\lambda^2$** · **memoryless**: survived $s$ ⇒ same $P(>t)$.
:::

::: callout-pitfall Rate vs Mean Reciprocals
$\lambda = 3$/hour means mean wait $1/3$ hour ($20$ min) — not $3$ hours. Rate and mean are reciprocals; writing $\mu = \lambda$ inverts every subsequent number.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Component life $\sim \text{Exp}$ with mean $500$ h. (a) $P(\text{survives }800\text{ h})$? (b) Given survival to $800$ h, $P(\text{survives a further }200\text{ h})$?
:::

::: step [Step 2: Execution] Rate Then Memory
1. $\lambda = 1/500$. $P(X>800) = e^{-800/500} = e^{-1.6} \approx 0.2019$.
2. Memoryless: $P(X>1000\mid X>800) = P(X>200) = e^{-0.4} \approx 0.6703$ — the $800$ survived hours contribute nothing.
:::

::: step [Step 3: Conclusion] Final Result
Tails are single exponentials; conditional-after-survival collapses to a fresh tail. Spotting "given survival" is the whole trigger for memorylessness.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$X \sim \text{Exp}(\lambda = 0.5/\text{min})$. Mean, variance, $P(X > 4)$?
(A) $2$, $2$, $e^{-2}$
(*B) $\mu = 2$ min, $\sigma^2 = 4$; $P = e^{-0.5\times4} = e^{-2} \approx 0.1353$
(C) $0.5$, $0.25$, $0.5$
(D) $2$, $4$, $0.5$
::: explanation
$\mu = 1/0.5 = 2$, $\sigma^2 = 1/0.25 = 4$; tail $e^{-\lambda x} = e^{-2} \approx 0.1353$. Mean $\ne$ variance here ($2$ vs $4$) — the Poisson $\mu=\sigma^2$ coincidence does not transfer.
:::

::: quiz Q2: Foundational Concept
Which statement is the memoryless property?
(A) $E[X] = 1/\lambda$
(*B) $P(X > s+t \mid X > s) = P(X > t)$ — age $s$ is forgotten
(C) $Var(X) = 1/\lambda^2$
(D) $f(x)$ is symmetric
::: explanation
Conditioning on survival to $s$ leaves the identical fresh-start law. It characterises the exponential among continuous distributions (geometric among discrete).
:::

::: quiz Q3: Foundational Concept
Why can't human lifetimes be exponential?
(A) Humans are not random
(*B) Mortality rises with age — the remaining-life distribution depends on current age, violating memorylessness
(C) Lifetimes are discrete
(D) $\lambda$ would be zero
::: explanation
Memorylessness forbids ageing effects; human hazard climbs steeply after middle age. Exponential fits ageless failures (electronic components mid-life, radioactive decay) — never wear-out phenomena.
:::
