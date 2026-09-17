# Ensembles II: Boosting & AdaBoost

**Sequential error-fixing, exponential weight updates, the α vote formula, margins theory, and a two-round hand trace.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Study Group That Targets Weakness
Bagging builds students independently and averages them. **Boosting** runs a study group *sequentially*: round 1, everyone attempts the past paper; round 2 drills *the questions most students missed* (upweighted), round 3 drills what survives — while the final grade weights each round's tutor by demonstrated accuracy (loud voice for reliable tutors, whisper for shaky ones). Weak learners (barely-better-than-guessing stumps) sequenced this way become a strong committee: each round attacks the *residual* errors of all previous rounds combined.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 AdaBoost Mechanics (Binary $y \in \{+1,-1\}$)

Maintain distribution $D_t$ over training points (uniform start). Each round: train weak learner on $D_t$ → get hypothesis $h_t$ with weighted error $\epsilon_t = \sum_{h_t(x_i) \neq y_i} D_t(i)$; compute vote weight $\alpha_t = \tfrac12 \ln\frac{1-\epsilon_t}{\epsilon_t}$; reweight $D_{t+1}(i) \propto D_t(i)\, e^{-\alpha_t y_i h_t(x_i)}$ (correct × shrink, wrong × grow); renormalize. Final classifier: $\text{sign}(\sum_t \alpha_t h_t(x))$.

### 2.2 Why the Formulas (One Line Each)

* $\alpha_t$ minimizes the exponential loss $e^{-yF(x)}$ greedily per round — accurate weak learners earn exponentially louder votes; $\epsilon_t \to 0.5$ earns $\alpha \to 0$ (a coin-flip tutor is muted, never negative while $\epsilon < 0.5$).
* Training error drops *exponentially*: $\prod_t 2\sqrt{\epsilon_t(1-\epsilon_t)}$ — each better-than-guessing round multiplies error by $< 1$. (Requires every weak learner to beat 50% on its *weighted* distribution — flip any worse-than-guessing stump's sign first.)

### 2.3 Margins, Not Just Votes (Why It Rarely Overfits)

Boosting keeps improving *test* error even after training error hits zero — because later rounds widen the **voting margin** $y\sum\alpha_t h_t(x)$ (confidence), not just the verdict. Same U-curve immunity story as forests, different mechanism: forests average variance away; boosting optimizes confidence relentlessly.

::: callout-formula KTU Formula Vault: AdaBoost Facts
Weights $D_t$ → error $\epsilon_t$ → vote $\alpha_t = \tfrac12\ln\frac{1-\epsilon_t}{\epsilon_t}$ → reweight $e^{\mp\alpha}$ (wrong × grow) → renormalize → decide $\text{sign}(\sum\alpha_t h_t)$ · needs $\epsilon_t < 0.5$ each round · train error falls **exponentially** · test keeps improving via **margins**.
:::

::: callout-pitfall Boosting Magnifies Noise (Bagging Doesn't)
AdaBoost *concentrates* on hard points round after round — if "hard" means *mislabeled*, weights explode on garbage and the committee learns lies devoutly. Noisy labels ⇒ prefer bagging (averaging dilutes poison) or regularized variants. Boosting assumes hardness = learnable structure; verify before committing.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Four points, uniform $D_1 = 1/4$ each. Round-1 stump misclassifies exactly one point ($\epsilon_1 = 0.25$). Compute $\alpha_1$, the renormalized $D_2$, and state round 2's incentive. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Weighting the Round
$\alpha_1 = \tfrac12\ln(0.75/0.25) = \tfrac12\ln 3 \approx 0.549$. Updates: correct points $\times e^{-0.549} \approx 0.577$ → $0.25 \times 0.577 \approx 0.144$; wrong point $\times e^{+0.549} \approx 1.732$ → $0.25 \times 1.732 \approx 0.433$. Normalizer $Z = 3(0.144) + 0.433 = 0.866$. $D_2$: correct points $0.144/0.866 = 1/6 \approx 0.167$ each, wrong point $0.433/0.866 = 0.5$. Round 2's stump faces a world where the missed point outweighs all three solved ones combined — fix *it* or perish.
:::

::: step [Step 3: Conclusion] Final Result
One round moved half the probability mass onto a single point ($0.25 \to 0.5$) — attention reallocation, quantified. Final committee vote weights round 1 at $\alpha_1 = 0.549$; later rounds earn their own $\alpha$ by the same formula. Iterate, and training error decays exponentially while margins fatten — boosting's whole contract in four points.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz In the worked trace, the single misclassified point jumps from weight 0.25 to 0.5 while each correct point falls to 1/6. What mechanism produced exactly these numbers?
() Random resampling noise that happened to land here
(*) Exponential reweighting e^(∓α) with α = ½ln3 ≈ 0.549 (wrong ×1.732, correct ×0.577), renormalized by Z = 0.866 — the missed point now outweighs all solved ones combined, forcing round 2 to prioritize it
() The weights were manually assigned by the instructor for drama
() Normalization always produces 1/6 and 1/2 regardless of error
::: explanation
$e^{+\alpha}$ vs $e^{-\alpha}$ with $\alpha$ set by the round error, then $\div Z$: deterministic arithmetic, not luck — $0.25 \times 1.732 / 0.866 = 0.5$ exactly. The numbers *are* the algorithm's attention policy made visible: next round optimizes a world dominated by its predecessor's failure.
:::

::: quiz Boosting test error often keeps falling after training error hits zero. How is this possible, and what is actually improving?
() It is impossible — the trace must contain measurement errors
(*) Zero training error ends *verdict* improvement, but later rounds keep widening voting *margins* (confidence gaps) — and margin theory bounds generalization, so fatter margins keep paying test dividends
() Boosting secretly adds more training data each round
() Test error falls because the test set leaks into training
::: explanation
Verdicts saturate; confidence doesn't. Each round's $\alpha$-weighted vote thickens correct-side margins, and generalization tracks margins, not just correctness — the celebrated paradox (resolved by Schapire et al.'s margin bounds) that makes boosting eerily resistant to overfitting on clean data.
:::

::: quiz Labels are 20% random noise. An engineer proposes AdaBoost with 500 deep trees. What is wrong, and what is the fix?
() Nothing — boosting is immune to label noise by construction
(*) Boosting concentrates exponentially on "hard" points, which here means *mislabeled* ones — weights explode on lies and the committee memorizes garbage; fix with bagging/forests (averaging dilutes poison), noise-robust losses, or cleaned labels
() Deep trees cannot be boosted under any circumstances
() 500 rounds is too few; use 5000 to average the noise away
::: explanation
AdaBoost's attention has no truth detector: persistent misses read as importance, so noise *commands* focus round after round (weights on flipped points compound exponentially). Bagging's independent averaging instead *dilutes* each poisoned sample across bootstraps. Match the ensemble to the noise regime — boost clean structure, bag dirty data.
:::
