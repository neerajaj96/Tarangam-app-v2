---
id: m1_06_infix_postfix_evaluation
courseCode: PCCST303
module: 1
sequence: 6
title: Infix to Postfix & Postfix Evaluation
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Convert infix to postfix with precedence climbing and parenthesis flushes
  - Evaluate postfix in one pass with the correct operand order
  - Trace both algorithms at linear cost for exam traces
concepts:
  - precedence climbing
  - postfix evaluation
prerequisites:
  - m1_04_stacks_multistacks_applications
examRelevance: high
tags:
  - stacks
  - expressions
---
# Infix to Postfix & Postfix Evaluation

**Precedence-climbing with a stack, then single-pass evaluation — the two algorithms asked as traces.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Punctuation Rescue
Infix ($3+4\times2$) needs precedence rules and brackets to parse; postfix ($342\times+$) needs neither — operators trail their operands, so a left-to-right scan with a number-stack *is* the evaluation (see operator → pop two, apply, push back). Conversion uses an operator-stack as a waiting room: higher precedence jumps the queue, brackets open/close rooms.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Conversion rules

Operands → output immediately. Operators: pop while top has **$\ge$** precedence (for left-associative; strict $>$ for right-associative `^`), then push. `(` pushed blindly; `)` pops until `(` (discard both). End: pop all. Precedence: `^` $>$ `×,/` $>$ $+,-$.

### 2.2 Evaluation

Scan postfix: operand → push; operator → pop $b$, pop $a$, push $a\ op\ b$ (order matters for $-$, $/$). Final single value = answer. Both algorithms $\Theta(n)$.

::: callout-formula KTU Formula Vault: Expressions
Convert: **pop $\ge$ prec, push; `)`→`(` flush** · evaluate: **pop $b$, $a$; push $a\ op\ b$** · both **$\Theta(n)$**.
:::

::: callout-pitfall Operand Order in $a-b$, $a/b$
Pop gives $b$ *first* (top), then $a$ — compute $a\ op\ b$, never $b\ op\ a$. Reversed subtraction/division is the silent trace-killer; label pops explicitly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Convert $A+B\times C-D/E$ to postfix, then evaluate $5\,3\,2\,\times\,+\,4\,-$.
:::

::: step [Step 2: Execution] Waiting Room, Then Stack Math
1. $A$ out; $+$ waits; $B$ out; $\times$ outranks $+$ → waits above; $C$ out; end-of-run flush $\times,+$; $-$ (equal to $+$, pop it first) waits; $D$ out; $/$ outranks → waits; $E$ out; flush $/,−$. Result: $ABC\times+DE/−$.
2. $5,3,2$ pushed; $\times$: $3\times2 = 6$; $+$: $5+6 = 11$; $4$ pushed; $-$: $11-4 = 7$.
:::

::: step [Step 3: Conclusion] Final Result
Conversion traces grade operator-stack states per symbol; evaluation traces grade stack contents per token. Show every intermediate stack — partial credit lives there.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Postfix of $A\times B+C$?
(A) $AB+C\times$
(*B) $AB\times C+$ — $\times$ binds first, then $+$
(C) $ABC\times+$
(D) $+AB\times C$
::: explanation
$\times$ outranks $+$: emit $AB\times$ before $+$ ever leaves the stack. Reading precedence order directly off the infix (do $\times$ first) predicts postfix grouping.
:::

::: quiz Q2: Numerical Drill
Evaluate $8\,2\,/\,3\,-$:
(A) $7$
(*B) $8/2 = 4$; $4-3 = 1$
(C) $8/(2-3)$
(D) $5$
::: explanation
$/$: $a=8$, $b=2$ → $4$; then $-$: $4-3 = 1$. Parenthesising as $8/(2-3)$ violates left-to-right stack order — operators apply to the *accumulated* left value.
:::

::: quiz Q3: Foundational Concept
Why does postfix need no brackets or precedence rules?
(A) It uses more memory
(*B) Operator position encodes grouping — each operator follows exactly the operands it combines, so evaluation order is unambiguous
(C) Stacks add brackets invisibly
(D) Postfix only handles $+$
::: explanation
Infix $3+4\times2$ is ambiguous without rules; postfix $342\times+$ fixes evaluation as $3+(4\times2)$ structurally. Position replaces punctuation — the machine reads grouping off the token stream.
:::
