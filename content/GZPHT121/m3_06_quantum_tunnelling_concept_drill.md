# Quantum Tunnelling & Module 3 Concept Drill

**Leaking through forbidden walls — alpha decay, STM, tunnel diode — plus the "no-derivation" safety net for the chapter.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ghost Through a Hill
A classical ball rolls back from a hill taller than its energy; a quantum wave *seeps* into the hill (exponential tail $e^{-\kappa x}$) and a surviving sliver re-emerges on the far side. Thinner/higher hills leak less — but never zero. Alpha particles escape nuclei, STM tips "feel" atoms, and tunnel diodes conduct through barriers this way: ghosts paying exponentially for wall thickness.
:::

::: anim tunnel-tail Seep In, Trickle Out
Incoming wave, exponential tail $e^{-\kappa x}$ inside, surviving sliver out with $T \propto e^{-2\kappa a}$ — the STM's ruler drawn.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Qualitative picture (syllabus asks qualitative only)

Barrier $V_0 > E$, width $a$: inside, TISE gives decaying $\psi \propto e^{-\kappa x}$ with $\kappa = \sqrt{2m(V_0-E)}/\hbar$. Transmission $T \propto e^{-2\kappa a}$ — exponential in width and in $\sqrt{\text{height} \times \text{mass}}$. Electrons tunnel nanometres; protons barely; cricket balls never ($T \sim 10^{-10^{30}}$).

### 2.2 Where KTU points it

* **Alpha decay:** He nucleus tunnels out of the nuclear potential well (Gamow theory — why lifetimes span microseconds to aeons with tiny energy changes).
* **STM:** tip–surface current $\propto e^{-2\kappa d}$ — sub-angstrom distance sensitivity images atoms.
* **Tunnel/Zener diode:** heavy doping thins the junction barrier until carriers leak through (links back to Module 1 semiconductor laser context).

### 2.3 Module 3 rapid-fire (memorise verbatim)

Uncertainty is statement-only; wavefunction = $|\Psi|^2$ + regularity; TDSE vs TISE roles; box $E_n = n^2h^2/8mL^2$, $\psi_n = \sqrt{2/L}\sin(n\pi x/L)$; tunnelling qualitative + two applications.

::: callout-formula KTU Formula Vault: Tunnelling
Tail **$e^{-\kappa x}$**, $\kappa=\sqrt{2m(V_0-E)}/\hbar$ · **$T\propto e^{-2\kappa a}$** · uses: **α-decay, STM, tunnel diode**.
:::

::: callout-exam KTU Exam Focus
"Explain quantum mechanical tunnelling with two applications" is a pure-memory 7-marker: one paragraph of ghost-through-hill + exponential law + α-decay/STM sketches. No derivation exists in this syllabus — don't invent one.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Two barriers differ in width by $0.1$ nm for an electron with $\kappa = 10\,\text{nm}^{-1}$. How do their transmissions compare?
:::

::: step [Step 2: Execution] Exponentials Amplify
$T_1/T_2 = e^{-2\kappa a_1}/e^{-2\kappa a_2} = e^{2\kappa\Delta a} = e^{2\times10\times0.1} = e^2 \approx 7.4$. One angstrom of extra wall cuts current $\sim 7\times$ — the STM's atomic sensitivity in one line.
:::

::: step [Step 3: Conclusion] Final Result
Tunnelling turns sub-nanometre geometry into order-of-magnitude current — exponential leverage no classical probe can match.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why can an alpha particle escape a nucleus it classically cannot climb?
(A) It borrows infinite energy
(*B) Its wavefunction penetrates the barrier as $e^{-\kappa x}$ with nonzero transmission $T \propto e^{-2\kappa a}$
(C) The barrier disappears periodically
(D) Nuclei have holes
::: explanation
Finite $E < V_0$ still leaves an exponential tail inside the wall; matching it across gives a small but nonzero exit amplitude. Gamow's tunnelling factor reproduces the observed lifetime-vs-energy curve quantitatively.
:::

::: quiz Q2: Foundational Concept
STM current drops ~10× per angstrom of tip retreat. Why so steep?
(A) Electronics saturate
(*B) $I \propto e^{-2\kappa d}$ with $\kappa \sim 10\,\text{nm}^{-1}$ — linear distance sits in an exponent
(C) The tip melts
(D) Atoms move away
::: explanation
Work-function-scale $\kappa$ makes $2\kappa \approx 2$/Å, so each angstrom multiplies current by $e^{-2} \approx 1/7$–$1/10$. Exponential sensitivity converts current into a sub-atomic ruler.
:::

::: quiz Q3: Foundational Concept
Which particle tunnels most readily through a given barrier?
(A) Proton
(*B) Electron — smallest mass gives smallest $\kappa = \sqrt{2m(V_0-E)}/\hbar$ hence largest $T$
(C) Alpha particle
(D) All equally
::: explanation
$\kappa \propto \sqrt{m}$: lighter mass → longer tail → vastly larger transmission. Electron–proton mass ratio $1836$ becomes an enormous tunnelling ratio through the exponent — mass is destiny here.
:::
