---
id: m3_04_publickey_principles
courseCode: PECST637
module: 3
sequence: 4
title: Public-Key Principles & Requirements
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Charter asymmetry with trapdoors and hardness gaps
  - Map confidentiality, signatures and exchange to three families
  - Bulk through hybrid construction honestly stated
concepts:
  - public-key charter
  - trapdoor functions
  - hybrid encryption
prerequisites: []
examRelevance: medium
tags:
  - public-key
  - principles
---
# Public-Key Principles & Requirements

**Asymmetry's charter — trapdoors, the three application families, and what hardness must hold.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Drop-Box Democracy
**Public key** = drop-box slot (anyone deposits secrets — encryption!); **private key** = box key (only owner reads!). Reverse gear: owner *signs* (private-key stamp anyone verifies with public — authenticity!). **Trapdoor one-way**: forward easy (multiply primes!), reverse brutal *unless* trapdoor known (factor them!). Three jobs: secrecy (encrypt!), authenticity (sign!), agreement (DH key-swap without prior secrets!). Requirements: keypair generation feasible, operations easy, *derivation infeasible* (hardness gap = security!), plus key-size honesty.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Requirements + application map + hardness families

* Requirements (Stallings' list!): easy keygen/encrypt/decrypt; infeasible private-from-public; (signing variants analogous!).
* Applications: encryption (confidentiality!), signatures (authenticity/non-repudiation!), key exchange (symmetric bootstrapping — hybrid encryption reality: asymmetric wraps symmetric keys!).
* Hardness: factoring (RSA!), discrete log (DH/ElGamal!), (ECC preview: curve-log, smaller keys!).

::: callout-formula KTU Formula Vault: Asymmetry
Public **deposits**, private **reads** · reverse **signs** · gap **trapdoor** · bulk via **hybrid**.
:::

::: callout-pitfall Pure-Asymmetric Bulk Encryption (Performance Fantasy!)
Public-key ops cost ~$1000\times$ symmetric per byte (big-int arithmetic!) — real systems wrap (random symmetric key shipped asymmetrically, bulk symmetric!). Hybrid-only deployment literacy (asymmetric for keys/signatures, symmetric for bulk!) blocks the naive design instantly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Design secure file-share for strangers: (a) confidentiality without prior secrets? (b) Prove sender identity? (c) $1$ GB file efficiently? Map each to primitives, then name the hardness each leans on."
:::

::: step [Step 2: Execution] Charter Applied
1. (a) Recipient's public key encrypts (strangers deposit safely — no prior meeting!).
2. (b) Sender signs hash with private key (verifiable authorship — M4 signatures deep-dive!).
3. (c) Hybrid: random AES key (bulk speed!) wrapped by RSA (key transport!) — split duties by cost profile.
4. Hardness: factoring/RSA-problem (a/b!) — sizes per era ($2048$+ RSA!).
:::

::: step [Step 3: Conclusion] Final Result
Deposit/sign/wrap triple with hardness receipts per leg. Hybrid-shape answers (asymmetric envelope + symmetric bulk!) are the deployment literacy on display.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Trapdoor one-way vs plain one-way differ by:
(A) Speed only
(*B) Secret shortcut existence (trapdoor inverts easily *with* it — private key!; plain one-way (hashing!) inverts for *nobody*, not even the maker!) — encryption needs trapdoors (decrypt must work!), hashing forbids them
(C) Key sizes
(D) Nothing functional
::: explanation
Invertibility-with-secret vs never-invertible splits encryption from hashing (use-case fork!). Trapdoor possession *is* the private key conceptually — definition-qua-design, quoted exactly.
:::

::: quiz Q2: Foundational Concept
Hybrid encryption's division of labour:
(A) Redundant doubling
(*B) Asymmetric moves small secrets (keys! — expensive ops on tiny inputs!), symmetric moves bulk (fast streams on gigabytes!) — cost-profile matching (each primitive where it wins!)
(C) Marketing ritual
(D) Backward compatibility
::: explanation
Cost-profile routing ($1000\times$/byte gap!) — small-secret/big-bulk split is load-bearing economics, not ceremony. Labour-split justification (price per byte!) answers all "why both" questions.
:::

::: quiz Q3: Foundational Concept
Key-size honesty ($2048$-bit RSA claims) rests on:
(A) Bigger numbers impress
(*B) Best-known attack costs (NFS subexponential!) vs adversary budgets (nation-state decades!) with margin (quantum horizon noted — Shor breaks factoring/DL *if* scaled!; PQC migration underway, honestly flagged!)
(C) Tradition
(D) Hardware limits
::: explanation
Security = attack-economics vs parameter-size (margin for algorithmic surprise!). Quantum caveat (Shor!) + PQC horizon belong in modern answers (threat-model currency!) — sizes argued, not recited.
:::
