---
id: m2_01_uninformed_search_dfs_bfs_ucs
courseCode: PECST522
module: 2
sequence: 1
title: 'Uninformed (Blind) Search Strategies: BFS, DFS & UCS'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Run BFS, DFS and UCS with exact time and space costs
  - Price optimal path cost against minimum step cost bounds
  - Pick the blind strategy that fits the exam scenario
concepts:
  - breadth-first search
  - depth-first search
  - uniform-cost search
prerequisites:
  - m1_06_problem_solving_agents_and_search_trees
examRelevance: high
tags:
  - search
  - uninformed-search
---
# Uninformed (Blind) Search Strategies: BFS, DFS & UCS

**Problem: reach the goal with no distance hints — only successors, costs, and a goal test. By the end you can run Breadth-First Search (BFS), Depth-First Search (DFS), and Uniform-Cost Search (UCS) by hand and state exactly when each guarantee holds.**

<a id="start-zero"></a>
## 1. Start From Zero: Navigating in the Dark

You stand in an unlit maze with no map or compass. You can feel neighbouring walls, step, and check "is this the exit?" That is **uninformed (blind) search**: no estimate of closeness to the goal, only systematic exploration.

**Definitions:** BFS expands level by level (all depth-1 nodes, then depth-2, ...). DFS plunges down one branch to the bottom before backtracking. UCS expands the cheapest-known path first. FIFO (First-In First-Out) queue serves BFS; LIFO (Last-In First-Out) stack serves DFS; priority queue ordered by path cost serves UCS.

::: callout-intuition Core Mental Model: Navigating in the Dark
Blind does not mean random — it means systematic without guidance. Drop the maze after this; the technical content is frontier order plus data structure.
:::

**Tiny beginner example:** root A connects to B (cost 1) and C (cost 5); B connects to goal G (cost 1). BFS finds G in 2 steps. DFS might too — or might wander. UCS compares totals (A-B-G = 2 vs. A-C = 5) and picks the cheap road. Same map, different orderings, different bills.

<a id="basics"></a>
## 2. Basic Layer: How Each Strategy Is Judged

**Data/state:** frontier (unexpanded nodes) plus explored set. **Goal:** reach a goal state; ideally cheapest. Every strategy is scored on:

1. **Complete** — finds a solution whenever one exists?
2. **Optimal** — finds the lowest-cost solution?
3. **Time** — nodes expanded? 4. **Space** — nodes held in memory?

Symbols: `b` = branching factor (max successors per node); `d` = depth of shallowest goal; `m` = maximum depth (possibly infinite); `g(n)` = path cost from start to node `n`; `C*` = optimal path cost; `epsilon` = minimum step cost (smallest edge price, must be positive).

**BFS:** expands shallowest frontier node first (FIFO). Level diagram:

```text
        [A] level 0
        /     \
    [B]       [C] level 1
    /   \
[D]     [E] level 2
Queue: [A] -> [B,C] -> [C,D,E] -> ...
```

::: callout-formula BFS Performance, With Qualifications
Time `O(b^d)`, space `O(b^d)`. Complete only if `b` is finite. Optimal only if all step costs are equal (finds fewest steps, which equals cheapest only under uniform cost). Memory is the bottleneck: b=10, d=8 stores ~10^8 nodes.
:::

**DFS:** expands deepest node first (LIFO stack / recursion). Dives A-B-D before ever trying C.

::: callout-formula DFS Performance, With Qualifications
Time `O(b^m)`, space `O(b*m)` (only the active path plus siblings — linear). Incomplete in infinite spaces or with loops unless repeated-state checks are added. Never optimal in general (returns the first goal stumbled upon, possibly deep and pricey).
:::

<a id="formal-model"></a>
## 3. Formal Layer: UCS and the Comparison

**UCS method:** expand the frontier node with smallest `g(n)` (priority queue). **Model:** handles varying step costs that defeat BFS.

```text
      --1--> [B] g=1 (expand first)
[A]
      --5--> [C] g=5
```

::: callout-formula UCS Performance, With Qualifications
Let `C*` be optimal cost, every step cost `>= epsilon > 0`. Time and space `O(b^(1 + floor(C*/epsilon)))`. Complete given the epsilon bound (rules out zero-cost infinite paths that would trap it). Optimal for arbitrary non-negative costs given that bound — the qualified claim, not "always optimal."
:::

Comparison matrix (formal layer kept):

```text
Criterion   | BFS (FIFO)        | DFS (LIFO)   | UCS (priority on g)
Complete?   | Yes if b finite   | No (loops)   | Yes if costs >= epsilon > 0
Optimal?    | Only uniform cost | No           | Yes given epsilon bound
Time        | O(b^d)            | O(b^m)       | O(b^(1+floor(C*/eps)))
Space       | O(b^d)            | O(b*m)       | O(b^(1+floor(C*/eps)))
```

::: callout-pitfall The Memory Bottleneck of BFS
BFS dies by RAM before CPU: whole exponential tiers sit in the queue. DFS sips memory but risks infinite descents. UCS pays BFS-like memory for cost-optimality.
:::

::: anim bfs-dfs-race Ripples Against String
Watch both strategies run one shared tree: left ignites level by level (nearest first), right plunges down one branch before backtracking (deepest first) — same footsteps budget, opposite discovery orders.
:::

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

**KTU procedure — UCS trace on the tiny graph:** frontier {A:0}. Pop A, push B:1, C:5. Pop B (1 < 5), push G via B at 2. Pop G at 2 before C at 5 — goal test on popping returns cost 2, provably cheapest since every frontier entry costs >= 2.

| Similar pair | Distinction |
|---|---|
| BFS vs. UCS optimum | Fewest steps vs. cheapest cost (differ exactly when costs vary) |
| DFS vs. BFS memory | Linear path stack vs. exponential tier queue |
| Complete vs. optimal | Finds a solution vs. finds the cheapest (independent axes) |

**Watch out:** (1) BFS on toll roads picks the 1-step \$100 toll over a 3-step \$5 backroad — shallow is not cheap. (2) DFS without an explored set loops on graphs. (3) UCS needs strictly positive lower-bounded costs; zero-cost cycles break its completeness argument.

**Limitations:** all three are blind — on huge spaces they expand far too much. Guidance (heuristics, Module 2.3+) is mandatory at scale; UCS's priority queue also costs log-frontier overhead per expansion.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Why is Breadth-First Search (BFS) suboptimal when step costs along edges are unequal?
() Because BFS has infinite space complexity.
(*) Because BFS optimizes for the fewest depth steps rather than cumulative numerical path cost, choosing shorter step paths over cheaper total cost paths.
() Because BFS uses a priority queue.
() Because BFS cannot branch more than twice per node.
::: explanation
BFS finds the shallowest goal. With a 1-step \$100 road and a 3-step \$5 road, shallow costs \$95 extra. UCS is the cost-aware fix.
:::

::: quiz What is the main memory advantage of Depth-First Search (DFS) over Breadth-First Search (BFS)?
() DFS has constant $O(1)$ space complexity.
(*) DFS only stores the single active path from root to leaf plus unexpanded siblings, giving a linear space complexity of $O(bm)$ compared to BFS's exponential $O(b^d)$ frontier.
() DFS stores nodes in an indexed hash map.
() DFS never expands duplicate nodes.
::: explanation
The LIFO stack holds one branch of depth m plus siblings: O(b*m). BFS holds entire tiers: O(b^d). Linear versus exponential is the whole trade.
:::

::: quiz Which uninformed search algorithm guarantees finding the lowest-cost solution when step costs vary, assuming all step costs are strictly positive ($\epsilon > 0$)?
() Depth-First Search
() Breadth-First Search
(*) Uniform-Cost Search (UCS)
() Random Walk Search
::: explanation
UCS pops smallest g(n) first from a priority queue. With costs bounded below by epsilon > 0, the first popped goal is provably cheapest.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: four criteria or BFS-vs-DFS complexities with the memory verdict. 7 marks: UCS trace with queue states plus the epsilon-bound optimality argument.
:::

**Recap facts examiners reward:** frontier structures; `O(b^d)` vs. `O(b*m)` vs. `O(b^(1+floor(C*/eps)))`; completeness/optimality each with its stated condition; toll-road counterexample.

### Sample 3-Mark Question
**Q: Compare BFS and DFS time/space. Which exhausts memory first?**

**Model Answer:** BFS O(b^d)/O(b^d); DFS O(b^m)/O(b*m). BFS exhausts RAM first — exponential tiers versus one linear branch.

### Sample 7-Mark Question
**Q: Explain UCS and prove its optimality intuition.**

**Model Answer:** UCS pops min-g(n) via priority queue (2 marks); unlike BFS-FIFO it orders by cost not depth (2 marks); with costs >= eps > 0, costs rise monotonically along paths, so the first popped goal has g <= every frontier entry and no unfinished route can beat it (3 marks).
:::
