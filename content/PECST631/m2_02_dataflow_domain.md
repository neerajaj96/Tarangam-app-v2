---
id: m2_02_dataflow_domain
courseCode: PECST631
module: 2
sequence: 2
title: 'Data-Flow & Domain Testing'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Test def-use pairs along values' journeys exactly
  - Probe boundaries on, off and on again for neighbourhoods
  - Preview subsumption strength against testing costs
concepts:
  - def-use pairs
  - boundary probing
  - domain testing
prerequisites:
  - m1_04_box_methods
  - m2_01_unit_static_dynamic_control
examRelevance: medium
tags:
  - dataflow-testing
  - domain-testing
---
# Data-Flow & Domain Testing

**Values' journeys and input neighbourhoods — def-use pairs and boundary-hunting.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Parcel Tracking + Fence Walking
**Data-flow testing** tracks parcels (variable *definitions* → *uses*: c-use computation, p-use predicate!) demanding journeys tested (all-defs/uses/du-paths — uninitialized reads and dead stores caught en route!). **Domain testing** walks fences (input-space borders where behaviour *switches*: off-by-one territory!) probing on/off/exactly-on each edge (plus $1\times1$ domains collapsing to points needing special handling!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 du-pairs + boundary probes + subsumption preview

* du-pair $(d,u)$ per variable (def-clear paths preferred!); criteria ladder (all-defs ⊂ all-uses ⊂ all-du-paths — strength climbs, cost climbs!; M3 subsumption formalises!).
* Domain: boundaries from specs (inequalities/equivalences!); probes on/off/on per edge (floating-point epsilon fuzz!); $1\times1$ degenerate domains (single-point universes — probe it + neighbours!).

::: callout-formula KTU Formula Vault: Journeys + Fences
du-pairs **def→use tested** · boundaries **on/off/on probed** · strength **costs**.
:::

::: callout-pitfall Def-Clear Worship (Infeasible Paths!)
du-path criteria demand *executable* paths (some pairs unreachable together — infeasible!); infeasible-pair triage (prove unreachable vs weaken criterion!) is the analysis burden. Coverage-percent honesty (feasible-denominator!) separates rigorous claims from raw ratios.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"`sum=0; for(i=0;i<n;i++) sum+=a[i]; return sum/n;` (a) du-pairs for `sum`? (b) Boundary probes for loop + division? (c) Infeasible-pair note?"
:::

::: step [Step 2: Execution] Journeys and Fences
1. (a) Defs: $d_1$ (`sum=0`), $d_2$ (`sum+=`); uses: $u_1$ (RHS read in `+=`), $u_2$ (`return`): pairs $(d_1,u_1),(d_1,u_2$ via zero-trip path!),(d_2,u_1$ loop-back!),(d_2,u_2$) — loop-back pair included!
2. (b) $n=0$ (empty + div-zero! two birds!), $n=1$ ($1\times1$-ish single!), $n=$many (typical!), float-epsilon neighbours where apt.
3. (c) $(d_1,u_2)$ needs zero-trip ($n=0$ → div-zero crash first! — pair *executable* only past the crash: infeasibility-vs-crash triage documented!).
:::

::: step [Step 3: Conclusion] Final Result
Pair enumeration (loop-backs included!), fence triples (zero/one/many!), feasibility triage (crash-gated pairs flagged!). Enumeration-plus-triage is the data-flow answer texture.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
c-use vs p-use split matters because:
(A) Academic pedantry
(*B) Different fault classes (computation-wrong vs decision-wrong!) need different oracles (value-checks vs branch-outcomes!) — pair-type routes assertion design (assert values at c-uses, outcomes at p-uses!)
(C) Tool output formats
(D) Nothing testable
::: explanation
Use-kind determines check-kind (values vs directions!) — du-testing without use-typing asserts blindly. Oracle-typed pairs (value-oracle/predicate-oracle!) complete the method.
:::

::: quiz Q2: Foundational Concept
$1\times1$ domains (single legal point) need:
(A) No testing (trivial!)
(*B) The point *plus* neighbours (off-by-one in *both* directions around the singleton! — degenerate-boundary discipline: fence exists even at a point!)
(C) Only the point
(D) Deletion from specs
::: explanation
Singleton fences (neighbours illegal both sides!) — probe triple ($p-1,p,p+1$) despite triviality. Degenerate-case diligence (points have fences too!) separates thorough from perfunctory.
:::

::: quiz Q3: Foundational Concept
Uninitialized-variable reads surface in du-testing as:
(A) Syntax errors
(*B) Use-without-def pairs (use reachable with *no* defining path — du-anomaly class alongside dead-defs!) — static du-analysis flags pre-execution (cheap!), dynamic confirms (test to reach!)
(C) Performance bugs
(D) Never detectable
::: explanation
Anomaly taxonomy (define-define? define-never-used? use-undefined?!) — static enumeration first (all pairs!), dynamic reaching second (feasible proof!). Static-dynamic pairing (list statically, prove dynamically!) is the workflow.
:::
