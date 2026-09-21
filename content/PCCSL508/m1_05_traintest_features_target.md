---
id: m1_05_traintest_features_target
courseCode: PCCSL508
module: 1
sequence: 5
title: 'Train/Test Splits, Features & Target'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the honesty contract in plain words first
  - Split reproducibly with stratification sense
  - Name X, y, and leakage correctly every time
concepts:
  - train test split
  - features and target
  - data leakage
prerequisites:
  - m1_04_matplotlib_basics
examRelevance: high
tags:
  - train-test
  - leakage
---
# Train/Test Splits, Features & Target

**Aim:** split data so grades stay honest — the single habit separating experiments from self-deception.

**Theory (one paragraph):** Fit on train, judge on test (held-out, unseen during fitting *and* selection). Features `X` (inputs matrix, shape `(n, d)`), target `y` (answers vector). Leakage = test information reaching training (scaling on full data, selecting features by test scores, training on test) — every leak inflates grades and voids conclusions. `random_state` fixes the shuffle for reproducibility.

**Dataset meaning:** housing rows split 80/20: ~16k train to learn from, ~4k test to be judged by once.

## 1. Procedure Step by Step

1. Clean first (M1.03), separate `X`/`y` second, split third — order is the honesty.
2. Scale *inside* the split (fit scaler on train, apply to test).

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
X = df_clean.drop(columns=["MedHouseVal"]).values  # features: everything but the answer
y = df_clean["MedHouseVal"].values                  # target: the one column we predict
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42)
# ^ 80/20, fixed shuffle (42 = reproducibility, any int works — but FIX one)
sc = StandardScaler().fit(Xtr)      # learn mean/scale from TRAIN ONLY (leakage gate!)
Xtr_s, Xte_s = sc.transform(Xtr), sc.transform(Xte)  # apply same ruler to both
print(Xtr_s.shape, Xte_s.shape)     # (16512, 8) (4128, 8): shapes confess the split
```

Line-by-line honesty: `drop(columns=[target])` defines the question (leak = forgetting this); `random_state` pins the shuffle (unpinned = unrepeatable grades); `fit` on train only (fitting on all = test statistics leaking into training — the #1 silent sin); shapes printed prove the 80/20 actually happened.

::: toggle What do `train_test_split`, `test_size`, `random_state`, and `stratify` do?
`train_test_split(X, y, ...)` = shuffle rows and deal two hands (features and labels travel together — never split X from y). `test_size=0.2` = deal 20% to test (80% trains — the standard generosity). `random_state=42` = pin the shuffle (same number ⇒ identical deal every rerun; any integer works — fixed is what matters). `stratify=y` = deal preserving class ratios (rare classes survive in both hands — classification honesty; regression usually skips it).
:::

::: toggle What do `fit`, `transform`, `StandardScaler`, and "leakage" mean here?
`StandardScaler()` = standardiser (subtract mean, divide by std — common ruler). `.fit(Xtr)` = learn the ruler from train only (means/variances are train knowledge). `.transform(X)` = apply that ruler (train and test alike — test never teaches the ruler). Leakage = test information reaching training (fit-on-all, select-by-test, tune-on-test) — every leak inflates grades and voids conclusions; exactly-0 test means would indict it.
:::

**Stratification sense:** classification with rare classes → `stratify=y` (keeps ratios in both halves); regression → plain shuffle usually suffices (note it in the report either way).

## 2. Expected Output and Result

Shapes `(16512, 8)`/`(4128, 8)` (exact counts vary by dataset version — ratios, not absolutes, are the check), train means ≈ 0 after scaling, test means merely near 0 (unseen data never centres perfectly — that's honesty visible). Result: `Xtr_s, Xte_s, ytr, yte` ready for every M2–M3 experiment.

**How to verify:** test mean ≠ exactly 0 (leak check: exactly-0 test means would indict full-data scaling); rerun gives identical splits (reproducibility check).

::: callout-pitfall The Three Leaks
Scaling on full data, feature-selecting by test scores, tuning on test error — each inflates grades while looking diligent. Split first, fit transforms on train, select on validation, grade test once. Leak checks belong in every viva.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| `fit_transform` on all of X before splitting | Fit train-only; test is the untouched witness |
| No `random_state` (grades wander per run) | Pin it; repeatability is gradeability |
| Scaling the target for classification | Scale features; targets have their own rules (leave regression targets raw unless justified) |

**Viva:** features vs target (inputs vs answers)? Why train-only scaling (test statistics are future knowledge)? What does `random_state` buy (repeatable evidence)?

**Checklist:** X/y separated ☐; 80/20 pinned split ☐; train-only scaler ☐; shapes printed ☐; test mean ≉ 0 exactly ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Test R² = 0.91 but fresh-district data scores 0.62. The scaler was fit on the full dataset. Explain the inflation chain precisely.
() Fresh districts are harder; nothing wrong
(*) Full-data scaling leaked test statistics (means/variances) into training features — the model tuned to test-flavoured inputs, inflating held-out scores that collapse on truly unseen distributions. Fit transforms on train only; the 0.29 gap is the leak's receipt
() R² always drops on new data; ignore it
() 0.91 was computed wrong arithmetically
::: explanation
Leakage launders future knowledge into training: test-centred features flatter validation, then reality (uncentred the same way) collects. Fit-on-train is the gate — the gap size measures the sin.
:::

::: quiz Why pin `random_state`, and what breaks in evaluation without it?
() Pinned shuffles train better models
(*) Repeatability: unpinned splits reshuffle every run, so grades wander and no result reproduces — neither you nor the evaluator can re-earn a number. Pinning fixes the evidence; the value itself is arbitrary
() Random states change the algorithm's math
() Evaluators demand the number 42 specifically
::: explanation
Science reruns: same code + same seed = same split = same grade. Wandering grades are ungradeable — pinning converts luck into evidence.
:::
