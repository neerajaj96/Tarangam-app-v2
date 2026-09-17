# Graph Traversals: BFS & DFS

**Queues vs. stacks, shortest paths in unweighted graphs, edge classification, timestamps, and the shared O(V+E) skeleton.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Exploring a Cave
**BFS** explores like ripples in a pond: fully sweep everything one step away, then everything two steps away — you always know the *nearest* exit first. **DFS** explores like unrolling string down one tunnel: plunge as deep as possible, backtrack only at dead ends. Same cave, same total footsteps $\Theta(V+E)$ — but ripples find nearest things while string finds deep things (and reveals the cave's loop structure).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 BFS: Queue, Layers, Shortest Paths

BFS from $s$ uses a **FIFO queue**, paints vertices white/gray/black, and records distance $d[v]$ (edges from $s$) plus predecessor $\pi[v]$.

```text
BFS layers from s (numbers = distance):

        s(0)
       /    \
    a(1)    b(1)
    /  \       \
 c(2)  d(2)    e(2)
```

* Vertices are finished in **nondecreasing distance** — so $d[v]$ is the *shortest-path* distance in edges (unweighted graphs only!).
* Every edge is examined twice (undirected) → time $\Theta(V+E)$, space $\Theta(V)$.

### 2.2 DFS: Stack/Recursion, Timestamps, Edge Types

DFS stamps each vertex with discovery/finish times ($d[v]$, $f[v]$ — parenthesis structure: intervals nest or disjoint, never partially overlap) and classifies every edge in *directed* graphs:

| Edge $u \to v$ when explored | Condition | Meaning |
|---|---|---|
| Tree | $v$ white | First discovery — builds the DFS forest |
| Back | $v$ gray (ancestor) | A cycle exists through $v$ |
| Forward | $v$ black, $d[u]<d[v]$ | Shortcut down the same lineage |
| Cross | $v$ black, otherwise | Jump between branches/subtrees |

* Undirected graphs have **only tree + back edges** (no forward/cross — the edge is seen from both ends).
* Same $\Theta(V+E)$ skeleton as BFS; recursion depth can hit $V$ (stack overflow on path graphs — the iterative version exists for exactly this reason).

::: anim bfs-layers Ripple Expansion Order
Watch nodes ignite layer by layer — s, then a and b, then c, d, e, then f and g. No node lights before every node nearer the source: nondecreasing distance, animated.
:::

::: callout-formula KTU Formula Vault: Traversal Facts
BFS = **queue**, layers, **shortest path (unweighted)**. DFS = **stack/recursion**, timestamps, **edge classification**. Both $\Theta(V+E)$. Directed edges: **tree/back/forward/cross** (gray target = back = cycle). Undirected: **tree + back only**.
:::

::: callout-pitfall BFS "Shortest" Means Fewest Edges, Not Cheapest
BFS distances count *hops*. On weighted graphs (road lengths, costs) BFS's answer can be wildly non-optimal — that job belongs to Dijkstra/UCS (Module 3). Any option claiming BFS minimizes *weights* is the planted distractor.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Directed graph: $1 \to 2,\ 1 \to 3,\ 2 \to 3,\ 3 \to 1$. Run DFS from vertex 1 (neighbors in numeric order); then run BFS from 1. Classify each edge in the DFS run and give BFS distances.
:::

::: step [Step 2: Execution] Tracing Both Runs
**DFS:** discover 1 ($d=1$); edge $1\to2$: 2 white → **tree**, discover 2 ($d=2$); edge $2\to3$: 3 white → **tree**, discover 3 ($d=3$); edge $3\to1$: 1 gray (ancestor) → **back** (cycle!); finish 3,2,1. Remaining edge $1\to3$: 3 black with $d[1]<d[3]$ → **forward**.
**BFS:** queue: 1 ($d=0$) → 2,3 ($d=1$ each) → done. $d = \{1:0,\ 2:1,\ 3:1\}$.
:::

::: step [Step 3: Conclusion] Final Result
One graph, two stories: DFS exposes the $3\to1$ back edge (cycle detected) plus a forward shortcut; BFS certifies both 2 and 3 are one hop from 1. Use DFS to *understand structure* (cycles, ordering — next topic), BFS to *measure unweighted distance*.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
