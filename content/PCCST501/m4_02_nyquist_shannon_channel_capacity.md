# Channel Capacity: Nyquist & Shannon Limits

**Noiseless signaling ceilings, noisy-channel capacity, SNR in decibels, and the two worked numericals that anchor every exam.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Shouting Across a Noisy Room
How fast can you convey information by shouting? Two separate ceilings: first, your **mouth speed** — syllables per second cap raw symbols no matter how perfect the silence (**Nyquist**: bandwidth × levels). Second, the **room noise** — in a quiet library you can whisper fine shades of meaning, but at a rock concert only crude yells survive (**Shannon**: bandwidth × log of signal-to-noise). Your actual rate is whichever ceiling is *lower* — physics grants no third option.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Nyquist: The Noiseless Ceiling

For a **noiseless** channel of bandwidth $B$ Hz using $L$ discrete signal levels:

$$C_{Nyquist} = 2B \log_2 L \quad \text{bits/sec}$$

More levels pack more bits per symbol ($\log_2 L$), but levels must stay distinguishable — noise (ignored here) is exactly what caps $L$ in practice. Binary ($L=2$): $C = 2B$.

### 2.2 Shannon: The Noisy Truth

For bandwidth $B$ with signal-to-noise ratio $\text{SNR}$ (linear, not dB):

$$C_{Shannon} = B \log_2(1 + \text{SNR}) \quad \text{bits/sec}$$

Decibel conversion (the step everyone fumbles): $\text{SNR}_{dB} = 10 \log_{10}(\text{SNR})$, so $30$ dB $\Rightarrow$ SNR $= 1000$, $20$ dB $\Rightarrow 100$, $10$ dB $\Rightarrow 10$. Shannon is the *law*: no coding scheme, however clever, sustains error-free transmission above $C$ — and codes exist approaching it arbitrarily closely.

### 2.3 Using Them Together

Nyquist assumes perfection (upper bound under ideal conditions); Shannon accounts for noise (the binding bound in practice). Given $B$, levels, and SNR, compute **both** — the achievable rate is $\min(\text{Nyquist}, \text{Shannon})$.

::: callout-formula KTU Formula Vault: The Two Laws
Nyquist (noiseless): **$2B\log_2 L$** · Shannon (noisy): **$B\log_2(1+SNR)$** · dB: **$10\log_{10}$** (30 dB = 1000×) · answer = **min of the two**. If the question gives SNR in dB, convert *first* — the #1 mark-loser.
:::

::: callout-pitfall Levels Are Not Free (and dB Is Logarithmic)
Doubling levels adds only *one* bit per symbol ($\log_2$) while halving noise margin — more levels help only while the receiver can still tell them apart. And $30$ dB is not "three times" $10$ dB: it is $1000\times$ vs $10\times$ power ratio. Linear intuition on logarithmic units fails every time.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A $3$ kHz telephone channel: (a) noiseless, binary signaling — max rate? (b) noiseless, 8 levels — max rate? (c) with $30$ dB SNR — Shannon capacity? (d) binding limit?
:::

::: step [Step 2: Execution] Computing Both Ceilings
(a) Nyquist: $2 \times 3000 \times \log_2 2 = 6000$ bps $= 6$ kbps.
(b) Nyquist: $2 \times 3000 \times \log_2 8 = 6000 \times 3 = 18{,}000$ bps $= 18$ kbps.
(c) SNR $= 10^{30/10} = 1000$. Shannon: $3000 \times \log_2(1001) \approx 3000 \times 9.97 \approx 29{,}902$ bps $\approx 30$ kbps.
(d) Noiseless claims (6 / 18 kbps) assume perfection; with real $30$ dB noise the Shannon $30$ kbps binds above the 8-level Nyquist $18$ kbps — so 8-level signaling at $18$ kbps is achievable, and no scheme on this line exceeds $\approx 30$ kbps error-free.
:::

::: step [Step 3: Conclusion] Final Result
Three numbers, one verdict: levels buy linear-ish gains (6 → 18 kbps), noise sets the absolute roof ($\approx 30$ kbps here). Every capacity question in the exam is this exact dance — convert dB, compute both laws, take the min.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz A noiseless 4 kHz channel uses 16-level signaling. A second, noisy 4 kHz channel has 20 dB SNR. What are the two ceilings, and which binds in practice?
() Nyquist 8 kbps; Shannon 4 kbps; Shannon binds
(*) Nyquist 2·4000·log₂16 = 32 kbps; Shannon 4000·log₂(101) ≈ 26.6 kbps; the noisy Shannon bound binds
() Nyquist 16 kbps; Shannon 80 kbps; Nyquist binds
() Both give 4 kbps; neither binds
::: explanation
Nyquist: $2 \times 4000 \times 4 = 32{,}000$ bps. $20$ dB $\Rightarrow$ SNR $= 100$; Shannon: $4000 \times \log_2 101 \approx 4000 \times 6.66 \approx 26{,}600$ bps. Reality has noise, so $26.6$ kbps binds — the 32 kbps assumes a perfection that doesn't exist.
:::

::: quiz Why can no coding scheme beat the Shannon capacity, yet engineers keep inventing new codes?
() Shannon's proof contains an error for modern modulations
(*) Capacity is an existence ceiling (reliable codes *approach* it arbitrarily closely); new codes close the *gap* between practical rates and the ceiling at finite complexity
() New codes increase the channel bandwidth itself
() Shannon capacity only applies to wireless channels
::: explanation
Shannon proved *achievability near* $C$ and *impossibility above* it. Real codes (turbo, LDPC, polar) compete on how close to $C$ they operate per unit of decoding effort — the ceiling stands, the staircase toward it keeps improving.
:::

::: quiz Doubling signal levels from 4 to 8 doubles the Nyquist rate. Why doesn't capacity keep doubling as levels explode?
() It does — infinite levels mean infinite capacity in all conditions
(*) Bits per symbol grow only logarithmically (log₂L) while noise tolerance collapses — and Shannon's noise-inclusive bound caps everything regardless of levels
() Levels beyond 8 are illegal under FCC rules
() The Nyquist formula stops applying above 8 levels
::: explanation
Each doubling buys exactly one more bit per symbol but halves inter-level spacing, so noise (which Nyquist ignores) bites harder — and Shannon, which *includes* noise via SNR, overrules levels entirely. Level inflation without SNR is elementary arithmetic chasing a physical limit.
:::
