---
id: m3_05_can_usb
courseCode: PBCST504
module: 3
sequence: 5
title: 'CAN Networking & USB HID'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what multi-master arbitration buys in plain words first
  - Trace a CAN frame winning the bus by identifier
  - Place USB HID as the human-interface shortcut
concepts:
  - CAN arbitration
  - multi-STM32 CAN link
  - USB HID class
prerequisites:
  - m3_04_spi_eeprom
examRelevance: high
tags:
  - can-bus
  - usb-hid
---
# CAN Networking & USB HID

**What problem cars-full-of-controllers pose, how Controller Area Network (CAN) identifiers arbitrate without a master, how two STM32s exchange frames, and where Universal Serial Bus Human Interface Device (USB HID) class shortcuts custom drivers.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A car has 50 controllers sharing sensor news; any wiring hub is a single point of failure. The problem: let equals talk as equals, with urgent news automatically winning collisions. CAN's answer: every frame carries an identifier that is also its priority — losers back off mid-bit, winners never retry.

Tiny beginner example. Brake controller sends ID `0x100`, cabin light sends `0x200` simultaneously. Bit-by-bit, `0x100`'s earlier zero-bit dominates (wired-AND: zero beats one); light controller sees the mismatch, stops, retries later. Brake news wins without a master, without wasting the frame.

Analogy as support, then dropped. Think of polite debaters with numbered badges: lower number interrupts legitimately, higher number yields mid-sentence, the sentence itself survives intact. From here on we use exact terms only: identifier arbitration, dominant/recessive bits, differential pair.

Abbreviations defined on first use: Controller Area Network (CAN), Human Interface Device (HID), Cyclic Redundancy Check (CRC). Symbols: 0 = dominant (wins), 1 = recessive (yields).

| Question to ask | Meaning |
|---|---|
| What is arbitration? | Collision resolution during transmission: lowest ID continues, rest retry |
| What wires? | CANH/CANL differential pair + 120 Ω terminators at both ends — noise cancels, ends absorb reflections |
| What is HID? | USB device class for keyboards/mice/joysticks: OS drivers built-in, no custom driver needed |

::: toggle What do "dominant", "recessive", "DLC", and "CRC" mean in a CAN frame?
Dominant (0) = the bus state that wins collisions (driven strongly); recessive (1) = the state that yields (overridden by any dominant). DLC (Data Length Code) = 4 bits declaring how many data bytes (0–8) follow — receivers know where data ends. CRC = check bits the transmitter computes over the frame; every receiver recomputes and rejects mismatches (corrupted frames die on the bus, and the ACK slot confirms at least one node accepted).
:::

::: toggle What is a "report descriptor" in USB HID?
A data table the device hands the PC at plug-in, declaring "I am a keyboard with these keys" (or sensor pages with these fields). The OS matches it to built-in drivers — no install needed. Change the descriptor and the same hardware appears as a joystick instead: identity is declared, not soldered.
:::

<a id="words-first"></a>
## 2. Words First — CAN/USB Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **CAN frame (ID + DLC + data + CRC)** | Identifier (priority + meaning), length code, 0–8 data bytes, CRC + ACK slot — error-checked and acknowledged by all receivers. |
| **Standard vs extended ID** | 11-bit vs 29-bit identifiers — longer names, same arbitration rule (lower wins). |
| **Multi-STM32 link** | Each board: CAN peripheral + transceiver chip (converts logic to differential) + shared twisted pair + two terminators. |
| **Filters/masks** | Hardware whitelists: each node receives only interesting IDs into buffers — CPU never wades through all traffic. |
| **USB HID shortcut** | Describe keys/sensors in a report descriptor; the PC recognises a keyboard/joystick instantly — custom PC drivers avoided. |

::: callout-intuition Core Mental Model: Badged Debate Plus Instant Disguise
CAN debaters wear priority badges and yield mid-word to lower numbers — urgency is the address. USB HID is a costume trunk: dress your gadget as a keyboard and every PC already knows the lines. Priority by identity; compatibility by disguise.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Arbitration and Reports

**Arbitration, bit-exact:** all transmitters drive ID bits together on the wired-AND bus; each compares driven vs seen; first mismatch where a node sent 1 but sees 0 eliminates it (it stops, no corruption — the winner's frame is intact). Lowest numerical ID always wins; identical IDs from two nodes corrupt data (design rule: IDs unique system-wide). Bit rates (e.g. 500 kbit/s cars, 1 Mbit/s short runs) must match on all nodes — same baud-contract moral as UART.

**Two-STM32 exchange (numbered):** (1) both boards: transceiver + 120 Ω terminators fitted, same bit rate; (2) filters accept the partner's TX ID; (3) board A transmits ID `0x100` + 2 data bytes; (4) board B's filter matches, interrupt fires, data read; (5) ACK slot auto-acknowledged on the bus. Scope proof: differential pair swinging opposite, clean bit edges at the chosen rate.

**USB HID honestly:** report descriptors declare "I am a keyboard with these keys" (or vendor-defined sensor pages); endpoints push reports on change; no PC-side driver install. Limits: HID bandwidth/polling rates suit human speeds, not video — class convenience trades throughput. Custom classes need custom drivers (the shortcut's boundary).

::: callout-formula KTU Formula Vault: CAN/USB Facts
CAN = IDs arbitrate (lower wins), wired-AND, differential + terminators · frame = ID + DLC + data + CRC/ACK · filters whitelist per node · bit rates must match · HID = disguise as keyboard/joystick, descriptors declare, drivers built-in.
:::

::: callout-pitfall Missing Terminator
One forgotten 120 Ω resistor reflects bits into garbage that looks like baud mismatch. Terminate both physical ends always — topology first, registers second.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Nodes X (ID 0x100) and Y (ID 0x180) start together. (a) Who wins and at which ID bit? (b) Two STM32s must exchange a 2-byte temperature: list the five setup/exchange moves. (c) A custom sensor needs PC display with zero driver installs — which USB path?
:::

::: step [Step 2: Execution] Bits and Moves
(a) `0x100` = 001…, `0x180` = 0011…: bits equal until the position where X has 0 and Y has 1 — X's dominant 0 wins there; Y backs off, frame intact. (b) Transceivers + terminators + matched rate; filters for partner ID; A transmits; B interrupt-reads; bus auto-ACKs. (c) USB HID with a report descriptor (keyboard/sensor page) — OS drivers already aboard.
:::

::: step [Step 3: Conclusion] Final Result
Priority is arithmetic on identifiers; exchange is five disciplined moves; HID is compatibility by standard disguise — three different answers to "how do equals cooperate."
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Reusing one ID on two nodes. Arbitration saves priority, not data — duplicate IDs garble payloads both send together.
- Mismatched bit rates "almost working." CAN samples cooperatively; rate mismatch is total failure, not degradation.
- Expecting HID for bulk transfer. Human-rate reports only — bulk needs other classes with real drivers.

Exam recap: dominant-zero arbitration with mid-frame backoff; ID unique + lowest wins; differential/terminator physics; frame fields; filter whitelists; matched rates; HID descriptor disguise with throughput limits.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz IDs 0x100 and 0x180 collide. Winner, deciding bit, and what the loser does — precisely.
() Higher ID wins by seniority; loser reboots
(*) 0x100 wins at the first bit where X drives 0 against Y's 1 (dominant beats recessive); Y stops transmitting immediately, waits for bus idle, retries — winner's frame never corrupted, loser never wastes it
() Both frames merge into 0x180
() Arbitration needs a master referee chip
::: explanation
Wired-AND decides mid-bit: zeros dominate, losers yield gracefully. "Lower wins, gracefully" is the whole arbitration sentence — priority and politeness in one mechanism.
:::

::: quiz CAN link silent though code transmits. Topology checks before register checks — list them.
() Rewrite the driver first; hardware is innocent
(*) Terminators fitted at both ends? Differential pair (CANH/CANL) correct, not swapped? Transceiver powered? Bit rates identical on all nodes? — physics and contracts before code, always
() Increase transmit power in software
() CAN needs no transceivers on STM32
::: explanation
Silent buses are wiring/contract failures first: reflections (terminators), polarity (pair), power (transceiver), rate (match). Registers come after the medium is proven.
:::

::: quiz PC must show sensor values with no driver install allowed. Which USB route and what declares the device's identity?
() Custom bulk class — drivers install themselves
(*) HID class with a report descriptor declaring keys/sensor pages: the OS already drives HID, so the gadget is recognised instantly; custom classes would need forbidden drivers
() UART disguised as USB by baud rate
() USB cannot carry sensor data by standard
::: explanation
Class is the disguise, descriptor the lines: standard class ⇒ built-in driver. The boundary is throughput (human rates) — name both the win and its limit.
:::
