---
id: m3_04_topology_miniproject
courseCode: PCCSL507
module: 3
sequence: 4
title: 'Topology Mini-Project & Viva Prep'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the demo contract in plain words first
  - Compose namespaces, routing, firewall, and capture into one topology
  - Defend every choice in viva language
concepts:
  - topology composition
  - evidence pack
  - viva defence
prerequisites:
  - m3_03_simulation_ns3_basics
examRelevance: high
tags:
  - miniproject
  - viva-prep
---
# Topology Mini-Project & Viva Prep

**Objective:** compose the whole course into one defended topology — routed, firewalled, captured, and documented — ready for evaluation day.

**What you should know first:** every M1–M3 experiment (this topic composes; it teaches no new mechanism).

**Required software/tools:** everything so far (namespaces, iptables, Wireshark, one Python service, optional ns-3 comparison plot).

## 1. What Are We Doing, and Why

We specify a small campus: two LAN namespaces + router namespace + "internet" namespace, static routes, NAT, default-deny firewall with one public service (your select-server on a forwarded port), plus a capture pack proving handshake/routing/filtering — and a viva script defending each choice.

## 2. Concept in Very Simple Language

- **Composition contract:** each previous experiment contributes exactly one proven piece (toolkit ⇒ inspection, sockets ⇒ service, Wireshark ⇒ proof, routing ⇒ transit, NAT/firewall ⇒ policy, simulation ⇒ what-if comparison).
- **Evidence pack:** scripts + key captures + rule counters + a one-page topology diagram with addresses — evaluators mark artefacts, not memories.
- **Viva defence:** every choice gets "why not the alternative" (static vs dynamic routing, select vs threads, DROP vs REJECT) in two sentences.

## 3. Build Order and Line-by-Line Plan

```bash
# 1. topology.sh — namespaces + veth + addresses (M3.01 pattern, two LANs + internet)
# 2. routes.sh  — static vias both directions + ip_forward (verify: cross ping)
# 3. nat-fw.sh  — MASQUERADE + default-deny + ESTABLISHED + public forward to select-server
# 4. serve.py   — M1.04 select-server on the forwarded port (prove: LAN + internet clients served)
# 5. capture/   — handshake.pcap, teardown.pcap, blocked-scan.pcap (DROP silence vs service SYN-ACK)
# 6. report.md  — diagram, address table, rule table with counters, what-if ns-3 plot (optional)
```

- Order is dependency order: links → routes → policy → service → proof → paper (each step verified before the next — never debug three layers at once).
- Port-forward (DNAT) is the one new rule: `-t nat -A PREROUTING -i vpub -p tcp --dport 8080 -j DNAT --to 10.0.1.10:5002` + matching FORWARD accept — inbound mapping made explicit (M3.02's lesson applied).
- Captures are the defence exhibits: blocked scan (unanswered SYNs = DROP), served handshake (SYN-ACK = policy hole working), teardown (clean close).

## 4. Expected Output and How to Verify

LAN browses "internet"; internet reaches only the forwarded service; scans elsewhere time out; counters attribute every flow to its rule; report diagram matches `ip route` dumps. Verify end-to-end the evaluator's way: fresh eyes run `topology.sh` on a clean machine and reproduce every claim (reproducibility is the real grade).

::: callout-pitfall Demo-Day Entropy
Untested cables, dead laptop batteries, and "worked yesterday" scripts fail evaluations. Freeze code the night before, photograph the working setup, carry the evidence pack on a pen drive — logistics is graded implicitly.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| Works for builder, fails for evaluator | Hardcoded interface names/addresses — parameterise, document prerequisites |
| Forwarded service unreachable externally | DNAT without matching FORWARD accept (two rules, both mandatory) |
| Report claims exceed captures | Every sentence needs an artefact (pcap line, counter, ping log) — unexhibited claims score zero |

**Viva bank (defend each in two sentences):** static over dynamic routing here (size/trust)? select over threads (scale/simplicity)? DROP over REJECT on the outside (stealth vs diagnostics)? netem vs real loss for the reliability demo (control vs realism)? namespaces vs VMs (weight vs fidelity)?

**Exam/practical checklist:** clean-machine reproduction ☐; diagram = dumps ☐; every rule counter-attributed ☐; 3 captures exhibited ☐; viva bank rehearsed aloud ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz DNAT rule added but the forwarded service still times out externally. LAN-direct access works. What second rule is missing and why are two always needed?
() DNAT is broken; use a VPN instead
(*) Matching FORWARD accept: DNAT rewrites destination (nat table) but filter FORWARD still DROPs the packet — translation and permission are separate verdicts; LAN works because it never crosses the filtered path
() The service must bind the public IP directly
() Timeouts mean success in firewall logic
::: explanation
Two tables, two verdicts: nat decides where, filter decides whether. LAN-direct bypasses both — external failure with LAN success isolates the missing filter half every time.
:::

::: quiz Evaluator asks "why static routing instead of OSPF here?" Give the two-sentence defence.
() OSPF wasn't installed, so static won
(*) Four routers with one admin and full trust: static is exact, debuggable, zero-overhead; dynamic protocols pay convergence complexity for scale and multi-admin policy we don't have — fitness, not fashion, picks protocols
() Static is always superior to dynamic everywhere
() Exams forbid dynamic protocols in labs
::: explanation
Defence = constraints + cost: name the topology facts (tiny, single-admin, trusted) and the avoided costs (convergence, config surface). Protocol choice is fitness arithmetic — show both sides of the ledger.
:::
