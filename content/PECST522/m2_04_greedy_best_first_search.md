---
id: m2_04_greedy_best_first_search
courseCode: PECST522
module: 2
sequence: 4
title: 'Greedy Best-First Search: Chasing the Heuristic'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Expand minimum heuristic nodes with the f-equals-h rule
  - Trace the small graph where greed goes provably wrong
  - Keep the explored set mandatory despite the speed
concepts:
  - greedy best-first search
  - heuristic expansion
prerequisites:
  - m2_03_informed_heuristic_search_and_functions
examRelevance: medium
tags:
  - search
  - greedy-search
---
# Greedy Best-First Search: Chasing the Heuristic

**Expand whatever looks closest to the goal, ignore the bill so far — fast, memory-light, and provably non-optimal on one small graph you will trace by hand.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Moth to the Closest Lamp
Greedy best-first is a moth flying toward whichever lamp **looks** nearest, never checking how far it has already flown. Evaluation $f(n) = h(n)$ prices only the guessed remainder. When the heuristic points true, the moth lands in record time; when a wall of optimism hides a ravine, it lands somewhere expensive — or loops forever down a bottomless corridor.
:::

It sits between the blind methods of `PCCST502`-style BFS/DFS (M2.1) and the billed-optimal A\* of the next topic: same frontier machinery, different price tags.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Algorithm and properties

Frontier ordered by $h(n)$ alone; expand lowest, push successors, repeat (graph version keeps an explored set against re-expansion loops). Time/space $O(b^m)$ worst case like DFS. **Incomplete** in infinite spaces (endless promising-looking descent), **non-optimal** even with perfect-looking heuristics — the worked graph below convicts it on both value and path.

### 2.2 Reading the failure

Greed trusts $h$ absolutely. Any $h$ that underestimates one direction's remainder while a cheap-looking trap beckons will be obeyed straight into the trap. Optimality needs the $g$-bill added back — that repair is A\* (M2.5).

::: callout-formula KTU Formula Vault: Greedy
$f(n) = h(n)$ only · expand min-$h$ · $O(b^m)$ time/space · incomplete, non-optimal · explored set still mandatory.
:::

Best-first is a family name, not an algorithm: greedy ($h$), A\* ($g+h$), and weighted variants all share the frontier but price nodes differently.

::: callout-pitfall Calling Greedy Optimal
An option claiming "greedy best-first with an admissible heuristic returns optimal paths" smuggles A\*'s theorem onto greedy's body. Admissibility buys greedy nothing — only $g+h$ ordering plus admissibility yields optimality.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Start $S$ with successors $A$ ($g = 1$, $h = 5$) and $B$ ($g = 4$, $h = 3$). From $A$, goal $G$ costs $2$ more ($h = 0$); from $B$, goal $G$ costs $6$ more ($h = 0$). Run greedy best-first from $S$ and name the returned path cost versus the true optimum.
:::

::: step [Step 2: Execution] Following Its Nose
Expand $S$: frontier $\{A(h=5), B(h=3)\}$. Pop $B$ (smaller $h$), expand to $G$ with $h = 0$ — goal found, path $S \to B \to G$ costing $4 + 6 = 10$. True optimum via $A$ costs $1 + 2 = 3$. The heuristic ($3$ vs $5$) pointed at $B$ while the bills ($4$-vs-$1$ so far) screamed $A$ — greed never listens to bills.
:::

::: step [Step 3: Conclusion] Final Result
Greedy returns cost $10$; optimum is $3$ — over $3\times$ worse on four nodes. One-line exam moral: $f = h$ picks $B$, $f = g+h$ would have picked $A$ ($f(A) = 6 < f(B) = 10$ at decision time... precisely A\*'s repair, next topic).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$S \to A$ ($g=2$, $h=9$), $S \to B$ ($g=8$, $h=1$), both reach $G$ for $1$ more each. Greedy's pick and cost?
(A) $A$, total $3$
(*B) $B$ with total $9$, because $h(B) = 1 < 9 = h(A)$ decides alone — the $g$-gap ($8$ vs $2$) is invisible to $f = h$
(C) $A$, total $11$
(D) It expands both simultaneously
::: explanation
Greedy compares $9$ against $1$ and never sees $2$ against $8$. Returned $9$ versus optimal $3$ — the same nose-following conviction as the worked example, different digits.
:::

::: quiz Q2: Completeness Trap
Infinite corridor where every node's $h$ decreases toward a dead end that never arrives. Greedy's fate?
(A) Finds the goal anyway
(*B) Descends forever, because each step looks strictly better than every alternative — incompleteness needs no adversary, just endless optimism
(C) Runs out of memory first, which counts as completeness
(D) Switches to BFS automatically
::: explanation
Completeness demands eventual success on solvable problems; infinite $h$-descent never returns. Graph search's explored set cannot save a depth-infinite chase — only depth bounds or $g$-bills do.
:::

::: quiz Q3: Family Sorting
Greedy ($h$), A\* ($g+h$), UCS ($g$). Which uses only the past, only the future, both?
(A) Greedy past, UCS future
(*B) UCS past only ($g$), greedy future only ($h$), A\* both ($g+h$) — the three frontier orderings are exactly the three combinations of bill and guess
(C) All three use both
(D) A\* uses neither
::: explanation
$g$ is money spent (past), $h$ is money guessed (future). One line sorts the whole family — and predicts each member's guarantees: past-only is optimal-but-blind, future-only fast-but-fooled, both optimal-and-guided.
:::
