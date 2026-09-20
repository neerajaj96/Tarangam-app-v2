---
id: m2_03_overfitting_lasso_ridge
courseCode: OECST614
module: 2
sequence: 3
title: 'Overfitting, LASSO & RIDGE Regularization'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Read train-validation divergence as the overfitting fever
  - Shrink with ridge and select with LASSO penalties
  - Point lambda in the disciplining direction exactly
concepts:
  - overfitting diagnosis
  - LASSO penalty
  - RIDGE penalty
prerequisites:
  - m1_05_multivariate_gradient_matrix_method
examRelevance: high
tags:
  - regularization
  - overfitting
---
# Overfitting, LASSO & RIDGE Regularization

**Memorizing the classroom versus learning the subject — train/val divergence as the fever thermometer, and two penalties that discipline wild weights.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Parrot vs Student
An **overfit** model is a parrot: perfect recitation of training sentences, collapse on new ones. A disciplined student (regularized model) accepts slightly worse recitation for far better transfer. **LASSO** ($L_1$) expels weak features entirely (sparse hallways); **RIDGE** ($L_2$) shrinks all weights gently (everyone stays, nobody dominates).
:::

Same fever chart as `PCCST503` M2's generalization story — train error falling while validation error climbs is overfitting in every course code.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Reading the divergence

Underfitting: both train and validation errors high. Overfitting: train error keeps falling while validation error bottoms out then rises. Capacity (degree, depth, tree size) is the knob; validation picks its setting.

### 2.2 The two penalties

RIDGE adds $\lambda \sum w_j^2$ (smooth shrinkage, keeps all features). LASSO adds $\lambda \sum \lvert w_j \rvert$ (diamond geometry drives weak weights to exactly $0$, i.e. feature selection). Larger $\lambda$ means stronger discipline; $\lambda = 0$ is unregularized.

::: callout-formula KTU Formula Vault: Regularization
Overfit = train ↓ while val ↑ · RIDGE $+ \lambda\sum w^2$ (shrink) · LASSO $+ \lambda\sum\lvert w \rvert$ (select) · $\lambda$ tunes discipline.
:::

LASSO's sparsity is structural, not rounding: the $L_1$ diamond meets loss contours at corners where coordinates are exactly zero.

::: callout-pitfall More Data vs More Penalty Confusion
Both fight overfitting, but differently: data starves variance at its source, penalty constrains capacity given fixed data. An option prescribing "more $\lambda$" for a clearly underfit model (both errors high) increases the disease it claims to cure.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Polynomial fits on one dataset report: degree-1 gives train $8.2$, val $8.5$; degree-9 gives train $0.4$, val $15.7$. Diagnose, then compute both penalties for weights $[3.0, -2.0, 0.1]$ with $\lambda = 1$.
:::

::: step [Step 2: Execution] Diagnosis and Pricing
Degree-1: both errors high → underfit. Degree-9: train collapsed while val nearly doubled → textbook overfit; pick between them by validation, not training. Penalties: LASSO $= 1 \times (3.0 + 2.0 + 0.1) = 5.1$; RIDGE $= 1 \times (9.0 + 4.0 + 0.01) = 13.01$. Squaring punishes the $3.0$ weight ninefold while barely noticing $0.1$.
:::

::: step [Step 3: Conclusion] Final Result
Degree-9 overfits (val $15.7$ vs train $0.4$); penalties $5.1$ (LASSO) and $13.01$ (RIDGE). Notice RIDGE's quadratic temper: big weights pay disproportionately, which is exactly the smoothing pressure training feels.
:::

::: anim penalty-price Squaring Punishes 3.0 Ninefold
Watch the two penalties price the same weights — 5.1 linear against 13.01 squared — since temper, not just total, is what training feels.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Diagnosis Drill
Train $2.1$, val $2.3$ versus train $0.2$, val $9.8$. Which overfits and how do you know?
(A) The first, lower is always worse
(*B) The second, because train error collapsed while validation error ballooned — divergence, not level, is the overfitting signature
(C) Neither, errors are just numbers
(D) Both equally
::: explanation
Overfitting is a gap story: $0.2$ vs $9.8$ shows memorization without transfer, while $2.1$ vs $2.3$ shows honest generalization. Compare the gaps, not the floors.
:::

::: quiz Q2: LASSO vs RIDGE
200 features, believed only ~8 matter. Penalty of choice?
(A) RIDGE, it shrinks everything smoothly
(*B) LASSO, because its $L_1$ geometry zeroes weak weights exactly and performs feature selection, returning the ~8 survivors
(C) No penalty, more features always help
(D) Both penalties behave identically
::: explanation
RIDGE keeps all $200$ weights small but nonzero; LASSO's diamond corners set the $190$ bystanders to literal zero. Selection versus shrinkage is the whole decision.
:::

::: quiz Q3: Lambda Direction
Validation error falls as $\lambda$ grows from $0$, then rises again past $\lambda = 10$. Reading?
(A) Regularization never helps
(*B) Small $\lambda$ cures overfitting until the penalty starts starving genuine signal past $10$ — the classic U-curve with an interior optimum
(C) $\lambda$ should be infinite
(D) Train error is the right tuning signal
::: explanation
Too little discipline memorizes noise; too much discipline ignores signal. The U-shape means an interior $\lambda$ balances the two — tune on validation, never on training.
:::
