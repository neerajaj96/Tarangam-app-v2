---
id: m1_04_vms_system_models
courseCode: PCCST602
module: 1
sequence: 4
title: 'VMs & System Models: Clusters, Grids, P2P, Clouds'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Gang machines four ways across ownership and trust lines
  - Contrast cluster secretaries, grid treaties, P2P gossip and metered hotels
  - Isolate tenants with the VM trick under every model
concepts:
  - system models
  - virtual machines
  - trust boundaries
prerequisites: []
examRelevance: medium
tags:
  - distributed-models
  - virtual-machines
---
# VMs & System Models: Clusters, Grids, P2P, Clouds

**The four ways to gang machines — ownership, coupling, and trust — plus the VM trick under all of them.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Housing Societies
**Cluster:** one society, one secretary (central scheduler), fast internal roads — family runs big jobs. **Grid:** federated societies sharing halls by treaty (virtual organisations, heterogeneous, loose). **P2P:** no secretary at all — neighbours gossip (DHTs), join/leave freely (churn-tolerant, trustless). **Cloud:** rent-a-flat with hotel services (elastic, metered, someone else fixes plumbing). **VMs** are the partition walls letting strangers share flats safely (isolation + portability everywhere).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Four-model comparison

| | Cluster | Grid | P2P | Cloud |
|---|---|---|---|---|
| Control | central | federated/VO | none (gossip) | provider APIs |
| Coupling | tight (SAN/IB) | loose | ad-hoc | virtualised |
| Trust | single org | cross-org certs | zero (verify) | contract/SLA |
| Metric | job latency | throughput/fairness | availability under churn | cost/elasticity |

### 2.2 VM role

Hardware abstraction + isolation + encapsulation (VM = files: snap/clone/migrate) — the substrate M3 dissects; here: *why* models depend on it (consolidation, multi-tenancy, portability across federations).

::: callout-formula KTU Formula Vault: Four Models
Cluster **one secretary** · grid **treaty federation** · P2P **gossip, no boss** · cloud **metered hotel** · VM = **shared-flat walls**.
:::

::: callout-pitfall Grid ≠ Bigger Cluster
Grids federate *autonomous* domains (no central scheduler, heterogeneous policies, cert-based trust) — scaling cluster assumptions (single queue, uniform nodes) onto grids misdesigns scheduling and security both.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Place: university Condor pool, BitTorrent swarm, AWS autoscaled shop, CERN Tier-0 + Tier-1s. Model + one design implication each."
:::

::: step [Step 2: Execution] Society Sorting
1. Condor: **grid/HTC** (scavenged cycles, fair-share scheduling across owners).
2. BitTorrent: **P2P** (tit-for-tat incentives replace trust; churn-first protocols).
3. Shop: **cloud** (elasticity + cost-per-order design metrics).
4. CERN tiers: **grid federation** (VO certs, data-placement-aware scheduling — move jobs to petabytes, not vice versa).
:::

::: step [Step 3: Conclusion] Final Result
Ownership + coupling + trust triple-labels every system; implications (scheduler/incentive/cost/data-gravity) follow the label. Triple-label first, design second.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Central scheduler works for clusters but not grids because:
(A) Grids are smaller
(*B) Grids span autonomous owners — no single authority sees all queues/policies; scheduling becomes negotiation (matchmaking, fair-share across VOs), not assignment
(C) Clusters lack networks
(D) Schedulers are slow
::: explanation
Authority boundary is the architectural fact: one org ⇒ command; many orgs ⇒ treaties. Grid schedulers broker (advertise/request matchmaking à la Condor ClassAds) rather than command.
:::

::: quiz Q2: Foundational Concept
DHTs let P2P find data with no server by:
(A) Flooding every query
(*B) Consistent hashing of keys→nodes plus greedy routing on the identifier ring (log-hop lookups), self-repairing under churn
(C) Central index backups
(D) Luck
::: explanation
Structure (ring + finger tables, Chord-style) replaces the server: $O(\log n)$ hops, joins/departures shuffle only neighbours. Gossip maintains it — decentralisation with guarantees, not anarchy.
:::

::: quiz Q3: Foundational Concept
VM encapsulation enables which cross-model tricks?
(A) Faster CPUs
(*B) Snap/clone/migrate-as-files: portable federated jobs (grid), safe multi-tenancy (cloud), checkpoint via snapshots (clusters) — mobility + isolation as files
(C) Bigger RAM
(D) New protocols
::: explanation
File-ified machines move, copy, and freeze — the primitive behind migration, elasticity, and reproducible science. Encapsulation turns computers into data, unlocking file operations on infrastructure.
:::
