---
id: m2_03_ridge_lasso_regression
courseCode: PCCSL508
module: 2
sequence: 3
title: 'Experiment: Ridge & Lasso Regression'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the wiggly-weights problem in plain words first
  - Shrink with Ridge and select with Lasso on housing
  - Choose strength by CV and read what survived
concepts:
  - Ridge shrinkage
  - Lasso selection
  - strength selection
prerequisites:
  - m2_02_polynomial_regression_mpg
examRelevance: high
tags:
  - ridge-lasso
  - regularisation-lab
---
# Experiment: Ridge & Lasso Regression

**Aim:** tame overfitting on housing (plus polynomial-expanded features) with penalties — Ridge shrinks, Lasso selects — strength chosen by CV.

**Theory (one paragraph):** penalties price weight size: Ridge adds $\lambda\sum w^2$ (dense shrinkage, closed form), Lasso adds $\lambda\sum|w|$ (corners pin weaklings to exact zero — selection). Larger $\lambda$ = simpler model = leftward on the U-curve (PCCST503 regularisation in two lines — here we turn the knob).

**Dataset meaning:** same local `housing.csv` (+ degree-2 expansion to manufacture the overfit that penalties cure — honest scaffolding, reported as such).

## 1. Procedure Step by Step

1. Reuse M2.01 split/scale; expand to degree 2 (overfit on purpose — watch test sag vs M2.01 baseline).
2. Sweep $\lambda$ (`alpha` in sklearn) on 5-fold CV for Ridge and Lasso separately; plot CV vs $\lambda$.
3. Refit winners, compare test scores + surviving features (Lasso's nonzero list is the finding).

```python
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import RidgeCV, LassoCV
poly = PolynomialFeatures(2, include_bias=False).fit(Xtr_s)  # fit on TRAIN only (leak law)
Ptr, Pte = poly.transform(Xtr_s), poly.transform(Xte_s)
FEATS = list(df.columns[:-1])                 # base names for the survivor list below
ridge = RidgeCV(alphas=np.logspace(-2, 4, 20), cv=5).fit(Ptr, ytr)  # CV picks strength
lasso = LassoCV(alphas=np.logspace(-4, 1, 30), cv=5, max_iter=10000).fit(Ptr, ytr)
print("ridge a/test:", ridge.alpha_, round(ridge.score(Pte, yte), 3))
print("lasso a/test:", lasso.alpha_, round(lasso.score(Pte, yte), 3))
print("lasso kept:", [c for c, w in zip(poly.get_feature_names_out(FEATS), lasso.coef_) if abs(w) > 1e-6])
```

Line-by-line honesty: `logspace` sweeps orders of magnitude (strength is logarithmic intuition); `RidgeCV/LassoCV` internalise the CV (no hand loops, no test peeking); `max_iter` raised (Lasso must converge — unconverged warnings invalidate the path); survivors listed by name (the selection evidence); standardised inputs mandatory (penalties punish raw magnitudes otherwise).

**Algorithm:** penalised least squares, $\lambda$ at the CV minimum per method.

## 2. Expected Output and Result

Unpenalised degree-2 sags below baseline; Ridge recovers near baseline (all features, tamed); Lasso matches with a short survivor list (sparse + readable). Result: two CV curves, two test scores, one named survivor set.

**How to verify:** CV-best $\lambda$s printed (not hand-picked); survivors stable across adjacent seeds (note any flippers — correlated features swap, honestly reported); unscaled rerun forbidden as a check (penalty fairness needs scales).

::: callout-pitfall Unscaled Penalties
Penalising raw features punishes dollars more than years for no statistical reason — standardise first or the survivor list reports units, not importance.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Hand-picking $\lambda$ by test score | CV objects pick; test witnesses once |
| Declaring Lasso survivors "the true causes" | Correlated copies swap across samples — stability noted, not laws |
| Ignoring convergence warnings | Raise `max_iter`, scale features — unconverged paths are fiction |

**Viva:** Ridge vs Lasso in one sentence each (shrink-dense vs select-sparse)? Why log-spaced alphas (strength intuition is multiplicative)? Why standardise before penalising (fair pricing)?

**Checklist:** overfit manufactured+measured ☐; CV curves printed ☐; test once each ☐; survivors named ☐; scales standardised ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Lasso keeps AveRooms, drops AveBedrms on seed 42 but swaps them on seed 43, test scores identical. What does the report conclude?
() AveRooms is the true cause; seed 43 errored
(*) Correlated twins share credit unstably — selection flips while performance holds. Report the swap as correlation evidence, never crown one twin; stability across seeds is a finding, instability is too
() Lasso is broken for correlated data entirely
() Average the twins into one feature silently
::: explanation
Selection under correlation is a coin flip with equal payoffs: identical scores prove interchangeability. Honest reports name the flip — claiming one twin discovered truth is the classic overclaim.
:::

::: quiz Unscaled Ridge keeps "HouseAge" and kills "MedInc" (reversed vs scaled run). Which list is evidence and why?
() Unscaled — raw units are reality
(*) Scaled only: penalties price magnitudes, so raw scales rig the contest (years vs dollars). Standardised inputs make survival mean importance; unscaled survival means units — discard the rigged list loudly
() Both lists average into truth
() Ridge cannot handle income features
::: explanation
Fair pricing needs a common ruler: standard deviations, not dollars-vs-years. The reversal between runs is the proof that scales decided — quote the reversal as the reason scales are mandatory.
:::
