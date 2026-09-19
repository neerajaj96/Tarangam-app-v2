---
id: m3_09_m3_mixed_drill
courseCode: PCCST601
module: 3
sequence: 9
title: 'M3 Drill: LR + IR + SDT in One Sitting'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Carry one expression from handles through trees to tickets
  - Patch control flow after translating expressions exactly
  - Check handoffs between the three worlds without drops
concepts:
  - LR-to-IR handoff
  - translation pipeline
prerequisites:
  - m3_02_lr1_algorithm_items
  - m3_07_linear_ir_tac
  - m3_08_sdt_expressions_control
examRelevance: high
tags:
  - parsing
  - m3-drill
---
# M3 Drill: LR + IR + SDT in One Sitting

**Handles to tickets — the module's three worlds connected by one expression's journey.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Conveyor Across Worlds
`a+b*c` shifts (world 1: parse) → reduces to a tree (world 2: IR) → tickets $t_1,t_2$ (world 3: linear) — one input, three costumes. Drill the handoffs: handles→tree→tickets, because exams stage questions at handoff points.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Handoff checklist

Viable-prefix actions → accept-tree → AST/DAG choice → TAC emission (quads) → SDT attributes/coercions → control backpatch lists.

::: callout-formula KTU Formula Vault: Handoffs
Shift/reduce → **tree** → **tickets** → **patches**.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs an LR trace (with handles) and a TAC/SDT emission, or item-sets plus an IR comparison (AST vs DAG vs quads). Handoff vocabulary (handle, ticket, backpatch) signals fluency per part.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
For `id+id*id` (grammar $E\to E+T\mid T$, $T\to T*F\mid F$, $F\to id$): (a) first two handles in an LR trace? (b) AST shape? (c) TAC?
:::

::: step [Step 2: Execution] Three Costumes
1. Shift `id` → handle 〈$F\to id$〉 reduce; … second `id` similarly (leaves first, innermost-first throughout).
2. Root $+$, right child $\times$ (precedence in shape).
3. $t_1 = id_2*id_3$; $t_2 = id_1+t_1$ — ticket order mirrors tree depth (deepest first).
:::

::: step [Step 3: Conclusion] Final Result
Handles climb leaves-up, tree nests by precedence, tickets linearise depth-first. Depth-first ticket order is the invariant linking all three — state it as the closer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
DAG beats AST for `(x+y)*(x+y)` because:
(A) Prettier drawings
(*B) One shared $x+y$ node (two parents) vs duplicated subtrees — sharing names the CSE the optimizer then deletes
(C) Fewer operators exist
(D) Parsing speeds up
::: explanation
Duplication-in-AST vs sharing-in-DAG is *the* comparison: multi-parent nodes are redundancy made visible. Draw the shared node circled — visual proof beats prose.
:::

::: quiz Q2: Mixed Drill
$S\to aSb\mid ab$ on `aabb`: handle sequence?
(A) $aSb$ first
(*B) Inner $ab$ (positions 2–3) reduces to $S$ first, then outer $aSb$ — innermost-first, positions tracked
(C) Both at once
(D) $aa$ first
::: explanation
Only complete RHS $ab$ at top qualifies first; $aSb$ completes after inner collapse. Position-tagged handles ($ab$@[2,3] then $aSb$@[1,4]) show the nesting explicitly.
:::

::: quiz Q3: Mixed Drill
`if (c) s1 else s2` backpatch lists at the `else` keyword moment contain:
(A) Nothing pending
(*B) True-list of `c` (targeting $s_1$ start, now known-ish) resolved, false-list aimed at $s_2$ start pending, plus $s_1$'s jump-over-else awaiting end-label — lists in flight, none closed
(C) All closed
(D) Only scanner lists
::: explanation
Mid-construct state: true-branch bound, false-branch and skip-over-else IOUs open until end-label lands. In-flight inventory (which lists, what targets, what's pending) is the backpatch-exam answer shape.
:::
