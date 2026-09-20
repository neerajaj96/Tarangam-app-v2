---
id: m3_02_regularization_alexnet_resnet
courseCode: PECST632
module: 3
sequence: 2
title: 'Regularization, AlexNet & ResNet'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Keep giants honest with dropout, augmentation and decay
  - Dissect the two architectures that proved depth
  - Shortcut residuals into gradient elevators exactly
concepts:
  - dropout
  - residual connections
  - landmark architectures
prerequisites:
  - m1_05_deep_feedforward_init
  - m3_01_cnn_layers_filters
examRelevance: high
tags:
  - regularization
  - architectures
---
# Regularization, AlexNet & ResNet

**Keeping giants honest — dropout/augmentation/decay — then the two architectures that proved depth.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Exam Prep Discipline
**Dropout** trains random sub-teams per batch (no co-adaptation cliques — ensemble-averaged at test, scaled!). **Augmentation** photocopies training with crops/flips/jitters (infinite-ish syllabus from finite pages!). **Weight decay** fines big weights (L2 leash — simpler functions preferred!). **AlexNet** (2012: ReLU+dropout+GPU thunder — ImageNet halved in error, the Big Bang!). **ResNet** (skip-highways past layers — $152$ floors trainable, degradation *reversed*: deeper ≥ shallower by identity-construction!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Regularizers + landmark anatomies

* Dropout $p$ (input $0.2$? hidden $0.5$ classics; test-time scaling/inverted!), augmentation policies (label-preserving only!), L2 ($\lambda\|W\|^2$), early stopping (validation-gated!), batchnorm side-effects.
* AlexNet: $5$ conv + $3$ FC ($\approx 60$M params!), ReLU novelty, overlapping pool, two-GPU split (hardware history!).
* ResNet: residual $H(x)=F(x)+x$ (identity baseline learnable — degradation argument!), bottleneck blocks ($1\times1$-$3\times3$-$1\times1$), pre-activation variants.

::: callout-formula KTU Formula Vault: Regularize + Landmarks
Dropout **sub-team lottery** · augment **label-safe copies** · decay **L2 leash** · ResNet **$F(x)+x$**.
:::

::: callout-pitfall Dropout at Test Time (Unscaled) Shifts Everything
Train-active/test-off without inverted scaling (divide-by-keep during train!) inflates activations (missing lottery averaged wrongly!) — inverted dropout (scale at train, clean test) is the discipline; raw dropout needs test-time compensation stated!
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Net overfits (train $99\%$, val $78\%$): prescribe dropout/augmentation/decay doses + expected mechanism each. Then: why does ResNet-$152$ beat ResNet-$20$ *trainability*-wise (not just accuracy)?"
:::

::: step [Step 2: Execution] Doses + Degradation Logic
1. Dropout $0.5$ hidden ($0.2$ input!) — co-adaptation breaker; flips/crops $\pm10\%$ (label-safe!) — syllabus $\times N$; L2 $\lambda\sim10^{-4}$ — weight diet; early-stop on val plateau (patience!).
2. Plain-$152$ *degrades* (optimisation, not overfitting — *train* error rises!); residual identity paths let depth add capacity without trainability collapse (skip provides gradient elevators — M1.5 reunion!).
:::

::: step [Step 3: Conclusion] Final Result
Dose-each-with-mechanism prescriptions; degradation-vs-overfitting distinction (train-error-rise = optimisation disease!) with residual cure. Distinction-first (which disease?) then prescription.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Inverted dropout (scale-by-keep at train) exists to:
(A) Speed training
(*B) Keep test-time clean (no scaling code at inference — train already compensated; deploy code identical to no-dropout path!) — bookkeeping shifted to training where it belongs
(C) Stronger regularization
(D) Smaller models
::: explanation
Expectation-matching across phases (train*=test*!): inverted scales train activations up front. Deploy-simplicity (no test-time branches!) is the engineering dividend — phase-asymmetry designed deliberately.
:::

::: quiz Q2: Foundational Concept
Degradation (deeper plain net, *higher train error*) vs overfitting differ by:
(A) Same phenomenon
(*B) Train-error direction (rises = optimisation failure, capacity unusable!; falls-while-val-rises = generalisation failure, capacity misused!) — cures oppose (shortcuts/architecture vs regularization/data!)
(C) Both need more data
(D) Both need dropout
::: explanation
Error-table reading (train *and* val!) diagnoses disease class first: optimisation (fix plumbing/shortcuts!) vs generalisation (fix discipline/data!). Cure follows diagnosis — misdiagnosis mistreats (dropout on degradation deepens the hole!).
:::

::: quiz Q3: Foundational Concept
$F(x)+x$ lets depth *only add* capacity because:
(A) More parameters always help
(*B) Identity is one $F\to0$ away (deeper net can *imitate* shallower exactly — never worse in principle!; optimisation then only needs small residuals, easier basins!) — constructive non-degradation argument
(C) Gradients vanish less magically
(D) Skip connections add features
::: explanation
Imitation-by-zeroing (deep ⊇ shallow functionally!) flips depth from risk to free option; residual-ease (learn *deltas*, mostly near-zero!) smooths basins further. Construction-then-ease: two-part logic, both quoted.
:::
