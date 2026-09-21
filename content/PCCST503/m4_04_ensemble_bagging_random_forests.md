---
id: m4_04_ensemble_bagging_random_forests
courseCode: PCCST503
module: 4
sequence: 4
title: 'Ensembles I: Bagging & Random Forests'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the variance problem in plain words first
  - Average away variance with bootstrap resampling
  - Validate for free with out-of-bag estimates and its limits
  - Decorrelate judges with random-forest feature subsampling
concepts:
  - bagging
  - out-of-bag validation
  - random forests
prerequisites:
  - m1_04_multiple_regression_model_assessment
  - m2_04_decision_trees_entropy_information_gain
examRelevance: high
tags:
  - ensembles
  - random-forests
---
# Ensembles I: Bagging & Random Forests

**What problem averaging solves for wiggly trees, what bootstrap samples it needs, how voting trains a steadier committee, and where averaging stops helping.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

One deep tree overreacts to details: change three training rows, get a different tree. The problem: keep trees' flexibility but cancel their quirks.

Tiny beginner example. Three judges guess 10, 12, 14 for truth 12. Average is 12 exactly. Each errs; errors cancel because truth is shared and quirks are not. That cancellation is bagging.

Analogy as support, then dropped. Panel of imperfect judges shown slightly different evidence, majority vote. From here on we use exact terms only: bootstrap, aggregation, Out-of-Bag (OOB), correlation.

Abbreviations defined on first use: Out-of-Bag (OOB). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $B$? | Number of bootstrap datasets and models |
| What is $\sigma^2$, $\rho$? | Single-model variance and pairwise correlation |
| What is $m$? | Random features tried per split |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Cut variance without raising bias.

**Data.** $n$ training points. Each bootstrap dataset draws $n$ points with replacement. Each draw omits about $(1-1/n)^n\approx 1/e\approx 37\%$ of points; those are OOB for that model.

**Goal.** Lower test error via $\rho\sigma^2+(1-\rho)\sigma^2/B$. Here first term is correlated floor no $B$ breaches; second term dies with $B$. Bagging murders variance, never bias.

::: callout-intuition Core Mental Model: The Panel of Imperfect Judges
One opinionated judge (a deep decision tree) overreacts to every detail. **Bagging** convenes hundreds of judges, each shown a *slightly different random subset* of the evidence (bootstrap sample), and takes the majority vote (or average). Individual quirks cancel; shared wisdom survives. **Random forests** go further: at every single ruling (split), each judge may consult only a *random handful of laws* (features) — forcing diversity even among judges who saw similar evidence. Averaging works precisely because errors are *uncorrelated* while truth is shared.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (wiggly trees) → data (bootstraps) → goal (low variance) → method (resample plus aggregate, then decorrelate) → model (committee) → training (parallel fits) → example → limitations.

### 3.1 Bagging, Step by Step

::: toggle Trace the §1 judges through bootstrap, vote, and OOB
Truth 12; judges guess 10, 12, 14 (errors −2, 0, +2). Average $(10+12+14)/3 = 12$ exactly — quirks cancel because truth is shared (all centre on 12) while errors differ (spread around it). Bootstrap behind it: each judge trained on a resample (some rows repeated, ~37% omitted); omitted rows are that judge's OOB jury (free validation — aggregate each point over only its non-trainers). Forests add: each split sees only $m$ random features ($\sqrt{d}$ class, $d/3$ regr), forcing different questions per tree (decorrelation — shared strong features would re-correlate mistakes and stall averaging at the $\rho\sigma^2$ floor).
:::

Numbered steps:

1. Draw $B$ bootstrap datasets of size $n$ with replacement.
2. Train one model per dataset independently.
3. Aggregate: vote for classes, average for regression.

Variance: $B$ predictors with variance $\sigma^2$ and correlation $\rho$ average to $\rho\sigma^2+(1-\rho)\sigma^2/B$. Corrected qualification: more trees shrink the second term and typically plateau test error rather than U-turning, given deep enough trees and honest validation. This does not guarantee better accuracy on every dataset, and tuning repeatedly on OOB still contaminates selection. It cannot fix systematic bias: averaging wrong-family models stays wrong.

### 3.2 Out-of-Bag Validation, With Limits

Each point is OOB for about 37% of models. Aggregate each point over only its OOB models for a validation score costing zero held-out data and zero extra training. OOB tracks test error well, with mild optimism when tuned upon repeatedly. Final publication claims still need untouched folds.

### 3.3 Random Forests: Decorrelating the Judges

::: toggle What are `bootstrap`, `OOB`, `m`, `ρ`, and the variance formula?
Bootstrap = resample $n$ points with replacement (repeats allowed — each set misses ~37% of rows, those are OOB). OOB (Out-of-Bag) = left-out rows per model (free validation jury — aggregate each point over only its non-trainers; tuned-upon repeatedly it contaminates into selection data). $m$ = random features tried per split ($\sqrt{d}$ classification, $d/3$ regression — forces different questions, decorrelates judges). $\rho$ = pairwise tree correlation (shared mistakes stall voting). Formula $\rho\sigma^2 + (1-\rho)\sigma^2/B$: first term = correlated floor no $B$ breaches (forests attack it via $m$); second term dies with $B$ (bagging attacks it via count). Tiny numbers from §4: $0.3·4 + 0.7·4/200 = 1.214$ vs single $4$ — floor $1.2$ stands.
:::

Bagged trees still correlate: strong features dominate root splits, so mistakes correlate and $\rho$ stalls averaging. Forests force each split to consider only $m\ll d$ random features (standard $m\approx\sqrt{d}$ classification, $d/3$ regression). Trees must differ, $\rho$ drops, voting bites deeper. Grow until OOB plateaus, then stop paying compute.

| Similar pair | Distinction that earns marks |
|---|---|
| Bagging vs forests | Data diversity vs data plus split diversity; second lowers $\rho$ itself |
| More trees vs tuned OOB | Variance smoothing vs selection contamination if crowned on OOB |
| Variance vs bias cure | Ensembles for wiggles vs richer models for systematic wrongness |

::: callout-formula KTU Formula Vault: Ensemble Facts
Bagging: **bootstrap + aggregate** · kills **variance**, not bias · OOB ≈ **37%** ($1/e$) free validation with selection limits · forests: **random $m$ features/split** ($\sqrt{d}$ class, $d/3$ regr) to **decorrelate** · more trees **plateau (no U-turn) given depth and honest validation** (watch OOB plateau, not train error).
:::

::: callout-pitfall Bagging a Biased Model Bakes In the Bias (and OOB Isn't Double-Blind)
Averaging 500 linear fits on curved truth returns the same wrong curve, confidently ($B$ kills variance; bias ... precisely, the shared systematic error never averages out). And OOB tuned-upon-repeatedly becomes *selection data* wearing validation clothes — report final numbers on truly held-out folds for publication-grade claims.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
$n = 100$ training points, $B = 200$ bagged trees. (a) How many points does one bootstrap sample leave out on average, and how many trees is a given point OOB for? (b) Predictor variance $\sigma^2 = 4$, pairwise $\rho = 0.3$: ensemble variance at $B = 200$ vs a single tree?
:::

::: step [Step 2: Execution] Counting and Averaging
(a) Omitted fraction $(1 - 1/100)^{100} \approx 1/e \approx 0.368$: ~**37 points** left out per sample; each point OOB for $\approx 0.368 \times 200 \approx$ **74 trees** — a 74-model validation jury per point, free. (b) Ensemble variance $= 0.3 \times 4 + \frac{0.7}{200} \times 4 = 1.2 + 0.014 = \mathbf{1.214}$ vs single-tree $4$ — a $3.3\times$ cut, bounded below by the correlated floor $1.2$ no $B$ can breach.
:::

::: step [Step 3: Conclusion] Final Result
Bagging turned variance $4 \to 1.21$ while bias sat untouched — and the 37% OOB mechanism graded everything without spending a single held-out point. The residual $1.2$ floor is exactly why forests exist: only *decorrelation* (random features) lowers $\rho$ itself, the one knob bagging cannot turn.
:::

::: anim variance-floor Bagging Hits the Correlated Floor
Watch variance collapse 4 to 1.214 and stop dead at the 1.2 floor — the bar that no B breaches, and the reason forests exist.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Expecting bagging to fix bias. It averages wiggles; wrong families stay wrong.
- Crowning champions on repeatedly tuned OOB. Monitoring yes, final verdict on untouched folds.
- Using full features and calling it a forest. Without random $m$, $\rho$ stays high.
- Reading train error for forest size. Grow until OOB plateaus.

Limitations: needs decorrelation to beat the floor; biased bases stay biased; OOB juries get noisy at tiny $n$.

Exam recap: bootstrap plus aggregate; variance formula with floor; OOB 37%; forests random $m$ to decorrelate; more trees plateau given honest validation.

<a id="self-check"></a>
## 6. Active Recall Quizzes

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
