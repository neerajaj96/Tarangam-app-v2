# RL, RC & RLC Series Circuits

**Impedance triangles, the resonance peak, and current through complex division — with the animated triangle.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Tug of Rope Teams
Resistor pulls in-phase (east); inductor pulls north ($+jX_L$), capacitor south ($-jX_C$) — north and south partially cancel ($X = X_L-X_C$), east never cancels. Resultant rope angle $\phi$ sets current lag/lead; rope length $|Z|$ sets current size. At **resonance** ($X_L = X_C$) the vertical teams annihilate: pure resistance, maximum current, unity power factor.
:::

::: anim rlc-triangle Voltage Triangle in Action
Foot first (VR), then the net reactive rise, then the VS hypotenuse — the angle at the heel is φ, and cos φ is the power factor.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Series impedance and resonance

$$Z = R + j(X_L - X_C), \quad |Z| = \sqrt{R^2+X^2}, \quad \phi = \tan^{-1}(X/R)$$

$$I = V/Z \quad (\text{complex division}), \qquad f_0 = \frac{1}{2\pi\sqrt{LC}}$$

At $f_0$: $Z = R$ (minimum), $I$ maximum, $V_L = V_C$ (may hugely exceed supply — voltage magnification, $Q$-factor $Q = \omega_0L/R$).

### 2.2 RL / RC as one-sided cases

RL: $Z = R+jX_L$ (lagging $\phi$); RC: $Z = R-jX_C$ (leading $\phi$). Same triangle with one vertical team missing.

::: callout-formula KTU Formula Vault: Series AC
**$Z=R+j(X_L-X_C)$** · $|Z|$, $\phi$ by triangle · resonance **$f_0=1/2\pi\sqrt{LC}$** · $Q=\omega_0L/R$.
:::

::: callout-pitfall $V_R+V_L \ne V_S$ Arithmetically
Series voltages add as *phasors*: $V_S = \sqrt{V_R^2+(V_L-V_C)^2}$. Scalar addition overstates the supply (e.g. $3+4 = 7 \ne 5$ for the classic $3$-$4$-$5$ case) — draw the triangle, don't sum the magnitudes.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$R = 3\,\Omega$, $X_L = 6\,\Omega$, $X_C = 2\,\Omega$ series, $V = 50$ V. Find $Z$, $I$, $\phi$, and each element voltage. Verify the triangle.
:::

::: step [Step 2: Execution] Triangle Arithmetic
1. $X = 4\,\Omega$; $|Z| = 5\,\Omega$; $\phi = \tan^{-1}(4/3) \approx 53.1^\circ$ lagging; $I = 10$ A.
2. $V_R = 30$, $V_L = 60$, $V_C = 20$ V. Check: $\sqrt{30^2+40^2} = 50$ ✓ ($3$-$4$-$5$ scaled by $10$).
:::

::: step [Step 3: Conclusion] Final Result
$3$-$4$-$5$ recognition ($R$-$X$-$Z$) shortcuts the whole question; the phasor-sum audit closes it. Rigged triples appear constantly — memorise $3$-$4$-$5$ and $5$-$12$-$13$.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$R = 4$, $X_L = 10$, $X_C = 7$ ($\Omega$), $V = 65$ V series. Current?
(A) $16.25$ A
(*B) $X = 3$, $|Z| = 5$: $I = 13$ A lagging ($\phi = 36.9^\circ$)
(C) $5$ A
(D) $65$ A
::: explanation
Net $X = 3$; $4$-$3$-$5$ triangle gives $|Z| = 5$, $I = 13$. $V_R = 52$, $V_L-V_C = 39$: $\sqrt{52^2+39^2} = 65$ ✓.
:::

::: quiz Q2: Foundational Concept
At series resonance, which statements hold?
(A) Current minimum, PF zero
(*B) $X_L = X_C$, $|Z| = R$ minimum, current maximum, PF unity, $V_L = V_C$ (possibly $> V_S$)
(C) Circuit opens
(D) $R$ vanishes
::: explanation
Cancellation leaves pure $R$: max current, in-phase (unity PF). L/C voltages equal-opposite — each can dwarf the supply at high $Q$ (an insulation watch-point, not a paradox).
:::

::: quiz Q3: Numerical Drill
$L = 0.1$ H, $C = 100\,\mu$F. Resonant frequency?
(A) $50$ Hz
(*B) $f_0 = 1/(2\pi\sqrt{0.1\times10^{-4}}) = 1/(2\pi\times3.162\times10^{-3}) \approx 50.3$ Hz — mains-adjacent by design here
(C) $503$ Hz
(D) $5$ Hz
::: explanation
$\sqrt{LC} = \sqrt{10^{-5}} \approx 3.162\times10^{-3}$; $f_0 \approx 50.3$ Hz. Decade errors (µF→F) shift answers $10\times$ — convert capacitance first, always.
:::
