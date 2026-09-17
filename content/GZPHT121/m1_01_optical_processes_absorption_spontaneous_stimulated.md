# Optical Processes: Absorption, Spontaneous & Stimulated Emission

**The three light–matter interactions behind every laser — what absorbs, what glows randomly, and what amplifies coherently.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Staircase, Crowd, and Mexican Wave
Picture electrons on a staircase (energy levels $E_1$ ground, $E_2$ excited):

* **Absorption:** someone throws a ball of exact energy $h\nu = E_2 - E_1$ upward — an electron catches it and climbs. Photon disappears.
* **Spontaneous emission:** an electron balanced on the top step gets bored and jumps down on its own, throwing a ball in a *random* direction at a *random* time. This is tube-light / LED / sunlight glow — incoherent.
* **Stimulated emission:** a ball flies past an electron already on the top step and *shouts it down* — the electron drops and throws an identical twin ball: same direction, same phase, same energy. One photon in, two identical photons out. This cloning is the entire laser.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The three processes

An atom with levels $E_1 < E_2$ in radiation of energy density $\rho(\nu)$ at frequency $\nu = (E_2-E_1)/h$:

| Process | Trigger | Rate | Photon character |
|---|---|---|---|
| **Absorption** $E_1 \to E_2$ | incoming photon | $B_{12}\,N_1\,\rho(\nu)$ | photon consumed |
| **Spontaneous emission** $E_2 \to E_1$ | none (random decay) | $A_{21}\,N_2$ | random phase/direction, incoherent |
| **Stimulated emission** $E_2 \to E_1$ | incoming photon | $B_{21}\,N_2\,\rho(\nu)$ | clone: same phase, direction, polarisation — coherent |

$A_{21}$ is the Einstein $A$ coefficient (probability per second of spontaneous decay); $B_{12}, B_{21}$ are Einstein $B$ coefficients. For non-degenerate levels $B_{12} = B_{21}$.

### 2.2 Why ordinary light never amplifies

At thermal equilibrium the Boltzmann ratio $N_2/N_1 = e^{-(E_2-E_1)/kT} \ll 1$ — the ground floor is always more crowded. So absorption ($N_1$-driven) always beats stimulated emission ($N_2$-driven), and spontaneous noise dominates. Net amplification needs the *unnatural* condition $N_2 > N_1$: **population inversion** (covered in the next topic).

::: callout-formula KTU Formula Vault: Optical Processes
Resonance: **$h\nu = E_2 - E_1$** · rates: absorption $B_{12}N_1\rho$, spontaneous $A_{21}N_2$, stimulated $B_{21}N_2\rho$ · equilibrium $N_2/N_1 = e^{-\Delta E/kT}$ · amplification needs **$N_2 > N_1$**.
:::

::: callout-pitfall Spontaneous vs Stimulated — The Exam Trap
Spontaneous is *random and incoherent* (ordinary sources); stimulated gives *identical, coherent* photons (laser). If a question asks "which process is responsible for laser action", the answer is stimulated emission alone. Spontaneous emission in a laser is just noise that broadens the beam.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A sodium vapour lamp glows yellow ($589$ nm) while a He-Ne laser shines red ($632.8$ nm). Which emission process dominates in each, and why is only one of them coherent?
:::

::: step [Step 2: Execution] Tracing the Physics
1. **Lamp:** electric discharge excites Na atoms; they decay *randomly* with no passing photon to clone — spontaneous emission dominates. Photons leave at random times/directions/phases.
2. **Laser:** population inversion plus mirrors keep photons bouncing through excited atoms, so each passing photon *forces* a clone — stimulated emission dominates.
3. **Coherence:** clones share phase and direction, so laser waves add constructively over metres; random spontaneous photons cancel — hence interference/diffraction experiments demand lasers.
:::

::: step [Step 3: Conclusion] Final Result
Lamp = spontaneous = incoherent glow. Laser = stimulated = coherent beam. KTU expects exactly this one-line contrast for 3 marks.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
An atom in the excited state $E_2$ emits a photon without any external radiation incident on it. What is this process?
(A) Stimulated emission
(*B) Spontaneous emission
(C) Absorption
(D) Population inversion
::: explanation
No triggering photon means the decay is random and self-initiated — spontaneous emission. It produces incoherent light (random phase and direction), unlike stimulated emission which needs a passing photon of energy $h\nu = E_2 - E_1$.
:::

::: quiz Q2: Foundational Concept
Why can't thermal equilibrium produce laser amplification?
(A) Because spontaneous emission stops at high temperature
(*B) Because $N_1 \gg N_2$ by the Boltzmann factor, so absorption always exceeds stimulated emission
(C) Because photons have no energy at equilibrium
(D) Because metastable states cannot exist at equilibrium
::: explanation
At equilibrium $N_2/N_1 = e^{-\Delta E/kT} \ll 1$. The absorption rate ($\propto N_1$) therefore always swamps the stimulated rate ($\propto N_2$) — net absorption, never gain. Inversion must be *pumped* against equilibrium.
:::

::: quiz Q3: Foundational Concept
Which feature distinguishes a stimulated photon from a spontaneous one?
(A) Higher energy
(*B) Identical phase, direction, frequency and polarisation to the triggering photon
(C) Lower speed
(D) Random wavelength
::: explanation
Stimulated emission clones the incident photon in every wave attribute — that is the origin of monochromaticity, directionality and coherence. Spontaneous photons are random in phase and direction.
:::
