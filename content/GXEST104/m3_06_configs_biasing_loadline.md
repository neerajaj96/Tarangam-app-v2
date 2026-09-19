---
id: m3_06_configs_biasing_loadline
courseCode: GXEST104
module: 3
sequence: 6
title: 'CE, CB, CC Comparison, Biasing & Load Line'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Compare CE, CB, and CC on gains and impedances
  - Park Q-points with divider bias and load lines
  - Judge centred swing against clipping sides
concepts:
  - amplifier configurations
  - biasing
  - load line
prerequisites:
  - m3_05_bjt_construction_characteristics
examRelevance: high
tags:
  - biasing
  - load-line
---
# CE, CB, CC Comparison, Biasing & Load Line

**Three ways to ground the transistor, why CE wins for amplification, and how biasing parks the Q-point.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Microphone Placements
**CE** (emitter common): big voltage × big current gain (the PA system — inverts phase). **CB** (base common): voltage gain, no current gain (helmet mic — rugged, fast, low input $Z$). **CC/emitter-follower** (collector common): current gain, voltage $\approx 1$ (stage whisperer — buffers impedance, no phase flip). **Biasing** sets the idle (Q-point) mid-stage so signals swing both ways without clipping; the **load line** is the allowed-seats row drawn across the output curves.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Comparison table

| Config | $A_V$ | $A_I$ | $Z_{in}$ | $Z_{out}$ | Phase | Use |
|---|---|---|---|---|---|---|
| CE | high | high ($\beta$) | medium (k$\Omega$) | medium | $180^\circ$ | amplification |
| CB | high | $<1$ ($\alpha$) | low ($\Omega$) | high | $0^\circ$ | high-freq, matching |
| CC | $\approx1$ | high ($1+\beta$) | high | low | $0^\circ$ | buffering |

### 2.2 Biasing and load line

Fixed-bias (simple, $\beta$-sensitive), collector-feedback, voltage-divider (stable, standard). DC load line from $V_{CE} = V_{CC}-I_CR_C$: intercepts ($V_{CC}$, $V_{CC}/R_C$); Q-point where it meets the $I_B$ curve. Centre-Q maximises unclipped swing; drift toward cutoff/saturation clips one peak.

::: callout-formula KTU Formula Vault: Configs + Bias
CE = **gain + invert** · CB = **fast, low-$Z_{in}$** · CC = **buffer, $\approx1$** · Q centred by **divider bias** on the **load line**.
:::

::: callout-pitfall Voltage-Divider ≠ Automatically Stable
Stability needs stiff divider ($R_{1,2}$ passing $\approx 10\times I_B$) plus emitter resistor feedback — the topology alone without sizing still drifts with $\beta$/temperature. Quote the *condition*, not just the name.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
CE stage: $V_{CC} = 12$ V, $R_C = 2$ k$\Omega$, $I_{CQ} = 2$ mA. Find $V_{CEQ}$ and load-line intercepts. Is Q centred?
:::

::: step [Step 2: Execution] Line and Dot
1. $V_{CEQ} = 12-2(2) = 8$ V. Intercepts: $(12$ V, $0)$, $(0, 6$ mA$)$.
2. Centre would sit $\approx 6$ V; $8$ V leans toward cutoff (positive-peak clips first). Re-bias for $I_{CQ} \approx 3$ mA → $V_{CEQ} = 6$ V centred.
:::

::: step [Step 3: Conclusion] Final Result
Intercepts draw the line, $I_{CQ}$ dots the Q, midpoint judges it. Centre-or-which-side-clips is the standard 2-mark closer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why is CE the default amplifier configuration?
(A) Highest input impedance
(*B) Only CE gives substantial voltage *and* current gain (power gain highest) with medium impedances — CB lacks current gain, CC lacks voltage gain
(C) No phase shift
(D) Fewest parts
::: explanation
Power gain $= A_V\times A_I$: CE multiplies on both axes; CB/CC each forfeit one. Phase inversion is the accepted price — one stage flips, two restore.
:::

::: quiz Q2: Foundational Concept
Emitter-follower (CC) voltage gain $\approx 1$ yet it's everywhere. Why?
(A) It amplifies voltage secretly
(*B) Impedance transformation ($Z_{in}$ high, $Z_{out}$ low) with current gain — it *buffers*, bridging stages without loading or phase flip
(C) It rectifies
(D) It oscillates
::: explanation
Voltage $\approx 1$ but current $\approx 1+\beta$: power gain survives while high-$Z$ sources meet low-$Z$ loads happily. Buffers sell isolation, not magnification.
:::

::: quiz Q3: Numerical Drill
$V_{CC} = 9$ V, $R_C = 1.5$ k$\Omega$. Load-line intercepts? Q at $I_C = 3$ mA: centred?
(A) $(9, 6)$; centred
(*B) Voltage intercept $9$ V; current intercept $9/1.5 = 6$ mA; $V_{CEQ} = 9-4.5 = 4.5$ V $=$ midpoint — centred ✓
(C) $(6, 9)$; cutoff-side
(D) $(9, 9)$; saturated
::: explanation
$V_{CEQ} = V_{CC}/2 = 4.5$ V is dead centre by construction here — maximum symmetric swing $\pm4.5$ V. Intercepts first, midpoint verdict second.
:::
