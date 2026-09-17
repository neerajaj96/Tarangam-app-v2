# Sabine Numerical Drill: Every Variation

**Pure problem training — absorption algebra, occupant swings, target-$T_R$ design, and unit traps.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Drain Equation Gym
$T_R = 0.161V/A$ has three handles: room size ($V$), soaking ($A$), target tail ($T_R$). Every numerical grabs one handle and asks for another — compute $A$ from surfaces, add people, invert for needed panels. Master the three rearrangements and the chapter's numbers are done.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The three rearrangements

$$T_R = \frac{0.161V}{A} \qquad A = \frac{0.161V}{T_R} \qquad A_{extra} = 0.161V\left(\frac{1}{T_{target}}-\frac{1}{T_{now}}\right)$$

Composite $A = \sum\alpha_iS_i + N_{people}\times0.5$ (+ air absorption at high frequencies if given).

### 2.2 Decision thresholds

Speech $\lesssim 1.0$ s; music $1$–$2$ s. If computed $T_R$ overshoots, prescribe added absorption $A_{extra}$ (acoustic tiles, curtains, audience); if undershooting (over-dead), prescribe removing absorption or adding reflective/diffusive panels.

::: callout-formula KTU Formula Vault: Sabine Drill
**$T=0.161V/A$** · $A=\sum\alpha S+0.5N$ · add **$0.161V(1/T_t-1/T)$** sabins to fix · people count always.
:::

::: callout-pitfall Open-Window Unit
$\alpha = 1$ (perfect absorber) is defined by an open window — coefficients above 1 are impossible (flag bad data). Also never add $\alpha$'s directly without weighting by their areas $S_i$.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$V = 1500$ m³, surfaces give $A = 150$ sabins empty. (a) Empty $T_R$? (b) With $150$ people? (c) Extra absorption to hit $0.8$ s when occupied?
:::

::: step [Step 2: Execution] Three Lines
1. Empty: $T = 0.161\times1500/150 = 241.5/150 = 1.61$ s (boomy).
2. Occupied: $A = 150 + 75 = 225$ → $T = 241.5/225 \approx 1.07$ s.
3. Target $0.8$: $A_{need} = 241.5/0.8 \approx 302$; extra $= 302-225 = 77$ sabins of panels/curtains.
:::

::: step [Step 3: Conclusion] Final Result
Empty → occupied → treated: the standard three-part arc. Always present all three numbers — examiners award step marks per stage.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$V = 2000$ m³, $A = 322$ sabins. $T_R$?
(A) 2.0 s
(*B) $0.161\times2000/322 = 322/322 = 1.0$ s exactly (constructed) — ideal speech hall
(C) 0.5 s
(D) 3.22 s
::: explanation
Numerator $0.161\times2000 = 322$; over $322$ gives exactly $1.0$ s — the speech/music boundary. Recognising $0.161\times V$ as the numerator first keeps the division trivial.
:::

::: quiz Q2: Numerical Drill
Hall $T_R = 1.5$ s at $V = 1200$ m³. Absorption needed for $0.9$ s?
(A) 50 sabins
(*B) $A_{now} = 0.161\times1200/1.5 = 128.8$; $A_{target} = 193.2/0.9 = 214.7$; extra ≈ 86 sabins
(C) Remove 86 sabins
(D) Double the volume
::: explanation
Compute both $A$'s via $0.161V/T$ and subtract — never guess. $86$ sabins $\approx$ $170$ m² of $\alpha=0.5$ tile, the kind of specification detail that earns design-question marks.
:::

::: quiz Q3: Numerical Drill
Two materials: $100$ m² at $\alpha=0.1$, $50$ m² at $\alpha=0.6$. Total $A$?
(A) 0.7 sabins
(*B) $10 + 30 = 40$ sabins — area-weighted, not added coefficients
(C) 150 sabins
(D) 70 sabins
::: explanation
$A = \sum\alpha_iS_i = 0.1\times100 + 0.6\times50 = 10 + 30 = 40$. Adding $0.1+0.6$ directly is the planted error — coefficients weight areas, they never stand alone.
:::
