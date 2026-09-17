# Greedy Strategy & Control Abstraction

**Greedy-choice property, optimal substructure, the generic greedy loop, activity selection as the canonical proof, and when greed fails.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Coin-Change Cashier
A cashier making change for 67¢ grabs the biggest coin that fits (quarter), then repeats (quarter, dime, nickel, pennies) — never reconsidering, never backtracking. Fast, obviously sensible — and *sometimes wrong*: with coin denominations {30, 25, 1} and 50¢ due, greedy grabs 30+20×1 (21 coins!) while 25+25 (2 coins) is optimal. **Greedy algorithms** commit to the locally best choice at every step with zero regrets. The entire theory of this topic is one question: *when is never-looking-back provably safe?*
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Control Abstraction (the Generic Greedy Loop)

```text
GreedyFramework(Problem P):
    Solution S ← ∅
    while S is not complete and candidates remain:
        x ← SELECT locally-optimal feasible candidate
        if S ∪ {x} stays feasible: S ← S ∪ {x}   // commit forever
        discard x either way                      // never reconsidered
    return S
```

Every greedy algorithm in this module is this skeleton wearing different SELECT/feasible costumes (Kruskal: cheapest edge not forming a cycle; Dijkstra: closest unsettled vertex; Huffman: two lightest trees).

### 2.2 The Two Properties That License Greed

* **Greedy-choice property:** *some* optimal solution extends the greedy first choice — i.e. there exists an optimal solution containing it (proved by **exchange argument**: take any optimal solution lacking the greedy pick, swap the pick in, show nothing gets worse).
* **Optimal substructure:** after the greedy commitment, the *remainder* is the same problem on a smaller instance, solvable optimally the same way (shared with dynamic programming — §4).

Greedy needs **both**; DP needs only the second. Problems with substructure but *no* safe greedy choice (0/1 knapsack, longest path) punish greed and demand DP or backtracking instead. (Preview: on items $(60,10),(100,20),(120,30)$ with capacity $50$, ratio-greedy scores $60+100 = 160$ while $100+120 = 220$ fits — greed leaves 60 value on the table.)

### 2.3 Canonical Proof: Activity Selection

Given activities with start/finish times, maximize the count of compatible (non-overlapping) activities. Greedy rule: **always pick the compatible activity finishing earliest**. Exchange proof: let greedy pick $a_1$ (earliest finish $f_1$); any optimal solution's first activity $a_k$ has $f_k \ge f_1$, so swapping $a_k \to a_1$ keeps feasibility and count — an optimal solution *containing* $a_1$ exists; recurse on what remains after $f_1$. Result: $\Theta(n \log n)$ (sort by finish) and provably optimal.

::: callout-formula KTU Formula Vault: Greed Checklist
Loop: **select-best → commit-if-feasible → never-revisit** · license: **greedy-choice** (exchange argument) + **optimal substructure** · canonical wins: **activity selection** (earliest finish), **fractional knapsack** (best ratio), **MST/Huffman/Dijkstra** · canonical failure: **0/1 knapsack** (greed by ratio fails), **coin systems without canonical denominations**.
:::

::: callout-pitfall Fractional ≠ 0/1 Knapsack (the Standard Trap)
Greedy-by-ratio is *optimal* for **fractional** knapsack (take fractions of the best-ratio item — exchange argument holds) and can *fail* for **0/1** knapsack (indivisibility breaks the swap: classic $v/w$ counterexample $(60,10),(100,20),(120,30)$, capacity $50$: greedy banks $60+100 = 160$ but $100+120 = 220$ fits). Same ratio rule, opposite verdicts — the exam always pairs them.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Activities (start, finish): A(1,4), B(3,5), C(0,6), D(5,7), E(3,9), F(5,9), G(6,10), H(8,11). Select the maximum compatible subset with earliest-finish greedy, and show the exchange logic at the first step.
:::

::: step [Step 2: Execution] Running Greedy
Sort by finish: A(4), B(5), C(6), D(7), E(9), F(9), G(10), H(11). Pick A(1,4) (earliest finish). Discard overlapping: B(3<4), C(0<4), E(3<4). Next earliest compatible: D(5,7) (5≥4 ✓). Discard F(5<7? F starts 5 < 7 ✓ overlaps → discard). Next: H(8,11) (8≥7 ✓); G(6<7... G starts 6, D ends 7 → overlaps → discard). Selected: {A, D, H} — 3 activities.
:::

::: step [Step 3: Conclusion] Final Result
{A, D, H} with no overlaps and no room for a fourth (every leftover overlaps one of them — C spans 0–6 killing A+D, B/E/F/G each collide). Exchange argument at step 1: any optimal solution's first activity finishes ≥ 4 = A's finish, so A swaps in freely — greed's first commitment was safe, and inductively so is each following one.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz What do the greedy-choice property and optimal substructure each contribute to a correctness proof?
() They are rival theories; only one is ever used
(*) Greedy-choice (via exchange argument) proves committing to the local pick never destroys optimality; optimal substructure proves the remaining smaller instance can be solved the same way — induction needs both halves
() Substructure replaces the need for any greedy choice
() Greedy-choice alone proves everything including termination
::: explanation
The proof is induction with two legs: *this step is safe* (some optimal solution extends the greedy pick — exchange) and *the rest is the same problem* (substructure — recurse). Drop the first and greed may err (0/1 knapsack); drop the second and there's nothing to recurse on.
:::

::: quiz Greedy-by-value-density is optimal for fractional knapsack but fails 0/1 knapsack on (v,w) = (60,10),(100,20),(120,30), capacity 50. What exactly breaks?
() The exchange argument's arithmetic contains an error
(*) Indivisibility: greedy banks 60 + 100 = 160 and then nothing else fits, while skipping the ratio-leader for 100 + 120 = 220 fits — the swap that proves safety for fractions is physically impossible for whole items
() Fractional knapsack is NP-hard so greed must fail there too
() The counterexample uses negative weights
::: explanation
With fractions, greedy's pick can always be *partially* swapped into any optimal solution (take a slice of the best-ratio item). Whole items forbid slicing: after banking (60,10)+(100,20) = 160 with 20 capacity left, the 30-weight item won't fit — yet the optimum (220) skips nothing it can't use. Divisibility is the whole ballgame.
:::

::: quiz Running earliest-finish greedy on the worked example selected {A, D, H}. A student claims {B, D, H} is equally good so "greed got lucky." What is wrong with this reasoning?
() Nothing — greedy algorithms depend on luck by definition
(*) Optimality was never about this instance's tie: the exchange proof guarantees *some* optimal solution contains each greedy pick on *every* instance — luck plays no role; {B,D,H} being optimal here is consistent with, not evidence against, the guarantee
() {B, D, H} is actually infeasible
() Greedy never selects H in any correct implementation
::: explanation
The theorem promises the greedy *set* is optimal, not that it's the *unique* optimum — ties ({A,D,H} vs {B,D,H}) are expected, not suspicious. Correctness is a universal claim over instances (proved by exchange), never a story about one lucky run.
:::
