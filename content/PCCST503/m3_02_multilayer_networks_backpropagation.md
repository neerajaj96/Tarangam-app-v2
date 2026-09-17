# Multilayer Networks & Backpropagation

**Hidden layers that learn bends, the chain rule as credit assignment, one fully hand-computed gradient step, and why depth trains at all.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Blame Delegation Inc.
A company's profit falls short. The CEO doesn't yell at everyone equally — blame flows *backward* through the org chart, each manager receiving blame proportional to their influence on the shortfall, then subdividing it among *their* reports by the same rule. **Backpropagation** is this memo in calculus: the loss's blame (gradient) enters at the output layer and splits backward through every weight by the **chain rule**, so each weight learns exactly how much *it* contributed to the error. Forward pass = work; backward pass = performance reviews, all the way down.
:::

::: manim assets/videos/m3_backprop.mp4 Backpropagation Flow
Watch error signals split backward layer by layer, each weight's blame proportional to its forward influence — the chain rule animated as organizational accountability.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Forward Pass (Notation That Pays Off)

Layer $l$: $z^{(l)} = W^{(l)}a^{(l-1)} + b^{(l)}$, $a^{(l)} = \sigma(z^{(l)})$, with $a^{(0)} = x$. Sigmoid/tanh/ReLU nonlinearities are load-bearing: stacked *linear* layers collapse to one matrix (depth without nonlinearity is a expensive no-op).

### 2.2 Backward Pass (One Rule, Recursed)

Output error $\delta^{(L)} = \nabla_{a}L \odot \sigma'(z^{(L)})$; propagate $\delta^{(l)} = (W^{(l+1)T}\delta^{(l+1)}) \odot \sigma'(z^{(l)})$; gradients $\nabla_{W^{(l)}} = \delta^{(l)}a^{(l-1)T}$. Cost: one forward + one backward ≈ 2× one forward — gradients for *millions* of weights at the price of two passes (vs. $10^6$ finite-difference passes). That ratio *is* deep learning's economic engine.

### 2.3 Why Depth Trains (and Sometimes Doesn't)

* **Universal approximation:** one wide hidden layer fits anything continuous — but depth buys *exponential* parameter efficiency for compositional functions (each layer reuses the previous one's features).
* **Vanishing gradients:** sigmoid $\sigma' \le 0.25$ multiplies per layer — deep stacks starve early layers of signal. Remedies: ReLU ($\sigma'=1$ when active), careful init, normalization, residuals — the modern training toolkit in one sentence each.

::: callout-formula KTU Formula Vault: Backprop Facts
Forward $z=Wa+b$, $a=\sigma(z)$ · backward $\delta^{(l)} = (W^T\delta^{(l+1)})\odot\sigma'$ · grads $\delta a^T$ · cost **≈ 2 forwards for all weights** · depth = **parameter efficiency**, width = brute capacity · sigmoid stacks **vanish** (fix: ReLU/init/norm/residuals).
:::

::: callout-pitfall Linear Layers Don't Stack (and Saturated Neurons Don't Learn)
Two linear layers $W_2(W_1x)$ equal *one* matrix — depth without nonlinearity adds parameters but zero expressiveness. And saturated sigmoids ($\sigma' \approx 0$) pass ~zero blame backward — the same saturation slowdown as logistic training (Module 2), now multiplied per layer. Nonlinearity everywhere, saturation nowhere: the design commandments.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Micro-network: input $x = [0.5, -0.3]$, one hidden sigmoid unit ($W_1 = [0.4, -0.2]$, $b_1 = 0$), output sigmoid ($w_2 = 0.7$, $b_2 = 0.1$), target $y = 1$, squared loss $\tfrac12(y-o)^2$. Compute forward values and every gradient. (Verified against finite differences.)
:::

::: step [Step 2: Execution] Forward Then Backward
Forward: $z_1 = 0.4(0.5) + (-0.2)(-0.3) = 0.26$, $h = \sigma(0.26) \approx 0.5646$; $z_2 = 0.7(0.5646) + 0.1 = 0.4952$, $o = \sigma(0.4952) \approx 0.6213$; loss $\approx 0.0717$. Backward: $\delta_o = (0.6213-1)(0.6213)(0.3787) \approx -0.0891$; $\partial L/\partial w_2 = \delta_o h \approx -0.0503$; $\delta_h = \delta_o(0.7)(0.5646)(0.4354) \approx -0.0153$; $\partial L/\partial W_1 = \delta_h x \approx [-0.0077, +0.0046]$. Finite-difference agreement to 5 decimals on all six gradients.
:::

::: step [Step 3: Conclusion] Final Result
Six gradients, two passes, zero finite-difference budgets — and notice the decay ($-0.089 \to -0.015$): blame *attenuates* backward through small weights and sigmoid slopes, the vanishing-gradient phenomenon visible in miniature on a *two-layer* toy. Depth's power and depth's pathology, one worked step apart.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
