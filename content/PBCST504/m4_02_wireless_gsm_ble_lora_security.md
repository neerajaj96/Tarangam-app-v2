---
id: m4_02_wireless_gsm_ble_lora_security
courseCode: PBCST504
module: 4
sequence: 2
title: 'Wireless Links, Home Automation & IoT Security'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the range/power/rate triangle in plain words first
  - Place GSM, Bluetooth, and LoRa on it honestly
  - Build a home-automation threat model with cures
concepts:
  - wireless trade triangle
  - GSM Bluetooth LoRa
  - IoT threat model
prerequisites:
  - m4_01_iot_mqtt_coap
examRelevance: high
tags:
  - wireless-links
  - iot-security
---
# Wireless Links, Home Automation & IoT Security

**What problem cutting the last wire poses, how range, power, and rate trade on one triangle, where Global System for Mobile (GSM), Bluetooth (including Low Energy), and Long Range (LoRa) sit, how a home-automation stack composes, and what threat model plus cures IoT security demands.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A farm sensor 5 km away must report for years; a bedroom bulb must answer a phone in milliseconds; a village pump has no Wi-Fi at all. The problem: no one radio is long, fast, and frugal — pick two. Wireless choice is triangle navigation: range, data rate, power hunger.

Tiny beginner example. Soil probe (bytes/hour, kilometres, battery): LoRa. Bulb (instant response, metres, mains): Bluetooth/Wi-Fi. Pump SMS alert (no data network, anywhere with signal): GSM. Same "wireless" word, three different triangles.

Analogy as support, then dropped. Think of transport: cargo ship (LoRa: far, slow, cheap), bicycle courier (Bluetooth: near, quick, light), telegram office (GSM: anywhere with wires, per-message price). From here on we use exact terms only: link budget, duty cycle, pairing/bonding.

Abbreviations defined on first use: Global System for Mobile communications (GSM), Long Range (LoRa), Bluetooth Low Energy (BLE). Symbols: triangle corners = range × rate × 1/power (pick two).

| Question to ask | Meaning |
|---|---|
| What decides range? | Link budget (power + antennas − losses) and band physics, not brand names |
| What decides battery? | Duty cycle × transmit current — same average-current law as M2.02 |
| What is pairing/bonding? | Bluetooth's trust ceremony (pair) plus remembered keys (bond) — skip it and neighbours drive your bulb |

::: toggle What do "link budget" and "duty cycle" decide, concretely?
Link budget = transmit power + antenna gains − path/environment losses, in dB: positive margin means the signal arrives readable; walls, rain, and distance spend it. Duty cycle = fraction of time transmitting (LoRa law-caps around ~1% in shared bands): it caps both battery drain and legal airtime. Budget decides reach, duty decides battery and legality.
:::

::: toggle What is the difference between spoofing, replay, and extraction attacks?
Spoofing = forging commands from an unauthorised source (fake "unlock"). Replay = re-sending a recorded legitimate command later (yesterday's "unlock" re-played). Extraction = reading secrets out of captured firmware/hardware. Cures differ per row: authentication answers spoofing, freshness (nonces/counters) answers replay, vaulted storage answers extraction.
:::

<a id="words-first"></a>
## 2. Words First — Radio Vocabulary

| Link (abbreviation expanded on first use) | Place on triangle | Plain meaning |
|---|---|---|
| **GSM/SMS/data** | Anywhere with towers, per-message cost, hungriest | Control and alerts over cellular; AT commands drive modems; coverage rented monthly |
| **Bluetooth Classic / BLE** | Metres, fast enough, phone-native | Classic streams audio; BLE advertises/sips for sensors; phones already speak both |
| **LoRa / LoRaWAN** | Kilometres, bytes, years-on-battery | Chirp spread-spectrum shrugs noise; gateway forwards to network server; duty-cycle law-limited |
| **Home stack (bulb + app + rule)** | Mains + phone + cloud/broker | Bulb (BLE/Wi-Fi + relay, M2.04 grown up), app (MQTT subscriber), rules (M4.01 topics) — composition, not new physics |
| **Threat model (spoof/replay/extract)** | Attacker goals per asset | Fake commands (spoof), recorded replays, extracted keys — each with its cure below |

::: callout-intuition Core Mental Model: Triangle Plus Castle
Radios live on the range–rate–power triangle (improve one corner, pay on others). The home is a castle: radios are gates (pairing/bonding locks), firmware updates are supply convoys (signed, M4.05), keys are the crown jewels (vaulted). Choose gates by triangle, guard the castle by model.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Honest Placement and Cures

**Placement (no free lunch):** GSM — widest coverage, monthly cost, amps in bursts (needs mains or big battery + capacitors); BLE — phone in every pocket, metres-to-tens-of-metres, microamps sleeping; LoRa — kilometres at bytes-per-hour with regulatory duty caps (~1%), gateways shared. Examiner bait: "LoRa for video" (rate fails), "BLE across the farm" (range fails), "GSM on a coin cell" (power fails).

**Home-automation composition:** sensor/actuator nodes (this course's peripherals) → phone app or hub (BLE/Wi-Fi) → MQTT topics (M4.01) → rules and dashboards. Each hop reuses a module: M2.04 outputs, M3 links, M4.01 messaging, M4.05 vaulted identity. The "project" is composition with a threat model attached.

**Threat model + cures (numbered):** (1) Spoofed commands (fake "unlock") ⇒ authenticate every command (keys, counters/timestamps against replay). (2) Replayed recordings (yesterday's "unlock" re-sent) ⇒ nonces/monotonic counters, never bare passwords. (3) Extracted firmware keys ⇒ Secure-world storage + signed updates (M4.05). (4) Physical tampering ⇒ tamper-evident enclosures + attestation where the syllabus reaches. Model first (assets → attackers → cures), gadgets second.

::: callout-formula KTU Formula Vault: Wireless Facts
Triangle: range × rate × frugality, pick two · GSM = coverage at cost/hunger · BLE = phone-native metres · LoRa = kilometre bytes under duty caps · home = nodes + hub + MQTT + rules · threats: spoof/replay/extract ⇒ authenticate + counters + vault + signed updates.
:::

::: callout-pitfall Coverage Confusion
"Works in the lab" proves nothing about the farm: walls, rain, and duty caps eat link budgets. Range answers quote environment and duty cycle, never datasheet maxima alone.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
(a) Place: village pump SMS alert (no data coverage), bedroom bulb (instant, mains), 3 km soil probe (hourly bytes, battery). (b) Bulb accepts unpaired commands — name the attack and cure. (c) Valve command security beyond TLS?
:::

::: step [Step 2: Execution] Triangles and Models
(a) Pump: GSM SMS (towers exist where data doesn't; per-message cost fits rare alerts); bulb: BLE/Wi-Fi (instant, mains, phone-native); probe: LoRa (kilometres + bytes + duty-capped battery life). (b) Spoofing by any neighbour — cure: pairing/bonding plus authenticated commands. (c) Counters/nonces against replay + vaulted keys (M4.01 QoS covers delivery, not authenticity).
:::

::: step [Step 3: Conclusion] Final Result
Environment picks the radio (coverage/rate/power facts), attackers pick the cures (spoof/replay/extract each answered). No radio without a triangle position, no gadget without a threat row.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Quoting lab range for field deployments. Link budgets include walls, weather, and antenna orientation — field-test or derate.
- Treating encryption as authentication. Encrypted-but-malleable or replayable commands still actuate — authenticate with freshness.
- Ignoring duty caps on LoRa. Law, not suggestion: over-transmitting breaks regulations and shared gateways.

Exam recap: triangle navigation per scenario; GSM/BLE/LoRa honest seats; home-stack composition from course modules; four-threat model with matched cures; pairing/bonding purpose.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Farm: pump house with SMS-only coverage, barn bulb on mains needing instant phone control, soil probes 3 km out reporting hourly. Assign radios with one decisive reason each.
() Wi-Fi for all — one radio simplifies everything
(*) Pump: GSM SMS (only coverage present, rare alerts fit per-message cost); bulb: BLE/Wi-Fi (mains + instant + phone-native); probes: LoRa (kilometre range, byte rates, duty-capped battery years) — environment facts cast every vote
() LoRa for the bulb (longest range wins)
() GSM for probes (fastest data wins)
::: explanation
Coverage, latency, energy: read the scenario's three facts first, then the triangle places each radio uniquely. Single-radio answers fail at least one environment fact — name which.
:::

::: quiz Smart lock accepts commands with no pairing and no counters. Name two distinct attacks and their matched cures.
() No attacks possible — wireless is inherently safe
(*) Spoofing (neighbour forges "unlock") ⇒ pairing/bonding + authenticated commands; replay (recorded "unlock" re-sent) ⇒ nonces/monotonic counters. Different attacks, different cures — authentication answers identity, freshness answers time
() Longer passwords fix both without protocol
() Hiding the SSID fixes both
::: explanation
Threat rows pair one-to-one with cures: identity versus time are separate problems. "Encrypt everything" without freshness still replays — freshness is the half most answers forget.
:::

::: quiz Why must valve keys live in the Secure world even though commands ride TLS-MQTT?
() TLS is too slow for valves
(*) TLS guards transit; extraction raids rest — readable flash yields keys regardless of wire armour. Vaulted keys (TrustZone) + signed updates + counters cover storage, supply, and replay; TLS covers only the middle mile
() Keys in flash are invisible to attackers
() Valves need no security at all
::: explanation
Three safes: wire (TLS), vault (TrustZone), supply (signed updates) — plus freshness (counters). Any open safe is total compromise; list all four and the model is complete.
:::
