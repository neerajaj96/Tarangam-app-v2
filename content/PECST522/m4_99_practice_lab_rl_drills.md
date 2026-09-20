---
id: m4_99_practice_lab_rl_drills
courseCode: PECST522
module: 4
sequence: 99
title: 'Module 4 Practice Lab: RL Drills'
difficulty: intermediate
estimatedMinutes: 7
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

**Backup races, estimator showdowns, exploration schedules, paradigm prescriptions, and exam essay models.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

### Scenario 1: The Backup Race (Same World, Three Updates)

World from M4 ($R(A) = 1$, 80/20 dynamics, $\gamma = 0.9$, truth $U^*(A) \approx 3.57$, current $U(A) = 5$). **Value-iteration backup:** $1 + 0.9(0.8\cdot5) = 4.6$. **TD single sample** ($r=1$, land $B$, $U(B)=0$, $\alpha=0.5$): $4.6 + 0.5(1 + 0 - 4.6) = 2.8$. **Direct estimation** after one $A$-episode returning $1$: running average $= 1.0$. Three updates, three philosophies: model-exact (4.6), sample-corrected (2.8, overshooting below truth!), episode-averaged (1.0, hostage to one trajectory). All converge with enough experience; their *first-step* personalities differ completely.

### Scenario 2: The Q-Trace Sprint

From M4: $Q(A,\text{left}) = 2.0 \xrightarrow{r=0,\ \max Q(B)=4.0} 2.8$ in one update ($\alpha=0.5$). Now continue: suppose next the agent takes $\text{left}$ from $B$ (exploratory), gets $r=0$, lands $C$ with $\max Q(C)=2.0$, current $Q(B,\text{left}) = 1.0$. Q-update: target $0 + 0.9(2.0) = 1.8$; $Q \leftarrow 1.0 + 0.5(0.8) = 1.4$ — updated toward the *max* (2.0-side values) despite *taking* left. SARSA would instead target the actually-taken next action's value. One line of trace, the whole off-policy distinction.

### Scenario 3: Exploration Prescription Desk

Three agents: (a) factory arm, deterministic simulator, 1M offline trials allowed → **Q-learning + GLIE** (simulate everything, converge behavior, deploy frozen greedy). (b) Live trading bot, real money, regime shifts quarterly → **small fixed $\epsilon$ forever** (never stop probing; GLIE's purity assumes stationarity the market violates). (c) Surgical robot, first do no harm → **no naive exploration at all** (offline/batch RL from logs, or human-gated actions — random moves are malpractice, not learning). Exploration policy follows *stakes and stationarity*, never habit.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| $U(s)$ vs. $Q(s,a)$ | State goodness (needs model to act) vs. action goodness (argmax acts model-free) |
| VI backup vs. TD update | Full expectation over dynamics vs. single-sample correction (model vs. model-free) |
| Direct vs. TD vs. ADP | Average returns (no bootstrap) vs. per-step bootstrap vs. learn-model-then-solve |
| On-policy vs. off-policy | Learn behavior's value (SARSA) vs. learn optimal value regardless (Q max) |
| $\epsilon$-fixed vs. GLIE | Permanent probing (non-stationary-safe) vs. decaying to pure greed (convergent) |
| Exploration vs. noise | Information-priced experiments vs. unpriced thrashing (schedules encode the price) |
| Policy search vs. value methods | Direct $\theta$ hill-climb (continuous/stochastic ok) vs. $Q^*$ + argmax (needs tractable max) |
| IRL vs. cloning | Recover objective (transfers) vs. copy moves (compounds drift) |
| Discount roles | Convergence-guarantor + impatience-encoder (never cosmetic) |
| Passive vs. active data needs | Grade fixed behavior (coverage suffices) vs. improve it (explore + counterfactuals) |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz The Scenario-1 TD update landed at 2.8, below the true 3.57, while value iteration landed at 4.6 above it. Which update is "wrong," and what happens next?
() TD is wrong and must be discarded; only model backups are valid
(*) Neither is wrong — both are single steps of convergent procedures from 5.0 toward 3.57 (VI from above via expectations, TD overshooting below via one sample); continued visits with decaying α sand both to truth
() Both are wrong; only direct estimation converges
() The true value must lie between any two consecutive estimates
::: explanation
One-step positions prove nothing about procedures: VI contracts deterministically downward, TD bounces around truth with sample noise (this sample undershot). Convergence is a *trajectory* property (infinite visits, decaying $\alpha$), not a single-step snapshot — judge estimators by their fixed points and conditions, never by one update's address.
:::

::: quiz In Scenario 2, the agent explored with 'left' from B, yet the Q-update aimed at the max (right-side values). A student calls this "learning from actions it didn't take" and therefore unsound. Refute.
() Agree — off-policy updates are unsound by definition
(*) The max *defines* the optimal-value target independently of behavior: Q-learning estimates Q* (best continuation), and behavior merely supplies state-visits — exploration feeds coverage while the max keeps the target optimal (decoupling is the design, not a flaw)
() SARSA would have updated identically, proving the point moot
() Exploration must be disabled during Q-learning for soundness
::: explanation
$Q^*$ satisfies Bellman optimality *regardless of who visits what*: the update's target ($\max$) is a property of values, while behavior supplies *coverage* (which $(s,a)$ get updated). Soundness needs infinite visitation, not on-policy behavior — decoupling lets agents behave foolishly while learning wisely (M4's tagline, now as proof sketch).
:::

::: quiz A trading bot faces shifting regimes; a factory arm trains in a perfect simulator. Assign exploration schedules and justify the asymmetry.
() Both get GLIE — one schedule fits all problems
(*) Bot: small fixed ε forever (non-stationarity punishes frozen greed; perpetual probing tracks regime shifts). Arm: GLIE to frozen greedy (stationary simulator + offline budget ⇒ converge behavior fully, then lock it — exploration post-deployment buys nothing)
() Bot: no exploration (money is at stake); arm: fixed ε forever
() Exploration schedules don't affect deployed behavior
::: explanation
GLIE's convergence promise *assumes* a fixed MDP (eventual greed is safe only if truth stops moving); fixed-$\epsilon$ pays eternal linear regret as regime-change insurance. Stationarity decides: static world ⇒ converge and lock; shifting world ⇒ probe forever. Stakes modulate the *rate*, stationarity picks the *schedule*.
:::

::: quiz Direct utility estimation, TD, and ADP all evaluate one fixed policy from the same 100 episodes. Rank their data efficiency and name what each wastes.
() All three use data identically; choice is cosmetic
(*) ADP (model + solve: every transition informs global dynamics) > TD (per-step bootstraps share structure online) > direct (whole-episode returns, ignores Bellman coupling) — waste hierarchy: model-solving compute vs. single-sample noise vs. discarded neighbor constraints
() Direct estimation is most efficient; models only add overhead
() TD cannot use episodic data at all
::: explanation
Information reuse ranks them: ADP squeezes transition statistics into a solved model (most per-sample mileage, most compute); TD bootstraps neighbor structure per step (middle); direct averaging treats episodes as independent anecdotes (least mileage, least machinery). Same 100 episodes, three information diets — pick by compute budget and model trust.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (U-vs-Q and on-vs-off-policy lead); single update arithmetic.
* **7 Marks:** Multi-estimator comparisons on one world, exploration-schedule prescriptions, or off-policy soundness arguments.
:::

### Essay Question 1 (7 Marks)
**Q: On M4's two-state world (current U(A) = 5, truth ≈ 3.57), apply one value-iteration backup, one TD update (r = 1 → B, α = 0.5), and one direct-estimate step (episode return 1). Compare the three landings and explain what each reveals about its method.**

**Model Answer:** VI: $1 + 0.9(4) = 4.6$ (model-exact contraction downward). TD: $4.6 + 0.5(1 - 4.6) = 2.8$ (sample overshoots below truth — noise, not failure). Direct: running average $= 1.0$ (single-trajectory hostage). All converge with infinite experience (VI deterministically, TD with decaying $\alpha$ + visitation, direct by LLN); first-step addresses differ because models contract, samples bounce, and episodes anecdotalize — three philosophies, one fixed point.

### Essay Question 2 (7 Marks)
**Q: "Q-learning learns optimal values while behaving randomly." Justify rigorously, contrast SARSA, and state the exact convergence conditions.**

**Model Answer:** Target $r + \gamma\max_{a'}Q(s',a')$ estimates Bellman-optimality backup independent of behavior policy — visits supply *coverage*, max supplies *optimality* (Scenario-2 trace exhibits it). SARSA backs up the *taken* $a'$ (on-policy: learns behavior's value, optimal only as exploration vanishes). Conditions: infinite $(s,a)$ visitation + decaying $\alpha$ (stochastic approximation) + bounded rewards; GLIE additionally converts value convergence into behavior convergence. Randomness feeds, max aims — the division of labor that defines off-policy learning.
