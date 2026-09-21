---
id: m2_09_ipv4_addressing_forwarding_nat_icmp
courseCode: PCCST501
module: 2
sequence: 9
title: 'IPv4 Addressing, Forwarding, NAT & ICMP'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Subnet with CIDR masks and count usable hosts
  - Forward with longest-prefix match
  - Trace NAT translation both directions
  - Read ping and traceroute from ICMP types
  - Self-test with the exam recap and active-recall checklist
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
## 1. The Real-World Situation — Start From Zero

Every host needs a globally meaningful address, every router must pick a next hop in microseconds, homes need many addresses but own few, and operators need tools that ask "are you alive?" and "which hops did my packet visit?" IPv4 (Internet Protocol version 4) plus three companions answers all four: **addressing** (who), **forwarding** (which way), **NAT (Network Address Translation)** (sharing), **ICMP (Internet Control Message Protocol)** (diagnostics).

The problem before the solution: 4 billion addresses cannot be searched flat, homes hold dozens of devices behind one public address, and failures need messengers. Hierarchy (prefixes), rewriting (NAT), and control messages (ICMP) solve the three in turn.

::: callout-intuition Core Mental Model: Postcodes, Sorting Offices, Return Stamps
An **IPv4 address** is house + postcode (host + prefix); the **mask** draws the line between them. **Forwarding** is the sorting office: longest matching postcode wins (most specific route first). **NAT** is a company mailroom — one public address fronts a private floor (return stamps rewritten both ways). **ICMP** is the postal inspector's red stickers (unreachable, time-exceeded) that `ping` and `traceroute` read back.

Dropping the post now: CIDR (Classless Inter-Domain Routing) prefix = address + `/n`; longest-prefix match = most specific entry wins; NAT table = per-flow rewrite memory; ICMP types 8/0, 11, 3 = echo, expiry, unreachable.
:::

MAC addresses (M3.4) name interfaces on one wire; IP names hosts across the planet — flat local names versus hierarchical global ones.

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **IPv4 address** | 32-bit host identifier, written as 4 decimals (`192.168.10.75`). |
| **CIDR (Classless Inter-Domain Routing) prefix `a.b.c.d/n`** | Address plus mask length: first $n$ bits = network part, rest = host part. Replaced obsolete classful A/B/C sizing. |
| **Subnet mask / subnetting** | Borrowing host bits to carve sub-networks (e.g. $/24 \to 4 \times /26$s). |
| **Longest-prefix match** | Forwarding rule: among all matching table entries, the longest (most specific) prefix wins; default route `0.0.0.0/0` matches everything last. |
| **NAT (Network Address Translation)** | Per-flow rewriting between private (inside) and public (outside) addresses + ports, recorded in a translation table. |
| **Private realms** | `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` — never routed on the public Internet. |
| **ICMP (Internet Control Message Protocol)** | Control messages carried in IP (protocol 1): echo request/reply (types $8$/$0$) for `ping`, time-exceeded ($11$) for `traceroute`, destination-unreachable ($3$) for dead ends. |
| **TTL (Time To Live)** | Hop-count field decremented per router; expiry triggers ICMP type $11$ — the signal `traceroute` exploits. |

<a id="the-math"></a>
## 3. Purpose — Addresses, Forwarding Math, NAT, ICMP

### 3.1 Addresses, Subnets, Forwarding

CIDR `a.b.c.d/n`: first $n$ bits network, rest host. For ordinary subnets ($n \le 30$), usable hosts $= 2^{32-n} - 2$ (network + broadcast addresses reserved). Qualifiers: `/31` links (RFC — Request for Comments — 3021, point-to-point) use both addresses with no broadcast ($2$ usable, no subtraction), and `/32` names a single host ($1$ address, a route not a subnet) — so state the $-2$ rule with its range. Subnetting borrows host bits ($/24 \to 4 \times /26$s). Forwarding table: (prefix, mask, next-hop, interface); **longest-prefix match** decides — $/26$ beats $/24$ beats default $0.0.0.0/0$. Private realms $10/8$, $172.16/12$, $192.168/16$ never route publicly.

::: toggle What does `a.b.c.d/n` and usable-host math mean?
`a.b.c.d/n` means the first `n` bits name the network and the rest name hosts inside it.
Usable hosts equal 2 to the host bits minus network and broadcast, except `/31` point links and `/32` host routes.
Tiny example: `192.168.10.0/26` has 6 host bits, so 64 minus 2 equals 62 usable addresses.
:::

::: toggle What is `longest-prefix match`?
`Longest-prefix match` forwards by the table entry with the longest covering prefix, never by table order.
Why it matters: a specific `/26` beats a general `/24`, and default `0.0.0.0/0` matches only when nothing else does.
Tiny example: `10.0.5.9` matching `/8` and `/24` leaves via the `/24` next hop.
:::

### 3.2 NAT and ICMP

Basic NAT rewrites (private IP, port) ↔ (public IP, new port) per flow in a translation table — return traffic un-rewrites by lookup. ICMP rides IP (protocol $1$): echo request/reply ($8$/$0$) for `ping`, TTL-expiry ($11$) for `traceroute`'s hop-by-hop map, destination-unreachable ($3$) for dead ends.

::: toggle What does `NAT` rewrite?
`NAT` rewrites a private IP plus port into a public IP plus new port per outbound flow in a table.
Return traffic looks up the same binding and gets rewritten back, while unsolicited inbound with no binding drops.
Tiny example: `10.0.0.5:5000` leaves as `203.0.113.7:61000`, and replies to `61000` map back inside.
:::

::: toggle What do ICMP types `8/0`, `11` and `3` mean?
ICMP type `8` is echo request and type `0` is echo reply, the pair `ping` uses to test round trips.
Type `11` reports TTL expiry for each `traceroute` hop, type `3` reports destination unreachable dead ends.
Tiny example: rising TTL values collect one type-`11` message per router until the target answers echo.
:::

::: callout-formula KTU Formula Vault: IPv4
Usable $= 2^{32-n} - 2$ ($n \le 30$; /31 and /32 are special) · longest prefix wins · privates $10/8$, $172.16/12$, $192.168/16$ · NAT $=$ per-flow rewrite table · ICMP $8/0$ echo, $11$ expiry, $3$ unreachable.
:::

NAT breaks end-to-end (inbound needs port-forwarding; IPsec — Internet Protocol Security — AH — Authentication Header — chokes on rewrites) — address conservation bought with transparency, the tradeoff behind every "why is P2P hard at home" question (M1.8's reunion).

::: callout-pitfall Classful Nostalgia
Classes A/B/C are museum pieces — CIDR ($/n$ anywhere) replaced them decades ago. An option sizing $192.168.x.x$ as "Class C, $254$ hosts" by class (not mask) fails subnetted networks ($/26 \to 62$) and wastes the question's given prefix.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

Table: `10.0.0.0/8 → R1`, `10.0.5.0/24 → R2`. Packet to `10.0.5.9` matches both — longest (`/24`) wins → R2. Packet to `10.0.9.9` matches only `/8` → R1. Specificity beats order; table sequence is irrelevant.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
Network $192.168.10.0/24$ split into $4$ equal subnets. (a) New prefix length and per-subnet usable hosts? (b) Packet to $192.168.10.75$ with table $\{192.168.10.0/24 \to R1,\ 192.168.10.64/26 \to R2,\ 0.0.0.0/0 \to R3\}$: next hop?
:::

::: step [Step 2: Execution] Borrowing and Matching
(a) $4$ subnets need $2$ borrowed bits: $/24 \to /26$. Ranges: $.0/26$ ($0$–$63$), $.64/26$ ($64$–$127$), $.128/26$, $.192/26$. Usable each $= 2^{6} - 2 = 62$ (network + broadcast reserved per subnet — $4 \times 62 = 248 < 254$, the subnetting tax). (b) $.75$ matches $/24$ (R1) and $.64/26$ ($64 \le 75 \le 127$, R2) — longest ($/26$) wins → R2. Default R3 never consulted.
:::

::: step [Step 3: Conclusion] Final Result
$/26$ quartets of $62$ usable; $.75 \to$ R2 by longest match. Specificity beats order — table sequence is irrelevant, prefix length decides, which is why default routes sit harmlessly last.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Network vs. broadcast vs. usable | First address reserved, last reserved, middle assignable (except /31, /32 specials). |
| Longest match vs. first match | Prefix length decides, never table order. |
| NAT outbound vs. unsolicited inbound | Table-created flows return fine; no binding → drop (firewall side-effect). |
| `ping` vs. `traceroute` | Echo round trip (8/0) vs. TTL-expiry hop map (11). |

**Watch out:** (1) Applying $-2$ to /31 or /32 — memorize the specials. (2) Sizing by class instead of the given mask. (3) ARPing across subnets — far hosts are reached via the gateway's MAC (M3.4 reunion).

::: callout-exam KTU Exam Focus: One-Paragraph Recap
CIDR `a.b.c.d/n`; usable $2^{32-n}-2$ for $n \le 30$ (/31 = 2 usable P2P, /32 = host route). Forward by longest-prefix match; default `0.0.0.0/0` last. Privates never public. NAT = per-flow `(privIP,port)↔(pubIP,port)` table, both directions by lookup. ICMP: 8/0 echo (`ping`), 11 expiry (`traceroute`), 3 unreachable.
:::

**Active-recall checklist:** When does $-2$ not apply? Which entry wins among overlapping prefixes? What does a NAT box do with a return packet vs. a stranger packet? Which ICMP type maps each hop of a traceroute?

<a id="self-check"></a>
## 6. Active Recall Quizzes

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
