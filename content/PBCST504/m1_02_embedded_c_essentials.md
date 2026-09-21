---
id: m1_02_embedded_c_essentials
courseCode: PBCST504
module: 1
sequence: 2
title: 'Embedded C Essentials'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State why plain C needs hardware extras in plain words first
  - Drive pins with bit operations and memory-mapped registers
  - Use volatile and fixed-width types correctly
concepts:
  - embedded C
  - bit manipulation
  - volatile
prerequisites:
  - m1_01_embedded_systems_and_processor_types
examRelevance: high
tags:
  - embedded-c
  - bit-operations
---
# Embedded C Essentials

**What problem talking to hardware poses for plain C, what bit operations and Memory-Mapped Registers it needs, how `volatile` and fixed-width types keep the compiler honest, and where each construct bites in exams.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Normal C prints text and crunches numbers; it has no "turn pin 5 on" statement. The problem: hardware is controlled by flipping individual bits in special memory addresses, while C only understands variables and bytes. Embedded C is plain C plus three hardware habits: bit surgery, memory pretending to be hardware, and stopping the compiler from "optimising away" reality.

Tiny beginner example. An LED (Light-Emitting Diode) sits on pin 5 of port A. Turning it on means setting bit 5 of the port's output register to 1 without touching bits 0–4 and 6–7. One line does it: `GPIOA->ODR |= (1 << 5);` — read the register, OR in a 1 at position 5, write back. Every other bit survives.

Analogy as support, then dropped. Think of a row of eight light switches behind one panel photo: you may only mail whole photos, so you copy the photo, flip switch 5 on your copy, and mail it back. From here on we use exact terms only: register, mask, Memory-Mapped I/O, `volatile`.

Abbreviations defined on first use: Light-Emitting Diode (LED), General-Purpose Input/Output (GPIO), Output Data Register (ODR). Symbols: `<<` left shift, `|` OR, `&` AND, `~` NOT, `^` XOR (exclusive OR).

| Question to ask | Meaning |
|---|---|
| What is a register? | A hardware control word at a fixed address |
| What is a mask? | A bit pattern selecting which bits to change |
| What is `volatile`? | "Hardware may change this behind your back — never cache it" |

<a id="words-first"></a>
## 2. Words First — Bit Surgery Kit

| Operation | Code shape | Plain meaning |
|---|---|---|
| Set bit `n` | `REG \|= (1 << n)` | Force bit `n` to 1, keep the rest |
| Clear bit `n` | `REG &= ~(1 << n)` | Force bit `n` to 0, keep the rest |
| Toggle bit `n` | `REG ^= (1 << n)` | Flip bit `n`, keep the rest |
| Test bit `n` | `if (REG & (1 << n))` | Nonzero means bit `n` is 1 |
| Memory-mapped register | `#define LED (*((volatile uint32_t*)0x48000014))` | Address `0x48000014` behaves as a variable wired to hardware |

::: toggle How do I read `0x48000014`?
`0x` means hexadecimal (base 16, digits 0–9 plus A–F). So `0x48000014` is just a big number written compactly — hardware manuals use hex because each digit maps exactly 4 bits. You never compute it; you copy it from the manual and treat it as this register's street address.
:::

::: toggle What does `volatile` force the compiler to do?
Normally the compiler may read a variable once and reuse the value (fast, and fine for ordinary variables). `volatile` forbids that caching: every mention re-reads actual memory, because hardware or an interrupt may have changed it meanwhile. Without it, the compiler "helpfully" freezes your button input forever.
:::

::: toggle What is a "read-modify-write" in plain steps?
Three hidden steps inside one C line: (1) read the whole register, (2) change some bits in the CPU, (3) write the whole register back. The danger lives between (1) and (3): an interrupt changing a bit in between gets overwritten by the stale copy. That is why shared outputs use atomic set/reset registers instead.
:::

::: callout-intuition Core Mental Model: The Mailed Photo
You never touch the switches directly — only whole-register photos travel. OR-ing pastes a 1 on, AND-ing with NOT scrapes one off, XOR flips, AND reads. The mask is your stencil: ones where you act, zeros where the photo passes through untouched.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — volatile, Types, Startup

**`volatile`, the examiner's favourite:** hardware registers change without the program writing them (a timer ticks, a button press arrives). Without `volatile`, the compiler caches the first read in a CPU register and reuses it — your loop never sees the button. Rule: every memory-mapped register and every variable shared with an Interrupt Service Routine (ISR) is `volatile`. Missing `volatile` is the classic "works in debug, fails in release" bug (optimisation off hides it).

**Fixed-width types:** plain `int` is 16 bits on some compilers and 32 on others — fatal when bit 5 must mean pin 5. Embedded code uses `uint8_t/uint16_t/uint32_t` from `stdint.h` so widths are contractual. Exam trap: `1 << 31` on a 16-bit `int` is undefined behaviour; write `1UL << 31`.

::: toggle What does `uint32_t` spell out?
`u` = unsigned (no negatives, full range for bits), `int` = integer, `32` = exactly 32 bits wide, `_t` = type (naming convention). So `uint32_t` is "an unsigned 32-bit integer on toolchains providing exact-width types (virtually all ARM toolchains do)" — unlike `int`, whose width the compiler chooses.
:::

::: toggle What does `1UL << 31` mean piece by piece?
`1` = the value one; `UL` = treat it as Unsigned Long (at least 32 bits, so bit 31 exists); `<< 31` = slide that 1 left 31 positions, producing a single 1 at bit 31. Without `UL`, a 16-bit `int` has no bit 31 and the shift is undefined behaviour (anything may happen).
:::

**Startup and the main loop:** reset loads the stack pointer, runs SystemInit (clocks), then `main()` — which on bare metal never returns but spins `while(1)`: read inputs, update state, drive outputs. No OS, no `exit`, no return.

::: callout-formula KTU Formula Vault: Embedded C Facts
Set `\|=`, clear `&= ~`, toggle `^=`, test `&` · registers are `volatile` + fixed-width · ISR-shared data is `volatile` · `main` ends in `while(1)` · shifts beyond the type width are undefined.
:::

::: callout-pitfall Read-Modify-Write Races
`REG |= mask` reads, modifies, writes — an interrupt between read and write can lose its own bit change. Cure: use the port's atomic set/reset registers (e.g. BSRR on STM32) instead of read-modify-write on shared outputs.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Port B output register holds `0b10110000`. Without touching other bits: (a) turn pin 2 on, (b) turn pin 7 off, (c) test pin 4. Give each C line and the final value after (a) then (b).
:::

::: step [Step 2: Execution] Masks and Arithmetic
(a) `GPIOB->ODR |= (1 << 2);` — `0b10110000 | 0b00000100 = 0b10110100`. (b) `GPIOB->ODR &= ~(1 << 7);` — `0b10110100 & 0b01111111 = 0b00110100`. (c) `if (GPIOB->ODR & (1 << 4))` — mask `0b00010000`, AND is nonzero, so pin 4 reads high. (Values verified bit by bit.)
:::

::: step [Step 3: Conclusion] Final Result
Register ends `0b00110100`: only pins 2 and 7 moved. The stencil rule held — ones act (OR), zeros protect (AND-NOT), reads never disturb.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Writing `REG = (1 << 5)` to "set pin 5" — assignment wipes all other pins; OR-equals preserves them.
- Forgetting `volatile` on polled flags — the loop optimises into an infinite nap in release builds.
- Using `int` for masks — width varies by compiler; `uint32_t` plus `1UL` shifts are contractual.
- Returning from `main` — bare metal has nowhere to return to; end in `while(1)`.

Exam recap: set/clear/toggle/test shapes; volatile for hardware and ISR data; fixed-width types; atomic set/reset beats read-modify-write on shared pins; main never returns.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Register reads 0b11000011. Turn pin 1 on and pin 7 off in two lines, then state the final value.
() `REG = 0b01000010;` — final 0b01000010
(*) `REG |= (1 << 1); REG &= ~(1 << 7);` — final `0b01000011`: pin 1 was already 1 (stays), pin 7 falls, every other bit untouched
() `REG ^= 0xFF;` — toggles everything, final 0b00111100
() One line suffices for both jobs
::: explanation
OR adds without disturbing; AND-NOT removes without disturbing; assignment destroys. Read each result bit by bit — examiners award the final value only when untouched bits are provably untouched.
:::

::: quiz A button flag polled in while(1) works in debug but never fires in release. Name the missing keyword, where it goes, and why optimisation matters.
() Add `const` — constants survive optimisation
(*) The flag (and its register) must be `volatile`: it changes via hardware/ISR behind the program's back, and release optimisation caches the first read in a CPU register forever — volatile forces a fresh hardware read every time
() Remove the loop — polling is forbidden
() Debug builds are always correct by definition
::: explanation
Debug (−O0) re-reads memory every time, hiding the bug; release (−O2) trusts its cache. Volatile tells the truth: this memory has two writers, one of them silicon.
:::

::: quiz Two interrupts both set different bits of one output register with `ODR |=`. Occasionally a bit goes missing. What race is this and what is the syllabus-correct cure?
() Compiler bug — rewrite in assembly
(*) Read-modify-write race: interrupt B's write-back overwrites A's bit set between A's read and write; cure is the atomic bit-set/reset register (BSRR), which sets or clears named bits in one hardware step with no read involved
() Add more volatile — volatility fixes races
() Disable all interrupts forever
::: explanation
The lost update lives between read and write — volatility only forces fresh reads, it never makes the pair atomic. Hardware set/reset registers exist precisely so two writers never share a read-modify-write window.
:::
