---
id: m1_04_multiple_regression_model_assessment
courseCode: PCCST503
module: 1
sequence: 4
title: Multiple Regression & Model Assessment
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the multiple-regression problem and held-out goal in plain words first
  - Extend regression to many predictors with polynomial expansion
  - Assess with R-squared on held-out data only
  - Diagnose fits through the bias-variance lens and name cross-validation mechanics
concepts:
  - multiple regression
  - held-out testing
  - bias-variance trade-off
prerequisites:
  - m1_03_linear_regression_least_squares
examRelevance: high
tags:
  - regression
  - model-assessment
---
# Multiple Regression & Model Assessment

**What problem multiple predictors solve, what data splits honest assessment needs, how R-squared (R²) and Cross-Validation (CV) grade generalisation, and how bias versus variance guides cures.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

One feature rarely suffices. House price depends on size and bedrooms and age together. The problem: combine many predictors without memorising noise.

Tiny beginner example. Two homes with same size 1,000 square feet sell for 12 and 14 lakh because one has two bedrooms and the other three. Size alone cannot explain the gap. A second predictor (bedrooms) is needed, with each coefficient read holding others fixed.

Analogy as support, then dropped. Think of a panel of witnesses: each testifies holding others fixed, but too many witnesses can fabricate agreement on noise. From here on we use exact terms only: multiple regression, train-test split, R-squared, bias, variance.

Abbreviations defined on first use: R-squared (R²), Cross-Validation (CV), Leave-One-Out (LOO). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $SS_{res}$? | Sum of squared residuals, what the model left unexplained |
| What is $SS_{tot}$? | Total sum of squares around the mean, baseline to beat |
| What is bias vs variance? | Rigidity error vs. wiggle error |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Fit and honestly grade a model with $d$ predictors.

**Data.** Training split for fitting, validation split for choices, test split for final grading. Fitting and grading on the same data contaminates the grade. k-fold CV strengthens this: split data into $k$ equal folds (commonly $k=5$ or $10$), train on $k-1$ folds, validate on the held-out fold, rotate so each fold validates once, and average. LOO is the extreme $k=n$. Nested validation adds an outer loop: the inner loop selects degree or features, the outer loop grades the whole procedure on untouched data.

**Goal.** High test $R^2$, low test error, with train and test grades agreeing.

Symbols: $R^2 = 1 - \sum(y_i-\hat{y}_i)^2/\sum(y_i-\bar{y})^2 = 1-SS_{res}/SS_{tot}$. Here $\hat{y}_i$ is prediction, $\bar{y}$ is test mean. Value $1$ is perfect, $0$ matches the mean baseline, negative is worse than guessing the mean. Expected test error equals bias-squared plus variance plus irreducible noise.

::: callout-intuition Core Mental Model: The Panel of Witnesses
One predictor is one witness — useful, limited. **Multiple regression** convenes the panel: price explained jointly by size *and* bedrooms *and* age, each coefficient testifying *holding the others fixed*. But panels overfit: with enough witnesses you can "explain" anything, including noise — memorizing the training lineup instead of learning the law. **Assessment** (held-out testing, R², bias–variance) is the cross-examination separating genuine understanding from expensive memorization.
:::

::: manim assets/videos/m1_08_multiple_regression.mp4 Multiple Regression Geometry
Watch the fitted plane tilt through a 3D point cloud as predictors join, then see training error keep falling while test error bottoms out and rises — the overfitting signature every later module fights.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (many predictors) → data (train, validation, test folds) → goal (generalise) → method (expand features, penalise, validate) → model (linear in weights) → training (normal equations plus selection) → example → limitations.

### 3.1 Multiple and Polynomial Regression

Same normal equations, wider $X$: $w=(X^TX)^{-1}X^Ty$ with $d$ predictors; $w_j$ is the effect of $x_j$ holding others fixed. **Polynomial regression** is linear regression in disguise: expand features $(x,x^2,\dots,x^p)$ and fit linearly in the expanded space. It is linear in weights, curved in $x$; degree is a hyperparameter, not a fitted weight.

Steps to choose complexity honestly, numbered:

1. Fit candidate degrees on train only.
2. Score each on validation folds (k-fold average, not train error).
3. Select the degree at the validation minimum.
4. Report final $R^2$ once on the untouched test fold.

### 3.2 Assessment: R², Splits and CV Mechanics

- **Train-test split (or CV):** fit on train, judge on unseen test. Test error estimates generalisation; train error does not.
- **R²:** fraction of variance explained. Rises by construction with added predictors on train, so judge it on test only.
- **k-fold mechanics, strengthened:** each point validates exactly once; averaging over folds cuts the luck of one split. Use stratified folds for classification so class ratios survive. Repeat or nest when selection itself must be graded.
- **RIDGE and LASSO reminder:** when predictors collinear or $d$ large, add a penalty. RIDGE ($\lambda\sum w_j^2$, Gaussian prior) shrinks smoothly and keeps all features; LASSO ($\lambda\sum|w_j|$, Laplace prior) can zero features and select. The penalty strength is itself chosen by CV, never by train error.

### 3.3 Bias-Variance Preview

Expected test error equals bias-squared (rigidity: wrong family) plus variance (wiggliness: sample sensitivity) plus irreducible noise. Simple models starve on bias; flexible ones drown in variance; test error bottoms at the sweet spot. This tradeoff reappears in regularisation, trees versus forests, and neural sizing.

| Similar pair | Distinction that earns marks |
|---|---|
| Train $R^2$ vs test $R^2$ | Rises by construction vs honest grade; report the second |
| k-fold vs nested CV | Honest validation of one model vs honest grading of a selection procedure |
| RIDGE vs LASSO | Dense shrinkage vs sparse selection |
| Bias vs variance | Rigid-wrong vs wiggly-unstable; U-curve finds the middle |

::: callout-formula KTU Formula Vault: Regression Facts
Same equations, wider $X$ · polynomial = **linear in weights** · assess on **held-out data** · $R^2 = 1 - SS_{res}/SS_{tot}$ (test only!) · error $=$ **bias² + variance + noise** · train error **falls** with complexity, test error **U-turns**.
:::

::: callout-pitfall R² Worship (and Train-Error Theater)
Adding *any* predictor — even random noise — never lowers train $R^2$ (least squares exploits it), so train-$R^2 \approx 1$ advertises overfitting, not quality. Report test $R^2$; distrust any model selected *and* graded on the same data (selection contaminates the grade — nested validation exists for exactly this).
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Six house sales: sizes (1000 sqft units) $x = [1, 2, 3, 4, 5, 6]$, prices (lakh) $y = [12, 20, 25, 34, 41, 48]$. Fit a line, compute train $R^2$, then leave-one-out test the last point (fit on first five, predict $x=6$).
:::

::: step [Step 2: Execution] Fitting and Splitting
Means $\bar{x} = 3.5$, $\bar{y} = 30$. Slope $= \sum(x-\bar{x})(y-\bar{y})/\sum(x-\bar{x})^2 = 126/17.5 = 7.2$; intercept $= 30 - 7.2\times3.5 = 4.8$. Model $\hat{y} = 4.8 + 7.2x$; residuals $(0, +0.8, -1.4, +0.4, +0.2, 0)$ give $SS_{res} = 2.8$ against $SS_{tot} = 910$ → train $R^2 = 1 - 2.8/910 \approx 0.997$. Leave-one-out: fitting the first five points gives the same line $\hat{y} = 4.8 + 7.2x$ (slope $72/10 = 7.2$, intercept $26.4 - 21.6 = 4.8$), predicting $x=6 \to 48.0$ vs truth $48$ — error $\approx 0$ on unseen data.
:::

::: step [Step 3: Conclusion] Final Result
Train $R^2 \approx 0.997$ *and* held-out error $\approx 0$ — both grades agree, so the fit is genuine, not memorized. Had the left-out error been $15$ with $R^2$ still $0.997$, that divergence *would be* the overfitting diagnosis — agreement between the two grades is the certificate.
:::

::: anim ucurve-overfit Train Falls, Test U-Turns
Watch train error fall while test error bottoms and rises — the file's own verdict (R² 0.997 with LOO ≈ 0) sits at the sweet spot, not the right wall.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Adding polynomial features to fix high train plus bad test. That moves right on the U-curve; the cure is left: less complexity, RIDGE or LASSO, or more data.
- Selecting degree on the test set, then reporting that test score. Use nested splits so the grade stays honest.
- Reading $R^2$ without a split label. Train $R^2$ is construction; test or CV $R^2$ is evidence.
- Tuning LASSO or RIDGE strength on train error. Strength is chosen by CV.

Limitations: $R^2$ needs variance to explain and misleads on non-linear truth; k-fold costs $k$ fits; LOO is nearly unbiased but high-variance and costly on large $n$.

Exam recap: polynomial is linear in weights; $R^2=1-SS_{res}/SS_{tot}$ on test only; error equals bias-squared plus variance plus noise; k-fold rotates validation once per point; nested loop grades selection; RIDGE shrinks, LASSO selects.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Train R² = 0.99 but held-out error is terrible. A student proposes adding more polynomial features to fix it. What is wrong?
() Nothing — more features always help generalization
(*) The symptom is overfitting (memorization), and more flexibility worsens it — the cure is less complexity, regularization, or more data, i.e. move left on the U-curve, not right
() R² cannot reach 0.99 on real data, so the report is fabricated
() Held-out error is meaningless; only train error matters
::: explanation
High train + bad test = variance disease (fit wiggles through noise). More features feed the disease. Treat by constraining capacity (lower degree, ridge penalty) or more samples — the bias–variance U-curve tells you *which direction* before you touch anything.
:::

::: quiz Why must model selection (picking degree, features) and final grading use different data — ideally nested splits?
() They don't need to; one split serves all purposes
(*) Selecting on the test set leaks it into training (the winner is partly chosen for test luck); nested validation keeps an untouched outer fold so the reported grade estimates fresh-data performance honestly
() Nested splits run faster than single splits
() Test sets are too small to select from but fine to grade on
::: explanation
Reusing test data for choices *fits* the test set by hand — the grade then measures luck + skill inseparably (selection contamination). Nested protocol: inner loop selects, outer loop grades the *procedure*. One clean grade beats ten contaminated ones.
:::

::: quiz Polynomial regression with degree 15 on 16 points achieves zero train error. Bias, variance, and the right response?
() Low bias, low variance — a perfect model, ship it
(*) Near-zero bias but enormous variance (wild oscillation between points — Runge-style); response: cut degree, regularize, or gather data — trade a little bias for a lot less variance
() High bias — the model is too rigid to fit
() Variance is irrelevant for deterministic algorithms
::: explanation
Sixteen parameters nail sixteen points (bias ≈ 0) while encoding every noise wiggle (variance huge) — textbook overfitting. The U-curve's right wall: each added degree buys bias it no longer needs at variance prices it can't afford. Regularize or simplify.
:::
