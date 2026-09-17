# CRO & Lissajous Patterns

**The electron painter — deflection physics, front-panel fluency, and frequency/phase from looping figures.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Etch-a-Sketch Beam
A **CRO** fires electrons at glowing phosphor; X/Y plate pairs yank the beam sideways/up-down by input voltages — spot position *is* voltage, swept timebase turns wiggles into waves. Feed sines to *both* plates (X–Y mode) and the spot dances **Lissajous** loops: $1$:$1$ circles/ellipses/lines encode phase, $2$:$1$ figure-eights encode frequency ratios. Touch counting (tangents per side) reads the ratio off the doodle.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 CRO blocks and measurements

Electron gun → focusing/accelerating → X/Y deflection → phosphor + timebase (sawtooth X in normal mode). Measure: $V_{pp}$ (vertical div × V/div), period/frequency (horizontal div × s/div), phase via dual-trace shift or Lissajous.

### 2.2 Lissajous reading rules

Same-frequency: line ($0^\circ/180^\circ$), ellipse (other $\phi$), circle (equal amplitudes, $90^\circ$). Frequency ratio $f_Y/f_X = T_X/T_Y$ where $T$ = tangency touches per side (count intersections with imaginary horizontal/vertical tangent lines). Phase from ellipse: $\sin\phi = y_{intercept}/y_{max}$.

::: callout-formula KTU Formula Vault: Lissajous
Circle/line/ellipse = **phase dial** · $f_Y/f_X = T_X/T_Y$ (**touch-count ratio**) · $\sin\phi = y_0/y_m$.
:::

::: callout-pitfall Touch Ratio Orientation
$f_Y/f_X = T_X/T_Y$ — touches on the *X*-tangent line go *upstairs* (numerator is $f_Y$). Crossed fractions invert every ratio; chant "X-touches over Y-frequency" while counting.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) $4$ vertical div at $2$ V/div, $5$ horizontal div at $1$ ms/div: $V_{pp}$? frequency? (b) Lissajous touches: $3$ on horizontal tangent, $2$ on vertical. $f_Y:f_X$? (c) Ellipse $y_0 = 1$, $y_m = 2$: phase?
:::

::: step [Step 2: Execution] Divs, Touches, Arcsine
1. $V_{pp} = 8$ V; $T = 5$ ms → $f = 200$ Hz.
2. $f_Y/f_X = 3/2$ ($3$:$2$ ratio).
3. $\sin\phi = 1/2$ → $\phi = 30^\circ$ (or $150^\circ$ — quadrant/shape disambiguates; state both, pick by tilt).
:::

::: step [Step 3: Conclusion] Final Result
Div-products, touch-ratios, intercept-arcsines — three CRO numerics, each two lines. Units-per-division first, always.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
X–Y mode shows a perfect circle. What does it certify?
(A) DC inputs
(*B) Equal-amplitude, equal-frequency sines at $90^\circ$ — the phase/frequency/amplitude triple locked
(C) Random noise
(D) Sawtooth drive
::: explanation
Circle needs all three: same $f$ (closed loop), same size (round not elliptical), quadrature (not tilted line). Each deviation deforms distinctively — shape *is* the diagnosis.
:::

::: quiz Q2: Numerical Drill
Touches $T_X = 1$ (horizontal tangent), $T_Y = 3$ (vertical tangent). Frequency ratio $f_Y:f_X$?
(A) $3$:$1$
(*B) $1$:$3$ — $f_Y/f_X = T_X/T_Y = 1/3$, so Y runs at one-third the X rate
(C) $1$:$1$
(D) $3$:$2$
::: explanation
Touch-count rule: horizontal-tangent touches go upstairs as $f_Y$'s denominator partner — $f_Y/f_X = T_X/T_Y = 1/3$. Orientation (X-touches upstairs) decides; recount rather than guess.
:::

::: quiz Q3: Numerical Drill
$6$ div peak-to-peak at $5$ V/div; $4$ div per cycle at $2$ ms/div. $V_{rms}$ (sine)? frequency?
(A) $30$ V, $500$ Hz
(*B) $V_{pp} = 30$ V → $V_m = 15$ → $V_{rms} \approx 10.6$ V; $T = 8$ ms → $125$ Hz
(C) $30$ V RMS, $125$ Hz
(D) $10.6$ Vpp, $8$ ms
::: explanation
$V_{rms} = V_{pp}/(2\sqrt2) = 30/2.828 \approx 10.6$; $T = 4\times2 = 8$ ms → $125$ Hz. pp→RMS chain ($/2\sqrt2$) and div→time chain are the two conversions — run both, label both.
:::
