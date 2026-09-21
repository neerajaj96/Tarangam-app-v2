---
id: m2_02_graph_traversals_bfs_and_dfs
courseCode: PCCST502
module: 2
sequence: 2
title: Graph Traversals: BFS & DFS
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Layer unweighted shortest paths with queue-driven BFS
  - Classify directed edges with DFS timestamps and colors
  - Run both traversals on the shared vertex-plus-edge skeleton
concepts:
  - breadth-first search
  - depth-first search
  - edge classification
prerequisites: []
examRelevance: medium
tags:
  - graphs
  - traversals
---
# Graph Traversals: BFS & DFS

**Queues vs. stacks, shortest paths in unweighted graphs, edge classification, timestamps, and the shared O(V+E) skeleton.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Given a graph (vertices = places, edges = links) and a start vertex, how do we visit everything reachable — and what intelligence do we gain? Two orders exist. BFS (Breadth-First Search) fans out in rings: all 1-hop neighbours, then all 2-hop ones — so it learns *nearest-first distances*. DFS (Depth-First Search) plunges down one path to its end before backtracking — so it learns *structure* (loops, orderings).

::: callout-intuition Core Mental Model: Exploring a Cave
**BFS** spreads like pond ripples: sweep everything one step away, then two — you always meet the *nearest* exit first. **DFS** unrolls string down one tunnel: plunge deep, backtrack only at dead ends. Same cave, same footsteps $\Theta(V+E)$ — ripples measure nearness, string exposes loops. Drop the cave now: queues, colours, and timestamps below are the exact machinery.
:::

**Tiny toy example (4 vertices).** Line $s-a-b-c$. BFS visits $s, a, b, c$ with distances $0, 1, 2, 3$. DFS from $s$ also visits all four but discovers them by plunging $s \to a \to b \to c$ with no branching — same coverage, different story told.

::: toggle What are `vertex`, `edge`, `directed`, `degree`, `path`, `cycle`?
`Vertex` = a place/node (a dot). `Edge` = a link between two vertices (a line; arrowed if directed). `Directed` = edges have one-way direction ($u \to v$ permits travel only $u$ to $v$); undirected = both ways. `Degree` = edges touching a vertex (popularity count). `Path` = a vertex sequence joined by edges (a route). `Cycle` = a path returning to its start (a loop — what DFS back edges expose).
:::

::: toggle Trace BFS queue states on `s—a,b; a—c,d; b—e`
Queue [s], d=0. Dequeue s → enqueue a, b (d=1): queue [a,b]. Dequeue a → enqueue c, d (d=2): queue [b,c,d]. Dequeue b → enqueue e (d=2): queue [c,d,e]. Dequeue c, d, e (no new): queue drains. Order s,a,b,c,d,e with distances 0,1,1,2,2,2. Why mark visited at enqueue (not dequeue): otherwise diamond revisits enqueue the same vertex twice — marking on entry guarantees one queue slot each.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols:** $V$ = vertex count, $E$ = edge count; $d[v]$ = distance (BFS) or discovery time (DFS); $\pi[v]$ = predecessor; colours white (unseen), gray (on the DFS stack), black (finished).

**BFS: queue, layers, shortest paths — numbered steps:**

1. Enqueue start $s$ with $d[s] = 0$; mark seen.
2. Repeatedly dequeue $u$; for each neighbour $v$ unseen, set $d[v] = d[u]+1$, $\pi[v] = u$, enqueue $v$.
3. Vertices finish in **nondecreasing distance** — so $d[v]$ is the fewest-edges path from $s$ (unweighted graphs only).
4. Cost: each vertex dequeued once, each edge examined twice (undirected) → time $\Theta(V+E)$, space $\Theta(V)$.

```text
BFS layers from s (numbers = distance):

        s(0)
       /    \
    a(1)    b(1)
    /  \       \
 c(2)  d(2)    e(2)
```

**DFS: stack/recursion, timestamps, edge types.** Stamp discovery/finish times ($d[v]$, $f[v]$): intervals nest or stay disjoint, never half-overlap. Classify each directed edge $u \to v$ at exploration:

| Edge $u \to v$ when explored | Condition | Meaning |
|---|---|---|
| Tree | $v$ white | First discovery — builds the DFS forest |
| Back | $v$ gray (ancestor) | A cycle exists through $v$ |
| Forward | $v$ black, $d[u]<d[v]$ | Shortcut down the same lineage |
| Cross | $v$ black, otherwise | Jump between branches/subtrees |

Undirected graphs have **only tree + back edges** (each edge is seen from both ends, killing forward/cross). Same $\Theta(V+E)$ skeleton; recursion depth can reach $V$ (iterative DFS exists for path-graph stack safety).

::: toggle What do `discovery/finish times` and the four edge colours mean?
Discovery $d[v]$ = the clock tick when DFS first reaches $v$; finish $f[v]$ = the tick when $v$'s whole subtree completes (intervals nest or stay disjoint — never half-overlap). White = unseen, gray = on the current stack (an ancestor of the active node), black = finished. Edge to white = tree (first discovery); to gray = back (ancestor reached — a cycle exists); to black descendant = forward (lineage shortcut); to black otherwise = cross (branch jump). Tiny check: $3 \to 1$ with 1 gray means 1 is an ancestor — cycle certified.
:::

::: anim bfs-layers Ripple Expansion Order
Watch nodes ignite layer by layer — s, then a and b, then c, d, e, then f and g. No node lights before every node nearer the source: nondecreasing distance, animated.
:::

::: callout-formula KTU Formula Vault: Traversal Facts
BFS = **queue**, layers, **shortest path (unweighted)**. DFS = **stack/recursion**, timestamps, **edge classification**. Both $\Theta(V+E)$. Directed edges: **tree/back/forward/cross** (gray target = back = cycle). Undirected: **tree + back only**.
:::

::: callout-pitfall BFS "Shortest" Means Fewest Edges, Not Cheapest
BFS distances count *hops*. On weighted graphs (road lengths, costs) BFS can be wildly non-optimal — that job belongs to Dijkstra/UCS (Module 3). Any option claiming BFS minimizes *weights* is the planted distractor.
:::

---

<a id="worked-example"></a>
## 3. Worked example — one directed graph, both traversals

::: step [Step 1: Setup] Formulating the Problem
Directed graph: $1 \to 2,\ 1 \to 3,\ 2 \to 3,\ 3 \to 1$. Run DFS from 1 (numeric neighbour order), classify every edge; then BFS from 1 with distances.
:::

::: step [Step 2: Execution] Tracing Both Runs
**DFS:** discover 1 ($d=1$); $1\to2$: 2 white → **tree**, discover 2 ($d=2$); $2\to3$: 3 white → **tree**, discover 3 ($d=3$); $3\to1$: 1 gray (ancestor) → **back** (cycle!); finish 3, 2, 1. Remaining $1\to3$: 3 black with $d[1]<d[3]$ → **forward**. **BFS:** queue 1 ($d=0$) → 2, 3 ($d=1$ each) → done: $d = \{1:0,\ 2:1,\ 3:1\}$.
:::

::: step [Step 3: Conclusion] Final Result
DFS exposes the $3\to1$ back edge (cycle) plus a forward shortcut; BFS certifies 2 and 3 are each one hop away. DFS maps *structure* (cycles, orderings — next notes); BFS measures *unweighted distance*.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Colour decides the edge type — vertex *numbers* never do. A "backward-numbered" edge to a black vertex is cross, not back.
- BFS on weighted graphs gives hop-optimal, not cost-optimal, paths.
- Gray = currently on the recursion stack = ancestor. Black = finished. White = unseen.

| Similar pair | Distinction that earns marks |
|---|---|
| BFS vs DFS output | Hop layers/distances vs timestamps/edge types — same cost, different intelligence |
| Back vs cross edge | Gray ancestor (cycle proof) vs black other-branch (history) |
| Tree vs forward edge | White target (discovery) vs black descendant (shortcut) |

**Exam recap (facts an examiner rewards):** BFS queue + $\Theta(V+E)$ + unweighted-shortest; DFS colours + four directed types (undirected: two); gray target ⟺ back edge ⟺ directed cycle.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz During DFS of a directed graph, you traverse edge u → v and find v is gray (an ancestor in the current recursion stack). What is this edge, and what does it prove?
() A cross edge; proves the graph is disconnected
(*) A back edge; proves the graph contains a directed cycle through v
() A forward edge; proves u and v are in different components
() A tree edge; proves v was just discovered
::: explanation
Gray means "on the current DFS path from the root" — reaching back up to it closes a directed loop. Back edges are exactly the cycle detectors; tree edges go to *white* (undiscovered) vertices, and color is the whole classification key.
:::

::: quiz BFS from s reports d[v] = 3. What does this guarantee, and what does it NOT guarantee?
() Guarantees the cheapest weighted path costs 3; guarantees nothing else
(*) Guarantees a 3-edge path exists and no shorter-edge path does; guarantees nothing about weighted costs
() Guarantees v is in a different connected component
() Guarantees the graph has exactly 3 vertices
::: explanation
BFS layers certify hop-count optimality only — "3 edges, and provably not 0, 1, or 2." Weights never enter the computation, so any cost claim is unfounded. (This is the vault's pitfall, tested straight.)
:::

::: quiz Both BFS and DFS run in Θ(V+E). Why must every correct traversal pay at least this much?
() Because sorting the vertices alphabetically costs that much
(*) Every vertex must be visited (V) and every edge inspected to know the graph fully — no algorithm can certify connectivity or distances while ignoring an edge that might matter
() The queue/stack operations alone cost V+E regardless of graph size
() It is merely convention; O(V) suffices for all graphs
::: explanation
$\Omega(V)$ to touch all vertices, $\Omega(E)$ because an unexamined edge could hide the only path/cycle — lower bounds matching the algorithms' actual cost, hence tight $\Theta(V+E)$ for both.
:::
