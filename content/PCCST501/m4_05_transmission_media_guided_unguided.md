---
id: m4_05_transmission_media_guided_unguided
courseCode: PCCST501
module: 4
sequence: 5
title: 'Transmission Media: Guided & Unguided'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Match copper, coax, and fibre to rate-reach budgets
  - Apply total internal reflection trapping conditions
  - Separate bandwidth fatness from propagation delay
  - Self-test with the exam recap and active-recall checklist
concepts:
  - guided media
  - unguided media
  - propagation delay
prerequisites: []
examRelevance: medium
tags:
  - transmission-media
  - fibre
---
# Transmission Media: Guided & Unguided

**Copper, glass, and thin air — twisted pair vs coax vs fibre, radio vs microwave vs satellite vs infrared, and two hand-computed propagation numbers.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

Bits must ride *something* physical: copper wires, glass strands, or open air. The choice decides three budgets at once — how much data per second (bandwidth), how far before help (reach/repeaters), and how long one bit takes to arrive (propagation delay). No medium wins all three: copper is cheap but short, fibre is mighty but must be laid, satellites reach anywhere but invoice 240 ms of geometry.

The problem before the solution: match each deployment (LAN room, campus backbone, ocean crossing, remote village) to the medium whose physics fits — and never confuse a fat pipe (bandwidth) with a fast trip (delay).

::: callout-intuition Core Mental Model: Roads, Rails, and Radio
**Twisted pair** is a country road (cheap, short hops, noise from neighbours — twisting cancels crosstalk). **Coax** is a guarded highway (shielded, fatter bandwidth, costlier). **Fibre** is a light-rail in a vacuum tube (total internal reflection, near-light speed, kilometres without repeaters). **Unguided** (radio/microwave/satellite/infrared) skips roads entirely — broadcast freedom, shared-sky interference, and physics-set distance limits.

Dropping the transport now: guided = copper/coax/fibre (signals bound to a path); unguided = radio/microwave/satellite/infrared (signals through space); TIR (Total Internal Reflection) = dense-glass light trapping; delay $= d/v$.
:::

::: anim fiber-tir Dense Glass Traps Its Own Light
Core $n = 1.48$ against cladding $n = 1.46$: past $\theta_c \approx 80.6°$ every wall hit reflects fully — the ray below zigzags for kilometres.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Guided media** | Signals bound to a solid path: twisted pair, coaxial cable, fibre. |
| **UTP/STP (Unshielded/Shielded Twisted Pair)** | Copper pairs (Cat — Category — grades, ~100 m LAN runs, RJ45 connectors); twisting cancels crosstalk; shielding adds noise armor. |
| **Coaxial cable** | Concentric copper conductors (baseband vs. broadband use, BNC — Bayonet Neill–Concelman — connectors, cable-TV heritage). |
| **Fibre (step/graded-index, single/multimode)** | Glass strands guiding light (LED — Light-Emitting Diode — /laser sources); step vs. graded refractive profiles; single-mode (one path, longest reach) vs. multimode. |
| **TIR (Total Internal Reflection)** | Trapping condition for dense-to-rare boundaries: rays steeper than $\theta_c$ (with $\sin\theta_c = n_2/n_1$, $n_1 > n_2$) reflect fully. |
| **Unguided media** | Signals through space: radio ($3$ kHz–$1$ GHz, omnidirectional, wall-passing), microwave ($1$–$300$ GHz, line-of-sight dishes, rain fade), satellite (GEO — Geostationary — $35{,}800$ km), infrared (short, wall-blocked). |
| **Propagation delay** | $d/v$: distance ÷ speed ($v \approx 2.4 \times 10^8$ m/s in cable, $c = 3 \times 10^8$ m/s in air). Distinct from bandwidth. |

<a id="the-math"></a>
## 3. Purpose — Guided Menu, Unguided Menu, Delay Math

### 3.1 Guided Menu

Twisted pair (UTP/STP: Cat grades, $\sim 100$ m LAN runs, RJ45), coaxial (baseband vs broadband, BNC, cable-TV heritage), fibre (step-index vs graded-index, single-mode vs multimode; sources LED/laser; TIR condition $\sin\theta_c = n_2/n_1$ for $n_1 > n_2$). Rule of thumb: bandwidth × distance crowns fibre, price crowns twisted pair, legacy plants keep coax alive.

### 3.2 Unguided Menu

Radio ($3$ kHz–$1$ GHz: omnidirectional, walls pass), microwave ($1$–$300$ GHz: line-of-sight, dishes, rain fade), satellite (geostationary $35{,}800$ km: $\approx 240$ ms ground–satellite–ground floor, broadcast one-to-many), infrared (short, wall-blocked — remote controls, not backbones). Propagation delay $= d/v$ with $v \approx 2.4 \times 10^8$ m/s in cable, $c$ in air.

::: callout-formula KTU Formula Vault: Media
Twist cancels crosstalk · coax shields · TIR needs $\sin\theta_c = n_2/n_1$ · radio passes walls, microwave needs sightlines, GEO $\approx 240$ ms floor · delay $= d/v$.
:::

Satellite delay is geometry, not congestion: one ground–satellite–ground leg spans $2 \times 35{,}800$ km at $c$, i.e. $\approx 240$ ms, before a single queue is met — a full request-plus-reply doubles it to $\approx 480$ ms. Latency budgets must swallow it whole.

::: callout-pitfall Bandwidth vs Propagation
Fibre's "speed" is bandwidth (bits/s), not shorter delay — light in glass ($2.4 \times 10^8$) is *slower* than radio in air ($c$). An option claiming fibre "reduces propagation delay" confuses fat pipes with fast trips.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

1 km of cable at $v = 2.4 \times 10^8$ m/s: delay $= 1000 / 2.4 \times 10^8 \approx 4.17\ \mu$s. Same kilometre by radio at $c$: $\approx 3.33\ \mu$s — air wins the race while glass wins the bandwidth crown. Fat vs. fast, separated in two lines.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
(a) Fibre core $n_1 = 1.48$, cladding $n_2 = 1.46$: critical angle? (b) $2500$-km fibre run at $v = 2.4 \times 10^8$ m/s: one-way propagation delay?
:::

::: step [Step 2: Execution] Angle and Delay
(a) $\sin\theta_c = 1.46/1.48 \approx 0.98649$. Since $\sin 80° \approx 0.9848$ and $\sin 81° \approx 0.9877$, $\theta_c \approx 80.6°$ — rays steeper than this from the wall-normal stay trapped. (b) $d = 2.5 \times 10^6$ m; delay $= 2.5 \times 10^6 / 2.4 \times 10^8 \approx 0.01042$ s $\approx 10.42$ ms. Same run by GEO satellite: $\approx 240$ ms — $23\times$ worse before queueing starts.
:::

::: step [Step 3: Conclusion] Final Result
$\theta_c \approx 80.6°$, fibre delay $\approx 10.42$ ms vs satellite $\approx 240$ ms. Two numbers that jointly explain the backbone: glass traps light cheaply, and geometry taxes satellites unavoidably.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Bandwidth vs. propagation delay | Bits/s (fatness) vs. seconds (trip time) — fibre wins the first, air wins the second. |
| TIR direction | Dense→rare past $\theta_c$ traps; rare→dense always refracts inward, never trapped. |
| Radio vs. microwave vs. satellite | Wall-passing broadcast vs. sightline dishes vs. $\approx 240$ ms geometry floor. |
| Single-mode vs. multimode | One path (longest reach) vs. many paths (modal spread, shorter reach). |

**Watch out:** (1) "Fibre is faster" without saying *what* is faster — bandwidth, not delay. (2) TIR from the rare side — direction matters. (3) Treating satellite delay as fixable congestion — geometry invoices first.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Guided: twisted pair (cheap, ~100 m, twist cancels crosstalk), coax (shielded, legacy), fibre (TIR $\sin\theta_c=n_2/n_1$, single-mode farthest). Unguided: radio (passing), microwave (sightlines), GEO satellite ($\approx 240$ ms one ground–sat–ground leg, $\approx 480$ ms round trip), infrared (short). Delay $= d/v$; never confuse with bandwidth.
:::

**Active-recall checklist:** Which medium for a 2 km lightning-prone 10 Gbps link, and why two reasons? Derive the 240 ms floor. When does TIR fail? Which is "faster" — fibre or radio — and in what sense?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Q1: Selection Drill
Inter-building campus link, $2$ km, $10$ Gbps, lightning-prone area. Medium?
(A) UTP Cat6, cheapest per metre
(*B) Single-mode fibre — distance × rate exceeds copper's reach, and glass (non-conductive) ignores lightning-induced surges that fry copper runs
(C) Infrared lasers across rooftops
(D) GEO satellite hop
::: explanation
$10$ Gbps × $2$ km breaks UTP reach; lightning kills copper interfaces, not glass. Fibre wins on both axes here — rate-reach plus electrical isolation, the standard campus answer.
:::

::: quiz Q2: Satellite Floor
GEO link, zero congestion, tiny packets. One-way delivery floor (ground–satellite–ground)?
(A) $\approx 1$ ms, space is fast
(*B) $\approx 240$ ms — $2 \times 35{,}800$ km at $c$ ($71{,}600$ km $/ 3 \times 10^8 \approx 0.24$ s) before a single queue is met; a full request-plus-reply doubles it to $\approx 480$ ms, all of it pure geometry
(C) Same as fibre always
(D) Zero with priority
::: explanation
Distance is delay: one ground–sat–ground leg spans $71{,}600$ km at light speed $\approx 240$ ms. No protocol, queue, or priority touches it — physics invoices first, networks pay, and interactive sessions feel every millisecond of it.
:::

::: quiz Q3: TIR Condition
Ray in cladding ($n = 1.46$) hits core ($n = 1.48$) boundary. Total internal reflection?
(A) Yes, any boundary reflects
(*B) No — TIR needs dense-to-rare ($n_1 > n_2$ from the ray's side); here the ray travels rare-to-dense, so it refracts inward regardless of angle, never trapped
(C) Yes past $80.6°$
(D) Depends on wavelength only
::: explanation
Direction matters: trapping works core→cladding (dense→rare past $\theta_c$), never the reverse. Cladding-side rays always enter the core — the asymmetry light-guides are built on, and a favourite one-line trap.
:::
