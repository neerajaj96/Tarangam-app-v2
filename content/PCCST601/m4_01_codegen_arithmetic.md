---
id: m4_01_codegen_arithmetic
courseCode: PCCST601
module: 4
sequence: 1
title: 'Code Shape: Arithmetic Operators'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Tile TAC tickets with machine instruction patterns
  - Number Sethi-Ullman needs with tie-plus-one rules
  - Order hungry subtrees first against spill overflow
concepts:
  - instruction selection
  - Sethi-Ullman numbering
  - register spills
prerequisites:
  - m3_07_linear_ir_tac
examRelevance: high
tags:
  - code-generation
  - instruction-selection
---
# Code Shape: Arithmetic Operators

**From TAC tickets to machine sips — instruction selection, Sethi-Ullman numbering, and evaluation-order pressure.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Bar Workspace
Evaluating $a+b*c$ needs counter space (registers): compute $b*c$ into one slot, hold $a$ in another, add. **Sethi-Ullman numbers** label each subtree with its slot-need (leaves $1$; equal-need children cost $+1$); evaluate the hungrier side first to minimise peak slots. Code shape = tickets mapped onto the machine's counter layout with minimal spillage (spills = slow memory trips).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Selection and Sethi-Ullman

Tile TAC with target patterns (load/op/store, immediates, addressing modes); Sethi-Ullman: $need(leaf)=1$; $need(op)= \max(l,r)$ if $l\ne r$ else $l+1$; evaluate max-need child first. Register pressure beyond supply ⇒ spill code (stores/reloads).

::: callout-formula KTU Formula Vault: Arithmetic Shape
Tile **patterns** · need: **$\max$ or $+1$ on tie** · hungry-first order · overflow = **spills**.
:::

::: callout-pitfall The $+1$ Only on Ties
Unequal children reuse the smaller side's registers inside the bigger evaluation ($\max$ suffices); ties collide (both need $l$ simultaneously → $l+1$). Blanket $+1$ overestimates pressure and mispicks order — tie-check first.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Number $(a+b)*(c+d)$ (leaves need $1$) and give evaluation order + peak registers. Then $(a*b)+(c*d)$.
:::

::: step [Step 2: Execution] Label and Order
1. Each $+$: children $1,1$ tie → $2$. Root $\times$: children $2,2$ tie → $3$. Order: either side first (tie); peak $3$ registers.
2. Same shape: $3$ registers; evaluate left product first (arbitrary on ties — state the arbitrariness).
:::

::: step [Step 3: Conclusion] Final Result
Ties propagate $+1$ upward; order matters only across unequal needs. Number-then-order is the two-line Sethi-Ullman answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Sethi-Ullman number of $x+(y+z)$ (leaves $1$)?
(A) $3$
(*B) $y+z$: tie $1,1\to2$; root: children $1,2$ unequal → $\max = 2$. Order: right (hungrier) first; peak $2$.
(C) $1$
(D) $4$
::: explanation
Inner tie makes $2$; root's $1$-vs-$2$ reuses (evaluate $y+z$ into a slot, hold $x$ alongside — peak $2$). Right-first order is mandatory here (wrong order peaks $3$ with naive spilling) — order *is* the optimisation.
:::

::: quiz Q2: Foundational Concept
What is spill code and when does it appear?
(A) Deleted code
(*B) Store/reload traffic when live values exceed registers — the allocator parks values to memory and refetches; pressure beyond supply forces it
(C) Optimizer output
(D) Scanner tables
::: explanation
Registers are finite counters; oversubscription spills. Fewer live ranges (better ordering, coalescing) dodge spills — pressure arithmetic upstream decides spill cost downstream.
:::

::: quiz Q3: Foundational Concept
Instruction selection by tiling means:
(A) Random instruction choice
(*B) Covering IR patterns with target instruction patterns (maximal munch over trees, cost-driven) — tiles dictate loads/ops/stores emitted
(C) Deleting IR
(D) Manual assembly
::: explanation
Pattern catalogs (load-induction, op-immediates, addressing modes) compete to cover each subtree; cheapest cover wins. Tiling quality sets code size/speed before allocation even starts.
:::
