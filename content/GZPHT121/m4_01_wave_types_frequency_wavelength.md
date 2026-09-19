---
id: m4_01_wave_types_frequency_wavelength
courseCode: GZPHT121
module: 4
sequence: 1
title: 'Waves: Transverse, Longitudinal & Basic Terms'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Classify waves as transverse or longitudinal with sound as reference
  - Relate velocity, frequency and wavelength for numerical use
  - Use polarisation as the divider between the two wave families
concepts:
  - transverse waves
  - longitudinal waves
  - wave parameters
prerequisites: []
examRelevance: medium
tags:
  - waves
  - wave-basics
---
# Waves: Transverse, Longitudinal & Basic Terms

**The vocabulary every later derivation assumes — displacement vs pressure waves, $v = f\lambda$, and polarisation as the divider.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Stadium Wave vs Slinky Push
**Transverse:** stadium crowd stands *up* while the wave runs *sideways* — jiggle perpendicular to travel (string, light, water ripples). **Longitudinal:** a slinky shove compresses coils *along* the push — jiggle parallel to travel (sound, ultrasound). Frequency is shoves per second, wavelength the spacing between shoves, and speed the product — count either domain and the third is fixed.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Definitions (no derivation per syllabus)

* **Transverse:** particle displacement ⊥ propagation; needs shear-capable medium (strings, solids) — polarisable.
* **Longitudinal:** displacement ∥ propagation (compressions/rarefactions); travels in solids, liquids, gases — never polarisable.
* **Frequency** $f$ (Hz): oscillations per second; **time period** $T = 1/f$; **wavelength** $\lambda$: distance per cycle; **wave velocity** $v = f\lambda = \lambda/T$; amplitude = max displacement; phase = position in cycle.

### 2.2 Sound as the reference longitudinal wave

Audible $20$ Hz–$20$ kHz; infrasonic below; **ultrasonic** above $20$ kHz (the NDT/medical band). Speed in air $\approx 340$ m/s, water $\approx 1500$ m/s, steel $\approx 5000$ m/s — denser/stiffer usually faster.

### 2.3 Medium–speed reference (used across M4)

| Medium | $v$ (m/s) | Shows up in |
|---|---|---|
| Air | $\approx 340$ | tuning-fork $\lambda$, $17$ m echo |
| Seawater | $\approx 1500$ | SONAR ranging |
| Soft tissue | $\approx 1540$ | ultrasound imaging |
| Steel (longitudinal) | $\approx 5900$ | NDT flaw sizing |

One table, four later topics — memorise the column, spend the questions.

::: callout-formula KTU Formula Vault: Wave Basics
**$v = f\lambda = \lambda/T$** · transverse ⊥, longitudinal ∥ · only transverse **polarises** · ultrasound $> 20$ kHz.
:::

::: callout-pitfall Speed Belongs to the Medium
$v = f\lambda$ is a constraint, not a cause: crossing media, $f$ stays fixed (set by source) while $\lambda$ and $v$ change together. Writing "higher $f$ means faster wave in the same medium" reverses causality — same medium, same $v$.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A $440$ Hz tuning fork sounds in air ($v = 344$ m/s). Find $\lambda$ and $T$. The same fork dips into water ($v = 1480$ m/s) — what changes?
:::

::: step [Step 2: Execution] Two Divisions
1. $T = 1/440 \approx 2.27$ ms; $\lambda = v/f = 344/440 \approx 0.78$ m.
2. Underwater $f$ stays $440$ Hz (fork rules), $\lambda = 1480/440 \approx 3.36$ m — wavelength stretches with speed.
:::

::: step [Step 3: Conclusion] Final Result
$f$ is the source's property; $v$ the medium's; $\lambda$ their compromise. State the invariant ($f$) first in every refraction-style question.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Which statement correctly distinguishes the two wave types?
(A) Transverse needs no medium; longitudinal needs one
(*B) Transverse oscillates perpendicular to travel and can be polarised; longitudinal oscillates parallel and cannot
(C) Sound is transverse in air
(D) Light is longitudinal
::: explanation
Geometry (⊥ vs ∥) fixes everything: only transverse has a sideways orientation for a polariser to select. Sound in fluids is purely longitudinal; light is purely transverse.
:::

::: quiz Q2: Foundational Concept
A wave crosses from air into water. Which quantity is unchanged?
(A) Wavelength
(*B) Frequency — set by the source; $v$ and $\lambda$ rescale together
(C) Velocity
(D) Amplitude
::: explanation
The source launches crests at $f$ per second regardless of medium; the new medium accepts them at its own speed, stretching $\lambda = v/f$. Amplitude may also change (impedance), but $f$ never does.
:::

::: quiz Q3: Numerical Drill
Ultrasound at $2$ MHz in soft tissue ($v = 1540$ m/s). Wavelength?
(A) 3.08 m
(*B) $1540/2\times10^6 = 0.77$ mm — sub-mm resolution scale
(C) 0.77 m
(D) 77 μm
::: explanation
$\lambda = v/f = 1540/2{,}000{,}000 = 7.7\times10^{-4}$ m $\approx 0.77$ mm. MHz frequencies exist precisely to shrink $\lambda$ to lesion-scale resolution (next topics build on this number).
:::
