---
id: m3_99_practice_lab_networks_svm_drills
courseCode: PCCST503
module: 3
sequence: 99
title: 'Module 3 Practice Lab: Networks & SVM Drills'
difficulty: intermediate
estimatedMinutes: 14
learningObjectives:
  - Audit perceptron mistakes against separability bounds from first principles
  - Verify gradients ritualistically against finite differences
  - Shop margins and prescribe kernels with C honestly
  - State vanishing, margin and capacity fixes without jargon
concepts:
  - mistake audit
  - gradient ritual
  - margin shopping
prerequisites:
  - m3_01_perceptron_learning_rule
  - m3_02_multilayer_networks_backpropagation
  - m3_03_maximum_margin_svm
  - m3_04_kernels_soft_margins
examRelevance: high
tags:
  - networks-svm
  - m3-lab
---
# Module 3 Practice Lab: Networks & SVM Drills

**How to use this lab as a beginner: count mistakes against bounds, prove gradients with finite differences, shop separators by norm, and prescribe kernels from geometry plus noise.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

Beginner protocol: problem first, then data and goal, then method. Bounds certify, they never predict typical runs.

::: toggle How do I audit mistakes against the Novikoff bound?
Three numbers: actual mistakes (4 in Scenario 1 — count from the trace), radius $R$ (farthest point's norm, $\sqrt{18} \approx 4.24$), margin witness $\gamma$ (a unit separator's clearance, $\ge 0.5$ here — any valid witness works, max-margin not required). Bound $(R/\gamma)^2 \approx 72$. Verdict shape: actual ≤ bound (valid) with room to spare (loose is normal — bounds certify finiteness, never efficiency). Report all three numbers plus the relationship; a bound alone diagnoses nothing.
:::

::: toggle How does the gradient ritual catch bugs, step by step?
Finite differences approximate each partial as $[L(w+\epsilon) - L(w-\epsilon)]/2\epsilon$ (two forwards per weight — millions of passes, hence ritual-only, never training). Compare against analytic backprop values to ~5 decimals: agreement certifies the implementation. Debug order on mismatch: (1) loss definition (½ factor? $(o-y)$ sign?); (2) activation derivative (forgotten $\sigma'$ = linear passthrough bug); (3) stale forwards (backward on updated weights — recompute first). Nine of ten bugs live in these three; the tenth is a transposed matrix (shape mismatch in $\delta a^T$).
:::

### Scenario 1: Perceptron Mistake Audit

Dataset from M3 (separable, boundary $x_1 = 2$ found): the verified trace made exactly **4 mistakes** (C once, then A/C/D) before eternal silence. Now bound it: points inside radius $R = \sqrt{18} \approx 4.24$ (farthest $(3,3)$). A witness separator $x_1 = 1.5$ (unit normal) clears $A$ by $0.5$, $D$ by $0.5$, the rest by more — so max-margin $\gamma^* \ge 0.5$ and $(R/\gamma)^2 \lesssim (4.24/0.5)^2 \approx 72$ mistakes. Actual: 4. The bound is *valid* (4 ≤ 72) and *loose* (typical) — guarantees certify finiteness under separability, never efficiency. Report both numbers and their relationship, never just one.

### Scenario 2: Gradient Verification Ritual

Before trusting any backprop implementation, run the ritual from M3: analytic $[-0.0503, -0.0891, -0.0153, -0.0077, +0.0046, -0.0153]$ vs. finite differences — agreement to 5 decimals *is* the implementation's certificate. Drill: a teammate's $\partial L/\partial w_2$ disagrees in sign. Debug order: (1) loss definition (½ factor? sign of $(o-y)$?); (2) activation derivative ($\sigma'$ vs. forgotten derivative — linear passthrough bug); (3) stale forward values (backward run on *updated* weights — recompute forward first). Nine of ten gradient bugs live in these three; the tenth is a transposed matrix.

### Scenario 3: Margin Shopping (P vs. Q, Decided)

Separators P ($\lVert w\rVert = 0.5$) and Q ($\lVert w\rVert = 4$), identical training accuracy. Corridor widths: P $2/0.5 = 4.0$, Q $2/4 = 0.5$. P tolerates $8\times$ the test-time wobble — *and* P's weights likely came from stronger regularization (smaller norm = wider corridor = the same object). Shop by $\lVert w\rVert$ ascending among zero-training-error candidates: minimum norm *is* maximum margin *is* the generalization bet, three names for one number. Qualification: this bets on robustness under separability; on noisy data add soft margins and validate.

### Scenario 4: Kernel & C Prescription Desk

Three patients: (a) 2D moons intertwined → **RBF**, $\gamma$ validated (polynomial of any sane degree wastes capacity on global structure; locality matches the curls). (b) 10k-dimensional sparse text, linearly separable → **linear kernel** (lifting adds nothing; RBF memorizes expensively). (c) Sensor data, 5% mislabeled → **soft margin, small C** first (fit the 95%, forgive the poison — hard margin or huge $C$ frame the lies in support-vector gold). Prescription = data geometry + noise regime, never brand loyalty.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| Update-on-mistake vs. update-always | Perceptron moves only on errors (attention for free); GD moves every step scaled by $(p-y)$ |
| Separability vs. convergence | Separable + margin ⇒ finite mistakes (bound $(R/\gamma)^2$); else eternal cycling |
| XOR vs. AND/OR | Bends needed vs. single-cut suffices (Minsky–Papert boundary) |
| Forward vs. backward cost | One forward builds values; one backward prices all weights (≈2× total vs. $10^6$ finite-diff) |
| Vanishing vs. exploding gradients | $\sigma'$-products starve early layers vs. recurrent blowups; ReLU/init/norm vs. clipping |
| Functional vs. geometric margin | Scale-fakeable score vs. true distance ($\div\lVert w\rVert$); compare norms, never functionals |
| Support vectors vs. the rest | Boundary-definers (deleting rest changes nothing) vs. passengers |
| Hinge vs. cross-entropy vs. 0/1 | Exact-zero-at-margin vs. eternal-polish vs. flat-unoptimizable |
| C huge vs. C tiny | Strict/hard (overfits noise) vs. forgiving (underfits signal) |
| RBF $\gamma$ large vs. small | Spiky-local (memorizes) vs. smooth-blunt (generalizes, maybe underfits) |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz The verified perceptron trace made 4 mistakes; the (R/γ)² bound allows ~72. A student calls the bound "wrong." Who is confused and about what?
() The bound is indeed violated and the trace must contain an error
(*) The student confuses upper bounds with predictions — 4 ≤ 72 satisfies the guarantee; bounds certify worst cases, never forecast typical ones (loose-but-valid is the norm for such theorems)
() Mistake bounds apply only to inseparable data
() The trace should have made exactly 72 mistakes to confirm theory
::: explanation
Upper bounds are ceilings, not schedules: "≤ 72" is *satisfied* by 4, spectacularly. Expecting equality mistakes worst-case analysis for average-case prophecy (Module-1 distributions moral, recycled). Report actuals *and* bounds, honoring each for what it is.
:::

::: quiz Your backprop ∂L/∂w₂ disagrees in sign with finite differences while all other gradients match to 5 decimals. Localize the bug precisely.
() The entire implementation must be rewritten from scratch
(*) A sign flip isolated to one gradient with correct neighbors points at that edge's local terms: the (o−y) order, a missing/extra activation derivative, or a stale forward value — the debug order in Scenario 2, narrowest hypothesis first
() Finite differences are always wrong when they disagree
() Sign errors are impossible in gradient code
::: explanation
One wrong sign among correct neighbors *localizes* the fault to that edge's chain segment (upstream $\delta$ is proven right by matching downstream grads... precisely, by the matching gradients that consume it). Debug inward from agreement boundaries — the ritual from M3 turned into a fault locator.
:::

::: quiz RBF-γ is swept from tiny to huge on fixed data. Sketch train and test error, and mark where you stop.
() Both fall monotonically; stop at maximum γ
(*) Train falls monotonically (capacity grows); test U-turns (underfit → sweet spot → memorization) — stop at the validation minimum, i.e. where test bottoms while train still descends
() Both rise monotonically; use the smallest γ always
() γ has no effect on either curve
::: explanation
Capacity dial, classic U-curve (Module-1 master tradeoff, kernel edition): tiny-γ bluntness (bias) yields to sweet-spot generalization yields to spiky memorization (variance). The validation minimum — not train behavior, never the extremes — is the only stopping rule.
:::

::: quiz A 50-dimensional dataset with 200 points must be classified. Teammate proposes RBF-SVM; you propose linear SVM first. Justify the order of attempts.
() Linear models are forbidden above 10 dimensions
(*) d ≫ n already lives in a rich space (Cover: high dimensions linearize) — linear SVM is strong, fast, and honest here, while RBF's infinite capacity on 200 points memorizes gorgeously and generalizes miserably; try linear first, escalate only on validated need
() RBF always beats linear regardless of n and d
() Linear SVMs cannot output probabilities, disqualifying them
::: explanation
Cover's theorem: $n$ points in high $d$ are separable with high probability — the lifting already happened (by measurement, not kernel). RBF on top is capacity squared on evidence-starved data. Simple-first is not timidity; it's the validated base rate against which fancier models must *earn* their keep.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (margin types and C-direction lead); perceptron update statement.
* **7 Marks:** Hand traces (perceptron runs, backprop steps), margin comparisons with norms, or kernel/C prescriptions with justification.
:::

### Essay Question 1 (7 Marks)
**Q: Trace the perceptron on A(2,2)+, B(3,3)+, C(0,1)−, D(1,0)− from zeros (order cycling), state the final boundary, and relate mistake count to the theory.**

**Model Answer:** Ep0: A✓, B✓, C✗ → $w=[0,-1], b=-1$; D✓ (−1). Ep1: A✗(−3) → $w=[2,1], b=0$; B✓; C✗(+1) → $w=[2,0], b=-1$; D✗(+1) → $w=[1,0], b=-2$. Ep2: all correct — boundary $x_1 = 2$. Four mistakes then silence: finite, as separability plus $(R/\gamma)^2$ promised (bound ≈ 72 — valid, loose, typical).

### Essay Question 2 (7 Marks)
**Q: Two separators score identically on training with ‖w‖ = 0.5 and 4. Which generalizes better and why? Then explain how C and γ would be set for noisy sensor data.**

**Model Answer:** The $\lVert w\rVert = 0.5$ separator: corridor $4.0$ vs $0.5$ — $8\times$ the perturbation tolerance (margin theory). For noisy sensors: small $C$ (forgive mislabels; huge $C$ frames poison as support vectors) and modest $\gamma$ validated (spiky RBF memorizes noise; blunt RBF underfits signal) — strictness and locality both tuned down, then proven on held-out folds.
