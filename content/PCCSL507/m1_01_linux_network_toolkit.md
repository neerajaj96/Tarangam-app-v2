---
id: m1_01_linux_network_toolkit
courseCode: PCCSL507
module: 1
sequence: 1
title: 'Linux Network Toolkit: ip, ping & ss'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what each command proves in plain words first
  - Inspect interfaces, routes, and sockets on any Linux box
  - Diagnose no-link vs no-route vs no-service failures
concepts:
  - ip command
  - connectivity testing
  - socket listing
prerequisites: []
examRelevance: high
tags:
  - linux-networking
  - net-tools
---
# Linux Network Toolkit: ip, ping & ss

**Objective:** inspect and prove every layer of local connectivity with three commands — no theory revision needed beyond names.

**What you should know first:** IP addresses name machines, ports name programs (PCCST501 application-layer ideas in one line — full theory lives there, here we type).

**Required software/tools:** any Linux machine or VM (virtual machine); `iproute2` (preinstalled — provides `ip`); `iputils-ping`; `ss` (preinstalled). No root needed for inspection commands.

## 1. What Are We Doing, and Why

We prove the machine's networking alive bottom-up: link present? address assigned? route exists? peer answers? port listening? Each question has one command; exams ask the mapping, vivas ask the typing.

## 2. Concept in Very Simple Language

- `ip addr` shows interfaces with their addresses — the machine's network ID cards.
- `ip route` shows the routing table — which door each destination leaves by.
- `ping` sends echo requests — "are you alive?" with round-trip time.
- `ss -tlnp` lists listening TCP sockets — which programs wait on which ports.

## 3. Commands and Line-by-Line Explanation

```bash
$ ip addr show dev eth0
$ ip route show
$ ping -c 4 8.8.8.8
$ ss -tlnp
```

- `ip addr show dev eth0` — state + addresses of interface `eth0` (`UP`? `inet 192.168.1.20/24`? no `inet` ⇒ no address, check DHCP/cable).
- `ip route show` — `default via 192.168.1.1` must exist for internet; missing ⇒ packets have no door out.
- `ping -c 4 8.8.8.8` — 4 echo requests; replies carry `time=` RTT; `100% packet loss` ⇒ peer unreachable (or ICMP filtered).
- `ss -tlnp` — `-t` TCP, `-l` listening, `-n` numeric, `-p` process: `0.0.0.0:80` = program waiting on port 80 for anyone.

## 4. Expected Output and How to Verify

Healthy host shows: `eth0: UP` with an `inet` address; a `default` route; `0% packet loss` with RTT in ms; your server's port in `ss` output. Verify each layer in order — a missing lower layer explains every upper failure (no address ⇒ no route ⇒ no ping ⇒ no service).

::: callout-pitfall Three Failures, Three Layers
Cable/unplugged ⇒ no `UP`/carrier (link). No DHCP ⇒ `UP` but no `inet` (address). No gateway ⇒ address but no `default` (route). Diagnose downward-first: the lowest broken layer is always the true cause.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| `ping: connect: Network is unreachable` | No route — check `ip route`, add gateway |
| `Destination Host Unreachable` | ARP/link failure on local net — check cable, `ip neigh` |
| `ss` shows nothing on your port | Server not started or bound to `127.0.0.1` only — bind `0.0.0.0` to serve LAN |

**Viva:** `ip addr` vs `ip route` (identity vs doors)? `ping` proves what, and what can block it despite a healthy link (firewall/ICMP filter)? What does `0.0.0.0:8080` in `ss` mean?

**Exam/practical checklist:** interface UP with address ☐; default route present ☐; gateway pingable ☐; target pingable ☐; service port listening ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz `ping` to a LAN printer fails with "Destination Host Unreachable" but the gateway pings fine. Which layer failed and what is the next command?
() Internet is down — call the ISP
(*) Link/neighbour layer to the printer (ARP unresolved — printer off, wrong VLAN, or cable); next: `ip neigh` to confirm no MAC entry, then check printer power/cable — gateway fine proves your stack healthy
() DNS is broken — edit resolv.conf
() Ping is the wrong tool; use HTTP instead
::: explanation
"Host unreachable" on-LAN with a healthy gateway isolates the fault to the printer's link/neighbour path. Diagnose outward from what works — the gateway reply is your alibi.
:::

::: quiz `ss -tlnp` shows `127.0.0.1:5000` but LAN classmates cannot reach your app. Why, exactly?
() Port 5000 is cursed on Linux
(*) Bound to loopback only: `127.0.0.1` accepts local connections exclusively — rebind to `0.0.0.0` (all interfaces) to serve the LAN; `ss` told you the answer before any firewall theory
() Classmates need root to connect
() TCP forbids port 5000 across machines
::: explanation
The address before the colon is the audience: loopback means self-only. Read `ss` first in every "reachable here, not there" story — binding beats firewall as the usual cause.
:::
