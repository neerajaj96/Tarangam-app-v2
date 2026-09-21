---
id: m2_07_csp_arc_consistency_ac3
courseCode: PECST522
module: 2
sequence: 7
title: 'CSPs & AC-3: Constrain, Propagate, Then Search'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Frame problems as variables, domains and constraints
  - Prune with arc consistency before any guessing starts
  - Trace AC-3 queue revisions to quiescence by hand
concepts:
  - constraint satisfaction
  - arc consistency
  - AC-3 algorithm
prerequisites:
  - m2_06_generate_and_test
examRelevance: medium
tags:
  - search
  - csp
---
# CSPs & AC-3: Constrain, Propagate, Then Search

**Problem: generate-and-test fills whole doomed assignments. Can we delete impossible values before guessing? By the end you can frame any CSP (Constraint Satisfaction Problem), run the AC-3 (Arc Consistency algorithm 3) queue by hand, and prove propagation alone does not solve everything.**

<a id="start-zero"></a>
## 1. Start From Zero: Seating Feuds

Guests (variables) need chairs (domains) with no feud (constraint) sharing a table. **Arc consistency** interrogates each feud direction: every guest must keep some compatible partner across the table — guests with none are unseated before the party. AC-3 repeats until nobody else is ejected; backtracking searches only the survivors.

**Definitions:** variable `X_i` (what to assign); domain `D_i` (allowed values); constraint (allowed combinations; unary on one variable, binary on pairs, global like Alldiff). An **arc** `X -> Y` (directed pair) is consistent iff every `x` in `D_X` has some supporting `y` in `D_Y` satisfying the constraint.

::: callout-intuition Core Mental Model: Seating Feuds
Feel "delete unsupported values first" here, then drop the party; directed arcs plus the re-queue rule below are the technical content.
:::

**Tiny beginner example:** X, Y in {1, 2} with X < Y. Value 2 in X has no partner above it — delete 2 from X before any search. Propagation solves pieces of the puzzle for free.

::: toggle Trace the tiny example revision by revision
Queue starts with both directed arcs: [X→Y, Y→X]. Revise X→Y: x=1 needs y>1 in {1,2} → y=2 witnesses, keep; x=2 needs y>2 → none → delete 2. D_X shrank {1,2}→{1}: re-queue neighbours pointing at X → [Y→X, Y→X]. Revise Y→X: y=1 needs x<1 in {1} → none → delete 1; y=2 needs x<2 → x=1 witnesses, keep. D_Y = {2}. Queue drains. Fixpoint X={1}, Y={2} — the unique solution found with zero guessing. Each deletion re-queues exactly the arcs that could cascade (neighbours of the shrunk domain).
:::

::: toggle What are `arc`, `revise`, `consistent/complete assignment`, `termination`?
Arc `X→Y` = directed pair (direction matters — revise X→Y shrinks only X). Revise = delete every value lacking a supporting witness in the other domain (existential per value: one witness saves). Consistent assignment = satisfies all constraints (a solution); complete = every variable assigned (partial assignments are untestable here). Termination = empty queue (quiescence — no arc can delete further; domains are maximal arc-consistent sets, not solutions). Empty domain mid-run = proven local impossibility → backtrack at once.
:::

<a id="basics"></a>
## 2. Basic Layer: CSP Anatomy and the AC-3 Loop

**Data/state:** current domains per variable. **Goal:** shrink domains to their maximal arc-consistent sets, then search the residue.

**Procedure — AC-3 (steps then trace):** Step 1: queue every directed arc. Step 2: pop arc `X -> Y`, **revise** (delete each `x` with zero supporting `y`). Step 3: if `D_X` shrank, re-queue every neighbour arc `Z -> X` (their supports may have lost witnesses). Step 4: repeat to quiescence (empty queue). Complexity `O(e*d^3)` (e = constraint arcs, d = max domain size) — quoted as the price of full propagation.

**Trace on X < Y with D = {1,2} both:** revise X->Y: 1 supported by 2, 2 unsupported — delete 2, D_X = {1}, re-queue neighbours. Revise Y->X: 1 needs x < 1 from {1} — none, delete 1; 2 supported by 1. Fixpoint: X={1}, Y={2} — unique solution with zero search.

<a id="formal-model"></a>
## 3. Formal Layer: Limits and Levels

**Meaning, variables, formula:** arc `X -> Y` consistent iff `for every x in D_X there exists y in D_Y with constraint(x,y)`. Revision is existential per value (one witness saves, zero deletes). Arcs are directed: revising `X -> Y` shrinks only X — one pass per undirected pair skips half the work.

**Limit theorem:** arc consistency never invents values and never detects global inconsistency alone. The 2-colour triangle (previous topic) with domains {R,G} everywhere: each value keeps a witness on every arc (R opposite G), so AC-3 deletes nothing — yet globally no solution exists. Propagation prunes; search decides.

::: callout-formula KTU Formula Vault: CSP + AC-3
Arc X->Y: each x needs a supporting y. Revise deletes unsupported. Shrink re-queues neighbours. `O(e*d^3)`. Arc-consistent does not imply solvable.
:::

::: callout-pitfall Consistency-Level Confusion
Node (unary), arc (binary pairs), path (triples) — strictly stronger in order. "AC-3 solves CSPs" promotes a pruning level to a solver; the triangle counterexample demotes it in one line.
:::

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Propagation vs. search | Deletes impossible values vs. guesses among survivors |
| Directed vs. undirected arcs | Re-queue neighbours pointing at shrunk domains vs. revisiting nothing |
| Node vs. arc vs. path consistency | Unary vs. pair vs. triple strength |

**Watch out:** (1) Revision arithmetic is per-value existential — check every value for at least one witness. (2) Skipping re-queue forfeits cascades (single-pass "AC-1 thinking"). (3) Empty domain means proven local impossibility — backtrack immediately.

**Limitations:** `O(e*d^3)` on large domains; arc-consistent-but-unsatisfiable cases need search or stronger (path/global) consistency; global constraints need specialized propagators beyond binary arcs.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Q1: Revision Arithmetic
D_A = {1, 2, 3}, D_B = {2}, constraint A > B. Revise A -> B?
(A) Delete nothing, all supported
(*B) Delete 1 and 2, keeping {3} — 1 > 2 is false, 2 > 2 is false, only 3 > 2 holds, and revision keeps a value only if some witness in D_B supports it
(C) Delete 3 instead
(D) Wipe the whole domain
::: explanation
Existential per value: 1 and 2 find no supporting b, 3 finds b = 2. Only witnessed values survive revision.
:::

::: quiz Q2: Queue Discipline
Revising X -> Y shrinks D_X. Which arcs re-queue?
(A) None, one pass suffices
(*B) All arcs Z -> X (neighbours pointing at X), because their supports may have just lost their witness — skipping re-queue misses cascading deletions, AC-3's entire power
(C) Only X -> Y itself
(D) Every arc in the problem
::: explanation
Shrinkage invalidates supports elsewhere. Neighbours must re-prove values against the smaller domain; chains of cascades solve whole puzzles.
:::

::: quiz Q3: Limit Witness
2-colour triangle, all domains {R, G}. AC-3 deletes?
(A) Everything, inconsistency found
(*B) Nothing — each value keeps a witness (R opposite G on every arc), yet globally no solution exists: arc-consistent but unsatisfiable, propagation's boundary stone
(C) One colour per node
(D) AC-3 crashes on cycles
::: explanation
Local support differs from global solution. Every arc is happy while the whole is impossible — search or stronger consistency must finish.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: CSP triple plus arc-consistency definition. 7 marks: full AC-3 trace to fixpoint with queue states, plus the triangle limit.
:::

**Recap facts examiners reward:** variables/domains/constraints; directed-arc definition; revise-plus-requeue loop; `O(e*d^3)`; X<Y fixpoint {1}/{2}; triangle as arc-consistent-yet-unsatisfiable.

### Sample 3-Mark Question
**Q: Define CSP and arc consistency.**

**Model Answer:** Variables with domains plus constraints on combinations. Arc X->Y consistent iff each x has a supporting y satisfying the constraint.

### Sample 7-Mark Question
**Q: Run AC-3 on X<Y with {1,2} and contrast the triangle.**

**Model Answer:** Revisions delete 2 from X then 1 from Y, leaving X=1, Y=2 with zero search. Triangle deletes nothing despite unsatisfiability — local witnesses everywhere, global solution nowhere — so propagate-then-search.
:::
