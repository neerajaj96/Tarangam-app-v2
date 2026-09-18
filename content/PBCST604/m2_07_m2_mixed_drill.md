# M2 Drill: Web Attack Triage at Pace

**SQLi vs XSS vs CSRF vs DNS vs phish — classify in seconds, prescribe in layers.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Symptom Cards
Error-spewing login → SQLi. Alert-box comment → XSS. Silent money move → CSRF. Wrong-site IP → DNS. Urgent invoice macro → phish. Symptom → family → primary fix, before coffee cools.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Triage table

| Symptom | Family | Primary fix | Layer-2 |
|---|---|---|---|
| tautology/UNION/errors | SQLi | parameters | least-privilege, generic errors |
| script executes | XSS | per-context encoding | HttpOnly, CSP |
| forged state-change | CSRF | tokens + SameSite | GET-purity, re-auth |
| misresolved domain | DNS | DNSSEC validation | port randomisation, RPZ |
| urgent lure + payload | phish | verify out-of-band | SPF/DKIM/DMARC-enforce, sandbox |

::: callout-formula KTU Formula Vault: Triage
Symptom → family → **structural fix** → **layered remainder**.
:::

::: callout-exam KTU Exam Focus
M2's 6-markers stage one attack fully (mechanism + demo-shape + layered fix) or compare two (XSS vs CSRF; SQLi vs XSS — the classic). Family vocabulary exact (ride/steal/echo/inject) decides grades.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Lab reports: (a) search box reflects input unescaped, (b) transfers via GET with cookies, (c) login errors leak table names. Triage + first fix each, ordered by exploitability."
:::

::: step [Step 2: Execution] Cards Dealt
1. (c) SQLi (error verbosity = schema oracle): parameters + generic errors — data-breach class, first.
2. (a) Reflected XSS (echo without encoding): per-context encode + CSP draft — needs lure, second.
3. (b) CSRF (GET writes + auto-cookies): POST + tokens + SameSite — needs lure + session, third. (All lab-scoped, benign proofs.)
:::

::: step [Step 3: Conclusion] Final Result
Severity ordering (data-loss > code-exec > request-forge, adjusted per context) plus structural fix per card. Order-and-fix is the triage answer shape.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Comment `<img src=x onerror=alert(1)>` executes. Family + primary fix?
(A) SQLi; parameters
(*B) XSS (event-handler vector, no `<script>` needed); primary: per-context output encoding (attribute/HTML encoders neutralise the breakout)
(C) CSRF; tokens
(D) DNS; DNSSEC
::: explanation
No-script-tag ≠ safe: event handlers/attributes execute too (encoding must cover *sinks*, not just tags). Vector variety is why sink-matched encoding (not tag blacklists) is the fix doctrine.
:::

::: quiz Q2: Mixed Drill
`transfer.php?to=me&amt=999` moves money on visit. Family + fix?
(A) XSS; encoding
(*B) CSRF over GET writes; fix: POST + synchronizer tokens + SameSite (method + secret + browser gate, layered)
(C) SQLi; parameters
(D) Phishing; training
::: explanation
GET-write + cookie-auto-attach = textbook forge surface. Triple fix (method/token/gate) each blocks independently — defense-in-depth stated per layer, not lumped.
:::

::: quiz Q3: Mixed Drill
Which fix belongs to which: parameters, tokens, DNSSEC?
(A) XSS, SQLi, CSRF respectively
(*B) SQLi (query/data channel split), CSRF (unreadable per-request secret), DNS (answer authentication) — mechanism-matched, never swapped
(C) All fix XSS
(D) Interchangeable picks
::: explanation
Fix families bind to *vulnerability mechanics* (injection→separation, forgery→secrets, spoofing→signatures). Mechanism-matched prescription is the mastery signal — mismatched fixes (tokens for SQLi!) fail loudly in grading.
:::
