---
id: m1_05_registers_memory_bus
courseCode: PBCST504
module: 1
sequence: 5
title: 'Registers, Memory & Bus Architecture'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what each memory region holds in plain words first
  - Map registers, stack, and peripherals onto one address space
  - Explain what the bus system carries and arbitrates
concepts:
  - memory map
  - stack pointer
  - bus matrix
prerequisites:
  - m1_04_cortex_m23_m33_armv8m
examRelevance: high
tags:
  - memory-map
  - bus-architecture
---
# Registers, Memory & Bus Architecture

**What problem one address map solves for CPU, memory, and gadgets, what lives in flash versus SRAM (Static RAM) versus peripheral space, how the stack uses the Stack Pointer, and what the bus matrix arbitrates.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

The CPU sees only numbered mailboxes (addresses) — yet programs, variables, and hardware gadgets must all live somewhere reachable. The problem: give every byte of flash, RAM, and every peripheral register exactly one address, plus rules for who talks when. The memory map plus the bus system is that street plan.

Tiny beginner example. Address `0x08000000` holds your program's first instruction (flash); `0x20000000` holds its variables (SRAM); `0x48000000` holds GPIO registers (peripherals). Same CPU, same load/store instructions — only the street address decides whether you read code, data, or live hardware.

Analogy as support, then dropped. Think of one city grid where houses (flash), offices (RAM), and control towers (peripherals) share street numbers but never overlap; buses are the roads with traffic priority. From here on we use exact terms only: memory map, alias, bus matrix, arbitration.

Abbreviations defined on first use: Static Random Access Memory (SRAM), First-In-Last-Out (FILO — stack discipline), Direct Memory Access (DMA), Advanced High-performance Bus (AHB), Advanced Peripheral Bus (APB). Symbols: `0x` prefix = hexadecimal addresses.

| Question to ask | Meaning |
|---|---|
| What is the map? | Fixed assignment of address ranges to flash, RAM, peripherals |
| What is the stack? | FILO scratch space growing down from RAM top, tracked by SP |
| What is arbitration? | Deciding which bus master transfers when several ask at once |

<a id="words-first"></a>
## 2. Words First — Map Regions

| Region (typical Cortex-M address) | Holds | Plain meaning |
|---|---|---|
| Flash/ROM (`0x08000000`) | Firmware code + constants | Non-volatile: survives power-off; executes from here |
| SRAM (`0x20000000`) | Variables, stack, heap | Fast volatile workspace; wiped at power-off |
| Peripherals (`0x40000000`/`0x48000000`) | Control/status registers | Reading/writing here drives hardware (GPIO, timers, UART) |
| System/PPB (`0xE0000000`) | NVIC, SysTick, debug | Core's own control room (Private Peripheral Bus) |
| Stack (RAM top, grows down) | Call frames, locals, saved LR | SP auto-moves on call/return; overflow collides with heap/data below |

::: callout-intuition Core Mental Model: One City, Three Districts
Flash district stores the recipe books permanently; SRAM district holds today's cooking (variables) plus a FILO pile of nested orders (stack); peripheral district's "buildings" are levers — opening their doors (reads/writes) moves real machinery. The CPU is the courier who only understands street numbers, and the map guarantees no two districts share one.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Stack Discipline and Bus Fabric

**Stack, exactly:** on function call the CPU pushes return address (LR) and locals, SP decrements (Cortex-M stack grows toward lower addresses); on return it pops and SP restores. Push order and pop order mirror — interrupt nesting reuses the same SP automatically, which is why deep call chains plus interrupts overflow into variables below. Armv8-M stack-limit registers fault instead of silently corrupting — the M1.04 feature paying off here.

**Bus fabric (AHB/APB/DMA):** fast masters (CPU, DMA) ride the AHB matrix to flash/SRAM; slow peripherals hang off APB bridges (one wait-state world, lower power). The matrix arbitrates concurrent masters — e.g. CPU fetching code while DMA streams ADC samples to SRAM — by fixed or round-robin priority. fast paths stay fast because slow gadgets never share their road. Exam line: AHB = high-speed backbone, APB = low-power peripheral branches, DMA = CPU-free transfers between them.

**Comparison with earlier generations (course requirement):** M0+/M3/M4 share this map shape (CMSIS standardises it); v8-M adds security attribution signals on the same buses (each transfer tagged Secure/Non-secure, checked at region gates) plus stack-limit faulting. Shape familiar, borders new.

::: callout-formula KTU Formula Vault: Map Facts
Flash `0x08…` = code, SRAM `0x20…` = data+stack, peripherals `0x40/0x48…` = hardware levers, PPB `0xE0…` = core control · stack FILO grows down, SP tracks · AHB fast backbone, APB slow branches, DMA master without CPU · v8-M tags transfers Secure/Non-secure.
:::

::: callout-pitfall Harvard Confusion
Cortex-M is load-store but has one unified address map (von Neumann view: code and data share addresses) with separate buses behind it for speed. Claiming "separate memories" as two address spaces is wrong — one map, multiple roads.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Firmware writes `GPIOA->ODR` at `0x48000014`, pushes one nested call, and streams ADC via DMA simultaneously. (a) Which region is `0x48000014`? (b) Which way does SP move on the nested call? (c) Which bus carries the DMA stream, and does the CPU stall?
:::

::: step [Step 2: Execution] Reading Map and Fabric
(a) `0x48…` = peripheral region — the write flips live pins, not memory. (b) SP decrements (stack grows down); return restores it. (c) DMA is an AHB master to SRAM — the matrix interleaves its transfers with CPU fetches, so the CPU keeps executing (arbitration, not blocking).
:::

::: step [Step 3: Conclusion] Final Result
Address prefix names the district (peripheral ⇒ hardware effect); SP direction follows the grows-down contract; DMA parallelism is matrix arbitration doing its job — three map/fabric rules in one scenario.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Treating peripheral writes as "stored values." They actuate hardware; reading back may return status, not what you wrote.
- Growing the stack "up." Cortex-M stacks descend; overflow eats heap/variables below, not empty space above.
- Giving DMA to the CPU's workload. DMA moves data; only the CPU executes decisions — a DMA-fed buffer still needs code to interpret it.

Exam recap: four region prefixes and contents; stack FILO + SP direction; AHB vs APB vs DMA roles; v8-M security tags on transfers; one map with many roads (not Harvard addressing).

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Firmware reads address 0x20000100 and writes 0x48000014. What kind of thing happens in each case, and why does the same store instruction do both?
() Both store numbers into RAM
(*) Read hits SRAM workspace (a variable); write hits a peripheral register (moves hardware) — load/store instructions are district-blind, so the address prefix alone decides memory versus machinery
() Addresses are interchangeable decorations
() Stores cannot reach peripherals by design
::: explanation
One instruction set, two effects: the map gives meaning to numbers. Prefix-spotting (`0x20` data, `0x48` levers) is the fastest mark in map questions.
:::

::: quiz A deep call chain plus a heavy interrupt handler corrupts variables "randomly." Diagnose with SP mechanics and name the v8-M hardware that converts this to a clean fault.
() Flash wears out — replace the chip
(*) Stack (growing down) overflowed into variables/heap below; nesting depth plus handler frames exceeded RAM. Armv8-M stack-limit registers fault on crossing instead of silent corruption — size stacks, watch nesting, enable the limit
() DMA stole the variables mid-transfer
() Volatile was missing on the stack
::: explanation
Descent has no brakes without limits: frames pile downward until they overwrite the living. The v8-M limit turns mystery corruption into a catchable exception at the exact crossing.
:::

::: quiz CPU fetches code from flash while DMA streams ADC data to SRAM. Do they collide, and which fabric pieces keep both moving?
() They collide — only one master per chip
(*) Both are AHB masters; the bus matrix arbitrates (interleaves/prioritises) their transfers, while slow peripherals stay on APB branches off the fast path — concurrency by design, not luck
() DMA pauses the CPU by definition
() Flash cannot be read during DMA
::: explanation
Matrix, masters, branches: name all three. The exam rewards "arbitration" over "magic speed" — and APB isolation is why sluggish gadgets never jam the backbone.
:::
