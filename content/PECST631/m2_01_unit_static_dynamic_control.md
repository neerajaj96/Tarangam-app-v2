---
id: m2_01_unit_static_dynamic_control
courseCode: PECST631
module: 2
sequence: 1
title: 'Unit Testing: Static, Dynamic & Control Flow'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Read statically with reviews against running dynamically
  - Harness runs with drivers, stubs and mocks exactly
  - Drive every branch outcome on control flow honestly
concepts:
  - unit testing
  - static versus dynamic testing
  - test harnesses
prerequisites:
  - m1_03_test_types_pyramid
  - m1_04_box_methods
examRelevance: high
tags:
  - unit-testing
  - control-flow
---
# Unit Testing: Static, Dynamic & Control Flow

**Testing the smallest parts — reviews vs runs, and branch-testing that actually means it.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Part Inspection Bench
**Static** unit testing reads the part drawing (reviews/walkthroughs/inspections + static analysers — no execution, catches typos/logic-smells/standard-violations!). **Dynamic** fires the part on the bench (drivers feed inputs, stubs fake neighbours, assertions judge!). **Control-flow testing** maps the part's roads (branches!) and drives each (decision outcomes both ways — not just lines visited!). Bench + drawing + map: three lenses, one part.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Static/dynamic/control triad + harness parts

* Static: inspections (formal roles/rates!), walkthroughs, static analysis (null-deref/uninit/dataflow warnings!).
* Dynamic: drivers (callers), stubs (fake callees), mocks (expectation-verifying fakes!), fixtures (arrange!), assertions (oracle!).
* Control-flow: branch/decision coverage (every edge outcome!), basis-path sets (cyclomatic $V(G)=e-n+2p$ independent paths!), loop-boundary cases ($0,1,many$!).

::: callout-formula KTU Formula Vault: Unit Triad
Static **reads** · dynamic **runs (driver/stub/mock!)** · control-flow **drives every branch outcome**.
:::

::: callout-pitfall Mocks-Asserting-Trivia (Overspecified Tests!)
Mock-heavy tests asserting *interaction choreography* (call counts!) instead of *outcomes* freeze refactors (brittle!). Mock boundaries (unowned/volatile deps!), assert outcomes (state/returns!), not choreography — mock discipline stated.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"`discount(age, member)`: <18 → $20\%$, member → extra $5\%$, cap $25\%$. (a) Branch-coverage case set (minimal!)? (b) Driver/stub sketch (pricing DB stubbed!)? (c) One mock-discipline note?"
:::

::: step [Step 2: Execution] Branches, Harness, Restraint
1. (a) Outcomes needed: minor/non-minor × member/non-member ($4$ combos!) + cap-hit case (minor+member $=25\%$ boundary!) — $5$ cases cover all edges + cap.
2. (b) Driver loops cases (arrange-act-assert!); DB stub returns canned tiers (deterministic, fast!); no network in unit scope!
3. (c) Mock DB interface (unowned-ish boundary!), assert *prices* (outcomes!), not query choreography (refactor-proof!).
:::

::: step [Step 3: Conclusion] Final Result
Outcome-combos (branch coverage!), harness roles (driver/stub/mock placed!), outcome-assertions (not choreography!). Role-correct harness vocabulary per element is the graded precision.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Driver vs stub vs mock split by:
(A) Language used
(*B) Direction + smarts: driver *calls* the unit (test-side caller!); stub *answers* for callees (canned, dumb!); mock *verifies expectations* about interactions (smart, assertion-bearing!) — roles per test-double, never blurred
(C) Speed tiers
(D) Vendor brands
::: explanation
Call-direction (driver above, stub below!) plus assertion-home (mock holds expectations!) triangulates doubles. Role-mislabelled harnesses (mock-as-stub!) confuse reviews — vocabulary precision pays.
:::

::: quiz Q2: Foundational Concept
Cyclomatic $V(G)$ for test planning gives:
(A) Exact bug count
(*B) Independent-path *lower bound* (basis set size — minimum cases for path-adequacy *ambition*!; $e-n+2p$ computed on CFG!) — planning floor, not ceiling (data combos multiply beyond!)
(C) Maximum tests allowed
(D) Code quality score
::: explanation
Basis-count floors path coverage (fewer ⇒ under-tested *provably*!); data/state dimensions explode above it. Floor-not-ceiling reading (minimum bar!) prevents count-complacency.
:::

::: quiz Q3: Foundational Concept
Loop-boundary $0,1,many$ cases catch:
(A) Syntax errors
(*B) Off-by-ones + empty-collection crashes + single-pass quirks (fencepost class!) — boundaries harbour the classic defects (zero-trip? one-trip? typical-many?) — triple probing per loop, always
(C) Performance regressions
(D) Deadlocks only
::: explanation
Fencepost family (edges of iteration!) — $0/1/n$ probes each loop (cheap, high-yield!). Boundary-triple habit (every loop, three cases!) is the unit-tester reflex.
:::
