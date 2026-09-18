# Multi-Variable Regression: Gradient Descent & Matrix Method

**From one slope to a weight vector — the normal equation for small problems, one fully hand-checked gradient step for large ones.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Foggy Hill, Two Strategies
Fitting weights is descending a foggy hill in the dark. The **matrix method** (normal equation) teleports to the bottom in one jump but needs a matrix inverse — fine for dozens of features, hopeless for millions. **Gradient descent** feels the local slope and steps downhill repeatedly — slower, but it never inverts anything.
:::

::: anim gradient-descent Big Steps Rush, Small Steps Crawl
Watch the cost ball: oversized steps bounce across the minimum, well-tuned steps settle in, tiny steps take forever to arrive.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The two solvers

With design matrix $X$ (bias column included) and target $y$, MSE cost is $J(w) = (1/n)\lVert Xw - y \rVert^2$. The **normal equation** $w = (X^T X)^{-1} X^T y$ solves it exactly. **Batch gradient descent** iterates $w := w - \alpha (2/n) X^T (Xw - y)$ and must **decrease** $J$ when $\alpha$ is sane — rising cost is the divergence alarm.

### 2.2 Step-size discipline

Feature scaling first (M1.3), then $\alpha$ small enough that cost falls every step. If cost rises, halve $\alpha$ before blaming the model.

::: callout-formula KTU Formula Vault: Multi-Variable Fit
$J = (1/n)\lVert Xw-y \rVert^2$ · normal $w = (X^T X)^{-1}X^T y$ · gradient $(2/n)X^T(Xw-y)$ · cost must fall each step.
:::

Closed form versus iteration is a favourite 3-marker: invert for tiny, iterate for huge.

::: callout-pitfall Forgetting the Bias Column
$X$ must carry a leading $1$-column, else the plane is pinned through the origin exactly like the missing-bias trap in `PECST632` M1. A weight vector one entry short is the giveaway.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Model $y \approx b + w_1 x_1 + w_2 x_2$ on three samples: $(1,0) \to 3$, $(0,1) \to 4$, $(1,1) \to 6$. Start at $w = [b, w_1, w_2] = [0, 0, 0]$, take one batch gradient step with $\alpha = 0.1$ on MSE, and confirm the cost falls.
:::

::: step [Step 2: Execution] One Downhill Step
Predictions start at $[0, 0, 0]$; errors (pred minus true) are $[-3, -4, -6]$. Gradients with $(2/3)X^T e$: for $b$, $(2/3)(-13) = -8.6667$; for $w_1$, $(2/3)(-3 - 6) = -6.0$; for $w_2$, $(2/3)(-4 - 6) = -6.6667$. Update: $b = 0.8667$, $w_1 = 0.6$, $w_2 = 0.6667$. New predictions: $1.4667$, $1.5333$, $2.1333$. Old cost $(9+16+36)/3 = 20.333$; new cost $(2.3511 + 6.0844 + 14.9511)/3 \approx 7.796$.
:::

::: step [Step 3: Conclusion] Final Result
Weights $[0.8667, 0.6, 0.6667]$ with cost $20.333 \to 7.796$. Cost fell sharply, certifying the step; a rise would have meant halving $\alpha$, not continuing.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Method Choice
40 samples, 3 features versus 4 million samples, 50,000 features. Solver per case?
(A) Gradient descent for both, always
(*B) Normal equation for the tiny case (exact, cheap inverse) and gradient descent for the huge case (no giant inverse possible)
(C) Normal equation for both, inverses scale fine
(D) Neither, use guessing
::: explanation
$(X^T X)^{-1}$ costs roughly cubic in features — trivial at $3$, impossible at $50{,}000$. Small means solve, large means stroll downhill.
:::

::: quiz Q2: Divergence Alarm
After a gradient step the MSE rises from $7.8$ to $12.1$. Correct response?
(A) Take a bigger step to escape
(*B) Halve $\alpha$ and retry, because rising cost on a convex bowl proves overshooting, not bad data
(C) Add more features immediately
(D) Switch loss functions mid-run
::: explanation
MSE for linear regression is convex — a proper step cannot increase cost. Rising cost is the step-size alarm; shrink $\alpha$ first, diagnose second.
:::

::: quiz Q3: Numerical Drill
Continuing the worked example, what is the new residual for sample $3$?
(A) $-3.8667$ with sign flipped
(*B) $2.1333 - 6 = -3.8667$, still negative (prediction too low) but smaller in magnitude than $-6$, consistent with downhill progress
(C) $+3.8667$, overshot above target
(D) $0$, one step always fits exactly
::: explanation
$0.8667 + 0.6 + 0.6667 = 2.1333$ against $6$ leaves $-3.8667$. Same sign, shrunken magnitude — exactly what one honest gradient step should show.
:::
