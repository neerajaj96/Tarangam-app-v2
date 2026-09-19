---
id: m2_02_iterative_deepening_and_depth_limited
courseCode: PECST522
module: 2
sequence: 2
title: 'Depth-Limited Search (DLS), Iterative Deepening (IDS) & Bidirectional Search'
difficulty: beginner
estimatedMinutes: 9
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

**Hybrid and advanced blind search strategies: Overcoming the BFS memory bottleneck and DFS incompleteness.**

<a id="the-intuition"></a>
## 1. The Dilemma: BFS Memory vs. DFS Incompleteness

In Topic 2.1, we examined two classic search extremes:
* **Breadth-First Search (BFS):** Explores level-by-level. It is **complete and optimal** (if step costs are equal), but its **space complexity is exponential ($O(b^d)$)**, exhausting RAM on deep trees.
* **Depth-First Search (DFS):** Dives deep down a single path. Its **space complexity is linear ($O(bm)$)**, making it memory-safe, but it is **incomplete** in infinite spaces and **suboptimal**.

Can we achieve the **memory safety of DFS** while preserving the **completeness and optimality of BFS**? Yes! That is the exact purpose of **Iterative Deepening Search**.

---

<a id="the-dimensions"></a>
## 2. Depth-Limited Search (DLS)

Before examining Iterative Deepening, we must look at its core component: **Depth-Limited Search**.

* **Definition:** DLS is standard Depth-First Search with a predefined maximum depth limit, $l$.
* Nodes at depth $l$ are treated as if they have **no successors** (leaf boundaries).

### ASCII Diagram: Depth-Limited Search (Limit $l = 2$)
```text
           [ Root ]  (Depth 0)
          /        \
       [ A ]      [ B ]  (Depth 1)
      /     \    /     \
    [ C ]  [ D ][ E ]  [ F ]  (Depth 2 - Cutoff boundary!)
    /                         \
  [ X ]                       [ Y ]  (Depth 3 - Cut off / Ignored)
```

### The Three Possible Outcomes of DLS:
1. **Solution Found:** The goal node is discovered within depth $l$.
2. **Failure:** The search tree is fully explored up to depth $l$ without finding the goal, proving that **no solution exists anywhere within depth $l$**.
3. **Cutoff (Depth Limit Exceeded):** The algorithm reaches depth $l$ without finding the goal, indicating a solution may exist deeper ($l < d$).

::: callout-pitfall Choosing the Wrong Depth Limit $l$
* If **$l < d$**, DLS returns a "Cutoff" or "Failure" even if a valid solution exists deeper down.
* If **$l > d$**, DLS risks exploring deep, suboptimal paths like standard DFS before discovering a shallow solution.
* *Solution:* We allow an algorithm to automatically identify the optimal depth limit: **Iterative Deepening Search!**
:::

---

<a id="terminology"></a>
## 3. Iterative Deepening Depth-First Search (IDS / IDDFS)

**Iterative Deepening Search** repeatedly executes Depth-Limited Search, incrementing the depth limit by one each iteration ($l = 0, 1, 2, 3, \dots$) until the goal is found.

### ASCII Diagram: Iterative Deepening Successive Iterations
```text
  Iteration 0 (Limit = 0):  [ Root ]  (Goal not found, try limit 1)

  Iteration 1 (Limit = 1):  [ Root ]
                           /        \
                        [ A ]      [ B ]  (Goal not found, try limit 2)

  Iteration 2 (Limit = 2):  [ Root ]
                           /        \
                        [ A ]      [ B ]
                       /     \    /     \
                     [ C ]  [ D ][ E ]  [ F ] (Goal FOUND at depth 2!)
```

::: callout-intuition Core Mental Model: Searching in Expanding Radii
Imagine looking for a lost item in the dark. Instead of wandering off into deep woods (DFS) or illuminating the entire forest at once (BFS memory exhaustion), you search in expanding concentric circles:
1. Search a 1-meter radius. If not found, reset.
2. Search a 2-meter radius. If not found, reset.
3. Systematically expand until the item is found.
This is how IDS balances depth exploration with systematic shallow verification.
:::

---

<a id="foundations"></a>
## 4. Mathematical Analysis of Node Regeneration Overhead

A common question regarding IDS is whether repeatedly regenerating upper-level nodes degrades time efficiency. The mathematics demonstrates that this overhead is minimal in exponential trees.

### Why the Bottom Layer Dominates
In a search tree with branching factor $b$, the vast majority of nodes reside at the **deepest level**:
* At depth $d$, the bottom layer contains $b^d$ nodes.
* The layer immediately above contains $b^{d-1}$ nodes.
* The sum of all upper layers represents a small fraction of the bottom layer in a geometric series.

### Time Complexity Derivation
For search depth $d$:
* Limit 0 generated: $1$ time
* Limit 1 generated: $2$ times
* Limit 2 generated: $3$ times
* $\dots$
* Limit $d$ (bottom layer) generated: $1$ time

Total generated nodes:
$$N(\text{IDS}) = (d)b^1 + (d-1)b^2 + (d-2)b^3 + \dots + (1)b^d = O(b^d)$$

Because $b^d$ dominates the asymptotic growth, **IDS has the same Time Complexity as BFS: $O(b^d)$**.

::: callout-formula IDS Performance Metrics
* **Time Complexity:** $O(b^d)$ (Asymptotically equivalent to BFS).
* **Space Complexity:** $O(bd)$ (Linear space like DFS, since each DLS iteration operates as depth-first).
* **Completeness:** Yes (if $b$ is finite).
* **Optimality:** Yes (if step costs are identical; finds shallowest goal).
:::

---

<a id="history"></a>
## 5. Bidirectional Search

When search spaces are extremely large, **Bidirectional Search** provides a method to cut search depth:

* **Concept:** Execute **two simultaneous searches**:
  1. Forward search from the **Initial State** toward the goal.
  2. Backward search from the **Goal State** back toward the start.
* Search terminates when the two search frontiers intersect.

### ASCII Diagram: Bidirectional Search
```text
  Initial State (Start) ---> [Frontier 1] ........ [Frontier 2] <--- Goal State
```

::: callout-formula Bidirectional Search Complexities
* **Time Complexity:** $O(b^{d/2})$ (Cutting the exponent in half yields substantial speedup).
* **Space Complexity:** $O(b^{d/2})$ (At least one frontier must remain in memory to detect intersections).
* **Completeness:** Yes.
* **Optimality:** Yes (if implemented with BFS on both sides with uniform step costs).
:::

### Challenges of Bidirectional Search:
1. **Predecessor Generation:** Backward search requires computing valid preceding states from any given state.
2. **Multiple Goals:** Problems with many possible goal states or implicit goal descriptions make reverse search complex.

---

## 6. Master Comparison Matrix

```text
+-------------------+----------------+-----------------+-----------------+-----------------+-----------------+
| Criterion         | BFS            | DFS             | DLS             | IDS             | Bidirectional   |
+===================+================+=================+=================+=================+=================+
| **Complete?**     | Yes            | No              | If $l \ge d$    | Yes             | Yes             |
+-------------------+----------------+-----------------+-----------------+-----------------+-----------------+
| **Optimal?**      | Yes (cost = 1) | No              | No              | Yes (cost = 1)  | Yes (cost = 1)  |
+-------------------+----------------+-----------------+-----------------+-----------------+-----------------+
| **Time Comp.**    | $O(b^d)$       | $O(b^m)$        | $O(b^l)$        | $O(b^d)$        | $O(b^{d/2})$    |
+-------------------+----------------+-----------------+-----------------+-----------------+-----------------+
| **Space Comp.**   | $O(b^d)$       | $O(bm)$         | $O(bl)$         | $O(bd)$         | $O(b^{d/2})$    |
+-------------------+----------------+-----------------+-----------------+-----------------+-----------------+
```

---

<a id="self-check"></a>
## 7. Active Recall Quizzes

::: quiz What are the two primary algorithmic properties that Iterative Deepening Search (IDS) combines into a single strategy?
() The time complexity of DFS and the memory complexity of BFS.
(*) The completeness/optimality of BFS and the linear space efficiency ($O(bd)$) of DFS.
() The bidirectional search model and heuristic distance estimation.
() The priority queue sorting of UCS and the greedy selection of DFS.
::: explanation
IDS executes repeated depth-limited DFS iterations, providing the linear memory footprint of DFS ($O(bd)$) while systematically increasing depth limits to guarantee BFS-like completeness and shallowest-first optimality.
:::

::: quiz Why does repeated generation of upper-level nodes in Iterative Deepening Search not worsen its asymptotic time complexity?
() Because upper-level nodes are cached in memory after depth 1.
(*) Because in an exponential tree, the bottom layer ($b^d$) dominates the total node count; regenerating shallow upper layers adds only a minor constant factor, keeping total time complexity at $O(b^d)$.
() Because IDS uses a FIFO queue for upper-level nodes.
() Because the branching factor decreases as depth increases.
::: explanation
In exponential search trees, the deepest tier dominates all previous tiers combined. Regenerating upper tiers adds only a constant multiplier to the total work, preserving the $O(b^d)$ asymptotic bound.
:::

::: quiz What is a key practical challenge when applying Bidirectional Search to complex problem domains like chess or puzzle solving?
() Bidirectional search requires unbounded CPU cores.
(*) Generating valid predecessor states backward from the goal state and managing complex or implicit goal conditions.
() Bidirectional search cannot be used on directed graphs.
() Bidirectional search always produces suboptimal paths.
::: explanation
Backward search requires computing inverse actions (predecessors). When goal states are implicit or predecessor calculations are complex, backward search becomes difficult to implement.
:::

---

<a id="exam-focus"></a>
## 8. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** State why IDS is preferred over BFS for large state spaces, or list the three outcomes of DLS.
* **7 Marks:** Explain the IDS algorithm with mathematical derivation of its time and space complexities.
:::

### Sample 3-Mark Question
**Q: Why is Iterative Deepening Search (IDS) preferred over Breadth-First Search (BFS) in unweighted search problems with large state spaces?**

**Model Answer:**
* **BFS Limitation:** BFS is complete and optimal, but its **space complexity is exponential ($O(b^d)$)**, rapidly exhausting system memory on deep trees.
* **IDS Advantage:** IDS provides the same completeness and optimality guarantees as BFS while maintaining a **linear space complexity of $O(bd)$** by using DFS traversals at each depth limit.

### Sample 7-Mark Question
**Q: Explain the mechanism of Iterative Deepening Depth-First Search (IDS). Derive its time and space complexities, and explain why node regeneration overhead does not increase its asymptotic time complexity.**

**Model Answer:**
1. **Mechanism (2 Marks):** IDS repeatedly invokes Depth-Limited Search (DLS) with increasing depth limits ($l = 0, 1, 2, \dots, d$) until the goal state is found.
2. **Space Complexity (2 Marks):** Because each iteration is executed as depth-first search, only the current branch and immediate siblings are retained in memory, yielding a linear space complexity of **$O(bd)$**.
3. **Time Complexity & Overhead Derivation (3 Marks):**
   * Nodes at depth $d$ are generated 1 time.
   * Nodes at depth $d-1$ are generated 2 times.
   * Nodes at depth 1 are generated $d$ times.
   * Total nodes generated: $\sum_{i=1}^{d} (d - i + 1) b^i = O(b^d)$.
   * *Conclusion:* Because the bottom layer $b^d$ contains the vast majority of nodes in an exponential tree, the regeneration of shallow tiers adds only a constant factor overhead, keeping overall time complexity at **$O(b^d)$**.
