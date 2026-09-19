---
id: m2_06_email_security
courseCode: PBCST604
module: 2
sequence: 6
title: 'Email Security: Risks, Protocols & Safe Use'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Spot spoofed stamps and malicious payloads on phishing turf
  - Align and enforce sender identity with the SPF, DKIM and DMARC trio
  - Raise human firewalls alongside protocol fixes
concepts:
  - email spoofing
  - sender authentication
  - phishing defense
prerequisites: []
examRelevance: medium
tags:
  - web-security
  - email-security
---
# Email Security: Risks, Protocols & Safe Use

**Phishing's home turf — spoofing, malicious payloads, and the authentication trio (SPF/DKIM/DMARC) plus human firewalls.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Postcards with Forged Stamps
Classic email is a *postcard* (plaintext hops, `From:` self-declared — forgery trivial!). **Phishing** forges the bank's letterhead (spoofed display names, lookalike domains, urgency prose); payloads ride attachments/macros/links. Defenses triple-lock: **SPF** (which post offices may send for us — DNS allow-list), **DKIM** (wax seal — cryptographic signature over headers/body), **DMARC** (butler's instructions — align + quarantine/reject policy + snitch reports). Humans: verify channels, hover links, sandbox attachments.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Protocols + trio mechanics

* Transport: SMTP (send, plaintext legacy → STARTTLS/MTA-STS opportunistic upgrades), IMAP/POP3 retrieval (+TLS). Open relays abused (now rare, historically spam cannons).
* SPF: DNS TXT lists authorised senders (envelope-from checked). DKIM: domain signs canonicalised headers/body (tamper-evident). DMARC: alignment (SPF/DKIM × From domain) + policy (none/quarantine/reject) + aggregate forensic reports (rua/ruf).

::: callout-formula KTU Formula Vault: Email Trust
Postcard + **forged stamps** · SPF **who-sends** · DKIM **sealed** · DMARC **align+enforce+report**.
:::

::: callout-pitfall SPF Alone Forwards-Broken
Forwarders rewrite envelopes (SPF fails innocently); DKIM signatures *survive* forwarding (body intact) — the pair covers what singles can't. Single-mechanism verdicts mislead; trio-reading (DMARC aggregates) is the analyst habit.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Suspect invoice mail: `From: accounts@your-bankk.com`, urgent wire request, `.xlsm` attached. Forensic walk (headers → auth → payload → verify) + trio posture that would have flagged it."
:::

::: step [Step 2: Execution] Envelope Autopsy
1. Display-vs-envelope mismatch (`bankk` typo-squat; `Reply-To` freeloads elsewhere) — lookalike + reply-routing double tell.
2. Auth: SPF softfail/none (typo domain has *some* record — attacker-owned!), DKIM absent, DMARC `p=none` (report-only policy: delivery proceeds, no enforcement!). Trio *present-but-unenforced* — the precise failure.
3. Payload: `.xlsm` macro malware class — sandbox detonation + hash lookup, never double-click forensics.
4. Out-of-band verify (call the vendor on known numbers — process beats headers).
:::

::: step [Step 3: Conclusion] Final Result
Mismatch tells, auth-trio read (present? aligned? enforced?), sandboxed payload, voice-verified wire. Four stations, wire-fraud specifically needs the *call-back* line — process closes what tech can't.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
DMARC `p=none` vs `p=reject` differ operationally by:
(A) Report volume only
(*B) None: monitor/collect (delivery unaffected — visibility phase); reject: unauthenticated mail *refused* (enforcement — spoofing dies at receivers, legit misconfig risk owned first!)
(C) Encryption strength
(D) Nothing observable
::: explanation
Policy ladder (none→quarantine→reject) phases enforcement with telemetry: reports first (who fails legitimately?), then teeth. Jumping to reject blind incinerates forwarding lists/newsletters — phase discipline is the deployment moral.
:::

::: quiz Q2: Foundational Concept
Typosquat + Reply-To divergence as tells work because:
(A) Filters catch all else
(*B) Attackers must *receive* replies/victims somewhere they control (Reply-To/external forms) while *displaying* trust (lookalike From) — the control-vs-trust split leaves paired discrepancies defenders read
(C) Users read headers always
(D) Domains can't be faked
::: explanation
Operational needs (harvest replies, host payloads) force attacker infrastructure into headers/bodies beside spoofed trust marks. Paired-tell reading (display vs envelope vs reply-path) is the analyst reflex.
:::

::: quiz Q3: Foundational Concept
Macro malware persists via email because:
(A) Antivirus ignores macros
(*B) Documents are trusted *data* with executable *features* (macros/scripts) + user-enabled content under urgency pretexts — data/code boundary blurred exactly where vigilance dips (invoice/payroll lures)
(C) Macros can't be disabled
(D) Email encrypts them
::: explanation
Trusted-format + executable-feature + social trigger = delivery triad. Defenses layer: block-by-default macros (policy), sandbox detonation, extension honesty (show them!), verification culture — no single wall holds the triad.
:::
