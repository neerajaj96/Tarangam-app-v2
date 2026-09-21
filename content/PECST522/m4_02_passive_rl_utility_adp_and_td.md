---
id: m4_02_passive_rl_utility_adp_and_td
courseCode: PECST522
module: 4
sequence: 2
title: 'Passive RL: Direct Utility, ADP & Temporal Differences'
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Grade fixed policies with direct averaging, ADP and TD updates
  - Define bootstrapping and name exactly which methods do it
  - Compare the three methods on data hunger and model dependence
concepts:
  - policy evaluation
  - temporal differences
  - bootstrapping
prerequisites:
  - m4_01_reinforcement_learning_learning_from_rewards
examRelevance: medium
tags:
  - reinforcement-learning
  - policy-evaluation
---
# Passive RL: Direct Utility, ADP & Temporal Differences

**Problem: a fixed policy is running — how good is it, without a model and without waiting forever? By the end you can run direct averaging, Adaptive Dynamic Programming (ADP), and Temporal-Difference (TD) updates by hand and state exactly which bootstrap.**

<a id="start-zero"></a>
## 1. Start From Zero: The Critic Who Never Coaches

A sports commentator grades a fixed game plan without suggesting better plays. Three commentators differ: the **naive averager** replays whole seasons and averages final scores per situation; the **model builder (ADP)** learns stadium physics (transition odds) then solves the season on paper; the **TD critic** nudges each situation's score toward the next situation's score plus points just earned — mid-game, every step.

**Definitions:** all three estimate `U^pi(s)` (expected discounted return following fixed policy pi from state s) from trials `(s0, r1, s1, r2, ...)`. **Bootstrapping** means updating an estimate from another (possibly wrong) estimate. **TD error** is the surprise signal (actual one-step return minus current estimate).

::: callout-intuition Core Mental Model: The Sports Commentator
Feel "grade, don't coach" here, then drop the booth; the three updates below are the technical content.
:::

**Tiny beginner example:** policy always moves right; from A the agent banks rewards-to-go of 10, then 6, then 8. Direct estimation averages to 8. TD instead corrects per step toward `r + gamma U(next)` — online, no episode wait.

::: toggle What are `U^π`, `TD target`, `TD error δ`, `α`, `bootstrapping`?
$U^\pi(s)$ = expected discounted return following fixed policy π from s (grading the behaviour, never improving it). TD target $r + \gamma U(s')$ = one real reward plus discounted old guess (half-truth driving the update). TD error $\delta$ = target minus current estimate (surprise signal — negative means reality undershot). $\alpha$ = learning rate (correction stride — must decay per the two-sum contract). Bootstrapping = updating a guess from another guess (TD's $U(s')$, ADP's solved values — direct averaging alone avoids it).
:::

::: toggle Verify the hand update number by number
Start $U(A) = 4.6$, $U(B) = 0$; transition A→B pays $r = 1$; $\alpha = 0.5$, $\gamma = 0.9$. Target $= 1 + 0.9×0 = 1$ (one truth plus discounted guess). Error $\delta = 1 − 4.6 = −3.6$ (undershoot — estimate was too rosy). Update $U(A) ← 4.6 + 0.5×(−3.6) = 4.6 − 1.8 = 2.8$ (half-stride toward the target). Overshoot past truth (~3.57) is normal single-step behaviour — later visits with decaying $\alpha$ sand it back up. That correct-per-transition rhythm (not per-episode) is TD.
:::

<a id="basics"></a>
## 2. Basic Layer: Three Estimators, One Target

**Data/state:** experience trials under fixed pi. **Goal:** `U^pi` per state.

- **Direct utility estimation:** per visit to s, record rewards-to-go (discounted sum from there on); average over visits. Model-free and simple — but ignores Bellman constraints between neighbours (each state learns in isolation), so convergence is slow and data-hungry.
- **ADP:** count transitions to learn the model `P-hat(s'|s,a) = N(s,a,s')/N(s,a)` (observed fraction) plus rewards, then solve Bellman equations (value/policy iteration on the learned model). Data-efficient and constraint-respecting — but model-based: solving each step is expensive and early garbage models give garbage utilities.
- **TD learning:** the sweet spot — model-free like direct, Bellman-respecting like ADP. After each transition `s --r--> s'`:

$$U(s) \leftarrow U(s) + \alpha\,[\,r + \gamma\,U(s') - U(s)\,]$$

Symbol by symbol: `alpha` = learning rate (step size, must decay — below); `r` = reward just received; `gamma U(s')` = discounted next estimate; minus `U(s)` = surprise (TD error `delta`); add `alpha*delta` to the old estimate. No model, no episode wait — learn online every step.

::: callout-formula Formal Core: The Three Updates Side by Side
Direct: average full returns (no bootstrap). ADP: learn model, iterate `U <- R + gamma sum P-hat U` to convergence (bootstraps via solved values). TD(0): single-sample backup above (bootstraps via U(s')). Exam shorthand: TD bootstraps (guess from guess); direct does not.
:::

<a id="formal-model"></a>
## 3. Formal Layer: Bootstrapping, Bias, Step Sizes

**Meaning, variables, trade:** bootstrapping injects **bias** early (wrong neighbours mislead) but slashes **variance** (one transition vs. whole-trajectory noise) — the bias-variance trade making TD win in practice. Only direct estimation avoids bootstrapping; ADP and TD both bootstrap (solved values and single-sample targets respectively).

**Step-size contract (qualified convergence):** rate `alpha` must decay with `sum alpha = infinity` (keep moving) and `sum alpha^2 < infinity` (dwindling energy), e.g. `alpha = 1/t` — the stochastic-approximation conditions. Fixed alpha jitters forever around truth without landing. **Visitation contract:** TD(0) converges to `U^pi` only if every state is visited infinitely often under pi — an unvisited east wing teaches nothing however perfect the rule.

::: callout-pitfall TD Converges to the Truth Only Under Visitation
Coverage of experience, not cleverness of updates, binds. Exams probe this quiet assumption: infinite visitation plus decaying alpha, or no convergence certificate.
:::

**One TD update by hand:** U(A) = 4.6, U(B) = 0; transition A with r = 1 lands B; alpha 0.5, gamma 0.9. Error `delta = 1 + 0.9x0 - 4.6 = -3.6` (reality undershot). Update: `U(A) <- 4.6 + 0.5(-3.6) = 2.8`. One step dragged the estimate from 4.6 past truth (~3.57) to 2.8 — overshoot that later visits with decaying alpha sand back up. That per-transition correction rhythm is TD.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Direct vs. TD vs. ADP | Average returns (no bootstrap, slowest) vs. per-step bootstrap (online sweet spot) vs. learn-model-then-solve (most per-sample mileage, most compute) |
| Bias vs. variance here | Bootstrapped neighbours mislead early (bias) but single steps are steady (low variance) |
| Value-iteration backup vs. TD update | Full expectation over dynamics (needs model) vs. single-sample correction (model-free) |

**Watch out:** (1) ADP's early utilities inherit early model errors. (2) Direct estimation wastes neighbour constraints — same trials, least mileage. (3) Fixed alpha never settles; state the decay pair of sums.

**Limitations:** all three grade only the behaviour policy (no improvement); need coverage (unvisited states unknown); linear-model solving (ADP) scales poorly; TD needs the decay schedule tuned.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What exactly is bootstrapping, and which passive methods do it?
() Using larger neural networks to memorize returns
(*) Updating an estimate from another (possibly wrong) estimate — ADP (solves via learned model) and TD (single-sample backup) bootstrap; direct utility estimation does not
() Sampling only the final reward of each episode
() Copying the teacher's policy verbatim
::: explanation
Bootstrapping is a guess built on a guess: TD's U(s') and ADP's solved values are estimates. Direct averaging waits for actual full returns — unbiased but slow.
:::

::: quiz Direct utility estimation converges slowly despite being simple and model-free. What structural information does it throw away?
() The reward signal itself
(*) The Bellman constraints coupling neighboring states — each state's average learns in isolation instead of exploiting that U(s) must be consistent with U(s')
() The discount factor γ
() The action labels on transitions
::: explanation
Neighbours must satisfy Bellman relations; direct estimation relearns per state what the equations give free. ADP and TD enforce consistency via models or per-step backups.
:::

::: quiz Why must TD's learning rate α decay over time (e.g. α = 1/t) rather than stay fixed?
() Fixed rates violate the Markov assumption
(*) A fixed α keeps injecting constant-size corrections forever, so estimates oscillate around the truth instead of settling; decaying α satisfies the stochastic-approximation conditions for convergence
() Decaying α makes early learning slower, which is always safer
() α is actually required to increase, not decay
::: explanation
Large early steps escape bad guesses; late whispers settle near truth. Sum-alpha-infinite with sum-alpha-squared-finite is the classical landing recipe.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: TD rule, bootstrapping definition, or three methods in one line each. 7 marks: numerical TD update or the data-efficiency comparison.
:::

**Recap facts examiners reward:** `U <- U + alpha[r + gamma U(s') - U]` with delta named; bootstrap membership (ADP/TD yes, direct no); bias-variance line; decay sums plus infinite-visitation qualification; 4.6-to-2.8 arithmetic.

### Sample 3-Mark Question
**Q: State the TD(0) rule and define TD error.**

**Model Answer:** U(s) <- U(s) + alpha[r + gamma U(s') - U(s)]. Delta = r + gamma U(s') - U(s): actual one-step return minus current estimate — the surprise driving learning.

### Sample 7-Mark Question
**Q: Compare direct, ADP, TD on limited trials in a large stochastic world.**

**Model Answer:** Direct: model-free, unbiased, ignores coupling — most trials needed. ADP: learns model then solves — most per-trial mileage but costly solving and early-model errors. TD: model-free single-step bootstraps — best practical trade (online, low variance), converging under infinite visitation with decaying alpha.
:::
