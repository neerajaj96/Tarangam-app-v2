---
id: m4_06_m4_mixed_drill
courseCode: OECST614
module: 4
sequence: 6
title: 'M4 Drill: Cluster, Compress & Combine'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Sprint merges, clusters, compressions, combinations and audits
  - Name linkages and verify freezes without slips
  - Sum traces with normalized weights and tiled folds
concepts:
  - cluster-compress-combine chain
  - audit sprint
prerequisites:
  - m4_01_similarity_hierarchical_clustering
  - m4_02_kmeans_partitional_clustering
  - m4_03_pca_dimensionality_reduction
  - m4_04_mds_ensemble_bagging_boosting
  - m4_05_resampling_bias_variance_tradeoff
examRelevance: high
tags:
  - clustering
  - m4-drill
---
# M4 Drill: Cluster, Compress & Combine

**Linkages, k-means loops, eigen-ledgers, boost weights, honest errors — M4 as reflexes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Five-Station Circuit
Merge villages, plant maypoles, keep fat axes, reweight the electorate, audit honestly. M4.2's frozen assignments and M4.3's trace checksum are the two fastest certificates in the module.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Station kit

Single $= \min$, complete $= \max$, average $= \text{mean}$ · assign–move to freeze, SSE never rises · $\lambda_i$ variances, trace checksum, top-$k$ projection · $\alpha = \tfrac{1}{2}\ln((1-err)/err)$ reweighting · bootstrap $63.2$ percent, $k$-fold tiling, error $=$ bias$^2$ $+$ var $+$ noise.

::: callout-formula KTU Formula Vault: M4 Circuit
Merge → cluster → compress → combine → audit. Linkage named, freeze verified, trace summed, weights normalized, folds tiled.
:::

::: callout-exam KTU Exam Focus
M4's 9-markers chain k-means (assign plus SSE) with a PCA checksum, or AdaBoost weights with a bias–variance reading. Dendrogram cuts and elbow picks are diagram marks — draw them, don't describe them.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Points $P(0,0)$, $Q(2,0)$, $R(3,0)$. (a) First HAC merger and single-linkage second distance? (b) K-means $k = 2$ seeded $c_1 = P$, $c_2 = R$: one loop? (c) Covariance trace $10$ with eigenvalues $7$ and $2$: verdict?"
:::

::: step [Step 2: Execution] Full Circuit
(a) $d(P,Q) = 2$, $d(Q,R) = 1$, $d(P,R) = 3$: merge $(Q,R)$ at $1$; single-linkage $\{Q,R\}$ vs $P$ at $\min(3,2) = 2$. (b) Assign: $P$ → $c_1$ ($0$ vs $3$), $Q$ → $c_2$ ($2$ vs $1$), $R$ → $c_2$; new $c_2 = (2.5, 0)$; frozen on re-check. SSE $= 0 + 0.25 + 0.25 = 0.5$. (c) $7 + 2 = 9 \ne 10$: missing or wrong eigenvalue — checksum fails, recompute before trusting ratios.
:::

::: step [Step 3: Conclusion] Final Result
Merger $(Q,R)$ at $1$ then $2$; clusters $\{P\}$, $\{Q,R\}$ with SSE $0.5$; eigen-ledger $9$ vs $10$ fails audit. Two greens and one red — the red one is the mark-saver.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$\{A,B\}$ vs $C$: $d(A,C) = 3$, $d(B,C) = 7$. Complete and average linkages?
(A) $3$ and $5$
(*B) Complete $7$ (max) and average $5$ (mean) — the max-mean pair students swap under time pressure, so recite min-max-mean in order first
(C) $7$ and $3$
(D) Both $5$
::: explanation
$\max(3,7) = 7$, $(3+7)/2 = 5$. Ordering the trio (single $3$, average $5$, complete $7$) before answering blocks the swap — ritual beats memory.
:::

::: quiz Q2: Mixed Drill
AdaBoost $err = 0.2$. $\alpha$ direction and effect?
(A) $\alpha = 0$, no change
(*B) $\alpha = 0.5\ln(4) \approx 0.6931$, so misses scale by $e^{0.6931} = 2$ and hits by $0.5$ pre-normalization — confident voter, loud reweighting
(C) Negative $\alpha$, invert everything
(D) $\alpha = 0.2$ directly
::: explanation
$(1-0.2)/0.2 = 4$, half-log $0.6931$: classic round numbers ($2\times$ misses, $0.5\times$ hits) worth recognizing on sight. Low error means loud voice.
:::

::: quiz Q3: Mixed Drill
$200$ samples, $10$-fold CV. Per-fold sizes and total test coverage?
(A) $180/20$ with gaps
(*B) $180$ train, $20$ test per run, all $200$ tested exactly once — ten disjoint $20$s tile the dataset by construction
(C) $100/100$ halves
(D) Coverage is random
::: explanation
$200/10 = 20$ per fold; rotation tiles rather than samples. Tiling (each point tested once) versus bootstrapping (random with repeats) is the contrast to state when asked "CV vs bootstrap".
:::
