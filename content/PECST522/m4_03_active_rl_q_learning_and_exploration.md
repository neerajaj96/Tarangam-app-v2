---
id: m4_03_active_rl_q_learning_and_exploration
courseCode: PECST522
module: 4
sequence: 3
title: 'Active RL: Q-Learning & Exploration'
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Learn action-values off-policy with the max-detached Q-update
  - Price exploration with epsilon-greedy regret against GLIE convergence
  - Explain why choosing needs Q-values rather than state values
concepts:
  - Q-learning
  - exploration-exploitation
  - GLIE schedules
prerequisites:
  - m4_02_passive_rl_utility_adp_and_td
examRelevance: high
tags:
  - reinforcement-learning
  - q-learning
---
# Active RL: Q-Learning & Exploration

**Problem: state values cannot choose actions without a model, and the agent must try believed-suboptimal moves to learn. By the end you can hand-run the off-policy Q-update, price exploration schedules, and state exact convergence contracts.**

<a id="start-zero"></a>
## 1. Start From Zero: The Explorer's Dilemma

New town, new restaurants. **Exploit:** eat nightly at the first decent cafe — guaranteed okay, possibly missing the legendary place two streets over. **Explore:** try random doors — mostly mediocre, one life-changing. Exploration pays in information (future meals); exploitation pays in reward (tonight). Active RL formalizes this: deliberately take currently-believed-suboptimal actions, because beliefs without evidence are prejudices.

::: callout-intuition Core Mental Model: The New Town Foodie
Feel "information versus reward" here, then drop the town; Q-values plus epsilon schedules below are the technical content.
:::

**Tiny beginner example:** action Left is believed worth 2, Right believed worth 1. Trying Right once reveals it is actually worth 9 — one exploratory loss buying permanent gains. Never exploring locks in the wrong belief forever.

<a id="basics"></a>
## 2. Basic Layer: Q-Values and the Off-Policy Update

**Data/state:** state-action pairs. **Goal:** the optimal policy without any transition model.

Passive methods learn state values `U^pi` — useless for choosing without a model (which action leads where needs `P`). **Action-values** `Q(s,a)` grade pairs directly, so greedy policy `argmax_a Q(s,a)` needs no model.

**Meaning, variables, intuition, formula — Q-learning** (model-free, **off-policy**). After `(s,a) --r--> s'`:

$$Q(s,a) \leftarrow Q(s,a) + \alpha\,[\,r + \gamma \max_{a'} Q(s',a') - Q(s,a)\,]$$

Symbol by symbol: `alpha` = step size (must decay); `r` = reward just seen; `gamma max Q(s',a')` = discounted best continuation imaginable; minus current = error; step toward target. The `max` detaches learning from behaviour: updates aim at the optimal continuation regardless of the (possibly random) action actually taken — so optimal values are learned even while exploring randomly. On-policy sibling SARSA (State-Action-Reward-State-Action) backs up the actually-taken `a'` instead — safer during learning, optimal only as exploration vanishes.

::: callout-formula Formal Core: Q-Update Anatomy
Target = r + gamma max Q(s',a') (best imaginable future). Error = target minus current. Off-policy because max decouples learned value from behaviour policy. Converges to Q* only under infinite state-action visitation plus decaying alpha (stated fully below).
:::

<a id="formal-model"></a>
## 3. Formal Layer: Exploration Schedules and Convergence Contracts

**Epsilon-greedy:** with probability `epsilon` act randomly, else greedily. Fixed epsilon explores forever — fine for non-stationary (shifting) worlds, permanently suboptimal asymptotically (linear regret forever: ~10% random actions at epsilon 0.1 to the end of time).

**GLIE** (Greedy in the Limit of Infinite Exploration): `epsilon_t -> 0` (e.g. 1/t) while every `(s,a)` is still tried infinitely often. Early chaos, eventual purity — Q-learning plus GLIE plus decaying alpha converges to optimal *behaviour*, not just values.

```text
regret ^                                     GLIE regret flattens
fixed-epsilon regret rises linearly forever  (exploration tax decays to zero)
```

**Convergence contract (qualified — never "Q-learning converges" bare):** to `Q*` (optimal action-values) under (1) infinite visitation of every `(s,a)`, (2) decaying alpha (stochastic-approximation sums), (3) bounded rewards (plus GLIE exploration if optimal behaviour, not just values, is claimed). Finite-time, finite-visit guarantees do not exist — state the infinitary terms explicitly.

::: callout-pitfall Exploration Is Not Noise for Its Own Sake
Random actions are information-priced experiments on high-uncertainty pairs. Pure random never uses values; pure greedy never corrects them. Schedules exist because both extremes fail — price exploration in information, not motion.
:::

**One Q-update by hand:** Q(A,left) = 2.0; take left, r = 0, land B with Q(B,left) = 1.0, Q(B,right) = 4.0; alpha 0.5, gamma 0.9. Target: `0 + 0.9x4.0 = 3.6`. Error: `3.6 - 2.0 = 1.6`. Update: `2.0 + 0.5x1.6 = 2.8`. The next action in B did not matter — even exploratory left still aims at best (right). Off-policy in one line.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Q-learning vs. SARSA | Off-policy max target (learns optimum while exploring) vs. on-policy taken-action target (learns behaviour's value) |
| Fixed epsilon vs. GLIE | Permanent probing (non-stationary-safe, linear regret) vs. decay to pure greed (convergent behaviour) |
| `U(s)` vs. `Q(s,a)` | Needs model to act (`argmax` over predicted successors) vs. grades actions directly (model-free `argmax`) |

**Watch out:** (1) Acting greedily on `U(s)` without `P` is impossible — the representational shift to Q is what enables model-free control. (2) Fixed epsilon never retires exploration; GLIE assumes a stationary MDP (frozen greed is safe only if truth stops moving). (3) Max-target soundness still needs infinite visitation, not on-policy behaviour.

**Limitations:** tabular Q needs enumerable pairs; exploration costs real regret (dangerous live — batch/offline RL or human gating where stakes forbid randomness); non-stationarity voids GLIE purity.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What makes Q-learning off-policy, and why does that matter for exploration?
() It ignores rewards entirely and follows a fixed script
(*) Its update targets maxₐ′ Q(s′,a′) — the optimal continuation — regardless of the (possibly random) action actually taken, so it can learn optimal values while exploring freely
() It requires a perfect transition model before acting
() Off-policy means it never updates Q-values at all
::: explanation
On-policy SARSA learns the executed behaviour's value, warts included; Q-learning's max decouples target from behaviour, so wild exploration never corrupts optimal-value estimates.
:::

::: quiz A fixed ε = 0.1 greedy agent runs forever in a stationary world. What is true asymptotically?
() It converges to exactly optimal behavior with zero regret
(*) It keeps taking random actions 10% of the time forever, paying permanent linear regret — GLIE-style decaying ε is needed to close the gap
() It stops exploring after exactly 10 episodes
() ε-greedy is only defined for bandits, never MDPs
::: explanation
Fixed epsilon never retires: 1-in-10 actions stay random forever. GLIE spends exploration early and banks optimal behaviour late.
:::

::: quiz Why do active methods need action-values Q(s,a) rather than the state-values U(s) that passive methods learn?
() Q-values use less memory than state values
(*) Acting greedily on U(s) requires predicting which action leads to the best successor — impossible without a transition model; Q(s,a) grades actions directly, so argmax needs no model
() State values cannot represent stochastic policies
() Q-learning was invented before state values existed
::: explanation
Greedy on U needs P(s'|s,a) — the model passive evaluation never learned. Q* already contains consequence knowledge, so argmax Q* acts optimally model-free. MDP = Markov Decision Process.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: Q-update, epsilon-greedy, or GLIE conditions. 7 marks: off-policy vs. on-policy with regret reasoning.
:::

**Recap facts examiners reward:** Q-update with symbols; max-detachment line; epsilon vs. GLIE regret shapes; U-vs-Q representation argument; infinitary convergence trio (visitation, decaying alpha, bounded rewards; GLIE for behaviour).

### Sample 3-Mark Question
**Q: State Q-learning and its convergence conditions to Q*.**

**Model Answer:** Q <- Q + alpha[r + gamma max Q(s',a') - Q]. Converges under infinite (s,a) visitation plus decaying alpha (plus bounded rewards; GLIE if optimal behaviour required) — never in finite time bare.

### Sample 7-Mark Question
**Q: Discuss exploration vs. exploitation with epsilon-greedy and GLIE, and how off-policy softens the conflict.**

**Model Answer:** Exploitation banks known rewards; exploration buys information at immediate cost (regret). Fixed epsilon pays linear regret forever; GLIE decays while preserving infinite visitation, converging behaviour. Q-learning softens (not removes) the dilemma: max-targets teach optimal values from foolish behaviour — learn wisely while behaving foolishly, which SARSA cannot do.
:::
