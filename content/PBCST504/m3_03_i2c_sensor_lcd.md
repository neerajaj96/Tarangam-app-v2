---
id: m3_03_i2c_sensor_lcd
courseCode: PBCST504
module: 3
sequence: 3
title: 'I2C: Sensor + LCD Project'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State what two wires plus addresses buy in plain words first
  - Run start, address, ACK, data, stop on a temperature sensor
  - Hang an LCD on the same bus correctly
concepts:
  - I2C framing
  - sensor readout
  - shared bus expansion
prerequisites:
  - m3_02_usart
examRelevance: high
tags:
  - i2c
  - temp-sensor
---
# I2C: Sensor + LCD Project

**What problem two-wire multi-device control solves, how Inter-Integrated Circuit (I2C) start/address/ACK/stop framing works, how a temperature sensor is read byte by byte, and how an LCD shares the same two wires.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A board hosts a temperature sensor, an LCD, and a clock chip — six wires for UART pairs is wasteful. The problem: share two wires among many slow devices, each answering only its own name. I2C's answer: one data line (SDA), one clock line (SCL), 7-bit addresses, and strict turn-taking (master clocks, addressed slave answers).

Tiny beginner example. Master reads sensor at address `0x48`: START, send `0x48`+read-bit, sensor ACKs, sensor sends two data bytes (master ACKs first, NACKs last), STOP. LCD at `0x27` naps through all of it — wrong name, no reply.

Analogy as support, then dropped. Think of a classroom: teacher (master) calls a name (address); named student answers; rest stay silent. The clock is the teacher's hand claps pacing every word. From here on we use exact terms only: START/STOP conditions, ACK/NACK, 7-bit address, pull-ups.

Abbreviations defined on first use: Serial Data (SDA), Serial Clock (SCL), Acknowledge (ACK), Not-Acknowledge (NACK). Symbols: R/W bit (1 = read, 0 = write).

| Question to ask | Meaning |
|---|---|
| Why pull-up resistors? | Both lines are open-drain: devices pull low only; resistors restore high — no resistor, no high, no bus |
| What is clock stretching? | Slow slave holds SCL low to pause the master — flow control built into the clock |
| What ends a read? | Master NACKs the last byte, then STOP — NACK means "no more wanted" |

<a id="words-first"></a>
## 2. Words First — I2C Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **START / STOP conditions** | SDA falling while SCL high (START), SDA rising while SCL high (STOP) — the only legal framing marks. |
| **Address + R/W byte** | 7 address bits + 1 direction bit; every slave compares, one ACKs. |
| **ACK/NACK per byte** | Receiver pulls SDA low (ACK = "more please") or leaves high (NACK = "done/error") after each byte. |
| **Temperature transaction** | Write pointer register, repeated-START, read two bytes, convert (LSB weight e.g. 0.0625 °C/bit) — pointer then payload. |
| **LCD on I2C (expander backpack)** | PCF8574-style expander maps I2C bytes to the LCD's RS/EN/data pins — same M2.04 commands, new transport. |

::: callout-intuition Core Mental Model: Classroom Roll Call
The master-teacher claps (SCL) and calls names (address+R/W). The named student speaks one word per clap (bytes), nodding (ACK) until the teacher shakes head (NACK) and dismisses class (STOP). Silence from a wrong name is correct behaviour, not failure.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Bytes on the Bus

**Full temperature read (numbered transaction):** (1) START; (2) send `0x48<<1|0` (address + write), ACK; (3) send pointer register (e.g. `0x00` = temperature), ACK; (4) repeated-START (bus stays owned); (5) send `0x48<<1|1` (address + read), ACK; (6) read byte 1, master ACKs; (7) read byte 2, master NACKs; (8) STOP. Convert: raw >> 4 × 0.0625 °C (12-bit left-justified typical) — read the sensor's datasheet for exact weights, never guess.

**Rules that bite:** exactly one master normally (multi-master arbitration exists, out of scope — name it, don't design it); 7-bit addresses collide if two identical sensors share defaults (fix: address pins/variants); bus capacitance caps speed × length (400 kHz fast-mode over short PCB traces, not metres of cable); missing pull-ups = dead bus (both lines float nowhere).

**LCD sharing:** expander backpack at its own address receives command/data bytes whose bits drive RS/EN/D4–D7 — M2.04's sequence rides I2C payloads unchanged. Two devices, two wires, zero extra pins versus parallel LCD + sensor.

::: callout-formula KTU Formula Vault: I2C Facts
SDA + SCL + pull-ups · START/STOP = SDA moves while SCL high · address+R/W, ACK every byte · read ends NACK + STOP · sensor = pointer write + repeated-START + read + datasheet weights · pull-ups mandatory, addresses unique.
:::

::: callout-pitfall NACK Panic
A NACK after the address byte means "nobody home" (wrong address, sleeping/unpowered slave, missing pull-ups) — debug identity and power before protocol. A NACK after the last data byte is correct termination. Same signal, opposite meanings by position.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Sensor at `0x48` returns bytes `0x19`, `0x00` (12-bit left-justified, 0.0625 °C/LSB). (a) List the 8 transaction phases. (b) Temperature? (c) LCD backpack at `0x27` — does it disturb the read?
:::

::: step [Step 2: Execution] Phases and Weights
(a) START → addr+W+ACK → pointer+ACK → re-START → addr+R+ACK → byte1+ACK → byte2+NACK → STOP. (b) Raw `0x1900` >> 4 = `0x190` = 400; 400 × 0.0625 = 25.0 °C. (c) No: `0x27 ≠ 0x48`, it stays silent — addressing is the sharing. (Arithmetic verified.)
:::

::: step [Step 3: Conclusion] Final Result
Eight phases, one shift, one multiply, one silent neighbour — I2C reads are choreography plus datasheet weights, and sharing costs nothing but unique addresses.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Skipping the pointer write. Sensors have many registers; reading without selecting returns whatever register was last — stale data wearing fresh timing.
- Forgetting pull-ups. Open-drain lines without resistors never rise — the whole bus reads stuck-low.
- Assuming LSB weights. 0.0625 °C/bit is one sensor's truth; every weight comes from its datasheet.

Exam recap: two wires + pull-ups; START/STOP shapes; address+R/W + per-byte ACK; NACK-then-STOP termination; pointer-then-read pattern; weights from datasheets; LCD-via-expander sharing.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Master sends address 0x48+W and gets NACK. Three causes in debug order?
() Slow down the CPU — speed causes NACKs
(*) (1) No slave at 0x48 (wrong address/shifted 8-bit form); (2) sensor unpowered/asleep; (3) missing pull-ups (SDA stuck low reads as NACK-ish failure) — identity, power, then physics
() Send more STOPs to encourage ACKs
() NACKs are always correct; ignore them
::: explanation
Address-phase NACK is absence evidence: nobody home, nobody awake, or no medium. The order (name → power → wires) mirrors fix cost from seconds to minutes.
:::

::: quiz Read returns bytes but temperature is 4× too high. Sensor is 12-bit left-justified, code multiplies raw by 0.0625 directly. Find the bug.
() Sensor broken; replace it
(*) Missing `>> 4`: raw `0x1900` = 6400 × 0.0625 = 400 °C; shifted `0x190` = 400 × 0.0625 = 25 °C — left-justified data must be right-aligned before weighting
() I2C is too slow for temperature
() 0.0625 is the wrong constant universally
::: explanation
Justification is part of the format: low bits are fraction padding, not data. Datasheet layout first, arithmetic second — weights apply to aligned values only.
:::

::: quiz Same two wires must also drive an LCD. What is added in hardware and what changes in the LCD command sequence?
() Four more wires; commands double in length
(*) One expander backpack (own address, e.g. 0x27) mapping I2C bytes to RS/EN/data pins; the M2.04 command/data sequence rides unchanged as payload — transport swapped, language identical
() LCDs cannot share buses by physics
() The sensor must be removed first
::: explanation
Addressing is the expansion slot: new device, new name, same two wires. Protocol layers separate — I2C carries, HD44780-commands speak — so reuse is exact, not approximate.
:::
