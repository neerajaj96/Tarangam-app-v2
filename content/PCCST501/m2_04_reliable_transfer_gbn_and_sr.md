---
id: m2_04_reliable_transfer_gbn_and_sr
courseCode: PCCST501
module: 2
sequence: 4
title: 'Reliable Transfer: Go-Back-N vs Selective Repeat'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Explain pipelining with the utilization argument
  - Contrast Go-Back-N and Selective Repeat on windows, ACKs, and timers
  - Size sequence spaces with the N+1 and 2N rules
  - Self-test with the exam recap and active-recall checklist
concepts:
  - pipelining
  - Go-Back-N
  - Selective Repeat
  - sliding windows
prerequisites:
  - m2_03_tcp_segment_structure_and_rtt
examRelevance: high
tags:
  - reliability
  - sliding-windows
---
# Reliable Transfer: Go-Back-N vs Selective Repeat

**How pipelining fixes stop-and-wait, sliding windows, cumulative vs. selective ACKs, single vs. per-packet timers — the GBN/SR comparison examiners love.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

Send one packet, freeze until its acknowledgment returns, then send the next. On a fast, long link you transmit for a microsecond and then idle for 30 milliseconds — the link sits empty 99.97% of the time. Correct, but economically absurd.

The problem before the solution: keep many packets **in flight** (pipelining) so transmission overlaps with waiting — and then answer the bookkeeping question: *when one packet in the flight is lost, do you re-send it plus everything after it, or just it alone?* The two answers are Go-Back-N (GBN) and Selective Repeat (SR).

::: callout-intuition Core Mental Model: The Assembly Line
Stop-and-wait reliability is a craftsman finishing one chair before starting the next — correct, but the workshop (network) sits idle most of the time. **Pipelining** is the assembly line: multiple chairs in progress at once, dramatically higher throughput, at the cost of bookkeeping when one chair is defective. The bookkeeping question — *when chair #5 is broken, do you rebuild #5 onward (Go-Back-N) or just #5 (Selective Repeat)?* — is this entire topic.

Dropping the workshop now: window = allowed unacknowledged packets in flight; GBN = cumulative ACKs, one timer, resend the window; SR = individual ACKs, per-packet timers, resend one.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Stop-and-wait** | Send one packet, await its ACK before the next — utilization $U = \frac{L/R}{\text{RTT} + L/R}$ with packet length $L$, rate $R$. |
| **Pipelining** | Keeping $N$ packets unacknowledged simultaneously so waiting overlaps transmission. |
| **Sliding window** | The allowed in-flight range, advancing as ACKs arrive (left edge = oldest unACKed, right edge = next to send). |
| **GBN (Go-Back-N)** | Sender window $N$; cumulative ACKs; one timer for the oldest unACKed packet; timeout re-sends everything from it onward; receiver discards out-of-order packets. |
| **SR (Selective Repeat)** | Individual ACK per packet; receiver buffers out-of-order arrivals; one logical timer per packet; only the lost packet is re-sent. |
| **Sequence space** | Count of distinct sequence numbers: GBN needs $\ge N+1$, SR needs $\ge 2N$ (with $k$ bits, $2^k$ must clear the bar). |

<a id="the-math"></a>
## 3. Purpose — Utilization Math, Then Both Protocols Step by Step

### 3.1 Why Pipeline: Utilization Math

With stop-and-wait, the sender transmits for $L/R$ seconds then idles a full RTT (Round-Trip Time). Utilization $U = \frac{L/R}{\text{RTT} + L/R}$ — on a 1 Gbps, 30 ms link with 1 KB packets, $U \approx 0.00027$: the link is busy **0.027%** of the time. Pipelining $N$ unacknowledged packets multiplies utilization toward $N \times U$ — the entire economic case for windows.

### 3.2 Operation Flow: Go-Back-N (GBN)

Numbered steps of the sender algorithm:

1. Allow up to $N$ unACKed packets in flight (window `[base, base+N-1]`); sequence numbers need at least $N+1$ values ($k$ bits ⇒ $2^k \ge N+1$).
2. On receiving ACK $n$ (**cumulative**: confirms *all* packets through $n$), slide `base` past $n$, restart the single timer for the new oldest unACKed packet.
3. On timeout of the oldest unACKed packet, **retransmit everything from that packet onward** — even packets that arrived fine.
4. The receiver stays simple: it discards out-of-order packets and re-ACKs the last in-order one.

```text
GBN sender, window N=4, base=2 (packets 2,3,4,5 in flight):

 0   1  |  2   3   4   5  |  6   7   8 ...
        |<--- window --->|
       base                   nextseqnum
     ACKed     unACKed              not yet
               in flight             sent
```

::: anim gbn-window The Window Sliding
Watch the sender window glide forward as cumulative ACKs arrive — four packets in flight, always, the left edge advancing exactly where acknowledgments land.
:::

### 3.3 Operation Flow: Selective Repeat (SR)

1. Sender holds the same window — but each packet is ACKed **individually** and carries **one logical timer**.
2. The receiver **buffers** out-of-order arrivals instead of discarding them, ACKing each.
3. Only the actually-lost packet's timer expires, so only it is retransmitted.
4. Price: sequence numbers need $2N$ values ($2^k \ge 2N$) — sending and receiving windows must never overlap numerically, or a restarted receiver confuses new packets with old retransmissions.

*TCP note:* real TCP is GBN-flavored (cumulative ACKs, single retransmission timer) with SR-flavored helpers (receiver buffering plus Selective-ACK — SACK — options) — a pragmatic mix, not a textbook copy of either.

::: callout-formula KTU Formula Vault: GBN vs SR in 6 Lines
Window $N$: GBN needs $2^k \ge$ **$N+1$**, SR needs $2^k \ge$ **$2N$**. ACKs: **cumulative** vs **individual**. Timers: **one** vs **per-packet**. Loss cost: **whole window** vs **single packet**. Receiver: **discards** out-of-order vs **buffers** them. Memory line to memorize: *"GBN repeats, SR selects."*
:::

::: callout-pitfall The Window-Size Trap
With too few sequence numbers, SR breaks catastrophically while GBN merely wastes: if sender and receiver windows overlap numerically, the receiver cannot tell a *new* packet from a *retransmission* of an old one. That is exactly why SR demands twice the sequence space — the single most-tested "why" of this topic.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

Window $N = 2$, packets 0,1,2 queued; packet 0 lost once. GBN: send 0,1 (0 lost; 1 discarded, re-ACK 0... precisely: nothing ACKed, re-ACK nothing meaningful); timeout on 0 → resend 0,1. Total 4 sends. SR: send 0,1; buffer 1, ACK it; resend 0 alone. Total 3 sends. Same loss, 4 vs 3 — the bookkeeping difference in miniature.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
Window $N=4$, packets 0–7 in play, packet 2 is lost once (all retransmissions succeed). Count total transmissions under GBN and under SR, and state what each receiver does with packets 3–5.
:::

::: step [Step 2: Execution] Tracing Both Protocols
**GBN:** sender emits 0,1,2,3 (2 lost). Receiver ACKs 0,1, then discards 3 (out of order, re-ACKs 1). Timer for packet 2 expires → sender re-emits **2,3,4,5**. Total sends: 4 + 4 = **8 transmissions**; packets 3–5's first copies were pure waste.
**SR:** sender emits 0,1,2,3. Receiver ACKs 0,1,3 (buffers 3). Only packet 2's timer expires → re-emit **2 alone**. Total sends: 4 + 1 = **5 transmissions**; the buffered 3 slots straight into place on 2's arrival.
:::

::: step [Step 3: Conclusion] Final Result
Same loss, 8 vs 5 transmissions — SR's extra receiver memory and sequence space buy back the entire wasted window. On high-error links the gap widens; on clean links both behave identically, which is why real TCP mixes GBN-style cumulative ACKs with SR-style selective options.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| GBN vs. SR receiver | Discards out-of-order (re-ACKs last in-order) vs. buffers + individual ACKs. |
| Sequence space $N+1$ vs. $2N$ | GBN: window + next expected distinguishable; SR: both windows must not overlap numerically. |
| Timer discipline | One (oldest) vs. per-packet. |
| Loss cost | Whole window re-sent vs. single packet re-sent. |

**Watch out:** (1) Giving SR only $N+1$ numbers — it needs $2N$. (2) Saying GBN's receiver buffers — it discards. (3) Claiming TCP "is" GBN or SR — it blends cumulative ACKs/single timer with buffering and SACK.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Pipelining fixes stop-and-wait's $U \ll 1$. GBN: window $N$, cumulative ACKs, one timer, resend-from-loss, dumb receiver, $2^k \ge N+1$. SR: individual ACKs, buffering receiver, per-packet timers, resend-one, $2^k \ge 2N$. Trace format: sends → receiver action → timeout → resends → totals.
:::

**Active-recall checklist:** Why is stop-and-wait utilization ~0.03% on gigabit links? What does a GBN receiver do with packet 3 when 2 is missing? Why does SR need double the sequence space? How does real TCP mix the two?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz In Go-Back-N with window size N, how many distinct sequence numbers are required, and why that exact count?
() $2N$, to give every in-flight packet a unique timer
(*) $N+1$, so that all N packets of a full window plus the next expected one are distinguishable and the receiver never confuses a new window with retransmissions of the old
() Exactly $N$, one per window slot
() It doesn't matter — GBN works with a single sequence number
::: explanation
With only $N$ numbers, a fully-ACKed window sliding forward reuses the same numbers as the packets just acknowledged — the sender cannot tell "all ACKed, send new" from "all lost, resend old." The +1 breaks the symmetry. (SR needs $2N$ because *both* sides hold windows simultaneously.)
:::

::: quiz Packet 2 of a window is lost; packets 3, 4, 5 arrive intact. Contrast the two receivers.
() Both discard 3–5 and wait for a full retransmission
(*) GBN discards 3–5 and re-ACKs packet 1; SR buffers 3–5 and ACKs each individually, needing only packet 2 re-sent
() GBN buffers while SR discards — SR is the simpler receiver
() Both receivers crash and the connection resets
::: explanation
GBN's receiver keeps no out-of-order state (cheap, wasteful); SR's receiver invests memory to save retransmissions (costly, efficient). "GBN repeats, SR selects" — the receiver's behavior *is* the protocols' difference, since both send windows identically.
:::

::: quiz Pipelining exists fundamentally to fix which stop-and-wait pathology?
() Excessive header overhead per packet
(*) Abysmal link utilization — the sender idles a full RTT per tiny transmission, so $U = \frac{L/R}{RTT + L/R} \ll 1$ on fast or long links
() The inability to use sequence numbers at all
() Receiver buffer overflow during bursts
::: explanation
Stop-and-wait is *correct* but economically absurd on broadband/long-delay paths (the worked 0.027% example). Windows keep $N$ packets in flight so transmission overlaps with waiting — throughput scales with $N$ until the window, not the RTT, becomes the limit.
:::
