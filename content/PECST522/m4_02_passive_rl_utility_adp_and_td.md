# Passive RL: Direct Utility, ADP & Temporal Differences

**Grading a fixed policy three ways — naive averaging, model-based dynamic programming, and the model-free TD update that powers modern RL.**

<a id="the-intuition"></a>
## 1. The Critic Who Never Coaches

::: callout-intuition Core Mental Model: The Sports Commentator
A **passive learner** is a commentator, not a coach: it watches a fixed game plan unfold and grades *how good that plan is* — never suggesting better plays. Three commentators differ in method: the **naive averager** replays whole seasons and averages final scores per situation; the **model builder (ADP)** first learns the stadium physics (transition odds), then solves the season on paper; the **TD critic** updates its grade *mid-game*, nudging each situation's score toward the next situation's score plus the points just earned.
:::

---

<a id="the-dimensions"></a>
## 2. Three Estimators, One Target

All three estimate $U^\pi(s)$ — expected discounted return following fixed $\pi$ — from experience trials $(s_0, r_1, s_1, r_2, \dots)$:

* **Direct utility estimation:** for each visit to $s$, record the *rewards-to-go* ($\sum \gamma^t r$ from there on); average over visits. Model-free and dead simple — but it **ignores Bellman constraints** between states (each state's estimate learns in isolation, wasting the fact that neighbors constrain each other), so convergence is slow.
* **Adaptive dynamic programming (ADP):** count transitions to learn $\hat{P}(s'|s,a) = N(s,a,s')/N(s,a)$, learn $\hat{R}$, then *solve* the Bellman equations (value/policy iteration on the learned model). Data-efficient, constraint-respecting — but **model-based**: solving at every step is expensive, and early garbage models give garbage utilities.
* **Temporal-difference (TD) learning:** the sweet spot — **model-free** like direct estimation, **Bellman-respecting** like ADP. After each transition $s \xrightarrow{r} s'$:
$$U(s) \leftarrow U(s) + \alpha\,[\,r + \gamma\,U(s') - U(s)\,]$$
The bracketed **TD error** is the surprise: positive when reality beat the estimate. No model, no waiting for episode end — learn *online*, every step.

::: callout-formula Formal Core: The Three Updates Side by Side
Direct: average full returns per state (ignores neighbors). ADP: learn $\hat{T},\hat{R}$, then iterate $U(s) \leftarrow R(s) + \gamma\sum_{s'}\hat{P}\,U(s')$ to convergence. TD(0): $U(s) \leftarrow U(s) + \alpha\,[r + \gamma U(s') − U(s)]$ — one sample, one backup, zero model. Exam shorthand: *"TD bootstraps (learns a guess from a guess); direct estimation doesn't."*
:::

---

<a id="terminology"></a>
## 3. Bootstrapping, Bias, and Step Sizes

**Bootstrapping** = updating an estimate from *another estimate* (TD uses $U(s')$; ADP uses solved values; direct estimation alone does not bootstrap). Bootstrapping injects **bias** early (wrong neighbors mislead) but slashes **variance** (one transition vs. whole-trajectory noise) — the bias-variance trade that makes TD win in practice. The learning rate $\alpha$ must **decay** ($\sum \alpha = \infty$, $\sum \alpha^2 < \infty$, e.g. $\alpha = 1/t$) so updates settle rather than oscillate forever.

::: callout-pitfall TD Converges to the Truth Only Under Visitation
TD(0) converges to $U^\pi$ *if every state is visited infinitely often* under $\pi$ — a quiet assumption exams probe. A policy that never visits the east wing teaches nothing about it, however perfect the update rule. Coverage of experience, not cleverness of updates, is the binding constraint.
:::

---

<a id="worked-example"></a>
## 4. One TD Update by Hand

Estimates: $U(A) = 4.6$, $U(B) = 0$. Experience: agent in $A$ receives $r = 1$ and lands in $B$. Parameters $\alpha = 0.5$, $\gamma = 0.9$.

TD error: $\delta = r + \gamma U(B) - U(A) = 1 + 0.9 \times 0 - 4.6 = -3.6$ (reality undershot the rosy estimate). Update: $U(A) \leftarrow 4.6 + 0.5 \times (-3.6) = 4.6 - 1.8 = 2.8$. One transition dragged the estimate most of the way from 4.6 toward the true $\approx 3.57$ — overshooting slightly below it (2.8 < 3.57), which later visits with decaying $\alpha$ will sand back up. That single-step correction-per-transition rhythm *is* temporal-difference learning.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What exactly is bootstrapping, and which passive methods do it?
() Using larger neural networks to memorize returns
(*) Updating an estimate from another (possibly wrong) estimate — ADP (solves via learned model) and TD (single-sample backup) bootstrap; direct utility estimation does not
() Sampling only the final reward of each episode
() Copying the teacher's policy verbatim
::: explanation
Bootstrapping = "a guess built on a guess": TD's $U(s')$ and ADP's solved values are themselves estimates. Direct averaging waits for *actual* full returns — unbiased but high-variance and slow. The bias-for-variance trade is why TD dominates practice.
:::

::: quiz Direct utility estimation converges slowly despite being simple and model-free. What structural information does it throw away?
() The reward signal itself
(*) The Bellman constraints coupling neighboring states — each state's average learns in isolation instead of exploiting that U(s) must be consistent with U(s')
() The discount factor γ
() The action labels on transitions
::: explanation
Neighbors' utilities *must* satisfy Bellman relations; direct estimation ignores them, relearning from scratch per state what the equations give for free. ADP and TD both enforce consistency — via a solved model or per-step backups — and converge far faster on the same experience.
:::

::: quiz Why must TD's learning rate α decay over time (e.g. α = 1/t) rather than stay fixed?
() Fixed rates violate the Markov assumption
(*) A fixed α keeps injecting constant-size corrections forever, so estimates oscillate around the truth instead of settling; decaying α satisfies the stochastic-approximation conditions for convergence
() Decaying α makes early learning slower, which is always safer
() α is actually required to increase, not decay
::: explanation
Early: large steps escape bad initial guesses fast. Late: near-truth estimates need whispers, not shoves — $\sum\alpha=\infty$ (keep moving) with $\sum\alpha^2<\infty$ (dwindling step energy) is the classical convergence recipe. Fixed $\alpha$ jitters eternally around $U^\pi$ without landing.
:::

---

<a id="exam-focus"></a>
## 6. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** TD update rule, bootstrapping definition, or the three passive methods named with one line each.
* **7 Marks:** Numerical TD update, or compare direct/ADP/TD on data efficiency and model dependence.
:::

### Sample 3-Mark Question
**Q: State the TD(0) update rule and define the TD error.**

**Model Answer:** $U(s) \leftarrow U(s) + \alpha\,[r + \gamma U(s') - U(s)]$. TD error $\delta = r + \gamma U(s') - U(s)$ = actual one-step return minus current estimate — the surprise signal driving all learning.

### Sample 7-Mark Question
**Q: An agent must evaluate a fixed policy from limited trials in a large stochastic world. Compare direct utility estimation, ADP, and TD learning for this task.**

**Model Answer:** Direct: model-free, unbiased, but ignores Bellman coupling — needs the most trials. ADP: learns $\hat{T},\hat{R}$ then solves — most data-efficient per trial, but model-solving is costly and early models mislead. TD: model-free single-step backups — best practical trade (low variance, online, bootstrapped), converging under infinite visitation with decaying $\alpha$. Recommendation: TD for large stochastic experience streams.
