---
id: m2_07_module2_mixed_numerical_drill
courseCode: GZPHT121
module: 2
sequence: 7
title: 'Module 2 Numerical Drill: Interference–Diffraction Mix'
difficulty: intermediate
estimatedMinutes: 4
learningObjectives:
  - Sort any Module 2 problem into its film, rings, wedge, slit or grating pattern
  - Enforce unit discipline across nanometres, millimetres and centimetres
  - Clear order cutoffs and ratio-style questions under time pressure
concepts:
  - pattern recognition
  - unit discipline
prerequisites:
  - m2_02_thin_films_colours_wedge_fringes
  - m2_03_newtons_rings_wavelength
  - m2_04_newtons_rings_liquid_air_wedge_thickness
  - m2_05_single_slit_diffraction_width
  - m2_06_diffraction_grating_equation_powers
examRelevance: high
tags:
  - interference
  - m2-drill
---
# Module 2 Numerical Drill: Interference–Diffraction Mix

**Every KTU problem pattern from Module 2 in one drill — film, rings, wedge, slit, grating, and order cutoffs.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: One Ruler, Many Objects
All Module 2 numericals use light of known $\lambda$ as a ruler: count how many half-waves fit in the unknown (gap, thickness, slit, grating step), then solve backwards. Identify the ruler equation first — film $2\mu t$, rings $D^2/4R$, wedge $N\lambda/2$, slit $a\sin\theta$, grating $d\sin\theta$ — and the arithmetic is always one or two lines.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Pattern-recognition table

| Keyword in question | Equation | Unknown |
|---|---|---|
| film bright/dark, thickness | $2\mu t\cos r = n\lambda$ / $(2n+1)\lambda/2$ | $t$, $\lambda$, $n$ |
| Newton's diameters, $R$ | $\lambda = (D_{n+m}^2-D_n^2)/4mR$ | $\lambda$, $R$ |
| liquid, diameters shrink | $\mu = D_{air}^2/D_{liq}^2$ | $\mu$ |
| wire/sheet, fringe count | $d = N\lambda/2$ | $d$ |
| slit, minimum position | $a = \lambda D/x_n \times n$ | $a$ |
| grating angle/order | $\lambda = d\sin\theta_n/n$; $n_{max} \le d/\lambda$ | $\lambda$, $d$, $N$ |

### 2.2 Unit discipline

Work in metres (or consistently mm → m), square *before* subtracting for rings, and sanity-check: visible $\lambda \approx 400$–$700$ nm, wire $\sim \mu$m, $\mu \approx 1.3$–$1.7$, NA-style answers never above 1 in air (Module 1 cross-check).

::: callout-formula KTU Formula Vault: Module 2 Drill
Film **$2\mu t$**, rings **$\Delta D^2/4mR$**, liquid **ratio of squares**, wedge **$N\lambda/2$**, slit **$n\lambda D/x$**, grating **$d\sin\theta/n$**, cutoff **$d/\lambda$**.
:::

::: callout-pitfall Mixed-Formula Panic
Students grab the grating equation for a Newton's rings question under time pressure. Read the apparatus noun first (film? lens? wedge? slit? grating?) — the noun *is* the formula choice. No noun, no equation.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Grating $5000$ lines/cm, second-order angle $30^\circ$. Find $\lambda$ and the highest order possible.
:::

::: step [Step 2: Execution] Two Divisions
1. $d = 1/5000$ cm $= 2.0\times10^{-6}$ m. $\lambda = d\sin30^\circ/2 = 2.0\times10^{-6}\times0.5/2 = 5.0\times10^{-7}$ m $= 500$ nm.
2. $n_{max} \le d/\lambda = 2.0/0.5 = 4$ → orders $0$–$4$ ($4$ usable each side).
:::

::: step [Step 3: Conclusion] Final Result
$500$ nm green with $4$ orders per side. Note the chain: lines/cm → $d$ in metres → one division → cutoff check. That chain is the full-mark template.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Film ($\mu = 1.33$) shows 2nd-order bright reflection at $\lambda = 600$ nm, normal incidence. Thickness?
(A) 600 nm
(*B) $t = n\lambda/2\mu = 2\times600/(2\times1.33) \approx 451$ nm
(C) 1200 nm
(D) 300 nm
::: explanation
$2\mu t = n\lambda$ gives $t = n\lambda/(2\mu) = 1200/2.66 \approx 451$ nm. State the reflected-bright condition first — half the marks are for the choice, half for the arithmetic.
:::

::: quiz Q2: Numerical Drill
Newton's: $D_{10}^2 - D_5^2 = 12\,\text{mm}^2$, $R = 1.2$ m. $\lambda$?
(A) 1200 nm
(*B) $12\times10^{-6}/(4\times5\times1.2) = 12\times10^{-6}/24 = 5.0\times10^{-7}$ m = 500 nm
(C) 250 nm
(D) 1000 nm
::: explanation
$\lambda = \Delta D^2/(4mR)$ with $m = 5$: numerator $12\times10^{-6}$, denominator $24$ — exactly $0.5\times10^{-6}$ m. Keep $m$ = order *difference*, not the higher order.
:::

::: quiz Q3: Numerical Drill
Single slit: 2nd minimum at $12$ mm, $D = 1.5$ m, $\lambda = 600$ nm. Slit width?
(A) 37.5 μm
(*B) $a = n\lambda D/x = 2\times600\text{nm}\times1.5/0.012 = 150$ μm
(C) 300 μm
(D) 75 μm
::: explanation
Higher minima scale with $n$: $a = n\lambda D/x_n = 2 \times 600\times10^{-9}\times1.5/0.012 = 1.5\times10^{-4}$ m $= 150\,\mu$m. Forgetting the $n$ factor halves the answer — the planted trap.
:::
