---
id: m2_01_linear_regression_housing
courseCode: PCCSL508
module: 2
sequence: 1
title: 'Experiment: Linear Regression on Housing'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the experiment aim in plain words first
  - Fit and grade a linear model on California Housing locally
  - Read coefficients and residuals honestly
concepts:
  - linear fit
  - coefficient reading
  - residual check
prerequisites:
  - m1_06_sklearn_environment_setup
examRelevance: high
tags:
  - linear-regression
  - housing-lab
---
# Experiment: Linear Regression on Housing

**Aim:** predict median house value from neighbourhood features with ordinary least squares, and grade honestly on held-out blocks.

**Theory (one paragraph):** Linear regression draws the best straight-line-plus-weights rule (`y ≈ Xw`) minimising squared error (PCCST503 theory in one line — here we run it). California Housing: ~20k census blocks, 8 features (MedInc, HouseAge, AveRooms, …), target MedHouseVal (median value, capped at 5.0 — a ceiling the residuals will show).

**Dataset meaning (`housing.csv`, local):** each row = one census block; features = block statistics (income, age, rooms, population…); target = median house value (in $100k, capped 5.0 — remember the cap when residuals flatten at top).

## 1. Procedure Step by Step

1. Load local CSV → inspect (M1.03 ritual) → note the 5.0 cap in `describe` (max exactly 5.00000 = censored, not coincidental).
2. X/y split → 80/20 pinned → train-only scaling (M1.05 ritual — no shortcuts, leakage checks apply).
3. Fit, predict, grade (test R² + RMSE), plot residuals + one coefficient bar chart.

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
df = pd.read_csv("housing.csv")                       # LOCAL file (course law)
X, y = df.drop(columns=["MedHouseVal"]).values, df["MedHouseVal"].values
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42)
sc = StandardScaler().fit(Xtr)                        # train-only ruler
m = LinearRegression().fit(sc.transform(Xtr), ytr)    # normal-equation fit, closed form
pred = m.predict(sc.transform(Xte))
print("R2:", round(r2_score(yte, pred), 3), "RMSE:", round(mean_squared_error(yte, pred) ** 0.5, 3))
print("top coef:", sorted(zip(df.columns[:-1], m.coef_), key=lambda t: -abs(t[1]))[:3])
```

Line-by-line honesty: cap noted before modelling (censoring biases the top — report it); closed-form fit needs no learning rate (contrast with gradient descent in viva); coefficients read per standardised unit (unscaled reading lies about importance); RMSE in $100k units (0.72 ≈ $72k typical miss).

**Algorithm:** ordinary least squares (minimise $\sum$ residuals² via normal equations — one shot, no iterations).

## 2. Expected Output and Result

R² ≈ 0.60–0.61, RMSE ≈ 0.72; top coefficient MedInc (income dominates — matches the M1.04 scatter); residuals fan slightly + flatten at 5.0 (the cap's signature). Result: a graded baseline every later experiment must beat, with reasons.

**How to verify:** rerun byte-identical (seed pinned); residual plot shows cap-flattening (if absent, suspect wrong target column); MedInc top coefficient (domain sanity).

::: callout-pitfall Cap Blindness
Ignoring the 5.0 ceiling then "fixing" top-end errors with wild features: censored targets cannot be out-predicted — report the cap, accept the flattening, move on.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Reading raw-scale coefficients as importance | Standardised units only — scale decides apparent size otherwise |
| Tuning on test to "beat 0.61" | Test graded once; validation/CV tunes (M1.05 law) |
| Downloading housing mid-lab | Local CSV — offline discipline, always |

**Viva:** closed-form vs iterative fitting (one-shot equations vs stepped descent)? Why MedInc dominates (domain + scatter prior)? What does cap-flattening prove (censoring, not model failure)?

**Checklist:** cap noted ☐; rituals (split/scale) ☐; R²/RMSE recorded ☐; residuals plotted ☐; baseline written down ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Residuals flatten horizontally at predicted 5.0 while truth varies above. Is the model broken, and what must the report say?
() Add polynomial features to break the ceiling
(*) Not broken: targets are censored at 5.0 (dataset cap), so no model can out-predict the ceiling — report the cap, accept top-end error as data property, grade the rest honestly
() The scaler clipped predictions; remove scaling
() R² is meaningless on capped data entirely
::: explanation
Censoring is a data fact, not a model flaw: predictions pile where truth was cut. Name the cap, show the flattening as evidence, and refuse to "fix" the unfixable — honesty grades higher than ingenuity here.
:::

::: quiz Unscaled fit names HouseAge the top driver; scaled fit names MedInc. Which reading is honest and why?
() Unscaled — raw units are truth
(*) Scaled (standardised units): raw coefficients inherit feature scales (years vs dollars), so size comparisons are meaningless unscaled. Standardise, then rank — importance needs a common ruler
() Both equally; report either
() Coefficients never measure importance
::: explanation
Units contaminate comparisons: big-numbered features look quiet, small-numbered loud. The common ruler (standard deviations) is what makes "top driver" a factual claim instead of a scale artefact.
:::
