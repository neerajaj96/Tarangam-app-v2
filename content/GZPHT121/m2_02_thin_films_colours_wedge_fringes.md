---
id: m2_02_thin_films_colours_wedge_fringes
courseCode: GZPHT121
module: 2
sequence: 2
title: 'Thin Films & Colours: Wedge Conditions'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Explain thin-film colours with near-normal reflected conditions
  - Measure small angles with the wedge-fringe width ruler
  - Choose the bright-or-dark condition for reflected versus liquid cases
concepts:
  - thin-film colours
  - wedge fringes
prerequisites:
  - m2_01_superposition_path_difference_cosine_law
examRelevance: high
tags:
  - interference
  - thin-films
---
# Thin Films & Colours: Wedge Conditions

**Why soap bubbles shimmer — near-normal film colours, order sorting, and the wedge-fringe ruler.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Rainbow Sandwich
White light hits a soap film: the top and bottom reflections rejoin after the second has dived through the film and back. Each colour has its own wavelength-ruler, so at a given thickness only the colours fitting the bright condition survive — the rest cancel. Vary the thickness (draining soap, wedge) and different colours light up at different places: nature's contour map of thickness in colour.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Colours in thin films

At near-normal incidence ($r \approx 0$), reflected bright: $2\mu t = n\lambda$. For fixed $t$ only discrete $\lambda$ satisfy this — white light minus cancelled colours = vivid hue. Thicker film → higher orders overlap → colours wash toward white (higher-order bleaching).

### 2.2 Wedge film (angle $\alpha$, air $\mu \approx 1$)

Thickness grows linearly $t = x\tan\alpha \approx x\alpha$. Fringes of equal thickness run parallel to the wedge apex; fringe width (bright-to-bright):

$$\beta = \frac{\lambda}{2\alpha} \quad (\text{air wedge, normal incidence})$$

Dark fringe at the apex ($t = 0$ gives destructive pairing due to the half-wave flip) — the apex test proves the reversal.

### 2.3 What changes with a liquid between the plates

Replace air by $\mu$: $\beta = \lambda/(2\mu\alpha)$ — fringes squeeze by $\mu$.

::: callout-formula KTU Formula Vault: Films
Reflected bright **$2\mu t\cos r=n\lambda$** · wedge width **$\beta=\lambda/(2\alpha)$** (divide by $\mu$ in liquid) · apex is **dark** · colour = surviving $\lambda$ at that $t$.
:::

::: callout-pitfall Apex Colour Amnesia
Apex ($t=0$) is *dark* in reflection, bright in transmission. Writing "apex bright" for a reflected wedge instantly contradicts the half-wave flip — examiners deduct for it every time.
:::

### 2.4 Bright-or-dark chooser (which condition where)

| Setup | Bright | Dark | It measures |
|---|---|---|---|
| Film, reflected | $2\mu t\cos r = n\lambda$ | $2\mu t\cos r = (2n+1)\lambda/2$ | $t$, $\lambda$, $\mu$ |
| Film, transmitted | swapped (no net flip) | swapped | same, cross-check |
| Air wedge | same reflected pair, $\beta = \lambda/2\alpha$ | apex dark always | $\alpha$, sheet $d$ |
| Newton's rings | $D_n^2 = 4n\lambda R$ | centre dark | $\lambda$, liquid $\mu$ |

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
An air wedge shows $20$ fringes over $1.0$ cm with $\lambda = 589$ nm. Find the wedge angle. What happens to fringe width if oil ($\mu = 1.4$) fills the gap?
:::

::: step [Step 2: Execution] Measuring the Angle
1. $\beta = 1.0\,\text{cm}/20 = 0.5$ mm. $\alpha = \lambda/(2\beta) = 589\times10^{-9}/(2\times0.5\times10^{-3}) = 5.89\times10^{-4}$ rad $\approx 0.034^\circ$.
2. Oil: $\beta' = \beta/\mu = 0.5/1.4 \approx 0.357$ mm — $\approx 28$ fringes now fit in the same length.
:::

::: step [Step 3: Conclusion] Final Result
Count fringes → width → angle via $\lambda/2\alpha$. Any liquid squeezes fringes by exactly its $\mu$ — the standard "what changes" follow-up.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
A soap film glows green in white light at one spot. Why?
(A) The soap is green dye
(*B) At that thickness only green satisfies the bright condition; other colours destructively cancel
(C) Green light is faster
(D) The film absorbs green only
::: explanation
Interference is a wavelength filter: $2\mu t = n\lambda$ picks winners per thickness. White minus losers = the surviving hue. Move to a thicker spot and the winner changes — hence travelling rainbow bands.
:::

::: quiz Q2: Foundational Concept
The apex of an air wedge in reflected light is dark. Why is this significant?
(A) It proves glass is opaque
(*B) It confirms the half-wave ($\pi$) phase reversal on denser reflection — zero path still gives destructive pairing
(C) It means the light is switched off
(D) It happens in every optical system
::: explanation
At $t=0$ both reflections coincide geometrically; darkness can only come from a relative $\pi$ flip between them. The dark apex is the cleanest experimental proof of the reversal.
:::

::: quiz Q3: Numerical Drill
Wedge angle doubles. Fringe width?
(A) Doubles
(*B) Halves — $\beta \propto 1/\alpha$
(C) Unchanged
(D) Becomes zero
::: explanation
$\beta = \lambda/(2\alpha)$: steeper wedge means thickness grows faster with $x$, so the next bright order arrives sooner — fringes pack tighter in exact inverse proportion.
:::
