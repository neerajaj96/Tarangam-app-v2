---
id: m3_01_netsec_terms_devices
courseCode: PBCST604
module: 3
sequence: 1
title: Network Security Terms & Threat Map
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Speak threat, vulnerability, exploit and payload precisely
  - Separate shouting IDS from blocking IPS across generations
  - Zone networks inside, DMZ and outside for exam maps
concepts:
  - threat vocabulary
  - intrusion detection
  - network zones
prerequisites: []
examRelevance: medium
tags:
  - network-security
  - foundations
---
# Network Security Terms & Threat Map

**Speaking network defense — the vocabulary (threat/vuln/exploit/payload, IDS/IPS, firewall generations) that every later topic assumes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Castle Guard Ranks
**Threat** (besieger outside) exploits a **vulnerability** (loose brick) via an **exploit** (siege ladder) delivering a **payload** (troops inside). **Firewalls** are gate filters (gen-1 packet rules → gen-2 stateful → gen-3 app-aware/NGFW with IDS brains). **IDS** watches and shouts (detection); **IPS** watches and *blocks* (prevention, inline risk of self-DoS). Nouns first — verbs (DoS, spoofing, hijacking) get their own topics next.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Term grid + device ladder

Threat/vuln/exploit/payload/risk (M1 reunion) · attack surface/vectors · IDS (signature vs anomaly, NIDS vs HIDS, true/false positive economics) · IPS (inline, fail-open vs fail-closed dilemma) · firewall generations + DMZ zoning (inside/DMZ/outside three-legged topology).

::: callout-formula KTU Formula Vault: NetSec Nouns
Threat→vuln→**exploit→payload** · IDS **shouts**, IPS **blocks** · zones: **inside/DMZ/outside**.
:::

::: callout-pitfall IDS ≠ IPS (Placement Decides)
Same engine, different posture: passive tap (IDS: sees all, stops nothing, safe to fail) vs inline bridge (IPS: stops attacks *and* legit traffic when wrong/down). Fail-open (availability) vs fail-closed (security) is the inline dilemma — state the choice per deployment.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Place defenses for a campus web server: zone it, pick firewall gen, IDS vs IPS per segment, with the fail-open/closed call justified."
:::

::: step [Step 2: Execution] Zones and Postures
1. Server in DMZ (internet-facing leg), DB inside (no direct outside path), students outside.
2. NGFW at borders (app-aware for HTTP floods context); NIDS taps (passive visibility, no outage risk); IPS inline *before* the server in fail-*closed*? For revenue-critical uptime with tuned rules: fail-open *with* alerting (availability bias stated) — or closed for exam-season integrity? Decide + justify: availability-first here (fail-open, paged alerts).
:::

::: step [Step 3: Conclusion] Final Result
Zone-then-posture-then-dilemma-call: topology first, device roles second, open/closed justified third. Dilemma calls need *reasons*, never defaults.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Signature vs anomaly IDS trade:
(A) Same detection profile
(*B) Signatures: precise on knowns, blind to novel (update-dependent); anomaly: catches novel via deviation, noisier (baseline-tuning burden, false-positive economics)
(C) Anomaly needs no baseline
(D) Signatures catch zero-days
::: explanation
Known-bad matching vs weirdness scoring: precision-vs-novelty frontier. Hybrid stacks (signatures + anomaly + threat intel) cover both — single-engine claims overpromise, state the frontier.
:::

::: quiz Q2: Foundational Concept
DMZ's job in three-legged topology:
(A) Faster routing
(*B) Sacrificial exposure zone: public services live semi-trusted (outside reaches DMZ, never inside directly; DMZ never initiates inside freely) — breach blast contained at the middle leg
(C) Extra bandwidth
(D) DNS hosting only
::: explanation
Compromise-assumed design: DMZ hosts are *expected* breachable — rules confine them (no inside-initiation, logged everything). Breach-containment, not breach-prevention, is the zone's thesis.
:::

::: quiz Q3: Foundational Concept
Fail-open vs fail-closed IPS under failure:
(A) Identical outcomes
(*B) Open: traffic flows uninspected (availability kept, attacks pass — fail *permissive*); closed: all halts (attacks blocked with business — fail *safe*); choice follows availability-vs-security priority per segment
(C) Open is always wrong
(D) Closed never blocks legit
::: explanation
Failure posture is policy crystallised: revenue/education nets lean open-with-alerts; safety/secret nets lean closed. Priority-stated choice (not vendor default) is the graded judgment.
:::
