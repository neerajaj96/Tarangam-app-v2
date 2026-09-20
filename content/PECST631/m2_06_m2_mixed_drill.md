---
id: m2_06_m2_mixed_drill
courseCode: PECST631
module: 2
sequence: 6
title: 'M2 Drill: Unit Rigor at Pace'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Sprint branches, journeys, kills, fixtures and curation
  - Keep unit rigor straight under sprint-sheet pressure
  - Curate AI drafts instead of trusting them blindly
concepts:
  - unit rigor sprint
  - AI curation
prerequisites:
  - m2_01_unit_static_dynamic_control
  - m2_02_dataflow_domain
  - m2_03_mutation_operators_score
  - m2_04_junit_automation
  - m2_05_ai_testing_tools
examRelevance: high
tags:
  - unit-testing
  - m2-drill
---
# M2 Drill: Unit Rigor at Pace

**Branches, pairs, mutants, fixtures — unit-level mastery sprint.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Bench Sprint
Branch-combos → du-pairs → mutant-kills → fixture-hygiene → AI-gated drafts. Bench stations in testing order (code → data → strength → harness → copilots!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sprint sheet

Outcomes-per-branch · def→use journeys · kill/(total−equiv) · fresh-fixtures · curated-AI.

::: callout-formula KTU Formula Vault: Sprint
Branches → journeys → kills → fixtures → curate.
:::

::: callout-exam KTU Exam Focus
M2's 9-markers stage mutation analysis (operators→score→triage!) or data-flow/unit design (pairs + boundary cases!) with JUnit sketching. Kill-tables and pair-lists as evidence formats — enumerate, don't narrate vaguely.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"`max3(a,b,c)` nested-if version: (a) branch cases minimal? (b) du-pair for `m` (result var)? (c) Mutant `<`→`<=` (first compare): killed by which case? Score given $4$ mutants, $1$ equivalent?"
:::

::: step [Step 2: Execution] Sprint Answers
1. (a) $6$ orderings (permutations decide paths!) + equality edges ($2$-$3$ cases: ties!) — branch outcomes need permutations *and* ties.
2. (b) Defs per assignment-branch, uses at return: pairs per def→return (untaken-branch defs pair via their paths — enumerate all!).
3. (c) Equality-input kills (`2,2,1`-style ties distinguish `<`/`<=`!); score $=(4-1$ equiv$)=3$ denom; killed $2$ (say!) → $67\%$ + missing-test prescription for survivor!
:::

::: step [Step 3: Conclusion] Final Result
Permutation-cases, pair-enumeration, kill-prescription — sprint completeness per station. Tie-inputs (equality edges!) recur as the boundary weapon — pack them always.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
All-branches-covered suite, all asserts `true==true`-vacuous. Verdict?
(A) Well tested (coverage!)
(*B) Coverage theater (executes all, checks nothing — mutation score ~$0\%$ exposes!; oracle strength unmeasured by coverage!) — assert power, not line visits, tests
(C) Adequate for release
(D) Better than nothing (strictly? vacuous suites *cost* maintenance while proving nil — arguably worse!)
::: explanation
Oracle-strength audit (mutation sampling!) over coverage victory laps (visits ≠ verdicts!). Vacuous-assert detection (tautology scans!) belongs in review checklists — coverage *with* teeth, always.
:::

::: quiz Q2: Mixed Drill
du-pair across loop-back (def inside, use after loop): test needs?
(A) Zero-trip only
(*B) $\ge1$-trip reaching (loop entered, def executed, exit to use!) *plus* zero-trip variant (def skipped — use-before-def anomaly probe!) — both sides of the trip-count fence!
(C) Many trips only
(D) Skip (untestable!)
::: explanation
Trip-count fencing ($0$ vs $\ge1$!) splits du-pairs crossing loops (different paths, different verdicts!). Fence-both-sides habit (zero *and* some!) generalises boundary discipline to control flow.
:::

::: quiz Q3: Mixed Drill
Mock-everything suite breaks on every refactor. Diagnosis + prescription?
(A) More mocks (isolation maximalism!)
(*B) Overspecified interactions (choreography asserted, outcomes ignored — M2.1 pitfall reunion!) → prescription: mock only unowned/volatile boundaries, assert outcomes/states, delete choreography asserts (refactor-proofing by design!)
(C) Fewer tests total
(D) Integration-only pivot (throws out unit speed! — targeted fix beats level-flight!)
::: explanation
Choreography-vs-outcome audit per mock (does this assert *behavior* or *wiring*?) with boundary-rule enforcement (unowned-only mocks!). Precision surgery (prune asserts, keep tests!) over wholesale retreats.
:::
