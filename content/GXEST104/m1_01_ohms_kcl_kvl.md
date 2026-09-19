# Ohm's Law, KCL & KVL

**The three laws everything else is built on — pressure-flow-narrowness, junction balance, and loop balance, with sign discipline.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Waterworks
Voltage is water pressure, current is flow rate, resistance is pipe narrowness (**Ohm**: flow = pressure ÷ narrowness). **KCL**: at any junction, inflow = outflow (water can't pile up). **KVL**: round any loop, climbs = drops (no free pressure). Learn these cold — division shortcuts, mesh, and nodal are all bookkeeping built on top.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The laws

$$V = IR \qquad \sum I_{in} = \sum I_{out}\ \text{(KCL)} \qquad \sum V = 0\ \text{round a loop (KVL)}$$

Sign discipline: traverse a resistor with the current → drop ($-IR$); against → rise ($+IR$); battery $-$ to $+$ → rise ($+E$).

::: callout-formula KTU Formula Vault: DC Laws
**$V=IR$** · KCL **sums equal** · KVL **loop sums zero** · with-current = **drop**, $-$ to $+$ = **rise**.
:::

::: callout-pitfall Unsigned KVL
Writing every term positive ($9+3I+6I = 0$) manufactures sign errors. Fix traversal direction first, then let with-current drops and $-$ to $+$ rises assign themselves — consistent signs make KVL an equation, not a guess.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$9$ V across parallel $3\,\Omega$, $6\,\Omega$. Each branch current, total current by KCL, and a power audit.
:::

::: step [Step 2: Execution] Ohm Twice, KCL Once
1. $I_1 = 9/3 = 3$ A; $I_2 = 9/6 = 1.5$ A (Ohm per branch — same voltage, independent answers).
2. Total leaving the source $= 3+1.5 = 4.5$ A (KCL at either terminal).
3. Delivered $9\times4.5 = 40.5$ W; absorbed $3^2\times3 + 1.5^2\times6 = 27+13.5 = 40.5$ W ✓ balanced.
:::

::: step [Step 3: Conclusion] Final Result
Ohm per element, KCL per junction, KVL per loop — one law per question type. Power audit closes every DC answer; run it before boxing.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Current $2.5$ A through $4\,\Omega$. Voltage?
(A) $6.5$ V
(*B) $2.5\times4 = 10$ V
(C) $1.6$ V
(D) $0.625$ V
::: explanation
$V = IR = 2.5\times4 = 10$ V directly. Division ($2.5/4$) inverts the law — Ohm multiplies, conductance divides.
:::

::: quiz Q2: Numerical Drill
Junction: $2$ A and $5$ A in, $4$ A out, plus one unknown branch. Its value and direction?
(A) $11$ A out
(*B) $3$ A out — $2+5 = 4+x$ gives $x = 3$, positive so the assumed outward direction holds
(C) $3$ A in
(D) $1$ A out
::: explanation
KCL: sums equal, $7 = 4 + x$. Sign carries the verdict — negative would have flipped the assumed arrow, so state direction with the number.
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
