# The Perceptron: Learning Rule & Limits

**The original neuron, mistake-driven updates, convergence on separable data with a traced run, and the XOR wall that froze the field.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Stubborn Bouncer
A bouncer judges entrants by a weighted checklist (height × w₁ + shoes × w₂ ≥ threshold?). Each mistake stings into an instant rule tweak: wrongly admitted → lower the weights of their traits; wrongly rejected → raise them. No patience, no averaging — pure mistake-driven learning. The **perceptron** is this bouncer in mathematics: predict $\text{sign}(w^Tx + b)$, and on every error add (or subtract) the offender's features once. Repeat until the club admits exactly the right crowd — *if* any single straight rope-line can separate them.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Model and Update

Predict $\hat{y} = \text{sign}(w^Tx + b)$ for $y \in \{+1,-1\}$. On mistake ($y(w^Tx+b) \le 0$):

$$w \leftarrow w + \eta\, y\, x, \qquad b \leftarrow b + \eta\, y$$

($\eta = 1$ standard — scaling just rescales the boundary.) Correct predictions change nothing: the perceptron learns *only* from errors, in $O(d)$ per step.

### 2.2 Convergence Theorem (Novikoff/Block)

If the data are **linearly separable** with margin $\gamma$ (some unit vector separates all points by $\ge \gamma$) inside radius $R$, the perceptron makes at most $(R/\gamma)^2$ mistakes, then stops forever — finite errors *regardless* of presentation order. Big margin ⇒ fast peace; tiny margin ⇒ long war. No separability ⇒ no promise (it cycles eternally — always cap epochs in practice).

### 2.3 The XOR Wall (Minsky & Papert, 1969)

No single line separates $\{(0,0){-}, (1,1){-}\}$ from $\{(0,1){+}, (1,0){+}\}$ — XOR needs a *bend*. One perceptron layer is provably limited to linearly separable concepts (conjunctions, disjunctions, majorities — but not parity/XOR). This single limitation froze neural research for a decade, until hidden layers (next topic) learned the bend themselves.

::: callout-formula KTU Formula Vault: Perceptron Facts
Predict **sign(w·x+b)** · mistake update **$w += yx$** · separable ⇒ **≤ (R/γ)² mistakes then silence** · XOR-class concepts **impossible** single-layer · fix = **hidden layers** (next topic) or **kernels** (topic 4).
:::

::: callout-pitfall Convergence Needs Separability (and Says Nothing About Speed Otherwise)
The theorem's fine print *is* the theorem: inseparable data ⇒ infinite cycling, and separable-but-tight data ⇒ astronomically many mistakes before peace. "Perceptron always converges" without the separability qualifier is the classic half-truth — always state the condition first.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Points $A(2,2){+}$, $B(3,3){+}$, $C(0,1){-}$, $D(1,0){-}$ (separable: $x_1 = 2$ splits them). Run the perceptron ($\eta=1$, order A,B,C,D cycling) from zeros. (Trace machine-verified.)
:::

::: step [Step 2: Execution] Mistakes Only
Start $w=[0,0], b=0$. **Epoch 0:** A: score $0 \to +$ ✓; B: $0 \to +$ ✓; C: $0 \to +$ ✗ (want −) → $w=[0,-1], b=-1$; D: $0-1-0=-1 \to -$ ✓. **Epoch 1:** A: $0-2-1=-3 \to -$ ✗ → $w=[2,1], b=0$; B: $6+3=9 \to +$ ✓; C: $0+1+0=+1 \to +$ ✗ → $w=[2,0], b=-1$; D: $2+0-1=+1 \to +$ ✗ → $w=[1,0], b=-2$. **Epoch 2:** A: $2-2=0 \to +$ ✓; B: $3-2=+1$ ✓; C: $-2 \to -$ ✓; D: $1-2=-1$ ✓ — clean pass, converged.
:::

::: step [Step 3: Conclusion] Final Result
Final $w=[1,0], b=-2$: boundary $x_1 = 2$ — exactly the human-obvious split, *discovered* through 4 mistakes and zero calculus. Scoreboard: separable data + mistake-driven updates = finite errors, guaranteed. (Try XOR points through the same procedure and watch it cycle forever — the wall, demonstrated.)
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
