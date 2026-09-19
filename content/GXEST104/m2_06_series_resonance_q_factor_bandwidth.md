# Series Resonance, Q-Factor & Bandwidth

**When reactances cancel — resonant frequency, magnification, selectivity, and the Q that prices them all.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Swing Pushed in Rhythm
Push a swing randomly and it wobbles; push in rhythm and tiny pushes build a huge arc. Series resonance is electrical rhythm-matching: at $f_0$ the inductor's lag and capacitor's lead annihilate ($X_L = X_C$), leaving bare resistance — current peaks, and the coil/cap voltages balloon to $Q$ times the supply. **Q-factor** is the swing's patience (energy stored per cycle ÷ energy lost); **bandwidth** is how fussy the rhythm is (high Q = narrow taste).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Resonance condition and friends

$X_L = X_C \Rightarrow \omega_0L = 1/\omega_0C$: $f_0 = 1/(2\pi\sqrt{LC})$, $Z_{min} = R$, $I_{max} = V/R$, PF $= 1$. $Q = \omega_0L/R = 1/(\omega_0CR) = (1/R)\sqrt{L/C}$; $V_L = V_C = QV$ (magnification!); half-power bandwidth $BW = f_0/Q = R/(2\pi L)$.

::: callout-formula KTU Formula Vault: Resonance
$X_L=X_C$ at $f_0$ · **$f_0=1/2\pi\sqrt{LC}$** · **$Q=\omega_0L/R$** · **$V_L=QV$** · **$BW=f_0/Q$** · PF $=1$ at peak.
:::

::: callout-pitfall Resonance Means Minimum Z, Not Zero
$Z = R$ at $f_0$ — the resistance remains, so current is $V/R$, finite. "Resonance shorts the circuit" confuses cancelled reactance with vanished resistance; the $R$ floor bounds everything (and sets $Q$).
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Series $R = 10\,\Omega$, $L = 0.1$ H, $C = 100\,\mu$F, supply $230$ V. Find $f_0$, $Q$, resonant current, coil voltage, and bandwidth.
:::

::: step [Step 2: Execution] Peak and Its Price
1. $LC = 10^{-5}$: $f_0 = 1/(2\pi\sqrt{10^{-5}}) = 1/(2\pi\times3.162\times10^{-3}) \approx 50.3$ Hz.
2. $\omega_0 \approx 316.2$: $Q = 316.2\times0.1/10 \approx 3.16$. $I_0 = 230/10 = 23$ A.
3. $V_L = QV = 3.16\times230 \approx 727$ V across the coil (and equal capacitor volts opposing) — magnified $3.16\times$ over supply. $BW = 50.3/3.16 \approx 15.9$ Hz (check: $R/2\pi L = 10/0.628 \approx 15.9$ ✓).
:::

::: step [Step 3: Conclusion] Final Result
$f_0 \approx 50.3$ Hz, $Q \approx 3.16$, $23$ A peak with $727$ V swinging inside a $230$ V circuit. Magnification is why resonance both selects stations and stresses insulation — same $Q$, two readings.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$L = 0.4$ H, $C = 100\,\mu$F. Resonant frequency?
(A) $50.3$ Hz
(*B) $LC = 4\times10^{-5}$: $f_0 = 1/(2\pi\times6.325\times10^{-3}) \approx 25.2$ Hz — same $C$, quadrupled $L$ halves $f_0$ ($\sqrt{LC}$ doubles)
(C) $100$ Hz
(D) $12.6$ Hz
::: explanation
$f_0$ follows $\sqrt{LC}$ inversely: $4\times$ inductance $\to$ $2\times$ root $\to$ half frequency. Ratio thinking ($f_0 \propto 1/\sqrt{LC}$) beats recomputation — scale, don't recalculate.
:::

::: quiz Q2: Numerical Drill
At resonance with $Q = 1.58$ on a $100$ V supply, coil voltage? And $R = 20\,\Omega$, $L = 0.1$ H, $C = 100\,\mu$F gives this $Q$ — verify.
(A) $100$ V
(*B) $158$ V — and $Q = 316.2\times0.1/20 = 31.62/20 \approx 1.58$ ✓ consistent
(C) $63$ V
(D) $1000$ V
::: explanation
Magnification is multiplication: $V_L = QV$. The $Q$ recompute closes the loop — given $R,L,C$, $Q$ is determined, and the coil volts follow without fresh tricks.
:::

::: quiz Q3: Foundational Concept
Why does current peak (not dip) at series resonance?
(A) Resistance vanishes
(*B) Net reactance zeroes ($X_L - X_C = 0$), leaving minimum $|Z| = R$ — smallest denominator, largest current; parallel resonance dual flips this (maximum $|Z|$, minimum line current)
(C) Inductor shorts
(D) Capacitor opens
::: explanation
Peak current is minimum impedance, and minimum impedance here is $R$ itself. Series dips $|Z|$, parallel peaks it — the dual pair examiners love to swap.
:::
