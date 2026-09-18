# DNS: The Internet's Phone Book

**Names to numbers through a hierarchy — root, TLD, authoritative servers, the 8-message worst case, caching that deletes round trips, and the four record types.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Phone Book With Branch Offices
Nobody memorizes numbers; everyone asks directory assistance. DNS is assistance with **branch offices**: your local office (resolver) either knows (cache hit — instant) or climbs the chain — head office (root) names the city office (TLD), which names the street office (authoritative), which finally reads the number. Each office remembers answers for TTL seconds, so popular numbers rarely need the full climb.
:::

::: anim dns-resolve Climb Only What the Cache Misses
Client to local to root to TLD to authoritative — eight messages worst case, collapsing toward two as caches warm.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Hierarchy and resolution math

Three server classes: **root** (13 logical identities, knows TLD addresses), **TLD** (`.com`/`.edu`/`.in`, knows authoritative addresses), **authoritative** (holds the zone's records). Worst-case recursive resolution costs $8$ messages: client↔local ($2$), local↔root ($2$), local↔TLD ($2$), local↔authoritative ($2$). Iterative variant returns referrals instead of answers, shifting work to the requester. Every record carries a **TTL** — cache lifetime, the staleness-vs-load dial.

### 2.2 Records and transport

`A` (name→IPv4), `AAAA` (→IPv6), `NS` (zone's servers), `CNAME` (alias→canonical), `MX` (mail exchanger — email's M1.6 reunion). UDP/53 normally, TCP/53 for zone transfers and oversized replies. Single point of failure dodged by replication: $13$ root identities, anycast instances worldwide.

::: callout-formula KTU Formula Vault: DNS
Root → TLD → authoritative · worst case $8$ messages · TTL prices cache life · `A/AAAA/NS/CNAME/MX` · UDP/$53$ (TCP for bulk).
:::

DNS runs over UDP because queries fit one packet and retries are cheap — reliability via timeout-and-retry, not connections.

::: callout-pitfall Resolver vs Authoritative
The local **resolver** asks on your behalf (recursive, caches); **authoritative** servers answer for their zone only (never recurse for strangers). An option sending end-users straight to the root mistakes the branch office for head office — roots would melt under that load.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Cold caches everywhere. Your host resolves `mail.ktu.edu`. List each query/response pair in order and count total DNS messages; then state which records the mail handoff needs next.
:::

::: step [Step 2: Execution] Climbing the Ladder
(1–2) Host → local resolver, miss. (3–4) Local → root: "who knows `.edu`?" → TLD address. (5–6) Local → TLD: "who knows `ktu.edu`?" → authoritative address. (7–8) Local → authoritative: "`mail.ktu.edu`?" → `A` record (the IPv4). Local caches all three answers (TTL-bounded), replies to host. Total: $8$ messages. Mail handoff then asks the zone's `MX` record (M1.6's port-25 push target) — a second query, usually cache-warm by now.
:::

::: step [Step 3: Conclusion] Final Result
$8$ messages cold — $4$ round trips (host–local plus root, TLD, authoritative) × $2$ directions each. Warm caches collapse it toward $2$ — TTL tuning is load engineering, and the `A`-then-`MX` pair bridges naming into mailing.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Message Counting
Warm local cache holds the TLD address but nothing else. Messages to resolve `x.example.com`?
(A) $8$, caches never matter
(*B) $6$ — host↔local ($2$) + local↔TLD ($2$) + local↔authoritative ($2$), skipping only the root round trip the cache already paid for
(C) $2$, one cached entry ends it
(D) $4$, half price always
::: explanation
Count round trips level by level: cached root referral deletes exactly $2$ messages. Each cache tier buys out its own climb segment — arithmetic, not magic.
:::

::: quiz Q2: Record Sorting
Zone needs: web server IPv4, IPv6 twin, alias `www` → `web`, mail exchanger, own nameservers. Minimal set?
(A) Five `A` records
(*B) `A` + `AAAA` + `CNAME` (`www`→`web`) + `MX` + `NS` — one type per job; aliases never take `A` (double bookkeeping on every IP change)
(C) `MX` covers all five jobs
(D) `NS` plus hope
::: explanation
Types are job titles: address, v6-address, alias, mail-route, delegation. `CNAME` for the alias keeps one canonical address — renaming IPs edits one record, not two.
:::

::: quiz Q3: Transport Choice
Why UDP/53 for ordinary queries?
(A) UDP is more reliable than TCP
(*B) One-packet question, one-packet answer — connection setup would cost more than the query, so timeout-and-retry supplies exactly enough reliability at zero handshake price
(C) DNS predates TCP
(D) TCP cannot carry port $53$
::: explanation
Cost-benefit: $3$-packet handshake to move $2$ packets is absurd overhead. Idempotent queries retry safely — TCP stays reserved for zone transfers and truncated (oversized) replies that need streams.
:::
