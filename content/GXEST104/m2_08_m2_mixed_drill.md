# M2 Mixed Drill: AC & Three-Phase Variations

**Waveform measures, phasor sums, RLC answers, power bills, and $\sqrt3$ calls — speed round.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Five Reflexes
RMS/avg by $0.707/0.637$ · phasor sums in rect, answers in polar · $Z$ triangles ($3$-$4$-$5$ spotting) · power trio $S/P/Q$ + PF pair (load type!) · star-V/delta-I $\sqrt3$. Five reflexes, ninety seconds each.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Reflex sheet

$V_m \to$ RMS/avg · $a+jb \leftrightarrows M\angle\phi$ · $Z = R+j(X_L-X_C)$, resonance $1/2\pi\sqrt{LC}$ · $P = VI\cos\phi$, correction $\parallel C$ · star $V_L=\sqrt3V_{ph}$ / delta $I_L=\sqrt3I_{ph}$.

::: callout-formula KTU Formula Vault: M2 Reflexes
$0.707/0.637$ · rect-add/polar-report · $3$-$4$-$5$ · $P=VI\cos\phi$ · star-V/delta-I.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs an RLC series solve (with power + PF) and a three-phase line/phase conversion, or waveform measures with a phasor sum. Triangle-spotting ($3$-$4$-$5$, $5$-$12$-$13$) halves the arithmetic — look before calculating.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) $V_m = 70.7$ V sine: RMS? (b) Series $R = 5$, $X = 12$, $V = 130$ V: $I$, PF? (c) Delta motor, $V_L = 400$ V, $I_L = 8.66$ A, PF $0.9$: power?
:::

::: step [Step 2: Execution] Three Gifts
1. $70.7/\sqrt2 = 50$ V ($50\sqrt2\approx70.7$ engineered).
2. $|Z| = 13$ ($5$-$12$-$13$!): $I = 10$ A; PF $= 5/13 \approx 0.385$ (lagging if $X_L>X_C$).
3. $P = \sqrt3(400)(8.66)(0.9) = 1.732\times400\times8.66\times0.9 \approx 5.4$ kW ($8.66 = 5\sqrt3$: $P = 3\times400\times5\times0.9/… = 5400$ W exactly — rigged numbers confess).
:::

::: step [Step 3: Conclusion] Final Result
Engineered numbers ($\sqrt2$, $5$-$12$-$13$, $5\sqrt3$) signal the intended path — accept the gift, skip the grind.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$I_m = 20$ A sine. RMS?
(A) $20$ A
(*B) $20/\sqrt2 \approx 14.14$ A
(C) $12.74$ A (that's average)
(D) $28.28$ A
::: explanation
RMS $= 0.707\times20 = 14.14$; average would be $12.74$. RMS-vs-average option pairs are the standard confusion test — $0.707$ vs $0.637$ decides.
:::

::: quiz Q2: Mixed Drill
$Z = 6+j8\,\Omega$, $V = 100\angle0^\circ$ V. Current phasor?
(A) $10\angle53^\circ$
(*B) $|Z| = 10$, $\phi = 53.1^\circ$: $I = 10\angle-53.1^\circ$ A (lagging)
(C) $10\angle0^\circ$
(D) $100\angle53^\circ$
::: explanation
$I = V/Z$: magnitudes divide ($100/10$), angles subtract ($0-53.1$). Negative angle = lagging (inductive) — magnitude and story in one division.
:::

::: quiz Q3: Mixed Drill
Star load: $I_L = 5$ A. Phase current? Same load rewired delta to same lines: line current?
(A) $5$ A and $5$ A
(*B) $5$ A (star $I_{ph}=I_L$); delta draws $\sqrt3\times$ phase of higher winding voltage — line becomes $3\times$: $15$ A (the $3\times$ star–delta power/current step)
(C) $8.66$ A and $2.89$ A
(D) $15$ A and $5$ A
::: explanation
Star phase $= 5$ A. Delta on same lines: windings see $\sqrt3\times$ voltage → $\sqrt3\times$ phase current → line $\sqrt3$ of that $= 3\times5 = 15$ A. Two $\sqrt3$'s compound to $3$ — the starter-design number.
:::
