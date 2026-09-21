---
id: m2_02_iterative_deepening_and_depth_limited
courseCode: PECST522
module: 2
sequence: 2
title: 'Depth-Limited Search (DLS), Iterative Deepening (IDS) & Bidirectional Search'
difficulty: beginner
estimatedMinutes: 11
learningObjectives:
  - Cap DFS with depth limits against incompleteness
  - Price the 11 percent IDS overhead with the geometric series
  - Halve exponents with bidirectional search arithmetic
concepts:
  - iterative deepening
  - depth-limited search
  - bidirectional search
prerequisites:
  - m2_01_uninformed_search_dfs_bfs_ucs
examRelevance: high
tags:
  - search
  - uninformed-search
---
# Depth-Limited Search (DLS), Iterative Deepening (IDS) & Bidirectional Search

**Problem: BFS is complete but memory-hungry; DFS is memory-light but incomplete and non-optimal. By the end you can cap depth, iterate limits, and halve exponents — with the exact overhead arithmetic.**

<a id="start-zero"></a>
## 1. Start From Zero: The Dilemma

BFS checks every shallow node (safe, thorough) but stores whole tiers: `O(b^d)` memory. DFS stores one branch: `O(b*m)` memory, but dives past shallow goals into bottomless paths and may never return. Question: can one method keep DFS memory with BFS guarantees? Yes — iterate depth caps.

**Definitions:** Depth-Limited Search (DLS) is DFS that treats depth `l` as a wall (nodes at `l` have no children). Iterative Deepening Search (IDS, also IDDFS) runs DLS for `l = 0, 1, 2, ...` until the goal appears. Bidirectional search runs two searches (start-forward, goal-backward) until frontiers meet.

::: callout-intuition Core Mental Model: Searching in Expanding Radii
Search 1 metre out; reset; 2 metres; reset; expand until found. Shallow completeness with deep memory. Drop the lost-item story after this; the limit loop is the technical content.
:::

**Tiny beginner example:** goal at depth 2. DLS with l=1 reports cutoff (wall hit, maybe deeper). IDS tries l=0 (miss), l=1 (miss), l=2 (hit) — three cheap failures buying a guaranteed shallow find.

::: toggle What are `depth limit`, `cutoff vs failure`, and the IDS loop?
Depth limit `l` = artificial wall (nodes at depth `l` are treated childless). Cutoff = wall hit with tree unexhausted (deeper solutions may exist — keep going). Failure = tree exhausted within `l` (provably nothing there — stop, unsolvable). IDS loop: for l in 0,1,2,… run DLS(l); stop on solution or exhaustive failure; continue on cutoff. Tiny trace above: l=0 checks root only, l=1 checks two tiers, l=2 finds the goal — each round depth-first (linear memory), all rounds together complete like BFS.
:::

::: toggle Where does the `11% overhead` number come from?
Round `l` regenerates tiers 0..l, so tier `i` is built in rounds i..d — $(d-i+1)$ times. Total $N = \sum(d-i+1)b^i$; the bottom tier $b^d$ dwarfs all above (geometric series sums upper tiers to $\approx b^d/(b-1)$). Tiny numbers: b=10, d=5 — BFS builds 111,111 nodes; IDS rebuilds crumbs for 123,450 total, only ~11% more work, while memory collapses from $O(b^d)$ tiers to one $O(b·d)$ branch. Re-walking crumbs costs crumbs because crumbs are exponentially small beside the bottom tier.
:::

<a id="basics"></a>
## 2. Basic Layer: DLS Outcomes and IDS Loop

**Data/state:** same frontier as DFS plus a depth counter. **Goal:** find the shallowest goal with linear memory.

DLS outcomes (all three must be distinguished):
1. **Solution** — goal within `l`. 2. **Failure** — tree exhausted within `l`, provably no solution there. 3. **Cutoff** — wall hit with tree unexhausted; deeper solutions may exist.

```text
        [Root] depth 0
        /        \
    [A]          [B] depth 1
    / \          / \
 [C] [D]      [E] [F] depth 2 = wall; deeper [X],[Y] ignored
```

::: callout-pitfall Choosing the Wrong Depth Limit l
`l < d` (goal depth) returns cutoff despite solvability. `l > d` wastes effort on deep detours like raw DFS. IDS removes the guessing by trying every limit in order.
:::

IDS loop (procedure): for l in 0,1,2,...: run DLS(l); stop on solution; on cutoff continue; on exhaustive failure stop (unsolvable). Each round is depth-first, so memory stays linear.

<a id="formal-model"></a>
## 3. Formal Layer: Overhead Proof and Bidirectional Arithmetic

**Meaning, variables, intuition, formula:** let `b` = branching, `d` = goal depth. Round `l` generates levels 0..l. Level `i` is generated in rounds i..d, i.e. (d-i+1) times. Total:

$$N(IDS) = \sum_{i=1}^{d}(d-i+1)\,b^i = O(b^d)$$

Intuition: the bottom tier `b^d` dwarfs all tiers above combined (geometric series: upper sum ~ `b^d/(b-1)`). Re-walking crumbs costs crumbs. Tiny numbers: b=10, d=5 — BFS builds 111,111 nodes; IDS builds 123,450 — only ~11% more — while memory drops from `O(b^d)` to `O(b*d)`.

::: callout-formula IDS Performance, With Qualifications
Time `O(b^d)` (same as BFS asymptotically). Space `O(b*d)` (DFS-like linear). Complete if `b` finite. Optimal only under identical step costs (shallowest = cheapest only then) — the qualification students drop.
:::

**Bidirectional method:** forward from start plus backward from goal; stop at intersection. Needs predecessor generation (inverse moves) and a well-defined goal set. Time and space `O(b^(d/2))` — halved exponent — complete, and optimal only with BFS both sides under uniform costs. Challenges: implicit/multiple goals make backward search hard; at least one frontier stays in memory.

Comparison matrix:

```text
Method        | Complete?  | Optimal?      | Time      | Space
BFS           | Yes        | Only uniform  | O(b^d)    | O(b^d)
DFS           | No         | No            | O(b^m)    | O(b*m)
DLS           | Only l>=d  | No            | O(b^l)    | O(b*l)
IDS           | Yes        | Only uniform  | O(b^d)    | O(b*d)
Bidirectional | Yes        | Only uniform* | O(b^d/2)  | O(b^d/2)
```

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| DLS vs. IDS | One capped shot (cutoff possible) vs. limit loop to completeness |
| IDS overhead vs. BFS memory | ~11% extra nodes (b=10,d=5) buys exponential memory savings |
| Forward-only vs. bidirectional | One `b^d` search vs. two `b^(d/2)` searches meeting |

**Watch out:** (1) Cutoff is not failure — it means "deeper maybe." (2) IDS optimality still needs uniform costs. (3) Bidirectional optimality needs uniform costs plus BFS both sides; with heuristics/costs it needs stricter conditions.

**Limitations:** IDS still expands `O(b^d)` time (only memory is fixed); bidirectional needs reversible moves and explicit goals — useless for "any checkmate" or unknown-goal tasks.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What are the two primary algorithmic properties that Iterative Deepening Search (IDS) combines into a single strategy?
() The time complexity of DFS and the memory complexity of BFS.
(*) The completeness/optimality of BFS and the linear space efficiency ($O(bd)$) of DFS.
() The bidirectional search model and heuristic distance estimation.
() The priority queue sorting of UCS and the greedy selection of DFS.
::: explanation
Repeated depth-limited DFS gives DFS-like linear memory with BFS-like systematic shallow coverage and uniform-cost optimality.
:::

::: quiz Why does repeated generation of upper-level nodes in Iterative Deepening Search not worsen its asymptotic time complexity?
() Because upper-level nodes are cached in memory after depth 1.
(*) Because in an exponential tree, the bottom layer ($b^d$) dominates the total node count; regenerating shallow upper layers adds only a minor constant factor, keeping total time complexity at $O(b^d)$.
() Because IDS uses a FIFO queue for upper-level nodes.
() Because the branching factor decreases as depth increases.
::: explanation
Geometric domination: level d dwarfs all above combined, so re-paying upper tiers multiplies work by a constant only.
:::

::: quiz What is a key practical challenge when applying Bidirectional Search to complex problem domains like chess or puzzle solving?
() Bidirectional search requires unbounded CPU cores.
(*) Generating valid predecessor states backward from the goal state and managing complex or implicit goal conditions.
() Bidirectional search cannot be used on directed graphs.
() Bidirectional search always produces suboptimal paths.
::: explanation
Backward search needs inverse moves plus an enumerable goal set. Implicit goals ("any mate") or hard predecessors block it.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: why IDS beats BFS on memory, or three DLS outcomes. 7 marks: IDS mechanism plus time/space derivation with the regeneration argument.
:::

**Recap facts examiners reward:** DLS triple outcome; IDS loop; `N(IDS)` sum and `O(b^d)`/`O(b*d)`; 111,111 vs. 123,450 at b=10,d=5; `O(b^(d/2))` with predecessor caveat.

### Sample 3-Mark Question
**Q: Why prefer IDS over BFS on large uniform-cost spaces?**

**Model Answer:** Same completeness and uniform-cost optimality, but linear `O(b*d)` memory instead of exponential `O(b^d)` — depth-first footprint with breadth-first guarantees.

### Sample 7-Mark Question
**Q: Explain IDS, derive complexities, defuse the regeneration objection.**

**Model Answer:** Loop DLS l=0..d (2 marks). Space linear per DFS round: O(b*d) (2 marks). Time sum (d-i+1)b^i = O(b^d) since bottom tier dominates; b=10,d=5 gives 11% overhead for exponential memory savings (3 marks).
:::
