---
id: m4_01_similarity_hierarchical_clustering
courseCode: OECST614
module: 4
sequence: 1
title: 'Similarity Measures & Hierarchical Clustering'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Measure closeness with similarity arithmetic exactly
  - Merge bottom-up with single, complete and average linkage
  - Read dendrograms into k decisions with chaining diagnosis
concepts:
  - similarity measures
  - linkage criteria
  - dendrograms
prerequisites: []
examRelevance: medium
tags:
  - clustering
  - hierarchical
---
# Similarity Measures & Hierarchical Clustering

**Distances that define closeness, then bottom-up merging into a dendrogram — single, complete and average linkage priced on one line of points.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Villages Merging Into Towns
**Agglomerative clustering** starts with every point its own village and repeatedly merges the two closest settlements until one town remains. The **linkage rule** defines "closest settlements": nearest huts (single), farthest huts (complete), or average pairwise distance (average). The **dendrogram** records every merger — cut it at one height, read off clusters.
:::

No labels anywhere: this is M1.1's unsupervised paradigm in full operation, the mirror of every classifier in M2.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Similarity kit

Euclidean $d = \sqrt{\sum(x_i-y_i)^2}$ (default for numeric), Manhattan $\sum\lvert x_i-y_i\rvert$ (grid streets), cosine similarity for directions (text). Scale features first — the M2.2 swindle applies verbatim.

### 2.2 Linkage arithmetic

Single: minimum cross-distance (chaining-prone, straggly clusters). Complete: maximum (compact, outlier-shy). Average: mean of all cross pairs (the compromise). Cut height chooses $k$ after the fact — dendrograms defer commitment.

::: callout-formula KTU Formula Vault: HAC
Start $n$ singletons · merge closest pair · single $= \min$, complete $= \max$, average $= \text{mean}$ cross-distance · dendrogram cut sets $k$.
:::

Single linkage chains through noise bridges; complete linkage shatters on outliers — linkage choice is modelling, not default-accepting.

::: callout-pitfall Linkage Blindness
Quoting a merger distance without naming the linkage is meaningless: the same pair merges at $4$ (single), $4.5$ (average) or $5$ (complete) below. Examiners withhold the method mark for linkage-free numbers.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Points on a line: $A(0,0)$, $B(1,0)$, $C(5,0)$ with Euclidean distance. Run one agglomerative merger, then price the next merger under all three linkages.
:::

::: step [Step 2: Execution] Merging Villages
Pairwise: $d(A,B) = 1$, $d(B,C) = 4$, $d(A,C) = 5$. Closest pair is $(A,B)$ at $1$ — merge first under every linkage. Next, cluster $\{A,B\}$ versus $C$: single $= \min(5,4) = 4$; complete $= \max(5,4) = 5$; average $= (5+4)/2 = 4.5$.
:::

::: step [Step 3: Conclusion] Final Result
First merger $(A,B)$ at $1$; second at $4$ / $4.5$ / $5$ by linkage. Same geometry, three prices — linkage named, numbers trusted. Dendrogram: $A$–$B$ join low, $C$ joins high.
:::

```text
height 5.0 ───────────── complete joins C here
height 4.5 ───────────── average joins C here
height 4.0 ───────────── single joins C here
height 1.0 ── A ═══ B (first merger)
         A   B     C
```

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Linkage Arithmetic
Cluster $\{P,Q\}$ vs $R$: $d(P,R) = 2$, $d(Q,R) = 8$. Three linkage distances?
(A) $2$ under all linkages
(*B) Single $2$, complete $8$, average $5$ — min, max, and mean of the same cross-pair, the definitional trio in one line
(C) Average $2$, single $8$
(D) All equal $5$
::: explanation
One cross-pair set, three summaries: $\min = 2$, $\max = 8$, mean $= 5$. Reciting the trio from one pair is the fastest linkage fluency check available.
:::

::: quiz Q2: Chaining Diagnosis
Single-linkage returns one snake threading through noise between two dense blobs. Cause and fix?
(A) Too few points, collect more
(*B) Single linkage's minimum rule bridges blobs via noise stepping-stones (chaining) — switch to complete or average linkage, or cut higher, to recover compact blobs
(C) Euclidean distance is broken
(D) Dendrograms cannot show chains
::: explanation
$\min$ needs only one short hop to merge, so noise ladders weld blobs together. Complete/average demand whole-cluster closeness and resist the bridge — linkage matched to shape.
:::

::: quiz Q3: Dendrogram Reading
Cutting a dendrogram at height $h$ yields $3$ vertical crossings. Clusters?
(A) $h$ clusters
(*B) $3$ clusters — each crossing is one surviving branch at that height, so cut height directly dials $k$ without rerunning anything
(C) Always $2$
(D) Zero, cuts destroy clusters
::: explanation
Horizontal cut meets one line per live cluster. Sliding the cut up merges, sliding down splits — $k$ chosen by eye after computation, HAC's signature convenience.
:::
