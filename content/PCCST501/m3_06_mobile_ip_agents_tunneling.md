# Mobile IP: Keeping Your Address While Roaming

**Home agents, foreign agents, care-of addresses — discovery, registration, tunneling, and the triangle-routing tax with its route-optimized refund.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Mail Forwarding on the Move
Your **home address** (home IP) never changes, but you travel. The **home agent** (family member at home) collects your letters; the **foreign agent** (hotel concierge) receives the forwarded bundle (tunnel) and slips it under your door (**care-of address**). Discovery finds the concierge, registration files the forwarding order, tunneling wraps each letter in a fresh envelope (IP-in-IP) — three legs where one would do, the price of a permanent address.
:::

::: anim mobile-ip-tunnel Three Legs by Default, One After Optimization
Correspondent to home agent to foreign agent to mobile node — then binding updates shortcut the triangle.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The three phases

**Discovery:** agents broadcast advertisements; the node solicits if impatient; movement detection compares network prefixes. **Registration:** node sends request (home address + care-of address + lifetime) via foreign agent to home agent; reply grants/denies — re-register before expiry (lifetimes, typically minutes–hours). **Tunneling:** home agent intercepts (gratuitous ARP/proxy), encapsulates (IP-in-IP: +20 B outer header, or minimal/generic-routing variants), foreign agent decapsulates and delivers; reverse path usually goes direct (no tunnel needed upstream).

### 2.2 Triangle tax and refund

Default path correspondent → home → foreign → node ($3$ legs even when neighbours roam together). **Route optimization:** correspondent caches bindings (home→care-of), tunnels directly ($1$ leg) — at the cost of binding-update signalling and correspondent-side mobility support.

::: callout-formula KTU Formula Vault: Mobile IP
Discover (adverts) → register (request/reply + lifetime) → tunnel (IP-in-IP, $+20$ B) · CoA $=$ foreign-agent or collocated · triangle $3$ legs, optimized $1$ · reverse direct.
:::

Collocated care-of addresses (node's own temporary IP, no foreign agent) trade concierge convenience for registration complexity — same phases, fewer middlemen.

::: callout-pitfall Home Address vs CoA
The **home address** identifies (permanent, DNS-visible); the **care-of address** locates (temporary, topologically correct). An option routing by home address past the home agent, or exposing the CoA to applications, breaks one half of the split — identity stays home, location travels.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Mobile node with home address $H$ roams to a foreign net (care-of $C$, foreign agent $F$, home agent $A$). Correspondent $Y$ sends a $1000$-B payload. Trace default delivery with on-wire sizes, then count legs after route optimization.
:::

::: step [Step 2: Execution] Legs and Envelopes
Discovery done, registered (lifetime granted). Default: (1) $Y \to A$ carries inner datagram $1000 + 20 = 1020$ B addressed to $H$. (2) $A$ intercepts, encapsulates IP-in-IP: outer $20$ B to $F$'s address → $1040$ B on wire (overhead $40/1040 \approx 3.85\%$). (3) $F$ strips outer, delivers $1020$ B to the node at $C$. Legs: $3$. Optimized: $Y$ caches binding $H \to C$, tunnels directly to $F$ — $1$ leg, same $1040$ B (encapsulation cost stays; only distance shrinks).
:::

::: step [Step 3: Conclusion] Final Result
Default $3$ legs at $1040$ B on the tunnel hop ($3.85\%$ overhead); optimized $1$ leg, identical bytes. Tax quantified two ways: distance (legs) refundable via bindings, bytes (encapsulation) permanent — know which refund buys what.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
