---
id: m4_04_key_mgmt_pki
courseCode: PECST637
module: 4
sequence: 4
title: 'Key Management, X.509 & PKI'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Distribute symmetric keys via KDC, envelope and signed exchange
  - Bind identities with SAN-checked X.509 certificates
  - Propagate revocations that actually unbind at scale
concepts:
  - key distribution
  - X.509 certificates
  - revocation
prerequisites:
  - m3_06_diffie_hellman_mitm
  - m4_03_digital_signatures
examRelevance: high
tags:
  - pki
  - key-management
---
# Key Management, X.509 & PKI

**The unsexy hard part — distributing symmetric keys, certifying bindings, and revoking trust at scale.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Key Ceremonies & ID Cards
**Symmetric distribution** needs couriers (KDCs/Needham-Schroeder ticket dances — trusted third parties dealing session keys!) or asymmetric envelopes (hybrid!). **X.509 certs** are ID cards (subject + public key + issuer signature + validity + extensions — CA-stamped bindings!). **PKI** is the DMV system (CAs, intermediates, roots in trust stores, revocation via CRL/OCSP/Must-Staple!). **Revocation** (stolen keys!) is the hard half (CRL bloat, OCSP privacy/latency, short-lived certs dodging the problem!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Distribution patterns + cert anatomy + revocation menu

* KDC pattern (master-key per principal, ticket-granting!); asymmetric envelope (RSA/KEM wrap!); DH + signatures (forward-secret agreement!); Kerberos sketch (AS/TGS/service tickets! — KDC-flavoured SSO!).
* X.509 fields (version/serial/signature-algo/issuer/validity/subject/SPKI/extensions: SAN *not* CN-cn! BasicConstraints CA:TRUE gating!).
* Chain building (leaf→inter→root-in-store!); validation (signature chain + validity window + revocation + name match + policy/EKU!); revocation (CRL deltas, OCSP stapling for privacy+freshness, short-lived auto-renew!).

::: callout-formula KTU Formula Vault: Trust Plumbing
Distribute via **KDC/envelope/DH+sign** · bind via **X.509 (SAN-checked!)** · unbind via **revocation-that-actually-propagates**.
:::

::: callout-pitfall CN-Only Name Checks (Deprecated Danger!)
Legacy CN matching misses SAN-only certs (modern CAs leave CN empty/generic!) — clients must check SAN dNSNames (RFC 6125+ reality!). Checklist-modernity (SAN-first!) separates current answers from decade-old ones.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Role-play TLS server-auth handshake validation (client side): chain, names, dates, revocation — ordered checklist with failure actions. Then: CA compromise tabletop (what rotates, in what order?)."
:::

::: step [Step 2: Execution] Validate, Then Contain
1. Chain (leaf→inter→store-root, signatures each!) → validity window (notBefore/After vs now!) → SAN match (exact/wildcard rules!) → revocation (OCSP-stapled preferred, soft-fail policy stated!) → EKU/policy (serverAuth present!) — abort-and-alert at first red (fail-closed!).
2. CA compromise: revoke CA cert (root-store removals propagate slowly — plan!), rotate intermediates first (containment!), reissue leaves (automation decides speed — ACME-style saves!), disclose per policy (transparency logs watched!).
:::

::: step [Step 3: Conclusion] Final Result
Validation checklist (ordered, fail-closed!) plus compromise runbook (rotate outward-in!). Checklist-plus-runbook pairing (steady-state + incident!) is the PKI answer completeness standard.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Kerberos tickets vs X.509 certs differ fundamentally by:
(A) Encryption strength
(*B) Online-trusted-third-party (KDC *participates* per authentication — tickets minted live!) vs offline trust (CA signs once, verifiers check solo — no CA call per handshake!) — availability/centralisation tradeoffs oppose!
(C) Ticket size
(D) Nothing architectural
::: explanation
Liveness-dependence (KDC must answer!) vs verification-autonomy (chain + clock suffice!) — central bottleneck vs distributed checking. Freshness/revocation economics follow (Kerberos short lifetimes natural; PKI revocation infrastructure needed!).
:::

::: quiz Q2: Foundational Concept
OCSP stapling fixes OCSP's:
(A) Crypto strength
(*B) Privacy (responder learns *who visits what* — browsing profiles!) + latency/availability (extra connection, soft-fail downgrades!) — server staples fresh OCSP response *in-handshake* (one flight, no third-party call!)
(C) Certificate size
(D) Clock skew
::: explanation
Third-party-query costs (privacy leak + blocking + soft-fail temptation!) moved server-side (stapled freshness, Must-Staple enforcement!). Query-placement analysis (who asks whom when?) generalises to privacy reviews broadly.
:::

::: quiz Q3: Foundational Concept
Short-lived certs ($\approx$days) dodge revocation by:
(A) Stronger keys
(*B) Expiry-as-revocation (misissued/stolen certs die alone within days — no distribution machinery needed!; automation (ACME!) mandatory (humans can't rotate daily!) — operational maturity prerequisite!)
(C) Smaller CRLs only
(D) Magic
::: explanation
Lifetime-as-safety-valve (blast window bounded by validity!) trades revocation infrastructure for issuance automation. Maturity-gated advice (automate first, shorten second!) prevents operational suicide — sequence stated!
:::
