# AC Fundamentals: Generation, RMS, Average & Form Factor

**Coil in a magnetic field makes sine waves — frequency/period, average vs RMS, and form-factor problems.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Spinning Ladder Shadow
Rotate a ladder (coil) in sunlight (magnetic field): its shadow length swings $+max\to0\to-max$ sinusoidally — that's generation (flux-linkage $NAB\cos\omega t$ differentiated). **Average** over a half-cycle rectifies-then-means ($2V_m/\pi$); **RMS** squares first (heating-equivalent DC: $V_m/\sqrt2$). Heaters care about RMS; rectifiers about average; their ratio (form factor $1.11$) fingerprints sine purity.
:::

::: anim sine-phasor Phasor Spins, Sine Appears
Track the tip's height as the phasor turns: 0° → zero, 90° → peak, 180° → zero — the wave is the rotation's shadow.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Generation and wave terms

$e = E_m\sin\omega t$ from rotation at $\omega = 2\pi f$; $f = 1/T$; instantaneous/peak/peak-to-peak ($2V_m$).

### 2.2 Average, RMS, form factor (sine)

$$V_{avg} = \frac{2V_m}{\pi} \approx 0.637V_m \quad (\text{half-cycle}), \qquad V_{rms} = \frac{V_m}{\sqrt2} \approx 0.707V_m$$

$$k_f = \frac{\text{RMS}}{\text{Average}} = \frac{\pi}{2\sqrt2} \approx 1.11, \qquad k_p = \frac{\text{peak}}{\text{RMS}} = \sqrt2 \approx 1.414$$

Full-cycle average of pure sine $= 0$ (symmetry) — average always means half-cycle (rectified) unless stated.

::: callout-formula KTU Formula Vault: AC Measures
Avg **$0.637V_m$** · RMS **$0.707V_m$** · form **$1.11$** · peak factor **$1.414$** · full-cycle avg **$0$**.
:::

::: callout-pitfall Mains $230$ V Is RMS
$230$ V wall supply peaks at $230\sqrt2 \approx 325$ V. Using $230$ as $V_m$ undersizes insulation questions by $41\%$ — convert RMS→peak first whenever peaks matter.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Sine voltage, $V_m = 100$ V. Find $V_{avg}$ (half-cycle), $V_{rms}$, form factor. Then: $50$ Hz mains — period and $\omega$?
:::

::: step [Step 2: Execution] Two Ratios, One Clock
1. $V_{avg} = 0.637\times100 = 63.7$ V; $V_{rms} = 70.7$ V; $k_f = 70.7/63.7 \approx 1.11$.
2. $T = 1/50 = 20$ ms; $\omega = 314$ rad/s.
:::

::: step [Step 3: Conclusion] Final Result
$0.637/0.707/1.11$ for sines; $20$ ms/$314$ rad/s for $50$ Hz mains. These five numbers answer every AC-fundamentals numerical's first half.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Sine current $I_m = 14.14$ A. RMS and half-cycle average?
(A) $14.14$ and $14.14$
(*B) $14.14/\sqrt2 = 10$ A; $0.637\times14.14 \approx 9.0$ A
(C) $10$ and $10$
(D) $7.07$ and $4.5$
::: explanation
$14.14 = 10\sqrt2$ is engineered: RMS exactly $10$ A, average $\approx 9$ A. Recognise $\sqrt2$-scaled round numbers — examiners plant them as gifts.
:::

::: quiz Q2: Foundational Concept
Why is full-cycle average of a sine zero, yet average is quoted $0.637V_m$?
(A) Contradiction in theory
(*B) Symmetric halves cancel over full cycles; "average" by convention means the rectified (absolute) half-cycle mean used by meters
(C) RMS replaces it
(D) Frequency is too high
::: explanation
Positive and negative lobes annihilate in a plain mean. Instruments rectify first (or compute RMS); convention follows the use — half-cycle mean for average-responding meters, RMS for heating.
:::

::: quiz Q3: Numerical Drill
$230$ V, $50$ Hz mains. Peak voltage and peak factor?
(A) $230$ V, $1.0$
(*B) $230\sqrt2 \approx 325$ V; $k_p = 1.414$ — insulation must survive $325$ V, not $230$
(C) $460$ V, $2.0$
(D) $162$ V, $0.707$
::: explanation
Peak $= $ RMS$\times\sqrt2$; crest factor $1.414$ for sines. Mains-flavoured questions test exactly this conversion — RMS in, peak out.
:::
