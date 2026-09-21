---
id: m2_05_gradient_descent_training_engine
courseCode: PCCST503
module: 2
sequence: 5
title: 'Gradient Descent: The Training Engine'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the optimisation problem and downhill goal in plain words first
  - Descend with the slope update across batch, stochastic and mini-batch flavors
  - Diagnose learning rates that crawl, cooperate or explode to NaN
  - Claim convexity guarantees only where they hold with step-size conditions
concepts:
  - gradient descent
  - learning rate
  - convexity
prerequisites:
  - m1_03_linear_regression_least_squares
  - m2_02_logistic_regression_sigmoid_loss
examRelevance: high
tags:
  - optimization
  - gradient-descent
---
# Gradient Descent: The Training Engine

**What problem optimisation solves, what loss landscape data it walks, how batch versus Stochastic Gradient Descent (SGD) versus mini-batch trade cost and noise, and where convexity guarantees hold.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Loss is a mountainside; weights are your position; the goal valley is the minimum. You feel only the local slope under your boots. Step downhill with stride proportional to steepness. Too timid crawls; too bold leaps over the valley and explodes.

Tiny beginner example. Minimise $(w-3)^2$ from $w=0$. Slope is $2(w-3)=-6$. Step $0.1$ gives $w=0.6$ (closer). Step $1.1$ gives $w=6.6$ (overshot past 3). Same slope, different stride, opposite fates. That is the entire learning-rate story.

Analogy as support, then dropped. Foggy mountain with local slope only. From here on we use exact terms only: gradient, learning rate, batch, stochastic, mini-batch, convex.

Abbreviations defined on first use: Stochastic Gradient Descent (SGD). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $J(w)$? | Loss as a function of weights |
| What is $\nabla_w J$? | Gradient, steepest-ascent direction |
| What is $\eta$? | Learning rate, stride length |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Find weights minimising loss without a closed form or with too much data for one.

**Data.** Whole dataset (batch), one sample (SGD), or $B$ samples with $B=32$ to $256$ (mini-batch). Here $n$ is dataset size, $d$ is dimension, $B$ is batch size.

**Goal.** Reach low loss with few, stable steps. Update $w\leftarrow w-\eta\nabla_w J(w)$. Here $\eta$ scales the downhill step; $\nabla_w J$ points uphill so minus points downhill.

::: callout-intuition Core Mental Model: The Foggy Mountain
You stand on a foggy mountainside (loss landscape) tasked with reaching the valley (minimum) — you can feel only the *local slope* under your boots. **Gradient descent** steps downhill, stride proportional to steepness (**learning rate** $\eta$): timid strides crawl (slow, safe), bold strides leap over the valley and ricochet uphill (**divergence**). **Stochastic** descent asks a random local (one sample's slope) instead of surveying the whole mountain per step — noisy directions, far more steps per second, and noise that usefully rattles out of shallow ditches.
:::

::: manim assets/videos/m2_gradient_descent.mp4 Descending the Loss Bowl
Watch batch steps march smoothly to the bottom, overshooting strides ping-pong across the valley, and stochastic steps jitter downhill — noisy individually, fastest overall.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (minimise $J$) → data (batches of gradients) → goal (stable low loss) → method (slope steps) → model (weights) → training (flavours plus schedules) → example → limitations.

### 3.1 The Update and the Learning Rate, Symbol by Symbol

$$w \leftarrow w - \eta\,\nabla_w J(w)$$

- $\eta$ too small: monotone but glacial; steps shrink near optima anyway, compounding the crawl.
- $\eta$ too large: overshoot, oscillate, diverge to Not-a-Number (NaN), the most common training-death signature.
- Diagnostics: smoothly falling loss is good; high plateau means raise $\eta$ or wait; spiking or NaN means halve $\eta$ immediately. Schedules decay $\eta$ over time (step, exponential, cosine): long strides early, careful feet late.

### 3.2 Three Flavors, One Spectrum

|  | Gradient source | Cost per step | Noise | Behaviour |
|---|---|---|---|---|
| Batch Gradient Descent (GD) | full dataset | $O(nd)$ | none | smooth, slow per step |
| SGD | single sample | $O(d)$ | high | jittery, fast, escapes shallows |
| Mini-batch | $B$ samples (32–256) | $O(Bd)$ | moderate | working default (Graphics Processing Unit (GPU)-friendly) |

Steps numbered for one mini-batch iteration:

1. Sample $B$ points.
2. Average their gradients.
3. Step $w\leftarrow w-\eta$ times that average.
4. Optionally decay $\eta$ by schedule.

### 3.3 Convexity: Corrected Guarantee

Logistic loss is convex: one bowl, one global minimum region. With a suitably small $\eta$ (below $2/L$ for $L$-smooth loss, with standardised features fixing ravines), gradient descent converges toward the minimiser; conditioning sets speed. Neural losses (Module 3) are non-convex: valleys, saddles, plateaus. Same update, only stationary-point assurances, plenty of craft (momentum, Adam preview). Corrected claim: convexity removes local minima but still needs step-size discipline and does not promise fast arrival on ill-conditioned ravines or a finite minimiser on separable logistic data.

| Similar pair | Distinction that earns marks |
|---|---|
| Small vs large $\eta$ | Crawl vs diverge; halve on NaN, raise on high plateau |
| Batch vs SGD vs mini-batch | Exact-costly vs noisy-cheap vs balanced default |
| Convex vs non-convex training | Global seeking with proper $\eta$ vs crafted local success |

::: callout-formula KTU Formula Vault: Optimization Facts
Update **$w - \eta\nabla J$** · $\eta$ small = **crawl**, large = **diverge/NaN** · batch **$O(nd)$ smooth**, SGD **$O(d)$ noisy-fast**, mini-batch **default** · convex (logistic) = **global seeking with proper step size** · non-convex (nets) = **craft needed**.
:::

::: callout-pitfall NaN Loss Means η, Not Data (Usually)
Exploding/diverging loss with weights racing to ±∞ is the learning-rate-too-high signature — halve $\eta$ (or add gradient clipping) *before* blaming the dataset, the model, or the framework. Nine of ten "my training broke" stories end at the learning rate.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Minimize $J(w) = (w-3)^2$ from $w_0 = 0$. (a) Two batch steps with $\eta = 0.1$. (b) Same with $\eta = 1.1$. (c) Which $\eta$ regime is each in?
:::

::: step [Step 2: Execution] Stepping Twice
$\nabla J = 2(w-3)$. (a) $\eta=0.1$: $w_1 = 0 - 0.1\times(-6) = 0.6$; $\nabla = 2(0.6-3) = -4.8$; $w_2 = 0.6 + 0.48 = 1.08$ — marching toward 3 ($|w-3|$: $3 \to 2.4 \to 1.92$, shrinking geometrically). (b) $\eta=1.1$: $w_1 = 0 + 6.6 = 6.6$ (overshot past 3!); $\nabla = 2(3.6) = 7.2$; $w_2 = 6.6 - 7.92 = -1.32$ (ping-ponged across) — $|w-3|$: $3 \to 3.6 \to 4.32$, *growing*: divergence.
:::

::: step [Step 3: Conclusion] Final Result
$\eta = 0.1$ converges geometrically; $\eta = 1.1$ explodes on a *perfectly convex quadratic* — the stability ceiling here is $\eta < 1$ (curvature 2 ⇒ need $\eta < 2/L$ with $L=2$). If it diverges on a bowl, it diverges anywhere: learning-rate discipline first, architectures second.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Raising $\eta$ to escape a high plateau that is actually model bias. Raise cheaply first, then add capacity.
- Switching batch modes at fixed $\eta$ and misreading stall as bug. Noise and step count changed, not correctness.
- Claiming convex guarantees arrival for any $\eta$. Stability needs $\eta<2/L$ and reasonable conditioning.
- Ignoring checkpoints. Healthy-then-NaN needs resume from last good weights.

Limitations: gradients need differentiability; ravines need scaling or adaptive steps; non-convex needs init and schedule craft.

Exam recap: update $w-\eta\nabla J$; small crawls, large diverges; batch $O(nd)$, SGD $O(d)$, mini-batch default; convex seeks global with proper $\eta$, non-convex needs craft.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Training loss suddenly becomes NaN after 50 healthy epochs (say, right after unfreezing layers or raising η). What is the most likely mechanism and the first fix?
() The dataset developed corrupted labels exactly at epoch 50
(*) Updates overshot into exploding gradients/weights (divergence) — first fix: halve the learning rate (and consider gradient clipping), then resume from the last good checkpoint
() NaN is the expected signal of convergence; stop training triumphantly
() The GPU ran out of memory precisely at epoch 50
::: explanation
Healthy-then-NaN = stability boundary crossed (higher $\eta$, new unfrozen layers spiking gradients). Weights race to ±∞ through overflow. Halving $\eta$ restores the contraction; clipping bounds the worst step. Checkpoints exist for exactly this resume.
:::

::: quiz Why is mini-batch (not full-batch, not single-sample) the default flavor in practice?
() Mini-batch has theoretical guarantees the others lack entirely
(*) It balances gradient noise (smoother than SGD's single-sample jitter) against step cost (far cheaper than full-batch passes) while vectorizing perfectly onto GPUs — the practical sweet spot both algorithms bracket
() Full-batch cannot run on modern hardware at all
() Single-sample SGD is mathematically invalid
::: explanation
Batch: exact direction, $O(nd)$ per step — bankrupt on big data. SGD: $O(d)$ steps with wild directions. Mini-batch $B\approx32$–$256$: $O(Bd)$ steps, moderate noise (which even helps generalization), full GPU utilization. Defaults are defaults for arithmetic reasons.
:::

::: quiz A convex logistic loss and a deep-net loss are both trained with the same well-tuned gradient descent. What guarantee differs, and why does practice still bother with the net?
() No difference exists; convexity is irrelevant to optimization
(*) Convex: convergence toward the global minimiser with proper step size and conditioning (only speed varies). Non-convex: only stationary points are promised — but expressive architectures reach *useful* minima whose modeling power dwarfs the convex model's ceiling
() Non-convex losses cannot be differentiated at all
() Convex models always generalize better regardless of data
::: explanation
Guarantees vs. capacity: convexity buys certainty about a limited model family given step-size discipline; depth buys representational power with only local assurances. Practice trades the guarantee for the ceiling — with craft (init, schedules, momentum/Adam) making the trade pay. (Module 3's entire story, previewed.)
:::
