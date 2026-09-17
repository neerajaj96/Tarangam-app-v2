# Module 3 Practice Lab: Greedy, DP & Backtracking Drills

**Knapsack showdowns, chain-split races, activity traces, pruning autopsies, and exam essay models.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

### Scenario 1: The Knapsack Showdown (Same Items, Three Verdicts)

Items $(v,w)$: $(60,10), (100,20), (120,30)$, capacity $50$. **Ratio-greedy**: densities $6, 5, 4$ → take $(60,10)$, then $(100,20)$ fits ($30$ used), then $(120,30)$ doesn't ($60 > 50$): total **160**. **DP take-or-skip**: $dp$ fills to **220** via $\{(100,20),(120,30)\}$ (weight exactly 50). **Fractional** (for reference): $60 + 100 + \frac{20}{30}\cdot120 = 240$. Three methods, three answers (160 / 220 / 240) on identical input — divisibility decides which is *legal*, optimality decides which is *right*.

### Scenario 2: Chain-Split Race (4 Matrices, All Splits Shown)

Dims $[5,10,3,12,5]$ ($A_1$–$A_4$). Length-2 costs: $m_{12} = 5\cdot10\cdot3 = 150$; $m_{23} = 10\cdot3\cdot12 = 360$; $m_{34} = 3\cdot12\cdot5 = 180$. Length-3: $m_{13} = \min(960, 330) = 330$ (split $k=2$: $m_{12} + p_0p_2p_3 = 150 + 180$); $m_{24} = \min(330, 960) = 330$ (split $k=2$: $m_{34} + p_1p_2p_4 = 180 + 150$). Full: $m_{14} = \min(580, 405, 630) = \mathbf{405}$ at split $k=2$: $((A_1A_2)(A_3A_4))$. (All values machine-verified.)

### Scenario 3: Activity Race and Its Certificate

$A(1,3), B(2,5), C(4,6), D(6,8)$. Earliest-finish greedy: $A$ (finish 3) → $C$ (4 ≥ 3) → $D$ (6 ≥ 6) = $\{A,C,D\}$, size 3. Brute-force check over all $2^4$ subsets: maximum compatible size is 3 (only $\{A,C,D\}$ and $\{B,D\}$-plus... precisely, $\{B,D\}$ has size 2; no size-4 subset is compatible) — greedy optimal, certificate included. The exchange argument promised this *before* the brute force confirmed it.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| Greedy vs. DP requirements | Greedy needs choice + substructure; DP needs overlap + substructure |
| Fractional vs. 0/1 knapsack | Ratio-greedy optimal vs. ratio-greedy fails (160 vs. 220 above) |
| Kruskal vs. Prim cuts | Component cuts (sorted global list) vs. territory cut (growing tree) |
| Cut vs. cycle property | Lightest-crossing ∈ some MST vs. heaviest-on-cycle ∈ no MST |
| Dijkstra key vs. Prim key | Path-from-source vs. edge-to-tree (same skeleton, different objective) |
| Negative weights | Dijkstra silently wrong → Bellman-Ford territory |
| Memoize vs. tabulate | Top-down cache vs. bottom-up order (same complexity, opposite direction) |
| Backtracking vs. B&B pruning | Feasibility bounds vs. + cost bounds against incumbent |
| m-table fill order | Increasing chain length (dependencies first) — never arbitrary |
| N-Queens check scope | New queen vs. earlier rows only (forward squares are empty) |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz On the Scenario-1 knapsack, ratio-greedy scores 160, DP scores 220, fractional scores 240. A student concludes "DP is always between greedy and fractional." Assess.
() Correct — this ordering is a theorem for all instances
(*) Wrong as a general claim (orderings vary; fractional ≥ 0/1-opt ≥ greedy need not hold in that arrangement — here 240 ≥ 220 ≥ 160 happens to hold since fractional relaxes 0/1 and greedy underperforms, but greedy can equal optimal while fractional exceeds it differently elsewhere)
() Fractional always scores below greedy
() DP always equals greedy on integer weights
::: explanation
Here fractional (240) ≥ DP-opt (220) ≥ greedy (160) — but that's *this* instance's luck, not law. What *is* law: fractional-relaxation ≥ 0/1-optimum always (relaxation can't hurt), while greedy sits *anywhere* ≤ optimum (sometimes equal, sometimes catastrophic). One inequality is theorem; the other is weather.
:::

::: quiz In Scenario 2, why is filling by increasing chain length mandatory rather than convenient?
() Longer chains need more memory allocated first
(*) m[i][j] reads strictly shorter intervals m[i][k], m[k+1][j] — increasing length is the topological order guaranteeing dependencies are final; any other order reads uninitialized (zero) neighbors and silently corrupts
() Arbitrary order works identically for matrix chains
() Length order only matters for parallel implementations
::: explanation
Tabulation *is* recursion with the call stack replaced by ordering discipline: dependents after dependencies, always. Out-of-order fills don't crash — they compute confidently with garbage inputs, the quietest failure mode in DP. Length-increasing is the topological sort; respect it or recurse instead.
:::

::: quiz Greedy activity selection and Dijkstra both "take the best available repeatedly," yet one needs an exchange proof about finish times and the other about distances. What is genuinely shared vs. genuinely different?
() Nothing is shared; the resemblance is coincidental vocabulary
(*) Shared: the greedy-choice-plus-substructure proof skeleton (commit safely, recurse on remainder). Different: the safety currency — finish-time dominance (swap preserves feasibility) vs. distance minimality (non-negative weights freeze settled vertices)
() Dijkstra is not greedy at all
() Activity selection needs no proof since it is obvious
::: explanation
Same skeleton, different exchange goods: activities trade *finish times* (earlier never hurts feasibility), Dijkstra trades *distances* (non-negativity freezes settled minima). Learn the skeleton once, then price each problem's currency — that transfer is the module's meta-skill.
:::

::: quiz A backtracking N-Queens solver checks each new queen against ALL rows including empty future ones, "to be thorough." What does this cost and what does it buy?
() It buys extra safety against future attacks at zero cost
(*) It costs comparisons against empty squares (pure overhead) and buys nothing — future rows hold no queens, so no attack can involve them; backward-only checking is already complete by symmetry
() It is required for correctness on boards larger than 4×4
() Forward checking finds solutions backward checking misses
::: explanation
Attack pairs need *two* queens; empty rows contribute none. Forward checks test phantoms — correct (they pass vacuously) but wasteful, and on big boards the waste compounds per node. Thoroughness that tests nothing is overhead wearing diligence's clothes.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (greedy-vs-DP conditions and key-vs-key lead); single-algorithm complexity statements.
* **7 Marks:** Full traces (Kruskal/Prim/Dijkstra/MST-style), matrix-chain tables with splits, knapsack method trios, or N-Queens walks.
:::

### Essay Question 1 (7 Marks)
**Q: On items (60,10),(100,20),(120,30) capacity 50, run (a) ratio-greedy, (b) DP, (c) fractional-greedy. Explain why the three answers differ.**

**Model Answer:** (a) Densities $6 > 5 > 4$: take (60,10), then (100,20) fits ($30$ used), (120,30) doesn't → **160**. (b) DP take-or-skip fills to **220** via {(100,20),(120,30)} (weight exactly 50). (c) Fractional: $60+100+\frac{20}{30}(120) = $ **240**. Differ because divisibility changes the feasible set: fractions decouple choices (greedy exchange holds per unit), whole items couple them through shared capacity (only remembering untangles), and the fractional optimum relaxes 0/1 (upper bound, usually unachievable whole).

### Essay Question 2 (7 Marks)
**Q: Compute the optimal parenthesization cost for dims [5,10,3,12,5] with the full m-table, and reconstruct the bracketing from the s-table.**

**Model Answer:** Length-2: 150, 360, 180 (as shown). Length-3: $m_{13} = \min(960,\ 330) = 330$ (split $k=2$); $m_{24} = \min(330,\ 960) = 330$ (split $k=2$). Length-4: $k=1$: $0+330+5\cdot10\cdot5 = 580$; $k=2$: $150+180+5\cdot3\cdot5 = 405$; $k=3$: $330+0+5\cdot12\cdot5 = 630$. Min **405** at $k=2$: $((A_1A_2)(A_3A_4))$ — verified against brute force.
