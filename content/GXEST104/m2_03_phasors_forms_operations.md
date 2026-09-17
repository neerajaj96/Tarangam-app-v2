# Phasors: Trig, Rectangular, Polar & Complex Forms

**Frozen sine waves as vectors — four interchangeable notations and arithmetic without differentiation.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Clock Hands at Midnight Photo
A phasor photographs the spinning ladder at $t = 0$: length $=$ RMS magnitude, angle $=$ phase. Adding sines = placing clock-hands tip-to-tail (parallelogram) — no calculus, just geometry. Four photo formats (trig expression, $a+jb$, $M\angle\phi$, $Me^{j\phi}$) describe the same hand; fluency is switching formats per operation (add in rectangular, multiply/divide in polar).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The four forms (same phasor $\mathbf{V}$)

Trig: $v = V_m\sin(\omega t\pm\phi)$ · rectangular: $a+jb$ · polar: $M\angle\phi$ · exponential: $Me^{j\phi}$, with $M = \sqrt{a^2+b^2}$, $\phi = \tan^{-1}(b/a)$ (quadrant-aware!).

### 2.2 Operation grammar

Add/subtract in **rectangular**; multiply/divide in **polar** (magnitudes $\times/\div$, angles $+/-$); $j$ = $+90^\circ$ rotation ($j^2 = -1$). Lead/lag: current angle minus voltage angle; $+$ = leading.

::: callout-formula KTU Formula Vault: Phasor Forms
$a+jb \leftrightarrow M\angle\phi$ · add in **rect**, scale in **polar** · $j$ rotates **$+90^\circ$**.
:::

::: callout-pitfall Arctan Quadrant Blindness
$a<0$ needs $\pm180^\circ$ correction ($\tan^{-1}$ alone lands opposite). Second/third-quadrant phasors with first-quadrant angles invert every downstream sum — sketch the quadrant before accepting $\phi$.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Add $v_1 = 30\sin\omega t$ and $v_2 = 40\sin(\omega t+90^\circ)$ as phasors (RMS). Express the sum in polar and trig forms.
:::

::: step [Step 2: Execution] Rectangles Then Hypotenuse
1. RMS phasors: $\mathbf{V}_1 = 21.21\angle0^\circ = 21.21+j0$; $\mathbf{V}_2 = 28.28\angle90^\circ = 0+j28.28$.
2. Sum $= 21.21+j28.28$: $M = \sqrt{450+800} = \sqrt{1250} \approx 35.36$, $\phi = \tan^{-1}(28.28/21.21) \approx 53.1^\circ$. Trig: $v = 50\sin(\omega t+53.1^\circ)$ (peak $35.36\sqrt2 = 50$ ✓ $3$-$4$-$5$ triangle scaled).
:::

::: step [Step 3: Conclusion] Final Result
Rectangular adds, polar reports, $3$-$4$-$5$ recognises. The scaled Pythagorean triple is the examiner's favourite rigged sum — spot it.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$\mathbf{V} = 6+j8$ V (RMS). Polar form?
(A) $14\angle53^\circ$
(*B) $10\angle53.1^\circ$ ($6$-$8$-$10$ triangle)
(C) $10\angle36.9^\circ$
(D) $8\angle6^\circ$
::: explanation
$M = \sqrt{36+64} = 10$; $\phi = \tan^{-1}(8/6) \approx 53.1^\circ$ (opposite/adjacent $= 8/6$, angle off the real axis). $36.9^\circ$ is its complement — the adjacent/opposite swap trap.
:::

::: quiz Q2: Foundational Concept
Multiply $(5\angle30^\circ)(2\angle-15^\circ)$:
(A) $7\angle15^\circ$
(*B) $10\angle15^\circ$ — magnitudes multiply, angles add
(C) $10\angle-450^\circ$
(D) $3\angle45^\circ$
::: explanation
Polar multiplication: $5\times2 = 10$, $30+(-15) = 15^\circ$. Rectangular would need FOIL + $j^2$ bookkeeping — format choice is the time-saver being tested.
:::

::: quiz Q3: Foundational Concept
Current $\mathbf{I} = 5\angle+30^\circ$ with $\mathbf{V} = 100\angle0^\circ$. Leading or lagging?
(A) Lagging $30^\circ$
(*B) Leading $30^\circ$ — current phase minus voltage phase is positive
(C) In phase
(D) Cannot tell
::: explanation
Lead/lag reads $I$ relative to $V$: $\phi_I - \phi_V = +30^\circ$ ⇒ current peaks earlier ⇒ leading (capacitive flavour). Sign of the difference is the whole verdict.
:::
