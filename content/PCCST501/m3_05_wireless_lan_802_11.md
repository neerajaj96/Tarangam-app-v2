---
id: m3_05_wireless_lan_802_11
courseCode: PCCST501
module: 3
sequence: 5
title: 'Wireless LAN: 802.11, CSMA/CA & Mobility'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Explain why collision detection dies on radio
  - Reserve airtime with RTS/CTS against hidden terminals
  - Read the four-address 802.11 frame and join sequence
concepts:
  - CSMA/CA
  - hidden terminals
  - 802.11 framing
prerequisites:
  - m3_03_multiple_access_protocols
examRelevance: medium
tags:
  - wireless
  - wifi
---
# Wireless LAN: 802.11, CSMA/CA & Mobility

**Why wireless can't detect collisions, hidden/exposed terminals, RTS/CTS reservation, the 802.11 frame, association, and handoff.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Polite Conversation in the Dark
Wired Ethernet is a lit room: you *see* interruptions mid-sentence (collision detection). **Wi-Fi is a dark room of polite speakers**: you can't hear collisions while talking (your own voice deafens you), and two people may both clearly hear the host yet be inaudible to *each other* (**hidden terminals**). So instead of detecting collisions, wireless speakers **avoid** them: listen first, announce "I will speak for 5 seconds" (**RTS**), wait for the host's "floor is yours" (**CTS**), then speak — while everyone else, hearing the reservation, stays politely silent.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Why CSMA/CD Dies on Radio (Two Killers)

* **Self-deafening:** a transmitting radio drowns out incoming signals at its own antenna — collision *detection* during transmission is physically impossible.
* **Hidden terminals:** A and C both reach access point B but not each other; both sense silence, transmit together, collide *at B* — a collision neither sender could hear. (Mirror image: **exposed terminals** B→A and C→D could safely overlap, but carrier sense needlessly silences C — lost parallelism.)

### 2.2 CSMA/CA: Avoidance by Reservation

1. Sense: idle for **DIFS** → may transmit; busy → **binary exponential backoff** (like Ethernet's, but no abort mid-frame — the frame always completes).
2. Optional **RTS/CTS handshake**: sender's RTS (with duration) → AP's CTS (echoing duration) silences *all* hearers — including nodes hidden from the sender. Short control frames collide cheaply instead of long data frames.
3. Receiver **ACKs** every data frame (wireless loss is normal — errors, not just collisions — so link-layer ACKs + retransmission are mandatory here, unlike wired Ethernet).

### 2.3 The 802.11 Frame & Joining a Network

Four address fields (vs. Ethernet's two — relaying through the AP needs source, destination, transmitter, *and* receiver addresses), sequence control, duration field (reserves the channel in everyone's NAV timer). Joining: **scan** (passive listen / active probe) → **associate** (AP assigns association ID) → **authenticate**; moving between APs = **handoff/reassociation** (same subnet: Layer-2 handoff; across subnets: Mobile IP territory).

::: callout-formula KTU Formula Vault: Wireless Facts
No CD (self-deaf + hidden) → **CA with RTS/CTS + backoff + per-frame ACKs** · hidden = can't hear each other, collide at AP · exposed = silenced needlessly · **4 address fields** (AP relaying) · join = **scan → associate → authenticate** · errors normal ⇒ **link ACKs mandatory**.
:::

::: callout-pitfall RTS/CTS Reserves, It Doesn't Detect
RTS/CTS never *detects* a collision — it *prices* collisions down (short control frames risk the channel instead of 1500-byte data frames) and *informs* hidden nodes via the CTS echo. Any option claiming CTS "measures collisions" confuses the mechanism's purpose.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Stations A and C are hidden from each other; both associate to AP B. A wants to send a 1500-byte frame to B while C also has traffic. Trace the RTS/CTS exchange and show exactly which transmissions each party hears.
:::

::: step [Step 2: Execution] Reserving the Air
1. A senses idle for DIFS, sends short **RTS** (duration = CTS + DATA + ACK time). B hears it; C (out of A's range) hears **nothing**.
2. B replies **CTS** (same duration). Both A *and* C hear the CTS (both in B's range) → C sets its NAV timer and stays silent for the whole reservation, despite never hearing A's RTS.
3. A sends DATA; B **ACKs**. Only then does C's NAV expire and contend normally.
:::

::: step [Step 3: Conclusion] Final Result
The CTS echo is the entire trick: one broadcast from the *center* informs nodes the *edge* cannot reach. Worst case without it — A's 1500 bytes destroyed by C mid-flight, both backing off blindly; with it, collisions (if any) strike 20-byte control frames. Hidden terminals neutralized by topology-aware protocol design.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Which two physical facts together make CSMA/CD unusable on Wi-Fi, forcing CSMA/CA?
() Low bandwidth and high latency of radio links
(*) The sender's own transmission deafens its receiver (no in-transmission detection), and hidden terminals collide at the AP unheard by either sender
() Wi-Fi frames are too short to detect
() Radio waves travel slower than electrical signals
::: explanation
CD needs *detect-while-sending* (impossible: self-deafening) *and* all contenders hearing each other (false: hidden terminals). Both premises fail on radio, so 802.11 replaces detection with avoidance — reservations, backoff, and ACKs.
:::

::: quiz In the hidden-terminal scenario (A and C hidden, sharing AP B), what precisely does B's CTS accomplish that A's RTS alone cannot?
() It encrypts the upcoming data frame
(*) It informs C — which never heard the RTS — of the reservation duration, silencing a collider the sender cannot reach
() It measures the exact collision probability for A
() It disconnects C from the network temporarily
::: explanation
RTS reaches only the sender's audible neighborhood; CTS, broadcast from the *AP at the center*, reaches *everyone in the cell* including nodes hidden from the sender. The echo converts a one-sided announcement into cell-wide silence (NAV timers).
:::

::: quiz Why does 802.11 mandate per-frame link-layer ACKs while classic wired Ethernet skips them?
() Wireless adapters have spare memory with nothing better to do
(*) Bit errors (not just collisions) are routine on radio, so silent corruption is common — fast link-local retransmission beats waiting for TCP's coarse end-to-end timer; wired BER is negligible so the machinery would add pure overhead
() ACKs are required by all IEEE standards regardless of medium
() Ethernet cables acknowledge optically instead
::: explanation
Same layering-economics argument as the framing topic: buy reliability machinery exactly where the medium's loss rate justifies it. Wireless BER makes per-frame ACKs profitable; wired BER makes them rounding error — so Ethernet omits them and lets TCP handle the rare loss.
:::
