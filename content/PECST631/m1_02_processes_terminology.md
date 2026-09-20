---
id: m1_02_processes_terminology
courseCode: PECST631
module: 1
sequence: 2
title: 'Processes, Levels of Thinking & Terminology'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Chain faults into errors into failures with RIP conditions
  - Separate verification of specs from validation of needs
  - Climb Beizer's five maturity levels with test-case anatomy
concepts:
  - fault-error-failure chain
  - verification and validation
  - Beizer maturity levels
prerequisites:
  - m1_01_concepts_quality_failures
examRelevance: high
tags:
  - foundations
  - terminology
---
# Processes, Levels of Thinking & Terminology

**The testing vocabulary exam — V&V, fault→error→failure chain, and Beizer's five maturity levels.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Disease Progression
**Fault** (bug in code — the infection!) → **error** (wrong internal state — symptoms!) → **failure** (wrong outside behaviour — patient complains!). Not every fault errs (dormant code paths!), not every error fails (masked states!) — RIP model (Reach-Infect-Propagate: all three needed to *observe* failure!). **Verification** (building right? — spec-conformance!) vs **Validation** (building right thing? — user-needs!). **Levels of thinking** (Beizer 0–4: debugging→demonstrate→destroy→evaluate→prevent — tester maturity ladder!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Chain + V&V + Beizer + test-case anatomy

* RIP: reach fault location + infect state + propagate to output (coverage criteria approximate RIP strength!).
* V&V split (process vs product gates!).
* Beizer 0 (debug-only!) → 1 (show-it-works!) → 2 (break-it! — adversarial maturity!) → 3 (evaluate risks!) → 4 (prevent by design — testability built in!).
* Test case: ID + preconditions + inputs + expected (oracle!) + postconditions + traceability (requirement link!).

::: callout-formula KTU Formula Vault: Terms
Fault→error→**failure needs RIP** · verification **spec**, validation **needs** · Beizer **0-debug … 4-prevent**.
:::

::: callout-pitfall Error vs Failure Conflation
Wrong *internal* state (error!) ≠ wrong *observable* (failure!) — masked errors (overwritten before output!) never fail. RIP vocabulary (reached? infected? propagated?) dissects precisely — stage-named analysis.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"`if (x>0) y=x+1; else y=x-1; print(y);` with fault: `+1` should be `+2`. (a) Input reaching+infecting but *not* failing? (b) Failing input? (c) V&V labels for spec-check vs user-trial?"
:::

::: step [Step 2: Execution] RIP Walk
1. (a) $x=5$: reaches (branch taken!), infects ($y=6$ vs correct $7$ — wrong state!), propagates ($6$ printed ≠ $7$ — *fails*!). Need non-failure: impossible here (print always exposes!) — instead note: fault in *dead* branch variant would reach-never (unreached = dormant!). Revise: $x=-3$ takes else (fault unreached — dormant, no error!).
2. (b) $x=5$ fails ($6$ vs $7$!).
3. (c) Spec-conformance check = verification; user-acceptance trial = validation.
:::

::: step [Step 3: Conclusion] Final Result
Reach/infect/propagate staged per input (RIP table per test!); V&V labelled by question asked (spec? needs?). RIP-table format (input × R/I/P columns!) is the analysis deliverable.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Dormant fault (unreached code) causes:
(A) Immediate failure
(*B) Nothing observable (no reach ⇒ no infection ⇒ no failure — RIP unstarted!; coverage gaps *are* dormancy maps — untested lines harbour unknowns!)
(C) Silent corruption always
(D) Compile errors
::: explanation
RIP-gating (all three required for failure!) makes unreached faults inert *for now* (code-change/feature-flag flips can wake them!). Coverage-as-dormancy-map reading (untested = unknown, not safe!) is the mature inference.
:::

::: quiz Q2: Foundational Concept
Beizer level 2 (destroy) vs level 1 (demonstrate) test suites differ by:
(A) Size only
(*B) Intent (break-assumptions vs confirm-happy-paths!): level-2 designs adversarial inputs (boundaries, nulls, overloads — bug-hunting!); level-1 rehearses demos (confidence theater, misses edges!). Intent shapes cases, not count.
(C) Tooling brand
(D) Nothing observable
::: explanation
Mindset maturity (prove-works vs try-to-break!) determines suite teeth (happy-path parades vs edge arsenals!). Level-claims need intent-evidence (boundary/null/load cases present!) — audit suites by adversarial content.
:::

::: quiz Q3: Foundational Concept
Test oracle problem (expected-result sourcing) bites hardest for:
(A) Crashing bugs (oracle = didn't-crash, easy!)
(*B) Complex-correctness properties (scientific codes, ML outputs, compilers — right-answer unknown independently!; mitigations: metamorphic relations, differential testing, plausibility invariants!)
(C) Syntax errors
(D) Missing files
::: explanation
Expected-value sourcing (who knows truth?) limits automation (can't assert unknown!). Oracle strategies (metamorphic/differential/plausibility!) are the advanced-testing answer half — name the oracle per test, always.
:::
