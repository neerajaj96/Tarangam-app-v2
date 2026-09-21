---
id: m3_06_mobile_ip_agents_tunneling
courseCode: PCCST501
module: 3
sequence: 6
title: 'Mobile IP: Keeping Your Address While Roaming'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Run discovery, registration, and tunneling in order
  - Price triangle routing against route optimization
  - Split home identity from care-of location
  - Self-test with the exam recap and active-recall checklist
concepts:
  - home agent
  - tunneling
  - triangle routing
prerequisites:
  - m3_05_wireless_lan_802_11
examRelevance: medium
tags:
  - mobile-ip
  - mobility
---
# Mobile IP: Keeping Your Address While Roaming

**Home agents, foreign agents, care-of addresses — discovery, registration, tunneling, and the triangle-routing tax with its route-optimized refund.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

Your phone keeps its IP address identity (connections, logins, sessions bound to it) but physically roams across networks whose addresses belong elsewhere. Routing by the permanent address delivers to the *home* network — where you no longer are. Changing address on every move breaks every open connection instead.

The problem before the solution: keep one permanent **identity** while the physical **location** keeps changing. Mobile IP splits the two: the home address names you forever; a temporary care-of address says where you are now; agents at both ends forward between them.

::: callout-intuition Core Mental Model: Mail Forwarding on the Move
Your **home address** (home IP) never changes, but you travel. The **home agent** (family member at home) collects your letters; the **foreign agent** (hotel concierge) receives the forwarded bundle (tunnel) and slips it under your door (**care-of address**). Discovery finds the concierge, registration files the forwarding order, tunneling wraps each letter in a fresh envelope (IP-in-IP) — three legs where one would do, the price of a permanent address.

Dropping the mail now: home agent = router at your home network; foreign agent = router at the visited network; CoA (Care-of Address) = your temporary location address; tunnel = IP-in-IP encapsulation (+20 B outer header).
:::

::: anim mobile-ip-tunnel Three Legs by Default, One After Optimization
Correspondent to home agent to foreign agent to mobile node — then binding updates shortcut the triangle.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Home address** | The mobile node's permanent IP — identity, DNS (Domain Name System)-visible, never changes. |
| **Home agent** | A router on the home network that intercepts packets for the away node and tunnels them onward. |
| **Foreign agent** | A router on the visited network that receives tunnels and delivers locally. |
| **CoA (Care-of Address)** | The temporary, topologically correct address: the foreign agent's address (or a collocated address — the node's own temporary IP). |
| **Tunneling (IP-in-IP encapsulation)** | Wrapping the original datagram in a fresh outer IP header (+20 B) addressed to the tunnel endpoint. |
| **Triangle routing** | Default 3-leg path: correspondent → home agent → foreign agent → node. |
| **Route optimization** | Correspondent caches the binding (home→care-of) and tunnels directly — 1 leg. |
| **Correspondent** | Any host communicating with the mobile node. |

::: toggle What are `home agent`, `foreign agent` and `CoA`?
The `home agent` is the router on the home network that intercepts packets for the away node.
The `foreign agent` receives tunnels on the visited network, and the `CoA` is the temporary location address.
Tiny example: mail to permanent home `H` gets tunnelled to care-of `C` at foreign agent `F`.
:::

<a id="the-math"></a>
## 3. Purpose — Three Phases, Then the Triangle Tax

### 3.1 Operation Flow: The Three Phases, Step by Step

1. **Discovery:** agents broadcast advertisements; the node solicits if impatient; movement detection compares network prefixes.
2. **Registration:** node sends request (home address + care-of address + lifetime) via foreign agent to home agent; reply grants/denies — re-register before expiry (lifetimes, typically minutes–hours).
3. **Tunneling:** home agent intercepts (gratuitous ARP — Address Resolution Protocol — /proxy), encapsulates (IP-in-IP: +20 B outer header, or minimal/generic-routing variants), foreign agent decapsulates and delivers; reverse path usually goes direct (no tunnel needed upstream).

::: toggle What happens in `discovery`, `registration` and `tunneling`?
`Discovery` finds agents from broadcasts or solicits, `registration` files home plus care-of plus lifetime with the home agent.
`Tunneling` wraps each datagram in a 20-byte outer header to the tunnel endpoint for delivery.
Tiny example: discover `F`, register `H` to `C` for 600 seconds, then each 1020-byte inner packet rides 1040 bytes.
:::

### 3.2 Triangle Tax and Refund

Default path correspondent → home → foreign → node ($3$ legs even when neighbours roam together). **Route optimization:** correspondent caches bindings (home→care-of), tunnels directly ($1$ leg) — at the cost of binding-update signalling and correspondent-side mobility support.

::: callout-formula KTU Formula Vault: Mobile IP
Discover (adverts) → register (request/reply + lifetime) → tunnel (IP-in-IP, $+20$ B) · CoA $=$ foreign-agent or collocated · triangle $3$ legs, optimized $1$ · reverse direct.
:::

Collocated care-of addresses (node's own temporary IP, no foreign agent) trade concierge convenience for registration complexity — same phases, fewer middlemen.

::: callout-pitfall Home Address vs CoA
The **home address** identifies (permanent, DNS-visible); the **care-of address** locates (temporary, topologically correct). An option routing by home address past the home agent, or exposing the CoA to applications, breaks one half of the split — identity stays home, location travels.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

Home agent A, foreign agent F, node at CoA C, 100-B payload. Default: sender → A (120 B with inner header); A wraps outer 20 B → 140 B to F; F strips, delivers 120 B to the node. Three legs, 20 extra bytes on the tunnel hop. Optimized: sender wraps directly to F — same 140 B, one leg.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
Mobile node with home address $H$ roams to a foreign net (care-of $C$, foreign agent $F$, home agent $A$). Correspondent $Y$ sends a $1000$-B payload. Trace default delivery with on-wire sizes, then count legs after route optimization.
:::

::: step [Step 2: Execution] Legs and Envelopes
Discovery done, registered (lifetime granted). Default: (1) $Y \to A$ carries inner datagram $1000 + 20 = 1020$ B addressed to $H$. (2) $A$ intercepts, encapsulates IP-in-IP: outer $20$ B to $F$'s address → $1040$ B on wire (overhead $40/1040 \approx 3.85\%$). (3) $F$ strips outer, delivers $1020$ B to the node at $C$. Legs: $3$. Optimized: $Y$ caches binding $H \to C$, tunnels directly to $F$ — $1$ leg, same $1040$ B (encapsulation cost stays; only distance shrinks).
:::

::: step [Step 3: Conclusion] Final Result
Default $3$ legs at $1040$ B on the tunnel hop ($3.85\%$ overhead); optimized $1$ leg, identical bytes. Tax quantified two ways: distance (legs) refundable via bindings, bytes (encapsulation) permanent — know which refund buys what.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Home address vs. CoA | Permanent identity vs. temporary location — applications see the first, tunnels use the second. |
| Triangle vs. optimized | 3 legs via home vs. 1 direct tunnel after binding update. |
| Foreign-agent vs. collocated CoA | Tunnel ends at visited router vs. at the node itself. |
| Registration vs. discovery | Filing the forwarding lease vs. finding the agent. |

**Watch out:** (1) Routing past the home agent by home address — interception *is* the mechanism. (2) Expecting optimization to shrink bytes — it shrinks legs; the +20 B stays. (3) Letting the lifetime expire — re-register inside it or traffic blackholes.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Phases: discover (adverts) → register (request/reply + lifetime, renew early) → tunnel (IP-in-IP +20 B, reverse direct). Identity (home address) vs. location (CoA). Default triangle 3 legs; route optimization caches bindings → 1 leg, same bytes. Collocated CoA drops the foreign agent.
:::

**Active-recall checklist:** What does each phase produce? Why three legs by default? What does a binding update buy — legs or bytes? When does traffic blackhole?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Q1: Registration Arithmetic
Lifetime granted $600$ s; node re-registers every $500$ s. A rival design re-registers every $700$ s. Verdicts?
(A) Both fine, lifetimes are hints
(*B) $500$ s is safe (refresh before expiry keeps the binding alive); $700$ s lets the binding die at $600$ s, blackholing traffic for $100$ s per cycle until the next request
(C) $700$ s is safer, less signalling
(D) Lifetimes never expire
::: explanation
Registration is a lease, not a deed: expiry without renewal deletes the forwarding state. Refresh-inside-lifetime is the discipline — signalling saved by late renewal is outage bought, $100$ s per cycle here.
:::

::: quiz Q2: Encapsulation Overhead
$500$-B payloads, IP-in-IP tunnel. Overhead share?
(A) $20/500 = 4\%$
(*B) Inner $520$ B, outer $540$ B — overhead $40/540 \approx 7.4\%$, nearly double the $1000$-B case: small payloads suffer most, which is why VoIP-over-tunnel engineers watch packetization, not just bitrate
(C) Zero, headers compress free
(D) $20/540 \approx 3.7\%$, one header only
::: explanation
Both headers count: inner ($20$) to $H$ plus outer ($20$) to $F$. Overhead share $= 40/(500+40)$ — halving payload nearly doubles the percentage, the small-packet tax in one line.
:::

::: quiz Q3: Triangle Economics
Correspondent and node share the foreign café's Wi-Fi; home agent sits overseas. Default vs optimized?
(A) Equal, distance is distance
(*B) Default hairpins every packet overseas and back ($3$ intercontinental-ish legs); one binding update buys direct local delivery ($1$ leg) — proximity without optimization is pure waste, proximity with it is the whole point
(C) Optimization adds legs
(D) Triangles route faster
::: explanation
Triangle cost scales with home-agent distance, not endpoint distance: neighbours pay intercontinental postage by default. Binding updates convert topology into shortcut — signalling once, saving per packet forever after.
:::
