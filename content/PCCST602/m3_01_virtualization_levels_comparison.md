# Virtualization Levels & Comparison

**Five floors of fakery — ISA to application — and the isolation-vs-overhead bargain per floor.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Costume Layers
**ISA level** (full VMs): whole-machine costume — any OS, heaviest tailoring (binary translation/HW assist). **ABI/OS level** (containers): same-face masks — one kernel, featherweight, Linux-only guests. **Library/application level** (Wine/JVM/CLR): phrasebook, not costume — APIs translated or bytecode hosted. Higher floor = cheaper + weaker walls; lower = pricier + fortress-grade. Pick the floor your tenants' trust gap demands.
:::

::: anim virt-levels Five Floors, One Trade
Top (application) lights first — cheapest, weakest; bottom (hardware) last — dearest, strongest. Isolation climbs as you descend.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Levels (top→down) and comparison axes

Application (process VMs: JVM/CLR) · library/API (Wine, API remoting) · OS (containers/zones: namespaces+cgroups) · ABI/hardware-ABI (para/full virt) · ISA/hardware (VMM/hypervisor: hosted vs bare-metal). Axes: isolation strength, overhead, guest flexibility (which OSes?), density, startup latency, hardware needs (VT-x/AMD-V for full).

::: callout-formula KTU Formula Vault: Floors
Higher = **light + leaky** · lower = **heavy + tight** · trust gap **picks the floor**.
:::

::: callout-pitfall Containers ≠ VMs on Isolation
Shared kernel = shared fate (kernel exploit escapes *all* containers; noisy neighbours via kernel paths). Containers isolate *namespaces*, VMs isolate *machines* — threat models differ, never substitute silently.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Place per tenant need: (a) mutually-untrusted banks sharing hardware, (b) 200 identical microservice replicas, (c) Windows-only legacy tool on Linux devs' laptops."
:::

::: step [Step 2: Execution] Trust-Gap Flooring
1. (a) Hardware-level VMs (fortress walls, separate kernels — compliance-grade isolation).
2. (b) OS-level containers (featherweight density, shared trusted base image — replicas scale by the hundred).
3. (c) Full VM or API-level (Wine if API-covered, else VM) — guest-OS flexibility decides, cost accepted.
:::

::: step [Step 3: Conclusion] Final Result
Threat model → floor → density math. Floor choice *is* risk arithmetic — state the adversary per tenant, then house them.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why can't containers host a different OS family (Linux containers, Windows kernel)?
(A) Licensing
(*B) Containers share the host kernel — no kernel, no foreign syscalls; only VMs (own kernel per guest) cross OS families
(C) Images forbid it
(D) CPUs refuse
::: explanation
Namespace/cgroup walls partition *one* kernel's objects; syscalls execute natively. Foreign OS needs its own kernel ⇒ hardware virtualization. Sharing depth sets guest freedom — deepest share, narrowest menu.
:::

::: quiz Q2: Foundational Concept
Density (guests per host) ranks floors how, and why?
(A) Equal everywhere
(*B) Application > containers > VMs (footprint per guest: MBs vs 100s MB vs GBs + kernel duplication) — lighter walls pack tighter, at isolation cost
(C) VMs densest
(D) Density is random
::: explanation
Per-guest overhead (kernel copies, reserved RAM, device emulation) divides the host. Density-vs-isolation is *the* floor tradeoff curve — draw it mentally before placing workloads.
:::

::: quiz Q3: Foundational Concept
JVM/CLR count as which level, and what's virtualized?
(A) Hardware level
(*B) Application level — bytecode ISA + managed runtime (GC, JIT, sandbox) abstract the *program environment*, not the machine; portability via hosted semantics
(C) OS level
(D) Not virtualization
::: explanation
Process VMs virtualize the *execution environment* (language runtime), trading machine-generality for managed safety/portability. Level named by *what's faked* — here, the abstract machine programs see.
:::
