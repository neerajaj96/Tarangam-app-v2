---
id: m2_05_topological_sorting_dag_linearization
courseCode: PCCST502
module: 2
sequence: 5
title: 'Topological Sorting: Linearizing a DAG'
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Order prerequisites before courses with Kahn's queue trace
  - Linearize with descending DFS finish times as backup
  - Veto everything on a single back edge with leftover certificates
concepts:
  - topological sorting
  - Kahn's algorithm
  - DAG validation
prerequisites:
  - m2_02_graph_traversals_bfs_and_dfs
examRelevance: medium
tags:
  - graphs
  - topological-sort
---
# Topological Sorting: Linearizing a DAG

**Prerequisites before courses — Kahn's queue trace on six vertices, DFS-finish-time method, and why one back edge vetoes everything.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Courses have prerequisites ("take Maths before Algorithms"); dressing has order (socks before shoes). Given such dependency arrows, list everything in *some* order where every prerequisite precedes its dependent — or report that no such order exists (a dependency cycle). That list is a **topological order**, and it exists **iff** the graph is a DAG (Directed Acyclic Graph: directed, no cycles).

::: callout-intuition Core Mental Model: Getting Dressed
Socks before shoes, shirt before tie — a DAG of prerequisites linearizes into *some* valid morning order (never unique). **Kahn's algorithm** (named after A. B. Kahn) dresses greedily: repeatedly wear anything with no remaining prerequisites (indegree $0$ — count of incoming edges), deleting it from everyone's lists. Leftover clothes with circular demands (a cycle) can never be worn — the queue empties with items remaining: the cycle certificate. Drop the wardrobe now: indegrees and queues below are the exact mechanism.
:::

Sibling of BFS/DFS traversals (M2.2) and Kosaraju's finish-time machinery (M2.3) — same graph toolkit, new question: not "reachable?" but "in what order?"

**Tiny toy example (3 vertices).** Edges $a \to b$, $a \to c$ (no edge between $b$, $c$). Valid orders: $[a, b, c]$ and $[a, c, b]$ — $a$ first forced, the pair free. Non-uniqueness is normal, not suspicious.

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols:** indegree = number of incoming edges; DAG = directed graph with no directed cycles; $|order|$ = emitted vertex count.

**Kahn's algorithm — numbered steps:**

1. Compute every vertex's indegree.
2. Enqueue all indegree-$0$ vertices.
3. Repeatedly: pop $u$, append to order; for each successor $v$, decrement indegree; enqueue $v$ if it hits $0$.
4. If $|order| = V$ (vertex count): valid order. Else: **cycle** — leftovers prove impossibility.

Time $O(V + E)$ — every vertex and edge processed once. Orders are rarely unique: any $0$-indegree pick is legal, so "the" topological order is a deliberate examiner trap.

**DFS variant.** Order vertices by *decreasing finish time* — one DFS plus one sort, same $O(V + E)$. Free when DFS already ran (Kosaraju's first pass is secretly half a topo-sorter).

::: callout-formula KTU Formula Vault: Topo Sort
DAG only · Kahn: $0$-indegree queue, $O(V+E)$ · leftovers ⟺ cycle · DFS finish-time descending works too · orders seldom unique.
:::

Topological order is *not* sorted order — vertex values are irrelevant, only edge directions constrain. Sorting labels increasingly is the classic non-answer.

::: callout-pitfall Cycle Denial
Running Kahn on a cyclic graph and presenting the partial order as "the answer" ignores the leftover vertices. Non-empty remainder *is* the verdict (no linearization exists) — always count the output: $|order| < V$ means cycle, full stop.
:::

---

<a id="worked-example"></a>
## 3. Worked example — Kahn on six vertices, fully traced

::: step [Step 1: Setup] Formulating the Problem
DAG edges: $5 \to 2$, $5 \to 0$, $4 \to 0$, $4 \to 1$, $2 \to 3$, $3 \to 1$. Run Kahn (seed queue $[4, 5]$); verify the order against every edge.
:::

::: step [Step 2: Execution] Draining the Queue
Indegrees: $0{:}2$, $1{:}2$, $2{:}1$, $3{:}1$, $4{:}0$, $5{:}0$. Pop $4$ → $0{:}1$, $1{:}1$; queue $[5]$. Pop $5$ → $2{:}0$ (enqueue), $0{:}0$ (enqueue); queue $[2, 0]$. Pop $2$ → $3{:}0$ (enqueue); queue $[0, 3]$. Pop $0$; queue $[3]$. Pop $3$ → $1{:}0$ (enqueue); queue $[1]$. Pop $1$. Order $[4, 5, 2, 0, 3, 1]$ — all $6$ emitted, acyclic confirmed.
:::

::: step [Step 3: Conclusion] Final Result
$[4, 5, 2, 0, 3, 1]$: $5 \to 2$ ✓, $5 \to 0$ ✓, $4 \to 0$ ✓, $4 \to 1$ ✓, $2 \to 3$ ✓, $3 \to 1$ ✓ — every prerequisite precedes its dependent. Seeding $[5, 4]$ forks $[5, 4, 2, 0, 3, 1]$ instead — non-uniqueness demonstrated, not feared.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- "Looks different from the model answer" is not "wrong": verify edge-by-edge, never by feel.
- Partial output on a cyclic graph is a *verdict* (impossible), never an answer to ship.
- One back edge in DFS vetoes everything: acyclic ⟺ no back edges ⟺ Kahn emits all $V$.

| Similar pair | Distinction that earns marks |
|---|---|
| Topological vs sorted order | Edge-direction-respecting vs label-increasing — unrelated |
| Partial vs complete Kahn output | Cycle certificate ($< V$) vs valid linearization ($= V$) |
| Kahn vs DFS-finish method | Queue discipline vs decreasing finish times — same $O(V+E)$ |

**Exam recap (facts an examiner rewards):** DAG-only precondition; Kahn's four steps with $O(V+E)$; leftover ⟺ cycle; decreasing-finish alternative; non-uniqueness is expected.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Validity drill: proposed order $[5, 4, 0, 2, 3, 1]$ for the worked DAG. Verdict?
() Invalid — $0$ appears before $2$
(*) Valid — all six edges check out ($5 \to 2$, $5 \to 0$, $4 \to 0$, $4 \to 1$, $2 \to 3$ with $2$ before $3$, $3 \to 1$); $0$-before-$2$ is unconstrained, so it is legal
() Invalid — $4$ must come last
() Valid only for cyclic graphs
::: explanation
Verify edge-by-edge, never by feel: no edge constrains $0$ vs $2$, so their relative order is free. Both $[4,5,2,0,3,1]$ and $[5,4,0,2,3,1]$ satisfy all six edges — non-uniqueness made concrete, and "looks different" is not "wrong".
:::

::: quiz Cycle certificate: Kahn emits $4$ of $7$ vertices, queue empty. Meaning?
() Rerun with a bigger queue
(*) The remaining $3$ contain a directed cycle — every leftover vertex has indegree $\ge 1$ from within the leftovers, so no $0$ can ever appear; linearization is impossible, and the leftovers localize the cycle
() Valid partial order, ship it
() Graph is a DAG regardless
::: explanation
$|order| < V$ with an empty queue is the decision procedure's NO: mutual prerequisites deadlock the drain. Report impossibility (plus the leftover subgraph as evidence), never a truncated "order".
:::

::: quiz Method choice: DFS already ran for SCC (M2.3) on a DAG. Cheapest topo order?
() Rerun Kahn from scratch
(*) Sort by decreasing finish time — the DFS data already encodes a valid linearization for free; recomputing indegrees redoes finished work, and Kosaraju's pass-one order is exactly this list
() Sort labels increasingly
() BFS levels equal topo order
::: explanation
Finish-time order *is* a topological order on DAGs (edges always go finish-late → finish-early... precisely: $u \to v$ implies finish[$u$] > finish[$v$]). Reuse beats recompute — one sort, zero new traversals.
:::
