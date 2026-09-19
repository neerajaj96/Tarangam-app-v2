---
id: m3_04_lan_addressing_arp_switches_and_vlans
courseCode: PCCST501
module: 3
sequence: 4
title: 'LAN Addressing: MAC, ARP, Switches & VLANs'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Contrast flat MAC names with hierarchical IP names
  - Trace ARP queries, replies, and cache aging
  - Separate switch learning from hub flooding
  - Isolate broadcast domains with VLAN tags
concepts:
  - MAC addresses
  - ARP
  - switches
  - VLANs
prerequisites: []
examRelevance: medium
tags:
  - data-link
  - lan
---
# LAN Addressing: MAC, ARP, Switches & VLANs

**48-bit hardware addresses, how ARP binds IP to MAC, self-learning switches vs. dumb hubs, and carving one LAN into many with VLANs.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Names vs. Seat Numbers
Your **IP address** is your *name* — portable, hierarchical, routable across the world (and changeable when you move networks). Your **MAC address** is the *seat number bolted to your chair* — flat, burned into the adapter at the factory, meaningful only inside this one room (LAN). **ARP** is the usher holding the seating chart: given a name ("who sits as 192.168.1.5?"), it shouts once to the room and remembers the answer. **Switches** are ushers who *learn* traffic patterns and hand-deliver; **hubs** just yell every message at everyone.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 MAC Addresses (48-bit, Flat, Permanent)

Six hex bytes (`AA:BB:CC:DD:EE:FF`), globally unique per adapter, first half = manufacturer OUI. **Flat** (no structure encoding location — unlike hierarchical IP prefixes), **portable** (moves with the device), and valid only **within one broadcast domain** — routers never forward by MAC.

### 2.2 ARP: The Binding Protocol

To send an IP datagram to 192.168.1.5 on the local LAN, the sender needs the *destination MAC*:

1. Check the **ARP table** (cache of IP→MAC with TTL aging). Hit? Done.
2. Miss → **broadcast** an ARP query ("who has 192.168.1.5? tell 192.168.1.1") to `FF:FF:FF:FF:FF:FF`.
3. Only the owner replies (**unicast** with its MAC); sender caches it. Gratuitous ARP (claiming your own mapping unprompted) also detects IP conflicts and poisons... legitimately updates stale caches.

### 2.3 Hubs vs. Switches (Collision Domains Die Here)

* **Hub:** physical-layer repeater — every bit out of every port. One **collision domain** for all; CSMA/CD mandatory; half-duplex.
* **Switch:** link-layer device with per-port buffers + a **self-learning forwarding table** (source MAC → ingress port, learned from passing traffic, aged out). Forwards *only* to the destination's port (floods unknown destinations); each port is its **own collision domain** — full-duplex, no collisions, no CD needed.

### 2.4 VLANs: Many LANs, One Switch

A **VLAN** partitions one physical switch into multiple *logical* broadcast domains via 802.1Q tags (4 extra bytes: 12-bit VLAN ID). Broadcasts stay inside the VLAN; inter-VLAN traffic must pass through a router. Why: security/isolation (HR vs. guest traffic), broadcast containment, and organizational grouping independent of physical ports.

::: callout-formula KTU Formula Vault: LAN Facts
MAC = **48-bit, flat, factory-burned** · ARP = **broadcast query, unicast reply, cached with TTL** · hub = **one collision domain** · switch = **self-learned table, per-port domains, flood-if-unknown** · VLAN = **802.1Q tag, broadcast isolation, router to cross**.
:::

::: callout-pitfall ARP Is LAN-Local (and Trusts Everyone)
ARP resolves addresses only **within one broadcast domain** — crossing subnets is the *router's* job (sender ARPs for its gateway's MAC, not the far host's). And ARP has **zero authentication**: any host may answer any query — the mechanism behind ARP spoofing/poisoning attacks. "Secure because it's low-level" is dangerously backwards.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Host A (192.168.1.10, MAC AA) wants its first-ever datagram to host B (192.168.1.20) on the same switch. A's ARP table is empty. Trace every frame: who sends what, to which MAC, and what each device learns.
:::

::: step [Step 2: Execution] The Exchange
1. A **broadcasts** ARP query (dst `FF:...:FF`): "who has .20? tell .10 (AA)". Switch **floods** it (unknown destination) and **learns** AA↔port-1.
2. B **unicasts** ARP reply (dst AA): ".20 is at BB". Switch learns BB↔port-2, forwards to port-1.
3. A caches (.20→BB), then sends the **data frame** (src AA, dst BB). Switch forwards port-1→port-2 directly — no flood, no collision, no other host disturbed.
:::

::: step [Step 3: Conclusion] Final Result
One broadcast bootstrapped everything; from then on, switch tables + ARP caches make delivery surgical. The price of the first packet (flood + query) amortizes across the whole cached session — exactly the pattern (broadcast-to-learn, unicast-forever-after) that scales LANs.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Host A must send to far-away host Z on another continent. For whose MAC does A ARP?
() Z's MAC, learned via intercontinental ARP broadcast
(*) Its own gateway router's MAC — ARP never crosses subnets; the router takes it from there
() No ARP is needed for intercontinental traffic
() The DNS server's MAC address
::: explanation
ARP is strictly LAN-local (broadcasts die at routers). A addresses the data frame to its *gateway's* MAC (IP header still names Z); each subsequent router repeats the pattern — ARP for the next hop's MAC, hop by hop, all the way across.
:::

::: quiz A switch receives a frame destined for a MAC address absent from its forwarding table. What does it do, and why is this safe?
() Drops it — unknown destinations are always hostile
(*) Floods it out all ports except ingress (like a hub, once), while learning the source; the reply teaches the table, so flooding is self-extinguishing
() Broadcasts an ARP query on behalf of the sender
() Shuts down the ingress port as a precaution
::: explanation
Unknown-unicast flooding guarantees delivery on the first try; the destination's reply then populates the table (source MAC + port learned both ways), so subsequent frames go direct. One flood per unknown address — the table converges instead of flapping.
:::

::: quiz Two departments share one physical switch but must never see each other's broadcasts. What mechanism, and what crosses between them?
() A hub — hubs isolate traffic by definition
(*) VLANs (802.1Q tags) split the switch into separate broadcast domains; traffic crosses only via a router between the VLANs
() Longer Ethernet cables physically block broadcasts
() Assign both departments the same subnet to merge them
::: explanation
VLAN tags make one switch behave as several isolated switches — broadcasts (ARP, DHCP) stay inside each VLAN. Inter-VLAN communication is *routing*, with ACLs/policies enforced at the router: isolation plus controlled crossing, on shared hardware.
:::
