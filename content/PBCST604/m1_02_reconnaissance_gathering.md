---
id: m1_02_reconnaissance_gathering
courseCode: PBCST604
module: 1
sequence: 2
title: Reconnaissance & Information Gathering
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Case targets with passive footprints before active touches
  - Chain sources into entities with the toolkit
  - Scope every engagement in writing first
concepts:
  - passive reconnaissance
  - active reconnaissance
  - engagement scoping
prerequisites: []
examRelevance: medium
tags:
  - reconnaissance
  - osint
---
# Reconnaissance & Information Gathering

**Casing the target legally-grey-first — passive footprints, active touches, and the Reco-ng toolkit.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Casing a Bank, Legally First
**Passive recon** reads the brochure (whois, DNS records, job ads leaking stacks, GitHub secrets, archive.org) — zero target contact, near-zero alarm. **Active recon** rattles doors (ping sweeps, port touches — M3's scanning) — informative but logged. **Reco-ng**-style frameworks automate the brochure-reading (subdomains, emails, tech fingerprints) into one dossier. Professionals exhaust passive before going active — noise discipline from minute one.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Passive vs active + toolbelt

* Passive: whois/registrar, DNS enumeration (NS/MX/TXT/SPF tells tales), certificate transparency logs, Shodan-style exposure search, social/job/OSINT, metadata in documents.
* Active: DNS zone-transfer attempts, ping/ARP sweeps, banner grabs (service versions = exploit shopping lists).
* Reco-ng modules chain sources → entities (hosts→ports→vulns pipeline); scope files keep tests authorised (written permission first — the ethics line).

::: callout-formula KTU Formula Vault: Recon
Passive **brochure, silent** · active **touch, logged** · chain **sources→entities** · scope **written first**.
:::

::: callout-pitfall Unscoped Scanning Is the Crime, Not the Tool
Nmap on strangers without written authorisation breaches law/policy (plus alarms); same scan on your DVWA lab is coursework. Authorisation scope *is* the ethics boundary — every recon answer states it.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Authorised test on `example-test.lab`: build the recon dossier passively, then list the first three active touches in order with justification."
:::

::: step [Step 2: Execution] Brochure, Then Knocks
1. Passive: whois (registrar/admin), DNS (A/MX/TXT — mail provider leaks), cert logs (hidden subdomains `dev.`/`staging.`), job post ("hiring Struts2 devs" — stack hint!), GitHub dorks (keys in commits?).
2. Active: (i) DNS AXFR attempt (misconfig lottery), (ii) ping sweep of found netblocks (live hosts), (iii) banner grabs on $80/443$ (exact versions → CVE mapping). Each logged — expected, authorised, minimal blast.
:::

::: step [Step 3: Conclusion] Final Result
Passive dossier first (free intel, zero noise), active in escalating touch order, authorisation stated up front. Escalation order + scope line is the professional format.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Certificate-transparency logs aid recon by:
(A) Issuing certificates
(*B) Publicly logging every issued cert — hidden subdomains (`vpn.`, `git.`) surface by searching the log, no target contact needed (pure passive gold)
(C) Encrypting traffic
(D) Blocking attackers
::: explanation
CT's auditability backfires for secrecy: subdomain secrecy dies at issuance. Defenders monitor their own CTNamespace (shadow-IT/alphabet detection) — same log, blue-team use.
:::

::: quiz Q2: Foundational Concept
Job ads as recon source — what leaks and why care?
(A) Salaries only
(*B) Stack disclosures ("5 yrs Struts2, WebLogic 12c") hand version intel for CVE shopping — HR markdown bypasses technical opsec entirely
(C) Nothing useful
(D) Employee names for phishing (second-order use: org-chart + roles enable spear-phish pretexts)
::: explanation
Human layers leak what firewalls hide: tech stacks (vuln mapping) and org charts (social-engineering pretexts). OSINT spans people-posts, not just packets — scope answers across both.
:::

::: quiz Q3: Foundational Concept
Banner grabbing belongs to which phase, and its risk?
(A) Passive, none
(*B) Active (sends packets, logged) — trades stealth for exact version strings that map to exploits; minimal-touch principle rations it post-passive-exhaustion
(C) Exploitation phase
(D) Reporting phase
::: explanation
Any packet to target = active = logged. Order operations by noise (passive dossier → surgical touches) so loud moves spend logged capital only where passive ran dry.
:::
