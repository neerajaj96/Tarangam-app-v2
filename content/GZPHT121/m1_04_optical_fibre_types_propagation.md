# Optical Fibre: Propagation, Structure and Types

**Total internal reflection guiding light for kilometres — core, cladding, and the four-way type matrix KTU loves.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Marble in a Mirrored Pipe
Shine a torch into a stream of water in a dark room — light stays trapped inside the stream, bending with it. An optical fibre is that stream frozen into glass: a high-index **core** wrapped in a lower-index **cladding**. Any ray hitting the wall at a grazing enough angle suffers **total internal reflection** and zig-zags forward instead of escaping. Step-index is a pipe with a sharp wall (rays take different-length zig-zag paths → pulses spread); graded-index is a pipe whose glass gets gradually thinner toward the edge, continuously bending rays into smooth sine curves so all paths arrive together.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Principle and structure

* **Principle:** propagation by repeated **total internal reflection** at the core–cladding interface (needs $n_{core} > n_{cladding}$ and incidence above the critical angle $\phi_c = \sin^{-1}(n_2/n_1)$).
* **Structure:** core ($n_1$, $\sim 8$–$62.5\,\mu$m diameter, carries light) + cladding ($n_2 < n_1$, confines light, adds strength) + protective jacket (mechanical/chemical shield).

### 2.2 The four types

| Index profile | Modes | Behaviour |
|---|---|---|
| **Step-index multimode** | many paths | cheap, short-haul; large modal dispersion (pulse spreading) |
| **Step-index single-mode** | one path (core $\sim 8$–$10\,\mu$m) | no modal dispersion; long-haul telecom backbone |
| **Graded-index multimode** | many curved paths | parabolic $n(r)$ equalises transit times; LAN-grade compromise |

So: **step vs graded** = index profile (sharp vs parabolic); **single vs multimode** = number of guided paths (one vs many).

### 2.3 Single vs multimode vs graded — exam contrasts

* Single-mode: narrow core, one mode, laser source, huge bandwidth–distance product, costlier splicing.
* Multimode step: wide core, LED source, cheap, but modal dispersion limits distance.
* Graded-index: multimode core with parabolic grading — rays refocus periodically (self-focusing), dispersion much lower than step multimode.

::: callout-formula KTU Formula Vault: Fibre Types
Guide by **TIR, $n_1>n_2$** · critical angle **$\phi_c=\sin^{-1}(n_2/n_1)$** · step = sharp wall, graded = parabolic $n(r)$ · single-mode core **$\sim 9\,\mu$m**, multimode **$50$–$62.5\,\mu$m**.
:::

::: callout-pitfall Step/Graded vs Single/Multi — Orthogonal Axes
Students write "step-index single-mode vs graded-index multimode" as if only two types exist. They are two independent choices: profile (step/graded) × paths (single/multi). Single-mode fibre is *always* step-index; multimode can be either step or graded.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A campus LAN uses LED sources over $500$ m; a submarine cable spans $5000$ km with laser sources. Assign fibre types and justify in two lines each.
:::

::: step [Step 2: Execution] Matching Fibre to Job
1. **Campus (cheap, short, LED):** multimode — wide core catches LED light easily; dispersion over $500$ m is tolerable. Graded-index preferred to keep pulses clean.
2. **Submarine (far, fast, laser):** single-mode step-index — one path means zero modal dispersion; laser couples into the tiny core and holds bandwidth over oceans.
:::

::: step [Step 3: Conclusion] Final Result
Short + cheap + LED → multimode (graded best). Long + fast + laser → single-mode. That two-line justification is the standard 3-mark "choose the fibre" answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What is the guiding principle of an optical fibre?
(A) Diffraction through a narrow slit
(*B) Total internal reflection at the core–cladding interface with $n_{core} > n_{cladding}$
(C) Refraction out of the cladding
(D) Polarisation by reflection
::: explanation
Light stays in the core because every wall encounter above the critical angle reflects it fully back inside. The index step $n_1 > n_2$ is what makes a critical angle (and hence TIR) exist at all.
:::

::: quiz Q2: Foundational Concept
Why does graded-index fibre have lower modal dispersion than step-index multimode?
(A) It has a smaller cladding
(*B) Its parabolic index profile bends rays into equal-transit-time curves so all modes arrive nearly together
(C) It carries only one mode
(D) It uses a higher wavelength
::: explanation
In graded fibre outer rays travel faster (lower local $n$) along longer curves while axial rays travel slower along shorter paths — the times cancel. Step multimode has no such compensation, so zig-zag paths lag badly.
:::

::: quiz Q3: Foundational Concept
Which fibre suits long-haul telecom and why?
(A) Multimode step-index, because its wide core is cheap
(*B) Single-mode step-index, because one guided mode eliminates modal dispersion for maximum bandwidth–distance product
(C) Plastic fibre, because it is flexible
(D) Graded-index with LED, because lasers are forbidden
::: explanation
Single-mode kills modal dispersion at the root (only one path exists), so pulses survive thousands of kilometres. The price is a $\sim 9\,\mu$m core needing laser sources and precise splicing — worth it for backbones.
:::
