---
id: m1_03_sgd_schedules
courseCode: PECST632
module: 1
sequence: 3
title: 'SGD: Batch, Mini-Batch & Learning Schedules'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Trade exact slow batches against noisy escaping singles
  - Default to mini-batches in the thirty-two to two-fifty-six band
  - Choreograph warmup to decay learning schedules
concepts:
  - stochastic gradient descent
  - mini-batch training
  - learning schedules
prerequisites:
  - m1_02_backprop_variants
examRelevance: medium
tags:
  - optimization
  - sgd
---
# SGD: Batch, Mini-Batch & Learning Schedules

**How much data per step — full-batch truth, stochastic noise, mini-batch compromise, and learning-rate choreography.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Surveying the Slope
**Full-batch** surveys every voter before stepping (true gradient, glacier-slow per step, stuck in sharp minima/saddles). **Stochastic** asks one passerby (noisy steps, escapes shallows, jittery finale). **Mini-batch** polls a focus group ($32$–$256$: GPU-happy matrices, honest-enough direction, healthy noise) — the universal default. **Schedules** choreograph stride: warmup (gentle start), decay/step-drops (settle in), cosine (smooth landing), adaptive per-coordinate (Adam's RMSprop half).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Three regimes + schedules

* Batch GD: $\nabla$ over all $N$ (exact, $O(N)$/step, poor minima/saddles).
* SGD: one sample (unbiased estimate, $O(1)$/step, noise as regulariser+escape).
* Mini-batch: $B$ samples (vectorised, $B=32$–$256$ sweet spot; large-batch needs LR scaling heuristics).
* Schedules: constant / step-decay ($\div10$ on plateau) / exponential / cosine annealing / warmup-then-decay.

::: callout-formula KTU Formula Vault: SGD Regimes
Batch **exact+slow** · stochastic **noisy+escapes** · mini-batch **default $32$–$256$** · schedules **warmup→decay**.
:::

::: callout-pitfall Noise Is Feature *and* Bug
SGD noise escapes sharp minima/saddles (generalisation bonus) but forbids exact convergence (jitter floor ⇒ decay LR to land). Same noise, two faces — schedule decides which dominates when.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$10^6$ samples, batch GD vs SGD ($1$/step) vs mini-batch ($100$): steps-per-epoch and cost-per-step ranked? Then: loss plateaus at epoch $30$ under constant LR — schedule move?
:::

::: step [Step 2: Execution] Count, Then Choreograph
1. Batch: $1$ step/epoch at $10^6$ grads; SGD: $10^6$ steps at $1$ grad; mini: $10^4$ steps at $100$ grads (matrix-friendly middle — wall-clock winner usually).
2. Plateau + jitter ⇒ step-decay ($\eta/10$) or cosine segment (settle into the basin); if early-training instability instead ⇒ warmup first. Diagnose phase (jitter-floor vs cold-start) before prescribing.
:::

::: step [Step 3: Conclusion] Final Result
Steps/epoch arithmetic picks regimes; plateau-diagnosis picks schedules. Regime-vs-schedule are orthogonal axes — answer both, never one.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Mini-batch dominates practice because:
(A) Exact gradients
(*B) Hardware+statistics sweet spot: matrix-vectorised steps (GPU utilisation) with honest-enough directions plus regularising noise — exactness sacrificed knowingly, speed and generalisation gained
(C) Less code
(D) No hyperparameters
::: explanation
Three-way bargain (compute/statistics/generalisation) lands at $32$–$256$ empirically. Extremes lose two of three (batch: slow+sharp-minima; SGD: unvectorised+jittery) — middle wins by portfolio, not purity.
:::

::: quiz Q2: Foundational Concept
Warmup (small→full LR) fixes early-training blowups by:
(A) Better minima directly
(*B) Random-init + big steps + uncalibrated adaptive denominators (Adam!) = chaotic leaps (divergence/NaNs); gentle ramp lets moments/statistics stabilise before full stride
(C) Faster convergence always
(D) Smaller models
::: explanation
Cold-start chaos (wild grads, zeroed moments) meets full LR badly — ramp first. NaN-at-epoch-1 diagnoses warmup absence — the debugging tell to quote.
:::

::: quiz Q3: Foundational Concept
Large-batch training ($8$k+) generalises worse unless:
(A) More epochs blindly
(*B) LR scaling (linear/square-root rules) + warmup + longer schedules compensate sharp-minima drift — batch size is a *regime* needing co-tuned companions, not a free knob
(C) Smaller models
(D) Nothing helps
::: explanation
Batch size couples to LR/duration/generalisation (noise-temperature view: scale LR with batch to hold noise constant). Solo knob-turning breaks the balance — retune the trio together.
:::
