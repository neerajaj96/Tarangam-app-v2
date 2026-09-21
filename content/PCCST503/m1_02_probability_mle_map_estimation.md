---
id: m1_02_probability_mle_map_estimation
courseCode: PCCST503
module: 1
sequence: 2
title: 'Probability for ML: MLE & MAP Estimation'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - Separate likelihood from probability with the log-likelihood swap in plain words first
  - Derive Gaussian mean and variance by maximum likelihood
  - Read regularization as a prior through MAP estimation
  - State LASSO versus RIDGE as Laplace versus Gaussian priors
concepts:
  - maximum likelihood
  - MAP estimation
  - regularization as prior
prerequisites: []
examRelevance: high
tags:
  - probability
  - estimation
---
# Probability for ML: MLE & MAP Estimation

**What problem estimation solves when data are random, what data Maximum Likelihood Estimation (MLE) and Maximum A Posteriori (MAP) need, and how Regularisation with LASSO and RIDGE expresses prior beliefs.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Someone hands you a coin. You flip it 10 times and see 7 heads. What is its bias? With only 10 flips you are unsure. With 1,000 flips showing 630 heads you are confident near 0.63. The problem is: turn observed data into a parameter estimate, and say how prior belief should bend that estimate when data are scarce.

Tiny beginner example. Three coin flips: heads, heads, tails. Candidate bias 0.5 gives probability $0.5 \times 0.5 \times 0.5 = 0.125$ for that exact sequence. Candidate bias 0.7 gives $0.7 \times 0.7 \times 0.3 = 0.147$. The second candidate makes the seen evidence more probable, so likelihood prefers 0.7 here. That comparison is all likelihood ever does.

Analogy as support, then dropped. Think of a tug of war: data pull toward what was seen, prior anchors toward what was believed. From here on we use exact terms only: likelihood, log-likelihood, prior, posterior, MLE, MAP.

Abbreviations defined on first use: Maximum Likelihood Estimation (MLE), Maximum A Posteriori (MAP). Symbols are defined before use in the next section.

| Question to ask | Meaning |
|---|---|
| What is $P(D \mid \theta)$? | Probability of the fixed data given a candidate parameter; as a function of $\theta$ it is called likelihood |
| What is $P(\theta \mid D)$? | Posterior belief about $\theta$ after seeing data; needs a prior |
| What is MLE vs MAP? | Data-only peak vs. prior-penalised peak |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Estimate unknown parameters $\theta$ from random observations.

**Data.** Independent and Identically Distributed (i.i.d.) samples $D = \{x_1, \dots, x_n\}$. Here i.i.d. means each sample comes from the same distribution and does not influence the others. Example: $n=4$ sensor readings with known noise variance.

**Goal.** Pick $\hat{\theta}$ that best explains $D$. MLE explains with data alone. MAP explains with data times prior belief.

Symbols, each defined before use:

- $\theta$ is the unknown parameter (coin bias, Gaussian mean).
- $L(\theta) = P(D \mid \theta) = \prod_i P(x_i \mid \theta)$ is the likelihood, data fixed, $\theta$ varied.
- $\ell(\theta) = \sum_i \log P(x_i \mid \theta)$ is the log-likelihood. Logarithm (log) is strictly increasing, so maximising $\ell$ gives the same peak as maximising $L$, with sums instead of products.
- $P(\theta)$ is the prior, belief before data.
- $P(\theta \mid D) \propto P(D \mid \theta) P(\theta)$ is the posterior by Bayes' rule.

::: callout-intuition Core Mental Model: The Biased Coin Trial
Someone hands you a coin; 100 flips show 63 heads. **Likelihood** asks: *for each candidate bias θ, how probable was this exact evidence?* — then **MLE** picks the θ maximizing it (here, $\hat{\theta} = 0.63$). **MAP** adds a prior belief ("coins are usually fair-ish") and maximizes *posterior* ∝ likelihood × prior — dragging the estimate toward fairness when evidence is thin, and yielding to evidence when it's overwhelming. MLE trusts only data; MAP negotiates between data and belief.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (estimate $\theta$) → data (i.i.d. $D$) → goal (explain $D$, with or without prior) → method (maximise likelihood or posterior) → mathematical model (Gaussian or Bernoulli) → training procedure (differentiate and solve) → example → limitations.

### 3.1 Likelihood, Not Probability

For i.i.d. data $D = \{x_i\}$ and parameters $\theta$: **likelihood** $L(\theta) = P(D \mid \theta) = \prod_i P(x_i \mid \theta)$, a function of $\theta$ with data fixed. Work with **log-likelihood** $\ell(\theta) = \sum_i \log P(x_i \mid \theta)$. Products become sums; maxima coincide since log is monotone. This also avoids numerical underflow from multiplying many small probabilities.

::: toggle Why does taking the `log` keep the same winner?
`log` is strictly increasing: bigger input, bigger output, always — so the `θ` maximising `L` also maximises `log L`. Same peak, friendlier mountain.
It turns products into sums (`log(a×b) = log a + log b`), which differentiate term by term and never underflow: ten `0.1`s multiply to `1e-10` but add to `10 × (−2.303)`.
Tiny numbers: `L(0.5) = 0.125` vs `L(0.7) = 0.147` from §1; logs `−2.079` vs `−1.918` keep the order — `0.7` still wins.
:::

### 3.2 MLE: Two Canonical Derivations

- **Gaussian mean** with known variance $\sigma^2$: $\ell(\mu) = -\frac{1}{2\sigma^2}\sum (x_i - \mu)^2 + C$. Here $C$ collects constants not depending on $\mu$. Setting $\frac{d\ell}{d\mu} = 0$ gives $\hat{\mu}_{MLE} = \frac{1}{n}\sum x_i = \bar{x}$, the sample mean, derived not assumed. Here $\bar{x}$ means the arithmetic average.
- **Gaussian variance** with known mean $\mu$: $\hat{\sigma}^2_{MLE} = \frac{1}{n}\sum (x_i - \mu)^2$. Note the $n$ denominator. It is biased; dividing by $n-1$ (Bessel's correction) removes the bias, but MLE maximises likelihood, it never promised unbiasedness.
- **Bernoulli coin:** $\hat{\theta} = k/n$, the heads fraction, where $k$ counts heads in $n$ flips.

### 3.3 MAP: Prior Times Likelihood, Then Maximise

Bayes' rule: $P(\theta \mid D) \propto P(D \mid \theta)\,P(\theta)$. MAP is $\hat{\theta} = \arg\max_\theta [\ell(\theta) + \log P(\theta)]$. The log-prior is a penalty pulling toward belief. Gaussian prior $\mu \sim \mathcal{N}(\mu_0, \tau^2)$ on a Gaussian mean gives closed-form shrinkage:

$$\hat{\mu}_{MAP} = \frac{\frac{n\bar{x}}{\sigma^2} + \frac{\mu_0}{\tau^2}}{\frac{n}{\sigma^2} + \frac{1}{\tau^2}}$$

Symbol by symbol: $n\bar{x}/\sigma^2$ is data precision times data mean; $\mu_0/\tau^2$ is prior precision times prior mean; the denominator is total precision. It is a precision-weighted average. As $n \to \infty$, data dominates and MAP approaches MLE; near $n \approx 0$, the prior rules.

::: toggle Expand every symbol in the MAP precision-weighted average
`n` = sample count; `x̄` = sample mean (data's vote); `σ²` = known data variance, so `n/σ²` = data precision (loudness of evidence). `μ0` = prior mean (belief's vote); `τ²` = prior variance, so `1/τ²` = prior precision.
Precision = `1/variance`: tighter knowledge shouts louder. The estimate is a loudness-weighted average — §4's tie (`1` vs `1`) splits `5.0` and `0` into `2.5`.
As `n` grows, `n/σ²` swamps `1/τ²`: with `n = 400` the data owns `100/101` of the vote and MAP `≈ 4.95 ≈` MLE.
:::

**Regularisation preview, strengthened.** Least Absolute Shrinkage and Selection Operator (LASSO) with penalty $\lambda\sum |w_j|$ is MAP with a Laplace prior, whose sharp peak at zero expects sparsity and produces exact zeros. RIDGE with penalty $\lambda\sum w_j^2$ is MAP with a Gaussian prior, whose smooth dome expects small but nonzero weights and shrinks without zeroing. Choosing LASSO versus RIDGE states a prior over solutions. A full metrics and regularisation drill continues in the dedicated follow-up topic; here the correspondence is the conceptual anchor.

::: toggle Why does LASSO give `zeros` while RIDGE gives only `smalls`?
LASSO's Laplace prior peaks sharply at zero (a tent): pulling a weight slightly off zero costs a lot, so weak weights snap exactly to `0` — sparsity.
RIDGE's Gaussian prior domes smoothly at zero: near-zero costs almost nothing, so weights shrink but survive — dense smalls.
Penalty = `−log` prior: `|w|` for Laplace, `w²` for Gaussian. Choosing the penalty states which solution texture you believe in.
:::

| Similar pair | Distinction that earns marks |
|---|---|
| Likelihood vs. posterior | $P(D\mid\theta)$ with data fixed vs. $P(\theta\mid D)$ needing a prior |
| MLE vs. MAP | Data-only peak vs. prior-penalised peak; they coincide as $n \to \infty$ |
| LASSO vs. RIDGE | Laplace prior giving sparsity vs. Gaussian prior giving shrinkage |
| Unbiased ($n-1$) vs. MLE ($n$) | Fairness correction vs. likelihood peak; different questions |

::: callout-formula KTU Formula Vault: Estimation Facts
MLE $= \arg\max \prod P(x_i|\theta)$ (use **log**, monotone) · Gaussian mean MLE $= \bar{x}$ · variance MLE $= \frac{1}{n}\sum(x_i-\mu)^2$ (**biased**) · MAP $= \arg\max[\ell + \log\text{prior}]$ · Gaussian–Gaussian MAP $=$ **precision-weighted average** · L2 $\equiv$ Gaussian prior, L1 $\equiv$ Laplace prior.
:::

::: callout-pitfall Likelihood Is P(data | θ), Never P(θ | data)
$L(\theta)$ plugs *varying θ* into a function of *fixed data* — it is not a distribution over θ (doesn't integrate to 1, needs no prior). Reading "the probability that θ is true" mistakes likelihood for posterior — the confusion Bayes' theorem exists to resolve, via the prior you're forgetting.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Sensor readings average $\bar{x} = 5.0$ over $n = 4$ samples, known noise $\sigma^2 = 4$. Prior belief: true value near $\mu_0 = 0$ with $\tau^2 = 1$. Compute the MLE and the MAP estimate. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Estimating Both Ways
**MLE:** $\hat{\mu} = \bar{x} = 5.0$ — data only, no negotiation.
**MAP:** precisions $n/\sigma^2 = 1$, $1/\tau^2 = 1$ — dead tie, so the answer splits the difference: $\hat{\mu}_{MAP} = \frac{1 \times 5.0 + 1 \times 0}{1 + 1} = \mathbf{2.5}$. The strong prior ($\tau^2 = 1$ vs data precision $1$) drags the estimate halfway home.
:::

::: step [Step 3: Conclusion] Final Result
MLE $5.0$ vs MAP $2.5$ on identical data — the gap *is* the prior speaking. With $n = 400$ instead, data precision $100$ would swamp the prior ($100/101 \approx 0.99$ weight) and MAP $\approx 4.95 \approx$ MLE: beliefs matter most exactly when data is scarcest — the exam-ready moral.
:::

::: anim mle-map-tug Data Pulls to 5, Prior Anchors 0
Watch the dead-tie precisions split the difference at 2.5 — then n = 400 drag the marker to 4.95, almost home to MLE.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Maximising raw likelihood by multiplying tiny probabilities until numbers underflow. Always take logs first.
- Calling the variance MLE unbiased. It divides by $n$; unbiasedness needs $n-1$ and answers a different question.
- Claiming LASSO always beats RIDGE. Laplace expects sparsity; Gaussian expects dense small weights. Match penalty to belief.
- Treating MAP as always different from MLE. With large $n$, data precision swamps prior precision and they agree.

Limitations: MLE needs a correct likelihood family and enough data; MAP needs an honest prior. Neither fixes model misspecification.

Exam recap: log preserves argmax; Gaussian mean MLE is $\bar{x}$; variance MLE uses $n$ and is biased; MAP is precision-weighted average; LASSO is Laplace, RIDGE is Gaussian; MAP approaches MLE as $n$ grows.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Why do we maximize log-likelihood instead of raw likelihood, and what justifies the swap?
() Logs make small numbers look bigger for presentations
(*) Products underflow and differentiate awkwardly; log is strictly monotone so argmax is unchanged, while sums differentiate term-by-term — same peak, friendlier mountain
() Raw likelihood has no maximum in general
() Log-likelihood is a different objective that happens to agree sometimes
::: explanation
$\arg\max L = \arg\max \log L$ always (monotone transform preserves order); $\sum \log$ splits products into additive terms with clean derivatives. Numerical stability (no $10^{-300}$ underflow) plus calculus convenience — zero statistical content changed.
:::

::: quiz The Gaussian-variance MLE divides by n (biased) rather than n−1. Does this contradict "maximum likelihood," and should exams use n−1?
() Yes — MLE is defined to be unbiased, so the formula is wrong
(*) No contradiction: MLE maximizes likelihood, period — unbiasedness is a separate virtue it never promised; in ML estimation questions, report the MLE (÷n) unless explicitly asked for the unbiased correction
() Yes — always divide by n−1 in every formula
() The bias vanishes only for non-Gaussian data
::: explanation
"Maximum likelihood" and "unbiased" are independent properties that merely sometimes coincide (as with the mean). The variance MLE's $n$-denominator *is* the likelihood peak; Bessel's $n-1$ answers a different question (unbiasedness). Know which question the exam asked.
:::

::: quiz A Laplace prior on regression weights yields L1 regularization; a Gaussian prior yields L2. What does this correspondence buy conceptually?
() Nothing — priors and penalties are unrelated coincidences
(*) Regularizers are beliefs: L1's sharp peak at zero expects sparsity (many exact zeros); L2's smooth dome expects small-but-nonzero weights — choosing a penalty *is* stating a prior over solutions
() It proves L1 always outperforms L2 on every dataset
() Priors only apply to classification, never regression
::: explanation
$-\log P(w)$ *is* the penalty term: Laplace $\propto e^{-|w|}$ gives $|w|$ costs (corners → exact zeros, feature selection); Gaussian $\propto e^{-w^2}$ gives $w^2$ costs (shrinkage, no zeros). Penalty-shopping without prior-thinking is superstition; the correspondence turns it into modeling.
:::
