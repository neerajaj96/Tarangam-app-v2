---
id: m2_01_classification_boundaries_knn
courseCode: PCCST503
module: 2
sequence: 1
title: 'Classification: Boundaries, Linear Flaws & k-NN'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the classification problem and 0/1 goal in plain words first
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

**What problem classification solves, what labelled data it needs, why regression is the wrong tool, and how k-Nearest Neighbours (k-NN) votes from neighbours.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Regression asks "how much?" Classification asks "which side of the fence?" Given labelled points, draw fences that put future points in the right pen.

Tiny beginner example. Training: tall-and-heavy labelled plus, short-and-light labelled minus. A newcomer medium-tall arrives. k-NN with $k=3$ looks at the three closest labelled neighbours: plus, plus, minus gives plus by 2 to 1. No line was fitted; memory voted.

Analogy as support, then dropped. Thermometers measure amount; fences decide sides. From here on we use exact terms only: decision boundary, zero-one loss, surrogate loss, leverage.

Abbreviations defined on first use: k-Nearest Neighbours (k-NN). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is a decision boundary? | Surface separating predicted regions |
| What is 0/1 loss? | 1 if wrong, 0 if right; the honest judge |
| What is $k$? | How many neighbours vote |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Assign each input to one discrete label.

**Data.** Labelled pairs $(x_i,y_i)$ with $y_i$ in $\{0,1\}$ or $\{+1,-1\}$. Here $x_i$ is a feature vector, $y_i$ is its class. Query $q$ is an unlabelled newcomer.

**Goal.** Low zero-one (0/1) loss on future queries. The 0/1 loss is non-differentiable and hard to optimise directly, so training optimises a smooth surrogate (cross-entropy, hinge, Gini impurity) and reports 0/1 accuracy. Train the surrogate, judge with 0/1; never confuse the two.

::: toggle What is `0/1 loss` — and why can't we train on it?
`0/1 loss` = 1 if the verdict is wrong, 0 if right: the honest judge, counting mistakes with no partial credit.
It is a flat staircase (steps, no slope), so gradients are zero almost everywhere and undefined at the jumps — gradient descent has nothing to follow.
Fix: train a smooth `surrogate` (cross-entropy, hinge) that slopes toward correctness, then report `0/1` accuracy. Two games: slope to learn, steps to grade.
:::

Distance symbol: Euclidean distance $d(q,x)=\sqrt{\sum_j(q_j-x_j)^2}$. Features must share scale first, or metres-versus-kilograms voting goes absurd.

::: toggle Expand every symbol in `d(q,x) = √Σ(q_j − x_j)²`
`q` = query (the unlabelled newcomer); `x` = one stored training point. `j` = feature index (height `j=1`, weight `j=2`, …). `−` = per-feature gap; `²` kills signs and punishes big gaps; `Σ` adds across features; `√` returns to original units.
Tiny numbers: `q = (2,2)`, `B = (2,3)`: gaps `(0,−1)` → squares `(0,1)` → sum `1` → root `1.0` — the `1.0` in §4's trace.
Scale first: a kilograms feature swings hundreds while metres swing ones — unscaled, kilograms elect every neighbour alone.
:::

::: callout-intuition Core Mental Model: Fences vs. Thermometers
Regression is a **thermometer** (how much?). Classification is a **fence** (which side?). Fitting a thermometer where a fence belongs fails absurdly: least squares happily predicts "diabetes = 1.7" or lets one far-away outlier drag the whole line across the fence. And the fence itself can be lazy genius: **k-NN** builds no model at all — to label a newcomer, just ask its $k$ nearest labeled neighbors and take a vote. No training, all memory; the training set *is* the model.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (discrete choice) → data (labelled points plus query) → goal (low 0/1 loss) → method (surrogate training or neighbour voting) → model (boundary or stored data) → training procedure (optimise or memorise) → example → limitations.

### 3.1 Decision Boundaries and 0/1 Loss

A classifier partitions feature space into labelled regions; the **decision boundary** is the surface between them. The honest score is **0/1 loss** (wrong = 1). It is non-differentiable and hard to optimise directly, so every trainable classifier optimises a surrogate and reports 0/1 accuracy.

### 3.2 Why Least Squares Fails Labels

Encode classes as 0/1 and regress: far-away points exert huge squared leverage (one outlier $x=100$ drags predictions for $x$ in $[0,1]$), and outputs like $1.7$ or $-0.3$ are meaningless as probabilities. Thresholding at 0.5 sort of works on clean data until it catastrophically does not. Classification needs machinery respecting discreteness.

### 3.3 k-NN: Algorithm Steps Then Trace Preview

Numbered steps:

1. Store all training points.
2. For query $q$, compute distances to every stored point.
3. Take the $k$ nearest.
4. Majority vote (weight by $1/d$ to soften ties).
5. Choose $k$, metric, and scaling by validation.

Choices that matter: $k$ (small means jagged, noise-fitting boundaries, high variance; large means smooth, detail-erasing, high bias), distance metric (standardise features first), and price: $O(nd)$ memory plus $O(nd)$ per query. Training is free; prediction is expensive (KD-trees help).

::: toggle Why is small `k` high-variance and large `k` high-bias?
Small `k` (e.g. 1): one noisy neighbour flips the verdict — jagged boundaries that memorise quirks. §4's `k = 1` verdict hinges on an arbitrary tie-break: variance on display.
Large `k` (e.g. all points): the majority class always wins — smooth boundaries that erase real detail, including small genuine clusters.
Tune `k` on validation: grow it until the held-out error bottoms — the bias–variance U-curve with a concrete dial.
:::

| Similar pair | Distinction that earns marks |
|---|---|
| 0/1 loss vs surrogate | Judge with 0/1, train the smooth stand-in |
| Small $k$ vs large $k$ | Variance (jagged) vs bias (smooth); tune by validation |
| k-NN vs eager models | No training, costly queries vs costly training, cheap queries |

::: callout-formula KTU Formula Vault: Classification Facts
Boundary = **region surface** · judge with **0/1 loss**, train with **surrogates** · regression-on-labels breaks via **leverage + meaningless outputs** · k-NN: **store all, vote k nearest** · small $k$ = **variance**, large $k$ = **bias** · cost per query **$O(nd)$**.
:::

::: callout-pitfall k-NN Has No Training Error Worth Quoting
With $k=1$, training accuracy is *always* 100% on consistent data (no two identical training points with conflicting labels), because every point is its own nearest neighbor — a meaningless perfect score. k-NN can only be assessed on held-out data (last module's discipline, sharpest here). Any "my 1-NN achieves 100%" claim confesses overfitting, not success.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

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

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Quoting $k=1$ train accuracy as success. It is always 100% by construction.
- Using even $k$ without a tie rule. Prefer odd $k$, distance weights, or validation-chosen $k$.
- Forgetting to scale features. One large-unit feature then dominates distances.
- Confusing surrogate loss with 0/1 accuracy. Train one, report the other.

Limitations: k-NN stores everything, queries slowly, and suffers in high dimensions where distances blur (curse of dimensionality).

Exam recap: boundary is region surface; judge 0/1, train surrogates; regression breaks via leverage; k-NN stores all and votes; small $k$ is variance, large $k$ is bias; per-query cost $O(nd)$.

<a id="self-check"></a>
## 6. Active Recall Quizzes

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
