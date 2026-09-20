---
id: m2_06_m2_mixed_drill
courseCode: PECST632
module: 2
sequence: 6
title: 'M2 Drill: Depth Decisions at Pace'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Triage regimes, units, histories and bottlenecks rapidly
  - Call floodplains for depth against deserts for classical
  - Decide depth questions from sprint-sheet reflexes
concepts:
  - depth triage
  - regime decisions
prerequisites:
  - m2_01_ml_vs_dl_representation
  - m2_02_activations_relu_family
  - m2_03_unsupervised_rbm
  - m2_04_autoencoders
  - m2_05_dl_applications
examRelevance: high
tags:
  - foundations
  - m2-drill
---
# M2 Drill: Depth Decisions at Pace

**Regime, activation, pretraining, bottleneck, floodplain — M2 as rapid triage.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Five-Stamp Sprint
Regime stamp → activation stamp → history stamp → bottleneck stamp → floodplain stamp. Sprint the circuit; each stamp one breath.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sprint sheet

Data-regime → paradigm · unit-fate → family · label-scarcity → pretrain-flavour · AE width → constraint-check · brief → floodplain-verdict + risk.

::: callout-formula KTU Formula Vault: Sprint
Regime → unit → history → bottleneck → floodplain.
:::

::: callout-exam KTU Exam Focus
M2's 9-markers stage activations *or* autoencoders/RBMs fully (mechanics + math + use), or representation essays (width/depth/paradigm). Mechanism-plus-math-plus-placement per part — triple completeness.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Unit pre-activations all $+5$: sigmoid/tanh/ReLU fates + gradients? AE $256\!\to\!256$ linear, no penalty, loss $0$: verdict + rescue? $2000$-sample tabular churn task: paradigm?"
:::

::: step [Step 2: Execution] Sprint Answers
1. Sigmoid $\approx 0.993$/grad $\approx 0.007$ (saturated trickle!); tanh $\approx 1.0$/grad $\approx 0$ (hard saturation!); ReLU $5$/grad $1$ (wide open!) — saturation audit in one probe.
2. Identity trap (wide, unconstrained, zero loss, zero features!) — rescue: bottleneck $32$ / sparsity / denoising (constraint menu!).
3. Gradient boosting (tabular + small + churn-auditability!) — DL declined with reasons (no neighbourhood grammar, sample hunger, opacity risk!).
:::

::: step [Step 3: Conclusion] Final Result
Fate-table, trap-verdict, regime-decline — sprint answers decide *and* justify in shared breaths. Justification density is the drill's scoring twin.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
ELU($\alpha=1$) at $x=-1$ vs LReLU($0.01$) at $x=-1$: outputs?
(A) $0$, $-0.01$
(*B) $e^{-1}-1 \approx -0.632$ vs $-0.01$ — ELU's curved floor vs leaky seep, same probe, different whispers
(C) $-1$, $-1$
(D) $0.368$, $0.99$
::: explanation
$e^{-1}-1 = 0.3679-1 = -0.6321$; $0.01\times(-1) = -0.01$. Probe-arithmetic (evaluate both at shared $x$) is the family-comparison format — shared probe, split fates.
:::

::: quiz Q2: Mixed Drill
RBM with $3$ visible, $2$ hidden: $P(h_1=1|v)$ needs:
(A) Full joint table
(*B) Only $v$ + row-1 weights (bipartite factorisation: unit's score from visibles alone — siblings irrelevant given $v$!)
(C) Other hiddens' states
(D) Labels
::: explanation
Conditional independence given the blanket (visibles screen hiddens from each other!) — per-unit sigmoid from its own weighted sum. Blanket reasoning (who screens whom) generalises beyond RBMs.
:::

::: quiz Q3: Mixed Drill
Floodplain verdict: $50$M logged ad-clicks (sparse ids) for CTR prediction. DL or trees?
(A) Trees always (tabular!)
(*B) DL-embeddings (sparse-id floodplain: learned dense vectors tame cardinality!; wide&deep hybrids marry memorisation+generalisation — sparse-scale regime, not small-tabular!)
(C) Linear only
(D) Coin flip
::: explanation
Scale + sparsity flip the tabular verdict (embeddings compress millions of ids learnably!). Regime features (cardinality, scale, structure) jointly decide — single-feature rules (tabular⇒trees) break at floodplain scale.
:::
