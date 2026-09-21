---
id: m2_02_polynomial_regression_mpg
courseCode: PCCSL508
module: 2
sequence: 2
title: 'Experiment: Polynomial Regression on Auto MPG'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the curvature problem in plain words first
  - Fit polynomial degrees honestly with validation
  - Diagnose the U-curve on held-out error
concepts:
  - polynomial expansion
  - degree selection
  - U-curve diagnosis
prerequisites:
  - m2_01_linear_regression_housing
examRelevance: high
tags:
  - polynomial-regression
  - mpg-lab
---
# Experiment: Polynomial Regression on Auto MPG

**Aim:** predict car mileage from engine features where straight lines visibly fail, choosing polynomial degree by validation — never by test.

**Theory (one paragraph):** Polynomial regression is linear regression on expanded features ($x, x^2, \dots, x^d$) — curves in input, still linear in weights (PCCST503 in one line). Auto MPG: ~400 cars, features (cylinders, displacement, horsepower, weight, acceleration…), target mpg. Weight-vs-mpg curves bend; degree is the capacity knob with a U-shaped held-out error (underfit left, overfit right).

**Dataset meaning (`mpg.csv`, local):** each row = one car model-year; features = engine/body numbers (horsepower has `?` gaps — M1.03 cleaning applies!); target = miles per gallon.

## 1. Procedure Step by Step

1. Load → clean horsepower `?` → numeric (M1.03: coerce + median) → scatter weight-vs-mpg (see the bend first).
2. Split/scale rituals (M1.05); pipeline `PolynomialFeatures + LinearRegression` per degree 1–5.
3. Score each degree on a validation split (or 5-fold CV); pick the minimum; grade the winner once on test.

```python
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.metrics import r2_score
df = pd.read_csv("mpg.csv")
df["horsepower"] = pd.to_numeric(df["horsepower"], errors="coerce")  # "?" -> NaN honestly
df["horsepower"].fillna(df["horsepower"].median(), inplace=True)      # logged cleaning
X, y = df[["weight", "horsepower", "displacement"]].values, df["mpg"].values
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42)
sc = StandardScaler().fit(Xtr); Xtr_s, Xte_s = sc.transform(Xtr), sc.transform(Xte)
for d in (1, 2, 3, 4, 5):
    pipe = make_pipeline(PolynomialFeatures(d, include_bias=False), LinearRegression())
    cv = cross_val_score(pipe, Xtr_s, ytr, cv=5).mean()   # validation ONLY (test untouched!)
    print(d, round(cv, 3))
best = make_pipeline(PolynomialFeatures(2, include_bias=False), LinearRegression()).fit(Xtr_s, ytr)
print("test R2:", round(r2_score(yte, best.predict(Xte_s)), 3))
```

Line-by-line honesty: `errors="coerce"` converts lies to NaN visibly (never silent); pipeline bundles expansion+fit so CV splits honestly per fold (expansion outside CV leaks!); degree picked on CV mean (test sees the winner once); expect degree 2–3 wins, 4–5 curls onto noise (U-curve visible in the printed means).

**Algorithm:** least squares on degree-$d$ expanded features, degree chosen by 5-fold CV.

## 2. Expected Output and Result

CV R² rises 1→2 (≈0.80s), plateaus 3, falls 4–5; test R² ≈ 0.80–0.83 at the winner. Result: a validated degree plus a printed U-curve — capacity chosen by evidence, not hope.

**How to verify:** CV means printed (U-shape visible); test scored once (rerun identical); degree-5 train R² high but CV low (overfit signature on demand).

::: callout-pitfall Test-Picked Degrees
Choosing degree by test scores fits the test set by hand — grades then measure luck. Validation/CV picks, test witnesses once. The printed CV column is the selection evidence; keep it in the report.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Expanding before splitting (leak via global scaler) | Pipeline inside CV; scaler fit on train folds only |
| Degree 8 "winning" on train | Train R² is construction — CV/test is evidence; U-curve disciplines greed |
| Ignoring `?` horsepower (object column chaos) | Coerce + median, logged (M1.03 ritual) |

**Viva:** why linear-in-weights still (expansion is representation, fitting is linear)? What does the U-shape's right arm prove (variance/memorsation)? Why pipelines in CV (per-fold honesty)?

**Checklist:** bend seen in scatter ☐; `?` cleaned+logged ☐; CV column printed ☐; winner graded once ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Degree 5 shows train R² 0.97 but CV 0.71 while degree 2 shows 0.84/0.82. Which ships and what do the two gaps prove?
() Degree 5 — train 0.97 is unbeatable evidence
(*) Degree 2: the 5's 0.26 train–CV gap is memorisation (variance) confessing; 2's tight 0.02 gap generalises. Ship the CV winner — train scores are construction, CV is evidence
() Average the two models' predictions
() More data would save degree 5 automatically
::: explanation
Gap arithmetic diagnoses: wide train–CV split = variance disease, tight = health. The U-curve's right arm is degree 5 waving — read gaps, ship minima, never maxima of train.
:::

::: quiz Why must PolynomialFeatures live inside the pipeline rather than applied once upfront?
() Pipelines run faster computationally
(*) Upfront expansion is usually paired with upfront scaling/selection — global transforms fitted outside CV leak across folds; inside the pipeline every fold refits transforms on its own train slice (per-fold honesty)
() Upfront expansion is illegal Python
() Pipelines reduce the degree automatically
::: explanation
Leakage hides in preprocessing order: fit-transforms must live inside the CV loop to see only train folds. Pipelines enforce the geography — outside is contamination by convenience.
:::
