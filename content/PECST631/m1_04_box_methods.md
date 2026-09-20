---
id: m1_04_box_methods
courseCode: PECST631
module: 1
sequence: 4
title: 'Black, White & Grey-Box Methods'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Test specs-only, code-open and arch-informed postures
  - Stock method arsenals per knowledge posture
  - Pair postures to cover each other's blind spots
concepts:
  - black-box testing
  - white-box testing
  - grey-box testing
prerequisites: []
examRelevance: high
tags:
  - foundations
  - box-methods
---
# Black, White & Grey-Box Methods

**Three knowledge postures — specs-only, code-open, and partial-peek — with method-to-defect mapping.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Inspectors
**Black-box** (health inspector: menu + dining experience only — specs in, behaviours out, internals invisible!). **White-box** (kitchen auditor: recipes, thermometers, stations open — paths/branches/dataflows covered!). **Grey-box** (franchise consultant: dining *plus* kitchen tour *highlights* (architecture, DB schemas!) — risky-area focus with user-hat on!). Posture picks weapons (ECP/BVA vs coverage vs matrix testing!) and blinds spots (internals-blind vs spec-blind vs both-partly!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Posture map + method arsenals + blind spots

* Black: specs→cases (ECP/BVA/decision-tables/state-models — M4 arsenal!). Blind: dead code, untested paths, structural traps.
* White: code→cases (statement/branch/path/dataflow coverage — M2/M3 arsenals!). Blind: missing features (code can't show *absent* requirements!), usability.
* Grey: architecture-informed functional (matrix/regression/orthogonal arrays — M4!; pen-test with creds!). Blind: full-both-depths (neither microscope nor telescope at max!).

::: callout-formula KTU Formula Vault: Postures
Black = **specs-only** · white = **code-open** · grey = **arch-informed** · pair postures to **cover blinds**.
:::

::: callout-pitfall 100% Statement Coverage ≠ Tested (Coverage Theater!)
Executing lines (statements!) without asserting outcomes (weak oracles!) or traversing branch-combos/paths/dataflows (stronger criteria subsume!) inflates confidence falsely. Coverage-strength ladder (statement<branch<path/dataflow!) + oracle quality jointly grade suites — numbers need nouns.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Login API: (a) black-box case sketch? (b) White-box addition given code? (c) Grey-box angle with DB schema peek? Then: blind spot each leaves?"
:::

::: step [Step 2: Execution] Three Passes
1. (a) Black: valid/invalid/empty/SQLi-ish/overlong/rate-burst partitions (spec-derived, no code seen!).
2. (b) White: uncovered branches (lockout-counter edges! error paths!) + $t$-way path combos (coverage-measured!).
3. (c) Grey: schema-aware (unique-constraint races! index-miss slowdowns!) + matrix (browser×auth-method!) — arch-guided functional.
4. Blinds: black misses dead debug endpoints; white misses absent CAPTCHA requirement; grey misses deep-path combos + pure-UX issues (paired postures cover!).
:::

::: step [Step 3: Conclusion] Final Result
Posture-per-pass with distinct yields (partitions/branches/schema-angles!) plus blind-spot honesty each. Yield-distinctness proves posture understanding (same cases thrice = posture theatre!).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Grey-box's distinctive edge over black+white *combined* is:
(A) Cheaper execution always
(*B) Risk-targeted efficiency (architecture tells *where* bugs breed — changed modules, complex joins, flaky integrations — focusing functional fire for effort-per-bug economics!) — informed prioritisation, not just union coverage
(C) No code access needed at all
(D) Replaces both fully
::: explanation
Information-economics (partial internals guide functional spend!) — risk-based testing formalised (risk = probability × impact per area!). Guidance value (where to look hard!) is grey's dividend beyond mere union.
:::

::: quiz Q2: Foundational Concept
Dead code is invisible to black-box because:
(A) Testers are lazy
(*B) Specs describe *required* behaviours (dead code implements none — no spec line demands it!); only structural views (coverage deltas: executed-never lines!) or reviews expose it (white-box/reviews catch, black never can!)
(C) Dead code never runs (it *can* via hidden triggers — backdoors live here!)
(D) Compilers delete all dead code (not reliably — especially dynamic dispatches!)
::: explanation
Absence-from-spec blindness (required-behaviours-only lens!) — dead/backdoor code needs structural/review lenses (coverage + audit!). Lens-limitation reasoning (what each posture *cannot* see!) is the mature comparison axis.
:::

::: quiz Q3: Foundational Concept
Method-to-defect mapping discipline (why it matters):
(A) Academic decoration
(*B) Efficiency (right weapon per bug class: BVA↔off-by-ones, state-models↔transition bugs, coverage↔untested paths, fuzzing↔parsing faults!) — mismatched methods waste cycles proving wrong properties
(C) Tool salesmanship
(D) Certification checkbox
::: explanation
Bug-class→technique routing (off-by-one? boundaries!; crash-on-input? fuzzing!; missing-feature? spec-review!) — triage skill (symptom suggests weapon!) multiplies tester effectiveness. Routing tables beat technique salad.
:::
