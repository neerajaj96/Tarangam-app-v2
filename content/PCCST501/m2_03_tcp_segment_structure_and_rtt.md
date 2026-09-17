# TCP Segment Structure, Sequence Numbers & RTT Estimation

**Byte-stream numbering, the 20-byte header that matters, cumulative ACKs, and how TCP learns the network's round-trip time to set its timer.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Numbered Manuscript
Imagine mailing a novel one page per envelope through an unreliable postal service that sometimes loses, duplicates, or reorders mail. Your fix: number **every character** (not every envelope), and ask the reader to reply "I've received everything up to character 4,000" after each batch. A gap tells you exactly what to re-send; duplicates are spotted instantly (already-seen numbers); order is restored by sorting numbers, not by arrival order. TCP does precisely this — except the "characters" are **bytes**, and the "reply" is the **acknowledgment number**.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 TCP Views Data as a Numbered Byte Stream

* **Sequence number:** the byte-stream number of the *first* data byte in this segment (initial ISN chosen at handshake, then counting bytes, not segments).
* **Acknowledgment number:** the *next* byte the receiver expects — i.e. "everything before this has arrived intact." ACKs are **cumulative**: one ACK for byte 5001 confirms bytes 0–5000, however many segments carried them.

### 2.2 The Header Fields That Earn Marks (20 bytes minimum)

Source/destination ports (multiplexing), **sequence + acknowledgment numbers** (ordering/reliability), header length, flags (**SYN, ACK, FIN, RST** — connection control), **receive window** `rwnd` (flow control, next topic), **checksum** (mandatory in TCP, unlike UDP's optional use), urgent pointer.

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

### 2.3 Learning the RTT: SRTT, DevRTT, Timeout

TCP cannot be born knowing the network's delay — it measures each segment's **SampleRTT** (send time → ACK arrival, measured only for once-transmitted segments) and smooths it:

* **EstimatedRTT (SRTT):** exponential weighted moving average, $\text{SRTT} = (1-\alpha)\cdot\text{SRTT} + \alpha\cdot\text{SampleRTT}$, typically $\alpha = 0.125$ — mostly history, slightly present.
* **DevRTT:** smoothed mean deviation, $\text{DevRTT} = (1-\beta)\cdot\text{DevRTT} + \beta\cdot|\text{SRTT} - \text{SampleRTT}|$, typically $\beta = 0.25$.
* **TimeoutInterval:** $\text{SRTT} + 4 \cdot \text{DevRTT}$ — the safety margin scales with *variability*, not just delay.

::: callout-formula KTU Formula Vault: The Timeout Triple
$\text{SRTT}_{new} = 0.875\cdot\text{SRTT} + 0.125\cdot\text{Sample}$ · $\text{Dev}_{new} = 0.75\cdot\text{Dev} + 0.25\cdot|\text{SRTT}-\text{Sample}|$ · **Timeout = SRTT + 4·DevRTT**. The classic numerical hands you a SampleRTT plus old estimates and asks for the new timeout — apply all three lines in order. Never measure SampleRTT on a *retransmitted* segment (which transmission is the ACK for? — Karn's ambiguity).
:::

### 2.4 Fast Retransmit: Don't Wait for the Timer

Three **duplicate ACKs** for the same byte mean the next segment probably vanished while later ones arrived — TCP re-sends it immediately, well before TimeoutInterval expires. The timer is the safety net; duplicate ACKs are the early-warning radar.

::: callout-pitfall Sequence Numbers Count Bytes, ACKs Confirm Bytes
The two eternal confusions: (1) sequence numbers increment by *payload bytes*, so a 1000-byte segment starting at 5000 makes the next sequence 6000 — *not* 5001; (2) "ACK 6000" means "send from 6000 onward," i.e. bytes *below* 6000 are confirmed. Read every ACK as "everything before me is safe."
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Current estimates: $\text{SRTT} = 100$ ms, $\text{DevRTT} = 12$ ms. A fresh (never-retransmitted) segment's ACK arrives after a measured SampleRTT of $140$ ms. Compute the new SRTT, DevRTT, and TimeoutInterval using standard $\alpha=0.125$, $\beta=0.25$.
:::

::: step [Step 2: Execution] Applying the Triple
New SRTT $= 0.875 \times 100 + 0.125 \times 140 = 87.5 + 17.5 = 105$ ms. Deviation term $= |105 - 140| = 35$ ms; new DevRTT $= 0.75 \times 12 + 0.25 \times 35 = 9 + 8.75 = 17.75$ ms. TimeoutInterval $= 105 + 4 \times 17.75 = 105 + 71 = 176$ ms.
:::

::: step [Step 3: Conclusion] Final Result
One slow sample nudged the average 100 → 105 ms but nearly doubled the safety margin's deviation component (12 → 17.75 ms), lifting the timeout to **176 ms** — the estimator reacts to *jitter* faster than to delay, which is exactly what prevents both premature timeouts and sluggish loss detection.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
