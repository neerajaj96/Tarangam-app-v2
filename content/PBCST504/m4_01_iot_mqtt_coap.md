---
id: m4_01_iot_mqtt_coap
courseCode: PBCST504
module: 4
sequence: 1
title: 'IoT Architecture, MQTT & CoAP'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the IoT pipeline in plain words first
  - Contrast brokered MQTT against direct CoAP honestly
  - Place security at the right layer
concepts:
  - IoT pipeline
  - MQTT publish-subscribe
  - CoAP request-response
prerequisites:
  - m3_05_can_usb
examRelevance: high
tags:
  - iot-architecture
  - mqtt-coap
---
# IoT Architecture, MQTT & CoAP

**What problem planet-scale sensing poses, what the device–gateway–cloud pipeline answers, how Message Queuing Telemetry Transport (MQTT) publish-subscribe differs from Constrained Application Protocol (CoAP) request-response, and where security lives.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Ten thousand soil sensors must report hourly; farmers' phones must see alerts instantly. The problem: tiny devices cannot hold internet-grade connections, yet messages must route reliably to the right consumers. IoT architecture splits the job: devices sense (constrained), gateways aggregate (mains-powered), cloud stores and serves (infinite).

Tiny beginner example. Sensor publishes `farm/plot3/moisture = 22%` to a broker; the farmer's phone, subscribed to `farm/plot3/#`, receives it; an irrigation rule, subscribed to all plots, waters plot 3. Publisher never knows subscribers — the broker decouples them.

Analogy as support, then dropped. Think of a newspaper (broker): reporters (publishers) file stories under sections (topics); readers (subscribers) buy sections, never meeting reporters. CoAP is instead a direct phone call (ask, answer, hang up). From here on we use exact terms only: topic, broker, Quality of Service (QoS).

Abbreviations defined on first use: Message Queuing Telemetry Transport (MQTT), Constrained Application Protocol (CoAP), Quality of Service (QoS). Symbols: QoS 0/1/2 (at-most/at-least/exactly-once).

| Question to ask | Meaning |
|---|---|
| What is a topic? | Hierarchical message name (`farm/plot3/moisture`) with `+`/`#` wildcards |
| What is QoS? | Delivery promise: 0 fire-and-forget, 1 retry-till-acked (duplicates possible), 2 exactly-once (costliest) |
| What is CoAP's shape? | HTTP-like GET/POST/PUT/DELETE over UDP, tiny headers, confirmable or not |

<a id="words-first"></a>
## 2. Words First — IoT Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Device / gateway / cloud** | Constrained sensor (battery, KBs RAM) → aggregator (translates, buffers offline) → storage/dashboards/rules (scales forever). |
| **Broker (MQTT)** | Central post office holding topics; publishers and subscribers connect only to it — decoupling is the feature. |
| **Retain + Last Will** | Broker keeps last message per topic for late subscribers (retain); publishes a death notice if a client vanishes (will) — presence without polling. |
| **CoAP confirmable** | Request flagged "ack me": retransmitted till acknowledged — reliability without TCP's weight. |
| **Security placement** | Transport encryption (TLS/DTLS) plus device identity (keys in Secure world, M1.04) — never plaintext credentials in firmware. |

::: callout-intuition Core Mental Model: Newspaper Plus Phone Calls
MQTT is the newspaper: sections (topics), reporters (publishers), subscribers, and editions by QoS promise. CoAP is the phone call: direct, light, hung up after the answer. Newspapers scale readers; phone calls suit one question — protocol follows the conversation shape.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Choosing Honestly

**MQTT vs CoAP (examinable table):** transport TCP vs UDP; pattern publish-subscribe via broker vs client-server request-response; overhead heavier (persistent connection) vs featherweight; reliability QoS 0/1/2 vs confirmable flags; scaling many-subscribers vs one-querier; NAT traversal harder (long-lived TCP) vs easier (UDP + gateway). Rule: many consumers of streams ⇒ MQTT; occasional direct queries to sleepy devices ⇒ CoAP.

**QoS economics:** QoS 0 for expendable telemetry (next reading supersedes); QoS 1 for commands where duplicates are idempotent-safe; QoS 2 where duplicates corrupt (billing, actuation) — and exactly-once costs four-way handshakes plus broker storage. Higher QoS never fixes a dead network, only promises about live ones.

**STM32's seat:** U575 publishes via its radio (M4.02) through gateway or direct TLS-MQTT; TrustZone holds broker credentials (M4.05); low-power modes duty-cycle the radio (M2.02). The course converges here — every earlier module staffs this pipeline.

::: callout-formula KTU Formula Vault: IoT Facts
Pipeline = device→gateway→cloud · MQTT = brokered topics + QoS 0/1/2 + retain/will · CoAP = UDP requests + confirmable acks · streams⇒MQTT, queries⇒CoAP · TLS/DTLS + Secure-world keys, never plaintext secrets.
:::

::: callout-pitfall QoS Worship
QoS 2 over a dead link delivers nothing — promises need connectivity. Match QoS to duplicate-tolerance (telemetry 0, idempotent commands 1, billing/actuation 2), not to anxiety.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Farm: 100 sensors publish hourly moisture; phones need alerts under 20%; valves actuate on command. (a) MQTT or CoAP for sensor flow, and why? (b) QoS per flow (telemetry, alert, valve command)? (c) Where do broker credentials live on the U575?
:::

::: step [Step 2: Execution] Matching Shapes
(a) MQTT: one-to-many streams with decoupled subscribers (phones + rules). (b) Telemetry QoS 0 (next hour supersedes); alerts QoS 1 (retry till seen, duplicates harmless); valve QoS 2 or 1-with-idempotent-design (actuation must not double-fire). (c) Secure world (TrustZone vault, M1.04/M4.05) — never plaintext in Non-secure flash.
:::

::: step [Step 3: Conclusion] Final Result
Conversation shape picks protocol, duplicate-tolerance picks QoS, silicon vault holds identity — three decisions, each with its own decider.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Subscribing devices to everything (`#` everywhere). Bandwidth and battery bill every message — subscribe narrowly.
- Expecting retain to store history. Retain keeps one last message, not a log — history lives in the cloud store.
- Hardcoding credentials. Extractable firmware secrets void all transport security — vault them.

Exam recap: pipeline roles; newspaper-vs-phone-call table; QoS ladder with duplicate economics; retain/will semantics; credential placement; streams-vs-queries rule.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz 1000 sensors stream telemetry; three dashboards and one rule-engine consume. MQTT or CoAP, and what breaks in the other choice?
() CoAP — dashboards poll each sensor hourly
(*) MQTT: publishers file once, broker fans out to all subscribers; CoAP would force 4000 direct query relationships with polling overhead and no decoupling — streams with many consumers are the newspaper case
() Neither — raw TCP sockets scale better
() CoAP with QoS 2 matches MQTT exactly
::: explanation
Count relationships: MQTT holds 1000 (devices→broker); CoAP holds consumers×devices thousands. Decoupling is the scalability — name the relationship math, not just the acronym.
:::

::: quiz Valve command versus hourly moisture reading: assign QoS levels with duplicate-tolerance reasons.
() Both QoS 2 — maximum always
(*) Valve: QoS 2 (or idempotent QoS 1) — double-watering corrupts the field; moisture: QoS 0 — the next hour supersedes any loss. Duplicate economics, not importance theatre, sets the level
() Both QoS 0 — speed beats safety
() QoS follows message size, not meaning
::: explanation
Ask "what does a duplicate cost?" Watering twice floods; a missed reading refreshes in an hour. QoS prices the duplicate — quote the cost per flow.
:::

::: quiz Broker credentials sit in Non-secure flash "because TLS encrypts everything anyway." What is wrong and where must they live?
() Nothing — TLS covers storage too
(*) TLS protects the wire, not the vault: extractable firmware yields credentials to any reader, voiding all transport security. Keys live in the Secure world (TrustZone) with attested boot — wire security plus stored-secret security, both mandatory
() Credentials need no protection on private networks
() Flash cannot be read by attackers ever
::: explanation
Two safes, two keys: transport encryption guards transit, hardware worlds guard rest. One safe open is total compromise wearing half an armour — the M1.04 vault lesson applied to the cloud edge.
:::
