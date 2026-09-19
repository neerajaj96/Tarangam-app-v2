---
id: m4_06_bandwidth_utilization_multiplexing_spread
courseCode: PCCST501
module: 4
sequence: 6
title: 'Bandwidth Utilization: Multiplexing & Spread Spectrum'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Price FDM guards and TDM framing overhead by hand
  - Separate port sharing from slice sharing across layers
  - Trade spreading bandwidth for graceful degradation
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
## 1. The Intuition

::: callout-intuition Core Mental Model: Apartment Sharing
One link, many tenants. **FDM** gives each tenant fixed rooms (frequency bands + guard walls). **TDM** gives the whole apartment in time shifts (slots in repeating frames). **WDM** is FDM with lasers (colours down one fibre). **Spread spectrum** skips walls entirely — everyone whispers across the whole apartment in private codes (FHSS hops, DSSS chips), collisions becoming background hiss.
:::

Transport "multiplexing" (M2.1's ports) shares *endpoints*; this topic shares the *wire* — same word, different layer, classic exam trap.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The three slicers

FDM: band split + guard bands (analog heritage: $n$ channels need $n - 1$ internal guards); TDM: synchronous slots per frame plus framing bits (digital; rate $=$ sources × slot-rate × frame-overhead factor); WDM: many wavelengths, one fibre (backbone multiplier). All three waste what they reserve: idle tenants still own their slice.

### 2.2 Spread spectrum

FHSS hops carrier across frequencies (Bluetooth-style, jam-resistant); DSSS multiplies each bit by a chip code (CDMA-style, processing gain $=$ chip-rate/bit-rate). Sharing by code, not by reservation — graceful degradation instead of hard blocking.

::: callout-formula KTU Formula Vault: Sharing
FDM: $n$ bands $+ (n-1)$ guards · TDM rate $=$ payload × frame/total · WDM $=$ FDM at light · DSSS gain $=$ chips/bit · reservation wastes idleness, codes degrade gracefully.
:::

Statistical TDM (dynamic slot assignment) recovers idle-slice waste at the cost of addressing overhead per slot — reservation vs contention, the eternal multiplexing bargain.

::: callout-pitfall Ports vs Slices
M2.1 multiplexing = many sockets, one host (transport demultiplexing by port number). FDM/TDM multiplexing = many signals, one link (physical sharing by band/slot). An option routing "port numbers" into a TDM frame mixes layers two apart.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) FDM: $3$ voice channels of $4$ kHz with $1$ kHz guards between adjacent bands — total bandwidth? (b) TDM: $4$ sources at $2$ Mbps, $8$-bit slots plus $1$ framing bit per frame — line rate?
:::

::: step [Step 2: Execution] Bands and Frames
(a) Payload $3 \times 4 = 12$ kHz; internal guards $2 \times 1 = 2$ kHz; total $= 14$ kHz — guards are pure overhead ($2/14 \approx 14.3\%$). (b) Frame $= 4 \times 8 + 1 = 33$ bits carrying $32$ data bits; payload rate $4 \times 2 = 8$ Mbps; line rate $= 8 \times 33/32 = 8.25$ Mbps — framing overhead $1/33 \approx 3.03\%$.
:::

::: step [Step 3: Conclusion] Final Result
$14$ kHz FDM ($14.3\%$ guard tax), $8.25$ Mbps TDM ($3.03\%$ framing tax). Overhead itemized per technique — guards for frequency, framing bits for time — and both taxes shrink as payload blocks grow.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
