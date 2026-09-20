---
id: m2_03_unsupervised_rbm
courseCode: PECST632
module: 2
sequence: 3
title: Unsupervised Pretraining & RBMs
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Learn without labels through greedy layer-wise history
  - Run bipartite factorised conditionals with contrastive divergence
  - Stack, unroll and fine-tune into deep feasts
concepts:
  - restricted Boltzmann machines
  - contrastive divergence
  - layer-wise pretraining
prerequisites: []
examRelevance: medium
tags:
  - unsupervised
  - rbm
---
# Unsupervised Pretraining & RBMs

**Learning without labels — greedy layer-wise pretraining history and the Boltzmann machine that started feasts.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Apprenticeship Before Trade
Deep nets once *refused to train* (vanishing + poor basins!). **Greedy pretraining** apprenticed layers bottom-up: each learned to *reconstruct its input* (unsupervised — labels optional!), stacking into a fine-tuned graduate (supervised polish on top). **RBMs** (visible↔hidden, no within-layer ties — bipartite harmony!) learned $P(v)$ via contrastive divergence (dream-vs-reality statistics nudged together). History now (end-to-end usually wins!), but RBM/autoencoder DNA runs modern self-supervision.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 RBM mechanics + pretraining pipeline

* Energy $E(v,h) = -b^Tv - c^Th - v^TWh$; $P(v,h) \propto e^{-E}$; conditionals factorise (bipartite!): $P(h|v)$, $P(v|h)$ per-unit sigmoids.
* Contrastive divergence (CD-$k$): data-driven up-down-up statistics minus model-driven; gradient *approximation* (bias accepted, works!).
* Pipeline: train RBM-1 on data → freeze → hidden activations feed RBM-2 → … → unroll into MLP → supervised fine-tune (small LR!).

::: callout-formula KTU Formula Vault: RBM
Bipartite **factorised conditionals** · CD-$k$ **dream-minus-reality** · stack → **unroll → fine-tune**.
:::

::: callout-pitfall CD Is Biased (Accepted, Not Exact)
$k$-step reconstructions approximate model statistics (persistent chains improve!); bias acknowledged in the literature (works despite!). Exact-likelihood claims for CD-trained RBMs overstate — approximation-with-results, quoted honestly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Tiny RBM: $2$ visible, $1$ hidden, $W=[0.5,-0.5]^T$, biases $0$. Given $v=[1,0]$: $P(h=1|v)$? One CD-style reading of what the update does?"
:::

::: step [Step 2: Execution] Sigmoid of the Score
1. Score $= 0.5(1)+(-0.5)(0) = 0.5$; $P = \sigma(0.5) \approx 0.6225$ (hidden leans on).
2. CD nudges $W$ toward data-co-occurrence ($v_1h$ high) and away from dream-co-occurrence (reconstruction's) — weights track *data* correlations, forget *fantasy* ones.
:::

::: step [Step 3: Conclusion] Final Result
Score-then-sigmoid per unit (factorisation at work!), nudge-toward-data reading of CD. Bipartite independence makes per-unit math possible — cite it per computation.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Bipartite (no v–v/h–h ties) buys RBMs:
(A) More parameters
(*B) Factorised conditionals ($P(h|v)=\prod P(h_j|v)$ — parallel Gibbs sampling per layer!) — tractable inference/learning steps; full Boltzmann machines (lateral ties) pay intractable mixing
(C) Deeper stacks
(D) Labels for free
::: explanation
Independence-by-construction parallelises the inner loop (all hiddens at once given visibles!). Restriction (the R!) trades some expressivity for tractable steps — namesake bargain, quoted exactly.
:::

::: quiz Q2: Foundational Concept
Pretraining-then-finetune helped 2006-era depth by:
(A) More data magically
(*B) Layer-wise unsupervised init parked weights near *useful* basins (feature detectors pre-formed!) before supervised gradients (which then fine-tuned, small LR, without vanishing into randomness)
(C) Faster GPUs
(D) Better labels
::: explanation
Initialization-as-education: greedy stages solved easy subproblems (reconstruct!), supervised phase refined. Vanishing-era workaround turned representation insight (features worth pre-learning!) — history with a moral, not nostalgia.
:::

::: quiz Q3: Foundational Concept
Modern verdict on RBM pretraining (vs end-to-end + ReLU/norms/init):
(A) Still mandatory always
(*B) Mostly superseded for supervised wins (better plumbing trains raw!), but conceptual heir everywhere (self-supervised pretraining: BERT/GPT-style objectives are the grandkids — predict-masked-spans *is* greedy-pretraining grown up!)
(C) Proven useless
(D) Only for images
::: explanation
Technique retired, thesis promoted: unsupervised objectives *before* labels now rules NLP/vision (masked/contrastive pretraining at scale!). Lineage claims (RBM→autoencoder→BERT-baptism?) overstate direct descent — spirit, not code, inherits. Nuance graded.
:::
