# ML vs Traditional Programming & the Four Paradigms

**Rules written by hand versus rules learned from data — Mitchell's T/E/P test, the four paradigms, and spotting each one in engineer-style problems.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Rulebook vs Apprentice
Traditional programming gives the machine a **rulebook** ("if vibration exceeds 5 mm/s, raise an alarm"). Machine learning gives it an **apprentice bench**: past sensor readings plus past outcomes, and the apprentice must infer its own rulebook. Mitchell's test: a program **learns** for task $T$ from experience $E$ measured by $P$ when its $P$-score on $T$ **rises as $E$ grows**. Learning is measured improvement, not clever code.
:::

Engineers meet all four paradigms on the shop floor: labeled failure logs (supervised), raw vibration traces with no labels (unsupervised), half-labeled inspection photos (semi-supervised), and a controller earning rewards per good batch (reinforcement). The same programme spine as the S5 ML course (see `PCCST503`) returns here in lighter form.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The paradigm table

* **Supervised:** training pairs $(x, y)$ with labels. Learn $f: X \to Y$. Regression if $Y$ is continuous, classification if $Y$ is discrete.
* **Unsupervised:** bare $x$ points, no labels. Find structure: clusters, densities, low-dimensional manifolds.
* **Semi-supervised:** a few labeled pairs plus many unlabeled points; the unlabeled mass shapes the boundary.
* **Reinforcement:** no answers shown, only **rewards** for action sequences. Learn a **policy** maximizing long-term return (the same agent idea as `PECST522` search agents, now with function approximation).

### 2.2 The universal workflow

**Data → features/model class → loss + optimizer → evaluation on unseen data.** Every later topic fills one slot of this pipeline.

::: callout-formula KTU Formula Vault: Paradigm Facts
Mitchell: **$P$ on $T$ improves with $E$** · supervised = **labeled pairs** · unsupervised = **bare $X$, find structure** · semi = **few labels + many raw points** · RL = **rewards, learn policy** · pipeline: **data → model → loss/train → generalize**.
:::

Feedback granularity is the discriminator students forget under pressure, so name it explicitly every time.

::: callout-pitfall Labels vs Rewards (the Standard Mix-Up)
Per-example correct answers ("the right label was 7") mean supervision; episode-level scores ("\+10 for the shift") mean reinforcement. An option calling per-example answers "reinforcement" (or shift scores "supervision") is always wrong.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Sort three plant tasks into paradigms: (a) 2,000 bearing records labeled healthy/faulty, predict the next bearing; (b) group 10,000 unlabeled vibration spectra for a catalogue; (c) train a crane controller getting $+1$ per clean lift and $-1$ per sway fault, with no correct moves ever shown.
:::

::: step [Step 2: Execution] Naming T, E, P
(a) Labeled pairs and discrete verdicts give **supervised classification**: $T$ = judge bearings, $E$ = labeled records, $P$ = accuracy on future bearings. (b) No labels and a grouping goal give **unsupervised clustering**: $P$ = cluster coherence on new spectra. (c) Scores without correct moves give **reinforcement learning**: $P$ = expected return per shift.
:::

::: step [Step 3: Conclusion] Final Result
(a) classification, (b) clustering, (c) reinforcement. Ritual: write the $T$-$E$-$P$ sentence first, then read the paradigm off the feedback type (labels, nothing, rewards). Skipping the sentence is how borderline cases get misclassified.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Paradigm Sorting
A motor log has inputs but no labels, and the goal is to find operating regimes. A student proposes logistic regression. What is wrong?
(A) Nothing, logistic regression clusters natively
(*B) Logistic regression is supervised and needs labels, while unlabeled regime-finding is clustering territory, so the paradigm is wrong before any tuning begins
(C) Motor data can never be clustered for safety reasons
(D) Regression always beats clustering on sensor data
::: explanation
No labels means no supervised loss exists to optimize. Pick the paradigm first (unsupervised, then clustering), the algorithm second. The error is categorical, one level above hyperparameters.
:::

::: quiz Q2: Mitchell's Test
State Mitchell's definition for a spam filter and explain why each letter matters.
(A) Delete all mail, count complaints, measure inbox size
(*B) $T$ = classify messages, $E$ = labeled spam/ham corpus, $P$ = accuracy on future mail, because $T$ fixes the job, $E$ names the fuel, and $P$ makes improvement falsifiable
(C) $T$, $E$, $P$ are decorative formalities for reports
(D) The definition applies only to neural networks
::: explanation
$T$ scopes the task, $E$ names what counts as experience, $P$ supplies the grading ruler. A filter whose held-out accuracy never rises has not learned, whatever its training loss claims.
:::

::: quiz Q3: RL vs Supervised
Which situation is reinforcement learning, and why is it NOT supervised?
(A) Predicting house prices from labeled sales records
(*B) Training a crane controller from shift scores only, because no correct move is ever shown per position, so no $(x, y)$ pairs exist to supervise with
(C) Grouping spectra into regimes without labels
(D) Fitting a line through measured points
::: explanation
Supervision needs per-example right answers; RL receives only episode-level scores. Outcomes without correct moves is the granularity gap that defines the boundary.
:::
