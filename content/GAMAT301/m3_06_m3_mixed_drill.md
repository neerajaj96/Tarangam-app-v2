# M3 Mixed Drill: Bounds, CLT & Arrivals

**Inequality vs exact, mean vs sum standardisation, counts vs gaps — the three confusions, drilled out.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Doors
Door 1 (bounds): only $\mu$/$\sigma$ known → Markov/Chebyshev, loose but certain. Door 2 (CLT): $n$ large → bell approximation, tight but approximate. Door 3 (arrivals): rate + time words → Poisson($\lambda t$) or Exp gaps, exact. The question's *given data* picks the door — match data to door, never force one.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Door signs

| Given | Door | Tool |
|---|---|---|
| only mean (non-negative $X$) | bounds | $\mu/a$ |
| mean + variance, "at least/at most" | bounds | $1/k^2$ or $\sigma^2/d^2$ |
| $n$ large, $\mu$, $\sigma$ | CLT | $Z$ with SE $\sigma/\sqrt{n}$ |
| "per hour", windows, gaps | arrivals | Poisson($\lambda t$) / $e^{-\lambda t}$ |

::: callout-formula KTU Formula Vault: M3 Doors
Bounds **$\mu/a$, $1/k^2$** · CLT **SE $=\sigma/\sqrt{n}$** · arrivals **$\lambda t$ + gaps**.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs CLT (one mean + one sum probability) with a Poisson window question. State the door (CLT/Poisson/bound) in each part's first line — diagnosis marks are real.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) $X \ge 0$, $E[X] = 30$: bound $P(X \ge 90)$? (b) $n = 100$, $\mu = 30$, $\sigma = 6$: approximate $P(\bar X > 31)$? (c) $\lambda = 2$/h: $P(0\text{ in }30\text{ min})$?
:::

::: step [Step 2: Execution] Three Doors, Three Lines
1. Markov: $30/90 = 1/3$.
2. SE $= 0.6$: $z = 1/0.6 \approx 1.667$: $1-\Phi \approx 0.0478$.
3. $\lambda t = 1$: $e^{-1} \approx 0.3679$.
:::

::: step [Step 3: Conclusion] Final Result
Bound $1/3$ (certain, loose) vs CLT $0.048$ (approximate, tight) vs Poisson $0.368$ (exact model) — three philosophies of uncertainty in one drill.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Only $\mu = 12$ ($X \ge 0$) is known. Best bound on $P(X \ge 36)$?
(A) CLT gives $0.001$
(*B) Markov: $12/36 = 1/3$ — CLT is unavailable (no $\sigma$, no $n$)
(C) Poisson $e^{-3}$
(D) Exactly $1/3$
::: explanation
One-number data forces Markov; CLT needs spread + sample size that aren't given. A bound is an upper limit, not an equality — "at most $1/3$".
:::

::: quiz Q2: Mixed Drill
$n = 49$, $\mu = 70$, $\sigma = 14$. Approximate $P(\bar X < 68)$?
(A) $\Phi(-2)$
(*B) SE $= 2$: $z = -1$: $\Phi(-1) \approx 0.1587$
(C) $0.5$
(D) $0.8413$
::: explanation
SE $= 14/7 = 2$; $z = (68-70)/2 = -1$; lower tail $0.1587$. Raw-$\sigma$ standardising ($z = -1/7$) is the trap — means use SE.
:::

::: quiz Q3: Mixed Drill
$\lambda = 4$/h. $P(\text{gap} > 30\text{ min})$?
(A) $e^{-4}$
(*B) $\lambda t = 2$: $e^{-2} \approx 0.1353$
(C) $1-e^{-2}$
(D) $0.5$
::: explanation
$30$ min at $4$/h means $\lambda t = 2$ expected arrivals; none arrive with $e^{-2}$. Gap/count duality once more: "gap exceeds $t$" = "zero counts in $t$".
:::
