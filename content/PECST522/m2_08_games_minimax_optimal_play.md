# Games & Minimax: Optimal Play Against an Adversary

**Zero-sum games as MAX/MIN trees, optimal decisions by backward backup, and the full 3-vs-2 trace that names the winning move.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Pessimist's Elevator
MAX rides an elevator where MIN picks the floor: at MIN levels the car drops to the *lowest* reachable value, at MAX levels it rises to the *highest*. **Minimax** computes what the ride is worth assuming a perfect adversary — optimal play is simply the ground-floor button (move) leading to the best guaranteed outcome. Optimism (expecting MIN to blunder) is not a strategy; guarantees are.
:::

::: anim minimax-backup Floors Drop, Roof Picks
MIN floors sink to their smallest leaf while the MAX roof rises to the largest floor — watch $3$ and $2$ surface, then the root take $3$.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Game anatomy and minimax

Zero-sum deterministic perfect-information game: states, players (MAX moves first by convention), actions, terminal utilities (from MAX's viewpoint). Minimax value: terminal → utility; MAX node → $\max$ of children; MIN node → $\min$ of children. The **optimal decision** at the root is the move toward the child with minimax value equal to the root's — backed-up guarantees, not hopes.

### 2.2 Price tag

$O(b^m)$ time, $O(bm)$ space depth-first — same exponent as blind search, with $m$ now game length. Full-width backup to terminal ply is infeasible for chess ($b \approx 35$); depth limits plus evaluation functions (cutoff play) approximate it, and alpha-beta (M2.9) prunes it exactly.

::: callout-formula KTU Formula Vault: Minimax
Terminal $=$ utility · MAX $= \max$ children · MIN $= \min$ children · optimal move $=$ arg toward root value · $O(b^m)$ time, $O(bm)$ space.
:::

Utilities are zero-sum-mirrored: $+1$ for MAX is $-1$ for MIN — any worked tree mixing viewpoints (some leaves "good for the mover") corrupts every backup above it.

::: callout-pitfall Averaging Over Adversaries
Expectimax (chance nodes) averages; minimax **minimizes**. An option backing up a MIN node with the mean of its children models a random opponent, not an adversarial one — MIN picks the floor, never the average room.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Root MAX with children $A$ (MIN) and $B$ (MIN). $A$'s leaves: $3, 12, 8$. $B$'s leaves: $2, 4, 6$. Compute every backup and name MAX's optimal move.
:::

::: step [Step 2: Execution] Backing Up Floors Then Roof
MIN $A = \min(3, 12, 8) = 3$ (the $12$ tempts only the unwary — MIN chooses). MIN $B = \min(2, 4, 6) = 2$. Root MAX $= \max(3, 2) = 3$. Guarantees: moving to $A$ secures $3$ no matter MIN's reply; moving to $B$ secures only $2$.
:::

::: step [Step 3: Conclusion] Final Result
Minimax value $3$, optimal move toward $A$. Note the winner ($3$) was $A$'s *smallest* leaf — optimal play banks the guaranteed floor, and the flashy $12$ was never actually available against perfect defence.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Backup Drill
MIN node with leaves $7, 1, 9$; sibling MIN is $5$; parent MAX?
(A) $9$, MAX takes the max leaf directly
(*B) MIN backs up $1$, so parent sees $\max(1, 5) = 5$ — floors first, roof second, never roof-over-leaves
(C) $7$, first leaf wins
(D) Mean $5.67$ rounded to $6$
::: explanation
Backup order is structural: MIN collapses its leaves to $1$ before MAX ever looks. MAX then compares floors ($1$ vs $5$), not leaves — skipping the MIN layer is the standard wrong-answer pattern.
:::

::: quiz Q2: Viewpoint Discipline
Leaves scored "from the mover's perspective". Status?
(A) Fine, symmetric games allow it
(*B) Corrupt — minimax backup assumes one fixed viewpoint (MAX's utility), and mover-relative scores flip sign per level, so every MIN/MAX operation above misfires
(C) Only affects ties
(D) Fixes zero-sum issues automatically
::: explanation
$\max$ and $\min$ are viewpoint-locked operations. Negamax re-derives them for mover-relative scores (negating per level); plain minimax fed mixed viewpoints computes beautifully precise nonsense.
:::

::: quiz Q3: Complexity Honesty
Minimax on chess to terminal depth. Feasibility?
(A) Routine with depth-first order
(*B) Hopeless — $b^m$ with $b \approx 35$, $m \approx 80$ dwarfs atom counts, so real play needs depth caps, evaluation functions, and pruning (M2.9), not raw backup
(C) $O(bm)$ space saves it
(D) Faster with bigger branching
::: explanation
Linear space cannot rescue exponential time: $35^{80}$ is not a number, it is a refusal. Cutoff + evaluation trades guarantees for moves — the applied-games bargain examiners contrast with textbook minimax.
:::
