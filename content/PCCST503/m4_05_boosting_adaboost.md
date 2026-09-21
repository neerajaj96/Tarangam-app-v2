---
id: m4_05_boosting_adaboost
courseCode: PCCST503
module: 4
sequence: 5
title: 'Ensembles II: Boosting & AdaBoost'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the sequential-repair problem in plain words first
  - Reweight errors sequentially with the alpha vote formula
  - Trace two AdaBoost rounds with exact mass moves
  - Explain test behaviour through voting margins with noise qualifications
concepts:
  - AdaBoost
  - voting margins
  - sequential ensembles
prerequisites:
  - m4_04_ensemble_bagging_random_forests
examRelevance: high
tags:
  - ensembles
  - boosting
---
# Ensembles II: Boosting & AdaBoost

**What problem sequential repair solves, what weighted data Adaptive Boosting (AdaBoost) needs, how exponential reweighting trains a committee, and where noise breaks the bet.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Bagging builds students independently. Boosting runs a study group sequentially: round one attempts the paper; round two drills the missed questions; later tutors earn louder voices by accuracy.

Tiny beginner example. Four points, one missed in round one. Miss weight doubles from $0.25$ to $0.50$; solved points shrink to $1/6$ each. Round two lives in a world dominated by that miss: fix it or perish. That reweighting is AdaBoost.

Analogy as support, then dropped. Study group targeting weakness with accuracy-weighted tutors. From here on we use exact terms only: distribution, weighted error, vote weight, margin.

Abbreviations defined on first use: Adaptive Boosting (AdaBoost). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $D_t$? | Weight distribution over points in round $t$ |
| What is $\epsilon_t$? | Weighted error of round $t$ learner |
| What is $\alpha_t$? | Vote weight earned by round $t$ |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Turn barely-better-than-guessing rules into a strong committee by attacking residual errors.

**Data.** Labelled pairs with $y\in\{+1,-1\}$ plus a distribution $D_t$ that changes per round. Start uniform $D_1(i)=1/n$.

**Goal.** Low training error via $\text{sign}(\sum_t\alpha_t h_t(x))$, plus wide voting margins $y\sum\alpha_t h_t(x)$ where possible on clean data.

::: callout-intuition Core Mental Model: The Study Group That Targets Weakness
Bagging builds students independently and averages them. **Boosting** runs a study group *sequentially*: round 1, everyone attempts the past paper; round 2 drills *the questions most students missed* (upweighted), round 3 drills what survives — while the final grade weights each round's tutor by demonstrated accuracy (loud voice for reliable tutors, whisper for shaky ones). Weak learners (barely-better-than-guessing stumps) sequenced this way become a strong committee: each round attacks the *residual* errors of all previous rounds combined.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (weak rules, residual errors) → data (weighted pairs) → goal (low error, fat margins on clean data) → method (reweight plus vote) → model (weighted vote) → training (sequential rounds) → example → limitations.

### 3.1 AdaBoost Mechanics, Step by Step

Numbered round:

1. Train weak learner on $D_t$; get $h_t$.
2. Compute $\epsilon_t=\sum_{h_t(x_i)\ne y_i}D_t(i)$.
3. Compute $\alpha_t=\tfrac12\ln((1-\epsilon_t)/\epsilon_t)$.
4. Reweight $D_{t+1}(i)\propto D_t(i)e^{-\alpha_t y_i h_t(x_i)}$ (correct shrinks, wrong grows); renormalise.
5. Final vote $\text{sign}(\sum_t\alpha_t h_t(x))$.

Here $e^{-\alpha y h}$ means multiply by $e^{-\alpha}$ when correct and $e^{+\alpha}$ when wrong; $Z$ normalises to sum $1$.

### 3.2 Why the Formulas

- $\alpha_t$ greedily minimises exponential loss $e^{-yF(x)}$ per round. Accurate learners earn louder votes; $\epsilon_t\to 0.5$ earns $\alpha\to 0$. Requires $\epsilon_t<0.5$ on the weighted distribution; flip any worse-than-guessing stump's sign first.
- Training error drops exponentially as $\prod_t 2\sqrt{\epsilon_t(1-\epsilon_t)}$: each better-than-guessing round multiplies error by less than $1$.

### 3.3 Margins, With Correct Qualifications

On clean data, boosting often keeps improving test error after train hits zero because later rounds widen voting margins (confidence), and margin theory bounds generalisation. Corrected qualification: this is a tendency on clean, learnable structure, not immunity. On noisy or mislabelled data, attention compounds on lies and test error can rise; early stopping, gentler learners, or bagging then win. Forests average variance away; boosting optimises confidence relentlessly, for better and worse.

| Similar pair | Distinction that earns marks |
|---|---|
| Bagging vs boosting | Parallel variance averaging vs sequential bias and margin attack |
| Small vs large $\alpha$ | Quiet weak round vs loud dominant round; earned, never set |
| Clean vs noisy boosting | Margins fattening usefully vs weights exploding on lies |

::: callout-formula KTU Formula Vault: AdaBoost Facts
Weights $D_t$ → error $\epsilon_t$ → vote $\alpha_t = \tfrac12\ln\frac{1-\epsilon_t}{\epsilon_t}$ → reweight $e^{\mp\alpha}$ (wrong × grow) → renormalize → decide $\text{sign}(\sum\alpha_t h_t)$ · needs $\epsilon_t < 0.5$ each round · train error falls **exponentially on clean rounds** · test **often improves via margins on clean data; can overfit noise**.
:::

::: callout-pitfall Boosting Magnifies Noise (Bagging Doesn't)
AdaBoost *concentrates* on hard points round after round — if "hard" means *mislabeled*, weights explode on garbage and the committee learns lies devoutly. Noisy labels ⇒ prefer bagging (averaging dilutes poison) or regularized variants. Boosting assumes hardness = learnable structure; verify before committing.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Four points, uniform $D_1 = 1/4$ each. Round-1 stump misclassifies exactly one point ($\epsilon_1 = 0.25$). Compute $\alpha_1$, the renormalized $D_2$, and state round 2's incentive. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Weighting the Round
$\alpha_1 = \tfrac12\ln(0.75/0.25) = \tfrac12\ln 3 \approx 0.549$. Updates: correct points $\times e^{-0.549} \approx 0.577$ → $0.25 \times 0.577 \approx 0.144$; wrong point $\times e^{+0.549} \approx 1.732$ → $0.25 \times 1.732 \approx 0.433$. Normalizer $Z = 3(0.144) + 0.433 = 0.866$. $D_2$: correct points $0.144/0.866 = 1/6 \approx 0.167$ each, wrong point $0.433/0.866 = 0.5$. Round 2's stump faces a world where the missed point matches all three solved ones combined — fix *it* or perish.
:::

::: step [Step 3: Conclusion] Final Result
One round moved half the probability mass onto a single point ($0.25 \to 0.5$) — attention reallocation, quantified. Final committee vote weights round 1 at $\alpha_1 = 0.549$; later rounds earn their own $\alpha$ by the same formula. Iterate, and training error decays exponentially while margins fatten on clean data — boosting's contract in four points, with noise as the documented exception.
:::

::: anim adaboost-d2 Half the Mass Moves to One Point
Watch three weights shrink by 0.577 while the miss grows by 1.732, then divide by Z — half the mass on one point, round 2's orders cut.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Calling boosting immune to overfit. Clean-data margin gains do not transfer to noisy labels.
- Boosting deep trees on 20% noise. Weights worship lies; bag instead.
- Keeping $\epsilon\ge 0.5$ rounds as is. Flip sign or stop; coin flips earn no voice.
- Reading louder $\alpha$ as overfit proof. It prices difficulty conquered, blind to truth.

Limitations: sequential (not parallel), noise-sensitive, needs weak learners better than guessing per weighted round.

Exam recap: $D$, $\epsilon$, $\alpha$ formula, exponential reweight, renormalise, sign vote; exponential train drop; margins help test on clean data, hurt on noise.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz In the worked trace, the single misclassified point jumps from weight 0.25 to 0.5 while each correct point falls to 1/6. What mechanism produced exactly these numbers?
() Random resampling noise that happened to land here
(*) Exponential reweighting e^(∓α) with α = ½ln3 ≈ 0.549 (wrong ×1.732, correct ×0.577), renormalized by Z = 0.866 — the missed point now matches all solved ones combined, forcing round 2 to prioritize it
() The weights were manually assigned by the instructor for drama
() Normalization always produces 1/6 and 1/2 regardless of error
::: explanation
$e^{+\alpha}$ vs $e^{-\alpha}$ with $\alpha$ set by the round error, then $\div Z$: deterministic arithmetic, not luck — $0.25 \times 1.732 / 0.866 = 0.5$ exactly. The numbers *are* the algorithm's attention policy made visible: next round optimizes a world dominated by its predecessor's failure.
:::

::: quiz Boosting test error often keeps falling after training error hits zero. How is this possible, and what is actually improving?
() It is impossible — the trace must contain measurement errors
(*) Zero training error ends *verdict* improvement, but later rounds can keep widening voting *margins* (confidence gaps) on clean data — and margin theory bounds generalization, so fatter margins can keep paying test dividends until noise dominates
() Boosting secretly adds more training data each round
() Test error falls because the test set leaks into training
::: explanation
Verdicts saturate; confidence doesn't. Each round's $\alpha$-weighted vote can thicken correct-side margins on clean data, and generalization tracks margins, not just correctness — the celebrated paradox (resolved by Schapire et al.'s margin bounds) that makes boosting resistant to overfitting on clean data, with no promise on noisy data.
:::

::: quiz Labels are 20% random noise. An engineer proposes AdaBoost with 500 deep trees. What is wrong, and what is the fix?
() Nothing — boosting is immune to label noise by construction
(*) Boosting concentrates exponentially on "hard" points, which here means *mislabeled* ones — weights explode on lies and the committee memorizes garbage; fix with bagging/forests (averaging dilutes poison), noise-robust losses, or cleaned labels
() Deep trees cannot be boosted under any circumstances
() 500 rounds is too few; use 5000 to average the noise away
::: explanation
AdaBoost's attention has no truth detector: persistent misses read as importance, so noise *commands* focus round after round (weights on flipped points compound exponentially). Bagging's independent averaging instead *dilutes* each poisoned sample across bootstraps. Match the ensemble to the noise regime — boost clean structure, bag dirty data.
:::
