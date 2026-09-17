# Uninformed (Blind) Search Strategies: BFS, DFS & UCS

**Search algorithms without domain heuristics: Breadth-First Search, Depth-First Search, and Uniform-Cost Search.**

<a id="the-intuition"></a>
## 1. What is Uninformed (Blind) Search?

When an AI agent needs to find a sequence of actions from an **Initial State** to a **Goal State**, it must explore the search space.

* **Uninformed Search (Blind Search):** Search strategies that operate with **no domain-specific knowledge** beyond the problem definition. They only know how to generate successor states, test legal actions, and recognize a goal state.
* They evaluate paths systematically without an estimate of how close a state is to the goal.

::: callout-intuition Core Mental Model: Navigating in the Dark
Imagine you are navigating an unlit maze without a map, compass, or signs. You can only feel the walls around your current position, test paths step-by-step, and check if you have reached an exit. Uninformed search behaves the same way—it cannot "see" the goal ahead; it explores the graph systematically.
:::

---

<a id="the-dimensions"></a>
## 2. Evaluating Search Strategies

Every search algorithm is evaluated against **four standard criteria**:

1. **Completeness:** Is the algorithm guaranteed to find a solution if one exists?
2. **Time Complexity:** How long (or how many node expansions) does it take to find a solution?
3. **Space Complexity:** How much computer memory (RAM) is required to hold the frontier and explored nodes?
4. **Optimality:** Does the algorithm find the highest-quality (lowest total path cost) solution among all valid paths?

### Complexity Parameters
* **$b$:** **Branching Factor** (the maximum number of successors for any node).
* **$d$:** **Depth** of the shallowest goal node.
* **$m$:** **Maximum Depth** of the search space (can be $\infty$).

---

<a id="terminology"></a>
## 3. Breadth-First Search (BFS)

Breadth-First Search expands the search tree level by level. It explores all sibling nodes at depth $k$ before expanding any nodes at depth $k+1$.

* **Data Structure:** Uses a **FIFO (First-In, First-Out) Queue** for the frontier.

### ASCII Diagram: BFS Level-by-Level Expansion
```text
           [ A ]  (Level 0 - Root)
          /     \
         [ B ]   [ C ]  (Level 1 - Evaluated next)
        /     \
       [ D ]   [ E ]  (Level 2 - Evaluated last)

   Queue Order: [A] -> [B, C] -> [C, D, E] -> [D, E] -> [E]
```

::: callout-formula BFS Performance Metrics
* **Time Complexity:** $O(b^d)$ (explores all levels down to depth $d$).
* **Space Complexity:** $O(b^d)$ (stores all generated nodes in the frontier queue).
* **Completeness:** Yes (if branching factor $b$ is finite).
* **Optimality:** Yes, **if and only if** all step costs are equal (finds shallowest goal).
:::

::: callout-pitfall The Memory Bottleneck of BFS
While BFS guarantees finding the shallowest solution, its **space complexity** is its greatest limitation. Because all generated nodes are retained in memory, for $b = 10$ and $d = 8$, the frontier requires storing over $10^8$ nodes, exhausting RAM long before CPU time is exhausted.
:::

---

<a id="foundations"></a>
## 4. Depth-First Search (DFS)

Depth-First Search explores as deep as possible along each branch before backtracking.

* **Data Structure:** Uses a **LIFO (Last-In, First-Out) Stack** (or recursive function calls).

### ASCII Diagram: DFS Deep-Dive Expansion
```text
           [ A ]  (1. Start at root)
          /     \
         [ B ]   [ C ]  (3. Visited after backtracking from left branch)
        /     
       [ D ]   (2. Dive straight down to leaf node)
```

::: callout-formula DFS Performance Metrics
* **Time Complexity:** $O(b^m)$ (may traverse to maximum depth $m$).
* **Space Complexity:** $O(b \cdot m)$ (stores only the current branch and unexpanded siblings; linear space).
* **Completeness:** No (fails in infinite-depth spaces or graph cycles without cycle detection).
* **Optimality:** No (may return a deep, high-cost goal before examining a shallow one).
:::

---

<a id="history"></a>
## 5. Uniform-Cost Search (UCS)

When step costs vary (e.g., roads with different lengths or costs), BFS cannot guarantee the cheapest path because it optimizes step count rather than total cost. **Uniform-Cost Search (UCS)** addresses this by expanding the node with the lowest cumulative path cost $g(n)$.

* **Data Structure:** Uses a **Priority Queue** ordered by path cost $g(n)$.

### ASCII Diagram: UCS Cost-Ordered Expansion
```text
               (Cost: 1)
           [ A ] -------> [ B ] (Total Cost: 1)
          |              
  (Cost: 5)|              
          v              
         [ C ] (Total Cost: 5)

   *UCS expands B first because g(B) = 1 is lower than g(C) = 5.*
```

::: callout-formula UCS Performance Metrics
Let $C^*$ be the optimal path cost and $\epsilon > 0$ be the minimum step cost:
* **Time Complexity:** $O(b^{1 + \lfloor C^* / \epsilon \rfloor})$
* **Space Complexity:** $O(b^{1 + \lfloor C^* / \epsilon \rfloor})$
* **Completeness:** Yes (if all step costs satisfy $c(s, a, s') \ge \epsilon > 0$).
* **Optimality:** Yes (guaranteed to find the lowest-cost path for arbitrary non-negative costs).
:::

---

## 6. Comparative Summary Matrix

```text
+---------------------+----------------+-----------------+-------------------------------+
| Criterion           | BFS            | DFS             | UCS                           |
+=====================+================+=================+===============================+
| **Frontier Data**   | FIFO Queue     | LIFO Stack      | Priority Queue by $g(n)$      |
+---------------------+----------------+-----------------+-------------------------------+
| **Complete?**       | Yes (finite b) | No (loops/inf)  | Yes ($c \ge \epsilon > 0$)    |
+---------------------+----------------+-----------------+-------------------------------+
| **Optimal?**        | Yes (cost = 1) | No              | YES (arbitrary non-neg costs) |
+---------------------+----------------+-----------------+-------------------------------+
| **Time Complexity** | $O(b^d)$       | $O(b^m)$        | $O(b^{1 + \lfloor C^*/\epsilon \rfloor})$ |
+---------------------+----------------+-----------------+-------------------------------+
| **Space Complexity**| $O(b^d)$       | $O(b \cdot m)$  | $O(b^{1 + \lfloor C^*/\epsilon \rfloor})$ |
+---------------------+----------------+-----------------+-------------------------------+
```

---

<a id="self-check"></a>
## 7. Active Recall Quizzes

::: quiz Why is Breadth-First Search (BFS) suboptimal when step costs along edges are unequal?
() Because BFS has infinite space complexity.
(*) Because BFS optimizes for the fewest depth steps rather than cumulative numerical path cost, choosing shorter step paths over cheaper total cost paths.
() Because BFS uses a priority queue.
() Because BFS cannot branch more than twice per node.
::: explanation
BFS identifies the shallowest goal in terms of depth steps. If a 1-step path costs \$100 and a 3-step path costs \$5, BFS selects the \$100 path because it has fewer steps. Uniform-Cost Search (UCS) must be used when edge weights vary.

:::

::: anim bfs-dfs-race Ripples Against String
Watch both strategies run one shared tree: left ignites level by level (nearest first), right plunges down one branch before backtracking (deepest first) — same footsteps budget, opposite discovery orders.
:::

::: quiz What is the main memory advantage of Depth-First Search (DFS) over Breadth-First Search (BFS)?
() DFS has constant $O(1)$ space complexity.
(*) DFS only stores the single active path from root to leaf plus unexpanded siblings, giving a linear space complexity of $O(bm)$ compared to BFS's exponential $O(b^d)$ frontier.
() DFS stores nodes in an indexed hash map.
() DFS never expands duplicate nodes.
::: explanation
DFS maintains only the current branch down to depth $m$ in its LIFO stack. This linear space requirement $O(bm)$ uses vastly less RAM than BFS, which stores entire exponential tiers of nodes.
:::

::: quiz Which uninformed search algorithm guarantees finding the lowest-cost solution when step costs vary, assuming all step costs are strictly positive ($\epsilon > 0$)?
() Depth-First Search
() Breadth-First Search
(*) Uniform-Cost Search (UCS)
() Random Walk Search
::: explanation
Uniform-Cost Search always expands the frontier node with the lowest cumulative path cost $g(n)$ using a priority queue, guaranteeing cost-optimality when all edge costs are non-negative.
:::

---

<a id="exam-focus"></a>
## 8. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** State the 4 evaluation criteria for search algorithms or compare time/space complexities of BFS and DFS.
* **7 Marks:** Explain Uniform-Cost Search with an illustrative graph trace, showing queue updates at each step.
:::

### Sample 3-Mark Question
**Q: Compare the time and space complexities of BFS and DFS. Which algorithm is more prone to running out of memory?**

**Model Answer:**
* **BFS:** Time $O(b^d)$, Space $O(b^d)$ (exponential in depth).
* **DFS:** Time $O(b^m)$, Space $O(bm)$ (linear in depth).
* **Memory Comparison:** **BFS** is far more prone to running out of memory because its space complexity grows exponentially with depth, requiring every frontier node to be kept in RAM simultaneously.

### Sample 7-Mark Question
**Q: Explain the Uniform-Cost Search (UCS) algorithm. How does it guarantee optimality on graphs with variable step costs?**

**Model Answer:**
1. **Definition (2 Marks):** UCS is an uninformed graph search strategy that expands the node $n$ with the lowest cumulative path cost $g(n)$ from the root node. It manages its frontier with a Priority Queue.
2. **Difference from BFS (2 Marks):** BFS expands nodes strictly by depth level (FIFO queue), which assumes uniform unit costs. UCS expands nodes in order of cumulative cost $g(n)$, regardless of their depth.
3. **Optimality Proof Concept (3 Marks):** Because all step costs are strictly positive ($c \ge \epsilon > 0$), cumulative path costs increase monotonically along any search path. Therefore, whenever UCS selects a goal node for expansion from the priority queue, no unexpanded node on the frontier can lead to a cheaper path to the goal, guaranteeing optimality.
