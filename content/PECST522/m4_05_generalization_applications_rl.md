# Generalization & Applications of RL

**From table lookup to function approximation — one linear-TD update traced, then where RL actually ships: games, robots, and beyond.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Memorized Answers vs Learned Instinct
Tabular RL **memorizes answers** per state (M4.2–M4.3's tables) — perfect for gridworlds, useless for driving (states never repeat). **Function approximation** learns **instinct**: a compact $\hat{U}(s; \theta)$ that generalizes to unseen states from shared features. Instinct errs where tables are exact, but tables are silent where instinct speaks — and the real world never repeats itself.
:::

Generalization is the syllabus capstone of M4: everything before it assumed enumerable states; this topic removes the assumption, and the applications below show why it had to go.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Linear approximation and TD update

$\hat{U}(s) = \theta^T f(s)$ with hand- or network-built features $f$. TD(0) with approximation: $\delta = r + \gamma\hat{U}(s') - \hat{U}(s)$, then $\theta \leftarrow \theta + \alpha\,\delta\,\nabla_\theta\hat{U}(s)$ ($= \alpha\delta f(s)$ in the linear case). Honest warning: off-policy + bootstrapping + approximation (the **deadly triad**) can diverge — DQN's frozen targets and replay exist to tame exactly this.

### 2.2 Where RL ships

Game playing (TD-Gammon, AlphaGo's policy/value nets — minimax's M2.8 heir with learned evaluation), robotics and apprenticeship driving (M4.4's inverse RL: reward from demos, then optimize), resource scheduling, and recommendation (episodes are sessions, reward is engagement). Common thread: sequential decisions with delayed consequences, where supervision's per-step answers don't exist.

::: callout-formula KTU Formula Vault: Approximation
$\hat{U} = \theta^T f$ · $\delta = r + \gamma\hat{U}' - \hat{U}$ · $\theta += \alpha\delta f$ · deadly triad (off-policy + bootstrap + approx) can diverge · games/robots/scheduling ship it.
:::

Approximation trades guarantees for reach: linear-TD converges near the best representable values on-policy; nonlinear nets (deep RL) buy reach and sell certainties — state which side of the trade each exam answer stands on.

::: callout-exam KTU Exam Focus
9-markers pair one traced approximator update (features, $\delta$, $\theta$-step, new estimate) with an applications triad (one game, one robot, one scheduler/recommender), each justified by delayed reward. Examiners credit the deadly-triad caveat as analysis depth.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Linear approximator with $f(s) = [1, 2]$, $\theta = [0.5, 0.5]$. Transition: reward $r = 1$, $\gamma = 0.9$, next estimate $\hat{U}(s') = 2.0$, rate $\alpha = 0.1$. Compute $\delta$, update $\theta$, and confirm the new estimate moved toward the TD target.
:::

::: step [Step 2: Execution] Instinct Adjusted
Current $\hat{U}(s) = 0.5(1) + 0.5(2) = 1.5$. TD target $= 1 + 0.9(2.0) = 2.8$. Error $\delta = 2.8 - 1.5 = 1.3$. Update: $\theta \leftarrow [0.5, 0.5] + 0.1(1.3)[1, 2] = [0.5 + 0.13, 0.5 + 0.26] = [0.63, 0.76]$. New estimate $= 0.63(1) + 0.76(2) = 0.63 + 1.52 = 2.15$ — up from $1.5$ toward $2.8$ without overshooting.
:::

::: step [Step 3: Conclusion] Final Result
$\theta = [0.63, 0.76]$, estimate $1.5 \to 2.15$ against target $2.8$. Partial step (not a jump to $2.8$) is the discipline: $\alpha$ rations the correction across many visits, and the feature vector $[1,2]$ steered *both* weights proportionally — generalization's machinery in one line.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Update Arithmetic
$f = [2, 0]$, $\theta = [1.0, 5.0]$, $\delta = -2$, $\alpha = 0.5$. New $\theta$?
(A) $[0.0, 3.0]$, both move
(*B) $[1.0 - 2.0, 5.0] = [-1.0, 5.0]$ — the dead feature ($0$) shields its weight entirely; only live features learn, which is why feature design is policy design
(C) $[0.0, 5.0]$ mirrored
(D) $[1.0, 4.0]$, second moves instead
::: explanation
$\theta \leftarrow \theta + 0.5(-2)[2,0] = [1-2, 5+0]$. Zero-valued features carry zero gradient — silent features freeze weights, so representation choices gate all learning downstream.
:::

::: quiz Q2: Triad Danger
Off-policy Q-learning + bootstrapping + neural net approximator diverges on a task tabular Q-learning solved. Explanation?
(A) Learning rate too small
(*B) The deadly triad — each leg is safe in pairs but the triple can diverge, so stabilize with frozen targets, replay, or on-policy data before blaming the environment
(C) Neural nets cannot do RL
(D) More exploration always fixes it
::: explanation
Instability is structural, not hyperparameter bad luck: bootstrapped targets shift under the approximator while off-policy data skews updates. DQN's machinery (target nets, replay) exists precisely as triad scaffolding.
:::

::: quiz Q3: Application Sorting
Chess engine, ad recommender, thermostat PID. Which genuinely needs RL?
(A) All three equally
(*B) Chess (delayed win/loss, sequential moves) and recommender (session-long engagement from slate sequences) fit; the thermostat's instant error signal is classical control's home turf, not RL's
(C) Thermostat only
(D) None need RL
::: explanation
RL's jurisdiction is delayed consequences without per-step answers: mate in $40$ moves, purchases after $20$ impressions. Instant, dense error signals belong to supervision or control — matching problem shape to paradigm is the M1.1 instinct, applied.
:::
