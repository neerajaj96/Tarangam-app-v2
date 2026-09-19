---
id: m1_03_ruby_co2_semiconductor_lasers
courseCode: GZPHT121
module: 1
sequence: 3
title: 'Ruby, CO2 & Semiconductor Lasers: Construction and Working'
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - Describe Ruby construction and pulsed red working with its three-level limit
  - Describe CO2 construction with N2 transfer and He roles for CW infrared power
  - Explain the diode laser qualitatively with junction current and cleaved faces
concepts:
  - ruby laser
  - CO2 laser
  - semiconductor laser
prerequisites:
  - m1_02_laser_principle_population_inversion_pumping
examRelevance: high
tags:
  - lasers
  - laser-types
---
# Ruby, CO2 & Semiconductor Lasers: Construction and Working

**Three KTU-favourite lasers side by side — levels, pump, wavelength, and one-line exam contrasts.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Different Engines
* **Ruby = firecracker:** a pink crystal rod blasted by a flash lamp, fires one red pulse at a time (three-level, pulsed).
* **CO2 = factory engine:** a gas pipe buzzed by electricity, runs all day at invisible infrared heat-ray power (four-level, CW, highest power).
* **Semiconductor = LED with mirrors:** a speck of GaAs carrying current, glowing coherently like a disciplined LED (junction, tiny, cheap). KTU almost always asks any *one* with diagram — learn all three as the same story (pump → inversion → cavity → output) with different actors.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Ruby laser (solid-state, three-level, pulsed)

* **Active medium:** Al₂O₃ crystal doped with Cr³⁺ (pink rod), ends silvered (one fully, one partially).
* **Pump:** xenon flash lamp (optical pumping) lifts Cr³⁺ ground → broad pump bands → non-radiative decay to **metastable** level.
* **Lasing:** metastable → ground, $\lambda = 694.3$ nm (deep red), pulse $\sim$ ms.
* **Cavity:** rod ends themselves are the mirrors; cooling jacket needed.
* **Drawback:** three-level — needs $>50\%$ excitation, so pulsed only, low efficiency, overheats.

### 2.2 CO2 laser (molecular gas, four-level, CW high power)

* **Active medium:** CO2 + N₂ + He mixture in a discharge tube; mirrors at ends (one ZnSe partial reflector since glass absorbs $10.6\,\mu$m).
* **Pump:** electric discharge excites N₂ vibrations; resonant energy transfer pumps CO2 to upper lasing vibrational level (four-level between vibrational-rotational states).
* **Lasing:** $10.6\,\mu$m and $9.6\,\mu$m infrared bands; He depopulates the lower level and conducts heat away.
* **Strengths:** up to kW CW, $\sim 20\%$ efficiency — cutting, welding, surgery.

### 2.3 Semiconductor (diode) laser (qualitative)

* **Active medium:** forward-biased p-n junction (GaAs/AlGaAs); heavy doping makes the depletion zone an inversion layer when current flows.
* **Pump:** direct electric current (no lamp/discharge); cleaved crystal faces act as cavity mirrors.
* **Lasing:** electron–hole recombination across the band gap, e.g. $\sim 840$ nm (GaAs); tiny, cheap, modulated at GHz — fibre optics, pointers, DVD/Blu-ray.
* **Note:** syllabus asks qualitative only — diagram + "current creates inversion at junction, recombination photons amplified between cleaved faces" earns full marks.

### 2.4 Properties and applications of lasers

**Properties:** monochromatic (single $\lambda$), coherent (same phase), highly directional (tiny divergence), extreme brightness/intensity, focusable to $\sim \lambda$-sized spots.
**Applications:** fibre communication (diode), barcode scanners, cutting/welding (CO2), eye surgery and holography (He-Ne/Nd:YAG), LIDAR, DVD writing, defence ranging.

::: callout-formula KTU Formula Vault: Laser Lineup
Ruby: **694.3 nm, 3-level, flash lamp, pulsed** · CO2: **10.6 μm, 4-level gas, discharge, CW kW** · Diode: **junction + current, cleaved faces, qualitative** · Properties: **monochromatic + coherent + directional + bright**.
:::

::: callout-pitfall Ruby vs CO2 Mix-Ups
Ruby is *solid crystal + optical pump + red + pulsed + three-level*. CO2 is *gas + electric discharge + infrared + CW + four-level with N₂/He helpers*. Swapping pump or level scheme is the commonest 9-mark answer killer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"With a neat diagram, explain the construction and working of a Ruby laser. Mention its wavelength and one limitation." (Typical 9-mark KTU question.)
:::

::: step [Step 2: Execution] Building the Answer
1. **Diagram:** rod with flash lamp spiral, mirrors M1 (100%) / M2 (partial), cooling jacket, supply — label active medium, pump, cavity.
2. **Construction (3 marks):** pink Cr³⁺:Al₂O₃ rod $\sim 10$ cm, flash lamp parallel, ends polished/silvered.
3. **Working (4 marks):** flash → pump bands → fast fall to metastable → inversion vs ground → first spontaneous photons along axis bounce and clone → red pulse through M2 at $694.3$ nm.
4. **Limitation (2 marks):** three-level → huge threshold, pulsed, heat — needs cooling pauses.
:::

::: step [Step 3: Conclusion] Final Result
Same skeleton fits CO2 (swap gas tube + discharge + N₂ transfer + $10.6\,\mu$m CW) and diode (swap junction + current + recombination, qualitative). Memorise one skeleton, change the actors.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
The Ruby laser uses a three-level scheme. What practical limitation follows?
(A) It emits only infrared
(*B) It needs more than half the atoms excited, so it works in pulses with low efficiency
(C) It cannot use mirrors
(D) It runs continuously at kilowatt power
::: explanation
Because the lower lasing level is the heavily populated ground state, inversion demands pumping $>50\%$ of all Cr³⁺ ions — a violent flash that overheats the rod, so the laser fires in pulses with cooling gaps.
:::

::: quiz Q2: Foundational Concept
What is the role of N₂ and He in a CO2 laser?
(A) They emit the output photons directly
(*B) N₂ resonantly transfers discharge energy to the upper CO2 level; He empties the lower level and removes heat
(C) They act as the cavity mirrors
(D) They absorb the 10.6 μm output
::: explanation
N₂ vibrations match the CO2 upper level so energy funnels efficiently into it; helium's fast relaxation drains the lower lasing level (preserving inversion) and its high thermal conductivity cools the tube for CW operation.
:::

::: quiz Q3: Foundational Concept
Which statement about the semiconductor laser is correct for KTU (qualitative)?
(A) It needs a flash lamp and ruby rod
(*B) Forward current injects carriers so the junction region is inverted; recombination photons are amplified between cleaved crystal faces
(C) It operates only in pulses at 10.6 μm
(D) It has no resonant cavity
::: explanation
The p-n junction under forward bias floods one side with electrons and the other with holes — recombination across the gap releases photons, and the flat cleaved ends reflect them for stimulated multiplication. No external lamp is needed.
:::
