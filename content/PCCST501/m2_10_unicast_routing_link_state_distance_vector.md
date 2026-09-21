---
id: m2_10_unicast_routing_link_state_distance_vector
courseCode: PCCST501
module: 2
sequence: 10
title: 'Unicast Routing: Link-State & Distance-Vector'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - Contrast flooding surveyors with gossiping neighbours
  - Trace Dijkstra settle order on a small topology
  - Explain count-to-infinity and its poison cures
  - Place OSPF inside and BGP between administrations
  - Read and edit a Linux routing table with the ip command
  - Self-test with the exam recap and active-recall checklist
concepts:
  - link-state routing
  - distance-vector routing
  - Dijkstra
  - count-to-infinity
prerequisites:
  - m2_09_ipv4_addressing_forwarding_nat_icmp
examRelevance: high
tags:
  - routing
  - ospf
  - bgp
---
# Unicast Routing: Link-State & Distance-Vector

**How routers learn the map — Dijkstra flooding (OSPF) vs neighbour gossip (RIP), one settled order traced, one rumour looped, poison as the cure, plus hands-on Linux routing with the `ip` command.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

Forwarding (last note) *spends* a routing table: longest-prefix match picks the next hop in microseconds. But who *writes* that table? Nobody configures every router on Earth by hand — routers must **learn** the map themselves, continuously, as links fail and recover.

The problem before the solution: build correct forwarding tables everywhere without any router seeing the whole picture at once. Two philosophies compete. **Link-state** routers act as surveyors: flood everyone's measurements until all hold the same map, then each computes routes locally. **Distance-vector** routers act as gossiping neighbours: each tells neighbours only its current best distances, and truth emerges from rumour — including rumour's famous failure, counting to infinity.

::: callout-intuition Core Mental Model: Surveyors vs Gossip
**Link-state** routers are surveyors: flood everyone's measurements (link-state advertisements) until all hold the *same* map, then each runs Dijkstra locally — identical inputs, identical conclusions, fast convergence, flooding overhead. **Distance-vector** routers are gossiping neighbours: "I reach X in 5" — Bellman-Ford by rumour, tiny messages, slow truth (bad news crawls, good news runs), and loops of stale praise counting to infinity.

Dropping the metaphor now: LSA (Link-State Advertisement) = one router's signed measurement broadcast; Dijkstra = shortest-path computation on the flooded map; Bellman-Ford update $D_x(y) = \min_v\{c(x,v)+D_v(y)\}$ = gossip rule; poisoned reverse = advertising infinity back toward your next hop.
:::

Forwarding (M2.9) spends the table; routing *builds* it — data plane versus control plane, the layer's deepest split.

::: anim dijkstra-settle Settling in Order, Never Reopening
Distances lock smallest-first and stay locked — the settling contract the trace below obeys.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Routing (vs. forwarding)** | Control-plane learning that *builds* tables vs. data-plane lookup that *spends* them. |
| **LSA (Link-State Advertisement)** | One router's broadcast measurement: (neighbour, cost) pairs, flooded reliably to all. |
| **OSPF (Open Shortest Path First)** | The standard intra-domain link-state protocol (Dijkstra + areas for hierarchy). |
| **RIP (Routing Information Protocol)** | The classic intra-domain distance-vector protocol: hop-count metric, cost $16 = \infty$ (infinity). |
| **BGP (Border Gateway Protocol)** | The inter-domain **path-vector** protocol: carries full AS (Autonomous System) paths, policy-gated, loop-free by inspection. |
| **AS (Autonomous System)** | One administration's network (a campus, an ISP) — routing inside it (OSPF/RIP) vs. between them (BGP). |
| **Count-to-infinity** | Distance-vector failure: stale good news recirculates upward after a cost increase ($3 \to 4 \to 5 \dots$). |
| **Poisoned reverse / split horizon** | Cures: advertise $\infty$ (infinity) back to the neighbour you route through (poison); never advertise a route back to the neighbour you learned it from (split horizon). Breaks two-node loops. |

<a id="the-math"></a>
## 3. Purpose — The Two Algorithms, Failure Modes, Admin Placement

### 3.1 Operation Flow: The Two Algorithms, Step by Step

**Link-state (flood, then compute locally):**

1. Each router measures its direct link costs to neighbours.
2. It floods an LSA with those costs; reliable flooding gives every router an identical topology database.
3. Each router runs **Dijkstra** locally on that map (typical implementation cost $O(E \log V)$ with a binary heap: $V$ vertices, $E$ edges).
4. Hierarchy via OSPF areas contains flooding at scale. Converges in roughly flood-time + compute.

**Distance-vector (gossip with neighbours only):**

1. Each router keeps a vector of best-known distances $D_x(y)$ to every destination $y$.
2. Periodically (and on change — triggered updates) it shares the vector with direct neighbours only.
3. On hearing neighbour $v$'s vector, it applies Bellman-Ford: $D_x(y) = \min_v \{c(x,v) + D_v(y)\}$, where $c(x,v)$ is the direct link cost to $v$.
4. RIP caps cost at $15$ hops ($16 = \infty$) to bound loops; **poisoned reverse** (advertise $\infty$ back to your next-hop) and split horizon break two-node loops. Inter-domain (BGP) is path-vector: full AS-paths carried, policy-gated, loop-free by inspection.

### 3.2 Failure Modes

LS: flooding storms on flapping links (mitigated by dampening/areas). DV: **count-to-infinity** — stale good news recirculates upward after a cost increase ($3 \to 4 \to 5 \dots$ until holddown/poison intervenes); triggered updates + poison limit it to larger loops, never fully cure gossip's optimism.

::: callout-formula KTU Formula Vault: Routing
LS $=$ flood + Dijkstra, $O(E\log V)$ each · DV: $D_x(y) = \min_v(c + D_v)$ · RIP $16 = \infty$ · poisoned reverse breaks pairs · BGP $=$ path-vector + policy.
:::

OSPF areas and BGP policies are *administrative* answers to scaling/trust, not algorithmic ones — hierarchy contains flooding, policy contains strangers.

::: callout-pitfall Good-News Symmetry
DV converges fast on improvements (a cheaper route propagates in one exchange wave) and slowly on failures (stale routes must age out upward). An option claiming symmetric convergence mistakes gossip's optimism for a protocol guarantee — bad news travels at rumour speed.
:::

<a id="linux-ip-routing"></a>
## 4. Hands-On — Linux Routing With the `ip` Command

Theory builds tables; operators inspect them. On any Linux machine the routing table — the very object OSPF/RIP/BGP write and forwarding reads — is visible and editable with the `ip` command (from the `iproute2` suite). Read-only showing is safe anywhere; `add`/`del` need root and are best tried in a lab VM (virtual machine) or network namespace.

### 4.1 Reading: `ip route show`

```text
$ ip route show
default via 192.168.1.1 dev eth0 proto dhcp metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.20
10.10.0.0/16 via 10.10.0.1 dev eth1 proto static metric 10
```

Read it column by column: destination prefix (`default` means `0.0.0.0/0` — last resort); `via` = next-hop gateway; `dev` = outgoing interface; `proto` = who installed it (`kernel` = directly connected, `dhcp`, `static`, or a routing daemon); `metric` = tie-break cost (lower wins among equal-length prefixes); `scope link` = reachable directly without a gateway; `src` = preferred source address.

### 4.2 Longest-Prefix Match, Live

The kernel forwards exactly as M2.9 taught: longest matching prefix wins, metrics break ties only at equal length. A packet to `10.10.5.9` matches `10.10.0.0/16` (via `10.10.0.1`) and `default` — `/16` is longer, so it leaves via `eth1`, and the default is never consulted. A packet to `8.8.8.8` matches only `default` → gateway `192.168.1.1` out `eth0`. This is the forwarding table the routing protocols above exist to populate — reading it here closes the loop between control plane (learning) and data plane (spending).

### 4.3 Editing: `ip route add` / `ip route del`

```text
$ sudo ip route add 172.16.5.0/24 via 10.10.0.1 dev eth1
$ ip route show | grep 172.16
172.16.5.0/24 via 10.10.0.1 dev eth1 scope global
$ sudo ip route del 172.16.5.0/24
```

Step by step: `add` installs a static route (packets to `172.16.5.x` now leave via gateway `10.10.0.1`); the `show | grep` verifies it landed; `del` removes it, restoring the previous table. Static entries like this are exactly what dynamic protocols automate away — hand-write one to feel the table as a living object, then let OSPF/BGP do the handwriting at scale. (Deleting a route only drops the *table entry*, never the interface or its addresses.)

<a id="worked-example"></a>
## 5. Examples — Tiny First, Then Exam-Level

### 5.1 Toy Example (30 seconds)

Two routers, one destination. Link-state: both flood, both compute, both agree in one flood round. Distance-vector: A tells B "3 to X"; the A–X link dies; B still advertises stale "3"; A adopts "4 via B"; B hears "4", adopts "5 via A" — the rumour ladder starts climbing. Without poison, gossip counts; with poisoned reverse, B would have told A "$\infty$ to X" from the start and the ladder never forms.

### 5.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
Topology: $s$–$a$ ($1$), $s$–$b$ ($4$), $a$–$b$ ($2$), $a$–$c$ ($6$), $b$–$c$ ($3$). (a) Dijkstra from $s$: settle order and distances. (b) DV check at $a$ for destination $c$ given $b$'s vector $D_b(c) = 3$.
:::

::: step [Step 2: Execution] Settle, Then Gossip
(a) Numbered Dijkstra trace from $s$: Init $\{s{:}0\}$. Pop $s$ → $a = 1$, $b = 4$. Pop $a$ ($1 < 4$) → $b = \min(4, 1+2) = 3$, $c = 1+6 = 7$. Pop $b$ ($3 < 7$) → $c = \min(7, 3+3) = 6$. Pop $c$. Order $[s, a, b, c]$, distances $\{0, 1, 3, 6\}$ — settled values never reopen (non-negative weights, Dijkstra's contract). (b) $D_a(c) = \min(6\ \text{direct},\ 2 + D_b(c) = 2 + 3) = 5$ via $b$ — gossip undercuts the direct edge, and consistency holds end-to-end: $D(s,c) = 1 + D_a(c) = 6$ ✓, exactly Dijkstra's answer from $s$.
:::

::: step [Step 3: Conclusion] Final Result
Distances $\{s{:}0, a{:}1, b{:}3, c{:}6\}$ by both methods. LS computed it from a flooded map; DV whispered it into agreement — one truth, two epistemologies, and the exam's favourite dual-method cross-check.
:::

<a id="exam-recap"></a>
## 6. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Routing vs. forwarding | Builds tables (control) vs. spends them (data, longest match). |
| LS vs. DV convergence | Flood-time + compute (fast, chatty) vs. rumour rounds (quiet, bad news slow). |
| Poison vs. split horizon | Advertise $\infty$ to your next hop vs. never advertise back the learned route. |
| OSPF vs. BGP | Inside one AS (flood + Dijkstra + areas) vs. between ASes (AS-paths + policy). |
| `via` vs. `dev` in `ip route` | Next-hop gateway vs. outgoing interface. |

**Watch out:** (1) Claiming DV converges symmetrically — good news runs, bad news crawls. (2) Reopening settled Dijkstra nodes mid-proof — changed weights mean a new run. (3) Reading `default` as "first tried" — it is consulted last (shortest prefix).

::: callout-exam KTU Exam Focus: One-Paragraph Recap
LS = flood LSAs + per-router Dijkstra (OSPF + areas inside an AS). DV = neighbour gossip via $D_x(y)=\min_v(c+D_v)$ (RIP, 16 = ∞); count-to-infinity on failures, poisoned reverse/split horizon for pairs. BGP = path-vector + policy between ASes. Linux: `ip route show` reads (prefix, via, dev, proto, metric); longest prefix wins; `add`/`del` edit statically.
:::

**Active-recall checklist:** Which plane builds vs. spends tables? Trace Dijkstra's settle order on four nodes. Walk two rounds of count-to-infinity. What does each `ip route show` column mean, and which entry wins for a given destination?

<a id="self-check"></a>
## 7. Active Recall Quizzes

::: quiz Q1: Settle Discipline
Dijkstra pops $b$ with $3$ while $c$ sits at $7$. Later, edge $b$–$c$ is found to cost $1$, not $3$. Valid complaint?
(A) None, popped means done
(*B) The trace is stale, not the algorithm — Dijkstra settles correctly for the graph *as given*; wrong input weights void the run, so re-run (or dynamic algorithms) rather than "reopening" mid-proof
(C) $c$ should have popped first
(D) Negative weights detected
::: explanation
Settle-once assumes the input graph is the real graph: $b$'s $3$ was final *for those weights*. Changed weights mean a new problem — Dijkstra is one-shot correct, not self-updating; dynamic settings need DV-style gossip or re-computation.
:::

::: quiz Q2: Count Mechanics
Line $A$–$B$ ($1$), $B$–$C$ ($1$). Link $B$–$C$ dies. $B$ hears $A$'s stale "$2$ to $C$". Next two advertised values (no poison)?
(A) $B = \infty$ immediately
(*B) $B = 1 + 2 = 3$, then $A$ hears $3$ and goes $1 + 3 = 4$ — the rumour ladder $2 \to 3 \to 4 \dots$ climbing per exchange round until holddown caps it; poisoned reverse (advertise $\infty$ toward your next hop) would have killed step one
(C) Both stay $2$ forever
(D) $A = \infty$, $B = 2$
::: explanation
Stale praise recirculates: $B$ trusts $A$'s pre-failure news, $A$ then trusts $B$'s inflated echo. Each round adds the link cost — count-to-infinity in two moves, and poison's absence is the enabling condition to name.
:::

::: quiz Q3: Protocol Placement
Campus interior needs fast convergence; ISP peering needs policy control. Assignments?
(A) BGP inside, OSPF between ISPs
(*B) OSPF (link-state, areas) inside — single administration, flood-affordable, Dijkstra-fast; BGP (path-vector) between — policy-gated route selection with AS-path loop inspection across distrusting strangers
(C) RIP everywhere, hop caps suffice
(D) Static routes for both
::: explanation
Trust draws the line: interiors share truth (flood it), exteriors negotiate (policy it). OSPF's areas scale the flood; BGP's AS-paths audit the strangers — interior/exterior is an administrative boundary first, algorithmic second.
:::

::: quiz Q4: Reading the Table
`ip route show` prints `10.20.0.0/16 via 10.20.0.1 dev eth1` and `default via 192.168.1.1 dev eth0`. A packet for `10.20.9.9` arrives. Which entry wins, and why?
(A) Default — it is listed as the catch-all first resort
(*B) The `/16` entry via eth1 — longest-prefix match prefers the most specific covering prefix; default only serves destinations nothing else covers
(C) Neither — the packet is dropped for ambiguity
(D) Both — the kernel duplicates the packet down each path
::: explanation
Forwarding is most-specific-wins: `/16` covers `10.20.9.9` while `0.0.0.0/0` covers everything, so `/16` wins. Metrics arbitrate only equal-length ties. Same rule as §M2.9 — now observed live in the kernel table routing protocols populate.
:::
