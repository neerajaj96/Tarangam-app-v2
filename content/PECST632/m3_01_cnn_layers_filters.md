---
id: m3_01_cnn_layers_filters
courseCode: PECST632
module: 3
sequence: 1
title: 'CNNs: Layers, Filters & Sharing'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Slide windows with convolution size arithmetic exact
  - Share weights into equivariance with pooling shrinkage
  - Price filter parameters against dense explosions
concepts:
  - convolutional layers
  - weight sharing
  - pooling
prerequisites:
  - m1_01_mlp_forward_pass
examRelevance: high
tags:
  - cnn
  - convolution
---
# CNNs: Layers, Filters & Sharing

**Seeing with sliding windows — convolution, pooling, and why sharing tames vision's dimensions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Cookie Cutters over Dough
A **filter** (tiny learned cookie cutter, say $3\times3$) slides over the image dough stamping match-scores (dot products!) into a **feature map** (edge map, texture map...). Same cutter everywhere (**sharing**: one cutter, all positions — translation *equivariance*! + parameter sanity vs MLP's per-pixel weights!). **Pooling** (max/average over neighbourhoods) summarises (small-shift *invariance* + downsampling!). Stack: edges→motifs→objects (M1 hierarchy, convolutional!).
:::

::: anim conv-slide Slide, Dot, Map
Window stops, dot product drops, map cell lights — shared weights ride every stop.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Conv arithmetic + layers

* Output size: $\lfloor(W-F+2P)/S\rfloor+1$ per side (filter $F$, pad $P$, stride $S$!).
* Params per layer: $(F\cdot F\cdot C_{in}+1)\times C_{out}$ (sharing: no position factor!).
* Layers: conv (+ReLU!) → pool → … → flatten → FC head; $1\times1$ convs (channel mixing, cheap depth!).

::: callout-formula KTU Formula Vault: Conv
Size **$(W-F+2P)/S+1$** · params **$(F^2C_{in}+1)C_{out}$** · share ⇒ **equivariance** · pool ⇒ **invariance+shrink**.
:::

::: callout-pitfall Padding/Stride Off-by-Ones
Floor + $+1$ both load-bearing (forget $+1$: $5\times5$, $F3$, $S1$, $P0$ gives $3$, not $2$!). Non-divisible strides floor silently (information edge-clipped!) — audit divisibility in arch answers.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Input $32\times32\times3$, conv: $16$ filters $5\times5$, $S1$, $P2$. Output dims? Params? Then $2\times2$ max-pool $S2$: dims after?"
:::

::: step [Step 2: Execution] Size, Count, Shrink
1. Side: $(32-5+4)/1+1 = 32$ (same-padding check: $P=(F-1)/2$ preserves!). Output $32\times32\times16$.
2. Params: $(25\cdot3+1)\times16 = 76\times16 = 1216$ (vs an MLP's $3072\times$hidden insanity — the sharing dividend, stated!).
3. Pool: $(32-2)/2+1 = 16$ → $16\times16\times16$ (quarter area, max-attitude kept!).
:::

::: step [Step 3: Conclusion] Final Result
Same-check ($P=(F-1)/2$), param count (sharing dividend), pool quartering — conv numerics in three moves. Dividend phrasing (vs dense!) shows *why*, not just what.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Input $28\times28\times1$, $8$ filters $3\times3$, $S1$, $P0$. Output + params?
(A) $28\times28\times8$, $80$
(*B) $(28-3)/1+1 = 26$ → $26\times26\times8$; params $(9\cdot1+1)\times8 = 80$ (bias counted!)
(C) $26\times26\times8$, $72$ (bias-blind!)
(D) $14\times14\times8$
::: explanation
Unpadded $3\times3$ shaves $2$/side ($26$); params $(9+1)\times8 = 80$. Bias-blind $72$ is the planted trap (M1.1's $+1$ moral returns!). Pool-then-halve ($14$) confuses stages — conv first, pool separately.
:::

::: quiz Q2: Foundational Concept
Sharing buys equivariance — meaning?
(A) Outputs never change
(*B) Shifted input ⇒ shifted (same-shaped) feature map (detector rides along!) — translation handled structurally; pooling then adds local *invariance* (small jitters vanish). Equivariance-then-invariance pipeline, named in order!
(C) Rotation-proof nets
(D) Fewer layers needed
::: explanation
Shared weights detect patterns *wherever* they sit (map shifts with input!); pooling summarises neighbourhoods (exact spot forgiven). Two-stage geometric reasoning (ride-then-forgive) is the CNN vision moral.
:::

::: quiz Q3: Foundational Concept
$1\times1$ convolutions exist to:
(A) Detect $1$-pixel objects
(*B) Mix channels cheaply (depth bottleneck: squeeze channels → cheap $3\times3$ → excite back — Network-in-Network/Inception/ResNet economiser!) + add nonlinearity per pixel-column
(C) Downsample spatially
(D) Replace pooling
::: explanation
Channel-mixing without spatial reach ($1\times1$ = per-pixel FC across channels!): bottleneck sandwich cuts $3\times3$ cost quadratically-ish. Cost-aware architecture (params per accuracy!) is the modern design lens — count before stacking.
:::
