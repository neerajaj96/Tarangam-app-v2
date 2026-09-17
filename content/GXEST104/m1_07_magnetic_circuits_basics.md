# Magnetic Circuits: MMF, Reluctance & Electric Twins

**Coils as batteries, cores as wires — flux, MMF, reluctance, and the full electric↔magnetic dictionary.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Magnetic Plumbing
Voltage pushes current through resistance; **MMF** ($NI$, ampere-turns) pushes **flux** ($\Phi$, webers) through **reluctance** ($\mathcal{R} = l/\mu A$). Air gaps are clogged pipe sections (huge reluctance); iron cores are wide mains. Hopkinson's law $\Phi = NI/\mathcal{R}$ is Ohm's law in a magnetic costume — same algebra, new units.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Terminology and units

* **MMF** $F = NI$ (At), **field strength** $H = NI/l$ (At/m), **flux density** $B = \Phi/A$ (T), **permeability** $B = \mu H$ ($\mu = \mu_0\mu_r$), **reluctance** $\mathcal{R} = l/(\mu A)$ (At/Wb).
* Hopkinson: $\Phi = F/\mathcal{R}$.

### 2.2 Electric ↔ magnetic dictionary

| Electric | Magnetic |
|---|---|
| EMF $E$ (V) | MMF $NI$ (At) |
| Current $I$ (A) | Flux $\Phi$ (Wb) |
| Resistance $R = \rho l/A$ | Reluctance $\mathcal{R} = l/\mu A$ |
| Conductivity $\sigma$ | Permeability $\mu$ |
| $V = IR$ | $\Phi = NI/\mathcal{R}$ |

Differences: no magnetic insulator (flux leaks always); $\mu$ varies with $B$ (saturation) while $\rho$ stays put; no magnetic current that dissipates $I^2R$ heat in the core itself.

::: callout-formula KTU Formula Vault: Magnetics
**$F=NI$**, $H=NI/l$, $B=\Phi/A$, $\mathcal{R}=l/\mu A$ · Hopkinson **$\Phi=NI/\mathcal{R}$**.
:::

::: callout-pitfall $\mu$ Is Not Constant
Resistance is linear; reluctance saturates ($\mu_r$ collapses at high $B$). Linear magnetic math holds only on the unsaturated stretch — syllabus numericals live there, but never claim universal linearity.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Iron ring: mean length $0.4$ m, area $5\,\text{cm}^2$, $\mu_r = 1000$, $200$ turns carrying $1$ A. Find MMF, reluctance, flux, $B$, $H$.
:::

::: step [Step 2: Execution] Down the Dictionary
1. MMF $= 200\times1 = 200$ At. $\mathcal{R} = 0.4/(1000\cdot4\pi10^{-7}\cdot5\times10^{-4}) = 0.4/6.283\times10^{-7} \approx 6.37\times10^5$ At/Wb.
2. $\Phi = 200/6.37\times10^5 \approx 3.14\times10^{-4}$ Wb $= 0.314$ mWb. $B = \Phi/A = 0.628$ T. $H = 200/0.4 = 500$ At/m (check: $B = \mu H = 1000\cdot4\pi10^{-7}\cdot500 = 0.628$ ✓).
:::

::: step [Step 3: Conclusion] Final Result
MMF → reluctance → flux → densities, with $B = \mu H$ as the audit. One chain, five quantities, zero memorised detours.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$N = 100$, $I = 2$ A, $\mathcal{R} = 5\times10^5$ At/Wb. Flux?
(A) $10^8$ Wb
(*B) $200/5\times10^5 = 4\times10^{-4}$ Wb $= 0.4$ mWb
(C) $2.5\times10^3$ Wb
(D) $0.04$ Wb
::: explanation
$\Phi = NI/\mathcal{R} = 200/500{,}000 = 0.4$ mWb. mWb-scale answers are the sanity band for textbook cores — webers-scale means a slipped exponent.
:::

::: quiz Q2: Foundational Concept
Why is there no perfect magnetic insulator?
(A) Cores are too small
(*B) Every material has $\mu \ge \mu_0$ — flux always finds paths (leakage), unlike charge blocked by dielectrics
(C) MMF is too weak
(D) Flux has no units
::: explanation
Electric insulators stop conduction (free charge $\approx 0$); magnetism has no "zero-$\mu$" material — vacuum itself carries $\mu_0$. Leakage flux is therefore structural, modelled, never assumed away.
:::

::: quiz Q3: Foundational Concept
Reluctance rises if:
(A) Area rises
(*B) Length rises or permeability/area fall — $\mathcal{R} = l/\mu A$ (long thin low-$\mu$ paths resist flux most)
(C) Turns rise
(D) Current rises
::: explanation
Read the fraction: numerator length hurts, denominator $\mu A$ helps. Air gaps dominate rings for exactly this reason — millimetres of air outweigh centimetres of iron.
:::
