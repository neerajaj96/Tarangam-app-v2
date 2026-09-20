---
id: m2_04_junit_automation
courseCode: PECST631
module: 2
sequence: 4
title: 'JUnit Framework & Test Automation'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Refresh fixtures per test with expected-first assertions
  - Gate continuous integration with test runners
  - Scale with valid-object builders and automation patterns
concepts:
  - JUnit lifecycle
  - assertions craft
  - automation patterns
prerequisites:
  - m1_05_automation_ai_trends
  - m2_01_unit_static_dynamic_control
examRelevance: high
tags:
  - junit
  - automation
---
# JUnit Framework & Test Automation

**The xUnit workhorse — lifecycle, assertions, runners, and the automation patterns that scale.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Assembly-Line QC Station
**Fixtures** (`@BeforeEach` sets the jig — fresh parts per test, no cross-contamination!). **Tests** (`@Test` methods: arrange-act-assert beats!). **Assertions** (gauges: `assertEquals` expected-first ordering! — expected-vs-actual readability!). **Runners** (conveyor: suites, filtering, reports!). **Mockito-flavours** (simulate suppliers!). **Parameterized** (one jig, many parts: `@CsvSource` tables!). Line stops on red (CI gates!) — green means *shipped*, not *perfect* (oracle/scope limits ride along!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Lifecycle + assertion craft + automation patterns

* Lifecycle: `@BeforeAll` (once, static!) → per-test `@BeforeEach` → `@Test` → `@AfterEach` → `@AfterAll` (order guarantees + isolation rationale!).
* Assertions: expected-first arg order, message-first overloads (failure readability!), `assertThrows` (exception contracts!), timeout assertions (performance tripwires!).
* Patterns: Page-Object (M1 reunion!) for UI suites, test-data builders (valid-object factories!), parallel runners (time-split!), flaky-quarantine (M1 reunion!).

::: callout-formula KTU Formula Vault: xUnit
Fixture **fresh-per-test** · asserts **expected-first** · runners **gate CI** · builders **valid-objects-fast**.
:::

::: callout-pitfall Shared Mutable Fixtures (Order-Dependent Suites!)
`@BeforeAll`-mutated state leaking across tests (pass-alone-fail-together titled suites!) — fresh-per-test (`@BeforeEach` rebuild!) or immutable sharing only. Isolation-first fixture design (independence provable by shuffle-runs!) is the hygiene rule.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Write the JUnit skeleton for `discount(age,member)` (M2.1 cases!) with fixtures, parameterized boundaries, and an exception test for negative age. Then: CI gate line?"
:::

::: step [Step 2: Execution] Skeleton + Gate
1. `@BeforeEach` fresh calculator; `@ParameterizedTest @ValueSource`/`@CsvSource` (ages $17,18,65$ + member flags — M2.1 branch set encoded!); `assertEquals(0.20, d(16,false), 0.001)` (expected-first, delta for floats!); `assertThrows(IllegalArgumentException.class, ()->d(-1,false))` (contract!).
2. CI: `mvn test` gate (red blocks merge!; surefire reports archived; flaky-quarantine lane referenced!).
:::

::: step [Step 3: Conclusion] Final Result
Fixture-per-test, parameterized boundaries (M2.1 reuse!), exception contract, CI gate. Reuse-across-topics (M2.1 cases → JUnit rows!) shows integrated fluency examiners reward.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
`assertEquals(expected, actual)` order matters for:
(A) Compilation
(*B) Failure readability (messages read "expected X but was Y" — swapped args invert diagnostics, debugging tax on every red!; plus float-delta overload position!)
(C) Execution speed
(D) Nothing, cosmetic
::: explanation
Diagnostics ergonomics (red-messages guide fixes!) — argument-order discipline (expected-first always!) pays per failure read. Convention-as-debugging-aid (cheap compliance, repeated dividends!).
:::

::: quiz Q2: Foundational Concept
`@BeforeEach` vs `@BeforeAll` split by:
(A) Naming taste
(*B) Freshness-vs-cost (per-test rebuild: isolation!; once-per-class: expensive shared setup — DB containers, servers!; shared-mutable danger fenced by immutability/read-only use!)
(C) Speed always favours All
(D) JUnit version quirks
::: explanation
Isolation-cost tradeoff (freshness priced per test!; shared setup amortised with contamination risk!). Immutable-shared + mutable-fresh rule of thumb (share constants, rebuild state!) decides per fixture.
:::

::: quiz Q3: Foundational Concept
Parameterized tests beat copy-paste cases by:
(A) Fewer keystrokes only
(*B) Case-as-data (tables reviewed/extended without code edits!; boundary sweeps encoded compactly!; named cases via `@DisplayName`/descriptions keep failures legible!) — data-driven maintenance economics
(C) Faster execution
(D) Better coverage automatically (same assertions! — coverage unchanged, maintainability transformed!)
::: explanation
Maintenance surface (edit rows, not methods!) + legibility (named rows!) — economics, not coverage (assertions identical!). Data-driven shape (tables!) is the review-friendly form.
:::
