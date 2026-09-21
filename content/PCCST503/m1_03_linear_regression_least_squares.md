---
id: m1_03_linear_regression_least_squares
courseCode: PCCST503
module: 1
sequence: 3
title: Linear Regression & Least Squares
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the regression problem and least-squares goal in plain words first
  - Solve the linear model with the normal equations two ways
  - Read residuals as orthogonal to the column space
  - Hand-fit three points and name what breaks the closed form
concepts:
  - normal equations
  - residual geometry
  - least squares
prerequisites: []
examRelevance: high
tags:
  - regression
  - least-squares
---
# Linear Regression & Least Squares

**What problem linear regression solves, what data it needs, how least squares trains weights through normal equations, and where the closed form breaks.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

You measure house size and price for a few homes and want to predict a new home's price. The problem: find a straight-line rule that misses the known points by as little as possible, then use it for new inputs.

Tiny beginner example. Sizes 1 and 2 (in 1,000 square feet) sold for 10 and 20 lakh. The line through them is price $= 10 \times$ size. A new 1.5-size home predicts 15 lakh. Least squares generalises this idea to noisy points that no single line hits exactly.

Analogy as support, then dropped. Picture a stiff ruler laid through scattered stars, tilted until total squared gap is smallest. From here on we use exact terms only: hypothesis, residual, objective, normal equations.

Abbreviations defined on first use: Within-Cluster Sum of Squares is not needed here; Ordinary Least Squares (OLS) means this exact minimiser. Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $w$? | Weight vector, the slopes and intercept to learn |
| What is $r_i$? | Residual, truth minus prediction on point $i$ |
| What is $X$, $y$? | Design matrix of inputs and vector of targets |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Predict a continuous target from numeric features with a linear rule.

**Data.** Pairs $(x_i, y_i)$ for $i=1,\dots,n$. Here $x_i$ holds $d$ features and $y_i$ is a real number. Stack them into matrix $X$ with $n$ rows and $d+1$ columns (one extra column of ones for the intercept) and vector $y$ with $n$ entries.

**Goal.** Choose weights $w$ minimising total squared miss. Residual $r_i = y_i - w^T\tilde{x}_i$, where $\tilde{x}_i$ means $x_i$ with a leading $1$ so $w_0$ acts as intercept. Objective with $\frac{1}{2n}$ scaling (the $\frac{1}{2}$ cancels the derivative's 2, the $n$ averages over points):

$$J(w) = \frac{1}{2n}\sum_{i=1}^n (y_i - w^T\tilde{x}_i)^2 = \frac{1}{2n}\|y - Xw\|^2$$

Symbol by symbol: $\|y-Xw\|^2$ sums squared residuals; $Xw$ lists all predictions; $J$ is mean cost up to the half factor.

::: toggle Expand every symbol in `J(w)`
`J(w)` = cost of weights `w` (lower is better). `y` = vector of `n` true targets; `Xw` = vector of `n` predictions (matrix `X` times weights `w`). `y − Xw` = all residuals at once; `‖·‖²` squares and sums them.
`÷ n` averages over points (size-independent grade); `× 1/2` cancels the derivative's 2 when differentiating — bookkeeping, not statistics.
Tiny numbers: §1's rule price `= 10 ×` size predicts 10, 20 for sizes 1, 2 — residuals 0, 0, so `J = 0`: the ruler already sits perfectly.
:::

::: callout-intuition Core Mental Model: The Stiff Ruler Through Scatter
Data points scatter like stars; a linear model lays a stiff ruler through them — tilting and shifting until the total squared gap between stars and ruler is minimal. **Squared** (not absolute) gaps, because squares punish big misses disproportionately, differentiate smoothly, and — the deep reason — make the optimum a single linear-algebra computation instead of a search. Least squares is the ruler-settling rule with a closed-form answer.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (continuous prediction) → data (matrix $X$, vector $y$) → goal (minimise $J$) → method (calculus or geometry) → model ($w^T\tilde{x}$) → training (normal equations) → example → limitations.

### 3.1 Normal Equations, Calculus Route

Set the gradient to zero. $\nabla_w J = -\frac{1}{n}X^T(y - Xw) = 0$ gives **$X^TXw = X^Ty$**, hence $\hat{w} = (X^TX)^{-1}X^Ty$ when $X$ has full column rank. Steps numbered:

1. Write $J(w)$ as above.
2. Differentiate with respect to $w$.
3. Set gradient to zero and solve the linear system.

::: toggle Why does `gradient = 0` find the minimum?
The gradient `∇J` points uphill (steepest ascent), so `−∇J` points downhill. Setting it to zero means flat ground in every direction — the bowl's bottom.
One equation per weight: `XᵀXw = Xᵀy` balances all residuals at once instead of stepping (descent in M2.05 walks; here algebra teleports).
Zero gradient is necessary, not magic: on non-convex losses flat ground can be a saddle — least squares is a bowl, so flat means best.
:::

### 3.2 Geometry Route, Same Answer

Vector $y$ lives in $\mathbb{R}^n$; $Xw$ ranges over the $d$-dimensional column space of $X$. Minimising $\|y-Xw\|$ finds the closest point in that subspace, the orthogonal projection of $y$. So the residual $y-X\hat{w}$ stands perpendicular to every column of $X$: $X^T(y-X\hat{w}) = 0$, the same normal equations. Calculus grinds; geometry sees.

::: toggle What does `residual perpendicular to column space` mean?
The column space is every prediction `Xw` can ever make (all reachable rulers). The residual `y − Xŵ` is the leftover gap; perpendicular means it is orthogonal (dot product `0`) to every column of `X`.
Closest-point logic: the shortest gap from `y` to the reachable subspace meets it at a right angle — any slant could slide shorter. That right angle is `Xᵀ(y − Xŵ) = 0`.
Check it on §4's fit: residual vector `·` all-ones column `= 0` and `· x`-column `= 0` — the numbers certify the picture.
:::

**RIDGE strengthening.** If columns are dependent or $d>n$, $X^TX$ is singular and the inverse fails. The standard fix adds a penalty $\lambda I$ with $\lambda>0$: $\hat{w}=(X^TX+\lambda I)^{-1}X^Ty$. This is RIDGE regression, MAP with a Gaussian prior from the previous note: it always inverts and shrinks weights. Least Absolute Shrinkage and Selection Operator (LASSO) uses an absolute penalty instead and can zero weights, but has no closed form and needs iterative optimisation.

| Similar pair | Distinction that earns marks |
|---|---|
| Least squares vs. RIDGE | Unpenalised closed form needing full rank vs. $\lambda I$ fix that always inverts and shrinks |
| RIDGE vs. LASSO | Squared penalty shrinking smoothly vs. absolute penalty selecting sparsely |
| Calculus vs. geometry view | Zero-gradient algebra vs. orthogonal-projection picture; same weights |

::: callout-formula KTU Formula Vault: Least Squares Facts
Model $w^T\tilde{x}$ ($\tilde{x}_0=1$ absorbs intercept) · objective $\frac{1}{2n}\|y-Xw\|^2$ · normal equations **$X^TXw = X^Ty$** · solution $(X^TX)^{-1}X^Ty$ · geometry: residual **⊥ column space** · probabilistic twin: Gaussian-noise MLE (next-module bridge: squared loss *is* Gaussian log-likelihood).
:::

::: callout-pitfall Invertibility Is Assumed, Not Guaranteed
$(X^TX)^{-1}$ exists iff columns are independent — duplicate/perfectly-collinear features (or $d > n$) make $X^TX$ singular and the formula dies. Real pipelines add $\lambda I$ (ridge: always invertible, shrunk solution — the MAP-Gaussian connection from last topic) instead of praying for full rank.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Fit $y = w_0 + w_1 x$ to $(1,1), (2,2), (3,2)$ via normal equations. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Solving 2×2
$X = [[1,1],[1,2],[1,3]]$, $y = [1,2,2]$. $X^TX = \begin{pmatrix}3 & 6 \\\\ 6 & 14\end{pmatrix}$, $X^Ty = \begin{pmatrix}5 \\\\ 11\end{pmatrix}$, $\det = 42-36 = 6$. $w_0 = (14\cdot5 - 6\cdot11)/6 = 4/6 = \mathbf{2/3}$; $w_1 = (3\cdot11 - 6\cdot5)/6 = 3/6 = \mathbf{1/2}$. Model: $\hat{y} = 2/3 + x/2$; predictions $7/6, 5/3, 13/6$ vs truths $1, 2, 2$ — residuals $\pm 1/6, \mp 1/3$ summing to a visibly balanced fit.
:::

::: step [Step 3: Conclusion] Final Result
One $2\times2$ inverse solved the whole problem — no iteration, no guessing. And geometrically: the residual vector is orthogonal to both the all-ones column and the $x$-column (dot products vanish — check it), confirming the projection picture from §3.2 on real numbers.
:::

::: anim ruler-fit Three Points, One Ruler
Watch the ruler settle through (1,1), (2,2), (3,2) — residuals +1/6, −1/3, +1/6 summing to zero, perpendicular to both columns.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Inverting $X^TX$ without checking rank. Collinear features or $d>n$ need RIDGE or pseudoinverse.
- Reading squared loss as robust. Squares amplify outliers; one wild point drags the ruler.
- Confusing fitted values with probabilities. Regression outputs are quantities, not confidences.
- Forgetting the intercept column. Without the ones column the line is forced through the origin.

Limitations: linear in weights, sensitive to outliers, and closed form costs $O(d^3)$ for large $d$, where iterative Gradient Descent (GD) wins.

Exam recap: model $w^T\tilde{x}$; objective $\frac{1}{2n}\|y-Xw\|^2$; equations $X^TXw=X^Ty$; geometry residual perpendicular to column space; Gaussian-noise MLE twin; RIDGE adds $\lambda I$.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Where does the closed-form ŵ = (XᵀX)⁻¹Xᵀy come from, and what can break it?
() It is an arbitrary definition all textbooks copy
(*) Setting the MSE gradient to zero gives XᵀXw = Xᵀy; the inverse exists only with independent columns — collinearity or d > n singularizes XᵀX (ridge λI rescues it)
() It comes from Bayes' rule applied to matrices
() Nothing can break it; the inverse always exists
::: explanation
Differentiate $\frac{1}{2n}\|y-Xw\|^2$, zero the gradient, solve the linear system — the formula *is* first-order optimality. Invertibility is the fine print: dependent features collapse rank, and the fix (ridge) is last topic's Gaussian prior returning as linear algebra.
:::

::: quiz Two derivations give the same ŵ: calculus (zero gradient) and geometry (orthogonal projection). What does the geometric view add that calculus doesn't?
() A faster algorithm for computing the inverse
(*) Understanding: residuals ⊥ column space explains *why* these weights (closest point in the reachable subspace) and predicts failure modes (near-dependent columns = grazing angles = unstable fits)
() The geometric view actually gives different weights on large datasets
() Geometry only applies to 2D scatter plots
::: explanation
Calculus certifies optimality; geometry explains *structure* — near-collinear columns mean the projection grazes the subspace, so tiny data wiggles swing weights wildly (multicollinearity intuition for free). Same answer, deeper ownership.
:::

::: quiz Least squares (squared loss) and Gaussian-noise MLE give identical ŵ. Coincidence or theorem, and what follows?
() Pure coincidence of the 3-point example
(*) Theorem: Gaussian log-likelihood is (minus) squared error up to constants — so least squares *is* maximum likelihood under Gaussian noise, inheriting MLE's consistency (and its outlier fragility, since squares amplify extremes)
() They agree only when XᵀX is diagonal
() MLE always uses absolute loss instead
::: explanation
$-\log \mathcal{N}(y|w^Tx,\sigma^2) \propto (y - w^Tx)^2$ — the objectives coincide term-by-term. Consequence in both directions: least squares inherits MLE asymptotics, and MLE inherits squared loss's outlier sensitivity (one wild point drags the ruler — robust losses exist precisely for this).
:::
