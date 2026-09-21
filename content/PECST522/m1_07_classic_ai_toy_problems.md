---
id: m1_07_classic_ai_toy_problems
courseCode: PECST522
module: 1
sequence: 7
title: Classic AI Toy Problems & Real-World Formulations
difficulty: beginner
estimatedMinutes: 11
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

**Problem: new search algorithms need small exact arenas before real deployment. By the end you can formulate Vacuum World, 8-Puzzle, and 8-Queens as 5-tuples, count their states, and lift the pattern to real problems.**

<a id="start-zero"></a>
## 1. Start From Zero: Simulators Before Airliners

Pilots train in flight simulators (simplified, safe, exact rules) before flying airliners. **Toy problems** are AI's simulators: concise formal tasks for comparing algorithms. **Real-world problems** (scheduling, navigation, chip layout) carry practical value but huge noisy spaces.

::: callout-intuition Core Mental Model: The Flight Simulator
Master principles cheaply in simulation, then deploy where mistakes cost money. Drop the cockpit after this; the technical work is 5-tuple formulation plus state counting.
:::

**Tiny beginner example:** Vacuum World has 2 rooms and 3 actions — you can enumerate everything by hand. That enumerability is exactly what makes it a benchmark.

<a id="basics"></a>
## 2. Basic Layer: Vacuum World and 8-Puzzle

**Data/state, goal, method:** each problem below is given as initial state, actions, transition model, goal test, path cost.

**Vacuum World:** agent in room A or B; dirt in A, B, both, or neither.
1. Initial: agent at A or B with a dirt pattern. 2. Actions: Left, Right, Suck. 3. Transitions: moves relocate; Suck cleans current square. 4. Goal test: all squares clean. 5. Path cost: 1 per action.

```text
[Agent A, Dirty] --Suck--> [Agent A, Clean]
      | Right                    | Right
      v                          v
[Agent B, Dirty]           [Agent B, Clean]
```

**Meaning, variables, formula:** 2 agent positions times 2 dirt states per room (clean/dirty each):

$$\text{States} = 2 \times 2 \times 2 = 8$$

::: toggle Where does `2 × 2 × 2 = 8` come from?
Three independent binary choices multiply: agent position (A or B = 2 options) × dirt in A (clean or dirty = 2) × dirt in B (2). Each combination is one distinct state (e.g. [Agent B, A-dirty, B-clean]). Tiny check: list all 8 — 2 positions × 4 dirt patterns (none/A/B/both) = 8. Formulation skill = spotting the independent dimensions, then multiplying (never adding — choices combine, not alternative).
:::

::: toggle What is `9!/2 = 181,440` and why half?
`9!` (9 factorial = 9×8×…×1 = 362,880) counts all tile arrangements. Each slide swaps the blank with a neighbour — an even permutation (two swaps in disguise), so parity (even/odd inversion count) never changes. Goal has even parity; odd-parity layouts are unreachable, not just hard — exactly half the arrangements. Reachable = 362,880/2 = 181,440. Intuition: parity is a conserved quantity like energy — moves preserve it, so half the space is walled off from any start.
:::

**8-Puzzle:** 3x3 board, 8 numbered tiles, one blank.
States: tile-plus-blank positions. Actions: move the **blank** Up/Down/Left/Right (standardizing on the blank keeps at most 4 uniform choices; tile-based moves vary by position). Transitions: swap blank with neighbour. Goal test: target arrangement. Path cost: 1 per slide.

```text
1 2 3      1 2 3
8 _ 4  --> 8 4 _
7 6 5      7 6 5
```

**State counting with parity:** permutations of 9 items give `9! = 362,880`. Sliding preserves inversion parity (even/odd count of out-of-order pairs), so only half are mutually reachable:

$$\text{Reachable} = 9!/2 = 181,440$$

Intuition: each slide is an even permutation, so odd-parity layouts from the goal are mathematically unreachable, not just hard.

<a id="formal-model"></a>
## 3. Formal Layer: 8-Queens Formulations and Real Problems

**Problem:** place 8 queens with none sharing row, column, or diagonal. **Method choice changes the space enormously:**

- **Incremental (constructive):** start empty, add a queen per empty square. States: `64 x 63 x ... x 57 ~ 3 x 10^14` (about 300 trillion).
- **Complete-state (repair):** start with one queen per column, move queens within columns. Each of 8 queens has 8 rows: `8^8 = 16,777,216` (about 16.7 million) — roughly ten-million-fold smaller.

::: callout-pitfall State Space Explosion
Naive formulation multiplies the search bill by orders of magnitude. Restricting dimensions early (one queen per column) prunes invalid regions before search starts.
:::

**Real-world lifts:** Route finding (point-to-point navigation) and the Travelling Salesperson Problem (TSP — shortest tour visiting N cities once and returning; NP-hard, meaning no known polynomial-time exact method, with `(N-1)!/2` symmetric tours); VLSI (Very Large Scale Integration) layout (place millions of transistors, route wires, minimize delay/area); robot motion planning (3D paths around dynamic obstacles). All inherit toy structure (states, actions, costs) at massive continuous noisy scale.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Incremental vs. complete-state | Build up from empty vs. repair a full placement |
| Toy vs. real-world | Exact small benchmark vs. massive noisy deployment |
| Reachable vs. permuted states | Legally accessible vs. mathematically listable (parity halves puzzle) |

**Watch out:** (1) Blank-based actions are uniform; tile-based are not. (2) Parity unreachability is proof, not bad luck. (3) TSP tour counts explode factorially — never promise exact optimality at scale without qualification.

**Limitations:** toy spaces fit in memory; real spaces need heuristics, approximation, and handling of continuous/noisy data. Formulation skill transfers; exact enumeration does not.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Why do AI engineers formulate the 8-puzzle by moving the blank space rather than moving the numbered tiles?
() Because the blank space has less weight than the tiles.
(*) Because moving the blank space standardizes the action set to at most 4 directional choices (Up, Down, Left, Right), whereas moving tiles yields variable numbers of legal choices depending on adjacent spaces.
() Because tiles cannot move diagonally.
() Because the blank space represents the goal state.
::: explanation
Blank-centred actions are uniform across states, simplifying the transition model. Tile-centred moves vary with board position.
:::

::: quiz What is the primary advantage of using a Complete-State Formulation for the 8-Queens problem over an Incremental Formulation?
() It guarantees finding the solution on the very first step.
(*) It drastically reduces the state space from over 300 trillion configurations down to 16.7 million by pre-restricting each queen to its own column.
() It allows queens to move through other pieces.
() It eliminates the need to check diagonal conflicts.
::: explanation
One-queen-per-column removes all column-sharing regions up front, cutting the space by about seven orders of magnitude for efficient local search.
:::

::: quiz Why are 50% of the mathematical permutations ($9!$) of the 8-puzzle unreachable during search?
() Because the center position is fixed.
(*) Because sliding moves preserve the parity of tile inversions, making odd-parity configurations unreachable from even-parity goal states.
() Because the blank tile cannot enter corner positions.
() Because path costs cannot exceed depth limits.
::: explanation
Legal slides are even permutations preserving inversion parity. Half of 362,880 layouts have opposite parity and are unreachable from the standard goal.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: 5-tuple of 8-puzzle or reachable-state arithmetic. 7 marks: incremental vs. complete-state for 8-Queens with counts.
:::

**Recap facts examiners reward:** Vacuum 8-state derivation; blank-move standard; `9!/2 = 181,440` with parity reason; `64x...x57 ~ 3.1x10^14` vs. `8^8 = 16,777,216`; TSP `(N-1)!/2` and NP-hard qualification.

### Sample 3-Mark Question
**Q: Formulate the 8-Puzzle as a 5-tuple.**

**Model Answer:** States: positions of 8 tiles plus blank. Actions: move blank Up/Down/Left/Right. Transitions: swap with neighbour. Goal test: matches target layout. Path cost: 1 per slide.

### Sample 7-Mark Question
**Q: Compare 8-Queens formulations with state counts.**

**Model Answer:** Incremental builds from empty (64 down to 57 choices, ~3.1x10^14 states). Complete-state starts one-per-column with vertical moves (8^8 = 16,777,216). Restriction cuts ~10^7-fold, enabling local search.
:::
