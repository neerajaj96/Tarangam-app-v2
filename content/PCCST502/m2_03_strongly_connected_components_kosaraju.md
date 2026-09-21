---
id: m2_03_strongly_connected_components_kosaraju
courseCode: PCCST502
module: 2
sequence: 3
title: Strongly Connected Components: Kosaraju's Algorithm
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Define components through mutual reachability classes
  - Order pass one by DFS finishing times on the original graph
  - Harvest one component per tree on the transpose in order
concepts:
  - strongly connected components
  - Kosaraju's algorithm
  - condensation DAG
prerequisites:
  - m2_02_graph_traversals_bfs_and_dfs
examRelevance: high
tags:
  - graphs
  - connectivity
---
# Strongly Connected Components: Kosaraju's Algorithm

**Mutual reachability, the condensation DAG, finishing-time order, the two-pass method on G and transpose, and why the order is load-bearing.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** In a directed graph, "connected" splits in two: $u$ may reach $v$ while $v$ cannot return. A **strongly connected component (SCC)** is a maximal group with round trips everywhere inside (every member reaches every other). Task: partition all vertices into these groups. Naive pairwise reachability is far too slow; Kosaraju does it in two linear passes.

::: callout-intuition Core Mental Model: Island Chains in a One-Way Current
Islands linked by one-way ferries: an SCC is a group with round trips between every pair. Between groups travel is one-way — collapse each group to a dot and the dots form a DAG (Directed Acyclic Graph: no directed cycles), since a cycle of groups would merge into one. Kosaraju's trick: record the order a first expedition *finishes* islands, then re-explore the *reversed* map in that order — each re-exploration nets exactly one group. Drop the islands now: finish times and the transpose below are the exact mechanism.
:::

**Tiny toy example (3 vertices).** Edges $a \to b$, $b \to a$ (round trip!), $b \to c$ (one-way out). SCCs: $\{a, b\}$ (mutual) and $\{c\}$ (can be reached, never returns). Collapsed: $\{a,b\} \to \{c\}$ — a 2-node DAG.

::: toggle What do `connected component`, `reachability`, and `strongly` mean?
`Connected component` (undirected) = a group joined by paths ignoring direction. `Reachability` ($u \leadsto v$) = a directed path exists from $u$ to $v$ (one-way counts). `Strongly` upgrades the requirement to round trips: $u \leadsto v$ AND $v \leadsto u$ for every pair inside. Tiny check: $b \to c$ alone makes $\{b,c\}$ connected but not strongly (no return) — "strongly" means mutual, never one-way.
:::

::: toggle Why must pass 2 run on the `transpose` in decreasing finish order?
Transpose ($G^T$, every edge reversed) turns pass-1's source SCC into a sink: DFS from it cannot escape its own group (all reversed edges point inward). Decreasing finish order starts each peeling from a current sink, so each DFS tree harvests exactly one SCC. Arbitrary order bleeds across groups (a mid-order start walks into neighbours); increasing order starts at sinks of $G$ (= sources of $G^T$) and floods outward — the order is load-bearing, not bookkeeping.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols and abbreviations:** $G$ = original directed graph; $G^T$ = transpose (every edge reversed, nothing added/removed — not the complement); SCC = strongly connected component; $u \leadsto v$ = a directed path from $u$ to $v$.

**Definitions.** $u, v$ are **mutually reachable** if $u \leadsto v$ AND $v \leadsto u$. Mutual reachability is an equivalence relation; its classes are the SCCs. The **condensation** (one node per SCC, edges between SCCs) is always a **DAG** — proof in one line: a directed cycle among SCCs would merge them into a single SCC.

**Kosaraju's two passes — numbered steps:**

1. **Pass 1:** DFS on $G$; push each vertex onto a stack when it *finishes*.
2. **Pass 2:** DFS on the **transpose** $G^T$, visiting vertices by popping the stack (*decreasing* finish-time order). Each DFS tree grown is exactly one SCC.

::: anim kosaraju-passes Two Passes, Two Geometries
Watch pass 1 stamp finish order on G, then the transpose pass peel the triangle {1,2,3} as one SCC while loner 4 falls out alone — the order doing the correctness work.
:::

```text
G:  A --> B --> C          G^T (reversed):  A <-- B <-- C
^     |   ^                      |     |   |
|     v   |                      v     |   v
D <-- E   F                      D --> E   F
(pass 1 finishes F,C,B,E,A,D?) (pass 2 peels SCCs in that order)
```

**Why the order works (proof intuition).** The last-finishing vertex of pass 1 sits in a **source SCC** of the condensation. Reversing edges turns that source into a **sink** in $G^T$ — DFS from it cannot escape its own SCC. Peeling sinks one by one partitions the graph exactly. Pass 2 in *arbitrary* order bleeds across SCCs — the decreasing-finish order is load-bearing, not bookkeeping. Total: two linear passes → $\Theta(V+E)$.

::: callout-formula KTU Formula Vault: Kosaraju in 4 Lines
SCC = **mutual reachability class** · condensation is a **DAG** · pass 1: DFS on **G**, stack by **finish time** · pass 2: DFS on **transpose** in **decreasing finish order**, each tree = one SCC. Time $\Theta(V+E)$ — two linear passes, nothing more.
:::

::: callout-pitfall Transpose, Not Complement — and Order Matters
$G^T$ flips every edge's *direction*; it does not add/remove edges (that is the complement — instant zero if confused). And pass 2 in *increasing* finish order re-merges SCCs: the decreasing order is load-bearing, not bookkeeping.
:::

---

<a id="worked-example"></a>
## 3. Worked example — triangle plus tail

::: step [Step 1: Setup] Formulating the Problem
Directed graph: $1 \to 2,\ 2 \to 3,\ 3 \to 1$ (triangle) plus $3 \to 4$ (tail). Find all SCCs, showing both passes (DFS from 1, numeric order).
:::

::: step [Step 2: Execution] Running Both Passes
**Pass 1 (DFS on G from 1):** $1 \to 2 \to 3$: from 3, neighbour 1 is gray (back edge, ordering only), neighbour 4 white → discover 4, finish 4 first. Back up: finish 3, 2, 1. Finish stack bottom→top: $[4, 3, 2, 1]$; decreasing finish order $1, 2, 3, 4$. **Pass 2 (DFS on $G^T$):** transpose edges $2\to1,\ 3\to2,\ 1\to3,\ 4\to3$. Pop 1: reach $\{1,3,2\}$ ($1\to3\to2\to1$); 4 unreachable ($4\to3$ points away) → **SCC $\{1,2,3\}$**. Next unvisited 4 → alone → **SCC $\{4\}$**.
:::

::: step [Step 3: Conclusion] Final Result
SCCs $\{1,2,3\}$ (mutual reachability all around) and $\{4\}$ (reachable *from* the triangle, nothing returns — the one-way tail). The reversed $4\to3$ quarantined 4: the transpose doing its job.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Transpose $\ne$ complement: reverse directions only; vertex and edge counts never change.
- Pass 1 records *finish* order, not discovery order — pushing at discovery breaks the source/sink argument.
- One-way reachability ($u \leadsto v$ alone) never merges vertices; mutuality is mandatory.

| Similar pair | Distinction that earns marks |
|---|---|
| Transpose vs complement | Reverse all arcs vs add/remove arcs — opposite operations |
| Decreasing vs increasing finish order | Sinks-first (exact partition) vs bleed-across (fused, wrong) |
| SCC vs connected component | Mutual directed reachability vs undirected reachability |

**Exam recap (facts an examiner rewards):** SCC = mutual-reachability class; condensation is a DAG; pass 1 finishes on $G$, pass 2 decreasing on $G^T$, each tree one SCC; $\Theta(V+E)$.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Why must pass 2 run on the transpose graph rather than the original?
() The transpose has fewer edges, so it runs faster
(*) Reversing edges turns the last-finished source SCC into a sink, so each pass-2 DFS is trapped inside exactly one SCC instead of bleeding into others
() The transpose removes all cycles, making DFS trivial
() It doesn't matter; Kosaraju works on any second graph
::: explanation
Pass 1's finish order identifies source SCCs; transposition converts sources to sinks. A DFS starting in a sink cannot leave it (no outgoing reversed edges to other SCCs), so each tree harvested is precisely one component. Same-graph DFS would leak downstream and fuse distinct SCCs.
:::

::: quiz The condensation of any directed graph (one node per SCC) is always a DAG. Why?
() Because Kosaraju's algorithm deletes all back edges
(*) A directed cycle among SCCs would make all its members mutually reachable, contradicting maximality — so no such cycle can exist
() Condensation graphs are defined to be undirected
() SCCs can never have edges between them at all
::: explanation
If SCC-nodes $C_1 \to C_2 \to C_1$ existed, every vertex in $C_1$ reaches every vertex in $C_2$ and back — mutual reachability across the supposed boundary, so they were one SCC all along. Maximality forbids inter-component cycles by definition.
:::

::: quiz In pass 1, vertex v finishes after vertex u. In pass 2's decreasing-finish order, v is processed first. What structural fact does v's late finish encode?
() v has more outgoing edges than u
(*) v sits in a source SCC (nothing unvisited points away from it unresolved) — the last-finished vertex anchors the peeling order that makes pass 2 exact
() v is guaranteed to be a singleton SCC
() Late finish means v was discovered last
::: explanation
DFS finishes a vertex only after exhausting its reachable frontier; the globally-last finisher's SCC has no other SCC pointing *into* it — a source of the condensation DAG. Processing sources-first on the *transposed* graph (where they're sinks) is the whole correctness argument.
:::
