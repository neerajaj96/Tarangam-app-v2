---
id: m4_06_bandwidth_utilization_multiplexing_spread
courseCode: PCCST501
module: 4
sequence: 6
title: 'Bandwidth Utilization: Multiplexing & Spread Spectrum'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Price FDM guards and TDM framing overhead by hand
  - Separate port sharing from slice sharing across layers
  - Trade spreading bandwidth for graceful degradation
  - Self-test with the exam recap and active-recall checklist
concepts:
  - FDM/TDM/WDM
  - spread spectrum
prerequisites:
  - m2_01_transport_layer_services_and_multiplexing
examRelevance: medium
tags:
  - multiplexing
  - spread-spectrum
---
# Bandwidth Utilization: Multiplexing & Spread Spectrum

**Sharing one fat link — FDM slices frequency, TDM slices time, WDM slices light, spread spectrum hides in plain sight, all priced by hand.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

One expensive long-distance link, many customers. Giving each a private wire wastes fortunes; letting them collide wastes the link. The middle path: **divide** the link's capacity into shares (by frequency, time, or wavelength) — or **spread** every signal across the whole band in private codes so sharing degrades gracefully instead of blocking.

The problem before the solution: share one wire's bandwidth among many signals with minimum overhead — and know the price of each sharing style (guard bands, framing bits, idle-slice waste) plus the alternative that skips reservation entirely.

::: callout-intuition Core Mental Model: Apartment Sharing
One link, many tenants. **FDM (Frequency Division Multiplexing)** gives each tenant fixed rooms (frequency bands + guard walls). **TDM (Time Division Multiplexing)** gives the whole apartment in time shifts (slots in repeating frames). **WDM (Wavelength Division Multiplexing)** is FDM with lasers (colours down one fibre). **Spread spectrum** skips walls entirely — everyone whispers across the whole apartment in private codes (FHSS — Frequency-Hopping Spread Spectrum — hops, DSSS — Direct-Sequence Spread Spectrum — chips), collisions becoming background hiss.

Dropping the apartment now: guard band = unused fence between FDM channels; framing bit = TDM sync overhead; chip = one DSSS code unit; processing gain = chips per bit.
:::

Transport "multiplexing" (M2.1's ports) shares *endpoints*; this topic shares the *wire* — same word, different layer, classic exam trap.

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **FDM (Frequency Division Multiplexing)** | Split the band into channels + guard bands (analog heritage: $n$ channels need $n-1$ internal guards). |
| **TDM (Time Division Multiplexing)** | Split time into repeating frames of slots + framing bits (digital; synchronous = fixed assignment, statistical = dynamic with per-slot addressing overhead). |
| **WDM (Wavelength Division Multiplexing)** | Many wavelengths (colours) down one fibre — FDM at light, the backbone multiplier. |
| **FHSS (Frequency-Hopping Spread Spectrum)** | Hop the carrier across frequencies (Bluetooth-style, jam-resistant). |
| **DSSS (Direct-Sequence Spread Spectrum)** | Multiply each bit by a chip code (CDMA-style); processing gain $=$ chip-rate ÷ bit-rate. |
| **Guard band** | Unused fence frequency between adjacent FDM bands — pure overhead. |
| **Processing gain** | Chips per bit (e.g. $11$ → $\approx 10.4$ dB of jam resistance). |

<a id="the-math"></a>
## 3. Purpose — Slicers, Spreaders, Overhead Math

### 3.1 The Three Slicers

FDM: band split + guard bands (analog heritage: $n$ channels need $n - 1$ internal guards); TDM: synchronous slots per frame plus framing bits (digital; rate $=$ sources × slot-rate × frame-overhead factor); WDM: many wavelengths, one fibre (backbone multiplier). All three waste what they reserve: idle tenants still own their slice.

### 3.2 Spread Spectrum

FHSS hops carrier across frequencies (Bluetooth-style, jam-resistant); DSSS multiplies each bit by a chip code (CDMA-style, processing gain $=$ chip-rate/bit-rate). Sharing by code, not by reservation — graceful degradation instead of hard blocking.

::: callout-formula KTU Formula Vault: Sharing
FDM: $n$ bands $+ (n-1)$ guards · TDM rate $=$ payload × frame/total · WDM $=$ FDM at light · DSSS gain $=$ chips/bit · reservation wastes idleness, codes degrade gracefully.
:::

Statistical TDM (dynamic slot assignment) recovers idle-slice waste at the cost of addressing overhead per slot — reservation vs contention, the eternal multiplexing bargain.

::: callout-pitfall Ports vs Slices
M2.1 multiplexing = many sockets, one host (transport demultiplexing by port number). FDM/TDM multiplexing = many signals, one link (physical sharing by band/slot). An option routing "port numbers" into a TDM frame mixes layers two apart.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

FDM: 2 voice channels of 4 kHz, 1 kHz guard between them: total $= 2 \times 4 + 1 \times 1 = 9$ kHz (one internal fence — $n - 1 = 1$). TDM: 2 sources, 4-bit slots, 1 framing bit per frame: frame $= 9$ bits carrying 8 data → line runs $9/8$ hotter than payload.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
(a) FDM: $3$ voice channels of $4$ kHz with $1$ kHz guards between adjacent bands — total bandwidth? (b) TDM: $4$ sources at $2$ Mbps, $8$-bit slots plus $1$ framing bit per frame — line rate?
:::

::: step [Step 2: Execution] Bands and Frames
(a) Payload $3 \times 4 = 12$ kHz; internal guards $2 \times 1 = 2$ kHz; total $= 14$ kHz — guards are pure overhead ($2/14 \approx 14.3\%$). (b) Frame $= 4 \times 8 + 1 = 33$ bits carrying $32$ data bits; payload rate $4 \times 2 = 8$ Mbps; line rate $= 8 \times 33/32 = 8.25$ Mbps — framing overhead $1/33 \approx 3.03\%$.
:::

::: step [Step 3: Conclusion] Final Result
$14$ kHz FDM ($14.3\%$ guard tax), $8.25$ Mbps TDM ($3.03\%$ framing tax). Overhead itemized per technique — guards for frequency, framing bits for time — and both taxes shrink as payload blocks grow.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| FDM vs. TDM vs. WDM | Slice frequency (+guards) vs. slice time (+framing) vs. slice light (colours). |
| Sync vs. statistical TDM | Fixed slots (idle waste) vs. dynamic slots (+addressing overhead). |
| Reservation vs. spread spectrum | Own-a-slice (hard blocking when full) vs. share-by-code (graceful degradation). |
| Port multiplexing vs. link multiplexing | Transport endpoints (M2.1) vs. physical wire (this note). |

**Watch out:** (1) Counting $n$ guards for $n$ bands — fenceposts need $n-1$. (2) Inverting the TDM ratio — line runs *hotter* than payload (multiply by frame/data $> 1$). (3) Routing port numbers into TDM frames — two layers apart.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
FDM = bands + $(n-1)$ guards; TDM = slots + framing bits (line = payload × frame/data); WDM = colours on fibre. Statistical TDM trades addressing overhead for idle recovery. Spread: FHSS hops, DSSS chips (gain = chips/bit, $\approx 10\log_{10}$ dB). Reservation blocks; codes degrade gracefully.
:::

**Active-recall checklist:** How many guards for 5 bands? Which way does the TDM ratio point? What does processing gain buy? When does statistical TDM win?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Q1: Guard Arithmetic
$5$ channels, $10$ kHz each, $2$ kHz adjacent guards. Total?
(A) $50$ kHz, guards are free
(*B) $50 + 4 \times 2 = 58$ kHz — guards live *between* bands ($n - 1$ of them), the fencepost count students botch into $5$ or $6$ guards yearly
(C) $60$ kHz with edge doubling
(D) $52$ kHz, one guard total
::: explanation
Fenceposts: $5$ bands need $4$ internal fences. Edge guards depend on neighbours outside the allocation, never assumed — $58$ kHz with stated assumptions is the defensible exam answer.
:::

::: quiz Q2: TDM Rate Drill
$3$ sources at $1$ Mbps, $1$ framing bit per $24$-bit frame ($8$ bits each). Line rate?
(A) $3$ Mbps flat
(*B) $3 \times 25/24 = 3.125$ Mbps — frames carry $24$ data bits in $25$ transmitted, so the line runs $25/24$ hotter than payload; overhead $1/25 = 4\%$
(C) $4$ Mbps by rounding
(D) $24/25 \times 3 = 2.88$ Mbps (inverted ratio)
::: explanation
Rate scales by transmitted/data ($25/24 > 1$), never its inverse — the line is *faster* than payload sum. Inverting the ratio is the signature arithmetic slip; units (line > payload) catch it instantly.
:::

::: quiz Q3: Spread Spectrum Logic
DSSS with $11$ chips per bit. Jammer blasts one narrow band. Effect?
(A) Total loss, band is band
(*B) Bit energy spreads over $11\times$ bandwidth, so narrowband jamming corrupts a fraction — despreading recovers the bit with processing gain $\approx 11$ ($\approx 10.4$ dB), graceful degradation instead of hard failure
(C) Gain equals $1/11$
(D) FHSS and DSSS are identical
::: explanation
Spreading trades bandwidth for robustness: each bit's $11$ chips vote, and the jammer only stuffs some ballots. Gain $=$ chips/bit is the quantitative payoff — $10\log_{10}(11) \approx 10.4$ dB of free jam resistance.
:::
