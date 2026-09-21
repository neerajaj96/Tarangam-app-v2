---
id: m3_01_perceptron_learning_rule
courseCode: PCCST503
module: 3
sequence: 1
title: 'The Perceptron: Learning Rule & Limits'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the linear-separator problem in plain words first
  - Update mistake-driven weights with the perceptron rule
  - Bound mistakes on separable data with the convergence theorem and its conditions
  - Hit the XOR wall that demands hidden layers or kernels
concepts:
  - perceptron update
  - Novikoff convergence
  - XOR limitation
prerequisites:
  - m2_01_classification_boundaries_knn
examRelevance: high
tags:
  - neural-networks
  - perceptron
---
# The Perceptron: Learning Rule & Limits

**What problem the original neuron solves, what labelled points it needs, how mistake-driven updates train it, and where separability limits any guarantee.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A bouncer judges entrants by a weighted checklist: height times weight one plus shoes times weight two, past a threshold? Each mistake triggers one instant tweak: wrongly admitted, lower those traits' weights; wrongly rejected, raise them. No averaging, only repairs.

Tiny beginner example. Weights $[0,0]$, threshold $0$. Entrant $(2,2)$ labelled plus scores $0$, predicted plus by tie rule, correct, no change. Entrant $(0,1)$ labelled minus scores $0$, predicted plus, wrong, so subtract $(0,1)$: weights become $[0,-1]$. That subtraction is the whole algorithm.

Analogy as support, then dropped. Stubborn bouncer with a rope line. From here on we use exact terms only: weight vector, bias, margin, separable, Exclusive OR (XOR).

Abbreviations defined on first use: Exclusive OR (XOR). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $w$, $b$? | Weights and bias defining the rope line |
| What is $y\in\{+1,-1\}$? | True side, plus or minus |
| What is margin $\gamma$? | Smallest distance from points to some separator |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Find a straight separator for two classes using only mistake repairs.

**Data.** Labelled points $(x_i,y_i)$ with $y_i\in\{+1,-1\}$. Here $x_i$ is the feature vector, $y_i$ is its side.

**Goal.** Zero mistakes on train if any straight line can do it; otherwise expose inseparability honestly.

Prediction $\hat{y}=\text{sign}(w^Tx+b)$. Here $\text{sign}$ returns $+1$ for positive scores and $-1$ otherwise; $w^Tx+b=0$ is the boundary.

::: callout-intuition Core Mental Model: The Stubborn Bouncer
A bouncer judges entrants by a weighted checklist (height × w₁ + shoes × w₂ ≥ threshold?). Each mistake stings into an instant rule tweak: wrongly admitted → lower the weights of their traits; wrongly rejected → raise them. No patience, no averaging — pure mistake-driven learning. The **perceptron** is this bouncer in mathematics: predict $\text{sign}(w^Tx + b)$, and on every error add (or subtract) the offender's features once. Repeat until the club admits exactly the right crowd — *if* any single straight rope-line can separate them.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (straight separation) → data (labelled sides) → goal (no mistakes if separable) → method (mistake repairs) → model ($\text{sign}(w^Tx+b)$) → training (perceptron loop) → example → limitations.

### 3.1 Model and Update, Step by Step

On mistake ($y(w^Tx+b)\le 0$):

$$w \leftarrow w + \eta\, y\, x, \qquad b \leftarrow b + \eta\, y$$

Here $\eta=1$ is standard; scaling just rescales the boundary. Correct predictions change nothing. Cost $O(d)$ per step, where $d$ is dimension.

::: toggle Trace the §1 repair step by step
State: $w = [0,0]$, $b = 0$. Entrant $(2,2)$, $y = +1$: score $0·2+0·2+0 = 0$, sign gives $+1$ (tie rule) — matches $+1$, no change (correct predictions change nothing). Entrant $(0,1)$, $y = -1$: score $0$ → predicts $+1 \ne -1$ — mistake ($y·\text{score} = 0 \le 0$). Repair: $w \leftarrow [0,0] + 1·(-1)·(0,1) = [0,-1]$; $b \leftarrow 0 + 1·(-1) = -1$ (subtract the offender's features once). Recheck: $(0,1)$ now scores $-1$ → $-1$ correct. One mistake, one repair, ledger moved.
:::

::: toggle What do the `(R/γ)²` symbols mean, and why mistakes (not epochs)?
$R$ = data radius (all $\|x_i\| \le R$ — bounded inputs). $\gamma$ = margin (some unit separator clears every point by $\ge \gamma$ — separability with room). $(R/\gamma)^2$ = mistake ceiling (big margin/small radius = fast peace; tight margin = long war). Why mistakes: each mistake provably shrinks the angle to a perfect separator, so the count — not epochs or data order — is what the theorem bounds (order affects the path, never finiteness).
:::

Numbered loop:

1. Initialise $w=0$, $b=0$.
2. Cycle through points in fixed order.
3. On mistake, add $yx$ to $w$ and $y$ to $b$.
4. Repeat epochs until one clean pass or a cap is hit.

### 3.2 Convergence Theorem, With Correct Qualifications

If data are linearly separable with margin $\gamma$ (some unit vector separates all points by at least $\gamma$) inside radius $R$ (all $\|x_i\|\le R$), the perceptron makes at most $(R/\gamma)^2$ mistakes, then stops forever. Big margin means fast peace; tiny margin means long war. Corrected qualification: the bound counts mistakes, not epochs; it assumes separability, bounded data, and unit-norm witness; presentation order affects the constant path but not finiteness. Without separability there is no promise: it can cycle forever, so always cap epochs in practice.

### 3.3 The XOR Wall

No single line separates $\{(0,0)-,(1,1)-\}$ from $\{(0,1)+,(1,0)+\}$. XOR needs a bend. One layer handles conjunctions, disjunctions, majorities, but not parity or XOR. This limitation paused neural research until hidden layers learned bends.

| Similar pair | Distinction that earns marks |
|---|---|
| Separable vs inseparable runs | Finite mistakes with $(R/\gamma)^2$ ceiling vs possible eternal cycling; cap epochs |
| Large vs tiny $\gamma$ | Few mistakes vs vacuous-but-valid huge bound |
| Perceptron vs logistic boundary | Hard mistake repairs vs soft $(p-y)$ steps; same linear expressiveness |

::: callout-formula KTU Formula Vault: Perceptron Facts
Predict **sign(w·x+b)** · mistake update **$w += yx$** · separable with margin $\gamma$ in radius $R$ ⇒ **≤ (R/γ)² mistakes then silence** · XOR-class concepts **impossible** single-layer · fix = **hidden layers** (next topic) or **kernels** (topic 4).
:::

::: callout-pitfall Convergence Needs Separability (and Says Nothing About Speed Otherwise)
The theorem's fine print *is* the theorem: inseparable data ⇒ infinite cycling, and separable-but-tight data ⇒ astronomically many mistakes before peace. "Perceptron always converges" without the separability qualifier is the classic half-truth — always state the condition first.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Points $A(2,2){+}$, $B(3,3){+}$, $C(0,1){-}$, $D(1,0){-}$ (separable: $x_1 = 2$ splits them). Run the perceptron ($\eta=1$, order A,B,C,D cycling) from zeros.
:::

::: step [Step 2: Execution] Mistakes Only
Start $w=[0,0], b=0$. **Epoch 0:** A: score $0 \to +$ ✓; B: $0 \to +$ ✓; C: $0 \to +$ ✗ (want −) → $w=[0,-1], b=-1$; D: $0-1-0=-1 \to -$ ✓. **Epoch 1:** A: $0-2-1=-3 \to -$ ✗ → $w=[2,1], b=0$; B: $6+3=9 \to +$ ✓; C: $0+1+0=+1 \to +$ ✗ → $w=[2,0], b=-1$; D: $2+0-1=+1 \to +$ ✗ → $w=[1,0], b=-2$. **Epoch 2:** A: $2-2=0 \to +$ ✓; B: $3-2=+1$ ✓; C: $-2 \to -$ ✓; D: $1-2=-1$ ✓ — clean pass, converged.
:::

::: step [Step 3: Conclusion] Final Result
Final $w=[1,0], b=-2$: boundary $x_1 = 2$ — exactly the human-obvious split, *discovered* through 4 mistakes and zero calculus. Scoreboard: separable data + mistake-driven updates = finite errors, guaranteed. (Try XOR points through the same procedure and watch it cycle forever — the wall, demonstrated.)
:::

::: anim perceptron-trace Four Mistakes, Then Silence at x1 = 2
Watch the rope-line settle at x₁ = 2 through four mistakes and a clean final pass — finite errors, guaranteed, with the XOR wall waiting next door.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Quoting convergence without separability. Always state margin and radius conditions first.
- Reading the bound as a prediction. It is a worst-case ceiling; actual mistakes are often far fewer.
- Expecting speed on tight margins. $(R/\gamma)^2$ explodes as $\gamma$ shrinks.
- Trying XOR on one layer. Needs hidden layer or kernel lifting.

Limitations: linear only, no probabilities, order affects path, no fix for inseparable except caps and extensions (voted or averaged perceptron, Support Vector Machines (SVMs)).

Exam recap: predict sign; update $w+=yx$ on mistakes; separable gives $(R/\gamma)^2$ mistakes; XOR impossible single-layer; hidden layers or kernels fix.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz The perceptron update fires only on mistakes (w += yx). Why is "learn only from errors" viable instead of wasteful?
() It isn't viable — all practical algorithms update on every example
(*) Correct predictions already satisfy the current boundary, so they carry no information about how to move it; mistakes alone indicate the repair direction — updates concentrate exactly where the model is wrong
() Mistakes are rarer and therefore cheaper to store
() The update rule cannot compute anything for correct predictions
::: explanation
An update's job is boundary repair; satisfied examples need none. Mistake-driven learning spends 100% of computation on informative cases — the same attention principle as cross-entropy's $(p-y)$ weighting (Module 2), in hard 0/1 form. Silence on success is efficiency, not laziness.
:::

::: quiz Data separable with margin γ inside radius R converges within (R/γ)² mistakes. What happens as the margin γ shrinks toward zero, and what does this say about "guaranteed convergence"?
() Convergence accelerates because small margins are easier
(*) Mistake bound explodes (÷γ²) — the guarantee holds but becomes vacuous in practice; at γ = 0 (inseparable) it vanishes entirely into infinite cycling
() The bound is independent of γ
() Small margins cause immediate convergence in one epoch
::: explanation
$(R/\gamma)^2$ prices separability: fat margins ⇒ few mistakes, hairline margins ⇒ eons. The theorem never promises *fast* — only *finite, given separability*. Practitioners cap epochs precisely because near-inseparable data turns the guarantee into a technicality.
:::

::: quiz Which concept can a single perceptron NEVER represent, and what minimal upgrade fixes it?
() AND — needs at least three layers
(*) XOR (parity-like bends) — no single hyperplane separates it; minimal fixes are a hidden layer (learned bends, next topic) or a kernel lifting it separable (topic 4)
() OR — perceptrons only do negations
() Any concept with more than two training points
::: explanation
Minsky–Papert: one hyperplane, one cut — XOR's diagonal pattern needs two. The field's decade-long winter came from this single impossibility; both escapes (learned hidden features vs. fixed kernel liftings) define the next two topics. One limitation, two industries.
:::
