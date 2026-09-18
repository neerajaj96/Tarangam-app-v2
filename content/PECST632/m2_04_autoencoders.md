# Autoencoders: Bottlenecks That Learn

**Copy through a keyhole — undercomplete squeeze, and why identity needs constraints to teach anything.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Keyhole Copying
**Autoencoder** = photocopier forced through a keyhole (bottleneck!): encoder squeezes $x$→$z$ (tiny!), decoder rebuilds $\hat x$≈$x$ (reconstruction loss!). Keyhole *forces* gist-learning (can't memorise through a straw — principal variations only!). No bottleneck (wide + linear)? Learns identity photocopying (useless diploma!). Flavours constrain differently (sparse penalties, noise armour — M4's regularized zoo previews!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Bottleneck + loss + linear special case

* $z = f_{enc}(x)$, $\hat x = f_{dec}(z)$; loss $\|x-\hat x\|^2$ (+ constraints!).
* Linear + MSE + tight bottleneck = PCA subspace (classic theorem! — nonlinear/deep generalises eigenspaces!).
* Uses: pretrained features (M2.3 pipeline!), denoising/compression sketches, anomaly scores (high reconstruction error = weird input!).

::: callout-formula KTU Formula Vault: AE
Squeeze → rebuild · loss **reconstruction** · bottleneck (or constraint!) **mandatory** · linear-tight = **PCA**.
:::

::: callout-pitfall Wide Unconstrained AE Learns Identity
Capacity past the copying threshold *without* penalties/sparsity/noise = perfect useless photocopier (zero loss, zero features!). Constraint (bottleneck/sparse/denoising/contractive!) is load-bearing — unconstrained wide AEs teach nothing, diagnose via trivial loss + junk latents.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"AE $64\!\to\!8\!\to\!64$ linear, MSE, MNIST-ish vectors. (a) What subspace emerges? (b) Digit `9` reconstructs poorly (high error) vs `1`s fine — reading? (c) Widen hidden to $128$, no penalty — predict training vs usefulness?"
:::

::: step [Step 2: Execution] Subspace, Anomaly, Identity Trap
1. Top-$8$ PCA-ish subspace (linear-tight theorem!) — principal strokes span it.
2. `9` off-manifold (loops/curves underrepresented in training mix?) — error-as-anomaly-score (threshold it for novelty detection!).
3. Loss → ~$0$ (identity route!), latents junk (no pressure!) — textbook wide-unconstrained failure; add bottleneck-back/sparsity/denoising to rescue.
:::

::: step [Step 3: Conclusion] Final Result
Subspace-theorem, error-as-detector, identity-trap triad — AE literacy in three readings. Constraint-presence checked first in every AE design review.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Bottleneck necessity proof-sketch (why squeeze?):
(A) Saves disk only
(*B) Without capacity limits/penalties, identity minimises reconstruction trivially (features unlearned!) — squeeze *forces* principal-variation coding (compression-as-understanding pressure!)
(C) Speeds GPUs
(D) Tradition
::: explanation
Trivial-optimum argument: identity always available to big nets (loss floor zero, learning zero!). Constraints convert copying into *understanding* (gist under budget!) — pressure creates features, capacity alone copies.
:::

::: quiz Q2: Foundational Concept
Reconstruction error as anomaly score works when:
(A) Always perfectly
(*B) Training covered *normal* manifold tightly (errors small in-distribution!) so novelties stick out (high error = off-manifold!) — threshold tuned on validation novelties; contaminated training (anomalies inside!) blunts it
(C) Never reliably
(D) Only for images
::: explanation
Normality-model framing: AE learns normal's shape; deviations error loudly. Training-purity + threshold-calibration are the operating conditions — state both (dirty training or blind thresholds sink it).
:::

::: quiz Q3: Foundational Concept
Linear AE $\equiv$ PCA (tight) implies for deep nonlinear AEs:
(A) They're PCA too
(*B) Generalisation (nonlinear manifolds vs linear subspaces!) — same *spirit* (principal variations under squeeze), freed geometry (curved manifolds!) — theorem as compass, not cage
(C) Bottlenecks unneeded
(D) MSE wrong loss
::: explanation
Linear case anchors intuition (subspace!), depth curves it (manifolds!). Compass-not-cage: borrow the reading (principal-what?) while expecting nonlinear dividends (disentangling hopes live here — M4 autoencoder zoo extends!).
:::
