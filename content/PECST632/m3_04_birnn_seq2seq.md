# Bidirectional RNNs & Seq2Seq

**Reading both ways, and the encoder-bottleneck-decoder pattern that translates.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Proofreaders + Relay Translators
**BiRNN** hires forward *and* backward proofreaders (future context disambiguates "bank" — past+future concatenated per token!). **Seq2seq**: reader team compresses the French novel into one dossier vector (**encoder** finale!), writer team expands it into English (**decoder**, teacher-forced in training!). Bottleneck dossier strains on long novels (attention descendants relieve — previewed honestly as beyond-syllabus horizon!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 BiRNN + encoder-decoder mechanics

* BiRNN: $\overrightarrow{h_t}, \overleftarrow{h_t}$ (reversed pass!), concat $[\overrightarrow{h};\overleftarrow{h}]$ per token (whole-sequence needed — offline/biological-plausibility caveats!).
* Seq2seq: encoder finale $c$ (thought vector!) → decoder init; training teacher-forces (gold prefixes!), inference autoregresses (own guesses feed back — exposure gap noted!); losses per target token summed.

::: callout-formula KTU Formula Vault: Both-Ways + Relay
BiRNN = **forward+backward concat** · seq2seq = **encode-bottleneck-decode** · train **teacher-forced**.
:::

::: callout-pitfall Bottleneck Amnesia on Long Inputs
Fixed $c$ compresses novels to telegrams (early details fade — length curse redux!). Bottleneck-aware answers (chunk/hierarchy/attention-preview!) beat fixed-vector faith — capacity honesty per length.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Tag parts-of-speech in `Dogs chase cats` (BiRNN sketch: what disambiguates `chase`?) then translate `le chat dort` (seq2seq stations: encode/decode/gold-vs-free?)."
:::

::: step [Step 2: Execution] Context Then Relay
1. `chase`: forward proofreader sees subject-ish `Dogs` (verb-leaning!), backward sees object `cats` (verb-confirmed!) — concat resolves (unidirectional past-only might noun-guess!). 
2. Encoder reads $3$ French tokens → $c$; decoder emits $The$ (gold-fed), $cat$ (gold-fed…), $sleeps$; inference replays with *own* $The$, $cat$ (exposure gap named!).
:::

::: step [Step 3: Conclusion] Final Result
Disambiguation-by-future plus relay-stations with train/inference split named. Future-context example + exposure-gap footnote = complete sequence answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
BiRNN needs whole sequences upfront, hence:
(A) Always superior everywhere
(*B) Offline-only (no streaming realtime — future unavailable mid-stream!; unidirectional for live!) — latency-vs-context trade, stated per deployment (transcribe-live vs annotate-archive!)
(C) Twice the parameters wastefully
(D) No use in NLP
::: explanation
Future-reading costs latency (wait for sentence end!). Deployment splits: archive/annotation (bidirectional feast!) vs live/streaming (causal only!). Context appetite vs latency budget — regime picks directionality.
:::

::: quiz Q2: Foundational Concept
Teacher forcing's train/inference gap (exposure bias, M3.3 reunion!) mitigations:
(A) Ignore it, models cope
(*B) Scheduled sampling (mix gold/guesses increasingly!), beam-search training (sequence-level objectives!), professor-forcing-style alignment — train distribution approaches test distribution deliberately
(C) Bigger hidden states
(D) More epochs
::: explanation
Gold-prefix training never exercises recovery (inference lives in self-made beds!). Remedies feed model-own prefixes progressively (curriculum from truth to autonomy!). Distribution-match framing (train≈test inputs!) unifies the fixes.
:::

::: quiz Q3: Foundational Concept
Thought-vector bottleneck critique (long sentences) answered historically by:
(A) Bigger vectors infinitely
(*B) Attention (decoder peeks at *all* encoder states per step — bottleneck bypassed via dynamic context!; syllabus horizon: name as descendant, mechanics beyond scope — honesty over hallucinated detail!)
(C) Deeper encoders only
(D) Nothing, fine as is
::: explanation
Fixed-$c$ faith breaks at length (compression amnesia!) — attention's dynamic peeking is the acknowledged successor. Scope honesty (preview, not lecture!) beats invented mechanics in syllabus answers.
:::
