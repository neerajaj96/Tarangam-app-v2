# Markov Chains: Memoryless Jumps & Transition Matrix

**Tomorrow depends only on today — the Markov property, one-step matrix, and $n$-step evolution.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Amnesiac Traveller
A traveller hops between cities, choosing the next city by rolling dice kept *in the current city only* — how they arrived is forgotten. The **transition matrix** $P$ lists every city's dice ($P_{ij}$ = hop $i\to j$); rows sum to $1$. Multi-step forecasts multiply the dice: two hops = $P^2$, initial crowd $\pi^{(0)}$ spreads as $\pi^{(0)}P^n$.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Markov property and $P$

$$P(X_{n+1} = j \mid X_n = i, \text{history}) = P(X_{n+1} = j \mid X_n = i) = P_{ij}$$

$P$ is stochastic: $P_{ij} \ge 0$, $\sum_j P_{ij} = 1$ per row. Distribution after $n$ steps: $\pi^{(n)} = \pi^{(0)}P^n$; $n$-step matrix $P^n$ has entries $P_{ij}^{(n)} = P(X_{m+n}=j\mid X_m=i)$.

::: callout-formula KTU Formula Vault: Chain Basics
Future $\perp$ past **given present** · rows sum to **$1$** · $\pi^{(n)}=\pi^{(0)}P^n$.
:::

::: callout-pitfall Rows, Not Columns, Sum to 1
$P_{ij}$ conditions on *being at $i$* — the outgoing dice from $i$ sum to $1$. Column sums are unconstrained. Transposing the matrix (or normalising columns) breaks every downstream computation.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Sunny/Rainy: $P = \begin{pmatrix}0.8&0.2\\0.4&0.6\end{pmatrix}$ (rows Sunny, Rainy). Start Sunny. Distribution after $2$ days? $P(\text{rainy day }2)$?
:::

::: step [Step 2: Execution] Multiply the Dice
1. $P^2 = \begin{pmatrix}0.72&0.28\\0.56&0.44\end{pmatrix}$ (e.g. $0.8^2+0.2\cdot0.4 = 0.72$).
2. $\pi^{(0)} = (1,0)$: $\pi^{(2)} = (0.72, 0.28)$ — $28\%$ rainy on day $2$.
:::

::: step [Step 3: Conclusion] Final Result
$P^n$ answers "from $i$, where after $n$"; row-vector premultiplication folds in the start. Keep vector-on-left order — column-vector habits from linear algebra transpose the answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What is the Markov property?
(A) The future is independent of everything
(*B) Given the present state, future and past are independent — only today matters
(C) All states are equally likely
(D) The chain never repeats states
::: explanation
History funnels through $X_n$: $P(X_{n+1}\mid X_n, \dots, X_0) = P(X_{n+1}\mid X_n)$. The present screens off the past — memorylessness for jumps, mirroring the exponential's memorylessness for waits.
:::

::: quiz Q2: Numerical Drill
$P = \begin{pmatrix}0.5&0.5\\0.2&0.8\end{pmatrix}$, start state $1$. $P(X_1 = 2)$ and $P(X_2 = 2)$?
(A) $0.5$ and $0.8$
(*B) $0.5$; row $1$ of $P^2$: $0.5(0.5)+0.5(0.8) = 0.65$
(C) $0.2$ and $0.5$
(D) $0.5$ and $0.5$
::: explanation
One step reads off row $1$ ($0.5$). Two steps need $P^2$'s $(1,2)$ entry: via $1$ ($0.25$) plus via $2$ ($0.40$) = $0.65$. Enumerate intermediate states — that enumeration *is* Chapman–Kolmogorov (next topics).
:::

::: quiz Q3: Foundational Concept
Why must each row of $P$ sum to $1$?
(A) Convention only
(*B) From state $i$ the chain must go *somewhere* — the $P_{ij}$ over all destinations $j$ exhaust the conditional probability
(C) Columns must too
(D) To make $P$ invertible
::: explanation
$\sum_j P(X_{n+1}=j\mid X_n=i) = 1$ by total probability given the present. A row summing to $0.9$ leaks $10\%$ of futures — always audit rows first when handed a matrix.
:::
