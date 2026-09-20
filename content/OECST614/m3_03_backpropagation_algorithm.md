---
id: m3_03_backpropagation_algorithm
courseCode: OECST614
module: 3
sequence: 3
title: 'Backpropagation: Blame Travels Backwards'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Assemble deltas from activation derivatives exactly
  - Blame weights with delta-times-input products
  - Certificate post-update loss falls before moving on
concepts:
  - backpropagation
  - delta assembly
  - loss certificates
prerequisites:
  - m3_02_mlp_activations_forward
examRelevance: high
tags:
  - neural-networks
  - backpropagation
---
# Backpropagation: Blame Travels Backwards

**Output error becomes weight blame via the chain rule — one neuron's full backward trace with loss falling on cue.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Blame Audit
Forward pass spends money (makes a prediction); backward pass **audits who overspent**. Each weight's blame equals how much the loss moves when that weight wiggles — the chain rule ferries the output error backwards, multiplying by local slopes at every layer. Big blame, big correction.
:::

Forward values from M3.2 are the audit's receipts: backprop reuses every cached $z$ and $a$ instead of recomputing them.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The chain in one line

For squared loss $L = \tfrac{1}{2}(y-a)^2$ with $a = \sigma(z)$, $z = wx+b$: output delta $\delta = (a-y)\sigma'(z)$, then $\partial L/\partial w = \delta x$ and $\partial L/\partial b = \delta$. Update $w := w - \alpha\,\partial L/\partial w$. Sigmoid derivative $\sigma'(z) = \sigma(z)(1-\sigma(z)) \le 0.25$ — products of such terms across layers are why deep sigmoids vanish.

### 2.2 Post-update certificate

A correct step on this convex-in-$w$ single neuron must **reduce** the loss. Rising loss means sign or arithmetic error, not bad luck.

::: callout-formula KTU Formula Vault: Backprop
$\delta = (a-y)\sigma'(z)$ · $\partial L/\partial w = \delta x$ · $w := w - \alpha\,\partial L/\partial w$ · $\sigma' = \sigma(1-\sigma)$ · loss must fall.
:::

The full multilayer version repeats this per layer from output backwards — same delta logic, more bookkeeping.

::: callout-pitfall Forgetting the Activation Slope
Blame needs **both** factors: the output error $(a-y)$ and the local slope $\sigma'(z)$. Students multiplying by the error alone skip the squashing derivative and overshoot every correction.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Single sigmoid neuron: $x = 2$, $w = 0.5$, $b = 0$, target $y = 1$, rate $\alpha = 1$, loss $L = \tfrac{1}{2}(y-a)^2$. Compute forward values, the gradient, one update, and confirm the loss falls.
:::

::: step [Step 2: Execution] Forward, Blame, Correct
Forward: $z = 1.0$, $a = \sigma(1) \approx 0.7311$. Loss $= 0.5 \times 0.2689^2 \approx 0.03616$. Slope $\sigma' = 0.7311 \times 0.2689 \approx 0.1966$. Delta $= (0.7311-1)(0.1966) \approx -0.05287$. Gradient w.r.t. $w$: $-0.05287 \times 2 = -0.10574$. New $w = 0.5 + 0.10574 = 0.60574$. New $z = 1.21148$, new $a \approx 0.7707$, new loss $\approx 0.5 \times 0.2293^2 \approx 0.02629$.
:::

::: step [Step 3: Conclusion] Final Result
Weight $0.5 \to 0.6057$, loss $0.03616 \to 0.02629$. Direction sanity held throughout: output too low meant raising the weight on positive input — sign first, digits second.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Delta Assembly
$a = 0.8$, $y = 1$, $\sigma'(z) = 0.16$, $x = 3$. $\partial L/\partial w$?
(A) $-0.2$ by error alone
(*B) $\delta = (0.8-1)(0.16) = -0.032$, times $x = 3$ gives $-0.096$ — error times local slope times input, all three factors
(C) $+0.096$ by sign flip
(D) $0.16$ alone
::: explanation
Three-factor assembly: output gap, activation slope, input carriage. Dropping any factor (usually the slope) fabricates blame the chain rule never assigned.
:::

::: quiz Q2: Sigmoid Ceiling
Maximum of $\sigma'(z)$ and its depth consequence?
(A) $1.0$, no consequence
(*B) $0.25$ at $z = 0$, so $L$ sigmoid layers shrink gradients by up to $4^{-L}$ — the vanishing-gradient seed behind ReLU's rise in M3.2
(C) $0.5$ everywhere
(D) Unbounded above
::: explanation
$\sigma(1-\sigma)$ peaks at $\sigma = 0.5$ giving $0.25$. Chained multiplications by sub-$0.25$ terms decay exponentially — depth needs non-saturating slopes.
:::

::: quiz Q3: Certificate Check
After a backprop step the loss rises. Verdict?
(A) Normal, losses fluctuate
(*B) Arithmetic or sign error, because a correct gradient step on this single neuron must decrease the loss — recheck $\delta$'s sign before anything else
(C) Increase $\alpha$ immediately
(D) Blame the dataset size
::: explanation
Descent means descending: the update is literally minus gradient times positive rate. A rise falsifies the step's arithmetic — the loss certificate is the cheapest debugger available.
:::
