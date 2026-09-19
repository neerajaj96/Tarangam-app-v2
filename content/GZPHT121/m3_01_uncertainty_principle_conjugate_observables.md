---
id: m3_01_uncertainty_principle_conjugate_observables
courseCode: GZPHT121
module: 3
sequence: 1
title: Uncertainty Principle & Conjugate Observables
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - State both uncertainty relations with the reduced Planck constant
  - Name the conjugate observable pairs with qualitative meaning
  - Correct the common overstatements of what the principle forbids
concepts:
  - uncertainty principle
  - conjugate observables
prerequisites: []
examRelevance: medium
tags:
  - quantum-mechanics
  - uncertainty
---
# Uncertainty Principle & Conjugate Observables

**Why position–momentum and energy–time cannot both be sharp — statement, meaning, and conjugate pairs.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Jelly Microscope
To see an electron you must bounce light off it — but the bounce kicks it. Short-wavelength (precise) light kicks hard (momentum ruined); gentle long-wavelength light kicks softly but locates poorly. Sharpening one reading blurs the other, not because instruments are crude but because *nature* stores the pair as a spread-out wave. Conjugate pairs are like a waterbed: press one side flat, the other bulges.
:::

::: anim uncertainty-tradeoff Waterbed Drawn as a Curve
Momentum fuzz falls as position fuzz grows — everything below the hyperbola is forbidden territory.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Statement (KTU needs statement only, no derivation)

$$\Delta x\,\Delta p \gtrsim \frac{\hbar}{2} \qquad \Delta E\,\Delta t \gtrsim \frac{\hbar}{2}$$

with $\hbar = h/2\pi \approx 1.055\times10^{-34}$ J·s. ($\Delta x\,\Delta p \ge h/4\pi$ is the identical form.) $\Delta$ means standard deviation over many identical measurements — not instrument error.

### 2.2 Conjugate observables (qualitative)

Position–momentum, energy–time, angle–angular momentum: each pair linked by Fourier-wave mathematics — a wave packet narrow in space must contain many momenta, and vice versa. Non-conjugate pairs (e.g. $x$ and $y$) can be sharp together.

### 2.3 What it does and does not say

* Does: forbid simultaneous *arbitrary* sharpness; sets ground-state jitter (zero-point energy), line widths, tunnelling tails.
* Does not: limit single-measurement accuracy alone, permit energy violation (short-lived "borrowings" repay within $\Delta t$), or apply to classical billiard balls (effect $\sim 10^{-34}$, invisible macroscopically).

::: callout-formula KTU Formula Vault: Uncertainty
**$\Delta x\Delta p \ge \hbar/2$**, **$\Delta E\Delta t \ge \hbar/2$**, $\hbar = h/2\pi$ · conjugate pairs: $(x,p)$, $(E,t)$ · qualitative meaning only.
:::

::: callout-pitfall Observer-Effect Confusion
"The detector disturbs the electron" is a helpful story but not the principle. Heisenberg's claim is stronger: even undisturbed, the state *has no* simultaneous sharp $x$ and $p$ — the spread is in the wavefunction, not the apparatus. Say "intrinsic spread", not "clumsy measurement".
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
An electron is localised to an atom ($\Delta x \sim 10^{-10}$ m). Estimate the minimum momentum and energy fuzziness. Why does this rule out a classical orbit?
:::

::: step [Step 2: Execution] Order-of-Magnitude
1. $\Delta p \ge \hbar/(2\Delta x) \approx 1.055\times10^{-34}/(2\times10^{-10}) \approx 5.3\times10^{-25}$ kg·m/s.
2. $v \sim \Delta p/m \approx 5.3\times10^{-25}/9.1\times10^{-31} \approx 5.8\times10^5$ m/s; KE $\sim p^2/2m \approx 1$ eV — the atom's own binding scale. The electron cannot sit still at a point; jitter *is* its ground state.
:::

::: step [Step 3: Conclusion] Final Result
Confinement manufactures motion: squeeze $\Delta x$ and $\Delta p$ (hence kinetic energy) must grow. Classical point-orbits are incompatible with this trade — the next topic turns it into two famous proofs.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Which pairs are conjugate (jointly unsharp) in quantum mechanics?
(A) $x$ and $y$ position components
(*B) Position–momentum and energy–time
(C) Mass and charge
(D) Temperature and volume
::: explanation
Conjugates are Fourier-linked wave variables: narrowing the wave in one domain widens it in the other. $x$ vs $y$ are independent directions with no such link, so both can be sharp together.
:::

::: quiz Q2: Foundational Concept
What does $\Delta x$ mean in $\Delta x\,\Delta p \ge \hbar/2$?
(A) Ruler least-count
(*B) Statistical spread (standard deviation) of position over many identical preparations
(C) Total size of the laboratory
(D) Speed of the particle
::: explanation
Uncertainty is a property of the *state's* distribution, revealed by repeated measurements on identically prepared systems — not a single instrument's graduation size. Identical setups give scattered outcomes with at least this spread product.
:::

::: quiz Q3: Foundational Concept
Why is uncertainty invisible for cricket balls?
(A) It doesn't apply to large objects
(*B) $\hbar \sim 10^{-34}$ makes the minimum spread absurdly below any macroscopic scale
(C) Balls move too slowly
(D) Balls have no momentum
::: explanation
The bound scales with $\hbar$: for $m \sim 0.15$ kg even atomic-scale $\Delta x$ gives $\Delta v \sim 10^{-24}$ m/s — utterly unobservable. Quantum fuzz dominates only when action $\sim \hbar$ (electrons, photons, nuclei).
:::
