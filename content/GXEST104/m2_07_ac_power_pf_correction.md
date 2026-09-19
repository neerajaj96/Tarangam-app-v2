# Power in AC: PF, Active, Reactive & Apparent

**The power triangle — what you pay for, what oscillates, and what sizes the wires — with correction problems.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Beer Mug
**Apparent power** $S$ (VA) is the full mug; **active** $P$ (W) the beer you drink (billed!); **reactive** $Q$ (VAR) the foam shuttling up and down (unbilled but fills the mug). **Power factor** $\cos\phi = P/S$ is foam management: foam-heavy (low PF) needs bigger mugs (thicker wires, larger transformers) for the same beer. Capacitor banks skim foam (PF correction).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The triangle

$$S = VI, \quad P = VI\cos\phi, \quad Q = VI\sin\phi, \quad S^2 = P^2+Q^2, \quad \text{PF} = \cos\phi = R/|Z|$$

Lagging PF (inductive loads: motors) vs leading (capacitive). Correction: parallel capacitor supplies local $Q$, shrinking line current $I = P/(V\cos\phi)$.

::: callout-formula KTU Formula Vault: Power
$S=VI$ · **$P=VI\cos\phi$** · $Q=VI\sin\phi$ · PF $=R/|Z|$ · correction: **parallel $C$**.
:::

::: callout-pitfall Lead vs Lag Ownership
Inductive (motor) = lagging; capacitive = leading. "Leading PF motor" without qualification is wrong — state the load type with the PF adjective, always as a pair.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$230$ V feeds $P = 2.3$ kW at PF $0.5$ lagging. Find $S$, $Q$, line current. What current after correction to $0.9$? What parallel $C$ ($50$ Hz) does it?
:::

::: step [Step 2: Execution] Mug Math
1. $S = 2300/0.5 = 4.6$ kVA; $Q = \sqrt{4.6^2-2.3^2} = 2.3\sqrt3 \approx 3.98$ kVAR; $I = 4600/230 = 20$ A.
2. New $I' = 2300/(230\times0.9) \approx 11.1$ A ($44\%$ relief). New $Q' = 2300\tan(\cos^{-1}0.9) \approx 2300\times0.484 = 1114$ VAR; capacitor supplies $3984-1114 = 2870$ VAR: $C = Q_c/(V^2\omega) = 2870/(52900\times314) \approx 1.73\times10^{-4}$ F $\approx 173\,\mu$F.
:::

::: step [Step 3: Conclusion] Final Result
$S\to Q\to I$, then re-target PF and difference the $Q$'s — the correction capacitor falls out. Utilities penalise low PF because $I$ (hence $I^2R$ losses) balloons for fixed $P$.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$V = 100$ V, $I = 10$ A, $\phi = 60^\circ$ lag. $P$, $Q$, $S$?
(A) $1000$, $0$, $1000$
(*B) $S = 1000$ VA; $P = 1000\cos60^\circ = 500$ W; $Q = 1000\sin60^\circ \approx 866$ VAR
(C) $500$, $500$, $707$
(D) $866$, $500$, $1000$
::: explanation
$S = VI = 1000$; split by $\cos/\sin 60^\circ$ ($0.5/0.866$). $3$-$4$-$5$-style angles ($37^\circ/53^\circ$) and $60^\circ$ are the rigged standards — recognise, don't recompute trig.
:::

::: quiz Q2: Foundational Concept
Why do utilities penalise low power factor?
(A) Reactive power damages meters
(*B) Fixed $P$ at low PF needs bigger $I = P/(V\cos\phi)$ — heavier $I^2R$ line losses and oversized plant for the same billed energy
(C) Frequency drops
(D) Voltage rises
::: explanation
Billing meters see $P$; wires feel $I$. Halved PF doubles current and quadruples losses — correction capacitors localise the foam so the grid carries mostly beer.
:::

::: quiz Q3: Numerical Drill
Load $P = 5$ kW at PF $0.6$ lag, $400$ V. Line current? After correction to unity?
(A) $12.5$ A → $12.5$ A
(*B) $I = 5000/(400\times0.6) \approx 20.8$ A → $5000/400 = 12.5$ A ($40\%$ cut)
(C) $20.8$ A → $20.8$ A
(D) $8$ A → $5$ A
::: explanation
Unity PF is pure beer ($I = P/V$ minimum). Correction from $0.6$ sheds $40\%$ of current — the headline number that sells capacitor banks to factories.
:::
