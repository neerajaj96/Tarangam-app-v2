# Ohm's Law, KCL, KVL & Division Rules

**The three laws plus the two shortcuts — current/voltage division and relative potential — with full numerical drills.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Waterworks
Voltage is water pressure, current is flow rate, resistance is pipe narrowness (**Ohm**: flow = pressure ÷ narrowness). **KCL**: at any junction, inflow = outflow (water can't pile up). **KVL**: round any loop, climbs = drops (no free pressure). **Division rules** skip the algebra: series voltage splits ∝ resistance; parallel current splits inversely ∝ resistance.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The laws

$$V = IR \qquad \sum I_{in} = \sum I_{out}\ \text{(KCL)} \qquad \sum V = 0\ \text{round a loop (KVL)}$$

Sign discipline: traverse a resistor with the current → drop ($-IR$); against → rise ($+IR$); battery $-$ to $+$ → rise ($+E$).

### 2.2 Division and relative potential

Series ($R_1, R_2$, total $V$): $V_1 = V\cdot R_1/(R_1+R_2)$. Parallel (total $I$): $I_1 = I\cdot R_2/(R_1+R_2)$ — the *other* resistor on top. **Relative potential**: pick a reference (ground $0$ V); node voltage = algebraic sum along any path from ground.

```text
   Series split:            Parallel split:
   +--R1--R2--+             +--R1--+
   |  V1  V2  |  V          I   I1  I2
   +----------+             +--R2--+
   V1 = V·R1/(R1+R2)        I1 = I·R2/(R1+R2)  ← OTHER R on top
```

::: callout-formula KTU Formula Vault: DC Basics
**$V=IR$** · KCL **sums equal** · KVL **loop sums zero** · series $V_i=V R_i/\sum R$ · parallel $I_i=I R_{other}/\sum R$.
:::

::: callout-pitfall The Other Resistor
Parallel $I_1$ uses $R_2$ on top — the #1 division error. Chant "voltage: own; current: other" while writing the fraction.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$12$ V across series $4\,\Omega + 2\,\Omega$. (a) Each voltage? (b) Rewire in parallel across $12$ V: each current and total? (c) Node between them (series case) relative to negative terminal?
:::

::: step [Step 2: Execution] Divide Twice, Reference Once
1. $V_1 = 12\cdot4/6 = 8$ V, $V_2 = 4$ V (sum $12$ ✓).
2. $I_1 = 3$ A, $I_2 = 6$ A, total $9$ A (check: $12/ (4\parallel2) = 12/1.333 = 9$ ✓).
3. Going $0 \to +$ through $V_2$: node $= +4$ V (or $12-8 = 4$ V from the top).
:::

::: step [Step 3: Conclusion] Final Result
Division first, KCL/KVL as audit (sums must close). Every "find branch X" question is one fraction — identify series vs parallel before writing anything.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$20$ V across series $3\,\Omega$, $7\,\Omega$. Voltage over $7\,\Omega$?
(A) $6$ V
(*B) $20\cdot7/10 = 14$ V
(C) $20$ V
(D) $10$ V
::: explanation
Series share ∝ resistance: $7/10$ of $20$ V $= 14$ V (remainder $6$ V over $3\,\Omega$; sums to $20$ ✓).
:::

::: quiz Q2: Numerical Drill
$12$ A total into parallel $6\,\Omega$, $3\,\Omega$. Current through $6\,\Omega$?
(A) $8$ A
(*B) $12\cdot3/9 = 4$ A — other resistor ($3$) on top
(C) $12$ A
(D) $6$ A
::: explanation
Current favours the easy path: $6\,\Omega$ takes $3/9$ of total $= 4$ A; $3\,\Omega$ takes $8$ A. Own-resistor-on-top gives $8$ A — the planted trap.
:::

::: quiz Q3: Foundational Concept
KVL round a loop gives $+9 - 3I - 6I = 0$. What is $I$ and what do the signs mean?
(A) $1$ A, all drops
(*B) $I = 1$ A; $+9$ is a rise (battery $-$ to $+$), $3I, 6I$ are drops traversed with the current
(C) $-1$ A, battery reversed
(D) $9$ A
::: explanation
$9 = 9I$ gives $1$ A. Sign rule: with-current traversal drops, $-$ to $+$ climbs. Consistent signs make KVL an equation, not a guess.
:::
