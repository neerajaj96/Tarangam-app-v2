# Evaluation Measures: Classifiers & Regressors

**One confusion matrix, four classifier ratios, one ROC curve — plus MAE, RMSE and $R^2$ for regressors, all computed on shared numbers.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Courtroom Scorecard
**Precision** asks "of all convictions, how many were guilty" (false-alarm fear). **Recall** asks "of all guilty, how many were convicted" (miss fear). **Accuracy** is the overall hit rate — comforting, but a liar on imbalanced streets. **ROC/AUC** watches the whole alarm dial turn from silent to paranoid.
:::

::: anim roc-tradeoff One Dial, Whole Tradeoff
The threshold slides along the curve: recall is bought with false alarms, and AUC measures the area of that bargain above the diagonal.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Classifier ratios

From TP, FP, FN, TN: accuracy $= (TP+TN)/n$, precision $= TP/(TP+FP)$, recall $= TP/(TP+FN)$, F-measure $= 2PR/(P+R)$. ROC plots TPR (recall) against FPR $= FP/(FP+TN)$ across thresholds; **AUC** is its area — $1.0$ perfect, $0.5$ coin-flip.

### 2.2 Regressor errors

MAE $= (1/n)\sum\lvert y-\hat{y}\rvert$, RMSE $= \sqrt{(1/n)\sum(y-\hat{y})^2}$, $R^2 = 1 - SSR/SST$ (fraction of variance explained; $1.0$ perfect, $0$ mean-baseline, negative means worse than guessing the mean).

::: callout-formula KTU Formula Vault: Metrics
Acc $= (TP+TN)/n$ · Prec $= TP/(TP+FP)$ · Rec $= TP/(TP+FN)$ · $F = 2PR/(P+R)$ · AUC above diagonal · MAE linear, RMSE quadratic · $R^2 = 1-SSR/SST$.
:::

Accuracy on $99$-to-$1$ data is a trap: always-predict-majority scores $0.99$ while catching nothing — precision/recall expose the fraud.

::: callout-pitfall Precision–Recall Swap
Precision divides by **predicted** positives $(TP+FP)$; recall divides by **actual** positives $(TP+FN)$. Swapping denominators answers "miss fear" when asked "alarm fear" — the single commonest metric error.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A vibration alarm gives $TP = 40$, $FP = 10$, $FN = 20$, $TN = 130$ ($n = 200$). Separately, a temperature model on truths $[2, 4, 6]$ predicts $[3, 3, 7]$. Compute accuracy, precision, recall, F1, then MAE, MSE, RMSE, $R^2$.
:::

::: step [Step 2: Execution] Four Ratios and Four Errors
Accuracy $= 170/200 = 0.85$. Precision $= 40/50 = 0.8$. Recall $= 40/60 \approx 0.6667$. F1 $= 2(0.8)(0.6667)/1.4667 \approx 0.7273$. Regression residuals $[-1, 1, -1]$: MAE $= 1.0$, MSE $= 1.0$, RMSE $= 1.0$. Mean $\bar{y} = 4$, $SST = 4 + 0 + 4 = 8$, $SSR = 3$, so $R^2 = 1 - 3/8 = 0.625$.
:::

::: step [Step 3: Conclusion] Final Result
Classifier: $0.85 / 0.8 / 0.6667 / 0.7273$. Regressor: MAE $=$ MSE $=$ RMSE $= 1.0$, $R^2 = 0.625$ (the model explains $62.5$ percent of variance). Note F1 sitting between precision and recall — harmonic means always land inside the bracket.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Imbalance Trap
$990$ healthy, $10$ faulty; a model predicts healthy always. Accuracy?
(A) $0.01$, terrible
(*B) $0.99$, yet recall on faults is $0/10 = 0$ — accuracy lies while the model catches literally nothing
(C) $0.5$ by balance
(D) Precision $1.0$ on faults
::: explanation
$(990 + 0)/1000 = 0.99$ rewards doing nothing. Recall $0$ tells the truth: every faulty motor ships. Imbalanced verdicts need precision/recall, never accuracy alone.
:::

::: quiz Q2: F1 Bracket Check
Precision $0.9$, recall $0.3$. A student reports F1 $= 0.95$. Verdict?
(A) Plausible, F1 rewards highs
(*B) Impossible, the harmonic mean lies strictly between its inputs, so F1 must sit inside $[0.3, 0.9]$ (actual $\approx 0.45$)
(C) F1 equals accuracy here
(D) Recall is irrelevant to F1
::: explanation
$2(0.9)(0.3)/1.2 = 0.54/1.2 = 0.45$. Any F1 outside the precision–recall bracket is arithmetic error — a two-second certificate before trusting the number.
:::

::: quiz Q3: R-Squared Reading
$R^2 = -0.4$ on the test set. Meaning?
(A) Great fit, negative is better
(*B) Worse than predicting the mean: $SSR$ exceeds $SST$, so the model destroys information versus a flat $\bar{y}$ line — investigate leakage or shift, not hyperparameters
(C) $R^2$ cannot be negative
(D) MAE must also be negative
::: explanation
$R^2 = 1 - SSR/SST$ goes negative exactly when errors beat mean-baseline errors. On test data that screams distribution shift or a fitting bug, not bad luck.
:::
