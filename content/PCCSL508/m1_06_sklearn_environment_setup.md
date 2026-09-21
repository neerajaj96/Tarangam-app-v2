---
id: m1_06_sklearn_environment_setup
courseCode: PCCSL508
module: 1
sequence: 6
title: 'sklearn Setup & Local Data Policy'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - State the offline-first lab policy in plain words first
  - Install and smoke-test the full stack
  - Run the universal fit-predict-score shape once
concepts:
  - sklearn API pattern
  - offline datasets
  - smoke testing
prerequisites:
  - m1_05_traintest_features_target
examRelevance: high
tags:
  - sklearn-setup
  - lab-policy
---
# sklearn Setup & Local Data Policy

**Aim:** install the stack, prove it works in five lines, and adopt the offline-first data rule for the whole course.

**Theory (one paragraph):** scikit-learn (sklearn) speaks one dialect: `model = Something()` (choose), `model.fit(Xtr, ytr)` (learn), `model.predict(Xte)` (guess), `model.score(...)` (grade). Local CSVs in the lab folder are the only inputs — downloads fail offline, break reproducibility, and waste exam minutes. Bundled loaders (`load_diabetes` etc.) are offline-safe fallbacks, never URL fetches.

**Dataset meaning:** `housing.csv`, `mpg.csv` (+ small classification/clustering CSVs) staged beside scripts; each experiment names its file first line of the report.

## 1. Procedure Step by Step

1. `pip install scikit-learn pandas numpy matplotlib` (one stack, pinned lab image ideally).
2. Smoke-test top to bottom; every import error fixed before proceeding.
3. Obtain CSVs once (lab share/pen drive), verify row counts against the experiment notes.

```python
import sklearn, numpy, pandas, matplotlib  # noqa: F401 — import errors surface HERE, not mid-exam
print(sklearn.__version__)                 # record in every report (versions change defaults!)
from sklearn.linear_model import LinearRegression
from sklearn.datasets import load_diabetes  # bundled, offline: the emergency fallback dataset
X, y = load_diabetes(return_X_y=True)
m = LinearRegression().fit(X[:300], y[:300])  # choose → fit → predict → grade, five lines
print(m.score(X[300:], y[300:]))              # held-out R^2: the shape of all M2 grading
```

Line-by-line honesty: version recorded because defaults drift across releases (report it or results mystify); `fit`/`predict`/`score` is the universal rhythm (learn it once, read every later script fluently); bundled data is the fallback, local CSVs the rule (exams provide files, not Wi-Fi).

**Offline-first policy (course law):** scripts read `./data/*.csv` relative paths; no `fetch_*` downloads, no URLs in code; missing file ⇒ clean error naming the expected filename (fail loudly at line one, not silently at line forty).

## 2. Expected Output and Result

Version printed (e.g. 1.3.x), R² ≈ 0.4–0.5 on diabetes holdout (modest — unscaled, untuned, honest). Result: a proven stack plus the five-line rhythm memorised.

**How to verify:** delete-reinstall one package mentally? No — verify by `pip list | grep scikit` matching the report, and rerunning the smoke test byte-identical.

::: callout-pitfall Version Drift
"Worked in the hostel" dies in the lab on different sklearn (changed defaults: e.g. `n_estimators`, CV splitters). Pin/record versions; rerun smoke tests on the evaluation machine first, debug environment before code.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| URL-fetching datasets in scripts | Local CSVs only — offline, repeatable, fast; downloads are failure points |
| Unrecorded versions | Print versions into every report's header |
| Skipping the smoke test | Five lines now save fifty minutes later — stack proof precedes all work |

**Viva:** fit/predict/score in one sentence each? Why local-first (offline + reproducibility + speed)? What breaks across versions (defaults)?

**Checklist:** stack installed ☐; versions recorded ☐; smoke R² reproduced ☐; CSVs staged locally ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Script fetches housing data from a URL at run start. Give three independent reasons this fails lab discipline, and the correct pattern.
() URLs are faster than local files
(*) Offline failure (no Wi-Fi ⇒ dead script), irreproducibility (remote file can change), wasted minutes (downloads per run). Pattern: staged local CSV via relative path, verified once by row count
() URLs are forbidden by Python law
() Local files are slower to read
::: explanation
Local-first is reliability engineering: zero network dependency, byte-identical reruns, instant starts. Each reason stands alone — together they end URL-fetching in lab code forever.
:::

::: quiz Smoke test scores 0.45 on one machine and 0.51 on another with identical code and data. First suspect and the report habit preventing mystery?
() The model trains randomly each run
(*) Library versions (changed defaults across releases): `print(sklearn.__version__)` into every report header and rerun smoke tests on the evaluation machine. Deterministic code, drifting defaults — record the stack, not just the script
() CPUs compute differently per brand
() R² is machine-dependent by definition
::: explanation
Same code, different stack: defaults are hidden inputs. Version-printing converts mystery into a one-line diff — environment is evidence, so record it like evidence.
:::
