---
id: m3_02_vmm_requirements_os_level
courseCode: PCCST602
module: 3
sequence: 2
title: VMM Requirements & OS-Level Virtualization
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Enforce trap, fidelity and native-mostly hypervisor discipline
  - Bridge the x86 gap with translate, paravirt or hardware assist
  - Isolate with namespaces, cgroups and layered filesystems
concepts:
  - Popek-Goldberg requirements
  - OS-level virtualization
  - hardware assist
prerequisites:
  - m3_01_virtualization_levels_comparison
examRelevance: high
tags:
  - virtualization
  - hypervisors
---
# VMM Requirements & OS-Level Virtualization

**Popek–Goldberg discipline for hypervisors, and the container shortcut (namespaces + cgroups) done properly.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Strict Landlord vs Roommates' Charter
A **VMM** is a strict landlord: guests (tenants) must never touch radiators directly (privileged instructions trap), must believe they own the building (fidelity), and rent must stay cheap (efficiency — most instructions run native). **OS-level** skips landlordship: one kernel, roommates' charter (namespaces: separate views; cgroups: rationed utilities) — featherweight because nothing is emulated, only partitioned.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Popek–Goldberg requirements + x86 wrinkle

Equivalence (identical behaviour modulo timing/resources) · efficiency (statistically dominant instructions execute natively) · resource control (VMM owns all). x86's sensitive-but-untrapped instructions broke the theorem ⇒ binary translation (VMware classic) or paravirt (Xen hypercalls) or HW assist (VT-x root/non-root modes) as fixes.

### 2.2 OS-level mechanics

Namespaces (pid/net/mnt/uts/ipc/user — per-group views) + cgroups (cpu/mem/blkio rations + accounting) + layered filesystems (image layers, copy-on-write) = containers. Orchestrators (Kubernetes-style) schedule/bin-pack/health-check fleets of them.

::: callout-formula KTU Formula Vault: VMM + Containers
VMM: **trap + fidelity + native-mostly** · x86 gap → **translate/paravirt/HW-assist** · containers = **namespaces + cgroups + layers**.
:::

::: callout-pitfall Paravirt Modifies Guests
Xen-style paravirtualization needs guest-OS ports (hypercalls replace sensitive instructions) — closed/proprietary OSes needn't apply. Portability cost is paravirt's fine print; HW-assist removed it (unmodified guests at near-native speed).
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Guest executes CLI (clear interrupts, sensitive, unprivileged-trap-missing on classic x86). Trace under (a) binary translation, (b) paravirt, (c) VT-x."
:::

::: step [Step 2: Execution] Three Interceptions
1. (a) Translator scans blocks, replaces CLI with emulated interrupt-flag handling in VMM-kept shadow state — transparent, translation-cache cost.
2. (b) Guest *source* already calls hypercall `disable_events()` — cooperative, fast, needs Xen-ported kernel.
3. (c) CLI traps to root mode (hardware lists it sensitive) — VMM emulates, resumes; unmodified guest, silicon speed.
:::

::: step [Step 3: Conclusion] Final Result
Translate (opaque, cached), cooperate (fast, invasive), trap (clean, silicon-assisted) — the x86 trilemma resolved three ways, each with its price tag named.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Popek–Goldberg efficiency demands:
(A) Zero overhead ever
(*B) A statistically dominant instruction subset runs natively (no emulation on the hot path) — traps/emulation confined to rare sensitive operations
(C) Guests run faster than host
(D) No traps allowed
::: explanation
"Dominant subset native" is the testable bar: hot straight-line code at silicon speed, exits only at privilege boundaries. Exit-rate (exits/sec) is the benchmark that grades VMMs — count exits, not features.
:::

::: quiz Q2: Foundational Concept
Namespaces vs cgroups — jobs split how?
(A) Both limit CPU
(*B) Namespaces partition *visibility* (what a group sees: pids, nets, mounts); cgroups ration *consumption* (how much: cpu shares, mem caps, blkio weights) — views vs rations, together a container
(C) Both hide processes
(D) Interchangeable names
::: explanation
See-vs-spend split: unshare the view, cap the spend. Container = view-walls + ration-books + layered rootfs — three mechanisms, one product. Missing any leg wobbles (visible neighbours, hogging, or image sprawl).
:::

::: quiz Q3: Foundational Concept
Type-1 (bare-metal) vs Type-2 (hosted) hypervisors differ by:
(A) Guest count
(*B) Privilege footing: Type-1 runs directly on hardware (its own microkernel-ish core, minimal attack surface, datacenter standard); Type-2 rides a host OS (dev/test convenience, host-dependency + extra layers)
(C) Price only
(D) Nothing observable
::: explanation
Footing decides fate: bare-metal owns scheduling/interrupts (performance + isolation for fleets); hosted borrows them (laptop-friendly, host crash kills all). Production-vs-laptop is the deployment moral.
:::
