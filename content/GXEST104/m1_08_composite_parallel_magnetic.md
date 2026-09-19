---
id: m1_08_composite_parallel_magnetic
courseCode: GXEST104
module: 1
sequence: 8
title: 'Series, Parallel & Composite Magnetic Circuits'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Add series reluctances with gap dominance
  - Split flux across parallel limbs inversely to reluctance
  - Answer pure-theory comparison questions structurally
concepts:
  - air gaps
  - parallel magnetic limbs
prerequisites:
  - m1_07_magnetic_circuits_basics
examRelevance: high
tags:
  - magnetic-circuits
---
# Series, Parallel & Composite Magnetic Circuits

**Rings with air gaps, mixed materials, and parallel limbs — solved exactly like resistive networks (theory only, no numericals per syllabus).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Plumbing Renovations
An **air gap** is a clogged segment dominating the whole loop's reluctance (composite series: iron + air in line, add reluctances). **Parallel limbs** (E-cores, transformer windows) split flux like parallel resistors split current — outer limbs share what the centre limb feeds. Same reduction grammar as resistors, with saturation as the asterisk.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Composite series (ring + gap)

$$\mathcal{R}_{total} = \mathcal{R}_{iron} + \mathcal{R}_{gap} = \frac{l_i}{\mu_0\mu_rA} + \frac{l_g}{\mu_0A}, \qquad \Phi = \frac{NI}{\mathcal{R}_{total}}$$

Fringing (flux bulging at gaps) slightly raises effective $A_g$ — named, not computed.

### 2.2 Parallel limbs

Centre limb MMF drives two outer paths: $\Phi_{total} = \Phi_1+\Phi_2$ with $\Phi_1\mathcal{R}_1 = \Phi_2\mathcal{R}_2$ (same MMF drop) — current-division grammar with $\Phi, \mathcal{R}$.

::: callout-formula KTU Formula Vault: Composite/Parallel
Series: **add $\mathcal{R}$** (gap usually dominates) · parallel: **split $\Phi$ inversely to $\mathcal{R}$**.
:::

::: callout-exam KTU Exam Focus
"Compare electric and magnetic circuits" + "series/parallel magnetic with composite materials" are pure-theory 7-markers: dictionary table, gap-dominance paragraph, limb-division paragraph, saturation caveat. No numericals asked — say the *structure*, not numbers.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Describe (no numbers) how to find the flux in an iron ring ($l_i, A, \mu_r$) with a short air gap ($l_g$) and $NI$ excitation, and how flux splits in a symmetric E-core's outer limbs.
:::

::: step [Step 2: Execution] Structure, Not Numbers
1. Compute $\mathcal{R}_i$, $\mathcal{R}_g$; series-add (gap dominates despite $l_g \ll l_i$ since $\mu_r \gg 1$); $\Phi = NI/(\mathcal{R}_i+\mathcal{R}_g)$.
2. E-core: centre MMF across two equal outer reluctances → $\Phi/2$ each by symmetry (general case: inverse-$\mathcal{R}$ split).
:::

::: step [Step 3: Conclusion] Final Result
Gap-dominance + symmetry-split are the two sentences examiners hunt. Fringing and saturation named as caveats complete the answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
A $1$ mm air gap in a $200$ mm iron ring ($\mu_r = 1000$). Which reluctance dominates?
(A) Iron, it's longer
(*B) The gap — $\mathcal{R}_g/\mathcal{R}_i = (l_g/l_i)\mu_r = (1/200)(1000) = 5\times$ the iron's
(C) Neither matters
(D) They cancel
::: explanation
Per-unit-length reluctance of air is $\mu_r$ times iron's — tiny gaps dominate long cores. Gap control (motor air gaps, inductor gapping) *is* magnetic design for this reason.
:::

::: quiz Q2: Foundational Concept
Two equal outer limbs in parallel carry total $\Phi$. Each carries?
(A) $\Phi$
(*B) $\Phi/2$ — equal reluctances split MMF-driven flux evenly (current-division twin)
(C) Zero
(D) $2\Phi$
::: explanation
Same drop, same $\mathcal{R}$ → same $\Phi$. Unequal limbs split inversely to $\mathcal{R}$ — state the general rule, instantiate the symmetric case.
:::

::: quiz Q3: Foundational Concept
What is fringing at an air gap?
(A) Core overheating
(*B) Flux lines bulge outward crossing the gap, slightly raising effective gap area (lowering $\mathcal{R}_g$ a little)
(C) Gap insulation failure
(D) Turn shorting
::: explanation
Field lines repel into the surrounding air at the discontinuity — effective $A_g > A_{core}$. Named as a correction direction (reduces computed $\mathcal{R}_g$), never numerically in this syllabus.
:::
