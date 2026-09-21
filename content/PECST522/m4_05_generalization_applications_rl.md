---
id: m4_05_generalization_applications_rl
courseCode: PECST522
module: 4
sequence: 5
title: Generalization & Applications of RL
difficulty: beginner
estimatedMinutes: 7
learningObjectives:
  - Trace linear temporal-difference updates with feature weights
  - Diagnose deadly-triad divergence on off-policy bootstrapped nets
  - Place games, robots and scheduling among shipping applications
concepts:
  - function approximation
  - deadly triad
  - RL applications
prerequisites:
  - m4_02_passive_rl_utility_adp_and_td
  - m4_04_policy_search_and_inverse_rl
examRelevance: medium
tags:
  - reinforcement-learning
  - generalization
---
# Generalization & Applications of RL

**Problem: tables memorize per-state answers — useless where states never repeat (driving). By the end you can hand-run one linear-TD update, diagnose deadly-triad divergence, and place RL applications by delayed-reward shape.**

<a id="start-zero"></a>
## 1. Start From Zero: Memorized Answers vs. Learned Instinct

Tabular RL memorizes answers per state (perfect for gridworlds, silent for unseen highways). **Function approximation** learns instinct: a compact `U-hat(s; theta)` (estimated utility with weights theta) generalizing to unseen states from shared features. Instinct errs where tables are exact; tables are silent where instinct speaks — and the real world never repeats itself.

::: callout-intuition Core Mental Model: Memorized Answers vs Learned Instinct
Feel "compact generalization versus exact silence" here, then drop the metaphor; linear-TD arithmetic plus the triad below are the technical content.
:::

**Tiny beginner example:** two road states share feature "wet." Updating weights on one wet skid adjusts predictions for all wet roads — generalization across states via features, impossible for isolated table entries.

::: toggle What are `function approximation`, `θ`, `f(s)`, `deadly triad`, `DQN`?
Function approximation = predicting values with few weights instead of per-state tables (compact instinct vs memorised answers). θ (theta) = the weight vector (what learning moves). f(s) = feature vector of state s (hand-built summaries — zero-valued features freeze their weights silently). Deadly triad = off-policy data + bootstrapping + function approximation together (each pair safe, the triple can diverge — structural, not bad luck). DQN (Deep Q-Network) = deep Q-learning tamed with frozen target networks + experience replay (scaffolding that steadies, never proves).
:::

::: toggle Verify the trace number by number, then read the triad warning
Current: θᵀf = 0.5×1 + 0.5×2 = 1.5. Target: 1 + 0.9×2.0 = 2.8. Error δ = 2.8 − 1.5 = 1.3. Update: θ ← [0.5,0.5] + 0.1×1.3×[1,2] = [0.63, 0.76] (each weight moves proportionally to its feature — f(s) steers). New estimate 0.63 + 2×0.76 = 2.15 (up toward 2.8 without overshooting). Triad reading: this linear on-policy step is near-best-representable safe; swap in off-policy data plus a nonlinear net and the same arithmetic can diverge — convergence follows the triple's composition, never the formula alone.
:::

<a id="basics"></a>
## 2. Basic Layer: Linear Approximation and the TD Step

**Data/state:** feature vectors `f(s)` (hand-built or network-built summaries). **Goal:** weights theta predicting utilities everywhere.

**Meaning, variables, intuition, formula:** linear predictor `U-hat(s) = theta^T f(s)` (weights dot features). TD(0) with approximation: compute error `delta = r + gamma U-hat(s') - U-hat(s)` (reward plus discounted next guess minus current guess), then step weights along the gradient:

$$\theta \leftarrow \theta + \alpha\,\delta\,\nabla_{\theta}\hat{U}(s) = \theta + \alpha\,\delta\,f(s)$$

Symbols: `alpha` = step size; `delta` = surprise; `f(s)` steers which weights move (dead zero-valued features freeze their weights — representation gates learning). Partial steps (not jumps to target) ration correction across visits.

**Deadly triad (qualified warning):** off-policy data plus bootstrapping plus function approximation together can diverge — each pair is safe, the triple is not. Deep Q-Networks (DQN — deep Q-learning) tame it with frozen target networks and experience replay (past-transition buffers breaking correlation) — scaffolding, not proof.

<a id="formal-model"></a>
## 3. Formal Layer: Update Trace and Application Map

**Full trace:** features `f = [1, 2]`, weights `theta = [0.5, 0.5]`, reward 1, gamma 0.9, next estimate 2.0, alpha 0.1. Current: `0.5x1 + 0.5x2 = 1.5`. Target: `1 + 0.9x2.0 = 2.8`. Error: `2.8 - 1.5 = 1.3`. Update: `theta <- [0.5,0.5] + 0.1x1.3x[1,2] = [0.63, 0.76]`. New estimate: `0.63 + 1.52 = 2.15` — up from 1.5 toward 2.8 without overshooting, both weights moved proportionally to features.

**Where RL ships (all share sequential decisions with delayed consequences, no per-step answers):** game playing (TD-Gammon; AlphaGo's policy/value nets — minimax's heir with learned evaluation); robotics and apprenticeship driving (inverse RL: reward from demos, then optimize); resource scheduling and recommendation (episodes as sessions, reward as engagement).

::: callout-formula KTU Formula Vault: Approximation
`U-hat = theta^T f`. `delta = r + gamma U-hat' - U-hat`. `theta += alpha delta f`. Triad (off-policy + bootstrap + approximation) can diverge. Ships in games/robots/scheduling where rewards delay.
:::

::: callout-exam KTU Exam Focus
9-markers pair one traced approximator update (features, delta, theta-step, new estimate) with an applications triad (one game, one robot, one scheduler/recommender), each justified by delayed reward. Examiners credit the deadly-triad caveat as analysis depth.
:::

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Tabular vs. approximate values | Exact per-state (no transfer) vs. compact weights (transfer with error) |
| Linear-TD vs. deep RL | Near-best-representable convergence on-policy (qualified) vs. reach with sold certainties |
| RL vs. control/supervision jurisdiction | Delayed consequences without per-step answers vs. instant dense error signals |

**Watch out:** (1) Linear-TD convergence holds near best representable values on-policy — off-policy plus nonlinear nets void it (triad). (2) Zero features freeze weights silently — feature design is policy design. (3) Chess/recommender fit RL; thermostat PID (Proportional-Integral-Derivative control) fits classical control — match paradigm to delay shape.

**Limitations:** approximation trades guarantees for reach; divergence is structural (not bad luck/tabular failure); applications need simulators/logs plus safety gating where exploration is malpractice.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Q1: Update Arithmetic
f = [2, 0], θ = [1.0, 5.0], δ = -2, α = 0.5. New θ?
(A) [0.0, 3.0], both move
(*B) [1.0 - 2.0, 5.0] = [-1.0, 5.0] — the dead feature (0) shields its weight entirely; only live features learn, which is why feature design is policy design
(C) [0.0, 5.0] mirrored
(D) [1.0, 4.0], second moves instead
::: explanation
Theta-step is alpha*delta*f = 0.5x(-2)x[2,0] = [-2, 0]. Zero-valued features carry zero gradient — silent features freeze weights.
:::

::: quiz Q2: Triad Danger
Off-policy Q-learning + bootstrapping + neural net approximator diverges on a task tabular Q-learning solved. Explanation?
(A) Learning rate too small
(*B) The deadly triad — each leg is safe in pairs but the triple can diverge, so stabilize with frozen targets, replay, or on-policy data before blaming the environment
(C) Neural nets cannot do RL
(D) More exploration always fixes it
::: explanation
Bootstrapped targets shift under the approximator while off-policy data skews updates. DQN machinery (target nets, replay) is triad scaffolding.
:::

::: quiz Q3: Application Sorting
Chess engine, ad recommender, thermostat PID. Which genuinely needs RL?
(A) All three equally
(*B) Chess (delayed win/loss, sequential moves) and recommender (session-long engagement from slate sequences) fit; the thermostat's instant error signal is classical control's home turf, not RL's
(C) Thermostat only
(D) None need RL
::: explanation
RL's jurisdiction is delayed consequences without per-step answers (mate in 40, purchases after impressions). Instant dense signals belong to supervision or control.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
Trace one linear-TD update plus the triad caveat; sort three applications by delay shape with justifications.
:::

**Recap facts examiners reward:** predictor/delta/theta-step with symbols; dead-feature line; triad members plus DQN remedies; game/robot/scheduler triad with delayed-reward reasons.

### Sample 3-Mark Question
**Q: State the linear-TD update and the deadly triad.**

**Model Answer:** delta = r + gamma U-hat(s') - U-hat(s); theta += alpha delta f(s). Triad: off-policy plus bootstrapping plus approximation can diverge despite pairwise safety.

### Sample 7-Mark Question
**Q: Trace the §3 update and justify two RL applications vs. one non-RL control task.**

**Model Answer:** Current 1.5, target 2.8, delta 1.3, theta [0.63, 0.76], new 2.15 toward target. Chess (win/loss after dozens of moves) and session recommendation (engagement after slate sequences) fit delayed-reward RL; PID thermostat (instant error) fits classical control.
:::
