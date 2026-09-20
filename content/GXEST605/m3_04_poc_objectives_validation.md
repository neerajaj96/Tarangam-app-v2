---
id: m3_04_poc_objectives_validation
courseCode: GXEST605
module: 3
sequence: 4
title: 'Proof of Concept: Objectives to Validation'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Scope PoC objectives as questions that earn budgets
  - Register risks with scouting and documentation trails
  - Validate verdicts into fundable next-step stories
concepts:
  - proof of concept
  - risk registers
  - validation verdicts
prerequisites:
  - m3_03_feasibility_sessions
examRelevance: high
tags:
  - ideate
  - poc
---
# Proof of Concept: Objectives to Validation

**De-risking on purpose — scoped objectives, risk registers, tech scouting, and validation that earns the next budget.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Recon Patrol, Not Invasion
**PoC** answers *one* risky question (not builds mini-products!): objectives scoped to unknowns (riskiest-first ordering!). **Risk assessment** lists ambushes (probability×impact! mitigations owned!). **Tech scouting** shops parts (buy-vs-build vs borrow — TRL-matched!). **Docs/process/change/knowledge** capture learning (decision logs! versioned notes! change control even in chaos!). **Validation** grades against objectives (pass/fail per question — storytelling the verdict for budget-holders!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 PoC spine + risk/tech/docs/validation kit

* Objectives (question-shaped! measurable! timeboxed!).
* Risks (register: risk/owner/mitigation/trigger!).
* Scouting (build-buy-borrow matrix per component!).
* Docs (decision logs! process notes! change control light!). Knowledge capture (demos + writeups + handoff-ready!).
* Validation (objective-wise verdicts! + story for funders: what we now *know* + what it *unlocks*!).

::: callout-formula KTU Formula Vault: PoC Spine
Questions → risks → scouting → docs → verdicts → story.
:::

::: callout-pitfall Demo-Disguised-as-PoC (Theatre Patrol!)
Shiny demo with no risky question (impresses, proves nothing — budget unlocked on applause!). Question-first gating (which unknown dies here?) distinguishes patrols from parades — objectives audited before funds.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"QR-token PoC ($2$ weeks!): (a) objectives (risk-ordered!)? (b) Risk register ($3$ rows!)? (c) Build-buy-borrow picks? (d) Validation verdicts format? (e) Funder story arc?"
:::

::: step [Step 2: Execution] Patrol Orders
1. (a) Q1: peak-hour scan reliability ($95\%$ sub-$3$s?)! Q2: display readability in sun! Q3: fallback queue time? (risk-ordered!).
2. (b) R1: library flakiness (mitigate: spike day 1, owner Dev!)! R2: warden veto (mitigate: co-design seat, trigger: week-1 demo!)! R3: phone-less exclusion (mitigate: token-slip fallback designed-in!).
3. (c) QR lib: borrow (mature OSS!)! Displays: buy (commodity tablets!)! Token logic: build (core IP!) — matrix reasoned.
4. (d) Verdict table (objective/metric/result/pass-fail!) + story: "queues *can* tokenise reliably — next budget buys pilot *build*" (knowledge unlocked, quantified!).
:::

::: step [Step 3: Conclusion] Final Result
Risk-ordered objectives, owned risks, reasoned sourcing, verdict tables, unlocking stories. Question-shaped objectives (not deliverable-shaped!) are the PoC literacy mark.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
PoC vs prototype vs pilot differ by question asked:
(A) Size adjectives only
(*B) PoC: *can it work* (riskiest unknown!)? Prototype: *does it work for users* (usability-shape!)? Pilot: *does it work at scale/in-situ* (operations truth!)? — question-ladder, fidelity climbing with question maturity
(C) Budget brackets only
(D) Team sizes
::: explanation
Question-maturity mapping (unknown-type per stage!) prevents stage-skipping (pilot-scale spend on unanswered PoC questions!) and stage-confusion (demoing when validating needed!). Ask-stage-matched questions, always.
:::

::: quiz Q2: Foundational Concept
Build-buy-borrow matrix decides per component by:
(A) Developer preference (comfort ≠ strategy!)
(*B) Core-vs-context split (core IP: build!; commodity: buy!; mature OSS: borrow/integrate!) + TRL/speed math — strategic sourcing (moat where it matters, rent elsewhere!)
(C) Cheapest sticker price (TCO, not price!)
(D) Newest tech always (maturity risk!)
::: explanation
Moat-mapping (what *must* be ours?) plus speed math (borrow velocity!) routes sourcing. Total-cost view (maintain/integrate/exit costs!) beats sticker comparisons.
:::

::: quiz Q3: Foundational Concept
Knowledge capture (beyond code/docs) banks:
(A) Meeting minutes archives
(*B) Decision rationales (why *not* the alternatives! — future teams inherit reasoning, not just outcomes!), dead-end maps (explored-and-killed, no rework!), contact trails (who-knows-what!). Rationale banks compound (org learning!).
(C) Screenshots folders
(D) Timesheets
::: explanation
Rationale-over-outcome capture (decisions *with reasons*!) prevents re-litigation (why-did-we... answered!) and repeat dead-ends. Learning-asset framing (knowledge as deliverable!) justifies capture budgets.
:::
