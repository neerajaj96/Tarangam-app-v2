# Module 1 Practice Lab: Foundations Drills

**Paradigm triage under time pressure, estimator selection, regression debugging scenarios, and exam essay models.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

### Scenario 1: Triage Sprint (60 seconds per case)

For each, name paradigm + task type + (T, E, P) skeleton: (a) credit-card fraud flags from labeled histories; (b) segmenting 50k unlabeled support tickets by complaint theme; (c) elevator dispatcher learning from passenger wait-time penalties; (d) predicting delivery ETA in minutes from distance/traffic features.

Answers: (a) supervised classification (T decide, E labeled transactions, P held-out precision/recall); (b) unsupervised clustering (no labels exist — k-means/LDA territory, Module 4); (c) RL (no correct dispatch shown, only delay penalties; P = expected wait); (d) supervised regression (continuous ETA, squared loss). Anyone answering (b) with "classification" skipped the label check — the lab's core reflex.

### Scenario 2: The Shifting Estimate

A coin shows 7 heads in 10 flips. MLE says 0.7. A skeptic's prior (fair-ish, strength ≈ 20 flips) pulls MAP toward ~0.55. Now 1000 flips show 630 heads: MLE 0.63, MAP ≈ 0.63 — prior washed out. Moral in numbers: with $n=10$ the prior owns the answer; with $n=1000$ the data does. Exam phrasing: "state how MAP behaves as $n \to \infty$" → converges to MLE (prior weight $\to 0$ relative to data precision).

### Scenario 3: The Too-Good Fit

A teammate's degree-12 polynomial on 15 points reports train $R^2 = 1.0$ and demands deployment. Your audit: held-out $R^2 = -0.4$ (worse than the mean!). Diagnosis: variance disease (memorization); prescription: cut degree, add ridge penalty (Gaussian prior!), or gather data — *not* more features. The two-grade certificate (train + held-out) from M1 is the entire diagnostic.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| Likelihood vs. posterior | $P(D\|\theta)$ (data fixed, vary θ) vs. $P(\theta\|D)$ (belief about θ — needs a prior) |
| MLE vs. MAP | Data-only peak vs. prior-penalized peak; coincide as $n \to \infty$ |
| Unbiased vs. MLE variance | $n-1$ corrects bias; MLE uses $n$ (peak, not fairness) |
| Regression vs. classification | Continuous $Y$ (closeness) vs. discrete $Y$ (buckets); different losses, different machinery |
| k-NN train vs. test accuracy | $k=1$ trains at 100% always (memorization); only held-out counts |
| Sigmoid output vs. decision | $\sigma \in (0,1)$ confidence; boundary at $w^Tx = 0$ (still linear!) |
| Surrogate vs. 0/1 loss | Train the smooth stand-in, judge with 0/1 accuracy |
| Bias vs. variance | Rigid-wrong vs. wiggly-unstable; test U-curve finds the middle |
| Train $R^2$ vs. test $R^2$ | Rises-by-construction vs. honest grade; report the second |
| Batch vs. SGD vs. mini-batch | $O(nd)$ smooth vs. $O(d)$ noisy-fast vs. GPU default middle |

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
