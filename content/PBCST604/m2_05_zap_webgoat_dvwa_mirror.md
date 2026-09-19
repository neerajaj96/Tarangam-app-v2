---
id: m2_05_zap_webgoat_dvwa_mirror
courseCode: PBCST604
module: 2
sequence: 5
title: 'ZAP, WebGoat, DVWA, Mirroring & HTTrack'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Break coached apps safely across the maturity dials
  - Test proxy-driven with scans that mirror Burp discipline
  - Photocopy targets offline for repeatable study
concepts:
  - OWASP ZAP
  - vulnerable applications
  - offline mirroring
prerequisites:
  - m2_01_sql_injection
  - m2_02_xss_types_fixes
examRelevance: medium
tags:
  - web-security
  - security-tools
---
# ZAP, WebGoat, DVWA, Mirroring & HTTrack

**The practice range — coached vulnerable apps, proxy-driven testing, and offline copies for safe study.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Dojo, Sensei, Photocopier
**DVWA/WebGoat** are dojos (deliberately-broken apps with difficulty dials + lesson tracks — practice throws safely). **OWASP ZAP** is the sensei watching (free proxy+scanner: spider, active/passive scan, break/replay — the M1 Burp workflow's open twin). **HTTrack mirroring** photocopies sites for offline autopsy (study structure/JS/endpoints without touching live targets again — recon hygiene!). Range rule: throws inside the dojo only, photocopies with permission/ToS respect.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Range roles + mirror discipline

* DVWA (PHP/MySQL, low→impossible dials — same bug, four maturities), WebGoat (lesson-tracked, Java-flavoured), ZAP (context/scope, scan policies, alert taxonomy informational→high, report→fix→rescan loop).
* HTTrack: recursive fetch honoring scope/filters/robots (configurably), rate-limited; offline grep for comments/JS routes/backup files (`.bak/.old` jackpots); never mirror-and-attack live (study ≠ touch).

::: callout-formula KTU Formula Vault: Range
Dojo **break safely** · sensei **proxy+scan** · photocopy **study offline** · dials **maturity ladder**.
:::

::: callout-pitfall Impossible-Dial ≠ Production-Proof
DVWA-impossible resists *known* vectors, not novel ones — passing top dial means lesson-complete, not unhackable. Scope claims to lessons, never to security verdicts, in writeups.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"ZAP-baseline a lab WordPress (consented): setup, spider→scan pass, two alerts triaged (one true, one false positive), mirror for offline study."
:::

::: step [Step 2: Execution] Sensei Session
1. Scope context (lab host only), spider (structure map), baseline scan (passive + light active per policy).
2. Alert A (missing X-Content-Type-Options — true, low: header fix, rescan clears). Alert B (SQLi-ish on search — manual replay proves parameterised + error-generic: false positive documented with proof, not dismissed!).
3. HTTrack scoped mirror (rate-limited, lab-owned) → offline grep finds `backup.sql.bak` (jackpot class!) → rotate + delete + rule (no backups web-accessible).
:::

::: step [Step 3: Conclusion] Final Result
Scope→map→scan→triage-with-proofs→mirror-grep→fix→rescan: the range loop end to end. False positives need *proofs*, not vibes — documented replay or it didn't happen.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
DVWA difficulty dials teach primarily:
(A) Harder exploits each level
(*B) Fix maturity ladder — same vulnerability class defeated progressively (low: raw → impossible: parameterized+CSP-grade), showing *defense depth*, not just attack variety
(C) New bugs per level
(D) Speed running
::: explanation
Dials vary *defenses*, constant bug-class: learners feel each fix layer's effect (filter bypassed → prepared statement holds). Maturity-ladder framing turns play into pedagogy — name the layer beaten per dial.
:::

::: quiz Q2: Foundational Concept
ZAP passive vs active scanning differ by:
(A) Price
(*B) Traffic risk: passive reads proxied flows (safe, always-on); active *attacks* (payloads that can corrupt/mangle test data — lab-only, scoped, backed-up targets!) — consent + backup gates active mode
(C) Speed only
(D) Nothing operational
::: explanation
Active payloads write/delete/trigger (state-changing tests on live data = damage). Authorization *plus* snapshot/backup discipline precede active runs — passive first, active proved-safe.
:::

::: quiz Q3: Foundational Concept
Mirroring ethics line (HTTrack):
(A) Mirror anything reachable
(*B) Own/consented targets + ToS/robots respect + rate limits; offline study ≠ live probing license — photocopy permission covers copying, not attacking (separate scopes!)
(C) No limits ever
(D) Only text files
::: explanation
Copy-scope vs test-scope are distinct grants: studying your mirror needs no further touch; every new live packet needs its own authorisation. Scope granularity is the ethics precision examiners reward.
:::
