# Transmission Media: Guided & Unguided

**Copper, glass, and thin air — twisted pair vs coax vs fibre, radio vs microwave vs satellite vs infrared, and two hand-computed propagation numbers.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Roads, Rails, and Radio
**Twisted pair** is a country road (cheap, short hops, noise from neighbours — twisting cancels crosstalk). **Coax** is a guarded highway (shielded, fatter bandwidth, costlier). **Fibre** is a light-rail in a vacuum tube (total internal reflection, near-light speed, kilometres without repeaters). **Unguided** (radio/microwave/satellite/infrared) skips roads entirely — broadcast freedom, shared-sky interference, and physics-set distance limits.
:::

::: anim fiber-tir Dense Glass Traps Its Own Light
Core $n = 1.48$ against cladding $n = 1.46$: past $\theta_c \approx 80.6°$ every wall hit reflects fully — the ray below zigzags for kilometres.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Guided menu

Twisted pair (UTP/STP: Cat grades, $\sim 100$ m LAN runs, RJ45), coaxial (baseband vs broadband, BNC, cable-TV heritage), fibre (step-index vs graded-index, single-mode vs multimode; sources LED/laser; TIR condition $\sin\theta_c = n_2/n_1$ for $n_1 > n_2$). Rule of thumb: bandwidth × distance crowns fibre, price crowns twisted pair, legacy plants keep coax alive.

### 2.2 Unguided menu

Radio ($3$ kHz–$1$ GHz: omnidirectional, walls pass), microwave ($1$–$300$ GHz: line-of-sight, dishes, rain fade), satellite (geostationary $35{,}800$ km: $\approx 240$ ms round-trip floor, broadcast one-to-many), infrared (short, wall-blocked — remote controls, not backbones). Propagation delay $= d/v$ with $v \approx 2.4 \times 10^8$ m/s in cable, $c$ in air.

::: callout-formula KTU Formula Vault: Media
Twist cancels crosstalk · coax shields · TIR needs $\sin\theta_c = n_2/n_1$ · radio passes walls, microwave needs sightlines, GEO $\approx 240$ ms floor · delay $= d/v$.
:::

Satellite delay is geometry, not congestion: $2 \times 35{,}800$ km at $c$ is $\approx 240$ ms before a single queue is met — latency budgets must swallow it whole.

::: callout-pitfall Bandwidth vs Propagation
Fibre's "speed" is bandwidth (bits/s), not shorter delay — light in glass ($2.4 \times 10^8$) is *slower* than radio in air ($c$). An option claiming fibre "reduces propagation delay" confuses fat pipes with fast trips.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Fibre core $n_1 = 1.48$, cladding $n_2 = 1.46$: critical angle? (b) $2500$-km fibre run at $v = 2.4 \times 10^8$ m/s: one-way propagation delay?
:::

::: step [Step 2: Execution] Angle and Delay
(a) $\sin\theta_c = 1.46/1.48 \approx 0.98649$. Since $\sin 80° \approx 0.9848$ and $\sin 81° \approx 0.9877$, $\theta_c \approx 80.6°$ — rays steeper than this from the wall-normal stay trapped. (b) $d = 2.5 \times 10^6$ m; delay $= 2.5 \times 10^6 / 2.4 \times 10^8 \approx 0.01042$ s $\approx 10.42$ ms. Same run by GEO satellite: $\approx 240$ ms — $23\times$ worse before queueing starts.
:::

::: step [Step 3: Conclusion] Final Result
$\theta_c \approx 80.6°$, fibre delay $\approx 10.42$ ms vs satellite $\approx 240$ ms. Two numbers that jointly explain the backbone: glass traps light cheaply, and geometry taxes satellites unavoidably.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
