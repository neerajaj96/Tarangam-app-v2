---
id: m3_07_m3_attack_chain_drill
courseCode: PBCST604
module: 3
sequence: 7
title: 'M3 Drill: Full Network Attack Chain (Lab)'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Chain knock, position, listen, prove and chart in order
  - Lock every link the chain crossed
  - Run one consented lab network end to end safely
concepts:
  - attack chains
  - chain stations
prerequisites:
  - m3_02_dos_ddos
  - m3_03_arp_spoofing_hijacking
  - m3_04_traffic_capture_tricks
  - m3_05_port_scanning_nmap
  - m3_06_wireshark_analysis
examRelevance: high
tags:
  - network-security
  - m3-drill
---
# M3 Drill: Full Network Attack Chain (Lab)

**One consented lab network, end to end — scan, spoof, capture, hijack, flood-shape, defend.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Red-Team Storyboard
Discovery knock (scan) → position (spoof) → ears (capture) → hands (hijack/prove) → noise drill (flood-shape read) → blue-team locks (per-link fixes). Storyboard order *is* the kill chain — drill it as one narrative, not six islands.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Chain stations + lock per link

Scan (Nmap ver) → spoof position (ARP/rogue-DHCP) → capture (Wireshark strings) → session proof (cookie replay, benign) → volume read (I/O graph) → locks (DAI/snooping/port-security/TLS/HSTS/budgets). Scope header + benign proofs throughout.

::: callout-formula KTU Formula Vault: Chain
Knock → position → listen → prove → chart → **lock every link**.
:::

::: callout-exam KTU Exam Focus
M3's 6-markers narrate one vector fully (e.g. "ARP spoofing to session hijack: packets, proof, three fixes") or compare (DoS vs DDoS; IDS vs IPS). Vector-narrative + per-link locks is the answer spine — mechanism, evidence shape, locks.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Consented /24 lab, one victim VM, one gateway: storyboard the chain with tool + evidence + lock per station (no live fire beyond benign proofs)."
:::

::: step [Step 2: Execution] Storyboard (Lab-Scoped)
1. `nmap -sS -sV` sweep → live hosts + versions table (evidence: port rows).
2. Gratuitous-ARP both directions + forwarding on (position; stealth kept).
3. Wireshark `http.request.method==POST` → follow stream → lab creds in clear (evidence: stream text; benign accounts).
4. Cookie replay in second browser (sidejack proof; then logout both — cleanup!).
5. I/O graph baseline vs burst-test window (volume literacy; no attack traffic generated — read provided pcaps for flood shapes instead).
6. Locks: DAI+snooping, TLS+HSTS rollout note, HttpOnly/SameSite flags, budgets/breakers memo — per-link, owned, dated.
:::

::: step [Step 3: Conclusion] Final Result
Six stations, tool+evidence+lock each, scope header over all, cleanup logged. Storyboard completeness (no orphan stations) is what separates drill answers from fragment lists.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Wireshark shows HTTP POST creds post-spoof. Root fix vs sticking plaster?
(A) Stronger Wi-Fi password
(*B) Root: TLS everywhere + HSTS (nothing rideable/sniffable in clear); plasters: HttpOnly/SameSite (ride-hardening), DAI (position-denial) — hierarchy ordered by what each *removes* (exposure vs position vs ride-ease)
(C) Longer passwords
(D) New gateway hardware
::: explanation
Encryption removes the *class* (cleartext capture/ride); the rest harden positions and rides around an already-closed hole. Fix hierarchy (close hole → harden paths → blunt rides) orders budgets too.
:::

::: quiz Q2: Mixed Drill
Nmap says `80/tcp open`, banner `nginx 1.4` (ancient). Next *two* moves, scoped?
(A) Exploit immediately
(*B) CVE-map the version (known vulns list) → content-layer audit (Nikto/dir-reviews, separate task) — version intel routes (patch-verify vs app-test), never fires directly
(C) Ignore, old means stable
(D) Flood it to test hardness
::: explanation
Version→CVE→scoped-next-task is the intel pipeline: findings route effort (patch ticket vs deeper app test). Skipping straight to exploit breaks scope discipline (authorisation covers *listed* actions, each justified).
:::

::: quiz Q3: Mixed Drill
I/O graph square-onset UDP burst to one host means:
(A) Organic virality
(*B) Tool-driven flood shape (instant on/off edges ≠ organic ramps) — correlate with tickets/change-windows, then vector-type (port/service) before naming it attack vs test
(C) Nothing, graphs lie
(D) Definitely nation-state
::: explanation
Shape reads first (square = mechanical), attribution last (tickets, sources, motives investigated, not assumed). Square-onset + no ticket = incident; with ticket = test — evidence over adjectives.
:::
