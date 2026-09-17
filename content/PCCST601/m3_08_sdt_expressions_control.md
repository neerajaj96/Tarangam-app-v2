# Syntax-Directed Translation: Expressions & Control Flow

**Meaning during parsing — synthesized vs inherited attributes, expression SDT, and backpatching control flow.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Price Tags Up, Shopping Lists Down
**Synthesized** attributes bubble up (a node's value from its children — YACC `$$=$1+$3` style, bottom-up friendly). **Inherited** flow down/sideways (declarations informing uses, L-attributed — top-down friendly). **Control flow** translation can't know jump targets until labels exist, so it emits jumps with *blank destinations* and **backpatches** (fills addresses) once labels land — IOUs honoured at block ends.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Attribute kinds and SDT for expressions

S-attributed (synthesized only — LR-evaluable on the fly); L-attributed (adds left-to-right inherited — LL/top-down friendly). Expression SDT: $E\to E_1+T$ emits $E.addr = newtemp()$, `E.addr = E_1.addr + T.addr`-style TAC with type coercions inserted (int→float widening).

### 2.2 Control-flow SDT and backpatching

Boolean/relational ops → conditional jumps with placeholder targets; statement lists maintain next-lists; `makelist/merge/backpatch` manage IOU lists; labels emitted at block starts/loop heads. `if`, `while`, `for`, `case` each get a list-plumbing pattern (syllabus: conditionals, loops/iteration, case statements).

::: callout-formula KTU Formula Vault: SDT
Synthesized **up**, inherited **down/sideways** · S-attributed = **LR-ready** · jumps **placeholder-first, backpatch-later**.
:::

::: callout-pitfall S-Attributed Can't Do Declarations Justice
Symbol types flow *down* into expressions (inherited context) — pure bottom-up synthesis lacks the channel. L-attributed/top-down (or multi-pass) carries declarations; S-only evaluation stalls at scoping — attribute direction must match information flow.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
SDT-translate `x = a+b*c` (float $x$, int $a,b,c$) to TAC with coercions, then sketch `if (a<b) x=1 else x=2` jump layout with backpatch points.
:::

::: step [Step 2: Execution] Coerce, Ticket, Patch
1. $t_1 = b*c$ (int); $t_2 = a+t_1$ (int); $t_3 = (float)t_2$ (widen!); $x = t_3$. Coercion ticket explicit — silent int-store would truncate.
2. `ifFalse a<b goto L_else(__)`; `x=1; goto L_end(__)`; `L_else: x=2`; `L_end:` — blanks filled when labels emit (backpatch lists merged at joins).
:::

::: step [Step 3: Conclusion] Final Result
Coercion tickets, temp-per-op, IOU jumps + patch points — the SDT answer shows *both* the code and the pending lists. Pending-list notation is the graded formalism.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Synthesized vs inherited attributes — direction and evaluator fit?
(A) Both flow up
(*B) Synthesized up from children (LR/bottom-up natural); inherited down/sideways from context (LL/top-down natural, L-attributed discipline)
(C) Both flow down
(D) Direction is irrelevant
::: explanation
Information flow dictates evaluation order: bottom-up builds children first (synthesis ready); top-down visits parents first (inheritance ready). Direction-method pairing is the SDT design rule.
:::

::: quiz Q2: Foundational Concept
Why backpatch instead of two passes?
(A) Laziness
(*B) Single-pass translation can't know forward jump targets (labels not yet emitted) — placeholders + pending lists defer binding exactly until definition, no re-scan needed
(C) Two passes are illegal
(D) Placeholders run faster
::: explanation
Forward references (if-else joins, loop exits) outrun single-pass knowledge; IOU lists bridge the gap. Backpatching *is* one-pass forward-reference resolution — name the problem it dissolves.
:::

::: quiz Q3: Foundational Concept
Where do int→float coercions surface in SDT output?
(A) Nowhere, hardware handles it
(*B) Explicit conversion tickets (`t = (float)i`) inserted at mixed-type operators/assignments — silent truncation is a bug, so SDT materialises the widening
(C) In the scanner
(D) After register allocation
::: explanation
Type rules execute as code: mixed arithmetic widens (int→float) via emitted conversions. Explicit-ticket discipline makes typing *visible* in IR — check mixed expressions for missing conversions first.
:::
