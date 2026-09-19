---
id: m3_03_maximum_margin_svm
courseCode: PCCST503
module: 3
sequence: 3
title: 'Maximum-Margin Classifiers: SVMs'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
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

**Geometric vs. functional margins, support vectors, the minimum-norm objective, hinge loss, and why only boundary points matter.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Widest Corridor
Two villages (classes) need a road (boundary) between them. Any line separating them *works* — but the wise surveyor builds the road maximizing clearance on *both* sides (widest corridor), so future houses (test points) near the edge stay correctly sided despite survey wobble. **SVMs** build exactly this widest corridor: among all separators, the one farthest from the nearest points of each class. Only the corridor's *walls* — the nearest points, the **support vectors** — determine the road; every other village is irrelevant to the survey.
:::

::: manim assets/videos/m2_svm_margin.mp4 Maximum Margin Geometry
Watch candidate boundaries rotate while the margin corridor breathes — widest at the optimum, with support vectors glowing on both walls and all interior points fading to irrelevance.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Functional vs. Geometric Margin

For separator $w^Tx + b = 0$ and example $(x_i, y_i)$, $y_i \in \{+1,-1\}$: **functional margin** $\hat{\gamma}_i = y_i(w^Tx_i + b)$ — scale-dependent (double $(w,b)$, double all $\hat{\gamma}$ without moving the line!). **Geometric margin** $\gamma_i = \hat{\gamma}_i / \|w\|$ — true Euclidean distance, scale-free. Maximizing the *geometric* margin $\iff$ fixing functional margin $= 1$ and **minimizing $\|w\|$**:

$$\min_{w,b}\ \tfrac12\|w\|^2 \quad \text{s.t.}\quad y_i(w^Tx_i + b) \ge 1\ \ \forall i$$

— a convex quadratic program with a unique global optimum (contrast: perceptron stops at *any* separator; SVM demands the *best-placed* one).

### 2.2 Support Vectors and Hinge Loss

At the optimum, only points *on* the corridor walls ($y_i(w^Tx_i+b) = 1$) constrain the solution — the **support vectors** (typically few). Unconstrained twin: minimize $\sum_i \max(0,\, 1 - y_i(w^Tx_i+b)) + \lambda\|w\|^2$ — **hinge loss** (zero when confidently right with margin ≥ 1, linear pain otherwise) plus the same minimum-norm pressure.

::: callout-formula KTU Formula Vault: SVM Facts
Geometric margin $= \hat{\gamma}/\|w\|$ (functional is **scale-fakeable**) · objective **min ½‖w‖² s.t. margins ≥ 1** (convex, unique) · corridor width $= 2/\|w\|$ · only **support vectors** matter · hinge $= \max(0, 1-y\cdot\text{score}) + \lambda\|w\|^2$.
:::

::: callout-pitfall Scaling (w,b) Changes Nothing Geometric (and Fools Functional Readers)
$(2w, 2b)$ doubles every functional margin while the line — and every prediction — stands still. "Bigger functional margin = better separator" is therefore meaningless across scalings; compare separators by $\|w\|$ (smaller = wider corridor) or geometric margins only. Fix the scale (functional = 1) before comparing anything.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Separator $w = [1,1]$, $b = -3$ (line $x_1 + x_2 = 3$); points $A(2,2){+1}$, $B(0,0){-1}$. Compute functional margins, geometric margins, hinge losses, and corridor width. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Margins Both Ways
$\|w\| = \sqrt{2} \approx 1.414$. $A$: score $4-3 = 1$; functional $\hat{\gamma}_A = +1 \times 1 = 1$; geometric $1/\sqrt{2} \approx 0.707$. $B$: score $-3$; functional $\hat{\gamma}_B = -1 \times (-3) = 3$; geometric $3/\sqrt{2} \approx 2.121$. Hinge: $A$: $\max(0, 1-1) = 0$; $B$: $\max(0, 1-3) = 0$ — both correctly placed with margin to spare. Corridor width $= 2/\|w\| = 2/\sqrt{2} = \sqrt{2} \approx 1.414$.
:::

::: step [Step 3: Conclusion] Final Result
$A$ sits exactly *on* the corridor wall (functional $= 1$ — a support vector if this $w$ were optimal); $B$ lounges deep in safe territory (functional $3$). Rescale to $(2w, 2b)$: functionals double ($2$, $6$) while geometry, predictions, and hinge-zero statuses freeze — the scale illusion made numeric.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
