---
id: m4_04_mds_ensemble_bagging_boosting
courseCode: OECST614
module: 4
sequence: 4
title: 'MDS, Bagging & Boosting Ensembles'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Compress geometry with MDS distance preservation
  - Vote away variance with bootstrap bagging
  - Chain away bias with AdaBoost alpha weights
concepts:
  - multidimensional scaling
  - bagging
  - boosting
prerequisites:
  - m4_01_similarity_hierarchical_clustering
examRelevance: medium
tags:
  - ensembles
  - mds-bagging-boosting
---
# MDS, Bagging & Boosting Ensembles

**Keep the distances, multiply the models — MDS compresses by preserving geometry, bagging votes away variance, boosting chains away bias.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Map From Mileages, Jury From Judges
**MDS** redraws a map from a mileage table alone: place points so pairwise distances survive into few dimensions. **Bagging** polls many noisy judges trained on resampled electorates (variance cancels in the vote). **Boosting** coaches one successor after another, each drilled on its predecessor's mistakes (bias drains down the chain).
:::

Bagging versus boosting is the favourite contrast 3-marker: parallel variance-cure against sequential bias-cure — same word "ensemble", opposite medicine.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 MDS in one paragraph

Given dissimilarities $d_{ij}$, MDS finds low-D coordinates minimizing mismatch (stress) between true and embedded distances. Classical MDS on Euclidean distances recovers PCA's answer — geometry preserved, axes rotated.

### 2.2 Bagging and boosting mechanics

Bagging: bootstrap $B$ datasets, train $B$ models (deep trees welcome), majority-vote or average. Boosting (AdaBoost): weight samples, train weak learner, compute weighted error $err$, learner weight $\alpha = \tfrac{1}{2}\ln((1-err)/err)$, upweight mistakes by $e^{\alpha}$, downweight hits by $e^{-\alpha}$, renormalize, repeat; final vote weighted by $\alpha$s.

::: callout-formula KTU Formula Vault: Ensembles
MDS preserves $d_{ij}$ (stress ↓) · bagging: bootstrap + unweighted vote, variance ↓ · AdaBoost $\alpha = \tfrac{1}{2}\ln((1-err)/err)$, mistakes × $e^{\alpha}$, hits × $e^{-\alpha}$ · boosting bias ↓.
:::

Bagging loves unstable learners (trees); boosting overfits noise if run too long — mistakes that are mislabels get amplified round after round.

::: callout-pitfall Boosting-the-Noise Trap
AdaBoost concentrates weight on persistent mistakes, so mislabeled outliers end up commanding the ensemble. Blind "more rounds help" on noisy data is how boosting memorizes garbage with confidence.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
AdaBoost round: $10$ samples at weight $0.1$ each; weak learner misses $3$. Compute $\alpha$, the unnormalized new weights, the normalizer $Z$, and the final weights — verifying they sum to $1$.
:::

::: step [Step 2: Execution] Reweighting the Electorate
Weighted error $err = 0.3$. Voter weight $\alpha = 0.5\ln(0.7/0.3) = 0.5\ln(2.3333) = 0.5(0.8473) = 0.4236$. Hits: $0.1e^{-0.4236} = 0.1(0.6547) = 0.06547$ each (7 of them). Misses: $0.1e^{0.4236} = 0.1(1.5275) = 0.15275$ each (3 of them). Normalizer $Z = 7(0.06547) + 3(0.15275) = 0.45829 + 0.45825 = 0.91654$. Final: hits $0.06547/0.91654 \approx 0.07143$, misses $0.15275/0.91654 \approx 0.16667$. Sum: $7(0.07143) + 3(0.16667) = 0.50001 + 0.50001 \approx 1.0$.
:::

::: step [Step 3: Conclusion] Final Result
$\alpha \approx 0.4236$; misses rise $0.1 \to 0.1667$, hits fall $0.1 \to 0.0714$. Next learner faces an electorate where old mistakes shout — the sequential pressure that drains bias round by round.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Medicine Matching
High-variance deep trees versus high-bias stumps. Prescriptions?
(A) Boost the trees, bag the stumps
(*B) Bag the trees (vote cancels variance) and boost the stumps (chain drains bias) — each ensemble cures the opposite disease
(C) Both need bagging only
(D) Neither needs ensembles
::: explanation
Bagging averages independent wobbles away; boosting sequentially repairs systematic blindness. Swapped prescriptions (boosting wobbly trees into noise-fitting, bagging blind stumps into confident blindness) waste both.
:::

::: quiz Q2: Alpha Extremes
Weak learner scores $err = 0.5$ exactly. $\alpha$ and meaning?
(A) $\alpha = 1$, strong voter
(*B) $\alpha = 0.5\ln(1) = 0$ — a coin-flip voter earns zero voice in the final committee, correctly contributing nothing
(C) $\alpha$ infinite, perfect voter
(D) Negative $\alpha$, invert it
::: explanation
$(1-0.5)/0.5 = 1$, $\ln 1 = 0$. Chance-level performance buys silence — and below $0.5$ would buy negative weight (used, flipped, in binary AdaBoost theory).
:::

::: quiz Q3: MDS vs PCA
Euclidean distances, classical MDS, PCA on the same data. Relation?
(A) Unrelated methods
(*B) Same embedding up to rotation — classical MDS on Euclidean $d_{ij}$ recovers the PCA coordinates, since both preserve the same inner-product geometry
(C) MDS needs labels, PCA does not
(D) PCA preserves distances, MDS preserves labels
::: explanation
Both diagonalize the same centred Gram structure; PCA arrives via features, MDS via distances. Mileage-table input, PCA-grade map output — the identity examiners quote.
:::
