# MDS: Maps From Mileage Tables

**Coordinates from distances alone — double-centering traced on a 3-4-5 triangle, eigenvalues as the dimension ledger, and why Euclidean MDS is PCA in disguise.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Map From Mileages
A road atlas lists city-to-city mileages, never coordinates — yet cartographers drew the map from exactly such tables. **Classical MDS** does the same algebra: square the distances, **double-center** (subtract row/column means, add grand mean) to get inner products, eigendecompose, and read coordinates off scaled eigenvectors. PCA (M4.3) starts from coordinates and finds spread axes; MDS starts from mileages and rebuilds the map — same geometry, opposite entrances.
:::

```text
D (distances) --square--> D2 --double-center--> B = -1/2 J D2 J
B --eigendecompose--> top-k eigenvectors x sqrt(λ) = coordinates
```

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Double-centering and the ledger

For $n$ points with squared-distance matrix $D^2$: $B_{ij} = -\tfrac{1}{2}(D^2_{ij} - \bar{r}_i - \bar{r}_j + \bar{g})$ (row means, grand mean) converts distances to centered inner products. Eigendecompose $B = V\Lambda V^T$; coordinates $= V_k \Lambda_k^{1/2}$ (top $k$). Built-in certificates: rows of $B$ sum to $0$ (centering — one eigenvalue exactly $0$ for the all-ones vector), $\mathrm{tr}(B) = \sum \lambda_i$ (variance ledger, same checksum habit as PCA).

### 2.2 Stress and the PCA identity

Fewer dimensions than rank $\Rightarrow$ distortion, priced by **stress** (Kruskal: mismatch between true and embedded distances). **Classical MDS on Euclidean distances recovers PCA's embedding** (same inner-product matrix, rotated axes) — mileage-table input, PCA-grade map output. Non-metric MDS (rank-order only) lives outside this syllabus.

::: callout-formula KTU Formula Vault: MDS
$B = -\tfrac{1}{2}JD^2J$ · coords $= V_k\sqrt{\Lambda_k}$ · rows sum $0$, trace $= \sum\lambda$ · Euclidean MDS $\equiv$ PCA · stress prices compression.
:::

MDS needs *dissimilarities*, not features — gene-expression correlations, survey proximities, road mileages all embed; PCA cannot start there at all.

::: callout-pitfall Distances-In-Coordinates-Out Confusion
MDS input is a *distance matrix* ($n \times n$), not a data matrix ($n \times d$) — feeding raw features where mileages belong (or vice versa) is the standard setup error. Squaring first ($D^2$, not $D$) is the second: the centering identity is quadratic, and linear distances centre into nonsense.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Three depots with mileages $d_{12} = 3$, $d_{13} = 4$, $d_{23} = 5$ (a 3-4-5 triangle). Double-center to $B$, verify both certificates (row sums, trace), and state the eigenvalue ledger.
:::

::: step [Step 2: Execution] Centering the Triangle
$D^2 = [[0,9,16],[9,0,25],[16,25,0]]$. Row means: $25/3 \approx 8.333$, $34/3 \approx 11.333$, $41/3 \approx 13.667$; grand mean $100/9 \approx 11.111$. $B_{11} = -\tfrac{1}{2}(0 - 8.333 - 8.333 + 11.111) = 2.778$; $B_{22} = 5.778$; $B_{33} = 8.111$; $B_{12} = -0.222$; $B_{13} = -2.556$; $B_{23} = -5.556$. Certificates: row $1$ sums $2.778 - 0.222 - 2.556 = 0$ ✓ (centering holds); trace $= 2.778 + 5.778 + 8.111 = 16.667$. Eigenvalues: $\lambda_1 \approx 12.965$, $\lambda_2 \approx 3.702$, $\lambda_3 = 0$ (sums $16.667$ ✓, forced zero by centering). Dim-$1$ keeps $12.965/16.667 \approx 77.8\%$; dim-$2$ keeps $100\%$ (rank $2$ — the triangle is flat, so two axes suffice exactly).
:::

::: step [Step 3: Conclusion] Final Result
$B$ built, both certificates green, ledger $12.965 + 3.702 + 0$. A 1-D line keeps $77.8\%$ (flattened triangle, stress $> 0$); 2-D recovers the exact right triangle ($3$-$4$-$5$ verifies: legs $3,4$, hypotenuse $5$). Mileages in, map out — no coordinates were harmed (none were given).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Centering Drill
$D^2 = [[0,1],[1,0]]$ (two points, distance $1$). $B_{11}$?
(A) $0$, diagonal stays zero
(*B) $0.25$ — row means $0.5$, $0.5$, grand $0.5$: $B_{11} = -0.5(0 - 0.5 - 0.5 + 0.5) = 0.25$; eigenvalues $\{0.5, 0\}$ place the pair at $\pm 0.5$ on one axis, distance $1$ preserved exactly
(C) $1$, distances pass through
(D) $-0.5$, sign flipped
::: explanation
Centering manufactures coordinates ($\pm 0.5$), not copies distances: $B$ holds inner products of the *centered* layout. Row-sum zero ($0.25 - 0.25$) certifies before any eigendecomposition — certificate first, coordinates second.
:::

::: quiz Q2: Ledger Check
$B$ is $4 \times 4$ with eigenvalues $9, 4, 1, 0$. Embedding dims and dim-2 share?
(A) $4$ dims needed, share $9/14$
(*B) Rank $3$ (one forced zero), so $3$ dims exact; top-$2$ keeps $(9+4)/14 = 13/14 \approx 92.9\%$ — the zero eigenvalue is centering's signature, never information, and denominators sum *kept plus dropped*
(C) $2$ dims exact always
(D) Share $9/9 = 100\%$ in dim $1$
::: explanation
Trace $= 14$ is total variance; $13/14$ in two axes. The $0$ belongs to the all-ones vector (rows sum $0$), so "four eigenvalues" means three dimensions — counting rank, not matrix size, is the ledger discipline.
:::

::: quiz Q3: MDS vs PCA
Euclidean distance matrix of a dataset, classical MDS vs PCA scatter. Relation?
(A) Unrelated projections
(*B) Identical up to rotation — same centered inner-product matrix eigendecomposed, so coordinates match after an orthogonal shrug; MDS just arrived via mileages while PCA came via features
(C) MDS needs labels, PCA doesn't
(D) PCA preserves distances, MDS preserves variance
::: explanation
One Gram matrix, two doorways: $XX^T$ from features (PCA) versus double-centered $D^2$ (MDS) coincide for Euclidean $D$. Rotation-freedom absorbs the basis difference — geometry equal, paperwork different, the identity examiners quote.
:::
