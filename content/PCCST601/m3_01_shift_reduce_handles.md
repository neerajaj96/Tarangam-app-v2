---
id: m3_01_shift_reduce_handles
courseCode: PCCST601
module: 3
sequence: 1
title: Shift-Reduce Parsing: Handles & Conflicts
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Drive shift, reduce, accept and error actions in order
  - Hold the viable-prefix invariant on the parsing stack
  - Name handles with shift-reduce and reduce-reduce conflicts
concepts:
  - shift-reduce parsing
  - handles
  - parsing conflicts
prerequisites: []
examRelevance: high
tags:
  - parsing
  - bottom-up-parsing
---
# Shift-Reduce Parsing: Handles & Conflicts

**Bottom-up in one mechanism — shift, reduce, accept, error — plus what handles and conflicts really mean.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Assembly Line in Reverse
Top-down *predicts* the finished model; bottom-up *builds* it: completed parts (handles — right-hand sides sitting on the stack top) get boxed into sub-assemblies (reduce to nonterminals), new bricks roll in (shift). A **handle** is exactly "the next boxable chunk": rightmost-derivation-in-reverse pruning. Two box labels fit one chunk? **Conflict** — shift/shift (LL-style indecision) or shift/reduce and reduce/reduce (which box?).
:::

::: anim sr-parse Shift Until Boxable, Then Box
Terminals pile on, the handle 〈id〉 lights up, collapse to E — the shift-reduce heartbeat in one loop.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The four actions and the viable-prefix invariant

Shift (push input) · reduce $A\to\beta$ (pop $|\beta|$, push $A$, emit production) · accept (stack $S$, input $\$ $) · error (no action). Stack always holds a **viable prefix** (a rightmost sentential form's prefix) — the invariant tables enforce.

### 2.2 Handles and conflict kinds

Handle $\langle A\to\beta, k\rangle$: $\beta$ ends at stack top and reducing continues a rightmost derivation backwards. Shift/reduce (dangling-else's $M[\dots,else]$) · reduce/reduce (two completions coincide) — both demand grammar surgery or precedence declarations.

::: callout-formula KTU Formula Vault: Bottom-Up
Shift **in**, reduce **$A\to\beta$ at top**, accept **$S+\$$** · stack = **viable prefix** · conflicts: **shift/reduce, reduce/reduce**.
:::

::: callout-pitfall Reduce Only Handles, Not Prefixes
Reducing a mere prefix (right side incomplete) derails the derivation permanently — the "reduce early" temptation. Top-must-spell-a-full-RHS is the legality test per action.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Grammar $E\to E+E\mid id$. Trace stack/input/actions on `id+id$` and mark each handle reduced.
:::

::: step [Step 2: Execution] Pile and Box
1. Shift `id` → handle 〈$E\to id$〉 → reduce $E$. Shift `+`, shift `id` → handle 〈$E\to id$〉 → reduce $E$. Stack $E+E$ → handle 〈$E\to E+E$〉 → reduce $E$. Input `$`, stack $E$ → accept.
2. Handles in order: first `id`, second `id`, then $E+E$ — leaves before parents, rightmost-derivation reversed.
:::

::: step [Step 3: Conclusion] Final Result
Handles reduce leaves-up; trace columns (stack/input/action/handle) mirror LL traces bottom-up. Handle column is the graded extra — always show it.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What qualifies a stack-top string as a handle?
(A) Any prefix of the input
(*B) A complete right-hand side ending at the top whose reduction continues some rightmost derivation of the input — boxable *now*, provably on-track
(C) Any single terminal
(D) The whole stack always
::: explanation
Handle = reducible *and* rightmost-consistent. Prefixes fail completeness; wrong-RHS tops fail consistency. Viable-prefix tables admit exactly handles — mechanism and theory aligned.
:::

::: quiz Q2: Foundational Concept
Shift/reduce conflict means:
(A) Parser crashed
(*B) One state, one lookahead licenses both shifting (grow the chunk) and reducing (box it now) — e.g. `else` after an if: shift extends the inner if, reduce closes it (dangling-else)
(C) Two stacks needed
(D) Input is empty
::: explanation
Genuine ambiguity of action (not just grammar): both moves are table-legal. Resolutions: precedence declarations (YACC shifts by default on `else` — matching typical language semantics) or grammar rewrite.
:::

::: quiz Q3: Foundational Concept
Bottom-up traces rightmost derivations — why does that matter?
(A) Speed only
(*B) Handles are defined against rightmost derivations, so reductions provably march toward $S$; leftmost-based reduction would box wrong chunks
(C) Trees differ
(D) It doesn't matter
::: explanation
Rightmost-in-reverse gives the unique parent chain to climb; handles *are* its pruning steps. Direction consistency (reduce rightmost-first) is what makes every reduction safe — the invariant behind the tables.
:::
