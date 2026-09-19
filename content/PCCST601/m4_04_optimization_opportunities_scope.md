---
id: m4_04_optimization_opportunities_scope
courseCode: PCCST601
module: 4
sequence: 4
title: 'Optimization: Opportunities & Scope'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Permit transforms with safety before budgeting profitability
  - Site every opportunity before choosing its scope rung
  - Climb the local, regional and global jurisdiction ladder
concepts:
  - safety versus profitability
  - optimization scope
  - opportunity siting
prerequisites: []
examRelevance: medium
tags:
  - optimization
  - scope-ladder
---
# Optimization: Opportunities & Scope

**What "better" means — safety vs profitability, and the local/regional/global jurisdiction map.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Renovation Permits
**Safety** (permit): transform only if *every* execution behaves identically (observable semantics preserved). **Profitability** (budget): transform only if it *pays* (speed/size tradeoff weighed — unrolling bloats for speed). **Opportunity** (site): the pattern must *exist* (redundancy, deadness, constants). **Scope** (jurisdiction): peephole (sliding window), block (straight-line), region (extended blocks/loops), function/global (whole CFG). No permit, no renovation — however tempting.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Opportunity catalogue (syllabus-flavoured)

Redundant computations (CSE/value numbering) · dead/unreachable code · constant folding/propagation · strength reduction ($x*2\to x+x$/shift) · copy propagation · loop invariants/hoisting · induction variables · inlining/unrolling tradeoffs.

### 2.2 Scope ladder (each rung sees more, costs more)

Peephole → local (basic block) → superlocal/regional (extended blocks, loops) → global (whole function/CFG, data-flow analyses). Syllabus maps: LVN + tree-height (local), superlocal VN + unrolling (regional), live-sets + placement (global).

::: callout-formula KTU Formula Vault: Opt Frame
Permit **safety** · budget **profitability** · site **opportunity** · jurisdiction **scope ladder**.
:::

::: callout-pitfall Unsafe "Optimisations" Are Bugs
Reordering across a may-alias store, deleting "dead" volatile I/O, hoisting past a guard — each violates safety while looking profitable. Safety proofs (alias info, volatility, guards) precede every transform — permit first, profit second.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Classify + scope each: (a) $x = 2*3 \to x = 6$, (b) $a+b$ computed twice in one block, second reuse, (c) loop-invariant $c = d*e$ inside a loop, (d) branch never taken (condition fixed false).
:::

::: step [Step 2: Execution] Permit, Site, Jurisdiction
1. (a) Constant folding — local (peephole even), always safe.
2. (b) Local CSE/value-numbering (next topic's LVN demo).
3. (c) Hoist above loop (regional/loop scope; guard: executes ≥ as often — safe if loop runs ≥ once or speculative-safe).
4. (d) Unreachable/dead elimination (global/CFG reachability).
:::

::: step [Step 3: Conclusion] Final Result
Name (opportunity), place (scope), check (safety caveat) — the triple tags every optimisation answer completely.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Safety vs profitability in optimisation — who wins conflicts?
(A) Profitability — speed first
(*B) Safety vetoes: transforms must preserve observable semantics on all paths; among safe options, profitability picks (speed/size heuristics)
(C) Neither matters
(D) Scope decides alone
::: explanation
Wrong-but-fast is miscompilation — permits gate everything. Profitability then ranks legal moves (unroll $4\times$? inline this call?) by cost models. Veto-then-rank is the decision order.
:::

::: quiz Q2: Foundational Concept
$x*2 \to x<<1$ (strength reduction) is safe when?
(A) Always, for all $x$
(*B) For integer arithmetic (exact); floating-point risks rounding/overflow-behaviour shifts (strict-FP modes forbid) — type/domain gate the rewrite
(C) Never
(D) Only at -O0
::: explanation
Integers: identical bits, pure win. Floats: associativity/rounding latitude differs — fast-math flags license it, strict modes don't. Domain-gated rewrites are the safety fine print.
:::

::: quiz Q3: Foundational Concept
Local vs regional vs global scope differ by:
(A) Speed of compiler
(*B) Code region analysed together: single block (local) → extended blocks/loops (regional) → whole CFG/function (global, data-flow) — wider sight, deeper analysis cost, bigger wins
(C) Language parsed
(D) Nothing practical
::: explanation
Sight sets opportunity: cross-block redundancy needs regional/global eyes. Syllabus pins techniques to rungs (LVN-local, unrolling-regional, live-global) — rung-technique pairing is the map to memorise.
:::
