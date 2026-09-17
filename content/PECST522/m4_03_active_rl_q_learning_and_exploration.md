# Active RL: Q-Learning & Exploration

**Action-values, the off-policy Q-update, exploration vs. exploitation, ε-greedy, and GLIE schedules that provably converge.**

<a id="the-intuition"></a>
## 1. The Explorer's Dilemma

::: callout-intuition Core Mental Model: The New Town Foodie
You move to a new town. **Exploit**: eat every meal at the first decent café — guaranteed okay dinners, possibly missing the legendary place two streets over. **Explore**: try random doors — most mediocre, one life-changing. The dilemma is *temporal*: exploration pays in *information* (future meals), exploitation pays in *reward* (tonight). Active RL is this dilemma formalized: the agent must deliberately take actions it currently believes are *suboptimal*, because beliefs without evidence are just prejudices.
:::

---

<a id="the-dimensions"></a>
## 2. Q-Values and the Off-Policy Update

Passive methods learn state values $U^\pi$ — useless for *choosing* without a model (which action leads where?). **Action-values** $Q(s,a)$ grade *state–action pairs* directly, so the greedy policy $\arg\max_a Q(s,a)$ needs no transition model at all.

**Q-learning** (model-free, **off-policy**): after $(s,a) \xrightarrow{r} s'$,
$$Q(s,a) \leftarrow Q(s,a) + \alpha\,[\,r + \gamma \max_{a'} Q(s',a') - Q(s,a)\,]$$
The $\max$ is the magic: the update targets the *optimal* continuation regardless of which (possibly exploratory) action was actually taken — so Q-learning converges to $Q^*$ even while behaving randomly. (SARSA, its on-policy sibling, backs up the *actually taken* $a'$ instead — safer during learning, optimal only in the limit of vanishing exploration.)

::: callout-formula Formal Core: Q-Update Anatomy
Target $= r + \gamma \max_{a'} Q(s',a')$ (best imaginable future) · error $=$ target $-$ current · step $\alpha$ toward it. Off-policy because the $\max$ detaches the *learned* value from the *behavior* policy. Converges to $Q^*$ under infinite state-action visitation + decaying $\alpha$.
:::

---

<a id="terminology"></a>
## 3. Exploration Schedules: ε-Greedy and GLIE

* **ε-greedy:** with probability $\epsilon$ act randomly, else greedily. Fixed $\epsilon$ explores forever (never fully exploits) — fine for non-stationary worlds, suboptimal asymptotically.
* **GLIE** (Greedy in the Limit of Infinite Exploration): $\epsilon_t \to 0$ (e.g. $\epsilon = 1/t$) while every $(s,a)$ is still tried infinitely often. Early chaos, eventual purity — Q-learning + GLIE + decaying $\alpha$ converges to optimal *behavior*, not just optimal values.

```text
regret
^
| * .                                     ε-greedy (fixed ε):
| *  .  *                                linear regret forever
| *    .   *
| *-----------*----*----*----*----> time   (keeps paying exploration tax)
|
| *                                           GLIE (ε = 1/t):
| * *                                     regret flattens — exploration
| *   *  *  *  *  *  *  *> time            tax decays to zero
```

::: callout-pitfall Exploration Is Not Noise for Its Own Sake
Random actions are *experiments with a purpose*: each untried $(s,a)$ hides a value estimate with infinite uncertainty. Undirected thrashing (pure random forever) learns values but never *uses* them; pure greedy never *corrects* them. Schedules like GLIE exist because both extremes fail — the exam rewards answers that price exploration in *information*, not motion.
:::

---

<a id="worked-example"></a>
## 4. One Q-Update by Hand

$Q(A,\text{left}) = 2.0$; from $A$ the agent takes $\text{left}$, gets $r = 0$, lands in $B$ where $Q(B,\text{left}) = 1.0$, $Q(B,\text{right}) = 4.0$. $\alpha = 0.5$, $\gamma = 0.9$.

Target: $0 + 0.9 \times \max(1.0, 4.0) = 3.6$. Error: $3.6 - 2.0 = 1.6$. Update: $Q(A,\text{left}) \leftarrow 2.0 + 0.5 \times 1.6 = 2.8$. Note what did *not* matter: which action the agent takes *next* in $B$ — even if it explores with $\text{left}$, the update aims at the *best* continuation ($\text{right}$). Off-policy in one line.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What makes Q-learning off-policy, and why does that matter for exploration?
() It ignores rewards entirely and follows a fixed script
(*) Its update targets maxₐ′ Q(s′,a′) — the optimal continuation — regardless of the (possibly random) action actually taken, so it can learn optimal values while exploring freely
() It requires a perfect transition model before acting
() Off-policy means it never updates Q-values at all
::: explanation
On-policy methods (SARSA) learn the value *of the behavior being executed*, exploration warts included; Q-learning's $\max$ decouples learning target from behavior, so wild exploration never corrupts the optimal-value estimates. Freedom to explore + safety of estimates = the algorithm's whole appeal.
:::

::: quiz A fixed ε = 0.1 greedy agent runs forever in a stationary world. What is true asymptotically?
() It converges to exactly optimal behavior with zero regret
(*) It keeps taking random actions 10% of the time forever, paying permanent linear regret — GLIE-style decaying ε is needed to close the gap
() It stops exploring after exactly 10 episodes
() ε-greedy is only defined for bandits, never MDPs
::: explanation
Fixed $\epsilon$ never retires exploration: 1-in-10 actions stay random to the end of time, each costing expected regret. GLIE ($\epsilon_t \to 0$ with infinite visitation) spends the exploration budget early and banks optimal behavior late.
:::

::: quiz Why do active methods need action-values Q(s,a) rather than the state-values U(s) that passive methods learn?
() Q-values use less memory than state values
(*) Acting greedily on U(s) requires predicting which action leads to the best successor — impossible without a transition model; Q(s,a) grades actions directly, so argmax needs no model
() State values cannot represent stochastic policies
() Q-learning was invented before state values existed
::: explanation
$\pi(s) = \arg\max_a \sum_{s'} P(s'|s,a)U(s')$ needs $P$ — the model passive evaluation never learned. $Q^*(s,a)$ already *contains* the consequence knowledge, so $\arg\max_a Q^*$ acts optimally model-free. That single representational shift is what makes model-free control possible.
:::

---

<a id="exam-focus"></a>
## 6. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Q-learning update rule, ε-greedy, or GLIE conditions.
* **7 Marks:** Off-policy vs on-policy (Q-learning vs SARSA), or exploration-exploitation with regret reasoning.
:::

### Sample 3-Mark Question
**Q: State the Q-learning update and the two conditions for convergence to Q*.**

**Model Answer:** $Q(s,a) \leftarrow Q(s,a) + \alpha\,[r + \gamma \max_{a'} Q(s',a') - Q(s,a)]$. Converges under (1) infinite visitation of every $(s,a)$ pair and (2) decaying $\alpha$ (stochastic-approximation conditions) — plus GLIE exploration if optimal *behavior* (not just values) is required.

### Sample 7-Mark Question
**Q: "Exploration and exploitation conflict fundamentally." Discuss with ε-greedy and GLIE, and explain how Q-learning's off-policy nature softens the conflict.**

**Model Answer:** Exploitation banks known rewards; exploration buys information at immediate cost — finite experience cannot maximize both simultaneously (regret formalism, §3 sketch). Fixed-$\epsilon$ pays linear regret forever; GLIE decays exploration while preserving infinite visitation, converging to optimal behavior. Q-learning softens the dilemma (not removes it): because updates target $\max_{a'}$, exploratory actions still teach optimal values — the agent can *behave* foolishly while *learning* wisely, which on-policy SARSA cannot do.
