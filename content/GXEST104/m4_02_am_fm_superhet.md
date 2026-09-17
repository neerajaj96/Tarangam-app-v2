# AM, FM & Superheterodyne Receivers

**Stamping audio onto carriers — amplitude vs frequency fingerprints, and the mixer that tames any station to one IF.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Height vs Pace Writing
**AM** writes the message in the carrier's *height* (envelope follows audio; static crashes the party by faking height). **FM** writes it in the carrier's *pace* (bunches/spreads waves; static can't fake pace → cleaner music). **Superhet** dodges building $100$ tuned amplifiers: mix every station with a local oscillator down to one fixed **IF** ($455$ kHz AM / $10.7$ MHz FM), then amplify/filter once, superbly.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 AM vs FM (no derivations — concept + contrast)

AM: $c(t) = [A_c+m(t)]\cos\omega_ct$ — envelope carries audio; simple/cheap, noise-prone, narrow. FM: $c(t) = A_c\cos(\omega_ct+k_f\!\int\!m)$ — constant envelope, noise-robust, wideband hi-fi. Modulation index flavours depth/deviation (statement-level).

### 2.2 Superhet chain (both receivers)

Antenna → RF amp/tuning → **mixer + local oscillator** → fixed **IF stage** (gain + selectivity) → demodulator (envelope detector AM / discriminator FM) → audio amp → speaker. Same skeleton; detector + IF differ.

::: callout-formula KTU Formula Vault: Radio
AM = **height-stamped** · FM = **pace-stamped** · superhet = **mix to fixed IF, amplify once** · IF: **455 kHz AM / 10.7 MHz FM**.
:::

::: callout-pitfall IF Values Are Band-Specific
$455$ kHz belongs to AM, $10.7$ MHz to FM — swapped IF numbers fail the receiver question outright. Pair each IF with its band every time you write it.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Explain AM and FM with waveforms, then the AM superhet receiver block diagram. Why not amplify at the station frequency directly?"
:::

::: step [Step 2: Execution] Waves, Boxes, Reason
1. Sketch carrier, message, AM envelope, FM bunching — four aligned axes, the standard figure.
2. Chain with role-lines; IF $455$ kHz named.
3. Reason: one optimised fixed-frequency strip beats $100$ retuned ones (gain + sharp filtering + tracking sanity) — economics and selectivity in one move.
:::

::: step [Step 3: Conclusion] Final Result
Waveforms prove modulation understanding; the mixer justifies the architecture. "Why superhet" (single IF strip) is the analysis mark beyond the diagram.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why is FM more noise-immune than AM for music?
(A) Higher carrier power always
(*B) Information lives in frequency deviations; amplitude-targeting static barely perturbs zero-crossing pace (plus limiters strip residual AM)
(C) FM uses shorter antennas
(D) AM is digital
::: explanation
Noise adds amplitude; FM reads timing. Limiter stages erase what's left of AM contamination before detection — domain separation (pace vs height) is the immunity mechanism.
:::

::: quiz Q2: Foundational Concept
What problem does the superheterodyne architecture solve?
(A) Weak antennas
(*B) Building high-gain sharp-selectivity amplification separately per station frequency — mixing everything to one fixed IF needs only one excellent strip
(C) Battery drain
(D) Speaker size
::: explanation
Tuned-RF needs tracking multi-gang filters per station (drift, cost, poor shape factor). Fixed-IF filtering/amplification is designed once, optimally — heterogeneity in, homogeneity inside.
:::

::: quiz Q3: Foundational Concept
AM still rules aviation/emergency bands despite FM quality. Why?
(A) Nostalgia
(*B) Simplicity/cheapness, long-range propagation, and graceful degradation (weak AM stays intelligible; FM captures-or-mutes) — plus huge installed base
(C) AM is digital-ready
(D) FM is illegal there
::: explanation
Capture effect makes weak FM vanish under stronger signals — dangerous for safety comms; AM's linear fade stays readable longest. Propagation + graceful failure beat fidelity where lives ride.
:::
