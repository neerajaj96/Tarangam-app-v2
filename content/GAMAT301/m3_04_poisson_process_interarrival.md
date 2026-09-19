# Poisson Process & Interarrival Times

**The arrival process: Poisson counts, exponential gaps, and why the two are the same fact.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Steady Rain
Raindrops hit a tile as steady random rain: counts per minute are Poisson (M1's law returns with $\lambda t$), while gaps between consecutive drops are exponential with the same rate — short gaps common, long gaps rare, no memory. "How many by time $t$?" and "how long till the next?" are two camera angles on one rain.
:::

::: anim poisson-rain Ticks, Gaps, Counts
Irregular ticks with Exp gaps and Poisson window counts — gaps common-short, totals $\lambda t$ on average.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Counts and gaps

$$P(N(t) = n) = \frac{e^{-\lambda t}(\lambda t)^n}{n!}, \qquad E[N(t)] = \lambda t$$

Interarrival $T \sim \text{Exp}(\lambda)$: $P(T > t) = P(N(t) = 0) = e^{-\lambda t}$ — zero arrivals *is* a long gap. Gaps are i.i.d. exponential (memoryless rain).

### 2.2 Working consequences

Merging independent Poisson streams adds rates; splitting by coin-flip thins them (qualitative use only). Waiting for the $n$th arrival is Gamma/Erlang (statement only — beyond computation here).

::: callout-formula KTU Formula Vault: Poisson Process
Counts **Poisson($\lambda t$)** · gaps **Exp($\lambda$)** · $P(\text{gap}>t)=e^{-\lambda t}$ · mean count **$\lambda t$**.
:::

::: callout-pitfall $\lambda$ vs $\lambda t$
Rate $\lambda$ (per unit) vs interval mean $\lambda t$ — using $\lambda$ for a $3$-hour window triples-down every term. Multiply rate by time *first*, then open the Poisson formula.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Messages arrive at $4$/hour. (a) $P(6\text{ in }2\text{ h})$? (b) $P(\text{next within }15\text{ min})$? (c) $P(\text{none in }30\text{ min})$?
:::

::: step [Step 2: Execution] Counts and Gaps
1. $\lambda t = 8$: $e^{-8}8^6/720 \approx 0.000335\times262144/720 \approx 0.1221$.
2. Gap $\sim \text{Exp}(4/\text{h})$: $1-e^{-4(0.25)} = 1-e^{-1} \approx 0.6321$.
3. $e^{-4(0.5)} = e^{-2} \approx 0.1353$ — same number M1 drilled, now as a "gap exceeds" event.
:::

::: step [Step 3: Conclusion] Final Result
Counts → Poisson($\lambda t$); gaps → Exp($\lambda$) tails. The (c)=(a)-with-$n=0$ identity links both halves — cite it to show mastery.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$\lambda = 5$/h. $P(2\text{ arrivals in }30\text{ min})$?
(A) $e^{-5}5^2/2$
(*B) $\lambda t = 2.5$: $e^{-2.5}(2.5)^2/2 \approx 0.2565$
(C) $0.5$
(D) $e^{-2.5}$
::: explanation
Rescale to the window: $5\times0.5 = 2.5$, then Poisson terms. Raw-$\lambda$ answers ($e^{-5}\dots$) count a full hour, not the asked half.
:::

::: quiz Q2: Numerical Drill
Interarrival mean is $10$ min. $P(\text{gap} > 20\text{ min})$?
(A) $0.5$
(*B) $\lambda = 0.1$/min: $e^{-0.1\times20} = e^{-2} \approx 0.1353$
(C) $e^{-10}$
(D) $0.865$
::: explanation
Mean gap $10$ min ⇒ rate $0.1$/min; exponential tail $e^{-\lambda t} = e^{-2}$. "Mean gap" inverts to rate before anything else.
:::

::: quiz Q3: Foundational Concept
Why are Poisson-process gaps memoryless?
(A) Gaps are constant
(*B) Stationary independent increments make the future rain independent of the dry spell so far — $P(T>s+t\mid T>s) = P(T>t)$
(C) Arrivals are scheduled
(D) $\lambda$ decreases with waiting
::: explanation
Independence of disjoint intervals means elapsed waiting carries zero information about the remainder — the process restarts at every instant. Memorylessness is independence viewed through gaps.
:::
