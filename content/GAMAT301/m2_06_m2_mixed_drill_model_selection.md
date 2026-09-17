# M2 Mixed Drill: Model Selection & Table Tactics

**"Which distribution?" in 10 seconds, normal-table speed runs, and the exponential/uniform one-liners.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Triage Nurse
Every M2 question is triage: flat bounded → Uniform; bell/errors → Normal (standardise!); waiting/ageless → Exponential; area/count phrasing decides pdf vs tail. Diagnose first, compute second — wrong model with perfect arithmetic still scores zero.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Triage table

| Symptom | Model | First move |
|---|---|---|
| equally likely on $[a,b]$ | $U[a,b]$ | length ratios; $(b-a)^2/12$ |
| bell, $\mu$, $\sigma$ | $N(\mu,\sigma^2)$ | $z = (x-\mu)/\sigma$, then $\Phi$ |
| waiting time, rate $\lambda$ | $\text{Exp}(\lambda)$ | $e^{-\lambda x}$ tails; $1/\lambda$ mean |
| pairs $(X,Y)$ density | joint $f(x,y)$ | integrate out / product test |

### 2.2 Table tactics

Memorise $\Phi(1)$, $\Phi(1.645)$, $\Phi(1.96)$, $\Phi(2.33)$, $\Phi(2.575)$; mirror with $1-\Phi$; intervals by subtraction; percentiles backwards.

::: callout-formula KTU Formula Vault: M2 Triage
Flat → Uniform · bell → $Z$ · waiting → $e^{-\lambda x}$ · pairs → integrate/product.
:::

::: callout-exam KTU Exam Focus
The 9-marker is almost always one Normal computation (two probabilities + one percentile) or one "identify + compute" pair. Triage line first, standardisation line second, table line third — three step marks before the answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Lifetimes $\sim N(1200, 200^2)$ h. (a) $P(\text{lasts } > 1500)$? (b) $P(1000 < X < 1400)$? (c) Warranty length covering all but the worst $5\%$?
:::

::: step [Step 2: Execution] Tail, Interval, Inverse
1. $z = 1.5$: $1-0.9332 = 0.0668$.
2. $z = \pm1$: $0.6826$.
3. $5$th percentile: $z = -1.645$: $1200 - 329 = 871$ h warranty.
:::

::: step [Step 3: Conclusion] Final Result
Same three normal moves as the theory topic, now under exam phrasing ("warranty" = lower percentile). Translate words to tails before touching the table.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Errors $\sim N(0, 2^2)$. $P(|X| > 4)$?
(A) $0.95$
(*B) $z = \pm2$: $2(1-0.9772) = 0.0456$
(C) $0.5$
(D) $0.0228$
::: explanation
Two-sided: double one tail. $P(|Z|>2) = 2\times0.0228 = 0.0456$. Halving (one side only) is the planted trap for $|X|$ questions.
:::

::: quiz Q2: Mixed Drill
Calls arrive at rate $2$/min (exponential waits). $P(\text{wait} > 90\text{ s})$?
(A) $e^{-3} \approx 0.0498$
(*B) $\lambda = 2$/min, $t = 1.5$ min: $e^{-3} \approx 0.0498$
(C) $0.5$
(D) $1-e^{-3}$
::: explanation
Units first: $90$ s $= 1.5$ min, $\lambda t = 3$, tail $e^{-3} \approx 0.05$. Mixing seconds with per-minute $\lambda$ (giving $e^{-180}$) is the unit trap — convert before multiplying.
:::

::: quiz Q3: Mixed Drill
$X \sim U[10, 30]$. $P(X > 25 \mid X > 20)$?
(A) $5/20$
(*B) $(30-25)/(30-20) = 5/10 = 0.5$ — conditional shrinks the base to $[20,30]$
(C) $0.25$
(D) $0.75$
::: explanation
Conditioning re-cuts the uniform base: new length $10$, favourable $5$. Uniform "given" questions are length ratios on the *truncated* interval, never on the original.
:::
