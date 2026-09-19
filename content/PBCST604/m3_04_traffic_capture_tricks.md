---
id: m3_04_traffic_capture_tricks
courseCode: PBCST604
module: 3
sequence: 4
title: 'Capturing Traffic: Sniffing Tricks & Redirection'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Mirror administratively and flood fail-open defensively aware
  - Detour targets with rogue DHCP and forged ICMP advice
  - Name one lock per trick for exam mappings
concepts:
  - packet sniffing
  - traffic redirection
  - defensive locks
prerequisites:
  - m3_01_netsec_terms_devices
examRelevance: medium
tags:
  - network-security
  - sniffing
---
# Capturing Traffic: Sniffing Tricks & Redirection

**Seeing others' packets — promiscuous mode, flooding, DHCP games, and ICMP detours (defensive awareness, lab-scoped).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Post Office Snooping
Switches deliver letters by apartment number (MAC learning) — but: **promiscuous mode** reads the sorting belt itself (hubs/Wi-Fi/mirror ports/SPAN — shared medium or admin copy); **flooding** (MAC-table overflow) downgrades the sorter to shouting every letter (fail-open hub mode!); **DHCP games** forge the address-assigner (rogue server: gateway-you + DNS-you = total detour); **ICMP redirects** forge the traffic manager ("better route via me!"). Defenses per trick below — each trick has its named lock.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Trick → lock mapping

* Promiscuous/mirror: works on hubs, Wi-Fi (monitor mode), SPAN taps (admin-intended!) — lock: switched fabric discipline + NAC/port-security, and above all encryption (content unreadable regardless of capture).
* MAC flooding (macof-style): table overflow → fail-open broadcast — lock: port-security (MAC cap + sticky + violation shutdown), static entries for servers.
* Rogue DHCP: lock: DHCP snooping (trusted uplink ports only) + DAI bindings reuse.
* ICMP redirect: lock: ignore redirects on hosts (sysctl), authenticate routing (routing-protocol auth), egress sanity.

::: callout-formula KTU Formula Vault: Sniff Tricks
Mirror **admin copy** · flood **fail-open** · rogue-DHCP **detours all** · redirect **forged advice** · locks **named per trick**.
:::

::: callout-pitfall SPAN ≠ Attack (Admin's Own Telescope)
Mirror ports exist for *defense* (IDS taps, lawful capture, troubleshooting) — same mechanism, opposite authorisation. Tool-vs-use split (technique neutral, scope decisive) recurs: state authorisation per capture, always.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Lab net (consented, isolated): (a) capture HTTP logins three ways (mirror/flood/rogue-DHCP) with tells, (b) name each lock, (c) state what encryption would have hidden."
:::

::: step [Step 2: Execution] Three Peeks, Three Locks (Lab-Scoped)
1. SPAN tap (admin-configured mirror — silent, total; tell: none on wire, config on switch). Flood (macof burst → hub-mode seconds; tell: switch CPU/CAM alarms + broadcast storm signatures). Rogue DHCP (faster answers win races; tell: two DHCP servers logged, gateway flip).
2. Locks: port-security caps; snooping trust-boundaries; redirect-ignore + TLS-everywhere (even captured, ciphertext only).
3. Encryption hides *content* (passwords safe); metadata (who-talked-when-how-much, DNS names pre-DoH) stays visible — capture-vs-content scoping stated per finding.
:::

::: step [Step 3: Conclusion] Final Result
Trick→tell→lock triples per method, content-vs-metadata scoping per capture. Triple format generalises: every sniffing answer is method/mechanism/lock.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Switches forward unicast correctly, yet sniffing persists because:
(A) Switches are buggy
(*B) Edge cases downgrade them (flood→hub, mirror/SPAN by design, Wi-Fi shared air, attacker *inline* post-spoof) — correct default, degradable/administrable exceptions, each with its lock
(C) Cables leak always
(D) Encryption is absent
::: explanation
Default-correct + exception-prone: list exceptions (flood, span, air, inline) with locks (port-security, config-audit, WPA3/encryption, DAI). "Switches stop sniffing" is folk truth — exceptions are the exam.
:::

::: quiz Q2: Foundational Concept
Rogue DHCP total-compromise power comes from:
(A) Faster leases only
(*B) Attacker assigns *gateway + DNS* (traffic path *and* name resolution) — full detour + phishing-grade name control; DHCP + DNS lies compound (spoofed bank resolves attacker-side, TLS aside)
(C) Bigger pools
(D) Longer leases
::: explanation
Gateway (path) + DNS (names) = total traffic authority — two lies, one server. Snooping trust-ports + DAI + DNSSEC-validation each break a leg — layered locks mirror the compound threat.
:::

::: quiz Q3: Foundational Concept
MAC flooding's fail-open lesson for designers:
(A) Bigger tables fix all
(*B) Degraded-mode behaviour is a *security decision* (fail-open availability vs fail-closed security — the IPS dilemma resurfaces!): overflow policy (drop-new vs flood-all) chosen per segment criticality
(C) Hubs are better
(D) Tables never fill
::: explanation
Every finite table has a full-state policy — silent default (flood) vs explicit choice (port-shutdown). Full-state behaviour specified per segment is the design deliverable — defaults audited, not assumed.
:::
