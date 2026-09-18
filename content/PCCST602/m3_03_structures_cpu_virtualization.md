# Virtualization Structures & CPU Virtualization

**How VMMs sit (hosted/bare-metal/hybrid) and how privileged lies get intercepted — trap, translate, assist.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Casino Security
Guests (VMs) play at tables believing the house rules are physics; security (VMM) watches from the ceiling: honest games run untouched (native execution), card-counting moves (privileged/sensitive instructions) trigger floor review (trap-and-emulate). Old casinos without cameras (pre-VT-x x86) frisked everyone at the door instead (binary translation) or deputised players (paravirt hypercalls). Structures = where security sits; mechanisms = how cheats get caught.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Structures and CPU techniques

* Structures: hosted (VMM app atop host OS), bare-metal (VMM owns iron), hybrid/dual (thin host + privileged service VM, e.g. Hyper-V parent partition style).
* CPU virtualization: trap-and-emulate (classically virtualizable ISAs), binary translation (dynamic rewriting + cache), paravirtualization (hypercalls), HW-assisted (root/non-root, EPT/NPT nested paging assists MMU too).

::: callout-formula KTU Formula Vault: CPU Virt
Sit: **hosted/bare/hybrid** · catch: **trap/translate/hypercall/assist** · goal: **native hot path**.
:::

::: callout-pitfall Nested Paging ≠ Free Lunch
EPT/NPT removes shadow-page-table exits but adds page-walk *depth* (24+ memory refs worst-case on TLB miss — 2D walks). Exits down, miss-cost up: profile miss rates before celebrating virtualization "for free".
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"An I/O-heavy guest crawls under binary translation but flies on VT-x. Explain the exit/walk economics, then place where nested paging helps vs hurts."
:::

::: step [Step 2: Execution] Exits vs Walks Ledger
1. BT rewrites every sensitive I/O touch (translation + cache churn on driver-heavy paths); VT-x traps natively (silicon-speed hot path, exits only at privilege moves).
2. Nested paging helps: MMU-heavy guests (fewer exits than shadow tables). Hurts: pointer-chasing workloads with cold TLBs (deepened walks amplify misses) — hugepages mitigate (fewer, fatter entries).
:::

::: step [Step 3: Conclusion] Final Result
Technique choice follows *exit rate × walk depth* arithmetic per workload — measure both, then house the guest accordingly.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Shadow page tables existed to:
(A) Speed native paging
(*B) Let guests own *virtual* page tables while the VMM secretly maps to machine pages (guest-physical → machine), write-protecting guest tables to trap updates — translation without guest cooperation pre-EPT
(C) Encrypt memory
(D) Share kernels
::: explanation
Two address fictions need reconciling (guest VA→guest PA, then →machine PA); shadows cache the composition, traps keep them coherent. EPT moved composition into silicon (hardware walks both levels) — same math, faster walker.
:::

::: quiz Q2: Foundational Concept
Hyper-V-style parent partition is "hybrid" because:
(A) It runs two kernels for fun
(*B) Thin hypervisor owns iron while a privileged *parent* VM provides drivers/management (reuse host driver ecosystem without bloating the hypervisor) — microkernel-ish split of mechanism vs drivers
(C) Guests are hybrid OSes
(D) Marketing term only
::: explanation
Driver ecosystem vs trusted-base tension resolved by split: tiny TCB hypervisor + fat parent services VM. Compromise architecture with explicit rationale — small core, borrowed drivers.
:::

::: quiz Q3: Foundational Concept
Exit-rate benchmarking grades VMMs by:
(A) Feature checklists
(*B) Privilege exits/sec under real workloads (fewer + cheaper = better) — the hot-path tax quantified; microbenchmarks (null syscall) to macro (kernel builds) span it
(C) GUI quality
(D) License cost
::: explanation
Exits are the virtualization tax collector: count and price them (world-switch cycles). Workload-representative exit profiles beat synthetic scores — measure the guest you'll actually run.
:::
