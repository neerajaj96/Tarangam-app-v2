---
id: m3_07_m3_mixed_drill
courseCode: PECST632
module: 3
sequence: 7
title: 'M3 Drill: Architectures at Pace'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Pick conv, recurrent or gated tribes from shape symptoms
  - Count tribe parameters without formula slips
  - Justify trade-offs under exam time pressure
concepts:
  - architecture triage
  - tribe trade-offs
prerequisites:
  - m3_01_cnn_layers_filters
  - m3_03_rnn_bptt
  - m3_05_lstm_gru
examRelevance: high
tags:
  - architectures
  - m3-drill
---
# M3 Drill: Architectures at Pace

**Conv vs recurrent vs gated — pick, count, and justify under exam time.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Tribes Sprint
Spatial tribe (share across pixels!) · sequential tribe (share across time!) · gated tribe (conveyor + bouncers!). Tribe by data shape (grid/stream/both!), count by tribe rules, justify by tradeoffs. Sprint!
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sprint sheet

Grid → conv (size/params/sharing!) · stream → RNN/BPTT (unroll/sum!) · long stream → LSTM/GRU (gates/conveyor!) · both → hybrids (CNN-features→RNN-time: video/caption classic!) · regularize (dropout/augment/decay!) · landmark logic (AlexNet bang, ResNet identity!).

::: callout-formula KTU Formula Vault: Sprint
Shape → tribe → count → tradeoff.
:::

::: callout-exam KTU Exam Focus
M3's 9-markers stage one tribe deeply (CNN numerics *or* RNN/LSTM mechanics with equations!) plus a landmark/comparison chaser (AlexNet vs ResNet *or* RNN vs LSTM!). Tribe-depth + chaser-breadth per answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Video action clips ($16$ frames $112\times112$): tribe pick + skeleton (layers!) + param hotspot guess + regularizer pair. Then: captioning extension in one line?"
:::

::: step [Step 2: Execution] Hybrid Prescription
1. CNN-per-frame (shared spatial features!) → temporal LSTM over frame embeddings (gated time!) — hybrid classic.
2. Hotspot: FC-after-flatten (millions!) → GAP-or-small-head remedy (named!).
3. Regularizers: dropout (FC!) + temporal jitter/crop augmentation (label-safe video copies!).
4. Captioning: +decoder LSTM emitting words (seq2seq video→text relay!).
:::

::: step [Step 3: Conclusion] Final Result
Tribe-hybrid reasoning (spatial then temporal!), hotspot remedy, regularizer pairing, one-line extension. Prescription completeness (pick+shape+count+risk!) is the applied-exam currency.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Handwriting strokes (pen trajectories) recognizer: tribe?
(A) Pure CNN on pixels
(*B) RNN/LSTM over stroke sequences (temporal order *is* the signal!; CNN-front optional for local stroke features — time-first, space-assisted!)
(C) MLP on raw points
(D) RBM alone
::: explanation
Data-shape sovereignty (ordered trajectories ⇒ recurrence!) overrules pixel-habit. Modality-order test (what varies meaningfully — time here!) picks tribes — shape, not fashion.
:::

::: quiz Q2: Mixed Drill
$3\times3$ conv, $C_{in}=32$, $C_{out}=64$, $S2$, $P1$, input $64\times64$. Out + params?
(A) $64\times64\times64$, $18{,}496$
(*B) Side $(64-3+2)/2+1 = 32$ (floor exact!) → $32\times32\times64$; params $(288+1)64 = 18{,}496$ — stride-halving with same-ish pad
(C) $32\times32\times64$, $18{,}432$ (bias-blind!)
(D) $31\times31\times64$
::: explanation
$(64-3+2) = 63$, $/2 = 31.5$, floor $31$, $+1 = 32$ (floor-then-increment order!). $(9\times32+1)\times64 = 289\times64 = 18{,}496$. Operation order (subtract→divide→floor→increment!) is the size-formula discipline.
:::

::: quiz Q3: Mixed Drill
Vanishing across *depth* (M1) vs across *time* (M3): unified view?
(A) Unrelated phenomena
(*B) Same disease (chained Jacobian products $<1$ compounding!) different axes (layers vs steps!) — same cures rhyme (gates≈shortcuts: additive paths! ReLU≈careful-$ \phi$ choices!) — axis-transposed twins
(C) Time version is harsher always
(D) Depth version unsolved
::: explanation
Product-of-Jacobians lens unifies (sub-unity chains fade, wherever chained!). Cure-rhyme (additive bypasses: residuals spatially, conveyors temporally!) shows principle transfer — one mathematics, two wards.
:::
