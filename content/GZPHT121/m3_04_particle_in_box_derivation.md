# Particle in a 1D Box: Derivation

**The full KTU derivation — TISE inside and outside, boundary conditions, quantised energies and normalised states.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Guitar String
A guitar string fixed at both ends supports only hum, octave, twelfth — standing waves with nodes at the frets. An electron trapped between infinite walls is the same: $\psi$ must vanish at both walls, so only sine waves with integer half-waves fit. Each fitting pattern is an energy level; squeezing the box (shorter string) raises every pitch as $1/L^2$.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Setup

$V = 0$ for $0 < x < L$, $V = \infty$ elsewhere → $\psi = 0$ outside and $\psi(0) = \psi(L) = 0$. Inside, TISE:

$$\frac{d^2\psi}{dx^2} + k^2\psi = 0, \qquad k^2 = \frac{2mE}{\hbar^2}$$

General solution $\psi = A\sin kx + B\cos kx$.

### 2.2 Quantisation

$\psi(0) = 0 \Rightarrow B = 0$. $\psi(L) = A\sin kL = 0 \Rightarrow kL = n\pi$ ($n = 1, 2, 3, \dots$; $n = 0$ gives nothing). Hence:

$$k_n = \frac{n\pi}{L}, \qquad E_n = \frac{\hbar^2 k_n^2}{2m} = \frac{n^2h^2}{8mL^2}$$

using $\hbar = h/2\pi$. Levels scale as $n^2$ (not evenly spaced — gaps grow $3:5:7\ldots$).

### 2.3 Normalisation

$1 = \int_0^L A^2\sin^2(n\pi x/L)\,dx = A^2L/2 \Rightarrow A = \sqrt{2/L}$:

$$\psi_n(x) = \sqrt{\frac{2}{L}}\sin\left(\frac{n\pi x}{L}\right)$$

Nodes: $n-1$ interior zeros; $|\psi_n|^2$ gives $n$ probability humps. $n = 1$ ground state has zero-point energy $E_1 = h^2/8mL^2 \neq 0$ (confinement jitter again).

::: callout-formula KTU Formula Vault: Box
**$E_n = n^2h^2/8mL^2$** · **$\psi_n = \sqrt{2/L}\sin(n\pi x/L)$** · nodes $n-1$ · gaps $\propto 2n+1$ · zero-point $E_1 \neq 0$.
:::

::: callout-pitfall $n$ Starts at 1, Not 0
$n = 0$ gives $\psi \equiv 0$ (no particle) — unphysical. Ground state is $n = 1$ with finite zero-point energy. Writing "$n = 0, 1, 2\ldots$" forfeits the derivation's final mark.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Derive $E_n$ for an electron in a $1$ nm box and compute $E_1$ in eV. Where are the nodes of $n = 3$?
:::

::: step [Step 2: Execution] Constants In, Answer Out
1. Follow §2.1–2.2 to $E_n = n^2h^2/8mL^2$.
2. $h^2 = (6.626\times10^{-34})^2 = 43.9\times10^{-68}$; $8mL^2 = 8\times9.1\times10^{-31}\times10^{-18} = 72.8\times10^{-49}$. $E_1 = 43.9\times10^{-68}/72.8\times10^{-49} = 0.603\times10^{-19} \approx 6.03\times10^{-20}$ J $\approx 0.38$ eV.
3. $n=3$: zeros at $x = 0, L/3, 2L/3, L$ — two interior nodes, three humps.
:::

::: step [Step 3: Conclusion] Final Result
Nanometre boxes give eV levels (atomic scale); centimetre boxes give $\sim 10^{-14}$ eV (continuum for all purposes) — same formula, and quoting both scales shows examiner-ready insight.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why are box energies proportional to $n^2$ rather than $n$?
(A) Because of relativity
(*B) Each extra half-wave shortens the fitted wavelength as $\lambda_n = 2L/n$, and $E \propto 1/\lambda^2$ via $p = h/\lambda$
(C) Because the box expands with $n$
(D) They are proportional to $n$ in quantum mechanics
::: explanation
Fitting $n$ half-waves gives $k = n\pi/L$, $p = \hbar k \propto n$, and $E = p^2/2m \propto n^2$. The quadratic ladder (gaps $3E_1, 5E_1, 7E_1\ldots$) is the signature of a square well.
:::

::: quiz Q2: Foundational Concept
What is the zero-point energy of the box, and why must it exist?
(A) Zero — the particle can rest
(*B) $E_1 = h^2/8mL^2 > 0$ — confinement to $\Delta x \sim L$ forces $\Delta p$ jitter via uncertainty
(C) Infinite
(D) Negative
::: explanation
Perfect rest would mean sharp $p = 0$ plus confined $x$ — forbidden by $\Delta x\,\Delta p \ge \hbar/2$. The $n=1$ standing wave is the minimum-fuzz compromise, with finite kinetic energy.
:::

::: quiz Q3: Foundational Concept
How many interior nodes does $\psi_4$ have, and what does $|\psi_4|^2$ look like?
(A) 0 nodes, one hump
(*B) 3 interior nodes, 4 equal-ish humps with zeros at $0, L/4, L/2, 3L/4, L$
(C) 4 nodes at random positions
(D) Nodes cannot be counted
::: explanation
$\sin(4\pi x/L)$ crosses zero $5$ times including walls; between consecutive zeros sits one probability hump. Node counting ($n-1$ interior) is the fastest sketch-check in exams.
:::
