---
id: m3_03_ensemble_methods_lab
courseCode: PCCSL508
module: 3
sequence: 3
title: 'Experiment: Ensembles (Bagging & Boosting)'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the variance-vs-bias disease split in plain words first
  - Beat single trees with forests, then with boosting, measurably
  - Read OOB and learning curves without fooling yourself
concepts:
  - random forests
  - AdaBoost staging
  - OOB validation
prerequisites:
  - m3_02_hierarchical_clustering_lab
examRelevance: high
tags:
  - ensembles-lab
  - boosting
---
# Experiment: Ensembles (Bagging & Boosting)

**Aim:** turn wiggly trees into committees — forests vote variance away, boosting chases bias — each beating the lone tree on held-out data.

**Theory (one paragraph):** Bagging averages deep trees over bootstrap resamples (variance falls, bias stays — M2.01's 1-NN moral generalised); random forests add random feature subsets per split (decorrelates judges, vote bites deeper); AdaBoost stages shallow trees onto reweighted mistakes (bias falls, noise overfits if pushed). OOB (out-of-bag ~37% per tree) validates bagging free — with selection limits (PCCST503 ensembles in four lines — here we stage all three).

**Dataset meaning:** M2.04's local classification CSV (same split discipline) — supervised again, committees now; compare against the lone-tree CV/test from M2.04 directly.

## 1. Procedure Step by Step

1. Reuse M2.04 split/scale; baseline = lone tree test score (written down from M2.04 — no re-grading).
2. Forest (500 trees, watch OOB plateau) → AdaBoost (staged depths/rounds, validation curve) → compare all three on the same test once.
3. Plot: OOB error vs trees (plateau proof); boosting validation vs rounds (rise-then-fall proof at excess rounds).

```python
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
rf = RandomForestClassifier(n_estimators=500, oob_score=True, random_state=42, n_jobs=-1)
rf.fit(Xtr_s, ytr)
print("forest test:", round(rf.score(Xte_s, yte), 3), "OOB:", round(rf.oob_score_, 3))
# ^ OOB ≈ test (free validation); more trees plateau, never U-turn (given depth)
ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=200, random_state=42)
ada.fit(Xtr_s, ytr)   # staged reweighting: each stump apologises for the last errors
print("boost test:", round(ada.score(Xte_s, yte), 3))
print("staged:", [round(s, 3) for s in ada.staged_score(Xte_s, yte)][::40])  # rise... then watch
```

Line-by-line honesty: `oob_score` free-validates (37% juries per point — M2.01's juries return); `n_estimators=500` plateaus (check OOB curve, stop paying compute past it); stumps (`depth=1`) force boosting to earn every gain; staged scores reveal over-round decline (quit at the validation peak — rounds are capacity!).

**Algorithm:** bootstrap-aggregate vote (forests) vs exponential-reweight staging (AdaBoost).

## 2. Expected Output and Result

Forest beats lone tree (variance visibly averaged, OOB ≈ test); boosting beats further to a peak then sags if rounded past it; staged list shows rise-then-fall. Result: three test scores + two curves + stopped-at-peak rounds.

**How to verify:** OOB within noise of test (validation honesty); staged curve actually turns (capacity demonstrated, not asserted); forest ≥ tree (else seeds/data noted — no cherry-picking runs).

::: callout-pitfall OOB Coronation
Tuning rounds/depth repeatedly on OOB contaminates it into training data wearing validation clothes — monitor on OOB, crown on held-out (nested when scarce). Same leak law, new costume.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| 5000 trees "for safety" | Plateau means stop — compute bills past it, gains don't |
| Boosting noisy labels 500 rounds | Noise gets memorised with apology weights — early-stop at validation peak |
| Expecting forests to fix bias | Committees average wiggles; wrong families stay wrong (bias needs richer models) |

**Viva:** bagging vs boosting disease split (variance vs bias)? What OOB juries are (37% free validation)? Why rounds are capacity (each stage fits harder)?

**Checklist:** lone-tree baseline written ☐; OOB ≈ test ☐; staged curve turns ☐; stopped at peak ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Forest OOB 0.87, test 0.86; boosting peaks 0.90 at 120 rounds, sags to 0.86 by 500. What are the two findings and the shipped configuration?
() Ship 500 rounds — more is more
(*) Forest validates honestly (OOB ≈ test, variance averaged); boosting over-rounds past 120 (capacity overshoot memorises noise). Ship ~120-round boosting (or forest for stability) — peaks, not endpoints, ship
() OOB is pessimistic; ignore it
() Sagging proves boosting broken generally
::: explanation
Plateau versus peak: forests plateau (stop paying), boosting peaks then sags (stop rounding). OOB-test agreement certifies the first; staged curves certify the second — ship extrema of validation, never of hope.
:::

::: quiz Lone tree 0.78, forest 0.86 on noisy labels; boosting reaches 0.91 then 0.84. Explain each step's disease cured and caught.
() Boosting always wins; ship it regardless
(*) Tree→forest: variance averaged (bagging + decorrelation); forest→boost-peak: residual bias chased (reweighting); peak→sag: noise memorised (over-rounding). Each delta names its mechanism — cure, cure, then disease — read all three off the staged curve
() Noise helps boosting; add more
() Forests fix bias too, so skip boosting
::: explanation
Three deltas, three mechanisms: variance down, bias down, then noise up. The staged curve is the whole story in one line — quote rise, peak, and sag as separate findings with separate causes.
:::
