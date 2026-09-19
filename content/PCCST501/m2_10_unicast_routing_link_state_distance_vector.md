---
id: m2_10_unicast_routing_link_state_distance_vector
courseCode: PCCST501
module: 2
sequence: 10
title: 'Unicast Routing: Link-State & Distance-Vector'
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - Contrast flooding surveyors with gossiping neighbours
  - Trace Dijkstra settle order on a small topology
  - Explain count-to-infinity and its poison cures
  - Place OSPF inside and BGP between administrations
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

**How routers learn the map — Dijkstra flooding (OSPF) vs neighbour gossip (RIP), one settled order traced, one rumour looped, poison as the cure.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Surveyors vs Gossip
**Link-state** routers are surveyors: flood everyone's measurements (link-state advertisements) until all hold the *same* map, then each runs Dijkstra locally — identical inputs, identical conclusions, fast convergence, flooding overhead. **Distance-vector** routers are gossiping neighbours: "I reach X in 5" — Bellman-Ford by rumour, tiny messages, slow truth (bad news crawls, good news runs), and loops of stale praise counting to infinity.
:::

Forwarding (M2.9) spends the table; routing *builds* it — data plane versus control plane, the layer's deepest split.

::: anim dijkstra-settle Settling in Order, Never Reopening
Distances lock smallest-first and stay locked — the settling contract the trace below obeys.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The two algorithms

Link-state: reliable flooding of $(neighbour, cost)$ LSAs → identical topology DB → Dijkstra per router; hierarchy via OSPF areas; converges in roughly flood-time + compute. Distance-vector: Bellman-Ford distributed — $D_x(y) = \min_v \{c(x,v) + D_v(y)\}$; periodic + triggered exchanges with neighbours only; RIP caps cost at $15$ hops ($16 = \infty$) to bound loops; **poisoned reverse** (advertise $\infty$ back to your next-hop) and split horizon break two-node loops. Inter-domain (BGP) is path-vector: full AS-paths carried, policy-gated, loop-free by inspection.

### 2.2 Failure modes

LS: flooding storms on flapping links (mitigated by dampening/areas). DV: **count-to-infinity** — stale good news recirculates upward after a cost increase ($3 \to 4 \to 5 \dots$ until holddown/poison intervenes); triggered updates + poison limit it to larger loops, never fully cure gossip's optimism.

::: callout-formula KTU Formula Vault: Routing
LS $=$ flood + Dijkstra, $O(E\log V)$ each · DV: $D_x(y) = \min_v(c + D_v)$ · RIP $16 = \infty$ · poisoned reverse breaks pairs · BGP $=$ path-vector + policy.
:::

OSPF areas and BGP policies are *administrative* answers to scaling/trust, not algorithmic ones — hierarchy contains flooding, policy contains strangers.

::: callout-pitfall Good-News Symmetry
DV converges fast on improvements (a cheaper route propagates in one exchange wave) and slowly on failures (stale routes must age out upward). An option claiming symmetric convergence mistakes gossip's optimism for a protocol guarantee — bad news travels at rumour speed.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Topology: $s$–$a$ ($1$), $s$–$b$ ($4$), $a$–$b$ ($2$), $a$–$c$ ($6$), $b$–$c$ ($3$). (a) Dijkstra from $s$: settle order and distances. (b) DV check at $a$ for destination $c$ given $b$'s vector $D_b(c) = 3$.
:::

::: step [Step 2: Execution] Settle, Then Gossip
(a) Init $\{s{:}0\}$. Pop $s$ → $a = 1$, $b = 4$. Pop $a$ ($1 < 4$) → $b = \min(4, 1+2) = 3$, $c = 1+6 = 7$. Pop $b$ ($3 < 7$) → $c = \min(7, 3+3) = 6$. Pop $c$. Order $[s, a, b, c]$, distances $\{0, 1, 3, 6\}$ — settled values never reopen (non-negative weights, Dijkstra's contract). (b) $D_a(c) = \min(6\ \text{direct},\ 2 + D_b(c) = 2 + 3) = 5$ via $b$ — gossip undercuts the direct edge, and consistency holds end-to-end: $D(s,c) = 1 + D_a(c) = 6$ ✓, exactly Dijkstra's answer from $s$.
:::

::: step [Step 3: Conclusion] Final Result
Distances $\{s{:}0, a{:}1, b{:}3, c{:}6\}$ by both methods. LS computed it from a flooded map; DV whispered it into agreement — one truth, two epistemologies, and the exam's favourite dual-method cross-check.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
