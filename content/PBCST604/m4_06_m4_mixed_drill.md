---
id: m4_06_m4_mixed_drill
courseCode: PBCST604
module: 4
sequence: 6
title: 'M4 Drill: Harden Both, Prove It, Present It'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Race Windows and Linux lockdowns in parallel checklists
  - Verify every lock with commands that prove state
  - Present threat, proof and residual on defense arcs
concepts:
  - lockdown race
  - verification commands
prerequisites:
  - m4_01_windows_attacks_hardening
  - m4_02_windows_safe_defender
  - m4_03_linux_attacks_physical_config
  - m4_04_linux_auth_selinux
examRelevance: high
tags:
  - system-security
  - m4-drill
---
# M4 Drill: Harden Both, Prove It, Present It

**Windows + Linux lockdown race, verification commands, and the defense-day arc — closing drill.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Two Castles, One Inspection
Harden the Windows wing and Linux wing in parallel, verify with commands (not clicks remembered), then present the siege report: what threatened, what locked, what proved. Parallel wings, shared methodology: enumerate→lock→verify→present.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Parallel checklist + verify commands

Windows: UAC-max/standard-daily · patch rings · Defender+tamper · firewall profiles · backups-drilled. Linux: keys-only SSH · sudo least-command · sysctl/services diet · SELinux enforcing · LUKS + boot locks · config-managed. Verify: `auditpol`/update history; `ssh -v`/`journalctl`; `sestatus`/`ausearch`; `ls -Z`; restore-drill logs. Present: threat→locks→proofs→residuals arc.

::: callout-formula KTU Formula Vault: Twin Castles
Enumerate → lock → **verify-by-command** → present **threat→proof→residual**.
:::

::: callout-exam KTU Exam Focus
M4's 6-markers harden one OS fully (rungs + mechanisms + one verification each) or compare (UAC vs sudo; Defender vs SELinux/iptables philosophies). Rung-plus-proof per line is the texture that scores — claims ride with commands.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Dual-boot lab PC (Windows + Linux, consented): 10-line joint hardening ticket with verification per line."
:::

::: step [Step 2: Execution] Ticket Lines
1. Win: standard-daily + UAC max (verify: consent prompt on test elevation).
2. Win: updates current + Defender tamper-on (verify: history + status lines).
3. Win: firewall Public on lab Wi-Fi (verify: profile shown).
4. Win: backup + restore-drill logged (verify: drill log date!).
5. Linux: keys-only SSH, root denied (verify: password attempt fails, key works).
6. Linux: sudo scoped (verify: `sudo -l` lists only allowed).
7. Linux: `sestatus` enforcing + docroot contexts (verify commands quoted).
8. Linux: LUKS on data partition (verify: `cryptsetup status`).
9. Both: unnecessary services off (verify: listening-socket lists trimmed).
10. Residuals memo (what's accepted: e.g. USB convenience vs epoxy — signed!).
:::

::: step [Step 3: Conclusion] Final Result
Ticket = control + verify-command + defeated-vector per line; residuals signed at the end. Verifiability is the difference between hardening done and hardening claimed.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
`sestatus` says permissive on a "hardened" server. Verdict?
(A) Hardened enough
(*B) Finding, not posture: enforcing required (permissive logs-and-allows — protection theatre); remediate via audit2allow-reviewed policy, re-verify enforcing, log the change
(C) Disable SELinux instead
(D) Ignore, logs exist
::: explanation
Permissive = alarm without lock (detection, no prevention). Verdict language (finding + remediation + re-verify) is the audit answer shape — states never accepted on vibes.
:::

::: quiz Q2: Mixed Drill
UAC vs sudo least-privilege philosophies differ by:
(A) Nothing, twins
(*B) UAC gates *moments* (consent per elevation, Windows trust-the-click); sudo gates *commands* (policy per binary, logged tickets) — moment-consent vs command-policy, both need non-admin daily posture to matter
(C) Sudo is GUI only
(D) UAC logs better
::: explanation
Consent-model (clicks) vs policy-model (rules+logs): different theories, shared prerequisite (unprivileged daily). Philosophy named per mechanism — compare theories, not logos.
:::

::: quiz Q3: Mixed Drill
Restore drill fails (backup corrupt). Grade the posture:
(A) Still backed up (files exist)
(*B) Unprotected until proven otherwise: escalate (fix chain, re-drill, date the proof), interim compensations (extra copies, change freeze on crown data), memo signed — posture follows *verified* restores only
(C) Blame the tool
(D) Wait for audit
::: explanation
Backup value = restore certainty (M4.1's wishes doctrine returns): failed drill = control failure, incident-flavoured response (escalate, compensate, re-prove). Failure-handling *is* the control — drill the miss like the fire.
:::
