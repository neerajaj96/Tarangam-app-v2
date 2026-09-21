---
id: m3_02_multilayer_networks_backpropagation
courseCode: PCCST503
module: 3
sequence: 2
title: Multilayer Networks & Backpropagation
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the bend-learning problem in plain words first
  - Push forward through hidden layers that learn bends
  - Assign credit backward with the recursed chain rule
  - Hand-compute one full gradient step at two-forward cost
concepts:
  - backpropagation
  - chain rule
  - hidden layers
prerequisites:
  - m2_05_gradient_descent_training_engine
  - m3_01_perceptron_learning_rule
examRelevance: high
tags:
  - neural-networks
  - backpropagation
---
# Multilayer Networks & Backpropagation

**What problem hidden layers solve, what labelled data they need, how forward passes build bends, how backpropagation trains all weights at two-pass cost, and where depth still struggles.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

One straight cut cannot solve XOR. The problem: learn the bends themselves instead of hand-engineering them.

Tiny beginner example. Input $(0,1)$ labelled plus. First hidden unit fires on "first is 0," second on "second is 1," output fires on "both fired." No single line sees XOR, but two small lines plus one combiner do. Depth composes such pieces.

Analogy as support, then dropped. Blame delegation: loss blame flows backward, each weight charged by its influence. From here on we use exact terms only: layer, activation, chain rule, gradient.

Abbreviations defined on first use: Rectified Linear Unit (ReLU). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $z^{(l)}$, $a^{(l)}$? | Pre-activation and activation of layer $l$ |
| What is $W^{(l)}$, $b^{(l)}$? | Weights and biases of layer $l$ |
| What is $\delta^{(l)}$? | Error blame at layer $l$ |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Learn hierarchical features that make hard concepts linearly separable at the top.

**Data.** Labelled pairs $(x,y)$. Here $x=a^{(0)}$ is input, $y$ is target.

**Goal.** Low loss with trainable bends. Forward: $z^{(l)}=W^{(l)}a^{(l-1)}+b^{(l)}$, $a^{(l)}=\sigma(z^{(l)})$. Here $\sigma$ is a nonlinearity (sigmoid, tanh, ReLU); stacked linear layers alone collapse to one matrix, so nonlinearity is load-bearing.

::: callout-intuition Core Mental Model: Blame Delegation Inc.
A company's profit falls short. The CEO doesn't yell at everyone equally — blame flows *backward* through the org chart, each manager receiving blame proportional to their influence on the shortfall, then subdividing it among *their* reports by the same rule. **Backpropagation** is this memo in calculus: the loss's blame (gradient) enters at the output layer and splits backward through every weight by the **chain rule**, so each weight learns exactly how much *it* contributed to the error. Forward pass = work; backward pass = performance reviews, all the way down.
:::

::: manim assets/videos/m3_backprop.mp4 Backpropagation Flow
Watch error signals split backward layer by layer, each weight's blame proportional to its forward influence — the chain rule animated as organizational accountability.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (need bends) → data (labelled pairs) → goal (low loss with depth) → method (differentiable layers) → model (stacked $z$, $a$) → training (backprop plus descent) → example → limitations.

### 3.1 Forward Pass, Notation That Pays Off

Layer $l$: $z^{(l)} = W^{(l)}a^{(l-1)} + b^{(l)}$, $a^{(l)} = \sigma(z^{(l)})$, with $a^{(0)} = x$. Sigmoid, tanh, and ReLU nonlinearities are load-bearing: stacked *linear* layers collapse to one matrix (depth without nonlinearity is an expensive no-op).

::: toggle What are `layer`, `z`, `a`, `W`, `b`, `σ` — and Sigmoid/ReLU/Tanh?
`Layer` $l$ = one processing stage (input $a^{(0)} = x$, hidden middles, output end). $z^{(l)}$ = pre-activation (weighted sum before squashing: $W^{(l)}a^{(l-1)} + b^{(l)}$). $a^{(l)}$ = activation (after squashing — the layer's output message). $W^{(l)}$ = weight matrix (connection strengths into layer $l$); $b^{(l)}$ = bias vector (per-unit offsets). $\sigma$ = nonlinearity: Sigmoid $1/(1+e^{-z})$ (0–1 squash, saturates both ends); Tanh ( −1–1 squash, zero-centred, still saturates); ReLU $\max(0,z)$ (identity for positives, dead zero for negatives — no saturation above zero, hence the default). Without $\sigma$: $W_2(W_1x) = (W_2W_1)x$ — one matrix, depth wasted.
:::

::: toggle What are `δ`, `⊙`, `σ′`, and the chain rule doing here?
$\delta^{(l)}$ = error blame at layer $l$ (how much each unit contributed to the loss — the memo being passed down). $\odot$ = elementwise multiply (pairwise, not matrix product — blame meets local slope unit by unit). $\sigma'(z)$ = activation slope at $z$ (sigmoid $\le 0.25$, tanh $\le 1$, ReLU $1$ or $0$ — steep means blame flows, flat means it starves). Chain rule = blame splits through compositions (output blame × local slopes, layer by layer — one rule recursed, not many rules). Gradients $\nabla_{W} = \delta a^T$ (blame times incoming message — outer product shapes match $W$ exactly).
:::

### 3.2 Backward Pass, One Rule Recursed

Output error $\delta^{(L)} = \nabla_{a}L \odot \sigma'(z^{(L)})$. Here $\odot$ means elementwise multiply, $\sigma'$ is activation slope. Propagate $\delta^{(l)} = (W^{(l+1)T}\delta^{(l+1)}) \odot \sigma'(z^{(l)})$; gradients $\nabla_{W^{(l)}} = \delta^{(l)}a^{(l-1)T}$. Cost: one forward plus one backward is about two forwards for millions of weights, versus one forward per weight for finite differences. That ratio is deep learning's economic engine.

Numbered training step:

1. Forward: cache all $z$, $a$.
2. Compute output blame $\delta^{(L)}$.
3. Sweep backward computing $\delta^{(l)}$ and grads.
4. Descend $W\leftarrow W-\eta\nabla_W$.

### 3.3 Why Depth Trains, and Sometimes Does Not

- **Universal approximation:** one wide hidden layer fits anything continuous, but depth buys exponential parameter efficiency for compositional functions (each layer reuses previous features).
- **Vanishing gradients:** sigmoid slope $\le 0.25$ multiplies per layer, starving early layers. Remedies: ReLU (slope $1$ when active), careful init, normalisation, residuals. Correct qualification: these ease optimisation; they do not guarantee global optima on non-convex losses.

| Similar pair | Distinction that earns marks |
|---|---|
| Linear stack vs nonlinear stack | One collapsed matrix vs composable bends |
| Backprop vs finite differences | Shared $\delta$ reuse (~2 passes) vs isolated perturbs (millions of passes) |
| Vanishing vs exploding | Slope products starving early layers vs recurrent blowups; ReLU and init vs clipping |

::: callout-formula KTU Formula Vault: Backprop Facts
Forward $z=Wa+b$, $a=\sigma(z)$ · backward $\delta^{(l)} = (W^T\delta^{(l+1)})\odot\sigma'$ · grads $\delta a^T$ · cost **≈ 2 forwards for all weights** · depth = **parameter efficiency**, width = brute capacity · sigmoid stacks **vanish** (fix: ReLU/init/norm/residuals).
:::

::: callout-pitfall Linear Layers Don't Stack (and Saturated Neurons Don't Learn)
Two linear layers $W_2(W_1x)$ equal *one* matrix — depth without nonlinearity adds parameters but zero expressiveness. And saturated sigmoids ($\sigma' \approx 0$) pass ~zero blame backward — the same saturation slowdown as logistic training (Module 2), now multiplied per layer. Nonlinearity everywhere, saturation nowhere: the design commandments.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Micro-network: input $x = [0.5, -0.3]$, one hidden sigmoid unit ($W_1 = [0.4, -0.2]$, $b_1 = 0$), output sigmoid ($w_2 = 0.7$, $b_2 = 0.1$), target $y = 1$, squared loss $\tfrac12(y-o)^2$. Compute forward values and every gradient. (Verified against finite differences.)
:::

::: step [Step 2: Execution] Forward Then Backward
Forward: $z_1 = 0.4(0.5) + (-0.2)(-0.3) = 0.26$, $h = \sigma(0.26) \approx 0.5646$; $z_2 = 0.7(0.5646) + 0.1 = 0.4952$, $o = \sigma(0.4952) \approx 0.6213$; loss $\approx 0.0717$. Backward: $\delta_o = (0.6213-1)(0.6213)(0.3787) \approx -0.0891$; $\partial L/\partial w_2 = \delta_o h \approx -0.0503$; $\delta_h = \delta_o(0.7)(0.5646)(0.4354) \approx -0.0153$; $\partial L/\partial W_1 = \delta_h x \approx [-0.0077, +0.0046]$. Finite-difference agreement to 5 decimals on every gradient.
:::

::: step [Step 3: Conclusion] Final Result
Six gradients, two passes, zero finite-difference budgets — and notice the decay ($-0.089 \to -0.015$): blame *attenuates* backward through small weights and sigmoid slopes, the vanishing-gradient phenomenon visible in miniature on a *two-layer* toy. Depth's power and depth's pathology, one worked step apart.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Stacking linear layers for power. They collapse; nonlinearity must sit between.
- Forgetting activation derivatives. Linear passthrough bug flips or zeroes grads.
- Running backward on updated weights. Recompute forward first; cache then sweep.
- Claiming depth guarantees optima. Only stationary points are assured; craft decides usefulness.

Limitations: non-convex, data-hungry, sensitive to init and scaling; gradients attest to local slope, not global structure.

Exam recap: forward $z$, $a$; backward $\delta$ reuse; cost about two forwards; depth is efficiency; sigmoid stacks vanish, ReLU and init and norm help.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Backprop computes all gradients for roughly the cost of two forward passes, while finite differences need one forward pass per weight. What single mathematical fact creates this gap?
() Backprop uses a faster programming language than finite differences
(*) The chain rule reuses shared intermediate quantities (δ per layer) across all weights, while finite differences perturb each weight in isolation, recomputing everything every time
() Finite differences are mathematically incorrect for neural networks
() Backprop skips computing most gradients by random sampling
::: explanation
One backward sweep's $\delta^{(l)}$ vectors serve *every* weight in layer $l$ simultaneously — shared substructure exploited once. Finite differences share nothing: $10^6$ weights = $10^6$ full forwards. The gap is reuse vs. repetition — dynamic programming's whiteboard (Module DAA-3) wearing calculus clothes.
:::

::: quiz A 10-layer sigmoid network barely trains its first layers while the last layers learn fine. Diagnose precisely and name two fixes with mechanisms.
() The dataset is too small; fixes: delete layers, delete data
(*) Vanishing gradients: σ′ ≤ 0.25 multiplies per layer, attenuating blame ~0.25¹⁰ ≈ 0 to early weights — fixes: ReLU (slope 1 when active, no attenuation) and careful init/normalization/residuals (keep signal paths short and scaled)
() The learning rate is too high; fixes: raise it further, remove all nonlinearities
() First layers are frozen by definition in deep networks
::: explanation
Blame decays multiplicatively backward — the worked example's $-0.089 \to -0.015$ in *one* hop previews ten hops of starvation. ReLU passes full slope when active; init/norm/residuals preserve signal magnitude across depth. Diagnose by layer-wise gradient norms, fix by preserving the backward signal path.
:::

::: quiz Why must every hidden layer carry a nonlinearity — what goes wrong with an all-linear deep network?
() Linear networks cannot be trained by gradient descent at all
(*) Composing linear maps yields one linear map (W₂(W₁x) = Wx) — depth adds parameters but zero expressiveness; the network equals single-layer regression regardless of layer count
() Linear layers cause immediate NaN losses
() Nonlinearities are only needed at the output layer
::: explanation
Matrix products collapse: any all-linear stack *is* one matrix, learnable directly. Depth's entire representational payoff (bends for XOR, hierarchies for vision) comes from nonlinearities *between* the matrices — linearity everywhere means paying deep-network costs for shallow-model power.
:::
