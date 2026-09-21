---
id: m4_03_pca_dimensionality_reduction
courseCode: PCCST503
module: 4
sequence: 3
title: 'PCA: Principal Component Analysis'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the compression problem in plain words first
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

**What problem Principal Component Analysis (PCA) solves for wide data, what centred matrix it needs, how eigendecomposition trains the best linear compressor, and where unsupervised variance misleads.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A 3D mobile casts 2D shadows on walls. Which wall shows most structure? The one where the shadow sprawls widest. PCA finds that wall mathematically and drops flat directions.

Tiny beginner example. Points $(0,0)$, $(1,1)$, $(2,2)$ lie on diagonal $y=x$. Spread along $(1,1)$ is large; spread perpendicular is zero. Keep one direction $(1,1)$, drop the other, lose nothing. That is PCA on a line.

Analogy as support, then dropped. Shadow gallery with widest sprawl. From here on we use exact terms only: centred data, covariance, eigenvector, eigenvalue.

Abbreviations defined on first use: Principal Component Analysis (PCA). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $X$? | Centred data matrix, mean zero per feature |
| What is $\Sigma$? | Covariance, $X^TX/(n-1)$ |
| What are $v_i$, $\lambda_i$? | Direction $i$ and variance along it |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Keep maximum information per kept dimension with linear projections.

**Data.** Centred matrix $X$ with $n$ rows, $d$ columns. Centring means subtract per-feature mean so $\bar{x}=0$. Standardise (zero mean, unit variance) unless units are commensurate; PCA chases raw variance, so metres-versus-millimetres elects winners silently.

**Goal.** Top-$k$ directions keeping fraction $\sum_{i\le k}\lambda_i/\sum\lambda_i$ of variance, with no $k$-dimensional linear projection preserving more (projection theorem).

::: callout-intuition Core Mental Model: The Shadow Gallery
A 3D mobile casts shadows on gallery walls — each wall shows a 2D *projection*, and the most informative wall is the one where the shadow sprawls widest (most spread = most structure preserved). **PCA** finds that wall mathematically: the direction (unit vector) along which the data *varies most* is principal component 1; the best perpendicular runner-up is PC2; and so on. Keep the top few directions, drop the flat ones — maximum information per kept dimension, guaranteed by linear algebra rather than luck.
:::

::: manim assets/videos/m4_pca.mp4 Variance-Preserving Projection
Watch the cloud rotate onto its principal axes — spread maximizing along PC1, the flat tail directions collapsing away with barely any information lost.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (compress linearly) → data (centred, standardised $X$) → goal (max variance kept) → method (eigendecompose covariance) → model (top-$k$ orthonormal basis) → training (one eigendecomposition) → example → limitations.

### 3.1 Covariance and Eigen-Structure, Symbol by Symbol

::: toggle Expand `Σ = XᵀX/(n−1)`, `vᵢ`, `λᵢ`, `z = Vₖᵀx`
$X$ = centred data ($n$ rows samples, $d$ columns features, per-feature mean subtracted — covariance measures spread around zero). $X^TX$ = all pairwise feature dot products ($d \times d$ — how features vary together). $/(n-1)$ = unbiased averaging (sample covariance; $n$ would bias low). $\Sigma$ = covariance matrix (symmetric: $\Sigma_{ij}$ = co-variation of features $i,j$; diagonal = variances). $v_i$ = eigenvector $i$ (a direction the matrix only stretches, never rotates — principal direction). $\lambda_i$ = eigenvalue (stretch factor = variance along $v_i$). $z = V_k^Tx$ = projection (dot $x$ onto top-$k$ directions — $k$ numbers replacing $d$). Fraction kept $= \sum_{i\le k}\lambda_i/\sum\lambda_i$ (variance share — the compression grade).
:::

Covariance $\Sigma=\frac{1}{n-1}X^TX$ ($d\times d$, symmetric). Eigenvectors $v_i$ (orthonormal) are principal directions; eigenvalues $\lambda_i$ are variances along them. Projection $z=V_k^Tx$ onto top $k$ keeps fraction above. Here $V_k$ holds top eigenvectors as columns; orthonormal means unit length and perpendicular, so variance bookkeeping holds.

Numbered training:

1. Centre (and usually standardise) $X$.
2. Form $\Sigma$.
3. Eigendecompose $\Sigma=V\Lambda V^T$.
4. Keep top $k$ by cumulative variance (80–95% rules) or scree elbow.
5. Project $z=V_k^Tx$.

### 3.2 Practical Discipline

::: toggle Centring vs standardising: which does what, and what breaks if skipped?
Centring (subtract per-feature mean) = moves the cloud to the origin (covariance then measures spread, not position — uncentred data's first component points at the mean instead of the stretch). Standardising (divide by std too) = equalises units (rupees vs years no longer elect winners — variance means shape, not measurement choice). Skipped centring: PC1 chases the centroid. Skipped standardising: PC1 reports unit choices. Both are one line each; both void the analysis when missed.
:::

PCA is unsupervised (labels never enter) and linear (curved manifolds need kernels or autoencoders). Standardise first across incommensurate axes. Choose $k$ by cumulative share or elbow, same kink instinct as clustering.

| Similar pair | Distinction that earns marks |
|---|---|
| Raw vs standardised PCA | Unit-driven artifacts vs shape-driven structure |
| Variance kept vs signal kept | Reconstruction optimum vs class information; tail can hold labels |
| PCA vs supervised LDA | Unsupervised spread vs label-guided separation |

::: callout-formula KTU Formula Vault: PCA Facts
Center → $\Sigma = X^TX/(n-1)$ · eigenvectors = **directions**, eigenvalues = **variances** · keep top-$k$: fraction $\sum_{i\le k}\lambda_i/\sum\lambda$ · **standardize first** (variance units decide winners) · optimal **linear** compressor · unsupervised (no labels used).
:::

::: callout-pitfall Unscaled PCA Elects Units, Not Structure
Feeding raw features (income in rupees + age in years) lets the biggest-*unit* feature dominate PC1 regardless of information — a measurement artifact wearing mathematics. Standardization ($z$-scores) is not preprocessing politeness; it *defines what variance means* across incommensurate axes. Skip it and PC1 reports your unit choices.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Points $(1,2), (2,1), (3,4), (4,3)$. Compute the covariance, its eigen-structure, variance kept by PC1, and the PC1 direction. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Eigendecomposition by Hand
Mean $(2.5, 2.5)$; centered sums: $\sum dx^2 = 5.0$, $\sum dy^2 = 5.0$, $\sum dx\,dy = 3.0$. $\Sigma = \frac{1}{3}\begin{pmatrix}5 & 3 \\\\ 3 & 5\end{pmatrix}$. Characteristic: $(5/3-\lambda)^2 - 1 = 0 \Rightarrow \lambda = 5/3 \pm 1$: $\lambda_1 = 8/3 \approx 2.667$, $\lambda_2 = 2/3 \approx 0.667$. Total $10/3$; PC1 keeps $2.667/3.333 = \mathbf{80\%}$. Eigenvector for $\lambda_1$: $(5/3-8/3)x + y = 0 \Rightarrow y = x$ — direction $(1,1)/\sqrt{2}$ (the main diagonal, exactly where the eye sees the cloud stretched).
:::

::: step [Step 3: Conclusion] Final Result
One direction ($y=x$) carries 80% of the variance; the perpendicular carries the 20% wobble. Dropping to 1D keeps four-fifths of the information at half the coordinates — and the eigenvector *agrees with visual inspection*, which is how you sanity-check PCA on every new dataset forever: plot, eyeball the stretch, confirm the math found it.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Skipping standardisation on mixed units. PC1 then reports conventions, not geometry.
- Reading variance kept as accuracy kept. Low-variance tails can hold class signal.
- Skipping unit normalisation of hand eigenvectors. Projection and ledger assume orthonormal $V_k$.
- Using PCA for curved manifolds. Linear only; needs kernels or autoencoders.

Limitations: unsupervised, linear, scale-sensitive; reconstruction optimal, not discrimination optimal.

Exam recap: centre to covariance; eigenvectors directions, eigenvalues variances; top-$k$ share formula; standardise first; optimal linear compressor; unsupervised.

<a id="self-check"></a>
## 6. Active Recall Quizzes

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
