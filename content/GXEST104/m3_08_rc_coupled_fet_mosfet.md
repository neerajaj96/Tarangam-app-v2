---
id: m3_08_rc_coupled_fet_mosfet
courseCode: GXEST104
module: 3
sequence: 8
title: 'RC-Coupled Amplifier, Frequency Response & FET/MOSFET'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Isolate stage Q-points with coupling capacitors
  - Blame bass and treble roll-off on the right capacitors
  - Drive enhancement MOSFETs past threshold voltage
concepts:
  - RC coupling
  - frequency response
  - MOSFET
prerequisites:
  - m3_06_configs_biasing_loadline
  - m3_07_switch_amplifier
examRelevance: medium
tags:
  - amplifiers
  - mosfet
---
# RC-Coupled Amplifier, Frequency Response & FET/MOSFET

**Two stages holding hands through capacitors — midband gain, bass/treble roll-off — plus the field-effect family (N/P MOSFET).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Relay Runners with Baton Passes
One CE stage's gain ($\times 80$) isn't enough, so chain two ($\times 6400$) — **coupling capacitors** pass the AC baton while blocking DC quarrels between stages (independent Q-points!). **Frequency response** sags at bass (coupling/bypass caps starve — high-pass blockage) and at treble (junction capacitances shunt — low-pass leakage); midband runs flat and free. **FETs** swap the base's current-steering for a gate's *electric field* valving the channel — voltage-controlled, near-zero gate current.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 RC coupling and response

Cascaded gain multiplies ($A = A_1A_2$, phases add: two inversions $= 0^\circ$ net). Lower cutoff $f_L$ from input/coupling/bypass high-passes (take the highest); upper $f_H$ from device/millercaps (take the lowest); bandwidth $BW = f_H-f_L$; gain in dB $= 20\log|A_V|$.

### 2.2 FET and MOSFET (N/P)

JFET/FET: gate field pinches the channel (depletion control), $I_D$ vs $V_{GS}$ curves, cutoff at pinch-off, transfer law $I_D = I_{DSS}(1-V_{GS}/V_P)^2$ (e.g. $I_{DSS} = 8$ mA, $V_P = -4$ V, $V_{GS} = -2$ V → $I_D = 8(0.5)^2 = 2$ mA: half gate, quarter current — square law!). **MOSFET**: insulated gate (MOS stack); N-channel (electrons, +gate enhances) vs P-channel (holes, mirrored supplies); enhancement (needs $V_{GS} > V_T$ to *create* channel) vs depletion (built-in channel, $\pm$ control). Near-infinite $Z_{in}$, voltage drive, CMOS pairs N+P.

::: callout-formula KTU Formula Vault: Coupling + FET
Gains **multiply**, dB **adds** · $f_L$ = max of high-passes · $f_H$ = min of low-passes · MOSFET: **insulated gate, N/P + enhancement/depletion**.
:::

::: callout-pitfall Coupling Caps Set the Bass Floor
Weak bass response? Blame undersized $C_C/C_E$ first, transistors last. Cutoff direction: *smaller* coupling caps push $f_L$ *higher* (worse bass) — inverse intuition, verify by $f = 1/2\pi RC$.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Two stages: $A_{V1} = -50$, $A_{V2} = -40$. Overall gain (× and dB)? If $f_L = 100$ Hz, $f_H = 100$ kHz: bandwidth and the missing-bass/treble culprits?
:::

::: step [Step 2: Execution] Multiply, Subtract, Blame
1. $A_V = 2000$ (net non-inverting); dB $= 20\log2000 \approx 66$ dB.
2. $BW \approx 99.9$ kHz. Bass sag $\to$ coupling/bypass $C$'s; treble sag $\to$ internal/Miller $C$'s.
:::

::: step [Step 3: Conclusion] Final Result
Gains multiply (dB adds), bandwidth subtracts ($f_H-f_L$), culprits split by end (caps-low, junctions-high). Three attributions, full response story.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why couple stages with capacitors instead of wire?
(A) Capacitors amplify
(*B) DC isolation — each stage keeps its own Q-point while AC signals pass; direct wire would merge bias networks and wreck both Q's
(C) Wires are costly
(D) Caps add gain
::: explanation
Biasing is per-stage DC design; signals are shared AC. $C_C$ is transparent to AC (midband short) and opaque to DC (open) — independence plus communication in one part.
:::

::: quiz Q2: Foundational Concept
N-channel enhancement MOSFET needs what gate drive to conduct?
(A) Negative always
(*B) $V_{GS} > V_T$ (positive threshold) to *induce* the electron channel — no channel exists at zero bias
(C) Zero bias
(D) AC only
::: explanation
Enhancement = normally-OFF: gate field must first *create* the channel past $V_T$. Depletion types (pre-built channel) conduct at zero and take $\pm$ control — the naming *is* the behaviour.
:::

::: quiz Q3: Numerical Drill
$|A_V| = 1000$. Gain in dB? Two such stages in dB?
(A) $30$ dB; $60$ dB
(*B) Single $20\log1000 = 60$ dB; cascaded $60+60 = 120$ dB ($\times10^6$)
(C) $1000$ dB; $2000$ dB
(D) $3$ dB; $6$ dB
::: explanation
$20\log(10^3) = 60$ dB; cascades add dB ($120$ dB $= \times10^6$). Voltage uses $20\log$ (power uses $10\log$) — state the $20$ every time.
:::
