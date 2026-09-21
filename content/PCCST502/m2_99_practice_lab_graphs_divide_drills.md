---
id: m2_99_practice_lab_graphs_divide_drills
courseCode: PCCST502
module: 2
sequence: 99
title: 'Module 2 Practice Lab: Graphs & Divide-and-Conquer Drills'
difficulty: intermediate
estimatedMinutes: 10
learningObjectives:
  - Operate union-find with ranks on the table exactly
  - Autopsy DFS into four edge species without confusion
  - Price Strassen against naive at sixty-four honestly
concepts:
  - union-find surgery
  - DFS autopsy
  - Strassen verdicts
prerequisites:
  - m2_01_disjoint_sets_and_union_find
  - m2_02_graph_traversals_bfs_and_dfs
  - m2_03_strongly_connected_components_kosaraju
  - m2_04_divide_and_conquer_merge_sort_and_strassen
examRelevance: high
tags:
  - graphs-divide
  - m2-lab
---
# Module 2 Practice Lab: Graphs & Divide-and-Conquer Drills

**Union-Find pointer traces, DFS edge autopsies, Kosaraju order drills, Strassen-vs-naive decisions, and exam essay models.**

<a id="the-intuition"></a>
## 1. Start from zero — how to use this lab

**Problem first.** Module 2's exam marks go to traces, not slogans: pointer states after each UNION, edge types with colour evidence, Kosaraju orders that survive direction scrutiny, Strassen verdicts with constants acknowledged. Abbreviations: FIND/UNION = the disjoint-set operations; $d[v]$/$f[v]$ = DFS discovery/finish times; OPT = optimal value.

::: callout-intuition Core Mental Model
Treat each scenario as a marking scheme: state the setup, show every intermediate state (forest with ranks, colours with times, bounds with arithmetic), then conclude with the certificate (connectivity verdict, cycle proof, ratio verdict). The three scenarios below model exactly that discipline.
:::

**Tiny warm-up.** UNION(1,2) by rank from singletons: tie $0,0$ → 2 under 1, rank(1) = 1. One line, three facts (parent, rank, tie rule cited).

::: toggle How do I read a union-find trace line?
Each UNION line must state three facts: the new parent pointer (who goes under whom), the rank update (increment only on equal-rank ties — otherwise unchanged), and the tie rule cited (smaller-under-larger, either way on ties). Warm-up decoded: tie (0,0) → parent(2) = 1, rank(1) becomes 1, rule "tie, either way" cited. Missing any of the three loses the mark the line was built to earn.
:::

::: toggle How do I autopsy one DFS edge?
Four questions in order: (1) target colour when explored? (white/gray/black). (2) Which species follows? (white→tree, gray→back, black+descendant→forward, black otherwise→cross). (3) What does it prove? (back = cycle certified; others = structure mapped). (4) Timestamps consistent? ($d$/$f$ intervals nest or disjoint — half-overlap indicts the trace). Scenario 2's $4\to2$ gray verdict carries all four: gray, back, cycle 2→4→2, nesting intact.
:::

### Scenario 1: Union-Find Surgery (Ranks on the Table)

Singletons $\{1..6\}$. UNION(1,2): tie → 2 under 1, rank(1)=1. UNION(3,4): 4 under 3, rank(3)=1. UNION(1,3): tie 1 vs 1 → 3 under 1, rank(1)=2. Forest: $1$ roots $\{1,2,3,4\}$ (children $2,3$; grandchild $4$), $\{5\}$, $\{6\}$ untouched. FIND(4): climbs $4 \to 3 \to 1$, rewiring $4$ directly under $1$. Are 2 and 4 connected? FIND both → root 1 each: **yes**, in near-constant time — and the second query on either is a single hop. Ranks used: $\{r_1=2, r_3=1, \text{rest } 0\}$.

### Scenario 2: DFS Autopsy (One Graph, Four Edge Species)

Directed edges: $1\to2,\ 1\to3,\ 2\to4,\ 3\to4,\ 4\to2$. DFS from 1, numeric order. Discover 1; $1\to2$ **tree** (discover 2); $2\to4$ **tree** (discover 4); $4\to2$: vertex 2 gray (ancestor) → **back** (cycle 2→4→2 proven); finish 4, finish 2; $1\to3$ **tree** (discover 3); $3\to4$: vertex 4 black with $d[3] > d[4]$ → **cross**. Final: 3 tree + 1 back + 1 cross, zero forward — every species except forward in five edges, and the back edge names the cycle.

### Scenario 3: Strassen-or-Naive at n = 64

Naive: $64^3 = 262{,}144$ multiplications. Strassen leaves: $7^{\log_2 64} = 7^6 = 117{,}649$ base multiplications (plus $\Theta(n^2)$ additions absorbed by the exponent gap). Ratio $\approx 2.2\times$ fewer mults — Strassen wins *asymptotically*, but verify constants first: recursion overhead, temporaries, and padding (64 is already a power of 2 — no padding tax here) decide the *practical* winner. Rule: exponent gaps govern large $n$; constants govern the lab bench.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| Rank vs. size (Union-Find) | Height bound vs. node count (different variants: by-rank vs. by-size) |
| Path compression vs. union by rank | Flattens climbed paths vs. keeps trees shallow — need *both* for α(n) |
| BFS vs. DFS output | Hop distances/layers vs. timestamps/edge types — same Θ(V+E), different intelligence |
| Tree vs. back vs. forward vs. cross | White target / gray ancestor / black descendant / black otherwise |
| Undirected edge types | Tree + back only (every edge seen both ways kills forward/cross) |
| Kosaraju pass order | Finish-time stack on G, then *decreasing* order on transpose — reversed order re-merges |
| Merge vs. Strassen recurrences | $2T(n/2)+\Theta(n) \to \Theta(n\log n)$ vs. $7T(n/2)+\Theta(n^2) \to \Theta(n^{2.81})$ |
| D&C vs. DP vs. greedy | Disjoint / overlapping / committed-choice subproblems |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz After UNION(1,2), UNION(3,4), UNION(1,3) by rank with ties broken toward the first root, followed by FIND(4), what are the ranks and the parent of 4?
() All ranks 0; 4's parent is 3 (compression never fires)
(*) rank(1)=2, rank(3)=1, rest 0; 4's parent is now 1 (compression rewired 4→3→1 into 4→1)
() rank(1)=3; 4's parent is 2
() Ranks are recomputed from scratch after every FIND
::: explanation
Ties increment: two rank-0 unions make two rank-1 roots; merging them makes rank 2. FIND(4)'s climb rewires the whole path to the root — ranks (height *bounds*) don't change from compression, but 4's parent pointer jumps a level. Rank tracks shape guarantees; pointers track laziness exploited.
:::

::: quiz In Scenario 2, edge 3→4 classified as cross while 4→2 classified as back — yet both point "backward" in numbering. What actually distinguishes them?
() Nothing — numbering decides everything and the trace is wrong
(*) Color + discovery times at exploration: 2 was gray (ancestor, on-stack) → back; 4 was black with d[3] > d[4] (finished earlier branch) → cross — classification reads algorithm *state*, never vertex labels
() Cross edges only exist in undirected graphs
() Back edges require the graph to be weighted
::: explanation
Same arrow direction in numbering, opposite verdicts: $4\to2$ reached an *active* ancestor (cycle!), $3\to4$ reached a *finished* other-branch node (history, not loop). Gray = loop proof; black + later-discovered = cross-branch jump. State, not labels.
:::

::: quiz Strassen does ~117k mults vs naive ~262k at n=64, yet the lab still says "verify constants first." What could overturn a 2.2× asymptotic lead in practice?
() Nothing — asymptotics dictate all outcomes at every size
(*) Recursion overhead, temporary submatrices, padding (none here, but generally), and cache-hostile access vs. naive's tight loops — constants and memory traffic dominate until n grows into the hundreds
() Strassen's arithmetic is approximate while naive is exact
() The 117k figure counts additions as multiplications
::: explanation
$\Theta$ erases the constants that rule small inputs: Strassen pays bookkeeping, allocation, and locality costs per level that naive's triple loop avoids. The exponent gap compounds with $n$ ($n^{2.81}$ vs $n^3$), so bigness eventually wins — "eventually" being the operative, benchmarked word.
:::

::: quiz Kosaraju's pass 2 processes vertices in decreasing finish-time order on the transpose. Your teammate "optimizes" it to increasing order. What breaks, concretely?
() Nothing — order is cosmetic and any permutation works
(*) DFS from an early-finishing (sink-side) vertex on Gᵀ bleeds across SCC boundaries, fusing distinct components into one reported tree — decreasing order starts each search in a sink it cannot escape
() Increasing order runs exponentially slower but stays correct
() The transpose becomes unnecessary with increasing order
::: explanation
Decreasing-finish = sources-first on $G$ = sinks-first on $G^T$; sinks trap DFS inside one SCC. Increasing order starts mid-graph where reversed edges still lead outward — trees sprawl across true boundaries and the partition lies. The order *is* the correctness proof's load-bearing wall.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (edge types and Union-Find ops lead); Strassen-vs-naive arithmetic.
* **7 Marks:** Full Kruskal/Prim/Dijkstra traces (M2 topics), Kosaraju two-pass runs, or Union-Find operation sequences with ranks.
:::

### Essay Question 1 (7 Marks)
**Q: Starting from singletons {1..6}, execute UNION(1,2), UNION(3,4), UNION(1,3) by rank, then FIND(4) with compression. Show the forest after each step with ranks, and state the final parent of every node.**

**Model Answer:** After U(1,2): $2\to1$, $r_1=1$. After U(3,4): $4\to3$, $r_3=1$. After U(1,3): tie → $3\to1$, $r_1=2$. FIND(4): path $4\to3\to1$, rewire $4\to1$. Final parents: $1\to1$ (root, rank 2), $2\to1$, $3\to1$ (rank 1), $4\to1$, $5\to5$, $6\to6$ (rank 0). FIND(2) vs FIND(4): both root 1 → connected. Ranks bound heights; compression spends pointer writes now to buy single-hop queries later.

### Essay Question 2 (7 Marks)
**Q: For the graph of Scenario 2, run DFS from vertex 1 classifying every edge, and prove the graph contains a directed cycle.**

**Model Answer:** As traced: tree edges $1\to2$, $2\to4$, $1\to3$ (white targets, forest built); $4\to2$ hits gray ancestor 2 → **back edge**; $3\to4$ hits black vertex with $d[3]>d[4]$ → **cross edge**. The back edge $4\to2$ plus tree path $2\to4$ forms directed cycle $2\to4\to2$ — back edges *are* cycle certificates, which is why DFS doubles as a cycle detector and topological-sort validator (acyclic ⟺ no back edges).
