---
id: m2_01_classification_boundaries_knn
courseCode: PCCST503
module: 2
sequence: 1
title: 'Classification: Boundaries, Linear Flaws & k-NN'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Judge classifiers with decision boundaries and 0/1 loss
  - Explain why least squares breaks on labels via leverage
  - Classify queries with k-nearest-neighbor voting by hand
concepts:
  - decision boundaries
  - 0/1 loss
  - k-nearest neighbors
prerequisites:
  - m1_01_ml_definition_paradigms_and_types
  - m1_03_linear_regression_least_squares
examRelevance: high
tags:
  - classification
  - knn
---
# Classification: Boundaries, Linear Flaws & k-NN

**Decision boundaries, why regression misfires on labels, 0/1 loss, and nearest-neighbor voting with a hand-computed query.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Fences vs. Thermometers
Regression is a **thermometer** (how much?). Classification is a **fence** (which side?). Fitting a thermometer where a fence belongs fails absurdly: least squares happily predicts "diabetes = 1.7" or lets one far-away outlier drag the whole line across the fence. And the fence itself can be lazy genius: **k-NN** builds no model at all — to label a newcomer, just ask its $k$ nearest labeled neighbors and take a vote. No training, all memory; the training set *is* the model.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Decision Boundaries and 0/1 Loss

A classifier partitions feature space into labeled regions; the **decision boundary** is the surface between them (a point, line, or hypersurface depending on dimension). The honest score is **0/1 loss** (wrong = 1) — but it is non-differentiable and NP-hard to optimize directly, so every trainable classifier optimizes a *surrogate* (cross-entropy, hinge, Gini) and reports 0/1 accuracy. Surrogate-for-training, 0/1-for-judgment: never confuse the two.

### 2.2 Why Least Squares Fails Labels

Encode classes as 0/1 and regress: far-away points exert huge squared leverage (one outlier $x = 100$ drags predictions for $x \in [0,1]$), and outputs like $1.7$ or $-0.3$ are meaningless as probabilities. Thresholding the line at 0.5 *sort of* works on clean data — until it catastrophically doesn't. Classification needs machinery that respects discreteness (sigmoid + cross-entropy next topic; margins in Module 3).

### 2.3 k-NN: The Laziest Learner

Store all training points. Query $q$: compute distances (usually Euclidean) to everything, take the $k$ nearest, **majority vote** (weight by $1/d$ to break influence ties). Choices that matter: $k$ (small = jagged, noise-fitting boundaries; large = smooth, detail-erasing — tune by validation), distance metric (scale features first, or meters-vs-kilograms voting goes absurd), and the price: $O(nd)$ memory + $O(nd)$ *per query* — training is free, prediction is expensive (KD-trees/Ball-trees mitigate).

::: callout-formula KTU Formula Vault: Classification Facts
Boundary = **region surface** · judge with **0/1 loss**, train with **surrogates** · regression-on-labels breaks via **leverage + meaningless outputs** · k-NN: **store all, vote k nearest** · small $k$ = **variance**, large $k$ = **bias** · cost per query **$O(nd)$**.
:::

::: callout-pitfall k-NN Has No Training Error Worth Quoting
With $k=1$, training accuracy is *always* 100% (every point is its own nearest neighbor) — a meaningless perfect score. k-NN can only be assessed on held-out data (last module's discipline, sharpest here). Any "my 1-NN achieves 100%" claim confesses overfitting, not success.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Training points: $A(1,1){+}$, $B(2,3){+}$, $C(3,2){-}$, $D(5,4){-}$. Classify query $Q(2,2)$ with $k=3$ (Euclidean), and show what $k=1$ and $k=2$ would do. (Distances verified.)
:::

::: step [Step 2: Execution] Voting
$d(Q,A) = \sqrt{2} \approx 1.414{+}$; $d(Q,B) = 1.0{+}$; $d(Q,C) = 1.0{-}$; $d(Q,D) \approx 3.606{-}$. Three nearest: $B{+}, C{-}, A{+}$ → vote 2–1 ⇒ **class +**. Note the exact tie $d_B = d_C = 1.0$: with $k=2$ the vote splits 1–1 (tie-break rule needed — distance-weighting would favor neither here; conventional fallback: the nearer... they're equal — reduce $k$ to 1 or grow to 3). With $k=1$: nearest is $B$ (tie with $C$ broken arbitrarily — instability on display).
:::

::: step [Step 3: Conclusion] Final Result
$k=3$ says **+** by 2–1. The trace also exhibits k-NN's twin fragilities in miniature: distance ties demanding tie-breaks, and $k=1$'s hair-trigger instability — the bias–variance knob from Module 1, now with a concrete dial.
:::

::: anim knn-vote Three Neighbors Vote 2 to 1 for Plus
Watch the three arrows land — 1.0, 1.0, 1.414 — with D stranded at 3.606, then the 2–1 verdict with the k = 2 tie and k = 1 hair-trigger riding along.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Why is fitting least-squares regression to 0/1 labels and thresholding at 0.5 considered broken rather than merely inelegant?
() It is actually the recommended state-of-the-art method
(*) Squared loss gives far-away points massive leverage over the boundary, and outputs outside [0,1] carry no probabilistic meaning — the objective fights the task instead of serving it
() Regression lines cannot be drawn through binary points at all
() Thresholding at 0.5 is mathematically undefined
::: explanation
Two independent failures: *leverage* (one distant $x$ drags the whole fit — squared penalties amplify extremes) and *semantics* (1.7 is not a 170% probability). Surrogate losses (cross-entropy next topic) fix both by design; thresholded regression fixes neither.
:::

::: quiz k-NN with k=1 reports 100% training accuracy. What should you conclude and what must you do?
() The model is perfect; deploy immediately
(*) Conclude nothing — 1-NN memorizes (each point is its own neighbor); assess only on held-out data, where its jagged boundaries will show true quality
() Increase k to n immediately without validation
() Training accuracy is the only metric that matters
::: explanation
1-NN's training score is identically 100% on *any* dataset — a constant, not information. Generalization lives exclusively in held-out measurement (Module 1 discipline), where small-$k$ variance reveals itself honestly.
:::

::: quiz In the worked example, k=2 produces a 1–1 tie (B+, C− at distance 1.0 each). What is the principled response?
() Always pick the positive class on ties by convention
(*) Recognize ties as k-NN's known edge case: use odd k, distance-weighted voting, or validation-chosen k — and note that tie frequency itself signals a boundary-hugging query deserving caution
() Discard both tied neighbors and vote with the rest
() Ties prove k-NN is unusable for even k on all datasets
::: explanation
Ties are structural (even $k$, symmetric distances), not bugs — handled by odd $k$, $1/d$ weighting, or validation. The deeper lesson: boundary-hugging queries are *inherently* uncertain, and a classifier admitting the tie is more honest than one hiding it.
:::
