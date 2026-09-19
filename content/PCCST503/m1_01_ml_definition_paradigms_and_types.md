---
id: m1_01_ml_definition_paradigms_and_types
courseCode: PCCST503
module: 1
sequence: 1
title: 'Machine Learning: Definition, Paradigms & Problem Types'
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - State Mitchell's definition with task, experience and performance
  - Distinguish supervised, unsupervised and reinforcement paradigms in the wild
  - Separate regression from classification with the universal workflow
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

**Mitchell's definition, supervised vs. unsupervised vs. reinforcement learning, regression vs. classification, and how to recognize each in the wild.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Recipes vs. Taste Buds
Traditional programming hands the computer a **recipe** (explicit rules: "if credit score > 700 and income > 50k, approve"). **Machine learning** hands it a **kitchen full of past meals and verdicts** (data + outcomes) and asks it to develop *taste* — a function mapping new situations to good decisions, without anyone writing the rule down. Mitchell's formalization: a program **learns** from experience $E$ on task $T$ with performance measure $P$ if its performance on $T$, measured by $P$, **improves with $E$**. Learning = measurable improvement with experience, full stop.
:::

::: manim assets/videos/m1_paradigms.mp4 Paradigms of Machine Learning
Watch how the same dataset splits three ways: labeled pairs flowing into a supervised predictor, raw points clumping into unsupervised clusters, and an agent bouncing against reward signals in reinforcement learning.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Three Paradigms

* **Supervised learning:** training data = $(x, y)$ pairs with **labels**. Learn $f: X \to Y$ minimizing expected loss. Split by output kind below.
* **Unsupervised learning:** training data = bare $x$'s. Find **structure**: clusters (k-means), densities, low-dimensional manifolds (PCA), associations.
* **Reinforcement learning:** training signal = **rewards** for action sequences (no correct answers shown). Learn a **policy** maximizing long-term return — the AI module's MDP machinery, reused here with function approximation.

### 2.2 Regression vs. Classification (Within Supervised)

* **Regression:** $Y$ continuous (prices, temperatures) — loss is usually squared error; success = closeness.
* **Classification:** $Y$ discrete labels (spam/ham, digit 0–9) — loss is 0/1 or cross-entropy; success = correct bucket. (Same machinery, different output geometry — Modules 1 and 2 respectively.)

### 2.3 The Universal Workflow (every ML topic follows it)

**Data → model class (hypotheses) → loss + training (fit parameters) → evaluation on unseen data (generalization).** Memorize this spine: each coming topic fills one slot (this module: linear models + least squares + optimization; next modules: classifiers, margins, trees, networks, ensembles).

::: callout-formula KTU Formula Vault: Paradigm Facts
Mitchell: **performance on T by P improves with E** · supervised = **labeled pairs** (regression: continuous Y; classification: discrete Y) · unsupervised = **bare X, find structure** · RL = **rewards, learn policy** · workflow: **data → model → loss/train → generalize**.
:::

::: callout-pitfall Labels vs. Rewards (the Standard Mix-Up)
Supervised labels say *"the right answer was 7"* per example; RL rewards say *"+10 for that whole episode"* with no per-step key. An option describing per-example correct outputs as "reinforcement" (or episode scores as "supervision") is always wrong — feedback *granularity* is the discriminator.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Classify three applicant decisions asML paradigms/tasks: (a) historical loan records with approve/deny labels → predict new applicants; (b) group 10,000 unlabeled customers for marketing; (c) teach a warehouse robot to fetch bins with +1 per delivery, −1 per collision.
:::

::: step [Step 2: Execution] Identifying Each
(a) Labeled pairs + discrete verdicts → **supervised classification**. $T$ = decide applications, $E$ = historical records, $P$ = accuracy on held-out applicants. (b) No labels, seek groups → **unsupervised clustering**; $P$ = cluster coherence/silhouette on unseen customers. (c) No correct moves shown, only episode scores → **reinforcement learning**; $P$ = expected return per shift.
:::

::: step [Step 3: Conclusion] Final Result
Same ritual every time: name $T$, $E$, $P$ explicitly, then read the paradigm off the feedback type (labels / nothing / rewards). Students who skip the $T$-$E$-$P$ sentence invariably misclassify borderline cases (recommender logs, bandit ads) — write it first, decide second.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
