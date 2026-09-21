---
id: m2_06_classification_evaluation_metrics
courseCode: PCCST503
module: 2
sequence: 6
title: 'Classification Evaluation: Confusion, Precision, Recall, F1, ROC-AUC'
difficulty: beginner
estimatedMinutes: 14
learningObjectives:
  - State the classification-grading problem in plain words first
  - Read any confusion matrix into TP, TN, FP, FN without hesitation
  - Score classifiers with accuracy, precision, recall, and F1 symbol by symbol
  - Trace ROC curves and read AUC as a ranking probability
  - Choose the right metric for imbalanced KTU exam scenarios
concepts:
  - confusion matrix
  - precision and recall
  - F-measure
  - ROC curve
  - AUC
prerequisites:
  - m2_04_decision_trees_entropy_information_gain
examRelevance: high
tags:
  - classification-metrics
  - evaluation
  - roc-auc
---
# Classification Evaluation: Confusion, Precision, Recall, F1, ROC-AUC

**What problem grading a classifier solves beyond training accuracy, what counted outcomes it needs, how the confusion matrix plus accuracy, Precision, Recall, F-measure (F1), Receiver Operating Characteristic (ROC), and Area Under the Curve (AUC) score decisions, and which metric each imbalanced exam scenario demands.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A disease test is "99% accurate" yet every sick patient is told "healthy." The problem: accuracy counted the easy majority (healthy people) and hid the catastrophic minority (missed cures). Classification grading must separate *which* mistakes happened, not just *how many*.

Tiny beginner example. Ten patients: 1 sick, 9 healthy. A lazy model predicts "healthy" for all ten. Accuracy $= 9/10 = 90\%$ — impressive, useless: the one sick patient is missed. Precision, recall, and F1 exist precisely to expose this con: recall asks "of the truly sick, how many did we catch?", precision asks "of the alarms we raised, how many were real?".

Analogy as support, then dropped. Think of a fire alarm: recall is catching every real fire (never sleep through one), precision is never crying wolf (neighbours still trust the bell). From here on we use exact terms only: confusion matrix, True Positive (TP), accuracy, precision, recall, F1, ROC, AUC.

Abbreviations defined on first use: True Positive (TP), True Negative (TN), False Positive (FP), False Negative (FN), Receiver Operating Characteristic (ROC), Area Under the Curve (AUC). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is TP, TN, FP, FN? | Right alarm, right silence, false alarm, missed alarm |
| What is $P$, $N$? | Truly positive count (TP $+$ FN), truly negative count (TN $+$ FP) |
| What is threshold $t$? | Score cutoff: predict positive iff score $\ge t$ |

<a id="matrix-data-goal"></a>
## 2. Data, Matrix and Goal (Basic Understanding)

**Problem.** Grade decisions on labelled test data the model never trained on, especially when classes imbalance.

**Data.** Labelled pairs $(x_i, y_i)$ with $y_i \in \{0, 1\}$, plus model scores $s_i$ thresholded at $t$ into predictions $\hat{y}_i$. Here $x_i$ is features, $y_i$ is truth, $\hat{y}_i$ is the verdict at threshold $t$.

**Goal.** A metric matching the cost of mistakes: recall when misses kill (disease, fraud), precision when false alarms bankrupt (spam folder), F1 when both bite, AUC when thresholds are still undecided.

The **confusion matrix** is the $2 \times 2$ ledger every metric below reads:

|  | Predicted 1 | Predicted 0 |
|---|---|---|
| Actual 1 | TP (hit) | FN (miss) |
| Actual 0 | FP (false alarm) | TN (correct silence) |

::: callout-intuition Core Mental Model: The Four Ledger Entries
Every prediction lands in exactly one cell: TP is a deserved arrest, TN a correctly ignored innocent, FP a wrongful arrest (precision pays), FN a freed criminal (recall pays). Accuracy counts the whole ledger; precision audits the "arrested" column; recall audits the "guilty" row. No metric without the matrix — the cells are the facts, the scores are opinions about them.
:::

<a id="scores-theory"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (accuracy cons, threshold choices) → data (labelled test, scores) → goal (cost-matching metric) → method (count cells, form ratios, sweep thresholds) → model (thresholded scorer) → training (pick $t$ on validation, grade once on test) → example → limitations.

### 3.1 Accuracy, Precision, Recall, F1 — Symbol by Symbol

Meaning first: accuracy is overall correctness; precision is alarm trustworthiness; recall (also Sensitivity) is capture completeness; F1 is their honest compromise.

Variables: TP, TN, FP, FN from the matrix; $P = $ TP $+$ FN actual positives; predicted positives $=$ TP $+$ FP.

Formulas:

$$\mathrm{Accuracy} = \frac{\mathrm{TP}+\mathrm{TN}}{\mathrm{TP}+\mathrm{TN}+\mathrm{FP}+\mathrm{FN}}, \quad \mathrm{Precision} = \frac{\mathrm{TP}}{\mathrm{TP}+\mathrm{FP}}, \quad \mathrm{Recall} = \frac{\mathrm{TP}}{\mathrm{TP}+\mathrm{FN}}, \quad F_1 = \frac{2PR}{P+R} = \frac{2\mathrm{TP}}{2\mathrm{TP}+\mathrm{FP}+\mathrm{FN}}.$$

Here $P$ is precision, $R$ is recall in the $F_1$ line. Intuition with the §1 patients: lazy "all healthy" gives TP $= 0$, FN $= 1$, TN $= 9$, FP $= 0$: accuracy $90\%$, recall $0/1 = 0$, precision $0/0$ undefined (no alarms raised — report $0$ with a "no positives predicted" note, never $100\%$). $F_1$ is the harmonic mean: it punishes lopsidedness (precision $1.0$ with recall $0.1$ scores $\approx 0.18$, not $0.55$), which is why KTU rewards it for imbalanced tasks. Accuracy is quoted only with class ratios beside it; alone on $99$-to-$1$ data it is a majority-class echo.

::: toggle Work all four scores on the §1 patients by hand
Cells: TP $= 0$ (no sick caught), FN $= 1$ (the missed patient), TN $= 9$ (healthy correctly silenced), FP $= 0$ (no false alarms). Accuracy $= (0+9)/10 = 0.90$ (the con). Precision $= 0/(0+0)$ = undefined — no alarms exist to audit (report 0 with the note, never 100%). Recall $= 0/(0+1) = 0$ (nothing caught). $F_1 = 0$ (harmonic with a zero factor collapses — one failed partner fails the compromise). Reading: one metric flatters, three indict — that split is exactly why the matrix precedes every ratio.
:::

::: toggle What are `sensitivity`, `specificity`, `FPR`, and `threshold`?
Sensitivity = recall's alias (true-positive rate — exam synonym trap). Specificity = TN/(TN+FP) (true-negative rate — healthy correctly silenced; the metric screening tests hide behind). FPR (False Positive Rate) = FP/(FP+TN) = 1 − specificity (ROC's x-axis — alarm rate on negatives). Threshold $t$ = score cutoff (predict positive iff $s_i \ge t$; lowering $t$ catches more (recall up) while trusting less (precision down) — the tradeoff ROC traces).
:::

| Similar pair | Distinction that earns marks |
|---|---|
| Precision vs accuracy | Column purity (alarms trusted) vs whole-ledger correctness (dominated by majorities) |
| Recall vs precision | Row completeness (none missed) vs column purity (none false); raising threshold $t$ trades recall for precision |
| $F_1$ vs accuracy | Harmonic compromise under imbalance vs majority echo; $F_1$ ignores TN by design (retrieval view) |

### 3.2 ROC and AUC — Threshold-Independent Grading

A single threshold is a single operating point; ROC shows all of them. Sweep $t$ from $\infty$ (predict all negative) to $-\infty$ (predict all positive); at each $t$ plot False Positive Rate ($\mathrm{FPR} = \mathrm{FP}/(\mathrm{FP}+\mathrm{TN})$) on $x$ against True Positive Rate ($\mathrm{TPR} = $ recall) on $y$. The curve crawls from $(0,0)$ to $(1,1)$; a perfect scorer hugs the top-left (all positives outscore all negatives); the diagonal is chance.

AUC is the area under that curve, $0$ to $1$ ($0.5$ = chance, $1.0$ = perfect ranking). Its honest reading: the probability that a randomly drawn positive outscores a randomly drawn negative — a ranking grade, not a decision grade. Model selection by AUC on validation, threshold $t$ by cost (recall-heavy $t$ low, precision-heavy $t$ high), final cell counts once on test. Qualified claim: AUC rewards ranking everywhere including irrelevant FPR regions; a higher-AUC model can be worse at the one operating point the application actually uses — always report the chosen point's precision/recall beside AUC, never AUC alone.

::: toggle Trace three ROC dots from one tiny ranking
Scores: positives at 0.9, 0.6; negatives at 0.55, 0.1. Threshold $t = 0.95$: nothing flagged → (FPR 0, TPR 0) — origin dot. $t = 0.58$: flagged {0.9, 0.6} → TP 2/2, FP 0/2 → (0, 1) — top-left corner (perfect separation visible). $t = 0.05$: everything flagged → (1, 1) — end dot. Curve through (0,0)→(0,1)→(1,1): AUC $= 1.0$ (every positive outscores every negative — check all 2×2 pairs). Move one negative to 0.95: the corner rounds off, AUC drops below 1 — one ranking mistake dents the area exactly by its pair share.
:::

::: callout-formula KTU Formula Vault: Classification Facts
Matrix TP/TN/FP/FN · accuracy $=$ (TP$+$TN)/all · precision $=$ TP/(TP$+$FP) · recall $=$ TP/(TP$+$FN) · $F_1 = 2PR/(P+R)$ (harmonic, imbalance-first) · ROC: TPR vs FPR sweeping $t$ · AUC $=$ P(positive outscores negative), $0.5$ chance.
:::

::: anim roc-tradeoff Sweeping the Threshold Trades Errors
Watch the operating point slide along the ROC as the threshold falls — recall climbing as precision bleeds, AUC fixed as the curve's area.
:::

### 3.3 Choosing Honestly (and Training the Threshold)

Numbered procedure:

1. Split honestly: train fits, validation picks metrics and threshold $t$, test grades once.
2. Match metric to cost: misses kill → recall; alarms bankrupt → precision; both bite → $F_1$; threshold undecided → AUC for ranking plus a cost-chosen point.
3. Sweep $t$ on validation ROC; pick the point meeting the cost (e.g. recall $\ge 0.95$ with best precision).
4. Report the full matrix plus chosen scores on test — never test-tuned $t$ as evidence.

MAE/RMSE/R² recap for contrast (syllabus neighbours in M1.05): regression scores distances, classification scores cells. Never grade probabilities with hard labels alone when KTU asks calibration — cross-entropy (M2.02) prices confidence, the matrix prices verdicts.

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Test set: 100 mails, 20 spam (positive), 80 ham. Model flags 15 as spam: 12 truly spam, 3 ham. Remaining 85 called ham: 77 truly ham, 8 spam missed. Build the matrix and compute accuracy, precision, recall, $F_1$.
:::

::: step [Step 2: Execution] Counting Cells Then Ratios
Matrix: TP $= 12$, FP $= 3$, FN $= 8$, TN $= 77$. Accuracy $= (12+77)/100 = 0.89$. Precision $= 12/(12+3) = 0.80$. Recall $= 12/(12+8) = 0.60$. $F_1 = 2(0.8)(0.6)/1.4 \approx 0.686$. (Numbers verified.) Reading: trustworthy alarms ($80\%$), leaky net ($40\%$ of spam missed) — tune $t$ down for recall or accept $F_1 \approx 0.69$ as the balanced grade.
:::

::: step [Step 3: Conclusion] Final Result
Accuracy $89\%$ flatters (ham majority); precision $0.80$ / recall $0.60$ / $F_1 \approx 0.69$ tell the priced truth. ROC/AUC would then ask the ranking question across all $t$; the reported point $(FPR = 3/80 = 0.0375, TPR = 0.60)$ is one dot on that curve — the dot the spam-folder cost chose.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Quoting accuracy on imbalanced data. $99\%$ accuracy with $0\%$ recall is failure wearing success's clothes; always pair accuracy with ratios or $F_1$.
- Averaging precision and recall arithmetically. The compromise is harmonic ($F_1$); arithmetic means forgive lopsidedness.
- Reporting AUC as decision quality. AUC is ranking across thresholds; the deployed threshold's precision/recall is the decision grade.
- Tuning $t$ on test. Thresholds are validation choices; test sees the chosen $t$ exactly once.
- Dividing by zero silently. Zero predicted positives makes precision $0/0$ — report "undefined (no alarms)" with recall context, never $100\%$ or $0\%$ without the note.

Limitations: matrix needs labelled test data from the deployment distribution; costs change optimal $t$ (re-tune on re-cost, not on test); $F_1$ ignores TN (use MCC or balanced accuracy when correct silences carry value).

Exam recap: matrix cells first; accuracy whole-ledger; precision column, recall row; $F_1$ harmonic for imbalance; ROC sweeps $t$ (TPR vs FPR); AUC $=$ ranking probability with operating-point caveat; threshold on validation, grade once on test.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz A screening test on 1000 people (10 sick) catches 9 sick and falsely alarms 90 healthy. Compute precision and recall, and explain why accuracy ($909/1000 \approx 91\%$) is the wrong headline.
() Precision 90%, recall 90% — accuracy suffices
(*) TP $= 9$, FP $= 90$, FN $= 1$: precision $= 9/99 \approx 9.1\%$, recall $= 9/10 = 90\%$; accuracy counts 900 true negatives, hiding that 10 of 11 alarms are false — lead with recall plus precision, not the majority echo
() Precision 9/10, recall 9/99 — swapped
() Accuracy is always the KTU-preferred metric
::: explanation
Recall audits the sick row ($9/10$ caught — good); precision audits the alarm column ($9/99$ real — noisy). Accuracy's $91\%$ is $900$ easy healthy silences plus $9$ hits over $1000$ — the majority's applause drowning the minority's signal. Cost decides the headline: screening leads recall, triage budgets lead precision.
:::

::: quiz Precision $= 1.0$, recall $= 0.1$. Why does $F_1 \approx 0.18$ punish this far below the arithmetic mean $0.55$, and when is that punishment exactly what KTU wants?
() Harmonic means reward extremes
(*) $F_1 = 2PR/(P+R) = 0.2/1.1 \approx 0.18$ — harmonics track the weaker partner, so one-sided excellence scores one-sidedly; KTU wants this under imbalance where catching nothing but purely is still failure
() $F_1$ ignores precision entirely
() Arithmetic mean is the syllabus definition of $F_1$
::: explanation
Harmonic means are dominated by the minimum: perfect precision cannot rescue $10\%$ recall. That is the design — imbalanced tasks fail lopsided classifiers, and $F_1$ refuses to let one strong column hide one empty row.
:::

::: quiz Model A has AUC $0.92$ but at its deployed threshold shows precision $0.40$; model B has AUC $0.85$ with precision $0.75$ at its operating point. Which ships for a spam folder, and what does this say about AUC?
() A ships — higher AUC always decides
(*) B ships: AUC grades ranking across all thresholds, not the deployed dot; the folder pays per false alarm, so the operating point's precision rules and B's $0.75$ beats A's $0.40$ despite worse ranking overall
() Neither — AUC above $0.8$ forbids deployment
() AUC equals accuracy at the threshold
::: explanation
AUC integrates over thresholds the application will never use, including absurd FPR regions. Ship the dot, not the area: validate-rank by AUC, then cost-pick $t$ and compare deployed precision/recall. Higher area with a worse dot loses where it counts.
:::
