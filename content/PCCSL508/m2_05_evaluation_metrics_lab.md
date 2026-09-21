---
id: m2_05_evaluation_metrics_lab
courseCode: PCCSL508
module: 2
sequence: 5
title: 'Experiment: Evaluation Metrics in Code'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the grading-choice problem in plain words first
  - Compute confusion, precision, recall, F1, ROC-AUC from predictions
  - Choose the metric per cost scenario defensibly
concepts:
  - confusion matrix code
  - precision recall F1
  - ROC AUC curves
prerequisites:
  - m2_04_classification_experiments
examRelevance: high
tags:
  - eval-metrics
  - roc-lab
---
# Experiment: Evaluation Metrics in Code

**Aim:** grade the M2.04 classifiers beyond accuracy — confusion matrices, precision/recall/F1, ROC curves and AUC — and match metric to mistake-cost.

**Theory (one paragraph):** accuracy counts the whole ledger (majority-echo on imbalance); precision audits predicted positives; recall audits actual positives; F1 harmonically compromises; ROC sweeps thresholds plotting TPR vs FPR; AUC = ranking probability (PCCST503 evaluation-metrics note in five lines — here we compute them).

**Dataset meaning:** M2.04's held-out predictions (`yte` truth, `pred` verdicts, `proba` scores) — metrics read these three arrays, nothing else.

## 1. Procedure Step by Step

1. Collect truth + verdicts + scores from each M2.04 model on the untouched test split.
2. Compute matrix → ratios → curves, printing all four views per model.
3. Assign each model its cost scenario (screening ⇒ recall, spam-filter ⇒ precision, balanced ⇒ F1, ranking ⇒ AUC).

```python
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score
from sklearn.metrics import RocCurveDisplay, roc_auc_score
for name, m in models.items():                       # M2.04's fitted trio, untouched test data
    pred = m.predict(Xte_s)
    proba = m.predict_proba(Xte_s)[:, 1] if hasattr(m, "predict_proba") else m.decision_function(Xte_s)
    print(name, confusion_matrix(yte, pred).ravel())  # TN FP FN TP in one line (row-major!)
    print("  P/R/F1:", round(precision_score(yte, pred), 3), round(recall_score(yte, pred), 3),
          round(f1_score(yte, pred), 3), "AUC:", round(roc_auc_score(yte, proba), 3))
    RocCurveDisplay.from_predictions(yte, proba)      # curve per model, same axes, compare visually
```

Line-by-line honesty: `ravel()` order is TN,FP,FN,TP (row-major — misreading it swaps precision/recall!); `predict_proba` missing on some models ⇒ `decision_function` fallback (scores need only order, not calibration); curves on shared axes (separate plots per model hide domination); AUC beside operating-point scores (area ranks, dots decide).

::: toggle What do `confusion_matrix().ravel()`, `precision/recall/f1_score`, and `roc_auc_score` compute?
`confusion_matrix(yte, pred)` = 2×2 counts [[TN, FP],[FN, TP]] (rows = truth, columns = verdict). `.ravel()` flattens row-major → TN, FP, FN, TP (memorise this order — misreading swaps precision with recall). `precision_score` = TP/(TP+FP) (alarm trust); `recall_score` = TP/(TP+FN) (capture completeness); `f1_score` = harmonic compromise (punishes lopsidedness). `roc_auc_score(yte, proba)` = P(positive outscores negative) across all thresholds (ranking grade 0–1, 0.5 = chance). `RocCurveDisplay.from_predictions` draws TPR-vs-FPR sweeping the threshold (the curve whose area AUC integrates).
:::

::: toggle Why the fallback `decision_function` when `predict_proba` is missing?
ROC needs *scores with order*, not probabilities: any number ranking positives above negatives draws a curve (SVM margins qualify; trees' `predict_proba` fractions qualify). `hasattr` checks capability per model instead of assuming it — curves compare ranking skill fairly even when calibration differs. Never threshold-then-curve (labels have no sweep left).
:::

**Algorithm:** counting (cells) → ratios (P/R/F1) → sweep (ROC) → integrate (AUC).

## 2. Expected Output and Result

Per model: 4-cell line, P/R/F1 triple, AUC; curves crossing or dominating; cost-matched verdict (e.g. tree best F1, logreg best AUC — different winners per metric is normal and reportable). Result: a metric table + overlaid curves + one matched recommendation.

**How to verify:** hand-count one 2×2 from raw lists (cells match code); precision = TP/(TP+FP) recomputed once by hand (ratio trust); curve endpoints (0,0)→(1,1) present (sweep completeness).

::: callout-pitfall Accuracy Headlines
Leading with accuracy on 95/5 data buries the minority story — lead with the cost-matched metric, keep accuracy as a footnote with ratios beside it.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Misreading ravel order (precision/recall swapped) | TN,FP,FN,TP row-major — hand-verify once per project |
| Shipping AUC without operating scores | Area ranks; the deployed dot's P/R decides — report both |
| Tuning threshold on test | Thresholds are validation choices (M2.04 CV); test sees one dot |

**Viva:** ravel order from memory? Precision vs recall audits (columns vs rows)? When is accuracy the right headline (balanced classes + equal costs only)?

**Checklist:** hand-verified cells ☐; P/R/F1 + AUC all printed ☐; curves overlaid ☐; cost-matched pick ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Model A: accuracy 0.97, recall 0.40. Model B: accuracy 0.91, recall 0.90 on 95/5 data. Screening for illness — pick with arithmetic.
() A — accuracy decides everything
(*) B: screening pays for misses, and A's 0.97 is 95 negatives + few hits (majority echo); B catches 9/10 sick at some false-alarm cost — recall rules screening, accuracy footnotes it
() Tie — both above 0.90
() Neither; demand 1.00 recall always
::: explanation
Cost picks the column: misses kill, so recall headlines. Decompose accuracy into its majority counts — the echo arithmetic (95 + hits)/100 exposes the headline as majority applause.
:::

::: quiz AUC 0.93 but deployed precision 0.45; rival AUC 0.87 with precision 0.78 at its dot. Spam folder — ship whom, and what does this prove about AUC?
() Higher AUC ships, always
(*) Rival: AUC grades ranking across thresholds, the folder pays per false alarm — the operating dot's precision rules. Proof: areas integrate over never-used regions; dots decide deployments
() AUC equals precision at the threshold
() Neither ships below 0.95 AUC
::: explanation
Area versus dot: validate-rank by AUC, cost-pick the threshold, compare deployed precision/recall. The crossing (better area, worse dot) is the lesson — report both, ship the dot.
:::
