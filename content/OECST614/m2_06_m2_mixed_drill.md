---
id: m2_06_m2_mixed_drill
courseCode: OECST614
module: 2
sequence: 6
title: 'M2 Drill: Classify, Regularize & Measure'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Sprint Bayes scores, neighbour votes and penalties
  - Keep bucket discipline with tests touched once
  - Price full metric sets without imbalance traps
concepts:
  - classify-regularize-measure chain
  - bucket discipline
prerequisites:
  - m2_01_naive_bayes_classifier
  - m2_02_knn_lazy_learning
  - m2_03_overfitting_lasso_ridge
  - m2_04_train_test_validation_splits
  - m2_05_classification_regression_metrics
examRelevance: high
tags:
  - evaluation
  - m2-drill
---
# M2 Drill: Classify, Regularize & Measure

**Bayes scores, neighbour votes, penalty arithmetic, bucket discipline, and full metric sets — M2 as reflexes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Five-Station Circuit
Score classes, poll neighbours, discipline weights, guard the buckets, price the verdict. M2.5's confusion matrix is the station every other station reports into.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Station kit

$P(c)\prod P(x_i \mid c)$ with smoothing · $\sqrt{\sum(x_i-q_i)^2}$ votes, scale first · train ↓ val ↑ means overfit; LASSO selects, RIDGE shrinks · train fits, val tunes, test judges once · Prec/Rec/F1 bracket, AUC above diagonal, MAE/RMSE/$R^2$.

::: callout-formula KTU Formula Vault: M2 Circuit
Multiply (Bayes) → vote (KNN) → discipline (penalty) → split (buckets) → price (metrics). Prior included, axes scaled, test touched once.
:::

::: callout-exam KTU Exam Focus
M2's 9-markers love one confusion matrix feeding four ratios, or one KNN query with a tie plus a scaling remark. Write every denominator explicitly — half the marks live in $(TP+FP)$ vs $(TP+FN)$ discipline.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Prior $P(S) = 0.4$; $P(w \mid S) = 0.5$, $P(w \mid H) = 0.2$. Mail with $w$. (a) Classify. (b) A KNN query at $(0,0)$ sees $(1,0) = +$, $(0,1) = -$, $(2,0) = -$. $k = 3$ verdict? (c) Weights $[1.0, -3.0]$, $\lambda = 2$: both penalties?"
:::

::: step [Step 2: Execution] Full Circuit
(a) Spam $0.4 \times 0.5 = 0.2$; ham $0.6 \times 0.2 = 0.12$; spam wins with $0.2/0.32 = 0.625$. (b) Distances $1$, $1$, $2$: votes $+$,$-$,$-$ → $-$ wins $2$-to-$1$ (note the $1$-$1$ tie at distance $1$ inside). (c) LASSO $= 2(1 + 3) = 8$; RIDGE $= 2(1 + 9) = 20$.
:::

::: step [Step 3: Conclusion] Final Result
Spam ($0.625$), KNN $-$ ($2$-vs-$1$), penalties $8$ and $20$. Each station's certificate held: posterior normalized, distances sorted, $\lambda$ multiplied on both penalties.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$P(S) = 0.2$, $P(w \mid S) = 0.9$, $P(w \mid H) = 0.3$. Mail with $w$. Verdict?
(A) Spam, likelihood $0.9$ dominates
(*B) Spam $0.18$ vs ham $0.24$, so ham wins — the $0.8$ prior outvotes the strong but lonely likelihood, $0.24/0.42 \approx 0.571$
(C) Always spam with $0.9$
(D) Tie at $0.5$
::: explanation
$0.2 \times 0.9 = 0.18$ against $0.8 \times 0.3 = 0.24$. Base rates beat bright clues — the prior-strikes-back pattern examiners reuse yearly.
:::

::: quiz Q2: Mixed Drill
Train $0.3$, val $11.2$ after adding degree-12 features. Prescription?
(A) Add degree-20 for more power
(*B) Regularize (raise $\lambda$) or cut capacity, because collapsing train error with exploding validation error is textbook overfitting
(C) Collect no more data ever
(D) Tune on the test set instead
::: explanation
Divergence diagnoses memorization; discipline (penalty, fewer features, more data) is the cure. More capacity feeds the disease it pretends to treat.
:::

::: quiz Q3: Mixed Drill
$TP = 10$, $FP = 5$, $FN = 5$, $TN = 80$. Precision, recall, accuracy?
(A) $0.5$, $0.5$, $0.5$
(*B) Precision $10/15 \approx 0.667$, recall $10/15 \approx 0.667$, accuracy $90/100 = 0.9$ — accuracy flatters via $80$ easy negatives while class metrics tell the working story
(C) All three equal $0.9$
(D) F1 exceeds both inputs
::: explanation
Symmetric $5$-$5$ errors make precision equal recall here; $80$ true negatives inflate accuracy. Report class metrics alongside accuracy, never instead of them.
:::
