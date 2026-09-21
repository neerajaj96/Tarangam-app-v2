---
id: m1_05_regression_metrics_regularisation
courseCode: PCCST503
module: 1
sequence: 5
title: 'Regression Metrics, Regularisation & Cross-Validation'
difficulty: beginner
estimatedMinutes: 14
learningObjectives:
  - State the regression-grading problem in plain words first
  - Represent features honestly (numeric, categorical, scaled) before fitting
  - Grade predictions with MAE, RMSE, and test R-squared symbol by symbol
  - Shrink weights with RIDGE and select with LASSO from first principles
  - Run k-fold cross-validation mechanically without contaminating the grade
concepts:
  - feature representation
  - MAE
  - RMSE
  - RIDGE regression
  - LASSO regression
  - k-fold cross-validation
prerequisites:
  - m1_04_multiple_regression_model_assessment
examRelevance: high
tags:
  - regression-metrics
  - regularisation
  - cross-validation
---
# Regression Metrics, Regularisation & Cross-Validation

**What problem honest regression grading solves, what feature representation it assumes, how Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and R-squared (R²) score predictions, how Regularised Regression (RIDGE and Least Absolute Shrinkage and Selection Operator (LASSO)) cures overfitting, and how k-fold Cross-Validation (CV) grades the whole procedure without cheating.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A model predicts house prices. On training homes it averages 1 lakh off; on new homes it averages 5 lakh off. The problem: the training grade lied. Three sub-problems cause the lie. First, features may be misrepresented (a "3BHK" string fed as a number, or incomes in rupees mixed with areas in square feet so one dominates). Second, the score itself may hide sins (one huge error averaged away among many small ones). Third, the model may have memorised noise (ten predictors for twelve homes), and the grading procedure may have helped it cheat (picking the winner on the same data used for the final grade).

Tiny beginner example. Truths $[10, 12, 14]$ lakh, predictions $[11, 12, 17]$ lakh. Errors are $[1, 0, 3]$. MAE is $(1+0+3)/3 \approx 1.33$. Squared errors are $[1, 0, 9]$, mean $3.33$, RMSE $\approx 1.83$. RMSE exceeds MAE because squaring punishes the lone $3$ disproportionately. That gap between the two numbers is the whole lesson: MAE reports typical miss, RMSE reports worst-miss sensitivity.

Analogy as support, then dropped. Think of a school report card with three subjects: average marks (MAE), marks that punish one failed subject extra (RMSE), and rank against the class average (R²). From here on we use exact terms only: feature representation, MAE, RMSE, R², RIDGE, LASSO, k-fold CV.

Abbreviations defined on first use: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), R-squared (R²), Cross-Validation (CV), Least Absolute Shrinkage and Selection Operator (LASSO), Regularised (penalised) regression. Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $y_i$, $\hat{y}_i$? | True target and model prediction for home $i$ |
| What is $e_i$? | Residual (error) $y_i - \hat{y}_i$ |
| What is $w$, $\lambda$? | Weight vector and penalty strength (regularisation knob) |
| What is $k$? | Number of CV folds (commonly 5 or 10) |

<a id="features-data-goal"></a>
## 2. Data, Representation and Goal (Basic Understanding)

**Problem.** Grade regression honestly and cure memorisation without breaking the fit.

**Data and representation.** Supervised pairs $(x_i, y_i)$ with continuous $y_i$. Here $x_i$ is the feature representation: the numeric vector the model actually sees. Representation choices are load-bearing, not bookkeeping. Numeric features usually need scaling (standardise to zero mean, unit variance) because RIDGE, LASSO, and gradient descent all react to raw magnitudes. Categorical features (location, "3BHK") need encoding (one-hot columns or ordered ordinals), never raw strings-as-numbers. Polynomial expansion $(x, x^2, \dots)$ from last note is also representation: it decides what curves the linear-in-weights model can draw. Garbage representation (unscaled, mis-encoded, leaking future information like "days on market" for price prediction) poisons every metric below no matter how fancy the model.

**Goal.** Small honest test error (low MAE/RMSE, high test R²), a penalty $\lambda$ chosen on validation (never test), and a final grade from data the selection procedure never saw.

::: callout-intuition Core Mental Model: The Honest Examiner
A dishonest examiner lets students set the paper, sit it, and mark it. MAE/RMSE/R² are marking schemes; regularisation is the syllabus cap (how elaborate an answer may be); k-fold CV is the external examiner who rotates which section counts as the unseen test. Each piece answers a different cheat: metrics stop vanity grades, penalties stop memorised answers, rotation stops lucky splits.
:::

<a id="metrics-theory"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (lying grades, memorising fits) → data (represented pairs, folds) → goal (honest test error) → method (score, penalise, rotate validation) → model (linear weights plus penalty) → training (minimise penalised loss, select $\lambda$ by CV) → example → limitations.

### 3.1 Metrics, Symbol by Symbol

Meaning first: MAE is the average miss in original units; RMSE is the square-rooted average squared miss (outlier-sensitive); R² is the fraction of variance explained relative to predicting the mean.

Variables: $n$ points, $y_i$ truth, $\hat{y}_i$ prediction, $e_i = y_i - \hat{y}_i$ residual, $\bar{y}$ mean of $y$.

Formulas:

$$\mathrm{MAE} = \frac{1}{n}\sum_{i=1}^{n}\lvert e_i\rvert, \quad \mathrm{MSE} = \frac{1}{n}\sum e_i^2, \quad \mathrm{RMSE} = \sqrt{\mathrm{MSE}}, \quad R^2 = 1 - \frac{\sum e_i^2}{\sum (y_i - \bar{y})^2} = 1 - \frac{SS_{res}}{SS_{tot}}.$$

Here $\lvert e_i\rvert$ is absolute miss, $e_i^2$ is squared miss, $SS_{res}$ is unexplained squares, $SS_{tot}$ is baseline squares around the mean. Intuition: MAE treats all lakhs equally; RMSE squares first so one 10-lakh blunder outweighs ten 1-lakh misses; R² $=1$ is perfect, $0$ ties the mean, negative loses to it. Worked micro-example is §1's $[10,12,14]$ vs $[11,12,17]$: MAE $\approx 1.33$, RMSE $\approx 1.83$, and R² on this toy triple is $1 - 10/8 = -0.25$ (worse than predicting the mean $12$ every time — small toys exaggerate, which is why KTU asks R² on real test sets, never three points).

| Similar pair | Distinction that earns marks |
|---|---|
| MAE vs RMSE | Typical miss vs outlier-weighted miss; report both, never RMSE alone when outliers matter |
| Train vs test R² | Construction (rises with predictors) vs evidence (only test or CV counts) |
| RMSE vs R² | Absolute units (lakhs) vs unit-free fraction (comparable across datasets) |

### 3.2 RIDGE and LASSO, Step by Step

Unpenalised least squares minimises $\lVert y - Xw\rVert^2$ and memorises when columns collinear or $d$ large. Regularisation adds a price on weights:

$$\text{RIDGE: } \min_w \lVert y - Xw\rVert^2 + \lambda\sum_j w_j^2, \qquad \text{LASSO: } \min_w \lVert y - Xw\rVert^2 + \lambda\sum_j \lvert w_j\rvert.$$

Here $\lambda \ge 0$ is penalty strength ($0$ recovers ordinary least squares; $\infty$ forces all weights to zero). RIDGE (L2, Gaussian prior from M1.02) shrinks smoothly and keeps every feature — always invertible via $(X^TX + \lambda I)^{-1}X^Ty$, the singular-matrix cure from M1.03. LASSO (L1, Laplace prior) has a diamond-shaped constraint whose corners pin weak weights exactly to zero — automatic feature selection, at the cost of no closed form (solved by coordinate descent or subgradient steps) and at most $n$ nonzeros.

Steps to use either honestly, numbered:

1. Standardise features (penalties punish raw magnitudes; unscaled "income vs area" mis-prices shrinkage).
2. Fit a $\lambda$ path on train folds only.
3. Select $\lambda$ at the validation (CV) minimum, one-standard-error rule for stability when KTU asks.
4. Refit at chosen $\lambda$ on all non-test data; report once on the untouched test set.

Qualified claim, stated carefully: larger $\lambda$ raises bias and lowers variance along the U-curve; CV picks the bottom. Neither method guarantees the true features (correlated predictors split or swap selection across samples), and LASSO selection is unstable under near-duplicates — report selected sets with that caveat, not as discovered law.

::: callout-formula KTU Formula Vault: Regression Grading Facts
MAE $= \frac{1}{n}\sum\lvert e_i\rvert$ · RMSE $= \sqrt{\frac{1}{n}\sum e_i^2}$ (outlier-sensitive) · $R^2 = 1 - SS_{res}/SS_{tot}$ (test only) · RIDGE $+ \lambda\sum w_j^2$ (shrink, closed form, keeps all) · LASSO $+ \lambda\sum\lvert w_j\rvert$ (sparse, no closed form, selects) · $\lambda$ by CV, grade once on test.
:::

::: anim penalty-price Paying for Weight Size
Watch the penalty price pull weights toward zero as lambda grows — RIDGE shrinking smoothly, LASSO snapping weaklings exactly to zero.
:::

### 3.3 k-Fold CV Mechanics, Without Cheating

Single train/test splits are lottery tickets: one lucky split flatters, one unlucky split condemns. k-fold CV deals $k$ hands. Numbered procedure:

1. Shuffle and split data into $k$ equal folds ($k = 5$ or $10$ standard; stratify for skewed targets).
2. For fold $j = 1 \dots k$: train on the other $k-1$ folds, validate on fold $j$.
3. Average the $k$ validation scores; also record spread (standard error) as the procedure's stability.
4. Select hyperparameters ($\lambda$, degree, features) at the CV minimum using only these averages.
5. Grade the selected procedure once on a held-out test set, or nest (outer loop grades, inner loop selects) when no spare test set exists.

Bootstrapping recap for contrast: bootstrap resamples with replacement for variance estimates and bagging juries (M4.04); CV partitions without replacement for honest grading. Leave-One-Out (LOO) is $k = n$: nearly unbiased, high variance, costly — examinable as the extreme, rarely the default. Nested CV grades selection itself: inner loop picks $\lambda$, outer loop scores the picker on untouched folds. Tuning on test data, reusing test folds for selection, or standardising before splitting (leakage via global mean) all contaminate the grade — standardise inside each fold, select inside inner loops, report once outside.

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Five validation homes: truths $y = [10, 12, 14, 16, 18]$, model A predicts $\hat{y} = [11, 12, 13, 16, 19]$. Compute MAE, RMSE, and test R². Then state which penalty (RIDGE or LASSO) a follow-up with 40 collinear predictors and a demand for "keep all sensors, just tame them" requires.
:::

::: step [Step 2: Execution] Scoring and Prescribing
Residuals $e = [-1, 0, 1, 0, -1]$. MAE $= (1+0+1+0+1)/5 = 0.6$. Squared $= [1,0,1,0,1]$, MSE $= 3/5 = 0.6$, RMSE $= \sqrt{0.6} \approx 0.775$. Mean $\bar{y} = 14$; $SS_{tot} = 16+4+0+4+16 = 40$; $SS_{res} = 3$; $R^2 = 1 - 3/40 = 0.925$. (Numbers verified.) Penalty: RIDGE — dense shrinkage keeps all 40 sensors with $(X^TX+\lambda I)^{-1}$ stability; LASSO would zero some, violating "keep all".
:::

::: step [Step 3: Conclusion] Final Result
Model A misses by $0.6$ typically, $0.78$ outlier-weighted, and explains $92.5\%$ of test variance. The $\lambda$ that produced it must have been CV-chosen, and the $0.925$ is evidence only because these five homes never selected anything — the honest-examiner contract from §3.3 in one worked number.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Reporting train R² as model quality. Added predictors raise train R² by construction; only test or CV R² is evidence.
- Choosing $\lambda$ on test error. Strength is a validation decision; test is the one-time witness.
- Expecting LASSO to name true causes. Correlated copies split selection arbitrarily across samples; stability needs repeated folds, not one run.
- Standardising before splitting. Global means leak test information into train folds; scale inside each fold.
- Reading RMSE as typical miss. RMSE $\ge$ MAE always (equality only when all $\lvert e_i\rvert$ equal); the gap measures outlier spread, not typicality.

Limitations: metrics need representative test data (shifted distributions void grades); penalties assume standardised, non-leaking features; CV costs $k$ trainings and still grades only the given distribution.

Exam recap: represent then scale then encode; MAE typical, RMSE outlier-weighted, R² fraction-vs-mean on test; RIDGE shrinks dense with closed form, LASSO selects sparse without one; $\lambda$ by CV mean, grade once on test; nested loop grades selection; bootstrap resamples, CV partitions.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Residuals $[2, -2, 0, 4]$ (lakh). Compute MAE and RMSE, and explain why RMSE is larger and what the gap tells an examiner.
() MAE = 2.0, RMSE = 2.0 — identical always
(*) MAE $= (2+2+0+4)/4 = 2.0$; MSE $= (4+4+0+16)/4 = 6$; RMSE $= \sqrt{6} \approx 2.45 > 2.0$ because squaring over-weights the $4$; the gap signals outlier spread beyond typical miss
() MAE = 8.0, RMSE = 6.0 — sums, not means
() RMSE is smaller because roots shrink numbers
::: explanation
MAE averages misses; RMSE averages squares then roots, so one large miss dominates. Gap $> 0$ always unless all misses tie — report both numbers and read the gap as outlier evidence, not as a second opinion on typicality.
:::

::: quiz A dataset has 12 homes and 30 collinear sensors; the brief demands keeping every sensor with stable weights. RIDGE or LASSO, and what must happen to features first?
() LASSO, raw features — sparsity is mandatory
(*) RIDGE with standardised features: L2 keeps all 30 with $(X^TX+\lambda I)^{-1}$ stability; standardisation first so the penalty prices comparable units, and $\lambda$ chosen by CV
() Neither — ordinary least squares works when $d > n$
() RIDGE without scaling — magnitudes do not matter
::: explanation
$d > n$ plus collinearity kills ordinary least squares (singular $X^TX$); LASSO would zero sensors against the brief. RIDGE shrinks densely, but only fairly on standardised scales — unscaled penalties punish rupees more than square feet for no statistical reason.
:::

::: quiz A student standardises all data, runs 5-fold CV to pick $\lambda$, then reports the best fold's score as final performance. Name two contaminations and the correct procedure.
() No contamination — best fold is the honest grade
(*) Contamination 1: scaling before splitting leaks global statistics into every fold; scale inside folds. Contamination 2: reporting the best (selected) fold reuses selection data as grading data; report the CV mean for selection and grade once on untouched test (or nested outer loop)
() Folds should be $k = 1$ for honesty
() Standardisation is forbidden in CV
::: explanation
Leakage has two doors: preprocessing outside folds and grading on selected folds. Close both — fold-local scaling, CV-mean selection, one-time test grading (nested when data is scarce). One clean grade beats five contaminated bests.
:::
