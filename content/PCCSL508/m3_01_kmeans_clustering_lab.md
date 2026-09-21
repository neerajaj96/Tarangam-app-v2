---
id: m3_01_kmeans_clustering_lab
courseCode: PCCSL508
module: 3
sequence: 1
title: 'Experiment: k-Means Clustering'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the no-labels problem in plain words first
  - Cluster local data and read WCSS honestly
  - Choose k by elbow plus silhouette, not hope
concepts:
  - k-means loop
  - WCSS elbow
  - silhouette check
prerequisites:
  - m2_05_evaluation_metrics_lab
examRelevance: high
tags:
  - kmeans-lab
  - clustering
---
# Experiment: k-Means Clustering

**Aim:** find groups with no labels — k-means on local data, k chosen by elbow + silhouette, limits confessed.

**Theory (one paragraph):** k-means alternates assign-to-nearest-centroid and move-centroid-to-mean, decreasing WCSS (within-cluster squares) to a local optimum — restart luck matters (k-means++ seeding helps). No labels exist, so "accuracy" is meaningless; elbow (diminishing returns) + silhouette (cohesion vs separation) choose k (PCCST503 clustering in three lines — here we run and choose).

**Dataset meaning (`mall.csv`, local — customer age/income/spending style rows):** rows = customers; features = numeric behaviours; no target column exists (unsupervised — the absence is the point).

## 1. Procedure Step by Step

1. Load → scale (distances need fairness — M1.05 ruler, fit on all here since no held-out grading exists; note why).
2. Sweep k = 2..8: record inertia (WCSS) + silhouette; plot elbow; pick the kink confirmed by silhouette peak.
3. Fit winner, profile clusters (per-cluster means), scatter coloured by label.

```python
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
df = pd.read_csv("mall.csv")                  # LOCAL, no target column (check: no labels!)
Xs = StandardScaler().fit_transform(df.values)
inert, sil = {}, {}
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(Xs)  # restarts tame luck
    inert[k] = km.inertia_                     # WCSS: falls with k, always (more centres!)
    sil[k] = silhouette_score(Xs, km.labels_)  # cohesion vs separation: higher better
print(inert); print(sil)
best = KMeans(n_clusters=max(sil, key=sil.get), n_init=10, random_state=42).fit(Xs)
print("chosen k:", best.n_clusters_)
```

Line-by-line honesty: `n_init=10` (ten restarts, best kept — single runs trap in local optima); inertia always falls with k (more centres = nearer means — never pick k by inertia alone!); silhouette peaks where clusters separate (the decider); scaling mandatory (income-vs-age units would rig distances).

**Algorithm:** Lloyd iterations (assign → update, monotone WCSS) from k-means++ starts.

## 2. Expected Output and Result

Inertia curve bending (elbow ~3–5), silhouette peaking at the same neighbourhood, coloured scatter showing compact blobs, per-cluster mean profiles ("young high-spenders" etc.). Result: chosen k + elbow plot + silhouette table + profiles.

**How to verify:** rerun identical (seed pinned); k=2 vs chosen silhouette compared numerically (peak, not vibes); profiles differ meaningfully (else k is decoration).

::: callout-pitfall Inertia Worship
Picking max k by "lowest WCSS" always answers k=n (every point its own cluster, WCSS zero, insight zero). Inertia bends, silhouette decides — elbow without confirmation is hope with axes.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Unscaled features (income dominates age) | Scale before distances — units rig geometry |
| Single `n_init=1` (local-optimum lottery) | Restarts ×10, keep best WCSS |
| Reporting clusters as discovered truth | Segments are resolutions, not laws — profiles + stability, modest claims |

**Viva:** assign vs update steps (nearest then mean)? Why inertia always falls (more centres nearer)? Silhouette intuition (own-cluster closeness vs neighbour distance)?

**Checklist:** scaled ☐; k-sweep table ☐; elbow + silhouette agree ☐; profiles profiled ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz k=7 gives the lowest WCSS on the sweep. Why is "k=7 wins" wrong, and what two agreeing evidences pick k instead?
() Lowest WCSS is the definition of best
(*) WCSS falls monotonically with k (k=n gives zero) — minimising it alone always over-clusters. Pick by elbow kink (diminishing returns) confirmed by silhouette peak (separation quality): bend plus peak, never minimum
() WCSS rises with k, so minimum is meaningful
() k must equal the number of features
::: explanation
Monotone metrics can't optimise: the minimum sits at absurdity (every point crowned). Kinks measure returns, silhouettes measure separation — two witnesses against one liar.
:::

::: quiz Unscaled run clusters purely by income; scaled run finds age-spending segments. Which geometry is honest and why?
() Unscaled — raw data is truth
(*) Scaled: Euclidean distance sums squared units, so raw dollars swamp years — geometry then reports currency, not customers. Fair rulers (standard deviations) precede all distance claims
() Both clusterings are equally valid laws
() Income truly determines everything
::: explanation
Distances eat units: unscaled geometry is unit-vote-stuffing. Scale first, then the blobs describe behaviour — the preprocessing IS the analysis half the time.
:::
