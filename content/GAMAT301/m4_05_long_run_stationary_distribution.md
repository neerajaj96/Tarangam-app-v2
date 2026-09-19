# Long-Run Proportions & Stationary Distribution

**Where the chain settles — balance equations $\pi = \pi P$, solving them, and reading them as time-fractions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Commuter Equilibrium
Commuters redistribute among districts nightly per fixed moving fractions. Equilibrium means tonight's arrivals exactly refill each district's departures — inflow $=$ outflow everywhere (**global balance** $\pi = \pi P$). Start anywhere reasonable and the crowd converges to these fixed shares: the **long-run fraction** of nights spent in each district.
:::

::: anim balance-flows Inflow Equals Outflow
Dry and Wet trade $0.171$ each way nightly at shares $0.43$/$0.57$ — the worked equilibrium drawn.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Stationary equations

$$\pi = \pi P, \qquad \sum_j \pi_j = 1, \quad \pi_j \ge 0$$

i.e. $\pi_j = \sum_i \pi_i P_{ij}$ per state. Finite irreducible aperiodic chain: unique $\pi$, and $P_{ij}^{(n)} \to \pi_j$ regardless of start — $\pi_j$ is the long-run proportion of time in $j$ (and $1/\pi_j$ the mean recurrence time).

### 2.2 Two-state shortcut

$P = \begin{pmatrix}1-a&a\\ b&1-b\end{pmatrix}$: $\pi_1 = b/(a+b)$, $\pi_2 = a/(a+b)$ — each share ∝ the *incoming* rate. Memorise; it halves 2-state algebra.

::: callout-formula KTU Formula Vault: Stationary
**$\pi=\pi P$, $\sum\pi=1$** · 2-state: **$(b,a)/(a+b)$** · $\pi_j$ = long-run fraction, $1/\pi_j$ = mean return time.
:::

::: callout-pitfall $\pi P$ vs $P\pi$
Stationary distribution is a *row* vector on the *left*. Solving $P\pi = \pi$ (column eigenvector) answers a different eigen-problem — with asymmetric $P$ the numbers differ, silently wrecking the answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Weather: Dry→Dry $0.6$, Wet→Wet $0.7$ (so $a = 0.4$ dry-leaving, $b = 0.3$ wet-leaving). Long-run dry fraction? Mean recurrence of wet spells' start?
:::

::: step [Step 2: Execution] Balance and Read
1. $\pi_{dry} = 0.3/0.7 \approx 0.4286$, $\pi_{wet} = 0.4/0.7 \approx 0.5714$ (check: $0.4286(0.6)+0.5714(0.3) = 0.4286$ ✓).
2. Mean return to Wet $\approx 1/0.5714 \approx 1.75$ days.
:::

::: step [Step 3: Conclusion] Final Result
Solve $\pi = \pi P + $ normalisation, verify by substitution, read fractions and return times. The 2-state shortcut makes this a two-line question.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$P = \begin{pmatrix}0.9&0.1\\0.5&0.5\end{pmatrix}$. Stationary distribution?
(A) $(0.5, 0.5)$
(*B) $a = 0.1$, $b = 0.5$: $(5/6, 1/6) \approx (0.8333, 0.1667)$
(C) $(0.9, 0.5)$
(D) $(0.1, 0.5)$
::: explanation
$\pi_1 = b/(a+b) = 0.5/0.6 = 5/6$; $\pi_2 = 1/6$. State $1$ is sticky (leaves at $0.1$) so it dominates — shares favour the retentive state, exactly as inflow/outflow intuition says.
:::

::: quiz Q2: Foundational Concept
$\pi = (0.25, 0.75)$ is stationary. Long-run meaning and mean recurrence of state $1$?
(A) Start there; returns every $4$ steps exactly
(*B) Chain spends $25\%$ of time in state $1$ asymptotically; mean return time $1/0.25 = 4$ steps
(C) State $1$ is transient
(D) $P_{11} = 0.25$
::: explanation
$\pi_j$ is a *time fraction*, not a one-step probability; $1/\pi_j$ the expected gap between visits. Both readings need irreducibility (else the limit depends on the start).
:::

::: quiz Q3: Foundational Concept
When does $\lim_n P_{ij}^{(n)} = \pi_j$ hold independent of $i$?
(A) Always
(*B) Finite irreducible aperiodic (ergodic) chains — periodicity or reducibility break start-independence
(C) Only 2-state chains
(D) Only symmetric chains
::: explanation
A 2-cycle's $P^n$ oscillates forever (no limit); reducible chains trap starts in different classes. Aperiodicity + irreducibility (ergodic) force forgetting of the start — the convergence KTU assumes when asking for "long-run" numbers.
:::
