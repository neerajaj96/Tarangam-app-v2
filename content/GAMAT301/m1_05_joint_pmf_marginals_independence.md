# Joint pmf, Marginals & Independence

**Two discrete variables at once — joint tables, row/column sums, and the factorisation test.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Spreadsheet of Chances
A joint pmf is a spreadsheet: rows = $X$ values, columns = $Y$ values, cells = $P(X=x, Y=y)$. **Marginals** are the row/column totals in the margins ("ignoring the other variable"). **Independence** means every cell equals (row total × column total) — the grid has no cross-pattern, just multiplied margins.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Joint and marginal pmfs

$$p(x,y) = P(X=x, Y=y) \ge 0, \quad \sum_x\sum_y p(x,y) = 1$$

$$p_X(x) = \sum_y p(x,y), \qquad p_Y(y) = \sum_x p(x,y)$$

The worked table below, with margins attached:

| $X\backslash Y$ | $0$ | $1$ | $p_X$ |
|---|---|---|---|
| $0$ | $0.2$ | $0.3$ | $0.5$ |
| $1$ | $0.1$ | $0.4$ | $0.5$ |
| $p_Y$ | $0.3$ | $0.7$ | $1.0$ |

Margins sum to $1.0$ both ways — the two-second audit before any independence test.

### 2.2 Independence test

$X, Y$ independent iff every cell factorises:

$$p(x,y) = p_X(x)\,p_Y(y) \quad \forall x, y$$

One failing cell kills independence. Independent ⇒ $E[XY] = E[X]E[Y]$ and variances of sums add.

::: callout-formula KTU Formula Vault: Joint/Marginal
Cells sum to **$1$** · margins = **row/column sums** · independent iff **cell = margin × margin** everywhere.
:::

::: callout-pitfall One Cell Fails, All Fails
Checking a single convenient cell is not a proof — independence needs *every* $(x,y)$. Find one counterexample cell and stop (dependent); to claim independence, verify the full grid.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Joint table: $p(0,0)=0.2$, $p(0,1)=0.3$, $p(1,0)=0.1$, $p(1,1)=0.4$. Find marginals and test independence.
:::

::: step [Step 2: Execution] Margins Then Products
1. $p_X(0) = 0.5$, $p_X(1) = 0.5$; $p_Y(0) = 0.3$, $p_Y(1) = 0.7$.
2. Check $(0,0)$: $p_X(0)p_Y(0) = 0.15 \ne 0.2$ — fails at the first cell. Dependent (no need to check further).
:::

::: step [Step 3: Conclusion] Final Result
Margins first, then hunt for a violating cell. Early failure ends the test — write the failing cell explicitly for full marks.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$p(1,1)=0.12$, $p_X(1)=0.4$, $p_Y(1)=0.3$. Consistent with independence?
(A) No, $0.12$ is too small
(*B) Yes for this cell — $0.4\times0.3 = 0.12$ matches (full verdict needs all cells)
(C) Yes, proven independent
(D) Cannot tell anything
::: explanation
This cell factorises correctly, which is necessary but not sufficient — every other cell must too. One match never proves independence; one mismatch disproves it.
:::

::: quiz Q2: Foundational Concept
How is the marginal $p_X(x)$ obtained from the joint table?
(A) Reading the diagonal
(*B) Summing the joint probabilities over all $y$ for that fixed $x$ (row total)
(C) Multiplying all cells
(D) Dividing by $p_Y$
::: explanation
Marginalising "sums out" the unwanted variable: $p_X(x) = \sum_y p(x,y)$. The name comes from writing these totals in the table's margin.
:::

::: quiz Q3: Foundational Concept
If $X, Y$ are independent, what is $E[XY]$?
(A) $E[X] + E[Y]$
(*B) $E[X]E[Y]$
(C) $0$ always
(D) $E[X]/E[Y]$
::: explanation
Factorisation passes through the double sum: $\sum\sum xy\,p_X(x)p_Y(y) = (\sum x p_X)(\sum y p_Y)$. Without independence this splits nothing — the commonest misused identity in the chapter.
:::
