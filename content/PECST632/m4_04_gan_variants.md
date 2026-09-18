# GANs & Variants

**Forger vs detective — minimax game, training choreography, and the family (conditional, DCGAN, cycle).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Counterfeiter vs Cop Academy
**Generator** prints fake bills (noise → images!); **discriminator** sniffs real-vs-fake (classifier!). Training alternates: cops study today's fakes (D step!), forger practices past cops (G step — fool-the-cop gradient!). Equilibrium: fakes indistinguishable (Nash daydream — practice oscillates!). **Variants**: conditional (label-steered generation!), DCGAN (conv architecture rules!), CycleGAN (unpaired translation via round-trip consistency — horses↔zebras without pairs!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Minimax + variants + failure gallery

* $\min_G\max_D \mathbb E[\log D(x)] + \mathbb E[\log(1-D(G(z)))]$ (saturating G-loss swapped in practice: $-\log D(G(z))$ — gradient alive early!); equilibrium $D\equiv\tfrac12$, $p_g=p_{data}$ (theory!).
* Conditional (labels in!), DCGAN (strided-conv/batchnorm/ReLU-leaky recipe!), CycleGAN (cycle-consistency $F(G(x))\approx x$!), WGAN-horizon (earth-mover + Lipschitz critics — stability lineage, preview!).
* Failures: mode collapse (forger's one-trick bill!), non-convergence (cops-vs-robbers forever!), vanishing cop-gradients (too-good D teaches nothing!).

::: callout-formula KTU Formula Vault: GAN Game
Forger **fools**, cop **spots** · loss **minimax** (G-loss **swapped practical**) · variants **steer/shape/translate**.
:::

::: callout-pitfall Equilibrium Theory ≠ Training Reality
Nash-existence proofs assume convex-concave infinities (neural nets: neither!) — practice oscillates/collapses/mode-drops. Theory-practice gap *stated* (stability bag: TTUR, spectral norm, R1 penalties!) — no equilibrium incantations in applied answers.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"G prints identical `7`s always; D calls everything fake with $99\%$. (a) Name both pathologies + mechanisms. (b) Prescribe three fixes with reasons. (c) Conditional variant's steering sketch?"
:::

::: step [Step 2: Execution] Diagnose, Prescribe, Steer
1. Mode collapse (G's single-trick optimum vs weak diversity pressure!) + overpowered-D (vanishing G-gradients — cop too good to teach!).
2. Fixes: minibatch discrimination / unrolled views (diversity pressure!), TTUR (D-slower balancing!), spectral-norm/R1 (Lipschitz taming!), WGAN-style critic rethink (meaningful loss landscape!).
3. Conditional: labels → both nets (G: requested digit dial! D: match-check!) — steered sampling (ask for `3`, get `3`-ish!).
:::

::: step [Step 3: Conclusion] Final Result
Pathology-pair diagnosis (collapse + cop-dominance!), fix-menu with mechanisms, steering sketch. Failure-first GAN literacy (what breaks, why, what tames) is the examiner's favourite angle.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Swapped G-loss ($-\log D(G(z))$ vs $\log(1-D(G(z)))$) exists because:
(A) Math elegance
(*B) Early-training saturation (D rejects confidently ⇒ $\log(1-D)$ flat gradients ≈ $0$ — nothing to learn!; $-\log D$ stays steep when D confident — gradient where needed, mode-seeking side-effect noted!)
(C) Faster code
(D) Tradition
::: explanation
Saturation audit (flat where learning must start!) motivates the swap; mode-seeking shift (reverse-KL flavour!) is the honest side-effect (diversity cost of steepness!). Saturation-first reasoning generalises to loss design broadly.
:::

::: quiz Q2: Foundational Concept
Cycle-consistency ($F(G(x))\approx x$) enables *unpaired* translation by:
(A) Memorizing pairs
(*B) Round-trip constraint (there-and-back ≈ identity!) structures the mapping without aligned examples (content preserved through style detour!) — under-constrained otherwise (any bijection fools D!), cycle loss + identity regularizers pin meaning
(C) Bigger generators
(D) More discriminators
::: explanation
Unpaired learning needs structural priors (round-trip ≈ identity!) replacing missing supervision. Constraint-as-supervision framing (losses encode beliefs!) generalises (contrastive/spatial variants rhyme!).
:::

::: quiz Q3: Foundational Concept
Mode collapse's tell-tale metric signature:
(A) High FID only
(*B) High precision + low recall/diversity (stunning few, missing many! — per-class histograms spiked, LPIPS-diversity flat!) — quality-without-coverage pattern (Inception-score fooled solo — fooled by one perfect trick!)
(C) Low loss everywhere
(D) Fast convergence
::: explanation
Quality-vs-coverage split (precision/recall disentangled!) diagnoses collapse (single-metric blindness exposed!). Metric-pair discipline (quality *and* diversity, always!) is the evaluation moral — solo scores lie by omission.
:::
