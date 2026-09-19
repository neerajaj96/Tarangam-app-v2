---
id: m4_02_codegen_boolean_relational
courseCode: PCCST601
module: 4
sequence: 2
title: 'Code Shape: Boolean, Relational & Jumps'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Chain short-circuit truth with conditional jumps
  - Swap exits for negation and compare-then-jump chains
  - Lay out fall-through paths for branch economy
concepts:
  - short-circuit evaluation
  - comparison chains
  - fall-through layout
prerequisites:
  - m3_08_sdt_expressions_control
examRelevance: medium
tags:
  - code-generation
  - control-flow
---
# Code Shape: Boolean, Relational & Jumps

**Short-circuit truth — branchy booleans, comparison chains, and fall-through layout.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Lazy Referee
`A && B`: if $A$ is false, the referee blows the whistle *without watching $B$* (short-circuit — also skipping $B$'s side effects!). Code shape = compare-and-jump chains with true/false exits threaded through (backpatch lists again — M3's IOUs return). Relational ops compile to flag-setting compares + conditional branches; layout (which branch falls through) minimises jumps.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Short-circuit and relational shapes

`&&`: evaluate left; false ⇒ jump false-exit (skip right); else evaluate right. `||` mirrored. `!` swaps exits (no code!). Relational $a<b$: `cmp a,b; jl true-label` (+ fall-through false path). Boolean *values* (not just jumps) materialise via set-on-condition or branchy $0/1$ assignment.

::: callout-formula KTU Formula Vault: Boolean Shape
`&&`/`||` = **conditional chains** · `!` = **swap exits** · compares = **cmp+jump** · layout picks **fall-through**.
:::

::: callout-pitfall Skipped Side Effects Are Semantics
Short-circuit skips calls/assignments in dead branches (`p && p->x`) — full evaluation would crash/alter. Optimisers must preserve skipping (no eager hoisting across guards) — correctness over cleverness, always stated.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Emit jump-shape TAC for `if (a<b && c<d) x=1` with labels, showing short-circuit exits.
:::

::: step [Step 2: Execution] Chain and Thread
1. `ifFalse a<b goto L_next(__)` (first guard fails → skip rest AND body).
2. `ifFalse c<d goto L_next(__)` (second guard).
3. `x=1`; `L_next:` — true falls through both guards into the body; either false jumps out. Two IOUs patched at `L_next`.
:::

::: step [Step 3: Conclusion] Final Result
Guards chain with false-exits to the join; body sits on the fall-through path. Exit-threading (not value-computing) is short-circuit code's signature — draw exits, not values.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why compile `&&` as jumps rather than bitwise AND of 0/1 values?
(A) Jumps are prettier
(*B) Jumps preserve short-circuit (skip right side, its cost and side effects); value-AND would evaluate both — semantics + speed both demand chains
(C) Values can't represent truth
(D) Registers lack AND
::: explanation
`p && p->next` *requires* skipping (null dereference otherwise). Chains encode laziness structurally; eager evaluation is a miscompilation, not an optimisation.
:::

::: quiz Q2: Foundational Concept
`!cond` compiles to what extra code?
(A) A NOT instruction always
(*B) Nothing — swap the true/false exit lists (backpatch targets exchange); negation is bookkeeping, zero instructions
(C) Double jumps
(D) A function call
::: explanation
Exits *are* the boolean: swapping labels negates. Zero-cost NOT showcases exit-threading's elegance — representation doing the work of computation.
:::

::: quiz Q3: Foundational Concept
Fall-through layout optimisation means:
(A) Removing all jumps
(*B) Ordering blocks so the hot path flows without jumps (cold path takes the branch) — fewer taken branches, better prediction and fetch
(C) Inlining everything
(D) Unrolling loops
::: explanation
Taken branches cost (pipeline flush risk); fall-through is free. Profiling/heuristics pick the hot successor to lay next — layout is statistical, guided by execution counts.
:::
