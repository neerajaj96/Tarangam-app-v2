---
id: m2_07_csp_arc_consistency_ac3
courseCode: PECST522
module: 2
sequence: 7
title: 'CSPs & AC-3: Constrain, Propagate, Then Search'
difficulty: beginner
estimatedMinutes: 4
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

**Variables, domains, constraints — node/arc consistency as a pruning engine, one AC-3 trace solved without search, and the triangle that proves propagation is not enough.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Seating Feuds
A CSP seats guests (variables) into chairs (domains) so no feud (constraint) shares a table. **Arc consistency** interrogates each feud direction: every guest must have *some* compatible partner across the table — guests with none are unseated before the party starts. AC-3 repeats the interrogation until nobody else is ejected; whatever chairs survive, backtracking searches.
:::

Generate-and-test (M2.6) filled whole seatings blindly; propagation deletes impossible chairs *before* guessing — the standard pipeline is constrain, propagate, then search only the residue.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 CSP anatomy

Variables $X_i$, domains $D_i$, constraints (unary/binary/global like Alldiff). An **arc** $X \to Y$ is consistent if every $x \in D_X$ has some $y \in D_Y$ satisfying the constraint. **AC-3** queues all arcs, revises (deleting unsupported values), and re-queues neighbours of every shrunk domain — $O(ed^3)$ time, terminating with the maximal arc-consistent domains.

### 2.2 Limits

Arc consistency never invents values and never detects *global* inconsistency alone: the 2-colour triangle (M2.6) is arc-consistent yet unsatisfiable. Propagation prunes; search decides.

::: callout-formula KTU Formula Vault: CSP + AC-3
Arc $X \to Y$: each $x$ needs a supporting $y$ · revise deletes unsupported · re-queue neighbours on shrink · $O(ed^3)$ · arc-consistent $\ne$ solvable.
:::

Arcs are directed: revising $X \to Y$ can shrink $X$ only — students who "revise once per pair" skip half the queue and leak values that propagation would have caught.

::: callout-pitfall Consistency-Level Confusion
Node consistency (unary), arc consistency (binary pairs), path consistency (triples) — each strictly stronger. Claiming AC-3 "solves CSPs" promotes a pruning level to a solver; the triangle counterexample demotes it back in one line.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Variables $X, Y$ with $D_X = D_Y = \{1, 2\}$, constraint $X < Y$. Run AC-3's revisions to fixpoint and state the result.
:::

::: step [Step 2: Execution] Interrogating Both Arcs
Revise $X \to Y$: $x = 1$ keeps support ($y = 2 > 1$ ✓); $x = 2$ has no $y > 2$ — delete $2$, so $D_X = \{1\}$ (shrunk → re-queue neighbours). Revise $Y \to X$: $y = 1$ needs $x < 1$ from $\{1\}$ — none, delete $1$; $y = 2$ supported by $x = 1$ ✓. Fixpoint: $D_X = \{1\}$, $D_Y = \{2\}$ — the unique solution, found with zero search.
:::

::: step [Step 3: Conclusion] Final Result
$X = 1$, $Y = 2$ by propagation alone. Contrast the M2.6 triangle: there every value keeps arc support (each colour appears opposite), so AC-3 deletes nothing and search must break the symmetry — prune-then-search, each doing its own job.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Revision Arithmetic
$D_A = \{1, 2, 3\}$, $D_B = \{2\}$, constraint $A > B$. Revise $A \to B$?
(A) Delete nothing, all supported
(*B) Delete $1$ and $2$, keeping $\{3\}$ — $1 > 2$ is false, $2 > 2$ is false, only $3 > 2$ holds, and revision keeps a value only if some witness in $D_B$ supports it
(C) Delete $3$ instead
(D) Wipe the whole domain
::: explanation
$1 > 2$ false, $2 > 2$ false, $3 > 2$ true — only $3$ has a supporting $b$. Revision is existential per value: one witness saves, zero witnesses deletes. Candidates $\{1, 2\}$ fall together here.
:::

::: quiz Q2: Queue Discipline
Revising $X \to Y$ shrinks $D_X$. Which arcs re-queue?
(A) None, one pass suffices
(*B) All arcs $Z \to X$ (neighbours pointing at $X$), because their supports may have just lost their witness — skipping re-queue misses cascading deletions, AC-3's entire power
(C) Only $X \to Y$ itself
(D) Every arc in the problem
::: explanation
Shrinkage invalidates supports elsewhere; neighbours must re-prove their values against the smaller domain. Chains of such cascades solve whole puzzles — single-pass "AC-1 thinking" forfeits them.
:::

::: quiz Q3: Limit Witness
2-colour triangle, all domains $\{R, G\}$. AC-3 deletes?
(A) Everything, inconsistency found
(*B) Nothing — each value keeps a witness ($R$ opposite $G$ on every arc), yet globally no solution exists: arc-consistent but unsatisfiable, propagation's boundary stone
(C) One colour per node
(D) AC-3 crashes on cycles
::: explanation
Local support $\ne$ global solution: every arc is happy while the whole is impossible. This exact case separates "pruning" from "solving" — search (or stronger consistency) must finish the job.
:::
