---
id: m3_02_hierarchical_clustering_lab
courseCode: PCCSL508
module: 3
sequence: 2
title: 'Experiment: Hierarchical Clustering'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the no-fixed-k advantage in plain words first
  - Build a dendrogram and cut it deliberately
  - Contrast linkages by the shapes they favour
concepts:
  - agglomerative merging
  - dendrogram cuts
  - linkage choice
prerequisites:
  - m3_01_kmeans_clustering_lab
examRelevance: high
tags:
  - hierarchical-lab
  - dendrogram
---
# Experiment: Hierarchical Clustering

**Aim:** cluster without pre-committing k — merge everything into a tree, then cut where the structure says.

**Theory (one paragraph):** Agglomerative clustering starts each point alone and repeatedly merges the closest pair (linkage defines cluster distance: single = nearest pair, complete = farthest, average/ward = middle/variance). The dendrogram records every merger as height = dissimilarity; cutting at height h yields clusters. k-means commits k blind upfront; hierarchical defers the decision until after seeing all granularities (PCCST503 contrast in one line — here we cut).

**Dataset meaning:** same local `mall.csv` (scaled as M3.01) — same customers, tree view instead of flat partitions; compare cuts against k-means k.

## 1. Procedure Step by Step

1. Reuse scaled `Xs`; compute linkages (ward first — variance-minded default for numeric blobs).
2. Plot dendrogram; read long bare stems (natural gaps); cut there; profile the cut clusters.
3. Contrast linkage shapes on the same data (single's chaining vs complete's compact balls).

```python
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
import matplotlib.pyplot as plt
Z = linkage(Xs, method="ward")     # merge history: each row (pair, distance, size)
dendrogram(Z, no_labels=True)      # tree: height = dissimilarity at merger
plt.xlabel("samples"); plt.ylabel("merge distance"); plt.show()
labels = fcluster(Z, t=3, criterion="maxclust")  # cut into 3 (t = chosen AFTER seeing!)
print("sizes:", {int(k): list(labels).count(k) for k in set(labels)})
# contrast: linkage(Xs, method="single") chains stragglers; method="complete" balls up
```

Line-by-line honesty: `ward` minimises merged variance (blobs, not chains — method matches data shape); cut chosen after viewing (the deferral advantage — k-means cannot do this); `fcluster` labels from the tree (no refit, no randomness — deterministic given data); single-linkage chaining demo proves methods see different truths.

::: toggle What do `linkage`, `dendrogram`, `fcluster`, and "method" mean?
`linkage(Xs, method="ward")` = merge history table: each row (merged pair, merge distance, new size) — `ward` merges the pair raising variance least (blob-friendly); `single` uses nearest-point distance (chains); `complete` farthest-point (compact balls). `dendrogram(Z)` = draw the tree (x = samples, y = merge dissimilarity — long bare stems = natural gaps). `fcluster(Z, t=3, criterion="maxclust")` = cut into 3 clusters (t chosen AFTER seeing the tree — the deferral advantage; deterministic, no randomness, no refit).
:::

**Algorithm:** greedy closest-pair merging with Lance-Williams updates per linkage.

## 2. Expected Output and Result

Dendrogram with readable stems; cut at a long stem (e.g. 3 clusters); sizes balanced-ish; profiles comparable to k-means k (agreement = confidence, disagreement = shape insight). Result: tree figure + cut choice + linkage contrast note.

**How to verify:** cut height recorded (reproducible); single vs complete differ visibly (method matters — proved, not claimed); profiles vs k-means compared in writing.

::: callout-pitfall Cut Worship
Cutting where you hoped clusters live, then celebrating the "discovery" — the tree shows all cuts, so pre-register the rule (longest stems / silhouette of cuts) before admiring any.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Cutting at k-means k without looking | The tree earns its keep only when read — stems decide, habits don't |
| Single linkage on noisy blobs (one giant chain) | Match linkage to shape: ward/complete for blobs, single for chains/intrusions |
| Full dendrogram on 20k rows (ink + O(n²) time) | Sample for the figure, cut on it, assign rest by nearest-centroid — scale honestly |

**Viva:** linkage definitions (nearest/farthest/variance)? What dendrogram height means (merger dissimilarity)? k-means vs hierarchical commitment timing (upfront vs after-seeing)?

**Checklist:** ward tree plotted ☐; cut at long stem ☐; linkage contrast shown ☐; k-means comparison written ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Single linkage returns one 190-point chain plus two loners; complete linkage returns three balanced balls on the same data. Which is "correct" and what does the disagreement teach?
() Single — chains are always truer
(*) Neither absolutely: linkages favour shapes (single chains/intrusions, complete compacts) — disagreement proves method shapes findings. Choose by shape hypothesis (blobs ⇒ complete/ward), report both, never crown silently
() Complete — balance is always truer
() The data is broken; resample
::: explanation
Methods are lenses with preferences: same data, different truths. Shape-hypothesis first (what should groups look like?), contrast reported, choice defended — findings wear their lens openly.
:::

::: quiz Why does hierarchical clustering let you defer k while k-means demands it upfront, in mechanism terms?
() Hierarchical guesses k better automatically
(*) Agglomerative builds all granularities in one run (n,…,1 recorded as heights); k-means optimises one flat partition per run. The tree contains every k — cutting reads one off after seeing structure; flat runs can't show alternatives without rerunning
() k-means is older and less smart
() Dendrograms compute k from data magic
::: explanation
One run, every resolution (tree) versus one run, one resolution (flat). Deferral is structural: heights record all options, cuts choose among seen ones — commitment timing is the architectural difference.
:::
