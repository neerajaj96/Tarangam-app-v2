---
id: m4_01_cv_speech_nlp_cases
courseCode: PECST632
module: 4
sequence: 1
title: 'CV, Speech, NLP & Case Studies'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Tokenize pixels, waves and tokens into tribe-shaped pipelines
  - Rule vision with CNNs, speech with RNNs and language with encoders
  - Separate classification cases from regression cases by shape
concepts:
  - deployment pipelines
  - case shapes
prerequisites:
  - m3_01_cnn_layers_filters
  - m3_03_rnn_bptt
  - m3_04_birnn_seq2seq
examRelevance: medium
tags:
  - applications
  - deployment
---
# CV, Speech, NLP & Case Studies

**Three flagship deployments — what each tokenizes, which tribe rules, and classification-vs-regression case shapes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Kitchens, Shared Pantry
**Vision** dices pixels (CNN tribe! detection = classify+localise boxes, segmentation = classify *pixels*!). **Speech** slices waves (spectral frames → acoustic RNNs → language models — pipeline heritage, end-to-end challengers!). **NLP** embeds words (vectors with algebra! seq2seq heritage → attention era — syllabus horizon noted!). **Pantry** (shared!): embeddings (dense learned lookups!), transfer (frozen backbones!), augmentation (domain copies!). **Cases**: classification (cross-entropy + confusion matrices!) vs regression (MSE + residual plots!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Deployment sketches + case discipline

* CV: conv backbone → task head (softmax / box-regressor / mask!); metrics (top-k, mAP, IoU!).
* Speech: frames (MFCC-ish!) → acoustic model → decoder + LM (WER metric!).
* NLP: tokenize → embed → encode → head (perplexity/BLEU-era metrics, task heads!).
* Cases: classification (calibration + confusion slices!) vs regression (residual diagnostics, $R^2$ + error bands!).

::: callout-formula KTU Formula Vault: Deployments
Pixels→**CNN+IoU/mAP** · waves→**frames+RNN+WER** · tokens→**embed+encode+heads** · cases: **confuse-vs-residual**.
:::

::: callout-pitfall Accuracy-Only Case Reports
Single scalar hides slices/failures/calibration (deployment-grade reporting: confusion slices, calibration curves, error bands, latency budgets!). Scalar-plus-slices discipline per case — number *and* anatomy.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Sketch (a) defect classifier (labels: scratch/dent/clean) reporting, (b) house-price regressor reporting — metrics + slices + one deployment risk each."
:::

::: step [Step 2: Execution] Two Case Shapes
1. (a) CNN-softmax + cross-entropy; report accuracy *plus* per-class precision/recall (dent-vs-scratch confusion!) + calibration (overconfident scratches?) — risk: new-defect shift (monitor + abstain!).
2. (b) MLP/GBM + MSE; report RMSE + $R^2$ + residual-vs-fitted (heteroscedastic luxury tail?) + prediction intervals — risk: out-of-range extrapolation (clip/flag!).
:::

::: step [Step 3: Conclusion] Final Result
Head+loss+metric-slices+risk per case; classification confuses (matrices!), regression residuals (plots!). Case-shape fluency (which diagnostics per task!) is the applied mark.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
IoU in detection measures:
(A) Classification accuracy
(*B) Box overlap quality ($|∩|/|∪|$ — localisation *precision*, thresholded per mAP averaging!) — separates *where* from *what* (class right + box sloppy = half credit by design!)
(C) Speed
(D) Confidence calibration
::: explanation
Localisation metric (geometry!), not labeling metric — mAP averages over IoU thresholds *and* classes (detection leaderboard currency!). Where-vs-what split structures detection answers.
:::

::: quiz Q2: Foundational Concept
WER (word error rate) can exceed $100\%$ because:
(A) Math error in metric
(*B) Insertions pile without bound ($(S+D+I)/N$ — chattering decoder inserts endlessly!) — unboundedness is *informative* (insertion pathology flagged, not clipped!)
(C) Test sets too small
(D) Decoders cheat
::: explanation
Edit-rate anatomy (subs/dels/inss over $N$!) can overflow via insertions — components read separately (insertion-heavy? LM weight? beam?). Component-wise WER reading beats scalar staring.
:::

::: quiz Q3: Foundational Concept
Embeddings (word/patch/audio) share one idea:
(A) Compression only
(*B) Learned dense lookups giving *geometry* (similarity ≈ meaning/proximity!) — discrete symbols → continuous neighborhoods (algebra emerges: king−man+women-ish!) — representation thesis, modality-free
(C) Encryption
(D) Speed hacks
::: explanation
Symbol-to-geometry move (neighbourhood = relatedness!) underlies transfer everywhere (pretrained vectors as features!). Geometry-from-co-occurrence is the distributional hypothesis operationalised — one idea, three kitchens.
:::
