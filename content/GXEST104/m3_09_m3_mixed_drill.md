---
id: m3_09_m3_mixed_drill
courseCode: GXEST104
module: 3
sequence: 9
title: 'M3 Drill: Diodes, Transistors & Amplifiers'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Verify diode states and transistor regions first
  - Answer gain questions with resistance ratios
  - Chain shared numbers across sub-questions
concepts:
  - assumption verification
  - gain ratios
prerequisites:
  - m3_02_zener_avalanche_regulator
  - m3_03_dc_supply_rectifiers
  - m3_07_switch_amplifier
examRelevance: high
tags:
  - devices
  - m3-drill
---
# M3 Drill: Diodes, Transistors & Amplifiers

**Assume-verify, region-check, and ratio-thinking — the complete device workout.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Habits
Diodes: *assume a state, verify it*. Transistors: *assume a region, verify $V_{CE}$*. Amplifiers: *think in ratios* ($R_C/r_e'$, dB adds). Three habits, every M3 numerical.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Habit sheet

Diode ON iff solved $I>0$ (else OFF) · BJT active iff $V_{CE}>0.2$ after $\beta$-math (else saturation) · $A_V=-R_C/r_e'$, $r_e'=25\text{mV}/I_E$ · JFET $I_D=I_{DSS}(1-V_{GS}/V_P)^2$, MOSFET needs $V_{GS}>V_T$ (N-enhancement) · Zener: $I_S=I_Z+I_L$ · ripple ladder $1.21/0.482$/filtered.

::: callout-formula KTU Formula Vault: M3 Habits
Verify **state/region** · gain by **ratios** · Zener **seesaw** · ripple **ladder**.
:::

::: callout-exam KTU Exam Focus
The 9-marker is a rectifier-with-filter *or* a BJT biasing/gain combo, plus a characteristics sketch (diode VI / CE output). Sketch + verify + ratio — three scoring moves in one answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Si diode, $3$ V, $1$ k$\Omega$ forward: current? (b) npn $\beta=80$: $I_B=20\,\mu$A, $V_{CC}=10$ V, $R_C=3$ k$\Omega$: region + $V_{CE}$? (c) Same stage as amp, $I_E\approx1.6$ mA: $|A_V|$?
:::

::: step [Step 2: Execution] Three Habits
1. $(3-0.7)/1\text{k} = 2.3$ mA $>0$ ✓ ON.
2. $I_C=1.6$ mA; $V_{CE}=10-4.8=5.2$ V $>0.2$ ✓ active.
3. $r_e'=25/1.6\approx15.6\,\Omega$; $|A_V|=3000/15.6\approx192$.
:::

::: step [Step 3: Conclusion] Final Result
One bias computation feeds region, voltages, *and* gain — chained sub-questions share numbers by design. Carry values forward, never restart.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$V_{in}=20$ V, $V_Z=8$ V, $R_S=400\,\Omega$, $I_L=10$ mA. $I_Z$? Regulation alive?
(A) $30$ mA, dead
(*B) $I_S=12/400=30$ mA; $I_Z=20$ mA — alive (positive, inside typical band)
(C) $10$ mA, alive
(D) $0$ mA
::: explanation
$(20-8)/400 = 30$ mA total; load takes $10$, valve $20$. Positive in-range $I_Z$ = regulating — the alive verdict needs the number, not hope.
:::

::: quiz Q2: Mixed Drill
Bridge, $6$ V RMS secondary, ideal diodes, no filter. $V_{dc}$ and PIV?
(A) $6$ V, $6$ V
(*B) $V_m=8.49$ V; $V_{dc}=2(8.49)/\pi\approx5.4$ V; PIV $\approx 8.49$ V
(C) $8.49$ V, $16.97$ V
(D) $2.7$ V, $8.49$ V
::: explanation
Peak ($6\sqrt2$), full-wave average ($2/\pi$), bridge PIV ($V_m$, not $2V_m$ — that's centre-tap). Three beats, no knees (ideal) — state ideality to justify skipping $0.7$'s.
:::

::: quiz Q3: Mixed Drill
CE stage: $R_C=2.5$ k$\Omega$, $I_E=2$ mA. $|A_V|$ and phase?
(A) $125$, $0^\circ$
(*B) $r_e'=12.5\,\Omega$; $|A_V|=2500/12.5=200$, inverted ($180^\circ$)
(C) $200$, $0^\circ$
(D) $80$, $180^\circ$
::: explanation
$25/2 = 12.5\,\Omega$; ratio $200$; CE inverts. Gain-phase pair is the complete stage answer — magnitude alone is half marks.
:::
