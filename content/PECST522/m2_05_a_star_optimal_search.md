# A* Search: Optimal and Optimally Efficient

**Bill plus guess, $f = g + h$ — the full hand-trace where greedy failed, the admissibility contract that buys optimality, and why no optimal rival expands less.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Toll Paid Plus Toll Quoted
A\* prices every route as **toll already paid** ($g$: the odometer) plus **toll quoted ahead** ($h$: the estimate). Greedy (M2.4) trusted quotes alone and drove off a cliff; UCS (M2.1) counted odometers alone and crawled every lane. A\* adds both, so it hurries where quotes are low yet never commits past a route whose total already exceeds a proven alternative.
:::

Same frontier as greedy, repaired ordering — and the admissibility/consistency machinery of M2.3 is the contract this topic finally cashes in.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Optimality conditions

With **admissible** $h$ ($h \le h^\*$, never overestimates), tree-search A\* is **optimal**; with **consistent** $h$ ($h(n) \le c + h(n')$), graph-search A\* is optimal with no re-expansion of explored nodes. Mechanism: the first goal popped has the smallest $f$ on the frontier, and admissibility keeps every unfinished route's $f$ at or below its true total — so nothing unfinished can beat the popped goal.

### 2.2 Optimal efficiency and cost

**Optimally efficient:** no other optimal algorithm using the same $h$ expands fewer nodes (up to ties) — A\* is the last word on guided optimality. Price: worst-case $O(b^d)$ time/space; memory (frontier of all visited) is the practical ceiling, which IDA\* later trades for time.

::: callout-formula KTU Formula Vault: A*
$f = g + h$ · admissible → tree-optimal · consistent → graph-optimal, no re-opens · optimally efficient for its $h$ · memory $O(b^d)$ is the ceiling.
:::

Consistency implies admissibility (M2.3), so one consistent heuristic unlocks the full graph-search guarantee — the exam's favourite one-line justification.

::: callout-pitfall Goal-Test Timing
A\* must test for goal **on popping**, not on generation: a generated goal with $f = 9$ may sit behind an unfinished $f = 5$ route. Testing at generation returns the first *seen* goal, not the cheapest — greedy's mistake wearing A\*'s clothes.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Same shape greedy failed, new numbers: $S$ ($h = 3$) to $A$ ($g = 1$, $h = 2$) and $B$ ($g = 2$, $h = 2$). $A \to G$ costs $4$ ($h = 0$); $B \to G$ costs $5$ ($h = 0$). Verify consistency, then hand-trace graph-search A\*.
:::

::: step [Step 2: Execution] Billed and Guided
Consistency: $h(S) = 3 \le 1 + 2$ and $\le 2 + 2$ ✓; $h(A) = 2 \le 4 + 0$ ✓; $h(B) = 2 \le 5 + 0$ ✓. Trace: pop $S$, push $A(f = 3)$, $B(f = 4)$. Pop $A$ ($3 < 4$), push $G$-via-$A$ ($f = 5 + 0 = 5$). Frontier $\{B(4), G(5)\}$: pop $B$, push $G$-via-$B$ ($f = 7$). Pop $G(5)$ — goal test on popping returns $S \to A \to G$ at cost $5$, and $5 \le$ every frontier $f$, so nothing unfinished can beat it.
:::

::: step [Step 3: Conclusion] Final Result
Optimal cost $5$ via $A$ — where greedy's nose would again sniff $B$ first ($h$ tie $2$-vs-$2$, but $B$'s $g$ already trails). True costs ($5 \ge 3$, $4 \ge 2$, $3 \ge 2$) confirm admissibility held throughout: quotes never exceeded reality.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Ordering Drill
Frontier: $X$ ($g=5$, $h=2$), $Y$ ($g=2$, $h=6$), $Z$ ($g=4$, $h=4$). A\* pops first?
(A) $Y$, biggest $h$ wins
(*B) $X$ with $f = 7$, against $Y$'s $8$ and $Z$'s $8$ — $f = g+h$ decides, and $X$'s cheap past outweighs $Y$'s rosy quote
(C) $Z$, middle values first
(D) Ties always broken alphabetically
::: explanation
$f$: $7$, $8$, $8$. A\* reads totals, not components — $X$ leads despite the worst-looking quote, because its odometer already banked the savings.
:::

::: quiz Q2: Guarantee Matching
Admissible-but-inconsistent $h$, graph search without re-opening explored nodes. Status?
(A) Optimal regardless
(*B) Optimality can break: a better path to an explored node is ignored, and inconsistency is exactly what lets better-late paths exist — consistency (or re-opening) is the missing half
(C) Inadmissible heuristics work better here
(D) Frontier size becomes zero
::: explanation
Consistency forbids late better arrivals ($f$ never decreases along paths); without it, closing nodes early can lock in second-best. The fix is consistent $h$ or re-opening — pick one, state it.
:::

::: quiz Q3: Efficiency Claim
"IDA\* expands fewer nodes than A\* with the same heuristic, so A\* is not optimally efficient." Flaw?
(A) None, the claim refutes the theorem
(*B) Optimal efficiency compares algorithms that *guarantee* optimality with equal information — IDA\* re-expands across iterations and expands *more*, trading memory for time, never less
(C) IDA\* is not a search algorithm
(D) Heuristics differ silently
::: explanation
Iterative deepening re-walks ground each round; its total expansions exceed A\*'s. Memory drops to linear, node count rises — efficiency's crown (fewest expansions) stays with A\*.
:::
