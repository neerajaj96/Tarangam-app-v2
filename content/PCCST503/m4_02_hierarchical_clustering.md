# Clustering II: Hierarchical Methods

**Agglomerative merging, single/complete/average linkage, dendrograms, divisive splitting, and choosing cuts vs. choosing k.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Family Reunion Tree
k-Means demands you announce the number of families *before* meeting anyone. **Hierarchical clustering** instead builds the whole family *tree*: start with every guest alone (**agglomerative**: repeatedly marry the two closest groups) or everybody together (**divisive**: repeatedly split). The result — a **dendrogram** — postpones the $k$ decision until *after* you see the structure: draw one horizontal cut and read off however many families that height implies. One run, every granularity at once.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Agglomerative Loop and Linkages

Start: $n$ singleton clusters. Repeat: merge the closest pair (recompute inter-cluster distances), until one cluster remains. "Closest" is the **linkage** — the entire algorithm's personality:

* **Single linkage** (nearest pair across clusters): follows chains — finds snaky clusters, but one noisy bridge-point *chains* distinct blobs together (chaining effect).
* **Complete linkage** (farthest pair): demands total cohesion — round tight balls, but shatters elongated truth and cowers before outliers.
* **Average/centroid linkage:** middle ground (mean pairwise distance), the pragmatic default.

### 2.2 Dendrograms and Divisive Splitting

The merge tree records *at what distance* each union happened — long vertical branches = natural cluster gaps (cut there). **Divisive** (top-down, e.g. DIANA) splits instead of merging: $2^n$ possible splits make naive search hopeless, so practical divisive methods split by heuristic (k-means with $K=2$ recursively) — rarer in exams, reportable in one line.

::: callout-formula KTU Formula Vault: Hierarchical Facts
Agglomerative: **singletons → merge closest → dendrogram** · linkage: **single** (chains), **complete** (tight balls), **average** (middle) · cut height **chooses k after seeing structure** · divisive = **split down** (heuristic, rarer) · cost **$O(n^2)$–$O(n^3)$** (no free dendrograms).
:::

::: callout-pitfall Single Linkage Chains Through Noise (Complete Cowers From It)
One stray point bridging two blobs merges them *forever* under single linkage (chaining) — while complete linkage lets one outlier veto honest merges. Linkage choice *is* a shape prior: chains vs. balls vs. compromise. There is no neutral linkage, only documented bets.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

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

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
