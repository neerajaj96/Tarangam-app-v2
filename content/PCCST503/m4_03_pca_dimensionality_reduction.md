---
id: m4_03_pca_dimensionality_reduction
courseCode: PCCST503
module: 4
sequence: 3
title: 'PCA: Principal Component Analysis'
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - Build covariance eigen-structure from centered data
  - Keep top components with variance-explained arithmetic
  - Standardize first so units cannot hijack the directions
concepts:
  - principal components
  - covariance eigen-structure
  - variance explained
prerequisites:
  - m1_02_probability_mle_map_estimation
examRelevance: high
tags:
  - dimensionality-reduction
  - pca
---
# PCA: Principal Component Analysis

**Variance as information, covariance eigen-structure, the projection theorem, variance-explained arithmetic, and scaling discipline.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Shadow Gallery
A 3D mobile casts shadows on gallery walls — each wall shows a 2D *projection*, and the most informative wall is the one where the shadow sprawls widest (most spread = most structure preserved). **PCA** finds that wall mathematically: the direction (unit vector) along which the data *varies most* is principal component 1; the best perpendicular runner-up is PC2; and so on. Keep the top few directions, drop the flat ones — maximum information per kept dimension, guaranteed by linear algebra rather than luck.
:::

::: manim assets/videos/m4_pca.mp4 Variance-Preserving Projection
Watch the cloud rotate onto its principal axes — spread maximizing along PC1, the flat tail directions collapsing away with barely any information lost.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Covariance and Eigen-Structure

Center the data ($\bar{x} = 0$). Covariance $\Sigma = \frac{1}{n-1}X^TX$ ($d \times d$, symmetric). Its **eigenvectors** $v_i$ (orthonormal) are the principal directions; **eigenvalues** $\lambda_i$ are the variances along them. Projection $z = V_k^Tx$ onto top-$k$ keeps fraction $\sum_{i\le k}\lambda_i / \sum \lambda_i$ of total variance — and among *all* $k$-dimensional linear projections, **none preserves more** (the projection theorem: PCA is the optimal linear compressor by reconstruction error).

### 2.2 Practical Discipline (Where Exams Probe)

* **Standardize first** (zero mean, unit variance per feature) unless units are commensurate — PCA chases *raw variance*, so a meters-vs-millimeters feature choice silently elects the winner.
* **Choose $k$** by cumulative variance (80–95% rules of thumb) or the scree-plot elbow — same spirit as clustering elbows.
* PCA is **unsupervised** (labels never enter) and **linear** (curved manifolds need kernels/autoencoders, not more components).

::: callout-formula KTU Formula Vault: PCA Facts
Center → $\Sigma = X^TX/(n-1)$ · eigenvectors = **directions**, eigenvalues = **variances** · keep top-$k$: fraction $\sum_{i\le k}\lambda_i/\sum\lambda$ · **standardize first** (variance units decide winners) · optimal **linear** compressor · unsupervised (no labels used).
:::

::: callout-pitfall Unscaled PCA Elects Units, Not Structure
Feeding raw features (income in rupees + age in years) lets the biggest-*unit* feature dominate PC1 regardless of information — a measurement artifact wearing mathematics. Standardization ($z$-scores) is not preprocessing politeness; it *defines what variance means* across incommensurate axes. Skip it and PC1 reports your unit choices.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Points $(1,2), (2,1), (3,4), (4,3)$. Compute the covariance, its eigen-structure, variance kept by PC1, and the PC1 direction. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Eigendecomposition by Hand
Mean $(2.5, 2.5)$; centered sums: $\sum dx^2 = 5.0$, $\sum dy^2 = 5.0$, $\sum dx\,dy = 3.0$. $\Sigma = \frac{1}{3}\begin{pmatrix}5 & 3 \\\\ 3 & 5\end{pmatrix}$. Characteristic: $(5/3-\lambda)^2 - 1 = 0 \Rightarrow \lambda = 5/3 \pm 1$: $\lambda_1 = 8/3 \approx 2.667$, $\lambda_2 = 2/3 \approx 0.667$. Total $10/3$; PC1 keeps $2.667/3.333 = \mathbf{80\%}$. Eigenvector for $\lambda_1$: $(5/3-8/3)x + y = 0 \Rightarrow y = x$ — direction $(1,1)/\sqrt{2}$ (the main diagonal, exactly where the eye sees the cloud stretched).
:::

::: step [Step 3: Conclusion] Final Result
One direction ($y=x$) carries 80% of the variance; the perpendicular carries the 20% wobble. Dropping to 1D keeps four-fifths of the information at half the coordinates — and the eigenvector *agrees with visual inspection*, which is how you sanity-check PCA on every new dataset forever: plot, eyeball the stretch, confirm the math found it.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Features: annual income (tens of thousands) and age (years). PCA without standardization puts nearly all PC1 weight on income. What happened, and what is the fix?
() Income genuinely contains all the information; nothing is wrong
(*) Raw variance scales with units — income's huge numbers dominate Σ mechanically; standardize (z-scores) so variance reflects spread-shape, not unit choice, before eigendecomposition
() PCA cannot handle two features simultaneously
() Age must be deleted from all analyses permanently
::: explanation
Covariance eats *squared units*: rupees² vs years² is a unit contest, not an information contest. Standardization makes each feature contribute shape, not scale — PC1 then reports correlation structure instead of measurement conventions. Preprocessing *is* the analysis here.
:::

::: quiz PC1 keeps 80% variance and you drop the rest for a classifier. Name what you provably kept, what you possibly destroyed, and when this backfires.
() Kept everything; nothing is ever destroyed by PCA
(*) Kept: the maximum-variance 1D linear projection (optimal compressor). Possibly destroyed: low-variance directions that carried the *class signal* (variance ≠ discriminative value) — backfires when labels live in the flat tail (then use supervised LDA instead)
() PCA keeps class labels intact by construction
() Variance kept always equals accuracy kept
::: explanation
PCA optimizes *reconstruction*, knowing nothing of labels — the projection theorem promises information, not *relevant* information. A 1%-variance direction separating classes perfectly is discarded first. Unsupervised compression before supervised learning is a bet, not a pipeline law.
:::

::: quiz Eigenvalues 8/3 and 2/3 with eigenvectors (1,1) and (1,−1) (up to scale). A student normalizes them to unit length before projecting. Necessary or cosmetic?
() Cosmetic — scale never matters in projections
(*) Necessary for honest coordinates: projection $z = v^Tx$ with $\|v\| \neq 1$ rescales the axis (variance bookkeeping breaks: kept-variance fraction assumes orthonormal $V_k$)
() Normalizing destroys the orthogonality between components
() Eigenvectors are always born unit-length from any computation
::: explanation
Variance accounting ($\sum_{kept}\lambda / \sum\lambda$) and reconstruction $V_kV_k^Tx$ both assume orthonormal directions. Unnormalized vectors silently stretch coordinates — same line, wrong ruler. Numerical routines return unit vectors by convention; hand work must divide by the norm explicitly.
:::
