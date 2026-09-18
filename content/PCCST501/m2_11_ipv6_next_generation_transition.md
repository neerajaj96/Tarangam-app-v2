# IPv6: Bigger Space, Simpler Wires

**$128$-bit room for every grain of sand — fixed headers, flow labels, compression rules traced by hand, and three bridges off the IPv4 island.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: New City, Wide Streets
IPv4 is an old city: cramped numbers (NAT tenements), winding headers (options, checksums recomputed per hop). **IPv6** builds across the river: vast plots ($2^{128}$ addresses — no conservation hacks), straight avenues (fixed $40$-B header, no per-hop checksum, extension chains off the fast path), and colour-coded lanes (**flow labels** marking QoS flows, M2.8's reunion). Migration is the three bridges back: run both, tunnel through, or translate at the border.
:::

Datagram service unchanged (M2.9's forwarding logic ports over: longest match, now on $128$-bit prefixes) — addressing and plumbing renovated, delivery contract identical.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Header and addresses

Fixed $40$ B: version/traffic-class/**flow-label** ($20$ bits: pseudo-connection marks for labelled QoS treatment), payload-length/next-header/hop-limit ($8$-bit TTL heir), $16$-B source + $16$-B destination. Dropped vs IPv4: header length field (fixed!), checksum (link layers already guard), fragmentation by routers (source-only, via extension headers). Address types: unicast (global/link-local `fe80::/10`/unique-local), **multicast** (`ff00::/8` — M2.7's groups, native here), anycast (nearest-member delivery).

### 2.2 Writing and migrating

$8$ hextets: strip leading zeros per group, replace the *longest* run of all-zero groups with one `::` (once only — ambiguity guard). Transition: **dual-stack** (both, preferred), **tunneling** (v6-in-v4, e.g. 6to4/Teredo for islands), **translation** (NAT64/DNS64 at borders, last resort).

::: callout-formula KTU Formula Vault: IPv6
$40$-B fixed · flow label $20$ bits · no router fragmentation/checksum · compress zeros once (`::`) · space $2^{128} \approx 3.4 \times 10^{38}$ · migrate: both/tunnel/translate.
:::

Extension headers chain *after* the base $40$ B — routers fast-path the fixed part and skip the rest, the simplicity dividend IPv4's option-strewn headers never paid.

::: callout-pitfall Double-Colon Double-Use
One `::` per address — two would make group-count ambiguous ($2001$::$1$::$2$ cannot be re-inflated uniquely). An option compressing twice trades keystrokes for unparseability; longest-run-once is the whole rule.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Compress $2001$:$0DB8$:$0000$:$0000$:$0000$:$FF00$:$0042$:$8329$ fully, count characters saved, and state the address-space size versus IPv4.
:::

::: step [Step 2: Execution] Squeeze Once
Strip leading zeros: $2001$:$DB8$:$0$:$0$:$0$:$FF00$:$42$:$8329$. Longest zero run: groups $3$–$5$ (three $0$s, the unique longest) → one `::`: $2001$:$DB8$::$FF00$:$42$:$8329$. Length: original $39$ chars → compressed $22$ ($17$ saved, $\approx 44\%$). Space: $2^{128} \approx 3.4 \times 10^{38}$ vs IPv4's $2^{32} \approx 4.3 \times 10^9$ — roughly $8 \times 10^{28}$ times roomier.
:::

::: step [Step 3: Conclusion] Final Result
$2001$:$DB8$::$FF00$:$42$:$8329$ ($22$ chars), space $\approx 3.4 \times 10^{38}$. One `::` at the longest run — any shorter run chosen, or two used, and the form is either non-canonical or illegal.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Compression Drill
Compress $FE80$:$0000$:$0000$:$0000$:$0202$:$B3FF$:$FE1E$:$8329$.
(A) $FE80$:$0$:$0$:$0$:$0202$:$B3FF$:$FE1E$:$8329$ — parses, but refuses both canonical steps (no zero-strip on $0202$, no run collapse), so it fails any "write canonically" rubric despite reaching the same host
(*B) $FE80$::$202$:$B3FF$:$FE1E$:$8329$ — zeros stripped ($0202 \to 202$) and the $3$-group zero run collapsed once; $FE80$::$0$::$8329$ (double `::`) would be illegal, and leaving $0202$ un-stripped non-canonical
(C) $FE80$:$0$:$0$:$0$:$202$:$B3FF$:$FE1E$:$8329$ only
(D) Uncompressible, too long
::: explanation
Two operations, both mandatory for canonical form: per-group zero-strip plus longest-run `::` (exactly once). Half-compressed forms parse but violate convention — and double-`::` doesn't parse at all, the ambiguity guard firing.
:::

::: quiz Q2: Design Rationale
Why did IPv6 drop the header checksum?
(A) Errors no longer occur
(*B) Every link layer (Ethernet CRC, Wi-Fi FCS) already guards each hop, so per-hop recomputation taxed routers for duplicate protection — end-to-end checks (TCP/UDP) plus link CRCs cover the failures that matter, and cores forward faster for it
(C) Checksums moved into addresses
(D) Flow labels replace it
::: explanation
Layered redundancy audit: hop-by-hop IP checksums duplicated link CRCs below and transport checks above. Dropping the middle copy is pure profit at backbone rates — simplification by subtraction, the v6 header's whole philosophy.
:::

::: quiz Q3: Migration Choice
IPv4-only data centre must reach IPv6-only clients. Mechanism?
(A) Wait for IPv4 to grow bits
(*B) Translation (NAT64/DNS64) at the border — no common protocol exists to tunnel or dual-stack across, so stateful v4↔v6 rewriting plus synthesized `AAAA` answers bridges the islands; tunnels need a shared sea, dual-stack needs both ends bilingual
(C) Multicast reflection
(D) Longer IPv4 masks
::: explanation
Match mechanism to overlap: both-protocols → dual-stack; v6-islands-over-v4-sea → tunneling; disjoint islands → translation only. No shared version means no tunnel endpoints and no dual stack — translation is the last bridge standing, with its statefulness frankly priced.
:::
