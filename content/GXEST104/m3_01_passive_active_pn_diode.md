---
id: m3_01_passive_active_pn_diode
courseCode: GXEST104
module: 3
sequence: 1
title: Passive/Active Components & the PN Diode
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Separate passive parts from active parts by gain
  - Explain depletion formation and knee behavior
  - Verify diode states by assumption checking
concepts:
  - PN diode
  - depletion region
  - knee voltage
prerequisites: []
examRelevance: high
tags:
  - diodes
  - semiconductors
---
# Passive/Active Components & the PN Diode

**Resistors to transistors in one map — then depletion, diffusion vs drift, and the knee that starts electronics.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Hill Between Towns
Join p-town (hole people) to n-town (electron people): wanderers cross and settle, leaving an empty **depletion** border whose built-in hill ($\approx 0.7$ V Si) stops further crossing. Forward bias flattens the hill (crowds flood over → conducts); reverse bias piles it higher (border widens → blocks, trickle leakage only). The diode is a one-way hill gate.
:::

::: anim diode-iv Diode Curve in Three Acts
Flat reverse trickle first, then the forward knee explodes past 0.7 V, then the breakdown cliff — three regions, three behaviours.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Passive vs active

**Passive** (R, L, C: no gain, no control electrode); **active** (diode, BJT, FET/MOSFET: switch/amplify, need bias). Diode equation (statement): $I = I_s(e^{V/\eta V_T}-1)$ — exponential forward, $-I_s$ reverse.

### 2.2 Junction working + V-I

Unbiased: diffusion vs built-in barrier equilibrium, depletion width set. Forward ($V>0.7$ Si / $0.3$ Ge): barrier crushed, mA–A flow. Reverse: widened depletion, nA–µA saturation current until breakdown. Knee voltage $V_\gamma$ = practical on-threshold.

::: callout-formula KTU Formula Vault: Diode
Passive **no gain** · active **controls power with signal** · knee **$0.7$ Si / $0.3$ Ge** · forward **exponential**, reverse **$\approx -I_s$**.
:::

::: callout-pitfall Diffusion vs Drift Direction
Diffusion (majority, down-gradient) *forms* the barrier; drift (minority, field-driven) *is* the leakage. Reversing the pair inverts the whole junction story — diffusion builds, drift leaks.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Si diode, $5$ V source, $1$ k$\Omega$ series resistor, forward connected. Find diode state, current, resistor drop. Then reverse the diode.
:::

::: step [Step 2: Execution] Assume, Solve, Verify
1. Assume on: $V_R = 5-0.7 = 4.3$ V, $I = 4.3$ mA $> 0$ ✓ consistent — diode ON, $0.7$ V across it.
2. Reversed: no forward path — diode OFF (open), $I \approx 0$, full $5$ V reverse across diode (within breakdown) — resistor drops $\approx 0$.
:::

::: step [Step 3: Conclusion] Final Result
Assume-ON → solve → check $I>0$; assume-OFF → check reverse bias. Assumption-verification is the graded method, not the final numbers.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What creates the depletion region in an unbiased junction?
(A) External battery
(*B) Majority diffusion across the junction, leaving uncovered bound ions whose field halts further diffusion — equilibrium
(C) Heat alone
(D) Wire resistance
::: explanation
Wanderers cross, settle, expose fixed charges; the resulting built-in field repels follow-ups. No battery involved — the hill is self-built by the first crossers.
:::

::: quiz Q2: Numerical Drill
Ge diode, $2$ V source, $500\,\Omega$ series, forward. Current?
(A) $4$ mA
(*B) $(2-0.3)/500 = 3.4$ mA (Ge knee $0.3$ V)
(C) $(2-0.7)/500$
(D) $0$
::: explanation
Subtract the material's knee first ($0.3$ Ge, not $0.7$ Si), then Ohm. Knee-by-material is the one-line discriminator examiners plant.
:::

::: quiz Q3: Foundational Concept
Reverse bias widens depletion because:
(A) Heat expands silicon
(*B) The external field aids the built-in field, uncovering more bound ions on both sides
(C) Majority flood in
(D) The battery shorts
::: explanation
Reverse polarity pulls carriers *from* the junction, exposing more fixed charge — wider barrier, stronger block, only minority drift leaking through. Field-aided widening is the mechanism line.
:::
