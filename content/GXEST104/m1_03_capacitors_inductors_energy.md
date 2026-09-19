# Capacitors & Inductors: V-I Relations and Energy

**The two dynamic elements — one blocks DC after charging, one fights current change — with energy formulas and transients-free problems.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Tank vs Flywheel
A **capacitor** is a water tank: current fills charge ($Q = CV$), full tank blocks further DC flow (open circuit in steady DC). An **inductor** is a flywheel: it resists *changes* in flow (voltage $\propto$ rate of change), running freely once spinning (short circuit in steady DC). Tanks store in electric fields, flywheels in magnetic fields — both give energy back, neither burns it (ideal).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 V-I relations and energy

Capacitor: $i = C\,dv/dt$, $Q = CV$; energy $W_C = \tfrac12 CV^2$. Inductor: $v = L\,di/dt$; energy $W_L = \tfrac12 LI^2$. Duality: swap $v\leftrightarrow i$, $C\leftrightarrow L$, series$\leftrightarrow$parallel.

### 2.2 Series/parallel and DC steady state

Capacitors: series $1/C_{eq} = \sum 1/C_i$; parallel $C_{eq} = \sum C_i$ (inductors mirror resistors: series adds, parallel reciprocates). Steady DC: capacitor = open, inductor = short — reduce the circuit first, then solve resistive.

::: callout-formula KTU Formula Vault: C and L
$C$: **$i=C\,dv/dt$**, $W=\tfrac12CV^2$ · $L$: **$v=L\,di/dt$**, $W=\tfrac12LI^2$ · DC steady: **$C$ open, $L$ short**.
:::

::: callout-pitfall Series/Parallel Flip Between C and L
Capacitor rules are the *mirror* of resistor rules (series reciprocates); inductor rules *match* resistors. Memorise "C flips, L follows R" — swapping them inverts every equivalent.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) $10\,\mu$F at $100$ V: charge and energy? (b) $2$ H carrying $3$ A: energy? (c) Series $4\,\mu$F + $12\,\mu$F across $48$ V: equivalent and each voltage?
:::

::: step [Step 2: Execution] Store, Then Split
1. $Q = 10^{-5}\times100 = 1$ mC; $W = \tfrac12(10^{-5})(10^4) = 0.05$ J.
2. $W = \tfrac12(2)(9) = 9$ J — current-squared, like kinetic energy.
3. $C_{eq} = (4\cdot12)/16 = 3\,\mu$F; $Q = 3\times48 = 144\,\mu$C; $V_1 = 144/4 = 36$ V, $V_2 = 12$ V (smaller $C$ hogs voltage — inverse split).
:::

::: step [Step 3: Conclusion] Final Result
Energy is one formula each; series-$C$ voltage splits *inversely* (charge equal, $V = Q/C$). Duality predicts every inductor answer from its capacitor twin.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$5$ H inductor, current ramps $0\to4$ A. Stored energy at $4$ A?
(A) $10$ J
(*B) $\tfrac12(5)(16) = 40$ J
(C) $20$ J
(D) $80$ J
::: explanation
$W = \tfrac12LI^2 = 0.5\times5\times16 = 40$ J. Linear-in-$L$, quadratic-in-$I$ — doubling current quadruples storage.
:::

::: quiz Q2: Foundational Concept
Steady DC reached in an $R$-$C$-$L$ series circuit. What remains?
(A) All three drop voltage
(*B) Capacitor open (full, blocks), inductor short (steady current) — only $R$ sets the current $I = V/R$
(C) Inductor open, capacitor short
(D) Nothing conducts
::: explanation
No $dv/dt$ (full tank) and no $di/dt$ (steady spin) means $i_C = 0$ and $v_L = 0$. Reduce-then-solve is the mandatory first move in every DC-steady question.
:::

::: quiz Q3: Numerical Drill
Parallel $6\,\mu$F and $3\,\mu$F at $90$ V. Total stored energy?
(A) $0.5$ J
(*B) $C_{eq} = 9\,\mu$F; $W = \tfrac12(9\times10^{-6})(8100) = 0.03645$ J ≈ $36.5$ mJ
(C) $90$ J
(D) $0.81$ J
::: explanation
Parallel adds ($9\,\mu$F), same voltage both: $0.5\times9\times10^{-6}\times8100 = 36.45$ mJ. Energy scales with $V^2$ — high-voltage even-small-$C$ stores seriously.
:::
