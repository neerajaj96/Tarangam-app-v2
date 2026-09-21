---
id: m2_03_dns_dhcp_experiment
courseCode: PCCSL507
module: 2
sequence: 3
title: 'DNS & DHCP: Name and Address Services'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what each service sells in plain words first
  - Resolve names with dig/nslookup and read flags
  - Watch a DHCP handshake and read the offered lease
concepts:
  - DNS resolution
  - DHCP lease
  - caching
prerequisites:
  - m2_02_tcp_teardown_retransmission
examRelevance: high
tags:
  - dns-dhcp
  - name-services
---
# DNS & DHCP: Name and Address Services

**Objective:** resolve real names, read answer authority, and capture a DHCP lease handshake — the two services every connection silently uses first.

**What you should know first:** DNS maps names→IPs (usually UDP 53); DHCP leases addresses+gateway+DNS to newcomers (PCCST501 application-layer theory in two lines).

**Required software/tools:** `dig` or `nslookup` (dnsutils/bind-utils); Wireshark; a DHCP event (reconnect cable / `dhclient -r; dhclient` with root, or lab VM reboot).

## 1. What Are We Doing, and Why

We ask real DNS questions and read who answered authoritatively versus from cache, then catch the four-packet DHCP DORA (Discover-Offer-Request-Ack) that configured this very machine. Why: "network works" secretly means these two answered first — every later failure story starts here.

## 2. Concept in Very Simple Language

- **DNS:** question (name + type A/AAAA) → answer (IP) + authority (who knows) + TTL (cache lifetime). `dig` prints all three sections — read past the first.
- **DORA:** Discover (broadcast "any DHCP here?") → Offer ("take 192.168.1.20") → Request ("yes, that one") → Ack ("leased 1 hour, gateway .1, DNS .1").
- **Cache poison to respect:** TTL seconds decide staleness; `+trace` walks root→TLD→authoritative live.

## 3. Commands and Line-by-Line Explanation

```bash
$ dig example.com +noall +answer +comments
$ dig example.com +trace | head -20
$ cat /etc/resolv.conf
# capture filter "udp port 67 or udp port 68", then: sudo dhclient -r eth0 && sudo dhclient eth0
```

- `dig ... +noall +answer` — just the answer section (the IP); `+comments` adds query time + which server answered (cache vs authority hint).
- `+trace` — disables recursion, walks the hierarchy visibly: root servers → TLD → authoritative (slow, educational, never for daily use).
- `/etc/resolv.conf` — the machine's chosen DNS servers (often the DHCP-provided gateway) — wrong entries here break names while IPs still ping (classic split symptom).
- DORA capture: Discover to broadcast, Offer unicast with proposed IP, Request re-broadcast (claiming publicly so rogues hear), Ack with lease time + gateway + DNS — read all three lease facts from the Ack.

::: toggle Expand: `dig example.com +noall +answer` and `+trace`
`dig` = DNS lookup tool (asks questions, prints all sections). `example.com` = the query name. `+noall` = print nothing by default (opt-in verbosity). `+answer` = …except the answer section (the IPs). `+comments` (used above) = …plus metadata (query time, server). `+trace` = disable recursion and walk root→TLD→authoritative visibly (educational, slow — never daily use). Output sections: ANSWER (the IPs), AUTHORITY (who knows), ADDITIONAL (helpers); `Query time: 0 msec` = cache hit.
:::

::: toggle What do Discover, Offer, Request, Ack each carry?
Discover (broadcast): "any DHCP server here?" + client's MAC (no address yet — broadcast is the only language available). Offer (unicast): "take 192.168.1.20" + lease terms proposed. Request (broadcast): "yes, that one" — public so competing servers withdraw. Ack: confirmed lease time + gateway + DNS (the three facts every host needs). Same transaction ID across all four proves one conversation.
:::

## 4. Expected Output and How to Verify

`dig` answers with an `A` record + `Query time` (0 msec = cache hit, tens of ms = real lookup); `+trace` ends at an authoritative server; DORA shows 4 packets with matching transaction IDs and the Ack's lease/gateway/DNS. Verify caching: repeat `dig` → `Query time: 0 msec` (served from cache, TTL counting down).

::: callout-pitfall Name-Blind Ping
"Ping 8.8.8.8 works, browser fails" is DNS, not connectivity — test IPs before names first to split the two. Names failing + IPs working = resolver path (`resolv.conf`, DNS server), never routing.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| `dig: connection timed out` | No DNS server reachable (wrong `resolv.conf`, firewall 53) — IPs still ping, proving split |
| `NXDOMAIN` for a real site | Typo or captive-portal DNS hijack — verify spelling, check portal login |
| No DORA captured | Lease renewed silently (unicast, no broadcast) — force full `dhclient -r` cycle |

**Viva:** answer vs authority vs TTL (three sections, three jobs)? Why broadcast Discover/Request (no address yet + public claim)? What does `0 msec` prove (cache)?

**Exam/practical checklist:** A record + query time read ☐; trace walked to authority ☐; DORA 4 packets same transaction ID ☐; lease/gateway/DNS read from Ack ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Browser fails everywhere but `ping 8.8.8.8` replies. `dig example.com` times out. Diagnose the layer and the next file to inspect.
() Gateway is down — replace cables
(*) DNS layer: IPs route fine, names never resolve (resolver/server path dead). Next: `/etc/resolv.conf` (wrong server?) then reachability to that server — the IP/name split isolates it before any routing theory
() DHCP lease expired — renew immediately
() The browser needs reinstalling
::: explanation
Working-IP/dead-name is DNS's signature split. The split test (ping IP vs dig name) comes before all else — one comparison replaces an hour of random fixes.
:::

::: quiz DORA shows Discover, Offer, Request but no Ack, and the machine keeps 169.254.x.x. What happened and what address is that?
() Success — 169.254 is the leased address
(*) Server never acknowledged (or Offer lost): client falls back to link-local 169.254.x.x (APIPA — usable on-LAN only, no gateway). Missing Ack = no lease; the 169.254 is the confession, not a lease
() DHCP uses 169.254 as its server address
() Request was unnecessary; three packets suffice
::: explanation
Four letters or no lease: DORA is atomic. Link-local self-assignment is the protocol's white flag — read it as "Ack never arrived" and debug server/reachability, never celebrate it.
:::
