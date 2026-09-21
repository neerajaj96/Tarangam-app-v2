---
id: m3_03_maximum_margin_svm
courseCode: PCCST503
module: 3
sequence: 3
title: 'Maximum-Margin Classifiers: SVMs'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the robust-separator problem in plain words first
  - Separate geometric from scale-fakeable functional margins
  - Solve the minimum-norm objective with support vectors only
  - Price violations with hinge loss on boundary points
concepts:
  - geometric margin
  - support vectors
  - hinge loss
prerequisites:
  - m2_01_classification_boundaries_knn
examRelevance: high
tags:
  - svm
  - max-margin
---
# Maximum-Margin Classifiers: SVMs

**What problem Support Vector Machines (SVMs) solve beyond any separator, what labelled points they need, how margin maximisation trains the widest corridor, and where the theory's guarantees end.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Many lines separate two villages. Which road best survives future houses near the edge? The widest corridor, equally clear of both sides. Only the corridor walls decide the road; interior villages are irrelevant.

Tiny beginner example. Plus at $(2,2)$, minus at $(0,0)$. Line $x_1+x_2=3$ separates them. The plus sits exactly on the wall; the minus lounges deep inside safe territory. The plus is a support vector; the minus is a passenger. Move the passenger anywhere deep inside and the road does not budge.

Analogy as support, then dropped. Surveyor building the widest road. From here on we use exact terms only: functional margin, geometric margin, support vector, hinge loss.

Abbreviations defined on first use: Support Vector Machines (SVMs). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $\hat{\gamma}_i$? | Functional margin, scale-dependent score |
| What is $\gamma_i$? | Geometric margin, true distance |
| What is $w$, $b$? | Normal vector and offset of the road |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Among all separators, pick the one tolerating most test-time wobble.

**Data.** Labelled pairs $(x_i,y_i)$ with $y_i\in\{+1,-1\}$. Here $x_i$ is position, $y_i$ is village.

**Goal.** Maximise the geometric margin. For separator $w^Tx+b=0$, functional margin $\hat{\gamma}_i=y_i(w^Tx_i+b)$ doubles if $(w,b)$ double, without moving the line. Geometric margin $\gamma_i=\hat{\gamma}_i/\|w\|$ is true Euclidean distance, scale-free. Maximising geometric margin equals fixing functional margin at $1$ and minimising $\|w\|$.

::: callout-intuition Core Mental Model: The Widest Corridor
Two villages (classes) need a road (boundary) between them. Any line separating them *works* — but the wise surveyor builds the road maximizing clearance on *both* sides (widest corridor), so future houses (test points) near the edge stay correctly sided despite survey wobble. **SVMs** build exactly this widest corridor: among all separators, the one farthest from the nearest points of each class. Only the corridor's *walls* — the nearest points, the **support vectors** — determine the road; every other village is irrelevant to the survey.
:::

::: manim assets/videos/m2_svm_margin.mp4 Maximum Margin Geometry
Watch candidate boundaries rotate while the margin corridor breathes — widest at the optimum, with support vectors glowing on both walls and all interior points fading to irrelevance.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (robust separation) → data (labelled sides) → goal (wide corridor) → method (norm minimisation) → model ($w$, $b$) → training (convex program or hinge) → example → limitations.

### 3.1 Functional versus Geometric Margin

$$\min_{w,b}\ \tfrac12\|w\|^2 \quad \text{s.t.}\quad y_i(w^Tx_i + b) \ge 1\ \ \forall i$$

::: toggle Expand the objective: `w`, `b`, `½‖w‖²`, `s.t.`, margin `≥ 1`
$w$ = normal vector (perpendicular to the road — its length sets corridor width). $b$ = offset (slides the road without rotating — positions it). $\|w\|^2$ = squared length (minimising it widens the corridor: width $= 2/\|w\|$). $\tfrac12$ = convenience factor (cancels the 2 when differentiating — bookkeeping, not geometry). s.t. (subject to) = hard constraints every point must satisfy. $y_i(w^Tx_i+b) \ge 1$ = every point scores at least 1 on its own side (functional margin fixed at 1 — this pins the scale so minimising $\|w\|$ genuinely widens geometry). Tiny check: doubling $(w,b)$ doubles functionals but halves nothing geometric — the constraint re-pins scale, exposing the trick.
:::

::: toggle What are `hyperplane`, `support vector`, `hinge loss`, `λ`?
Hyperplane = the flat separator ($w^Tx+b=0$ — a line in 2D, plane in 3D, flat sheet beyond). Support vector = a point exactly on a corridor wall ($y_i(w^Tx_i+b)=1$ — active constraint; only these shape the road, interior points are passengers). Hinge loss $\max(0,1-y·\text{score})$ = zero when confidently right with margin ≥ 1, linear pain otherwise (exact zero at the wall — unlike cross-entropy's eternal polish). $\lambda$ = norm price in the unconstrained twin (bigger $\lambda$ = narrower corridor tolerated less — the regularisation dial).
:::

This is a convex quadratic program. Corrected qualification: it has a unique optimal weight vector $w^*$ under standard conditions; the offset $b$ can have an interval of optima when support vectors allow a range, and uniqueness of $w$ assumes separable data and a strictly convex norm. Contrast with the perceptron, which stops at any separator; SVM demands the best-placed one under these conditions.

### 3.2 Support Vectors and Hinge Loss, Symbol by Symbol

At the optimum, only points on the walls ($y_i(w^Tx_i+b)=1$) constrain the solution: the support vectors, typically few. Unconstrained twin: minimise $\sum_i\max(0,1-y_i(w^Tx_i+b))+\lambda\|w\|^2$. Here $\max(0,1-y\cdot\text{score})$ is hinge loss (zero when confidently right with margin at least $1$, linear pain otherwise), $\lambda$ prices norm. Corridor width equals $2/\|w\|$.

Numbered use:

1. Solve for $w$, $b$ on train.
2. Read support vectors off active constraints.
3. Classify new $x$ by $\text{sign}(w^Tx+b)$.

| Similar pair | Distinction that earns marks |
|---|---|
| Functional vs geometric | Scale-fakeable score vs true distance; compare norms, never functionals |
| Perceptron vs SVM separator | Any separator vs minimum-norm separator |
| Hinge vs 0/1 vs cross-entropy | Exact-zero-at-margin vs flat vs eternal polish |

::: callout-formula KTU Formula Vault: SVM Facts
Geometric margin $= \hat{\gamma}/\|w\|$ (functional is **scale-fakeable**) · objective **min ½‖w‖² s.t. margins ≥ 1** (convex; $w$ unique under standard conditions) · corridor width $= 2/\|w\|$ · only **support vectors** matter · hinge $= \max(0, 1-y\cdot\text{score}) + \lambda\|w\|^2$.
:::

::: callout-pitfall Scaling (w,b) Changes Nothing Geometric (and Fools Functional Readers)
$(2w, 2b)$ doubles every functional margin while the line — and every prediction — stands still. "Bigger functional margin = better separator" is therefore meaningless across scalings; compare separators by $\|w\|$ (smaller = wider corridor) or geometric margins only. Fix the scale (functional = 1) before comparing anything.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Separator $w = [1,1]$, $b = -3$ (line $x_1 + x_2 = 3$); points $A(2,2){+1}$, $B(0,0){-1}$. Compute functional margins, geometric margins, hinge losses, and corridor width. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Margins Both Ways
$\|w\| = \sqrt{2} \approx 1.414$. $A$: score $4-3 = 1$; functional $\hat{\gamma}_A = +1 \times 1 = 1$; geometric $1/\sqrt{2} \approx 0.707$. $B$: score $-3$; functional $\hat{\gamma}_B = -1 \times (-3) = 3$; geometric $3/\sqrt{2} \approx 2.121$. Hinge: $A$: $\max(0, 1-1) = 0$; $B$: $\max(0, 1-3) = 0$ — both correctly placed with margin to spare. Corridor width $= 2/\|w\| = 2/\sqrt{2} = \sqrt{2} \approx 1.414$.
:::

::: step [Step 3: Conclusion] Final Result
$A$ sits exactly *on* the corridor wall (functional $= 1$ — a support vector if this $w$ were optimal); $B$ lounges deep in safe territory (functional $3$). Rescale to $(2w, 2b)$: functionals double ($2$, $6$) while geometry, predictions, and hinge-zero statuses freeze — the scale illusion made numeric.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Comparing functionals across scalings. Fix scale or compare $\|w\|$.
- Deleting support vectors as simplification. They define the boundary; delete passengers instead.
- Claiming margin theory guarantees test wins on any data. It bets on wobble tolerance under separability and clean labels; noise needs soft margins next topic.
- Overclaiming uniqueness. $w$ is unique under standard convex conditions; $b$ can admit a range.

Limitations: hard-margin needs separability; scales with points without kernels and solvers; margin is a robustness bet, not a test-accuracy certificate on dirty data.

Exam recap: geometric equals functional over norm; objective min half-norm squared; width $2/\|w\|$; only support vectors matter; hinge zeroes past margin $1$.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Two candidate separators classify training data identically. Separator P has ‖w‖ = 0.5; separator Q has ‖w‖ = 4 (same functional-margin convention). Which generalizes better and why?
() Q — bigger weights mean more confident predictions
(*) P — corridor width 2/‖w‖ gives 4.0 vs 0.5; the wider corridor tolerates more test-time wobble, which is exactly the margin theory of generalization (and why SVMs minimize ‖w‖)
() Neither — weight norms carry no information about generalization
() Q — smaller corridors fit training data more snugly
::: explanation
Same training accuracy, different robustness: P's corridor is $8\times$ wider, so unseen points near the boundary stay correctly sided under perturbations that flip Q's. Minimum-norm *is* maximum-margin *is* the generalization bet — SVM's entire philosophical core in one comparison.
:::

::: quiz After training an SVM on a million points, only 200 are support vectors. A new point arrives far from the boundary on the correct side. Must the model be retrained, and which points could be deleted without changing it?
() Retrain from scratch; all million points are load-bearing
(*) No retraining needed for far-correct points (hinge zero, KKT slack); all 999,800 non-support vectors could be deleted with the identical resulting boundary — the model *is* its support vectors plus (w, b)
() Delete the support vectors to simplify the model
() Support vectors are irrelevant once training ends
::: explanation
KKT conditions: non-support vectors carry zero Lagrange multipliers — they shaped nothing. The boundary is fully determined by support vectors; compression to 200 points is exact, not approximate. (This sparsity is also what makes kernels affordable next topic.)
:::

::: quiz Hinge loss max(0, 1 − y·score) stays zero for confidently-correct points but grows linearly past the margin. Contrast with 0/1 loss and cross-entropy on this behavior.
() All three losses behave identically on every point
(*) 0/1 loss is flat-everywhere (no gradients, NP-hard to optimize); cross-entropy never fully zeroes (keeps polishing confident points); hinge zeroes exactly at margin satisfaction — sparse, optimization-friendly, and margin-aware, each loss's personality in one line
() Hinge loss is non-convex unlike the other two
() Cross-entropy also zeroes exactly at the margin
::: explanation
0/1: right/wrong step (unoptimizable). Cross-entropy: asymptotic approach, eternal small gradients (keeps tuning). Hinge: exact zero beyond margin $1$ (frees capacity for violators), linear pain inside. Loss *shape* dictates training dynamics — choose by which points deserve attention.
:::
