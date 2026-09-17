# Logistic Regression: Sigmoid & Cross-Entropy

**Squashing linear scores into probabilities, the logit link, cross-entropy loss, its gradient, and why "regression" is a historical misnomer.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Betting Odds Converter
A linear score $z = w^Tx$ ranges over $(-\infty, \infty)$ — useless as a probability. The **sigmoid** $\sigma(z) = 1/(1+e^{-z})$ is the odds converter: huge negative → $\approx 0$, zero → exactly $0.5$, huge positive → $\approx 1$, smoothly S-shaped between. **Logistic regression** = linear scoring *plus* sigmoid squashing *plus* a loss that punishes confident wrongness brutally (being 99% sure and wrong costs far more than being 60% sure and wrong). Despite the name, it *classifies* — "regression" survives only because it fits weights by regression-style optimization.
:::

::: manim assets/videos/m2_logistic_sigmoid.mp4 The Sigmoid Squash
Watch the S-curve map every real score into (0,1), its steepest slope at the boundary z=0, and how weight scaling sharpens or softens the transition — the decision boundary living at σ = 0.5.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Model and the Logit Link

$P(y=1 \mid x) = \sigma(w^Tx)$, $\sigma(z) = \frac{1}{1+e^{-z}}$. Inverse view: $\log\frac{p}{1-p} = w^Tx$ — the model is *linear in log-odds* (logit), which is why coefficients read as odds multipliers ($w_j$ = log-odds change per unit $x_j$). Decision rule: predict 1 iff $\sigma \ge 0.5$ ⟺ $w^Tx \ge 0$ — a **linear boundary**, exactly as expressive (and limited) as a perceptron's.

### 2.2 Cross-Entropy Loss and Gradient

For one example: $\ell(w) = -[y\log p + (1-y)\log(1-p)]$, $p = \sigma(w^Tx)$. The loss is **convex** (single global minimum — no bad local optima, unlike neural nets), and its gradient is memorably clean:

$$\nabla_w \ell = (p - y)\,x = (\text{predicted} - \text{actual}) \times \text{features}$$

— *error times input*, the same shape driving LMS, perceptrons, and (generalized) backprop. Update: $w \leftarrow w - \eta\,(p-y)x$.

::: callout-formula KTU Formula Vault: Logistic Facts
$p = \sigma(w^Tx)$, $\sigma(0) = 0.5$ · boundary $w^Tx = 0$ (**linear**) · loss $-[y\log p + (1-y)\log(1-p)]$ (**convex**) · gradient **$(p-y)x$** · coefficients = **log-odds** shifts · despite the name: a **classifier**.
:::

::: callout-pitfall Confident Errors Cost Everything (by Design)
Cross-entropy $\to \infty$ as $p \to$ the wrong extreme ($y=1, p=0.001$ costs $\approx 6.9$ vs $0.22$ at $p=0.8$) — the loss *deliberately* terrorizes overconfidence. Mislabeled training points therefore wield enormous leverage: one flipped label near the boundary can drag the whole fit. Clean labels aren't hygiene here; they're load-bearing.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Single feature, current weights give score $z = 2.0$ for a truly-positive example ($y=1$). Take one gradient step with $\eta = 0.5$, $x = 1$. (Numbers verified.)
:::

::: step [Step 2: Execution] Squash, Score, Step
$p = \sigma(2.0) = 1/(1+e^{-2}) \approx 0.881$ — fairly confident and correct. Loss $= -\log(0.881) \approx 0.127$. Error $p - y = -0.119$; gradient $= -0.119 \times 1$; update $w \leftarrow w - 0.5\times(-0.119) = w + 0.060$ — weights nudge *up*, growing confidence in an already-right answer (diminishing returns built in: near-certain correct predictions barely move weights).
:::

::: step [Step 3: Conclusion] Final Result
One line of arithmetic exhibits the whole algorithm: squash → measure surprise → step against the error, scaled by input. Repeat over the dataset (batch/stochastic next module's engine topic) and convexity guarantees arrival at the unique optimum — logistic regression's entire reputation in three lines.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz The gradient of logistic loss is (p − y)x — "error times input." A training point with y=1 currently scores p=0.99. How hard does it push the weights, and why is that desirable?
() Enormously — near-certain points dominate learning
(*) Barely (error −0.01) — correct confidence needs no correction; learning effort concentrates automatically on mistakes and uncertain cases
() It pushes backward, unlearning the correct answer
() Gradient magnitude is constant for all points by design
::: explanation
$(p-y) = -0.01$: the update is proportional to *surprise*, so settled points whisper while errors shout. This self-allocating attention (a property of the loss shape, not an add-on) is why cross-entropy trains decisively instead of dithering over mastered examples.
:::

::: quiz Logistic regression's decision boundary is linear (wᵀx = 0). What follows about XOR-type data, and what is the fix?
() Logistic regression solves XOR perfectly because the sigmoid is nonlinear
(*) The model can only split space with one hyperplane — XOR needs curved/multiple boundaries, so it fails structurally; fixes live in feature expansion, trees, or hidden layers (Modules 2–3)
() XOR is linearly separable with the right learning rate
() The sigmoid's nonlinearity at z=0 handles XOR automatically
::: explanation
Squashing is monotone — it rescales confidence, never bends the boundary's *shape*. Linear-in-$x$ scores cut once, flatly. XOR (and rings, moons) demand either engineered features ($\phi(x)$ tricks), axis-aligned splits (trees), or learned hidden representations (networks) — the syllabus's next three stops, in order.
:::

::: quiz Why is cross-entropy preferred over squared error for training logistic models, in one mechanism?
() Squared error is undefined for probabilities
(*) Cross-entropy's gradient stays proportional to raw error (p−y), while squared-error-through-sigmoid gradients multiply by σ′(z) ≈ 0 in confident regions — learning stalls exactly where it is wrong-but-sure (saturation slowdown)
() Cross-entropy is non-convex and therefore more expressive
() Squared error cannot handle binary labels at all
::: explanation
$\nabla$ MSE-through-$\sigma$ carries a $\sigma'(z) = p(1-p)$ factor that vanishes at confident extremes — confidently-wrong points, needing the biggest corrections, get the smallest steps. Cross-entropy's log cancels the sigmoid's flat tails, keeping gradients honest everywhere. Loss choice *is* optimization fate.
:::
