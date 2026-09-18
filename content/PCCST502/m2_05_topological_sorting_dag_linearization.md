# Topological Sorting: Linearizing a DAG

**Prerequisites before courses — Kahn's queue trace on six vertices, DFS-finish-time method, and why one back edge vetoes everything.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Getting Dressed
Socks before shoes, shirt before tie — a DAG of prerequisites linearizes into *some* valid morning order (never unique). **Kahn's algorithm** dresses greedily: repeatedly wear anything with no remaining prerequisites (indegree $0$), deleting it from everyone's lists. Leftover clothes with circular demands (a cycle) can never be worn — the queue empties with items remaining, the cycle certificate.
:::

Sibling of BFS/DFS traversals (M2.2) and Kosaraju's finish-time machinery (M2.3) — same graph toolkit, new question: not "reachable?" but "in what order?"

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Kahn's algorithm and guarantees

Compute indegrees; enqueue all $0$s; pop, append to order, decrement successors, enqueue new $0$s. Time $O(V + E)$ — every vertex and edge processed once. Valid order exists **iff** the graph is acyclic; leftover vertices prove a cycle (equivalently: DFS finds a back edge). Orders are rarely unique — any $0$-indegree pick is legal, so "the" topological order is a misnomer examiners plant deliberately.

### 2.2 DFS variant

Order vertices by *decreasing finish time* — one DFS, one sort, same $O(V + E)$. Use it when DFS already runs (Kosaraju's first pass is secretly half a topo-sorter).

::: callout-formula KTU Formula Vault: Topo Sort
DAG only · Kahn: $0$-indegree queue, $O(V+E)$ · leftovers ⟺ cycle · DFS finish-time descending works too · orders seldom unique.
:::

Topological order is *not* sorted order — values are irrelevant, only edge directions constrain. Sorting vertex labels increasingly is the classic non-answer.

::: callout-pitfall Cycle Denial
Running Kahn on a cyclic graph and presenting the partial order as "the answer" ignores the leftover vertices. Non-empty remainder *is* the verdict (no linearization exists) — always count the output: $|order| < V$ means cycle, full stop.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
DAG edges: $5 \to 2$, $5 \to 0$, $4 \to 0$, $4 \to 1$, $2 \to 3$, $3 \to 1$. Run Kahn's algorithm (seed queue $[4, 5]$) and verify the order against every edge.
:::

::: step [Step 2: Execution] Draining the Queue
Indegrees: $0{:}2$, $1{:}2$, $2{:}1$, $3{:}1$, $4{:}0$, $5{:}0$. Pop $4$ → $0{:}1$, $1{:}1$; queue $[5]$. Pop $5$ → $2{:}0$ (enqueue), $0{:}0$ (enqueue); queue $[2, 0]$. Pop $2$ → $3{:}0$ (enqueue); queue $[0, 3]$. Pop $0$; queue $[3]$. Pop $3$ → $1{:}0$ (enqueue); queue $[1]$. Pop $1$. Order: $[4, 5, 2, 0, 3, 1]$ — all $6$ emitted, acyclic confirmed.
:::

::: step [Step 3: Conclusion] Final Result
$[4, 5, 2, 0, 3, 1]$: check $5 \to 2$ ✓, $5 \to 0$ ✓, $4 \to 0$ ✓, $4 \to 1$ ✓, $2 \to 3$ ✓, $3 \to 1$ ✓ — every prerequisite precedes its dependent. Seeding $[5, 4]$ instead would fork a different valid order ($[5, 4, 2, 0, 3, 1]$) — non-uniqueness demonstrated, not feared.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Validity Drill
Proposed order $[5, 4, 0, 2, 3, 1]$ for the worked DAG. Verdict?
(A) Invalid — $0$ appears before $2$
(*B) Valid — all six edges check out ($5 \to 2$ ✓, $5 \to 0$ ✓, $4 \to 0$ ✓, $4 \to 1$ ✓, $2 \to 3$ ✓ with $2$ at index $3$ before $3$ at index $4$, $3 \to 1$ ✓); $0$-before-$2$ is unconstrained, so it is legal
(C) Invalid — $4$ must come last
(D) Valid only for cyclic graphs
::: explanation
Verify edge-by-edge, never by feel: no edge constrains $0$ vs $2$, so their relative order is free. Both $[4,5,2,0,3,1]$ and $[5,4,0,2,3,1]$ satisfy all six edges — non-uniqueness made concrete, and "looks different" is not "wrong".
:::

::: quiz Q2: Cycle Certificate
Kahn emits $4$ of $7$ vertices, queue empty. Meaning?
(A) Rerun with a bigger queue
(*B) The remaining $3$ contain a directed cycle — every leftover vertex has indegree $\ge 1$ from within the leftovers, so no $0$ can ever appear; linearization is impossible, and the leftovers localize the cycle
(C) Valid partial order, ship it
(D) Graph is a DAG regardless
::: explanation
$|order| < V$ with an empty queue is the decision procedure's NO: mutual prerequisites deadlock the drain. Report impossibility (plus the leftover subgraph as evidence), never a truncated "order".
:::

::: quiz Q3: Method Choice
DFS already ran for SCC (M2.3) on a DAG. Cheapest topo order?
(A) Rerun Kahn from scratch
(*B) Sort by decreasing finish time — the DFS data already encodes a valid linearization for free; recomputing indegrees redoes finished work, and Kosaraju's pass-one order is exactly this list
(C) Sort labels increasingly
(D) BFS levels equal topo order
::: explanation
Finish-time order *is* a topological order on DAGs (edges always go finish-late → finish-early... precisely: $u \to v$ implies finish[$u$] > finish[$v$]). Reuse beats recompute — one sort, zero new traversals.
:::
