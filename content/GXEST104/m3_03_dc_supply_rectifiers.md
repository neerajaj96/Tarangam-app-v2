---
id: m3_03_dc_supply_rectifiers
courseCode: GXEST104
module: 3
sequence: 3
title: DC Power Supplies & Rectifier Circuits
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Walk the transformer-to-regulator block chain
  - Trace conducting pairs through bridge halves
  - Compute peak, average, and PIV per topology
concepts:
  - rectifiers
  - bridge rectifier
prerequisites:
  - m3_01_passive_active_pn_diode
examRelevance: medium
tags:
  - rectifiers
  - power-supplies
---
# DC Power Supplies & Rectifier Circuits

**Mains to smooth DC — block chain, half/full/bridge working, and diode-direction tracing.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Water Treatment Plant
**Transformer** (pressure step-down) → **rectifier** (one-way valves keep only forward slosh) → **filter** (tank smooths gulps) → **regulator** (relief valve clamps level). Half-wave valves one direction (wastes half the cycle); centre-tap full-wave alternates two valves; **bridge** steers both halves through one pipe with four valves (no centre tap, full transformer use).
:::

::: anim bridge-flow Bridge Pairs Take Turns
First half-cycle lights D1–D2, second lights D3–D4 — the load never sees the swap, only endless forward pushes.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Chain and conduction table

Transformer → rectifier → filter (capacitor) → regulator (Zener). Half-wave: conducts positive half only ($V_{dc} = V_m/\pi$). Centre-tap full-wave: alternate halves via tapped secondary ($2V_m/\pi$). Bridge: D1–D2 on positive, D3–D4 on negative ($2V_m/\pi$, PIV $= V_m$ per diode vs $2V_m$ centre-tap).

```text
   BRIDGE (AC left/right, load top/bottom):
        D1      D2
   AC o--->|---+---|<---o AC   +ve half: D1,D2 conduct
           |  RL   |            -ve half: D3,D4 conduct
   AC o---|<---+--->|---o AC   load current always ↓
        D3      D4
```

::: callout-formula KTU Formula Vault: Rectifiers
HW **$V_m/\pi$** · FW/bridge **$2V_m/\pi$** · bridge PIV **$V_m$** · pairs **alternate halves**.
:::

::: callout-pitfall Bridge Diode Count per Half
Two diodes conduct *per half-cycle* (two $0.7$ V drops, not one, not four). One-drop arithmetic undervalues loss; four-drop kills the output — count the conducting pair.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$12$ V RMS secondary, bridge, Si diodes, no filter. Find peak, average DC, and PIV. Repeat average for half-wave.
:::

::: step [Step 2: Execution] Peak, Pair, Average
1. $V_m = 12\sqrt2 \approx 17$ V; load peak $\approx 17-1.4 = 15.6$ V (two knees).
2. $V_{dc} = 2(15.6)/\pi \approx 9.9$ V; PIV $\approx 17$ V per diode.
3. Half-wave: $15.6+0.7 = 16.3$ peak (one knee); $V_{dc} = 16.3/\pi \approx 5.2$ V — half the DC, double the ripple frequency gap.
:::

::: step [Step 3: Conclusion] Final Result
RMS→peak ($\sqrt2$), minus knees (1 or 2), times $1/\pi$ or $2/\pi$. Three beats, every rectifier numerical.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Bridge vs centre-tap full-wave — two engineering differences?
(A) None identical
(*B) Bridge needs no centre tap (simpler transformer, full secondary used both halves) but drops two diode knees and needs $4$ diodes; centre-tap needs $2$ diodes with $2V_m$ PIV each
(C) Bridge is half-wave
(D) Centre-tap has no transformer
::: explanation
Tap-vs-diodes trade: copper/simplicity (bridge) against drop-count/PIV (centre-tap). Comparison questions want both sides' price tags, not a winner.
:::

::: quiz Q2: Numerical Drill
$9$ V RMS secondary, ideal diodes, bridge, no filter. $V_{dc}$?
(A) $9$ V
(*B) $V_m = 12.73$ V; $V_{dc} = 2V_m/\pi \approx 8.1$ V
(C) $12.73$ V
(D) $4.05$ V
::: explanation
Peak first ($9\sqrt2$), then full-wave average ($2/\pi$). RMS-direct averaging ($9\times0.636$) skips the peak step — wrong by $\sqrt2$ on the nose.
:::

::: quiz Q3: Foundational Concept
Which diodes conduct on the negative AC half-cycle (bridge labelling above)?
(A) D1, D2
(*B) D3, D4 — the pair steering the reversed input to the same load direction
(C) All four
(D) None
::: explanation
Alternation is the bridge's soul: input polarity flips, conducting pair swaps, load direction holds. Trace one half at a time — combined-half reasoning tangles.
:::
