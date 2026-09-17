# Fibre Optic Communication & Module 1 Numerical Drill

**Block diagram of the link plus a mixed drill: laser, fibre and photon-energy problems in one place.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Relay Race
A fibre link is a relay race: **transmitter** (diode laser/LED converts bits → light flashes) → **fibre** (the track) → **repeaters/amplifiers** (water stations boosting tired light) → **receiver** (photodiode converts flashes → bits). Whatever slows the runner — spreading pulses (dispersion), fading strength (attenuation), joining the wrong track (splice loss) — caps how far and fast you can race.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Block diagram (draw for exams)

Electrical signal → **optical transmitter** (laser diode + modulator/driver) → **fibre cable** (with splices/connectors) → **repeater / EDFA optical amplifier** every $\sim 80$ km → **photodetector** (PIN/APD) → amplifier + decoder → electrical output. Mention loss windows ($850/1310/1550$ nm) and why $1550$ nm wins (lowest silica attenuation $\approx 0.2$ dB/km).

### 2.2 Applications of fibres and lasers together

Communications backbone, endoscopy, fibre sensors (temperature/strain), decorative lighting, laser machining, surgery, holography, barcode/LIDAR.

### 2.3 Photon-energy toolkit for mixed problems

$E = h\nu = hc/\lambda$, $hc \approx 1240$ eV·nm. Ruby $694.3$ nm → $\approx 1.79$ eV; CO2 $10.6\,\mu$m → $\approx 0.117$ eV. Population ratio $N_2/N_1 = e^{-\Delta E/kT}$ shows why optical inversion is impossible thermally.

::: callout-formula KTU Formula Vault: Link + Photons
Link: **Tx → fibre → amp → Rx** · windows **850/1310/1550 nm** · photon **$E=hc/\lambda$, $hc\approx1240$ eV·nm** · dB loss: **$P_{out}=P_{in}\times10^{-\alpha L/10}$**.
:::

::: callout-exam KTU Exam Focus
Block diagram (with two-line role of each block) is a guaranteed 7–9 mark question. Pair it with one NA problem and one photon-energy computation and Module 1 is fully defended.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Photon energy of Ruby ($694.3$ nm) and CO2 ($10.6\,\mu$m) lasers. (b) Fibre loss $0.2$ dB/km over $80$ km — output fraction? (c) Why is $1550$ nm preferred for the link?
:::

::: step [Step 2: Execution] Solving All Three
1. $E = 1240/\lambda\text{(nm)}$: Ruby $1240/694.3 \approx 1.79$ eV; CO2 $1240/10600 \approx 0.117$ eV — infrared photons are $\sim 15\times$ weaker, but power comes from *numbers* of photons.
2. Total loss $= 0.2\times80 = 16$ dB → fraction $10^{-16/10} = 10^{-1.6} \approx 0.025$ ($\approx 2.5\%$ survives; hence repeaters/EDFAs).
3. $1550$ nm sits at silica's attenuation minimum ($\approx 0.2$ dB/km) and matches EDFA gain band — maximum repeater spacing.
:::

::: step [Step 3: Conclusion] Final Result
One method ($E = hc/\lambda$), one dB rule ($10^{-\alpha L/10}$), one fact (loss minimum). These three cover every Module 1 "extra" numerical KTU has asked outside pure NA.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Systems Concept
Which order correctly lists a fibre optic communication system?
(A) Fibre → transmitter → receiver → signal
(*B) Electrical input → optical transmitter → fibre → amplifier → photodetector → electrical output
(C) Photodetector → laser → fibre → LED
(D) Amplifier → transmitter → fibre → modulator
::: explanation
Bits must be converted to light (transmitter), guided (fibre), re-boosted (amplifier/repeater), then converted back (photodetector + decoder). Any option starting with fibre or ending with a transmitter breaks causality.
:::

::: quiz Q2: Numerical Drill
Ruby emission at $694.3$ nm corresponds to what photon energy?
(A) 0.12 eV
(*B) ≈ 1.79 eV
(C) 12.4 eV
(D) 3.5 eV
::: explanation
$E = hc/\lambda \approx 1240/694.3 \approx 1.79$ eV. Memorise $hc \approx 1240$ eV·nm — it converts every laser wavelength in one division.
:::

::: quiz Q3: Numerical Drill
A $50$ km fibre has $0.4$ dB/km loss. What fraction of power reaches the end?
(A) 50%
(*B) Total 20 dB → $10^{-2}$ = 1%
(C) 80%
(D) $e^{-50}$ ≈ 0
::: explanation
Total loss $= 0.4 \times 50 = 20$ dB, and $20$ dB is exactly a factor of $100$ ($10\log_{10}100 = 20$). So $1\%$ survives — the reason dB thinking (10 dB = ×10, 20 dB = ×100, 3 dB ≈ ×2) beats linear arithmetic in link budgets.
:::
