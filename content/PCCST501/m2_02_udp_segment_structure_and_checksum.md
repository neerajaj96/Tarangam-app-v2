---
id: m2_02_udp_segment_structure_and_checksum
courseCode: PCCST501
module: 2
sequence: 2
title: 'UDP: Segment Structure & Checksum'
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - Name the four 2-byte UDP header fields and their roles
  - Compute the 1s-complement checksum with end-around carry
  - Decide UDP versus TCP with the fit-and-retry rule
concepts:
  - UDP
  - checksum
  - pseudoheader
prerequisites:
  - m2_01_transport_layer_services_and_multiplexing
examRelevance: high
tags:
  - udp
  - checksum
---
# UDP: Segment Structure & Checksum

**The 8-byte header, port/length/checksum fields, 1s-complement checksum with pseudoheader, and when unreliable delivery is the right choice.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Postcard
TCP is a registered letter: tracked, signed for, re-sent if lost. **UDP is a postcard**: you write the address, drop it in the box, and forget it. No tracking number (no sequence numbers), no delivery promise, no return receipt. Why would anyone choose the postcard? Because sometimes the letter's overhead costs more than an occasional lost postcard — a 50 ms voice stutter beats a 500 ms guaranteed-but-late replay, and a DNS answer fits in one datagram anyway.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 UDP Segment Structure (exactly 8 bytes of header)

| Field | Size | Purpose |
|---|---|---|
| Source port | 2 bytes | Reply address (optional in requests) |
| Destination port | 2 bytes | Demultiplexing key at receiver |
| Length | 2 bytes | Total segment size in bytes (header + data) |
| Checksum | 2 bytes | Error detection over header + data + pseudoheader |

No sequence numbers, no acknowledgment numbers, no window fields — the header's tiny size *is* the entire design philosophy: minimum mechanism, maximum speed.

### 2.2 Checksum: 1s-Complement Sum (+ Pseudoheader)

1. Arrange the segment (with checksum field set to 0) as a sequence of 16-bit words, **prefixed by a 12-byte pseudoheader** (source IP, destination IP, protocol number, UDP length).
2. Add all words using **1s-complement arithmetic** (end-around carry: overflow bits wrap back into the sum).
3. Take the **1s complement** (flip every bit) of the result — that value goes in the checksum field.
4. The receiver repeats the sum *including* the received checksum: a correct segment sums to all-1s (`0xFFFF`); anything else means corruption → the datagram is **silently discarded** (no notification, no retransmission — the application must cope).

::: callout-formula KTU Formula Vault: Checksum in 4 Steps
Zero the field → add pseudoheader + all 16-bit words with **end-around carry** → **complement** into the field → receiver re-sums expecting **all-1s**. Corrupt ⇒ **silent discard**. The favourite numerical: given 3 words `0110011001100000`, `0101010101010101`, `1000111100001100`, sum them (wrap the carry!), complement, and state the receiver's verdict.
:::

### 2.3 When UDP Wins (exam framing)

* **No handshake delay:** data flows immediately (DNS: one query, one reply).
* **No congestion throttling:** sends at application rate (live media prefers drops over slowdowns).
* **Small header + simple state:** fine for request/response protocols (DNS, SNMP, DHCP) and real-time transport (RTP, gaming).

::: callout-exam KTU Exam Focus: The UDP-vs-TCP Decision Rule
"Why does DNS use UDP?" — because a query + response each fit one datagram, latency of a handshake would dominate, and a lost query is cheaply retried *by the application*. Any answer citing only "UDP is faster" without the fit-and-retry reasoning earns partial marks at best.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A sender builds a UDP segment over data words `1010101010101010` and `1111000011110000` (pseudoheader contributions already folded in, checksum field zeroed). Compute the transmitted checksum, then verify it at the receiver.
:::

::: step [Step 2: Execution] Summing with End-Around Carry
Add: `1010101010101010` + `1111000011110000` = `1 1001101101011010` — a carry out of bit 15. Wrap it around: `1001101101011010` + `1` = `1001101101011011`. Complement every bit → checksum `0110010010100100`, placed in the header.
:::

::: step [Step 3: Conclusion] Final Result
The receiver adds data words + received checksum: the sum returns to `1111111111111111` (all-1s) → **accept**. Flip any single bit in transit and the re-sum differs from all-1s → **silently discard**, with no error message sent back — UDP's contract ends at detection.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Why does the UDP checksum include a pseudoheader with IP addresses, even though UDP is a transport-layer protocol?
() To encrypt the segment against eavesdropping
(*) So the receiver also verifies the datagram wasn't misdelivered to the wrong host — a network-layer error caught at the transport layer
() To compress the header below 8 bytes
() The pseudoheader is actually transmitted on the wire to save space
::: explanation
The pseudoheader (never transmitted, reconstructed by the receiver) binds the segment to its intended endpoints. If IP misdelivers the datagram, the receiver's checksum — computed with *its own* addresses — fails, catching an error UDP would otherwise never see.
:::

::: quiz A UDP receiver's checksum verification fails. What happens next?
() It requests retransmission of that exact segment
() It corrects the erroneous bits using the checksum
(*) It silently discards the datagram; recovery (if any) is the application's business
() It forwards the corrupt data with a warning flag
::: explanation
Checksums detect but never correct, and UDP adds no feedback channel — no ACKs, no NACKs, no timers. "Silently discard" is the complete error handling; DNS-style request/response apps simply time out and retry above UDP.
:::

::: quiz Which design choice explains UDP's 8-byte header versus TCP's 20-byte header?
() UDP compresses its fields with a better encoding
(*) UDP provides no reliability machinery — no sequence/ack numbers, no windows, no flags — so there is nothing more to put in the header
() UDP offloads header storage to routers
() The 8 bytes are only the checksum repeated four times
::: explanation
Header size mirrors function: every TCP field exists to serve reliability/flow/congestion machinery (covered next). UDP deliberately implements none of it, so 2+2+2+2 bytes (ports, length, checksum) suffice — the header *is* the philosophy.
:::
