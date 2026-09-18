# M4 Drill: Trust Decisions at Pace

**Hash-grade, sign-round, chain-walk, revoke-call — M4 as verification reflexes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Four-Stamp Sprint
Grade (resistance-per-use!) → round-trip (sign/verify!) → walk (chain+names+dates!) → call (revocation verdict!). Sprint stamps in order — trust decisions at pace.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sprint sheet

Grades **per-use** · sign **hash+private** · verify **hash+public** · walk **chain/names/dates** · revoke **fail-closed** · distribute **KDC/envelope/DH+sign**.

::: callout-formula KTU Formula Vault: Sprint
Grade → round-trip → walk → call.
:::

::: callout-exam KTU Exam Focus
M4's 9-markers stage hash/MAC reasoning *or* signature lifecycles *or* PKI validation chains fully (mechanics + math + failure-modes!). Stage-ordered traces with failure branches (what-if-red per stage!) score completely.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Password system stores raw-SHA256 (unsalted!). (a) Attack menu? (b) Bcrypt migration without plaintexts? (c) Posture after (grades per asset!)?"
:::

::: step [Step 2: Execution] Menu, Migrate, Grade
1. (a) Rainbow tables (unsalted reuse across users!) + GPU brute force (fast hash!) + identical-password clustering (equality visible!) — three-course menu.
2. (b) Opportunistic upgrade (verify-against-SHA256 at login → bcrypt+salt write-through!; grace sweep + force-resets for stragglers!).
3. (c) Grades: preimage-per-user (salted!), work-factor wall (bcrypt cost!), equality-hidden (random salts!) — per-threat grades, not vibes.
:::

::: step [Step 3: Conclusion] Final Result
Menu-then-migrate-then-grade: attack enumeration drives migration design drives posture claims. Threat-driven migration (named attacks first!) is the answer spine.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
HMAC-SHA256 vs raw-SHA256(key‖msg) for API auth:
(A) Equivalent (both keyed hashes!)
(*B) HMAC (extension-proof nesting!) vs raw-concat (length-extension forgeable sans key!) — construction gap, not key-length gap (both "keyed" superficially!)
(C) Raw is faster, pick raw
(D) Both broken equally
::: explanation
Structural/authentication analysis (forge-without-secret possible?) separates them (extension demo decides!). Construction-aware picks (nested envelopes!) over label-matching ("both keyed"!) — mechanism, not marketing.
:::

::: quiz Q2: Mixed Drill
Signature verifies, chain walks, OCSP good, SAN matches, but cipher negotiated RC4 (M3 lineage!). Verdict?
(A) Green light (checks passed!)
(*B) Amber-to-red: authentication solid, *confidentiality* rotten (RC4 biases/breaks — M3 reunion!) — overall posture fails closed-or-flags (weakest-link grading: chain strong, transport broken!)
(C) Green with note
(D) Re-run signature check
::: explanation
Per-leg grades (auth ✓, transport ✗!) compose by minimum (weakest link rules postures!). Verdict vocabulary (amber/red with leg-cited reasons!) resists single-check complacency.
:::

::: quiz Q3: Mixed Drill
Key rotation without revocation infrastructure means:
(A) Complete hygiene
(*B) Half-hygiene (fresh keys, zombie trust in old ones — stolen predecessors still verify until expiry!; rotation * cadence without kill-switch = graceful-phasing, not incident-response!)
(C) Useless ritual
(D) Revocation achieved
::: explanation
Rotation (proactive freshness!) vs revocation (reactive kill!) are distinct controls (both needed: rotate routinely, revoke on incident!). Control-pair completeness (lifecycle both ends!) is the key-management maturity check.
:::
