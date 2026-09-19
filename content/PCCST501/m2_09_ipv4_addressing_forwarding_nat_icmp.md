---
id: m2_09_ipv4_addressing_forwarding_nat_icmp
courseCode: PCCST501
module: 2
sequence: 9
title: 'IPv4 Addressing, Forwarding, NAT & ICMP'
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - Subnet with CIDR masks and count usable hosts
  - Forward with longest-prefix match
  - Trace NAT translation both directions
  - Read ping and traceroute from ICMP types
concepts:
  - IPv4 addressing
  - longest-prefix match
  - NAT
  - ICMP
prerequisites: []
examRelevance: high
tags:
  - ipv4
  - forwarding
  - nat
---
# IPv4 Addressing, Forwarding, NAT & ICMP

**Prefixes, masks, longest-match forwarding, private realms behind NAT, and the control messages that ping the path — the network layer's datagram core.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Postcodes, Sorting Offices, Return Stamps
An **IPv4 address** is house + postcode (host + prefix); the **mask** draws the line between them. **Forwarding** is the sorting office: longest matching postcode wins (most specific route first). **NAT** is a company mailroom — one public address fronts a private floor (return stamps rewritten both ways). **ICMP** is the postal inspector's red stickers (unreachable, time-exceeded) that `ping` and `traceroute` read back.
:::

MAC addresses (M3.4) name interfaces on one wire; IP names hosts across the planet — flat local names versus hierarchical global ones.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Addresses, subnets, forwarding

CIDR `a.b.c.d/n`: first $n$ bits network, rest host; usable hosts $= 2^{32-n} - 2$ (network + broadcast reserved). Subnetting borrows host bits ($/24 \to 4 \times /26$s). Forwarding table: (prefix, mask, next-hop, interface); **longest-prefix match** decides — $/26$ beats $/24$ beats default $0.0.0.0/0$. Private realms $10/8$, $172.16/12$, $192.168/16$ never route publicly.

### 2.2 NAT and ICMP

Basic NAT rewrites (private IP, port) ↔ (public IP, new port) per flow in a translation table — return traffic un-rewrites by lookup. ICMP rides IP (protocol $1$): echo request/reply ($8$/$0$) for `ping`, TTL-expiry ($11$) for `traceroute`'s hop-by-hop map, destination-unreachable ($3$) for dead ends.

::: callout-formula KTU Formula Vault: IPv4
Usable $= 2^{32-n} - 2$ · longest prefix wins · privates $10/8$, $172.16/12$, $192.168/16$ · NAT $=$ per-flow rewrite table · ICMP $8/0$ echo, $11$ expiry, $3$ unreachable.
:::

NAT breaks end-to-end (inbound needs port-forwarding; IPsec AH chokes on rewrites) — address conservation bought with transparency, the tradeoff behind every "why is P2P hard at home" question (M1.8's reunion).

::: callout-pitfall Classful Nostalgia
Classes A/B/C are museum pieces — CIDR ($/n$ anywhere) replaced them decades ago. An option sizing $192.168.x.x$ as "Class C, $254$ hosts" by class (not mask) fails subnetted networks ($/26 \to 62$) and wastes the question's given prefix.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Network $192.168.10.0/24$ split into $4$ equal subnets. (a) New prefix length and per-subnet usable hosts? (b) Packet to $192.168.10.75$ with table $\{192.168.10.0/24 \to R1,\ 192.168.10.64/26 \to R2,\ 0.0.0.0/0 \to R3\}$: next hop?
:::

::: step [Step 2: Execution] Borrowing and Matching
(a) $4$ subnets need $2$ borrowed bits: $/24 \to /26$. Ranges: $.0/26$ ($0$–$63$), $.64/26$ ($64$–$127$), $.128/26$, $.192/26$. Usable each $= 2^{6} - 2 = 62$ (network + broadcast reserved per subnet — $4 \times 62 = 248 < 254$, the subnetting tax). (b) $.75$ matches $/24$ (R1) and $.64/26$ ($64 \le 75 \le 127$, R2) — longest ($/26$) wins → R2. Default R3 never consulted.
:::

::: step [Step 3: Conclusion] Final Result
$/26$ quartets of $62$ usable; $.75 \to$ R2 by longest match. Specificity beats order — table sequence is irrelevant, prefix length decides, which is why default routes sit harmlessly last.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Host Math
$10.20.0.0/16$ into $256$ equal subnets. New prefix and hosts each?
(A) $/24$, $254$ each
(*B) $/24$ ($16 + 8$ borrowed bits), $2^{8} - 2 = 254$ usable each — $256 \times 254 = 65{,}024$ vs $65{,}534$ unsubnetted: $256$ subnets reserve $2$ apiece ($512$) against the parent's $2$, net tax $510$ addresses
(C) $/25$, $126$ each
(D) $/16$ unchanged, subnets are free
::: explanation
$256 = 2^8$ subnets consume $8$ host bits: $/16 \to /24$. Each subnet donates network+broadcast — hierarchy always costs addresses, budget it.
:::

::: quiz Q2: NAT Direction
Inside host $10.0.0.5{:}5000$ opens a flow; NAT public $203.0.113.7$, assigns $61000$. Return packet arrives for $203.0.113.7{:}61000$. Fate?
(A) Dropped, NAT is outbound-only
(*B) Table lookup $(203.0.113.7, 61000) \to (10.0.0.5, 5000)$, rewrite destination, forward inside — stateful un-rewrite is NAT's entire return path; without the prior outbound entry the packet dies
(C) Broadcast to all inside hosts
(D) Sent to $10.0.0.5{:}61000$ unrewritten
::: explanation
The translation table is directional memory: outbound created the binding, inbound consumes it. Unsolicited arrivals (no binding) drop — the statefulness that is simultaneously NAT's firewall side-effect and its P2P headache.
:::

::: quiz Q3: Traceroute Logic
Hop $5$ never replies; hops $1$–$4$, $6$+ fine. Diagnosis?
(A) Destination down
(*B) Hop-$5$'s router silently drops expired TTLs (no ICMP $11$ sent — many operators rate-limit or suppress it) while forwarding fine — path alive, measurement blind at one hop; the classic "stars mid-trace, target replies" pattern
(C) Loop between $4$ and $5$
(D) TTL too large
::: explanation
`traceroute` maps by *provoked errors*: a quiet hop forwards (data plane healthy) but won't complain (control plane muted). Stars mean silence, not failure — reply from beyond proves transit worked.
:::
