# Probability for ML: MLE & MAP Estimation

**Likelihood vs. probability, maximum likelihood (sample mean/variance derivations), priors and MAP, and regularization as a prior in disguise.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Biased Coin Trial
Someone hands you a coin; 100 flips show 63 heads. **Likelihood** asks: *for each candidate bias θ, how probable was this exact evidence?* — then **MLE** picks the θ maximizing it (here, $\hat{\theta} = 0.63$). **MAP** adds a prior belief ("coins are usually fair-ish") and maximizes *posterior* ∝ likelihood × prior — dragging the estimate toward fairness when evidence is thin, and yielding to evidence when it's overwhelming. MLE trusts only data; MAP negotiates between data and belief.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Likelihood (Not Probability!)

For i.i.d. data $D = \{x_i\}$ and parameters $\theta$: **likelihood** $L(\theta) = P(D \mid \theta) = \prod_i P(x_i \mid \theta)$ — a function *of θ*, data fixed. Work with **log-likelihood** $\ell(\theta) = \sum_i \log P(x_i \mid \theta)$ (products → sums; maxima coincide since log is monotone).

### 2.2 MLE: Two Canonical Derivations

* **Gaussian mean** ($\sigma^2$ known): $\ell(\mu) = -\frac{1}{2\sigma^2}\sum (x_i - \mu)^2 + C$; $\frac{d\ell}{d\mu} = 0 \Rightarrow \hat{\mu}_{MLE} = \frac{1}{n}\sum x_i = \bar{x}$ — the sample mean, derived, not assumed.
* **Gaussian variance** (μ known): $\hat{\sigma}^2_{MLE} = \frac{1}{n}\sum (x_i - \mu)^2$ — note the $n$ (biased; Bessel's $n-1$ corrects it — MLE doesn't care about unbiasedness, only likelihood).
* **Bernoulli/coin:** $\hat{\theta} = k/n$ (heads fraction).

### 2.3 MAP: Prior × Likelihood, Then Maximize

Bayes: $P(\theta \mid D) \propto P(D \mid \theta)\,P(\theta)$. **MAP** $\hat{\theta} = \arg\max_\theta [\ell(\theta) + \log P(\theta)]$ — the log-prior is a *penalty pulling toward belief*. Gaussian prior $\mu \sim \mathcal{N}(\mu_0, \tau^2)$ on a Gaussian mean gives closed-form shrinkage:

$$\hat{\mu}_{MAP} = \frac{\frac{n\bar{x}}{\sigma^2} + \frac{\mu_0}{\tau^2}}{\frac{n}{\sigma^2} + \frac{1}{\tau^2}}$$

— a precision-weighted average of data-mean and prior-mean. As $n \to \infty$, data dominates (MAP → MLE); at $n \approx 0$, prior rules. **Regularization preview:** L2-penalized regression *is* MAP with a Gaussian prior; L1 *is* MAP with a Laplace prior — Module 2+ penalties are beliefs in mathematical dress.

::: callout-formula KTU Formula Vault: Estimation Facts
MLE $= \arg\max \prod P(x_i|\theta)$ (use **log**, monotone) · Gaussian mean MLE $= \bar{x}$ · variance MLE $= \frac{1}{n}\sum(x_i-\mu)^2$ (**biased**) · MAP $= \arg\max[\ell + \log\text{prior}]$ · Gaussian–Gaussian MAP $=$ **precision-weighted average** · L2 $\equiv$ Gaussian prior, L1 $\equiv$ Laplace prior.
:::

::: callout-pitfall Likelihood Is P(data | θ), Never P(θ | data)
$L(\theta)$ plugs *varying θ* into a function of *fixed data* — it is not a distribution over θ (doesn't integrate to 1, needs no prior). Reading "the probability that θ is true" mistakes likelihood for posterior — the confusion Bayes' theorem exists to resolve, via the prior you're forgetting.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

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

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
