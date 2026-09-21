---
id: m2_07_multicast_routing_trees_rpf
courseCode: PCCST501
module: 2
sequence: 7
title: 'Multicast Routing: One Send, Many Receivers'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Separate unicast, broadcast, and multicast delivery economics
  - Apply the RPF check to forward, replicate, and drop decisions
  - Place IGMP, tree, and inter-domain protocols in order
  - Self-test with the exam recap and active-recall checklist
concepts:
  - multicast
  - RPF check
  - IGMP
  - delivery trees
prerequisites: []
examRelevance: medium
tags:
  - multicast
  - routing
---
# Multicast Routing: One Send, Many Receivers

**Class-D groups, IGMP membership, RPF flood-and-prune, source vs shared trees — and the copy-count trace that proves loops die silently.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

A live lecture streams to 10,000 students. Sending 10,000 separate copies (unicast — one sender to one receiver, repeated) melts the source. Shouting to *everyone on the Internet* (broadcast) wastes the whole planet's bandwidth. The sane middle: send once, and let the network duplicate the stream only where paths branch toward actual viewers.

The problem before the solution: deliver one send to *many selected* receivers without per-receiver work at the source and without loops duplicating packets forever. Multicast's answer: receivers **subscribe** to a group address; routers grow a **delivery tree** covering exactly the members; and a one-line **RPF (Reverse Path Forwarding)** check kills loops.

::: callout-intuition Core Mental Model: Club Newsletter, Not Personal Letters
**Unicast** mails personal letters ($N$ copies from the source); **broadcast** shouts at the whole street (everyone pays); **multicast** runs a **club newsletter** — one send, delivered only to subscribers (Class-D group $224.0.0.0$–$239.255.255.255$). Routers learn who subscribed via **IGMP (Internet Group Management Protocol)**, then grow delivery trees covering exactly the members — no member, no copy, no waste.

Dropping the newsletter now: group = Class-D address subscribers join; tree = the branched forwarding paths; RPF = forward only arrivals on the best path back to the source.
:::

::: anim multicast-rpf On-Tree Copies, Off-Tree Drops
On-tree arrival fans out once per member link; the looped duplicate fails its RPF check and dies — flood reaches all, prune keeps only members.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Unicast / broadcast / multicast** | One-to-one / one-to-all-on-a-network / one-to-subscribers-only delivery. |
| **Class-D address ($224.0.0.0$–$239.255.255.255$)** | The IPv4 range reserved for multicast group identities — no host owns one; receivers subscribe to it. |
| **IGMP (Internet Group Management Protocol)** | The edge protocol by which hosts join/leave groups (membership reports to the local router). |
| **Delivery tree** | The branched set of router paths from source (or core) to all members. **Source-based** = one shortest-path tree per source; **group-shared** = one tree per group rooted at a rendezvous/core point. |
| **RPF (Reverse Path Forwarding) check** | Forward a multicast packet only if it arrived on the interface the router would use to unicast *back* to the source — else drop. The loop-killer. |
| **Flood-and-prune** | First flood everywhere, then cut branches with no members — how source trees are learned. |
| **DVMRP / MOSPF / PIM-DM / PIM-SM (Distance Vector Multicast Routing Protocol / Multicast OSPF / Protocol Independent Multicast – Dense/Sparse Mode)** | Intra-domain (within one administration) multicast protocols: source-tree flood-and-prune family vs. shared-tree family. |
| **MBGP / MSDP (Multiprotocol BGP / Multicast Source Discovery Protocol)** | Inter-domain (between administrations) multicast support: MBGP (Multiprotocol Border Gateway Protocol) carries multicast routes; MSDP shares active sources across domains. |
| **CBT (Core Based Trees)** | An early group-shared-tree design (rendezvous core per group). |

<a id="the-math"></a>
## 3. Purpose — Trees, Protocols, IGMP

### 3.1 Operation Flow: Trees and Protocols

Two tree shapes: **source-based** (one shortest-path tree per source — DVMRP flood-and-prune, MOSPF) and **group-shared** (one rendezvous/core tree per group — CBT, PIM-SM). Intra-domain: DVMRP, MOSPF, PIM-DM/SM; inter-domain: MBGP carries multicast routes, MSDP shares active sources across domains. **RPF check**: forward a multicast packet only if it arrived on the interface the router would use to unicast *back* to the source — else drop (loop-killer, duplicate-killer).

### 3.2 IGMP's Role

Hosts join/leave groups with IGMP membership reports to their local router; routers query periodically and prune branches with zero members. Group state lives at the edge; the core forwards by tree, never by member list.

::: callout-formula KTU Formula Vault: Multicast
Class D $= 224/4$ · IGMP joins at edge · RPF: arrival $\in$ best-path-to-source else drop · source trees (flood-prune) vs shared trees (core) · intra (PIM/DVMRP) vs inter (MBGP/MSDP).
:::

RPF reuses the *unicast* table — no separate multicast topology needed for the check, which is why every multicast protocol leans on whatever unicast routing already computed.

::: callout-pitfall Broadcast Confusion
Broadcast hits all hosts on a LAN (one subnet, ARP-style); multicast crosses routers to *subscribers only*, group-addressed. An option delivering "to every host on the Internet" describes neither — multicast scope is membership, never everybody.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

One source, one router, two links: link A reaches a member, link B reaches nobody. RPF passes on the source-facing arrival → one copy down link A, zero down link B. A duplicate looping back on link A fails RPF (best path to the source is the other interface) → dropped. Two decisions: copy toward members, kill the loop.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
Source $S$ feeds router R1 (best path to $S$ via eth0). R1 links: eth1 → member H1, eth2 → non-member H2, eth3 → R2 (which serves member H3). One packet from $S$ arrives on eth0; a looped duplicate later arrives on eth1. Tabulate R1's decisions and final deliveries.
:::

::: step [Step 2: Execution] Check, Copy, Drop
Original on eth0: RPF pass (eth0 *is* the best path to $S$) → forward one copy to eth1 (H1 ✓) and one to eth3 (→ R2 → H3 ✓); nothing to eth2 (no members — prune). Copies made: $2$. Duplicate on eth1: RPF fail (best path to $S$ is eth0, not eth1) → drop silently. H1 and H3 receive exactly $1$ each; H2 receives $0$; the loop dies at R1 instead of circling.
:::

::: step [Step 3: Conclusion] Final Result
$2$ forwarded copies, $1$ silent drop, deliveries $\{H1:1, H3:1, H2:0\}$. RPF's two jobs visible in one trace: replicate toward members, annihilate loops — flood-and-prune's flood reaches, its prune (plus RPF) restrains.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Unicast vs. broadcast vs. multicast | $N$ copies / all hosts / subscribers only. |
| Source tree vs. shared tree | Per-source shortest paths (flood-prune) vs. per-group core tree. |
| IGMP vs. routing protocols | Edge membership vs. tree construction vs. inter-domain source sharing. |
| RPF pass vs. fail | Arrival on best-path-to-source vs. any other interface — same bytes, opposite fates. |

**Watch out:** (1) Routing downloads *through* the tracker-like middleman — members receive from the tree, introducers only introduce. (2) Giving the tracker/tree-builder's job to IGMP — IGMP only joins at the edge. (3) "Multicast to everyone" — membership bounds every delivery.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Multicast = Class-D groups + IGMP edge joins + delivery trees + RPF loop-killer (arrival must equal best path to source). Source trees (DVMRP/MOSPF, flood-prune) vs. shared trees (CBT/PIM-SM, core); intra-domain PIM/DVMRP vs. inter-domain MBGP/MSDP. Source cost $O(1)$ vs. unicast $O(N)$.
:::

**Active-recall checklist:** What three delivery scopes exist? State the RPF rule in one line. Which protocols act at edge, domain, and inter-domain levels? Why does multicast reuse the unicast table?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Q1: RPF Drill
Router's best path to source $S$ is eth2. Multicast packet from $S$ arrives on eth2, then a copy arrives on eth0. Decisions?
(A) Forward both, more copies safer
(*B) Forward the eth2 arrival (RPF pass) out all member links; drop the eth0 copy (RPF fail) — arrival interface, not content, decides, and identical payloads get opposite verdicts
(C) Drop both, duplicates are evil
(D) Forward the second, it is fresher
::: explanation
RPF keys on ingress vs unicast-best-path: eth2 matches, eth0 doesn't. Same bytes, opposite fates — interface-based loop prevention in one line, and why multicast survives topologies that would ring unicast floods forever.
:::

::: quiz Q2: Tree Economics
$100$ receivers, $1$ source, group-shared tree vs $100$ unicasts. Source load?
(A) Equal, trees cost the same
(*B) $1$ send (tree replicates in-network) vs $100$ sends — source bandwidth drops $100\times$, the entire economic argument for multicast live streaming
(C) Shared trees send $100$ anyway
(D) Unicast is always cheaper
::: explanation
Replication moves from source CPU into router silicon: one packet injected, copied at branch points. Source cost $O(1)$ vs $O(N)$ — potluck economics (M1.8's reunion) applied to live distribution.
:::

::: quiz Q3: Protocol Placement
Host joins group; cross-domain source appears. Which protocols act, in order?
(A) MSDP first, IGMP never
(*B) IGMP (host→local router join), then PIM-SM inside the domain, MBGP/MSDP across domains — edge membership, intra-domain tree, inter-domain source-sharing, each layer its own protocol
(C) RPF joins the group
(D) Class-D does it alone
::: explanation
Joins climb outward: membership at the edge (IGMP), trees within the AS (Autonomous System) (PIM-SM), source announcements between ASes (MSDP over MBGP routes). Layered responsibility mirrors the unicast hierarchy — local, domain, inter-domain.
:::
