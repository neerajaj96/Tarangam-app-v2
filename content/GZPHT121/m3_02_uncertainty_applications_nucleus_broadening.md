---
id: m3_02_uncertainty_applications_nucleus_broadening
courseCode: GZPHT121
module: 3
sequence: 2
title: 'Uncertainty Applications: Nucleus & Line Broadening'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Prove electrons cannot reside in the nucleus with confinement numbers
  - Estimate natural line width from excited-state lifetimes
  - Reproduce both staple proofs with full numerical steps
concepts:
  - nuclear electron exclusion
  - natural line broadening
prerequisites:
  - m3_01_uncertainty_principle_conjugate_observables
examRelevance: high
tags:
  - quantum-mechanics
  - uncertainty
---
# Uncertainty Applications: Nucleus & Line Broadening

**Two KTU-staple proofs — no electron inside the nucleus, and why spectral lines have natural width — with full numbers.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Box Too Small, Note Too Short
Cram an electron into a nucleus ($10^{-14}$ m box) and uncertainty forces it to rattle with $\sim 10$–$100$ MeV of jitter — far beyond beta-decay energies ($\sim 1$ MeV), so it can't live there. Similarly, an excited atom lives only $\sim 10^{-8}$ s — a *short musical note* must contain a *spread of pitches* ($\Delta E\,\Delta t$), so its spectral line is born with a finite width no instrument can remove.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Absence of electrons in the nucleus

Assume an electron confined to $\Delta x \sim 10^{-14}$ m (nuclear diameter). Then $\Delta p \ge \hbar/(2\Delta x) \approx 5.3\times10^{-21}$ kg·m/s. Relativistic energy $E \approx pc \approx 5.3\times10^{-21}\times3\times10^8 \approx 1.6\times10^{-12}$ J $\approx 10$ MeV (exact constant choices give tens of MeV). Beta particles emerge with $\lesssim 1$–$4$ MeV — an order below confinement cost. Hence electrons are *created* at decay (neutron → proton + electron), not *stored* inside.

### 2.2 Natural line broadening

Excited lifetime $\Delta t \sim 10^{-8}$ s → $\Delta E \ge \hbar/(2\Delta t) \approx 5\times10^{-27}$ J $\approx 3\times10^{-8}$ eV. Frequency width $\Delta\nu = \Delta E/h \sim 10^7$–$10^8$ Hz. Shorter-lived states (broad resonances) ↔ wider lines — the energy–time trade directly visible in spectra. (Doppler/collision broadening add on top; natural width is the irreducible floor.)

::: callout-formula KTU Formula Vault: Applications
Nucleus: **$\Delta x\sim10^{-14}$ m → $\Delta p\sim10^{-20}$ kg·m/s → $E\sim10$ MeV $\gg$ $\beta$-decay $\sim$MeV ⇒ no resident electrons** · lines: **$\Delta E\sim\hbar/2\Delta t$, $\Delta\nu=\Delta E/h$**.
:::

::: callout-pitfall Relativistic vs Classical KE
Nuclear-scale $\Delta p$ gives $v \sim c$ — classical $p^2/2m$ underestimates badly (even exceeds $c$). Always switch to $E \approx pc$ once $\Delta p \gtrsim 10^{-21}$ kg·m/s for electrons. Examiners specifically reward the relativistic remark.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Lifetime of an excited Na state is $1.6\times10^{-8}$ s. Estimate the natural width $\Delta\nu$ of the $589$ nm line.
:::

::: step [Step 2: Execution] Energy–Time in Numbers
1. $\Delta E \ge \hbar/(2\Delta t) = 1.055\times10^{-34}/(3.2\times10^{-8}) \approx 3.3\times10^{-27}$ J.
2. $\Delta\nu = \Delta E/h = 3.3\times10^{-27}/6.626\times10^{-34} \approx 5.0\times10^6$ Hz $\approx 5$ MHz — parts in $10^8$ of the $5\times10^{14}$ Hz line centre.
:::

::: step [Step 3: Conclusion] Final Result
$\sim$MHz natural width underlies every broader observed profile. Quote both $\Delta E$ ($\sim 10^{-8}$ eV) and $\Delta\nu$ ($\sim$MHz) — the pair earns full marks.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
If nuclear size is taken as $2\times10^{-14}$ m instead of $1\times10^{-14}$ m, what happens to the minimum electron energy estimate?
(A) Doubles
(*B) Halves — $\Delta p \propto 1/\Delta x$, so $E \approx pc$ halves (still ≫ MeV, conclusion unchanged)
(C) Unchanged
(D) Becomes zero
::: explanation
Doubling the box halves the momentum fuzz and hence the $pc$ energy ($\sim 10$ MeV → $\sim 5$ MeV). Still well above beta energies, so the "no resident electron" verdict is robust against size-choice factors of a few.
:::

::: quiz Q2: Numerical Drill
An ultra-short-lived resonance lasts $10^{-22}$ s. Its energy width?
(A) $10^{-8}$ eV
(*B) $\Delta E \sim \hbar/2\Delta t \approx 1.055\times10^{-34}/(2\times10^{-22}) \approx 5\times10^{-13}$ J ≈ 3 MeV
(C) Exactly zero
(D) 1 eV
::: explanation
$5.3\times10^{-13}$ J $/1.6\times10^{-19} \approx 3.3\times10^6$ eV. Particle-physics bumps are MeV-wide for exactly this reason — fleeting states are energetically fuzzy. Same formula as atomic lines, wildly different scale.
:::

::: quiz Q3: Foundational Concept
Beta-decay electrons are observed with a few MeV. Why doesn't this contradict "no electrons in the nucleus"?
(A) The principle is wrong
(*B) The electron is created during decay (n → p + e + anti-ν); it never pre-existed as a confined resident
(C) Nuclei expand during decay
(D) Beta electrons come from atomic shells only
::: explanation
Confinement cost ($\sim 10$ MeV) forbids *storage*; weak-interaction *creation* at emission costs no confinement. The observed continuous beta spectrum (shared with the antineutrino) further confirms creation, not ejection of a pre-formed particle.
:::
