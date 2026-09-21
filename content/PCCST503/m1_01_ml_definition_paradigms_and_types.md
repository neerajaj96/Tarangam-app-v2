---
id: m1_01_ml_definition_paradigms_and_types
courseCode: PCCST503
module: 1
sequence: 1
title: 'Machine Learning: Definition, Paradigms & Problem Types'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State Mitchell's definition with task, experience and performance in plain words first
  - Distinguish supervised, unsupervised and reinforcement paradigms in the wild
  - Separate regression from classification with the universal workflow
  - Name T, E, P explicitly for any new problem before choosing a paradigm
concepts:
  - Mitchell's definition
  - learning paradigms
  - universal workflow
prerequisites: []
examRelevance: medium
tags:
  - foundations
  - paradigms
---
# Machine Learning: Definition, Paradigms & Problem Types

**What problem Machine Learning (ML) solves, what data each paradigm needs, what goal each pursues, and how to recognise supervised, unsupervised, and Reinforcement Learning (RL) in the wild.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Suppose your college wants to decide loan approvals. The old way is hand-written rules: "if credit score is above 700 and income is above 50,000, approve." That is traditional programming: humans write the rule, the computer follows it.

The problem ML solves is different: nobody knows the correct rule, or the rule is too tangled to write. What you do have is past experience: thousands of old applications plus what happened (repaid or defaulted). The goal is a function that maps a new application to a good decision, learned from that experience rather than dictated.

Tiny beginner example with toy numbers. Past data:

- Applicant A: score 750, income 60,000, repaid.
- Applicant B: score 580, income 25,000, defaulted.
- Applicant C: score 700, income 55,000, repaid.

A new applicant D arrives with score 720 and income 58,000. ML says: learn a mapping from the first three rows so D is classified with the repaid group. No one wrote "720 means approve." The mapping earned that from data.

Analogy as support, then dropped. Think of recipes versus taste buds: traditional code is a recipe card; ML develops taste from many past meals. From here on we use exact terms only: task, experience, performance, labels, rewards.

Abbreviations defined on first use: Machine Learning (ML), Reinforcement Learning (RL). Symbols are defined in the next section before they are used.

| Question to ask | If the answer is yes | Paradigm |
|---|---|---|
| Does each training example show the correct answer? | Yes, input-output pairs | Supervised learning |
| Is there only raw input with no answers? | Yes, find groups or structure | Unsupervised learning |
| Is there only a score for a whole sequence of actions? | Yes, no per-step answers | Reinforcement learning |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

We now fix meaning, then variables, then intuition, then formula — the mathematics-heavy order.

**Problem.** Given past observations, produce decisions on future observations that score well.

**Data (also called state in RL contexts).** Supervised data are pairs $(x, y)$. Here $x$ means the input features (for example, score and income), and $y$ means the label, the correct answer shown during training (for example, approve or deny). Unsupervised data are bare $x$ values with no $y$. RL data are episodes: a sequence of states, actions, and finally a reward number.

**Goal.** Improve a Performance measure $P$ on a Task $T$ using Experience $E$. Mitchell's definition, symbol by symbol:

- $T$ is the task: the job to do (classify loan applications).
- $E$ is the experience: what data counts as practice (10,000 past labelled applications).
- $P$ is the performance measure: the grading ruler on future data (accuracy on held-out applicants the system has never seen).
- Learning means $P$ on $T$ goes up as $E$ grows. If the ruler never moves, no learning happened, whatever the training curve claims.

**Method preview.** Choose the paradigm from the feedback type, then choose regression versus classification inside supervised learning, then follow the universal workflow.

::: callout-intuition Core Mental Model: Recipes vs. Taste Buds
Traditional programming hands the computer a **recipe** (explicit rules: "if credit score > 700 and income > 50k, approve"). **Machine learning** hands it a **kitchen full of past meals and verdicts** (data + outcomes) and asks it to develop *taste* — a function mapping new situations to good decisions, without anyone writing the rule down. Mitchell's formalization: a program **learns** from experience $E$ on task $T$ with performance measure $P$ if its performance on $T$, measured by $P$, **improves with $E$**. Learning = measurable improvement with experience, full stop.
:::

::: manim assets/videos/m1_paradigms.mp4 Paradigms of Machine Learning
Watch how the same dataset splits three ways: labeled pairs flowing into a supervised predictor, raw points clumping into unsupervised clusters, and an agent bouncing against reward signals in reinforcement learning.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical Machine Learning (ML) order for this note: problem (decide without known rules) → data (pairs, bare inputs, or rewards) → goal (higher $P$ on $T$ with $E$) → method (pick paradigm) → mathematical model (function $f$) → training and search procedure (fit and validate) → example → limitations.

### 3.1 The Three Paradigms

- **Supervised learning:** training data are $(x, y)$ pairs with **labels**. Learn a function $f$ that maps each input space element $X$ to output space $Y$, written $f: X \to Y$, that minimises expected loss on future pairs. Split by output kind in Section 3.2.
- **Unsupervised learning:** training data are bare $x$ values. Find **structure**: clusters (k-means), densities, low-dimensional manifolds (Principal Component Analysis (PCA)), associations. There is no per-example right answer to copy.
- **Reinforcement learning:** training signal is **rewards** for action sequences (no correct answers shown). Learn a **policy**, a rule mapping states to actions, that maximises long-term return. The Artificial Intelligence (AI) module's Markov Decision Process (MDP) machinery reappears here with function approximation.

### 3.2 Regression versus Classification (Inside Supervised Learning)

- **Regression:** output $Y$ is continuous (prices, temperatures). Loss is usually squared error; success means closeness.
- **Classification:** output $Y$ is discrete labels (spam or ham, digit 0 to 9). Loss is zero-one loss or cross-entropy; success means the correct bucket.

Same machinery family, different output geometry. Module 1 emphasises regression models; Module 2 builds classifiers.

### 3.3 The Universal Workflow (Every Later Topic Follows It)

**Data → model class (hypotheses) → loss plus training (fit parameters) → evaluation on unseen data (generalisation).** Memorise this spine: each coming topic fills one slot (this module: linear models plus least squares plus optimisation; next modules: classifiers, margins, trees, networks, ensembles).

| Similar pair | Distinction that earns marks |
|---|---|
| Supervised labels vs. RL rewards | Labels say "the right answer was 7" per example; rewards say "+10 for that whole episode" with no per-step key |
| Regression vs. classification | Continuous $Y$ judged by closeness vs. discrete $Y$ judged by correct bucket; different losses |
| Training error vs. generalisation | Training error measures memory; held-out error measures learning; only the second certifies $P$ |

::: callout-formula KTU Formula Vault: Paradigm Facts
Mitchell: **performance on T by P improves with E** · supervised = **labeled pairs** (regression: continuous Y; classification: discrete Y) · unsupervised = **bare X, find structure** · RL = **rewards, learn policy** · workflow: **data → model → loss/train → generalize**.
:::

::: callout-pitfall Labels vs. Rewards (the Standard Mix-Up)
Supervised labels say *"the right answer was 7"* per example; RL rewards say *"+10 for that whole episode"* with no per-step key. An option describing per-example correct outputs as "reinforcement" (or episode scores as "supervision") is always wrong — feedback *granularity* is the discriminator.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Classify three applicant decisions as ML paradigms and task types: (a) historical loan records with approve or deny labels, predict new applicants; (b) group 10,000 unlabeled customers for marketing; (c) teach a warehouse robot to fetch bins with +1 per delivery and −1 per collision.
:::

::: step [Step 2: Execution] Identifying Each
(a) Labeled pairs plus discrete verdicts give **supervised classification**. Here $T$ means decide applications, $E$ means historical records, $P$ means accuracy on held-out applicants. (b) No labels, seek groups, gives **unsupervised clustering**; $P$ means cluster coherence or silhouette on unseen customers. (c) No correct moves shown, only episode scores, gives **reinforcement learning**; $P$ means expected return per shift.
:::

::: step [Step 3: Conclusion] Final Result
Same ritual every time: name $T$, $E$, $P$ explicitly, then read the paradigm off the feedback type (labels, nothing, or rewards). Students who skip the $T$-$E$-$P$ sentence invariably misclassify borderline cases (recommender logs, bandit ads) — write it first, decide second.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Calling episode scores "supervision." Granularity decides, not the word score.
- Calling clustering "classification." Without labels there is nothing to classify; there is only structure to find.
- Writing $T$ and $E$ but forgetting $P$. Without $P$, learning is unmeasurable and the definition is incomplete.
- Judging a model on its training data. $P$ must be measured on unseen data.

Limitations: the paradigm label alone does not pick an algorithm, a loss, or a validation scheme. Recommender logs and contextual bandits mix labels and rewards and need a one-sentence $T$-$E$-$P$ justification rather than a slogan.

Concise exam-oriented recap: Mitchell equals measurable improvement of $P$ on $T$ with $E$; supervised equals labelled pairs (continuous $Y$ is regression, discrete $Y$ is classification); unsupervised equals bare $X$ seeking structure; RL equals rewards seeking a policy; every topic follows data, model, loss and training, then generalisation.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Which situation is reinforcement learning, and what makes it NOT supervised learning?
() Predicting house prices from labeled sales records
(*) Training a game agent from win/loss scores only — no correct move is ever shown per position, so there are no (x, y) pairs to supervise with
() Grouping news articles into topics without labels
() Fitting a line through measured points
::: explanation
Supervision needs per-example right answers; RL gets only episode-level scores. A game agent sees *outcomes*, never *correct moves* — the feedback-granularity gap that defines the paradigm boundary.
:::

::: quiz State Mitchell's definition using T, E, P for spam filtering, and explain why each letter matters.
() T = delete all email, E = user complaints, P = inbox size
(*) T = classify messages, E = labeled spam/ham corpus, P = accuracy on future mail — T fixes the job, E the fuel, P the grading ruler; without P, "learning" is unmeasurable
() T, E, P are just decorative formalities
() Mitchell's definition applies only to neural networks
::: explanation
$T$ scopes the task, $E$ names what experience counts, $P$ makes improvement *falsifiable* — a filter whose held-out accuracy never rises hasn't learned, whatever its training loss claims. Measurable improvement *is* the definition.
:::

::: quiz A dataset has inputs but no labels, and the goal is to find customer segments. A student proposes logistic regression. What is wrong?
() Nothing — logistic regression handles unlabeled data natively
(*) Logistic regression is supervised (needs labels); unlabeled segmentation is clustering (k-means territory) — wrong paradigm, not just wrong algorithm
() Customer data can never be clustered for privacy reasons
() Regression always beats clustering on marketing data
::: explanation
No labels ⇒ no supervised loss to optimize — logistic regression has literally nothing to fit. Paradigm first (unsupervised → clustering), algorithm second. The error is categorical, one level above hyperparameter taste.
:::
