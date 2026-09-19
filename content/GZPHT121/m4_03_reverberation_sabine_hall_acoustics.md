# Reverberation, Sabine & Hall Acoustics

**Echo vs reverberation, reverberation time, Sabine's formula, and the checklist for a good-sounding hall.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Bathtub Slosh
Shout in a bathroom: sound sloshes wall-to-wall, decaying as walls and bodies soak it up — that lingering tail is **reverberation** (dense overlapping echoes). Shout at a cliff: one clean late repeat returns — an **echo**. Too long a tail (cathedral) muddles speech; too short (padded cell) starves music. Sabine's formula is the drain-size equation: bigger room holds more slosh, more absorption drains it faster.
:::

::: anim sabine-decay Live Lingers, Dead Drops
Two tails to the $-60$ dB line — absorption sets the slope, volume sets the starting slosh.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Echo vs reverberation vs time

* **Echo:** distinct delayed repeat ($\gtrsim 0.1$ s gap, reflector $\gtrsim 17$ m away) — persistence of hearing $\approx 0.1$ s separates repeats from continuations.
* **Reverberation:** overlapping reflections blending into a decay tail after the source stops.
* **Reverberation time $T_R$:** seconds for sound to decay $60$ dB (to $10^{-6}$ intensity). Speech halls $\approx 0.5$–$1.0$ s; concert halls $\approx 1.0$–$2.0$ s.

### 2.2 Sabine's formula and absorption

$$T_R = \frac{0.161\,V}{A}, \qquad A = \sum_i \alpha_i S_i$$

$V$ = volume (m³), $A$ = total absorption in sabins (m²), $\alpha_i$ = absorption coefficient of surface $i$ (open window $= 1$). Audience ($\approx 0.5$ sabin/person) dominates — empty vs full hall differs audibly.

### 2.3 Factors for good acoustics (KTU list answer)

Adequate loudness everywhere; uniform distribution (diffusers, no dead spots); optimum $T_R$ for purpose; no echo/flutter (splay walls, absorb facing parallels); no focussing (avoid domes/vaults) and no dead silence zones; low background noise (isolate traffic/machinery); resonance control (shape ratios, absorbers at nodes).

::: callout-formula KTU Formula Vault: Acoustics
Echo needs **$\gtrsim 17$ m / $0.1$ s** · **$T_R = 0.161V/A$**, $A=\sum\alpha S$ · speech **$\sim 0.5$–$1$ s**, music **$\sim 1$–$2$ s** · audience $\approx 0.5$ sabin each.
:::

::: callout-pitfall 0.161 Is Unit-Locked
$0.161$ assumes $V$ in m³ and $A$ in m²-sabins (metric). Mixing feet or forgetting audience absorption are the two standard 3-mark slips — list units and occupants explicitly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Hall $20\times15\times8$ m; average $\alpha = 0.15$ over all surfaces; $200$ seats at $0.5$ sabin each. Estimate $T_R$. Speech-suitable?
:::

::: step [Step 2: Execution] Surfaces Plus People
1. $V = 2400$ m³. Surface $= 2(20\cdot15 + 20\cdot8 + 15\cdot8) = 2(300+160+120) = 1160$ m². Wall absorption $= 0.15\times1160 = 174$ sabins.
2. Audience $= 100$ sabins. $A \approx 274$. $T_R = 0.161\times2400/274 \approx 386/274 \approx 1.41$ s — musical, slightly long for crisp speech (add absorbers/curtains to reach $\sim 0.8$ s).
:::

::: step [Step 3: Conclusion] Final Result
People rival walls as absorbers — always count them. One Sabine computation plus a suitability verdict is the complete exam answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What distinguishes an echo from reverberation?
(A) Echo is louder
(*B) Echo is a distinct delayed repeat (≥0.1 s); reverberation is the blended decay tail of overlapping reflections
(C) Reverberation happens only outdoors
(D) They are the same phenomenon with different names
::: explanation
The ear fuses repeats closer than $\sim 0.1$ s into a continuous tail (reverberation); wider gaps resolve as separate echoes. Distance ($\gtrsim 17$ m for $0.1$ s at $340$ m/s) decides which you hear.
:::

::: quiz Q2: Foundational Concept
Why does a full audience shorten reverberation?
(A) People sing along
(*B) Each person adds ~0.5 sabin of absorption, raising $A$ in $T_R = 0.161V/A$
(C) People increase the volume
(D) Temperature drops
::: explanation
Clothing and bodies are excellent absorbers. $100$ extra people can add $\sim 50$ sabins — comparable to entire wall treatments — audibly drying the hall. Designers compute both empty and occupied $T_R$.
:::

::: quiz Q3: Foundational Concept
A hall suffers focussing echoes under a dome. Corrective action?
(A) Polish the dome brighter
(*B) Break focussing with diffusers/absorbers, splay parallel walls, and keep curvature radii large or treated
(C) Remove all absorption
(D) Increase volume only
::: explanation
Concave domes focus reflections into hot spots and dead zones. Diffusion (irregular coffers, tilted panels) plus targeted absorption at focal regions restores uniformity — the standard remediation triplet with flutter-echo control.
:::
