---
id: m2_06_generate_and_test
courseCode: PECST522
module: 2
sequence: 6
title: 'Generate-and-Test: The Weak Method That Frames Them All'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Exhaust complete candidates with generate, test and repeat
  - Price worst-case candidate counts for exam arithmetic
  - Fail fast on constraint order against doomed prefixes
concepts:
  - generate and test
  - exhaustive search
prerequisites:
  - m2_01_uninformed_search_dfs_bfs_ucs
examRelevance: medium
tags:
  - search
  - brute-force
---
# Generate-and-Test: The Weak Method That Frames Them All

**Propose a complete candidate, test it against every constraint, repeat — exhaustive, honest, and the baseline that makes every smarter method earn its keep.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Keyring in the Dark
Generate-and-test is trying **every key on the ring**: propose one full solution, check it against the lock, discard and repeat. No guidance, no memory of *why* a key failed — the tenth key learns nothing from the first nine. It is the weakest method that still works, which makes it the perfect measuring stick: any clever algorithm must justify itself against trying everything.
:::

It is depth-first search stripped of direction (M2.1's machinery, zero heuristic), and the direct ancestor of backtracking — which adds the one thing missing here: quitting a doomed partial candidate early.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The loop and its price

Repeat: **generate** a complete assignment (systematically, so none repeats and none is skipped), **test** it against all constraints; stop at the first pass. With $d$ values per variable and $n$ variables, worst case $d^n$ full tests — complete (a solution will be found) but exponentially blind. Test order is free leverage: cheap, failure-prone constraints first fail fast.

### 2.2 When it is enough

Tiny spaces, or constraint checks so cheap that guidance overhead exceeds brute force. Its real syllabus role is contrast: hill climbing, backtracking, and constraint propagation (M2.7) each fix one of its blindnesses.

::: callout-formula KTU Formula Vault: Generate-and-Test
Generate complete → test all → repeat · $d^n$ worst case · complete, unguided · fail-fast constraint order · backtracking adds early exit.
:::

Systematic generation matters: random guessing re-tests failures and can miss solutions forever — completeness needs enumeration discipline, not luck.

::: callout-pitfall Partial Credit Illusion
Generate-and-test scores candidates pass/fail only; it cannot say "two constraints from done" and steer. An option crediting it with gradient-like guidance confuses testing with hill climbing's neighbour scoring.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Colour triangle regions $X, Y, Z$ (each adjacent to both others) with $2$ colours $\{R, G\}$. Enumerate generate-and-test fully and state what the failure proves.
:::

::: step [Step 2: Execution] All Eight Keys
$2^3 = 8$ candidates: $RRR$ fails (3 clashes), $RRG$ fails ($X = Y$), $RGR$ fails ($X = Z$), $RGG$ fails ($Y = Z$), $GRR$ fails ($Y = Z$), $GRG$ fails ($X = Z$), $GGR$ fails ($X = Y$), $GGG$ fails (3 clashes). Every key tried, every key fails — $8$ generate-test cycles, zero survivors.
:::

::: step [Step 3: Conclusion] Final Result
No 2-colouring exists — exhaustive failure *proves* unsatisfiability, the one thing brute force does better than guidance. The repair (a third colour, or backtracking that abandons $X = Y$ after two assignments instead of filling $Z$ six futile times) is M2.7's story.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Counting Drill
$4$ variables, $3$ values each, full generate-and-test. Worst-case tests?
(A) $12$, values times variables
(*B) $81 = 3^4$ complete assignments — exponentiation, not multiplication, prices brute force, which is why one more variable triples the bill
(C) $7$, values plus variables
(D) $1$, first guess suffices
::: explanation
$d^n$ counts full combinations: $3 \times 3 \times 3 \times 3 = 81$. Additive intuitions ($12$) underprice search by an order of magnitude — the combinatorial explosion in one line.
:::

::: quiz Q2: Failure Intelligence
$X = R$ already clashes with $Y = R$, but generate-and-test fills $Z$ six ways before moving on. Diagnosis?
(A) Sound pruning
(*B) No early exit on partial failure — complete candidates only, so doomed prefixes are completed repeatedly instead of abandoned, the exact waste backtracking eliminates
(C) Wrong test order
(D) Incomplete enumeration
::: explanation
Six $Z$-fillings under a dead $X = Y = R$ prefix buy nothing. Testing partial assignments and backtracking on first clash is the named repair — generate-and-test's blindness, localized.
:::

::: quiz Q3: Completeness Honesty
Systematic generate-and-test on a finite space with no solution. Guarantee?
(A) Loops forever
(*B) Terminates having tried everything and correctly reports unsatisfiability — exhaustion is a proof, not a failure, and the method's one unassailable virtue
(C) Returns a random candidate
(D) Completeness requires heuristics
::: explanation
Finite enumeration ends; empty survivors means no solution exists. Weak methods still prove negative results — guidance speeds success, exhaustion certifies absence.
:::
