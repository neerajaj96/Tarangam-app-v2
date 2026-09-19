---
id: m2_04_pure_r_l_c_circuits
courseCode: GXEST104
module: 2
sequence: 4
title: 'Pure R, L, C Circuits: Reactance and Phase'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Assign in-phase, lagging, and leading responses by element
  - Compute reactances with frequency scaling
  - Explain zero average power with nonzero RMS current
concepts:
  - reactance
  - phase shift
prerequisites:
  - m1_03_capacitors_inductors_energy
  - m2_02_ac_fundamentals_rms_average
examRelevance: medium
tags:
  - reactance
  - ac-circuits
---
# Pure R, L, C Circuits: Reactance and Phase

**One element at a time — who shifts what, reactance formulas, and power (or its absence).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Personalities
**Resistor:** obedient — current mirrors voltage exactly (in phase), burns power. **Inductor:** procrastinator — current lags $90^\circ$ (flywheel needs coaxing), borrows and returns energy (zero net). **Capacitor:** eager-beaver — current leads $90^\circ$ (tank gulps first), also zero net. Reactance ($X_L = \omega L$, $X_C = 1/\omega C$) is frequency-sized "AC resistance" with a $\pm90^\circ$ attitude attached.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The three responses (to $v = V_m\sin\omega t$)

* **R:** $i = (V_m/R)\sin\omega t$ — in phase; $P_{avg} = V_{rms}I_{rms}$.
* **L:** $i = (V_m/\omega L)\sin(\omega t-90^\circ)$ — lags; $X_L = \omega L = 2\pi fL$; $P_{avg} = 0$.
* **C:** $i = (V_m\omega C)\sin(\omega t+90^\circ)$ — leads; $X_C = 1/\omega C$; $P_{avg} = 0$.

### 2.2 Frequency behaviour

$X_L \propto f$ (chokes highs, passes lows→DC short); $X_C \propto 1/f$ (passes highs, blocks DC). Inductor = low-pass soul, capacitor = high-pass soul — filter intuition for M3/M4 reuse.

::: callout-formula KTU Formula Vault: R/L/C
R: **in phase** · L: **lags $90^\circ$, $X_L=\omega L$** · C: **leads $90^\circ$, $X_C=1/\omega C$** · pure L/C burn **zero net**.
:::

::: callout-pitfall ELI the ICE man
Voltage (**E**) leads current (**I**) in **L** (ELI); current leads voltage in **C** (ICE). Reversed mnemonics flip every phase answer — recite before each sub-question.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$230$ V, $50$ Hz across (a) $0.1$ H inductor, (b) $100\,\mu$F capacitor. Find current magnitude + phase, and average power each.
:::

::: step [Step 2: Execution] Reactance Then Phase
1. $X_L = 314\times0.1 = 31.4\,\Omega$; $I = 230/31.4 \approx 7.32$ A lagging $90^\circ$; $P = 0$.
2. $X_C = 1/(314\times10^{-4}) \approx 31.8\,\Omega$; $I = 230/31.8 \approx 7.23$ A leading $90^\circ$; $P = 0$.
:::

::: step [Step 3: Conclusion] Final Result
Magnitude $V/X$, phase by personality (ELI/ICE), power zero for pure reactances. Three beats per element — rhythm makes it error-proof.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$X_L$ of $0.2$ H at $50$ Hz and at $100$ Hz?
(A) $62.8$ and $62.8$
(*B) $62.8\,\Omega$ and $125.7\,\Omega$ — doubling with frequency
(C) $125.7$ and $62.8$
(D) $0.2$ and $0.4$
::: explanation
$X_L = 2\pi fL$: $314.2\times0.2 \approx 62.8$; $628.3\times0.2 \approx 125.7$. Linear-in-$f$ is the choke principle — quote the scaling, not just numbers.
:::

::: quiz Q2: Numerical Drill
$X_C$ of $47\,\mu$F at $50$ Hz?
(A) $147.9\,\Omega$
(*B) $1/(314.16\times47\times10^{-6}) \approx 67.7\,\Omega$
(C) $14.76\,\Omega$
(D) $677\,\Omega$
::: explanation
Denominator $314.16\times47\times10^{-6} \approx 0.01477$; reciprocal $\approx 67.7\,\Omega$. Decimal-decade slips (µ vs m) decade-shift answers — track micro explicitly.
:::

::: quiz Q3: Foundational Concept
Pure inductor draws $5$ A RMS yet average power is zero. Is energy violated?
(A) Yes, paradox
(*B) No — energy oscillates supply↔field twice per cycle (wattless); RMS current is real, net transfer zero
(C) Meters are broken
(D) Resistance is hidden
::: explanation
$v\cdot i$ averages to zero over the $90^\circ$ shift: borrowed quarter-cycles repay fully. Utilities still size wires for the RMS current (losses are real) while billing zero energy — the power-factor problem of the next topics.
:::
