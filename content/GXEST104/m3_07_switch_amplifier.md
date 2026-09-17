# Transistor as Switch & Amplifier

**Cutoff/saturation slamming vs active-region finesse — inverter operation, LED driving, and small-signal voltage gain.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Door Slam vs Door Ajar
**Switch:** kick the door fully shut (saturation, $V_{CE} \approx 0.2$ V, lamp ON) or fully open (cutoff, lamp OFF) — no finesse, just two states (the inverter/LED driver). **Amplifier:** hold the door ajar at mid-Q (active) and wiggle it — small base wiggles swing large collector voltage seesaws ($A_V = -R_C/r_e'$), inverted. Slammers switch; holders sing.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Switch design

ON: drive $I_B \ge I_{C,sat}/\beta$ (forced $\beta$ overdrive guarantees saturation despite spreads); OFF: $I_B = 0$ (cutoff, only leakage). Inverter: input high → saturated (output low $\approx 0.2$ V) and vice versa.

### 2.2 Amplifier essentials

Active Q, bypassed emitter resistor (keeps AC gain while stabilising DC), small-signal $A_V \approx -R_C/r_e'$ ($r_e' = 25\text{mV}/I_E$), $180^\circ$ CE inversion. Input sees biasing divider $\parallel$ $\beta r_e'$; output $\approx R_C$.

::: callout-formula KTU Formula Vault: Switch + Amp
Switch: **overdrive into saturation, starve into cutoff** · amp: **mid-Q + $A_V=-R_C/r_e'$** · $r_e'=25\text{mV}/I_E$.
:::

::: callout-pitfall Just-Enough Base Drive Fails Switching
$I_B = I_{C,sat}/\beta_{nominal}$ saturates only nominal parts — low-$\beta$ specimens stay active (hot, half-ON). Overdrive factor $2$–$5\times$ is the design rule, not a suggestion.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
npn drives a $12$ V, $60$ mA relay from a $5$ V logic pin. $\beta_{min} = 50$. Choose $R_B$ for hard saturation, then estimate stage gain if reused as amp with $R_C = 2$ k$\Omega$, $I_E = 1$ mA.
:::

::: step [Step 2: Execution] Overdrive, Then Gain
1. $I_{B,sat-edge} = 60/50 = 1.2$ mA; overdrive $\approx 2.5\times$ → $I_B = 3$ mA; $R_B = (5-0.7)/3\text{mA} \approx 1.43$ k$\Omega$ → use $1.2$ k$\Omega$ standard (more drive, safe).
2. $r_e' = 25$ mV$/1$ mA $= 25\,\Omega$; $|A_V| = 2000/25 = 80$ (inverted).
:::

::: step [Step 3: Conclusion] Final Result
Saturation designs in *current ratios* (overdrive), amplifiers in *resistance ratios* ($R_C/r_e'$). Ratio-thinking replaces formula-hunting in both.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Transistor inverter: input $0$ V gives output?
(A) $0.2$ V
(*B) $\approx V_{CC}$ (cutoff: no drop across $R_C$, output floats high) — low-in/high-out, the inversion
(C) $0$ V exactly
(D) Half $V_{CC}$
::: explanation
Zero base drive = cutoff = open switch: no $R_C$ current, no drop, collector sits at supply. High-in saturates (output $\approx 0.2$ V) — complementary slam, logic inversion done.
:::

::: quiz Q2: Numerical Drill
$R_C = 3$ k$\Omega$, $I_E = 1.5$ mA. $|A_V|$?
(A) $200$
(*B) $r_e' = 25/1.5 \approx 16.7\,\Omega$; $3000/16.7 \approx 180$
(C) $3$
(D) $4500$
::: explanation
$|A_V| = R_C/r_e'$ with $r_e' = 25\text{mV}/I_E(\text{mA})$. More bias current → smaller $r_e'$ → bigger gain (until loading/headroom bite) — the gain-current bargain in one division.
:::

::: quiz Q3: Foundational Concept
Why bypass the emitter resistor with a capacitor in amplifiers?
(A) Raises DC stability
(*B) $C_E$ shorts AC around $R_E$ (full AC gain $R_C/r_e'$) while $R_E$ keeps DC feedback stability — AC sees no degeneration, DC keeps it
(C) Blocks DC supply
(D) Tunes frequency
::: explanation
Unbypassed $R_E$ degenerates AC gain ($\approx -R_C/R_E$, small); bypassed, AC skips it. Split personalities by frequency: DC stable, AC hot — the standard-stage trick.
:::
