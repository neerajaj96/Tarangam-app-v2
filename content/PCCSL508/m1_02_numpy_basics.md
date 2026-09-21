---
id: m1_02_numpy_basics
courseCode: PCCSL508
module: 1
sequence: 2
title: 'NumPy: Arrays & Vector Math'
difficulty: beginner
estimatedMinutes: 11
learningObjectives:
  - State what an array guarantees over a list in plain words first
  - Slice, reshape, and broadcast small arrays correctly
  - Replace loops with vector expressions measurably
concepts:
  - ndarray
  - broadcasting
  - vectorisation
prerequisites:
  - m1_01_python_variables_lists_functions
examRelevance: high
tags:
  - numpy
  - vectorisation
---
# NumPy: Arrays & Vector Math

**Aim:** think in whole-array operations — the speed and shape language every ML experiment speaks.

**Theory (one paragraph):** A NumPy `ndarray` is a typed, fixed-shape grid (all floats, 1000×5) living in contiguous memory; lists are scattered pointers. Consequence: array math runs in compiled C (100× faster loops) and shapes mismatch loudly instead of silently. Broadcasting stretches small shapes across big ones by rule (trailing axes, size-1 stretches) — convenient and the #1 silent-bug factory.

**Dataset meaning:** a 2-D array *is* a dataset: rows = samples, columns = features (`X.shape == (n_samples, n_features)` — memorise this sentence).

## 1. Procedure Step by Step

1. `pip install numpy`, `import numpy as np`, verify `np.__version__`.
2. Run each block; predict shapes before printing (shape-guessing is the skill).

```python
import numpy as np
a = np.array([1.0, 2.0, 3.0])     # 1-D, dtype float64, shape (3,)
b = np.array([[1, 2], [3, 4]])    # 2-D, shape (2, 2): rows, columns
print(a * 2, a + 10)              # elementwise: no loops written, none needed
print(b[:, 0], b[1, :])           # column 0, row 1 (slice: rows, cols)
print(b.reshape(4))               # new view, same data (cheap, shares memory)
print(a + np.array([10]))         # broadcast: (3,) + (1,) -> (3,) stretched
print(np.mean(b, axis=0))         # per-column means: axis names the collapsed dim
```

Line-by-line honesty: `b[:, 0]` vs `b[1, :]` (colon = all along that axis); `axis=0` collapses rows (result per column — say it aloud); `reshape` shares memory (mutating the view mutates the original!); broadcasting `(3,)+(1,)` works but `(3,)+(2,)` errors — rules, not wishes.

::: toggle What do `shape`, `dtype`, `reshape`, and `axis` mean?
`shape` = the size tuple, e.g. `(1000, 5)` (1000 rows, 5 columns — read as samples × features by this course's convention; transposed layouts exist elsewhere, so confirm per dataset). `dtype` = element type (`float64` = 64-bit decimals; mixed-type arrays upcast or object-ify — check it). `reshape(4)` = new view with a new shape sharing the same memory (cheap; `.copy()` when independence is needed). `axis` = the dimension an operation collapses: `axis=0` eats rows (per-column result), `axis=1` eats columns (per-row result).
:::

::: toggle What is the broadcasting rule, exactly, with an example?
Align shapes from the trailing (right) end; each axis pair must match or have a 1 (stretched to match), else error. `(3,) + (1,)`: trailing 3 vs 1 → stretch the 1 → `[11,12,13]`. `(100,5) + (5,)`: 5 matches 5, leading 100 stands alone → row-wise stretch. `(100,5) + (100,)`: trailing 5 vs 100 → mismatch → loud error. Legal-but-unintended stretches corrupt silently — print shapes after arithmetic.
:::

**Input/features/target:** `X = b` (features, shape (2,2)); a column sliced out (`b[:, 1]`) is tomorrow's *target* `y` (shape (2,) — note: 1-D, not (2,1)!).

## 2. Expected Output and Result

Elementwise prints, correct slices, `(4,)` reshape, broadcast sum `[11,12,13]`, column means `[2,3]`. Result: loops replaced by expressions; shapes predicted before printed.

**How to verify:** hand-compute `b[:,0]` mean (2.0) before running `np.mean` — agreement proves axis understanding.

::: callout-pitfall Broadcast Silence
`(100,5) + (5,)` works (row-wise stretch — intended) but `(100,5) + (100,)` errors while `(100,5) + (1,5)` "works" by stretching rows — a wrong-but-legal stretch silently corrupts math. Print shapes after every operation until instinct forms.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| `axis` backwards (row vs column means swapped) | axis names the *collapsed* dimension — say it aloud before coding |
| Mutating a reshape view, original changes "mysteriously" | views share memory — `.copy()` when independence needed |
| Python-looping arrays elementwise | vectorise: whole-array expressions (100× faster, fewer bug sites) |

**Viva:** array vs list (typed contiguous grid vs scattered pointers)? What broadcasts legally (trailing-axes, size-1 rule)? Why is `X.shape (n,d)` the dataset sentence?

**Checklist:** install+version ☐; shape predicted each print ☐; axis means stated aloud ☐; one broadcast error triggered deliberately ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz `np.mean(X)` returned one number but you wanted per-feature means of a (100,5) matrix. What was missing, and what is the rule for axis?
() NumPy cannot do per-column means
(*) Missing `axis=0`: axis names the *collapsed* dimension — collapse rows (axis 0) to keep one value per column; bare `mean` collapses everything to a scalar
() Transpose first always
() Means need loops by definition
::: explanation
Axis is the dimension that disappears: say "collapse rows, keep columns" before typing `axis=0`. The scalar is the symptom of collapsing everything — name the survivor, pick the axis.
:::

::: quiz `(100,5) + (5,)` worked but gave wrong science; `(100,5) + (100,)` errored. Explain both using the broadcast rule.
() NumPy prefers row vectors aesthetically
(*) Trailing-axis rule: `(5,)` stretches across rows (legal, possibly unintended); `(100,)` aligns against the last axis 5 ≠ 100 (illegal, loud error). Silence is the danger — legal stretches need shape-print verification
() Broadcasting is random by seed
() Additions need identical shapes always
::: explanation
Broadcasting stretches size-1/trailing shapes automatically — convenience with a corruption clause. Print shapes after every arithmetic until the rule is reflex; loud errors are gifts, silent stretches the hazard.
:::
