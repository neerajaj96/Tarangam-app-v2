---
id: m2_08_games_minimax_optimal_play
courseCode: PECST522
module: 2
sequence: 8
title: 'Games & Minimax: Optimal Play Against an Adversary'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Back up MAX and MIN values from terminal utilities
  - Name the winning move on the full 3-versus-2 trace
  - Price full-width backup against game-length exponents
concepts:
  - minimax algorithm
  - zero-sum games
  - backward backup
prerequisites:
  - m2_01_uninformed_search_dfs_bfs_ucs
examRelevance: high
tags:
  - search
  - game-playing
---
# Games & Minimax: Optimal Play Against an Adversary

**Problem: how do we choose moves when an opponent replies to hurt us? By the end you can back up minimax values by hand, name the optimal move, and state exactly what "optimal" assumes.**

<a id="start-zero"></a>
## 1. Start From Zero: The Pessimist's Elevator

MAX rides an elevator where MIN picks the floor: at MIN levels the car drops to the lowest reachable value, at MAX levels it rises to the highest. **Minimax** prices the ride assuming a perfect adversary — optimal play is the ground-floor button (move) with the best guaranteed outcome. Expecting blunders is hope, not strategy.

**Definitions:** a **zero-sum game** means one player's gain is the other's loss (utilities mirrored: +1 for MAX equals -1 for MIN). **Deterministic perfect-information** means no chance nodes and fully visible state (chess-like, not poker-like). **MAX** is the player choosing the move (by convention moves first at the root); **MIN** is the adversary. **Terminal utility** is the game-end score from MAX's viewpoint. The **minimax value** of a node is terminal utility at leaves, max of children at MAX nodes, min of children at MIN nodes.

::: callout-intuition Core Mental Model: Pessimist's Elevator
Feel "floors drop, roof picks" here, then drop the elevator; backed-up max/min with one fixed viewpoint is the technical content.
:::

::: anim minimax-backup Floors Drop, Roof Picks
MIN floors sink to their smallest leaf while the MAX roof rises to the largest floor — watch $3$ and $2$ surface, then the root take $3$.
:::

**Tiny beginner example:** MAX picks left (MIN replies 1 or 9, so MIN forces 1) or right (MIN replies 5 only, so 5). Guarantees: left secures 1, right secures 5 — optimal move is right despite the flashy 9 that MIN will never allow.

::: toggle What are `game tree`, `MAX/MIN node`, `utility`, `terminal`, `minimax value`?
Game tree = all move sequences as branches (root = current position, edges = moves, leaves = game ends). MAX node = our turn (take the maximum child — best guaranteed outcome). MIN node = adversary's turn (take the minimum child — worst reply assumed). Utility = terminal score from MAX's viewpoint (+1 win, −1 loss, draws between). Terminal = game-over node (no moves left — scored, never expanded). Minimax value = backed-up worth (leaves: utility; MAX: max of children; MIN: min of children). Tiny check above: left's MIN backs up min(1,9) = 1; right backs up 5; root MAX takes max(1,5) = 5 — move right.
:::

::: toggle Trace the 3-vs-2 tree node by node
Leaves under MIN A: 3, 12, 8 → A backs up min = 3 (the 12 tempts only the unwary — MIN picks the floor). Leaves under MIN B: 2, 4, 6 → B backs up 2. Root MAX sees floors {A:3, B:2} → takes max = 3 (move toward A). Winner 3 was A's smallest leaf: guarantees bank floors, never flashy leaves behind perfect defence. Verify: any other root move secures ≤ 2 — 3 is the best assured floor.
:::

<a id="basics"></a>
## 2. Basic Layer: Backup Rules and Viewpoint Discipline

**Data/state:** game tree with players, actions, terminal utilities. **Goal:** the root move toward the child whose minimax value equals the root's (best guaranteed outcome).

**Procedure (steps):** Step 1: score terminal leaves from MAX's viewpoint. Step 2: at each MIN node take the minimum of children. Step 3: at each MAX node take the maximum of children. Step 4: at the root, move toward the max-valued child.

**Viewpoint rule:** all leaves use one fixed viewpoint (MAX's utility). Mixing "good for the mover" per level corrupts every backup above (plain minimax fed mixed viewpoints computes precise nonsense; mover-relative scoring needs the negamax variant with per-level negation — beyond this note's procedure).

::: callout-pitfall Averaging Over Adversaries
Expectimax (chance nodes) averages over randomness; minimax minimizes over adversaries. Backing up a MIN node with the mean models a random opponent, not a hostile one — MIN picks the floor, never the average room.
:::

<a id="formal-model"></a>
## 3. Formal Layer: Full Trace and Price Tag

**Full 3-vs-2 trace:** root MAX over MIN A (leaves 3, 12, 8) and MIN B (leaves 2, 4, 6). MIN A = min(3,12,8) = 3 (the 12 tempts only the unwary). MIN B = min(2,4,6) = 2. Root = max(3,2) = 3. Optimal move toward A, securing 3 regardless of reply; B secures only 2. Note the winner (3) was A's smallest leaf — guarantees bank floors, never flashy leaves behind perfect defence.

::: callout-formula KTU Formula Vault: Minimax
Terminal = utility (MAX viewpoint). MAX = max of children. MIN = min of children. Optimal move = step toward root value. Time `O(b^m)` (branching b, game length m), space `O(b*m)` depth-first.
:::

**Qualifications (never drop these):** minimax is optimal **only against an optimal (perfectly adversarial) opponent in deterministic perfect-information zero-sum games with correct utilities**. Against blundering opponents it is safe but not exploitative; with wrong utilities or chance/hidden state it needs extensions (expectimax, evaluation cutoffs). Full-width backup to terminal ply is infeasible for chess (b ~ 35, m ~ 80 dwarfs atom counts) — real play uses depth limits plus evaluation functions, and alpha-beta (next topic) prunes exactly.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Minimax vs. expectimax | Minimize over adversaries vs. average over chance |
| Guarantee vs. hope | Best assured floor vs. best leaf assuming blunders |
| Full backup vs. cutoff play | Exact terminal proof vs. depth-capped evaluation approximation |

**Watch out:** (1) Back up floors before roofs — never max over raw leaves across a MIN layer. (2) Utilities must mirror zero-sum (+1/-1), not double-count. (3) `O(b*m)` space never rescues `O(b^m)` time.

**Limitations:** exponential time; perfect-opponent assumption; needs exact game model and terminal utilities; no handling of chance, hiding, or multiple movers without extensions.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Q1: Backup Drill
MIN node with leaves 7, 1, 9; sibling MIN is 5; parent MAX?
(A) 9, MAX takes the max leaf directly
(*B) MIN backs up 1, so parent sees max(1, 5) = 5 — floors first, roof second, never roof-over-leaves
(C) 7, first leaf wins
(D) Mean 5.67 rounded to 6
::: explanation
MIN collapses to 1 before MAX looks. MAX compares floors (1 vs. 5), not leaves — skipping the MIN layer is the standard error.
:::

::: quiz Q2: Viewpoint Discipline
Leaves scored "from the mover's perspective". Status?
(A) Fine, symmetric games allow it
(*B) Corrupt — minimax backup assumes one fixed viewpoint (MAX's utility), and mover-relative scores flip sign per level, so every MIN/MAX operation above misfires
(C) Only affects ties
(D) Fixes zero-sum issues automatically
::: explanation
Max and min are viewpoint-locked. Mover-relative scores need per-level negation (negamax); plain minimax on mixed scores misfires everywhere.
:::

::: quiz Q3: Complexity Honesty
Minimax on chess to terminal depth. Feasibility?
(A) Routine with depth-first order
(*B) Hopeless — b^m with b approx 35, m approx 80 dwarfs atom counts, so real play needs depth caps, evaluation functions, and pruning (M2.9), not raw backup
(C) O(bm) space saves it
(D) Faster with bigger branching
::: explanation
Linear space cannot rescue exponential time. Cutoff plus evaluation trades guarantees for moves — the applied-games bargain versus textbook backup.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: MAX/MIN backup rules with the zero-sum viewpoint. 7 marks: full 3-vs-2 trace naming the move plus the feasibility qualification.
:::

**Recap facts examiners reward:** max/min definitions; fixed-viewpoint rule; 3/2/root-3 trace; `O(b^m)`/`O(b*m)`; optimal-only-against-optimal-opponent qualification; chess infeasibility with cutoff remedy.

### Sample 3-Mark Question
**Q: State minimax backup and its optimality assumption.**

**Model Answer:** Leaves terminal utilities (MAX view); MIN takes min, MAX takes max; root moves toward root value. Optimal only vs. optimal adversary in deterministic perfect-information zero-sum play.

### Sample 7-Mark Question
**Q: Compute the 3-vs-2 tree and explain why the 12 never matters.**

**Model Answer:** A = 3, B = 2, root = 3, move to A. The 12 sits under MIN A which minimizes — perfect defence never permits it, so guarantees ignore flashy leaves.
:::
