# VAPT: Burp Suite & Metasploit

**Proxy the traffic, weaponise the findings — intercept/modify/replay with Burp, exploit/post with Metasploit (lab-authorized).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Customs Inspection + Armoury
**Burp** is the customs hall every browser byte trudges through (intercepting proxy + CA cert in the test browser): officers *read* (history/site map), *tamper* (modify/replay requests), *probe* (intruder payloads, scanner checks) — nothing crosses uninspected. **Metasploit** is the armoury next door: racks of *exploits* (keyed by CVE/service), *payloads* (shell/bind/reverse/Meterpreter agents), *encoders* (shape-shift past filters), *post* modules (loot/escalate/persist) — pick weapon + warhead, set RHOSTS/LHOST, fire (at consented targets only).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Burp workflow + Metasploit anatomy

* Burp: scope → spider/crawl → proxy-tamper (SQLi/XSS manual proofs live here) → intruder (positions + payload lists: fuzz/credential) → scanner (audit items) → repeater (craft proofs) → report/fix/retest loop.
* MSF: exploit (delivery) + payload (effect: `windows/meterpreter/reverse_tcp` style) + encoder/nop + auxiliary (scan/fuzz, no shell) + post (gather/escalate) → sessions → `migrate/hashdump/cleanup` → fix → retest-verify.

::: callout-formula KTU Formula Vault: VAPT Loop
Scope → map → tamper → weaponise → post → fix → **retest-verify** · consent **written, always**.
:::

::: callout-pitfall Scan-and-Declare (No Retest) Fails Audits
Findings without fix-verification (re-scan proving closure) are observations, not assessments — VAPT *ends* at verified remediation (residual risk or clean bill). Report-fix-retest is the loop; scan-only is half a job graded so.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"DVWA (your lab) login looks SQLi-prone. Burp-manual proof chain, then Metasploit path if RCE confirms — scoped, step-logged, ending in fix + retest."
:::

::: step [Step 2: Execution] Proxy to Post (Consented Lab)
1. Scope DVWA host only; proxy browser (CA installed); map app; intercept login POST; repeater-fuzz `admin' OR '1'='1` → auth bypass (screenshot + request/response pair as evidence).
2. If upload/RCE vector confirms: MSF matching exploit (service/version-keyed), reverse payload to lab listener, session → `sysinfo/hashdump`-style loot demo → *stop*, document.
3. Fix: parameterized queries + least-privilege DB user + WAF rule draft; re-run Burp scan + manual replay → clean evidence; residual notes (rate-limiting recommended).
:::

::: step [Step 3: Conclusion] Final Result
Evidence pairs (request/response, session proof), fix with code shape, retest deltas — deliverables, not vibes. Every step logged with scope header: authorised proof, not anecdote.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Intercepting proxy needs a CA cert in the test browser because:
(A) Browsers require all CAs
(*B) Burp terminates TLS to *read* (minting host certs on the fly); without trusting its CA, browsers scream (pinning/HSTS correctly!) — lab-only trust, removed after
(C) It speeds traffic
(D) HTTP needs certs
::: explanation
TLS-interception *is* sanctioned MITM: forge-per-host + trusted-forger-cert. Pinning/HSTS resisting it shows defenses working — bypasses (pin removal in lab apps) are themselves documented test steps, never silent.
:::

::: quiz Q2: Foundational Concept
Auxiliary vs exploit modules in Metasploit:
(A) Same effects
(*B) Auxiliary: no shell (scan/fuzz/denial-test/admin checks) — safe-ish recon; exploit: delivers payload → session (the point of no return, heaviest authorisation + care)
(C) Auxiliary needs no target
(D) Exploits only scan
::: explanation
Effect-class split gates caution: auxiliaries map, exploits *change* (shells, crashes risked). Ordering (aux first, exploit on matched versions, post with restraint) is the procedural discipline.
:::

::: quiz Q3: Foundational Concept
Reverse vs bind payload connection direction:
(A) Cosmetic naming
(*B) Reverse: target dials *out* to listener (egress-permissive networks, NAT-friendly); bind: listener dials *in* (needs inbound reachability, firewall-hostile) — egress shapes the pick
(C) Reverse is louder
(D) Bind is encrypted
::: explanation
Firewall egress usually looser than ingress — reverse shells surf out where bind shells knock blocked doors. Direction follows firewall reality, chosen per engagement's traffic audit.
:::
