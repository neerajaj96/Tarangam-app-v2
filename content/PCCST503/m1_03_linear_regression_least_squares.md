# Linear Regression & Least Squares

**The linear model, residual geometry, normal equations derived two ways, and a hand-solved 3-point fit.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Stiff Ruler Through Scatter
Data points scatter like stars; a linear model lays a stiff ruler through them — tilting and shifting until the total squared gap between stars and ruler is minimal. **Squared** (not absolute) gaps, because squares punish big misses disproportionately, differentiate smoothly, and — the deep reason — make the optimum a single linear-algebra computation instead of a search. Least squares is the ruler-settling rule with a closed-form answer.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Model and Objective

Hypothesis $h_w(x) = w_0 + w_1 x_1 + \dots + w_d x_d = w^T\tilde{x}$ (absorb the intercept via $\tilde{x}_0 \equiv 1$). Residuals $r_i = y_i - w^T\tilde{x}_i$; objective (half-mean-squared, the $\tfrac12$ cancels the derivative's 2):

$$J(w) = \frac{1}{2n}\sum_{i=1}^n (y_i - w^T\tilde{x}_i)^2 = \frac{1}{2n}\|y - Xw\|^2$$

### 2.2 Normal Equations (Calculus Route)

$\nabla_w J = -\frac{1}{n}X^T(y - Xw) = 0 \Rightarrow$ **$X^TXw = X^Ty$** $\Rightarrow \hat{w} = (X^TX)^{-1}X^Ty$ (when $X$ has full column rank; else pseudoinverse/regularization territory).

### 2.3 Geometry Route (Same Answer, More Insight)

$y$ lives in $\mathbb{R}^n$; $Xw$ ranges over the $d$-dimensional column space of $X$. Minimizing $\|y - Xw\|$ = finding the **closest point in that subspace** = the **orthogonal projection** of $y$ — so the residual $y - X\hat{w}$ stands **perpendicular** to every column of $X$: $X^T(y - X\hat{w}) = 0$, i.e. the normal equations. Calculus grinds; geometry *sees*.

::: callout-formula KTU Formula Vault: Least Squares Facts
Model $w^T\tilde{x}$ ($\tilde{x}_0=1$ absorbs intercept) · objective $\frac{1}{2n}\|y-Xw\|^2$ · normal equations **$X^TXw = X^Ty$** · solution $(X^TX)^{-1}X^Ty$ · geometry: residual **⊥ column space** · probabilistic twin: Gaussian-noise MLE (next-module bridge: squared loss *is* Gaussian log-likelihood).
:::

::: callout-pitfall Invertibility Is Assumed, Not Guaranteed
$(X^TX)^{-1}$ exists iff columns are independent — duplicate/perfectly-collinear features (or $d > n$) make $X^TX$ singular and the formula dies. Real pipelines add $\lambda I$ (ridge: always invertible, shrunk solution — the MAP-Gaussian connection from last topic) instead of praying for full rank.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Fit $y = w_0 + w_1 x$ to $(1,1), (2,2), (3,2)$ via normal equations. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Solving 2×2
$X = [[1,1],[1,2],[1,3]]$, $y = [1,2,2]$. $X^TX = \begin{pmatrix}3 & 6 \\\\ 6 & 14\end{pmatrix}$, $X^Ty = \begin{pmatrix}5 \\\\ 11\end{pmatrix}$, $\det = 42-36 = 6$. $w_0 = (14\cdot5 - 6\cdot11)/6 = 4/6 = \mathbf{2/3}$; $w_1 = (3\cdot11 - 6\cdot5)/6 = 3/6 = \mathbf{1/2}$. Model: $\hat{y} = 2/3 + x/2$; predictions $7/6, 5/3, 13/6$ vs truths $1, 2, 2$ — residuals $\pm 1/6, \mp 1/3$ summing to a visibly balanced fit.
:::

::: step [Step 3: Conclusion] Final Result
One $2\times2$ inverse solved the whole problem — no iteration, no guessing. And geometrically: the residual vector is orthogonal to both the all-ones column and the $x$-column (dot products vanish — check it), confirming the projection picture from §2.3 on real numbers.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
