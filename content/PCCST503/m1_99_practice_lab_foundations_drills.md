---
id: m1_99_practice_lab_foundations_drills
courseCode: PCCST503
module: 1
sequence: 99
title: 'Module 1 Practice Lab: Foundations Drills'
difficulty: intermediate
estimatedMinutes: 14
learningObjectives:
  - Triage cases to paradigms inside sixty seconds each from first principles
  - Track shifting estimates from MLE through MAP exactly
  - Reject too-good fits with held-out and cross-validation discipline
  - State LASSO versus RIDGE and k-fold mechanics in one paragraph each
concepts:
  - triage sprint
  - shifting estimates
  - overfit rejection
prerequisites:
  - m1_01_ml_definition_paradigms_and_types
  - m1_02_probability_mle_map_estimation
  - m1_03_linear_regression_least_squares
  - m1_04_multiple_regression_model_assessment
examRelevance: high
tags:
  - foundations
  - m1-lab
---
# Module 1 Practice Lab: Foundations Drills

**How to use this lab as a beginner: triage paradigms from feedback type, move estimates from MLE to MAP with arithmetic, and reject memorised fits with held-out grades.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

Beginner protocol for every scenario below. First name the problem in one sentence. Then name the data (pairs, bare inputs, or rewards). Then name the goal and ruler. Then name the method. Only then compute.

### Scenario 1: Triage Sprint (60 seconds per case)

For each, name paradigm plus task type plus Task, Experience, Performance (T, E, P) skeleton: (a) credit-card fraud flags from labeled histories; (b) segmenting 50,000 unlabeled support tickets by complaint theme; (c) elevator dispatcher learning from passenger wait-time penalties; (d) predicting delivery Estimated Time of Arrival (ETA) in minutes from distance and traffic features.

Answers: (a) supervised classification (T decide, E labeled transactions, P held-out precision and recall); (b) unsupervised clustering (no labels exist — k-means territory, Module 4); (c) Reinforcement Learning (RL) (no correct dispatch shown, only delay penalties; P is expected wait); (d) supervised regression (continuous ETA, squared loss). Anyone answering (b) with "classification" skipped the label check — the lab's core reflex.

Tiny check: cover the answers, ask "does each example show the right answer?" If yes, supervised. If no answers at all, unsupervised. If only episode scores, RL.

### Scenario 2: The Shifting Estimate

A coin shows 7 heads in 10 flips. MLE says 0.7. A skeptic's prior (fair-ish, strength about 20 flips) pulls MAP toward about 0.55. Now 1,000 flips show 630 heads: MLE 0.63, MAP about 0.63 — prior washed out. Moral in numbers: with $n=10$ the prior owns the answer; with $n=1,000$ the data does. Exam phrasing: "state how MAP behaves as $n \to \infty$" — converges to MLE (prior weight goes to 0 relative to data precision).

LASSO versus RIDGE in one paragraph: if those coin beliefs were regression weights, a Gaussian prior would give RIDGE shrinkage (all weights small, none zero), while a Laplace prior would give Least Absolute Shrinkage and Selection Operator (LASSO) sparsity (many exact zeros). Same data, different prior shape, different solution texture.

::: toggle Why does MAP `converge to MLE` as `n → ∞`?
MAP is a precision-weighted average: data weight `n/σ²` vs prior weight `1/τ²`. At `n = 10` the prior's fixed weight still counts; at `n = 1,000` the data weight is 100× louder and the prior's share rounds to zero.
Tiny numbers: skeptic's prior (~20 flips strong) drags `0.7` to `~0.55` at `n = 10`, but `0.63` stays `~0.63` at `n = 1,000` — evidence drowns belief.
Exam moral: beliefs matter most exactly when data is scarcest; with big `n`, MAP and MLE agree.
:::

### Scenario 3: The Too-Good Fit

A teammate's degree-12 polynomial on 15 points reports train R-squared (R²) $= 1.0$ and demands deployment. Your audit: held-out $R^2 = -0.4$ (worse than the mean!). Diagnosis: variance disease (memorisation); prescription: cut degree, add RIDGE penalty (Gaussian prior!), or gather data — not more features. The two-grade certificate (train plus held-out) from M1 is the entire diagnostic.

::: toggle Why does one `zero` veto a whole Naive Bayes class?
A class score is a product: prior `×` likelihood `×` likelihood `…`. One factor of `0` (an unseen word) annihilates every other factor — the spammiest remaining words cannot outvote nothing.
Smoothing replaces never-seen (`0`) with rare-but-possible (small positive): a veto becomes a weak vote. Delete-the-word instead and future mail containing it becomes unscorable evidence.
Rule of thumb: products amplify zeros absolutely — always smooth counts before multiplying.
:::

Cross-validation mechanics in one paragraph: do not trust one split's decimals. In k-fold Cross-Validation (CV), rotate the validation fold so each point validates once and average. For final claims after degree or penalty selection, nest: inner loop picks, outer loop grades the picker on untouched data.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| Likelihood vs. posterior | $P(D\|\theta)$ (data fixed, vary θ) vs. $P(\theta\|D)$ (belief about θ — needs a prior) |
| MLE vs. MAP | Data-only peak vs. prior-penalized peak; coincide as $n \to \infty$ |
| Unbiased vs. MLE variance | $n-1$ corrects bias; MLE uses $n$ (peak, not fairness) |
| LASSO vs. RIDGE | Laplace prior, sparse zeros vs. Gaussian prior, dense shrinkage; strength chosen by CV |
| Single split vs. k-fold vs. nested | One lucky grade vs. rotated average vs. honest grade of selection |
| Regression vs. classification | Continuous $Y$ (closeness) vs. discrete $Y$ (buckets); different losses, different machinery |
| k-Nearest Neighbours (k-NN) train vs. test accuracy | $k=1$ trains at 100% always (memorization); only held-out counts |
| Sigmoid output vs. decision | $\sigma \in (0,1)$ confidence; boundary at $w^Tx = 0$ (still linear!) |
| Surrogate vs. 0/1 loss | Train the smooth stand-in, judge with 0/1 accuracy |
| Bias vs. variance | Rigid-wrong vs. wiggly-unstable; test U-curve finds the middle |
| Train $R^2$ vs. test $R^2$ | Rises-by-construction vs. honest grade; report the second |
| Batch vs. Stochastic Gradient Descent (SGD) vs. mini-batch | $O(nd)$ smooth vs. $O(d)$ noisy-fast vs. Graphics Processing Unit (GPU) default middle |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz A startup has 200 labeled medical images and 2 million unlabeled ones, and needs a tumor detector fast. What is the defensible plan, and which paradigm trap must it avoid?
() Train supervised logistic regression on all 2,000,200 images by inventing labels
(*) Supervised model on the 200 labels (possibly with augmentation/transfer), optionally semi-supervised help from the unlabeled pool — and never report accuracy measured on the 200 training images as performance
() Unsupervised clustering alone, calling clusters "diagnoses" without validation
() Skip modeling; 200 images can never support any learning
::: explanation
Data budget dictates method: 200 labels ⇒ simple supervised models + heavy validation (generative NB converges fast per Ng–Jordan); unlabeled millions help only via semi-supervised/pretraining scaffolding. The traps: inventing labels (garbage supervision) and training-accuracy reporting (memorization theater). Honest uncertainty beats confident fiction in medical ML.
:::

::: quiz Two models for the same task: A has train R² 0.99 / test R² 0.97; B has train 0.85 / test 0.84. A teammate ships A "because 0.97 > 0.84." Give the full analysis.
() Agree — higher test always wins unconditionally
(*) A generalizes slightly better *here* (0.97 > 0.84 honest grades), but its 0.02 gap vs B's 0.01 hints higher variance — check complexity, stability across folds, and whether A's edge survives nested validation before crowning it; never decide on one split's decimals
() Ship B — lower train score always means better generalization
() R² comparisons are meaningless across models
::: explanation
Compare *honest grades* (test vs test): A leads. But mind the gaps (variance tell), fold-stability (one split lies), and complexity cost (simpler B may be the engineering winner). Model selection is nested validation + judgment, not decimal taste-testing.
:::

::: quiz Gradient descent on a convex logistic loss diverges to NaN at epoch 30 after a learning-rate hike. List the diagnosis chain in order.
() Data corruption → model bug → framework bug → hardware fault
(*) Recognize divergence signature (healthy-then-NaN) → halve η / add clipping → resume from last checkpoint → only then suspect data/model if instability persists at sane η
() Immediately rewrite the model in a different framework
() NaN means convergence; deploy the weights
::: explanation
Ordered debugging: signatures first (NaN-after-hike screams learning rate), cheapest fix second (halve η, clip, resume from checkpoint), exotic causes last. Nine of ten training deaths are η — check the usual suspect before summoning the others.
:::

::: quiz Explain why MAP with a Gaussian prior is "ridge regression in a trench coat," and when the coat comes off (MAP ≈ MLE).
() They are unrelated methods sharing no mathematics
(*) Gaussian log-prior −‖w‖²/2τ² is exactly the L2 penalty (λ = σ²/τ²); as n grows, data precision n/σ² swamps prior precision 1/τ², so the penalty's relative pull → 0 and MAP → MLE
() Ridge came first historically so MAP copies it cosmetically
() The coat never comes off; MAP always differs substantially
::: explanation
$-\log$ posterior = data-fit + $\|w\|^2$ penalty — same objective, two stories (belief vs. shrinkage). Precision arithmetic decides influence: $n/\sigma^2$ vs $1/\tau^2$; big-$n$ drowns the prior. One equation, Bayesian hat and frequentist-regularized hat, worn together.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any single cheat-table row (likelihood-vs-posterior and R²-train-vs-test lead the charts).
* **7 Marks:** Scenario triage with T-E-P skeletons, or bias–variance diagnosis with prescription.
:::

### Essay Question 1 (7 Marks)
**Q: For (i) spam filtering with labeled mail, (ii) customer segmentation without labels, (iii) game-playing from scores only: name each paradigm with T-E-P, and explain what feedback each learner receives.**

**Model Answer:** (i) Supervised classification: T = label mail, E = labeled corpus, P = held-out accuracy; feedback = per-example correct labels. (ii) Unsupervised clustering: T = find segments, E = bare feature vectors, P = coherence/silhouette; feedback = none (structure only). (iii) RL: T = win games, E = self-play episodes, P = expected return; feedback = episode scores, never correct moves. Granularity of feedback (labels / nothing / rewards) is the discriminator — state it explicitly per case.

### Essay Question 2 (7 Marks)
**Q: A degree-15 polynomial fits 20 points with train R² = 1.0 but test R² = 0.3. Diagnose fully and prescribe three distinct remedies with mechanisms.**

**Model Answer:** Diagnosis: variance-dominated overfitting — 16 parameters memorize 20 noisy points (bias ≈ 0, variance huge); the train/test split is the evidence. Remedies: (1) cut degree (shrink capacity → trade small bias for large variance drop); (2) ridge penalty (Gaussian prior shrinks wild coefficients continuously); (3) more training data (variance falls as samples pin the fit). Optionally: cross-validated model selection to *find* the U-curve bottom rather than guessing it.
