# Ensembles I: Bagging & Random Forests

**Averaging away variance, bootstrap resampling, out-of-bag validation for free, feature subsampling, and why forests tame trees.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Panel of Imperfect Judges
One opinionated judge (a deep decision tree) overreacts to every detail. **Bagging** convenes hundreds of judges, each shown a *slightly different random subset* of the evidence (bootstrap sample), and takes the majority vote (or average). Individual quirks cancel; shared wisdom survives. **Random forests** go further: at every single ruling (split), each judge may consult only a *random handful of laws* (features) — forcing diversity even among judges who saw similar evidence. Averaging works precisely because errors are *uncorrelated* while truth is shared.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Bagging (Bootstrap Aggregating)

Given $n$ training points: draw $B$ **bootstrap** datasets (sample $n$ points *with replacement*), train one model per dataset, **aggregate** (vote for classes, average for regression). Variance analysis: averaging $B$ predictors with variance $\sigma^2$ and pairwise correlation $\rho$ gives $\rho\sigma^2 + \frac{1-\rho}{B}\sigma^2$ — the second term dies with $B$, the first (correlated error) does not. Bagging murders *variance*, never *bias*: it cannot fix a systematically wrong model family.

### 2.2 Out-of-Bag Validation (Free Lunch, Almost)

Each bootstrap sample omits $\approx (1-1/n)^n \approx 1/e \approx 37\%$ of points — so every point is **out-of-bag** (OOB) for ~37% of the models. Aggregate each point's prediction over *only its OOB models* → a validation score costing zero held-out data and zero extra training. OOB error tracks test error remarkably well (mild optimism when tuning on it repeatedly — the usual selection-contamination fine print).

### 2.3 Random Forests: Decorrelating the Judges

Bagged *trees* still correlate (strong features dominate every tree's root splits → similar mistakes → high $\rho$, and the formula above stalls). Forests force each split to consider only $m \ll d$ random features (standard $m \approx \sqrt{d}$ classification, $d/3$ regression): trees *must* differ, $\rho$ drops, averaging bites deeper. More trees never overfit (variance term only shrinks) — grow until OOB plateaus, then stop paying compute.

::: callout-formula KTU Formula Vault: Ensemble Facts
Bagging: **bootstrap + aggregate** · kills **variance**, not bias · OOB ≈ **37%** ($1/e$) free validation · forests: **random $m$ features/split** ($\sqrt{d}$ class, $d/3$ regr) to **decorrelate** · more trees **can't overfit** (watch OOB plateau, not train error).
:::

::: callout-pitfall Bagging a Biased Model Bakes In the Bias (and OOB Isn't Double-Blind)
Averaging 500 linear fits on curved truth returns the same wrong curve, confidently ($B$ kills variance; bias $\rho\sigma^2$-term... precisely, the shared systematic error never averages out). And OOB tuned-upon-repeatedly becomes *selection data* wearing validation clothes — report final numbers on truly held-out folds for publication-grade claims.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$n = 100$ training points, $B = 200$ bagged trees. (a) How many points does one bootstrap sample leave out on average, and how many trees is a given point OOB for? (b) Predictor variance $\sigma^2 = 4$, pairwise $\rho = 0.3$: ensemble variance at $B = 200$ vs a single tree?
:::

::: step [Step 2: Execution] Counting and Averaging
(a) Omitted fraction $(1 - 1/100)^{100} \approx 1/e \approx 0.368$: ~**37 points** left out per sample; each point OOB for $\approx 0.368 \times 200 \approx$ **74 trees** — a 74-model validation jury per point, free. (b) Ensemble variance $= 0.3 \times 4 + \frac{0.7}{200} \times 4 = 1.2 + 0.014 = \mathbf{1.214}$ vs single-tree $4$ — a $3.3\times$ cut, bounded below by the correlated floor $1.2$ no $B$ can breach.
:::

::: step [Step 3: Conclusion] Final Result
Bagging turned variance $4 \to 1.21$ while bias sat untouched — and the 37% OOB mechanism graded everything without spending a single held-out point. The residual $1.2$ floor is exactly why forests exist: only *decorrelation* (random features) lowers $\rho$ itself, the one knob bagging cannot turn.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Bagging 500 deep trees crushes test error on noisy data but changes nothing on a systematically simple (high-bias) problem. Explain both halves with the variance formula.
() Bagging is broken on simple problems due to a software bug
(*) Averaging attacks the $\frac{1-\rho}{B}\sigma^2$ term (noise-driven variance → ~0 as B grows) but cannot touch bias or the correlated floor $\rho\sigma^2$ — noisy problems are variance-dominated (bagging territory), simple-model problems are bias-dominated (bagging-irrelevant)
() Deep trees have no variance to reduce
() Simple problems forbid resampling by definition
::: explanation
Decompose first, prescribe second: noise ⇒ variance ⇒ bagging helps enormously. Wrong model family ⇒ bias ⇒ averaging wrong answers stays wrong (confidently). The formula tells you *which disease* before you *prescribe the cure* — ensembles for variance, richer models for bias.
:::

::: quiz Why do random forests restrict each split to m ≪ d random features instead of bagging plain trees?
() To make training slower and more thorough
(*) Bagged trees correlate (same strong features root every tree → shared mistakes → high ρ stalls averaging); forced feature subsets diversify trees, dropping ρ so the vote actually cancels errors
() Random features increase each tree's individual accuracy
() Forests with full features are mathematically undefined
::: explanation
Bagging diversifies *data*; strong features re-correlate *splits* (every tree asks the same best question first). Random-$m$ splits break the monopoly — individually weaker trees, collectively far stronger vote. Diversity is engineered, never assumed.
:::

::: quiz OOB error is computed without any held-out set. When does trusting it go wrong?
() Never — OOB is perfectly unbiased in all uses
(*) When OOB repeatedly *selects* models/hyperparameters (tuning on it contaminates it — same selection-leakage as test reuse); final claims need truly untouched data, and tiny n makes the ~37% juries noisy per point
() OOB only works for regression, never classification
() OOB requires exactly 200 trees to be valid
::: explanation
OOB is validation data the moment you *decide* on it — decide repeatedly and it becomes training data in a trench coat (Module 1's nested-validation moral, recycled). Use OOB for monitoring and rough selection; crown champions on held-out folds.
:::
