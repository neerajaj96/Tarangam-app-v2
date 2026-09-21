---
id: m2_06_generate_and_test
courseCode: PECST522
module: 2
sequence: 6
title: 'Generate-and-Test: The Weak Method That Frames Them All'
difficulty: beginner
estimatedMinutes: 6
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

**Problem: how do we solve constraint tasks with zero guidance — and what baseline must every smarter method beat? By the end you can run generate-and-test by hand, price `d^n`, and name exactly what backtracking fixes.**

<a id="start-zero"></a>
## 1. Start From Zero: Every Key on the Ring

Trying every key on a ring: propose one full solution, test it against the lock, discard, repeat. No memory of *why* keys failed — the tenth key learns nothing from the first nine. That honesty is its value: the weakest method that still works, hence the measuring stick for everything cleverer.

**Definitions:** **Generate** means systematically enumerate complete assignments (every variable gets a value; systematic means none skipped, none repeated — random guessing is not generate-and-test and loses completeness). **Test** means check the full assignment against all constraints, pass/fail only. Constraint Satisfaction Problems (CSPs — variables, domains, constraints) are its home territory.

::: callout-intuition Core Mental Model: Keyring in the Dark
Feel "complete candidates only, no partial credit" here, then drop the keys; the loop plus the `d^n` price below is the technical content.
:::

**Tiny beginner example:** two switches X, Y each {on, off}, constraint "not equal." Candidates: on/on fail, on/off pass — stop at 2 of 4 tests. Exhaustion proves absence when nothing passes.

::: toggle What are `variable`, `domain`, `constraint`, `assignment`, `d^n`?
`Variable` = a thing to decide (switch X). `Domain` = its allowed values ({on, off} — size `d = 2`). `Constraint` = a rule combinations must satisfy ("not equal"). `Assignment` = one value per variable (complete: on/off — testable; partial: X=on alone — untestable here). `d^n` = worst-case full tests (2² = 4 candidates — exponentiation because each of `n` variables multiplies options by `d`). Tiny check above: 2 of 4 tests ran before success (best case); worst case runs all 4.
:::

::: toggle Why `d^n` and not `d × n`?
Each variable independently multiplies the candidate count: 4 variables × 3 values = 3·3·3·3 = 81 (each new variable triples the bill — one more variable triples everything). Addition would count values, not combinations; the space is a product because choices combine. Exam trap: "12 tests" for 4×3 mistakes sum for product — always exponentiate per-variable options.
:::

<a id="basics"></a>
## 2. Basic Layer: The Loop and Its Price

**Data/state:** complete candidate assignments. **Goal:** first fully-passing assignment, or proof none exists.

**Procedure (steps):** Step 1: generate the next complete assignment in fixed order. Step 2: test it against every constraint (cheap, failure-prone constraints first — fail fast). Step 3: return it if all pass; else repeat until enumeration ends (then report unsatisfiable).

**Meaning, variables, formula:** with `d` values per variable and `n` variables, worst case counts full combinations:

$$\text{tests} = d^n$$

Tiny numbers: 4 variables with 3 values need up to 81 tests (3x3x3x3), not 12 — exponentiation, not multiplication. One more variable triples the bill. Complete on finite spaces (systematic enumeration finds solutions and certifies absence), but exponentially blind.

<a id="formal-model"></a>
## 3. Formal Layer: When It Suffices and What It Cannot Do

**When enough:** tiny spaces, or constraint checks so cheap that guidance overhead exceeds brute force. Its syllabus role is contrast: hill climbing adds neighbour scoring, backtracking adds early exit on partial failure, constraint propagation (next topic) deletes impossible values before guessing.

::: callout-formula KTU Formula Vault: Generate-and-Test
Generate complete, test all, repeat. Worst case `d^n`. Complete but unguided. Order constraints fail-fast. Backtracking adds partial-assignment exit.
:::

::: callout-pitfall Partial Credit Illusion
Generate-and-test scores pass/fail only — never "two constraints from done." Steering by near-misses is hill climbing's job, not this method's. Options crediting guidance here confuse testing with neighbour scoring.
:::

**Full trace — triangle with 2 colours {R, G}, all pairs adjacent:** 8 candidates (RRR, RRG, RGR, RGG, GRR, GRG, GGR, GGG). Each fails at least one equality (X=Y or X=Z or Y=Z). Eight cycles, zero survivors — exhaustive failure *proves* unsatisfiability, the one thing brute force does better than guidance.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Generate-and-test vs. backtracking | Full candidates only vs. abandon doomed partial prefixes early |
| Systematic vs. random guessing | Enumeration discipline (complete) vs. re-tests and possible eternal misses |
| Fail-fast order vs. guidance | Cheap-tests-first saves checking time vs. scoring steers search |

**Watch out:** (1) Filling Z six ways under a dead X=Y=R prefix is the canonical waste backtracking removes. (2) Random sampling is not a completeness-preserving substitute. (3) Pass/fail testing never ranks candidates.

**Limitations:** exponential `d^n` scaling; zero learning across candidates; no use of constraint structure. Propagation plus search (next topic) keeps completeness while deleting most candidates unseen.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Q1: Counting Drill
4 variables, 3 values each, full generate-and-test. Worst-case tests?
(A) 12, values times variables
(*B) 81 = 3^4 complete assignments — exponentiation, not multiplication, prices brute force, which is why one more variable triples the bill
(C) 7, values plus variables
(D) 1, first guess suffices
::: explanation
Full combinations multiply: 3x3x3x3 = 81. Additive intuitions underprice search by an order of magnitude.
:::

::: quiz Q2: Failure Intelligence
X = R already clashes with Y = R, but generate-and-test fills Z six ways before moving on. Diagnosis?
(A) Sound pruning
(*B) No early exit on partial failure — complete candidates only, so doomed prefixes are completed repeatedly instead of abandoned, the exact waste backtracking eliminates
(C) Wrong test order
(D) Incomplete enumeration
::: explanation
Six Z-fillings under a dead prefix buy nothing. Testing partial assignments and backtracking on first clash is the named repair.
:::

::: quiz Q3: Completeness Honesty
Systematic generate-and-test on a finite space with no solution. Guarantee?
(A) Loops forever
(*B) Terminates having tried everything and correctly reports unsatisfiability — exhaustion is a proof, not a failure, and the method's one unassailable virtue
(C) Returns a random candidate
(D) Completeness requires heuristics
::: explanation
Finite enumeration ends; empty survivors means no solution exists. Guidance speeds success, exhaustion certifies absence.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: loop plus `d^n` arithmetic. 7 marks: full 8-candidate triangle enumeration with the unsatisfiability verdict and the backtracking contrast.
:::

**Recap facts examiners reward:** generate-complete/test-all/repeat; systematic-vs-random line; `d^n` with one worked power; fail-fast ordering; partial-exit as backtracking's fix.

### Sample 3-Mark Question
**Q: State generate-and-test and its worst-case cost.**

**Model Answer:** Systematically generate each complete assignment, test against all constraints, repeat to first pass or exhaustion. Cost d^n full tests; complete on finite spaces, unguided.

### Sample 7-Mark Question
**Q: Enumerate 2-colouring of the triangle and state what failure proves.**

**Model Answer:** All 8 assignments fail an adjacency (list each clash); exhaustion proves no 2-colouring exists. Waste note: X=Y clashes refilled Z repeatedly — backtracking would exit on the partial clash instead.
:::
