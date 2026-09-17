# Star–Delta Conversion of Resistive Networks

**Collapsing 3-terminal tangles — both conversion formulas, when to convert, and full reduction traces.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Rewiring the Junction
A **star (Y)** ties three resistors to one centre node; a **delta (Δ)** chains them in a triangle between the same three outer terminals. Same terminals, same behaviour — if the resistor values translate correctly. Convert whichever shape blocks series/parallel progress, collapse, repeat. Balanced networks ($R$ everywhere) collapse to $R/3$ (Δ→Y) or $3R$ (Y→Δ) by inspection.
:::

::: anim star-delta Star to Delta, Same Terminals
Watch the centre node dissolve into the triangle: Ra sits opposite terminal 1, built from the two stars touching it plus the product-over-opposite rule.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Formulas (use, don't derive — syllabus says so)

Δ ($R_a, R_b, R_c$) → Y ($R_1, R_2, R_3$), with $R_a$ opposite terminal $1$:

$$R_1 = \frac{R_bR_c}{R_a+R_b+R_c} \quad \text{(product of adjacent / sum)}$$

Y → Δ:

$$R_a = \frac{R_1R_2+R_2R_3+R_3R_1}{R_1} \quad \text{(sum of pairwise / opposite star arm)}$$

Balanced: $R_Y = R_\Delta/3$.

### 2.2 Reduction protocol

Spot the Y/Δ blocking progress → convert → series/parallel collapse → repeat. Bridge circuits that resist series/parallel *are* the convert signal.

::: callout-formula KTU Formula Vault: Y–Δ
Δ→Y: **adjacent product / perimeter sum** · Y→Δ: **pairwise sum / opposite** · balanced **$\div3$ / $\times3$**.
:::

::: callout-pitfall Opposite-Arm Mapping
$R_a$ (between terminals 2–3) pairs with star arm $R_1$ (terminal 1) — *opposite*, not adjacent. Misaligned mapping converts the wrong triangle; label terminals $1,2,3$ on both shapes before substituting.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Δ of $6, 6, 6\,\Omega$ between A–B–C. Convert to Y, then find $R_{AB}$ with C open.
:::

::: step [Step 2: Execution] Convert Then Read
1. Balanced: $R_Y = 6/3 = 2\,\Omega$ per arm.
2. C open: A→centre→B path $= 2+2 = 4\,\Omega$. (Direct: Δ A–B arm $6 \parallel (6+6) = 6\parallel12 = 4\,\Omega$ ✓ — both routes agree, the standard self-check.)
:::

::: step [Step 3: Conclusion] Final Result
Balanced networks convert mentally; agreement between Δ-direct and Y-converted readings certifies the mapping. Show the cross-check — it doubles as error insurance.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Y of $2, 2, 2\,\Omega$. Equivalent Δ arms?
(A) $2\,\Omega$
(*B) $3\times2 = 6\,\Omega$ each (balanced Y→Δ triples)
(C) $2/3\,\Omega$
(D) $4\,\Omega$
::: explanation
Balanced shortcut: $R_\Delta = 3R_Y = 6\,\Omega$. Full formula agrees: $(4+4+4)/2 = 6$. Tripling/doubling by direction is the one-line balanced answer.
:::

::: quiz Q2: Numerical Drill
Δ arms $R_a = 10$ (opp. 1), $R_b = 20$, $R_c = 30$. Star arm $R_1$?
(A) $10\,\Omega$
(*B) $R_bR_c/\sum = 600/60 = 10\,\Omega$ — adjacent product over perimeter sum
(C) $60\,\Omega$
(D) $6\,\Omega$
::: explanation
$R_1$ touches terminal $1$, so it uses the arms *meeting away* from $1$ ($R_b, R_c$): $20\times30/60 = 10$. Opposite-mapping stated first, arithmetic second.
:::

::: quiz Q3: Foundational Concept
When is star–delta conversion the right move?
(A) Always, for every circuit
(*B) When a Y or Δ sub-network blocks all series/parallel reduction (bridges, meshes) — convert it into a collapsible shape
(C) Only for balanced networks
(D) Never in exams
::: explanation
Conversion is a means to series/parallel, not a ritual: no blocked reduction, no conversion. Bridges that laugh at series/parallel are the diagnostic — convert the offender and continue collapsing.
:::
