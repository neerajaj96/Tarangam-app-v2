---
id: m3_01_serial_basics_and_terminal
courseCode: PBCST504
module: 3
sequence: 1
title: 'Serial Basics & Serial Terminal'
difficulty: beginner
estimatedMinutes: 11
learningObjectives:
  - State why wires go serial in plain words first
  - Contrast synchronous vs asynchronous framing
  - Run a serial terminal session correctly
concepts:
  - serial framing
  - baud rate
  - serial terminal
prerequisites:
  - m2_05_analog_io_timers_rtc
examRelevance: high
tags:
  - serial-basics
  - uart-framing
---
# Serial Basics & Serial Terminal

**What problem sending bits one-by-one solves, what frames, baud, and clocks mean, how synchronous differs from asynchronous, and how a serial terminal session proves your link alive.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Eight parallel wires are fast but costly, bulky, and skew-prone. The problem: move bytes between chips over one or two wires, cheaply and over distance. Serial communication sends bits in single file, wrapping each byte in agreed framing (start/stop bits or shared clocks) so the receiver knows where bytes begin.

Tiny beginner example. Sending `A` (0x41 = 0b01000001) at 9600 baud asynchronous: line idles high, drops low 1 bit (start), ships 8 data bits LSB-first, rises 1–2 bits (stop). Ten-ish bit-times per byte: ~960 bytes/s — slow, two wires, unmistakable.

Analogy as support, then dropped. Think of single-file boarding with stamped tickets (framing): slower than eight open doors, but nobody boards the wrong flight. From here on we use exact terms only: frame, baud, parity, flow control.

Abbreviations defined on first use: Least-Significant Bit first (LSB-first), Universal Asynchronous Receiver-Transmitter (UART). Symbols: baud = bits/s including framing (not user bytes/s).

| Question to ask | Meaning |
|---|---|
| What is baud? | Signalling bits per second (framing included) |
| What is a frame? | Start + data + parity? + stop = one byte's envelope |
| Sync vs async? | Shared clock wire vs agreed baud + start edges |

<a id="words-first"></a>
## 2. Words First — Serial Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Baud rate (9600/115200…)** | Bit-times per second both ends pre-agree; mismatch garbles everything (classic viva cause #1). |
| **Start/stop bits** | Async envelope: 1 start (low), 8 data, optional parity, 1–2 stop (high); receiver re-syncs on every start edge. |
| **Parity bit** | Optional even/odd 1-count flag — catches single-bit flips, never corrects; often skipped (None) with checksums above. |
| **Flow control (RTS/CTS)** | "Hold on, my buffer is full" handshake lines — prevents overrun when receivers lag. |
| **Serial terminal (PuTTY/Tera Term)** | PC program opening a COM port at your baud/frame settings to type at, and read from, the chip — the link's proof of life. |

::: toggle What does "8N1" spell out setting by setting?
`8` = eight data bits per frame (one byte). `N` = No parity bit (no error-detection flag added). `1` = one stop bit (line rests high for one bit-time after each byte). So 8N1 = 1 start + 8 data + 0 parity + 1 stop = 10 bit-times per byte. Both ends must agree on all three, plus baud, or garbage results.
:::

::: toggle What is a COM port and what does "TX→RX crossed" mean physically?
COM port = the PC's name for a serial interface (USB-to-serial adapters appear as COM3, COM4…). Transmit (TX) sends, Receive (RX) listens — so one side's TX wire must meet the other's RX wire (crossed), plus a shared ground wire as the common voltage reference. TX-to-TX connects two mouths with no ears; missing ground leaves voltages unreferenced (floating garbage).
:::

::: callout-intuition Core Mental Model: Stamped Single File
Parallel is eight doors with no tickets (fast, chaotic at distance); serial is one door where every byte shows a stamped ticket (start/stop) or marches to a shared drum (clock). Tickets cost ~20% overhead and buy certainty — the trade the whole module prices per protocol.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Clocks and Throughput

**Synchronous vs asynchronous, exactly:** synchronous shares a clock line (master ticks, slave samples — SPI/I2C style): faster, extra wire, no per-byte overhead. Asynchronous shares only baud agreement (UART style): start edges resynchronise per byte, ±2–3% clock error tolerated, ~20% framing overhead. Exam rule: shared clock ⇒ sync; agreed rate + start bits ⇒ async.

**Throughput math:** byte rate ≈ baud / bits-per-frame. 115200 baud, 8N1 (8 data, No parity, 1 stop = 10 bits/frame) ⇒ ≈ 11,520 bytes/s. "115200 bytes/s" is the classic wrong answer — baud counts framing bits. Parity adds one more bit per frame (11 total) for a detection flag, never correction.

**Terminal session discipline (numbered):** (1) match baud + frame (8N1 typical) + COM port; (2) wire TX→RX crossed (transmit meets receive, plus common ground!); (3) type and watch echo; garbage ⇒ baud/frame mismatch first, wiring (TX-TX, missing ground) second. Ground is the forgotten wire in half of all dead-terminal stories.

::: callout-formula KTU Formula Vault: Serial Facts
Async = agreed baud + start edges · sync = shared clock · bytes/s ≈ baud/frame-bits (8N1 ⇒ ÷10) · parity detects, never corrects · TX crosses to RX + common ground · garbage first means settings, second means wiring.
:::

::: callout-pitfall Baud Worship
Raising baud without checking error margins and cable length buys garbage faster. Distances and cheap internal oscillators cap honest baud — the terminal proves the setting, the scope proves the signal.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Link A: 9600 baud 8N1. Link B: 115200 baud 8E1 (Even parity). (a) User bytes/s each? (b) Terminal shows garbage on A. Two checks in order? (c) Sync or async is UART, and why?
:::

::: step [Step 2: Execution] Dividing by Frames
(a) A: 10 bits/frame ⇒ 960 B/s. B: 1+8+1+1 = 11 bits ⇒ ≈ 10,473 B/s. (b) Match baud/frame/COM first; then wiring (crossed TX-RX? common ground?). (c) Async: no shared clock, start-bit resync per byte. (Arithmetic verified.)
:::

::: step [Step 3: Conclusion] Final Result
Baud is never bytes — divide by the envelope. Garbage diagnoses settings before soldering. UART's start edges are its whole clock strategy.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Equating baud with bytes/s. Framing bits ride along — always divide by frame length.
- Expecting parity to fix errors. Detection flag only; correction needs codes above this layer.
- Wiring TX-TX or skipping ground. Cross TX↔RX and share ground — the two-wire law plus the forgotten third.

Exam recap: sync vs async rule; 8N1 anatomy; bytes/s division; parity limits; terminal discipline (settings then wiring); ground always.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz 115200 baud 8N1 ships a 11,520-byte firmware. Transfer time? Show the frame division.
() 0.1 s — baud equals bytes
(*) 10 bits/frame (1 start + 8 data + 1 stop) ⇒ 11,520 B/s ⇒ 1.0 s — baud counts framing, so divide first, then divide the file
() 11 s — parity adds ten bits
() Instant — serial is parallel-fast
::: explanation
Two divisions, one answer: baud→bytes via frame length, then file→time via byte rate. Skipping the first division is the most wrong-by-10× answer in serial questions.
:::

::: quiz Terminal prints `ø≡` instead of typed text. Name the two checks in order with reasons.
() Replace the chip — silicon failure confirmed
(*) (1) Baud/frame/COM mismatch (receiver slices bits at wrong times ⇒ systematic garbage); (2) wiring (TX-TX or missing ground ⇒ no valid signal at all). Settings lie first, wires second
() Increase baud until text clears
() Terminals cannot show typed text by design
::: explanation
Garbage with connection = wrong slicing (settings); garbage/nothing with correct settings = wrong copper. The order saves hours: settings check in seconds, rewiring in minutes.
:::

::: quiz SPI (shared clock) vs UART (agreed baud): which is synchronous, and what does each pay for its choice?
() Both async — clocks are decorative
(*) SPI is synchronous (clock wire shared: faster, extra pin, no framing overhead); UART is asynchronous (start-bit resync: two wires, ~20% overhead, baud agreement required) — wire cost versus agreement cost
() UART shares clocks invisibly
() SPI needs no clock because it is faster
::: explanation
One shared drum versus per-byte tickets: name the wire (or its absence) and its price. Every protocol in M3.02–M3.05 files under exactly one of these two.
:::
