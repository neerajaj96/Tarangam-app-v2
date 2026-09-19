---
id: m1_07_classic_ai_toy_problems
courseCode: PECST522
module: 1
sequence: 7
title: Classic AI Toy Problems & Real-World Formulations
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Formulate Vacuum World, 8-Puzzle and 8-Queens exactly
  - Count reachable states against parity constraints
  - Lift toy formulations to real-world search problems
concepts:
  - vacuum world
  - sliding puzzles
  - state counting
prerequisites:
  - m1_06_problem_solving_agents_and_search_trees
examRelevance: medium
tags:
  - agents
  - toy-problems
---
# Classic AI Toy Problems & Real-World Formulations

**Formal problem formulations: Vacuum World, Sliding 8-Puzzle, 8-Queens problem, and real-world search problems.**

<a id="the-intuition"></a>
## 1. Toy Problems vs. Real-World Problems

When AI researchers develop and benchmark new search algorithms, they do not test them immediately on complex, massive real-world systems. Instead, they use **Toy Problems**.

* **Toy Problem:** A concise, formal, and clearly defined problem with exact mathematical rules and a manageable state space, used to compare and evaluate search algorithms.
* **Real-World Problem:** A production problem whose solutions have direct practical, scientific, or financial value (e.g., airline scheduling, autonomous navigation, chip routing).

::: callout-intuition Core Mental Model: The Flight Simulator
Think of a toy problem like a flight simulator used in pilot training. It has simplified physics and an artificial cockpit, allowing pilots to master flight principles safely before handling a commercial airliner. In AI, toy problems allow us to verify search algorithms before deploying them to high-stakes applications.
:::

---

<a id="the-dimensions"></a>
## 2. The Vacuum World

The **Vacuum World** is a foundational toy problem for single-agent search and reflex planning.

### Formal Formulation (The 5-Tuple)
1. **Initial State:** The agent is in location $A$ or $B$. Dirt can be in $A$, in $B$, in both, or in neither.
2. **Actions:** `[Left, Right, Suck]`
3. **Transition Model:** Moving `Left` places the agent in $A$; moving `Right` places the agent in $B$; `Suck` cleans the current location if dirty.
4. **Goal Test:** Are all locations clean?
5. **Path Cost:** 1 unit per action taken.

### ASCII Diagram: Vacuum World State Transitions
```text
      +--------------------+                 +--------------------+
      | State 1:           |                 | State 2:           |
      | [Agent at A, Dirty]| --(Action: Suck)--> | [Agent at A, Clean]|
      +--------------------+                 +--------------------+
               |                                       |
        (Action: Right)                         (Action: Right)
               v                                       v
      +--------------------+                 +--------------------+
      | State 3:           |                 | State 4:           |
      | [Agent at B, Dirty]|                 | [Agent at B, Clean]|
      +--------------------+                 +--------------------+
```

::: callout-formula State Space Size of Vacuum World
With 2 physical locations, 2 dirt states per location ($\text{Clean}$ or $\text{Dirty}$), and 2 possible agent locations:
$$\text{Total States} = 2 \times 2 \times 2 = 8 \text{ possible world states}$$
:::

---

<a id="terminology"></a>
## 3. The Sliding 8-Puzzle

The **8-Puzzle** is a sliding-tile problem consisting of a $3 \times 3$ board with 8 numbered tiles and one empty space (the blank).

### Formal Formulation & The "Blank Tile" Standard
* **States:** The positions of the 8 numbered tiles and the blank space on the $3 \times 3$ grid.
* **Actions:** Instead of defining actions by which *tile* moves (which varies based on position), we formulate actions by **moving the blank space**: `[Up, Down, Left, Right]`.
* **Transition Model:** Given a state and an action, returns the resulting board layout after swapping the blank with the adjacent tile.
* **Goal Test:** Matches a target numerical configuration (e.g., tiles 1 through 8 in sequential order).
* **Path Cost:** 1 unit per slide.

### ASCII Diagram: The 8-Puzzle Board
```text
      +---+---+---+             +---+---+---+
      | 1 | 2 | 3 |             | 1 | 2 | 3 |
      +---+---+---+             +---+---+---+
      | 8 |   | 4 |  --(Move)-->| 8 | 4 |   |
      +---+---+---+             +---+---+---+
      | 7 | 6 | 5 |             | 7 | 6 | 5 |
      +---+---+---+             +---+---+---+
```

::: callout-formula State Space Size of the 8-Puzzle
The total permutations of 9 elements on a grid is $9! = 362,880$. However, parity constraints (inversions) mean that exactly half of these configurations cannot be reached via legal sliding moves from any starting state:
$$\text{Reachable States} = \frac{9!}{2} = 181,440$$
:::

---

<a id="foundations"></a>
## 4. The 8-Queens Problem

The **8-Queens Problem** requires placing 8 queens on an $8 \times 8$ chessboard such that no two queens attack each other (no two share the same row, column, or diagonal).

### Formulation Strategies: Incremental vs. Complete-State
The formulation chosen directly determines the size and shape of the search space.

* **Strategy 1: Incremental Formulation (Constructive Placement)**
  * *Initial State:* An empty chessboard.
  * *Actions:* Add a queen to any empty square.
  * *State Space Size:*
    $$64 \times 63 \times 62 \times 61 \times 60 \times 59 \times 58 \times 57 \approx 3 \times 10^{14} \text{ states}$$
* **Strategy 2: Complete-State Formulation (Heuristic Repair)**
  * *Initial State:* All 8 queens placed on the board with **exactly one queen per column**.
  * *Actions:* Move a queen vertically within its column to a different row.
  * *State Space Size:* Since each queen is restricted to its own column, each has 8 possible rows:
    $$8^8 = 16,777,216 \text{ states}$$

### ASCII Diagram: 8-Queens Formulations
```text
      INCREMENTAL (Any empty square)       COMPLETE-STATE (1 Queen per column)
        .  .  Q  .  .  .  .  .                 Q  .  .  .  .  .  .  .
        .  .  .  .  Q  .  .  .                 .  .  Q  .  .  .  .  .
        (Searching 300 trillion states)          .  .  .  .  .  Q  .  .
                                                 (Searching 16.7 million states)
```

::: callout-pitfall State Space Explosion
A naive problem formulation can inflate your search space by many orders of magnitude. Restricting problem dimensions early (such as 1 queen per column) prunes invalid configurations and makes search computationally feasible.
:::

---

<a id="history"></a>
## 5. Real-World Search Problems

Unlike toy problems, real-world problems feature massive search spaces, continuous variables, and noisy data:

* **Route Finding & Traveling Salesperson Problem (TSP):**
  * *Route Finding:* Computing optimal point-to-point driving directions on road networks (Google Maps, GPS navigation).
  * *TSP:* Finding the shortest round-trip tour visiting $N$ cities exactly once and returning to the start. It is an **NP-hard** problem with $(N-1)! / 2$ tours for symmetric graphs.
* **VLSI Layout Design:** Positioning millions of logic transistors and routing interconnecting wires on silicon chips to minimize signal delay and silicon area without wire overlap.
* **Robot Navigation & Motion Planning:** Guiding robotic manipulators through complex 3D workspaces around dynamic obstacles.

---

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Why do AI engineers formulate the 8-puzzle by moving the blank space rather than moving the numbered tiles?
() Because the blank space has less weight than the tiles.
(*) Because moving the blank space standardizes the action set to at most 4 directional choices (Up, Down, Left, Right), whereas moving tiles yields variable numbers of legal choices depending on adjacent spaces.
() Because tiles cannot move diagonally.
() Because the blank space represents the goal state.
::: explanation
Standardizing actions around the blank space makes the transition model uniform across all states. The blank can always move into adjacent slots, while individual tiles have variable degrees of movement freedom depending on their board position.
:::

::: quiz What is the primary advantage of using a Complete-State Formulation for the 8-Queens problem over an Incremental Formulation?
() It guarantees finding the solution on the very first step.
(*) It drastically reduces the state space from over 300 trillion configurations down to 16.7 million by pre-restricting each queen to its own column.
() It allows queens to move through other pieces.
() It eliminates the need to check diagonal conflicts.
::: explanation
By restricting each queen to its own column from the outset, we eliminate vast regions of the search tree where multiple queens share columns, cutting the search space by nearly seven orders of magnitude.
:::

::: quiz Why are 50% of the mathematical permutations ($9!$) of the 8-puzzle unreachable during search?
() Because the center position is fixed.
(*) Because sliding moves preserve the parity of tile inversions, making odd-parity configurations unreachable from even-parity goal states.
() Because the blank tile cannot enter corner positions.
() Because path costs cannot exceed depth limits.
::: explanation
Every legal slide corresponds to an even permutation of tiles (preserving the inversion parity). Half of the $9! = 362,880$ permutations have odd parity and are mathematically unreachable from the standard goal state.
:::

---

<a id="exam-focus"></a>
## 7. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Define the 5-tuple formulation of the 8-puzzle or calculate the reachable state space of an $N$-puzzle.
* **7 Marks:** Compare incremental vs. complete-state formulations for the 8-Queens problem with full state space calculations.
:::

### Sample 3-Mark Question
**Q: Formulate the Sliding 8-Puzzle as a search problem by specifying its 5-tuple definition.**

**Model Answer:**
1. **States:** Coordinate locations of each of the 8 numbered tiles and the blank space on the $3 \times 3$ grid.
2. **Actions:** Moving the blank space `[Up, Down, Left, Right]`.
3. **Transition Model:** Returns the new board layout resulting from swapping the blank space with an adjacent tile.
4. **Goal Test:** Checks whether the current tile configuration matches the target goal state (e.g., tiles 1–8 in order).
5. **Path Cost:** 1 unit per sliding action.

### Sample 7-Mark Question
**Q: Compare Incremental Formulation and Complete-State Formulation for solving the 8-Queens problem. Calculate and contrast the size of the state space for both approaches.**

**Model Answer:**
1. **Introduction (1 Mark):** The 8-queens problem requires placing 8 non-attacking queens on an $8 \times 8$ chessboard. The choice of formulation radically alters search efficiency.
2. **Incremental Formulation (3 Marks):**
   * *Mechanism:* Begins with an empty board and adds queens one by one.
   * *State Space:* Placing queen 1 has 64 choices, queen 2 has 63 choices, $\dots$, queen 8 has 57 choices:
     $$64 \times 63 \times 62 \times 61 \times 60 \times 59 \times 58 \times 57 \approx 3.1 \times 10^{14} \text{ states}$$
3. **Complete-State Formulation (3 Marks):**
   * *Mechanism:* Begins with all 8 queens on the board, enforcing **one queen per column**. Actions move queens vertically within their column.
   * *State Space:* Each of the 8 queens has 8 possible row positions:
     $$8^8 = 16,777,216 \text{ states}$$
   * *Conclusion:* Complete-state formulation reduces the state space by approximately $10^7$ times, enabling efficient local search.
