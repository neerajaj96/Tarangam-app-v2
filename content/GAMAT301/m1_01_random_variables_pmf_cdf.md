# Random Variables, pmf & cdf

**What a random variable is, how a pmf assigns probabilities, and how the cdf accumulates them — the vocabulary for everything in M1–M2.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Labelled Lottery Tickets
A **random variable** is just a number attached to each lottery outcome: toss two coins, and $X$ = "number of heads" turns $\{TT, TH, HT, HH\}$ into $\{0, 1, 1, 2\}$. The **pmf** lists each value's winning chance ($P(X=0)=1/4$, $P(X=1)=1/2$, $P(X=2)=1/4$). The **cdf** $F(x) = P(X \le x)$ is the running total — "chance of *at most* $x$". pmf answers "exactly"; cdf answers "up to".
:::

::: anim pmf-cdf-bars Bars for Exactly, Steps for Up-To
Two-coin bars ($1/4$, $1/2$, $1/4$) with the cdf staircase climbing $0.25 \to 0.75 \to 1.0$ — read heights for points, step levels for intervals.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Random variable and pmf

A (discrete) random variable maps sample-space outcomes to real numbers. Its **probability mass function** $p(x) = P(X = x)$ must satisfy:

$$p(x) \ge 0, \qquad \sum_{\text{all } x} p(x) = 1$$

### 2.2 Cumulative distribution function

$$F(x) = P(X \le x) = \sum_{t \le x} p(t)$$

Properties: $0 \le F \le 1$, non-decreasing, stepwise flat-then-jump for discrete $X$, $F \to 0$ left and $\to 1$ right. Interval probabilities come free: $P(a < X \le b) = F(b) - F(a)$.

::: callout-formula KTU Formula Vault: pmf/cdf
**$p(x)\ge 0$, $\sum p = 1$** · **$F(x)=\sum_{t\le x}p(t)$** · $P(a<X\le b)=F(b)-F(a)$ · jumps of $F$ = pmf spikes.
:::

::: callout-pitfall $P(X=x)$ vs $P(X\le x)$
"At most 2" needs the cdf sum $p(0)+p(1)+p(2)$, not $p(2)$ alone. Half of all 3-mark losses in this chapter come from answering "exactly" when asked "at most" (or vice versa) — underline the keyword first.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$X$ = sum of two fair dice. Write $P(X = 7)$, $P(X \le 4)$, and $P(6 < X \le 9)$.
:::

::: step [Step 2: Execution] Counting and Accumulating
1. $36$ equally likely pairs; $7$ arises from $6$ pairs → $P(X=7) = 6/36 = 1/6$.
2. Sums $2,3,4$ have $1+2+3 = 6$ pairs → $P(X\le4) = 6/36 = 1/6$.
3. $F(9)-F(6)$: sums $7,8,9$ have $6+5+4 = 15$ pairs → $15/36 = 5/12$.
:::

::: step [Step 3: Conclusion] Final Result
pmf for the point question, cdf differences for intervals. Dice sums are the default practice ground — master the $36$-pair table once and reuse it all semester.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Which of these can be a pmf?
(A) $p(0)=0.5, p(1)=0.5, p(2)=0.2$
(*B) $p(0)=0.2, p(1)=0.5, p(2)=0.3$
(C) $p(0)=-0.1, p(1)=1.1$
(D) $p(0)=0.4, p(1)=0.4$
::: explanation
A pmf needs non-negative values summing to exactly $1$. Only (B) sums to $1.0$ with no negatives; (A) sums to $1.2$, (C) has a negative, (D) sums to $0.8$.
:::

::: quiz Q2: Foundational Concept
$F(3) = 0.7$ and $F(5) = 0.9$ for integer-valued $X$. What is $P(3 < X \le 5)$?
(A) $1.6$
(*B) $0.9 - 0.7 = 0.2$
(C) $0.7$
(D) $0.9$
::: explanation
$P(a < X \le b) = F(b) - F(a)$: the cdf difference strips off everything up to $3$, leaving exactly $\{4, 5\}$. Note $X = 3$ itself is excluded by the strict left inequality.
:::

::: quiz Q3: Foundational Concept
The cdf of a discrete $X$ is a step function. What do the jump sizes equal?
(A) The values of $X$ themselves
(*B) The pmf values $p(x)$ at each jump point
(C) Always $1$
(D) Zero everywhere
::: explanation
$F$ accumulates $p(t)$ as $x$ passes each support point, so each stair-riser has height exactly $p(x)$. Reading jumps backwards recovers the pmf — a favourite "given graph, find distribution" twist.
:::
