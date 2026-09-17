# Chapman–Kolmogorov Equations

**Going via middle states — the matrix-multiplication law behind every multi-step forecast.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Connecting Flights
Delhi → Chennai via Mumbai, Hyderabad, or direct: total odds = sum over layovers (to-layover × from-layover). Chapman–Kolmogorov says every $m+n$-step trip factorises through *wherever you were at step $m$* — enumerate middles, multiply legs, add. Matrix squaring is just all layover-sums at once.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Equation and matrix form

$$P_{ij}^{(m+n)} = \sum_k P_{ik}^{(m)}\,P_{kj}^{(n)}, \qquad P^{m+n} = P^m P^n$$

Proof sketch: condition on $X_m = k$ (total probability) and apply Markov at $m$. Special cases: $\pi^{(n)} = \pi^{(0)}P^n$; first-step analysis conditions on the *first* jump instead.

::: callout-formula KTU Formula Vault: C-K
**$P_{ij}^{(m+n)}=\sum_k P_{ik}^{(m)}P_{kj}^{(n)}$** · matrices **multiply**: $P^{m+n}=P^mP^n$.
:::

::: callout-pitfall Condition on the Middle, Not the Start
C-K sums over *intermediate* $k$ at the split time. Summing over starting states instead answers a different question (total probability from a distribution) — split time first, then enumerate.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$P = \begin{pmatrix}0.7&0.3\\0.2&0.8\end{pmatrix}$. Find $P_{11}^{(2)}$ via C-K (through states $1$, $2$) and verify against $P^2$.
:::

::: step [Step 2: Execution] Two Layovers
$P_{11}^{(2)} = P_{11}P_{11} + P_{12}P_{21} = 0.49 + 0.06 = 0.55$. Full $P^2 = \begin{pmatrix}0.55&0.45\\0.30&0.70\end{pmatrix}$ — matches. Stay–stay plus leave–return: every diagonal entry has this "persist or excursion" structure.
:::

::: step [Step 3: Conclusion] Final Result
One entry by hand shows the mechanism; full powers mechanise it. For 3-mark "find 2-step probability" answers, hand-enumeration beats matrix machinery.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$P = \begin{pmatrix}0.6&0.4\\0.3&0.7\end{pmatrix}$. $P_{12}^{(2)}$?
(A) $0.4$
(*B) $0.6(0.4)+0.4(0.7) = 0.24+0.28 = 0.52$
(C) $0.16$
(D) $0.7$
::: explanation
Via $1$: $0.6\times0.4$; via $2$: $0.4\times0.7$; sum $0.52$. Both layovers contribute — dropping the via-$2$ leg ($0.28$) is the common half-answer.
:::

::: quiz Q2: Foundational Concept
What does $P^{m+n} = P^mP^n$ mean in words?
(A) Chains commute with everything
(*B) An $(m+n)$-step transition enumerates all intermediate states at time $m$, multiplying the $m$-leg by the $n$-leg
(C) Powers add entrywise
(D) The chain is memoryless only at multiples
::: explanation
Matrix multiplication *is* the layover sum written compactly. Time-homogeneity (same $P$ each step) lets legs share one matrix; without it, products chain distinct matrices instead.
:::

::: quiz Q3: Foundational Concept
First-step analysis vs Chapman–Kolmogorov — direction of conditioning?
(A) Identical always
(*B) C-K conditions on the middle state at a split time; first-step conditions on the state after one jump to get equations for hitting times/probabilities
(C) First-step needs no Markov property
(D) C-K applies only to 2 states
::: explanation
C-K propagates *forward* through middles for multi-step probabilities; first-step writes *backward* equations ($h_i = 1 + \sum_j P_{ij}h_j$) for expected hitting times. Same Markov soul, opposite conditioning direction.
:::
