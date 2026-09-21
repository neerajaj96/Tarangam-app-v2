---
id: m1_04_cortex_m23_m33_armv8m
courseCode: PBCST504
module: 1
sequence: 4
title: 'Cortex-M23/M33 & Armv8-M'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what Armv8-M adds over older ARMv7-M in plain words first
  - Place M23 and M33 on cost/security axes
  - Explain TrustZone partitioning at block level
concepts:
  - Armv8-M architecture
  - Cortex-M23
  - Cortex-M33
prerequisites:
  - m1_03_arm_architecture_and_cortex_m
examRelevance: high
tags:
  - armv8-m
  - trustzone-basics
---
# Cortex-M23/M33 & Armv8-M

**What problem trustworthy tiny devices pose, what Armv8-M architecture answers, how Cortex-M23 and Cortex-M33 split the cost/security map, and how TrustZone divides one chip into two worlds.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A smart lock holds your door PIN next to its Bluetooth radio code. The problem: one firmware bug in the radio stack could leak the PIN — but the lock cannot afford two chips or a laptop-grade guard. Armv8-M answers in hardware: split one chip into a Secure world (PIN, keys, crypto) and a Non-secure world (radio, apps), with the processor itself enforcing the border.

Tiny beginner example. Non-secure Bluetooth code asks "is the PIN 1234?" The Secure world answers only yes/no — the PIN bits never cross the border, whatever the radio bug. One lock, two worlds, zero PIN leakage by construction.

Analogy as support, then dropped. Think of a bank with a vault and a lobby: customers (non-secure code) transact through a teller window (controlled gate); only guards (secure code) enter the vault. From here on we use exact terms only: Secure/Non-secure world, TrustZone, attestation.

Abbreviations defined on first use: Internet of Things (IoT), TrustZone (ARM hardware security partitioning). Symbols: none.

| Question to ask | Meaning |
|---|---|
| What is a world? | A full execution environment (code + data + peripherals) with a security label |
| What is the gate? | The few controlled entry points where Non-secure may call Secure |
| What is attestation? | Proof to a remote server of what firmware is running |

::: toggle What is a "world" (Secure vs Non-secure)?
A complete execution environment — its own code, data, and peripherals — carrying a hardware security label. The processor checks the label on every access and faults forbidden crossings automatically. Think two separate computers sharing one chip, with the border enforced by silicon rather than by promises in code.
:::

::: toggle What is a "gate" / veneer, concretely?
The few designated function entries through which Non-secure code may call into Secure code. Each veneer validates its arguments first (is this PIN-length sane? is this buffer inside Non-secure memory?) and only then serves. Calling any other Secure address faults — the gate is narrow so every crossing can be audited.
:::

<a id="words-first"></a>
## 2. Words First — Armv8-M Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Armv8-M architecture** | The architecture generation behind M23/M33: baseline/plus-mainline options plus TrustZone and modern debug. |
| **Cortex-M23** | The small secure core: M0+-class efficiency plus TrustZone — security for the cheapest devices. |
| **Cortex-M33** | The capable secure core: M4-class DSP/FPU performance plus TrustZone and faster security switching. |
| **Secure / Non-secure attribute** | Every memory block and peripheral is labelled; the hardware faults any Non-secure access to Secure assets. |
| **Secure boot + attestation** | Boot checks firmware signatures bottom-up; attestation reports the measurement outward — trust with receipts. |

::: callout-intuition Core Mental Model: Vault and Lobby
The vault (Secure) holds keys and PINs; the lobby (Non-secure) runs the radio and apps. The teller window (secure gateway calls) is the only contact: narrow, logged, and incapable of handing over the vault itself. A lobby fire never reaches the vault because the wall is silicon, not software promises.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Two Cores, One Border

**M23 vs M33, honestly:** M23 = efficiency-first (2-stage pipeline, smallest TrustZone-capable core, for sensors and locks); M33 = performance-first (3-stage, DSP, optional FPU, faster state switching, for gateways and wearables). Both run Armv8-M; both enforce the same border. Cost/security placement: M0+ (no security, cheapest) < M23 (security, cheap) < M33 (security + speed) < M7-class (speed, hungriest). Security is no longer a luxury tax — M23 puts the vault in coin-cell territory.

**How the border works (block level):** memory regions and peripherals carry Secure/Non-secure/Non-secure-Callable labels (programmed at boot by the Secure world). Non-secure code calling into Secure must land on Non-secure-Callable veneer entries — any other entry faults. Interrupts can target either world. Debug access itself is gated, so a probe cannot simply read the vault out.

**Armv8-M vs ARMv7-M (examinable delta):** v7-M (M3/M4) has no TrustZone, older debug, no stack-limit checking; v8-M (M23/M33) adds TrustZone worlds, stack-limit hardware (catches overflows), improvedSysTick/exception handling, and stronger debug authentication. "Compare generations" answers list exactly these four deltas.

::: callout-formula KTU Formula Vault: Armv8-M Facts
v8-M = v7-M + TrustZone + stack limits + new debug · M23 = efficient-secure, M33 = fast-secure · worlds labelled per region/peripheral · entry only via callable veneers · boot measures, attestation proves.
:::

::: callout-pitfall Software Vaults
Encryption libraries alone do not make a vault: keys in Non-secure flash are readable by any bug. TrustZone's value is hardware enforcement — the border holds even when Non-secure code is fully compromised. "We encrypt, so we're secure" without world separation misses the course's point.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
A coin-cell door sensor must store a network key while running third-party radio code. (a) M0+, M23, or M33, and why? (b) Where does the key live, and what happens when radio code reads its address directly?
:::

::: step [Step 2: Execution] Placing Core and Key
(a) M23: cheapest TrustZone-capable core; M0+ has no hardware border (key exposed to any radio bug); M33 works but bills unneeded DSP power. (b) Key lives in Secure-labelled flash/RAM; a direct Non-secure read faults (SecureFault exception) — denial is hardware, not convention.
:::

::: step [Step 3: Conclusion] Final Result
Security at coin-cell prices is M23's whole reason to exist; the key's safety rests on labelled regions plus faulting hardware, verifiable at boot and provable by attestation.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Calling M33 "just a faster M23." Different pipelines, DSP/FPU, and switching speed — performance class differs, not only Megahertz.
- Treating callable veneers as optional. Skipping them faults by design; the narrow gate is the security, not bureaucracy.
- Assuming TrustZone encrypts anything. It partitions; crypto still runs (usually inside Secure) as a separate service.

Exam recap: v8-M four deltas over v7-M; M23 efficient-secure vs M33 fast-secure; region/peripheral labelling; veneer-only entry; secure boot plus attestation; hardware border beats software promises.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Radio-stack bug meets a network key on M0+ versus M23. Contrast the outcomes and name the enforcing mechanism.
() Both leak — TrustZone is marketing
(*) M0+: key readable, total compromise possible. M23: key in Secure-labelled memory, direct Non-secure read raises SecureFault — enforcement is hardware labelling plus faulting, not code review
() M23 encrypts the radio, M0+ does not
() The key must move to the cloud on both
::: explanation
Same bug, different silicon: without labelled worlds every byte is reachable; with them the processor itself refuses. That refusal — automatic, unbypassable from Non-secure — is the mark-earning sentence.
:::

::: quiz List the four Armv8-M deltas over ARMv7-M that a "compare generations" answer must contain.
() Higher Megahertz, lower price, smaller box, newer logo
(*) TrustZone Secure/Non-secure worlds; hardware stack-limit checking; improved exception/SysTick handling; authenticated modern debug — v7-M (M3/M4) has none of these as architecture features
() M33 is simply M4 renamed
() Thumb-2 was invented in v8-M
::: explanation
Generations differ by architecture features, not marketing. Each delta is independently examinable: worlds (security), stack limits (robustness), exceptions (determinism), debug auth (lifecycle).
:::

::: quiz Non-secure code calls a Secure function directly, skipping the veneer. What happens and why is this the secure behaviour?
() It succeeds — veneers are documentation
(*) SecureFault: only Non-secure-Callable veneer entries are legal gates; the fault proves the border holds against exactly this shortcut, forcing all crossings through the narrow audited window
() The call silently encrypts itself
() The processor reboots into the Secure world permanently
::: explanation
The gate is load-bearing: every crossing lands on a veneer that validates arguments before touching Secure assets. A skipped gate faulting is the system working, not failing.
:::
