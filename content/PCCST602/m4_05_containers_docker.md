---
id: m4_05_containers_docker
courseCode: PCCST602
module: 4
sequence: 5
title: 'Containers vs VMs & Docker Deep-Dive'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Place houses and apartments on the density-isolation frontier
  - Ship blueprints as layered images through the engine
  - Close with the orchestrated-estate case study verdict
concepts:
  - containers versus VMs
  - Docker images
  - orchestration
prerequisites:
  - m3_01_virtualization_levels_comparison
  - m3_02_vmm_requirements_os_level
examRelevance: high
tags:
  - cloud
  - containers
---
# Containers vs VMs & Docker Deep-Dive

**Shared kernel vs separate kernels — the density/isolation frontier — then engine, images, and the case-study close.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Apartments vs Houses
**VMs** are houses (own kernel/foundation each — fortress isolation, GBs + minutes to build). **Containers** are apartments (one building kernel, walled rooms via namespaces, rationed utilities via cgroups — MBs + milliseconds to open). Docker is the property manager: **images** (layered blueprints, content-addressed, shared bases), **engine** (builder/runner), **registry** (plan library), **compose/orchestration** (estate management). Case-study close: identical image dev→prod kills "works on my machine" as a class.
:::

::: anim docker-arch One Engine, Many Rooms
Three tenants share the kernel below while filesystems stay separate — the apartment bargain drawn: density without key-swapping.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 VM vs container ledger + Docker anatomy

| VM | Container |
|---|---|
| own kernel (GBs, minutes boot) | shared kernel (MBs, ms start) |
| hardware-level isolation | namespace/cgroup isolation |
| any guest OS | host-OS family only |
| hypervisor tax | near-native speed |

Docker: Dockerfile → layered image (each instruction a cached layer) → registry push/pull → `run` instantiates (thin writable top layer, copy-on-write). Volumes (persist past death), networks (bridge/overlay), Compose (multi-room leases).

::: callout-formula KTU Formula Vault: Docker Ledger
Houses = **VMs** · apartments = **containers** · blueprints = **layered images** · estate = **orchestration**.
:::

::: callout-pitfall Layer Bloat Sinks the Density Win
Each Dockerfile line adding package caches + temp files fattens every descendant (shared-base savings evaporate). Order stable-first, clean in-line (`rm` same layer), multi-stage builds — image hygiene *is* the density strategy.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"200-replica stateless API on one fleet: VM-per-replica vs containers — boot/scale math, failure drill, and the image-layer trick keeping pulls fast."
:::

::: step [Step 2: Execution] Density vs Fortress, Computed
1. VMs: GBs × 200 + minute-scale scale-out (burst misses the spike); containers: shared base + MB deltas, second-scale (burst absorbed).
2. Failure: container death = reschedule elsewhere (cattle, health-checked); state externalised (DB/volumes) — nothing mourned locally.
3. Layers: common base pulled once per host; app delta tiny → pulls seconds. 200 replicas ≈ one base + 200 slivers on the wire.
:::

::: step [Step 3: Conclusion] Final Result
Stateless + trusted-base ⇒ containers win on every axis (speed/density/cattle-ops); layers make the win *network-cheap* too. State the trust assumption — untrusted multi-tenant flips the verdict (M3 floors return).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Copy-on-write top layer means:
(A) Images are immutable forever
(*B) Containers share read-only image layers; writes land in a thin per-container layer (first-write copies up) — disk shared until touched, diverge-on-write
(C) Data persists by default
(D) Layers merge at runtime
::: explanation
Sharing without copying (reads free) + isolation on write (copy-up) = density with safety. Ephemerality follows (top layer dies with container) — volumes exist precisely because CoW forgets.
:::

::: quiz Q2: Foundational Concept
"Works on my machine" dies under Docker because:
(A) Developers share laptops
(*B) Image bundles app + deps + config (the *environment* ships, not just code) — dev/CI/prod run byte-identical stacks; drift moves from runtime to reviewable Dockerfiles
(C) Bugs become impossible
(D) Tests run faster
::: explanation
Environment-as-code (versioned, reviewed, rebuilt identically) relocates the drift class out of existence. Reproducibility is the case-study moral — quote it as process, not tooling magic.
:::

::: quiz Q3: Foundational Concept
When do VMs still beat containers?
(A) Never anymore
(*B) Untrusted/multi-tenant (kernel separation), alien OS families, kernel-version-sensitive or privileged workloads — fortress needs outweigh density; often both (containers *inside* VMs: defense in depth)
(C) Always, containers are toys
(D) Only for Java
::: explanation
Threat-model and kernel-freedom decide (M3 floors, restated): containers share fate by design. Layered defense (Kata/gVisor-style sandboxes, or VM-wrapped container fleets) splits the difference deliberately.
:::
