---
id: m4_01_windows_attacks_hardening
courseCode: PBCST604
module: 4
sequence: 1
title: Windows Attacks & Hardening
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Trace malware, phishing and privilege-escalation paths in
  - Climb vetted installs through least privilege to tested backups
  - Ring patches with guards switched on
concepts:
  - Windows attack paths
  - hardening ladder
  - patch rings
prerequisites: []
examRelevance: high
tags:
  - system-security
  - windows-hardening
---
# Windows Attacks & Hardening

**How Windows boxes fall — malware/phishing/privesc vectors — and the install-to-patch hardening ladder.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Castle Staff Discipline
Attacks bribe staff (phishing/macros), sneak through supply carts (bundled installers, USB drops), or climb from scullion to steward (UAC-bypass/EoP exploits, token theft). Hardening = staff discipline: hire vetted (official sources, hash-checks), badge everyone least-privilege (UAC max, standard daily accounts), drill expulsions (patches *fast* — Patch Tuesday + out-of-band zeros), post guards (Defender AV + firewall — next topic), and rehearse safely (backups that restore, tested!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Attack paths + hardening rungs

* Paths: malicious docs/macros, trojaned installers, USB/autorun relics, browser/plugin exploits, credential theft (Mimikatz-class), EoP to SYSTEM (service/kernel bugs), lateral SMB/RDP movement.
* Rungs: install hygiene (official media, verify hashes, debloat) → least-privilege accounts + UAC → patch cadence (WSUS/WUfB rings: test→broad) → AV/EDR + firewall (next topic deep-dive) → backup/restore-tested 3-2-1 → audit/GPO baselines (CIS benchmarks).

::: callout-formula KTU Formula Vault: Windows Hardening
Vetted installs → **least-privilege** → **patch rings** → guards on → **tested backups**.
:::

::: callout-pitfall Admin-Daily Accounts Void UAC's Value
Click-through admins (Always-Notify-Off!) auto-consent malware's elevation prompts — UAC's whole worth is the *pause-and-think* + credential gate. Standard-user-daily + separate admin is the posture; slider-at-bottom is surrender.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Lab workstation build sheet: from bare ISO to hand-off — install/auth/patch/backup steps with the attack each defeats."
:::

::: step [Step 2: Execution] Build-to-Handoff
1. Official ISO + SHA256 verify (supply-chain), offline-ish install, debloat (attack surface diet).
2. Standard user + separate admin (UAC max) — defeats silent elevation.
3. Update ring: patch, reboot-verify, snapshot; Defender on, firewall default-deny-inbound (details next topic).
4. Backup job + *restore drill* (untested backups are wishes) — ransomware endgame answer.
5. Each step logged with defeated vector (auditable posture, not vibes).
:::

::: step [Step 3: Conclusion] Final Result
Media→accounts→patches→guards→backups: ordered rungs, vector mapped per rung. Ordered-and-mapped beats hardening salad — sequence *is* the methodology.
:::

::: anim harden-ladder Five Rungs, Each Defeats a Vector
Watch the rungs light in build order — media, accounts, patches, guards, backups — each with the vector it buries, since sequence is the methodology.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
UAC's security value depends on:
(A) Windows edition price
(*B) Non-admin daily use + max notification (prompts gate *human* consent + admin creds) — click-through admins reduce it to animated wallpaper
(C) Screen resolution
(D) Antivirus brand
::: explanation
UAC is a *consent* boundary, not a *security* boundary (Microsoft's own framing!): its worth = the pause it forces on privileged actions. Posture (who clicks, at what level) realises or voids it.
:::

::: quiz Q2: Foundational Concept
Patch rings (test→broad) balance:
(A) Nothing, patch all instantly always
(*B) Zero-day exposure window vs bad-patch blast radius — pilot rings absorb duds (pause/rollback plan ready), broad rings close exposure fast; out-of-band zeros jump the queue by severity
(C) Bandwidth only
(D) User annoyance only
::: explanation
Speed-vs-safety frontier per patch severity: critical/actively-exploited skips rings (risk accepted explicitly); routine rides them. Severity-gated cadence is the policy to state, not "patch fast" absolutely.
:::

::: quiz Q3: Foundational Concept
Untested backups are "wishes" because:
(A) Tapes degrade poetically
(*B) Restore-time failures (corrupt chains, missing keys, unbootable images, ransomware-reached online copies) surface only at drills — 3-2-1 + offline/air-gapped + *firedrill restores* convert wishes to guarantees
(C) Backups slow systems
(D) Cloud deletes them
::: explanation
Backup value = restore certainty under attack conditions (including compromised credentials reaching online copies — immutability/air-gap answers). Drill cadence + offline copies are the checkboxes; unchecked = hope.
:::
