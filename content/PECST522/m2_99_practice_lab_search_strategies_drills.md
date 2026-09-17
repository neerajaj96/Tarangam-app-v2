# Module 2 Practice Lab: Search Strategy Drills

**Strategy selection under constraints, cost-trap autopsies, IDS arithmetic, heuristic admissibility trials, and exam essay models.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

### Scenario 1: The 11% Miracle (IDS vs. BFS, Counted)

Branching $b = 10$, goal depth $d = 5$. BFS generates $1 + 10 + 100 + 1000 + 10{,}000 + 100{,}000 = \mathbf{111{,}111}$ nodes. IDS regenerates shallow tiers per iteration: $5\cdot10 + 4\cdot100 + 3\cdot1000 + 2\cdot10{,}000 + 1\cdot100{,}000 = 50 + 400 + 3000 + 20{,}000 + 100{,}000 = \mathbf{123{,}450}$ — just **11% more** for linear memory ($O(bd)$ vs. $O(b^d)$) *plus* depth-first's optimality-on-uniform-cost. The "wasteful regeneration" intuition dies on contact with geometric series: upper tiers are exponentially tiny, so re-walking them costs exponentially nothing.

### Scenario 2: The $100 Shortcut Trap (BFS vs. UCS)

Roads: start→goal direct toll $100 (1 step); start→A→goal costs $1 + $1 (2 steps). BFS (step-counting) picks the toll road (shallower); UCS (cost-counting) picks the $2 backroad. Same graph, opposite answers — BFS optimizes *depth*, UCS optimizes *dollars*. Whenever statement says "fewest edges" answer BFS; "cheapest" answer UCS; "both" is a trick (they coincide only at uniform cost).

### Scenario 3: Heuristic Court (Admissible or Out)

True cheapest costs: $h^*(A) = 8$, $h^*(B) = 4$, goal $0$. Candidate $h_1$: $A \to 7$, $B \to 5$. Candidate $h_2$: $A \to 6$, $B \to 3$. Trial: $h_1(B) = 5 > 4$ — **inadmissible** (overestimates once, disqualified everywhere; A* with $h_1$ can return suboptimal paths). $h_2$: $6 \le 8$, $3 \le 4$ — **admissible**. Dominance? Requires *both* admissible — $h_1$ is out of the running entirely, so no dominance claim exists; among admissible heuristics, higher-never-over is better ($h_2$ beats any lower admissible rival node by node).

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| BFS vs. UCS optimum | Fewest steps vs. cheapest cost (differ exactly when costs vary) |
| DFS vs. IDS memory | $O(bm)$ deep stack (loops risk) vs. $O(bd)$ with completeness restored |
| DLS vs. IDS purpose | Depth-capped single shot (incomplete past $l$) vs. deepening loop to completeness |
| IDS overhead | ~11% extra nodes at $b=10$ (geometric tiers make regeneration cheap) |
| Admissible vs. consistent | $h \le h^*$ everywhere vs. triangle inequality $h(n) \le c + h(n')$ (consistent ⇒ admissible, not vice versa) |
| Dominance requirements | Both admissible first, then pointwise ≥ everywhere (inadmissible rivals disqualified) |
| $g$ vs. $h$ vs. $f$ | Cost-so-far vs. estimated-to-go vs. $g+h$ expansion priority |
| Tree vs. graph search | Repeat-state explosion vs. explored-set pruning (exponential savings where states rejoin) |
| Complete vs. optimal | Finds *a* solution vs. finds the *cheapest* (independent axes — DFS: neither; BFS: complete + optimal-iff-uniform; UCS/A*: both given conditions) |
| Step cost vs. path cost | Single-edge price vs. accumulated total (UCS accumulates, BFS counts) |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz IDS regenerates the top tiers on every iteration, yet costs only ~11% more nodes than BFS at b=10, d=5. A student calls this "obviously wasteful anyway." Refute with the series.
() Agree — regeneration is pure waste regardless of series
(*) Upper tiers are exponentially tiny (50 + 400 + … against 100,000 at the bottom): re-walking crumbs costs crumbs — 123,450 vs. 111,111 buys linear memory plus uniform-cost optimality for 11%
() IDS is wasteful and BFS should always be preferred
() The 11% figure is fabricated; real overhead exceeds 500%
::: explanation
Geometric domination: level $i$ dwarfs all levels above *combined* ($b^d$ vs. $\sum_{i<d}b^i \approx b^d/(b-1)$). Regeneration re-pays only the crumbs while the bottom tier (paid once, mostly) dominates both totals. "Wasteful" intuition prices all levels equally — the series refuses.
:::

::: quiz h₁ overestimates at one node but is elsewhere admissible and dominant; h₂ is admissible everywhere but lower. An A* implementation must pick one heuristic. Which, and why is there no contest?
() h₁ — dominance outweighs one small overestimate
(*) h₂ — admissibility is a license (optimality guarantee), dominance a ranking *among the licensed*; one overestimate voids the license, disqualifying h₁ before comparison begins
() Neither — mix them by averaging to cancel the error
() h₁, because higher heuristics always preserve optimality
::: explanation
Optimality proofs assume $h \le h^*$ *everywhere* — a single violation breaks the guarantee chain (A* can then return suboptimal paths, silently). Dominance compares *admissible* rivals only. License first, ranking second; no license, no ranking.
:::

::: quiz DFS dives down the leftmost path on a graph with a 1-step goal on the far right (branching 10, depth 3). BFS finds it expanding ~111 nodes; DFS explores the entire left subtree first. What does this show about completeness and optimality together?
() DFS is complete and optimal here; BFS is neither
(*) Neither DFS property holds in general (infinite paths kill completeness; first-found ≠ cheapest kills optimality) while BFS on uniform cost has both — strategy choice, not effort, decides guarantees
() Both strategies share identical guarantees on all graphs
() BFS is incomplete on finite graphs
::: explanation
Completeness (find *a* solution) and optimality (find the *cheapest*) are independent axes: DFS can miss forever down infinite paths and returns whatever it stumbles on; BFS's level order certifies both (uniform cost). Pick strategies by required guarantees — depth-first for memory, best-first for optimality.
:::

::: quiz Tree search on a grid with many rejoining paths (transpositions) explodes exponentially while graph search stays polynomial-ish. What single mechanism explains the gap?
() Graph search uses a faster programming language
(*) The explored/closed set: tree search re-expands the same state via every distinct path (exponentially many routes to deep states); graph search expands each state once, pruning all rediscoveries — memoization across paths, same whiteboard moral as DP
() Tree search cannot handle grids by definition
() Grids forbid heuristics, crippling tree search uniquely
::: explanation
Transpositions (many paths, same state) turn trees exponential while state *sets* stay put — the explored set converts path-counting into state-counting. Same overlap exploitation as dynamic programming's memoization (Module DAA-3's whiteboard, AI-flavored): never solve the same state twice.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (BFS-vs-UCS and admissibility lead); IDS overhead figure with reasoning.
* **7 Marks:** Strategy traces with counts, admissibility trials on given heuristics, or complete/optimal verdict tables per strategy.
:::

### Essay Question 1 (7 Marks)
**Q: For b = 10, d = 5, compute BFS and IDS node counts, explain why IDS costs only ~11% more, and state what IDS buys with that 11%.**

**Model Answer:** BFS: $\sum_{i=0}^{5}10^i = 111{,}111$. IDS: $\sum$ over iterations $5\cdot10 + 4\cdot100 + 3\cdot1000 + 2\cdot10{,}000 + 1\cdot100{,}000 = 123{,}450$ — ratio $\approx 1.11$. Upper tiers are exponentially small, so regeneration re-pays crumbs. The 11% buys: linear memory $O(bd)$ instead of $O(b^d)$, plus (with uniform step costs) the completeness and optimality BFS enjoys — depth-first's footprint with breadth-first's guarantees.

### Essay Question 2 (7 Marks)
**Q: Given h* = {A:8, B:4} and candidates h₁ = {A:7, B:5}, h₂ = {A:6, B:3}: judge admissibility of each, judge dominance, and state the consequences for A*.**

**Model Answer:** Admissibility ($h \le h^*$ everywhere): $h_1$ fails at $B$ ($5 > 4$) → inadmissible (A* may return suboptimal paths using it); $h_2$ passes both ($6 \le 8$, $3 \le 4$) → admissible. Dominance needs two admissible rivals — with $h_1$ disqualified, no dominance relation exists (dominance compares the licensed, and $h_1$ holds no license). Consequence: run A* on $h_2$ (optimal, expands a superset... precisely, expands no more than any less-informed admissible rival); $h_1$ is usable only where optimality is waived.
