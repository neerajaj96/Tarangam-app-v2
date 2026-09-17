# Strongly Connected Components: Kosaraju's Algorithm

**Mutual reachability, the condensation DAG, finishing-time order, the two-pass method on G and transpose, and why the order is load-bearing.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Island Chains in a One-Way Current
Picture islands linked by one-way ferry routes. A **strongly connected component (SCC)** is a maximal group where you can sail from *any* island to *any* other (round trips everywhere inside). Between groups, travel is one-way — collapse each group to a single dot and the dots form a **DAG** (cycles can't survive: a cycle of groups would just be one bigger group). Kosaraju's trick: process islands in the order a first expedition *finishes* them, then re-explore the *reversed* map — each re-exploration nets exactly one island group, no mixing.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Definitions

* $u, v$ are **mutually reachable** if paths $u \leadsto v$ AND $v \leadsto u$ both exist. Mutual reachability is an equivalence relation; its classes are the **SCCs**.
* The **condensation** (one node per SCC, edges between SCCs) is always a **DAG** — the proof is one line: a directed cycle among SCCs would merge them into a single SCC.

### 2.2 Kosaraju's Two Passes

1. **Pass 1:** DFS on $G$; record vertices in order of *finishing* time (push each vertex onto a stack when it finishes).
2. **Pass 2:** DFS on the **transpose** $G^T$ (every edge reversed), visiting vertices in *decreasing* finish-time order (pop the stack). Each DFS tree grown is exactly one SCC.

```text
G:  A --> B --> C          G^T (reversed):  A <-- B <-- C
^     |   ^                      |     |   |
|     v   |                      v     |   v
D <-- E   F                      D --> E   F
(pass 1 finishes F,C,B,E,A,D?) (pass 2 peels SCCs in that order)
```

### 2.3 Why the Order Works (proof intuition)

The vertex finishing *last* in pass 1 belongs to a **source SCC of the condensation** (nothing outside points... precisely: no path *into* it from unvisited SCCs remains). Reversing all edges turns that source into a **sink** in $G^T$ — so DFS from it in pass 2 cannot escape its own SCC. Peeling sinks one by one partitions the graph exactly. Run pass 2 in *arbitrary* order and one DFS bleeds across SCCs — the order is the algorithm.

::: callout-formula KTU Formula Vault: Kosaraju in 4 Lines
SCC = **mutual reachability class** · condensation is a **DAG** · pass 1: DFS on **G**, stack by **finish time** · pass 2: DFS on **transpose** in **decreasing finish order**, each tree = one SCC. Time $\Theta(V+E)$ — two linear passes, nothing more.
:::

::: callout-pitfall Transpose, Not Complement — and Order Matters
$G^T$ flips every edge's *direction*; it does not add/remove edges (that's the complement — instant zero if confused). And pass 2 in *increasing* finish order re-merges SCCs: the decreasing order is load-bearing, not bookkeeping.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Directed graph: $1 \to 2,\ 2 \to 3,\ 3 \to 1$ (a triangle) plus $3 \to 4$ (a tail). Find all SCCs with Kosaraju, showing both passes. (Start DFS at vertex 1, numeric neighbor order.)
:::

::: step [Step 2: Execution] Running Both Passes
**Pass 1 (DFS on G from 1):** $1 \to 2 \to 3$: from 3, neighbor 1 is gray (back edge, ignore for ordering), neighbor 4 white → discover 4, finish 4 first. Back up: finish 3, then 2, then 1. Finish stack (bottom→top): $[4, 3, 2, 1]$, so decreasing finish order is $1, 2, 3, 4$.
**Pass 2 (DFS on $G^T$):** transpose edges: $2\to1,\ 3\to2,\ 1\to3,\ 4\to3$. Pop 1: from 1 reach $\{1,3,2\}$ (via $1\to3\to2\to1$) — 4 unreachable ($4\to3$ points the wrong way) → **SCC $\{1,2,3\}$**. Next unvisited: 4 → alone → **SCC $\{4\}$**.
:::

::: step [Step 3: Conclusion] Final Result
SCCs: $\{1,2,3\}$ (the triangle — mutual reachability holds all around) and $\{4\}$ (reachable *from* the triangle, but nothing returns — the one-way tail). Note how pass 2's reversed edge $4\to3$ quarantined 4 instead of merging it: the transpose doing its job.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
