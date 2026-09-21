---
id: m4_04_policy_search_and_inverse_rl
courseCode: PECST522
module: 4
sequence: 4
title: Policy Search & Inverse Reinforcement Learning
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Compare value-based and policy-based learning on action spaces
  - Climb policy space where action maximization turns intractable
  - Infer rewards from experts with the apprenticeship loop
concepts:
  - policy search
  - inverse reinforcement learning
  - actor-critic placement
prerequisites:
  - m4_03_active_rl_q_learning_and_exploration
examRelevance: medium
tags:
  - reinforcement-learning
  - policy-search
---
# Policy Search & Inverse Reinforcement Learning

**Problem: value methods need `argmax` over actions (impossible for continuous torques) and rewards are rarely written down — experts just behave. By the end you can climb policy space directly and infer objectives from demonstrations.**

<a id="start-zero"></a>
## 1. Start From Zero: Choreography vs. Physics

Value methods learn the physics (how good every situation is) then derive behaviour. **Policy search** skips physics and choreographs directly: parametrize the dance (`pi_theta` — e.g. a neural net mapping sensors to motor torques with weights theta), perform it, measure applause (total reward), adjust toward applause. Grading every (state, torque-vector) pair is hopeless for a 7-joint arm — tweaking dance parameters by feel works.

::: callout-intuition Core Mental Model: Choreography vs. Physics
Feel "tune behaviour, skip value tables" here, then drop the dance; policy gradients plus the inverse-RL ambiguity below are the technical content.
:::

**Tiny beginner example:** a thermostat threshold theta (turn on below theta degrees). Try theta 19 (bill \$80, comfort 7), theta 21 (bill \$95, comfort 9) — hill-climb theta toward the scored trade-off. No value per temperature needed, just dance-parameter scores.

<a id="basics"></a>
## 2. Basic Layer: Hill-Climbing Expected Reward

**Data/state:** parametrized stochastic policies `pi_theta`. **Goal:** `theta* = argmax J(theta)` where `J(theta) = E[total reward following pi_theta]` (expected return).

**Method (two flavours):** **finite differences / hill climbing:** jiggle theta, keep jiggles scoring higher — simple, gradient-free, sample-hungry. **Policy gradients (REINFORCE idea):** estimated gradient `grad J ≈ average over trials of return x grad log pi_theta(actions taken)` — actions from high-return trials get reinforced in proportion to surprise-weighted contribution; follow uphill trial by trial.

Strengths: continuous high-dimensional actions (robotics, games) where `max_a Q` is intractable; stochastic policies natively (needed for partial observability and adversarial unpredictability). Weaknesses (qualified): high-variance gradients, local optima (no global-optimality certificate unlike tabular Q's infinitary guarantee), sample hunger — the price of ignoring value structure.

::: callout-formula Formal Core: The Two Paradigms
Value-based: learn Q*, act argmax Q (needs tractable action max; deterministic policies). Policy-based: learn theta* = argmax J via gradient estimates (continuous/stochastic native). Actor-critic hybrids learn both — the actor dances, the TD critic applauds precisely, cutting gradient variance.
:::

<a id="formal-model"></a>
## 3. Formal Layer: Inverse RL and Its Ambiguity

**Forward RL:** reward given, learn behaviour. **Inverse RL (IRL):** expert demonstrations given, learn the reward the expert seems to optimize. Why invert? Rewards transfer ("stay on road, avoid pedestrians" ports to new cars/cities/bodies); copied steering does not.

**Reward ambiguity (the ill-posedness):** infinitely many rewards rationalize any behaviour — including degenerate all-zero (everything optimal, explaining nothing). Fixes: **apprenticeship / feature matching** (Abbeel and Ng: match expert's feature expectations — average lane-centering, speed profiles — not actions, then optimize the matched reward); **maximum-entropy IRL** (among consistent rewards, prefer the one making expert behaviour least surprising — no extra commitments).

::: callout-pitfall Imitation ≠ Inverse RL
**Behavioural cloning** (supervised state-to-action copying) compounds drift: one off-distribution step, no recovery skill. **IRL** recovers the objective and re-optimizes — the apprentice understanding why survives unseen states the master never showed. Exams test exactly this boundary.
:::

**Apprenticeship trace (two features):** expert averages mu_E = (centering 0.9, speed adherence 0.8). Policy pi0 (crawl centered) gives (1.0, 0.4). Loop: find weights w making the expert look optimal (reward adherence over centering); optimize w-rewarded MDP to pi1 with (0.92, 0.75); compare gap norm vs. tolerance; iterate on residuals. Stopping certifies near-expert performance under the expert's own unknown true reward (the Abbeel-Ng guarantee — qualified: within epsilon under matched features, not exact optimality) without ever writing "good driving" down.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Value vs. policy methods | Q* plus argmax (sample-efficient, needs tractable max) vs. theta hill-climb (continuous/stochastic ok, high variance, local optima) |
| Cloning vs. apprenticeship IRL | Copy moves (compounds drift off-distribution) vs. recover objective (transfers to novel states) |
| Apprenticeship vs. max-entropy | Match feature averages vs. least-commitment selection among consistent rewards |

**Watch out:** (1) `argmax Q` intractability over R^7 torques is the policy-search trigger — quote it. (2) All-zero reward "explains" everything and nothing — never list it as a solution. (3) Actor-critic stabilizes gradients with TD baselines; it does not restore global optimality.

**Limitations:** policy search is local and thirsty; IRL needs quality demos and feature design (wrong features, wrong rewards); recovered rewards still need forward optimization to become behaviour.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz A 7-joint robot arm must learn smooth reaching motions. Why is policy search favored over Q-learning here?
() Q-learning is mathematically incorrect for robots
(*) The action space (7 continuous torques) makes maxₐ Q(s,a) intractable, while a parameterized stochastic policy can be hill-climbed directly on measured returns
() Robots cannot receive numeric rewards at all
() Policy search needs no trials, unlike Q-learning
::: explanation
Q-learning decides by optimizing over actions — trivial for grid moves, impossible over R^7 torques every 10 ms. Gradients on parameters replace the intractable argmax and cover sensor/adversarial needs stochastically.
:::

::: quiz What is the fundamental ill-posedness of inverse RL, and which fix does maximum-entropy IRL apply?
() Experts demonstrate too few actions to fill a table; max-entropy invents extra demonstrations
(*) Infinitely many rewards (including all-zero) rationalize any behavior; max-entropy selects among them the reward under which the expert looks least surprising — no unjustified extra commitments
() Inverse RL cannot represent stochastic experts; max-entropy forces determinism
() There is no ill-posedness; rewards are uniquely determined
::: explanation
Behaviour underdetermines objectives: laziness explains everything and nothing. Least-commitment matching of feature statistics yields generalizing rewards.
:::

::: quiz Contrast behavioral cloning with apprenticeship (feature-matching) IRL on a driving task, specifically on unseen situations.
() They are identical methods with different names
(*) Cloning copies state→action mappings and compounds drift errors off-distribution; apprenticeship recovers an objective (feature weights) and re-optimizes, so the apprentice handles novel states the expert never showed
() Cloning generalizes better because it uses deeper networks
() IRL cannot handle unseen situations by definition
::: explanation
Cloning learns what the master did; IRL learns what the master wanted. Objectives transfer, trajectories do not — off-manifold, only the apprentice still scores actions correctly.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: policy-search idea, IRL definition, or cloning-vs-IRL line. 7 marks: value-vs-policy comparison or the apprenticeship loop with its guarantee.
:::

**Recap facts examiners reward:** `J(theta)` with gradient idea; intractable-argmax trigger; ambiguity plus all-zero degeneracy; feature-matching vs. max-entropy fixes; cloning-drift vs. objective-transfer; actor-critic variance role.

### Sample 3-Mark Question
**Q: Define IRL and state its core difficulty.**

**Model Answer:** IRL infers the expert's apparent reward from demonstrations. Difficulty: reward ambiguity — infinitely many rewards (including all-zero) fit any behaviour; max-entropy/feature-matching tie-break principledly.

### Sample 7-Mark Question
**Q: Compare value-based and policy-based RL. Where do actor-critics fit?**

**Model Answer:** Value-based learns Q* then argmax — structured and sample-efficient, needs tractable discrete/small actions, yields deterministic policies. Policy-based learns theta* = argmax J via gradient estimates — continuous/stochastic native, high-variance and local-optima-prone. Actor-critic hybrids keep both: a TD critic supplies low-variance baselines stabilizing actor steps — the standard deep-RL architecture.
:::
