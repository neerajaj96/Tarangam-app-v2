---
id: m3_03_single_source_shortest_paths_dijkstra
courseCode: PCCST502
module: 3
sequence: 3
title: 'Single-Source Shortest Paths: Dijkstra'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Settle vertices greedily with extract-min and relaxation
  - Enforce the non-negative-weight contract against voiding edges
  - Separate Dijkstra from BFS and Prim in the confusion trio
concepts:
  - Dijkstra's algorithm
  - relaxation
  - greedy settling
prerequisites:
  - m3_01_greedy_strategy_control_abstraction
examRelevance: high
tags:
  - greedy
  - shortest-paths
---
# Single-Source Shortest Paths: Dijkstra

**Greedy settling order, relaxation, the non-negative-weight contract, a hand-settled trace, and why one negative edge voids everything.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Expanding Ink Blot
Drop ink on your start city on a map of roads: the stain spreads along every road simultaneously at equal speed. The moment the ink *first* touches a city, the path it took is the shortest possible — no later arrival can beat first contact, because all spread moves at the same rate. **Dijkstra's algorithm** simulates exactly this blot with a priority queue: repeatedly *settle* the unsettled vertex with the smallest tentative distance (first contact = final answer), then *relax* its outgoing roads (offer neighbors a possibly shorter route through it).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Relaxation and Settling

* Maintain tentative distances $d[v]$ (∞ except $d[s]=0$). Repeatedly extract-min unsettled $u$ (**settle** it: $d[u]$ is final) and **relax** each edge $(u,v,w)$: if $d[u]+w < d[v]$, set $d[v] = d[u]+w$ (and remember predecessor $u$).
* Correctness hinge: extraction order is nondecreasing in final distance — a settled vertex can never be improved later, *provided all weights are non-negative* (any alternative path to $u$ must extend an unsettled vertex with distance $\ge d[u]$, plus non-negative edges).

### 2.2 The Non-Negative Contract

One negative edge can make a *settled* vertex improvable (arrive cheaply late via the negative edge) — the extraction invariant shatters, and outputs go silently wrong (not merely slow). Negative weights demand Bellman-Ford (slower, detects negative cycles); Dijkstra simply *assumes them away*. Complexity with binary heap: $\Theta((V+E) \log V)$.

### 2.3 Dijkstra vs. BFS vs. Prim (the Confusion Trio)

* **BFS:** Dijkstra with all weights $=1$ (queue suffices; settles by hops).
* **Prim:** same *machinery* (priority queue, growing frontier) but minimizes *attachment cost* (cheapest edge to tree), not *path distance from source* — identical code shape, different key, different problem.

::: callout-formula KTU Formula Vault: Dijkstra Facts
Loop: **extract-min (settle) → relax outgoing** · needs **non-negative weights** (else Bellman-Ford) · $\Theta((V+E)\log V)$ heap · BFS = **unit-weight Dijkstra** · Prim = **same skeleton, edge-key instead of path-key**.
:::

::: callout-pitfall Settled Means Final — Only Without Negatives
Students trace Dijkstra on negative-weight graphs and "get answers" — all of them suspect. The algorithm *runs* fine (no crash); its *guarantee* evaporates. If any weight is negative, switch algorithms (Bellman-Ford), don't switch hope.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Graph: $1\!-\!2(4), 1\!-\!3(2), 2\!-\!3(1), 2\!-\!4(5), 3\!-\!4(8), 3\!-\!5(10), 4\!-\!5(2), 4\!-\!6(6), 5\!-\!6(3)$ (undirected). Run Dijkstra from vertex 1: give the settle order and final distances.
:::

::: step [Step 2: Execution] Settling One by One
$d = \{1:0\}$, rest ∞. Settle **1** (0): relax → $d[2]=4, d[3]=2$. Settle **3** (2): relax → $d[2] = \min(4, 2+1) = 3$ (improved via 3!), $d[4]=10$, $d[5]=12$. Settle **2** (3): relax → $d[4] = \min(10, 3+5) = 8$. Settle **4** (8): relax → $d[5] = \min(12, 8+2) = 10$, $d[6]=14$. Settle **5** (10): relax → $d[6] = \min(14, 10+3) = 13$. Settle **6** (13). Done.
:::

::: step [Step 3: Conclusion] Final Result
Settle order **1, 3, 2, 4, 5, 6** with distances **{0, 3, 2, 8, 10, 13}** — note vertex 2 settles *second* at distance 3 via $1\to3\to2$, beating its direct edge (4): settling order is by *distance*, not by discovery, which is exactly the beginner surprise this trace exists to deliver.

:::

::: anim dijkstra-settle Settling in Distance Order
Watch vertices lock in 1 → 3 → 2 → 4 → 5 → 6 with final distances stamped beneath — discovery order ignored, distance order obeyed, exactly as traced above.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz In the worked trace, vertex 2 is discovered first (distance 4, direct edge) but settles second (distance 3, via vertex 3). What principle does this demonstrate?
() Dijkstra processes vertices in discovery order
(*) Extraction is by smallest tentative distance, and relaxation can improve a discovered vertex before it settles — settling order need not match discovery order
() Vertex 2 should have settled first; the trace contains an error
() Direct edges always give final distances immediately
::: explanation
Discovery $\neq$ finality: $d[2]=4$ was provisional until vertex 3 offered $2+1=3$. The priority queue always extracts the current minimum *unsettled* vertex — that ordering discipline (not arrival order) is what makes settled distances trustworthy.
:::

::: quiz A graph has one negative edge but no negative cycles. Dijkstra runs to completion and prints distances. Status of the output?
() Correct — Dijkstra handles isolated negative edges fine
(*) Untrustworthy — the non-negative contract is violated, so the settling invariant may fail silently; Bellman-Ford is the correct tool
() Correct only for the vertices settled before the negative edge is relaxed
() The algorithm crashes, so there is no output to judge
::: explanation
Dijkstra never checks its precondition — it happily settles vertices whose distances a late-arriving negative edge could still improve. Silence, not failure, is the danger: wrong numbers with full confidence. One negative edge anywhere → switch to Bellman-Ford.
:::

::: quiz Dijkstra and Prim look nearly identical in code (priority queue, growing set, relaxation-like updates). What single difference separates the problems they solve?
() Dijkstra uses a queue while Prim uses a stack
(*) Dijkstra keys vertices by *path distance from the source* (minimize route cost); Prim keys by *cheapest single attachment edge to the tree* (minimize connection cost) — same skeleton, different key, MST vs shortest paths
() Prim requires negative weights; Dijkstra forbids them
() They are the same algorithm with different variable names
::: explanation
$d[v] = $ best known *source→v path* (Dijkstra) vs. $key[v] = $ cheapest *edge into the tree* (Prim). Swap the key definition and each algorithm morphs toward the other — the classic "same code, different objective" pair every exam probes.
:::
