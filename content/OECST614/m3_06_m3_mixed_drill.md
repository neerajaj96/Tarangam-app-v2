---
id: m3_06_m3_mixed_drill
courseCode: OECST614
module: 3
sequence: 6
title: 'M3 Drill: Neurons to Trees in One Sitting'
difficulty: intermediate
estimatedMinutes: 4
learningObjectives:
  - Sprint updates, sweeps, blame, splits and growth
  - Check signs, intermediates and ratios at every station
  - Keep neurons-to-trees chains straight at pace
concepts:
  - neurons-to-trees chain
  - station certificates
prerequisites:
  - m3_01_perceptron_learning
  - m3_02_mlp_activations_forward
  - m3_03_backpropagation_algorithm
  - m3_04_decision_trees_info_gain_ratio
  - m3_05_id3_algorithm_worked
examRelevance: high
tags:
  - neural-networks
  - m3-drill
---
# M3 Drill: Neurons to Trees in One Sitting

**Perceptron corrections, forward sweeps, backward blame, entropy splits, ID3 recursion — M3 as reflexes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Five-Station Circuit
Correct the voter, sweep forward, audit backwards, price the split, grow the branch. M3.2's cached intermediates feed M3.3's deltas — never recompute forward values mid-backprop.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Station kit

Mistake-only updates, separable-only convergence · $z = Wx+b$, ReLU/sigmoid/tanh roles · $\delta = (a-y)\sigma'(z)$, loss must fall · $H = -\sum p\log_2 p$, gain minus fragmentation-priced ratio · pure → leaf, else max-gain recurse.

::: callout-formula KTU Formula Vault: M3 Circuit
Update → sweep → blame → split → grow. Sign sanity, cached intermediates, bracket-checked F1-style ratios — certificates at every station.
:::

::: callout-exam KTU Exam Focus
M3's 9-markers chain one network both directions (forward values feed backward deltas) or pair a gain table with one ID3 branch. Number continuity across sub-parts is the fluency signal — reuse, never recompute.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Single tanh-free toy: sigmoid neuron $x = 1$, $w = 0.0$, $b = 0$, $y = 1$, $\alpha = 2$. (a) Forward $a$ and loss? (b) One update and new loss? (c) Entropy of a $3$Y/$1$N node?"
:::

::: step [Step 2: Execution] Full Circuit
(a) $z = 0$, $a = 0.5$, loss $= 0.5 \times 0.5^2 = 0.125$. (b) $\sigma' = 0.25$, $\delta = (0.5-1)(0.25) = -0.125$, gradient $= -0.125 \times 1 = -0.125$; new $w = 0 + 2(0.125) = 0.25$. New $z = 0.25$, $a = \sigma(0.25) \approx 0.5622$, loss $\approx 0.5 \times 0.4378^2 \approx 0.09583$. Fell $0.125 \to 0.0958$ as required. (c) $H = -(0.75\log_2 0.75 + 0.25\log_2 0.25) = 0.3113 + 0.5 = 0.8113$ bits.
:::

::: step [Step 3: Conclusion] Final Result
Weight $0 \to 0.25$, loss $0.125 \to 0.0958$, node entropy $0.8113$. Output-too-low raised the weight (sign sanity), loss fell (descent certificate), entropy sits inside $[0,1]$ (bracket check).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Perceptron $w = [0,0]$, $b = 0$, $\alpha = 1$, $x = (1,-1)$, $y = 1$. New bias?
(A) $0$, no mistake occurred
(*B) $1$, because $z = 0$ predicts $0 \ne 1$, so $b += 1 \times 1$ alongside $w = [1,-1]$
(C) $-1$ by sign error
(D) $0.5$ by halving
::: explanation
$z = 0$ votes $0$ under strict $>0$ — a genuine mistake with error $+1$. Bias takes the full $\alpha$ step exactly like a weight on a constant-$1$ input.
:::

::: quiz Q2: Mixed Drill
Hidden ReLU outputs $[0, 2]$, output weights $[0.5, -0.5]$, bias $1$, sigmoid out. Forward value?
(A) $0.5$
(*B) $z = 0.5(0) - 0.5(2) + 1 = 0$, so $\sigma(0) = 0.5$ — the dead ReLU contributes nothing and the bias exactly cancels the live path
(C) $1.0$ by ignoring bias
(D) $0.27$ by dropping ReLU
::: explanation
Dead units ($0$) vanish from the sum; $z = -1 + 1 = 0$ is the knife-edge the numbers were built to hit. Trace each term visibly — silent drops fail method marks.
:::

::: quiz Q3: Mixed Drill
Gain $0.4$, SplitInfo $2.0$. Gain ratio and verdict on a competing split with gain $0.3$, SplitInfo $0.6$?
(A) $0.2$ wins against $0.5$
(*B) Ratios $0.2$ vs $0.5$ — the lower-gain split wins after fragmentation pricing, which is precisely the correction gain ratio exists to make
(C) Raw gain always decides
(D) Ratios cannot be compared
::: explanation
$0.4/2.0 = 0.2$ against $0.3/0.6 = 0.5$. Fragmentation-heavy splits pay for their branches — ratio reversals over raw gain are the C4.5 signature move.
:::
