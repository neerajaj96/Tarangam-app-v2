---
id: m4_06_genai_advanced_case
courseCode: PECST631
module: 4
sequence: 6
title: 'GenAI Advanced & Case Study: PEX + AI Tools'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Rank suites predictively with telemetry-driven slicing
  - Document baseline, delta and residual case-study format
  - Stretch GenAI fully with gates throughout every claim
concepts:
  - predictive test suites
  - case-study format
  - GenAI gating
prerequisites:
  - m1_05_automation_ai_trends
  - m2_05_ai_testing_tools
examRelevance: medium
tags:
  - genai-testing
  - case-study
---
# GenAI Advanced & Case Study: PEX + AI Tools

**Predictive suites, responsive matrices, and the documented case study — GenAI at full stretch, gated throughout.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Oracle Analysts (Supervised Senior!)
**Predictive testing** (defect-prone files predicted from history/complexity/churn — test-where-it-hurts-first!). **Responsive matrices** (GenAI drafts device/browser slices from usage telemetry — coverage where users *are*!). **Case study spine** (PEX + AI tools on one target: symbex baselines, AI-augmented cases, mutation-measured gains, human-gated oracles!). Senior analysts propose (models!), humans dispose (gates!) — seniority without sign-off is consultancy, not QA.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Predictive features + responsive slicing + case-study format

* Predictors (churn/complexity/author-experience/defect-history!) → risk-ranked suites (time-boxed confidence!) → calibration reviews (predicted-vs-actual hit rates!).
* Responsive: telemetry-driven device slices (top-user-agents + risk oddballs!) + GenAI-drafted viewport cases (human-curated!) + visual diffing (screenshot oracles, flake-managed!).
* Case format: target+baseline → interventions (PEX runs, AI drafts with gates!) → deltas (coverage/mutation/time!) → residual risks + handoff notes.

::: callout-formula KTU Formula Vault: Advanced AI
Predict **risk-ranked** · slice **telemetry-driven** · case-study **baseline→delta→residual**.
:::

::: callout-pitfall Prediction Self-Fulfilling Blindness (Tested-Where-Predicted!)
Risk-ranked suites *find* bugs where they look (predicted zones!) while unranked zones rot unexamined (selection bias loop!) — baseline sampling (random control slices!) audits the predictor itself. Predictor-auditing (hit-rates + control coverage!) closes the loop.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Checkout service: (a) predictive top-$3$ files (mock signals!)? (b) Responsive slice ($80\%$ traffic rule)? (c) PEX+AI case-study numbers table?"
:::

::: step [Step 2: Execution] Rank, Slice, Tabulate
1. (a) `pricing.py` (churn $40$ commits + complexity $35$ + $2$ past escapes!) → `coupon.py` → `gateway_adapter.py` (ranked with reasons!).
2. (b) Top-$3$ user-agents ($82\%$ traffic!) + $1$ foldable + $1$ low-RAM (risk oddballs!) — telemetry-cited slice.
3. (c) Table: baseline (branch $71\%$, mutants $58\%$, suite $22$ min) → +PEX (paths $+9$, witnesses auto!) → +AI drafts curated (cases $+40$, mutants $+14$ → $72\%$!) → residuals (payment-3DS manual lane + flake-quarantine $2$!).
:::

::: step [Step 3: Conclusion] Final Result
Ranked reasons, cited slices, delta tables with residuals. Numbers-with-residuals (gains *and* gaps!) is the case-study honesty standard — victories *and* remainder.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Predictive-risk ranking failure mode (selection bias loop) guarded by:
(A) Bigger models
(*B) Control sampling (random unranked slices tested regardless — predictor audited against ground it didn't choose!; hit-rate tracking per band!)
(C) More features always
(D) Ignoring low-risk zones forever (bias institutionalised!)
::: explanation
Self-fulfilling prophecy mechanics (looked ⇒ found ⇒ "validated"!) broken by controls (looked-away sampled too!). Predictor-performance metrics (precision@k, control-hit deltas!) govern trust — metrology for metrologists.
:::

::: quiz Q2: Foundational Concept
Visual (screenshot) oracles' flakiness roots:
(A) Pixels are evil
(*B) Rendering nondeterminism (fonts/antialiasing/animations/timestamps! — pixel-perfect brittleness!) → mitigations (masked regions, layout-structure asserts, tolerance thresholds, animation-freeze harnesses!) — determinism engineered, not assumed
(C) Screenshots too big
(D) Humans can't see diffs (review UIs exist!)
::: explanation
Nondeterminism inventory (fonts! animations! clocks!) then deterministic harnesses (freeze/mock/stub time and motion!) plus tolerant compares (structural + thresholded!). Determinism-first pipelines (stable renders!) precede visual asserts.
:::

::: quiz Q3: Foundational Concept
Case-study residual risks section exists because:
(A) Padding page counts
(*B) Honest boundaries (what's *not* covered: manual lanes, accepted flakes, predictor blind spots! — owners + dates per residual!) — decision-grade handoffs (ship/no-ship with eyes open!)
(C) Auditors demand length
(D) Tools auto-generate it
::: explanation
Residual-led handoffs (known gaps with owners!) beat green-washed reports (surprise incidents!). Residual registers (living lists!) turn case studies into operational documents — honesty as deliverable.
:::
