---
id: m4_02_kmeans_partitional_clustering
courseCode: OECST614
module: 4
sequence: 2
title: 'K-Means & Partitional Clustering'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Alternate assign-and-move until nobody switches teams
  - Certificate freezes with falling SSE on cue
  - Pick k with elbows, scaling and shape-limit honesty
concepts:
  - k-means algorithm
  - Lloyd's loop
  - elbow method
prerequisites: []
examRelevance: high
tags:
  - clustering
  - kmeans
---
# K-Means & Partitional Clustering

**Fix $k$, alternate assign-and-move until nobody switches teams — one fully traced convergence with SSE falling on cue.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Two Maypoles, One Fete
Plant $k$ maypoles (centroids); every dancer joins the nearest pole; each pole shuffles to its dancers' centre of mass; repeat. Dancers defect, poles follow, until nobody moves — a truce (local optimum) both sides accept. Restarts with fresh pole positions dodge bad truces.
:::

::: anim kmeans-loop Assign, Move, Repeat
Points take the nearest centroid's colour, centroids jump to their members' means, and the loop stills exactly when assignments freeze.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Lloyd's loop

Assign each point to $\arg\min_j \lVert x - c_j \rVert^2$, then move $c_j$ to its members' mean. Each half-step **cannot increase** SSE $= \sum\lVert x - c(x)\rVert^2$, so convergence is guaranteed — to a local minimum, not necessarily the global one. Empty clusters need a restart or reseed policy.

### 2.2 Choosing $k$ and scaling

Elbow in SSE-vs-$k$, or silhouette scores. Scale features first (distances again), and $k$-means loves spheres — moons and rings defeat it (density methods live outside this syllabus).

::: callout-formula KTU Formula Vault: K-Means
Assign nearest → move to mean → repeat to freeze · SSE never rises per half-step · restart for global hopes · elbow picks $k$.
:::

Initialization sensitivity is structural: different seeds, different truces — hence $k$-means++ seeding and multi-restart best-of-$k$ in practice.

::: callout-pitfall Reporting One Lucky Run
A single random start's SSE is a lottery ticket. Any answer crowning "$k = 2$ wins" from one seed without restarts confuses a local truce with the global optimum.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Points $(1,1)$, $(1,2)$, $(4,4)$, $(5,4)$ with $k = 2$, seeded $c_1 = (1,1)$, $c_2 = (5,4)$. Assign, update, verify freeze, and compute final SSE.
:::

::: step [Step 2: Execution] One Loop to Stillness
Distances: $(1,1)$ → $0$ vs $5$ → $c_1$; $(1,2)$ → $1$ vs $4.472$ → $c_1$; $(4,4)$ → $4.243$ vs $1$ → $c_2$; $(5,4)$ → $5$ vs $0$ → $c_2$. New means: $c_1 = (1, 1.5)$, $c_2 = (4.5, 4)$. Re-assigning changes nothing — frozen. SSE: $c_1$ members deviate $(0,-0.5)$, $(0,+0.5)$ → $0.25 + 0.25 = 0.5$; $c_2$ members deviate $(-0.5,0)$, $(+0.5,0)$ → $0.25 + 0.25 = 0.5$. Total $1.0$.
:::

::: step [Step 3: Conclusion] Final Result
Clusters $\{(1,1),(1,2)\}$ and $\{(4,4),(5,4)\}$, centroids $(1,1.5)$ and $(4.5,4)$, SSE $= 1.0$. One loop sufficed because the seed already respected the natural gap — seeds near the truth converge instantly.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Freeze Certificate
After an update, re-assignment moves zero points. Status?
(A) Bug, points must always move
(*B) Converged — with assignments frozen the means cannot shift next round, so the loop terminates at a local SSE minimum by the monotone-descent guarantee
(C) Restart immediately anyway
(D) SSE must now rise
::: explanation
Frozen assignments imply frozen means imply frozen assignments: a fixed point. Each half-step never raised SSE getting here, so arrival is certified, not accidental.
:::

::: quiz Q2: Empty-Cluster Policy
A centroid loses all members mid-run. Sound response?
(A) Delete a data point to compensate
(*B) Reseed it (e.g. on the worst-fit point or randomly) or drop $k$, because a memberless mean is undefined and freezing it wastes a cluster
(C) Leave it at zero vector forever
(D) Halt and report failure
::: explanation
Mean of nothing is undefined — the update formula divides by zero members. Reseeding recycles the cluster toward unexplained territory; the policy just needs stating.
:::

::: quiz Q3: Shape Limits
Two interleaved crescents, $k = 2$. K-means verdict?
(A) Perfect recovery always
(*B) Failure expected — centroids plus spherical SSE cannot trace crescents, so points split by gap position rather than curve membership regardless of restarts
(C) More restarts fix any shape
(D) Scaling alone repairs it
::: explanation
SSE rewards round blobs around centres; crescents are not round about any centre. Wrong inductive bias cannot be restarted away — shape and algorithm must match.
:::
