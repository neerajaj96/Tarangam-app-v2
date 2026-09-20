---
id: m4_04_pilot_scaling
courseCode: GXEST605
module: 4
sequence: 4
title: Pilot Build & Scaling to Production
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Prove operations with dressed-rehearsal pilot objectives
  - Vet partners before waving rollouts outward
  - Keep rollbacks ready against scale-day surprises
concepts:
  - pilot builds
  - partner vetting
  - waved rollouts
prerequisites:
  - m4_03_prototyping_alpha_beta
examRelevance: medium
tags:
  - pilot
  - scaling
---
# Pilot Build & Scaling to Production

**Dress rehearsal at scale — objectives, partners, procedures, and the production leap.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Preview Week on Broadway
**Pilot** = preview performances (real audiences! real box office pressure! but limited run + understudies ready!). Objectives (prove operations at scale: throughput, support load, supply rhythm!). **Partners** (manufacturing/hosting allies vetted: capability audits, quality systems, IP hygiene!). **Procedures** (pilot runbooks: install/operate/support/measure!). **Scaling** (pilot→production math: capex, staffing curves, supply contracts, rollout waves!). Flop cheaply at previews, never on opening night.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Pilot spine + partner vetting + scale math

* Objectives (ops-proving, not feature-proving — beta settled features!).
* Partners (capability/quality/IP/financial vetting!; pilot-quantity POs with options!).
* Procedures (runbooks + escalation + spares + metrics dashboards!).
* Scaling (unit-economics at volume! staffing curves! supply contracts! wave rollout: friendly→typical→all!; rollback plans per wave!).

::: callout-formula KTU Formula Vault: Preview Week
Pilot proves **operations** · partners **vetted** · rollout **waved** · rollback **ready**.
:::

::: callout-pitfall Pilot-Success Theater (Friendly-Bubble Proof!)
Pilot in coddled conditions (best staff! handpicked users! engineer on-site 24/7!) proves nothing scalable (support-load hidden, edge cases suppressed!). Production-representative conditions (typical staff/users/support ratios!) — honesty constraints on pilots.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"QR-token pilot ($3$ canteens, $1$ month!): (a) objectives (ops-flavoured!)? (b) Partner pick (tablet vendor!)? (c) Wave plan + rollback triggers? (d) Anti-theatre constraints?"
:::

::: step [Step 2: Execution] Preview Orders
1. (a) Uptime $\ge98\%$ unassisted + scan-rate sustained + support-tickets/day bounded + cashier NPS (ops metrics, not feature votes!).
2. (b) Vendor: in-warranty swap SLA + spare pool ($10\%$!) + IP-clean firmware (vetting checklist!).
3. (c) Wave 1 (1 friendly canteen!) → wave 2 (2 typical!) → all (pending wave-2 gates!); rollback triggers (uptime $<95\%$ $48$h! unresolved P0!).
4. (d) No resident engineer past week 1 (support reality!) + typical cashiers (skill honesty!) + dashboard public to stakeholders (numbers naked!).
:::

::: step [Step 3: Conclusion] Final Result
Ops-objectives, vetted partners, waved rollout with triggers, anti-theatre constraints. Representative-honesty (typical conditions!) is the pilot integrity standard.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Pilot vs beta differs operationally by:
(A) Duration labels
(*B) Proof target (beta: user-value!; pilot: operational-scale!) + conditions (friendly vs representative!) + stakes (learning vs pre-launch commitment!) — question-maturity ladder continues (value→ops→scale!)
(C) Team size
(D) Nothing substantive
::: explanation
Ladder logic (each stage answers its question!) — pilot-after-beta-sequence matters (value unproven + scale proven = elegant irrelevance!). Question-ordered stages (value→ops→scale!) structure programs.
:::

::: quiz Q2: Foundational Concept
Rollback triggers pre-set (vs improvised mid-crisis) because:
(A) Pessimism rituals
(*B) Crisis cognition degrades (sunk billions shout "one more week"!) — cold triggers fire automatically (metric + window + action bound!) — pre-commitment vs escalation-of-commitment, structurally
(C) Auditors love triggers
(D) Teams enjoy retreats
::: explanation
Heat-of-moment judgment fails predictably (escalation bias!) — cold triggers (numbers + windows + actions, signed pre-launch!) decide dispassionately. Trigger triads (metric/window/action!) per risk, published.
:::

::: quiz Q3: Foundational Concept
Manufacturing-partner IP hygiene checks cover:
(A) Factory cafeteria quality
(*B) Background separation (your designs ring-fenced from competitors' runs!; NDAs + access controls + data handling!), ownership of tooling/moulds (who owns what on exit!), audit rights (verify, don't trust!) — partnership due diligence beyond unit price
(C) Logo placement
(D) Holiday schedules
::: explanation
Partnership-risk surface (IP leakage, tooling hostage, quality fade!) vetted pre-PO (audits + contracts + exit terms!). Price-last evaluation (hygiene first!) prevents cheap-disaster sourcing.
:::
