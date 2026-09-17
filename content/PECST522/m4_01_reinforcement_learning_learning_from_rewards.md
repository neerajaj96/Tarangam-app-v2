# Reinforcement Learning: MDPs & Learning from Rewards

**Markov decision processes, transition models, discounted rewards, Bellman equations, and the passive-vs-active learning split that organizes this module.**

<a id="the-intuition"></a>
## 1. Rewards Instead of Rules

::: callout-intuition Core Mental Model: Training a Puppy
Nobody hands a puppy a rulebook ("Rule 47b: sit precisely 3 cm left of the mat"). You *reward* sits (+treat) and *punish* chewing (−scold), and the puppy figures out the policy itself. **Reinforcement learning** is exactly this bargain: no teacher provides correct actions (unlike supervised learning) and no transition manual is guaranteed (unlike classical search) — just a **reward signal** from the environment, and an agent that must discover, by trial and error, the behavior maximizing long-term reward.
:::

Supervised learning says *"do this here"*; RL says *"that earned +10 — do more of whatever led there."* Credit assignment across time is the entire difficulty: which of the 40 moves before the goal actually mattered?

---

<a id="the-dimensions"></a>
## 2. Markov Decision Processes: The Formal Arena

An **MDP** is a 5-tuple $(S, A, T, R, \gamma)$:

* **States** $S$ (fully observable — for partial observability see POMDPs, beyond syllabus), **actions** $A(s)$ legal per state.
* **Transition model** $T = P(s' \mid s, a)$: the *Markov* assumption — the next state depends only on the *current* state and action, never the path taken (the future is conditionally independent of the past given the present).
* **Reward** $R(s)$ (sometimes $R(s,a,s')$): immediate numeric feedback on entering states.
* **Discount** $0 \le \gamma < 1$: future rewards shrink geometrically — guarantees finite total utility over infinite horizons and encodes "a treat now beats a treat tomorrow."

**Utility of a state history:** $U([s_0, s_1, \dots]) = \sum_{t=0}^{\infty} \gamma^t R(s_t)$. **Optimal policy** $\pi^*$: the action choice maximizing *expected* utility from each state.

::: callout-formula Formal Core: The Bellman Equation
$$U(s) = R(s) + \gamma \max_a \sum_{s'} P(s' \mid s, a)\; U(s')$$
Read it as: *the value of here = the reward of here + discounted best-expected value of next.* Every planning and learning algorithm in this module is either solving, sampling, or approximating this one equation. Value iteration repeatedly applies it as an update until utilities stop changing; policy iteration alternates evaluation with greedy improvement.
:::

---

<a id="terminology"></a>
## 3. Passive vs. Active: The Module Map

* **Passive RL** (topics 2): the agent executes a *fixed* policy $\pi$ and learns *how good it is* — estimating $U^\pi(s)$ from experience (direct utility estimation, ADP, TD). No exploration dilemma: the policy never changes.
* **Active RL** (topic 3): the agent must learn the *optimal* policy itself — balancing **exploration** (trying unknown actions to learn) against **exploitation** (milking the best-known action). Explore forever and rewards never accumulate; exploit immediately and a better action stays undiscovered forever.
* **Beyond value functions** (topic 4): searching policy space directly (policy search) and flipping the problem — inferring the *reward* from observed experts (inverse RL).

::: callout-pitfall Discount < 1 Is Load-Bearing, Not Cosmetic
With $\gamma = 1$ and an infinite horizon, utilities can diverge to infinity and "optimal" becomes undefined (every policy earns ∞). Discounting (or finite horizons, or absorbing goal states with zero onward reward) is what makes the mathematics well-posed. Any derivation assuming infinite undiscounted sums without absorbing states is broken at the foundation.
:::

---

<a id="worked-example"></a>
## 4. One Bellman Backup by Hand

Tiny world: states $\{A, B\}$, one action, $R(A) = 1$, $R(B) = 0$, $\gamma = 0.9$. From $A$: 80% stay in $A$, 20% move to $B$. From $B$: 100% stay in $B$ (absorbing). Current estimates: $U(A) = 5$, $U(B) = 0$. Apply one Bellman backup to $A$:

$$U_{new}(A) = R(A) + \gamma\,[\,0.8 \cdot U(A) + 0.2 \cdot U(B)\,] = 1 + 0.9 \times (0.8 \times 5 + 0) = 1 + 0.9 \times 4 = 4.6$$

The estimate *falls* 5 → 4.6: the old guess overshot what the rewards + dynamics justify, and the backup corrects toward consistency. True utilities satisfy $U(A) = 1 + 0.72\,U(A)$, i.e. $U^*(A) = 1/0.28 \approx 3.57$ — repeated backups converge there from any start.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What does the Markov assumption buy the agent, and what does it forbid using?
() It guarantees the environment is deterministic
(*) The next state depends only on the current state and action — the agent may ignore the entire path history without losing predictive power
() It forbids the agent from ever revisiting a state
() It guarantees rewards arrive immediately, never delayed
::: explanation
Markov = conditional independence of future from history given the present. Policies, utilities, and Bellman backups all condition on $s$ alone *because* the past adds nothing. Delayed rewards (the credit-assignment problem) remain fully in play — Markov simplifies *dynamics*, not *payoffs*.
:::

::: quiz Why must the discount factor satisfy γ < 1 in infinite-horizon problems?
() To make the agent prefer risky actions
(*) Otherwise total utilities can diverge to infinity and no policy is strictly better than another — the optimization is ill-posed
() Discounting speeds up the processor running the agent
() γ < 1 is required only for deterministic environments
::: explanation
$\sum \gamma^t R$ converges for $\gamma<1$ (geometric series); with $\gamma=1$ over infinite horizons, totals blow up and "maximize utility" stops meaning anything. Finite horizons or absorbing zero-reward states are the only alternatives that restore well-posedness.
:::

::: quiz An agent follows a fixed policy and only estimates how good that policy is, never trying to improve it. Passive or active learning, and what's missing?
() Active — it is already optimal by definition
(*) Passive — policy evaluation without policy improvement; exploration and Q-values for untried actions are entirely absent
() Neither — this describes supervised learning
() Passive — but it must still use ε-greedy exploration
::: explanation
Passive RL = "grade this fixed behavior" (direct utility, ADP, TD next topic). Improvement machinery — exploration, action-values, greedy updates — belongs to active learning. A fixed policy needs no exploration at all, which is exactly what makes passive methods the clean pedagogical first step.
:::

---

<a id="exam-focus"></a>
## 6. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** MDP 5-tuple, Bellman equation, or passive-vs-active distinction.
* **7 Marks:** Bellman backup numericals, or why discounting is necessary.
:::

### Sample 3-Mark Question
**Q: Define an MDP and state the Bellman optimality equation.**

**Model Answer:** MDP $= (S, A, T, R, \gamma)$: states, actions, transition probabilities $P(s'|s,a)$, rewards, discount. Bellman: $U(s) = R(s) + \gamma \max_a \sum_{s'} P(s'|s,a)\,U(s')$ — value equals immediate reward plus discounted best-expected continuation.

### Sample 7-Mark Question
**Q: Using the world of §4, compute two Bellman backups from U(A)=5 and show convergence direction toward the true value.**

**Model Answer:** Backup 1: $1 + 0.9(0.8\cdot5) = 4.6$ (as shown). Backup 2: $1 + 0.9(0.8\cdot4.6) = 1 + 3.312 = 4.312$. True value $U^* = 1/(1-0.72) \approx 3.57$; estimates 5 → 4.6 → 4.312 descend toward it — value iteration as contraction, each backup shrinking the error.
