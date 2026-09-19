---
id: m3_04_memory_io_virtualization
courseCode: PCCST602
module: 3
sequence: 4
title: Memory & I/O Virtualization
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Page fictions from shadow tables to extended page tables
  - Reclaim with ballooning while gambling overcommit honestly
  - Climb emulate, paravirt and passthrough device models by speed
concepts:
  - shadow paging
  - device models
  - memory overcommit
prerequisites:
  - m3_03_structures_cpu_virtualization
examRelevance: high
tags:
  - virtualization
  - memory-io
---
# Memory & I/O Virtualization

**Two address fictions plus device lies — shadow/EPT paging, device models, and the passthrough escape hatch.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Forwarding Addresses + Stunt Doubles
**Memory:** guests mail to virtual streets (guest-virtual → guest-physical), the VMM secretly forwards to real lots (→ machine) — shadow ledgers (software forwarding) or silicon postmen (EPT two-level walks). **I/O:** guests get stunt doubles (emulated e1000 NICs — compatible, slow), paravirt drivers (in-on-the-joke doubles — fast, invasive), or the real star for the finale (PCI passthrough/SR-IOV slices — bare-metal speed, device married to one guest).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Memory and I/O techniques

* Memory: shadow tables (trap-coherent, pre-EPT), nested paging/EPT (HW two-level, hugepage-friendly), ballooning (reclaim via guest driver pressure), overcommit + swapping (last resort, latency roulette).
* I/O: full emulation (compat, exits galore) → paravirt (virtio rings, batched) → direct assignment/passthrough + SR-IOV (VF slices per guest, near-native, migration-hostile).

::: callout-formula KTU Formula Vault: Mem + IO
Mem: **shadow→EPT**, balloon **reclaims**, overcommit **gambles** · IO: **emulate→paravirt→passthrough** (speed rises, flexibility falls).
:::

::: callout-pitfall Passthrough Kills Migration
Device-married guests can't pre-copy away (hardware state pinned) — mobility dies where speed lives. SR-IOV VFs migrate worst of all (guest state lives in silicon queues). Speed-vs-mobility is the I/O bargain to state per workload.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"House: (a) 1000 idle-ish web VMs oversubscribed $2\times$ RAM, (b) latency-critical trading NIC, (c) GPU training fleet needing migration. Memory + I/O picks each."
:::

::: step [Step 2: Execution] Bargain Shopping
1. (a) Ballooning + share-backed pages + cautious overcommit (idle guests donate via balloon pressure; swap storms monitored — reclamation hierarchy in order).
2. (b) SR-IOV VF passthrough (microsecond latency, kernel bypass-ish; migration sacrificed knowingly — hot-standby pair instead covers HA).
3. (c) Paravirt + framework checkpoints (migrate freely; vGPU/MIG slices if sharing silicon — mobility preserved, speed "good enough").
:::

::: step [Step 3: Conclusion] Final Result
Idle→reclaim, latency→passthrough, mobility→paravirt: workload verbs pick techniques. Bargain stated per pick (what's sacrificed) is the complete answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Ballooning reclaims host memory by:
(A) Compressing RAM chips
(*B) Inflating a guest driver that pins guest pages, forcing the guest OS to choose victims (its own paging wisdom) — host then reaps the freed machine pages cooperatively
(C) Deleting guest files
(D) Overclocking
::: explanation
Cooperative pressure: guest decides *what* to give (its LRU knows best), host takes the *freed* machine frames. Adversarial alternative (hypervisor swapping blind) thrashes blindly — cooperation beats confiscation.
:::

::: quiz Q2: Foundational Concept
Virtio beats full device emulation on:
(A) Compatibility with ancient OSes
(*B) Exit rate and batching — paravirt rings batch descriptors (fewer traps per byte) vs per-register-trap emulation; needs guest drivers (invasiveness price)
(C) Migration ease
(D) Nothing measurable
::: explanation
Exits-per-byte is the I/O tax meter: emulation traps per register touch; rings amortise over batches. Driver invasiveness buys the batching — same bargain as paravirt CPUs.
:::

::: quiz Q3: Foundational Concept
SR-IOV's VF vs PF split means:
(A) Two cables required
(*B) Physical Function (manager, configures) spawns lightweight Virtual Functions (per-guest queues, direct-mapped) — hardware-multiplexed NIC sharing at near-native speed with per-VF isolation
(C) Software emulation layer
(D) Doubled latency
::: explanation
Silicon does the multiplexing (scheduler + queues per VF) instead of a software switch — line-rate sharing without hypervisor hops. Hardware fate-sharing (migration-hostile) is the listed price.
:::
