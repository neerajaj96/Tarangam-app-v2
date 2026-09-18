# M1 Drill: Basics to Regression in One Sitting

**Paradigms, MLE/MAP, losses, single-slope fits, and one gradient step — M1 as reflexes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Five-Station Circuit
Name the paradigm, count votes plus seeds, price the mistakes, fit the line, step downhill. Stations in order — M1.1's $T$-$E$-$P$ sentence feeds every later station's setup line.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Station kit

$P$-on-$T$-rises-with-$E$ · MLE $h/N$, MAP $(h+a-1)/(N+a+b-2)$ · MAE vs MSE pricing · $w_1 = \text{cov}/\text{var}$, $w_0 = \bar{y} - w_1\bar{x}$, residuals sum $0$ · $w := w - \alpha(2/n)X^T(Xw - y)$, cost must fall.

::: callout-formula KTU Formula Vault: M1 Circuit
Paradigm → estimate → price → fit → descend. Bracket check (MAP between MLE and prior mean) plus zero-sum residuals plus falling cost — three certificates, zero hope.
:::

::: callout-exam KTU Exam Focus
M1's 9-markers chain estimation into regression (one dataset, both questions) or pair loss reasoning with a gradient step. Reuse the dataset's means across sub-parts instead of recomputing — continuity is the fluency signal.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Packets: 6 ones in 8 bits, $\mathrm{Beta}(2,2)$ prior. Points $(0,0)$, $(1,2)$, $(2,4)$. (a) MLE and MAP of the one-rate? (b) Least-squares line? (c) Residual sum?"
:::

::: step [Step 2: Execution] Full Circuit
(a) MLE $= 6/8 = 0.75$; MAP $= (6+1)/(8+2) = 7/10 = 0.7$, between $0.75$ and $0.5$ as required. (b) $\bar{x} = 1$, $\bar{y} = 2$; deviations $x$: $[-1,0,1]$, $y$: $[-2,0,2]$; numerator $= 4$, denominator $= 2$, slope $2$, intercept $0$. Line $\hat{y} = 2x$. (c) Fitted $[0,2,4]$, residuals $[0,0,0]$, sum $0$.
:::

::: step [Step 3: Conclusion] Final Result
MAP $0.7$, line $\hat{y} = 2x$, residual sum $0$. Perfect collinearity makes the zero residuals a free certificate — real exam data leaves small nonzero residuals that still sum to zero.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
5 ones in 6 bits, $\mathrm{Beta}(3,3)$ prior. MAP?
(A) $5/6 \approx 0.833$
(*B) $(5+2)/(6+4) = 7/10 = 0.7$, since $a - 1 = 2$ phantom ones and $b - 1 = 2$ phantom zeros join the count
(C) $(5+3)/(6+6) = 8/12 \approx 0.667$
(D) $0.5$ by symmetry
::: explanation
$\mathrm{Beta}(3,3)$ seeds two and two, not three and three. Phantom counts are $a-1$, $b-1$ — the single most repeated MAP arithmetic trap.
:::

::: quiz Q2: Mixed Drill
True $[4, 4]$, predicted $[1, 7]$. MAE vs MSE verdict?
(A) Both $3$
(*B) MAE $= (3+3)/2 = 3$, MSE $= (9+9)/2 = 9$ — squaring triples the headline number, which is why one never compares MAE and MSE magnitudes directly
(C) MSE $3$, MAE $9$
(D) RMSE is negative here
::: explanation
Same errors, different currencies: linear pricing says $3$, quadratic says $9$. Compare MAE-to-MAE and MSE-to-MSE only, never across.
:::

::: quiz Q3: Mixed Drill
One batch gradient step raises MSE $5.0 \to 6.2$. Next move?
(A) Celebrate, higher is better
(*B) Halve $\alpha$ and redo the step, because cost must fall on this convex bowl and a rise proves overshoot
(C) Delete the bias column to compensate
(D) Switch to classification immediately
::: explanation
Convex cost plus rising value equals too-large step, full stop. Shrink $\alpha$ before touching data, features, or loss — order of operations matters.
:::
