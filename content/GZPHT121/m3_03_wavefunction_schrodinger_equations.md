# Wavefunction & Schrödinger Equations

**What $\Psi$ means, what it must obey, and the time-dependent vs time-independent equations KTU asks to "formulate".**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Haze Map
$\Psi(x,t)$ is a haze map: where the haze $|\Psi|^2$ is thick, the electron is likely found; where thin, rarely. The map flows by strict rules (Schrödinger's equation) the way water flows by Navier–Stokes — and like water in a closed tank, only certain sloshing patterns (standing waves) fit, which is where quantisation comes from. The time-dependent equation directs the movie; the time-independent equation lists the allowed frozen frames (energy states).
:::

::: anim box-states Frozen Frames Preview
One, two, three humps with energies $E_1$, $4E_1$, $9E_1$ — the standing-wave shapes the next topic derives, shown here as $|\psi|^2$ humps.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Physical interpretation and properties of $\Psi$

* **Born rule:** probability density $P(x,t) = |\Psi(x,t)|^2$; total probability $\int |\Psi|^2 dx = 1$ (normalisation).
* **Admissibility:** $\Psi$ must be finite, single-valued, continuous, with continuous first derivative (except at infinite walls); must vanish at infinity for bound states.
* $\Psi$ itself is complex and unobservable — only $|\Psi|^2$ and expectation values $\langle x \rangle = \int \Psi^* x \Psi\,dx$ are measurable.

### 2.2 Time-dependent Schrödinger equation (TDSE)

$$i\hbar\frac{\partial\Psi}{\partial t} = -\frac{\hbar^2}{2m}\frac{\partial^2\Psi}{\partial x^2} + V(x)\Psi$$

Kinetic operator $-\hbar^2\nabla^2/2m$ + potential $V$ = total-energy operator acting on $\Psi$. First order in time (given $\Psi$ now, the future is fixed).

### 2.3 Time-independent Schrödinger equation (TISE)

For stationary states $\Psi(x,t) = \psi(x)e^{-iEt/\hbar}$:

$$\frac{d^2\psi}{dx^2} + \frac{2m}{\hbar^2}\,[E - V(x)]\,\psi = 0$$

Solve with boundary conditions → allowed $E_n$ (eigenvalues) and $\psi_n$ (eigenfunctions). Free particle ($V = 0$): sinusoidal; bound wells: quantised standing waves.

::: callout-formula KTU Formula Vault: Schrödinger
Born **$P=|\Psi|^2$**, normalised · TDSE **$i\hbar\Psi_t = -\hbar^2\Psi_{xx}/2m + V\Psi$** · TISE **$\psi'' + 2m(E-V)\psi/\hbar^2 = 0$** · $\Psi$ finite/single-valued/continuous.
:::

::: callout-pitfall $\Psi$ vs $|\Psi|^2$
$\Psi$ can be negative/complex and has no direct meaning; $|\Psi|^2 \ge 0$ is the probability density. "Probability equals the wavefunction" loses the mark — always square (mod-square) and normalise.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$\psi = A\sin(\pi x/L)$ on $[0,L]$, zero elsewhere. Normalise it and state where the particle is most likely found.
:::

::: step [Step 2: Execution] Normalising
1. $1 = \int_0^L A^2\sin^2(\pi x/L)\,dx = A^2 L/2$ → $A = \sqrt{2/L}$.
2. $P(x) = (2/L)\sin^2(\pi x/L)$, peaked at $x = L/2$ (centre), zero at walls — the ground-state hump.
:::

::: step [Step 3: Conclusion] Final Result
Normalisation fixes $A = \sqrt{2/L}$; shape fixes the odds. This exact sine is the particle-in-a-box ground state derived in the next topic.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Which condition must an acceptable wavefunction satisfy?
(A) Infinite at the boundaries
(*B) Finite, single-valued, continuous with continuous slope (except infinite jumps), and normalisable
(C) Always real and positive
(D) Zero everywhere
::: explanation
These regularity conditions keep probabilities finite and unique. Infinite or multi-valued $\Psi$ would give meaningless $|\Psi|^2$; non-normalisable $\Psi$ cannot be a probability distribution.
:::

::: quiz Q2: Foundational Concept
When do you use the TISE instead of the TDSE?
(A) When the potential changes rapidly with time
(*B) When $V$ is time-independent and only stationary energy states are needed — time factors out as $e^{-iEt/\hbar}$
(C) Only for photons
(D) Never — TDSE is always simpler
::: explanation
Stationary states separate: time contributes just a rotating phase, leaving the eigenvalue problem TISE for $\psi(x)$ and $E$. Spectroscopy, wells, and atoms live here; genuine time evolution (pulses, transitions) needs TDSE.
:::

::: quiz Q3: Foundational Concept
What is the physical meaning of $|\Psi|^2 dx$?
(A) Energy in $dx$
(*B) Probability of finding the particle in $dx$
(C) Charge of the particle
(D) Number of particles in $dx$
::: explanation
Born's rule: $|\Psi|^2$ is probability *density*; times $dx$ it is the find-probability in that slice. Integrating over all space must give 1 (certainty of being somewhere).
:::
