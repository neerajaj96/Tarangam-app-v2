---
id: m3_02_dataflow_subsumption
courseCode: PECST631
module: 3
sequence: 2
title: 'Data-Flow Criteria & Subsumption'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Order all-defs, all-uses and all-du-paths by strength
  - Prove subsumption with touring arguments exactly
  - Triage infeasible requirements honestly instead of faking
concepts:
  - coverage subsumption
  - du-path criteria
  - infeasible requirements
prerequisites:
  - m2_02_dataflow_domain
  - m3_01_graph_coverage_prime_paths
examRelevance: high
tags:
  - white-box
  - subsumption
---
# Data-Flow Criteria & Subsumption

**du-path strength ladder — all-defs/uses/paths ordered, subsumption proved, infeasibility triaged.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Delivery Guarantees Tiers
**All-defs** (every warehouse ships *something*!). **All-uses** (every warehouse→customer *route* driven!). **All-du-paths** (every *distinct road* per route — scenic variants included!). Subsumption (stronger tier's tours *satisfy* weaker — paths ⇒ uses ⇒ defs, free!). **Infeasible** pairs (roads that don't exist — dead-code fantasies!) excluded honestly (feasible-denominator scoring!). M2's journeys formalised into a strength lattice with receipts.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Criteria + subsumption relations + infeasibility handling

* all-nodes/edges (graph base!) → all-defs → all-uses (c-uses + p-uses!) → all-du-paths (prime-ish pathing per pair!) — chain with proofs (tour of stronger covers weaker's requirements — constructive argument per link!).
* Infeasible du-paths (defensive code, correlated branches!) — static detection attempts (undecidable generally!) + feasible-only scoring (honest denominator!) + documented waivers.

::: callout-formula KTU Formula Vault: du Ladder
defs ⊂ uses ⊂ du-paths · infeasible **excluded-honestly** · tours **prove subsumption**.
:::

::: callout-pitfall All-Uses-Claimed via All-Defs Tours (Under-testing!)
Defs-tours may skip *uses* (warehouse ships nowhere tested — stocked shelves, zero deliveries audited!). Requirement-kind matching (tour kind vs claimed criterion!) audited per claim — claim only toured kinds.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"`x=read(); if(x>0) y=x*2; else y=x; print(y);` (a) du-pairs for `x`? (b) all-uses tour set (minimal)? (c) all-du-paths extra beyond uses? (d) Infeasible candidate?"
:::

::: step [Step 2: Execution] Pairs, Tours, Extras, Honesty
1. (a) Def $d$ (read!); c-uses ($x>0$ predicate? p-use!; `x*2` c-use!); pairs: $(d,p_{>0})$, $(d,c_{*2})$, $(d,c_{print?})$ — $y$-print uses $y$ not $x$ (variable-scoped pairing!).
2. (b) $x=5$ (true-branch: p + c-use!) + $x=-2$ (false-branch: p-use!) — two tests tour all (c-use in true arm covered!).
3. (c) du-paths: same here (linear arms, single roads per pair — no scenic variants!; loops would multiply!).
4. (d) None infeasible (both arms live!) — state the negative finding (triage complete, nothing waived!).
:::

::: step [Step 3: Conclusion] Final Result
Variable-scoped pairs, outcome-split tours, scenic-variant check, negative-triage stated. Negative findings (no infeasibles!) reported, not omitted — completeness signals.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
All-du-paths over all-uses adds coverage exactly when:
(A) Always more tests (count ≠ strength necessarily!)
(*B) Multiple *distinct* def-clear roads serve one pair (branchy middles! loop laps!) — single-road pairs gain nothing (same tour suffices!); road-multiplicity conditions the upgrade
(C) Never usefully
(D) Variables rename
::: explanation
Road-count per pair decides (one road: uses-suffice!; many: paths-add!). Conditional strengthening (upgrade where multiplicity lives!) prices criteria per code shape — blanket-maximum wastes.
:::

::: quiz Q2: Foundational Concept
Feasible-denominator scoring (exclude infeasible from %) matters because:
(A) Percentages look better
(*B) Unreachable requirements would cap honest suites below $100\%$ forever (ceiling artefacts!) — feasible-only denominators measure *attainable* diligence (waivers documented per exclusion!)
(C) Math elegance
(D) Tool defaults
::: explanation
Denominator honesty (attainable-max!) — infeasible-included scores punish diligence impossibly. Waiver documentation (proved-infeasible list!) accompanies honest percentages — receipts for exclusions.
:::

::: quiz Q3: Foundational Concept
p-uses need both outcomes toured (vs c-uses needing computation) since:
(A) Predicates are harder to spell
(*B) Decision *directions* encode logic (true/false arms = distinct behaviours!) — untested direction = untested behaviour (branch-half blindness!); c-uses need value-oracles instead (computed-right checks!)
(C) Tools demand it
(D) Tradition of two tests
::: explanation
Direction-vs-value oracle split (outcomes vs computations!) routes assertions (branch taken? vs value right?). Use-kind-typed oracles (M2 reunion!) complete du-testing rigour.
:::
