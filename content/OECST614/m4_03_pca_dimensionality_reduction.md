---
id: m4_03_pca_dimensionality_reduction
courseCode: OECST614
module: 4
sequence: 3
title: 'PCA: Variance-Preserving Compression'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Split eigen-ledgers with trace checksums intact
  - Elect scaling with sign-convention discipline
  - Compress onto top variance axes exactly
concepts:
  - principal components
  - eigen-ledger
  - variance preservation
prerequisites: []
examRelevance: high
tags:
  - dimensionality-reduction
  - pca
---
# PCA: Variance-Preserving Compression

**Rotate to the spread, keep the fat axes, drop the flat ones — eigenvalues as variance ledger, with a $2 \times 2$ covariance diagonalized by hand.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Shadow With Most Shape
Shine a light through a 3-D point cloud and pick the wall showing the most informative shadow. **PC1** is the direction of maximum spread, **PC2** the best perpendicular remainder, and so on. Dropping late PCs discards precisely the flattest, least-informative thickness — compression by geometry, not by guessing.
:::

Same PCA engine as `PCCST503` M4, restated for engineers: sensor arrays with correlated channels compress beautifully because shared physics lives on few axes.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Eigen-ledger

Centre $X$, form covariance $C = (1/n)X^T X$, solve $Cv = \lambda v$. Each eigenvalue $\lambda_i$ is variance along its eigenvector; explained ratio $= \lambda_i / \sum \lambda_j$; trace $= \sum \lambda_i = $ total variance (free checksum). Project onto top-$k$ eigenvectors for the $k$-D compression.

### 2.2 Standardize-or-not discipline

PCA chases raw variance, so unscaled units rig the election (M2.2 swindle, third appearance). Standardize when units differ; keep raw when units share physical meaning.

::: callout-formula KTU Formula Vault: PCA
Centre → covariance → eigen-split · $\lambda_i$ is axis variance · ratio $= \lambda_i/\sum\lambda$ · trace $=$ total (checksum) · top-$k$ projection compresses.
:::

Components are sign-ambiguous (flipping $v$ changes nothing) — sign differences across software are convention, not error.

::: callout-pitfall Components-Quantity Confusion
$k$ components need $k$ eigenvectors, and explained variance sums the kept $\lambda$s only. Students dividing by "number of samples" instead of total variance fabricate ratios that can exceed $1$.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Centred sensor data has covariance $C = [[4, 2],[2, 3]]$. Find both eigenvalues, verify the trace checksum, and state PC1's explained variance share.
:::

::: step [Step 2: Execution] Solving the Quadratic
Characteristic: $(4-\lambda)(3-\lambda) - 4 = \lambda^2 - 7\lambda + 8 = 0$. Roots: $\lambda = (7 \pm \sqrt{49-32})/2 = (7 \pm \sqrt{17})/2 = (7 \pm 4.1231)/2$. So $\lambda_1 \approx 5.5616$, $\lambda_2 \approx 1.4384$. Sum $= 7.0$ exactly matches trace $4 + 3 = 7$ — checksum green. PC1 share $= 5.5616/7 \approx 0.7945$, i.e. $79.45$ percent.
:::

::: step [Step 3: Conclusion] Final Result
Eigenvalues $5.5616$ and $1.4384$; one axis keeps $79.45$ percent of variance. A 2-D → 1-D projection onto PC1 discards only a fifth of the spread — compression with a receipt.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Checksum Drill
Covariance trace $12$, eigenvalues found $9$ and $2$. Verdict?
(A) Fine, close enough
(*B) Missing variance: $9 + 2 = 11 \ne 12$, so an eigenvalue is wrong or one is missing — trace equality is non-negotiable
(C) Trace is irrelevant
(D) Third eigenvalue must be $0$
::: explanation
Eigen-split preserves total variance exactly: $\sum \lambda_i = \mathrm{tr}(C)$. A gap of $1$ indicts the arithmetic — the cheapest PCA certificate in existence.
:::

::: quiz Q2: Scaling Election
Features: pressure $[0, 1000]$ kPa, efficiency $[0, 1]$. Raw PCA. Outcome?
(A) Balanced axes
(*B) PC1 points along pressure almost regardless of structure, because raw variance follows units — standardize first unless the unit gap is physically meaningful
(C) Efficiency dominates instead
(D) PCA auto-scales internally
::: explanation
Variance is unit-quadratic: $1000$-scale axes outvote $1$-scale axes numerically, not semantically. Standardizing gives each channel one fair vote before the eigen-election.
:::

::: quiz Q3: Sign Convention
Two packages return PC1 as $v$ and $-v$. Which is right?
(A) The positive one
(*B) Both — eigenvectors fix a line, not a direction, so flipping signs preserves every projection up to a global mirror and all explained ratios exactly
(C) The first package only
(D) Neither, recompute
::: explanation
$Cv = \lambda v$ implies $C(-v) = \lambda(-v)$: sign is gauge freedom. Scores mirror, geometry and ratios stand — sign-chasing across tools wastes the hour.
:::
