---
id: m2_04_dns_security_dnssec
courseCode: PBCST604
module: 2
sequence: 4
title: 'DNS Security: Issues, Attacks & DNSSEC'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Win races on transaction IDs and ports for spoofs
  - Persist poisons through TTL windows and tunnels
  - Authenticate answers with DNSSEC signatures honestly scoped
concepts:
  - DNS spoofing
  - cache poisoning
  - DNSSEC
prerequisites: []
examRelevance: medium
tags:
  - web-security
  - dns-security
---
# DNS Security: Issues, Attacks & DNSSEC

**The phonebook everyone trusts unsigned — spoofing, cache poison, tunnels, and signatures that authenticate answers.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Unsigned Phonebook
DNS answers arrive *unsigned* (classic UDP, no authentication — whoever shouts matching TXID first wins the race!). **Spoofing/poisoning** (Kaminsky-style: flood fake answers + birthday-math TXIDs) rewrites the book (bank.example → evil IP). **Tunnels** smuggle data in innocent lookups (DNS exfil, C2 — firewalls wave DNS through!). **DNSSEC** signs pages (RRSIG + chain to root trust anchor — authentication, *not* encryption: snoopers still see queries; privacy needs DoT/DoH).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Attacks + DNSSEC mechanics

* Spoofing (race TXID/port), Kaminsky (randomise subdomains to force upstream queries per guess — birthday paradox accelerates), cache poisoning (resident lies, TTL-long damage), hijacking (registrar/account takeover — out-of-protocol!), tunneling (TXT/NULL payloads, iodine-style).
* DNSSEC: RRSIG per RRset, DNSKEYs, DS parent-links, root anchor; validators reject unsigned-tampered; NSEC/NSEC3 (authenticated denial — NSEC3 hashes vs zone-walking); *no confidentiality* (DoT/DoH/DoQ add it).

::: callout-formula KTU Formula Vault: DNS
Race **TXID+port** · poison **persists TTL** · DNSSEC **signs (auth, no privacy)** · tunnels **abuse allowance**.
:::

::: callout-pitfall DNSSEC ≠ Encrypted DNS
Signatures prove *authorship*, queries/answers stay plaintext (snoopable, censorable). Privacy = transport encryption (DoT/DoH); authenticity = DNSSEC — orthogonal upgrades, both needed, neither subsumes.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Walk Kaminsky poisoning conceptually (lab-whiteboard, no live fire), then show DNSSEC breaking each step, plus tunnel-spotting heuristics for defenders."
:::

::: step [Step 2: Execution] Race, Signatures, Heuristics
1. Attacker forces resolver queries (`rand.bank.example` — always misses cache) while spraying forged replies matching TXID+port (birthday odds across many tries); one win poisons `bank.example` for TTL.
2. DNSSEC: forged RRSIG fails validation (no zone key!) — resolver drops lies regardless of race wins. Randomised ports + 0x20 casing raise race cost (defense-in-depth around the crypto).
3. Tunnel heuristics: absurd subdomain entropy/volume, rare types (NULL/TXT floods), long labels, beaconing regularity — alert + sinkhole + allow-list DNS designs.
:::

::: step [Step 3: Conclusion] Final Result
Race-mechanics, signature-break, tunnel-tells: attack→crypto-fix→detection triad. Triad format (break it, sign it, spot it) generalises to every protocol-security answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Kaminsky's trick vs classic spoofing adds:
(A) Bigger packets
(*B) Forced upstream queries per guess (random subdomains always miss cache) — unlimited race attempts vs one-shot; birthday math across TXID+port space makes wins practical
(C) TCP instead of UDP
(D) Root key theft
::: explanation
Attempt-rate is the innovation: uncacheable names mint fresh races on demand. Randomising source ports/0x20 multiplies the search space back (mitigation without signatures) — rate-vs-space arms race narrated.
:::

::: quiz Q2: Foundational Concept
NSEC vs NSEC3 zone-walking concern:
(A) Both identical
(*B) NSEC returns neighbour names (walkable enumeration — zone content leaks); NSEC3 hashes them (opt-out/salted, walking needs dictionary cracks) — denial-with-privacy-graded
(C) NSEC3 is slower only
(D) Neither denies properly
::: explanation
Authenticated denial *must* name the gap; naming leaks structure. Hashing raises enumeration cost (crackable, not walkable) — privacy gradient, not binary, the precise claim.
:::

::: quiz Q3: Foundational Concept
DNS firewalls wave tunnels because:
(A) DNS is encrypted
(*B) Policy allows DNS everywhere (resolution is oxygen) — tunnels hide in permitted plaintext (long TXT/entropy labels); allow-list + inspection + response-policy zones counter
(C) Tunnels use TCP only
(D) Firewalls inspect all
::: explanation
Allow-by-necessity creates the smuggling lane: volume/entropy/type heuristics + RPZ sinkholing + DoH visibility gaps (encrypted DNS blinds middleboxes — visibility tradeoff stated!). Policy-shaped holes need behavioural detection.
:::
