---
id: m4_05_randomized_algorithms_las_vegas_monte_carlo
courseCode: PCCST502
module: 4
sequence: 5
title: 'Randomized Algorithms: Las Vegas & Monte Carlo'
difficulty: beginner
estimatedMinutes: 9
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
## 1. Start from zero — the problem first

**Problem first.** Deterministic quicksort has a nemesis: already-sorted input forces $\Theta(n^2)$ (always pick the worst pivot). Random pivots delete the nemesis — no *input* is adversarial anymore, only unlucky *coins*. Elsewhere the bargain flips: Karger's min-cut finishes on a fixed clock but may answer wrong — yet repetition buys the error down exponentially. Same coins, opposite contracts.

::: callout-intuition Core Mental Model: Two Kinds of Gambling
**Las Vegas** gambler: always walks out with *correct* winnings, but *time* spent is luck (randomized quicksort — sorted output guaranteed, runtime random). **Monte Carlo** gambler: finishes in *fixed* time, but winnings are *probably* right (Karger min-cut, Miller–Rabin primality — fast answer, tiny error chance). Certainty-of-answer vs certainty-of-clock — and Monte Carlo's error is *buyable-down*: repeat and vote, failure decays exponentially. Drop the casino now: indicator sums and contraction odds below are the exact analysis.
:::

**Tiny toy example (3 elements).** Quicksort on $[1,2,3]$ with random pivot: pivot 2 (prob 1/3) → splits $\{1\},\{3\}$, done in 2 rounds; pivot 1 or 3 → one-sided split, 3 rounds. Answer always $[1,2,3]$ (Las Vegas: correctness never wavers); rounds vary 2–3 (randomness lives in time only).

::: toggle What are `random variable`, `expected running time`, `pivot`, `partition`?
`Random variable` = a quantity depending on chance (here: the coin flips choosing pivots). `Expected running time` $\mathbb{E}$ = probability-weighted average over all coin outcomes (not the worst coins, not the typical run — the mean). `Pivot` = the element partitioning around (everything smaller left, larger right). `Partition` = the rearrangement step itself (linear scan, $\Theta(n)$ per call). Tiny trace above: pivot 2 splits evenly (2 rounds total), pivots 1/3 split one-sided (3 rounds) — expectation averages over the three equally-likely pivots.
:::

::: toggle Monte Carlo vs Las Vegas: which bargain, and what does `amplification` buy?
Las Vegas = correct answer, random time (reruns only buy speed — nothing to vote on). Monte Carlo = fixed time, probable correctness (error $\epsilon$ per run — repetition + majority vote drives error to $\le \epsilon^k$, exponential decay in $k$). Karger single-run success $\ge 2/(n(n-1))$ looks tiny, but $O(n^2\log n)$ runs amplify it toward $1-1/n$. Never ask quicksort's error probability (category error — it has none); never demand Karger's exact runtime (fixed trials is its contract).
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols and abbreviations:** $\mathbb{E}$ = expected value (probability-weighted average); $X_{ij}$ = indicator (1 if elements $i,j$ by rank are ever compared, else 0); $H_n$ = harmonic sum $1 + 1/2 + \dots + 1/n \approx \ln n$; $\epsilon$ = error probability.

**The two contracts:**

| | Las Vegas | Monte Carlo |
|---|---|---|
| Answer | Always correct | Correct with probability $\ge 1 - \epsilon$ |
| Runtime | Random (expected bound) | Fixed / bounded |
| Examples | Randomized quicksort, randomized hashing | Karger min-cut, Miller–Rabin primality |
| Error handling | None needed (rerun only for speed) | **Amplification**: $k$ independent runs + majority vote → error $\le \epsilon^k$ (exponential decay) |

**Randomized quicksort: expected $\Theta(n \log n)$ — numbered analysis:**

1. Random pivot ⇒ bad splits need *unlucky coins*, not unlucky data — no adversarial input survives.
2. Indicator: $X_{ij} = 1$ iff rank-$i,j$ elements are ever compared; happens iff one is chosen pivot before anything between them — probability $\frac{2}{j-i+1}$ (2 favourable first-picks out of $j-i+1$ symmetric candidates).
3. Linearity of expectation (expectation of a sum = sum of expectations, no independence needed):
$$\mathbb{E}[X] = \sum_{i<j} \frac{2}{j-i+1} = \Theta(n \log n)$$
— the harmonic sum does the lifting; input order is irrelevant.

**Karger's contraction (Monte Carlo min-cut) — numbered:**

1. Repeatedly contract a *uniformly random* edge until 2 vertices remain; output the crossing edges.
2. One run preserves the true min-cut with probability $\ge \frac{2}{n(n-1)}$ (no contracted edge ever lay inside it).
3. Small odds — but $O(n^2 \log n)$ independent runs amplify success toward $1 - 1/n$. Exponentially many cuts exist, yet random contraction + repetition finds the minimum in polynomial time.

::: callout-formula KTU Formula Vault: Randomized Facts
Las Vegas: **right answer, random time** (rand-quicksort) · Monte Carlo: **fixed time, probably right** (Karger, Miller–Rabin) · amplify by **repeat + vote** (error $\epsilon^k$) · quicksort $\mathbb{E} = \sum_{i<j}\frac{2}{j-i+1} = \Theta(n\log n)$ · Karger single-run success $\ge \frac{2}{n(n-1)}$.
:::

::: callout-pitfall Random ≠ Approximately Correct (Know Which Bargain)
Quicksort's randomness buys *speed with exactness* (Las Vegas); Karger's buys *speed with risk* (Monte Carlo). Asking "what's quicksort's error probability" is a category error — it has none. Asking "Karger's exact runtime" misses that *fixed trials* is its contract. Name the bargain before analyzing.
:::

---

<a id="worked-example"></a>
## 3. Worked example — quicksort expectation and Karger repetitions at n = 100

::: step [Step 1: Setup] Formulating the Problem
For $n = 100$: (a) bound randomized quicksort's expected comparisons via the indicator sum; (b) compute how many Karger runs push min-cut failure below $1\%$.
:::

::: step [Step 2: Execution] Computing Both
(a) $\mathbb{E}[X] = \sum_{i<j} \frac{2}{j-i+1}$: group by gap $k = j-i$ ($n-k$ pairs each): $2\sum_{k=1}^{99} \frac{100-k}{k} < 200 \sum_{k=1}^{99}\frac{1}{k} = 200 \cdot H_{99} \approx 200 \times 5.18 \approx 1036$ comparisons — vs worst-case $\approx 4950$ deterministic. (b) Single-run success $p \ge \frac{2}{100 \times 99} \approx 0.0002$. Failure after $t$ runs $\le (1-p)^t \le e^{-pt} < 0.01 \Rightarrow t > \frac{\ln 100}{p} \approx 4.6 \times 4950 \approx 22{,}800$ runs — each $O(n^2)$, polynomial total.
:::

::: step [Step 3: Conclusion] Final Result
Quicksort: ~1036 expected vs ~4950 worst-case — randomization deletes the adversary. Karger: ~23k cheap runs buy 99% confidence against $2^{100}$ possible cuts — repetition deletes the risk. Both bargains settled in expectation arithmetic, not hope.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Linearity of expectation needs *no* independence — the indicator sum works despite comparisons being highly correlated.
- $p \ge 2/(n(n-1))$ is a *lower* bound on success (adversarial min-cut assumed); friendlier graphs do better, never worse.
- Amplification multiplies *runs*, not *input size*: error decays exponentially in $k$ while cost grows only linearly.

| Similar pair | Distinction that earns marks |
|---|---|
| Las Vegas vs Monte Carlo | Random time, exact answer vs fixed time, probable answer |
| Expected vs worst-case quicksort | $\Theta(n\log n)$ over coins vs $\Theta(n^2)$ adversarial deterministic |
| More runs vs bigger input | Exponential confidence gain vs polynomial cost growth |

**Exam recap (facts an examiner rewards):** the two contracts with examples; $2/(j-i+1)$ symmetry argument; harmonic sum to $\Theta(n\log n)$; Karger $2/(n(n-1))$ with $(1-p)^t \le e^{-pt}$ amplification to ~23k runs at $n = 100$.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

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
