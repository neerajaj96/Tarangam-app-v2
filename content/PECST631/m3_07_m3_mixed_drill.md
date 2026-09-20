---
id: m3_07_m3_mixed_drill
courseCode: PECST631
module: 3
sequence: 7
title: 'M3 Drill: White-Box Mastery Sprint'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Sprint maps, tours, pairs and sieges as reflexes
  - Keep structural testing straight under pressure
  - Verify every white-box verdict before committing
concepts:
  - white-box sprint
  - structural reflexes
prerequisites:
  - m3_01_graph_coverage_prime_paths
  - m3_03_cfg_loops_exceptions
  - m3_04_design_call_inheritance
  - m3_05_security_owasp_burp
examRelevance: high
tags:
  - white-box
  - m3-drill
---
# M3 Drill: White-Box Mastery Sprint

**Graphs, flows, designs, sieges — structural testing as reflexes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Structure Sprint
Map (CFG/call/design!) → tour (rung-matched!) → pair (du/coupling!) → besiege (STRIDE→tool!) → verify (retest deltas!). Sprint structures in scope order (code→design→adversary!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sprint sheet

$V(G)$ floors · prime/round-trip tours · du ladders + feasible denominators · Liskov contracts · STRIDE→Top-10→ZAP/Burp→fix→retest.

::: callout-formula KTU Formula Vault: Sprint
Map → tour → pair → besiege → verify.
:::

::: callout-exam KTU Exam Focus
M3's 9-markers pair coverage mechanics (graph/du numerics!) with security methodology (threat-model→tool→fix→retest!) or design-level reasoning (Liskov/coupling!). Mechanics-plus-methodology per answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Login handler ($12$ nodes, $15$ edges): (a) $V(G)$ + tour ambition? (b) STRIDE one flow (credential check)? (c) Liskov angle on an SSO subclass overriding password-check to always-true (debug leftover!)?"
:::

::: step [Step 2: Execution] Sprint Answers
1. (a) $15-12+2=5$ basis floor (5 path-ambitions minimum!).
2. (b) Spoofed creds? Tampered request? Repudiated logins (unsigned audit!)? Disclosed timing (user-enumeration via response deltas!)? DoS (hash-cost burns? expensive argon per attempt!)! Elevation (debug flag?!).
3. (c) Always-true override *betrays* the contract (authentication vacated!) — Liskov violation with security impact (subclass must strengthen-or-equal guarantees, never dissolve them!).
:::

::: step [Step 3: Conclusion] Final Result
Floor-then-tours, STRIDE-per-flow, contract-judged overrides — sprint completeness across structural levels. Security-flavoured structural reasoning (timing-DoS-Liskov!) is the distinction layer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Timing-enumerated users (login slower for valid names). Class + fix?
(A) Performance bug only
(*B) Information-disclosure via side channel (auth oracle!): constant-time compare + uniform responses (same work valid/invalid!) + rate limits — side-channel discipline ( Amend? No: *timing* discipline!)
(C) Feature, document it
(D) Longer passwords fix it
::: explanation
Side-channel class (behavioural leakage outside intended channels!) — constant-time compares, uniform flows, and rate limits are the timing discipline.
:::

::: quiz Q2: Mixed Drill
Expensive-hash login (argon $500$ms) + no rate limit. Attack + fix?
(A) Fine, strong hashing suffices
(*B) CPU-DoS via login spam (attacker spends bytes, server burns half-seconds — asymmetry weaponised!) — rate-limit + proof-of-work/captcha gates + separate lightweight pre-checks where safe
(C) Weaken hashing for speed
(D) Add more servers only (scales attacker win too!)
::: explanation
Asymmetry audit (attacker-cheap vs defender-pricey!) finds DoS surfaces in *defenses themselves* (strong-KDF irony!). Gate-before-burn (cheap checks first!) rebalances — defense cost-aware design.
:::

::: quiz Q3: Mixed Drill
Debug-flag auth bypass in subclass shipped. Root methodology miss?
(A) Bad luck
(*B) Contract-unchecked override (Liskov review absent!) + no security-gated code review (debug paths need removal-checklists!) + subclass behaviour untested against parent contract (substitutability suite missing!) — triple miss, process-fixed three ways
(C) Junior developer fault (blame individuals never fixes systems!)
(D) Unavoidable in practice
::: explanation
Systemic triad (contract review + debug hygiene + substitutability suites!) — blameless postmortem format (process gaps, not persons!). Miss-triangulation (three independent catches, all absent!) structures retrospectives.
:::
