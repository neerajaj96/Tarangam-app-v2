---
id: m4_08_m4_mixed_drill
courseCode: PCCST601
module: 4
sequence: 8
title: 'M4 Drill: Shapes & Optimizations End to End'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Thread tickets through numbering, shapes and placements
  - Audit every transform with permit, site and scope verdicts
  - Lay out code after selecting and ordering exactly
concepts:
  - end-to-end pipeline
  - transform audits
prerequisites:
  - m4_01_codegen_arithmetic
  - m4_04_optimization_opportunities_scope
  - m4_05_local_lvn_balancing
  - m4_07_global_live_placement
examRelevance: high
tags:
  - code-generation
  - m4-drill
---
# M4 Drill: Shapes & Optimizations End to End

**Tickets to placements — number, thread, lay out, then permit-site-scope every transform.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Closing Checklist
Shape (number/order/thread/layout) → scope-scan (local/regional/global opportunities) → triple-tag (permit/site/scope) → audit (semantics preserved?). Checklist order is exam order — shape questions first, optimisation verdicts last.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Checklist kit

Sethi-Ullman (tie→$+1$, hungry-first) · exits-not-values (booleans) · labels+backpatch (control) · args→call→frame→ret (calls) · LVN hit/copy/kill · unroll factor+remainder · LiveIn equations · permit-before-profit.

::: callout-formula KTU Formula Vault: M4 Checklist
Number → thread → lay out → **permit/site/scope** → audit.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs a code-shape emission (arithmetic/boolean/control) with an optimisation trace (LVN table or liveness fixpoint) — shape mechanics plus triple-tagged verdicts, both shown stepwise.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Sethi-Ullman need for $(a+b)*(c+d)$ (done in M4.1 — recall)? (b) LVN verdict on $p=q+r$; $s=q+r$ same block? (c) Scope-tag loop unrolling?
:::

::: step [Step 2: Execution] Recall, Stamp, Tag
1. $3$ registers (tie-propagation both levels).
2. Second is a copy ($s$ = first temp) — same stamps, no kill between.
3. Regional (loop scope); permit: trip-count/exit guards; profit: branch-vs-bloat ledger.
:::

::: step [Step 3: Conclusion] Final Result
Recall chains modules (reuse M4.1's number!), stamps decide copies, tags frame unrolling. Cross-topic recall is the drill's exam simulation — answers cite earlier topics by name.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$(a*b)+(c*d)$ peak registers (leaves $1$)?
(A) $2$
(*B) $3$ — each product ties $1,1\to2$; root ties $2,2\to3$; either side first
(C) $4$
(D) $1$
::: explanation
Tie-propagation at both levels ($+1$ each tie). Balanced trees of $+$/$*$ heap ties upward — recognise balanced-shape ⇒ depth-driven need without recomputing.
:::

::: quiz Q2: Mixed Drill
$x = a+b$; $a = 2$; $y = a+b$ (one block). LVN actions?
(A) Both compute independently
(*B) First computes (stamp #1); kill on $a=2$; second misses (fresh stamps) → computes — kill between denies the copy
(C) Second copies first
(D) Both deleted as dead
::: explanation
Kill discipline in action: redefinition severs value identity. Copy-verdicts always ask "any kill between?" first — the one-word audit before stamping.
:::

::: quiz Q3: Mixed Drill
Hoisting $d*e$ out of a loop running $\ge1$ times, $d,e$ loop-fixed. Permit?
(A) Denied always
(*B) Granted — executes at least as often outside (exactly the needed computation, no speculation past exits since the loop runs); profit: $(n-1)$ saved evaluations
(C) Granted only if $n$ known
(D) Denied for floats
::: explanation
Runs-$\ge$-once + fixed operands = safe hoist (no new paths execute it). Profit scales with trip count; unknown-$n$ still permits (guard: entry dominates — loop entered ⇒ executes). Permit reasoning cites paths, not counts.
:::
