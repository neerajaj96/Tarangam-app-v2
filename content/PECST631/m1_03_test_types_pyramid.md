# Test Types: Unit to Acceptance & Beyond

**The testing pyramid of scope — unit/integration/system/acceptance plus performance/security/regression specialties.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Building Inspection Ladder
**Unit** (brick tests — single functions, mocked neighbours, dev-fast!). **Integration** (mortar tests — interfaces/contracts between units, stub/driver scaffolding!). **System** (whole-building walkthrough — end-to-end behaviours, staging environments!). **Acceptance** (buyer sign-off — UAT/business rules, contractual!). Specialists: **performance** (load/stress/spike/soak!), **security** (M3's beat!), **regression** (change-guard net — rerun on every commit!), **usability/accessibility** (human-factors audits!). Pyramid economics (many-cheap-unit, few-pricey-E2E!) governs budgets.
:::

::: anim test-pyramid Bulk at the Base
Unit base widens (cheap, fast, many!), E2E peak narrows (slow, flaky, few!) — inverted pyramids bankrupt suites.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Levels + specialties + regression discipline

* Scope ladder (isolated→composed→deployed→accepted!) with owner shifts (dev→dev→QA→customer!).
* Performance kinds (load/stress/spike/soak/endurance + capacity planning outputs!). Security kinds (M3!). Regression (change-triggered reruns, selection/prioritisation economics, CI-gated!).
* Pyramid ratios (70/20/10-ish-thumb!) + ice-cream-cone anti-pattern (manual-E2E-heavy: slow/flaky/bankrupt!).

::: callout-formula KTU Formula Vault: Levels
Unit **mocked-fast** · integration **contracts** · system **E2E-staged** · acceptance **buyer-signs** · regression **change-guards**.
:::

::: callout-pitfall Integration-Tested ≠ Interface-Proof (Contract Drift!)
Passing integration today rots as services evolve independently (schema drift, semantic shifts!) — consumer-driven contracts (pacts, versioned!) plus CI re-runs keep green honest. Green-decay awareness (re-run cadence!) separates living suites from museum pieces.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Payments refactor (new fraud-check call): (a) level-by-level test plan? (b) Regression subset pick? (c) Performance gate before Black Friday?"
:::

::: step [Step 2: Execution] Ladder, Subset, Gate
1. (a) Unit (fraud-score function, mocked rules!) → integration (checkout↔fraud contract: timeouts/fallbacks!) → system (staging purchase flows!) → acceptance (finance sign-off on held-vs-charged!).
2. (b) Change-impact subset (checkout/fraud/ledger suites + smoke-all!) — selection economics (run affected, sample rest!).
3. (c) Load ($10\times$ forecast!), spike (flash-sale burst!), soak (memory-leak watch!) — gates with abort thresholds (p99/error-budget!).
:::

::: step [Step 3: Conclusion] Final Result
Level-per-concern mapping, impact-subset regression, gate-threshold performance. Concern-mapped plans (which level catches what!) show testing *strategy*, not just activity.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Ice-cream-cone (E2E-heavy) suites fail economically by:
(A) Too few tests total
(*B) Slow/flaky/expensive peak (browser stacks, timing flakes, debug-through-UI hell!) starving the cheap base (units thin → bugs surface late at $100\times$ cost!) — inverted pyramid economics
(C) Excessive unit speed
(D) Pretty dashboards
::: explanation
Cost-location inversion (bugs found at dearest level!) plus flakiness tax (reruns erode trust!) bankrupts suites. Pyramid ratios (bulk-cheap-base!) as budget policy — shape audits (count per level!) diagnose.
:::

::: quiz Q2: Foundational Concept
Contract tests (consumer-driven pacts) beat classic integration for microservices by:
(A) More servers needed
(*B) Decoupled evolution (each side tests against versioned pacts independently — no shared staging bottleneck!; breaking changes flagged at build, not deploy-night!)
(C) Less code written
(D) No mocks needed (pacts *are* formalised mocks!)
::: explanation
Independence-preserving verification (pact-as-interface-law!) scales with service counts (pairwise staging explodes combinatorially!). Decoupling-economics (build-time flags vs deploy-night fires!) sells pacts.
:::

::: quiz Q3: Foundational Concept
Soak testing catches what load/spike miss:
(A) Peak throughput ceilings
(*B) Slow leaks (memory/FD/descriptor drips accumulating over hours — flat-at-first graphs sagging later!; endurance proof for always-on services!) — duration as the test dimension (time finds drips!)
(C) UI typos
(D) Compile errors
::: explanation
Time-axis testing (hours-long runs, leak-slope metrics!) vs load-axis (volume!) vs spike-axis (burst!). Dimension-matched testing (drip needs duration!) — axis named per test type, always.
:::
