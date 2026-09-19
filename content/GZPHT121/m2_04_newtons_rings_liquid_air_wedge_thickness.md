---
id: m2_04_newtons_rings_liquid_air_wedge_thickness
courseCode: GZPHT121
module: 2
sequence: 4
title: Newton's Rings in Liquid & Air-Wedge Thickness
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Find a liquid's refractive index from ring shrinkage ratios
  - Measure wire and sheet thickness from air-wedge fringe counts
  - Convert one fringe shift into half-wavelength thickness change
concepts:
  - liquid refractive index
  - air-wedge thickness
prerequisites:
  - m2_02_thin_films_colours_wedge_fringes
  - m2_03_newtons_rings_wavelength
examRelevance: high
tags:
  - interference
  - newtons-rings
---
# Newton's Rings in Liquid & Air-Wedge Thickness

**Two high-yield variations: refractive index of a liquid from ring shrinkage, and wire/thin-sheet thickness from wedge fringes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ruler Shrinks Underwater
Fill the lens–plate gap with water: light's wavelength *inside* shrinks to $\lambda/\mu$, so the same gap now fits more waves — rings pull inward. Measure the squeeze and you weigh the liquid optically. The air wedge is the same idea unrolled flat: slide a hair under one end of two glass plates, count the stripes, and the stripe count *is* the hair's thickness in half-wavelength units.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Liquid-filled Newton's rings

Wavelength in medium $\lambda_m = \lambda/\mu$; ring law becomes $D_n^2 = 4n\lambda R/\mu$. Hence for the same ring:

$$\mu = \frac{(D_n^2)_{air}}{(D_n^2)_{liquid}}$$

Procedure: measure a high-order diameter in air, introduce the liquid drop, re-measure — ratio gives $\mu$ with no need for $R$ or $\lambda$.

### 2.2 Air wedge for wire/sheet thickness

Wire of diameter $d$ at distance $l$ from contact edge forms wedge angle $\alpha \approx d/l$. Counting $N$ fringes over length $l$ (fringe width $\beta = l/N = \lambda/2\alpha$):

$$d = \frac{l\,\lambda}{2\beta} = \frac{N\lambda}{2}$$

Each fringe = $\lambda/2$ of thickness. Thin sheet uses identical geometry.

::: callout-formula KTU Formula Vault: Liquid + Wedge
**$\mu = D_{air}^2/D_{liq}^2$** (same ring) · wire/sheet **$d = N\lambda/2 = l\lambda/2\beta$** · one fringe ↔ $\lambda/2$ thickness.
:::

::: callout-pitfall Count Carefully: Fringes vs Orders
$N$ is the number of fringe *intervals* between the edge and the wire, not the bright-spot count casually eyeballed. Off-by-one in $N$ shifts $d$ by $\lambda/2$ ($\sim 0.3\,\mu$m) — state whether you count from the dark contact fringe.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) 10th ring: $D = 6.0$ mm in air, $4.9$ mm in liquid. Find $\mu$. (b) A wire gives $40$ fringes over the plate with $\lambda = 589$ nm. Find wire diameter.
:::

::: step [Step 2: Execution] Two One-Liners
1. $\mu = 6.0^2/4.9^2 = 36/24.01 \approx 1.50$ — a typical glass-like oil value.
2. $d = N\lambda/2 = 40 \times 589\,\text{nm}/2 = 11{,}780$ nm $\approx 11.8\,\mu$m.
:::

::: step [Step 3: Conclusion] Final Result
Ratio-of-squares for liquids; fringes-times-half-lambda for wires. Both are 3-mark gift questions once the formula is recognised — underline which variation applies in the first line of the answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
6th dark ring diameter $6.0$ mm in air becomes $4.9$ mm in oil. Refractive index?
(A) 1.20
(*B) $36/24.01 \approx 1.50$ — a typical oil value
(C) 0.49
(D) 1.00
::: explanation
$\mu = D_{air}^2/D_{liq}^2 = 36/24.01 \approx 1.50$. Same-ring, same-setup ratio — no $R$ or $\lambda$ needed, which is why this experiment survives calibration errors.
:::

::: quiz Q2: Numerical Drill
$60$ wedge fringes with He-Ne $\lambda = 632.8$ nm. Sheet thickness?
(A) $60\lambda$
(*B) $60 \times 632.8/2$ nm ≈ 19.0 μm
(C) $632.8/60$ nm
(D) 60 mm
::: explanation
$d = N\lambda/2 = 30 \times 632.8$ nm $\approx 19{,}000$ nm $\approx 19\,\mu$m — foil territory. Each fringe is one half-wave of extra gap.
:::

::: quiz Q3: Foundational Concept
Why does the liquid method not need $R$ or $\lambda$?
(A) They cancel in the ratio for the same ring and setup
(*) Both $D^2$ expressions share $4nR\lambda$ factors that divide out, leaving pure $\mu$
(C) Liquids have no refractive index
(D) $R$ becomes infinite in liquid
::: explanation
$(D^2)_{air} = 4n\lambda R$, $(D^2)_{liq} = 4n\lambda R/\mu$ — same $n$, $R$, $\lambda$, same apparatus. The ratio isolates $\mu$ alone, which is why this experiment is robust against calibration errors.
:::
