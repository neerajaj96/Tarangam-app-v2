---
id: m3_01_static_routing_lab
courseCode: PCCSL507
module: 3
sequence: 1
title: 'Static Routing Between Namespaces'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State what a router does that a host cannot in plain words first
  - Build a two-router topology with network namespaces
  - Prove forwarding with traceroute and capture
concepts:
  - static routes
  - IP forwarding
  - namespaces
prerequisites:
  - m2_04_reliability_protocols_lab
examRelevance: high
tags:
  - static-routing
  - namespaces-lab
---
# Static Routing Between Namespaces

**Objective:** make two "computers" and one "router" from thin air (namespaces + veth), route between them statically, and watch packets cross.

**What you should know first:** `ip route` reading (M1.01); longest-prefix forwarding idea (PCCST501 theory in one line).

**Required software/tools:** Linux with root (namespaces need it); `iproute2`; `traceroute`/`ping`; Wireshark optional on veth.

## 1. What Are We Doing, and Why

We create namespace `h1` (host, 10.0.1.2), namespace `r1` (router, 10.0.1.1 + 10.0.2.1), namespace `h2` (host, 10.0.2.2), wire them with veth pairs, enable forwarding in `r1`, add routes, and ping end-to-end. Why: routing stops being a diagram — you are the administrator writing the tables protocols automate.

## 2. Concept in Very Simple Language

- **Namespace:** a private network stack (own interfaces/routes) — a virtual machine's network without the machine.
- **veth pair:** a virtual cable: packet in one end pops out the other — plug ends into different namespaces.
- **Forwarding + routes:** router's kernel passes packets between its interfaces (`ip_forward=1`); each host needs a route to the far net via the router ("via 10.0.1.1").

## 3. Commands and Line-by-Line Explanation

```bash
sudo ip netns add h1; sudo ip netns add h2; sudo ip netns add r1   # three stacks
sudo ip link add v1h type veth peer name v1r    # cable 1: h1 <-> r1
sudo ip link add v2h type veth peer name v2r    # cable 2: h2 <-> r1
sudo ip link set v1h netns h1; sudo ip link set v1r netns r1
sudo ip link set v2h netns h2; sudo ip link set v2r netns r1
sudo ip netns exec h1 ip addr add 10.0.1.2/24 dev v1h
sudo ip netns exec h1 ip link set v1h up; sudo ip netns exec h1 ip link set lo up
sudo ip netns exec r1 ip addr add 10.0.1.1/24 dev v1r
sudo ip netns exec r1 ip addr add 10.0.2.1/24 dev v2r
sudo ip netns exec r1 ip link set v1r up; sudo ip netns exec r1 ip link set v2r up
sudo ip netns exec r1 sysctl -w net.ipv4.ip_forward=1   # ROUTER MODE ON (default off!)
sudo ip netns exec h2 ip addr add 10.0.2.2/24 dev v2h
sudo ip netns exec h2 ip link set v2h up; sudo ip netns exec h2 ip link set lo up
sudo ip netns exec h1 ip route add 10.0.2.0/24 via 10.0.1.1   # far net via router
sudo ip netns exec h2 ip route add 10.0.1.0/24 via 10.0.2.1
sudo ip netns exec h1 ping -c 3 10.0.2.2     # the moment of truth
```

- `peer name` builds both cable ends at once; each end moved into its namespace before addressing (addresses live per-stack).
- `ip_forward=1` is THE router switch — off by default, and its absence is the #1 "routes right, ping fails" cause.
- Host routes point at the *near* router address (`via`), never the far host — next-hop must be directly reachable.

## 4. Expected Output and How to Verify

`ping` replies `0% loss`; `traceroute 10.0.2.2` from h1 shows hop 10.0.1.1 then destination; `ip netns exec r1 ip route` shows both connected nets. Verify forwarding's role: `sysctl ... =0` breaks ping instantly (routes intact, forwarding dead — the two-half diagnosis).

::: callout-pitfall Forwarding Amnesia
Every static-routing lab death is `ip_forward` (off), missing `via` (host has no door), or down interface (address without UP). Check in that order — switch, route, link.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| Routes perfect, ping fails | Forwarding off in r1 — `sysctl -w net.ipv4.ip_forward=1` |
| `Network unreachable` from h1 | Missing `via` route — add far net via near router address |
| One direction works only | Return route missing in h2 — routing is per-direction, always both |

**Viva:** namespace vs VM (stack-only isolation)? Why `via` must be link-local reachable? What does `ip_forward` gate, exactly (inter-interface packet passing)?

**Exam/practical checklist:** 3 namespaces + 2 cables ☐; addresses + UP everywhere ☐; forwarding on ☐; both `via` routes ☐; ping + traceroute prove transit ☐; cleanup (`ip netns del`) ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Routes added both sides, interfaces UP, yet h1 cannot ping h2. `ip route` in r1 shows both nets. What single switch is off and what does it gate?
() The cables are unplugged virtually — rebuild all
(*) `net.ipv4.ip_forward=1` in r1: the kernel drops inter-interface packets by default (hosts don't route); routes name doors, forwarding opens them — tables without the switch are decoration
() Ping is blocked by namespaces permanently
() veth pairs need IP addresses themselves
::: explanation
Two halves of routing: tables (where) and forwarding (whether). Perfect tables with a dead switch fail identically to no tables — check the switch the moment tables look right.
:::

::: quiz h1 pings h2 fine, but h2 cannot ping h1. Topology symmetric. What is missing and what principle does it teach?
() Forwarding works one way only — toggle per direction
(*) h2's return route (`10.0.1.0/24 via 10.0.2.1`): replies have no door home. Routing is per-direction state — every path needs its mirror, and asymmetric success always means a one-sided table
() h1's firewall blocks inbound selectively
() Ping replies need no routes by protocol
::: explanation
Requests and replies route independently: one working direction proves exactly half the tables. Mirror-check every path — "works one way" is the signature of the missing return.
:::
