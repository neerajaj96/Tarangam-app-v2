---
id: m2_05_a_star_optimal_search
courseCode: PECST522
module: 2
sequence: 5
title: 'A* Search: Optimal and Optimally Efficient'
difficulty: beginner
estimatedMinutes: 7
learningObjectives:
  - Combine bill and guess with the f-equals-g-plus-h rule
  - Buy optimality with the admissibility contract on the failed greedy trace
  - Price the memory ceiling that bounds optimal rivals
concepts:
  - A-star search
  - optimal efficiency
prerequisites:
  - m2_03_informed_heuristic_search_and_functions
  - m2_04_greedy_best_first_search
examRelevance: high
tags:
  - search
  - a-star
---
# A* Search: Optimal and Optimally Efficient

**Problem: greedy trusted guesses alone and failed; UCS counted bills alone and crawled. By the end you can run A* (`f = g + h`) by hand, state its exact optimality contracts, and price its memory ceiling.**

<a id="start-zero"></a>
## 1. Start From Zero: Toll Paid Plus Toll Quoted

Every route has toll already paid (`g(n)`: cost from start to `n`) plus toll quoted ahead (`h(n)`: estimated remainder). Greedy drove on quotes; UCS crawled on odometers. A* adds both: hurry where quotes are low, never commit past a route whose total already exceeds a proven alternative.

**Definitions:** `g(n)` = paid-so-far cost. `h(n)` = heuristic guess of remainder. `f(n) = g(n) + h(n)` = estimated total through `n`. **Admissible** means `h <= h*` (never overestimates true remainder `h*`). **Consistent** means `h(n) <= c(n,a,n') + h(n')` on every edge (triangle inequality; `c` = step cost).

::: callout-intuition Core Mental Model: Toll Paid Plus Toll Quoted
Feel "bill plus guess" here, then drop the road; the contracts below decide optimality, not the metaphor.
:::

**Tiny beginner example:** X (g=5, h=2, f=7) vs. Y (g=2, h=6, f=8). A* pops X first — its small quote (h=2) outweighs its larger paid cost, giving the smaller total. Greedy would also pop X here (2 < 6 means X looks closer) — greedy follows h alone, so the two agree whenever the smallest quote sits on the smallest total, and diverge when a rosy quote on one branch hides a cheaper total on another.

::: toggle Frontier table: who pops what on X(g=5,h=2), Y(g=2,h=6), Z(g=4,h=4)?
Compute totals first: X f = 5+2 = 7; Y f = 2+6 = 8; Z f = 4+4 = 8. A* pops min-f → X (7 < 8; Y/Z tie at 8 needs a stated tie-break). Greedy pops min-h → X (2 < 4 < 6 — smallest quote wins, g invisible). UCS pops min-g → Y (2 < 4 < 5 — cheapest bill wins, h invisible). Same frontier, three winners: A* reads totals, Greedy reads quotes, UCS reads bills. Ordering rule per algorithm in one line each — confusing them is the exact error this note exists to prevent.
:::

::: toggle Expand `f(n) = g(n) + h(n)` symbol by symbol
`n` = the frontier node being priced (one candidate route-end). `g(n)` = paid-so-far cost start→n (odometer — known exactly). `h(n)` = guessed remainder n→goal (quote — estimate, contract: admissible/consistent). `+` = totals bill plus quote into one estimated route price (addition is the repair: neither half suffices alone). `f(n)` = estimated total through n (the pop priority — smallest first). Tiny numbers above: X 5+2 = 7 beats Y 2+6 = 8 (quote outweighs bill) and Z 4+4 = 8. Why add: bills alone crawl blind (UCS), quotes alone get fooled (Greedy) — totals balance both, and admissibility makes the smallest popped goal provably cheapest.
:::

<a id="basics"></a>
## 2. Basic Layer: The Algorithm

**Data/state:** frontier ordered by `f`, plus explored set for graph search. **Goal:** cheapest goal path with fewer expansions than blind methods.

**Procedure (steps):** Step 1: push start with `f = h(start)`. Step 2: pop smallest-`f` node; **test goal on popping** (not on generation — a generated goal may sit behind a cheaper unfinished route). Step 3: expand it, push successors with `f = g + h`. Step 4: repeat until popped node is a goal — its `g` is optimal under the contracts below.

::: callout-pitfall Goal-Test Timing
Testing on generation returns the first *seen* goal, not the cheapest. A generated `f = 9` goal behind an unfinished `f = 5` route must wait. Popping order is the optimality mechanism.
:::

<a id="formal-model"></a>
## 3. Formal Layer: Contracts, Efficiency, Cost

**Optimality conditions (qualified — never state bare "A* is optimal"):** with admissible `h`, tree-search A* is optimal. With consistent `h`, graph-search A* is optimal without re-expanding explored nodes. Mechanism: the first popped goal has the smallest `f` on the frontier, and admissibility keeps every unfinished route's `f` at or below its true total — so nothing unfinished can beat it. Admissible-but-inconsistent `h` with no re-opening can break graph optimality (a better late path to a closed node is ignored).

**Optimal efficiency (qualified):** no other optimal algorithm using the same `h` expands fewer nodes, up to tie-breaking. This compares optimal rivals with equal information — it does not claim A* beats non-optimal or better-informed methods. Price: worst-case `O(b^d)` time and space; the frontier of all visited nodes is the practical ceiling (IDA* later trades time for memory).

::: callout-formula KTU Formula Vault: A*
`f = g + h`. Admissible gives tree-optimality; consistent gives graph-optimality without re-opens (consistency implies admissibility). Optimally efficient for its `h` among optimal rivals. Memory `O(b^d)` is the ceiling.
:::

**Hand-trace where greedy failed (new numbers):** S (h=3) to A (g=1, h=2) and B (g=2, h=2); A-to-goal 4, B-to-goal 5. Consistency: 3 <= 1+2 and <= 2+2; 2 <= 4 and <= 5. Pop S, push A(f=3), B(f=4). Pop A, push goal-via-A (f=5). Frontier {B:4, G:5}: pop B, push goal-via-B (f=7). Pop G at 5 — optimal via A, with 5 <= every frontier `f`.

::: toggle When does A* lose its guarantees (and what survives)?
Inadmissible `h` (some overestimate): optimality gone — the popped goal may be pricier than an unfinished route whose tag was inflated. Admissible-but-inconsistent `h` with no re-opening: graph optimality can break (better late path to a closed node ignored — re-open or accept tree-search-only guarantees). Either way, completeness on finite graphs with positive costs survives (the frontier still drains to a goal). Memory never promised anything: `O(b^d)` ceiling holds regardless. Guarantees follow contracts one by one — drop a contract, name exactly what falls.
:::

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Tree vs. graph A* optimality | Admissible suffices for trees; consistent (or re-opening) needed for graphs |
| A* vs. IDA* node counts | A* expands fewest among optimal same-`h` rivals; IDA* re-expands across iterations (less memory, more nodes) |
| Popping vs. generating goals | Pop-tests guarantee cheapest; generation-tests return first-seen |

**Watch out:** (1) Inconsistent-but-admissible `h` without re-opening is the classic broken-optimality trap. (2) "Optimally efficient" never means "fast" — `O(b^d)` still explodes. (3) Heuristic quality decides expansion counts; the theorem fixes ordering, not the guess.

**Limitations:** exponential memory bounds real use; needs a good admissible/consistent heuristic (often unavailable); dynamic worlds invalidate static `f` values. Depth caps plus evaluation functions approximate where exact A* cannot reach.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Q1: Ordering Drill
Frontier: X (g=5, h=2), Y (g=2, h=6), Z (g=4, h=4). A* pops first?
(A) Y, biggest h wins
(*B) X with f = 7, against Y's 8 and Z's 8 — f = g+h decides, and X's small quote (h=2) outweighs its larger paid cost (g=5)
(C) Z, middle values first
(D) Ties always broken alphabetically
::: explanation
Totals are 7, 8, 8. A* reads f, not components — X leads thanks to the best-looking quote (h=2), which more than offsets its larger odometer (g=5).
:::

::: quiz Q2: Guarantee Matching
Admissible-but-inconsistent h, graph search without re-opening explored nodes. Status?
(A) Optimal regardless
(*B) Optimality can break: a better path to an explored node is ignored, and inconsistency is exactly what lets better-late paths exist — consistency (or re-opening) is the missing half
(C) Inadmissible heuristics work better here
(D) Frontier size becomes zero
::: explanation
Consistency forbids late better arrivals (f never decreases along paths). Without it, early closing locks in second-best. Fix: consistent h or re-opening.
:::

::: quiz Q3: Efficiency Claim
"IDA* expands fewer nodes than A* with the same heuristic, so A* is not optimally efficient." Flaw?
(A) None, the claim refutes the theorem
(*B) Optimal efficiency compares algorithms that *guarantee* optimality with equal information — IDA* re-expands across iterations and expands *more*, trading memory for time, never less
(C) IDA* is not a search algorithm
(D) Heuristics differ silently
::: explanation
Iterative deepening re-walks ground each round so totals exceed A*'s. Memory falls to linear while node counts rise — fewest-expansions stays with A*.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: `f = g+h` with admissibility/consistency contracts. 7 marks: full hand-trace with consistency checks plus the popping-goal argument.
:::

**Recap facts examiners reward:** symbol definitions; tree-vs-graph contracts; pop-not-generate rule; optimal-efficiency qualification; `O(b^d)` memory ceiling.

### Sample 3-Mark Question
**Q: State A*'s rule and when it guarantees optimality.**

**Model Answer:** Expand min f = g+h; test goals on popping. Admissible h gives tree-search optimality; consistent h (which implies admissible) gives graph-search optimality without re-expansion.

### Sample 7-Mark Question
**Q: Trace A* on the S-A-B-goal graph and prove the returned cost optimal.**

**Model Answer:** Consistency checks pass; expansion order S, A, B, goal-via-A at 5 with frontier {B:4, G:5} then {G:5, G:7}; popping G at 5 with 5 <= all frontier f proves nothing unfinished beats it under admissibility.
:::
