---
id: m3_01_greedy_strategy_control_abstraction
courseCode: PCCST502
module: 3
sequence: 1
title: Greedy Strategy & Control Abstraction
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Run the generic greedy loop of select, commit and never revisit
  - License greed with greedy-choice and optimal-substructure proofs
  - Prove activity selection and spot where greed fails
concepts:
  - greedy-choice property
  - optimal substructure
  - activity selection
prerequisites: []
examRelevance: high
tags:
  - greedy
  - design-paradigms
---
# Greedy Strategy & Control Abstraction

**Greedy-choice property, optimal substructure, the generic greedy loop, activity selection as the canonical proof, and when greed fails.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Many optimization problems ask "pick the best *set* of things" (activities, edges, coins). The laziest strategy: at each step grab whatever looks best *right now* and never reconsider. Sometimes that laziness is provably optimal (activity selection); sometimes it fails badly (0/1 knapsack). This note defines the greedy skeleton precisely, then isolates the two properties that license it.

::: callout-intuition Core Mental Model: The Coin-Change Cashier
A cashier making 67¢ grabs the biggest fitting coin (quarter), then repeats — never reconsidering. Fast, sensible — and *sometimes wrong*: with denominations {30, 25, 1} and 50¢ due, greedy takes 30+20×1 (21 coins!) while 25+25 (2 coins) is optimal. **Greedy algorithms** commit locally with zero regrets; the whole theory is one question: *when is never-looking-back provably safe?* Drop the till now: exchange arguments and substructure below are the exact answer.
:::

**Tiny toy example.** Activities A(1–2), B(2–3), C(1–3) ("start–finish" hours): earliest-finish greedy picks A (ends 2), then B (starts 2 ≥ 2) → {A, B}, size 2 — optimal, since C blocks both others. The proof idea: A ends first, so swapping A into any solution never hurts.

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols and abbreviations:** $S$ = solution built so far; "feasible" = satisfying the problem's constraints; exchange argument = proof technique swapping the greedy pick into an optimal solution.

**Control abstraction — numbered steps (the generic greedy loop):**

```text
GreedyFramework(Problem P):
    Solution S ← ∅
    while S is not complete and candidates remain:
        x ← SELECT locally-optimal feasible candidate
        if S ∪ {x} stays feasible: S ← S ∪ {x}   // commit forever
        discard x either way                      // never reconsidered
    return S
```

Every greedy algorithm here is this skeleton in costume (Kruskal: cheapest edge avoiding cycles; Dijkstra: closest unsettled vertex; Huffman: two lightest trees).

**The two licensing properties:**

* **Greedy-choice property:** *some* optimal solution extends the greedy first choice — proved by **exchange argument**: take any optimal solution lacking the pick, swap the pick in, show nothing gets worse.
* **Optimal substructure:** after committing, the *remainder* is the same problem on a smaller instance, solved the same way (shared with dynamic programming).

Greedy needs **both**; DP (dynamic programming) needs only the second. Substructure without a safe greedy choice (0/1 knapsack, longest path) punishes greed: on items $(60,10),(100,20),(120,30)$, capacity $50$, ratio-greedy banks $60+100 = 160$ while $100+120 = 220$ fits — 60 value abandoned.

**Canonical proof: activity selection.** Maximize compatible (non-overlapping) activities; greedy rule: **earliest finish first**. Exchange: greedy pick $a_1$ (finish $f_1$); any optimum's first activity $a_k$ has $f_k \ge f_1$, so $a_k \to a_1$ keeps feasibility and count — an optimum *containing* $a_1$ exists; recurse after $f_1$. Cost $\Theta(n \log n)$ (sort by finish), provably optimal.

::: callout-formula KTU Formula Vault: Greed Checklist
Loop: **select-best → commit-if-feasible → never-revisit** · license: **greedy-choice** (exchange argument) + **optimal substructure** · canonical wins: **activity selection** (earliest finish), **fractional knapsack** (best ratio), **MST/Huffman/Dijkstra** · canonical failure: **0/1 knapsack** (greed by ratio fails), **coin systems without canonical denominations**.
:::

::: callout-pitfall Fractional ≠ 0/1 Knapsack (the Standard Trap)
Greedy-by-ratio is *optimal* for **fractional** knapsack (fractions keep the swap possible) and can *fail* for **0/1** knapsack (indivisibility breaks the swap: $(60,10),(100,20),(120,30)$, capacity $50$: greedy $160$ vs optimum $220$). Same ratio rule, opposite verdicts — the exam always pairs them.
:::

---

<a id="worked-example"></a>
## 3. Worked example — eight activities, earliest-finish greedy

::: step [Step 1: Setup] Formulating the Problem
Activities (start, finish): A(1,4), B(3,5), C(0,6), D(5,7), E(3,9), F(5,9), G(6,10), H(8,11). Select the maximum compatible subset; show the exchange logic at step 1.
:::

::: step [Step 2: Execution] Running Greedy
Sort by finish: A(4), B(5), C(6), D(7), E(9), F(9), G(10), H(11). Pick A(1,4). Discard overlapping: B(3<4), C(0<4), E(3<4). Next compatible: D(5,7) (5≥4 ✓); F starts 5 < 7 → discard. Next: H(8,11) (8≥7 ✓); G starts 6 < 7 → discard. Selected {A, D, H} — 3 activities.
:::

::: step [Step 3: Conclusion] Final Result
{A, D, H}: no overlaps, no room for a fourth (every leftover collides with one of them). Exchange at step 1: any optimum's first activity finishes ≥ 4 = A's finish, so A swaps in freely — the first commitment was safe, and inductively so is each following one.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- "Greedy worked on this instance" proves nothing — optimality is a universal claim over instances, proved by exchange.
- Ties ({A,D,H} vs {B,D,H}) are expected: the theorem promises *an* optimum, never uniqueness.
- Fractional success never transfers to 0/1: divisibility is the boundary, not the ratio rule.

| Similar pair | Distinction that earns marks |
|---|---|
| Greedy-choice vs optimal substructure | This step is safe (exchange) vs the rest is the same problem (recurse) |
| Fractional vs 0/1 knapsack | Slicing keeps swaps legal vs whole items couple decisions |
| Greedy vs DP requirements | Choice + substructure vs overlap + substructure |

**Exam recap (facts an examiner rewards):** the three-line loop; both license properties with the exchange sketch; activity selection rule + $\Theta(n \log n)$; the 160-vs-220 knapsack counterexample with capacity 50.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

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
