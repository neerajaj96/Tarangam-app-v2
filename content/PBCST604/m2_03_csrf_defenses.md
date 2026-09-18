# CSRF: Riding Sessions & Defenses

**Forged requests wearing your cookies — state-changing GETs, token synchronisation, and SameSite shields.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Forged Hall Pass
You're logged into bank.example (session cookie in pocket). Attacker's page hides `<img src="https://bank.example/transfer?to=evil&amt=1000">` — *your* browser dutifully attaches *your* cookie (browsers auto-present credentials!) and the bank obeys a request you never made. CSRF doesn't *steal* sessions (XSS does) — it *rides* them. Defenses: per-request secret handshakes (**tokens** the attacker page can't read, thanks SOP), **SameSite** cookies (don't attach cross-site), state-changes never via GET.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Mechanics + defense stack

* Requirements: victim authenticated + state-changing endpoint + predictable request shape + cookie/session auto-attach.
* Fixes: synchronizer tokens (per-session secret in forms, validated server-side — primary), SameSite=Lax/Strict cookies (browser-gated attach), custom headers for APIs (preflight-gated), GET-purity (reads only), user re-auth for crown actions.

::: callout-formula KTU Formula Vault: CSRF
Ride ≠ **steal** · fix = **unreadable token + SameSite + no-GET-writes**.
:::

::: callout-pitfall CSRF Tokens ≠ CAPTCHAs/XSS Fixes
Tokens ride in-page (SOP-shielded from attacker origins); XSS *inside* the page reads them (token defeat needs XSS first — layered model explicit!). Conflating token scope (CSRF-only) with XSS cure overclaims — state the dependency.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Lab bank: `GET /transfer?to=&amt=` + cookie session. (a) Forge page sketch (benign lab amounts)? (b) Token defense wiring? (c) SameSite effect on the forge?
:::

::: step [Step 2: Execution] Forge, Token, Gate
1. Attacker page embeds the image-GET (victim visit → transfer fires with victim cookies — lab ledger shows rogue entry; tiny amounts, own accounts, logged).
2. Server plants per-session token in transfer form; validates on POST (moved off GET!); forge lacks token (cross-origin unreadable) → rejected.
3. SameSite=Lax: top-level-GET *image* requests go cookieless → forge arrives unauthenticated → fails closed. (Strict would also gate top-level navigation posts.)
:::

::: step [Step 3: Conclusion] Final Result
Forge-demo (benign, logged), token wiring (unreadable-secret logic), SameSite gating (browser-enforced attach rules). Riding-vs-stealing vocabulary throughout — precision is the topic's currency.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
CSRF vs XSS session abuse differ by:
(A) Same attack renamed
(*B) CSRF *rides* the live session cross-origin (no theft, forged requests); XSS *runs code* in-origin (theft/riding/actions — strictly more powerful, and it defeats CSRF tokens by reading them)
(C) CSRF steals passwords
(D) XSS needs no victim
::: explanation
Capability ladder: CSRF ⊂ XSS (XSS subsumes CSRF's effects plus theft). Hierarchy stated per answer — riding (request forgery) vs running (code execution) is the bright line.
:::

::: quiz Q2: Foundational Concept
Synchronizer token works because of SOP:
(A) Tokens encrypt requests
(*B) Attacker origin cannot *read* the victim page's token (same-origin policy walls cross-origin reads) — forgery can't include what it can't see; server rejects tokenless writes
(C) Tokens expire fast
(D) Browsers hide tokens
::: explanation
Unpredictability + unreadability (cross-origin) jointly gate: random per-session value, SOP-walled from forgers. XSS-inside breaks the wall (reads tokens) — dependency declared, not hidden.
:::

::: quiz Q3: Foundational Concept
State-changing GET is the enabler because:
(A) GETs are faster
(*B) GETs fire without consent surface (images, links, preloads, redirects) — any embedded URL executes; POST+token/SameSite gates add friction attackers can't cross silently
(C) POSTs can't transfer
(D) Browsers prefer GET
::: explanation
Side-effect-free GET (HTTP contract) keeps ambient traffic safe; writes-behind-POST+token make forgery *constructible-only-with-secrets*. Method semantics as security boundary — design rule, not style.
:::
