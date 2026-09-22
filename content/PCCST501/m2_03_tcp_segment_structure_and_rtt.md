---
id: m2_03_tcp_segment_structure_and_rtt
courseCode: PCCST501
module: 2
sequence: 3
title: TCP Segment Structure, Sequence Numbers & RTT Estimation
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Number byte streams with sequence and cumulative ACKs
  - Read the 20-byte TCP header fields that earn marks
  - Estimate timeouts with the SRTT, DevRTT, and timeout triple
  - Trigger fast retransmit on triple duplicate ACKs
  - Self-test with the exam recap and active-recall checklist
concepts:
  - TCP segments
  - sequence numbers
  - cumulative ACKs
  - RTT estimation
prerequisites:
  - m2_01_transport_layer_services_and_multiplexing
examRelevance: high
tags:
  - tcp
  - reliability
---
# TCP Segment Structure, Sequence Numbers & RTT Estimation

**Byte-stream numbering, the 20-byte header that matters, cumulative ACKs, and how TCP learns the network's round-trip time to set its timer.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

Mail a novel one page per envelope through a postal service that sometimes loses, duplicates, or reorders mail. How does the reader reconstruct the book? Number every page, and have the reader confirm "I have everything up to page 40" after each batch. Gaps name exactly what to re-send; duplicates are already-seen numbers; order is restored by sorting.

The problem before the solution: build *reliable, ordered* delivery over an unreliable network — without trusting arrival order or assuming nothing is lost. TCP (Transmission Control Protocol) does precisely the page-numbering trick — except the "pages" are **bytes**, and the "confirmation" is the **acknowledgment number**. A second problem rides along: how long should the sender wait before declaring a packet lost? Wait too little and you spam duplicates; too long and you stall. So TCP also *learns* the round-trip time and sets its timer from the measurement.

::: callout-intuition Core Mental Model: The Numbered Manuscript
Imagine mailing a novel one page per envelope through an unreliable postal service that sometimes loses, duplicates, or reorders mail. Your fix: number **every character** (not every envelope), and ask the reader to reply "I've received everything up to character 4,000" after each batch. A gap tells you exactly what to re-send; duplicates are spotted instantly (already-seen numbers); order is restored by sorting numbers, not by arrival order. TCP does precisely this — except the "characters" are **bytes**, and the "reply" is the **acknowledgment number**.

Dropping the manuscript now: sequence number = first byte's number in this segment; acknowledgment number = next byte expected (everything before it confirmed); RTT estimators = measured delay smoothed into a timeout.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Sequence number** | The byte-stream number of the *first* data byte in this segment (initial ISN — Initial Sequence Number — chosen at handshake, then counting bytes, not segments). |
| **Acknowledgment (ACK) number** | The *next* byte the receiver expects — "everything before this has arrived intact." ACKs are **cumulative**. |
| **Cumulative ACK** | One ACK for byte 5001 confirms bytes 0–5000, however many segments carried them. |
| **RTT (Round-Trip Time)** | Send time → acknowledgment arrival for one segment. |
| **SampleRTT** | One fresh RTT measurement (taken only on segments transmitted exactly once). |
| **SRTT (Smoothed/Estimated RTT)** | Exponential weighted moving average of samples ($\alpha = 0.125$). |
| **DevRTT (RTT deviation)** | Smoothed mean deviation of samples ($\beta = 0.25$). |
| **Fast retransmit** | Re-sending after three duplicate ACKs without waiting for the timer. |
| **MSS (Maximum Segment Size)** | Largest TCP payload per segment — the unit congestion math counts in. |

<a id="the-math"></a>
## 3. Purpose — Numbering, Header, Timeout Triple

### 3.1 TCP Views Data as a Numbered Byte Stream

* **Sequence number:** the byte-stream number of the *first* data byte in this segment (initial ISN chosen at handshake, then counting bytes, not segments).
* **Acknowledgment number:** the *next* byte the receiver expects — i.e. "everything before this has arrived intact." ACKs are **cumulative**: one ACK for byte 5001 confirms bytes 0–5000, however many segments carried them.

::: toggle What do `sequence number` and `acknowledgment number` mean?
A `sequence number` is the byte-stream number of the first data byte carried in this segment.
An `acknowledgment number` is the next byte the receiver expects, confirming everything before it.
Tiny example: a 1000-byte segment starting at 5000 earns ACK 6000, confirming bytes 5000 through 5999.
:::

### 3.2 Packet Structure: The Header Fields That Earn Marks (20 bytes minimum)

Source/destination ports (multiplexing), **sequence + acknowledgment numbers** (ordering/reliability), header length, flags (**SYN** — synchronize, **ACK** — acknowledgment, **FIN** — finish, **RST** — reset: connection control), **receive window** `rwnd` (flow control, next topic), **checksum** (always computed in TCP; contrast UDP, where it is optional in IPv4 and mandatory in IPv6), urgent pointer.

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |  demux
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |  byte # of
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+  1st payload byte
|                     Acknowledgment Number                     |  next byte
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+  expected
|Offset |  Flags (SYN ACK FIN..)|        Receive Window         |  control +
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+  flow ctrl
|            Checksum           |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
                     20 bytes minimum (options may extend)
```

### 3.2a Interactive Walkthrough: Reading the 20 Bytes Row by Row

::: viz stepper Walk the TCP header four bytes at a time
1. Bytes 0–3: source port, destination port — who talks to whom (multiplexing, as in UDP)
2. Bytes 4–7: sequence number — first payload byte's number in the stream
3. Bytes 8–11: acknowledgment number — next byte expected, cumulative
4. Bytes 12–15: header length, flags (SYN/ACK/FIN/RST), receive window — control plus flow control
5. Bytes 16–19: checksum (mandatory, unlike UDP's qualified case) plus urgent pointer — 20 bytes minimum, options only extend it
:::

### 3.3 Operation Flow: Learning the RTT — SRTT, DevRTT, Timeout, Symbol by Symbol

TCP cannot be born knowing the network's delay — it measures each segment's **SampleRTT** (send time → ACK arrival, measured only for once-transmitted segments) and smooths it. Symbols: $\alpha = 0.125$ (weight of the new sample), $\beta = 0.25$ (weight of the new deviation):

* **EstimatedRTT (SRTT):** exponential weighted moving average, $\text{SRTT} = (1-\alpha)\cdot\text{SRTT} + \alpha\cdot\text{SampleRTT}$, typically $\alpha = 0.125$ — mostly history, slightly present.
* **DevRTT:** smoothed mean deviation, $\text{DevRTT} = (1-\beta)\cdot\text{DevRTT} + \beta\cdot|\text{SRTT} - \text{SampleRTT}|$, typically $\beta = 0.25$.
* **TimeoutInterval:** $\text{SRTT} + 4 \cdot \text{DevRTT}$ — the safety margin scales with *variability*, not just delay.

::: callout-formula KTU Formula Vault: The Timeout Triple
$\text{SRTT}_{new} = 0.875\cdot\text{SRTT} + 0.125\cdot\text{Sample}$ · $\text{Dev}_{new} = 0.75\cdot\text{Dev} + 0.25\cdot|\text{SRTT}-\text{Sample}|$ · **Timeout = SRTT + 4·DevRTT**. The classic numerical hands you a SampleRTT plus old estimates and asks for the new timeout — apply all three lines in order. Never measure SampleRTT on a *retransmitted* segment (which transmission is the ACK for? — Karn's ambiguity).
:::

### 3.4 Fast Retransmit: Don't Wait for the Timer

Three **duplicate ACKs** for the same byte mean the next segment probably vanished while later ones arrived — TCP re-sends it immediately, well before TimeoutInterval expires. The timer is the safety net; duplicate ACKs are the early-warning radar.

::: toggle What are `SampleRTT`, `SRTT`, `DevRTT` and `TimeoutInterval`?
`SampleRTT` is one measured send-to-ACK delay, taken only on segments sent exactly once.
`SRTT` smooths samples with weight 0.125 new, `DevRTT` smooths deviation with weight 0.25, and `TimeoutInterval` equals `SRTT` plus 4 times `DevRTT`.
Tiny example: `SRTT` 100 and `DevRTT` 12 with sample 140 give new timeout 176 ms.
:::

::: toggle What is `fast retransmit` on triple duplicate ACKs?
`Fast retransmit` resends the missing segment as soon as three duplicate ACKs arrive, without waiting for the timer.
Why it helps: duplicate ACKs prove later data still arrives, so one isolated loss is near certain.
Tiny example: ACK 5003 repeated three times triggers immediate resend from byte 5003.
:::

::: callout-pitfall Sequence Numbers Count Bytes, ACKs Confirm Bytes
The two eternal confusions: (1) sequence numbers increment by *payload bytes*, so a 1000-byte segment starting at 5000 makes the next sequence 6000 — *not* 5001; (2) "ACK 6000" means "send from 6000 onward," i.e. bytes *below* 6000 are confirmed. Read every ACK as "everything before me is safe."
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

Segment carries bytes 5000–5002 (3 bytes, sequence 5000). Receiver replies ACK 5003 — "send from 5003 onward." One segment lost, two later ones arrive: receiver repeats ACK 5003 three times → sender fast-retransmits from 5003 without waiting. Numbers count bytes; repeats signal loss.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
Current estimates: $\text{SRTT} = 100$ ms, $\text{DevRTT} = 12$ ms. A fresh (never-retransmitted) segment's ACK arrives after a measured SampleRTT of $140$ ms. Compute the new SRTT, DevRTT, and TimeoutInterval using standard $\alpha=0.125$, $\beta=0.25$.
:::

::: step [Step 2: Execution] Applying the Triple
New SRTT $= 0.875 \times 100 + 0.125 \times 140 = 87.5 + 17.5 = 105$ ms. Deviation term $= |105 - 140| = 35$ ms; new DevRTT $= 0.75 \times 12 + 0.25 \times 35 = 9 + 8.75 = 17.75$ ms. TimeoutInterval $= 105 + 4 \times 17.75 = 105 + 71 = 176$ ms.
:::

::: step [Step 3: Conclusion] Final Result
One slow sample nudged the average 100 → 105 ms but nearly doubled the safety margin's deviation component (12 → 17.75 ms), lifting the timeout to **176 ms** — the estimator reacts to *jitter* faster than to delay, which is exactly what prevents both premature timeouts and sluggish loss detection.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Sequence vs. ACK number | First byte *in* this segment vs. next byte *expected* (cumulative). |
| SRTT vs. DevRTT | Smoothed delay vs. smoothed variability — timeout uses both. |
| Timeout vs. fast retransmit | Timer expiry (silence) vs. 3 duplicate ACKs (isolated loss, early resend). |
| TCP vs. UDP checksum | TCP always checksums; UDP checksum optional in IPv4, mandatory in IPv6. |

**Watch out:** (1) Numbering segments instead of bytes (5000 + 1000 bytes → 6000, not 5001). (2) Sampling retransmitted segments — Karn's ambiguity forbids it. (3) Reading "ACK 6000" as confirming byte 6000 — it confirms everything *below* 6000.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
TCP numbers bytes (sequence = first byte here; ACK = next expected, cumulative). Header 20 B+: ports, seq/ack, flags (SYN/ACK/FIN/RST), rwnd, checksum (mandatory). Timeout triple: SRTT ($0.875/0.125$), DevRTT ($0.75/0.25$), Timeout = SRTT + 4·Dev; sample only once-sent segments. Three duplicate ACKs → fast retransmit.
:::

**Active-recall checklist:** What does ACK 6000 confirm? Recite the timeout triple with constants. Why are retransmitted segments unsampleable? What do three duplicate ACKs trigger?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz A TCP segment carries 1000 bytes starting at sequence number 5000, and all arrive intact. What acknowledgment does the receiver send?
() ACK 5000 — confirming the segment's starting byte
() ACK 5001 — confirming one segment received
(*) ACK 6000 — the next expected byte, cumulatively confirming bytes 0–5999
() ACK 1000 — confirming the byte count
::: explanation
Sequence numbers count *bytes*: 1000 bytes from 5000 occupy 5000–5999, so the next expected byte is 6000. Cumulative ACKs confirm *everything below* the ACK number, however many segments delivered it.
:::

::: quiz Why does TCP refuse to take SampleRTT measurements from retransmitted segments?
() Retransmitted segments travel a different physical route
(*) The arriving ACK cannot be matched to a specific transmission — it might acknowledge the original or the copy — so the sample is ambiguous
() Retransmissions are always exactly 100 ms late by definition
() SampleRTT is only defined for SYN segments
::: explanation
This is Karn's ambiguity: with two copies in flight, one ACK tells you nothing about *which* copy it answers, so any delay sample built from it is meaningless. TCP samples only segments transmitted exactly once, keeping the estimator honest.
:::

::: quiz Three duplicate ACKs arrive for byte 8000 while the retransmission timer is still running. What does TCP do?
() Restart the timer and wait patiently for it to expire
(*) Immediately retransmit the segment starting at byte 8000 (fast retransmit) without waiting for the timeout
() Close the connection, assuming the network has failed
() Halve the receive window and continue normally
::: explanation
Duplicate ACKs prove later data is arriving while one segment is missing — near-certain single loss, not congestion collapse. Fast retransmit resends at once; the timer remains only as a backstop for total silence.
:::
