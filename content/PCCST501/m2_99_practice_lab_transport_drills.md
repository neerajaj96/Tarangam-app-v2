---
id: m2_99_practice_lab_transport_drills
courseCode: PCCST501
module: 2
sequence: 99
title: 'Module 2 Practice Lab: Transport-Layer Drills'
difficulty: intermediate
estimatedMinutes: 10
learningObjectives:
  - Census sockets with demultiplexing keys exactly
  - Compute timeouts with Karn-corrected RTT smoothing
  - Settle GBN against selective-repeat under identical loss
  - Self-test with the exam recap and active-recall checklist
concepts:
  - transport scenarios
  - timeout arithmetic
  - loss recovery showdown
prerequisites:
  - m2_01_transport_layer_services_and_multiplexing
  - m2_03_tcp_segment_structure_and_rtt
  - m2_04_reliable_transfer_gbn_and_sr
  - m2_05_tcp_flow_control_and_connection_management
  - m2_06_congestion_control_principles_and_tcp
examRelevance: high
tags:
  - transport-layer
  - m2-lab
---
# Module 2 Practice Lab: Transport-Layer Drills

**Connection arithmetic, RTT/timeout numericals, loss-trace showdowns, congestion-event walks, and exam essay models.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

Each scenario chains one module idea end to end — demultiplexing keys (M2.1), RTT smoothing with Karn's rule (M2.3), window traces (M2.4), handshake/teardown and flow windows (M2.5), congestion events (M2.6). Abbreviations: TCP (Transmission Control Protocol), UDP (User Datagram Protocol), RTT (Round-Trip Time), SRTT (Smoothed RTT), GBN (Go-Back-N), SR (Selective Repeat), ISN (Initial Sequence Number), MSL (Maximum Segment Lifetime).

### Scenario 1: The Startup's Socket Census

A server hosts HTTP (port 80), DNS (53/UDP), and FTP-control (21). At one instant: 200 browser clients hold HTTP connections, 50 DNS queries are in flight, 3 admins hold FTP sessions. Count the server's sockets and state each one's demux key: HTTP → 200 connection sockets (4-tuples; clients' source ports differ) + 1 welcoming socket; DNS → 1 socket (2-tuple port 53 shared by all 50 queries); FTP → 3 control sockets + 0 data (idle between transfers). Total: **205 sockets**, three keying disciplines on one machine.

::: toggle What is the `4-tuple` vs `2-tuple` census?
A TCP `4-tuple` adds source IP and port, so 200 HTTP clients need 200 connection sockets plus 1 welcoming socket.
A UDP `2-tuple` keys only on destination, so 50 DNS queries share 1 port-53 socket.
Tiny example: HTTP counts 201, DNS counts 1, and 3 FTP sessions add 3 control sockets for 205 total.
:::

### Scenario 2: Timeout Arithmetic Under Pressure

SRTT = 200 ms, DevRTT = 25 ms, fresh SampleRTT = 320 ms ($\alpha=0.125$, $\beta=0.25$). New SRTT $= 0.875(200) + 0.125(320) = 175 + 40 = 215$ ms. Deviation $|215-320| = 105$; new DevRTT $= 0.75(25) + 0.25(105) = 18.75 + 26.25 = 45$ ms. Timeout $= 215 + 4(45) = \mathbf{395}$ ms — one slow sample nearly doubled the safety margin (jitter reacts faster than delay, by design).

::: toggle Why does `Karn` forbid sampling retransmissions?
`Karn` ambiguity means one ACK for a twice-sent segment could answer either the original or the copy.
Why it matters: an unattributable start time would poison `SRTT` and `DevRTT` with phantom delays.
Tiny example: SampleRTT 320 from a retransmitted copy must be discarded even though the number looks fresh.
:::

::: toggle What does Reno do on duplicate ACKs vs timeout?
Reno halves `cwnd` with fast recovery on triple duplicate ACKs, but resets `cwnd` to 1 on timeout.
Both events halve `ssthresh`, so the remembered danger line ratchets down either way.
Tiny example: `cwnd` 30 halves to 15 on duplicate ACKs, later timeout at 20 resets to 1 with `ssthresh` 10.
:::

### Scenario 3: Loss Showdown (GBN vs. SR, Same Bad Luck)

Window $N=5$, packets 0–6 queued, packet 1 lost once. **GBN:** sends 0–4, receiver keeps 0, discards 2,3,4 (re-ACKs 0); timeout on 1 → resends 1,2,3,4,5. Total: 5 + 5 = **10 transmissions**. **SR:** sends 0–4, buffers 2,3,4 with individual ACKs; resends **1 alone**. Total: 5 + 1 = **6 transmissions**. Same loss, 10 vs. 6 — receiver memory and sequence space ($2N$ vs. $N+1$) priced in retransmissions.

### Scenario 4: Congestion Double Feature

Reno flow, cwnd (congestion window) = 30, ssthresh (slow-start threshold) = 40 (congestion avoidance): triple dup-ACKs → ssthresh = 15, cwnd = 15, fast recovery (no slow start). Later at cwnd = 20 the timer expires → ssthresh = 10, cwnd = 1, slow start doubles 1→2→4→8 (crossing 10? no — 8 < 10, continue) → 16 (past ssthresh → additive from here). Moral: dup-ACKs cost half; silence costs everything.

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| UDP vs. TCP demux | 2-tuple (dst IP+port) vs. 4-tuple (+src IP+port); one server port, unlimited TCP clients |
| Sequence vs. acknowledgment numbers | Byte # of first payload byte vs. next expected byte (cumulative) |
| SampleRTT rules | Measure only once-transmitted segments (Karn); smooth with 0.125/0.25; timeout = SRTT + 4·Dev |
| GBN vs. SR | Cumulative/single-timer/resend-window vs. individual/per-packet/resend-one; seq space N+1 vs. 2N |
| rwnd vs. cwnd | Receiver's free buffer (advertised) vs. network-safe flight size (inferred); sender honors min |
| 3-way vs. 4-step | Setup synchronizes both ISNs (SYN/SYNACK/ACK); teardown closes each direction independently + 2MSL |
| Tahoe vs. Reno | Any loss → cwnd=1 vs. dup-ACKs halve + fast recovery, timeout resets |
| Slow start vs. avoidance | Exponential doubling to ssthresh vs. +1 MSS (Maximum Segment Size)/RTT AIMD (Additive Increase Multiplicative Decrease) probing above it |
| AIMD fairness scope | Converges for similar-RTT flows; heterogeneous RTTs skew shares |

**Watch out:** (1) Sampling a retransmitted segment "because data is data" — Karn forbids unattributable samples. (2) Resetting cwnd on dup-ACKs under Reno — halve, don't reset. (3) Calling TCP purely GBN or purely SR — cumulative ACKs/single timer plus buffering and SACK (Selective Acknowledgment).

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz A host runs one web server (port 80) serving 200 simultaneous browser clients. How many TCP sockets exist server-side, and why isn't the answer 1?
() Exactly 1 — one port means one socket always
(*) 201 (1 welcoming + 200 connection sockets) — the 4-tuple (src IP, src port, dst IP, dst port) distinguishes every connection sharing port 80
() 400 — each connection needs two sockets on the same host
() Zero — servers use UDP exclusively
::: explanation
Ports name *services*; 4-tuples name *connections*. Two hundred distinct client endpoints → two hundred distinct tuples → two hundred connection sockets plus the listening one. "One port, one socket" confuses service identity with connection identity.
:::

::: quiz GBN with N=5 loses packet 1 once (packets 0–6 queued). How many total transmissions, and where exactly is the waste?
() 6 — GBN resends only the lost packet like SR
(*) 10 (5 original + resend of 1–5) — packets 2,3,4's first copies arrived intact but were discarded for arriving out of order, then re-sent and re-received identically
() 15 — the whole window is sent three times by rule
() 5 — lost packets are never recovered in GBN
::: explanation
GBN's dumb receiver (no buffering) turns one loss into a full window retransmission: 4 wasted re-sends here (2,3,4 plus newly reached 5). The waste is *received-then-discarded* data — bandwidth burned with zero information gain, the price of receiver simplicity.
:::

::: quiz cwnd = 30 (avoidance): first triple dup-ACKs, later a timeout at cwnd = 20. Give both outcomes with ssthresh evolution.
() Both halve cwnd (30→15, then 20→10) with no other changes
(*) Dup-ACKs: ssthresh = 15, cwnd = 15, fast recovery continues avoidance. Timeout: ssthresh = 10, cwnd = 1, slow start doubles to 16 then additive — mild loss halves, silence resets
() Both reset cwnd to 1 (Reno never fast-recovers)
() Timeouts are ignored once fast recovery has occurred
::: explanation
Severity ladder: dup-ACKs prove delivery continues (halve, proceed); timeout proves possible collapse (reset to 1, reprobe). ssthresh ratchets to half the pre-loss window in *both* cases — the remembered danger line for the climb back. Two signals, two disciplines, one ssthresh rule.
:::

::: quiz SampleRTT = 320 ms arrives for a segment that was retransmitted once. The estimator wants to use it (fresh data!). Why must it refuse?
() Retransmitted segments always arrive exactly on time
(*) Karn's ambiguity: the ACK might answer the original or the copy — unattributable samples corrupt SRTT/DevRTT with phantom delays, poisoning every future timeout
() Retransmissions bypass the transport layer entirely
() The sample is too large to store in the estimator
::: explanation
A measurement needs a known start time; two transmissions give two candidate starts and one ACK. Using it anyway injects fiction into the smoothed estimates — timeouts computed from fiction misfire both ways (premature + sluggish). Discard is data hygiene, not waste.
:::

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (demux keys and Tahoe-vs-Reno lead); RTT triple numericals.
* **7 Marks:** Loss traces (GBN vs SR counting), handshake/teardown sequences, or congestion-event walks with cwnd/ssthresh evolution.
:::

### Essay Question 1 (7 Marks)
**Q: Window N=4, packets 0–5 queued, packet 1 lost once. Trace GBN and SR completely: transmissions, receiver actions, totals.**

**Model Answer:** GBN: emit 0–3 (1 lost); receiver ACKs 0, discards 2,3 re-ACKing 0; timeout on 1 → re-emit 1,2,3,4. Total 4+4 = 8; waste = intact-but-discarded 2,3 plus reached-early 4. SR: emit 0–3, buffer 2,3 with individual ACKs; re-emit 1 only. Total 4+1 = 5. Same loss, 8 vs 5 — receiver memory ($2N$ sequence space) priced directly in retransmissions saved.

### Essay Question 2 (7 Marks)
**Q: Explain TCP connection setup and teardown with segment names, and why the counts differ (3 vs. 4+wait).**

**Model Answer:** Setup: SYN (client ISN) → SYNACK (server ISN + ACK of client's) → ACK (confirms server's) — three because *both* ISNs need explicit confirmation (stale-SYN protection). Teardown: FIN → ACK … FIN → ACK — four because directions close independently (half-close legal), plus 2MSL TIME_WAIT so ghosts expire before port reuse. Setup synchronizes *agreement*; teardown synchronizes *two independent farewells* — different jobs, different counts.
