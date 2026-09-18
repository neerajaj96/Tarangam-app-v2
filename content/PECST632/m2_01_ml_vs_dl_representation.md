# ML vs DL & Representation Learning

**Hand features vs learned features — the paradigm break, width/depth roles, and why depth won vision.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Hiring Scouts vs Academy
Classical **ML** hires scouts (engineers hand-craft features: SIFT edges, MFCC spectra — talent bottleneck, domain priesthood!). **DL** runs an academy (raw pixels/waves in, *layers learn* edges→motifs→objects — features as trainable coordinates). **Width** adds vocabulary per level (more detectors); **depth** adds grammar levels (composition rounds). Academy beats scouts where data floods (labels + GPUs + depth conspired ~2012!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Break + width/depth economics

* ML: $y = f(\phi(x))$, $\phi$ fixed/human; DL: $\phi_\theta$ learned end-to-end (gradients reach features!).
* Width: memorisation capacity ($\approx$ parameters, VC-ish scaling); depth: compositional efficiency (exponential gaps for hierarchical functions — Telgarsky-style separations!).
* Data/compute thresholds: DL wins past label abundance (hand-features win tiny-data — no free lunch!).

::: callout-formula KTU Formula Vault: Paradigm
ML: **fixed $\phi$** · DL: **learned $\phi_\theta$** · width = **vocab**, depth = **grammar** · data floods ⇒ **academy wins**.
:::

::: callout-pitfall Depth Worship on Tiny Data
$10^3$ samples + $10^7$-param net = memorisation pageant (validation weeps!) — small-data regimes still crown engineered features/shallow models. Regime-match (data vs capacity) precedes architecture fashion, always.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Two tasks: (a) $500$ labelled X-rays (rare disease), (b) $10^7$ labelled street photos (car models). ML-vs-DL prescription each + representation note?"
:::

::: step [Step 2: Execution] Regime Matching
1. (a) Engineered features + shallow/transfer (frozen backbone features as $\phi$!): data-starved, augmentation + cross-validation discipline, uncertainty-aware outputs.
2. (b) Deep CNN end-to-end (learned hierarchy devours labels; width for fine-grained trims, depth for part compositions).
:::

::: step [Step 3: Conclusion] Final Result
Data-regime first (starved/flooded), paradigm second, transfer as bridge (frozen $\phi$ + small head = best of both!). Regime-prescription pairs are the applied answer shape.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
End-to-end learning's defining move vs classical ML:
(A) Bigger datasets only
(*B) Gradients reach *representation* ($\phi_\theta$ trains with the classifier — features optimised for the task loss, not human aesthetics)
(C) More layers cosmetically
(D) Faster GPUs
::: explanation
Joint optimisation (features + decisions, one loss) beats staged pipelines (frozen human $\phi$ + learned head) past data thresholds — credit flows everywhere gradients reach. Reach-of-gradients is the paradigm line.
:::

::: quiz Q2: Foundational Concept
Width vs depth budget split wisdom:
(A) All width, always
(*B) Depth for compositional structure (shared-part hierarchies), width for level capacity (fine distinctions per level) — compound scaling (both, balanced — EfficientNet moral!) beats single-axis stuffing
(C) All depth, always
(D) Random split
::: explanation
One-axis stuffing hits diminishing returns (width memorises, depth starves of level-vocab); balanced compound growth scales both grammar and vocabulary. Scaling *strategy* (joint ratios) outranks raw size.
:::

::: quiz Q3: Foundational Concept
Transfer learning (frozen backbone + new head) works because:
(A) Backbones memorise new classes
(*B) Learned hierarchies generalise (edges/textures/parts reuse across visual domains!) — new task needs only head-mapping atop universal mid-features (data-frugal bridge ML↔DL!)
(C) Heads are smart
(D) Freezing speeds coding
::: explanation
Feature reuse across tasks (mid-level generality!) is representation learning's dividend — frozen $\phi$ + trained head marries DL features to small-data regimes. Generality gradient (early-general → late-specific) guides freeze depth.
:::
