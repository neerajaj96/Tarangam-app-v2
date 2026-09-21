---
id: m4_01_reinforcement_learning_learning_from_rewards
courseCode: PECST522
module: 4
sequence: 1
title: 'Reinforcement Learning: MDPs & Learning from Rewards'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Specify Markov decision processes with the five-tuple contract
  - Back up Bellman values by hand toward true utilities
  - Split passive grading from active improvement for the module map
concepts:
  - Markov decision processes
  - Bellman equations
  - passive-active split
prerequisites: []
examRelevance: high
tags:
  - reinforcement-learning
  - mdp
---
# Reinforcement Learning: MDPs & Learning from Rewards

**Problem: no teacher gives correct actions and no manual guarantees transitions — only a reward signal. By the end you can specify any task as a Markov Decision Process (MDP), price delayed credit, and hand-run one Bellman backup.**

<a id="start-zero"></a>
## 1. Start From Zero: Rewards Instead of Rules

Nobody hands a puppy a rulebook ("Rule 47b: sit 3 cm left"). You reward sits (+treat) and punish chewing (-scold); the puppy discovers the policy. **Reinforcement learning (RL)** is this bargain: trial-and-error behaviour maximizing long-term reward, with no per-step answers.

**Definitions:** **supervised learning** says "do this here" (labelled correct actions). RL says "that earned +10 — do more of whatever led there." **Credit assignment** is deciding which of 40 pre-goal moves actually mattered — the entire difficulty, since rewards arrive delayed.

::: callout-intuition Core Mental Model: Training a Puppy
Feel "reward signals, not instructions" here, then drop the puppy; MDP slots plus the Bellman equation below are the technical content.
:::

**Tiny beginner example:** a grid robot reaches cheese (+10) after 5 moves through empty squares (0 each). Which move earned the cheese? All five share credit through discounted backups — the mechanism below.

::: toggle What are `agent`, `environment`, `state`, `action`, `reward`, `policy`, `return`, `episode`?
Agent = the learner/actor (robot, puppy, program). Environment = everything outside it (grid, stadium — responds to actions with next states and rewards). State = one configuration (robot's cell). Action = one choice there (move up). Reward = immediate numeric feedback (+10 cheese, 0 empty, −scold). Policy π = action choice per state (the behaviour being learned). Return = discounted reward sum over a run (the maximand). Episode = one run start-to-terminal (a season, a maze attempt). Supervised learning gets correct actions as labels; RL gets only rewards — no per-step answers, hence credit assignment.
:::

::: toggle What are `MDP 5-tuple`, `Markov assumption`, `γ`, `U`, `π*`?
MDP = (S states, A actions, T transition odds, R rewards, γ discount) — the formal arena. Markov assumption = future depends only on present state+action (history irrelevant given now — conditional independence, not determinism). γ (gamma, 0 ≤ γ < 1) = impatience knob (future rewards shrink geometrically — treats now beat treats tomorrow, and infinite totals stay finite). U = utility (expected discounted return — desirability score). π* (pi-star) = optimal policy (maximises expected utility per state — the learning target). Tiny check above: 5 zero-reward moves share the +10 through γ-discounted backups — no single move "earned" it alone.
:::

<a id="basics"></a>
## 2. Basic Layer: MDPs — The Formal Arena

**Data/state:** fully observable states (partial observability needs POMDPs — Partially Observable MDPs, beyond syllabus). **Goal:** learn the optimal policy (action choice per state maximizing expected utility).

An **MDP** is a 5-tuple `(S, A, T, R, gamma)`:

- **States** `S`; **actions** `A(s)` legal per state.
- **Transition model** `T = P(s' | s, a)`: probability of next state `s'` given current `s` and action `a`. The **Markov assumption** means the future depends only on the present state and action — never the path taken (conditional independence of history given the present).
- **Reward** `R(s)` (sometimes `R(s,a,s')`): immediate numeric feedback on entering states.
- **Discount** `0 <= gamma < 1`: future rewards shrink geometrically (a treat now beats a treat tomorrow) and keep infinite-horizon totals finite.

**Utility of a history** `[s0, s1, ...]`:

$$U([s_0, s_1, \dots]) = \sum_{t=0}^{\infty} \gamma^t R(s_t)$$

Symbols: `gamma^t` discounts step `t`; `R(s_t)` is its reward; the sum is total desirability. The **optimal policy** `pi*` (pi-star) maximizes expected utility per state.

::: toggle Expand the Bellman equation term by term with the §3 numbers
$U(s)$ = utility of being in $s$ (the unknown being solved). $R(s)$ = immediate reward here ($R(A) = 1$ — banked now, no discount). $\gamma$ = 0.9 (one-step patience factor). $\max_a$ = best action's value (choose the max, not the average — control, not prediction). $\sum_{s'} P(s'|s,a)\,U(s')$ = expected next-utility (0.8×5 + 0.2×0 = 4.0 — odds-weighted futures). Full: $U_{new}(A) = 1 + 0.9 × 4.0 = 4.6$ (guess 5 corrected down toward consistency). True value solves $U = 1 + 0.72U$ → ~3.57 (repeated backups contract there from any start, given γ < 1).
:::

<a id="formal-model"></a>
## 3. Formal Layer: Bellman Equation and Module Map

**Meaning, variables, intuition, formula — the Bellman optimality equation:**

$$U(s) = R(s) + \gamma \max_a \sum_{s'} P(s' \mid s, a)\; U(s')$$

Read: value of here = reward of here + discounted best-expected value of next. Symbols: `U(s)` utility of state `s`; `max_a` best action's value; the sum weighs successor utilities by transition odds. Every planning/learning method in this module solves, samples, or approximates this one equation (value iteration applies it repeatedly; policy iteration alternates evaluation with greedy improvement).

::: callout-formula Formal Core: The Bellman Equation
Immediate reward plus discounted best continuation. Memorize the reading line; numerical backups below are that line in arithmetic.
:::

::: callout-pitfall Discount < 1 Is Load-Bearing, Not Cosmetic
With gamma = 1 over infinite horizons, totals can diverge to infinity and "optimal" becomes undefined (every policy earns infinity). Discounting — or finite horizons, or absorbing goal states with zero onward reward — makes optimization well-posed. Infinite undiscounted sums without absorbers are broken at the foundation.
:::

**Passive vs. active (module map):** **passive RL** (next topic) fixes a policy and grades it (`U^pi` — expected return following pi) via averaging, Adaptive Dynamic Programming (ADP — learn the model, then solve), Temporal Difference (TD — per-step sample backups). No exploration dilemma. **Active RL** (topic 3) learns the optimal policy itself — **exploration** (trying unknowns for information) vs. **exploitation** (milking the best-known for reward). **Beyond values** (topic 4): direct policy search plus inverse RL (infer rewards from experts).

**One Bellman backup by hand:** states {A, B}; `R(A) = 1`, `R(B) = 0`; gamma 0.9; from A 80% stay, 20% to B; B absorbing. Estimates U(A) = 5, U(B) = 0:

$$U_{new}(A) = 1 + 0.9\,(0.8 \times 5 + 0.2 \times 0) = 1 + 3.6 = 4.6$$

The guess falls 5 to 4.6 — overshoot corrected toward consistency. True value solves `U = 1 + 0.72U`, i.e. ~3.57; repeated backups converge there from any start (value iteration as contraction — qualified: given discount < 1 and the stated dynamics).

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Supervised vs. reinforcement | Correct-action labels vs. reward signals with temporal credit assignment |
| Passive vs. active RL | Grade fixed behaviour (no exploration) vs. improve it (explore/exploit) |
| Transition vs. reward model | Where actions lead (`P`) vs. what states pay (`R`) |

**Watch out:** (1) Markov simplifies dynamics, not payoffs — delayed rewards remain. (2) `U^pi` (fixed-policy value) differs from `U*` (optimal value) — conflating them breaks topic-2 vs. topic-3 answers. (3) Discount encodes impatience and convergence, never processor speed.

**Limitations:** MDPs assume full observability and known rewards; exact Bellman solving needs the model and enumerable states — sampling (TD/Q) and approximation (topic 5) remove those assumptions at the cost of guarantees.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What does the Markov assumption buy the agent, and what does it forbid using?
() It guarantees the environment is deterministic
(*) The next state depends only on the current state and action — the agent may ignore the entire path history without losing predictive power
() It forbids the agent from ever revisiting a state
() It guarantees rewards arrive immediately, never delayed
::: explanation
Markov is conditional independence of futures from histories given the present. Policies and Bellman backups condition on s alone; delayed payoffs (credit assignment) fully remain.
:::

::: quiz Why must the discount factor satisfy γ < 1 in infinite-horizon problems?
() To make the agent prefer risky actions
(*) Otherwise total utilities can diverge to infinity and no policy is strictly better than another — the optimization is ill-posed
() Discounting speeds up the processor running the agent
() γ < 1 is required only for deterministic environments
::: explanation
Geometric sums converge for gamma < 1; with gamma = 1 over infinite horizons, maximization stops meaning anything. Finite horizons or absorbing zero-reward states are the only alternatives.
:::

::: quiz An agent follows a fixed policy and only estimates how good that policy is, never trying to improve it. Passive or active learning, and what's missing?
() Active — it is already optimal by definition
(*) Passive — policy evaluation without policy improvement; exploration and Q-values for untried actions are entirely absent
() Neither — this describes supervised learning
() Passive — but it must still use ε-greedy exploration
::: explanation
Passive grades fixed behaviour (averaging, ADP, TD next). Improvement machinery — exploration, action-values, greedy updates — is active-only. Fixed policies need no exploration.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: MDP 5-tuple, Bellman equation, or passive-vs-active line. 7 marks: Bellman numericals or the discount-necessity argument.
:::

**Recap facts examiners reward:** `(S,A,T,R,gamma)` expansions; Markov sentence; utility sum with symbols; Bellman reading; passive/active/beyond map; 5-to-4.6 backup with true ~3.57.

### Sample 3-Mark Question
**Q: Define an MDP and state Bellman optimality.**

**Model Answer:** States, actions, transitions P(s'|s,a), rewards, discount gamma. U(s) = R(s) + gamma max_a sum P U(s') — immediate plus discounted best continuation.

### Sample 7-Mark Question
**Q: Compute two Bellman backups from U(A) = 5 and show convergence direction.**

**Model Answer:** Backup 1: 1 + 0.9(0.8x5) = 4.6. Backup 2: 1 + 0.9(0.8x4.6) = 4.312. True ~3.57; estimates 5, 4.6, 4.312 descend toward it — contraction under gamma < 1, each backup shrinking error.
:::
