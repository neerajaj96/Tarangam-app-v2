---
id: m3_05_virtual_clusters_live_migration
courseCode: PCCST602
module: 3
sequence: 5
title: Virtual Clusters & Live Migration
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Choreograph virtual clusters with overlays and shared services
  - Move running machines pre-copy, freeze-milliseconds, resume
  - Switch mirrored storage and re-point networks without drops
concepts:
  - virtual clusters
  - live migration
  - pre-copy stages
prerequisites:
  - m2_01_cluster_objectives_issues
  - m3_04_memory_io_virtualization
examRelevance: high
tags:
  - virtualization
  - live-migration
---
# Virtual Clusters & Live Migration

**Clusters made of clouds — overlay networks, resource choreography, and moving running machines (memory, files, nets).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Travelling Circus
A **virtual cluster** pitches compute tents (VMs) across borrowed fields (hosts/clouds), strung with rope-lights (overlay networks: VXLAN-style tunnels faking one LAN). The ringmaster (scheduler) packs acts per tent (bin-packing with interference awareness — noisy tent-mates ruin shows). **Live migration** moves an ongoing act mid-performance: juggle torches across (pre-copy memory), ship the costume trunk (storage: shared first, else block-migrate), keep the fan mail coming (network: gratuitous ARP re-points the crowd) — applause unbroken.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Virtual clusters and migration stages

* VC: VM aggregation + overlays + coordinated schedulers; resource management = placement (bin-pack + affinity/anti-affinity) + elastic resize + interference-aware packing (noisy-neighbour profiling).
* Live migration: pre-copy rounds (dirty-rate < bandwidth converges) → stop-and-copy (ms freeze) → resume; storage live-migrate (mirror-then-switch); network continuity (tunnel/ARP updates, TCP survives — sequence numbers intact).

::: callout-formula KTU Formula Vault: VC + Move
VC = **VMs + overlays + choreography** · move = **pre-copy → freeze-ms → resume** · storage **mirror-switch** · nets **re-point**.
:::

::: callout-pitfall Dirty Rate > Bandwidth Never Converges
Write-heavy guests out-dirty pre-copy (rounds never shrink) — migration stalls forever burning bandwidth. Throttle-or-stun (rate-limit vCPUs, then force freeze) bounds it; convergence *checks* (dirty tracking) gate attempts — measure writeload first.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Move a $16$ GB web VM (dirties $200$ MB/s) over $10$ Gbps. Rounds math? Freeze estimate? What breaks if it ran a $2$ GB/s in-memory DB instead?"
:::

::: step [Step 2: Execution] Bandwidth vs Dirt Race
1. $10$ Gbps $\approx 1.25$ GB/s vs dirt $0.2$ GB/s: round sizes shrink geometrically ($\approx 0.16\times$ per round): $16$ GB → $2.6$ → $0.4$ → freeze sub-second (tens–hundreds ms). Converges cleanly.
2. DB dirt $2$ GB/s $>$ $1.25$ GB/s: rounds *grow* — never converges; throttle vCPUs (slow dirt), stunt briefly, or cold-migrate off-peak. Convergence check first, always.
:::

::: step [Step 3: Conclusion] Final Result
Dirt-vs-pipe inequality predicts convergence before attempting; freeze scales with final delta. Inequality-first is the migration-go/no-go — compute, then move.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Overlay networks (VXLAN-style) in virtual clusters exist because:
(A) Hosts lack cables
(*B) Tenants need *their* topology/addressing across borrowed, shared substrates — tunnels fake one private LAN over many real ones (encap tax for tenant freedom)
(C) Speeds routing
(D) Replaces schedulers
::: explanation
Address-space freedom + tenant isolation over shared iron demands a virtual wire layer. Encap overhead (bytes + lookup) is the fare — freedom isn't free, it's tunnelled.
:::

::: quiz Q2: Foundational Concept
Noisy-neighbour interference breaks naive bin-packing by:
(A) Filling disks
(*B) Shared last-level cache/memory-bandwidth contention slows co-tenants unpredictably (performance *isolation* fails though allocation isolated) — packing needs interference classes/profiling, not just core counts
(C) Crashing hosts
(D) Nothing measurable
::: explanation
Cores allocated ≠ performance delivered: cache/bandwidth are shared fates. QoS-aware placement (classes, throttling, pinning) packs *performance*, not just vCPUs — count contention, not cores.
:::

::: quiz Q3: Foundational Concept
TCP survives live migration because:
(A) IPs never change subnets
(*B) Connection state (seq/ack numbers, windows) moves with memory + network re-pointing preserves the endpoint identity (same IP/MAC claimed at destination) — endpoints see a pause, not a break
(C) Packets freeze mid-air
(D) Luck
::: explanation
Identity continuity (IP/MAC move via ARP/tunnel updates) + state continuity (memory carries sockets) = unbroken 4-tuple. Pause-not-break is the migration contract — retransmits cover the freeze gap.
:::
