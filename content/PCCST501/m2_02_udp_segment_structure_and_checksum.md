---
id: m2_02_udp_segment_structure_and_checksum
courseCode: PCCST501
module: 2
sequence: 2
title: 'UDP: Segment Structure & Checksum'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Name the four 2-byte UDP header fields and their roles
  - Compute the 1s-complement checksum with end-around carry
  - Decide UDP versus TCP with the fit-and-retry rule
  - Self-test with the exam recap and active-recall checklist
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
## 1. The Real-World Situation — Start From Zero

A video call stutters for 50 milliseconds — annoying, but the conversation flows on. Now imagine the call instead *froze* for half a second every time one packet went missing, waiting for a retransmission of audio you no longer need. For live voice, late data is useless data.

The problem before the solution: some applications would rather lose a packet than wait for it. They need a transport with **no handshake, no retransmission, no congestion throttling** — just "take my bytes and send them." UDP (User Datagram Protocol) is that transport: an 8-byte header and nothing else.

::: callout-intuition Core Mental Model: The Postcard
TCP (Transmission Control Protocol) is a registered letter: tracked, signed for, re-sent if lost. **UDP is a postcard**: you write the address, drop it in the box, and forget it. No tracking number (no sequence numbers), no delivery promise, no return receipt. Why would anyone choose the postcard? Because sometimes the letter's overhead costs more than an occasional lost postcard — a 50 ms voice stutter beats a 500 ms guaranteed-but-late replay, and a DNS (Domain Name System) answer fits in one datagram anyway.

Dropping the post office now: 8-byte header = source port + destination port + length + checksum; no sequence numbers, no acknowledgments, no windows.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **UDP (User Datagram Protocol)** | Connectionless, unreliable transport: send datagrams immediately, never retransmit. |
| **Segment / datagram** | UDP's packaged unit (8-byte header + application data). |
| **Checksum** | A 16-bit error-detection value covering header + data + pseudoheader. |
| **1s-complement arithmetic** | Binary addition where overflow carry-out wraps back into the sum (**end-around carry**), and the final result is bit-flipped (**complement**). |
| **Pseudoheader** | A 12-byte virtual prefix (source IP, destination IP, protocol number, UDP length) included in the checksum math but never transmitted. |
| **Silent discard** | On checksum failure the receiver drops the datagram with no notification — recovery is the application's business. |

<a id="the-math"></a>
## 3. Purpose — Header Fields, Then Checksum Symbol by Symbol

### 3.1 Packet Structure: UDP Segment Structure (exactly 8 bytes of header)

| Field | Size | Purpose |
|---|---|---|
| Source port | 2 bytes | Reply address (optional in requests) |
| Destination port | 2 bytes | Demultiplexing key at receiver |
| Length | 2 bytes | Total segment size in bytes (header + data) |
| Checksum | 2 bytes | Error detection over header + data + pseudoheader |

No sequence numbers, no acknowledgment numbers, no window fields — the header's tiny size *is* the entire design philosophy: minimum mechanism, maximum speed.

::: toggle What are the four UDP header fields?
The four fields are `source port`, `destination port`, `length`, and `checksum`, each 2 bytes for 8 total.
`Ports` steer to processes, `length` gives header plus data bytes, `checksum` detects errors.
Tiny example: a DNS query to destination port 53 carries its reply port, total length, and checksum in 8 bytes.
:::

### 3.1a Interactive Walkthrough: Reading the 8 Bytes by Offset

::: viz stepper Walk the UDP header two bytes at a time
1. Bytes 0–1: source port — where replies go (optional in requests)
2. Bytes 2–3: destination port — the demultiplexing key, e.g. 53 for DNS
3. Bytes 4–5: length — whole segment in bytes, header plus data
4. Bytes 6–7: checksum — error detection over header, data, and pseudoheader
5. Total: 4 fields × 2 bytes = 8 — nothing else exists to read, which is exactly why the header is the philosophy
:::

### 3.2 Operation Flow: Checksum — 1s-Complement Sum (+ Pseudoheader)

1. Arrange the segment (with checksum field set to 0) as a sequence of 16-bit words, **prefixed by a 12-byte pseudoheader** (source IP, destination IP, protocol number, UDP length).
2. Add all words using **1s-complement arithmetic** (end-around carry: overflow bits wrap back into the sum).
3. Take the **1s complement** (flip every bit) of the result — that value goes in the checksum field.
4. The receiver repeats the sum *including* the received checksum: a correct segment sums to all-1s (`0xFFFF`); anything else means corruption → the datagram is **silently discarded** (no notification, no retransmission — the application must cope).

::: toggle What is `1s-complement` addition with `end-around carry`?
`1s-complement` addition adds 16-bit words as binary, then wraps any overflow carry-out back into the sum.
`End-around carry` is that wrap step, and the final sum is bit-flipped (`complement`) into the checksum field.
Tiny example: `1` plus `1` in one bit gives `0` carry `1`, wraps to `1`, then complements to `0`.
:::

::: toggle What is the `pseudoheader`?
The `pseudoheader` is a 12-byte virtual prefix with source IP, destination IP, protocol number, and UDP length.
Why it matters: including it in the checksum catches misdelivery to the wrong host at the transport layer.
Tiny example: a datagram delivered to the wrong IP fails the receiver checksum because its addresses differ.
:::

*Standard note:* the UDP checksum is optional in IPv4 (a zero field means "unchecked") but mandatory in IPv6 — so "UDP always checksums" needs the version qualifier.

::: callout-formula KTU Formula Vault: Checksum in 4 Steps
Zero the field → add pseudoheader + all 16-bit words with **end-around carry** → **complement** into the field → receiver re-sums expecting **all-1s**. Corrupt ⇒ **silent discard**. The favourite numerical: given 3 words `0110011001100000`, `0101010101010101`, `1000111100001100`, sum them (wrap the carry!), complement, and state the receiver's verdict.
:::

### 3.3 When UDP Wins (exam framing)

* **No handshake delay:** data flows immediately (DNS: one query, one reply).
* **No congestion throttling:** sends at application rate (live media prefers drops over slowdowns).
* **Small header + simple state:** fine for request/response protocols (DNS, SNMP — Simple Network Management Protocol, DHCP — Dynamic Host Configuration Protocol) and real-time transport (RTP — Real-time Transport Protocol, gaming).

::: callout-exam KTU Exam Focus: The UDP-vs-TCP Decision Rule
"Why does DNS use UDP?" — because a query + response each fit one datagram, latency of a handshake would dominate, and a lost query is cheaply retried *by the application*. Any answer citing only "UDP is faster" without the fit-and-retry reasoning earns partial marks at best.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

One-bit words (to keep the arithmetic visible): add `1 + 1` in 1s-complement with a 1-bit word. Sum = `0` with carry-out `1`; wrap the carry back: `0 + 1 = 1`; complement → `0`. That wrap-then-flip round trip is the whole checksum idea — the real version just uses 16-bit words.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
A sender builds a UDP segment over data words `1010101010101010` and `1111000011110000` (pseudoheader contributions already folded in, checksum field zeroed). Compute the transmitted checksum, then verify it at the receiver.
:::

::: step [Step 2: Execution] Summing with End-Around Carry
Add: `1010101010101010` + `1111000011110000` = `1 1001101101011010` — a carry out of bit 15. Wrap it around: `1001101101011010` + `1` = `1001101101011011`. Complement every bit → checksum `0110010010100100`, placed in the header.
:::

::: step [Step 3: Conclusion] Final Result
The receiver adds data words + received checksum: the sum returns to `1111111111111111` (all-1s) → **accept**. Flip any single bit in transit and the re-sum differs from all-1s → **silently discard**, with no error message sent back — UDP's contract ends at detection.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| UDP vs. TCP header | 8 bytes (ports + length + checksum) vs. 20+ bytes (adds sequence/ack/windows/flags). |
| Checksum vs. correction | Detects corruption (discard) — never locates or repairs bits. |
| Pseudoheader sent vs. used | Never transmitted; reconstructed by the receiver for the math. |
| UDP checksum IPv4 vs. IPv6 | Optional (zero = unchecked) vs. mandatory. |

**Watch out:** (1) Forgetting the end-around carry — the overflow wraps, it is not dropped. (2) Expecting retransmission after a failed check — discard is silent. (3) "UDP is faster, hence DNS" — cite fit-and-retry, not raw speed.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
UDP = 8-byte header (2+2+2+2: ports, length, checksum), no reliability machinery. Checksum = 1s-complement sum over pseudoheader + words, end-around carry, complement into field; receiver expects all-1s else silent discard. Wins when data fits one datagram and the app retries (DNS) or prefers drops to delay (live media).
:::

**Active-recall checklist:** Recite the four header fields with sizes. What are the four checksum steps? Why does the pseudoheader catch misdelivery? What happens on checksum failure?

<a id="self-check"></a>
## 6. Active Recall Quizzes

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
