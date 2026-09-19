---
id: m1_01_infosec_threats_risk
courseCode: PBCST604
module: 1
sequence: 1
title: 'InfoSec Intro: Threats & Risk Analysis'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Guard confidentiality, integrity and availability against actors
  - Price risk as likelihood times impact with ALE arithmetic
  - Treat findings by avoid, mitigate, transfer or accept
concepts:
  - CIA triad
  - risk analysis
  - annualized loss expectancy
prerequisites: []
examRelevance: high
tags:
  - infosec
  - risk-analysis
---
# InfoSec Intro: Threats & Risk Analysis

**What we protect, from whom, and how much protection is worth — CIA, threat actors, and risk math.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Castle Ledger
**CIA triad** = the crown jewels' three bodyguards: **Confidentiality** (no peeking), **Integrity** (no tampering), **Availability** (always open for business). **Threats** are the besiegers (script kiddies to nation-states); **vulnerabilities** the loose bricks; **risk** = likelihood × impact — the ledger deciding which walls get gold (countermeasures cost must sit *below* expected loss, or the cure outprices the disease).
:::

::: anim attack-chain Five Links, One Break Needed
Recon, scan, exploit, persist, cover — defenders win by snapping any single link: logged recon, closed ports, patched holes, watched logs.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 CIA + AAA + threat classes

CIA (protect *what*); AAA (authenticate *who*, authorize *what*, audit *trail*). Threats: malware/ransomware, phishing/social engineering, insider, APTs, DoS (M3), web vectors (M2). Risk: $Risk = Likelihood \times Impact$ (qualitative matrices High/Med/Low, or ALE $=$ SLE $\times$ ARO in money terms).

### 2.2 Risk analysis workflow

Identify assets → enumerate threats/vulns → estimate likelihood × impact → rank → treat (avoid/mitigate/transfer-insure/accept) → residual risk sign-off. Analysis repeats (threats evolve; controls decay).

::: callout-formula KTU Formula Vault: Risk
CIA: **peek/tamper/downtime** · risk = **likelihood × impact** · ALE = **SLE × ARO** · treat: **avoid/mitigate/transfer/accept**.
:::

::: callout-exam KTU Exam Focus
PBCST604 runs CIE-heavy (60: project 30!) with ESE 40 (Part A $8\times2$, Part B $4\times6$). Answers stay compact: 2-markers want terms verbatim; 6-markers want one worked chain (threat→vuln→risk→treatment) with a named example.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Clinic server: ransomware likelihood Medium, impact High (patient care halts). Run the risk workflow to a treatment decision with numbers."
:::

::: step [Step 2: Execution] Ledger Walk
1. Asset: records + care continuity. Threat: ransomware via phishing. Vuln: unpatched SMB + no offline backups.
2. Risk: Medium × High = **High** (matrix) — intolerable for care continuity.
3. Treat: mitigate (patch cadence + offline immutable backups + mail filtering + drills); transfer slice (cyber-insurance); residual: Low–Medium, signed by management. Control cost $\ll$ one outage week.
:::

::: step [Step 3: Conclusion] Final Result
Asset→threat→vuln→rank→treat→residual: six stations, one paragraph each. Residual-risk sign-off (who accepts what's left) is the closer graders hunt.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Defaced homepage (message changed, site up, nothing stolen) breaches primarily:
(A) Confidentiality
(*B) Integrity — unauthorised modification of content; availability holds (site up), confidentiality untouched (nothing exfiltrated)
(C) Availability
(D) None, it's cosmetic
::: explanation
Map effect→letter: changed = integrity, leaked = confidentiality, down = availability. "Cosmetic" still counts — trust in content *is* the asset. One-effect-one-letter discipline answers all CIA triage.
:::

::: quiz Q2: Numerical Drill
SLE ₹$5$ lakh, ARO $0.5$/yr. ALE? Control costs ₹$1$ lakh/yr and halves ARO. Worth it?
(A) ALE ₹$5$ lakh; yes blindly
(*B) ALE $= 5\times0.5 = $ ₹$2.5$ lakh; new ALE $= 5\times0.25 = $ ₹$1.25$ lakh; saves ₹$1.25$ lakh for ₹$1$ lakh — yes, marginally (revisit if estimates wobble)
(C) ALE ₹$10$ lakh
(D) Controls never pay
::: explanation
ALE $=$ SLE $\times$ ARO grounds decisions in rupees: savings vs spend, both annualised. Marginal wins demand sensitivity notes (estimates are guesses) — arithmetic plus humility.
:::

::: quiz Q3: Foundational Concept
Risk "acceptance" means:
(A) Ignoring risk
(*B) Conscious residual-risk sign-off (low risks, or mitigation pricier than loss) — documented, owned, reviewed; ≠ ignorance (which is just unmanaged exposure)
(C) Buying insurance always
(D) Patching everything
::: explanation
Acceptance is a *decision* with an owner and review date, priced against alternatives. Undocumented "acceptance" is negligence wearing a label — the distinction examiners test.
:::
