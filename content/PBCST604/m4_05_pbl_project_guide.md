# PBL Project Guide: 4 Builds, End to End

**The 30-mark project third of CIE — Wireshark, ZAP, Burp, Metasploit builds with milestones that map to the evaluation rubric.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Thesis Defense in Sprints
PBL grades *process* (proposal 5 + progress 4 + teamwork 3 + execution 10 + final 5 + quality/innovation 3 = 30): proposal sells the story, milestones prove motion, execution delivers artefacts, defense tells it in 5 minutes (+2–5 min video!). The four suggested builds (Wireshark analysis, ZAP test, Burp vuln-ID, Metasploit pentest) each map one-to-one onto M1–M3 tool topics — coursework becomes project ammo directly.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Build→module map + rubric targeting

* Wireshark traffic analysis → M3.6 skills (filters/streams/graphs); deliver: pcap + findings table + fix memo.
* ZAP framework test → M2.5+M1.5 (scan policies, alert triage with proofs); deliver: ZAP report + false-positive proofs + rescan deltas.
* Burp vuln-ID → M1.5/M2.1–2 (proxy proofs, SQLi/XSS chains); deliver: request/response evidence pairs + patched code + replay-clean proof.
* Metasploit pentest → M1.3–5 (lab range: Metasploitable-style, scoped!) + M4 hardening (mitigations applied post-exploit); deliver: session logs (redacted), privesc path, hardening diff, retest.
* Rubric mapping: proposal (problem+method+ethics-scope!) → progress demos (biweekly evidence drops) → teamwork log (who-did-what ledger) → execution (artefacts above) → final (story arc: threat→proof→fix→verify) → innovation (one novel twist: custom rule/signature/dashboard!).

::: callout-formula KTU Formula Vault: PBL Third
30 marks = **story+motion+team+artefacts+defense+twist** · ethics-scope **first page** · retest-deltas **close every finding**.
:::

::: callout-pitfall Scope Omission Sinks Defense Day
Unauthorised-target ambiguity ("we scanned the college site to help!") fails *ethics* before technical marks start — written scope (own lab IPs/ranges, dates, supervisor sign) heads every report. Permission paperwork outranks payload cleverness in PBL grading reality.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Draft the 6-rubric plan for the Burp build (4-member team, 8 weeks) with dated artefacts per rubric line."
:::

::: step [Step 2: Execution] Rubric-Dated Plan
1. Wk1–2 proposal (5): DVWA-local scope doc + SQLi/XSS learning goals + ethics sign-off.
2. Wk3–6 progress (4+3): biweekly demos (proxy setup → first proofs → chains) + ledger (Alice: SQLi, Bob: XSS, Cara: fixes, Dev: report/video).
3. Wk5–7 execution (10): evidence pairs (10+ findings), patched fork, replay-clean ZAP rescan deltas.
4. Wk8 final (5+3): 5-min defense (threat→demo→fix→verify arc) + 3-min video + twist (custom Burp match-replace rule auto-flagging lab's flaw pattern!).
:::

::: step [Step 3: Conclusion] Final Result
Rubric lines become calendar blocks with named artefacts and owners — evaluators tick boxes you pre-labelled. Pre-labelled compliance (artefact per rubric line) is the meta-strategy: make grading easy.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
PBL execution's 10 marks reward primarily:
(A) Fancy slides
(*B) Timeline-milestone adherence + theory-to-practice transfer (tool skills applied to scoped targets) + working final result — process fidelity plus functioning outcome, evidenced (logs, diffs, rescans)
(C) Team size
(D) Tool count
::: explanation
Milestones-kept, knowledge-applied, result-working: the triple evidences engineering (not demo-ware). Artefact chain (plan→logs→result→retest) proves all three — collect contemporaneously, not the night before.
:::

::: quiz Q2: Foundational Concept
"Innovation" 3 marks for a coursework-mapped build means:
(A) Novel CVE discovery required
(*B) One owned twist beyond tutorials (custom detection rule, dashboard, automation script, hardening diff with rationale) — original *contribution*, not original *vulnerability*; scoped ambition beats moonshots
(C) Published paper
(D) Expensive tools
::: explanation
Twist > thesis: extend the tutorial (automate the boring part, visualise the findings, generalize the fix). Evaluable novelty (demoable in defense minutes) outscores claimed novelty — show, don't assert.
:::

::: quiz Q3: Foundational Concept
Teamwork ledger's job in grading:
(A) Blame allocation
(*B) Individual-contribution evidence (who owned which rubric slice, commit/demo trails) — free-rider-proofing plus fair differentiation; 3 marks for *demonstrated* collaboration (reviews, handoffs, joint debugging logs)
(C) Attendance proxy
(D) Decorative appendix
::: explanation
Groups are graded as teams *and* persons: ledgers (rotating roles, review trails, handoff notes) make both visible. Collaboration artefacts (not claims) earn it — log help given/received as it happens.
:::
