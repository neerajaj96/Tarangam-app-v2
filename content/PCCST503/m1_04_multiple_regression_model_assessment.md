# Multiple Regression & Model Assessment

**Many predictors, polynomial expansion, train/test discipline, R², and the bias–variance lens that previews all of Module 3.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Panel of Witnesses
One predictor is one witness — useful, limited. **Multiple regression** convenes the panel: price explained jointly by size *and* bedrooms *and* age, each coefficient testifying *holding the others fixed*. But panels overfit: with enough witnesses you can "explain" anything, including noise — memorizing the training lineup instead of learning the law. **Assessment** (held-out testing, R², bias–variance) is the cross-examination separating genuine understanding from expensive memorization.
:::

::: manim assets/videos/m1_08_multiple_regression.mp4 Multiple Regression Geometry
Watch the fitted plane tilt through a 3D point cloud as predictors join, then see training error keep falling while test error bottoms out and rises — the overfitting signature every later module fights.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Multiple and Polynomial Regression

Same normal equations, wider $X$: $w = (X^TX)^{-1}X^Ty$ with $d$ predictors; $w_j$ = effect of $x_j$ *ceteris paribus*. **Polynomial regression** is linear regression in disguise — expand features $(x, x^2, \dots, x^p)$ and fit linearly in the expanded space (linear in *weights*, curved in *x*; degree is a hyperparameter, not a fitted weight).

### 2.2 Assessment: R² and Held-Out Testing

* **Train/test split** (or cross-validation): fit on train, judge on unseen test — test error estimates *generalization*, train error does not.
* **R²** $= 1 - \frac{\sum(y_i-\hat{y}_i)^2}{\sum(y_i-\bar{y})^2}$: fraction of variance explained ($1$ = perfect, $0$ = mean-baseline, negative = worse than guessing the mean). Rises *by construction* with added predictors on train — judge it on test only.

### 2.3 Bias–Variance Preview

Expected test error $=$ **bias²** (rigidity: wrong model family) $+$ **variance** (wiggliness: sensitivity to the sample) $+$ irreducible noise. Simple models starve on bias; flexible ones drown in variance; test error bottoms at the sweet spot — the master tradeoff behind regularization, trees-vs-forests, and neural sizing across Modules 2–4.

::: callout-formula KTU Formula Vault: Regression Facts
Same equations, wider $X$ · polynomial = **linear in weights** · assess on **held-out data** · $R^2 = 1 - SS_{res}/SS_{tot}$ (test only!) · error $=$ **bias² + variance + noise** · train error **falls** with complexity, test error **U-turns**.
:::

::: callout-pitfall R² Worship (and Train-Error Theater)
Adding *any* predictor — even random noise — never lowers train $R^2$ (least squares exploits it), so train-$R^2 \approx 1$ advertises overfitting, not quality. Report test $R^2$; distrust any model selected *and* graded on the same data (selection contaminates the grade — nested validation exists for exactly this).
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Six house sales: sizes (1000 sqft units) $x = [1, 2, 3, 4, 5, 6]$, prices (lakh) $y = [12, 20, 25, 34, 41, 48]$. Fit a line, compute train $R^2$, then leave-one-out test the last point (fit on first five, predict $x=6$).
:::

::: step [Step 2: Execution] Fitting and Splitting
Means $\bar{x} = 3.5$, $\bar{y} = 30$. Slope $= \sum(x-\bar{x})(y-\bar{y})/\sum(x-\bar{x})^2 = 126/17.5 = 7.2$; intercept $= 30 - 7.2\times3.5 = 4.8$. Model $\hat{y} = 4.8 + 7.2x$; residuals $(0, +0.8, -1.4, +0.4, +0.2, 0)$ give $SS_{res} = 2.8$ against $SS_{tot} = 910$ → train $R^2 = 1 - 2.8/910 \approx 0.997$. Leave-one-out: fitting the first five points gives the same line $\hat{y} = 4.8 + 7.2x$ (slope $72/10 = 7.2$, intercept $26.4 - 21.6 = 4.8$), predicting $x=6 \to 48.0$ vs truth $48$ — error $\approx 0$ on unseen data.
:::

::: step [Step 3: Conclusion] Final Result
Train $R^2 \approx 0.997$ *and* held-out error $\approx 0$ — both grades agree, so the fit is genuine, not memorized. Had the left-out error been $15$ with $R^2$ still $0.997$, that divergence *would be* the overfitting diagnosis — agreement between the two grades is the certificate.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Train R² = 0.99 but held-out error is terrible. A student proposes adding more polynomial features to fix it. What is wrong?
() Nothing — more features always help generalization
(*) The symptom is overfitting (memorization), and more flexibility worsens it — the cure is less complexity, regularization, or more data, i.e. move left on the U-curve, not right
() R² cannot reach 0.99 on real data, so the report is fabricated
() Held-out error is meaningless; only train error matters
::: explanation
High train + bad test = variance disease (fit wiggles through noise). More features feed the disease. Treat by constraining capacity (lower degree, ridge penalty) or more samples — the bias–variance U-curve tells you *which direction* before you touch anything.
:::

::: quiz Why must model selection (picking degree, features) and final grading use different data — ideally nested splits?
() They don't need to; one split serves all purposes
(*) Selecting on the test set leaks it into training (the winner is partly chosen for test luck); nested validation keeps an untouched outer fold so the reported grade estimates fresh-data performance honestly
() Nested splits run faster than single splits
() Test sets are too small to select from but fine to grade on
::: explanation
Reusing test data for choices *fits* the test set by hand — the grade then measures luck + skill inseparably (selection contamination). Nested protocol: inner loop selects, outer loop grades the *procedure*. One clean grade beats ten contaminated ones.
:::

::: quiz Polynomial regression with degree 15 on 16 points achieves zero train error. Bias, variance, and the right response?
() Low bias, low variance — a perfect model, ship it
(*) Near-zero bias but enormous variance (wild oscillation between points — Runge-style); response: cut degree, regularize, or gather data — trade a little bias for a lot less variance
() High bias — the model is too rigid to fit
() Variance is irrelevant for deterministic algorithms
::: explanation
Sixteen parameters nail sixteen points (bias ≈ 0) while encoding every noise wiggle (variance huge) — textbook overfitting. The U-curve's right wall: each added degree buys bias it no longer needs at variance prices it can't afford. Regularize or simplify.
:::
