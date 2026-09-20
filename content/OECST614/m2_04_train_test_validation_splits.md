---
id: m2_04_train_test_validation_splits
courseCode: OECST614
module: 2
sequence: 4
title: 'Train, Test & Validation Splits Done Right'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Fit on train, tune on validation and judge once on test
  - Stop test-reuse leaks before they flatter scores
  - Stratify rare classes with seventy-fifteen-fifteen defaults
concepts:
  - data splits
  - test leakage
  - stratification
prerequisites: []
examRelevance: medium
tags:
  - evaluation
  - data-splits
---
# Train, Test & Validation Splits Done Right

**Three buckets with three jobs — fit on train, tune on validation, judge once on test — plus stratification so rare classes survive the split.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Dress Rehearsal vs Opening Night
**Train** is rehearsal (learn lines), **validation** is the preview audience (adjust pacing), **test** is opening night (one performance, no retakes). Tuning on the test set is inviting critics to rehearsals and then claiming surprise at rave reviews — the grade is leaked, not earned.
:::

Leakage optimism is the same villain behind the cross-validation topic in M4.5 — learn the bucket discipline here, generalize it there.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Bucket rules

Standard split around $70/15/15$ (train/val/test). Fit parameters on train, pick hyperparameters ($k$, $\lambda$, depth) on validation, report final performance on test **once**. Every reuse of test for decisions leaks optimism into the headline number.

### 2.2 Stratification

Random splits can strand rare classes: with $10$ percent positives, a $200$-sample test split should hold about $20$ positives. **Stratified** sampling enforces class ratios per bucket so tiny classes are judged, not accidentally erased.

::: callout-formula KTU Formula Vault: Splits
Train fits · val tunes · test judges once · reuse of test leaks · stratify rare classes · $70/15/15$ is the default recipe.
:::

Small data breaks fixed splits (validation too tiny to trust) — that is precisely when M4.5's $k$-fold CV replaces the single split.

::: callout-pitfall Tuning on Test
Each test-guided tweak (trying three depths, keeping the best test score) spends the test set as a second validation set. The reported number then measures selection luck plus skill — always optimistic, never honest.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A fault dataset has $1{,}000$ motors with $10$ percent faulty. Apply a stratified $70/15/15$ split and state each bucket's size and expected faulty count.
:::

::: step [Step 2: Execution] Splitting Fairly
Train: $700$ motors, faulty $\approx 70$. Validation: $150$ motors, faulty $\approx 15$. Test: $150$ motors, faulty $\approx 15$. Stratification guarantees the faulty minority appears in every bucket at its $10$ percent rate instead of vanishing from some by chance.
:::

::: step [Step 3: Conclusion] Final Result
$700/70$, $150/15$, $150/15$ (size/faulty). Fifteen faulty test motors is a thin but usable verdict — with only $30$ faulty motors total, abandon fixed splits for cross-validation (M4.5).
:::

::: anim split-buckets Stratify or the Minority Vanishes
Watch the three buckets fill at the 10 percent rate — 700/70, 150/15, 150/15 — since unstratified rare classes vanish by chance, not by verdict.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Leakage Drill
A student tries $5$ depths, keeps the one with the best test accuracy, and reports it. Problem?
(A) None, best is best
(*B) The test set became a tuning set, so the reported accuracy mixes selection luck with skill and reads optimistically high
(C) Five depths are too few
(D) Accuracy is the wrong metric always
::: explanation
Choosing by test score spends the test budget. Honest protocol tunes on validation and touches test once — every extra peek inflates the headline.
:::

::: quiz Q2: Stratification Arithmetic
$500$ samples, $4$ percent defective, test bucket $100$. Unstratified risk?
(A) None, randomness is always fair
(*B) Expected defectives are just $4$, and random splits can easily deliver $1$ or $0$, leaving nothing real to judge — stratification locks in $\approx 4$
(C) Stratification removes all defectives
(D) Test size should be $0$
::: explanation
Rare classes plus small buckets equal lottery verdicts. Stratifying pins each bucket near its fair share so the metric measures the model, not the draw.
:::

::: quiz Q3: Bucket Roles
Where do $k$ (KNN) and $\lambda$ (RIDGE) get chosen?
(A) Training set, by lowest train error
(*B) Validation set, because train error always favours the most complex option ($k = 1$, $\lambda = 0$) and cannot detect overfitting
(C) Test set, it is the most honest
(D) No data needed, guess both
::: explanation
Train error is minimized by memorization, so it elects $k = 1$ and $\lambda = 0$ every time. Only held-out validation penalizes complexity — that penalty is the entire point.
:::
