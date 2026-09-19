---
id: m3_05_poisson_process_drill
courseCode: GAMAT301
module: 3
sequence: 5
title: 'Poisson Process Drill: Rates, Windows & Gaps'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Rescale rates to windows before computing terms
  - Chain disjoint windows by multiplication
  - Discard waited time with memorylessness by name
concepts:
  - rate rescaling
  - complements
  - memoryless application
prerequisites:
  - m3_04_poisson_process_interarrival
examRelevance: medium
tags:
  - probability
  - poisson-drill
---
# Poisson Process Drill: Rates, Windows & Gaps

**Pure problem training — rescaling, multi-window chains, and gap/count crossovers.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Zoom Lens
Rate $\lambda$ is rain per unit; every question zooms to a window ($\times t$) or a gap ($e^{-\lambda t}$). Set the zoom first — all errors in this topic are zoom errors, never formula errors.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Move list

Rescale $\lambda t$ → Poisson terms ($0$: $e^{-\lambda t}$; $1$: $\lambda t\,e^{-\lambda t}$) → complements for "at least" → exponential tails for gaps → disjoint windows multiply (independence).

::: callout-formula KTU Formula Vault: Drill Moves
Zoom **$\lambda t$** · $P(0)=e^{-\lambda t}$ · at-least = **$1-$ rest** · gaps = **Exp tails** · windows **multiply**.
:::

::: callout-pitfall Overlapping Windows Don't Multiply
Independence needs *disjoint* intervals. $P(2\text{ in }[0,1]\text{ and }3\text{ in }[0.5,1.5])$ never factorises — shared half-hour couples them. Check disjointness before multiplying.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$\lambda = 6$/h. (a) $P(\text{at least }2\text{ in }20\text{ min})$? (b) $P(0\text{ in first }10\text{ min AND }1\text{ in next }10\text{ min})$?
:::

::: step [Step 2: Execution] Complement and Chain
1. $\lambda t = 2$: $1 - e^{-2}(1+2) = 1 - 3e^{-2} \approx 1 - 0.4060 = 0.5940$.
2. Disjoint windows, means $1, 1$: $e^{-1}\times e^{-1}(1) = e^{-2} \approx 0.1353$.
:::

::: step [Step 3: Conclusion] Final Result
"At least $k$" with small $k$: complement the first $k$ terms. Chained windows: per-window means, then multiply — independence does the rest.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$\lambda = 3$/h. $P(\text{at least }1\text{ in }20\text{ min})$?
(A) $e^{-1}$
(*B) $\lambda t = 1$: $1-e^{-1} \approx 0.6321$
(C) $3e^{-3}$
(D) $1/3$
::: explanation
$20$ min $= 1/3$ h gives mean $1$; complement of zero: $1-e^{-1}$. "At least one" is always $1-P(0)$ — the fastest Poisson line in the book.
:::

::: quiz Q2: Numerical Drill
$\lambda = 2$/h. $P(\text{exactly }1\text{ in }30\text{ min})$?
(A) $2e^{-2}$
(*B) $\lambda t = 1$: $1\cdot e^{-1} \approx 0.3679$
(C) $0.5$
(D) $e^{-1}/2$
::: explanation
Mean $1$ over the half hour; $P(1) = (\lambda t)e^{-\lambda t} = e^{-1} \approx 0.3679$ — the Poisson peak when the mean is $1$.
:::

::: quiz Q3: Numerical Drill
Mean gap $5$ min. $P(\text{wait} > 5\text{ min for next} \mid \text{already waited }10\text{ min})$?
(A) $e^{-3}$
(*B) $e^{-1} \approx 0.3679$ — memorylessness discards the $10$ waited minutes
(C) $e^{-2}$
(D) $0$
::: explanation
Conditioned survival restarts the clock: $P(T>15\mid T>10) = P(T>5) = e^{-5/5} = e^{-1}$. The waited $10$ minutes vanish — quote memorylessness by name.
:::
