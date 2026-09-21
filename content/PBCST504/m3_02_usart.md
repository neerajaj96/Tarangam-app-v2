---
id: m3_02_usart
courseCode: PBCST504
module: 3
sequence: 2
title: 'USART Communication'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what the S adds to UART in plain words first
  - Configure baud, word length, and stop bits deliberately
  - Exchange bytes with polling then interrupts
concepts:
  - USART modes
  - baud configuration
  - TX RX exchange
prerequisites:
  - m3_01_serial_basics_and_terminal
examRelevance: high
tags:
  - usart
  - uart-config
---
# USART Communication

**What problem the Synchronous option adds to a UART, what Universal Synchronous/Asynchronous Receiver-Transmitter (USART) modes cover, how baud and frame registers are chosen, and how bytes move by polling then by interrupt.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Two boards must chat: debug prints one way, sensor queries both ways. The problem: agree on speed and envelope, then move bytes without losing them when the CPU looks away. The USART peripheral is the chip's serial post office — async UART mode for wires, sync mode when a clock line is spared, all at configured baud.

Tiny beginner example. Board prints "T=75C" at 115200 8N1: five characters leave TX one frame at a time; the PC terminal (matched settings) shows `T=75C`. Polling waits per byte (fine for five); interrupts collect while the CPU works (needed for streams).

Analogy as support, then dropped. Think of a post office with a clerk (polling: you wait at the counter) versus a mailbox flag (interrupt: flag pops, you collect when free). Same mail, different waiting. From here on we use exact terms only: TXE/RXNE flags, overrun, baud divisor.

Abbreviations defined on first use: Transmit Empty (TXE), Receive Not Empty (RXNE). Symbols: $f_{clk}$ peripheral clock, DIV baud divisor.

| Question to ask | Meaning |
|---|---|
| What is USART vs UART? | USART = both sync and async hardware; UART = async subset (the usual use) |
| What are TXE/RXNE? | Status flags: transmit register empty (may load next), receive register full (must read now) |
| What is overrun? | New byte arrived before old was read — old lost, flag set, data suspect |

<a id="words-first"></a>
## 2. Words First — USART Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Baud divisor (BRR register)** | Divides $f_{clk}$ to the bit clock: DIV $= f_{clk}$/baud (oversampling accounted) — the one register behind every baud setting. |
| **Word length / stop bits** | 8 vs 9 data bits; 1 vs 2 stop bits — must match the partner exactly (frame contract from M3.01). |
| **Polling exchange** | Loop on TXE to send, on RXNE to receive — simple, CPU held hostage per byte. |
| **Interrupt exchange** | TXE/RXNE interrupts fill/drain circular buffers in ISRs — CPU free between bytes, mandatory for streams. |
| **Synchronous mode** | USART drives a clock line (CK) with data — niche on STM32, used talking to SPI-like slaves; async remains the default. |

::: callout-intuition Core Mental Model: Counter Plus Flags
The peripheral is a counter (baud divisor slicing bit-times) plus two flags (TXE "counter free", RXNE "mail arrived"). Polling stares at flags; interrupts sleep until flags tap. Configuration writes the contract (baud/frame); flags execute it.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Config Then Move

**Configuration order (numbered):** (1) enable USART + GPIO clocks; (2) map pins to alternate function; (3) write baud divisor for target baud at current $f_{clk}$; (4) set word length, parity, stop bits; (5) enable TX/RX, then the peripheral. Clock changes invalidate baud — recompute DIV after any $f_{clk}$ retune (viva trap: "changed PLL, garbage terminal" ⇒ stale divisor).

**Polling send/receive shapes:**

```c
while (!(USART2->ISR & USART_ISR_TXE)) {}  /* wait: transmit free? */
USART2->TDR = ch;                          /* load byte, hardware frames it */
...
while (!(USART2->ISR & USART_ISR_RXNE)) {} /* wait: byte arrived? */
ch = USART2->RDR;                          /* read clears RXNE */
```

Read line by line: spin on flag, move one byte, hardware adds start/stop. Overrun rule: read RDR before the next frame completes, or enable RXNE interrupts into a buffer.

**Interrupt upgrade:** enable RXNE interrupt, ISR drains RDR into a ring buffer, main consumes at leisure; TX similarly from a queue. ISRs stay tiny (move bytes only) per M2.05 discipline. Sync mode adds the CK pin and clock-phase choices — same flags, shared drum.

::: callout-formula KTU Formula Vault: USART Facts
USART ⊃ UART (+sync CK mode) · DIV = $f_{clk}$/baud, recompute after clock changes · TXE = may send, RXNE = must read · overrun = unread byte overwritten · polling simple/blocking, interrupts buffered/free · frame must match partner bit-for-bit.
:::

::: callout-pitfall Stale Divisor
Any clock retune without baud recompute garbles the terminal while code is "unchanged." Baud is a ratio, not a constant — name $f_{clk}$ in every baud answer.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
$f_{clk} = 80$ MHz, target 115200 baud 8N1. (a) Baud divisor value shape? (b) After a clock change to 40 MHz with DIV untouched, what symptom and what fix? (c) Stream of 1000 bytes arrives: polling or interrupt, and why?
:::

::: step [Step 2: Execution] Ratios and Buffers
(a) DIV $= 80{,}000{,}000/115200 ≈ 694.4$ (hardware takes integer + fraction fields per manual). (b) Actual baud halves to 57600 ⇒ garbage terminal; fix = recompute DIV for 40 MHz. (c) Interrupt + ring buffer: polling 1000 bytes holds the CPU ~87 ms doing nothing else.
:::

::: step [Step 3: Conclusion] Final Result
Baud lives in a ratio with the clock; streams live in buffers behind interrupts. Two ratios, one buffer discipline — the whole USART exam in miniature.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Matching baud but not frame. 8N1 vs 8E1 at identical baud still garbles — contract is baud + frame + port.
- Reading RDR late. Overrun silently replaces data; flags warn, code must hurry (or buffer via interrupt).
- Fat RX ISRs parsing protocols. Move bytes in ISR, parse in main — priority jitter corrupts framing otherwise.

Exam recap: USART vs UART naming; DIV ratio with $f_{clk}$; TXE/RXNE meanings; overrun cause; polling vs interrupt economics; sync CK as niche; frame contract completeness.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Terminal garbles after firmware "only" doubles the PLL clock. Nothing else changed. Diagnose precisely and give the one-register fix.
() Terminals cannot handle fast clocks; lower baud permanently
(*) Baud divisor went stale: actual baud doubled with $f_{clk}$ (DIV = $f_{clk}$/baud unchanged) — recompute/write BRR for the new clock; baud is a ratio, and clock edits invalidate it
() Parity must now be enabled to compensate
() The GPIO pins melted from speed
::: explanation
"Only the clock changed" is the confession: every baud answer names $f_{clk}$. Recompute the ratio and garbage becomes text — the cheapest fix in serial debugging.
:::

::: quiz 2000-byte sensor dump: polling loop vs RXNE-interrupt ring buffer. Choose and price both in CPU attention.
() Polling — simpler code always wins
(*) Interrupt + ring: polling burns ~174 ms of CPU staring at RXNE for 2000 bytes at 115200; interrupts cost microseconds per byte in ISRs plus leisurely main-side parsing — streams demand buffers, single bytes tolerate polling
() Interrupts lose bytes by design
() Both hold the CPU equally
::: explanation
Price attention per byte: polling rents the whole CPU per byte-time; interrupts rent microseconds. Volume decides the architecture — quote the millisecond math.
:::

::: quiz Byte lost with overrun flag set. What exactly happened in hardware, and what two cures exist?
() Baud too high melted the register
(*) New frame completed before firmware read RDR — hardware overwrote/flagged; cures: read faster (poll tighter) or RXNE-interrupt ring buffer (never let a byte wait past one frame time)
() Parity correction failed; enable double parity
() The transmitter must slow down permanently
::: explanation
Overrun is a deadline miss with a flag as receipt: one frame time to collect each byte. Either hurry the collector or queue the mail — both answers name the frame-time deadline.
:::
