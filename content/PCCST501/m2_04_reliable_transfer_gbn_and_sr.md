# Reliable Transfer: Go-Back-N vs Selective Repeat

**How pipelining fixes stop-and-wait, sliding windows, cumulative vs. selective ACKs, single vs. per-packet timers — the GBN/SR comparison examiners love.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Assembly Line
Stop-and-wait reliability is a craftsman finishing one chair before starting the next — correct, but the workshop (network) sits idle most of the time. **Pipelining** is the assembly line: multiple chairs in progress at once, dramatically higher throughput, at the cost of bookkeeping when one chair is defective. The bookkeeping question — *when chair #5 is broken, do you rebuild #5 onward (Go-Back-N) or just #5 (Selective Repeat)?* — is this entire topic.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Why Pipeline: Utilization Math

With stop-and-wait, the sender transmits for $L/R$ seconds then idles a full RTT. Utilization $U = \frac{L/R}{\text{RTT} + L/R}$ — on a 1 Gbps, 30 ms link with 1 KB packets, $U \approx 0.00027$: the link is busy **0.027%** of the time. Pipelining $N$ unacknowledged packets multiplies utilization toward $N \times U$ — the entire economic case for windows.

### 2.2 Go-Back-N (GBN)

* **Window size $N$:** up to $N$ unACKed packets in flight; sequence numbers need at least $N+1$ values ($k$ bits ⇒ $2^k \ge N+1$).
* **Cumulative ACKs:** ACK $n$ confirms *all* packets through $n$.
* **Single timer** for the oldest unACKed packet; on timeout, **retransmit everything from that packet onward** — even packets that arrived fine.
* Receiver is dumb: discards out-of-order packets, re-ACKs the last in-order one.

### 2.3 Selective Repeat (SR)

* Each packet ACKed **individually**; receiver **buffers** out-of-order arrivals.
* **One logical timer per unACKed packet**; only the actually-lost packet is retransmitted.
* Price: sequence numbers need $2N$ values ($2^k \ge 2N$) — windows for sending and receiving must not overlap, or a restarted receiver confuses new packets with old retransmissions.

::: callout-formula KTU Formula Vault: GBN vs SR in 6 Lines
Window $N$: GBN needs $2^k \ge$ **$N+1$**, SR needs $2^k \ge$ **$2N$**. ACKs: **cumulative** vs **individual**. Timers: **one** vs **per-packet**. Loss cost: **whole window** vs **single packet**. Receiver: **discards** out-of-order vs **buffers** them. Memory line to memorize: *"GBN repeats, SR selects."*
:::

::: callout-pitfall The Window-Size Trap
With too few sequence numbers, SR breaks catastrophically while GBN merely wastes: if sender and receiver windows overlap numerically, the receiver cannot tell a *new* packet from a *retransmission* of an old one. That is exactly why SR demands twice the sequence space — the single most-tested "why" of this topic.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Window $N=4$, packets 0–7 in play, packet 2 is lost once (all retransmissions succeed). Count total transmissions under GBN and under SR, and state what each receiver does with packets 3–5.
:::

::: step [Step 2: Execution] Tracing Both Protocols
**GBN:** sender emits 0,1,2,3 (2 lost). Receiver ACKs 0,1, then discards 3 (out of order, re-ACKs 1). Timer for packet 2 expires → sender re-emits **2,3,4,5**. Total sends: 4 + 4 = **8 transmissions**; packets 3–5's first copies were pure waste.
**SR:** sender emits 0,1,2,3. Receiver ACKs 0,1,3 (buffers 3). Only packet 2's timer expires → re-emit **2 alone**. Total sends: 4 + 1 = **5 transmissions**; the buffered 3 slots straight into place on 2's arrival.
:::

::: step [Step 3: Conclusion] Final Result
Same loss, 8 vs 5 transmissions — SR's extra receiver memory and sequence space buy back the entire wasted window. On high-error links the gap widens; on clean links both behave identically, which is why TCP (next topics) blends the two philosophies.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
