---
id: m4_06_mds_multidimensional_scaling
courseCode: PCCST503
module: 4
sequence: 6
title: 'MDS: Maps From Mileage Tables'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the map-from-distances problem in plain words first
  - Recover coordinates with double-centering on distance tables
  - Audit dimensions with the eigenvalue ledger and stress
  - Claim the Euclidean MDS and PCA identity with its conditions
concepts:
  - multidimensional scaling
  - double-centering
  - stress
prerequisites:
  - m4_03_pca_dimensionality_reduction
examRelevance: medium
tags:
  - dimensionality-reduction
  - mds
---
# MDS: Maps From Mileage Tables

**What problem Multidimensional Scaling (MDS) solves from distances alone, what mileage tables it needs, how double-centering trains coordinates, and where stress prices compression.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A road atlas lists city-to-city mileages, never coordinates. Yet cartographers drew maps from such tables. The problem: rebuild coordinates from distances only.

Tiny beginner example. Two cities distance $1$ apart. Place them at $-0.5$ and $+0.5$ on one axis. Distance preserved, no coordinates were given. Classical MDS does this algebra for $n$ cities.

Analogy as support, then dropped. Map from mileages. From here on we use exact terms only: squared distances, double-centering, Gram matrix, stress.

Abbreviations defined on first use: Multidimensional Scaling (MDS). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $D$, $D^2$? | Distance matrix and its squared entries |
| What is $B$? | Centered inner-product matrix |
| What are $\lambda_i$, $V_k$? | Eigenvalues and top eigenvectors |

Pipeline preview in plain text (balanced fences hold one block):

```text
D (distances) --square--> D2 --double-center--> B = -1/2 J D2 J
B --eigendecompose--> top-k eigenvectors x sqrt(lambda) = coordinates
```

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Embed $n$ items in $k$ dimensions preserving given dissimilarities.

**Data.** An $n\times n$ distance matrix $D$, not an $n\times d$ feature matrix. Feeding raw features where mileages belong is the standard setup error. Square first: the centering identity is quadratic; linear $D$ centres into nonsense.

**Goal.** Coordinates $V_k\Lambda_k^{1/2}$ (top $k$ eigenvectors times root eigenvalues) with low stress. Here $J$ centres (subtract row and column means, add grand mean); Kruskal stress prices mismatch between true and embedded distances.

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (no features, only mileages) → data ($D$) → goal (faithful map) → method (square, centre, eigendecompose) → model (coordinates) → training (one decomposition) → example → limitations.

### 3.1 Double-Centering and the Ledger, Symbol by Symbol

For squared matrix $D^2$: $B_{ij}=-\tfrac12(D^2_{ij}-\bar{r}_i-\bar{r}_j+\bar{g})$. Here $\bar{r}_i$ is row mean, $\bar{r}_j$ column mean, $\bar{g}$ grand mean. This converts distances to centred inner products. Eigendecompose $B=V\Lambda V^T$; coordinates $=V_k\Lambda_k^{1/2}$. Certificates: rows of $B$ sum to $0$ (centering, one eigenvalue exactly $0$ for all-ones vector); $\mathrm{tr}(B)=\sum\lambda_i$ (variance ledger, same checksum habit as PCA).

Numbered steps:

1. Square $D$ to $D^2$.
2. Double-centre to $B$.
3. Check row sums zero and trace.
4. Eigendecompose; keep top $k$; scale by $\sqrt{\lambda}$.

### 3.2 Stress and the PCA Identity, With Conditions

Fewer dimensions than rank means distortion, priced by stress. **Classical MDS on Euclidean distances recovers PCA's embedding up to rotation** (same centred inner-product matrix eigendecomposed). Qualification: identity holds for Euclidean $D$ with classical scaling; non-metric MDS (rank order only) and non-Euclidean dissimilarities live outside it and can yield negative eigenvalues that truncation must handle. Mileage input, PCA-grade map output, under those conditions.

MDS needs dissimilarities, not features: gene correlations, survey proximities, road mileages all embed; PCA cannot start there at all.

| Similar pair | Distinction that earns marks |
|---|---|
| MDS input vs PCA input | $n\times n$ mileages vs $n\times d$ features; do not swap |
| $D$ vs $D^2$ | Linear distances centre into nonsense; square first |
| Classical vs non-metric MDS | Euclidean coordinates matching PCA up to rotation vs rank-order only |

::: callout-formula KTU Formula Vault: MDS
$B = -\tfrac{1}{2}JD^2J$ · coords $= V_k\sqrt{\Lambda_k}$ · rows sum $0$, trace $= \sum\lambda$ · Euclidean classical MDS $\equiv$ PCA up to rotation · stress prices compression.
:::

::: callout-pitfall Distances-In-Coordinates-Out Confusion
MDS input is a *distance matrix* ($n \times n$), not a data matrix ($n \times d$) — feeding raw features where mileages belong (or vice versa) is the standard setup error. Squaring first ($D^2$, not $D$) is the second: the centering identity is quadratic, and linear distances centre into nonsense.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Three depots with mileages $d_{12} = 3$, $d_{13} = 4$, $d_{23} = 5$ (a 3-4-5 triangle). Double-center to $B$, verify both certificates (row sums, trace), and state the eigenvalue ledger.
:::

::: step [Step 2: Execution] Centering the Triangle
$D^2 = [[0,9,16],[9,0,25],[16,25,0]]$. Row means: $25/3 \approx 8.333$, $34/3 \approx 11.333$, $41/3 \approx 13.667$; grand mean $100/9 \approx 11.111$. $B_{11} = -\tfrac{1}{2}(0 - 8.333 - 8.333 + 11.111) = 2.778$; $B_{22} = 5.778$; $B_{33} = 8.111$; $B_{12} = -0.222$; $B_{13} = -2.556$; $B_{23} = -5.556$. Certificates: row $1$ sums $2.778 - 0.222 - 2.556 = 0$ ✓ (centering holds); trace $= 2.778 + 5.778 + 8.111 = 16.667$. Eigenvalues: $\lambda_1 \approx 12.965$, $\lambda_2 \approx 3.702$, $\lambda_3 = 0$ (sums $16.667$ ✓, forced zero by centering). Dim-$1$ keeps $12.965/16.667 \approx 77.8\%$; dim-$2$ keeps $100\%$ (rank $2$ — the triangle is flat, so two axes suffice exactly).
:::

::: step [Step 3: Conclusion] Final Result
$B$ built, both certificates green, ledger $12.965 + 3.702 + 0$. A 1-D line keeps $77.8\%$ (flattened triangle, stress $> 0$); 2-D recovers the exact right triangle ($3$-$4$-$5$ verifies: legs $3,4$, hypotenuse $5$). Mileages in, map out — no coordinates were harmed (none were given).
:::

::: anim mds-ledger Eigenvalues Ledger the Triangle
Watch the ledger balance — 12.965 plus 3.702 plus centering's zero equals the trace — with dim-1 keeping 77.8% and dim-2 the exact triangle.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Feeding $n\times d$ features as $D$. MDS eats $n\times n$ dissimilarities.
- Centering $D$ not $D^2$. Quadratic identity needs squares.
- Counting the forced zero as information. It is centering's signature for the all-ones vector.
- Claiming MDS equals PCA always. Only classical Euclidean MDS, up to rotation.

Limitations: non-Euclidean $D$ can break PSD and need corrections; stress grows as $k$ shrinks; large $n$ eigendecomposition is costly.

Exam recap: $B=-JD^2J/2$; coords $V_k\sqrt{\Lambda_k}$; rows sum zero, trace ledger; Euclidean classical MDS is PCA up to rotation; stress prices compression.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Two points distance 1 apart have squared matrix [[0,1],[1,0]]. What is B11 and what coordinates follow?
() 0, diagonals stay zero so no coordinates emerge
(*) 0.25 — row means 0.5, grand 0.5 gives B11 = -0.5(0 - 0.5 - 0.5 + 0.5) = 0.25; eigenvalues 0.5 and 0 place the pair at ±0.5, distance 1 preserved
() 1, distances pass through unchanged
() -0.5, sign flipped so embedding fails
::: explanation
Centering manufactures coordinates (±0.5), not copies distances: $B$ holds inner products of the centered layout. Row-sum zero (0.25 − 0.25) certifies before any eigendecomposition — certificate first, coordinates second.
:::

::: quiz B is 4x4 with eigenvalues 9, 4, 1, 0. How many dims exact and what share in dim-2?
() 4 dims needed, share 9/14 in dim-1 only
(*) Rank 3 (one forced zero), so 3 dims exact; top-2 keeps (9+4)/14 = 13/14 ≈ 92.9% — zero is centering's signature, never information
() 2 dims exact always regardless of rank
() Share 9/9 = 100% in dim-1
::: explanation
Trace = 14 is total variance; 13/14 in two axes. The 0 belongs to the all-ones vector (rows sum 0), so four eigenvalues mean three dimensions — counting rank, not matrix size, is the ledger discipline.
:::

::: quiz Euclidean distance matrix, classical MDS versus PCA scatter. What is the relation?
() Unrelated projections from different mathematics
(*) Identical up to rotation — same centered inner-product matrix eigendecomposed, so coordinates match after an orthogonal change; MDS arrived via mileages while PCA came via features
() MDS needs labels while PCA does not
() PCA preserves distances while MDS preserves variance only
::: explanation
One Gram matrix, two doorways: $XX^T$ from features (PCA) versus double-centered $D^2$ (MDS) coincide for Euclidean $D$. Rotation absorbs the basis difference — geometry equal, paperwork different, the identity examiners quote.
:::
