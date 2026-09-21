---
id: m4_02_hierarchical_clustering
courseCode: PCCST503
module: 4
sequence: 2
title: 'Clustering II: Hierarchical Methods'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the tree-grouping problem in plain words first
  - Merge agglomeratively with single, complete and average linkage
  - Read k off dendrogram cuts after structure is visible
  - Contrast deferred cuts against k-Means blind upfront commitment
concepts:
  - agglomerative clustering
  - linkage criteria
  - dendrograms
prerequisites:
  - m4_01_clustering_kmeans
examRelevance: medium
tags:
  - clustering
  - hierarchical
---
# Clustering II: Hierarchical Methods

**What problem nested grouping solves, what distance data it needs, how agglomerative merging trains a tree, and how linkage bets shape outcomes.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

k-means, the partitional method, demands $K$ before meeting anyone. The problem here: see every granularity at once, then choose $K$ with eyes open.

Tiny beginner example. Points $\{1,2,10\}$. Closest pair $1,2$ marry first at distance $1$. The pair then marries $10$ at distance $8$. One run shows $K=2$ (cut between heights $1$ and $8$) and $K=1$ (above $8$). No reruns.

Analogy as support, then dropped. Family reunion tree uniting closest relatives until one family. From here on we use exact terms only: agglomerative, divisive, linkage, dendrogram.

Abbreviations defined on first use: no new abbreviations. Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is linkage? | Rule for distance between groups |
| What is height? | Dissimilarity at which a union happens |
| What is a cut? | Horizontal line reading off $K$ clusters |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Build a nested grouping that postpones $K$.

**Data.** Pairwise distances (here absolute distance in 1D; generally Euclidean or domain dissimilarity). Start from $n$ singletons.

**Goal.** A dendrogram recording each union's distance, so long vertical gaps mark natural cuts.

::: callout-intuition Core Mental Model: The Family Reunion Tree
k-Means demands you announce the number of families *before* meeting anyone. **Hierarchical clustering** instead builds the whole family *tree*: start with every guest alone (**agglomerative**: repeatedly marry the two closest groups) or everybody together (**divisive**: repeatedly split). The result — a **dendrogram** — postpones the $k$ decision until *after* you see the structure: draw one horizontal cut and read off however many families that height implies. One run, every granularity at once.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (multi-resolution grouping) → data (distances) → goal (informative tree) → method (merge closest) → model (dendrogram) → training (agglomerative loop) → example → limitations.

### 3.1 Agglomerative Loop and Linkages, Step by Step

::: toggle Trace the §1 example merger by merger
Points $\{1, 2, 10\}$ (1D absolute distance). Pairwise: $d(1,2) = 1$, $d(1,10) = 9$, $d(2,10) = 8$. Round 1: closest pair $\{1,2\}$ marry at height 1 (any linkage agrees on pairs). Round 2: cluster $\{1,2\}$ vs $\{10\}$ — single linkage: $\min(9,8) = 8$; complete: $\max(9,8) = 9$; both marry at height 8–9 (one run, heights recorded). Cuts: horizontal line between heights 1 and 8 reads $K = 2$ (\{1,2\}, \{10\}); above 8 reads $K = 1$. Same run, both answers — deferral demonstrated on three points.
:::

Numbered loop:

1. Start with $n$ singleton clusters.
2. Compute inter-cluster distances by linkage.
3. Merge the closest pair.
4. Recompute distances; repeat until one cluster remains.

Linkage is the personality:

- **Single linkage** (nearest pair across clusters): follows chains. Finds snaky clusters, but one noisy bridge chains distinct blobs together.
- **Complete linkage** (farthest pair): demands total cohesion. Round tight balls, but shatters elongated truth and cowers before outliers.
- **Average or centroid linkage:** mean pairwise distance, pragmatic middle.

### 3.2 Dendrograms and Divisive Splitting

::: toggle What are `agglomerative`, `divisive`, `linkage`, `dendrogram`, `height`, `cut`?
Agglomerative = bottom-up merging (singletons → one cluster — the practical default). Divisive = top-down splitting (one cluster → singletons — $2^n$ splits make naive search hopeless, so heuristic). Linkage = cluster-distance rule (single: nearest pair; complete: farthest pair; average: mean pair). Dendrogram = the merge tree drawing (leaves at bottom, unions rising). Height = dissimilarity at a union (taller = more different). Cut = horizontal line at chosen height (clusters below it are the answer — long bare stems mark natural cuts).
:::

The merge tree records at what distance each union happened. Long vertical branches mean natural gaps; cut there. **Divisive** top-down (for example DIANA) splits instead: $2^n$ possible splits make naive search hopeless, so practical methods split heuristically (recursive $K=2$ k-means). Rarer in exams; reportable in one line. Cost $O(n^2)$ to $O(n^3)$: no free dendrograms.

| Similar pair | Distinction that earns marks |
|---|---|
| Partitional vs hierarchical | Blind $K$ upfront with reruns vs deferred cut with one multi-resolution run |
| Single vs complete | Chains through bridges vs quarantines them; shape priors opposite |
| Agglomerative vs divisive | Merge-up practical default vs split-down heuristic and rarer |

::: callout-formula KTU Formula Vault: Hierarchical Facts
Agglomerative: **singletons → merge closest → dendrogram** · linkage: **single** (chains), **complete** (tight balls), **average** (middle) · cut height **chooses k after seeing structure** · divisive = **split down** (heuristic, rarer) · cost **$O(n^2)$–$O(n^3)$** (no free dendrograms).
:::

::: callout-pitfall Single Linkage Chains Through Noise (Complete Cowers From It)
One stray point bridging two blobs merges them *forever* under single linkage (chaining) — while complete linkage lets one outlier veto honest merges. Linkage choice *is* a shape prior: chains vs. balls vs. compromise. There is no neutral linkage, only documented bets.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
1D points $\{1, 2, 6, 7\}$ with absolute distance. Run single-linkage and complete-linkage agglomeration fully, and state what $k=2$ cut each implies.
:::

::: step [Step 2: Execution] Merging Both Ways
Pairwise: $d(1,2)=1$, $d(6,7)=1$, cross-gaps $\ge 4$ ($d(2,6)=4$ smallest cross).
**Single:** merge $\{1,2\}$ (gap 1), merge $\{6,7\}$ (gap 1); cluster distance $= \min$ cross $= d(2,6) = 4$; merge all at height 4. $k=2$ cut (between heights 1 and 4): $\{1,2\}$, $\{6,7\}$.
**Complete:** same first merges (only pairs at gap 1); cluster distance $= \max$ cross $= d(1,7) = 6$; merge all at height 6. Same $k=2$ cut here — linkages diverge on noisier geometry (add a bridge point at $4$: single-linkage chains everything progressively; complete holds the $\{1,2\}$/$\{6,7\}$ split far longer).
:::

::: step [Step 3: Conclusion] Final Result
Clean data: all linkages agree ($\{1,2\}$, $\{6,7\}$). The methods differ exactly where data gets dirty — bridges, outliers, cigars — which is why exams always ask linkage behavior on *noisy* sketches, never clean ones. Read the noise, pick the linkage.
:::

::: anim dendro-merge Merge at 1, Then Everything at 4
Watch pairs marry at height 1, then the clusters join at 4 — with complete linkage's 6 and the k = 2 cut riding along as the comparison.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Calling hierarchical k-free. It defers $K$, it does not eliminate it.
- Expecting linkages to agree on noisy sketches. Bridges and outliers separate them by design.
- Reading leaves as $K$. $K$ comes from a horizontal cut, not leaf count.
- Ignoring cost. Dendrograms cost quadratic to cubic; k-means scales better.

Limitations: linkage is a bet; cuts need human eyes; large $n$ needs approximations.

Exam recap: singletons merge by linkage; single chains, complete balls, average middle; height is union cost; cut chooses $K$; divisive splits heuristically; partitional contrast is upfront versus deferred $K$.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz A single noisy point sits exactly between two dense blobs. Contrast single vs. complete linkage outcomes.
() Both linkages ignore the point identically
(*) Single linkage chains through it (nearest-pair steps hop blob→noise→blob, fusing everything); complete linkage resists (farthest-pair distances stay large until forced) — same data, opposite structures, linkage as shape prior
() Complete linkage chains worse than single in this case
() Linkages only differ on 1D data, never in higher dimensions
::: explanation
Single linkage's minimum-pair rule treats the bridge as a valid stepping stone — chaining is *correct behavior* for snaky truth, catastrophic for blobs-plus-noise. Complete's maximum-pair rule demands total cohesion, quarantining the bridge. The noise geometry, not the algorithm's quality, decides the winner.
:::

::: quiz What does a dendrogram's vertical axis encode, and how do you read k off it?
() Time elapsed during clustering; k equals the number of leaves
(*) Merge distance (dissimilarity at union); a horizontal cut at height h yields one cluster per intersected branch — long bare stems mark natural gaps worth cutting through
() The number of points; k is fixed at construction
() Dendrograms encode nothing quantitative — pure decoration
::: explanation
Height = cost of that union (bigger jump = more dissimilar groups forced together). Cutting severs branches *below* the line into clusters; long empty vertical stretches are structure's own recommendation — cut where the tree itself hesitates longest.
:::

::: quiz Hierarchical clustering is often called "k-free," yet every application eventually picks k. What did the method actually buy?
() Nothing — it is strictly worse than k-Means in all respects
(*) It postpones the k decision until after structure is visible (cut the dendrogram where gaps appear) instead of demanding k blind upfront — plus a full multi-resolution view (every granularity in one run) that k-Means reruns per k
() It eliminates all hyperparameters including linkage
() It runs in linear time unlike k-Means
::: explanation
"k-free" means *deferred*, not absent: one $O(n^2)$ run banks all resolutions; the analyst cuts with eyes open. k-Means pays per-$k$ reruns with blind commitment. The dendrogram is an exploratory instrument first, a partitioner second.
:::
