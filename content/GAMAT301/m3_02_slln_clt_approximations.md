# Strong Law of Large Numbers & Central Limit Theorem

**Averages converge (SLLN) and fluctuate normally (CLT) — statements plus the approximation engine for sums and means.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Settling Pond
Toss a coin $10$ times: $80\%$ heads happens. Toss $10{,}000$: the fraction glues to $1/2$ (**SLLN** — the average *settles*). Zoom into the remaining wobble and it is always bell-shaped with width $\sigma/\sqrt{n}$ (**CLT** — the *shape* of the error is universal). SLLN picks the destination; CLT describes the landing pattern.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Statements (proofs excluded per syllabus)

**SLLN:** $\bar X_n = (X_1+\dots+X_n)/n \to \mu$ almost surely as $n \to \infty$ (i.i.d., finite mean).

**CLT:** for large $n$, $\bar X_n \approx N(\mu, \sigma^2/n)$, i.e.

$$Z = \frac{\bar X_n - \mu}{\sigma/\sqrt{n}} \approx N(0,1), \qquad S_n = \sum X_i \approx N(n\mu, n\sigma^2)$$

Working $n \ge 30$ (or $np, nq \ge 5$–$10$ for binomial). Discrete sums use continuity correction $\pm 0.5$.

::: callout-formula KTU Formula Vault: SLLN + CLT
Averages → **$\mu$** (SLLN) · **$(\bar X-\mu)/(\sigma/\sqrt{n})$** bell (CLT) · sums: **$N(n\mu,n\sigma^2)$** · correction **$\pm0.5$**.
:::

::: callout-pitfall $\sigma/\sqrt{n}$ vs $\sigma$
Means vary *less* than individuals — standard error shrinks as $1/\sqrt{n}$. Using $\sigma$ for a mean's spread overstates uncertainty by $\sqrt{n}$ (e.g. $\sim 5.5\times$ at $n = 30$).
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Light bulbs: $\mu = 1000$ h, $\sigma = 100$ h. For $n = 36$, approximate $P(\bar X < 980)$ and $P(S_{36} > 36{,}500)$.
:::

::: step [Step 2: Execution] Standardise the Statistic
1. SE $= 100/6 \approx 16.67$. $z = (980-1000)/16.67 = -1.2$: $\Phi(-1.2) \approx 0.1151$.
2. Sum mean $36{,}000$, sd $600$: $z = 500/600 \approx 0.833$: $1-\Phi(0.833) \approx 0.2023$.
:::

::: step [Step 3: Conclusion] Final Result
Means: divide $\sigma$ by $\sqrt{n}$; sums: multiply mean by $n$, sd by $\sqrt{n}$. Name which statistic you're standardising in line one.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
SLLN vs CLT — what does each promise?
(A) Both promise normality
(*B) SLLN: averages converge to $\mu$; CLT: the scaled fluctuation around $\mu$ is approximately normal
(C) Both need normal data
(D) CLT implies exact normality at $n = 2$
::: explanation
SLLN is about the *destination* (convergence, any shape); CLT about the *journey's noise* (bell-shaped error bars shrinking as $1/\sqrt{n}$). CLT needs no normal parent — that is its power.
:::

::: quiz Q2: Numerical Drill
$100$ fair-coin tosses. Approximate $P(45 \le X \le 55$ heads$)$ with continuity correction.
(A) $0.5$
(*B) $\mu = 50$, $\sigma = 5$: $P(44.5<X<55.5) = \Phi(1.1)-\Phi(-1.1) \approx 0.7287$
(C) $0.95$
(D) $0.6826$
::: explanation
$z = \pm(5.5/5) = \pm1.1$ after the $\pm0.5$ correction; $\Phi(1.1) \approx 0.8643$, doubled-sided gives $0.7287$. Skipping correction gives $\Phi(1)-\Phi(-1) = 0.6826$ — close but mark-losing.
:::

::: quiz Q3: Numerical Drill
$n = 64$, $\sigma = 16$. Standard error of the mean?
(A) $16$
(*B) $16/\sqrt{64} = 2$
(C) $64$
(D) $4$
::: explanation
SE $= \sigma/\sqrt{n} = 16/8 = 2$. Quadrupling data halves error — the square-root tax that makes precision expensive.
:::
