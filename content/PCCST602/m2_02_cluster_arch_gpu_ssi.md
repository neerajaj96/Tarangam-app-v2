# Cluster Architecture, GPU Clusters & SSI

**Head/worker anatomy, fattened GPU nodes, and the single-system-image illusion done right.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Restaurant Brigade, Again
**Head node** (maître d': logins, scheduler, single door), **compute nodes** (chefs: diskless, identical, fast-pass pantry = parallel filesystem + InfiniBand gossip), **network tiers** (dining room vs kitchen corridors: management vs low-latency fabric). **GPU clusters** swap some chefs for thousand-handed prep drones (host+device per node, NVLink/pantry upgrades). **SSI** is the uniform (one menu, one bill, one process space illusion) — features graded: single entry, file/process/device spaces, checkpointing.
:::

::: anim cluster-arch Head Fans Out, Results Gather
Scheduler on top, workers below, interconnect between — SSI makes the fan look like one machine from the login mat.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Anatomy and SSI features

Tiers: access/head, compute, storage (parallel FS: Lustre/GPFS-style), high-speed interconnect (latency/bandwidth specs drive HPC rank). SSI: single entry point, single file hierarchy, single process/job space, single I/O & device space, single management point — illusion completeness varies (full SSI vs clustered-view).

### 2.2 GPU cluster deltas

Per-node host+device memory split (PCIe/NVLink ceilings), batch-scheduled GPU sharing (whole-GPU vs MPS/MIG slices), power/cooling density jumps, collectives (NCCL-style) riding the fabric.

::: callout-formula KTU Formula Vault: Cluster Shape
Head **schedules**, workers **compute**, fabric **limits** · SSI = **one of everything (graded)** · GPU adds **device-memory split**.
:::

::: callout-pitfall SSI Illusion Leaks
Single-system-image hides *location*, not *latency*: remote memory/files still cost fabric trips. Location-transparent ≠ performance-uniform — locality-aware placement stays mandatory, illusion or not.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Sketch a 4-worker GPU cluster's tiers, place a distributed training job's needs (data, collectives, checkpoints), and name what SSI hides vs leaks."
:::

::: step [Step 2: Execution] Tiers and Truth
1. Head (login/scheduler) → IB fabric → 4×(CPU host + GPU device + local SSD) → parallel-FS tier. Data staged on FS, collectives on IB/NVLink, checkpoints to FS.
2. SSI hides node addresses (submit once, `qsub`-and-forget); leaks fabric latency (place ranks adjacently) and device locality (pin data near GPUs).
:::

::: step [Step 3: Conclusion] Final Result
Tier-sketch with traffic labels (collectives vs staging vs control) plus hide/leak columns — the architecture answer's two halves.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Head node vs compute nodes — duty split?
(A) Head computes most
(*B) Head: entry/scheduling/management (interactive, protected); workers: diskless batch execution (uniform, replaceable) — control vs muscle separation
(C) No difference
(D) Workers schedule
::: explanation
Protect the scheduler from user code crashes/load (dedicated head); keep workers cattle (reimageable, stateless-ish). Pets-vs-cattle, control-vs-muscle — separation is reliability design.
:::

::: quiz Q2: Foundational Concept
Why does interconnect top HPC cluster budgets?
(A) Cables look nice
(*B) Tight coupling makes fabric latency/bandwidth the job's critical path (Amdahl at system level) — microseconds decide ranks, FLOPS sit idle otherwise
(C) Vendors insist
(D) Ethernet is free
::: explanation
Stencils/Allreduces chat constantly; slow fabric starves fast silicon. Balance (bytes-per-FLOP ratios) is the procurement math — quote traffic shape before link speed.
:::

::: quiz Q3: Foundational Concept
SSI's single process space promises:
(A) One CPU total
(*B) Uniform process view (global PIDs, migrate/signalled anywhere) — place-and-forget execution with checkpoint/migration support underneath
(C) No scheduling needed
(D) Shared memory everywhere
::: explanation
Names (PIDs, files, devices) go global; performance stays local (leak!). SSI grades by *which* spaces unify — list spaces, don't chant "single system" vaguely.
:::
