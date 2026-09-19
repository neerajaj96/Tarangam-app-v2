# Superposition, Path Difference & the Cosine Law

**How two light waves add — constructive vs destructive, optical path, phase difference, and the reflected-system cosine law.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Two Ripples Meeting
Drop two stones in a pond: where crest meets crest the water jumps double (constructive); where crest meets trough they flatten (destructive). Light does the same, but the "distance" that matters is counted in *wavelengths travelled inside each material* — the **optical path** $n \times$ geometric path. A mirror flip adds a hidden half-wavelength penalty (phase reversal), which is why thin-film formulas carry that mysterious extra $\lambda/2$.
:::

::: anim fringe-profile Equal Peaks, Equal Zeros
Bright where path difference hits $n\lambda$, dark at half-steps — the profile every interference question sketches first.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Superposition and coherence

**Principle of superposition:** resultant displacement $y = y_1 + y_2$. Sustained interference needs **coherent** sources — constant phase difference (same frequency, ideally same source split in two). Two independent bulbs never interfere stably.

### 2.2 Phase difference vs path difference

For path difference $\Delta$ at wavelength $\lambda$:

$$\delta = \frac{2\pi}{\lambda}\,\Delta$$

Constructive (bright): $\Delta = n\lambda$, $\delta = 2n\pi$. Destructive (dark): $\Delta = (2n+1)\lambda/2$, $\delta = (2n+1)\pi$.

### 2.3 Cosine law — reflected system (thin film at near-normal incidence)

Two reflections (top + bottom of film of thickness $t$, index $\mu$): geometric path $2t$, optical path $2\mu t$; bottom reflection at denser medium adds phase $\pi$ ($\lambda/2$). With refraction angle $r$:

$$2\mu t\cos r = n\lambda \quad \text{(bright, reflected)}$$

$$2\mu t\cos r = (2n+1)\lambda/2 \quad \text{(dark, reflected)}$$

Transmitted system is complementary (no net reversal): conditions swap. At normal incidence $\cos r = 1$.

::: callout-formula KTU Formula Vault: Interference Conditions
$\delta = 2\pi\Delta/\lambda$ · bright $\Delta=n\lambda$ · dark $\Delta=(2n+1)\lambda/2$ · reflected film: **$2\mu t\cos r = n\lambda$ bright, $(2n+1)\lambda/2$ dark** · transmitted: reversed.
:::

::: callout-pitfall The Half-Wave Flip
Reflection off a *denser* medium adds $\pi$ phase ($\lambda/2$ path); off a *rarer* medium adds nothing. Forgetting this flip swaps bright and dark — the single commonest derivation error. State it explicitly before writing the cosine law.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Two coherent waves of $\lambda = 600$ nm meet with geometric path difference $1.8\,\mu$m in air. Bright or dark? What if one beam crossed a glass slab adding $\lambda/2$ optical extra?
:::

::: step [Step 2: Execution] Counting Wavelengths
1. $\Delta/\lambda = 1800/600 = 3.0$ exactly → integer → constructive (bright), phase $6\pi$.
2. Extra $\lambda/2$ makes $\Delta = 3.5\lambda$ → half-integer → destructive. A half-wave slab flips the fringe.
:::

::: step [Step 3: Conclusion] Final Result
Integer wavelengths = bright, half-integer = dark. Every interference numerical is this ratio test dressed in different optics — always reduce $\Delta$ to units of $\lambda$ first.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why do two independent sodium lamps not give sustained interference fringes?
(A) They are too bright
(*B) They are incoherent — random rapidly-varying phase difference washes fringes out
(C) Their wavelength is wrong
(D) They emit only one photon each
::: explanation
Sustained fringes need a *constant* phase relation. Independent sources drift randomly billions of times per second, so bright/dark positions scramble faster than the eye can follow — uniform illumination results.
:::

::: quiz Q2: Foundational Concept
In the reflected thin-film system, why does the bright condition read $2\mu t\cos r = n\lambda$?
(A) There is no reflection at all
(*B) One of the two reflections suffers a $\pi$ ($\lambda/2$) reversal, shifting the integer condition to the bright fringe
(C) Glass absorbs half the wavelength
(D) The film thickness is always zero
::: explanation
Top (rarer-bound) reflection: no flip; bottom (denser-bound) reflection: $\pi$ flip. The extra half-wave means zero geometric path still gives destructive pairing — hence integers go bright in reflection (and dark in transmission where flips cancel).
:::

::: quiz Q3: Foundational Concept
Path difference $2.5\lambda$ gives what fringe?
(A) Bright
(*B) Dark — half-integer multiple
(C) No light at all
(D) Always white
::: explanation
$2.5 = 5/2 = (2\times2+1)/2$ — odd multiple of $\lambda/2$ means crest meets trough: destructive (dark). Integer test first, always.
:::
