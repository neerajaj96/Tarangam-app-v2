---
id: m4_05_resampling_bias_variance_tradeoff
courseCode: OECST614
module: 4
sequence: 5
title: 'Bootstrapping, Cross-Validation & Bias–Variance'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Resample honest error bars with bootstrap arithmetic
  - Tile k folds so all data tests exactly once
  - Prescribe from the tradeoff equation every model obeys
concepts:
  - bootstrapping
  - cross-validation
  - bias-variance tradeoff
prerequisites:
  - m2_03_overfitting_lasso_ridge
  - m2_04_train_test_validation_splits
examRelevance: medium
tags:
  - evaluation
  - resampling
---
# Bootstrapping, Cross-Validation & Bias–Variance

**Honest error bars from resampled data — the $63.2$ percent bootstrap, $k$-fold CV arithmetic, and the tradeoff equation every model obeys.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Rehearsal by Reshuffling
One dataset is one rehearsal audience. **Bootstrapping** clones the audience list with replacement (some faces repeat, $\approx 36.8$ percent never get invited) to feel sampling wobble. **Cross-validation** rotates the opening-night crowd: every sample stars in test exactly once across $k$ folds. Both buy honesty that single splits (M2.4) cannot afford on small data.
:::

The bias–variance equation then explains *why* the honest numbers move: simplicity blinds (bias), complexity wobbles (variance), noise floors everything.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Resampling arithmetic

Bootstrap from $n$ samples: each draw misses a given point with probability $(1-1/n)^n \to 1/e \approx 0.3679$, so $\approx 63.2$ percent appear at least once. $k$-fold CV: split into $k$ equal folds, train on $k-1$, test on the held-out fold, rotate and average — $5$-fold on $100$ samples means five $80/20$ runs. Leave-one-out is $k = n$ (thorough, pricey).

### 2.2 The tradeoff

Expected test error $= \text{bias}^2 + \text{variance} + \text{noise}$. Rising capacity lowers bias but raises variance — the U-curve behind M2.3's $\lambda$ tuning and every degree/depth decision in the course.

::: callout-formula KTU Formula Vault: Honest Errors
Bootstrap keeps $\approx 63.2$ percent unique · $k$-fold: all $n$ tested once, average the $k$ scores · error $=$ bias$^2$ $+$ var $+$ noise · capacity trades bias for variance.
:::

CV still tunes (folds are validation-grade); the truly final verdict needs held-out test or nested CV — tuning on CV-mean then reporting it replays the M2.4 leakage at higher resolution.

::: callout-pitfall CV-Mean-as-Final Fraud
Reporting the best fold's score (or the tuned CV-mean) as final performance cherry-picks noise. Average all folds for tuning, then judge the frozen model on untouched test — honesty has an order of operations.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$100$ labelled welds. (a) How many distinct welds does one bootstrap resample hold on average? (b) Lay out 5-fold CV sizes. (c) A degree-2 fit shows bias$^2 = 4$, variance $= 1$, noise $= 0.5$; degree-12 shows bias$^2 = 0.2$, variance $= 9$, noise $= 0.5$. Which generalizes?
:::

::: step [Step 2: Execution] Counting and Comparing
(a) Miss probability per weld $(99/100)^{100} \approx 1/e \approx 0.3660$, so present $\approx 63.4$ distinct welds (rest duplicates). (b) Five folds of $20$: each run trains $80$, tests $20$, every weld tested exactly once. (c) Totals: degree-2 $= 4 + 1 + 0.5 = 5.5$; degree-12 $= 0.2 + 9 + 0.5 = 9.7$. Degree-2 wins despite higher bias.
:::

::: step [Step 3: Conclusion] Final Result
$\approx 63$ unique per bootstrap, $80/20 \times 5$ CV design, degree-2's $5.5$ beats degree-12's $9.7$. Variance explosions ($9$) swamp bias savings ($3.8$) — the tradeoff's standard punchline, quantified.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Bootstrap Arithmetic
$n = 1000$. Expected fraction of unseen points per resample?
(A) $0$ percent, all appear
(*B) $\approx 36.8$ percent, since $(1-1/1000)^{1000} \approx 1/e$ — the large-$n$ limit that makes $63.2$ the working number at any scale
(C) $50$ percent by symmetry
(D) $100$ percent duplicated
::: explanation
The $(1-1/n)^n \to 1/e$ limit is why bootstrap math is scale-free: $n = 100$ and $n = 10^6$ both leave about a third of points out-of-bag per round.
:::

::: quiz Q2: Fold Design
$120$ samples, $6$-fold CV. Train/test sizes per run and coverage?
(A) $100/20$, some untested
(*B) $100/20$ per run with every sample tested exactly once across $6$ rotations — full coverage is the design guarantee, not luck
(C) $60/60$ random halves
(D) $119/1$ always
::: explanation
$120/6 = 20$ per fold; each rotation holds out a fresh $20$ and trains the other $100$. Six disjoint test folds tile the dataset — that tiling is CV's contract.
:::

::: quiz Q3: Tradeoff Prescription
Bias$^2 = 9$, variance $= 1$ (underfit) versus bias$^2 = 1$, variance $= 9$ (overfit). Moves?
(A) Same fix both: more capacity
(*B) First needs capacity (features, depth, smaller $\lambda$); second needs discipline (regularize, bag, more data) — error totals tie at $10$ but medicines oppose
(C) Both need more data only
(D) Noise reduction fixes both
::: explanation
Equal totals, opposite compositions: blindness versus wobble. Diagnose by decomposition, prescribe by component — capacity for bias, discipline for variance.
:::
