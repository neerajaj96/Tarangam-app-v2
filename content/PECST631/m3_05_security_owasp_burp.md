---
id: m3_05_security_owasp_burp
courseCode: PECST631
module: 3
sequence: 5
title: 'Security Testing with OWASP & Burp'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Model threats with STRIDE before aiming at the Top-10
  - Loop ZAP and Burp runs into fix-verify discipline
  - Attack your own app first with lab-scoped consent
concepts:
  - threat modeling
  - OWASP Top-10
  - security tooling
prerequisites: []
examRelevance: medium
tags:
  - security-testing
  - owasp
---
# Security Testing with OWASP & Burp

**Attacking your own app first — methodology, tool workflow, and the PBCST604 reunion.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Friendly Siege Engineers
**Security testing** besieges pre-production (threat-model the crown jewels first! — STRIDE-per-component: spoof/tamper/repudiate/disclose/deny/elevate!). **OWASP Top 10** aims the siege (injection/broken-access/crypto-failures/insecure-design/misconfig/vuln-components/auth-failures/integrity/software-data-failures/logging-gaps/SSRF!). **ZAP/Burp** run it (spider→scan→tamper→report — PBCST604's M1.5/M2.5 reunion, course-crossing fluency!). Findings fix-verify-close (retest deltas or it didn't happen!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Threat-model → Top-10 → tool-loop + fix-verify discipline

* STRIDE per data-flow (trust boundaries crossed = threat enumerated!).
* Top-10 as checklist (each with test-shape: injection→fuzz payloads!; access→vertical/horizontal matrix probes!; crypto→protocol/cipher audits!...).
* Loop: scope → spider/map → active-scan (authorised!) → manual-tamper (business-logic!) → rate/prioritise (exploitability×impact!) → fix → retest-verify → residual-signoff.

::: callout-formula KTU Formula Vault: Siege Loop
Model (**STRIDE**) → aim (**Top-10**) → run (**ZAP/Burp**) → fix → **retest-verify**.
:::

::: callout-pitfall Scanner-Green ≠ Secure (Automation Ceiling!)
Scanners miss logic flaws (auth bypasses by design-abuse! multi-step races! business-rule cheats!) — manual tamper + threat-model coverage complete the picture (tools find knowns, minds find novels!). Ceiling-honesty (scanner scope stated!) per engagement.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Lab shop: STRIDE one checkout flow, Top-10-map two threats, ZAP-run + one manual logic abuse, fix-verify sketch (consented lab!)."
:::

::: step [Step 2: Execution] Model to Verified-Fix
1. STRIDE: spoofed payment callbacks? tampered prices (client-side total trusted?!)? repudiated orders (unsigned intents!)? info-disclosure (verbose errors!)? DoS (cart loops?)! elevation (coupon-stacking roles!).
2. ZAP: spider → active scan (scoped!) → alerts triaged (true: missing security headers!; FP: login CSRF-token flagged — proven legit!).
3. Manual: price-tamper replay (Burp: client total edited → server trusts?! — business-logic kill: server-side pricing recompute!).
4. Fix-verify: server pricing + retest (tamper replayed → rejected!) + residual (rate limits noted!).
:::

::: step [Step 3: Conclusion] Final Result
Model-aimed scanning (STRIDE→Top-10→tool!), manual-logic abuse (scanner-blind spot!), fix-verify deltas. Model-first ordering (threats aim tools, not vice versa!) is the methodology spine.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
STRIDE-per-data-flow beats checklist-only testing by:
(A) More jargon
(*B) System-specific threats (your flows' trust crossings enumerated — novel business-logic abuses surface!) vs generic lists (known-vuln shapes only!) — model-first finds what checklists can't name
(C) Faster scans
(D) Fewer tools needed
::: explanation
Generative modelling (reason from flows!) vs matching (check knowns!) — novels need generation (checklists blind to design-abuse!). Model-then-match ordering (generate, then verify against Top-10 too!) covers both worlds.
:::

::: quiz Q2: Foundational Concept
Business-logic abuse (price tamper, coupon stack) evades scanners since:
(A) Scanners are outdated
(*B) Abuse uses *legitimate* operations in illegitimate *combinations/values* (valid requests, evil intent — no payload signature exists!; human business-model reasoning required!)
(C) Traffic encrypted
(D) Logs deleted
::: explanation
Intent-vs-mechanics gap (valid mechanics, abusive intent!) — only business-model minds judge (what *should* totals/coupons allow?!). Human-reasoning reserve (model the business, abuse it mentally!) is the un-automatable testing slice.
:::

::: quiz Q3: Foundational Concept
Retest-verify closes findings because:
(A) Reports look longer
(*B) Fixes regress/break/partially-land (patches introduce variants!; config drift reopens!; scanner re-run + manual replay *prove* closure per finding — verified-state, not claimed-state!)
(C) Clients demand paper
(D) Tools auto-close
::: explanation
Fix-fragility (patches half-land, variants survive!) demands proof-per-finding (before/after evidence pairs!). Closure-evidence discipline (replayed clean!) ends engagements — open loops are liabilities with dates.
:::
