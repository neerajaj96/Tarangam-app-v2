---
id: m1_06_m1_mixed_drill
courseCode: PBCST604
module: 1
sequence: 6
title: 'M1 Drill: Threat-to-Shell in One Sitting'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Run rank, dossier, spill, probe, proof and session in order
  - Verify every fix instead of claiming shells
  - Keep the offensive arc straight under time pressure
concepts:
  - offensive arc
  - threat-to-shell chain
prerequisites:
  - m1_01_infosec_threats_risk
  - m1_02_reconnaissance_gathering
  - m1_03_buffer_stack_overflow
  - m1_04_format_string_vuln_drill
  - m1_05_vapt_burp_metasploit
examRelevance: high
tags:
  - vapt
  - m1-drill
---
# M1 Drill: Threat-to-Shell in One Sitting

**Ledger, dossier, spill, probe, proxy, payload — the full offensive arc as exam reflexes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Six Stations Drill
Risk-rank → recon-quiet → overflow-math → format-probe → Burp-proof → MSF-session → fix-retest. Run the arc; each station's output feeds the next (risk justifies scope, recon aims overflow targets, leaks aim payloads, proofs demand fixes).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Arc checklist

CIA-triage · ALE math · passive-first recon + scope · offset/payload/mitigation-break · `%x`→`%n` escalation · proxy-tamper evidence · exploit+payload+post restraint · verified remediation.

::: callout-formula KTU Formula Vault: Arc
Rank → dossier → spill → probe → proof → session → **verified fix**.
:::

::: callout-exam KTU Exam Focus
M1's 6-markers chain stations (e.g. "buffer overflow: mechanism + payload + two mitigations with bypass notes" or "Burp+MSF workflow on DVWA with evidence and retest"). Chains, not islands — narrate handoffs between stations.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Lab binary: `gets()` into $32$-byte stack buffer, no canary/NX/ASLR (training build). Full arc sketch: offset, payload, session shape, then the three-flag fix + verification."
:::

::: step [Step 2: Execution] Arc in Miniature
1. Offset: $32+4 = 36$ to RET. Payload: `[36 pad][RET→sled][NOPs][execve-/bin/sh]` — sled absorbs aim wobble.
2. Session: direct shell (no staging needed unprotected) — demo `id`, stop, log.
3. Fix triple: `fgets` bounds + `-fstack-protector` + ASLR/NX on (rebuild flags); verify: same payload now aborts (canary) / segfaults unexploitable (NX) / misses (ASLR) — three breaks demonstrated, not asserted.
:::

::: step [Step 3: Conclusion] Final Result
Arc-complete answers (offense + defense + proof-of-defense) outscore pure-exploit writeups — the fix-retest tail carries a third of the marks by design (PBL spirit).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Gets-into-32, no protections. Bytes to RET and first payload field?
(A) $32$, shellcode first
(*B) $36$ ($32$ + saved EBP); then $4$-byte RET overwrite (aimed at sled) — padding *then* control data, order fixed
(C) $64$, sled first
(D) $4$, canary first
::: explanation
Layout order (buffer→EBP→RET) dictates fill order: pad through buffer+EBP, *then* the money bytes. Field order mirrors memory order — draw the stack, read the offsets off it.
:::

::: quiz Q2: Mixed Drill
`%x` leak shows libc pointer. Next offensive use?
(A) Immediate shell
(*B) De-randomise ASLR (compute libc base = leaked − known offset) → aim ret2libc/ROP reliably — disclosure *enables* the second stage; chain, don't stop
(C) Quit, info only
(D) Reboot target
::: explanation
Leaks are means (base addresses), not ends. Leak-then-exploit chains define modern practice — single-bug Rome-falls narratives are Hollywood; chains are coursework.
:::

::: quiz Q3: Mixed Drill
VAPT report without retest section is:
(A) Complete if findings are severe
(*B) Incomplete — unverified fixes are hypotheses; graders (and clients) demand fix-evidence deltas (before/after scans, replay proofs) closing every finding or accepting residual risk in writing
(C) Fine for internals
(D) Better (shorter)
::: explanation
Assessment ends at verified state: fixed-and-proven or risk-accepted-and-signed. Open findings without owners/dates are observations, not outcomes — close the loop on paper as in practice.
:::
