# Backpropagation & Its Variants

**Credit assignment by chain rule — deltas flowing backwards, plus momentum/RMSprop/Adam upgrades.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Blame Memo Up the Chain
Output errs by $\delta$ (prediction − truth, scaled by slope). Each layer asks "how much of this is *my* weights' fault?" — multiplying blame by local slopes (chain rule) travelling backwards. **Vanilla SGD** steps blame-sized paces; **momentum** adds a heavy ball (ploughs ravines, damps zigzag); **RMSprop** paces per-coordinate (frenetic weights get smaller steps); **Adam** = ball + per-coordinate pacing + bias correction (the default starter).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Backprop equations (squared error, sigmoid demo)

$$\delta^{(L)} = (a^{(L)}-y)\odot\sigma'(z^{(L)}), \quad \delta^{(l)} = (W^{(l+1)T}\delta^{(l+1)})\odot\sigma'(z^{(l)}), \quad \frac{\partial\mathcal{L}}{\partial W^{(l)}} = \delta^{(l)}a^{(l-1)T}$$

One forward (cache $z,a$) + one backward ($O(\text{params})$ — same as forward, the miracle vs finite differences' $O(n^2)$).

### 2.2 Variants

Momentum: $v \leftarrow \mu v - \eta g$, $w \leftarrow w+v$. RMSprop: $s \leftarrow \beta s+(1-\beta)g^2$, $w \leftarrow w-\eta g/\sqrt{s+\epsilon}$. Adam: both + bias-corrected $\hat m, \hat v$.

::: callout-formula KTU Formula Vault: Backprop+
Deltas **backwards via chain rule** · cost **$O(params)$** · Adam = **momentum + RMSprop + debias**.
:::

::: callout-pitfall Sigmoid $\sigma'$ Max Is $0.25$ (Vanishing Seed)
$\sigma'(z) = \sigma(1-\sigma) \le 1/4$ — products over layers decay exponentially (the vanishing gradient M2's ReLU answers). Quoting the $1/4$ bound is the analysis mark in depth questions.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Continue the M1.1 net: target $y = 1$, squared loss $\tfrac12(a-y)^2$. One SGD step ($\eta = 1$) for $W^{(2)}$ only. Show $\delta^{(2)}$ and the update.
:::

::: step [Step 2: Execution] Blame Then Step
1. $a = 0.5120$, $\sigma'(0.0481) = 0.512(0.488) \approx 0.2499$. $\delta^{(2)} = (0.5120-1)(0.2499) \approx -0.1220$.
2. $\nabla W^{(2)} = \delta^{(2)}a^{(1)T} = -0.1220\times[0.6225, 0.5744] = [-0.0759, -0.0701]$.
3. $W^{(2)} \leftarrow [1.0,-1.0] - [-0.0759,-0.0701] = [1.0759, -0.9299]$ — first weight rises (needed more of unit 1's vote), second rises toward zero (less negative drag). Loss will dip next forward.
:::

::: step [Step 3: Conclusion] Final Result
Error × slope = blame; blame × activation = gradient; gradient steps weights. M1.1→M1.2 number continuity turns two topics into one lab — carry values forward.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Backprop costs $O(\text{params})$, finite differences $O(\text{params}^2)$. Why the gap?
(A) Better hardware
(*B) Chain rule reuses shared subexpressions (one backward sweep serves all weights); finite differences re-runs forward per weight (no sharing) — algorithmic, not implementational
(C) Smaller networks
(D) Luck
::: explanation
Dynamic-programming-over-the-graph vs brute-force perturbation: shared prefixes computed once. Complexity-class gap (linear vs quadratic in params) is *why* deep learning exists at scale — quote it as history, not trivia.
:::

::: quiz Q2: Foundational Concept
Momentum helps ravines because:
(A) Bigger learning rates
(*B) Velocity accumulates along consistent descents (accelerates) and cancels across oscillations (damps) — heavy ball rolls down valleys instead of bouncing wall-to-wall like vanilla SGD
(C) It normalises gradients
(D) It adapts per-coordinate (that's RMSprop's job!)
::: explanation
 Directional memory: persistent components add, alternating cancel. Ravine-crossing (fast along floor, calm across walls) is the visual to sketch — ball path vs zigzag path.
:::

::: quiz Q3: Foundational Concept
Adam's bias correction fixes:
(A) Overfitting
(*B) Zero-initialised moment estimates dragging early steps (dividing by small $\hat v$, tiny $\hat m$) — correction ($1-\beta^t$ denominators) un-biases the first updates; matters most in early training
(C) Learning-rate choice
(D) Vanishing gradients
::: explanation
Moments start at $0$ (biased toward stillness); correction rescales by $(1-\beta^t)$ so step one is honest-sized. Warmup-phase weirdness without it is the diagnostic — name the phase, not just the formula.
:::
