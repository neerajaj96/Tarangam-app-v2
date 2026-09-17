# Policy Search & Inverse Reinforcement Learning

**Skipping value functions: parameterized policies, hill-climbing in policy space, and flipping the problem — inferring rewards from expert behavior.**

<a id="the-intuition"></a>
## 1. Beyond Value Functions

::: callout-intuition Core Mental Model: Choreography vs. Physics
Value methods learn the *physics* of the world (how good every situation is) and derive behavior from it. **Policy search** skips physics and choreographs directly: parametrize the *dance* ($\pi_\theta$ — e.g. a neural net mapping sensors to motor torques), perform it, measure applause (total reward), and adjust the choreography toward what earned applause. For a robot with continuous joints, grading every (state, torque-vector) pair is hopeless — but tweaking dance parameters by feel works beautifully.
:::

---

<a id="the-dimensions"></a>
## 2. Policy Search: Hill-Climbing on Expected Reward

Parametrize the policy by $\theta$ (weights, thresholds, trajectory splines). Define $J(\theta) = \mathbb{E}[\text{total reward following } \pi_\theta]$. Then **optimize directly**:

* **Finite differences / hill climbing:** jiggle $\theta$, keep jiggles that score higher. Simple, gradient-free — and sample-hungry.
* **Policy gradients (REINFORCE idea):** $\nabla_\theta J \approx$ average over trials of $(\text{return}) \times \nabla_\theta \log \pi_\theta(\text{actions taken})$ — actions from high-return trials get reinforced *in proportion to their surprise-weighted contribution*. Follows the gradient uphill, trial by trial.

Strengths: handles **continuous, high-dimensional actions** (robotics, games) where $\max_a Q(s,a)$ is intractable; learns **stochastic policies** naturally (essential for partially observable and adversarial settings). Weaknesses: high-variance gradients, local optima, and sample hunger — the price of ignoring value structure.

::: callout-formula Formal Core: The Two Paradigms
Value-based: learn $Q^*$, act $\arg\max_a Q^*$ (needs discrete/small actions). Policy-based: learn $\theta^* = \arg\max_\theta J(\theta)$ via $\nabla J$ estimates (handles continuous/stochastic). Actor-critic hybrids learn both — the actor dances, the critic (a TD value function) applauds precisely, cutting gradient variance.
:::

---

<a id="terminology"></a>
## 3. Inverse RL: Rewards from Experts

**Forward RL:** reward given → learn behavior. **Inverse RL:** behavior (expert demonstrations) given → learn the *reward function* the expert seems to optimize. Why invert? Rewards transfer: the *learned reward* ("stay on road, avoid pedestrians") ports to new cars, cities, and bodies — a copied steering policy does not.

The catch — **reward ambiguity**: infinitely many rewards rationalize any behavior, including the degenerate all-zero reward (under which *everything* is optimal). Resolutions: ** apprenticeship/feature matching** (Abbeel & Ng: match the expert's *feature expectations* — average lane-centering, speed profiles — rather than cloning actions, then optimize the matched reward); **maximum-entropy IRL** (among consistent rewards, prefer the one making the expert's behavior look least surprising, i.e. no extra commitments).

::: callout-pitfall Imitation ≠ Inverse RL
**Behavioral cloning** (supervised learning on state→action pairs) copies the expert's *moves* — and compounds errors (one drift off-distribution, no recovery skill). **Inverse RL** recovers the expert's *objective* and re-optimizes — the apprentice that understands *why*, and therefore survives situations the master never demonstrated. Exams test exactly this boundary.
:::

---

<a id="worked-example"></a>
## 4. Apprenticeship on Two Features

Expert taxi demonstrations average features: $\mu_E = (\text{lane-centering } 0.9,\ \text{speed-limit adherence } 0.8)$. Our policy $\pi_0$ (always crawl at half speed, dead center) yields $\mu(\pi_0) = (1.0, 0.4)$.

Apprenticeship loop: find weights $w$ making the expert look optimal (here: reward adherence more than centering, since the expert sacrifices some centering for speed); optimize $w$-rewarded MDP → $\pi_1$ with $\mu(\pi_1) = (0.92, 0.75)$; compare $\|\mu_E - \mu(\pi_1)\|$ vs tolerance. Iterate: each round the reward weights shift to explain the *residual* gap, each policy closes it. Termination ($\|\cdot\| < \epsilon$) certifies performance *near the expert's* under the expert's own (unknown) true reward — the Abbeel–Ng guarantee — without ever writing down what "good driving" means.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz A 7-joint robot arm must learn smooth reaching motions. Why is policy search favored over Q-learning here?
() Q-learning is mathematically incorrect for robots
(*) The action space (7 continuous torques) makes maxₐ Q(s,a) intractable, while a parameterized stochastic policy can be hill-climbed directly on measured returns
() Robots cannot receive numeric rewards at all
() Policy search needs no trials, unlike Q-learning
::: explanation
Q-learning's decision rule is an *optimization over actions* — trivial for 4 grid moves, impossible over $\mathbb{R}^7$ torques every 10 ms. Policy search replaces the intractable $\arg\max$ with direct gradient ascent on policy parameters, and stochastic policies additionally cover sensor limits and adversarial unpredictability.
:::

::: quiz What is the fundamental ill-posedness of inverse RL, and which fix does maximum-entropy IRL apply?
() Experts demonstrate too few actions to fill a table; max-entropy invents extra demonstrations
(*) Infinitely many rewards (including all-zero) rationalize any behavior; max-entropy selects among them the reward under which the expert looks least surprising — no unjustified extra commitments
() Inverse RL cannot represent stochastic experts; max-entropy forces determinism
() There is no ill-posedness; rewards are uniquely determined
::: explanation
Behavior underdetermines objectives: laziness (all-zero reward) "explains" everything and nothing. Max-entropy breaks the tie by the least-commitment principle — matching observed feature statistics while maximizing uncertainty elsewhere — yielding rewards that generalize instead of memorizing.
:::

::: quiz Contrast behavioral cloning with apprenticeship (feature-matching) IRL on a driving task, specifically on unseen situations.
() They are identical methods with different names
(*) Cloning copies state→action mappings and compounds drift errors off-distribution; apprenticeship recovers an objective (feature weights) and re-optimizes, so the apprentice handles novel states the expert never showed
() Cloning generalizes better because it uses deeper networks
() IRL cannot handle unseen situations by definition
::: explanation
Cloning learns *what the master did*; IRL learns *what the master wanted*. Off the demonstration manifold, the cloner has no relevant training pairs and drifts irrecoverably, while the apprentice's recovered reward still scores actions correctly — objectives transfer, trajectories don't.
:::

---

<a id="exam-focus"></a>
## 6. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Policy search idea, IRL definition, or imitation-vs-IRL distinction.
* **7 Marks:** Value-based vs policy-based comparison, or apprenticeship loop with the performance guarantee.
:::

### Sample 3-Mark Question
**Q: Define inverse reinforcement learning and state its core difficulty.**

**Model Answer:** IRL infers the reward function an expert appears to optimize, from demonstrations. Core difficulty: **reward ambiguity** — infinitely many rewards (including degenerate all-zero) are consistent with any behavior; methods like max-entropy or feature matching add principled tie-breaking.

### Sample 7-Mark Question
**Q: Compare value-based and policy-based RL on representation, action spaces, and variance. Where do actor-critic methods fit?**

**Model Answer:** Value-based learns $Q^*$ then $\arg\max_a$ — sample-efficient with structure, but needs tractable action maximization (discrete/small actions) and yields deterministic policies. Policy-based learns $\theta^* = \arg\max J(\theta)$ via gradient estimates — handles continuous/stochastic actions natively, at the cost of high-variance, local-optima-prone search. **Actor-critic** hybrids keep both: a TD critic supplies low-variance value baselines that stabilize the actor's gradient steps — the standard architecture behind modern deep RL successes.
