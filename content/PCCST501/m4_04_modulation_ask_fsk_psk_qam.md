---
id: m4_04_modulation_ask_fsk_psk_qam
courseCode: PCCST501
module: 4
sequence: 4
title: 'Modulation: ASK, FSK, PSK & QAM'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Match ASK, FSK, and PSK to their noise trade-offs
  - Pack bits per symbol on QAM constellations
  - Never confuse baud with bit rate except for binary
  - Self-test with the exam recap and active-recall checklist
concepts:
  - ASK/FSK/PSK
  - QAM
  - baud rate
prerequisites:
  - m4_02_nyquist_shannon_channel_capacity
examRelevance: high
tags:
  - modulation
  - qam
---
# Modulation: ASK, FSK, PSK & QAM

**Why baseband can't travel, amplitude/frequency/phase keying, constellation diagrams, baud vs. bit rate, and QAM arithmetic.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

Digital pulses (baseband) radiate terribly from antennas — efficient radiation needs antennas near the wavelength scale, so kilohertz pulses would want kilometer antennas — and they die quickly on long wired runs. The fix: mount the bits on a rugged high-frequency **carrier wave** built for the medium, varying one of its properties to encode data.

The problem before the solution: choose *which* carrier property to vary (amplitude, frequency, phase — each with a noise/bandwidth price) and how many bits to pack per symbol (constellation density, policed by SNR — Signal-to-Noise Ratio).

::: callout-intuition Core Mental Model: Semaphore Flags at Night
Daylight flag signals (baseband digital pulses) work line-of-sight — but you can't wave flags through a storm or across an ocean. Instead you mount a **lantern** (carrier wave) on the tower and modulate *it*: brightness steps (**ASK** — Amplitude-Shift Keying), color swaps (**FSK** — Frequency-Shift Keying), or timing shifts of the blink (**PSK** — Phase-Shift Keying). Combine brightness × timing grids and one blink carries a whole syllable (**QAM** — Quadrature Amplitude Modulation). Modulation is always the same trick: graft fragile digital distinctions onto a rugged analog carrier built for the medium.

Dropping the lantern now: carrier = high-frequency wave; symbol = one modulated unit; baud = symbols/sec; constellation = the grid of legal symbol states.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Carrier wave** | The high-frequency analog wave whose properties are varied to carry bits. |
| **ASK (Amplitude-Shift Keying)** | Bit → carrier amplitude (on/off simplest). Cheap, fragile — noise attacks amplitude first. |
| **FSK (Frequency-Shift Keying)** | Bit → one of two frequencies. Robust to amplitude noise; burns bandwidth. |
| **PSK (Phase-Shift Keying)** | Bit → carrier phase ($0°/180°$ for BPSK — Binary PSK). Toughest of the three. |
| **QAM (Quadrature Amplitude Modulation)** | ASK × PSK grid: constellation of $N$ points packing $\log_2 N$ bits per symbol (QAM-16: 4; QAM-64: 6). |
| **Constellation diagram** | The amplitude–phase grid of legal symbols; denser = more bits per symbol, tighter decision regions. |
| **Baud ($S$, symbols/sec)** | Signal changes per second — needs bandwidth. Distinct from bit rate $R = S \times \log_2 N$. |

<a id="the-math"></a>
## 3. Purpose — Why Modulate, Three Keyings, Baud Math

### 3.1 Why Modulate at All

Baseband pulses need a clean wired path and radiate terribly from antennas (efficient radiation needs antennas ~ wavelength scale — kHz digital pulses would want kilometer antennas). Shifting the signal onto a high-frequency carrier solves propagation; *varying* the carrier encodes the bits.

### 3.2 The Three Keyings (+1 Combination)

* **ASK** (amplitude-shift keying): bit $\to$ carrier amplitude (on/off simplest). Cheap, fragile — noise attacks amplitude first.
* **FSK** (frequency-shift keying): bit $\to$ one of two frequencies. Robust to amplitude noise; burns bandwidth (two carriers' worth).
* **PSK** (phase-shift keying): bit $\to$ carrier phase ($0°/180°$ for BPSK). Best noise immunity of the three — noise must rotate phase, not just nudge height.
* **QAM** (quadrature amplitude modulation): **ASK × PSK grid** — constellation points spread over amplitude *and* phase. QAM-$N$ packs $\log_2 N$ bits per symbol (QAM-16: 4 bits/baud; QAM-64: 6 bits/baud) at the price of ever-tighter decision regions.

### 3.3 Baud vs. Bit Rate (the Eternal Confusion), Symbol by Symbol

**Baud** $S$ = symbols (signal changes) per second. **Bit rate** $R$ = baud × bits-per-symbol, with $N$ = constellation points:

$$R = S \times \log_2 N$$

A 2400-baud QAM-16 line moves $2400 \times 4 = 9600$ bps. Raising *baud* needs more bandwidth; raising *bits-per-symbol* needs cleaner SNR (denser constellation, same Nyquist/Shannon ceilings from last topic — everything connects).

::: callout-formula KTU Formula Vault: Modulation Facts
ASK = **amplitude** (fragile) · FSK = **frequency** (bandwidth-hungry) · PSK = **phase** (toughest) · QAM-$N$ = **$\log_2 N$ bits/symbol** · $R = S \times \log_2 N$ · baud = **symbols/s**, bit rate = **data/s** — different units, different questions.
:::

::: callout-pitfall Baud Is Not Bit Rate (Unless Binary)
"2400 baud = 2400 bps" holds *only* for 2-level signaling (1 bit/symbol). The moment the constellation holds 4+ points, bit rate exceeds baud rate — and the exam's favorite wrong answer is exactly the baud number offered as the bit rate. Multiply by $\log_2 N$ first, answer second.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

1200 baud, QPSK (4 phases): $\log_2 4 = 2$ bits/symbol → $R = 2400$ bps. Same 1200 baud, BPSK ($N = 2$): $R = 1200$ bps — here, and only here, baud equals bit rate.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
A modem operates at $2400$ baud. (a) Bit rate with QPSK (4 phases)? (b) With QAM-64? (c) Which needs the cleaner line, and how does this relate to the Shannon ceiling?
:::

::: step [Step 2: Execution] Multiplying Symbols to Bits
(a) QPSK: $\log_2 4 = 2$ bits/symbol → $R = 2400 \times 2 = 4800$ bps.
(b) QAM-64: $\log_2 64 = 6$ bits/symbol → $R = 2400 \times 6 = 14{,}400$ bps — triple the data on the identical baud (bandwidth).
(c) QAM-64's 64-point constellation has far tighter decision regions — it demands much higher SNR. Shannon caps the exchange: bits/symbol can only rise while $B\log_2(1+\text{SNR})$ keeps up.
:::

::: step [Step 3: Conclusion] Final Result
Same wire, same baud, $3\times$ the throughput — bought purely with SNR. Modulation design is the art of spending signal quality on bits, with Shannon auditing every purchase.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Baud vs. bit rate | Symbols/s vs. $S\log_2N$ data/s — equal only for binary. |
| ASK vs. FSK vs. PSK | Amplitude (fragile) vs. frequency (hungry) vs. phase (toughest). |
| Raising baud vs. raising density | Costs bandwidth vs. costs SNR (Shannon polices the second). |
| Baseband vs. carrier | Raw pulses (short hops) vs. modulated carrier (propagation-grade). |

**Watch out:** (1) Answering the baud number as the bit rate — multiply first. (2) "Denser constellations are free throughput" — density without SNR manufactures errors. (3) Ranking ASK toughest — amplitude is noise's first victim.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Modulate because baseband can't propagate (antenna/wavelength physics). ASK = amplitude (fragile), FSK = frequency (hungry), PSK = phase (toughest); QAM-$N$ = $\log_2N$ bits/symbol on an ASK×PSK grid. $R = S\log_2N$; baud = symbols/s. Density trades SNR, audited by Shannon.
:::

**Active-recall checklist:** Why can't baseband cross an ocean? Rank the three keyings with reasons. Compute $R$ for 2400-baud QAM-16. What polices constellation density?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz A line runs at 1200 baud using 8-PSK. What is the bit rate, and why isn't it 1200 bps?
() 1200 bps — baud always equals bit rate by definition
(*) 3600 bps — each symbol carries log₂8 = 3 bits (8 phases), so R = 1200 × 3; baud counts symbols, not bits
() 9600 bps — multiply baud by 8 directly
() Bit rate cannot be determined without the cable length
::: explanation
Eight distinct phases = 3 bits per symbol decision. $R = S \times \log_2 N = 1200 \times 3 = 3600$ bps. "Baud = bps" is true only for binary ($N=2$) signaling — the trap answer in every modulation question.
:::

::: quiz Rank ASK, FSK, and BPSK by noise robustness, with the physical reason.
() ASK > FSK > BPSK — amplitude is easiest to measure precisely
(*) BPSK > FSK > ASK — noise most easily corrupts amplitude (ASK's only dimension), frequency hops survive amplitude hits, and 180° phase flips need the largest disturbance to confuse
() FSK > BPSK > ASK — bandwidth usage equals robustness
() All three are equally robust by design
::: explanation
Noise adds amplitude jitter for free — ASK, encoding *in* amplitude, suffers most. FSK decides by frequency presence, shrugging off amplitude hits. BPSK's antipodal ($180°$) symbols sit maximally apart in signal space, needing the biggest kick to cross the decision boundary.
:::

::: quiz QAM-256 promises 8 bits per symbol. What hidden cost grows with constellation density, and which law polices it?
() Cost: longer cables required; policed by Ohm's law
(*) Cost: decision regions shrink, demanding ever-higher SNR for the same error rate; Shannon's B·log₂(1+SNR) caps the trade — density without SNR buys errors, not throughput
() Cost: slower processors; policed by Moore's law
() No cost exists; density is always free throughput
::: explanation
256 points cram 8 bits into one symbol *only if* the receiver can still tell neighbors apart — at fixed noise, denser means more misreads. Shannon converts the wish into arithmetic: bits/symbol beyond what SNR supports just manufacture errors. Spend SNR, get bits; no SNR, no bits.
:::
