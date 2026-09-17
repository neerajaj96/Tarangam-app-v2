# Zener, Avalanche & Voltage Regulation

**Designed breakdown — tunnelling vs avalanche, the regulator circuit, and current-limit arithmetic.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Pressure Relief Valve
Normal diodes fear breakdown; **Zeners** are *engineered* for it — a relief valve that holds pipeline pressure at $V_Z$ by venting excess current. Lightly-doped wide junctions avalanche (carrier pinball multiplication, $>6$ V); heavily-doped narrow ones tunnel through quantum-mechanically (Zener effect, $<5$ V). Either way the valve clamps: voltage frozen, surplus current shunted.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Breakdown types

* **Zener (tunnelling):** thin depletion (heavy doping), $<5$–$6$ V, negative temp coefficient.
* **Avalanche:** wide depletion, carriers gain ionising energy, chain multiplication, $>6$ V, positive temp coefficient. (~$5$–$6$ V both mix.)

### 2.2 Regulator operation + design

Zener reverse across load, series resistor $R_S$ drops the surplus: $V_{in} - V_Z$ across $R_S$. Currents: $I_S = I_Z + I_L$. Regulation holds while $I_Z$ stays within $[I_{Zmin}, I_{Zmax}]$: $R_S$ chosen so worst-case (max load + min $V_{in}$) keeps $I_Z \ge I_{Zmin}$.

::: callout-formula KTU Formula Vault: Zener Regulator
Valve at **$V_Z$** · $I_S=I_Z+I_L$ · $R_S$ drops **$V_{in}-V_Z$** · alive while **$I_Z$ in range**.
:::

::: callout-pitfall Zener Must Be Reverse-Biased
Forward Zener = ordinary $0.7$ V diode (no regulation!). Regulation lives *only* in reverse breakdown — a forward-drawn Zener in the circuit diagram fails the question instantly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$V_{in} = 12$ V, $V_Z = 6$ V, $R_S = 100\,\Omega$, load $600\,\Omega$. Find $I_S, I_L, I_Z$. Is regulation alive? What if load halves to $300\,\Omega$?
:::

::: step [Step 2: Execution] Split the Current
1. $I_S = (12-6)/100 = 60$ mA. $I_L = 6/600 = 10$ mA. $I_Z = 50$ mA — healthy (within typical $5$–$50$+ mA band edge; assume rated).
2. Load $300\,\Omega$: $I_L = 20$ mA, $I_Z = 40$ mA — still regulating (valve absorbs less as load takes more — the shunt seesaw).
:::

::: step [Step 3: Conclusion] Final Result
Series current fixed by $(V_{in}-V_Z)/R_S$; load and Zener seesaw around it. Regulation dies when the seesaw hits a stop ($I_Z$ out of range) — always check both load extremes.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Zener vs avalanche breakdown differ by:
(A) Nothing, same thing
(*B) Mechanism (tunnelling in thin heavily-doped junctions vs impact-ionisation chains in wide ones), voltage band ($<5$ vs $>6$ V), temp-coefficient sign
(C) Forward vs reverse
(D) AC vs DC
::: explanation
Doping sets depletion width, width sets mechanism, mechanism sets voltage and temp behaviour. Three linked contrasts — recite as one chain, not isolated facts.
:::

::: quiz Q2: Numerical Drill
$V_{in} = 15$ V, $V_Z = 5$ V, $R_S = 200\,\Omega$, $I_L = 10$ mA. $I_Z$?
(A) $60$ mA
(*B) $I_S = 10/200 = 50$ mA; $I_Z = 50-10 = 40$ mA
(C) $10$ mA
(D) $75$ mA
::: explanation
Series current $(15-5)/200 = 50$ mA splits: load $10$, Zener $40$. $I_Z$ is the *remainder*, never the first computed — order matters.
:::

::: quiz Q3: Foundational Concept
Load current rises sharply. What happens to $I_Z$ (regulating)?
(A) Rises equally
(*B) Falls by the same amount — $I_S$ fixed by $(V_{in}-V_Z)/R_S$, so $I_Z = I_S - I_L$ seesaws down
(C) Stays frozen
(D) Reverses direction
::: explanation
The series resistor sets total current; load and valve share it. Rising load starves the valve — dropout when $I_Z$ hits minimum. Seesaw first, numbers second.
:::
