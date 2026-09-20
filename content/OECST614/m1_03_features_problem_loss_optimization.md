---
id: m1_03_features_problem_loss_optimization
courseCode: OECST614
module: 1
sequence: 3
title: 'Features, Problem Formulation, Loss & Optimization'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Turn complaints into feature-target pairs with formulation kits
  - Price mistakes with losses matched to the problem kind
  - Walk downhill on training cost with scaled features
concepts:
  - problem formulation
  - loss functions
  - gradient optimization
prerequisites:
  - m1_01_ml_vs_traditional_paradigms
examRelevance: high
tags:
  - foundations
  - loss-functions
---
# Features, Problem Formulation, Loss & Optimization

**Turning an engineering complaint into $(X, y)$, picking the loss that prices mistakes, and why training is just downhill walking on that price.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Price Tags Before Shopping
**Features** are what you measure, the **model** is the shopping list, and the **loss** is the price tag on each mistake. Squared loss fines big errors quadratically (outlier-phobic); absolute loss fines them linearly (outlier-tolerant). **Optimization** (gradient descent) then walks downhill on the total bill until the wallet stops shrinking.
:::

The identical spine runs through `PCCST503` M1 and the deep-learning course's SGD topic (`PECST632` M1) — learn it once here, reuse it everywhere.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Formulation kit

Design matrix $X$ (rows = samples, columns = features, plus a $1$-column for the bias), target vector $y$, hypothesis $h_w(x) = w^T x$. Formulation means choosing features (scaling matters for gradient methods), the hypothesis class, and the loss: squared error $(y - \hat{y})^2$ for regression, 0/1 or cross-entropy for classification.

### 2.2 Loss, cost, optimization

Per-sample **loss** $\ell(y, \hat{y})$ prices one mistake; **cost** $J(w)$ averages it over training data. Gradient descent repeats $w := w - \alpha \nabla J(w)$ with step size $\alpha$: too big overshoots, too small crawls.

::: callout-formula KTU Formula Vault: Formulation
$h_w = w^T x$ · MSE $= (1/n)\sum (y - \hat{y})^2$ · MAE $= (1/n)\sum \lvert y - \hat{y} \rvert$ · update $w := w - \alpha \nabla J$ · scale features before gradient steps.
:::

Loss choice is a modelling decision, not a habit — squared loss lets one wild sensor spike drag the whole line.

::: callout-pitfall Loss vs Cost (Marks Leak Here)
Loss prices **one** sample; cost averages over the **dataset**. An option calling the average "the loss of the dataset" (or a single residual "the cost") swaps the two levels and is always wrong in 3-markers.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
True cutting temperatures are $y = [2, 6, 8]$ and the model predicts $\hat{y} = [3, 5, 7]$. Compute the MAE and the MSE of this prediction vector.
:::

::: step [Step 2: Execution] Pricing Each Mistake
Residuals are $[-1, 1, 1]$ with absolute values $[1, 1, 1]$. MAE $= (1 + 1 + 1)/3 = 1.0$. Squared residuals are $[1, 1, 1]$, so MSE $= (1 + 1 + 1)/3 = 1.0$ and RMSE $= 1.0$. Both prices agree here because every error has magnitude exactly $1$.
:::

::: step [Step 3: Conclusion] Final Result
MAE $= 1.0$, MSE $= 1.0$. Tie is a coincidence of unit errors — with an error of $4$, squared loss would charge $16$ against absolute loss's $4$, which is precisely why outliers and squared loss mix badly.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
True $[1, 5]$, predicted $[2, 3]$. MAE and MSE?
(A) MAE $2$, MSE $4$
(*B) Residuals $[-1, 2]$, so MAE $= (1+2)/2 = 1.5$ and MSE $= (1+4)/2 = 2.5$
(C) MAE $1.5$, MSE $1.5$ always
(D) MSE is the square root of MAE
::: explanation
MAE averages magnitudes ($1.5$); MSE averages squares ($2.5$). The squaring punishes the error of $2$ fourfold — the outlier-sensitivity gap in one line.
:::

::: quiz Q2: Foundational Concept
Why scale features (e.g. mm vs km) before gradient descent?
(A) Scaling changes the true optimum to a better one
(*B) Unscaled features stretch the cost bowl into a ravine, so one step size cannot suit all directions and descent zigzags or diverges
(C) Gradient descent is undefined on unscaled data
(D) Scaling only matters for decision trees
::: explanation
The bowl's curvature follows feature scales; ravines force tiny steps along steep axes and crawl along flat ones. Standardizing rounds the bowl so a single $\alpha$ works everywhere.
:::

::: quiz Q3: Loss Choice
A furnace sensor occasionally spikes $30$ degrees off. Which loss and why?
(A) Squared loss, it punishes spikes hardest
(*B) Absolute loss, because squared loss lets rare giant spikes dominate the fit and drag the line off the honest readings
(C) 0/1 loss, temperatures are classes
(D) No loss, drop optimization entirely
::: explanation
Robustness means refusing to let one wild point outvote hundreds of good ones. Linear pricing caps spike influence; quadratic pricing amplifies it.
:::
