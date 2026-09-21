---
id: m4_99_practice_lab_rl_drills
courseCode: PECST522
module: 4
sequence: 99
title: 'Module 4 Practice Lab: RL Drills'
difficulty: intermediate
estimatedMinutes: 9
learningObjectives:
  - Race backups across direct, TD and ADP updates
  - Sprint Q-traces with error arithmetic exact
  - Prescribe exploration against noise honestly
concepts:
  - backup race
  - Q-trace sprint
  - exploration prescription
prerequisites:
  - m4_01_reinforcement_learning_learning_from_rewards
  - m4_02_passive_rl_utility_adp_and_td
  - m4_03_active_rl_q_learning_and_exploration
  - m4_04_policy_search_and_inverse_rl
examRelevance: high
tags:
  - reinforcement-learning
  - m4-lab
---
# Module 4 Practice Lab: RL Drills

**Problem: turn RL theory into backup arithmetic and deployment judgment. By the end you can race three estimators on one world, sprint Q-traces, and prescribe exploration by stakes and stationarity.**

<a id="start-zero"></a>
## 1. Start From Zero: Three Races

**Problem first:** one-step positions prove nothing — procedures converge as trajectories. **Method:** run every estimator on the same two-state world (R(A) = 1, 80/20 dynamics, gamma 0.9, truth U*(A) approx 3.57, current U(A) = 5), then compare philosophies.

::: toggle How do I run the backup race (same world, three philosophies)?
Fix the world (R(A)=1, 80/20, γ=0.9, truth ≈3.57, current 5.0). Value-iteration backup: full expectation 1+0.9(0.8×5) = 4.6 (model-exact, contracts downward). TD single sample: r=1 landing B, α=0.5 → 4.6+0.5(1−4.6) = 2.8 (sample bounce below truth — noise, not failure). Direct: one episode returning 1 → running average 1.0 (single-trajectory hostage). Verdict shape: all converge with enough experience (VI deterministically, TD with decaying α + visitation, direct by LLN) — first-step addresses differ completely, destinations coincide.
:::

::: toggle How do I prescribe exploration (stakes × stationarity)?
Two axes decide: stakes (cost of a random move) × stationarity (does truth move?). Factory arm + simulator + offline trials → Q-learning + GLIE (simulate everything, deploy frozen greedy). Live trading + regime shifts → small fixed ε forever (GLIE purity unsafe when truth moves — perpetual probing tracks shifts). Surgical robot + first-do-no-harm → no naive exploration (offline/batch RL or human gating — random moves are malpractice). Policy follows the quadrant, never habit: low-stakes-stationary explores freely, high-stakes-anything gates hard.
:::

**Scenario 1 — Backup race:** **value-iteration backup** (model-exact expectation): `1 + 0.9(0.8x5) = 4.6`. **TD single sample** (r = 1, land B with U(B) = 0, alpha 0.5): `4.6 + 0.5(1 - 4.6) = 2.8` — overshooting below truth (sample noise, not failure). **Direct estimation** after one A-episode returning 1: running average 1.0 (single-trajectory hostage). Model-exact contracts downward; samples bounce around truth; episodes anecdotalize. All converge with enough experience (VI deterministically; TD with decaying alpha plus visitation; direct by the Law of Large Numbers — LLN); first-step addresses differ completely.

**Scenario 2 — Q-trace sprint:** Q(A,left) = 2.0 with r = 0 and max Q(B) = 4.0 goes to 2.8 in one update (alpha 0.5). Continue: take left from B (exploratory), r = 0, land C with max Q(C) = 2.0, current Q(B,left) = 1.0. Target `0 + 0.9x2.0 = 1.8`; Q <- `1.0 + 0.5x0.8 = 1.4` — aimed at the max (right-side values) despite taking left. SARSA (on-policy) would target the taken action's value instead. One trace, the whole off-policy distinction.

**Scenario 3 — Exploration prescription desk:** (a) factory arm, deterministic simulator, 1M offline trials: **Q-learning plus GLIE** (Greedy in the Limit of Infinite Exploration — simulate everything, converge behaviour, deploy frozen greedy). (b) Live trading bot, real money, quarterly regime shifts: **small fixed epsilon forever** (stationarity violated, so GLIE purity is unsafe; perpetual probing tracks shifts). (c) Surgical robot, first-do-no-harm: **no naive exploration** (offline/batch RL from logs or human-gated actions — random moves are malpractice, not learning). Policy follows stakes and stationarity, never habit.

<a id="basics"></a>
## 2. Basic Layer: Do-Not-Confuse Table

| Pair | Exam distinction |
|---|---|
| U(s) vs. Q(s,a) | State goodness (needs model to act) vs. action goodness (argmax acts model-free) |
| VI backup vs. TD update | Full expectation over dynamics (model) vs. single-sample correction (model-free) |
| Direct vs. TD vs. ADP | Average returns (no bootstrap) vs. per-step bootstrap vs. learn-model-then-solve |
| On-policy vs. off-policy | Learn behaviour's value (SARSA) vs. optimal value regardless (Q max) |
| Fixed epsilon vs. GLIE | Permanent probing (non-stationary-safe) vs. decay to pure greed (convergent) |
| Exploration vs. noise | Information-priced experiments vs. unpriced thrashing |
| Policy search vs. value methods | Direct theta climb (continuous/stochastic ok) vs. Q* plus argmax (needs tractable max) |
| IRL vs. cloning | Recover objective (transfers) vs. copy moves (compounds drift); IRL = Inverse RL |
| Discount roles | Convergence-guarantor plus impatience-encoder (never cosmetic) |
| Passive vs. active data | Grade fixed behaviour (coverage suffices) vs. improve it (explore plus counterfactuals) |

**Limitations of drills:** race numbers assume stated dynamics and one sample; real streams need decay schedules and coverage audits. Prescriptions assume stated stationarity/stakes — misjudge those and the schedule flips.

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz The Scenario-1 TD update landed at 2.8, below the true 3.57, while value iteration landed at 4.6 above it. Which update is "wrong," and what happens next?
() TD is wrong and must be discarded; only model backups are valid
(*) Neither is wrong — both are single steps of convergent procedures from 5.0 toward 3.57 (VI from above via expectations, TD overshooting below via one sample); continued visits with decaying α sand both to truth
() Both are wrong; only direct estimation converges
() The true value must lie between any two consecutive estimates
::: explanation
Convergence is a trajectory property (infinite visits, decaying alpha), not a single-step snapshot. VI contracts deterministically; TD bounces with sample noise around the same fixed point.
:::

::: quiz In Scenario 2, the agent explored with 'left' from B, yet the Q-update aimed at the max (right-side values). A student calls this "learning from actions it didn't take" and therefore unsound. Refute.
() Agree — off-policy updates are unsound by definition
(*) The max *defines* the optimal-value target independently of behavior: Q-learning estimates Q* (best continuation), and behavior merely supplies state-visits — exploration feeds coverage while the max keeps the target optimal (decoupling is the design, not a flaw)
() SARSA would have updated identically, proving the point moot
() Exploration must be disabled during Q-learning for soundness
::: explanation
Q* satisfies Bellman optimality regardless of visitors: max is a values property, behaviour supplies coverage. Soundness needs infinite visitation, not on-policy behaviour.
:::

::: quiz A trading bot faces shifting regimes; a factory arm trains in a perfect simulator. Assign exploration schedules and justify the asymmetry.
() Both get GLIE — one schedule fits all problems
(*) Bot: small fixed ε forever (non-stationarity punishes frozen greed; perpetual probing tracks regime shifts). Arm: GLIE to frozen greedy (stationary simulator + offline budget ⇒ converge behavior fully, then lock it — exploration post-deployment buys nothing)
() Bot: no exploration (money is at stake); arm: fixed ε forever
() Exploration schedules don't affect deployed behavior
::: explanation
GLIE assumes a fixed MDP (eventual greed safe only if truth stops moving); fixed-epsilon pays eternal linear regret as regime-change insurance. Stationarity picks the schedule; stakes tune the rate.
:::

::: quiz Direct utility estimation, TD, and ADP all evaluate one fixed policy from the same 100 episodes. Rank their data efficiency and name what each wastes.
() All three use data identically; choice is cosmetic
(*) ADP (model + solve: every transition informs global dynamics) > TD (per-step bootstraps share structure online) > direct (whole-episode returns, ignores Bellman coupling) — waste hierarchy: model-solving compute vs. single-sample noise vs. discarded neighbor constraints
() Direct estimation is most efficient; models only add overhead
() TD cannot use episodic data at all
::: explanation
Information reuse ranks them: ADP squeezes statistics into a solved model (most mileage, most compute); TD bootstraps neighbour structure per step; direct treats episodes as independent anecdotes.
:::

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
3 marks: any table row (U-vs-Q and on-vs-off-policy lead) or single-update arithmetic. 7 marks: multi-estimator comparisons, schedule prescriptions, or off-policy soundness.
:::

**Recap facts examiners reward:** 4.6/2.8/1.0 landings with philosophies; max-vs-taken trace line; stationarity-picks-schedule rule; ADP > TD > direct efficiency order with waste named.

### Essay Question 1 (7 Marks)
**Q: On the two-state world (U(A) = 5, truth approx 3.57), apply one VI backup, one TD update (r = 1 to B, α = 0.5), and one direct step (return 1). Compare landings.**

**Model Answer:** VI 4.6 (model-exact contraction down). TD 2.8 (sample overshoots below truth — noise, not failure). Direct 1.0 (single-trajectory hostage). All converge with infinite experience (VI deterministically, TD with decaying alpha plus visitation, direct by LLN); addresses differ because models contract, samples bounce, episodes anecdotalize — three philosophies, one fixed point.

### Essay Question 2 (7 Marks)
**Q: "Q-learning learns optimal values while behaving randomly." Justify, contrast SARSA, state exact conditions.**

**Model Answer:** Target r + gamma max Q(s',a') estimates Bellman-optimality backup independent of behaviour — visits supply coverage, max supplies optimality (Scenario-2 trace exhibits it). SARSA backs up the taken a' (on-policy: learns behaviour's value, optimal only as exploration vanishes). Conditions: infinite (s,a) visitation plus decaying alpha plus bounded rewards; GLIE converts value convergence into behaviour convergence. Randomness feeds, max aims — off-policy's division of labour.
:::
