# Modulation: ASK, FSK, PSK & QAM

**Why baseband can't travel, amplitude/frequency/phase keying, constellation diagrams, baud vs. bit rate, and QAM arithmetic.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Semaphore Flags at Night
Daylight flag signals (baseband digital pulses) work line-of-sight — but you can't wave flags through a storm or across an ocean. Instead you mount a **lantern** (carrier wave) on the tower and modulate *it*: brightness steps (**ASK**), color swaps (**FSK**), or timing shifts of the blink (**PSK**). Combine brightness × timing grids and one blink carries a whole syllable (**QAM**). Modulation is always the same trick: graft fragile digital distinctions onto a rugged analog carrier built for the medium.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Why Modulate at All

Baseband pulses need a clean wired path and radiate terribly from antennas (efficient radiation needs antennas ~ wavelength scale — kHz digital pulses would want kilometer antennas). Shifting the signal onto a high-frequency carrier solves propagation; *varying* the carrier encodes the bits.

### 2.2 The Three Keyings (+1 Combination)

* **ASK** (amplitude-shift keying): bit $\to$ carrier amplitude (on/off simplest). Cheap, fragile — noise attacks amplitude first.
* **FSK** (frequency-shift keying): bit $\to$ one of two frequencies. Robust to amplitude noise; burns bandwidth (two carriers' worth).
* **PSK** (phase-shift keying): bit $\to$ carrier phase ($0°/180°$ for BPSK). Best noise immunity of the three — noise must rotate phase, not just nudge height.
* **QAM** (quadrature amplitude modulation): **ASK × PSK grid** — constellation points spread over amplitude *and* phase. QAM-$N$ packs $\log_2 N$ bits per symbol (QAM-16: 4 bits/baud; QAM-64: 6 bits/baud) at the price of ever-tighter decision regions.

### 2.3 Baud vs. Bit Rate (the Eternal Confusion)

**Baud** = symbols (signal changes) per second. **Bit rate** = baud × bits-per-symbol:

$$R = S \times \log_2 N$$

A 2400-baud QAM-16 line moves $2400 \times 4 = 9600$ bps. Raising *baud* needs more bandwidth; raising *bits-per-symbol* needs cleaner SNR (denser constellation, same Nyquist/Shannon ceilings from last topic — everything connects).

::: callout-formula KTU Formula Vault: Modulation Facts
ASK = **amplitude** (fragile) · FSK = **frequency** (bandwidth-hungry) · PSK = **phase** (toughest) · QAM-$N$ = **$\log_2 N$ bits/symbol** · $R = S \times \log_2 N$ · baud = **symbols/s**, bit rate = **data/s** — different units, different questions.
:::

::: callout-pitfall Baud Is Not Bit Rate (Unless Binary)
"2400 baud = 2400 bps" holds *only* for 2-level signaling (1 bit/symbol). The moment the constellation holds 4+ points, bit rate exceeds baud rate — and the exam's favorite wrong answer is exactly the baud number offered as the bit rate. Multiply by $\log_2 N$ first, answer second.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

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

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
