---
id: m1_06_problem_solving_agents_and_search_trees
courseCode: PECST522
module: 1
sequence: 6
title: Problem-Solving Agents & Search Trees
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Formulate problems with the five-component contract
  - Separate state space from search tree with node expansion
  - Measure search with completeness, optimality, time and space
concepts:
  - problem formulation
  - search trees
  - node expansion
prerequisites:
  - m1_02_agents_and_environments_peas
  - m1_05_agent_architectures_reflex_to_learning
examRelevance: high
tags:
  - agents
  - problem-formulation
---
# Problem-Solving Agents & Search Trees

**Problem: the right action sequence is not obvious, so the agent must compute it before moving. By the end you can write the five-part problem contract, separate maps from search traces, and judge any search strategy.**

<a id="start-zero"></a>
## 1. Start From Zero: Think Before Moving

Driving to an unknown airport, you fix the goal ("Terminal 2 by 6 PM"), plan the route on a map, then drive. A **problem-solving agent** (a goal-based agent for non-obvious sequences) does the same:

```text
FORMULATE-GOAL --> FORMULATE-PROBLEM --> SEARCH (offline) --> EXECUTE (online)
```

Search is offline deliberation: mistakes in simulation are free; mistakes on the road are not. That is why a chess engine thinks for minutes then plays flawlessly.

::: callout-intuition Offline Thinking, Online Acting
Simulation first, wheels second. Drop the driving story after this; the examinable pipeline is goal, problem, search, execute — in that order.
:::

**Tiny beginner example:** start Arad, goal Fagaras, roads with distances. The agent simulates Arad-Sibiu-Fagaras vs. detours, prices each, then drives the cheapest. Planning and driving are separate phases.

<a id="basics"></a>
## 2. Basic Building Blocks: The Five-Part Contract

**Data/state:** states (places), actions (moves). **Goal:** reach a goal state cheaply. Every well-defined problem needs five pieces:

1. **Initial state** `s_0` — where you start (Arad).
2. **Actions** `ACTIONS(s)` — legal moves from state `s`.
3. **Transition model** `RESULT(s, a)` — state reached by doing `a` in `s`.
4. **Goal test** — recognizes success (state equals Bucharest, or "no attacking queens").
5. **Path cost** — number pricing a sequence (distance, time). The **optimal solution** is the lowest-cost goal-reaching sequence, not just any one.

::: callout-formula Formal Definition: A Problem Is a 5-Tuple
Problem = (initial state, ACTIONS, RESULT, GOAL-TEST, STEP-COST). The state space is all states reachable from the start — a graph of states (nodes) and actions (edges). Memorize all five in order for the standard 3-mark answer.
:::

**State space vs. search tree (most-tested distinction):** the state space is the territory (map graph, exists regardless). The search tree is the exploration trace (tree of paths actually generated; one state can appear many times via different routes). A **tree node** stores STATE, PARENT, ACTION, PATH-COST `g`, DEPTH. Expanding a node means generating all its children.

<a id="formal-model"></a>
## 3. Formal Layer: Judging Search Strategies

**Method:** score every Module-2 algorithm on four criteria. **Model:** parameters branching factor `b` (max successors per node), solution depth `d` (depth of shallowest goal), maximum depth `m` (possibly infinite).

- **Complete?** Finds a solution whenever one exists?
- **Optimal?** Finds the lowest-cost solution?
- **Time?** Nodes generated/expanded.
- **Space?** Nodes kept in memory.

**Procedure — hand-tracing two levels (steps then trace):** Step 1: root holds start with `g=0`. Step 2: expand root, create one child per action with accumulated costs. Step 3: test children for goal; expand one, repeat. Trace on Arad-Sibiu (140 km), Arad-Zerind (75 km), Sibiu-Fagaras (99 km):

```text
STATE SPACE (map):  Zerind --75-- Arad --140-- Sibiu --99-- Fagaras

SEARCH TREE (trace):
              [Arad] g=0
              /        \
   [Zerind] g=75    [Sibiu] g=140
                        /        \
              [Arad] g=280   [Fagaras] g=239 GOAL
```

Arad reappears because nodes are paths, not places. Solution: Arad-Sibiu-Fagaras at 239. The tree already exceeds the map — on real maps this redundancy explodes, motivating Module 2 strategies.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| State space vs. search tree | Territory graph vs. exploration trace (paths can repeat states) |
| Goal-reaching vs. optimal | Any goal path vs. cheapest goal path (needs path cost) |
| Search vs. execution | Offline simulation vs. online action |

**Watch out:** (1) Without path cost, "optimal" is undefined. (2) Expanding is generating children, not visiting a city. (3) Depth `d` vs. max depth `m` drive different complexity bounds.

**Limitations:** formulation alone solves nothing; blind traces loop and explode. Strategies with repeated-state handling and cost awareness (Module 2) are mandatory.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz A problem-solving agent is given a goal but no precomputed action sequence. What is the correct order of its operation?
() Execute actions, then search for what it just did
() Search first, then formulate the goal from the results
(*) Formulate the goal, formulate the problem, search for a solution, then execute it
() Formulate the problem, execute immediately, and search only if execution fails
::: explanation
Goal first (where to end), problem second (states/actions/costs to search over), search third (offline simulation), execution last. Nothing exists to search before formulation.
:::

::: quiz In a search tree, the same city (e.g. Arad) appears as three different nodes. What does this mean?
() The map contains three different cities that happen to share a name
(*) Nodes represent paths from the start, so one state reached by different routes correctly appears as multiple tree nodes
() The search algorithm has a bug and must be restarted
() The goal test was applied to the wrong state
::: explanation
Nodes record path plus cost plus depth, not just place. Different routes to Arad are legitimately different nodes with different costs.
:::

::: quiz Which of the following is part of a well-defined problem but is NOT needed to merely reach *any* goal state — only to find the *best* one?
() Initial state
() Goal test
(*) Path cost (step cost)
() Actions function
::: explanation
Start, moves, and goal recognition reach something. Path cost compares candidates to define and find the cheapest — hence cost-aware methods like UCS exist.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: five components or four judging criteria. 7 marks: formulate Arad-Fagaras as a 5-tuple, draw two tree levels, explain Arad's repeat and its implication.
:::

**Recap facts examiners reward:** 5-tuple names; node fields; territory-vs-trace line; four criteria with `b/d/m` meanings.

### Sample 3-Mark Question
**Q: Define a well-defined problem.**

**Model Answer:** Initial state, ACTIONS(s), RESULT(s,a), GOAL-TEST, STEP-COST/path-cost — precise enough for search to operate and optimality to be defined.

### Sample 7-Mark Question
**Q: Formulate Arad-Fagaras, trace two levels, explain the repeat.**

**Model Answer:** s_0 Arad; actions drive to neighbours; result arrival city; goal test is-Fagaras; step cost road km. Tree as in section 3: Sibiu branch yields goal at 239. Arad repeats because nodes are paths; implication: trees outgrow state spaces, so systematic strategies with repeated-state checks are needed.
:::
