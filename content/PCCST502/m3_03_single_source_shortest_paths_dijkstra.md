---
id: m3_03_single_source_shortest_paths_dijkstra
courseCode: PCCST502
module: 3
sequence: 3
title: 'Single-Source Shortest Paths: Dijkstra'
difficulty: beginner
estimatedMinutes: 9
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
## 1. Start from zero — the problem first

**Problem first.** Given a start city and road lengths (non-negative weights), find the cheapest route to *every* city. BFS fails here: fewest *hops* is not cheapest *cost* (one highway beats three lanes). Dijkstra's fix: always finalise the currently closest-looking city — with non-negative roads, no later discovery can undercut it.

::: callout-intuition Core Mental Model: The Expanding Ink Blot
Drop ink on the start city: the stain spreads along every road at equal speed. The moment ink *first* touches a city, its path is the shortest — no later arrival beats first contact at equal spread rates. **Dijkstra's algorithm** (named after Edsger Dijkstra) simulates the blot with a priority queue: repeatedly *settle* the unsettled vertex with smallest tentative distance (first contact = final), then *relax* its outgoing roads (offer neighbours a shorter route through it). Drop the ink now: extract-min and relaxation below are the exact mechanism.
:::

**Tiny toy example (3 vertices).** $s$–$a$ (4), $s$–$b$ (2), $b$–$a$ (1). Settle $s$ (0) → tentative $a=4$, $b=2$. Settle $b$ (2) → relax $a$ to $\min(4, 2+1) = 3$. Settle $a$ (3): direct edge 4 beaten by the 2-hop 3 — discovery order ($a$ first) lost to distance order ($b$ first).

::: toggle What are `tentative distance`, `settled`, and `relaxation`?
`Tentative distance` $d[v]$ = best route known *so far* (may improve). `Settled` = extracted as minimum and declared final (never revisited — valid only with non-negative weights). `Relaxation` of $(u,v,w)$ = ask "is going through $u$ shorter?": if $d[u]+w < d[v]$, set $d[v] = d[u]+w$ (tighten the estimate, remember $u$ as predecessor). Tiny trace above: $a$'s 4 relaxes to 3 through $b$ before $a$ settles — settling reads the final value, relaxing proposes candidates.
:::

::: toggle Why do negative weights void Dijkstra?
Settling assumes no later discovery undercuts a settled vertex — true only if every extension adds non-negative cost (any alternative route through unsettled vertices costs $\ge d[u]$ plus $\ge 0$). A negative edge breaks the arithmetic: a settled vertex can improve late via the cheap edge, but the algorithm never revisits it — output silently wrong (runs fine, guarantees evaporated). Bellman-Ford re-checks everything instead, paying slowness for safety.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols:** $d[v]$ = tentative distance (best known so far); $w$ = edge weight; "settle" = extract-min and declare final; "relax $(u,v,w)$" = if $d[u]+w < d[v]$, set $d[v] = d[u]+w$ (remember predecessor $u$).

**Relaxation and settling — numbered steps:**

1. Set $d[s] = 0$, all others $\infty$.
2. Repeatedly extract the unsettled vertex $u$ with smallest $d$ (**settle** it: $d[u]$ is final).
3. **Relax** every outgoing edge $(u,v,w)$.
4. Repeat until all reachable vertices settle.

**Correctness hinge.** Extraction order is nondecreasing in final distance: a settled vertex can never improve later — *provided all weights are non-negative* (any alternative path to $u$ extends an unsettled vertex of distance $\ge d[u]$ plus non-negative edges).

**The non-negative contract.** One negative edge can let a *settled* vertex improve late (cheap arrival via the negative edge) — the invariant shatters and outputs go silently wrong (not slow: *wrong*). Negative weights demand Bellman-Ford (slower, detects negative cycles); Dijkstra simply *assumes them away*. Heap complexity: $\Theta((V+E) \log V)$.

**Dijkstra vs BFS vs Prim (confusion trio):** BFS = Dijkstra with all weights $1$ (queue suffices; settles by hops). Prim = same *machinery* (priority queue, growing frontier) but minimises *attachment cost* (cheapest edge to tree), not *path distance from source* — identical code shape, different key, different problem.

::: callout-formula KTU Formula Vault: Dijkstra Facts
Loop: **extract-min (settle) → relax outgoing** · needs **non-negative weights** (else Bellman-Ford) · $\Theta((V+E)\log V)$ heap · BFS = **unit-weight Dijkstra** · Prim = **same skeleton, edge-key instead of path-key**.
:::

::: callout-pitfall Settled Means Final — Only Without Negatives
Students trace Dijkstra on negative-weight graphs and "get answers" — all suspect. The algorithm *runs* fine (no crash); its *guarantee* evaporates. Any negative weight anywhere → switch to Bellman-Ford, don't switch hope.
:::

---

<a id="worked-example"></a>
## 3. Worked example — six vertices, settled one by one

::: step [Step 1: Setup] Formulating the Problem
Undirected graph: $1\!-\!2(4), 1\!-\!3(2), 2\!-\!3(1), 2\!-\!4(5), 3\!-\!4(8), 3\!-\!5(10), 4\!-\!5(2), 4\!-\!6(6), 5\!-\!6(3)$. Run Dijkstra from 1: settle order and final distances.
:::

::: step [Step 2: Execution] Settling One by One
$d = \{1:0\}$, rest ∞. Settle **1** (0): $d[2]=4, d[3]=2$. Settle **3** (2): $d[2] = \min(4, 3) = 3$ (improved via 3!), $d[4]=10$, $d[5]=12$. Settle **2** (3): $d[4] = \min(10, 8) = 8$. Settle **4** (8): $d[5] = \min(12, 10) = 10$, $d[6]=14$. Settle **5** (10): $d[6] = \min(14, 13) = 13$. Settle **6** (13).
:::

::: step [Step 3: Conclusion] Final Result
Settle order **1, 3, 2, 4, 5, 6**; distances **{0, 3, 2, 8, 10, 13}** — vertex 2 settles *second* at 3 via $1\to3\to2$, beating its direct edge 4. Settling follows *distance*, not discovery: the beginner surprise this trace exists to deliver.

:::

::: anim dijkstra-settle Settling in Distance Order
Watch vertices lock in 1 → 3 → 2 → 4 → 5 → 6 with final distances stamped beneath — discovery order ignored, distance order obeyed, exactly as traced above.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Discovery $\ne$ finality: tentative values improve until settlement; only settled values are answers.
- "Runs without crashing on negatives" $\ne$ "correct on negatives": silence is the danger.
- Dijkstra keys *paths from source*; Prim keys *edges to tree* — same skeleton, swapped key.

| Similar pair | Distinction that earns marks |
|---|---|
| Dijkstra vs BFS | Weighted path costs (heap) vs hop counts (queue) |
| Dijkstra vs Prim key | Source→v path (shortest paths) vs edge-into-tree (MST) |
| Relaxation vs settlement | Tentative improvement vs final extraction |

**Exam recap (facts an examiner rewards):** extract-min → relax loop; non-negative contract with Bellman-Ford fallback; $\Theta((V+E)\log V)$; BFS = unit-weight special case; vertex 2's 4→3 improvement as the canonical trace detail.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

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
