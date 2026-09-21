---
id: m4_99_practice_lab_unsupervised_ensemble_drills
courseCode: PCCST503
module: 4
sequence: 99
title: 'Module 4 Practice Lab: Unsupervised & Ensemble Drills'
difficulty: intermediate
estimatedMinutes: 14
learningObjectives:
  - Fight one dataset into three answers across k choices from first principles
  - Dodge scaling traps that bite raw numbers
  - Continue AdaBoost round two with normalized weights
  - Prescribe forests versus boosting versus single trees honestly
concepts:
  - k wars
  - scaling traps
  - ensemble prescription
prerequisites:
  - m4_01_clustering_kmeans
  - m4_02_hierarchical_clustering
  - m4_03_pca_dimensionality_reduction
  - m4_04_ensemble_bagging_random_forests
  - m4_05_boosting_adaboost
examRelevance: high
tags:
  - unsupervised-ensembles
  - m4-lab
---
# Module 4 Practice Lab: Unsupervised & Ensemble Drills

**How to use this lab as a beginner: read method bias before tuning K, ask units before trusting variance, and match ensembles to noise plus stakeholders.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

Beginner protocol: problem first, then data and goal, then method. Disagreement between honest methods is geometry talking, not bugs.

::: toggle How do I run the k-wars comparison (one dataset, three answers)?
Fix the dataset (six blob points), run all three: k-means $K=2$ (flat commitment, WCSS 4), single-linkage dendrogram (chains through bridges), complete-linkage (quarantines bridges). Then poison with one bridge point at 6.5 and rerun all three: k-means absorbs it (means shift slightly), single-linkage chains through it (one progressive cluster), complete holds the split. Readout: same data, three structures — the method is a shape prior. Report all three plus which prior your domain believes, never the single flattering run.
:::

::: toggle Verify the round-2 arithmetic: `ε₂`, `α₂`, mass moves
$D_2 = \{1/6,1/6,1/6,1/2\}$ (three light, one heavy). Round-2 stump fixes the heavy point, misses one light: $\epsilon_2 = 1/6 \approx 0.167$ (missed mass only). $\alpha_2 = \tfrac12\ln((1-1/6)/(1/6)) = \tfrac12\ln 5 \approx 0.805$ (louder than round 1's 0.549 — harder distribution solved earns bigger voice). Newly-missed light point: $1/6 \times e^{0.805} \approx 1/6 \times 2.24$ (grows); thrice-correct points shrink by $e^{-0.805}$; renormalise to sum 1. Attention compounds on survivors — curriculum on clean structure, poison-chasing on mislabels.
:::

### Scenario 1: The k Wars (One Dataset, Three Answers)

Well-separated blobs (M4's six points): k-Means $K=2$ converges instantly (Within-Cluster Sum of Squares (WCSS) 4); hierarchical single-linkage dendrogram shows the same split with a huge height gap to the final merge; elbow screams $K=2$. Now poison it: add a bridge point at 6.5. k-Means $K=2$ still splits cleanly (means absorb it); single-linkage *chains* through the bridge (one progressive cluster); complete-linkage holds the split. Same data plus one point, three structures — the method *is* a shape prior, and the bridge point is the experiment that reveals yours. Partitional k-means commits flat $K$ upfront; hierarchical defers the cut until gaps are visible.

### Scenario 2: The Scaling Trap (Numbers That Bite)

Income (₹10k units: values ~3–12) vs. age (20–60): raw Principal Component Analysis (PCA) crowns income PC1 by unit size alone. Standardize (z-scores): covariance becomes correlation — PC1 now reports *joint* spread-shape, often an age-income axis the raw run buried. Drill: always ask "in what units is this variance?" before trusting any eigendecomposition — the answer decides whether PC1 is discovery or bookkeeping.

### Scenario 3: Ensemble Prescription Desk

Three patients: (a) deep trees, noisy labels, accuracy wanted → **random forest** (averaging dilutes poison; boosting would frame it). (b) Clean data, weak linear baseline, need max accuracy → **boosted trees / AdaBoost-style** (bias-killing sequential focus; margins keep fattening past zero train error on clean data, with overfit risk on noise). (c) Regulator demands reasons → **single shallow tree** (forests vote inscrutably; a depth-4 tree testifies). Prescription = noise regime + bias profile + stakeholder, in that order. Qualification: forests plateau rather than U-turn given honest validation; boosting needs early stopping on dirty data.

### Scenario 4: AdaBoost Round Two (Continuing M4's Trace)

After round 1: $D_2 = \{1/6, 1/6, 1/6, 1/2\}$ (one heavy miss). Round-2 stump fixes the heavy point but misses one light point: weighted error $\epsilon_2 = 1/6 \approx 0.167$. Vote $\alpha_2 = \tfrac12\ln((5/6)/(1/6)) = \tfrac12\ln 5 \approx 0.805$ — *louder* than round 1's $0.549$ (harder distribution solved earns bigger voice). Updates: the newly-missed light point $\times e^{0.805} \approx 2.24$; the thrice-correct points shrink again. Attention compounds on whatever survives — boosting's curriculum in round two of four points, useful on clean structure and dangerous on mislabels.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| Partitional k-Means vs. hierarchical output | Fixed-$K$ flat partition (rerun per $K$) vs. full dendrogram (cut after seeing) |
| Single vs. complete linkage | Chains through bridges vs. quarantines them (shape priors, opposite) |
| Elbow (k-Means) vs. scree (PCA) | WCSS-vs-$K$ kink vs. eigenvalue drop-off — same kink-reading instinct |
| Variance vs. signal (PCA) | Kept spread (reconstruction) vs. class information (may live in the tail) |
| Standardize vs. raw PCA | Shape-driven components vs. unit-driven artifacts |
| Bagging vs. boosting-coated trees | Parallel variance averaging vs. sequential bias/margin attack with noise limits |
| OOB vs. test error | Free ~37% juries (monitoring) vs. untouched folds (verdicts) |
| $\alpha$ small vs. large | Weak round (quiet vote) vs. dominant round (loud vote) — earned, never set |
| Train-zero + test-falling (boosting, clean) | Margins fattening past verdict saturation on clean data (theory-backed, not luck; noisy data differs) |
| More trees (forests) vs. more rounds (boosting) | Plateau under honest validation (variance only shrinks) vs. eventually overfits noise (attention compounds on lies) |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz Single-linkage chains two blobs through one bridge point while k-Means (K=2) splits them cleanly. Both ran "correctly." What does this disagreement prove about clustering?
() Single-linkage has a software bug in its distance code
(*) Clustering outputs encode the method's shape prior (chain-following vs. spherical Voronoi) — with no ground-truth labels, "correct" means "faithful to stated assumptions," and the bridge point is a prior-detector, not a tiebreaker
() k-Means is universally correct and linkage methods are obsolete
() The bridge point must be deleted as an outlier before any clustering
::: explanation
Unsupervised = no answer key: each method *defines* clusterhood differently (connectivity vs. compactness). Disagreement under bridge-noise is the methods honestly reporting different geometries — choose by which geometry the downstream task needs, and say so explicitly.
:::

::: quiz PCA on raw income/age crowns income PC1; standardized, the lead axis mixes both. A teammate ships the raw version "because it explains more variance." Refute precisely.
() Raw variance is always the right quantity; ship it
(*) Raw "variance" sums squared *units* (rupees² vs years²) — a unit contest, not information; standardization converts to shape (correlation), so PC1 reports joint spread instead of measurement conventions
() Standardization is forbidden before PCA by definition
() Income genuinely contains all information in every dataset
::: explanation
Eigendecomposition maximizes *whatever variance it's given* — feed it unit artifacts, get unit artifacts crowned. z-scores make covariance dimensionless (correlation), so surviving structure is geometric truth, not bookkeeping. "More variance explained" means nothing until variance means something.
:::

::: quiz Round-2 AdaBoost earns α₂ ≈ 0.805 versus round-1's α₁ ≈ 0.549 on the same four points. What does the louder vote signify, and what danger grows alongside it?
() Louder votes mean round 1 was worthless and should be deleted
(*) α₂ > α₁ means round 2 solved a *harder* weighted distribution (heavy miss fixed) — earned authority; danger: attention compounds on persistent misses, so mislabeled points would now command enormous weight (noise memorization in progress)
() α values must decrease monotonically or the algorithm is broken
() Louder votes indicate overfitting has already occurred
::: explanation
$\alpha = \tfrac12\ln((1-\epsilon)/\epsilon)$ prices *difficulty conquered*: $\epsilon_2 = 1/6$ beats $\epsilon_1 = 1/4$, hence louder voice. But the same compounding that rewards genuine difficulty *worships* noise — round-3+ weights on lies grow exponentially. Volume tracks conquest, blind to truth.
:::

::: quiz Forests can grow many trees safely under honest validation while AdaBoost must stop early on noisy data. One mechanism per method explains both — state them.
() Forests use less memory per tree, so more fit
(*) Forests average independent-ish votes (variance-only effect given honest validation: more trees smooth and plateau, bias untouched — nothing to overfit *toward*); boosting reweights onto residuals each round (on noise, residuals *are* lies, compounded exponentially into memorization)
() AdaBoost trees are deeper than forest trees by rule
() Forests never look at labels, avoiding the issue
::: explanation
Averaging can't invent bias (many votes for the same wrong answer stay wrong, never worse, under honest validation); sequential reweighting *chases* whatever errs — truth on clean data (margins fatten, test improves), lies on noisy data (weights explode on poison). Same rounds, opposite dynamics: smoothing vs. pursuit.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (linkage choice and α-meaning lead); single-round AdaBoost arithmetic.
* **7 Marks:** Method-selection scenarios with justification, PCA scaling autopsies, or multi-round boosting traces.
:::

### Essay Question 1 (7 Marks)
**Q: Points {1,2,3,10,11,12} plus a bridge point at 6.5. Predict k-Means (K=2), single-linkage, and complete-linkage outcomes, and explain each from the method's bias.**

**Model Answer:** k-Means: means settle near {2-ish, 11-ish}; the bridge at 6.5 sits at an *exact* tie (|6.5−2| = |6.5−11| = 4.5) — decided by the implementation's tie-break (≤ joins left), a coin-flip elevated to arithmetic. Single-linkage: chains left→bridge→right progressively (nearest-pair stepping stones) into one advancing front. Complete-linkage: bridge's farthest-pair distances stay large — quarantined longest, original split preserved. Three methods, three honest geometries (plus one honest coin-flip); pick by downstream need (separation vs. connectivity).

### Essay Question 2 (7 Marks)
**Q: Continuing M4's AdaBoost trace (D₂ = three × 1/6, one × 1/2): round 2 fixes the heavy point but misses a light one. Compute α₂, the new distribution emphasis, and explain what round 3 will prioritize.**

**Model Answer:** $\epsilon_2 = 1/6$; $\alpha_2 = \tfrac12\ln 5 \approx 0.805$ (louder than $\alpha_1 = 0.549$ — harder distribution conquered). The newly missed light point multiplies by $e^{0.805} \approx 2.24$; solved points shrink. Round 3 faces a world dominated by *two generations* of survivors — attention compounding exactly as designed on clean data, exactly as dangerous on mislabeled data (state which regime applies before praising the mechanism).
