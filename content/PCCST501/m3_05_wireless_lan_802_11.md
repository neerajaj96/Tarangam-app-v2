---
id: m3_05_wireless_lan_802_11
courseCode: PCCST501
module: 3
sequence: 5
title: 'Wireless LAN: 802.11, CSMA/CA & Mobility'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Explain why collision detection dies on radio
  - Reserve airtime with RTS/CTS against hidden terminals
  - Read the four-address 802.11 frame and join sequence
  - Self-test with the exam recap and active-recall checklist
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
## 1. The Real-World Situation — Start From Zero

A café's laptops share one radio channel to one access point. Wired Ethernet's trick — listen while talking, abort on collision — is physically impossible here: a transmitting radio deafens its own receiver, and two laptops may both hear the access point yet be inaudible to *each other*. Collisions still happen; they just can't be *detected*.

The problem before the solution: share radio airtime without the ability to hear collisions. The answer replaces detection with **avoidance**: listen first, publicly reserve the air (RTS/CTS — Request to Send / Clear to Send), back off randomly, and acknowledge every frame (because radio corrupts bits even without collisions).

::: callout-intuition Core Mental Model: Polite Conversation in the Dark
Wired Ethernet is a lit room: you *see* interruptions mid-sentence (collision detection). **Wi-Fi is a dark room of polite speakers**: you can't hear collisions while talking (your own voice deafens you), and two people may both clearly hear the host yet be inaudible to *each other* (**hidden terminals**). So instead of detecting collisions, wireless speakers **avoid** them: listen first, announce "I will speak for 5 seconds" (**RTS**), wait for the host's "floor is yours" (**CTS**), then speak — while everyone else, hearing the reservation, stays politely silent.

Dropping the dark room now: CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance) = sense + reserve + backoff + ACK; hidden terminal = two senders colliding at the AP (Access Point) unheard; NAV (Network Allocation Vector) = everyone's silence timer.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **AP (Access Point)** | The base station bridging wireless stations to the wired network. |
| **CSMA/CA (… with Collision Avoidance)** | 802.11's access method: sense (DIFS — Distributed Inter-Frame Space — idle), optional RTS/CTS reservation, binary backoff, per-frame ACK. |
| **Hidden terminal** | Two stations both reaching the AP but not each other — simultaneous sends collide *at the AP*, unheard by either sender. |
| **Exposed terminal** | Mirror image: carrier sense needlessly silences a station whose transmission would not have collided — lost parallelism. |
| **RTS / CTS (Request to Send / Clear to Send)** | Short reservation frames: sender's RTS (with duration) → AP's CTS echo (same duration) silences all hearers via NAV timers. |
| **NAV (Network Allocation Vector)** | Each station's countdown of reserved airtime — silence until it expires. |
| **DIFS (Distributed Inter-Frame Space)** | The mandatory idle-listening interval before a station may contend. |
| **Association / handoff** | Join sequence (scan → associate → authenticate) vs. moving between APs (reassociation; same subnet = Layer-2 handoff, cross-subnet = Mobile IP). |

<a id="the-math"></a>
## 3. Purpose — Why CD Dies, How CA Avoids, Frame and Joining

### 3.1 Why CSMA/CD Dies on Radio (Two Killers)

* **Self-deafening:** a transmitting radio drowns out incoming signals at its own antenna — collision *detection* during transmission is physically impossible.
* **Hidden terminals:** A and C both reach access point B but not each other; both sense silence, transmit together, collide *at B* — a collision neither sender could hear. (Mirror image: **exposed terminals** B→A and C→D could safely overlap, but carrier sense needlessly silences C — lost parallelism.)

### 3.2 Operation Flow: CSMA/CA — Avoidance by Reservation, Step by Step

1. Sense: idle for **DIFS** → may transmit; busy → **binary exponential backoff** (like Ethernet's, but no abort mid-frame — the frame always completes).
2. Optional **RTS/CTS handshake**: sender's RTS (with duration) → AP's CTS (echoing duration) silences *all* hearers — including nodes hidden from the sender. Short control frames collide cheaply instead of long data frames.
3. Receiver **ACKs** every data frame (wireless loss is normal — errors, not just collisions — so link-layer ACKs + retransmission are mandatory here, unlike wired Ethernet).

### 3.3 Packet Structure: The 802.11 Frame & Joining a Network

Four address fields (vs. Ethernet's two — relaying through the AP needs source, destination, transmitter, *and* receiver addresses), sequence control, duration field (reserves the channel in everyone's NAV timer). Joining: **scan** (passive listen / active probe) → **associate** (AP assigns association ID) → **authenticate**; moving between APs = **handoff/reassociation** (same subnet: Layer-2 handoff; across subnets: Mobile IP territory).

::: callout-formula KTU Formula Vault: Wireless Facts
No CD (self-deaf + hidden) → **CA with RTS/CTS + backoff + per-frame ACKs** · hidden = can't hear each other, collide at AP · exposed = silenced needlessly · **4 address fields** (AP relaying) · join = **scan → associate → authenticate** · errors normal ⇒ **link ACKs mandatory**.
:::

::: callout-pitfall RTS/CTS Reserves, It Doesn't Detect
RTS/CTS never *detects* a collision — it *prices* collisions down (short control frames risk the channel instead of 1500-byte data frames) and *informs* hidden nodes via the CTS echo. Any option claiming CTS "measures collisions" confuses the mechanism's purpose.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

Two laptops, no hidden geometry, tiny frames: both sense DIFS-idle; A wins, sends, gets ACKed; C's backoff expires next and sends. No RTS/CTS needed — reservations pay off when frames are long or terminals hidden, not always.

### 4.2 KTU-Style Worked Example

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

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| CD vs. CA | Detect-while-talking (needs wire) vs. reserve-before-talking (radio-safe). |
| Hidden vs. exposed terminal | Unheard colliders at AP (CTS echo fixes) vs. needlessly silenced parallel pair (lost reuse). |
| RTS vs. CTS reach | Sender's neighbourhood vs. whole cell (the echo is the point). |
| 802.11 vs. Ethernet frame | 4 addresses (AP relaying) + duration/sequence vs. 2 addresses. |

**Watch out:** (1) "CTS detects collisions" — it reserves airtime. (2) Skipping per-frame ACKs on Wi-Fi — radio bit errors make them mandatory. (3) Using RTS/CTS for every tiny frame — reservation overhead must beat collision cost to pay off.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Radio kills CD (self-deaf + hidden terminals) → 802.11 uses CA: DIFS sense + backoff, RTS/CTS reservation (CTS echo sets hidden NAVs), mandatory per-frame ACKs. 4-address frames (source/destination/transmitter/receiver). Join = scan → associate → authenticate; AP moves = handoff (same subnet L2, cross-subnet Mobile IP).
:::

**Active-recall checklist:** What two facts kill CD on radio? What does C hear in an A→B exchange, and what does it do? Why four addresses? Why are link ACKs mandatory here but not on Ethernet?

<a id="self-check"></a>
## 6. Active Recall Quizzes

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
Same layering-economics argument as the framing topic: buy reliability machinery exactly where the medium's loss rate justifies it. Wireless BER (Bit Error Rate) makes per-frame ACKs profitable; wired BER makes them rounding error — so Ethernet omits them and lets TCP handle the rare loss.
:::
