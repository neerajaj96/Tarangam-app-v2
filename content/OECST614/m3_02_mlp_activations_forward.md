---
id: m3_02_mlp_activations_forward
courseCode: OECST614
module: 3
sequence: 2
title: 'MLP Forward Pass & Activation Functions'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Stack perceptrons into committees with ReLU, sigmoid and tanh
  - Sweep fully hand-computed forward passes exactly
  - Prove linear stacks collapse without nonlinearity
concepts:
  - multilayer perceptron
  - activation choice
  - nonlinearity necessity
prerequisites:
  - m3_01_perceptron_learning
examRelevance: high
tags:
  - neural-networks
  - mlp
---
# MLP Forward Pass & Activation Functions

**Stacking perceptrons into committees — ReLU, sigmoid, tanh shapes and one fully hand-computed forward sweep.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Committee of Committees
One perceptron draws one straight border. An **MLP** stacks borders into regions: hidden neurons each draw a line, the output neuron judges their combined vote. **Activations** bend the vote — without them stacked layers collapse into one linear map, and depth is theatre.
:::

::: anim mlp-layers Two Inputs, Two Debaters, One Verdict
Inputs fan into every hidden unit, the hidden chorus funnels to output — the exact wiring the numbers below trace by hand.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Forward equations and activations

Layer rule: $z = Wx + b$, $a = \sigma(z)$. Sigmoid $\sigma(z) = 1/(1+e^{-z})$ squashes to $(0,1)$; tanh to $(-1,1)$ with zero-centred outputs; **ReLU** $\max(0,z)$ passes positives untouched and kills negatives (cheap, deep-friendly, dead-neuron risk on the negative side).

### 2.2 Why nonlinearity is load-bearing

Linear composed with linear stays linear ($W_2W_1x$ is one matrix), so depth without $\sigma$ adds zero expressivity. The activation is what makes depth deep.

::: callout-formula KTU Formula Vault: Forward
$z = Wx+b$, $a = \sigma(z)$ · sigmoid $(0,1)$ · tanh $(-1,1)$ · ReLU $\max(0,z)$ · linear-stack collapses, $\sigma$ prevents it.
:::

Same forward mathematics as `PECST632` M1's MLP topic, with smaller numbers so the exam-hall trace fits in the margin.

::: callout-pitfall Sigmoid-at-Output Confusion
Sigmoid outputs read as probabilities for binary tasks, but hidden ReLUs are not probabilities — quoting a hidden $0.6$ as "60 percent sure" mixes plumbing with verdict. Activations differ by layer role.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Net $2$-$2$-$1$: input $x = [1, 0.5]$. Hidden weights row-per-unit $W^{(1)} = [[0.4, -0.2],[0.3, 0.6]]$, biases $[0, 0]$, ReLU hidden. Output weights $[1, -1]$, bias $0$, sigmoid output. Compute the forward output.
:::

::: step [Step 2: Execution] Multiply, Bend, Combine
Hidden pre-activations: $z_1 = 0.4(1) - 0.2(0.5) = 0.3 \to 0.3$; $z_2 = 0.3(1) + 0.6(0.5) = 0.6 \to 0.6$. Output: $z = 1(0.3) - 1(0.6) = -0.3$. Sigmoid: $\sigma(-0.3) = 1/(1+e^{0.3}) = 1/(1+1.3499) = 1/2.3499 \approx 0.4256$.
:::

::: step [Step 3: Conclusion] Final Result
Output $\approx 0.4256$ — below $0.5$, so the untrained net leans class $0$. Every intermediate ($0.3$, $0.6$, $-0.3$) is cached, because backprop (M3.3) consumes exactly these values.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
ReLU of $[-2, 0, 3.5]$?
(A) $[-2, 0, 3.5]$ unchanged
(*B) $[0, 0, 3.5]$, negatives die and the boundary zero stays zero while positives pass through untouched
(C) $[1, 1, 1]$ binarized
(D) Undefined at $0$
::: explanation
$\max(0,z)$ clips below zero and is identity above. The kink at $0$ is handled by subgradient convention — forward evaluation just outputs $0$.
:::

::: quiz Q2: Collapse Proof
Two linear layers, no activation: $y = W_2(W_1x)$. Expressivity?
(A) Doubled by depth
(*B) Single linear map $W = W_2W_1$, so depth adds parameters but zero new functions — nonlinearity is the price of depth's power
(C) Quadratic automatically
(D) Depends on bias values
::: explanation
Matrix products collapse: two matrices multiply into one. Without $\sigma$ between them, a "deep" linear net is a shallow one wearing extra notation.
:::

::: quiz Q3: Activation Choice
Hidden layers of a deep net saturate under sigmoid (gradients near zero). Standard fix?
(A) More sigmoid layers
(*B) Switch hidden units to ReLU, whose positive-side gradient is exactly $1$ and never saturates for active units
(C) Remove all activations
(D) Shrink the dataset
::: explanation
Sigmoid flatlines for large $\lvert z \rvert$, throttling gradient flow; ReLU's active side passes gradients undiminished. That is why modern hidden layers default to ReLU family.
:::
