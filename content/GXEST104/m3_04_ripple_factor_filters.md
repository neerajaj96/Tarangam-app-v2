# Ripple Factor with and without Filters

**How lumpy is the DC — ripple definitions, capacitor smoothing math, and filter-comparison problems.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Buckets Under a Pump
Unfiltered rectifier output gulps to zero every half-cycle (huge ripple). A **capacitor filter** is a bucket: gulps splash in, load sips continuously — big bucket (large $C$) or thirsty-slow load (large $R_L$) barely dents the level between gulps. Ripple $\propto I_{dc}/(fC)$: more sipping, smaller bucket, or slower gulps (half-wave!) all deepen dents.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Ripple factors (memorise the ladder)

Half-wave unfiltered $1.21$ · full-wave/bridge unfiltered $0.482$ · capacitor-filtered (full-wave) $r \approx 1/(4\sqrt3\,fCR_L)$ (half-wave: $1/(2\sqrt3\,fCR_L)$ — double, gulps half as often).

$$V_{ripple(pp)} \approx \frac{I_{dc}}{fC}\ \text{(FW)}$$

### 2.2 Design direction

Bigger $C$ / lighter load / full-wave over half-wave — the three ripple levers. Bleeder resistor keeps the bucket draining safely at no-load.

::: callout-formula KTU Formula Vault: Ripple
HW **$1.21$** · FW **$0.482$** · cap-FW **$1/4\sqrt3fCR$** · dents **$I/fC$**.
:::

::: callout-pitfall Frequency Doubling in Full-Wave
Full-wave gulps at $2f$ ($100$ Hz on $50$ Hz mains) — ripple formulas use the *gulp* frequency. Plugging $50$ instead of $100$ doubles the answer; label $f_{ripple}$ explicitly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Bridge + capacitor: $f = 50$ Hz mains, $C = 1000\,\mu$F, load $100\,\Omega$. Estimate ripple factor and peak-to-peak ripple for $\approx 15$ V DC.
:::

::: step [Step 2: Execution] Dents and Ratios
1. $I_{dc} \approx 15/100 = 0.15$ A. $V_{r(pp)} \approx 0.15/(100\times10^{-3}) = 1.5$ V.
2. $r \approx 1/(4\sqrt3\times50\times10^{-3}\times100) = 1/34.64 \approx 0.029$ ($\approx 3\%$ vs $48\%$ unfiltered — the bucket's three-order magic is actually $\sim 16\times$ here; still the exam's favourite contrast).
:::

::: step [Step 3: Conclusion] Final Result
Current over gulp-rate-capacitance gives dents; dents over DC give the factor. Unfiltered-vs-filtered pairing is the mandatory comparison closer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why is full-wave ripple (with identical $C$, $R$) roughly half of half-wave?
(A) Diodes are better
(*B) Gulps arrive twice as often ($2f$) — half the sip-time between refills, half the dent depth
(C) Voltage doubles
(D) Capacitance doubles
::: explanation
Dent depth $= I\times\Delta t/C$ with $\Delta t \approx 1/f_{gulp}$. Double the gulp rate, halve the drain time — frequency, not parts, does the work.
:::

::: quiz Q2: Numerical Drill
$I_{dc} = 100$ mA, $C = 470\,\mu$F, full-wave $50$ Hz mains. $V_{r(pp)}$?
(A) $4.26$ V
(*B) $0.1/(100\times470\times10^{-6}) = 0.1/0.047 \approx 2.13$ V
(C) $0.47$ V
(D) $21.3$ V
::: explanation
$f_{gulp} = 100$ Hz: $0.1/(100\times470\mu) \approx 2.13$ V. Mains-vs-gulp frequency is the loaded choice — $50$ Hz gives the $4.26$ distractor sitting in (A).
:::

::: quiz Q3: Foundational Concept
Bleeder resistor across the filter capacitor — purpose?
(A) Increase ripple
(*B) Safe discharge path at no-load (kills stored charge for servicing) plus minimum-load stabilisation
(C) Raise DC output
(D) Replace the fuse
::: explanation
Big filter caps hold biting charge after switch-off; the bleeder drains them and keeps the supply's minimum-current behaviour sane. Safety + stability in one resistor.
:::
