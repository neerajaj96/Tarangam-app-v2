---
id: m4_03_codegen_control_calls
courseCode: PCCST601
module: 4
sequence: 3
title: 'Code Shape: Control Flow & Procedure Calls'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Plumb fork and merge labels for ifs, loops and cases
  - Build jump tables for dense case dispatch
  - Run the args, call, frame and return protocol exactly
concepts:
  - label plumbing
  - jump tables
  - calling conventions
prerequisites:
  - m3_08_sdt_expressions_control
  - m4_02_codegen_boolean_relational
examRelevance: high
tags:
  - code-generation
  - procedure-calls
---
# Code Shape: Control Flow & Procedure Calls

**Ifs, loops, cases, and calls — label plumbing, loop anatomy, jump tables, and calling conventions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Road Signs and Phone Protocol
**Ifs** fork roads with merge signs (labels + backpatched jumps). **Loops** are roundabouts: condition gate, body lap, back-edge re-entry, exit ramp (pre-test `while` vs post-test `do-while` differ by gate placement). **Case** is a multi-exit interchange — jump table (dense cases) or decision tree (sparse). **Calls** follow phone protocol: dial sequence (args), handoff (return address/frame), reception (prologue), farewell (epilogue) — the calling convention contract both sides honour.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Constructs and call protocol

* Conditional: test → jump-over-else → join label (backpatched).
* While: `L_head: test-jump-exit; body; jump L_head; L_exit:`; do-while tests at bottom (one fewer jump).
* Case: dense → jump table indexed by value; sparse → if-else chain/binary search on labels.
* Calls: caller saves + arg passing (regs/stack) → `call` (return address) → callee prologue (frame/link) → body → epilogue → `ret`; caller/callee-saved register split.

::: callout-formula KTU Formula Vault: Control + Calls
If = **fork+merge labels** · while = **head-test+back-edge** · dense case = **jump table** · call = **args→call→frame→ret**.
:::

::: callout-pitfall Caller vs Callee-Saved Mix-Ups
Caller-saved (clobberable across calls — save if live); callee-saved (preserved — save/restore if used). Swapping the duty corrupts values silently across calls — convention tables are contracts, memorise the split per target.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Lay out `while (i<n) { a[i]=0; i++; }` in TAC-labels, then list a call sequence for `f(x, y)` (caller side).
:::

::: step [Step 2: Execution] Roundabout and Phone Call
1. `L_h: ifFalse i<n goto L_x; t=a+i*sz(?); *t=0; i=i+1; goto L_h; L_x:` (address arithmetic explicit — array lowering inside loops).
2. Caller: evaluate args → move to arg regs/stack → save caller-saved lives → `call f` → collect return → restore. (Callee: prologue builds frame, epilogue tears down.)
:::

::: step [Step 3: Conclusion] Final Result
Loops expose address arithmetic + back-edge; calls expose the two-sided protocol. Shape answers name *both* sides' duties — one-sided call sequences are incomplete.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Jump table vs if-else chain for `switch` — the density rule?
(A) Always jump tables
(*B) Dense consecutive values → table (O(1) dispatch, space ∝ range); sparse → chain/binary search (space ∝ cases, time ∝ cases/log) — range-vs-count economics decide
(C) Always chains
(D) Compilers flip coins
::: explanation
Table of $10{,}000$ for $3$ far-flung cases wastes; chaining $500$ consecutive cases crawls. Density (count/range) is the metric — compute it, then choose.
:::

::: quiz Q2: Foundational Concept
Why do-while needs one fewer jump than while per iteration?
(A) It's shorter source
(*B) Bottom-tested loops use a single conditional branch-back per lap; while pairs a conditional exit-jump with an unconditional back-jump (2 jumps/lap)
(C) Compilers prefer it
(D) No difference exists
::: explanation
While: test-jump-out + back-jump (2); do-while: conditional-back only (1). Gate placement *is* the jump count — draw both roundabouts to verify.
:::

::: quiz Q3: Foundational Concept
Frame pointer's job in the call protocol?
(A) Speed arithmetic
(*B) Stable anchor for locals/args amid stack-pointer motion (pushes/pops/alloca) — addressing stays fixed via FP offsets while SP dances
(C) Return values
(D) Nothing modern
::: explanation
SP shifts with every push; FP pins the frame's base for the call's life (prologue sets, epilogue restores). Anchor-vs-mover split keeps addressing sane — omit-frame-pointer is the optimisation that re-derives it all.
:::
