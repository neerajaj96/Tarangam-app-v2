---
id: m4_01_comm_fibre_block_diagrams
courseCode: GXEST104
module: 4
sequence: 1
title: Communication System & Fibre-Optic Link Blocks
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Draw generic chains with one role-line per block
  - Place noise arrows at the channel only
  - Explain fibre EMI immunity from photon physics
concepts:
  - communication chain
  - fibre-optic link
prerequisites: []
examRelevance: high
tags:
  - communication
  - fibre-optics
---
# Communication System & Fibre-Optic Link Blocks

**Source-to-sink in boxes — the generic chain and its light-speed cousin, with each block's one-line job.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Postal Service
**Source** writes the letter (info) → **transmitter** envelopes/codes it (modulation into transmittable form) → **channel** is the road (wire/fibre/air, adding noise/potholes) → **receiver** opens and decodes → **destination** reads. Fibre swaps the road for glass and the truck for light: laser/LED transmitter, glass channel (TIR — M1 physics of GZPHT121 returns), photodiode receiver. Same post office, faster trucks.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Generic block diagram (draw with roles)

Source → input transducer → transmitter (modulation/amplification) → channel (+ noise) → receiver (amplification/demodulation) → output transducer → destination. Noise enters *only* at the channel — everything before is clean by design.

### 2.2 Fibre-optic link blocks

Electrical in → optical transmitter (laser/LED + driver) → fibre (splices, ultra-low loss windows) → optical amplifier/repeater → photodetector (PIN/APD) → electrical out. Advantages: huge bandwidth, tiny loss, EMI-immune, light/secure.

::: callout-formula KTU Formula Vault: Link Blocks
Chain: **source→Tx→channel(+noise)→Rx→sink** · fibre: **E/O→glass→O/E** · noise joins at the **channel**.
:::

::: callout-exam KTU Exam Focus
"Block diagram with explanation" wants boxes *plus* one role-line each — bare boxes score half. Noise-at-channel is the detail that separates full-mark answers.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"With block diagrams, compare a general communication system with a fibre-optic link. Where does noise attack, and why is fibre immune to EMI?"
:::

::: step [Step 2: Execution] Two Diagrams, Two Answers
1. Draw both chains with role-lines; mark noise arrow into the channel box only.
2. Fibre immunity: glass carries photons (no charge) — motors/RFI couple to conductors, not to light; plus no crosstalk radiation escapes the core (TIR confinement).
:::

::: step [Step 3: Conclusion] Final Result
Diagrams first, noise placement second, immunity mechanism third. The photon-vs-electron contrast is the closer that earns the comparison mark.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Where does noise enter the communication chain, and why there?
(A) At the source — microphones are noisy
(*B) At the channel — transmission media pick up interference/attenuation; endpoints are engineered clean
(C) At the destination only
(D) Nowhere in digital systems
::: explanation
Transmitters/receivers sit in controlled hardware; the channel (kilometres of wire/air/fibre) is exposed. Channel coding and modulation exist precisely because the dirt is localised here.
:::

::: quiz Q2: Foundational Concept
Why is fibre immune to electromagnetic interference?
(A) Glass is expensive
(*B) It guides photons, not electrons — external EM fields couple to conductors, and TIR confines the light inside the core
(C) Fibre has no bandwidth
(D) Repeaters filter everything
::: explanation
No charge in transit means nothing for EMI to push; confinement means nothing leaks to neighbours either. Immunity is physics (photons + TIR), not filtering.
:::

::: quiz Q3: Foundational Concept
Transmitter vs receiver — one-line jobs?
(A) Both amplify identically
(*B) Transmitter conditions information onto a channel-ready carrier (modulate/amplify/drive); receiver inverts it (amplify/demodulate/decode) back to information
(C) Receiver transmits back
(D) Transmitter stores data
::: explanation
Mirror pair around the channel: encode-for-travel vs decode-from-travel. Every block-diagram answer should state the mirror explicitly — symmetry is the memory hook.
:::
