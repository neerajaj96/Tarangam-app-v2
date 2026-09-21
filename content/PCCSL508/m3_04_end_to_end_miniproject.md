---
id: m3_04_end_to_end_miniproject
courseCode: PCCSL508
module: 3
sequence: 4
title: 'Capstone: End-to-End Mini-Project'
difficulty: beginner
estimatedMinutes: 14
learningObjectives:
  - State the demo contract in plain words first
  - Compose loading to deployment-story into one pipeline
  - Defend every choice in viva language
concepts:
  - ML pipeline
  - evidence pack
  - viva defence
prerequisites:
  - m3_03_ensemble_methods_lab
examRelevance: high
tags:
  - capstone
  - ml-pipeline
---
# Capstone: End-to-End Mini-Project

**Aim:** compose the whole course into one defended pipeline — problem, data, model, grading, demo — ready for evaluation day.

**Theory (one paragraph):** A pipeline is ordered honesty: business problem → local data → cleaning log → split → baseline → validation-chosen model → test-once grade → error analysis → demo. Each stage's artefacts (shapes, plots, scores, logs) form the evidence pack; the viva attacks choices, and every choice cites its experiment.

**Dataset meaning:** student-chosen local CSV (any prior file or a new lab-provided one) — approved in writing before modelling (no mid-project dataset swaps without re-baselining).

## 1. Procedure Step by Step

1. Freeze the question ("predict X from Y for Z purpose, graded by metric M for cost reason C").
2. Execute the pipeline in order, no stage skipped, each artefact saved (`01_inspect/`, `02_baseline/`, `03_select/`, `04_grade/`, `05_errors/`).
3. Rehearse the ten-minute demo: problem (1') → data story (2') → live run (4') → errors + limits (2') → questions (1').

```python
# pipeline.py — the whole course in one file (calls your saved stage scripts)
import runpy
for stage in ["01_inspect", "02_baseline", "03_select", "04_grade", "05_errors"]:
    print("=" * 20, stage, "=" * 20)
    runpy.run_path(stage + ".py")   # each stage prints shapes/scores/paths; rerun = reproduce
# ^ evaluator runs THIS on a clean machine: identical numbers = reproducibility grade earned
```

Line-by-line honesty: `runpy` executes stage files in a fresh namespace each (no leaked variables between stages — order dependence made explicit); printed shapes/scores are the evaluation trail (silent stages score zero); clean-machine rerun is the acceptance test (your laptop's luck doesn't travel).

::: toggle What does `runpy.run_path` do, and why stage files instead of one notebook?
`runpy.run_path("03_select.py")` = execute that file top-to-bottom in a fresh namespace (like `python3 03_select.py`, but inside this driver — no shared variables leak between stages, so stage 4 cannot secretly depend on stage 2's leftovers). Stage files (not one notebook) because: order is explicit (01→05), reruns are total (one command reproduces everything), and hidden out-of-order cell execution — notebooks' classic irreproducibility — becomes impossible.
:::

**Artefact list (each mandatory):** frozen question + cost-matched metric; cleaning log; split record (seed, ratios, shapes); baseline score; CV selection table; test-once grade; error analysis (worst slices + residual/confusion reading); demo script + viva bank answers.

## 2. Expected Output and Result

One reproducible run, one evidence pack, one ten-minute story with named limits. Result: evaluation-ready project, not a notebook of hopeful cells.

**How to verify:** clean-machine rerun reproduces every number (acceptance); error analysis names the worst slice with a hypothesised cause (honesty); limits slide exists (no unbounded claims).

::: callout-pitfall Demo-Day Entropy
Untested projectors, dead batteries, "worked yesterday" environments fail evaluations. Freeze code the night before, carry data + pack on a pen drive, photograph the working screen — logistics is graded implicitly.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Mid-demo "improvements" (live tuning) | Frozen artefacts only — live edits void reproducibility |
| Claims beyond the error analysis | Every superlative needs a slice + number; modesty with evidence beats hype |
| New dataset week-before (no baselines) | Dataset changes restart the pipeline (re-baseline everything, in writing) |

**Viva bank (two sentences each):** why this metric (cost)? why this model (validation, not hope)? what would you try with one more week (capacity/data/diagnosis)? where does it fail worst (slice + hypothesis)?

**Checklist:** question frozen ☐; five stage folders ☐; clean rerun identical ☐; error slices named ☐; viva bank rehearsed aloud ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Evaluator's machine reproduces 4 of 5 stage scores; grading differs by 0.02. Pass or fail, and what single artefact decides?
() Fail — any difference voids everything
(*) Pass pending versions: the recorded stack versions (M1.06 header) decide — same versions + same code + same data must match; drift indicts the environment (defaults), and the version log either convicts or acquits in one line
() Scores don't matter in projects
() Rerun until it matches, then present
::: explanation
Reproducibility is conditional on the recorded stack: versions are evidence, not decoration. The header's version lines turn a 0.02 mystery into a one-line verdict — record everything, defend with the log.
:::

::: quiz "Our model achieves 99% accuracy and has no limitations." Give the two corrections an evaluator demands.
() Accept the claim; confidence impresses
(*) (1) Accuracy needs class ratios + cost-matched metrics beside it (M2.05 law); (2) every model has worst slices — name them with hypotheses (error analysis), or the claim reads as untested. Evidence plus limits, never superlatives alone
() Add more decimals to the 99%
() Limitations slides are optional modesty
::: explanation
Superlatives without slices are ungradeable: accuracy decomposes, errors localise. The evidence pack exists precisely to replace adjectives with artefacts — quote slices, concede limits, earn trust.
:::
