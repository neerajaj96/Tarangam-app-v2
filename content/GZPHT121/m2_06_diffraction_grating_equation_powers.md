# Diffraction Grating: Equation, Dispersive and Resolving Power

**Thousands of slits acting as one — the grating equation, spectra orders, and the two "powers" asked only qualitatively.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Staircase Echo
One slit whispers in all directions; $N$ evenly spaced slits shout in step only along directions where every slit's wave arrives in phase — a staircase where each step adds exactly one wavelength of delay. Other directions self-cancel. Finer grating (more lines per cm) = steeper staircase = colours fan wider (dispersion); more total lines = narrower, sharper shouts (resolution).
:::

::: anim grating-fan Zero Straight, Orders Fanned
$n = 0$ stays white and straight; $\pm1$, $\pm2$ fan wider per order with red outermost — the equation drawn, not just written.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Construction and grating equation

Plane transmission grating: glass with $N$ lines per unit length (e.g. $15{,}000$ lines/inch), slit separation (grating element) $d = a+b = 1/N$. At normal incidence, bright spectra (reinforcement across all slits):

$$(a+b)\sin\theta_n = n\lambda \qquad n = 0, \pm1, \pm2, \dots$$

$n = 0$ central (all colours overlap, white); higher orders fan into spectra (red outmost since $\theta \propto \lambda$).

### 2.2 Laser wavelength with a grating

Measure $n$th-order angle $\theta_n$: $\lambda = d\sin\theta_n/n$. Millimetre-scale-as-grating variant: $d = 1$ mm, same formula.

### 2.3 Dispersive and resolving power (qualitative)

* **Dispersive power** $D = d\theta/d\lambda = n/(d\cos\theta)$ — angular spread per unit wavelength; grows with order $n$ and finer ruling (smaller $d$).
* **Resolving power** $R = \lambda/d\lambda = nN_{total}$ — smallest wavelength gap still separable; grows with order and *total* lines illuminated. Narrower slit-source and wider beam (more lines) sharpen lines.

::: callout-formula KTU Formula Vault: Grating
**$(a+b)\sin\theta_n = n\lambda$**, $d = 1/N$ · $\lambda = d\sin\theta_n/n$ · dispersive $n/(d\cos\theta)$ · resolving $nN$ · red deviated most.
:::

::: callout-pitfall $N$ Has Two Meanings
$N$ = lines *per unit length* (ruling density, gives $d = 1/N$) vs $N_{total}$ = total illuminated lines (gives $R = nN_{total}$). Using ruling density inside the resolving-power formula is the classic confusion — check units: $R$ is dimensionless and needs a pure count.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A grating with $6000$ lines/cm gives first-order red at $\theta = 22^\circ$. Find $\lambda$. How would you increase the spread between close lines?
:::

::: step [Step 2: Execution] One Division, One Prescription
1. $d = 1/6000$ cm $= 1.667\times10^{-6}$ m. $\lambda = d\sin22^\circ/1 = 1.667\times10^{-6}\times0.3746 \approx 6.24\times10^{-7}$ m $\approx 624$ nm (red, correct band).
2. More spread: use higher order ($n=2$), finer grating (larger $N$), or illuminate at grazing angles ($\cos\theta$ smaller) — all raise $D = n/(d\cos\theta)$.
:::

::: step [Step 3: Conclusion] Final Result
Grating numericals are single-division; the theory marks come from prescribing dispersion/resolution improvements qualitatively.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
In the grating spectrum, which colour is deviated most and why?
(A) Violet, because it is brighter
(*B) Red, because $\sin\theta_n = n\lambda/d$ grows with $\lambda$
(C) Green always, regardless of order
(D) All colours overlap in every order
::: explanation
Longer $\lambda$ needs a larger angle to accumulate the same $n\lambda$ path step between slits. Only the zero order ($n=0$, $\theta=0$) overlaps all colours.
:::

::: quiz Q2: Foundational Concept
How do dispersive and resolving power differ?
(A) They are identical
(*B) Dispersive power = angular spread per nm ($n/d\cos\theta$); resolving power = finest separable fractional gap ($nN_{total}$)
(C) Dispersive needs total lines, resolving needs ruling density
(D) Neither depends on order
::: explanation
Dispersion fans colours apart (ruling fineness + order); resolution decides whether two fanned lines are still distinguishable (total lines + order). Both rise with $n$, but through different $N$'s.
:::

::: quiz Q3: Numerical Drill
Grating element $d = 2.5\,\mu$m, $\lambda = 500$ nm. Highest visible order?
(A) 10
(*B) $n_{max} < d/\lambda = 5.0$, so $n = 4$ (since $\sin\theta \le 1$, $n=5$ would need $\sin\theta = 1$ exactly at grazing — normally quoted as 4 usable)
(C) Infinite
(D) 1
::: explanation
$n = d\sin\theta/\lambda \le d/\lambda = 5.0$. $n=5$ sits exactly at $90^\circ$ (unobservable); usable spectra are $n \le 4$. This cutoff reasoning ($\sin\theta\le1$) is the standard "maximum order" question.
:::
