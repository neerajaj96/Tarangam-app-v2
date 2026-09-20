---
id: m3_05_lstm_gru
courseCode: PECST632
module: 3
sequence: 5
title: 'LSTMs (and GRU Sibling)'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Bounce forget, input and output gates off the conveyor
  - Carry additive gradients past fading links
  - Merge lean with GRU gate arithmetic exactly
concepts:
  - LSTM gates
  - gated memory
  - GRU
prerequisites:
  - m3_03_rnn_bptt
examRelevance: high
tags:
  - rnn
  - lstm-gru
---
# LSTMs (and GRU Sibling)

**Gated memory that keeps — forget/input/output bouncers, conveyor gradients, and gate-arithmetic drills.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Nightclub with a Conveyor
Cell state rides a straight **conveyor** (gradient highway — additive updates, no squashing gauntlet!). Three sigmoid **bouncers**: **forget** (toss stale memories! $f_t$), **input** (admit candidates × tanh-newsworthiness!), **output** (reveal filtered version!). Bouncers learn *when* (data-dependent gates!), conveyor preserves *what* (long links survive!). **GRU** merges bouncers (reset+update, no separate conveyor — leaner sibling, similar gigs!).
:::

::: anim lstm-cell Bouncers on a Rail
Forget, input, output light in order while the rail runs straight through — gates decide, conveyor preserves.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Gate equations + gradient story

$$f_t=\sigma(W_f[h_{t-1},x_t]),\ i_t=\sigma(W_i[\cdot]),\ \tilde C_t=\tanh(W_C[\cdot]),\ C_t=f_t\odot C_{t-1}+i_t\odot\tilde C_t,\ o_t=\sigma(W_o[\cdot]),\ h_t=o_t\odot\tanh(C_t)$$

Conveyor: $C_t$ path is *elementwise-additive* ($f\approx1$ ⇒ gradient flows ~intact across steps — vanishing tamed, not banned!). GRU: $z_t,r_t$ gates, no $C$ ( leaner, fewer params!).

::: callout-formula KTU Formula Vault: Gates
$f$ **toss** · $i$ **admit** · $o$ **reveal** · conveyor **additive-gradient** · GRU **merged-lean**.
:::

::: callout-pitfall Gates Don't Guarantee Memory (They Enable It)
Saturated-always-open/closed gates still kill (stuck bouncers = plain RNN with overhead!) — init (forget-bias $\approx1$!) + training dynamics decide. Architecture enables, optimisation realises — credit split honestly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Scalar demo: $C_{t-1}=10$, $f_t=0.9$, $i_t=0.1$, $\tilde C_t=2$, $o_t=0.5$. New $C_t$, $h_t$? Then: which gate kills history if zeroed, and gradient consequence?"
:::

::: step [Step 2: Execution] Conveyor Arithmetic
1. $C_t = 0.9(10)+0.1(2) = 9+0.2 = 9.2$; $h_t = 0.5\tanh(9.2) \approx 0.5(1.0) = 0.5$ (saturated tanh ≈ $1$!).
2. Zero $f_t$ ⇒ $C_t = 0.2$ (history *erased* — amnesia on demand!); gradient through time multiplies $f$'s ($\approx0.9^{steps}$ — gentle fade vs RNN's $0.25$-ish crush!; learned $f\approx1$ preserves!).
:::

::: step [Step 3: Conclusion] Final Result
Gate-arithmetic (elementwise, ordered!) plus gradient reading ($f$-products vs squashed-products). Conveyor-vs-gauntlet contrast is the LSTM thesis in numbers.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$f_t=1$, $i_t=0$ for $50$ steps. $C$ trajectory + gradient fate?
(A) Decays to zero
(*B) $C$ frozen (pure carry: $C_t=C_{t-1}$!) — gradients flow back *intact* ($\prod f = 1$!); constant-error carousel (Hochreiter's original insight, named!)
(C) Explodes
(D) Random walk
::: explanation
Open-forget + closed-input = perfect memory cell (carousel!). Gradient intact across $50$ steps (vs RNN dust!) — carousel regime is *why* LSTMs bridge long gaps; learned gates approximate it adaptively.
:::

::: quiz Q2: Foundational Concept
GRU vs LSTM pick logic:
(A) LSTM always (bigger!)
(*B) Similar ballparks mostly (lean GRU trains faster, fewer params — small-data/compute budgets lean GRU!; LSTM's separate conveyor+output sometimes gentler on very long/complex gates — benchmark, don't dogmatise!)
(C) GRU obsolete
(D) Coin flip, no reasoning
::: explanation
Empirical near-ties dominate literature (task decides by whiskers!) — budget/simplicity argue GRU, conveyor-purism argues LSTM. Benchmark-both discipline beats loyalty — state the trial, not the tribe.
:::

::: quiz Q3: Foundational Concept
Forget-bias init ($\approx1$) wisdom:
(A) Arbitrary folklore
(*B) Start remembering (open conveyor — gradients flow day one!), learn forgetting as needed (task-driven amnesia!) — cold-start amnesia (bias $0$ ⇒ instant forgetting ⇒ nothing learnable!) avoided by construction
(C) Slows training
(D) Breaks gates
::: explanation
Default-open memory (learn to forget!) beats default-closed (nothing persists to learn *from*!). Init-as-prior (remember-first hypothesis!) shapes early dynamics decisively — bias is belief, set deliberately.
:::
