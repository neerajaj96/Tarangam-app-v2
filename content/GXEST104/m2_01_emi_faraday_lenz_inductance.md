---
id: m2_01_emi_faraday_lenz_inductance
courseCode: GXEST104
module: 2
sequence: 1
title: 'Electromagnetic Induction: Faraday, Lenz & Inductance'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - State Faraday's laws with the Lenz direction rule
  - Separate static from dynamic induction cases
  - Read coupling quality from the k factor
concepts:
  - Faraday's law
  - Lenz's law
  - inductance
prerequisites:
  - m1_03_capacitors_inductors_energy
examRelevance: high
tags:
  - emi
  - inductance
---
# Electromagnetic Induction: Faraday, Lenz & Inductance

**Flux change breeds EMF — direction by Lenz, static vs dynamic births, and self/mutual inductance with coupling (theory, no numericals).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Jealous Loop
A conducting loop *hates* magnetic change through it: push more flux in and it circulates current to push back (Lenz — electromagnetic Newton's third law). Change the flux two ways: vary the field with everything still (**statically** induced, transformers) or move the conductor through a steady field (**dynamically**, generators, $e = Blv$). Coils also bully themselves (self) and neighbours (mutual).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Faraday's laws + Lenz

$$e = -N\frac{d\Phi}{dt}$$

Magnitude ∝ rate of flux-linkage change; the minus (Lenz) sets opposition direction. Statically: transformer action, no motion. Dynamically: motional $e = Blv\sin\theta$.

### 2.2 Self, mutual, coupling

Self $L$: $e = -L\,di/dt$, $L = N\Phi/I$. Mutual $M$: $e_2 = -M\,di_1/dt$. Coupling $k = M/\sqrt{L_1L_2}$ ($0\le k\le1$; tight iron-core $\approx 1$, loose air-core $\ll 1$). Dot convention marks aiding vs opposing polarity.

::: callout-formula KTU Formula Vault: EMI
**$e=-Nd\Phi/dt$** · Lenz = **minus (oppose change)** · static = **varying field**, dynamic = **moving conductor** · $k=M/\sqrt{L_1L_2}$.
:::

::: callout-exam KTU Exam Focus
Syllabus bans numericals here — the 3-marker wants laws stated + Lenz direction reasoning + static/dynamic examples + $k$ meaning. Direction arguments (not magnitudes) are the graded skill.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A magnet's north pole plunges toward a loop. (a) Induced current direction? (b) Magnet withdrawn? (c) Which case is static vs dynamic induction?
:::

::: step [Step 2: Execution] Oppose, Then Reverse
1. Approaching N raises toward-flux; loop drives current making its near face N (repel the change) — viewed from the magnet, counterclockwise? Check: near-face N needs field pointing at magnet → right-hand rule gives counterclockwise viewed from magnet side. State both face-polarity and viewed-direction.
2. Withdrawal drops flux → loop makes near face S (hold it back) — clockwise from magnet side.
3. Moving magnet/loop = dynamically induced (motion through field); a transformer with AC and still coils = statically induced.
:::

::: step [Step 3: Conclusion] Final Result
Face-polarity first (oppose the *change*), clock-direction second, static/dynamic labelled third. Polarity-then-clock is the invincible order.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What does the minus in $e = -Nd\Phi/dt$ encode?
(A) Measurement error
(*B) Lenz's law — induced effects oppose the flux change causing them (energy conservation's signature)
(C) Flux is always negative
(D) Coils have resistance
::: explanation
Without opposition, a nudge would amplify itself — free energy. The minus guarantees the induced current fights the change, billing the mover for every joule delivered.
:::

::: quiz Q2: Foundational Concept
Transformer vs bicycle dynamo: static or dynamic?
(A) Both static
(*B) Transformer statically induced (AC varies flux, still coils); dynamo dynamically (coil moves/rotates in steady field)
(C) Both dynamic
(D) Neither involves induction
::: explanation
Motion-vs-variation is the classifier: still geometry + changing field = static; moving geometry = dynamic. Name one canonical example each — the expected 3-mark pair.
:::

::: quiz Q3: Foundational Concept
$k = 0.9$ vs $k = 0.2$ between two coils means?
(A) Turns ratio
(*B) Tight (iron-core, shared flux $\approx 90\%$) vs loose (air-core, mostly leakage) magnetic linkage
(C) Resistance ratio
(D) Frequency ratio
::: explanation
$k = M/\sqrt{L_1L_2}$ fractions the shared flux: near-$1$ closed iron paths, small for separated air coils. Coupling quality decides transformer vs loosely-linked (wireless-charge style) behaviour.
:::
