# Multicast Routing: One Send, Many Receivers

**Class-D groups, IGMP membership, RPF flood-and-prune, source vs shared trees — and the copy-count trace that proves loops die silently.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Club Newsletter, Not Personal Letters
**Unicast** mails personal letters ($N$ copies from the source); **broadcast** shouts at the whole street (everyone pays); **multicast** runs a **club newsletter** — one send, delivered only to subscribers (Class-D group $224.0.0.0$–$239.255.255.255$). Routers learn who subscribed via **IGMP**, then grow delivery trees covering exactly the members — no member, no copy, no waste.
:::

::: anim multicast-rpf On-Tree Copies, Off-Tree Drops
On-tree arrival fans out once per member link; the looped duplicate fails its RPF check and dies — flood reaches all, prune keeps only members.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Trees and protocols

Two tree shapes: **source-based** (one shortest-path tree per source — DVMRP flood-and-prune, MOSPF) and **group-shared** (one rendezvous/core tree per group — CBT, PIM-SM). Intra-domain: DVMRP, MOSPF, PIM-DM/SM; inter-domain: MBGP carries multicast routes, MSDP shares active sources across domains. **RPF check**: forward a multicast packet only if it arrived on the interface the router would use to unicast *back* to the source — else drop (loop-killer, duplicate-killer).

### 2.2 IGMP's role

Hosts join/leave groups with IGMP membership reports to their local router; routers query periodically and prune branches with zero members. Group state lives at the edge; the core forwards by tree, never by member list.

::: callout-formula KTU Formula Vault: Multicast
Class D $= 224/4$ · IGMP joins at edge · RPF: arrival $\in$ best-path-to-source else drop · source trees (flood-prune) vs shared trees (core) · intra (PIM/DVMRP) vs inter (MBGP/MSDP).
:::

RPF reuses the *unicast* table — no separate multicast topology needed for the check, which is why every multicast protocol leans on whatever unicast routing already computed.

::: callout-pitfall Broadcast Confusion
Broadcast hits all hosts on a LAN (one subnet, ARP-style); multicast crosses routers to *subscribers only*, group-addressed. An option delivering "to every host on the Internet" describes neither — multicast scope is membership, never everybody.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Source $S$ feeds router R1 (best path to $S$ via eth0). R1 links: eth1 → member H1, eth2 → non-member H2, eth3 → R2 (which serves member H3). One packet from $S$ arrives on eth0; a looped duplicate later arrives on eth1. Tabulate R1's decisions and final deliveries.
:::

::: step [Step 2: Execution] Check, Copy, Drop
Original on eth0: RPF pass (eth0 *is* the best path to $S$) → forward one copy to eth1 (H1 ✓) and one to eth3 (→ R2 → H3 ✓); nothing to eth2 (no members — prune). Copies made: $2$. Duplicate on eth1: RPF fail (best path to $S$ is eth0, not eth1) → drop silently. H1 and H3 receive exactly $1$ each; H2 receives $0$; the loop dies at R1 instead of circling.
:::

::: step [Step 3: Conclusion] Final Result
$2$ forwarded copies, $1$ silent drop, deliveries $\{H1:1, H3:1, H2:0\}$. RPF's two jobs visible in one trace: replicate toward members, annihilate loops — flood-and-prune's flood reaches, its prune (plus RPF) restrains.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
Joins climb outward: membership at the edge (IGMP), trees within the AS (PIM-SM), source announcements between ASes (MSDP over MBGP routes). Layered responsibility mirrors the unicast hierarchy — local, domain, inter-domain.
:::
