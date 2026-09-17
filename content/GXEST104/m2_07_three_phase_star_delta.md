# Three-Phase Systems: Star, Delta & Line Values

**Why three wires beat one — generation, advantages, and the $\sqrt3$ relations (balanced only).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Rowers, One Boat
Three coils spaced $120^\circ$ in a rotating field produce three voltages peaking in turn — like rowers stroking in rotation, total push never dips to zero (constant instantaneous power!). **Star (Y)** ties three ends to a neutral (two voltages on offer: phase $+$ line); **delta (Δ)** chains them tip-to-tail (one voltage, beefier current paths). Same copper carries $\sqrt3\times$ the power of single-phase.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Generation and advantages

Three $120^\circ$-displaced coils → $v_R, v_Y, v_B$; phase sequence RYB sets motor direction. Advantages: constant power (no $2\omega$ pulsation), $\sqrt3$ more power per copper, self-starting motors, two voltage levels from star (e.g. $230/400$ V).

### 2.2 Balanced relations (the whole numerical syllabus)

Star: $V_L = \sqrt3\,V_{ph}$, $I_L = I_{ph}$. Delta: $V_L = V_{ph}$, $I_L = \sqrt3\,I_{ph}$. Power (either): $P = \sqrt3\,V_LI_L\cos\phi$. Neutral carries zero in balance (may be omitted); imbalance needs neutral (beyond balanced scope — name it, don't solve).

::: callout-formula KTU Formula Vault: 3-Phase
Star: **$V_L=\sqrt3V_{ph}$, $I_L=I_{ph}$** · delta: **$V_L=V_{ph}$, $I_L=\sqrt3I_{ph}$** · power **$\sqrt3V_LI_L\cos\phi$** · balanced: **no neutral current**.
:::

::: callout-pitfall Which Side Gets $\sqrt3$
Voltage-$\sqrt3$ belongs to **star**, current-$\sqrt3$ to **delta** — cross-assigning invents $3\times$ power errors. Chant "star-V, delta-I" with every substitution.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$400$ V (line) star-connected motor draws $10$ A line at PF $0.8$. Find phase voltage, phase current, and power. Recompute power if delta-connected to the same lines (same winding impedance)?
:::

::: step [Step 2: Execution] Star, Then Delta Contrast
1. Star: $V_{ph} = 400/\sqrt3 \approx 231$ V; $I_{ph} = 10$ A; $P = \sqrt3(400)(10)(0.8) \approx 5.54$ kW.
2. Delta on $400$ V lines: windings see full $400$ V ($\sqrt3\times$ the star winding voltage) → $P_\Delta = 3P_Y \approx 16.6$ kW (star–delta starters exploit exactly this $3\times$ step for soft starting).
:::

::: step [Step 3: Conclusion] Final Result
Line values in, $\sqrt3$ to phase, one power formula for both. The $3\times$ star/delta power ratio is the standard "compare" follow-up — derive it, don't memorise.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Delta load, $V_L = 400$ V, $I_L = 17.32$ A. Phase current?
(A) $17.32$ A
(*B) $17.32/\sqrt3 = 10$ A ($10\sqrt3 \approx 17.32$ engineered)
(C) $30$ A
(D) $400$ A
::: explanation
Delta: $I_{ph} = I_L/\sqrt3 = 10$ A. $\sqrt3$-scaled round numbers ($10/17.32$, $231/400$) flag the intended relation — read the gift.
:::

::: quiz Q2: Foundational Concept
Why is three-phase instantaneous power constant (balanced)?
(A) Frequency is high
(*B) The three $2\omega$ pulsations sit $120^\circ$ apart and sum to zero — manna for motors (no torque ripple) and generators
(C) Neutral absorbs it
(D) RMS is constant
::: explanation
$p(t) = P + $ three $120^\circ$-shifted double-frequency cosines that cancel identically. Single-phase pulses at $2\omega$ (buzzing, torque ripple); three-phase flows flat — the headline advantage.
:::

::: quiz Q3: Numerical Drill
Balanced star: $V_{ph} = 230$ V. Line voltage? Neutral current?
(A) $230$ V, $10$ A
(*B) $230\sqrt3 \approx 398 \approx 400$ V; neutral $0$ (balanced phasor sum cancels)
(C) $690$ V, $0$
(D) $132$ V, $5$ A
::: explanation
$V_L = \sqrt3V_{ph} \approx 400$ V (the familiar $230/400$ pair); neutral current $= $ phasor sum $= 0$. Zero-neutral justifies 3-wire transmission — copper saved is money saved.
:::
