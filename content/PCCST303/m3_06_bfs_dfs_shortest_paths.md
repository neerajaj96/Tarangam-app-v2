---
id: m3_06_bfs_dfs_shortest_paths
courseCode: PCCST303
module: 3
sequence: 6
title: BFS, DFS & Single-Source Shortest Paths
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Explore with queue-driven BFS layers and stack-driven DFS dives
  - Read unweighted shortest paths directly off BFS layers
  - Quote both searches at vertex-plus-edge cost
concepts:
  - breadth-first search
  - depth-first search
  - unweighted shortest paths
prerequisites:
  - m1_04_stacks_multistacks_applications
  - m1_05_queues_circular_deque
  - m3_05_graphs_definitions_representation
examRelevance: high
tags:
  - graphs
  - graph-search
---
# BFS, DFS & Single-Source Shortest Paths

**Queue vs stack exploration — orders, trees, and unweighted shortest paths as BFS layers.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ripple vs String
**BFS** drops a pebble: ripples visit layer by layer (queue) — first arrival is via the fewest hops, so layers *are* shortest-path distances. **DFS** unspools a string down one corridor to its end, then backtracks (stack/recursion) — plunge first, perfect for mazes, topological sorts, and connectivity. Ripple measures; string explores.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Algorithms and costs

* BFS from $s$: queue, visited set, parent tracking; $\Theta(V+E)$ (list). Yields distance layers + BFS tree.
* DFS: recursive/stack, discovery/finish times; $\Theta(V+E)$. Yields DFS forest; edge classification (tree/back/forward/cross).
* Unweighted shortest path = BFS distance (report parents for the path, not just length).

### 2.2 Single-source applications (syllabus scope)

BFS distances in unweighted graphs (hops); weighted shortest paths (Dijkstra and friends) belong to S5 DAA. Here: BFS layers + DFS connectivity/components + cycle detection via back edges.

::: callout-formula KTU Formula Vault: Search
BFS = **queue, layers = distances** · DFS = **stack, plunge+backtrack** · both **$\Theta(V+E)$** · unweighted SP = **BFS**.
:::

::: callout-pitfall BFS Needs Weights $= 1$
BFS distances count *hops*; one toll road breaks optimality (that's Dijkstra's job in PCCST502). If weights appear, BFS layers are wrong — name the violation, don't run BFS anyway.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Graph: $1$ links $2,3$; $2$ links $4$; $3$ links $4$; $4$ links $5$. BFS from $1$ (ascending neighbour order): visit order, distances, shortest $1\to5$ path.
:::

::: step [Step 2: Execution] Layer by Layer
1. L0: $\{1\}$. L1: $\{2,3\}$. L2: $\{4\}$ (from $2$ first). L3: $\{5\}$. Order: $1,2,3,4,5$.
2. Distances: $d = 0,1,1,2,3$. Path $1\to2\to4\to5$ ($3$ hops; $1\to3\to4\to5$ ties — first-parent wins).
:::

::: step [Step 3: Conclusion] Final Result
Queue states per layer are the trace; parents give paths. BFS answers always pair order + distances — one without the other is half marks.
:::

### 3.1 Interactive Walkthrough: Ripple, Queue States, and the String Contrast

::: anim bfs-layers Ripple Expansion Order
Watch layers ignite in order — s, then a and b, then c, d and e, then f and g. No node lights before every node nearer the source: nondecreasing distance, animated.
:::

::: viz stepper BFS on 1-2-3-4-5: queue contents at every dequeue
1. Visit 1 (distance 0); queue holds [1]
2. Dequeue 1, discover 2 and 3; queue holds [2, 3]; distances 1 and 1
3. Dequeue 2, discover 4; queue holds [3, 4]; distance of 4 is 2
4. Dequeue 3: neighbour 4 already discovered, so skip it; queue holds [4]
5. Dequeue 4, discover 5; dequeue 5 — done. Order 1, 2, 3, 4, 5; shortest path 1 → 2 → 4 → 5
:::

::: viz compare Ripple versus string on the same graph
## BFS (ripple)
- Visit order: 1, 2, 3, 4, 5
- Structure: queue; layers equal distances
= Order 1, 2, 3, 4, 5 with distances 0, 1, 1, 2, 3
## DFS (string)
- Visit order: 1, 2, 4, 3
- Structure: stack; plunge plus backtrack
= Order 1, 2, 4, 3 with no distances claimed
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why does BFS give shortest (fewest-edge) paths in unweighted graphs?
(A) Queues are fast
(*B) Vertices dequeue in non-decreasing distance order — first visit to $v$ uses the minimum possible hops, all edges costing $1$
(C) It visits everything
(D) Stacks sort distances
::: explanation
Layer-by-layer expansion means every $k$-hop vertex is found before any $(k+1)$-hop one; the discovering edge extends a shortest $(k-1)$-path. Uniform cost is load-bearing — weights destroy it.
:::

::: quiz Q2: Numerical Drill
DFS from $1$ on: $1-2$, $1-3$, $2-4$ (ascending). Discovery order?
(A) $1,2,3,4$
(*B) $1,2,4,3$ — plunge $1\to2\to4$, backtrack twice, then $3$
(C) $1,3,2,4$
(D) $1,2,4$ only
::: explanation
DFS exhausts $2$'s corridor ($4$) before returning for $3$: $1,2,4,3$. BFS on the same graph gives $1,2,3,4$ — the pair contrasts ripple vs string perfectly.
:::

::: quiz Q3: Foundational Concept
Detecting a cycle with DFS uses:
(A) Queue length
(*B) Back edges — an edge to an ancestor in the recursion stack proves a directed/undirected cycle
(C) Visited count
(D) Edge weights
::: explanation
A back edge closes a loop with the current DFS path (ancestor→…→node→ancestor). Undirected DFS: any visited-but-not-parent neighbour qualifies. One back edge suffices — report it, don't continue searching.
:::
