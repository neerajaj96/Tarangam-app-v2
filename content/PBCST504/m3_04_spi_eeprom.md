---
id: m3_04_spi_eeprom
courseCode: PBCST504
module: 3
sequence: 4
title: 'SPI & EEPROM Read/Write'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what four wires and chip-select buy in plain words first
  - Run SPI modes and EEPROM write cycles correctly
  - Read and write EEPROM pages without tearing data
concepts:
  - SPI signalling
  - chip select
  - EEPROM pages
prerequisites:
  - m3_03_i2c_sensor_lcd
examRelevance: high
tags:
  - spi
  - eeprom
---
# SPI & EEPROM Read/Write

**What problem fast full-duplex chip talk poses, how Serial Peripheral Interface (SPI) MOSI/MISO/SCK/CS signalling works, how modes encode clock deals, and how Electrically-Erasable Programmable ROM (EEPROM) pages are written and read.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A data logger must stash settings through power cuts and stream display data fast. The problem: I2C is too slow for screens, and RAM forgets at power-off. SPI answers with four wires and a private select per slave (fast, full-duplex); EEPROM answers with byte-keeping memory that survives darkness but writes slowly in pages.

Tiny beginner example. Saving volume `7` to EEPROM address `0x10`: pull CS low, send WRITE opcode + address + data while SCK ticks, raise CS, wait 5 ms (write cycle) — setting survives the power cut that erases every RAM byte.

Analogy as support, then dropped. Think of a bank of phone booths (CS selects the booth) with two-way talking (MOSI/MISO simultaneous) paced by a metronome (SCK). I2C's classroom shares one mouth; SPI gives every booth a private line. From here on we use exact terms only: MOSI, MISO, SCK, CS, mode 0–3.

Abbreviations defined on first use: Master-Out-Slave-In (MOSI), Master-In-Slave-Out (MISO), Serial Clock (SCK), Chip Select (CS). Symbols: CPOL (clock idle level), CPHA (sample edge).

| Question to ask | Meaning |
|---|---|
| Why four wires? | Separate talk/listen lines (full duplex) + clock + select — speed for pins |
| What is a page? | EEPROM's write chunk (e.g. 16–64 bytes): writes cannot cross it in one go |
| What is the write cycle? | ~5 ms internal burn-in after the bus transfer — reads too early lie |

<a id="words-first"></a>
## 2. Words First — SPI Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **MOSI / MISO** | Simultaneous opposite directions: master talks on MOSI while slave answers on MISO — every transfer is an exchange, even when one side sends dummy bytes. |
| **CS (active-low)** | Per-slave select: master pulls one low to address that booth; all others ignore the conversation. Costs one pin per slave. |
| **Modes 0–3 (CPOL/CPHA)** | The clock deal: idle low/high × sample on first/second edge. Both ends must share the mode — mode mismatch scrambles every bit. |
| **EEPROM opcodes** | WREN (write-enable latch), WRITE (opcode+address+data), READ (opcode+address then clock out), RDSR (status: WIP busy bit). |
| **WIP polling** | Status-register busy bit: poll until clear instead of blind 5 ms delays — faster and self-timed. |

::: callout-intuition Core Mental Model: Private Booths Plus Metronome
CS picks the booth, the metronome (SCK) paces, both parties talk at once (MOSI/MISO). EEPROM is the booth with a notebook: dictation is quick (bus speed), ink-drying takes minutes (write cycle) — never read the page while ink is wet (poll WIP).
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Transfers and Pages

**One byte transfer, exactly:** CS low → 8 SCK pulses, master shifts a bit onto MOSI per pulse while sampling MISO (full duplex always) → CS high. Higher-level reads chain bytes under one CS: opcode, address bytes, then data clocks (dummy bytes sent to receive). Mode must match: CPOL=idle level, CPHA=which edge samples — slave datasheets state the mode; master configures identically.

**EEPROM write discipline (numbered):** (1) WREN (latch enable — writes without it are ignored!); (2) CS low, WRITE opcode + address + up-to-page data, CS high; (3) poll RDSR until WIP clears (or wait full cycle); (4) never span a page boundary in one WRITE (wraps within the page, tearing data). Read path: READ opcode + address, then keep clocking — bytes stream out, no cycle wait.

**SPI vs I2C (examinable):** SPI faster (MHz clocks, full duplex), no addressing/pull-ups, but one CS pin per slave and no ACK discipline; I2C two wires for all, slower, ACKs every byte. Speed-and-pins versus wires-and-discipline.

::: callout-formula KTU Formula Vault: SPI Facts
4 wires: MOSI/MISO/SCK/CS · full duplex always (dummies to receive) · modes = CPOL×CPHA, must match · EEPROM: WREN → WRITE → WIP-poll, pages uncrossable · reads stream free, writes burn ~ms.
:::

::: callout-pitfall Silent WREN Skip
Every "writes do nothing" EEPROM story ends at the missing WREN latch — protection defaults to locked. Sequence is enable, then write, then poll; any other order fails quietly.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
EEPROM page 16 bytes, WIP 5 ms. Store 20 bytes at address `0x3E`. (a) How many WRITE operations, at which addresses? (b) Total minimum time with WIP polling? (c) SPI mode on slave is CPOL=0, CPHA=1 — master setting?
:::

::: step [Step 2: Execution] Pages and Clocks
(a) Two WRITEs: 2 bytes at `0x3E` (page ends `0x3F`), then 18 bytes from `0x40` (next page holds 16, remaining 2 spill to a third WRITE at `0x50` — actually 18 = 16 + 2, so three WRITEs total: `0x3E`(2B) + `0x40`(16B) + `0x50`(2B)). Each preceded by WREN. (b) ≈ 3 × 5 ms = 15 ms plus bus microseconds. (c) Master mode 1 (CPOL 0, CPHA 1) — modes must match exactly.
:::

::: step [Step 3: Conclusion] Final Result
Page math first (never cross in one go), WREN before every WRITE, WIP-polled pacing, mode mirrored — EEPROM discipline is four rules with zero exceptions.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Crossing page boundaries. Address wraps inside the page — tail data overwrites the page head, silently.
- Reading during WIP. Wet ink reads back old/garbage — poll the busy bit first.
- Mode mismatch "almost working." One-edge-off sampling corrupts every byte systematically — match CPOL/CPHA exactly.

Exam recap: wire roles; full-duplex with dummies; mode encoding and matching; WREN→WRITE→WIP sequence; page-boundary arithmetic; SPI-vs-I2C trade table.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz EEPROM writes return success on the bus but power-cycle loses the data. Name the skipped step and explain why the bus looked fine.
() Bus speed too high — slow everything down
(*) WREN latch skipped: the WRITE transfer clocked perfectly (bus cannot refuse), but the protection latch was never set, so cells never burned — bus success reports transfer, never storage
() Pages are read-only by physics
() CS must stay low forever after writes
::: explanation
Two successes exist: transfer (bus) and storage (cells). WREN bridges them; without it every WRITE is theatre with correct timing. Always sequence enable→write→poll.
:::

::: quiz 20 bytes at 0x3E, 16-byte pages. How many WRITEs and where? What breaks if done in one?
() One WRITE — pages are advisory
(*) Three: 2B at 0x3E (page ends 0x3F), 16B at 0x40, 2B at 0x50. One WRITE wraps at the boundary: bytes past 0x3F land back at page start, tearing both head and tail
() Two WRITEs — boundaries round up automatically
() Twenty WRITEs — one byte per operation mandatory
::: explanation
Page arithmetic is floor division from the start address: fill-to-boundary, then whole pages, then remainder. Wrapping punishes the lazy with self-overwriting data.
:::

::: quiz Slave demands CPOL=1, CPHA=0; master runs CPOL=0, CPHA=0. Symptom and fix?
() Works fine — modes are suggestions
(*) Every byte systematically wrong (sampled on the wrong edge of an inverted-idle clock); fix = master to mode 2 (CPOL 1, CPHA 0) — modes are contracts, mirrored exactly
() Increase baud to overpower the mismatch
() Swap MOSI and MISO instead
::: explanation
Mode errors are total (all bits, all bytes) not random — that signature diagnoses contracts, not noise. Mirror the slave's stated mode bit for bit.
:::
