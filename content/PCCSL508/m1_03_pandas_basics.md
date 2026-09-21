---
id: m1_03_pandas_basics
courseCode: PCCSL508
module: 1
sequence: 3
title: 'Pandas: DataFrames & Cleaning'
difficulty: beginner
estimatedMinutes: 11
learningObjectives:
  - State what a DataFrame adds over arrays in plain words first
  - Load a local CSV and inspect it like a lab notebook
  - Handle missing values and types deliberately
concepts:
  - DataFrame
  - missing values
  - local CSV loading
prerequisites:
  - m1_02_numpy_basics
examRelevance: high
tags:
  - pandas
  - data-cleaning
---
# Pandas: DataFrames & Cleaning

**Aim:** load real local data, see it truthfully, and clean it deliberately — no downloads, no surprises.

**Theory (one paragraph):** A DataFrame is a labelled table: named columns with mixed types (numbers + categories), row index, and built-in inspection (head/describe/isna). NumPy computes; Pandas understands. Local CSVs (in the lab folder) are the only data source in this course — offline by design.

**Dataset meaning:** each CSV file is one experiment's world (housing, mileage); columns are *features*, one column is the *target*; rows are *samples*. `df.shape` should echo `(n_samples, n_features+1)`.

## 1. Procedure Step by Step

1. `pip install pandas`; place `housing.csv` beside the script (lab folder copy — never a URL).
2. Run the inspection ritual on every new file, in order, before any modelling.

```python
import pandas as pd
df = pd.read_csv("housing.csv")   # local file only: offline, repeatable, examinable
print(df.shape)                   # (rows, columns): know your world size first
print(df.head())                  # first 5 rows: eyeball types and sanity
print(df.dtypes)                  # per-column types: numbers vs objects (strings!)
print(df.isna().sum())            # missing count per column: the cleaning work order
print(df.describe())              # means/min/max: outliers confess here (huge max?)
```

Line-by-line honesty: `read_csv` guesses types (a stray `"?"` string turns a column to `object` — find it via `dtypes`); `isna().sum()` is the triage list (most-missing first? or drop?); `describe` skips non-numeric silently (object columns vanish from it — check `dtypes` so nothing hides).

**Cleaning moves (deliberate, logged):** numeric gaps → `df["col"].fillna(df["col"].median())` (median resists outliers, mean doesn't); categorical gaps → mode or `"missing"` label; wrong types → `pd.to_numeric(..., errors="coerce")` then re-triage. Log every fill in the report — cleaning is methodology, not janitorial invisibility.

## 2. Expected Output and Result

Shape printed, 5 sane rows, typed columns, a missing-value work order, and a describe table with believable ranges. Result: a cleaned `df_clean` plus a one-paragraph cleaning log for the record.

**How to verify:** `df_clean.isna().sum().sum() == 0` (nothing left unhandled) and row count unchanged unless drops were justified in writing.

::: callout-pitfall Silent Object Columns
One `"?"` among ten thousand numbers makes the whole column `object`, silently excluding it from `describe` and all math. `dtypes` after every load — type-checking is inspection step zero.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Modelling before `isna` (NaNs poison fits) | Inspect → clean → model; NaN in, garbage out, always |
| Mean-filling skewed columns | Median for skewed (income!), mean only for symmetric — `describe` decides |
| Downloading datasets mid-exam | Local CSVs only — downloads fail offline and break reproducibility |

**Viva:** DataFrame vs ndarray (labels + mixed types vs typed grid)? Why median over mean for income (outlier resistance)? What does `describe` hide (non-numerics)?

**Checklist:** local load ☐; shape/head/dtypes/isna/describe ☐; cleaning logged ☐; zero unhandled NaNs ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz `describe()` shows no `income` column though `head()` shows it. What happened and which command proves it?
() describe is broken for large files
(*) `income` became `object` (a stray non-numeric like "?" poisoned parsing) — `dtypes` proves it; `describe` skips non-numerics silently. Fix: coerce + clean, then re-triage
() Income must be deleted as unmodellable
() head() hallucinates columns
::: explanation
Two commands tell the story: `head` shows presence, `dtypes` shows type, `describe` shows the consequence. Silent exclusion is the hazard — type-checking is the ritual that catches it.
:::

::: quiz Column with 30% missing values: fill, drop column, or drop rows? Give the decision rule.
() Always fill — data is sacred
(*) Depends on mechanism and wealth: few missing + rich rows → median/mode fill (logged); missingness itself informative → add `was_missing` flag; column mostly hollow or leaking the target → drop with written justification. Decide per column, log every call
() Always drop — missing means useless
() Ignore silently; models handle NaN natively (most don't)
::: explanation
Cleaning is modelling's first decision: each option changes evidence. Rules (mechanism, richness, leakage) plus a written log turn janitorial work into methodology the viva can defend.
:::
