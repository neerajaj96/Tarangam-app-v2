---
id: m3_02_nat_firewall_lab
courseCode: PCCSL507
module: 3
sequence: 2
title: 'NAT & Firewall with iptables'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what address translation hides in plain words first
  - Share one uplink with MASQUERADE provably
  - Write a default-deny firewall and test each rule
concepts:
  - NAT masquerade
  - iptables chains
  - default-deny
prerequisites:
  - m3_01_static_routing_lab
examRelevance: high
tags:
  - nat-firewall
  - iptables-lab
---
# NAT & Firewall with iptables

**Objective:** hide a private net behind one public address (NAT), then lock the gate with a default-deny firewall — testing every rule from both sides.

**What you should know first:** namespace topology + forwarding (previous experiment becomes our testbed: h1/h2 private behind r1's "public" veth).

**Required software/tools:** Linux root; `iptables`; reuse M3.01 namespaces (add a fake "internet" namespace with 203.0.113.0/24 documentation range).

## 1. What Are We Doing, and Why

We give r1 a public face (203.0.113.1), let private h1/h2 browse "internet" through it via MASQUERADE, then firewall r1: allow established traffic + SSH-from-lab + ping-limits, deny everything else — proving each rule with connect/scans from the "internet" side.

## 2. Concept in Very Simple Language

- **MASQUERADE:** router rewrites private source IPs to its own public IP (recording the mapping), un-rewrites replies — many privates, one public face.
- **Chains:** INPUT (to the router), FORWARD (through it), OUTPUT (from it) — packets walk one chain; rules vote ACCEPT/DROP in order.
- **Default-deny + established:** last rule DROPs all; first rule ACCEPTs reply traffic (`--state ESTABLISHED`) so answers re-enter while new inbound dies.

## 3. Commands and Line-by-Line Explanation

```bash
# NAT: share r1's public face (assume vpub 203.0.113.1/24 toward "internet" ns)
sudo ip netns exec r1 iptables -t nat -A POSTROUTING -o vpub -j MASQUERADE
# ^ every packet leaving vpub gets source rewritten to 203.0.113.1 (mapping remembered)
sudo ip netns exec h1 ping -c 2 203.0.113.2   # private host reaches "internet" now
# Firewall on r1: default-deny with a working door for answers
sudo ip netns exec r1 iptables -P INPUT DROP
sudo ip netns exec r1 iptables -P FORWARD DROP
sudo ip netns exec r1 iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
sudo ip netns exec r1 iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT
sudo ip netns exec r1 iptables -A FORWARD -i v1r -o vpub -p tcp --dport 80 -j ACCEPT
# ^ private LAN may open outbound web only; all new inbound dies on default DROP
sudo ip netns exec r1 iptables -L -v -n       # read counters: which rules actually fire?

::: toggle Expand: `iptables -t nat -A POSTROUTING -o vpub -j MASQUERADE`
`iptables` = firewall/NAT rule tool (needs root). `-t nat` = the address-translation table (vs `filter` for allow/deny). `-A` = append rule to chain's end (order matters — first match wins). `POSTROUTING` = chain for packets about to leave (last chance to rewrite source). `-o vpub` = only via output interface vpub (the public face). `-j MASQUERADE` = jump to source-rewrite-to-exit-address, remembering the mapping for replies. What changes: private sources become the public IP on exit. Verify: capture on vpub shows source 203.0.113.1, never 10.x. Undo: same line with `-D` instead of `-A`.
:::

::: toggle Expand: chains, policy `-P`, `-m state`, `-L -v -n`
Chains = per-path rule lists: INPUT (to this box), FORWARD (through it), OUTPUT (from it) — each packet walks exactly one. `-P INPUT DROP` = chain policy (default verdict when no rule matches) — the deny in default-deny. `-m state --state ESTABLISHED,RELATED` = match reply/associated traffic (answers re-enter; stateless hates must name ports instead). `-L -v -n` = list with verbose counters, numeric (counters prove which rules fire — packet/byte counts per rule; untested rules are wishes).
:::
```

- `-t nat ... POSTROUTING ... MASQUERADE` — source-NAT at exit; return path auto-unmapped by the recorded mapping.
- `-P ... DROP` sets chain policy (the verdict when no rule matches) — policy is the deny in default-deny.
- ESTABLISHED rules re-admit answers — without them your own replies die at the gate you built.
- `-L -v -n` counters prove rules fire (packet counts per rule) — untested rules are wishes.

## 4. Expected Output and How to Verify

h1 pings/browses "internet" via the public face (verify: capture on vpub shows source 203.0.113.1, not 10.x). From "internet": new connections to privates time out (DROP, silent); outbound-80 from h1 works, outbound-22 fails (rule granularity proved). Verify counters increment on the ESTABLISHED and port-80 rules only.

::: callout-pitfall Locked-Out Administrator
Setting `-P INPUT DROP` over SSH without an ESTABLISHED rule (or before adding allows) disconnects you instantly — packs spare console access, or script the whole ruleset atomically (`iptables-restore`) in real work.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| NAT on, internet unreachable | Forwarding off or FORWARD DROP without ESTABLISHED — answers die inbound |
| Everything blocked incl. replies | ESTABLISHED rules missing/ordered after DROP — first-match wins, order matters |
| Counters all zero but traffic flows | Reading the wrong table/chain (`-t nat` vs filter) — match table to rule set |

**Viva:** MASQUERADE vs SNAT (dynamic-face vs fixed-face)? Why ESTABLISHED first (answers must re-enter)? DROP vs REJECT (silent timeout vs instant refusal — stealth vs diagnostics)?

**Exam/practical checklist:** MASQUERADE + private reachability ☐; public-face source on wire ☐; default DROP policies ☐; ESTABLISHED answers work ☐; port-80-only granularity proved ☐; ruleset saved (`iptables-save`) ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Private hosts browse fine, but a public peer's new connection to a private server times out with zero replies. Which mechanism hides the server, and is this firewall or NAT behaviour?
() Firewall REJECT — instant refusal expected
(*) NAT without a port-forward: inbound has no mapping (private invisible by default); DROP policy adds silence. Reachability needs an explicit DNAT/port-forward rule — invisibility is NAT's default, firewall's choice
() MASQUERADE blocks all TCP by design
() Private servers cannot exist behind NAT ever
::: explanation
Timeout (not refusal) plus no mapping = nothing to deliver to, silently. NAT hides by default; firewalls choose silence or refusal. Name both layers — the fix (DNAT rule) lives at their intersection.
:::

::: quiz Admin set INPUT DROP first over SSH, then got disconnected before adding ESTABLISHED. What happened packet-by-packet, and the safe practice?
() SSH servers detect strict admins and quit
(*) Policy DROP with no ESTABLISHED exception killed the admin's own reply packets (and new SYNs) — self-lockout by rule order. Safe practice: script rulesets atomically or keep a spare console; order rules before policies in live work
() DROP only affects new connections, never existing
() SSH is immune to iptables by protocol
::: explanation
Your packets obey your rules too: replies are INPUT-path packets. ESTABLISHED-first is self-preservation, not generosity — and atomic scripts beat typed sequences when the gate swings on you.
:::
