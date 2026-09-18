# Attacks, Services, Mechanisms & Design Principles

**Security vocabulary with teeth — threat models, what we guarantee, how, and the principles that survive contact.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Castle Doctrine Scroll
**Attacks** catalogue sieges (passive reading vs active forging! — X.800 pairs!). **Services** promise outcomes (confidentiality/authenticity/integrity/non-repudiation/availability!). **Mechanisms** are the troops (encipherment, signatures, access control, data integrity, authentication exchange, notarization...!). **Design principles** (Saltzer–Schroeder: least privilege, fail-safe defaults, economy, complete mediation, open design, separation, least common mechanism, psychological acceptability!) are doctrine surviving every siege-engine upgrade. Doctrine outlives weaponry — learn principles deepest.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 X.800 pairs + eight principles (name all eight!)

* Attacks: interruption/interception/modification/fabrication (threat quartet!); passive (release/traffic analysis!) vs active (masquerade/replay/modify/DoS!).
* Services ↔ mechanisms mapping (which troops deliver which promise — exam table!): confidentiality←encipherment+access; authenticity←signatures/auth-exchange; integrity←MICs/hashes; non-repudiation←signatures+notarization; availability←redundancy/filtering (partial!).
* Principles (all eight, one-line each — rote-plus-reason!).

::: callout-formula KTU Formula Vault: Doctrine
Attacks **passive/active quartets** · services **5 promises** · mechanisms **troops per promise** · principles **Saltzer–Schroeder 8**.
:::

::: callout-pitfall Open Design ≠ Open Deployment
"Open design" (no security-through-obscurity — Kerckhoffs!) governs *mechanisms*, not *operations* (keys/configs stay secret!). Publishing algorithms ≠ publishing passwords — principle scoped precisely or inverted dangerously.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Bank transfer system: (a) classify wiretap-reading vs forged-transfer vs deleted-logs vs fake-server (quartet + passive/active)? (b) Service+mechanism per threat? (c) Which two principles do password-only admin logins violate?"
:::

::: step [Step 2: Execution] Quartet, Map, Indict
1. Wiretap = interception (passive!); forged transfer = fabrication+modification (active!); deleted logs = modification + accountability-kill; fake server = masquerade/fabrication (active!).
2. Interception→confidentiality (TLS!); fabrication→authenticity (mutual auth!); modification→integrity (MACs!) + non-repudiation (signatures for disputes!).
3. Least privilege (admin-everything accounts!) + psychological acceptability (unusable policies get bypassed — sticky-note passwords!) — principles indicting practice, doubly useful.
:::

::: step [Step 3: Conclusion] Final Result
Classify (quartet+passive/active!), map (service+mechanism!), indict (principles vs practice!). Triple motion per scenario — doctrine applied, not recited.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Traffic analysis (who-talks-when-how-much, contents unread!) is:
(A) Active fabrication
(*B) Passive interception-class (confidentiality of *metadata* breached without touching content! — countered by padding/cover traffic/onion routing, not encryption of payloads!)
(C) Harmless always
(D) Modification attack
::: explanation
Content-confidential ≠ relationship-confidential (who-called-the-clinic leaks without a word read!). Metadata-attack class (traffic analysis!) needs traffic-shaping defenses (padding/cover/mixnets!) — payload crypto insufficient, stated precisely.
:::

::: quiz Q2: Foundational Concept
Non-repudiation needs signatures (+notarization) rather than MACs because:
(A) MACs are slow
(*B) Shared-key MACs can't arbitrate *between* key-holders (both could have stamped! — judge can't decide!); signatures bind asymmetric identity (private-key-only origin, publicly verifiable — third-party adjudication possible!)
(C) MACs lack keys
(D) Signatures encrypt
::: explanation
Symmetric shared secrets prove *membership* (one of us!), asymmetric proves *authorship* (exactly this one!). Dispute-resolution needs authorship (non-repudiation = adjudicable origin!) — key-asymmetry is the adjudication enabler.
:::

::: quiz Q3: Foundational Concept
Fail-safe defaults vs psychological acceptability tension example:
(A) No tension exists
(*B) Lock-everything defaults (safe!) users bypass via shadow IT (unusable!) — balance: secure *and* smooth paths (SSO, passkeys!) so the easy way *is* the safe way (design accepts human reality!)
(C) Defaults don't matter
(D) Users love friction
::: explanation
Principle-vs-principle trade (both Saltzer–Schroeder!): defaults-deny secured, acceptability keeps humans inside the system (bypass-proofing by attractiveness!). Tension named + resolved-by-design (smooth-secure paths!) is the mature answer.
:::
