# Decision Tables, Random & Domain Testing

**Business-rule grids, luck-harnessing, and spec-domain sweeps — functional black-box depth.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Rulebook Grids + Dice Audits
**Decision tables** grid tangled if-then business rules (conditions × actions — every combo ruled, contradictions/overlaps *visible* as table smells!). **Random testing** rolls dice (cheap volume! finds *weird* corners humans skip — profiled-random beats uniform where usage skews!). **Domain/functional testing** (M2 reunion formalised!) sweeps spec domains systematically (boundaries + classes + combinations!). Grids for logic-knots, dice for corners, domains for diligence.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Table mechanics + random profiles + domain sweeps

* Tables: condition stub/entries, action stub/entries (limited-entry booleans!); collapse impossible combos (don't-care analysis!); completeness (all combos ruled!) + consistency (no contradictions!) audits.
* Random: uniform vs operational-profile (usage-weighted!); oracle problem bites (metamorphic/differential/crash-only oracles!); seed discipline (reproduce failures!).
* Domain: M2.2/M4.1 reunion applied functionally (system-level boundaries: quotas/limits/pagination edges!).

::: callout-formula KTU Formula Vault: Functional Depth
Tables **rule combos** · dice **profiled** · domains **swept** · oracles **solved-first**.
:::

::: callout-pitfall Table-Explosion Worship (Unreadable Grids!)
$2^n$ condition combos explode (narrow via don't-cares, decision *trees* for sparse logic!). Table-vs-tree choice by density (dense-combos table, sparse tree!) — representation matched to logic shape.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Discount: (member? senior? coupon?) → $0/5/10/15\%$ rules (senior+member stacks, coupon needs member!). (a) Table sketch + contradiction hunt? (b) Random age-sweep oracle? (c) Domain edges?"
:::

::: step [Step 2: Execution] Grid, Dice, Fences
1. (a) $2^3=8$ combos → collapse (coupon-without-member impossible → don't-care/prune!); rules per row (stack math explicit!); scan for overlaps (same combo two discounts = contradiction smell!).
2. (b) Metamorphic oracle (monotonicity: senior never pays *more*!; idempotence on recompute!) — property-checks beat exact-oracles here.
3. (c) Age $17/18/65$-ish senior line + coupon-code format edges + quantity $0/1$ fences (M4.1 sextuplets imported!).
:::

::: step [Step 3: Conclusion] Final Result
Collapse-pruned tables, property-oracles for dice, imported fences. Combination-discipline (prune impossible, oracle the rest!) keeps functional suites sharp, not sprawling.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Don't-care pruning in decision tables risks:
(A) Nothing ever
(*B) Hiding real combos (pruned-as-impossible that *occur* via races/errors! — impossibility needs proof (invariants!), not hope; pruned rows get revisit triggers on spec change!)
(C) Slower reviews
(D) Bigger tables
::: explanation
Pruning asserts impossibility (strong claim!) — evidence-backed (invariant proof!) + revisit-hooked (spec-change re-audit!). Hope-pruning buries live combos — proof-or-unpruned discipline.
:::

::: quiz Q2: Foundational Concept
Operational-profile random testing beats uniform when:
(A) Always, profiles cost nothing (profiling *is* work!)
(*B) Usage skews hard (hot paths deserve dice-share!; uniform wastes rolls on dead features while starving the money path!) — profile fidelity decides (stale profiles mislead — refresh cadence!)
(C) Never, uniform is pure
(D) Only for UIs
::: explanation
Dice-budget allocation (rolls ∝ usage × criticality!) maximises field-failure discovery per roll. Profile freshness (telemetry-fed updates!) keeps allocation honest — stale profiles dice yesterday's product.
:::

::: quiz Q3: Foundational Concept
Metamorphic oracles (relations over outputs) rescue random testing from:
(A) Slow execution
(*B) Oracle absence (no expected values for random inputs! — relations: sortedness preserved, $f(kx)=k f(x)$ scaling, round-trip identities! — properties assertable without oracles!)
(C) Flaky networks
(D) Small inputs
::: explanation
Property-instead-of-value checking (relations across runs!) unlocks random volume (millions of property-checks, zero hand-oracles!). Relation inventory per domain (which invariants hold?!) is the design work — properties first, dice second.
:::
