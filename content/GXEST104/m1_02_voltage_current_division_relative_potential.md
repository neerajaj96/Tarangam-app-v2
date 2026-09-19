# Voltage/Current Division & Relative Potential

**The two shortcuts plus the reference game — series shares, parallel shares, and node voltages from any ground.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Bill Splitting
Series resistors split the voltage bill ∝ their resistance (big resistor pays more). Parallel branches split the current crowd inversely (easy path takes more). **Relative potential** picks sea level first (ground $=$ $0$ V) — every other height is measured from there, and moving the sea moves all readings together.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The two fractions

Series ($R_1, R_2$, total $V$): $V_1 = V\cdot R_1/(R_1+R_2)$. Parallel (total $I$): $I_1 = I\cdot R_2/(R_1+R_2)$ — the *other* resistor on top. **Relative potential**: pick a reference (ground $0$ V); node voltage = algebraic sum along any path from ground (path-independent by KVL).

```text
   Series split:            Parallel split:
   +--R1--R2--+             +--R1--+
   |  V1  V2  |  V          I   I1  I2
   +----------+             +--R2--+
   V1 = V·R1/(R1+R2)        I1 = I·R2/(R1+R2)  ← OTHER R on top
```

::: callout-formula KTU Formula Vault: Division
Series $V_i=V R_i/\sum R$ · parallel $I_i=I R_{other}/\sum R$ · ground first, then sum from it.
:::

::: callout-pitfall The Other Resistor
Parallel $I_1$ uses $R_2$ on top — the #1 division error. Chant "voltage: own; current: other" while writing the fraction.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$12$ V across series $4\,\Omega + 2\,\Omega$. (a) Each voltage? (b) Rewire in parallel across $12$ V: each current and total? (c) Node between them (series case) relative to negative terminal — and to the positive terminal?
:::

::: step [Step 2: Execution] Divide Twice, Reference Twice
1. $V_1 = 12\cdot4/6 = 8$ V, $V_2 = 4$ V (sum $12$ ✓).
2. $I_1 = 3$ A, $I_2 = 6$ A, total $9$ A (check: $12/ (4\parallel2) = 12/1.333 = 9$ ✓).
3. From negative terminal up through $V_2$: node $= +4$ V (or $12-8$ ✓). From positive terminal down: $4-12 = -8$ V — same node, moved sea.
:::

::: step [Step 3: Conclusion] Final Result
Fractions first, reference discipline always stated ("relative to X"). Every "find branch X" question is one fraction — identify series vs parallel before writing anything.
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

::: quiz Q3: Numerical Drill
Series $12$ V ($4\,\Omega$ top, $2\,\Omega$ bottom, $-$ at bottom). Node between, measured against the $+$ terminal instead?
(A) $+4$ V
(*B) $-8$ V — ground moved to $+12$: $4-12$; magnitudes shift, differences ($8$/$4$ V drops) never do
(C) $+8$ V
(D) $0$ V
::: explanation
Reference is a choice, drops are physics: re-grounding slides all node voltages by a constant while every element voltage stays put. State "relative to" or the number is meaningless.
:::
