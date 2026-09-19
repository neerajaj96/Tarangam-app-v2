---
id: m3_07_m3_mixed_drill
courseCode: PCCST303
module: 3
sequence: 7
title: 'M3 Drill: Traversals, Heaps & Graph Traces'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Write traversal orders and simulate heap and graph traces
  - Quote height, logarithmic and vertex-plus-edge costs on demand
  - Count BFS hops as shortest-path answers under time pressure
concepts:
  - trace simulation
  - cost recall
prerequisites:
  - m3_02_traversals_operations
  - m3_04_binary_heaps_priority_queue
  - m3_06_bfs_dfs_shortest_paths
examRelevance: high
tags:
  - trees
  - m3-drill
---
# M3 Drill: Traversals, Heaps & Graph Traces

**Mixed workout — write the order, simulate the structure, quote the cost.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Trace Gym
M3 marks reward *shown* walks: traversal sequences, heap arrays per sift, queue/stack frontiers per layer. The drill: never claim an order without walking it, never claim a cost without naming the shape ($n$, $h$, $V+E$) behind it.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 One-line arsenal

Traversals L-N-R/N-L-R/L-R-N + queue-level · BST $O(h)$ · heap $O(\log n)$, build $\Theta(n)$ · BFS layers = hops · DFS plunge · both $\Theta(V+E)$ · matrix dense, list sparse.

::: callout-formula KTU Formula Vault: M3 Arsenal
Orders + **$O(h)$** BST · **$\log n$** heap · **$V+E$** searches · hops = **BFS**.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs a traversal set (all four orders) with a heap simulation or a BFS/DFS trace. Draw the tree/graph state per step — traces are graded stepwise, finals alone earn little.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Preorder of root $R$, left $A$ (right $B$), right $C$? (b) Max-heap extract from $[30, 20, 10]$? (c) BFS layers from $R$ on $R-A$, $R-C$, $A-B$?
:::

::: step [Step 2: Execution] Three Walks
1. $R, A, B, C$ (node, left-subtree, right).
2. Output $30$; $[10,20]$ → sift-down → $[20,10]$.
3. L0 $\{R\}$, L1 $\{A,C\}$, L2 $\{B\}$.
:::

::: step [Step 3: Conclusion] Final Result
Node-first, sink-down, layer-out — three verbs, three correct traces. Verb-first thinking prevents order swaps under pressure.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Level-order of: root $5$, left $3$ (children $1,4$), right $8$?
(A) $5,3,1,4,8$
(*B) $5,3,8,1,4$ — floor by floor: root, then $3,8$, then $1,4$
(C) $1,4,3,8,5$
(D) $5,8,3,4,1$
::: explanation
Queue walk: $5$ → children $3,8$ → $3$'s children $1,4$. Depth-first options (A) betray preorder/inorder habits — level means breadth, strictly.
:::

::: quiz Q2: Mixed Drill
BST insert $40, 20, 60, 10$ then search $10$. Comparisons?
(A) $1$
(*B) $40\to20\to10$: $3$ comparisons — height of the descent path
(C) $4$
(D) $\log_2 4 = 2$
::: explanation
Each level costs one compare: $40$ (right? no—$10<40$ left), $20$ (left), $10$ (hit) = $3$. Search cost = descent length, i.e. $O(h)$, here exactly $3$.
:::

::: quiz Q3: Mixed Drill
Graph $1-2-3$ (path) + isolated $4$. BFS from $1$ visits? Components?
(A) All $4$; one component
(*B) $\{1,2,3\}$; two components ($\{1,2,3\}$, $\{4\}$) — BFS covers one component; restart sweeps the rest
(C) $\{1\}$ only
(D) $\{4\}$ first
::: explanation
BFS from $1$ never crosses to disconnected $4$ — no path exists. Component counting = BFS/DFS restarts until all visited: $2$ here. Isolated vertices are components of size $1$, always counted.
:::
