---
id: m4_05_randomized_algorithms_las_vegas_monte_carlo
courseCode: PCCST502
module: 4
sequence: 5
title: 'Randomized Algorithms: Las Vegas & Monte Carlo'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Sign opposite contracts of random time versus probable correctness
  - Analyze randomized quicksort to expected n log n with indicators
  - Amplify Karger-style confidence by repetition and voting
concepts:
  - Las Vegas algorithms
  - Monte Carlo algorithms
  - amplification
prerequisites: []
examRelevance: medium
tags:
  - randomized-algorithms
  - probabilistic-analysis
---
# Randomized Algorithms: Las Vegas & Monte Carlo

**Trading certainty for speed two opposite ways, randomized quicksort's expected analysis, Karger's min-cut, and amplification by repetition.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Two Kinds of Gambling
**Las Vegas** gambler: always walks out with *correct* winnings, but the *time* spent is luck (randomized quicksort — sorted output guaranteed, runtime random). **Monte Carlo** gambler: finishes in *fixed* time, but the winnings are *probably* right (Karger min-cut, primality tests — fast answer, tiny error chance). Same coin flips, opposite bargains: certainty-of-answer vs. certainty-of-clock. And Monte Carlo's error is *buyable-down*: repeat and vote, and the failure chance decays exponentially.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Two Contracts

| | Las Vegas | Monte Carlo |
|---|---|---|
| Answer | Always correct | Correct with probability $\ge 1 - \epsilon$ |
| Runtime | Random (expected bound) | Fixed / bounded |
| Examples | Randomized quicksort, randomized hashing | Karger min-cut, Miller–Rabin primality |
| Error handling | None needed (rerun only for speed) | **Amplification**: $k$ independent runs + majority vote → error $\le \epsilon^k$ (exponential decay) |

### 2.2 Randomized Quicksort: Expected $\Theta(n \log n)$

Random pivot ⇒ no adversarial input survives (bad splits need *unlucky coins*, not unlucky data). Indicator analysis: $X_{ij} = 1$ iff elements $i,j$ (by rank) are ever compared; they compare iff one is chosen pivot before anything between them — probability $\frac{2}{j-i+1}$. Linearity of expectation:

$$\mathbb{E}[X] = \sum_{i<j} \frac{2}{j-i+1} = \Theta(n \log n)$$

— the harmonic sum doing the heavy lifting, zero dependence on input order.

### 2.3 Karger's Contraction: Monte Carlo Min-Cut

Repeatedly contract a *uniformly random* edge until 2 vertices remain; output the crossing edges. One run keeps the true min-cut intact with probability $\ge \frac{2}{n(n-1)}$ (no contracted edge ever lay inside it). Small odds — but $O(n^2 \log n)$ independent runs amplify success to $1 - 1/n$ territory. Exponentially many cuts exist, yet random contraction + repetition finds the minimum in polynomial time.

::: callout-formula KTU Formula Vault: Randomized Facts
Las Vegas: **right answer, random time** (rand-quicksort) · Monte Carlo: **fixed time, probably right** (Karger, Miller–Rabin) · amplify by **repeat + vote** (error $\epsilon^k$) · quicksort $\mathbb{E} = \sum_{i<j}\frac{2}{j-i+1} = \Theta(n\log n)$ · Karger single-run success $\ge \frac{2}{n(n-1)}$.
:::

::: callout-pitfall Random ≠ Approximately Correct (Know Which Bargain)
Quicksort's randomness buys *speed with exactness* (Las Vegas); Karger's buys *speed with risk* (Monte Carlo). Asking "what's quicksort's error probability" is a category error — it has none. Asking "Karger's exact runtime" misses that *fixed trials* is its contract. Name the bargain before analyzing.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
For $n = 100$ elements, (a) bound randomized quicksort's expected comparisons via the indicator sum, and (b) compute how many Karger runs make min-cut failure $< 1\%$ on a 100-vertex graph.
:::

::: step [Step 2: Execution] Computing Both
(a) $\mathbb{E}[X] = \sum_{i<j} \frac{2}{j-i+1}$: group by gap $k = j-i$ ($n-k$ pairs each): $2\sum_{k=1}^{99} \frac{100-k}{k} < 200 \sum_{k=1}^{99}\frac{1}{k} = 200 \cdot H_{99} \approx 200 \times 5.18 \approx 1036$ comparisons — versus worst-case $\approx 4950$ deterministic. Randomness nearly quintuples efficiency here.
(b) Single-run success $p \ge \frac{2}{100 \times 99} \approx 0.0002$. Failure after $t$ runs $\le (1-p)^t \le e^{-pt} < 0.01 \Rightarrow t > \frac{\ln 100}{p} \approx 4.6 \times 4950 \approx 22{,}800$ runs — each $O(n^2)$, polynomial total for an exponentially-rare-event guarantee.
:::

::: step [Step 3: Conclusion] Final Result
Quicksort: ~1036 expected vs ~4950 worst-case comparisons — randomization deletes the adversary. Karger: ~23k cheap runs buy 99% confidence against $2^{100}$ possible cuts — repetition deletes the risk. Two bargains, both settled in expectation arithmetic, not hope.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Randomized quicksort and Karger's algorithm both flip coins. What opposite contracts do they sign?
() Both guarantee correct answers in fixed time
(*) Quicksort (Las Vegas): always correct, random runtime — coins defeat adversarial inputs. Karger (Monte Carlo): fixed trials, probably correct — coins sample, repetition amplifies
() Quicksort is Monte Carlo; Karger is Las Vegas
() Neither contract means anything; the labels are historical accidents
::: explanation
Las Vegas randomizes *performance* (runtime varies, answer exact); Monte Carlo randomizes *correctness* (clock fixed, small error). The coin has two jobs — know which one is on the table before quoting guarantees.
:::

::: quiz In the quicksort indicator analysis, why is P(elements i and j are compared) = 2/(j−i+1)?
() Pivots are chosen adversarially to force this probability
(*) Among the j−i+1 elements from i to j, all orderings of first-pivot-choice are symmetric — comparison happens iff i or j is picked before anything strictly between them: 2 favorable out of j−i+1 candidates
() Comparisons happen uniformly at random with probability 1/2
() It follows from the Master Theorem with a = 2
::: explanation
Only relative order matters: the first pivot chosen among $\{i, \dots, j\}$ decides — $i$ or $j$ first $\Rightarrow$ they meet (nothing between separates them yet); anything strictly inside first $\Rightarrow$ they land in different partitions forever. Symmetry over $j-i+1$ candidates gives $2/(j-i+1)$ — the whole analysis in one symmetry.
:::

::: quiz Karger's single run succeeds with probability only ≈ 0.0002 on 100 vertices, yet the algorithm is called efficient. Reconcile.
() 0.0002 is actually a large probability in graph theory
(*) Each run is cheap (O(n²) contractions) and runs are independent — ~23k repetitions amplify success past 99% with polynomial total work, exponentially better than enumerating cuts
() The probability figure is wrong; single runs always succeed
() Efficiency refers to memory only, never time or correctness
::: explanation
Monte Carlo economics: cheap trials × independent repetition = exponential error decay at polynomial cost. $(1-p)^t \le e^{-pt}$ converts $p \approx 2\times10^{-4}$ into 99% confidence within ~23k runs — versus $2^{100}$ cuts enumerated deterministically. Small $p$, fast trials, massive amplification.
:::
