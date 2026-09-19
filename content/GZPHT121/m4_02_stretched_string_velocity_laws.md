# Stretched String: Velocity, Frequency & Laws

**The one full derivation of Module 4 — $v = \sqrt{T/\mu}$, $f = (1/2L)\sqrt{T/\mu}$, the three laws, and Melde's experiment.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Tightrope Snap
Pluck a loose rope: the bulge crawls. Tighten it (more tension $T$) and the bulge races; swap in a heavier chain (more mass per metre $\mu$) and it lumbers. Speed balances pull against inertia: $v = \sqrt{T/\mu}$. Fix both ends and only whole half-waves fit — the string quantises itself exactly like the quantum box, lowest hum to shrill overtones.
:::

::: anim string-modes Halves Fit, Frequencies Multiply
Fundamental plus two overtones with nodes pinned — $f$, $2f$, $3f$, the box ladder made audible.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Velocity derivation (syllabus requires it)

Small transverse pulse on tension $T$, linear density $\mu$: resolving tension components across a curved element gives restoring force $\approx T\,\partial^2y/\partial x^2\,dx$; Newton's law $\mu\,dx\,\partial^2y/\partial t^2$ yields the wave equation with:

$$v = \sqrt{\frac{T}{\mu}}$$

### 2.2 Frequency and the three laws

Fixed ends length $L$: allowed $\lambda_n = 2L/n$, so $f_n = v/\lambda_n = (n/2L)\sqrt{T/\mu}$. Fundamental ($n=1$):

$$f = \frac{1}{2L}\sqrt{\frac{T}{\mu}}$$

**Laws:** (i) length $f \propto 1/L$ (same $T,\mu$); (ii) tension $f \propto \sqrt{T}$; (iii) mass $f \propto 1/\sqrt{\mu}$. Harmonics $f_n = nf_1$.

### 2.3 Melde's experiment (lab link, theory marks)

String over pulley, one end to a tuning fork: vary length/tension until resonance (large stationary loops). Transverse mode (fork ⊥ string) vs longitudinal mode (fork ∥ string, frequency doubled per loop count) — verifies $f \propto 1/L$ and $f \propto \sqrt{T}$.

::: callout-formula KTU Formula Vault: String
**$v=\sqrt{T/\mu}$** · **$f=(1/2L)\sqrt{T/\mu}$**, $f_n=nf_1$ · laws: **$1/L$, $\sqrt{T}$, $1/\sqrt{\mu}$**.
:::

::: callout-pitfall Tension Units
$T$ is force (newtons), not mass. A "2 kg load" means $T = 2\times9.8 = 19.6$ N. Forgetting $g$ halves-then-some every answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Wire $L = 0.5$ m, $\mu = 2.0$ g/m, tension $19.6$ N (2 kg). Find $v$, $f_1$, and the tension for double frequency.
:::

::: step [Step 2: Execution] Plug and Scale
1. $\mu = 2.0\times10^{-3}$ kg/m. $v = \sqrt{19.6/2.0\times10^{-3}} = \sqrt{9800} \approx 99$ m/s.
2. $f_1 = v/2L = 99/1.0 = 99$ Hz.
3. $f \propto \sqrt{T}$: double $f$ needs $4\times T = 78.4$ N ($\approx 8$ kg load).
:::

::: step [Step 3: Conclusion] Final Result
$\approx 99$ m/s, $\approx 99$ Hz; frequency doubling costs fourfold tension — the square-root tax examiners love to test.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
String tension is increased $9\times$. Frequency?
(A) $9\times$
(*B) $3\times$ — $f \propto \sqrt{T}$
(C) Unchanged
(D) $1/3\times$
::: explanation
Square-root law: $\sqrt{9} = 3$. Tension is the weakest lever ($9\times$ effort for $3\times$ pitch) versus length's linear lever — compare explicitly for law questions.
:::

::: quiz Q2: Numerical Drill
Two wires, same $T$ and $L$; B has $4\times$ the linear density of A. $f_B/f_A$?
(A) 4
(*B) $1/2$ — $f \propto 1/\sqrt{\mathtt{\mu}}$
(C) 2
(D) 1
::: explanation
$\sqrt{4} = 2$ in the denominator. Heavier strings growl lower — bass strings are fat for exactly this reason.
:::

::: quiz Q3: Foundational Concept
Why must Melde's resonance use integer loop counts?
(A) The pulley demands it
(*B) Fixed/forced ends require standing waves with nodes at the boundaries — only $L = n\lambda/2$ survives superposition
(C) Forks vibrate only in integers
(D) Gravity quantises the string
::: explanation
Travelling waves reflect and interfere; only half-wave-fitted wavelengths reinforce turn after turn. Off-resonance lengths self-cancel — the visible large loops mark the fitted modes.
:::
