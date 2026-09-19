# Box Numericals: Energy, Wavelength & Probability

**Every computational variation — level gaps, photon jumps, de Broglie check, probability slices, and box-size scaling.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ladder Gymnastics
$E_n = n^2E_1$ is a stretching ladder (rungs spread upward). Jumps between rungs spit photons ($h\nu = \Delta E$); shrinking the box stretches the whole ladder ($1/L^2$); asking "odds in the middle third" just weighs hump-area under $|\psi|^2$. All numericals are one of these three moves.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Master formulas

$E_n = n^2h^2/8mL^2$; gap $\Delta E_{m\to n} = (n^2-m^2)E_1$; jump photon $\lambda = hc/\Delta E$; de Broglie cross-check $\lambda_n = 2L/n$ with $p = h/\lambda_n$.

Probability in $[a,b]$: $P = \int_a^b |\psi_n|^2 dx = \int_a^b (2/L)\sin^2(n\pi x/L)\,dx$. Ground-state middle-third example: $P = \int_{L/3}^{2L/3}(2/L)\sin^2(\pi x/L)\,dx \approx 0.609$ ($\sim 61\%$ — centre-weighted).

### 2.2 Scaling laws (one-mark answers)

$L \to 2L$: all $E_n$ quarter. $m \to 2m$ (proton vs electron): levels halve per mass ratio ($\approx 1/1836$). $n = 1 \to 2$ gap $= 3E_1$; $2 \to 3$ gap $= 5E_1$.

### 2.3 Box-size ladder (electron $E_1$, order-of-magnitude)

| Box $L$ | $E_1$ | Regime |
|---|---|---|
| $0.1$ nm (atom) | $\approx 38$ eV | X-ray / core |
| $1$ nm (molecule) | $\approx 0.38$ eV | chemistry |
| $10$ nm (dot) | $\approx 3.8$ meV | infrared |
| $1\,\mu$m (grain) | $\approx 3.8\times10^{-7}$ eV | effectively continuous |
| $1$ cm (lab) | $\approx 3.8\times10^{-15}$ eV | continuum |

Read down: $10\times$ smaller box, $100\times$ hotter ground state ($1/L^2$ in one glance).

::: callout-formula KTU Formula Vault: Box Numerics
**$E_n=n^2E_1$**, $E_1=h^2/8mL^2$ · jump **$hc/\Delta E$** · $\lambda_n=2L/n$ · $P=\int|\psi|^2$ · $E\propto1/L^2$, $E\propto1/m$.
:::

::: callout-pitfall eV–Joule Crossover
$1$ eV $= 1.602\times10^{-19}$ J. Computing $E$ in joules then labelling it eV inflates answers by $\sim 10^{19}$. Convert as the last step, every time.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Electron in $L = 0.5$ nm box: (a) $E_1, E_2$; (b) photon from $2\to1$; (c) probability ground-state electron lies in the middle third.
:::

::: step [Step 2: Execution] Three Moves
1. $E_1 \propto 1/L^2$: halving $1$ nm ($0.38$ eV) quadruples → $E_1 \approx 1.51$ eV, $E_2 = 4E_1 \approx 6.03$ eV.
2. $\Delta E = 3E_1 \approx 45.2$ eV → $\lambda = 1240/45.2 \approx 27.4$ nm (extreme UV).
3. $P = [x/L - \sin(2\pi x/L)/2\pi]_{1/3}^{2/3} = (1/3 + \sqrt{3}/2\pi) \approx 0.333 + 0.276 \approx 0.609$ → $\approx 61\%$.
:::

::: step [Step 3: Conclusion] Final Result
Scale ($1/L^2$), jump ($hc/\Delta E$), weigh ($|\psi|^2$ integral) — the complete box toolkit in three lines.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
An electron box widens from $L$ to $3L$. New ground energy?
(A) $3E_1$
(*B) $E_1/9$ — $E \propto 1/L^2$
(C) $9E_1$
(D) Unchanged
::: explanation
$E_1 = h^2/8mL^2$: tripling $L$ multiplies the denominator by $9$. Wider trap, lazier standing wave, lower note — same as a longer guitar string.
:::

::: quiz Q2: Numerical Drill
$E_1 = 2.0$ eV for some box. Photon emitted in $3\to2$ transition?
(A) $2.0$ eV
(*B) $(9-4)E_1 = 5\times2.0 = 10.0$ eV → $\lambda \approx 124$ nm
(C) $13E_1$
(D) $E_1/5$
::: explanation
Gaps go as differences of squares: $3^2-2^2 = 5$. Times $E_1$ gives the photon energy; $hc/E$ gives its wavelength. Never use $n$ itself instead of $n^2$.
:::

::: quiz Q3: Numerical Drill
Ground-state $|\psi_1|^2$ peaks where? Odds near walls vs centre?
(A) Uniform everywhere
(*B) Peak at centre $L/2$, zero at walls — centre slices carry the most probability
(C) Peak at walls
(D) Zero everywhere
::: explanation
$\sin^2(\pi x/L)$ is $0$ at $0, L$ and $1$ at $L/2$. Any symmetric central interval beats an equal edge interval — the $61\%$-in-middle-third result is the quantitative version.
:::
