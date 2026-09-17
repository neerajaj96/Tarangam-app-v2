# Newton's Rings: Wavelength Measurement

**Rings of equal thickness under a lens — geometry, dark-centre logic, and the diameter-squared law.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Bowl on a Mirror
Rest a watch-glass (curved lens) on a flat mirror: the air gap is zero at the centre and grows outward like a bowl. Each ring marks places where the gap has the *same* thickness — a contour map of the bowl in light. Bigger lens radius = flatter bowl = wider-spaced rings; shorter wavelength = finer ruler = tighter rings.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Geometry

Lens radius of curvature $R$, ring radius $r_n$ at gap $t$: $r_n^2 = 2Rt - t^2 \approx 2Rt$ (since $t \ll R$). Reflected dark condition ($2t = n\lambda$ in air):

$$r_n^2 = n\lambda R \qquad D_n^2 = 4n\lambda R$$

Centre ($t=0$) is **dark** (half-wave flip again). Diameters grow as $\sqrt{n}$ — rings crowd outward.

### 2.2 Wavelength by diameter differences

Subtract two orders to kill the unknown zero-contact error:

$$\lambda = \frac{D_{n+m}^2 - D_n^2}{4mR}$$

Measure diameters with a travelling microscope, plot $D^2$ vs $n$ (straight line, slope $4\lambda R$).

::: callout-formula KTU Formula Vault: Newton's Rings
$r_n^2=n\lambda R$, **$D_n^2=4n\lambda R$** · **$\lambda=(D_{n+m}^2-D_n^2)/4mR$** · centre dark · rings $\propto\sqrt{n}$.
:::

::: callout-pitfall Diameter vs Radius Factor 4
$r_n^2 = n\lambda R$ but $D_n^2 = 4n\lambda R$. Mixing them drops a factor of 4 — the single most-lost numerical mark in this chapter. Always square the *diameter* as measured, then divide by $4mR$.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
With $R = 1.0$ m and sodium light, the 10th dark ring diameter is $4.85$ mm and the 20th is $6.86$ mm. Verify the wavelength.
:::

::: step [Step 2: Execution] Applying the Difference Law
$D_{20}^2 - D_{10}^2 = (6.86^2 - 4.85^2)\,\text{mm}^2 = (47.06 - 23.52)\times10^{-6}\,\text{m}^2 = 23.54\times10^{-6}\,\text{m}^2$. With $m = 10$ and $R = 1.0$ m: $\lambda = 23.54\times10^{-6}/(4\times10\times1.0) = 5.885\times10^{-7}$ m $\approx 589$ nm — the sodium D-line, exactly as expected.
:::

::: step [Step 3: Conclusion] Final Result
Method: square, subtract, divide by $4mR$. And always compare the answer with the expected colour band — landing on $\approx 589$ nm for a sodium source confirms both apparatus and arithmetic.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why is the centre of Newton's rings dark in reflected light?
(A) No light reaches the centre
(*B) Zero air-film thickness plus the half-wave reversal gives destructive pairing
(C) The lens absorbs central light
(D) The microscope blocks it
::: explanation
At contact $t=0$ the two reflections overlap geometrically, but the denser-bound one carries an extra $\pi$ phase — crest on trough, hence dark. Same flip as the wedge apex.
:::

::: quiz Q2: Foundational Concept
Why use $D_{n+m}^2 - D_n^2$ instead of a single ring?
(A) It looks more impressive
(*B) Differencing cancels the unknown zero-contact error (dust/imperfect touch shifts all orders equally)
(C) Single rings have no wavelength dependence
(D) Microscopes cannot measure single rings
::: explanation
Real contact is never ideal — an extra $t_0$ adds a constant to every $D^2$. Subtraction removes it, leaving pure $4m\lambda R$. KTU awards marks for stating this explicitly.
:::

::: quiz Q3: Numerical Drill
$D_5 = 4.0$ mm, $D_{15} = 6.1$ mm, $R = 0.9$ m. Find $\lambda$.
(A) 1200 nm
(*B) $(37.21-16)\times10^{-6}/(4\times10\times0.9) = 21.21\times10^{-6}/36 \approx 5.89\times10^{-7}$ m ≈ 589 nm
(C) 400 nm
(D) 250 nm
::: explanation
$D^2$ difference $= (6.1^2-4.0^2) = (37.21-16) = 21.21\,\text{mm}^2 = 21.21\times10^{-6}\,\text{m}^2$; $4mR = 4\times10\times0.9 = 36$. Quotient $\approx 0.589\times10^{-6}$ m $= 589$ nm — the sodium line, confirming consistent data.
:::
