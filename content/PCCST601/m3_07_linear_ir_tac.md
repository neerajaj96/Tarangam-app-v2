# Linear IRs: Stack Code, TAC & Representation

**Flat instruction streams — postfix machines, quadruples, and how linear code is actually stored.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Assembly Line Tickets
**Stack-machine code** runs a push-down cafeteria line (push operands, operators consume tops — no names needed). **Three-address code** issues numbered work tickets ($t_1, t_2\ldots$): each ticket does *one* operation on *at most two* named ingredients. Tickets file neatly (quadruples), reorder safely, and translate to any machine — the back end's favourite paperwork.
:::

::: anim tac-gen One Operator Per Ticket
Multiply into t1 first, add into t2 after — precedence becomes ticket order, temporaries name every intermediate.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Stack code and TAC forms

* Stack: `push a; push b; push c; mul; add` — postfix linearised, zero addresses.
* TAC: `t1 = b*c; t2 = a+t1` — ≤3 addresses/instruction. Forms: **quadruples** (op, arg1, arg2, result), **triples** (result by position — moving code renumbers!), **indirect triples** (pointer list fixes that), SSA flavour (each name assigned once — optimizer-grade).

### 2.2 Representing linear codes

Sequential arrays/records of quads with leader-marked basic blocks; labels/gotos for control; symbol-table links for names. ledgers support insertion (optimisation rewrites) and traversal (emission).

::: callout-formula KTU Formula Vault: Linear IR
Stack = **postfix, nameless** · TAC = **one op, ≤3 addresses** · quads **explicit result** · triples **positional** · SSA **single-assignment**.
:::

::: callout-pitfall Triples Break Under Code Motion
Triple results are *positions* — inserting/deleting instructions renumbers downstream references. Optimising triple code needs indirect triples (or quads); direct triples are read-mostly. Representation constrains transformation — match them.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Emit stack code, quadruples, and triples for `a+b*c`. Then state what breaks if an optimizer inserts an instruction into the triples.
:::

::: step [Step 2: Execution] Three Emissions
1. Stack: `push a, push b, push c, mul, add`.
2. Quads: $(*,b,c,t_1)$, $(+,a,t_1,t_2)$.
3. Triples: $(0)(*,b,c)$, $(1)(+,a,(0))$ — result $(0)$ referenced positionally.
4. Insertion before $(0)$ shifts numbering: reference $(0)$ now mispoints — indirect triples (pointer layer) or quads survive; direct triples corrupt.
:::

::: step [Step 3: Conclusion] Final Result
Same expression, three paperwork styles; fragility analysis picks the survivor. "Which representation for an optimising compiler" answers: quads/SSA (or indirect triples), with the triple-renumbering reason.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Quadruples vs triples — the operational difference?
(A) Speed of emission
(*B) Quadruples name results explicitly ($t_i$); triples address results by instruction position — explicit names survive insertion, positions don't
(C) Triples hold more operands
(D) Quads can't branch
::: explanation
Naming vs numbering is a robustness bargain: quads pay a field per instruction for rewrite-freedom; triples save space but freeze layout. Optimising compilers buy the freedom.
:::

::: quiz Q2: Numerical Drill
Stack-code depth (max stack) evaluating `a b + c d + *` (i.e. $(a+b)(c+d)$)?
(A) $5$
(*B) $3$ — push,push,add(2→1: depth back to 1… trace: a(1),b(2),+(1),c(2),d(3),+(2),*(1): peak $3$
(C) $2$
(D) $7$
::: explanation
Peak simultaneous residents $= 3$ (at `d` push). Depth analysis sizes the runtime stack — trace pushes/pops, record the max, never eyeball.
:::

::: quiz Q3: Foundational Concept
Why is TAC (not AST) the optimizer's usual input?
(A) TACs are prettier
(*B) Flat uniform instructions expose def-use chains, leaders/blocks, and flow edges directly — analyses iterate statements, not recursive tree walks
(C) ASTs lack semantics
(D) TAC executes natively
::: explanation
Optimisation is statement-level bookkeeping (who defines/uses what, where blocks split). Linear form *is* that bookkeeping laid bare — representation shaped by its heaviest consumer.
:::
