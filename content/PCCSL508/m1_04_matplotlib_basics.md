---
id: m1_04_matplotlib_basics
courseCode: PCCSL508
module: 1
sequence: 4
title: 'Matplotlib: Honest Plots'
difficulty: beginner
estimatedMinutes: 11
learningObjectives:
  - State what a plot must prove in plain words first
  - Draw scatter, line, and histogram correctly labelled
  - Read residuals and distributions off your own figures
concepts:
  - scatter and line plots
  - histograms
  - residual plots
prerequisites:
  - m1_03_pandas_basics
examRelevance: high
tags:
  - matplotlib
  - plotting
---
# Matplotlib: Honest Plots

**Aim:** plot every dataset and every result with labels, so eyes catch what tables hide.

**Theory (one paragraph):** A plot maps numbers to position: scatter shows relationships (feature vs target), lines show trends/fits, histograms show distributions (where data piles), residual plots (error vs prediction) expose model sins (curves = underfit, funnels = unstable variance). Unlabelled plots are decoration; labelled ones are evidence.

**Dataset meaning:** axes are named columns (`MedInc` vs `MedHouseVal`); each dot is one *sample*; the line will soon be a *model*.

## 1. Procedure Step by Step

1. `pip install matplotlib`; `import matplotlib.pyplot as plt` (the state-machine interface: successive calls layer onto one figure).
2. Draw the four canonical figures for any regression dataset.

```python
import matplotlib.pyplot as plt
plt.scatter(df["MedInc"], df["MedHouseVal"], s=5)  # s=5: small dots for thousands of rows
plt.xlabel("Median income (10k $)"); plt.ylabel("Median value (100k $)")
plt.title("Price rises with income (roughly)"); plt.show()  # labels or it didn't happen
plt.hist(df["MedHouseVal"], bins=50)               # distribution: piles, tails, outliers
plt.xlabel("value"); plt.ylabel("count"); plt.show()
# residuals come with the first model (M2.01): plt.scatter(predicted, actual - predicted)
```

Line-by-line honesty: `s=5` avoids ink-blobs on big data (default dots merge into lies); `xlabel/ylabel/title` are mandatory (a figure without axes is a Rorschach); `bins=50` resolves shape (too few hides modes, too many shows noise); `show()` flushes the figure (forget it in scripts and figures silently stack).

**Input/features/target:** x-axis = feature, y-axis = target — the visual form of "predict y from x" that every experiment repeats.

## 2. Expected Output and Result

Scatter rising (noisy line), histogram right-skewed (few mansions), titles legible. Result: visual priors for modelling (linear-ish? skewed target? outliers to handle?).

**How to verify:** describe each figure in one sentence before modelling ("rises with spread", "right tail to 5.0") — then check the model's numbers against the sentence.

::: callout-pitfall Ink-Blobs and Missing Labels
Default dot sizes merge 20k rows into a black rectangle hiding all structure (`s` small or alpha blending fixes it); unlabelled axes make the prettiest plot ungradeable. Small dots, full labels, always.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| Plotting test targets during "exploration" | Explore train only — peeking at test shapes leaks (M1.05 discipline) |
| 5 bins hiding bimodality | Try several bin counts; shape must survive the choice to be trusted |
| Judging fit by eye on training scatter | Eyes forgive training overfit — residuals + held-out numbers judge |

**Viva:** scatter vs histogram (relationship vs distribution)? What does a curved residual plot confess (underfit/missing curve)? Why small `s` on big data (overplotting lies)?

**Checklist:** four figures drawn ☐; every axis labelled ☐; one-sentence reading each ☐; train-only exploration ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Residual plot shows a clear U-curve (errors negative middle, positive ends). What does it confess and what is the prescribed cure?
() Model is perfect; curves are decorative
(*) Systematic underfit: a line cannot bend, so bias is structural — cure is capacity (polynomial features, M2.02) or a richer model, verified by the curve flattening on held-out residuals
() Add more training data of the same kind
() Curves mean overfitting; regularise harder
::: explanation
Shape is diagnosis: curves = missing bend (bias), funnels = unstable spread. Prescribe capacity for curves, never more-of-the-same data — the plot names the disease and the cure together.
:::

::: quiz 20k-row scatter renders as one black rectangle. Two fixes and what each reveals?
() Delete 19k rows for clarity
(*) Small dots (`s=1..5`) plus alpha blending (`alpha=0.1`): overlapping ink accumulates into density — structure (bands, gaps, outliers) emerges where the blob hid everything. Overplotting lies; transparency confesses
() Bigger dots for visibility
() Scatter cannot handle big data; use tables
::: explanation
Ink is finite: thousands of dots share pixels, so size and transparency encode density. The fix reveals distribution hidden in saturation — visualisation honesty in two parameters.
:::
