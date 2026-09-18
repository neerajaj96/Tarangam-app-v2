# Cloud Models, Objectives & Cost Thinking

**Private/public/hybrid placement, design objectives, and the meter that reshapes architecture.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Housing Tenure
**Private cloud** = owned villa (control, compliance, capital + staff burden). **Public cloud** = hotel (elastic, metered, neighbours + egress bills). **Hybrid** = villa + hotel membership (burst outward, keep crown jewels home — plus the *connective tissue* tax: VPN/direct-connect, identity federation, data gravity). **Objectives**: elasticity speed, availability zones, cost-per-outcome. The meter makes idle a bug — architecture follows the bill (scale-to-zero instincts, right-sizing rituals, egress-aware placement).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Models and objectives

* Private: on-prem cloud stack, control/compliance, capex + ops burden.
* Public: provider-run, opex/metered, AZ/region model, shared-responsibility security.
* Hybrid (+multi): burst, residency tiers, DR across models; tissue costs (network, identity, observability seams).
* Objectives: rapid elasticity, measured service, resource pooling, broad access (NIST five, essentially) + cost model: pay-per-use, egress asymmetry, commitment discounts (reserved/savings plans).

::: callout-formula KTU Formula Vault: Cloud Models
Private = **control/capex** · public = **elastic/opex** · hybrid = **burst + tissue tax** · meter makes **idle a bug**.
:::

::: callout-pitfall Egress Asymmetry Ambushes Bills
Ingress free-ish, egress metered steeply — chatty cross-cloud/multi-AZ designs hemorrhage. Data gravity (move compute to bytes) + egress-aware topology are cost-architecture, not finance trivia.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Hospital records (regulated, steady) + Diwali sale burst ($10\times$, 3 days): place each + burst path + two bill-guards."
:::

::: step [Step 2: Execution] Tenure per Workload
1. Records: private (residency/compliance, predictable base cost beats metered-always-on).
2. Sale: public elastic tier (scale $10\times$ for 3 days, release after — capex-for-3-days rejected).
3. Burst path: hybrid tissue (identity federation + replicated catalog reads outward; payments stay home). Guards: egress-aware media serving (CDN at edge, not origin pulls per view) + scale-to-zero batch after the sale.
:::

::: step [Step 3: Conclusion] Final Result
Steady-regulated ⇒ own; spiky ⇒ rent; tissue + bill-guards drawn, not assumed. Tenure reasoning with placed guards is the complete answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Shared-responsibility model means:
(A) Provider does everything
(*B) Provider secures *of* the cloud (iron, hypervisor, facilities); tenant secures *in* it (data, identities, configs, workloads) — breach post-mortems start by locating the seam
(C) Nobody is responsible
(D) Tenants own hardware
::: explanation
Seam literacy decides post-mortems (open S3 bucket = tenant side, always). Misread seams cause the classic "but we moved to cloud" breaches — responsibility follows the layer line.
:::

::: quiz Q2: Foundational Concept
Why keep steady regulated workloads private despite public elasticity?
(A) Public is slower
(*B) Residency/compliance mandates + always-on metered cost exceeding owned-base cost + control over change windows — elasticity has no value for flat predictable demand
(C) Private is trendier
(D) No reason, migrate all
::: explanation
Elasticity monetises *variance*; flat demand pays the meter tax for nothing while adding compliance surface. Tenure follows demand-shape + mandate — variance-free steady states stay home.
:::

::: quiz Q3: Foundational Concept
Availability zones vs regions protect against:
(A) Same rack failure only
(*B) AZs: datacenter-scale faults (power/flood, ms-apart replication); regions: metro-scale disasters + residency boundaries (async, costlier) — tiered blast-radius design
(C) Software bugs only
(D) Nothing real
::: explanation
Blast-radius ladder: rack → AZ (sync standby) → region (async DR + legal boundary). Placement tier per criticality/cost — zones for HA, regions for DR/residency, never conflated.
:::
