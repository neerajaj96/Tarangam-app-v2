# Graphs: Definitions & Representation

**Vertices, edges, degrees, paths — and adjacency matrix vs list with the density rule.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Cities and Roads
Vertices = cities, edges = roads (directed = one-way, weighted = tolls). **Degree** counts incident roads (directed splits into in/out). A **path** is a road trip with no repeated city; a **cycle** returns home. **Connected** = reachable everywhere (undirected); directed needs mutual reachability (strong) vs underlying reachability (weak). Representation is the map format: full road-table (matrix) vs per-city signposts (list).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Vocabulary (exam-exact)

* Complete graph $K_n$: all $n(n-1)/2$ edges. Subgraph, spanning (all vertices).
* Handshaking: $\sum \deg = 2|E|$; trees: $|E| = |V|-1$, connected, acyclic.
* Directed: in/out-degree; DAG (no directed cycles).

### 2.2 Matrix vs list

* **Adjacency matrix** $n\times n$: $O(1)$ edge query, $O(n)$ neighbour scan, $\Theta(n^2)$ space — dense graphs.
* **Adjacency list** per-vertex neighbour lists: $O(\deg)$ neighbours, $\Theta(V+E)$ space — sparse graphs. Weighted: store $(nbr, w)$ pairs.

::: callout-formula KTU Formula Vault: Graphs
$\sum\deg = 2|E|$ · tree $|E|=|V|-1$ · dense → **matrix**, sparse → **list** $\Theta(V+E)$.
:::

::: callout-pitfall Density Decides, Not Habit
Matrix on a sparse $10^5$-vertex graph needs $10^{10}$ cells — instant memory death. Default to lists unless dense/edge-query-heavy; state the density reason in one line.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Undirected graph: degrees $3, 2, 2, 1$. How many edges? Tree? Give adjacency lists for path $1-2-3-4$.
:::

::: step [Step 2: Execution] Sum, Test, List
1. $\sum = 8$ → $|E| = 4$. Four vertices + $4$ edges $\ne |V|-1$ → not a tree (has a cycle).
2. $1:[2]$, $2:[1,3]$, $3:[2,4]$, $4:[3]$.
:::

::: step [Step 3: Conclusion] Final Result
Handshaking first (edge count + parity sanity: sum must be even), tree test second, representation third. Odd degree-sum flags bad data instantly.
:::

::: anim adjlist-vs-matrix Path 1-2-3-4 in Three Formats
Watch the same path drawn as a graph, listed per vertex, then gridded — then the density verdict that picks lists for sparse giants.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Degrees $4, 3, 3, 2, 2$. Edges? Valid?
(A) $7$, invalid
(*B) Sum $14$ → $7$ edges, valid (even sum, max degree $< 5$ vertices)
(C) $14$ edges
(D) $5$ edges
::: explanation
$|E| = 14/2 = 7$. Odd sums are impossible (handshaking) — parity is the two-second validity screen before any deeper work.
:::

::: quiz Q2: Foundational Concept
Sparse road network, $10^6$ cities, $3\times10^6$ roads. Representation?
(A) Adjacency matrix
(*B) Adjacency list — $\Theta(V+E)$ vs matrix's $10^{12}$ cells
(C) Edge list only for all queries
(D) Complete graph
::: explanation
Matrix needs a trillion cells for $0.0003\%$ occupancy; lists store only real roads. Neighbour iteration (the traversal need) is also $O(\deg)$-optimal in lists.
:::

::: quiz Q3: Foundational Concept
$|V| = 8$, $|E| = 7$, connected. Tree?
(A) Cannot tell
(*B) Yes — connected + $|E| = |V|-1$ certifies a tree (acyclicity follows)
(C) No, needs $8$ edges
(D) Only if directed
::: explanation
Any two of {connected, acyclic, $|E|=|V|-1$} imply the third for undirected graphs. Quote the pair you verified — the certificate is the answer.
:::
