---
id: m4_05_ultrasonics_piezoelectric_diffractometer
courseCode: GZPHT121
module: 4
sequence: 5
title: 'Ultrasonics: Piezoelectric Source & Diffractometer'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Explain ultrasonic production with the converse piezoelectric effect
  - Measure ultrasonic velocity with the optical diffractometer grating
  - Solve frequency-wavelength-velocity problems for crystal sources
concepts:
  - piezoelectric effect
  - ultrasonic diffractometer
prerequisites:
  - m4_01_wave_types_frequency_wavelength
examRelevance: medium
tags:
  - ultrasonics
  - piezoelectric
---
# Ultrasonics: Piezoelectric Source & Diffractometer

**Making MHz sound with crystals, and weighing its speed with light — construction, working, and $v = f\lambda$ problems.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Crystal Loudspeaker, Light Ruler
Squeeze quartz and it sparks (direct effect); spark it and it squeezes (converse effect) — drive it with MHz AC and it sings ultrasound. To measure that song's speed, shine laser light across the sound beam: compressions act as a moving grating (acousto-optic effect), fanning light into orders whose angles encode the sound's wavelength. Crystal makes it; light measures it.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Piezoelectric oscillator (construction + working)

* **Effect:** quartz/tourmaline/Rochelle salt develop charge under stress (direct) and strain under voltage (converse); only non-centrosymmetric crystals qualify.
* **Circuit:** crystal slab between electrodes in a feedback oscillator; AC at the slab's natural frequency $f = (1/2t)\sqrt{E/\rho}$ ($t$ thickness) drives converse-effect resonance; direct effect feeds back to sustain.
* **Output:** ultrasonic beam normal to the faces, frequency set by crystal cut/thickness (MHz by thinning).

### 2.2 Ultrasonic diffractometer (velocity + wavelength)

Sound column in liquid creates periodic density grating of spacing $\lambda_u$; laser $\lambda$ diffracts per $d\sin\theta = n\lambda$ with $d = \lambda_u$. Measure first-order angle: $\lambda_u = \lambda/\sin\theta_1$ ($\approx \lambda/\theta_1$), then:

$$v_u = f\,\lambda_u$$

with $f$ = crystal drive frequency. Particle-size variant: diffracted halo from lycopodium suspension encodes grain size by the same grating logic.

::: callout-formula KTU Formula Vault: Ultrasonics
Converse effect + resonance **$f\propto1/t$** · grating **$\lambda_u=\lambda/\sin\theta$** · **$v_u=f\lambda_u$** · quartz needs **no centre of symmetry**.
:::

::: callout-pitfall Which $\lambda$ Is Which
$\lambda$ (light, nm) vs $\lambda_u$ (sound, mm) differ by $\sim 10^6$. Labelling the diffracted angle with the sound wavelength directly inverts the equation — always write "light $\lambda$ known, sound $\lambda_u$ sought".
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Drive $f = 1.0$ MHz; laser $632.8$ nm diffracts to first order at $\theta = 0.024^\circ$. Find sound $\lambda_u$ and speed in the liquid.
:::

::: step [Step 2: Execution] Light Measures Sound
1. Small angle: $\sin\theta \approx \theta$ in radians $= 0.024\times\pi/180 \approx 4.19\times10^{-4}$. $\lambda_u = 632.8\,\text{nm}/4.19\times10^{-4} \approx 1.51\times10^{-3}$ m $= 1.51$ mm.
2. $v_u = f\lambda_u = 10^6 \times 1.51\times10^{-3} \approx 1510$ m/s — water-like, exactly the expected band for liquids.
:::

::: step [Step 3: Conclusion] Final Result
Formula first, sanity band second ($v_{liquid} \sim 1$–$1.5$ km/s). Landing inside the band confirms both alignment and arithmetic.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why does only quartz-like (non-centrosymmetric) crystal work as a piezoelectric source?
(A) Only hard crystals vibrate
(*B) Piezoelectricity needs a lattice without inversion symmetry so stress separates charge centres
(C) Only transparent crystals conduct
(D) Symmetry is irrelevant
::: explanation
Uniform centrosymmetric strain moves positive and negative sublattices identically — no net dipole. Broken symmetry lets stress offset charge centres (direct) and fields offset atoms (converse) — the coupled engine of the oscillator.
:::

::: quiz Q2: Foundational Concept
What acts as the grating in the ultrasonic diffractometer?
(A) The glass tank walls
(*B) The sound wave's own compression–rarefaction planes (density grating) in the liquid
(C) The laser lens
(D) Dust particles
::: explanation
Pressure antinodes bunch molecules (higher $n$), nodes thin them — a live phase grating of pitch $\lambda_u$ written by sound and read by light. Kill the sound and diffraction vanishes instantly.
:::

::: quiz Q3: Numerical Drill
$f = 2$ MHz, measured $\lambda_u = 0.75$ mm. Sound speed?
(A) 150 m/s
(*B) $2\times10^6 \times 0.75\times10^{-3} = 1500$ m/s
(C) 3000 m/s
(D) 750 m/s
::: explanation
$v = f\lambda_u$ directly: $2\times0.75 = 1.5$ with $10^6\times10^{-3} = 10^3$ → $1500$ m/s, the water/tissue benchmark. Memorise it — every later SONAR/ultrasound number leans on it.
:::
