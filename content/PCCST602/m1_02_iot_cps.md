# IoT & Cyber-Physical Systems

**When computers grow sensors and muscles — device swarms, feedback loops with physics, and the scale that breaks old assumptions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Nervous System Meets World
**IoT** scatters cheap sensing skin (tags, meters, wearables) reporting over the internet — millions of whispering endpoints, tiny batteries, bursty data. **CPS** closes the loop: sense → compute → *actuate physical change* (robots, grids, pacemakers) with deadlines measured in milliseconds — the computation *is* the control system, and wrong timing breaks things, not just SLAs.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 IoT vs CPS (exam-contrast)

| IoT | CPS |
|---|---|
| sense + report (open loop common) | sense–compute–actuate (closed loop) |
| scale/battery-first | timing/safety-first (real-time, verified) |
| best-effort networking OK | deadlines + predictability mandatory |
| examples: meters, tags, farms | examples: ABS, drones, surgical robots, smart grid |

### 2.2 Scale consequences

Addressing (IPv6), lightweight protocols (MQTT/CoAP over HTTP), edge filtering (don't backhaul raw torrents), security surface (billions of weak nodes — botnets recruit here).

::: callout-formula KTU Formula Vault: IoT/CPS
IoT = **sense at scale** · CPS = **closed-loop control** · CPS adds **deadlines + safety proofs**.
:::

::: callout-pitfall IoT ≠ CPS
Calling a soil sensor net "cyber-physical" without actuation/deadlines inflates the claim — examiners check for the *loop* (actuators) and *timing guarantees* before awarding the label.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Classify grain-moisture reporters vs a drone swarm holding formation, then name each one's hardest systems problem."
:::

::: step [Step 2: Execution] Loop Check, Then Pain Point
1. Reporters: pure IoT (sense, no actuation, delay-tolerant) — hardest: battery life + pennies-per-node cost at scale.
2. Swarm: CPS (sense-compute-actuate, formation deadlines) — hardest: real-time coordination + verified safety (collision freedom proofs, not just tests).
:::

::: step [Step 3: Conclusion] Final Result
Loop-presence classifies; pain-point follows the class (scale-vs-timing). Actuators + deadlines are the two-word CPS test — apply before labelling.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What upgrades an IoT deployment into a CPS?
(A) More sensors
(*B) Closing the loop with actuation under timing/safety guarantees — computation that physically changes the world on deadline, verifiably
(C) Cloud dashboards
(D) Bigger batteries
::: explanation
Sensing + reporting stays IoT at any scale; actuation with real-time correctness obligations makes it cyber-*physical*. Guarantees (not features) are the upgrade — proofs over demos.
:::

::: quiz Q2: Foundational Concept
Why edge filtering for IoT torrents?
(A) Edge devices enjoy work
(*B) Backhauling raw sensor firehoses wastes bandwidth/power/money — filter/aggregate near source, ship insight (or exceptions) upward
(C) Clouds are slow
(D) Protocols forbid raw data
::: explanation
Whispering endpoints + expensive uplinks ⇒ compute-near-data. Edge hierarchy (sensor→gateway→cloud) matches cost to value per byte — architecture follows the bill.
:::

::: quiz Q3: Foundational Concept
Mirai-style botnets recruit IoT devices because:
(A) IoT devices are powerful
(*B) Billions of weak, rarely-patched, always-on nodes with default credentials — scale × neglect = army; security was externalised at manufacture
(C) Clouds invite them
(D) Encryption is illegal there
::: explanation
Attack surface scales with deployment while per-device security spending rounds to zero. Lifecycle (updates, credentials, attestation) is the systems answer — name it as the remediation axis.
:::
