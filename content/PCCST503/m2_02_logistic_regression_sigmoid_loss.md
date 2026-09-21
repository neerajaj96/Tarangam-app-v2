---
id: m2_02_logistic_regression_sigmoid_loss
courseCode: PCCST503
module: 2
sequence: 2
title: 'Logistic Regression: Sigmoid & Cross-Entropy'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the probabilistic classification problem in plain words first
  - Squash linear scores into probabilities with the logit link
  - Train with cross-entropy and its error-times-input gradient
  - Read coefficients as log-odds shifts despite the misnomer
concepts:
  - sigmoid function
  - cross-entropy loss
  - log-odds
prerequisites:
  - m1_03_linear_regression_least_squares
  - m2_01_classification_boundaries_knn
examRelevance: high
tags:
  - classification
  - logistic-regression
---
# Logistic Regression: Sigmoid & Cross-Entropy

**What problem logistic regression solves for two classes, what labelled data it needs, how sigmoid plus cross-entropy trains linear boundaries, and where convexity does and does not guarantee success.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

You want not just a label but a calibrated chance: "90% spam" versus "51% spam." The problem: turn an unbounded score into a probability between 0 and 1, then penalise confident wrongness more than cautious wrongness.

Tiny beginner example. Linear score $z=0$ should mean 50%. Score $z=2$ should mean about 88%. Score $z=-2$ should mean about 12%. The sigmoid converter below does exactly that, steepest at the boundary.

Analogy as support, then dropped. Think of a betting-odds converter: any real number in, a fair probability out. From here on we use exact terms only: sigmoid, logit, log-odds, cross-entropy, convex.

Abbreviations defined on first use: no new abbreviations beyond symbols. Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $z$? | Linear score $w^Tx$, any real number |
| What is $p$? | Predicted probability $\sigma(z)$, in $(0,1)$ |
| What is $y$? | True label, 0 or 1 |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Map features to $P(y=1\mid x)$ with a linear boundary but probabilistic output.

**Data.** Labelled pairs $(x_i,y_i)$ with $y_i\in\{0,1\}$. Here $x_i$ is the feature vector, $y_i$ is the class.

**Goal.** Low cross-entropy on future data plus a usable linear boundary. Decision rule: predict 1 iff $p\ge 0.5$, equivalently $w^Tx\ge 0$.

Symbols: $\sigma(z)=1/(1+e^{-z})$ is the sigmoid; $p=\sigma(w^Tx)$ is the prediction; log-odds $\log(p/(1-p))=w^Tx$ shows linearity in log-odds; loss per example $\ell(w)=-[y\log p+(1-y)\log(1-p)]$ is cross-entropy.

::: callout-intuition Core Mental Model: The Betting Odds Converter
A linear score $z = w^Tx$ ranges over $(-\infty, \infty)$ — useless as a probability. The **sigmoid** $\sigma(z) = 1/(1+e^{-z})$ is the odds converter: huge negative → $\approx 0$, zero → exactly $0.5$, huge positive → $\approx 1$, smoothly S-shaped between. **Logistic regression** = linear scoring *plus* sigmoid squashing *plus* a loss that punishes confident wrongness brutally (being 99% sure and wrong costs far more than being 60% sure and wrong). Despite the name, it *classifies* — "regression" survives only because it fits weights by regression-style optimization.
:::

::: manim assets/videos/m2_logistic_sigmoid.mp4 The Sigmoid Squash
Watch the S-curve map every real score into (0,1), its steepest slope at the boundary z=0, and how weight scaling sharpens or softens the transition — the decision boundary living at σ = 0.5.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (probabilistic two-class choice) → data (labelled pairs) → goal (low cross-entropy, linear boundary) → method (sigmoid plus cross-entropy) → model ($p=\sigma(w^Tx)$) → training (gradient descent) → example → limitations.

### 3.1 Model and the Logit Link

$P(y=1\mid x)=\sigma(w^Tx)$ with $\sigma(z)=1/(1+e^{-z})$. Inverse view: $\log(p/(1-p))=w^Tx$. The model is linear in log-odds, so coefficient $w_j$ reads as log-odds change per unit $x_j$. Decision rule $w^Tx\ge 0$ is a linear boundary, exactly as expressive and limited as a perceptron's. The sigmoid rescales confidence; it never bends the boundary shape.

### 3.2 Cross-Entropy Loss and Gradient, Symbol by Symbol

For one example: $\ell(w) = -[y\log p + (1-y)\log(1-p)]$ with $p=\sigma(w^Tx)$. Here $y\log p$ prices positive examples, $(1-y)\log(1-p)$ prices negatives, the minus makes loss positive. Gradient:

$$\nabla_w \ell = (p-y)x = (\text{predicted}-\text{actual})\times\text{features}$$

Error times input, the same shape driving Least Mean Squares (LMS), perceptrons, and generalised backprop. Update: $w\leftarrow w-\eta(p-y)x$ with learning rate $\eta$.

**Corrected convexity qualification.** The cross-entropy loss for logistic regression is convex in $w$: one bowl, no bad local minima. With a suitably small learning rate and well-scaled features, gradient descent converges toward the global minimiser. Two qualifications examiners reward: (1) step size still matters — too large $\eta$ diverges even on convex bowls; conditioning sets speed, so standardise features; (2) on linearly separable data the finite minimiser does not exist — weights grow without bound while the boundary keeps improving, so in practice add Regularisation (RIDGE or LASSO) or stop early. Convexity removes local minima, not all optimisation concerns.

| Similar pair | Distinction that earns marks |
|---|---|
| Sigmoid vs boundary | $\sigma$ rescales confidence; $w^Tx=0$ still cuts linear and flat |
| Cross-entropy vs squared error through sigmoid | Honest $(p-y)$ gradients vs saturated $\sigma'$ slowdown where wrong-but-sure stalls |
| Convex logistic vs non-convex nets | Global-minimum seeking with proper $\eta$ vs crafted local success |

::: callout-formula KTU Formula Vault: Logistic Facts
$p = \sigma(w^Tx)$, $\sigma(0) = 0.5$ · boundary $w^Tx = 0$ (**linear**) · loss $-[y\log p + (1-y)\log(1-p)]$ (**convex with qualifications**) · gradient **$(p-y)x$** · coefficients = **log-odds** shifts · despite the name: a **classifier**.
:::

::: callout-pitfall Confident Errors Cost Everything (by Design)
Cross-entropy $\to \infty$ as $p \to$ the wrong extreme ($y=1, p=0.001$ costs $\approx 6.9$ vs $0.22$ at $p=0.8$) — the loss *deliberately* terrorizes overconfidence. Mislabeled training points therefore wield enormous leverage: one flipped label near the boundary can drag the whole fit. Clean labels aren't hygiene here; they're load-bearing.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Single feature, current weights give score $z = 2.0$ for a truly-positive example ($y=1$). Take one gradient step with $\eta = 0.5$, $x = 1$. (Numbers verified.)
:::

::: step [Step 2: Execution] Squash, Score, Step
$p = \sigma(2.0) = 1/(1+e^{-2}) \approx 0.881$ — fairly confident and correct. Loss $= -\log(0.881) \approx 0.127$. Error $p - y = -0.119$; gradient $= -0.119 \times 1$; update $w \leftarrow w - 0.5\times(-0.119) = w + 0.060$ — weights nudge *up*, growing confidence in an already-right answer (diminishing returns built in: near-certain correct predictions barely move weights).
:::

::: step [Step 3: Conclusion] Final Result
One line of arithmetic exhibits the whole algorithm: squash → measure surprise → step against the error, scaled by input. Repeat over the dataset with a well-chosen step size; on convex logistic loss this heads toward the global minimiser subject to the separability and conditioning qualifications above — logistic regression's reputation in three lines.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Expecting the sigmoid to fix Exclusive OR (XOR). Squashing is monotone; the boundary stays linear.
- Training with squared error through the sigmoid. Gradients carry $\sigma'$ and stall where confident-wrong needs large steps.
- Claiming convexity means any $\eta$ works. Too large diverges; too small crawls. Scale features and schedule $\eta$.
- Forgetting separability pathology. Separable data pushes weights to infinity; regularise or bound steps.

Limitations: linear boundaries only; mislabel-sensitive; needs feature scaling for fast convergence.

Exam recap: $p=\sigma(w^Tx)$; boundary $w^Tx=0$ linear; loss cross-entropy convex with proper-$\eta$ and non-separable qualifications; gradient $(p-y)x$; coefficients are log-odds.

<a id="self-check"></a>
## 6. Active Recall Quizzes

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
