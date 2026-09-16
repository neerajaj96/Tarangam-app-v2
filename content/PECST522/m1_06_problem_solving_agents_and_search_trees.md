# Problem-Solving Agents & Search Trees

**Goal formulation, the 5 components of a well-defined problem, state space vs. search tree, node expansion, and how search performance is measured.**

<a id="the-intuition"></a>
## 1. What Does It Mean to "Solve a Problem"?

Imagine driving to an unfamiliar airport. You do not start the engine and improvise turn by turn — you first decide the **goal** ("reach Terminal 2 by 6 PM"), then, map in hand, you work out a **sequence of actions** (take the highway, exit at 14B, follow signs) *before* moving a single metre. Only after the route is fully planned do you execute it.

A **problem-solving agent** works exactly this way. It is a goal-based agent specialized for settings where the right action sequence is not obvious and must be *computed in advance*:

```text
FORMULATE-GOAL  ──>  FORMULATE-PROBLEM  ──>  SEARCH  ──>  EXECUTE
 (where to end)      (states/actions)     (find path)   (follow it)
```

::: callout-intuition Offline Thinking, Online Acting
Search is **offline deliberation**: the agent simulates futures inside its head (or its memory) without touching the real world. Execution only begins once a complete action sequence exists. This separation is why a chess engine can "think" for minutes and then play a whole combination flawlessly — all the trial and error happened in simulation, where mistakes are free.
:::

---

<a id="the-math"></a>
## 2. The 5 Components of a Well-Defined Problem

Before any search algorithm can run, the task must be nailed down as a **well-defined problem** — five precise pieces (R&N §3.1). Vague formulations are the #1 source of failed AI projects: the algorithm cannot find what was never specified.

1. **Initial state** — where the agent starts (e.g. the city `Arad`, a scrambled board).
2. **Actions** — what the agent *can* do in a given state (`ACTIONS(s)` returns the legal moves from $s$).
3. **Transition model** — what each action *does*: `RESULT(s, a)` gives the state reached by doing $a$ in $s$.
4. **Goal test** — how the agent recognizes success (an explicit state, e.g. `Bucharest`, or a property, e.g. "no queen attacks another").
5. **Path cost** — a number measuring how *expensive* an action sequence is (distance, time, money). The **optimal solution** is the one with the lowest total path cost — not merely *any* sequence that reaches the goal.

::: callout-formula Formal Definition: A Problem Is a 5-Tuple
$$\text{Problem} = (s_0,\ \text{ACTIONS},\ \text{RESULT},\ \text{GOAL-TEST},\ \text{STEP-COST})$$
The **state space** is the set of *all* states reachable from $s_0$ by any action sequence — drawn as a **graph** whose nodes are states and whose edges are actions. Memorize all five components in order: they are the standard 3-mark "define a well-defined problem" answer.
:::

### State Space vs. Search Tree (the most-tested distinction in this topic)

* The **state space** is the *territory*: the graph of all reachable states. It exists whether or not anyone searches it.
* The **search tree** is the *exploration trace*: the tree of paths the algorithm actually generates while searching. The same state can appear on the tree **many times** via different routes (Arad → Sibiu → Arad is a loop in the tree, not a new place on the map).

::: callout-pitfall Tree Nodes Are Paths, Not Places
A **search-tree node** is a data structure holding: the `STATE`, the `PARENT` node it came from, the `ACTION` used, the `PATH-COST` $g$ from the start, and the `DEPTH`. Beginners constantly confuse "expanding a node" (generating all its children) with "visiting a state". The tree can be exponentially larger than the state space — which is exactly why search needs strategies (Module 2) instead of blind wandering.
:::

### How a Search Strategy Is Judged (preview of Module 2)

Every algorithm in the next module is scored on four criteria — learn the vocabulary now:

* **Complete?** Does it always find a solution when one exists?
* **Optimal?** Does it find the *lowest-cost* solution?
* **Time complexity?** How many nodes does it generate/expand?
* **Space complexity?** How many nodes must it keep in memory?

Measured with branching factor $b$, solution depth $d$, and maximum depth $m$.

---

<a id="worked-example"></a>
## 3. Hand-Tracing a Search Tree (Arad → Fagaras)

Consider a tiny road map: Arad connects to Sibiu (140 km) and Zerind (75 km); Sibiu connects to Fagaras (99 km) and back to Arad. Goal: reach Fagaras from Arad.

```text
STATE SPACE (the map — a graph):

  Zerind --75-- Arad --140-- Sibiu --99-- Fagaras
                      \_______________/
                       (direct roads)

SEARCH TREE (the trace — repeats allowed):

              [Arad] g=0
              /        \
   (Zerind,75)          (Sibiu,140)
   [Zerind] g=75        [Sibiu] g=140
                             /      \
                  (Arad,140)          (Fagaras,99)
                  [Arad] g=280        [Fagaras] g=239  <-- GOAL
```

Reading the trace: the root node holds state Arad with $g=0$. **Expanding** it generates two children (Zerind, $g=75$; Sibiu, $g=140$). Expanding Sibiu generates Arad-again ($g=280$ — a repeated state, correctly appearing as a *new tree node*) and Fagaras ($g=239$), which passes the goal test. The solution is the action sequence Arad → Sibiu → Fagaras with path cost 239 — cheaper than any route detouring through Zerind. Note the tree already has 5 nodes for a 4-state map: on real maps this redundancy explodes, which is why Module 2 exists.

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz A problem-solving agent is given a goal but no precomputed action sequence. What is the correct order of its operation?
() Execute actions, then search for what it just did
() Search first, then formulate the goal from the results
(*) Formulate the goal, formulate the problem, search for a solution, then execute it
() Formulate the problem, execute immediately, and search only if execution fails
::: explanation
The R&N problem-solving agent pipeline is strictly ordered: **goal formulation** (decide where to end) → **problem formulation** (fix states, actions, costs) → **search** (simulate action sequences offline) → **execution** (follow the found sequence). Searching before the problem is formulated is impossible — there is nothing to search over yet.
:::

::: quiz In a search tree, the same city (e.g. Arad) appears as three different nodes. What does this mean?
() The map contains three different cities that happen to share a name
(*) Nodes represent paths from the start, so one state reached by different routes correctly appears as multiple tree nodes
() The search algorithm has a bug and must be restarted
() The goal test was applied to the wrong state
::: explanation
A search-tree node records a *path* (state + parent + action + path cost + depth), not a place. Different routes to the same state — Arad directly, Arad-via-Sibiu — are legitimately different nodes with different path costs. Confusing the tree (trace) with the state space (territory) is the classic error this topic warns against.
:::

::: quiz Which of the following is part of a well-defined problem but is NOT needed to merely reach *any* goal state — only to find the *best* one?
() Initial state
() Goal test
(*) Path cost (step cost)
() Actions function
::: explanation
Reaching *a* goal needs the start, the moves, and a way to recognize success. **Path cost** is what lets the agent compare candidate solutions and pick the optimal (cheapest) one. Without costs, "optimal" is undefined — which is exactly why uninformed search (Module 2) splits into step-count methods (BFS/DFS) and cost-aware ones (UCS).
:::

---

<a id="exam-focus"></a>
## 5. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** List the 5 components of a well-defined problem, or the 4 criteria for evaluating search strategies.
* **7 Marks:** Formulate a given scenario (route map, puzzle) as a 5-tuple and hand-trace the first two levels of its search tree, distinguishing state space from search tree.
:::

### Sample 3-Mark Question
**Q: Define a well-defined problem in AI. What are its five components?**

**Model Answer:** A well-defined problem is a task specified precisely enough for a search algorithm to operate on, as a 5-tuple: (1) **Initial state** $s_0$ where the agent starts; (2) **Actions** — `ACTIONS(s)` legal in each state; (3) **Transition model** — `RESULT(s,a)`; (4) **Goal test** — success recognition; (5) **Path cost** — numeric cost enabling optimality comparisons.

### Sample 7-Mark Question
**Q: For route-finding from Arad to Fagaras on the given map, (a) formulate the well-defined problem, (b) draw two levels of the search tree, (c) explain why Arad reappears and what this implies.**

**Model Answer:** (a) $s_0=$ Arad; actions $=$ drive to a neighboring city; result $=$ arrival city; goal test $=$ state is Fagaras; step cost $=$ road distance in km. (b) As traced in §3: root Arad expands to Zerind ($g=75$) and Sibiu ($g=140$); Sibiu expands to Arad ($g=280$) and Fagaras ($g=239$, goal). (c) Arad reappears because tree nodes are *paths*, not places — the same state via a longer route is a distinct node. Implication: trees outgrow state spaces (loops, redundancy), motivating systematic strategies with repeated-state handling in Module 2.
