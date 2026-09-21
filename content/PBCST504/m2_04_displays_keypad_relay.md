---
id: m2_04_displays_keypad_relay
courseCode: PBCST504
module: 2
sequence: 4
title: 'Displays, Keypad & Relay Outputs'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the pin-count problem in plain words first
  - Drive seven-segment, LCD, keypad, and relay with correct scanning logic
  - Budget current so pins survive
concepts:
  - seven-segment multiplexing
  - LCD interfacing
  - matrix keypad scanning
prerequisites:
  - m2_03_ide_hal_first_program_led
examRelevance: high
tags:
  - displays
  - keypad-relay
---
# Displays, Keypad & Relay Outputs

**What problem showing numbers and reading keys poses for few pins, how Seven-Segment multiplexing, Liquid-Crystal Display (LCD) commands, matrix keypad scanning, and relay driving each work, and what current limits protect the chip.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Four decimal digits need 28 LED segments but the chip has few free pins; sixteen keys need sixteen wires; a mains lamp needs lethal current no pin can give. The problem: display more with fewer pins, read many keys with few wires, and switch heavy loads safely. Answers: time-share the digits (multiplexing), speak serial-ish commands to an LCD controller, scan key rows against columns, and let a small pin drive a big relay switch.

Tiny beginner example. Price tag shows "12.50": four digits share 8 segment lines; the firmware lights digit 1 for 2 ms, digit 2 for 2 ms, and so on — eyes see all four steady (persistence of vision) while only one digit's current flows at a time.

Analogy as support, then dropped. Think of a teacher calling roll: one name at a time, fast enough that the class feels continuously attended. Segments are students, digits are roll calls. From here on we use exact terms only: common-anode/cathode, multiplexing, nibble commands, row-column scanning.

Abbreviations defined on first use: Liquid-Crystal Display (LCD), Light-Emitting Diode (LED). Symbols: digit-enable lines D1–D4, segment lines a–g.

| Question to ask | Meaning |
|---|---|
| What is multiplexed? | Digits share segment lines, enabled one at a time, fast |
| What does an LCD need? | Command + data bytes (RS line selects), enable pulse latches each |
| What is keypad ghosting? | False reads from multiple presses — diodes or disciplined scanning cure it |

::: toggle How does "common-cathode" wiring actually light a segment?
All segment LEDs in one digit share their negative legs (cathodes) at one common pin; each positive leg (anode) has its own segment line. Ground the common pin (digit enabled) and drive a segment line high, and only that segment's LED has both voltage across it — so it lights. Common-anode inverts everything (shared positive, segments pulled low to light).
:::

::: toggle What do RS and EN do on the LCD, signal by signal?
RS (Register Select): 0 means "the byte I'm sending is a command" (clear, move cursor), 1 means "it's a character to print" — same data wires, different meaning. EN (Enable): a high pulse that tells the controller "latch the byte now" — data sits on the pins, EN's falling edge commits it. RW tied low means write-only (saves a pin by giving up reading back).
:::

<a id="words-first"></a>
## 2. Words First — Output Vocabulary

| Device | Wiring idea | Plain meaning |
|---|---|---|
| **Seven-segment (common-cathode)** | 8 segment pins + 4 digit-enable pins | Segments shared; grounding one digit-enable lights only that digit's pattern |
| **16×2 LCD (HD44780-style)** | 4 data pins + RS + EN (+RW tied) | RS=0 sends commands (clear, cursor), RS=1 sends characters; EN pulse latches |
| **4×4 matrix keypad** | 4 row outputs + 4 column inputs | Drive one row low, read columns: low column = pressed key at (row, col) |
| **Relay module** | 1 logic pin (+VCC/GND) | Pin energises a coil that closes heavy contacts — logic controls mains with isolation |
| **Current budget** | ~8–20 mA per pin, ~100 mA total | Exceeding melts drivers: one digit at a time (multiplexing) and transistor/relay for heavies |

::: callout-intuition Core Mental Model: Roll Call Display
The firmware is the teacher calling four rolls per cycle: shout segments (one pattern), point at a digit (enable it), pause 2 ms, next. Sixteen keys become roll-call too: ask each row "who's down?" and listen on columns. Relays are the hall monitors — small authority (pin) commanding big gates (contacts).
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Scan Loops and Command Bytes

**Seven-seg multiplex loop (numbered):** (1) look up digit's segment byte from a 0–9 table; (2) write it to segment pins; (3) enable digit `i` only; (4) wait ~2 ms; (5) disable, advance `i`. Full 4-digit refresh ≈ 8 ms (125 Hz — flicker-free). Brightness = duty share: each digit glows 25% of the time, so segment current is sized up within pin limits.

**LCD 4-bit sequence:** init (function-set, display-on, clear, entry-mode commands with RS=0), then characters with RS=1, each byte sent as two nibbles with EN pulses. Two examinable facts: RW tied low (write-only saves a pin), and commands vs data differ only by RS — same wires, different meaning.

**Keypad scan (numbered):** (1) drive row 0 low, others high; (2) read 4 columns — low = key(row0, col); (3) repeat rows 1–3; (4) debounce (20 ms re-read) before accepting. 16 keys from 8 pins; ghosting on multi-press is the documented limit (exam honesty point).

**Relay + budget:** logic pin drives module transistor input (never the coil directly); contacts switch the load; flyback protection lives on the module. Pin budget check: segments 8 × ~10 mA shared one digit at a time ≈ fine; all-digits-at-once wiring would exceed totals — multiplexing is electrical necessity, not cleverness.

::: callout-formula KTU Formula Vault: Output Facts
Multiplex: shared segments + one enable at a time, ~2 ms/digit · LCD: RS selects command/data, EN latches, 4-bit = two nibbles · keypad: one row low, read columns, debounce · relay isolates logic from load · pin ~mA each, total ~100 mA.
:::

::: callout-pitfall Brightness Theft
Adding digits without quickening the loop dims all: fixed 8 ms budget split more ways. Flicker (slow loop) and dimness (too many digits per budget) are the two viva failure modes — quote the 2 ms/digit arithmetic.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Display "2026" on 4 multiplexed common-cathode digits. (a) Which digit enables when, with what segment bytes (table: 2=0x5B, 0=0x3F, 6=0x7D)? (b) Total refresh time at 2 ms/digit? (c) Keypad: row 2 driven low, column 1 reads low — which key?
:::

::: step [Step 2: Execution] Scanning and Decoding
(a) Cycle: segments 0x5B + D1, 0x3F + D2, 0x5B + D3, 0x7D + D4, 2 ms each. (b) 4 × 2 ms = 8 ms ≈ 125 Hz, flicker-free. (c) Key at (row 2, col 1) — the intersection of the driven row and the low column.
:::

::: step [Step 3: Conclusion] Final Result
One shared bus, four time slices, one decoded intersection — multiplexing and scanning are the same time-sharing idea applied to outputs and inputs.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Leaving all digit-enables on. Segments short across digits into garbage — one enable at a time, always.
- Sending LCD data with RS=0. Characters land as commands (display jumps/clears) — RS discipline first.
- Driving relay coils from pins. Coils exceed pin current and kick back voltage — module input only, isolation respected.

Exam recap: multiplex loop five steps with 2 ms math; LCD RS/EN/nibble facts; keypad scan four steps + debounce; relay isolation + current budget; common-anode inverts everything (cathode sinks, anode sources).

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Four multiplexed digits flicker visibly. Two candidate causes: loop too slow vs too many digits. How do you decide, and what is the fix arithmetic?
() Add more digits — brightness loves company
(*) Measure per-digit time: total refresh must stay ≈8 ms (125 Hz); flicker means slices too long — quicken to ~2 ms/digit or cut digits; dimness with speed means budget split too thin — raise segment current within pin limits
() Flicker is unavoidable in multiplexing
() Slow the loop for stability
::: explanation
Flicker is timing (slices too long), dimness is budget (too many slices). The 2 ms/digit, 8 ms/frame arithmetic diagnoses both — quote numbers, not adjectives.
:::

::: quiz LCD shows random jumps when printing text, but init looked fine. What single line causes this and why?
() EN pulse too strong — hardware damage
(*) Data sent with RS=0 (command mode): characters execute as commands (clear/shift/cursor jumps) — RS=1 selects data, RS=0 selects commands, same wires
() RW tied low breaks writing
() 4-bit mode cannot print text, only 8-bit can
::: explanation
RS is the meaning bit: identical bytes command or print depending on one line. "Jumps while printing" is the signature symptom — check RS before rechecking init.
:::

::: quiz Row 1 low, columns read 1011 (col 2 low). After 20 ms the same read repeats. Which key and why trust it now?
() Unknowable — keypads guess randomly
(*) Key at (row 1, col 2); the 20 ms re-read is debouncing — mechanical contacts bounce for milliseconds, so a stable repeat promotes a glitch to a press
() All keys in row 1 simultaneously
() Column 2 is broken; ignore it
::: explanation
Intersection names the key; repetition names the confidence. Debounce converts physics (bouncing metal) into clean digital truth — always name both halves.
:::
