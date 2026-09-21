---
id: m1_03_arm_architecture_and_cortex_m
courseCode: PBCST504
module: 1
sequence: 3
title: 'ARM Architecture & Cortex-M Family'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what ARM sells (designs, not chips) in plain words first
  - Explain load-store RISC ideas behind Cortex-M
  - Compare Cortex-M generations honestly
concepts:
  - ARM architecture
  - Cortex-M family
  - RISC load-store
prerequisites:
  - m1_02_embedded_c_essentials
examRelevance: high
tags:
  - arm-architecture
  - cortex-m
---
# ARM Architecture & Cortex-M Family

**What problem one reusable processor design solves for hundreds of chip makers, what Reduced Instruction Set Computer (RISC) load-store ideas ARM uses, how the Cortex-M family serves microcontrollers, and how its generations compare.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Every microwave maker needs a tiny processor, but designing one from scratch costs millions. The problem: share one excellent design across hundreds of companies, each adding their own memory, radios, and pins. ARM's answer: sell the *blueprint*, not the chip. STMicroelectronics, NXP, and Microchip all license ARM blueprints, then build different chips (STM32, LPC, SAM) around the same core.

Tiny beginner example. Three phones use three brands of chips, yet all run the same ARM apps. The shared blueprint (instruction set + core design) is why one compiler's output runs on all three — the peripherals differ, the core language matches.

Analogy as support, then dropped. Think of a franchise recipe: ARM writes the recipe (core + instructions); bakeries (chip makers) add local flavours (memory sizes, timers, radios) while every cake still rises the same way. From here on we use exact terms only: architecture, core, instruction set, licensee.

Abbreviations defined on first use: Reduced Instruction Set Computer (RISC), Program Counter (PC), Link Register (LR), Stack Pointer (SP). Symbols: none yet. (Note: PC reads ahead of execution due to the pipeline — detailed in the toggle below.)

| Question to ask | Meaning |
|---|---|
| Architecture vs core? | Architecture = the contract (instructions, registers); core = one implementation (Cortex-M4) |
| Who builds chips? | Licensees (ST, NXP, TI) — ARM builds none |
| What is Thumb-2? | ARM's compact mixed 16/32-bit instruction encoding for small memories |

<a id="words-first"></a>
## 2. Words First — ARM Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Instruction Set Architecture (ISA)** | The core's language: which instructions exist and what each does. Code compiled for one ISA never runs on another. |
| **Load-store architecture** | Only `LDR`/`STR` touch memory; all math happens between registers. Memory is never an arithmetic operand — the RISC discipline behind ARM's speed. |
| **Cortex-M family** | ARM's microcontroller cores: M0/M0+ (smallest), M3 (mainstream), M4 (DSP + floating point), M7 (fastest), M23/M33 (trustworthy — TrustZone). |
| **CMSIS** (Cortex Microcontroller Software Interface Standard) | ARM's standard software layer: same register names and startup shape across all licensees' chips. |
| **Nested Vectored Interrupt Controller (NVIC)** | The core's built-in interrupt manager: prioritised, low-latency, standard on every Cortex-M. |

::: toggle What is an "interrupt" in one paragraph?
A hardware tap on the CPU's shoulder: some event (button press, timer expiry, byte arrived) pauses the current program, runs a short handler function (ISR), then resumes where it left off. Without interrupts the CPU must poll everything in a loop (wasteful); with them it sleeps until tapped. Priority decides which tap wins when several arrive together.
:::

::: toggle What is the difference between architecture, core, and chip?
Architecture = the contract (which instructions and registers exist — e.g. Armv8-M). Core = one implementation of it (e.g. Cortex-M33). Chip = a licensee's product wrapping a core with memory and peripherals (e.g. STM32U575). Code talks to the architecture, runs on the core, ships in the chip.
:::

::: callout-intuition Core Mental Model: Recipe Plus Bakeries
ARM guards the recipe (core design + ISA); licensees run bakeries (complete chips). Your STM32 and a competitor's LPC speak the same core instructions, take interrupts through the same NVIC, and start via the same CMSIS shape — only the bakery extras (which timers, how much flash, which radio) differ. Porting skill transfers because the recipe is shared.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — RISC Rules and Generation Map

**Load-store, stated exactly:** arithmetic instructions name registers only (`ADD r0, r1, r2`); memory moves only through loads and stores (`LDR r0, [r1]`, `STR r0, [r1]`). Consequence examiners love: a C statement like `a[i] += 5` compiles to load–add–store triples, never one memory-arithmetic instruction — the read-modify-write window from M1.02 is literally visible in the instruction stream.

**Register file (know the three specials):** r0–r12 general workhorses; SP (r13) stack top; LR (r14) return address; PC (r15) next instruction. Function calls park returns in LR; nested calls push LR to the stack. Thumb-2 mixes 16-bit (compact, common ops) and 32-bit (full reach) encodings so firmware stays small without losing power.

::: toggle What do SP, LR, and PC do while a function runs?
SP (Stack Pointer) tracks the top of the scratch pile (stack) where nested calls park data. LR (Link Register) holds the return address — where to continue after this function finishes. PC (Program Counter) holds the fetch address tracking the instruction stream — note the classic exam trap: because of the pipeline, reading PC in ARM state yields the current instruction address plus 4 (Thumb: plus 4 as well on Cortex-M), not the executing instruction itself. Call = save a return address into LR and jump; return = jump back to LR.
:::

::: toggle How do I read `ADD r0, r1, r2` and `LDR r0, [r1]`?
`ADD r0, r1, r2` means r0 = r1 + r2 (destination first, then sources — result lands in r0). `LDR r0, [r1]` means load into r0 the memory word whose address sits in r1 (square brackets = "memory at"). Arithmetic names registers only; memory appears only inside brackets on loads/stores.
:::

**Generation comparison (honest, no "newer is always better"):** M0/M0+ — smallest gate count, cheapest, no divide; M3 — adds hardware divide, bit-banding era mainstream; M4 — adds DSP instructions plus optional Floating-Point Unit (FPU); M7 — dual-issue speed with caches, hungriest; M23/M33 — Armv8-M security (TrustZone) plus modern debug. Examiner bait: M4 without FPU still runs floats — slowly, in software. Generation answers cost/power/math-needs, never prestige.

::: callout-formula KTU Formula Vault: ARM Facts
ARM sells blueprints, licensees build chips · load-store: math in registers, memory via LDR/STR only · SP/LR/PC = stack/return/next · Thumb-2 = mixed 16/32-bit · M0 < M3 < M4(DSP/FPU) < M7(speed); M23/M33 = security generation.
:::

::: callout-pitfall Architecture vs Core vs Chip
Three wrong answers hide here: "ARM makes STM32 chips" (ST does, ARM licenses), "Cortex-M4 chip runs x86 code" (ISA mismatch — never), "M7 always beats M4" (power and cost disqualify it for coin-cell jobs). Name all three layers before choosing.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
(a) C does `sum += sensor[i]`. List the ARM instruction shapes involved (no exact encoding needed). (b) A coin-cell sensor node needs hardware divide on a budget. M0+ or M3, and why? (c) Who physically manufactures an STM32?
:::

::: step [Step 2: Execution] Applying Load-Store and Generations
(a) LDR sensor word to register, ADD into sum register, STR sum back — load–add–store, because arithmetic never touches memory directly. (b) M3: hardware divide included; M0+ lacks it (software divide burns cycles and battery). (c) STMicroelectronics, under ARM license — ARM designed the Cortex-M core inside it.
:::

::: step [Step 3: Conclusion] Final Result
One C line is three instruction shapes by RISC law; generation choice is feature arithmetic (divide present or not), not prestige; the chip's maker is the licensee, never ARM.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Writing arithmetic "directly on memory" in ARM assembly. Only LDR/STR reach memory — everything else is register-to-register.
- Expecting binary compatibility across ISAs. ARM firmware never runs on x86 or RISC-V, however similar the C looks.
- Picking M7 for battery jobs. Speed without a power budget is a wrong answer wearing a fast badge.

Exam recap: blueprint-not-chips; load-store triples; SP/LR/PC roles; Thumb-2 mixing; generation ladder with M23/M33 as security generation; CMSIS/NVIC standardise across licensees.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz `total += data[k]` must run on Cortex-M. Which instruction shapes appear, in order, and why can it never be one instruction?
() One STRCAT instruction — CISC density applies
(*) LDR (load data[k] to a register), ADD (register arithmetic), STR (store total back) — load-store law forbids memory operands in arithmetic, so every memory-arithmetic C line is a triple
() ADD directly on [data+k] — memory arithmetic allowed
() The compiler deletes the line as dead code
::: explanation
RISC splits the world: moves touch memory, math touches registers. Spot any "ADD [mem]" option and reject it — that instruction cannot exist on ARM.
:::

::: quiz A fitness band (coin cell, needs hardware divide) and a motor controller (needs DSP filtering) pick Cortex-M cores. Assign and justify without prestige talk.
() Both M7 — fastest is always correct
(*) Band: M3 (hardware divide, modest hunger); motor: M4 (DSP instructions, optional FPU for filter math) — each generation's extra silicon bills power, so match features to needs
() Both M0+ — cheapest always wins
() M23 for both — security solves everything
::: explanation
Generation = feature menu with power prices. Divide and DSP are the ordered items here; M7 speed and M23 security are unordered extras that still bill the battery.
:::

::: quiz "STMicroelectronics manufactures ARM processors." Repair this sentence precisely.
() It is already correct — ST owns ARM
(*) STMicroelectronics manufactures STM32 microcontrollers containing ARM-designed Cortex-M cores under license; ARM designs and licenses cores and architectures but fabricates no chips
() ARM manufactures STM32; ST only sells them
() Neither company exists in the supply chain
::: explanation
Three roles, three owners: architect/licensor (ARM), chip maker (ST), core (Cortex-M). Collapsing any two loses the mark the question was built to award.
:::
