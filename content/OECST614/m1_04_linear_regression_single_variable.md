---
id: m1_04_linear_regression_single_variable
courseCode: OECST614
module: 1
sequence: 4
title: Linear Regression With One Variable
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Fit least-squares slopes from co-movement over spread
  - Pin intercepts through mean-point discipline
  - Certify fits with zero-sum residuals before predicting
concepts:
  - least-squares line
  - slope-intercept formulas
  - residual checks
prerequisites:
  - m1_03_features_problem_loss_optimization
examRelevance: high
tags:
  - regression
  - least-squares
---
# Linear Regression With One Variable

**The least-squares line from scratch — means, slope as co-movement over spread, intercept pinning, and residuals that must sum to zero.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Seesaw Balance Point
The regression line is the **seesaw position** minimizing total squared gap between planks (data) and beam (line). Slope $= \text{co-movement} / \text{spread}$: how far $y$ swings with $x$, normalized by how far $x$ swings alone. The intercept then pins the beam through the **centre of mass** $(\bar{x}, \bar{y})$.
:::

One variable today, many tomorrow (M1.5 adds the matrix), and the same squared-loss engine as `PCCST503` M1 — the numbers here are deliberately small enough to verify by hand in the exam hall.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Least-squares formulas

For points $(x_i, y_i)$, with means $\bar{x}$ and $\bar{y}$, the slope is $w_1 = \sum (x_i - \bar{x})(y_i - \bar{y}) / \sum (x_i - \bar{x})^2$ and the intercept is $w_0 = \bar{y} - w_1 \bar{x}$. Prediction is $\hat{y} = w_0 + w_1 x$.

### 2.2 Built-in sanity checks

The fitted line always passes through $(\bar{x}, \bar{y})$, and the residuals $y_i - \hat{y}_i$ always sum to **zero**. Either check failing means arithmetic error, not a hard problem.

::: callout-formula KTU Formula Vault: Single-Variable Line
$w_1 = \sum (x-\bar{x})(y-\bar{y}) / \sum (x-\bar{x})^2$ · $w_0 = \bar{y} - w_1\bar{x}$ · line through $(\bar{x}, \bar{y})$ · residuals sum to $0$.
:::

Least squares is the MLE under Gaussian noise — the M1.2 coin and this line share one probabilistic roof.

::: callout-exam KTU Exam Focus
9-markers give 3–4 points and ask for the line plus one prediction. Compute $\bar{x}, \bar{y}$ first, build the deviation table, divide once. Examiners award the residual-sum check as method credit even when stated briefly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Fit $y = w_0 + w_1 x$ to $(1,2)$, $(2,4)$, $(3,5)$ by least squares, then predict at $x = 4$ and verify the residuals sum to zero.
:::

::: step [Step 2: Execution] Means, Deviations, Division
Means: $\bar{x} = 2$, $\bar{y} = 11/3 \approx 3.6667$. Deviations in $x$: $[-1, 0, 1]$; in $y$: $[-1.6667, 0.3333, 1.3333]$. Numerator $= (-1)(-1.6667) + 0 + (1)(1.3333) = 3.0$. Denominator $= 1 + 0 + 1 = 2$. Slope $w_1 = 1.5$, intercept $w_0 = 3.6667 - 1.5 \times 2 = 0.6667$. Prediction at $4$: $0.6667 + 6 = 6.6667$.
:::

::: step [Step 3: Conclusion] Final Result
Line $\hat{y} = 0.6667 + 1.5x$. Fitted values $[2.1667, 3.6667, 5.1667]$ give residuals $[-0.1667, 0.3333, -0.1667]$ summing to $0.0$ — the zero-sum certificate that the arithmetic is clean.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Points $(0,1)$, $(1,3)$, $(2,5)$. Least-squares line?
(A) $\hat{y} = 1 + x$
(*B) $\hat{y} = 1 + 2x$, since $\bar{x} = 1$, $\bar{y} = 3$, numerator $= 4$, denominator $= 2$, slope $2$, intercept $1$
(C) $\hat{y} = 3 + x$
(D) $\hat{y} = 0 + 3x$
::: explanation
Deviations in $x$ are $[-1,0,1]$, in $y$ are $[-2,0,2]$; numerator $(-1)(-2) + 0 + (1)(2) = 4$, denominator $2$, slope $2$, intercept $3 - 2 = 1$. Perfectly collinear data still goes through the formulas.
:::

::: quiz Q2: Sanity Check
A student's fitted line misses $(\bar{x}, \bar{y})$ but the slope looks right. Verdict?
(A) Accept it, the mean property is optional
(*B) Reject it, least squares must pass through the centre of mass, so the intercept arithmetic is wrong
(C) Recompute only the slope
(D) Switch to absolute loss instead
::: explanation
$w_0 = \bar{y} - w_1\bar{x}$ forces the line through $(\bar{x}, \bar{y})$ by construction. Missing it indicts the intercept, never the data.
:::

::: quiz Q3: Prediction Discipline
Using the worked line $\hat{y} = 0.6667 + 1.5x$, a student predicts $x = 30$ confidently. What is the concern?
(A) Arithmetic fails beyond $x = 4$
(*B) Extrapolation far outside $[1,3]$ assumes linearity holds where no data exists, so the prediction is speculative regardless of fit quality
(C) Intercepts expire after the training range
(D) Residuals stop summing to zero outside
::: explanation
Least squares certifies interpolation, not extrapolation. A tight residual sum inside the data says nothing about physics ten times further out.
:::
