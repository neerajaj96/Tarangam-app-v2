# Protocol Drill: Sign, Verify & Chain Walk

**Ceremony traces — signature round-trips, chain validation runs, and revocation decisions under time pressure.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Notary Drill Hall
Stamp (hash+private!), check (hash+public!), chain-walk (leaf-to-root!), freshness-check (dates+revocation!), name-match (SAN!). Drill halls repeat ceremonies until muscle memory — exam halls reward the same.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Ceremony scripts

Sign: hash → pad → private-op → attach (detached/cleartext/enveloping choice!). Verify: recompute hash → public-op → compare (constant-time!) → chain → names → dates → revocation → EKU. Drill faults injected (expired leaf! wrong SAN! revoked inter! raw-sign malleability!) — diagnose each by failing stage.

::: callout-formula KTU Formula Vault: Ceremonies
Stamp → check → chain → freshen → name (fail **closed** at first red!).
:::

::: callout-exam KTU Exam Focus
Protocol answers want *ordered* ceremony traces (step N fails ⇒ verdict N!) — sequence-graded. Fault-injection variants (one poisoned input per question!) test stage-discrimination: name the failing stage, not just "invalid".
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Verify queue: (a) RSA sig $s=16$ on $H=4$ ($n=33,e=3$ — M3 numbers!) — verdict? (b) Chain: leaf SAN `a.com`, visited `b.com` — verdict? (c) Cert valid, OCSP `revoked` — verdict + action?"
:::

::: step [Step 2: Execution] Stage Verdicts
1. (a) $16^3\bmod33=4$ ✓ (M4.3 receipt!) — signature stage passes (proceed down-chain!).
2. (b) SAN mismatch ⇒ hard fail (no click-through in code! — name-check stage red!).
3. (c) Revoked ⇒ refuse + alert + rotate Hunt (freshness stage red — fail-closed, incident ticket opened, no soft-fail bypass without written risk-acceptance!).
:::

::: step [Step 3: Conclusion] Final Result
Per-stage verdicts with evidence cited (numbers/names/statuses!) plus fail-closed discipline throughout. Stage-cited verdicts (which check failed!) outscore blanket invalids.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Detached vs enveloping vs cleartext signatures differ by:
(A) Crypto strength
(*B) Payload packaging (detached: sig beside data!; cleartext: readable + sig block (PGP-signed mail!); enveloping: data inside sig wrapper!) — verification needs differ (fetch payload + sig pair correctly per type!)
(C) Key sizes
(D) Hash choices
::: explanation
Packaging shapes verification plumbing (what to hash alongside what!) — type confusion breaks verifiers (hashing the wrapper vs content!). Packaging-aware verification (match type first!) prevents category errors.
:::

::: quiz Q2: Mixed Drill
Expired-yesterday leaf, chain otherwise perfect. Verdict?
(A) Accept (close enough!)
(*B) Reject (validity windows are binary gates — yesterday-expired = untrusted *now*, regardless of history!; renewal + rotation, no grace-period hand-waving in code!)
(C) Warn-and-continue silently
(D) Re-validate next week
::: explanation
Time-gates don't grade curves (valid/invalid only!) — expiry rejects outright (operational pain acknowledged separately via renewal automation!). Binary-gate discipline (no near-miss mercy!) is the validity moral.
:::

::: quiz Q3: Mixed Drill
Timestamp authority (TSA) added to signatures buys:
(A) Faster verification
(*B) Existence-proof at time-T (hash existed then — counters backdating *and* expiry disputes: signed-when-valid stays provable post-expiry with TSA evidence + chain-at-time archives!)
(C) Stronger hashes
(D) Smaller signatures
::: explanation
Time-anchoring (trusted clock attests hash-at-T!) extends verifiability past cert lifetimes (long-term validation!). Evidence-bundle thinking (sig+TSA+chain-archive!) completes courtroom-grade answers.
:::
