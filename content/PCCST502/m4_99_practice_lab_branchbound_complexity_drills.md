---
id: m4_99_practice_lab_branchbound_complexity_drills
courseCode: PCCST502
module: 4
sequence: 99
title: 'Module 4 Practice Lab: Branch & Bound and Complexity Drills'
difficulty: intermediate
estimatedMinutes: 11
learningObjectives:
  - Race bounds on one TSP matrix with three timings
  - Autopsy reductions with one verdict each exactly
  - Trace first-fit-decreasing packs at capacity ten
concepts:
  - bound race
  - reduction autopsy
  - packing traces
prerequisites:
  - m4_01_branch_and_bound_control_abstraction
  - m4_02_tsp_branch_and_bound
  - m4_03_np_completeness_p_np_reductions
  - m4_04_bin_packing_approximation_algorithms
  - m4_05_randomized_algorithms_las_vegas_monte_carlo
examRelevance: high
tags:
  - branchbound-complexity
  - m4-lab
---
# Module 4 Practice Lab: Branch & Bound and Complexity Drills

**Bound races, reduction-direction autopsies, FFD packing traces, amplification arithmetic, and exam essay models.**

<a id="the-intuition"></a>
## 1. Start from zero — how to use this lab

**Problem first.** Module 4's exam marks go to bound races on one matrix (incumbent quality = search cost), reduction autopsies with exact verdicts (arrow direction decides), FFD traces with matching floors, and amplification arithmetic (exponential confidence, linear cost). Abbreviations: B&B = branch & bound; NPC = NP-complete; FFD = First-Fit Decreasing; $k$ = Miller–Rabin rounds.

::: callout-intuition Core Mental Model
Every scenario is a marking scheme: state the setup with numbers, show each decision (branch, prune, pack, amplify) with its certificate (bound ≥ incumbent, arrow direction, floor match, $\epsilon^k$), then conclude with what is proven versus what stays open. The four scenarios below model exactly that discipline.
:::

**Tiny warm-up.** Bound 40 vs incumbent 39: prune (nothing beats 39). Reduction "X → 3-SAT proves X NPC": wrong arrow, half-proof. FFD into a matching floor: optimal, certified. Miller–Rabin $k=2$: error $\le 4^{-2} = 1/16$.

### Scenario 1: The Bound Race (TSP, Same Matrix, Three Timings)

Instance from M4 (optimum 35, root bound 35, forbid-1→2 bound 39). Three counterfactuals: (a) incumbent starts at 39 (nearest-neighbor): root 35 < 39 → branch; include-side resolves tour 35 (new incumbent); forbid-side bound 39 ≥ 35 → prune; done — 1 branch, 1 prune. (b) Incumbent starts at 35 (lucky heuristic): root bound 35 == incumbent 35 → **optimal proven with zero branching** (nothing can beat what's already certified). (c) Incumbent starts at 60 (terrible): both branches live longer (forbid-side 39 < 60 survives!), search sprawls until tour 35 surfaces. Moral: incumbent quality *is* search cost — good heuristics aren't polish, they're pruning fuel.

### Scenario 2: Reduction Autopsy (Three Verdicts, One Autopsy Each)

(a) "Reduced X to 3-SAT, therefore X is NP-complete." Autopsy: backwards — shows $X \in$ NP at best (easiness direction). Verdict: half-proof, zero hardness. (b) "Reduced Hamiltonian-Cycle to X, and X has a poly verifier." Autopsy: correct shape both halves (hardness in, membership shown) — complete proof modulo details. (c) "X is NP-complete because one instance took my laptop a week." Autopsy: single-instance hardness proves nothing about *asymptotic worst case* (maybe a bad algorithm, maybe a pathological input) — complexity quantifies over infinite families, never anecdotes.

### Scenario 3: FFD Packing Trace (Capacity 10)

Items $[7, 6, 5, 4, 4, 3, 2, 2]$ (already descending — sorting free this once). $7\to$B1; $6\to$B2; $5\to$B3 (fits neither B1 $12 > 10$ nor B2 $11 > 10$); $4\to$B2 ($6+4=10$ ✓); $4\to$B3 ($5+4=9$ ✓); $3\to$B1 ($7+3=10$ ✓); $2\to$B4 (B1/B2/B3 all overflow); $2\to$B4 ($4$ ✓). **4 bins** vs. lower bound $\lceil 33/10 \rceil = 4$ — optimal, certified.

### Scenario 4: Amplification Checkout

Miller–Rabin with $k$ rounds: error $\le 4^{-k}$ per composite (stated textbook bound for the algorithm's compositeness error). $k = 1$: 25% doubt (toy only). $k = 5$: $\le 1/1024$ (better than many quoted hardware glitch rates — an illustration, not a measurement). $k = 10$: $\le 1/1{,}048{,}576 \approx 10^{-6}$ (production-grade). $k = 40$ (crypto libraries): $\le 2^{-80}$ — for exam purposes treated as negligible, while remaining strictly non-zero. Each round *multiplies* confidence; cost grows only linearly in $k$.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| Live vs. E-node vs. dead | Waiting vs. expanding vs. finished/killed (lifecycle, not priority) |
| FIFO vs. LIFO vs. LC search | Oldest vs. newest vs. smallest-bound next (LC pairs with bounding) |
| Optimistic vs. pessimistic bounds | Underestimate (minimization) prunes safely; overestimate kills optima silently |
| Include vs. exclude branch | Fix edge (delete row/col, ban return) vs. ban edge (∞) and re-reduce |
| P vs. NP vs. NPC | Poly-solvable vs. poly-verifiable vs. verifiable + all-NP-reduces-here |
| Hardness direction | Known-hard → target (prove hard); target → known (prove easy/at most) |
| NF vs. FF vs. FFD ratios | ≤2·OPT−1 vs. ≤1.7·OPT+2 vs. ≤11/9·OPT+1 (sorting buys the last tier) |
| Las Vegas vs. Monte Carlo | Random time, exact answer vs. fixed time, probable answer |
| Amplify by repetition | Error $\epsilon^k$: exponential confidence, linear cost |
| Backtracking vs. B&B | Feasibility pruning vs. + cost-vs-incumbent pruning |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz The forbid-1→2 branch bounds at 39 with incumbent 39 and gets pruned. A student protests: "but it could still contain a 39-cost tour — you're throwing away an optimum!" Resolve.
() The student is right — pruning here loses optima and the trace cheats
(*) Pruning keeps *an* optimum (incumbent 39 already in hand), discarding only redundant equals — B&B promises optimal *cost*, never enumeration of all optimal tours
() Equality pruning is valid only for maximization problems
() The branch must be expanded to confirm the bound is tight
::: explanation
Correctness = return *a* tour of optimal cost, not *all* of them. Bound ≥ incumbent certifies "nothing strictly better inside" — ties add no information. Equality-prunes are where B&B banks its biggest savings, legitimately.
:::

::: quiz "I reduced my new problem X to Vertex Cover, therefore X is NP-complete." Give the precise verdict and the one-line repair.
() Verdict: correct and complete as stated
(*) Verdict: proves X ∈ NP at most (easiness direction); repair: reduce *from* a known NPC problem *to* X (plus exhibit X's verifier) — hardness flows with the arrow, and this arrow points the wrong way
() Verdict: proves X ∈ P; repair: use a slower reduction
() Reductions are unnecessary for NP-completeness claims
::: explanation
$X \le_p$ VertexCover means "X is no harder than VC" — consistent with X ∈ P! Hardness must flow *into* X from known-hard ground (NPC $\le_p$ X), plus X's own verifier for membership. Arrow direction is the entire proof; everything else is bookkeeping.
:::

::: quiz FFD packs an instance into 5 bins with lower bound 4. Your teammate declares victory ("near-optimal, guaranteed within 11/9"). Your manager demands proven optimal. Who is right for which purpose, and what closes the gap?
() Teammate fully right; ratios certify optimality always
(*) Teammate right for engineering (5 vs ≥4: at most 1 bin over, ratio-consistent); manager needs the gap closed — either find a 4-packing (constructive proof) or raise the bound (stronger certificate), since 11/9·4+1 ≈ 5.9 permits 5 without proving 4 impossible
() Manager right that 5 bins violates the lower bound
() Both wrong: bin packing has no lower bounds
::: explanation
$4 \le OPT \le 5$: the sandwich certifies near-optimality (ship it, usually) but not optimality (4 might exist). Ratios bound *waste*; only matching bounds *prove* optima. Engineering stops at the sandwich; perfection demands closing it — different jobs, different stopping rules.
:::

::: quiz Miller–Rabin with k=10 rounds reports "prime" with error ≤ 10⁻⁶, yet the team wants cryptographic certainty. What does "cryptographic certainty" mean here, and what buys it?
() It means zero error, achievable by running deterministically instead
(*) It means error small enough to treat as negligible for exam and engineering purposes (k=40: ≤2⁻⁸⁰, strictly non-zero) — bought with linear extra rounds, since error decays exponentially in k
() It means switching to trial division for all inputs
() More rounds cannot reduce error below 10⁻⁶ by mathematical law
::: explanation
"Certainty" in this context means error dwarfed into negligibility — exponential decay makes k=40 cost 4× k=10 while dividing doubt by $4^{30}$. Certainty is *purchased*, linearly priced — but strictly speaking the error never hits zero, so "negligible" (not "impossible") is the correct claim.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (reduction direction and B&B vocabulary lead); single-ratio statements.
* **7 Marks:** TSP bound traces, reduction proofs (3-SAT→Clique pattern), FFD traces with bounds, or LV-vs-MC comparisons with amplification math.
:::

### Essay Question 1 (7 Marks)
**Q: On the M4 cost matrix (optimum 35, root bound 35, NN incumbent 39): trace the include/exclude branching on edge 1→2 to certified optimality, explaining each prune.**

**Model Answer:** Root 35 < 39 → branch on 1→2. Exclude: ban it, re-reduce → bound 39 ≥ incumbent 39 → prune (ties can't improve). Include: delete row 1/column 2, ban return 2→1, continue → resolves tour $1\to2\to4\to3\to1 = 10+10+9+6 = 35$ < 39 → new incumbent 35 = root bound → optimal proven, search ends. One live branch, one prune, one certificate: bounds did all exponential work.

### Essay Question 2 (7 Marks)
**Q: Define P, NP, NP-complete. Prove Clique NP-complete via 3-SAT reduction, stating both proof directions explicitly.**

**Model Answer:** P: poly-time solvable. NP: poly-time verifiable (certificate checkable fast). NPC: in NP + every NP problem poly-reduces to it. Reduction (M4 construction): triangle per clause, cross-edges except contradictions. (⇒) $k$-clique → one literal per clause, pairwise consistent → set true → formula satisfied. (⇐) Satisfying assignment → one true literal per clause → $k$ pairwise-consistent vertices → clique. Polynomial construction ($3k$ vertices) + Clique ∈ NP (verify claimed clique in $O(k^2)$) completes both obligations — hardness in, membership shown.
