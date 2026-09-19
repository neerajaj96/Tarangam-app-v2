---
id: m4_03_pcm_digitization_sampling_quantization
courseCode: PCCST501
module: 4
sequence: 3
title: 'PCM Digitization: Sampling & Quantization'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Floor sampling rates at twice the maximum frequency
  - Price bits against SNR at six decibels per bit
  - Multiply samples by bits into pipeline bit rates
concepts:
  - sampling theorem
  - quantization
  - PCM
prerequisites:
  - m4_02_nyquist_shannon_channel_capacity
examRelevance: medium
tags:
  - pcm
  - digitization
---
# PCM Digitization: Sampling & Quantization

**Nyquist sampling theorem, quantization levels vs. bits, the three PCM steps, bit-rate math, and why your voice is 64 kbps.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Flip-Book
Analog voice is smooth motion; digital voice is a flip-book — freeze the motion into stills fast enough (**sampling**) and coarsely enough (**quantization**), and the eye (ear) can't tell. Sample too slowly and fast motion aliases into ghosts (a wagon wheel spinning backward on film); round too coarsely and gradients turn to stair-steps (banding in images, hiss in audio). **PCM** is the three-step flip-book factory: sample → quantize → encode.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sampling: Nyquist Rate (the Other Nyquist!)

A signal with maximum frequency $f_{max}$ is perfectly reconstructible from samples taken at

$$f_s \ge 2 f_{max} \quad \text{(samples/sec)}$$

— the **Nyquist rate**. Undersample ($f_s < 2f_{max}$) and high frequencies *fold back* as phantom low frequencies (**aliasing**), unfixable after the fact. Practical systems sample slightly above the minimum and low-pass-filter the input first (anti-aliasing).

### 2.2 Quantization: Levels, Bits, Noise

Each sample's amplitude is rounded to one of $L$ levels, encoded in $n = \log_2 L$ bits. Finer levels = smaller rounding (**quantization**) error = higher SNR ($\approx 6$ dB per added bit — each bit halves the step size, quartering noise power). Uniform steps suit uniform signals; voice uses **non-uniform** companding ($\mu$-law/A-law: fine steps near silence where ears discriminate, coarse steps at shouts).

### 2.3 PCM Pipeline and Bit Rate

**Sample** (PAM pulses) → **Quantize** (round to levels) → **Encode** (bits). Total bit rate:

$$R = f_s \times n \quad \text{bits/sec}$$

Classic: telephone voice $f_{max} = 4$ kHz $\to f_s = 8000$/s, $n = 8$ bits ($L = 256$) $\Rightarrow R = 64$ kbps — the legendary **DS0** rate every phone network is dimensioned around. Audio CD: $44.1$ kHz $\times 16$ bits $\times 2$ channels $= 1.411$ Mbps.

::: callout-formula KTU Formula Vault: Digitization Math
Sample at **$\ge 2f_{max}$** · bits $n = \log_2 L$ · rate **$R = f_s \times n$** · voice: $8\text{k} \times 8 = \mathbf{64}$ kbps · SNR $\approx$ **6 dB per bit** · aliasing = undersampling ghosts, prevented by filtering + oversampling.
:::

::: callout-pitfall Two Nyquists, Two Different Claims
**Nyquist rate** ($2f_{max}$ sampling, this topic) reconstructs *analog waves*; **Nyquist bit rate** ($2B\log_2 L$, last topic) caps *digital symbols*. Same Harry Nyquist, different theorems — exams deliberately place both in one question to test exactly this split. Name which one before computing.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A music signal limited to $15$ kHz must be digitized with 12-bit quantization. (a) Minimum sampling rate? (b) Resulting bit rate? (c) If the channel offers only $200$ kbps, is this quality transmittable live — and what breaks if we sample at $20$ kHz instead?
:::

::: step [Step 2: Execution] Sampling, Rating, Checking
(a) $f_s \ge 2 \times 15{,}000 = 30{,}000$ samples/sec. (b) $R = 30{,}000 \times 12 = 360{,}000$ bps $= 360$ kbps. (c) $360 > 200$ kbps — **not** transmittable live at this quality (compress, cut bits, or accept delay). Sampling at $20$ kHz $< 30$ kHz minimum: frequencies $10$–$15$ kHz **alias** into $5$–$10$ kHz ghosts — permanent corruption no filter can undo afterward.
:::

::: step [Step 3: Conclusion] Final Result
Quality costs rate linearly in *both* knobs (samples × bits), and the sampling knob has a hard floor — below $2f_{max}$ you don't get "worse audio," you get *wrong* audio. Every digitization question is: floor the rate, multiply the bits, compare with the channel.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Human voice for telephony is band-limited to 4 kHz and quantized at 8 bits. What sampling rate and bit rate result, and why these exact numbers?
() 4000 samples/s and 32 kbps — sampling at fmax is sufficient
(*) 8000 samples/s (Nyquist minimum 2×4 kHz) and 64 kbps (8000×8) — the DS0 standard rate
() 44100 samples/s and 64 kbps — CD quality is mandatory for voice
() 8000 samples/s and 8 kbps — bits equal kilohertz by definition
::: explanation
$f_s \ge 2f_{max} = 8$ kHz minimum (aliasing floor); $R = 8000 \times 8 = 64{,}000$ bps. This DS0 $64$ kbps is the atom of telephone networks (24 of them make a T1 line) — the most deployed number in telecom history.
:::

::: quiz A 15 kHz signal is sampled at 20 kHz. What precisely goes wrong, and can post-processing rescue it?
() Nothing — 20 kHz exceeds 15 kHz so all is well
(*) Content between 10–15 kHz aliases down into 5–10 kHz (folding around fs/2 = 10 kHz); the ghosts are indistinguishable from genuine low frequencies, so no filter can remove them afterward
() The file is simply 10 kHz shorter in duration
() Aliasing only affects the volume, never the content
::: explanation
Sampling replicates the spectrum every $f_s$; at $f_s = 20$ kHz the $10$–$15$ kHz band folds onto $5$–$10$ kHz. Post-hoc, ghost and genuine energy occupy identical frequencies — inseparable by any filter. Prevention (prefilter + $f_s \ge 2f_{max}$) is the only cure.
:::

::: quiz Each extra quantization bit improves SNR by ≈6 dB. Why 6, and when is uniform quantization the wrong choice?
() 6 dB is an arbitrary industry convention with no basis
(*) Each bit halves the step size (quartering error power = 10·log₁₀4 ≈ 6 dB); uniform steps waste resolution on loud passages while starving quiet ones — voice uses μ-law companding (fine near silence, coarse at shouts) matching human hearing
() Bits add 3 dB each by international treaty
() Uniform quantization is always optimal for every signal type
::: explanation
Halved step → quartered quantization-noise power → $10\log_{10}4 \approx 6.02$ dB per bit. But perception is logarithmic: ears resolve whispers, not shouts — so companding concentrates levels where discrimination lives. Match the quantizer to the sensor, not the math.
:::
