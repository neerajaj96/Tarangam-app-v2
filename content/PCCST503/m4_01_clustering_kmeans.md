---
id: m4_01_clustering_kmeans
courseCode: PCCST503
module: 4
sequence: 1
title: 'Clustering I: k-Means'
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - Alternate assignment and update steps down the WCSS objective
  - Seed with k-means++ and pick k with the elbow method
  - Hand-trace convergence to its local optimum
concepts:
  - k-means
  - Lloyd's algorithm
  - elbow method
prerequisites: []
examRelevance: medium
tags:
  - clustering
  - kmeans
---
# Clustering I: k-Means

**The Lloyd loop, assignment–update alternation, k-means++ seeding, the elbow method, and a hand-traced convergence.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Campfire Gathering
Strangers in a dark field each walk to the nearest campfire, then every campfire *relocates to the center of its crowd* — which changes nearest-fire assignments, so people re-walk, fires re-center, until nobody moves. **k-Means** is this evening in mathematics: alternate **assign** (every point joins the nearest centroid) and **update** (each centroid becomes its cluster's mean) until assignments freeze. No labels, no teachers — just the geometry of togetherness, iterated to a standstill.
:::

::: manim assets/videos/m4_kmeans.mp4 Lloyd Iterations Live
Watch assignments flicker as centroids march to cluster centers — boundary points switching sides mid-run, then the freeze of convergence when no point wants to move.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Objective and Lloyd's Algorithm

Minimize within-cluster sum of squares: $J = \sum_{k=1}^{K}\sum_{x \in C_k} \|x - \mu_k\|^2$. **Lloyd's loop:** (1) assign each $x$ to nearest $\mu_k$; (2) reset $\mu_k$ = mean of $C_k$; repeat until assignments stop changing. Each step *monotonically decreases* $J$ (assignment step: every point picks its cheapest center; update step: the mean *is* the squared-error minimizer) — convergence guaranteed, to a *local* optimum only.

### 2.2 Initialization and Choosing k

* Random init can strand centroids (empty clusters, terrible local minima). **k-means++**: seed first centroid uniformly, each subsequent one with probability $\propto$ squared distance to the nearest seeded centroid — spread-out starts with an $O(\log k)$ approximation guarantee.
* **Elbow method:** plot $J$ vs $K$; pick the kink where returns diminish. Silhouette scores formalize the eyeballing. Neither discovers "true" $k$ — clustering has no ground truth, only useful resolutions.

::: callout-formula KTU Formula Vault: k-Means Facts
Objective **WCSS** (within-cluster squares) · loop **assign → update-means** (each step **decreases J**) · converges to **local** optimum · seed with **k-means++** ($d^2$ weighting) · pick $k$ by **elbow/silhouette** · likes **spherical, equal-size** clusters; fails on moons/rings/densities (DBSCAN territory).
:::

::: callout-pitfall k-Means Sees Spheres Everywhere (Even Where None Exist)
Voronoi boundaries + mean-centers bake in a spherical-cluster worldview: elongated, ring-shaped, or mixed-density clusters get shredded into round pieces regardless of truth. Wrong-shape data needs density methods (DBSCAN) or spectral cuts — running k-Means harder (more restarts) never fixes a shape mismatch.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
1D points $\{1, 2, 3, 10, 11, 12\}$, $K = 2$, initial centroids $\mu = \{1, 12\}$. Run Lloyd's to convergence. (Trace verified.)
:::

::: step [Step 2: Execution] Assign, Update, Freeze
**Iteration 1:** distances — $1,2,3$ nearer $\mu_1 = 1$; $10,11,12$ nearer $\mu_2 = 12$. Clusters $\{1,2,3\}$, $\{10,11,12\}$. New means: $2.0$, $11.0$.
**Iteration 2:** reassign against $\{2.0, 11.0\}$ — $|1-2| < |1-11|$ ✓ stays; $|3-2| < |3-11|$ ✓; $|10-11| < |10-2|$ ✓ … identical clusters. **Frozen — converged** in one effective update.
:::

::: step [Step 3: Conclusion] Final Result
Centroids $\{2.0, 11.0\}$, WCSS $= (1+0+1) + (1+0+1) = 4$. Note what *didn't* happen: no point ever crossed the $6.5$ midpoint — well-separated data converges instantly. Tight interleaved data would oscillate assignments for rounds (and different inits could freeze on different answers — the local-optimum fine print, live).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Why does Lloyd's loop always terminate, and what kind of answer does it guarantee?
() It runs a fixed 100 iterations and returns whatever exists then
(*) Every assign step and every update step strictly decreases (or holds) the WCSS objective over finitely many possible partitions — so it must freeze, at a local (not necessarily global) optimum
() Centroids move randomly until a timer expires
() It terminates because K is always 2 in practice
::: explanation
Monotone descent on a finite set (finitely many partitions of $n$ points into $K$ groups) forces termination — no cycles possible while $J$ strictly drops. But descent stops at the *nearest valley*, not the deepest: initialization decides which optimum you get, hence k-means++ and restarts.
:::

::: quiz Two overlapping elongated clusters (diagonal cigars) get shredded by k-Means into round pieces. What assumption failed, and what family fixes it?
() The number of points was too small for any algorithm
(*) k-Means' spherical Voronoi bias (means + Euclidean distance) mismatches elongated/density-varying truth — density-based methods (DBSCAN: core/border/noise via reachability) or spectral clustering respect the actual shape
() k-Means requires exactly spherical data by law; the dataset is illegal
() More iterations would eventually fix the shapes
::: explanation
The failure is *representational*: means summarize round blobs, so boundaries bisect cigars regardless of iterations. DBSCAN follows density connectivity instead of distance-to-center — different bias, right tool for non-spherical structure. Diagnose shape mismatch before tuning $K$.
:::

::: quiz k-means++ seeds centroids with probability proportional to squared distance from existing seeds. What failure of uniform random seeding does this cure?
() Slow Python loops during assignment
(*) Clumped seeds that leave whole true clusters empty/starved (wasted centroids, terrible local minima) — spread-out starts cover the data extent and carry an O(log k) approximation guarantee
() k-means++ eliminates the need to choose K
() Uniform seeding is actually superior and ++ is pure marketing
::: explanation
Uniform seeds can all land in one dense blob, abandoning far clusters to never-formed centroids. $d^2$-weighting forces geographic coverage — each new seed lands far from covered ground with high probability. Initialization quality dominates k-Means outcomes more than any other hyperparameter.
:::
