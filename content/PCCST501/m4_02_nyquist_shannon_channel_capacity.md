---
id: m4_02_nyquist_shannon_channel_capacity
courseCode: PCCST501
module: 4
sequence: 2
title: 'Channel Capacity: Nyquist & Shannon Limits'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Compute noiseless ceilings with Nyquist levels math
  - Convert decibels before applying Shannon capacity
  - Take the minimum of both laws as the binding limit
  - Self-test with the exam recap and active-recall checklist
concepts:
  - Nyquist limit
  - Shannon capacity
  - SNR
prerequisites: []
examRelevance: high
tags:
  - capacity
  - shannon
---
# Channel Capacity: Nyquist & Shannon Limits

**Noiseless signaling ceilings, noisy-channel capacity, SNR in decibels, and the two worked numericals that anchor every exam.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

A telephone wire, a radio band, a fiber — each can carry only so many bits per second, no matter how clever the modem. Two separate ceilings set the limit: how fast you can *symbol* (bandwidth × distinguishable levels) and how much *noise* lets survive (bandwidth × signal quality). Your actual rate is whichever ceiling is lower.

The problem before the solution: given a channel's bandwidth, signaling levels, and noise, compute the fastest *error-free* rate — and know which of the two laws binds, because exams deliberately arrange for either to win.

::: callout-intuition Core Mental Model: Shouting Across a Noisy Room
How fast can you convey information by shouting? Two separate ceilings: first, your **mouth speed** — syllables per second cap raw symbols no matter how perfect the silence (**Nyquist**: bandwidth × levels). Second, the **room noise** — in a quiet library you can whisper fine shades of meaning, but at a rock concert only crude yells survive (**Shannon**: bandwidth × log of signal-to-noise). Your actual rate is whichever ceiling is *lower* — physics grants no third option.

Dropping the room now: $B$ = bandwidth in Hz; $L$ = discrete signal levels; SNR (Signal-to-Noise Ratio) = signal power ÷ noise power (linear); dB (decibels) = $10\log_{10}$ of that ratio.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Bandwidth $B$ (Hz)** | The width of frequencies the channel passes — the raw symbol-speed budget. |
| **Signal levels $L$** | Count of distinguishable symbol values; each symbol carries $\log_2 L$ bits. Binary = $L = 2$. |
| **SNR (Signal-to-Noise Ratio)** | Signal power ÷ noise power, **linear** (e.g. 1000). Shannon needs this form. |
| **SNR in dB (decibels)** | $10 \log_{10}(\text{SNR})$: $10$ dB $= 10\times$, $20$ dB $= 100\times$, $30$ dB $= 1000\times$. Convert *before* Shannon. |
| **Nyquist bit rate** | Noiseless ceiling $C = 2B\log_2 L$ — assumes perfection. |
| **Shannon capacity** | Noisy law $C = B\log_2(1+\text{SNR})$ — no error-free scheme exceeds it; schemes exist approaching it arbitrarily closely (at unbounded coding effort). |

<a id="the-math"></a>
## 3. Purpose — Both Laws, Symbol by Symbol, Then the Verdict Rule

### 3.1 Nyquist: The Noiseless Ceiling

For a **noiseless** channel of bandwidth $B$ Hz using $L$ discrete signal levels:

$$C_{Nyquist} = 2B \log_2 L \quad \text{bits/sec}$$

Symbols: $2B$ = maximum symbol rate (baud) the bandwidth supports; $\log_2 L$ = bits packed per symbol. More levels pack more bits per symbol ($\log_2 L$), but levels must stay distinguishable — noise (ignored here) is exactly what caps $L$ in practice. Binary ($L=2$): $C = 2B$.

### 3.2 Shannon: The Noisy Truth

For bandwidth $B$ with signal-to-noise ratio $\text{SNR}$ (linear, not dB):

$$C_{Shannon} = B \log_2(1 + \text{SNR}) \quad \text{bits/sec}$$

Decibel conversion (the step everyone fumbles): $\text{SNR}_{dB} = 10 \log_{10}(\text{SNR})$, so $30$ dB $\Rightarrow$ SNR $= 1000$, $20$ dB $\Rightarrow 100$, $10$ dB $\Rightarrow 10$. Shannon is the *law*: no coding scheme, however clever, sustains error-free transmission above $C$ — and codes exist approaching it arbitrarily closely.

### 3.3 Using Them Together

Nyquist assumes perfection (upper bound under ideal conditions); Shannon accounts for noise (the binding bound in practice). Given $B$, levels, and SNR, compute **both** — the achievable rate is $\min(\text{Nyquist}, \text{Shannon})$.

::: callout-formula KTU Formula Vault: The Two Laws
Nyquist (noiseless): **$2B\log_2 L$** · Shannon (noisy): **$B\log_2(1+SNR)$** · dB: **$10\log_{10}$** (30 dB = 1000×) · answer = **min of the two**. If the question gives SNR in dB, convert *first* — the #1 mark-loser.
:::

::: callout-pitfall Levels Are Not Free (and dB Is Logarithmic)
Doubling levels adds only *one* bit per symbol ($\log_2$) while halving noise margin — more levels help only while the receiver can still tell them apart. And $30$ dB is not "three times" $10$ dB: it is $1000\times$ vs $10\times$ power ratio. Linear intuition on logarithmic units fails every time.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

$B = 1$ Hz, binary ($L = 2$): Nyquist $= 2 \times 1 \times 1 = 2$ bps. With $0$ dB SNR (signal = noise, SNR $= 1$): Shannon $= 1 \times \log_2 2 = 1$ bps. Verdict: $\min(2, 1) = 1$ bps — noise binds even in this toy room.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
A $3$ kHz telephone channel: (a) noiseless, binary signaling — max rate? (b) noiseless, 8 levels — max rate? (c) with $30$ dB SNR — Shannon capacity? (d) binding limit?
:::

::: step [Step 2: Execution] Computing Both Ceilings
(a) Nyquist: $2 \times 3000 \times \log_2 2 = 6000$ bps $= 6$ kbps.
(b) Nyquist: $2 \times 3000 \times \log_2 8 = 6000 \times 3 = 18{,}000$ bps $= 18$ kbps.
(c) SNR $= 10^{30/10} = 1000$. Shannon: $3000 \times \log_2(1001) \approx 3000 \times 9.97 \approx 29{,}902$ bps $\approx 30$ kbps.
(d) Noiseless claims (6 / 18 kbps) assume perfection; with real $30$ dB noise the Shannon $30$ kbps binds above the 8-level Nyquist $18$ kbps — so 8-level signaling at $18$ kbps is achievable, and no scheme on this line exceeds $\approx 30$ kbps error-free.
:::

::: step [Step 3: Conclusion] Final Result
Three numbers, one verdict: levels buy linear-ish gains (6 → 18 kbps), noise sets the absolute roof ($\approx 30$ kbps here). Every capacity question in the exam is this exact dance — convert dB, compute both laws, take the min.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Nyquist vs. Shannon | Noiseless ideal ($2B\log_2L$) vs. noisy law ($B\log_2(1+SNR)$); answer = min. |
| dB vs. linear SNR | Logarithmic label vs. the ratio Shannon eats — convert first. |
| Levels vs. capacity | $\log_2$ gains per doubling, policed by noise margin and Shannon. |
| Approaching vs. beating $C$ | Codes close the gap (turbo/LDPC/polar) — none crosses the ceiling error-free. |

**Watch out:** (1) Plugging dB directly into $\log_2(1+SNR)$ — the #1 mark-loser. (2) Reporting one law and stopping — either can bind. (3) "Infinite levels, infinite capacity" — Shannon overrules levels via SNR.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Nyquist $2B\log_2L$ (noiseless); Shannon $B\log_2(1+SNR)$ (noisy law); dB $= 10\log_{10}$ (convert first: 10/20/30 dB → 10/100/1000). Verdict = min of both. Levels add bits logarithmically and cost noise margin; codes approach $C$, never exceed it error-free.
:::

**Active-recall checklist:** What are the units of each symbol? Convert 25 dB to linear. Why take the min? Why don't infinite levels win?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz A noiseless 4 kHz channel uses 16-level signaling. A second, noisy 4 kHz channel has 20 dB SNR. What are the two ceilings, and which binds in practice?
() Nyquist 8 kbps; Shannon 4 kbps; Shannon binds
(*) Nyquist 2·4000·log₂16 = 32 kbps; Shannon 4000·log₂(101) ≈ 26.6 kbps; the noisy Shannon bound binds
() Nyquist 16 kbps; Shannon 80 kbps; Nyquist binds
() Both give 4 kbps; neither binds
::: explanation
Nyquist: $2 \times 4000 \times 4 = 32{,}000$ bps. $20$ dB $\Rightarrow$ SNR $= 100$; Shannon: $4000 \times \log_2 101 \approx 4000 \times 6.66 \approx 26{,}600$ bps. Reality has noise, so $26.6$ kbps binds — the 32 kbps assumes a perfection that doesn't exist.
:::

::: quiz Why can no coding scheme beat the Shannon capacity, yet engineers keep inventing new codes?
() Shannon's proof contains an error for modern modulations
(*) Capacity is an existence ceiling (reliable codes *approach* it arbitrarily closely); new codes close the *gap* between practical rates and the ceiling at finite complexity
() New codes increase the channel bandwidth itself
() Shannon capacity only applies to wireless channels
::: explanation
Shannon proved *achievability near* $C$ and *impossibility above* it. Real codes (turbo, LDPC, polar) compete on how close to $C$ they operate per unit of decoding effort — the ceiling stands, the staircase toward it keeps improving.
:::

::: quiz Doubling signal levels from 4 to 8 doubles the Nyquist rate. Why doesn't capacity keep doubling as levels explode?
() It does — infinite levels mean infinite capacity in all conditions
(*) Bits per symbol grow only logarithmically (log₂L) while noise tolerance collapses — and Shannon's noise-inclusive bound caps everything regardless of levels
() Levels beyond 8 are illegal under FCC rules
() The Nyquist formula stops applying above 8 levels
::: explanation
Each doubling buys exactly one more bit per symbol but halves inter-level spacing, so noise (which Nyquist ignores) bites harder — and Shannon, which *includes* noise via SNR, overrules levels entirely. Level inflation without SNR is elementary arithmetic chasing a physical limit.
:::
