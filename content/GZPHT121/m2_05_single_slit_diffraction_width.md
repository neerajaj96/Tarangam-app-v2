# Single-Slit Diffraction: Minima and Width

**Bending around one slit — central maximum, dark-fringe ladder, and slit-width measurement.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Crowd Through a Door
A wide door lets a crowd march straight (sharp shadow); a narrow door forces them to fan out sideways (spreading). Light through a slit of width $a \sim \lambda$ fans into a broad central hump flanked by dark gaps. Narrower slit = wider fan (uncertainty-like trade: confine position, spread direction). The dark gaps sit exactly where wavelets from the two half-slits cancel pairwise.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Minima condition

Divide the slit into Fresnel half-zones; path difference between edge rays at angle $\theta$ is $a\sin\theta$. Dark (pairwise cancellation):

$$a\sin\theta_n = n\lambda \qquad n = \pm1, \pm2, \dots$$

Central maximum spans $- \lambda/a$ to $+\lambda/a$ (width $2\lambda/a$ in $\sin\theta$; linear width $2D\lambda/a$ on a screen at distance $D$). Secondary maxima sit between, fading fast ($\approx 1/22$, $1/61$ of central intensity).

### 2.2 Slit-width experiment

Measure first-minimum position $x_1$ on screen distance $D$: $\sin\theta_1 \approx x_1/D$, so $a = \lambda D/x_1$. Laser + millimetre screen makes this a bench-top measurement.

### 2.3 Types of diffraction (one-line contrast)

* **Fresnel (near-field):** source/screen close, spherical wavefronts, no lenses.
* **Fraunhofer (far-field):** source/screen at infinity via lenses, plane wavefronts — single-slit and grating formulas assume Fraunhofer.

::: callout-formula KTU Formula Vault: Single Slit
Dark: **$a\sin\theta = n\lambda$** · central width **$2\lambda/a$** (angular) / **$2D\lambda/a$** (linear) · slit from first minimum **$a=\lambda D/x_1$** · Fresnel = near/spherical, Fraunhofer = far/plane.
:::

::: callout-pitfall Interference $n\lambda$ vs Diffraction $n\lambda$
Interference-bright and single-slit-dark *both* read $n\lambda$ — students cross them. Tag every equation: grating-bright $(a+b)\sin\theta=n\lambda$ vs slit-dark $a\sin\theta=n\lambda$. Same symbols, opposite fringes.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$\lambda = 650$ nm, slit $a = 0.13$ mm, screen $D = 2.0$ m. Where is the first minimum, and how wide is the central maximum?
:::

::: step [Step 2: Execution] Small-Angle Arithmetic
1. $\sin\theta_1 = \lambda/a = 650\times10^{-9}/1.3\times10^{-4} = 5.0\times10^{-3}$ → $x_1 = D\sin\theta_1 = 2.0 \times 5.0\times10^{-3} = 10$ mm.
2. Central width $= 2x_1 = 20$ mm. Halve the slit and the hump doubles to $40$ mm.
:::

::: step [Step 3: Conclusion] Final Result
First minimum at $\pm 10$ mm, central hump $20$ mm wide. Inverse scaling ($x_1 \propto 1/a$) is the whole exam point — quote it.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What is the condition for the $n$th minimum in single-slit Fraunhofer diffraction?
(A) $a\sin\theta = (2n+1)\lambda/2$
(*B) $a\sin\theta = n\lambda$
(C) $a\sin\theta = n\lambda/2$
(D) $a\cos\theta = n\lambda$
::: explanation
Splitting the slit into two halves, rays $a/2$ apart cancel when their path difference is $\lambda/2$ — total edge difference $a\sin\theta = \lambda$, and integer multiples repeat the pairing. Hence dark at every $n\lambda$.
:::

::: quiz Q2: Foundational Concept
Slit width is halved. What happens to the central maximum?
(A) It halves
(*B) It doubles in width — confinement spreads the beam ($2D\lambda/a$)
(C) It disappears
(D) It stays identical
::: explanation
Width $\propto 1/a$: squeezing position spreads momentum/direction. This inverse law is the wave analogue of uncertainty and a favourite one-mark question.
:::

::: quiz Q3: Numerical Drill
First minimum at $8$ mm on a $1.6$ m screen with He-Ne $632.8$ nm. Slit width?
(A) $632.8$ μm
(*B) $a = \lambda D/x = 632.8\text{nm}\times1.6/0.008 \approx 126.6$ μm
(C) 8 mm
(D) 1.6 mm
::: explanation
$a = \lambda D/x_1 = (632.8\times10^{-9}\times1.6)/(8\times10^{-3}) = 1.266\times10^{-4}$ m $\approx 127\,\mu$m — a human-hair-scale slit measured from a metre away.
:::
