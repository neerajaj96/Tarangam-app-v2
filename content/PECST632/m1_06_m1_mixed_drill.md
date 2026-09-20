---
id: m1_06_m1_mixed_drill
courseCode: PECST632
module: 1
sequence: 6
title: 'M1 Drill: Forward to Update in One Sitting'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Count parameters then sweep forward without slips
  - Blame backwards and pick regimes at exam pace
  - Price curses and plumb depth factors from reflex
concepts:
  - forward-backward chain
  - training regimes
prerequisites:
  - m1_01_mlp_forward_pass
  - m1_02_backprop_variants
  - m1_03_sgd_schedules
  - m1_04_curse_dimensionality
  - m1_05_deep_feedforward_init
examRelevance: high
tags:
  - foundations
  - m1-drill
---
# M1 Drill: Forward to Update in One Sitting

**Parameters, forward sweep, blame math, regime picks, curse numbers, plumbing factors — M1 as reflexes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Six-Station Gym
Count params → sweep forward → blame backwards → pick regime → feel the curse → check plumbing. Stations in order, no skipping — traces chain (M1.1's numbers feed M1.2's updates!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Station kit

$(n+1)m$ params · $z=Wx+b$, $a=\sigma(z)$ · $\delta$-chain, $O(params)$ · batch/SGD/mini + schedules · $k^d$ curse, manifold exit · He/Xavier + norms.

::: callout-formula KTU Formula Vault: M1 Circuit
Count → sweep → blame → regime → curse → plumb.
:::

::: callout-exam KTU Exam Focus
M1's 9-markers chain forward+backward numerics (one net, both directions!) or pair SGD/regime reasoning with init/curse analysis. Number continuity across sub-parts (reuse forward values!) is the fluency signal — never recompute.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Net $2$-$3$-$1$ sigmoid, all weights $0.5$, biases $0$, $x=[1,1]$, $y=1$, $\eta=0.5$: (a) params? (b) forward out? (c) $\delta^{(2)}$ and $\Delta W^{(2)}$ (direction only)?"
:::

::: step [Step 2: Execution] Full Circuit
1. $(2+1)3+(3+1)1 = 9+4 = 13$.
2. $z^{(1)} = [1.0,1.0,1.0]$ (each $0.5+0.5$); $a^{(1)} = [0.7311\times3]$. $z^{(2)} = 3(0.5)(0.7311) = 1.0966$; out $= \sigma = 0.7496$.
3. $\delta^{(2)} = (0.7496-1)\sigma'(1.0966) = (-0.2504)(0.1877) \approx -0.0470$; $\Delta W^{(2)} = -\eta\delta a^T = +0.5(0.0470)[0.7311\times3]$ — positive nudges (output too low, raise all contributions).
:::

::: step [Step 3: Conclusion] Final Result
Count, sweep (cache!), blame, step-sign sanity (too-low ⇒ raise). Sign-sanity ("should weights rise or fall?") pre-checks arithmetic — direction first, digits second.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$\sigma'(z)$ at $z=0$ (sigmoid)? Max over $z$?
(A) $0$, $1$
(*B) $\sigma(0)=0.5$, $\sigma'=0.25$ at $0$ — and $0.25$ *is* the global max (vanishing seed, quoted exactly!)
(C) $0.5$, $0.5$
(D) $1$, $1$
::: explanation
$\sigma(1-\sigma)$ peaks at $\sigma=1/2$ ($z=0$) giving $1/4$ — products over $L$ layers decay $\le 4^{-L}$. Bound-plus-consequence in one breath is the depth-analysis currency.
:::

::: quiz Q2: Mixed Drill
$10^5$ samples, mini-batch $100$, $20$ epochs: gradient evaluations total?
(A) $20$
(*B) $10^5/100\times20 = 2\times10^4$ steps ($10^2$ grads each) — steps count, not epochs, prices training; epoch-talk hides batch-size effects
(C) $10^5$
(D) $2\times10^6$ steps
::: explanation
Steps $=$ samples/batch $\times$ epochs $= 1000\times20$. Work totals (grad-evals $= 2\times10^6$) vs step counts ($2\times10^4$) distinguished — price in both currencies when asked "how much training".
:::

::: quiz Q3: Mixed Drill
Init $Var(W)=1$, width $50$, ReLU, $8$ layers. Signal fate?
(A) Stable
(*B) Factor $50\cdot1\cdot\tfrac12 = 25$/layer → $25^8$ explosion (NaNs by layer 3–4!) — He ($2/50$) would hold factor $1$; diagnose-then-prescribe in one move
(C) Vanishes to zero
(D) Fine with BatchNorm alone? Helps (re-pressurises!) but init-fix is root-cause — both, ordered root-first
::: explanation
Factor arithmetic predicts ($25\times$/layer compounds insanely); prescription pairs root (He) + scaffold (norms). Predict-then-prescribe-root-first is the plumbing answer shape — (D) half-right gets half marks.
:::
