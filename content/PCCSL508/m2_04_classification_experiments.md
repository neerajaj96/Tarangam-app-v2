---
id: m2_04_classification_experiments
courseCode: PCCSL508
module: 2
sequence: 4
title: 'Experiment: Classification (LogReg, kNN, Trees)'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the discrete-decision problem in plain words first
  - Run three classifiers on one local dataset correctly
  - Compare by validation, not by hope
concepts:
  - classifier comparison
  - decision boundaries
  - validation protocol
prerequisites:
  - m2_03_ridge_lasso_regression
examRelevance: high
tags:
  - classification-lab
  - model-compare
---
# Experiment: Classification (LogReg, kNN, Trees)

**Aim:** predict discrete labels with logistic regression, k-NN, and decision trees on one local dataset — same split, same protocol, honest winner.

**Theory (one paragraph):** classifiers draw boundaries: logistic regression a linear one with probabilities, k-NN a voted neighbourhood (stores everything, lazy), trees axis-aligned boxes (greedy splits). Same data + same validation ⇒ comparable scores; different inductive biases ⇒ different failures (PCCST503 classifiers in three lines — here they compete).

**Dataset meaning (`hlass.csv`, local — any small labelled CSV: e.g. penguin/survival-style rows):** each row = one case; features = measurements; target = class label (0/1 or named species). Binary-or-few-classes keeps metrics readable (M2.05 grades them).

## 1. Procedure Step by Step

1. Load local CSV → encode labels to ints if named (`df["label"].astype("category").cat.codes`, mapping logged).
2. Same split/scale ritual (M1.05); scale matters for k-NN/logreg (distances/gradients), trees indifferent (splits are threshold cuts).
3. Fit all three, validation-score all three, confusion matrices for all three.

```python
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
df = pd.read_csv("hlass.csv")                     # LOCAL labelled file
y = df["label"].astype("category").cat.codes      # named labels -> ints (mapping logged!)
X = df.drop(columns=["label"]).values
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
sc = StandardScaler().fit(Xtr)                    # train-only ruler (distances need fairness)
models = {"logreg": LogisticRegression(max_iter=1000),
          "knn-5": KNeighborsClassifier(5),
          "tree": DecisionTreeClassifier(random_state=42)}
for name, m in models.items():
    cv = cross_val_score(m, sc.transform(Xtr), ytr, cv=5).mean()
    m.fit(sc.transform(Xtr), ytr)
    print(name, "cv:", round(cv, 3), "test:", round(m.score(sc.transform(Xte), yte), 3))
```

Line-by-line honesty: `stratify=y` preserves class ratios (rare-class honesty); k fixed at 5 as a stated starting choice (tuned only on CV, never test); tree `random_state` pinned (tie-breaks repeat); scaling applied uniformly (fairness across distance-based methods — trees ignore it harmlessly).

**Algorithm:** three decision rules (linear-probabilistic, neighbourhood-vote, recursive-partition) under one protocol.

## 2. Expected Output and Result

CV column picks the winner (often tree/logreg on clean tabular; kNN when clusters are local); test confirms within noise; confusion matrices (M2.05) show *which* classes confuse. Result: a ranked table + matrices, winner by validation.

**How to verify:** rerun identical (seeds pinned); shuffle labels → all ≈ chance (sanity: signal, not plumbing, drives scores); k=1 memos train 100% (overfit demo on demand).

::: callout-pitfall Test-Crowned Champions
Picking the winner by test scores fits the test set by hand — CV ranks, test coronates once. Keep the CV column in the report as the ranking evidence.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Unscaled kNN vs scaled logreg (rigged race) | Same scaled inputs for all — fairness before ranking |
| k tuned on test | k is a CV decision; test sees the chosen k once |
| Ignoring the label mapping | Log int↔name mapping — predictions are meaningless otherwise |

**Viva:** eager vs lazy (logreg/tree learn rules; kNN stores data)? Why stratify (ratio honesty)? Why scale for kNN (distance fairness)?

**Checklist:** mapping logged ☐; stratified pinned split ☐; uniform scaling ☐; CV ranking ☐; test once ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz k=1 scores 100% train but loses CV badly, while k=15 tops CV. Explain both halves with the bias-variance lens.
() k=1 is the best model; CV is broken
(*) k=1 memorises (every point its own neighbour — zero bias, huge variance, CV exposes it); k=15 smooths neighbourhoods (some bias, far less variance) — CV ranks generalisation, train ranks memory
() Larger k always wins universally
() Variance doesn't apply to lazy learners
::: explanation
Capacity runs backwards in kNN: small k = flexible = variance disease. Train-perfection with CV-collapse is memorisation's signature — quote both numbers as the diagnosis.
:::

::: quiz Logreg was fit unscaled while kNN got scaled inputs, and logreg "won". Is the ranking valid?
() Yes — winners are winners
(*) No: rigged race — unscaled logreg fought handicapped (gradient conditioning) while kNN fought fair; same preprocessing for all is the comparability contract. Redo uniform, re-rank, report the correction
() Scaling only matters for trees
() Comparisons need no protocol
::: explanation
Fairness precedes ranking: shared inputs, shared splits, shared seeds. A rigged win is a void result — the protocol is the experiment, not the paperwork around it.
:::
