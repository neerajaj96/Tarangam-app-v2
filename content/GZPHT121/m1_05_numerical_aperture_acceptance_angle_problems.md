# Numerical Aperture & Acceptance Angle: Derivation and Problems

**The two most-numerical formulas of Module 1 — derived once, then drilled through every KTU variation.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Funnel Mouth
A fibre is a funnel for light: rays entering nearly head-on get trapped; rays entering too sideways smash through the wall and escape. The **acceptance angle** $\theta_a$ is how wide you can open the funnel mouth; the **numerical aperture** $\text{NA} = \sin\theta_a$ is that width as a single number. Bigger index step ($n_1 - n_2$) = wider mouth = more light gathered but more modes and dispersion.
:::

::: anim fiber-cone Funnel Mouth Sets the Catch
Rays inside $\theta_a$ refract in and trap; steeper rays smash through — $\text{NA} = \sin\theta_a$ prices the mouth about to be derived.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Derivation

Launch from air ($n_0 \approx 1$) at angle $\theta_a$ to the axis; refract into core ($n_1$) at angle $r$, then strike the core–cladding wall at $\phi = 90^\circ - r$. For trapping, $\phi \ge \phi_c$ with $\sin\phi_c = n_2/n_1$.

Snell at entry: $n_0\sin\theta_a = n_1\sin r = n_1\sin(90^\circ-\phi) = n_1\cos\phi$. At the limiting case $\phi = \phi_c$:

$$n_0\sin\theta_a = n_1\cos\phi_c = n_1\sqrt{1-\sin^2\phi_c} = n_1\sqrt{1-(n_2/n_1)^2} = \sqrt{n_1^2-n_2^2}$$

Hence, with $n_0 = 1$:

$$\text{NA} = \sin\theta_a = \sqrt{n_1^2 - n_2^2}$$

With relative index difference $\Delta = (n_1-n_2)/n_1$: $\text{NA} \approx n_1\sqrt{2\Delta}$. Acceptance cone half-angle $\theta_a = \sin^{-1}(\text{NA})$; in a denser medium $n_0$, $\text{NA} = n_0\sin\theta_a$.

### 2.2 V-number (exam bonus)

Normalised frequency $V = (2\pi a/\lambda)\cdot\text{NA}$ ($a$ = core radius). Single-mode iff $V < 2.405$. Number of modes $\approx V^2/2$ (step-index multimode).

::: callout-formula KTU Formula Vault: Fibre Numerics
**$\text{NA}=\sin\theta_a=\sqrt{n_1^2-n_2^2}\approx n_1\sqrt{2\Delta}$** · $\Delta=(n_1-n_2)/n_1$ · $V=(2\pi a/\lambda)\text{NA}$ · single-mode $V<2.405$ · fractional index change and $\Delta$ in percent are favourite twists.
:::

::: callout-pitfall Three Classic Slips
1. Using diameter instead of radius $a$ in $V$. 2. Forgetting $n_0$ when the launch medium isn't air. 3. Reporting $\theta_a$ in radians without converting — KTU expects degrees for acceptance angle.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Core $n_1 = 1.50$, cladding $n_2 = 1.47$, air launch. Find NA, acceptance angle, and check single-mode status for core radius $a = 4\,\mu$m at $\lambda = 1300$ nm.
:::

::: step [Step 2: Execution] Computing
1. $\text{NA} = \sqrt{1.50^2-1.47^2} = \sqrt{2.25-2.1609} = \sqrt{0.0891} \approx 0.298$.
2. $\theta_a = \sin^{-1}(0.298) \approx 17.3^\circ$ (full cone $\approx 34.7^\circ$).
3. $V = (2\pi \times 4\times10^{-6}/1.3\times10^{-6})\times 0.298 \approx 19.33 \times 0.298 \approx 5.76 > 2.405$ → multimode ($\sim V^2/2 \approx 17$ modes).
:::

::: step [Step 3: Conclusion] Final Result
NA $\approx 0.30$, acceptance half-angle $\approx 17^\circ$, and the fibre is multimode at $1300$ nm — halving the core radius or doubling $\lambda$ would push it toward single-mode.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
A fibre has $n_1 = 1.48$, $n_2 = 1.46$. What is its NA and acceptance half-angle in air?
(A) NA 0.10, angle 5.7°
(*B) NA ≈ 0.242, angle ≈ 14°
(C) NA 1.02, angle 90°
(D) NA 0.02, angle 1.1°
::: explanation
$\text{NA}=\sqrt{1.48^2-1.46^2}=\sqrt{2.1904-2.1316}=\sqrt{0.0588}\approx 0.242$; $\theta_a=\sin^{-1}(0.242)\approx 14^\circ$. Any answer above 1.0 for NA in air is instantly impossible ($\sin\theta\le 1$).
:::

::: quiz Q2: Numerical Drill
If the cladding index rises toward the core index (smaller $\Delta$), what happens to light-gathering?
(A) NA increases
(*B) NA decreases — narrower acceptance cone, fewer modes, less dispersion but harder launching
(C) No change
(D) Fibre becomes automatically single-mode at all wavelengths
::: explanation
$\text{NA}=\sqrt{n_1^2-n_2^2}$ shrinks as $n_2\to n_1$. Designers trade gathering power against modal dispersion this way — telecom single-mode fibres deliberately use tiny $\Delta$.
:::

::: quiz Q3: Numerical Drill
Core diameter $10\,\mu$m ($a=5\,\mu$m), NA $0.12$, $\lambda = 1550$ nm. Single-mode?
(A) Yes, $V = 1.2$
(*B) No — $V = (2\pi\times5/1.55)\times0.12 \approx 2.43 > 2.405$, just multimode (borderline)
(C) Cannot decide without cladding thickness
(D) Yes because NA < 0.2 always means single-mode
::: explanation
$2\pi a/\lambda \approx 20.27$; times $0.12$ gives $\approx 2.43$, marginally above the $2.405$ cutoff — technically two-moded. This borderline style (cutoff engineering by $a$, NA, $\lambda$) is a favourite 3-mark twist.
:::
