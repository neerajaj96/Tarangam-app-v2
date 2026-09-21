---
id: m4_01_clustering_kmeans
courseCode: PCCST503
module: 4
sequence: 1
title: 'Clustering I: k-Means'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the unlabelled-grouping problem in plain words first
  - Name partitional clustering explicitly and contrast it with hierarchical clustering
  - Alternate assignment and update steps down the WCSS objective
  - Seed with k-means++ and pick k with the elbow method
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

**What problem grouping without labels solves, what point clouds k-means needs, how Lloyd's loop trains centroids, and where spherical bias limits it.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Shoppers have no tags, only baskets. The problem: split them into $K$ useful groups so similar baskets share a group, with no teacher and no answer key.

Tiny beginner example. Points $\{1,2,10,11\}$ with $K=2$. Guess centroids $1$ and $11$. Points $1,2$ join $1$; $10,11$ join $11$. New means $1.5$ and $10.5$. Reassign: same groups. Frozen. Two clusters found in one update.

Analogy as support, then dropped. Strangers walking to nearest campfires, fires recentering on crowds until nobody moves. From here on we use exact terms only: partitional clustering, centroid, Within-Cluster Sum of Squares (WCSS).

Abbreviations defined on first use: Within-Cluster Sum of Squares (WCSS). Symbols are defined before use below.

**Partitional clustering, named explicitly.** k-means **is** partitional clustering: it cuts the dataset into $K$ flat, non-overlapping partitions in one upfront commitment to $K$. Contrast with hierarchical clustering (next note), which builds a nested merge tree and defers $K$ until a dendrogram cut is read. Partitional means one level, $K$ chosen blind upfront, rerun per $K$. Hierarchical means every granularity in one run, $K$ chosen after seeing structure. That contrast is examinable.

| Question to ask | Meaning |
|---|---|
| What is $K$? | Number of flat partitions, chosen upfront here |
| What is $\mu_k$? | Centroid, mean of cluster $k$ |
| What is $C_k$? | Set of points assigned to cluster $k$ |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Partition $n$ unlabelled points into $K$ compact groups.

**Data.** Bare vectors $x_i$ with no labels. Here distance is usually Euclidean; scale features first or large units dominate.

**Goal.** Minimise $J=\sum_{k=1}^K\sum_{x\in C_k}\|x-\mu_k\|^2$, the WCSS. Here $\|x-\mu_k\|^2$ is squared distance to the assigned centre.

::: callout-intuition Core Mental Model: The Campfire Gathering
Strangers in a dark field each walk to the nearest campfire, then every campfire *relocates to the center of its crowd* — which changes nearest-fire assignments, so people re-walk, fires re-center, until nobody moves. **k-Means** is this evening in mathematics: alternate **assign** (every point joins the nearest centroid) and **update** (each centroid becomes its cluster's mean) until assignments freeze. No labels, no teachers — just the geometry of togetherness, iterated to a standstill.
:::

::: manim assets/videos/m4_kmeans.mp4 Lloyd Iterations Live
Watch assignments flicker as centroids march to cluster centers — boundary points switching sides mid-run, then the freeze of convergence when no point wants to move.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (flat grouping) → data (bare points) → goal (low WCSS) → method (alternate assign and update) → model ($K$ centroids) → training (Lloyd's loop) → example → limitations.

### 3.1 Objective and Lloyd's Algorithm, Step by Step

Numbered loop:

::: toggle Trace the §1 example iteration by iteration
Start: centroids $\mu_1 = 1$, $\mu_2 = 11$. Assign: $|1-1| < |1-11|$ and $|2-1| < |2-11|$ → {1,2} join $\mu_1$; $|10-11| < |10-1|$ and $|11-11| < |11-1|$ → {10,11} join $\mu_2$. Update: $\mu_1 = (1+2)/2 = 1.5$; $\mu_2 = (10+11)/2 = 10.5$. Reassign: distances to 1.5 vs 10.5 unchanged in membership ({1,2} nearer 1.5; {10,11} nearer 10.5) → frozen, stop. WCSS fell at the update step (means minimise squared error per group) and never rises — monotone to a local valley in finite steps (finitely many partitions exist).
:::

1. Initialise $K$ centroids (use k-means++ below).
2. Assign each $x$ to nearest $\mu_k$.
3. Reset each $\mu_k$ to the mean of its $C_k$.
4. Repeat until assignments stop changing.

Each step monotonically decreases or holds $J$: assignment picks each point's cheapest centre; the mean is the squared-error minimiser for its group. Corrected qualification: over finitely many partitions this forces termination at a local optimum (nearest valley), not the global optimum. Initialisation decides which valley; restarts and k-means++ mitigate, never guarantee, the best valley.

### 3.2 Initialization and Choosing k

::: toggle What are `distance/similarity`, `Euclidean`, `k-means++`, `elbow`, `silhouette`?
Distance/similarity = how alike two points are (k-means uses Euclidean $\|x-\mu\|$ — straight-line ruler; scale features first or large units dominate). k-means++ = spread seeding (first centroid uniform, each next with probability ∝ squared distance to nearest seeded — covers the cloud, expected $O(\log k)$ guarantee, still rerun). Elbow = plot WCSS vs $K$, pick the kink (diminishing returns — visual, informal). Silhouette = per-point cohesion-vs-separation score in $[−1,1]$ (formalises the eyeballing; peak suggests $K$). Neither discovers true $K$ — resolutions, not laws.
:::

- Random init can strand centroids (empty clusters, poor local minima). **k-means++**: seed first centroid uniformly, each next with probability proportional to squared distance to nearest seeded centroid. Spread-out starts with an expected $O(\log k)$ approximation guarantee. Qualification: expected, not deterministic; still rerun and keep best WCSS.
- **Elbow method:** plot $J$ versus $K$; pick the kink where returns diminish. Silhouette scores formalise the eyeballing. Neither discovers true $K$: partitional clustering has no ground truth, only useful resolutions. Hierarchical views (next note) help read $K$ after seeing merges.

| Similar pair | Distinction that earns marks |
|---|---|
| Partitional (k-means) vs hierarchical | Flat $K$ upfront, rerun per $K$ vs nested tree, cut after seeing; one level vs every granularity |
| k-means++ vs uniform seeding | Spread coverage with expected guarantee vs clumped starts stranding centroids |
| Elbow vs silhouette | Visual kink vs per-point cohesion score; same selection instinct |

::: callout-formula KTU Formula Vault: k-Means Facts
Objective **WCSS** (within-cluster squares) · loop **assign → update-means** (each step **decreases J**) · converges to **local** optimum in finite steps · seed with **k-means++** ($d^2$ weighting, expected guarantee) · pick $k$ by **elbow/silhouette** · likes **spherical, equal-size** clusters; fails on moons/rings/densities · **is partitional**, unlike hierarchical trees.
:::

::: callout-pitfall k-Means Sees Spheres Everywhere (Even Where None Exist)
Voronoi boundaries + mean-centers bake in a spherical-cluster worldview: elongated, ring-shaped, or mixed-density clusters get shredded into round pieces regardless of truth. Wrong-shape data needs density methods (DBSCAN) or spectral cuts — running k-Means harder (more restarts) never fixes a shape mismatch.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

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

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Calling k-means hierarchical. It is partitional: flat, $K$ upfront. Hierarchical builds trees.
- Expecting global optima from one run. Only local; seed plus restarts manage the risk.
- Running more iterations to fix shape mismatch. Spheres stay spheres; switch families.
- Skipping scaling. Large units hijack Euclidean distances and centroids.

Limitations: needs $K$, spherical and equal-size bias, outlier-sensitive means, no hierarchy.

Exam recap: WCSS objective; assign then update-means, monotone to local; k-means++ spread seeding; elbow or silhouette for $K$; partitional versus hierarchical contrast.

<a id="self-check"></a>
## 6. Active Recall Quizzes

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
