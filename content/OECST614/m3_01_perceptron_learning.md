# Perceptron: The Learning Neuron

**One weighted voter, one threshold, one mistake-driven update — the mistake-correction loop that converges on any separable data.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Stubborn Voter With a Ledger
The perceptron votes yes when $w^T x + b > 0$, else no. Each mistake rewrites the ledger: add the misjudged example (scaled by $\alpha$) to the weights when it cried wolf falsely in reverse — reward correct silence, punish wrong speech. No mistakes, no changes; the ledger only moves on error.
:::

The single neuron behind the MLP of M3.2 and the conceptual ancestor of the deep stacks in `PECST632` M1 — learn the update here, reuse it inside every network later.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The update rule

Predict $\hat{y} = 1$ if $w^T x + b > 0$ else $0$. On mistake with true label $y$, update $w := w + \alpha(y - \hat{y})x$ and $b := b + \alpha(y - \hat{y})$. Correct predictions change nothing; the perceptron convergence theorem guarantees finitely many mistakes on linearly separable data.

### 2.2 The honest limit

One hyperplane only: XOR defeats it. That failure motivates hidden layers (M3.2) — depth buys bendy boundaries.

::: callout-formula KTU Formula Vault: Perceptron
$\hat{y} = 1$ iff $w^T x + b > 0$ · mistake update $w += \alpha(y-\hat{y})x$ · silent on correct · converges iff separable · XOR needs depth.
:::

Learning rate scales step size, not correctness direction — $\alpha = 1$ is standard for hand traces.

::: callout-pitfall Update-on-Correct Leak
Applying the update when $\hat{y} = y$ injects $(y - \hat{y}) = 0$ at best and sign errors at worst. Students who "update every sample" drift solved weights off the solution — check the mistake condition first, always.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Perceptron with $w = [0, 0]$, $b = 0$, $\alpha = 1$, rule $\hat{y} = 1$ iff $z > 0$. Present sample $x = (2, 1)$ with true label $y = 1$. Update, then verify the same sample is now classified correctly.
:::

::: step [Step 2: Execution] One Correction
Before: $z = 0$, so $\hat{y} = 0 \ne 1$ — a genuine mistake with $(y - \hat{y}) = 1$. Update: $w = [0,0] + 1 \times 1 \times (2,1) = [2, 1]$, $b = 0 + 1 = 1$. After: $z = 2(2) + 1(1) + 1 = 6 > 0$, so $\hat{y} = 1$. Fixed in one step.
:::

::: step [Step 3: Conclusion] Final Result
Weights $[2, 1]$, bias $1$, sample now scores $z = 6$. The correction overshoots deliberately — mistake-driven moves are bold by design, and separability guarantees they terminate.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Update Arithmetic
$w = [1, -1]$, $b = 0$, $\alpha = 1$, sample $x = (1, 1)$, $y = 0$. Update?
(A) No change, already correct
(*B) $z = 0$ gives $\hat{y} = 0 = y$, so genuinely no update — the boundary case $z = 0$ votes $0$ under the strict $> 0$ rule
(C) $w = [2, 0]$, $b = 1$
(D) $w = [0, -2]$, $b = -1$
::: explanation
$1(1) + (-1)(1) + 0 = 0$, and the rule demands strictly positive for $1$, so prediction $0$ matches. Zero-threshold conventions decide marks — state the rule, then apply it.
:::

::: quiz Q2: Genuine Mistake Trace
$w = [0, 0]$, $b = 0$, $\alpha = 0.5$, sample $x = (2, -1)$, $y = 1$. New weights?
(A) $[0, 0]$, $0$
(*B) $w = [1.0, -0.5]$, $b = 0.5$, since $(y - \hat{y}) = 1$ scales the sample by $0.5$ into both weights and bias
(C) $w = [2, -1]$, $b = 1$
(D) $w = [-1, 0.5]$, $b = -0.5$
::: explanation
$z = 0 \to \hat{y} = 0$, error $+1$: $w += 0.5(2,-1)$, $b += 0.5$. Forgetting to scale the bias by $\alpha$ is the classic half-mark leak.
:::

::: quiz Q3: Limits Honesty
Why can no perceptron learn XOR?
(A) XOR needs more data
(*B) XOR's classes are not linearly separable — no single straight line isolates $(0,1),(1,0)$ from $(0,0),(1,1)$ — so one hyperplane is structurally insufficient and hidden layers are required
(C) Perceptrons cannot use binary inputs
(D) Learning rates cannot handle XOR
::: explanation
Draw the four corners: opposite corners share labels, so every line leaves enemies together. Separable-only convergence is a theorem with teeth — XOR is its standard witness.
:::
