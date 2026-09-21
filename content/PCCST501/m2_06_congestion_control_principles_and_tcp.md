---
id: m2_06_congestion_control_principles_and_tcp
courseCode: PCCST501
module: 2
sequence: 6
title: 'Congestion Control: Principles & TCP Dynamics'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Name the three costs of congestion
  - Run AIMD, slow start, and ssthresh updates
  - Separate Tahoe resets from Reno halving on loss signals
  - Self-test with the exam recap and active-recall checklist
concepts:
  - congestion control
  - AIMD
  - slow start
  - Tahoe and Reno
prerequisites:
  - m2_03_tcp_segment_structure_and_rtt
  - m2_05_tcp_flow_control_and_connection_management
examRelevance: medium
tags:
  - tcp
  - congestion-control
---
# Congestion Control: Principles & TCP Dynamics

**Why the network chokes, the three costs of congestion, AIMD sawtooth fairness, slow start, and Tahoe vs. Reno on loss.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

Too many cars enter a highway and everyone slows to a crawl — the jam is caused by the drivers themselves, and only the drivers can fix it by metering their entry. Packet networks behave identically: when senders collectively exceed a bottleneck's capacity, queues overflow, packets die, retransmissions double the load, and useful throughput collapses.

The problem before the solution: no router phones the senders to coordinate — each TCP sender must infer congestion *alone* (from loss and delay) and adjust its sending rate so the network stays near capacity without collapsing. The shared etiquette is AIMD (Additive Increase, Multiplicative Decrease): probe gently upward, back off hard on loss.

::: callout-intuition Core Mental Model: The Highway On-Ramp
Packet loss is not a pothole (broken road) — it is a **traffic jam** (too many cars). And jams are self-inflicted: every driver entering faster makes everyone slower. TCP drivers therefore follow one shared etiquette: *probe for space by speeding up gently, and back off hard at the first brake lights*. If every flow obeys it, the highway self-organizes near capacity; if flows ignored it (like early UDP blasters), the road collapses into gridlock where almost no useful traffic moves at all.

Dropping the highway now: cwnd = congestion window (allowed unacknowledged bytes); AIMD = +1 MSS per RTT up, halve on loss; slow start = doubling phase; ssthresh = remembered danger line.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Congestion** | Aggregate demand persistently exceeding bottleneck capacity: queues grow, delays explode, packets drop. |
| **cwnd (congestion window)** | Sender-side cap on unacknowledged bytes, adjusted by loss signals to protect the *network* (contrast rwnd, which protects the receiver). |
| **MSS (Maximum Segment Size)** | Largest TCP payload per segment — AIMD's unit of increase. |
| **AIMD (Additive Increase, Multiplicative Decrease)** | Per RTT without loss: `cwnd += 1 MSS`; on loss: `cwnd /= 2`. |
| **Slow start** | Exponential phase (`cwnd` doubling per RTT from 1 MSS) used at birth and after severe loss — "slow" only relative to blasting at full rate instantly. |
| **ssthresh (slow-start threshold)** | The remembered danger line, reset to `cwnd/2` at each loss: grow fast below it, gently above. |
| **Tahoe / Reno** | Two TCP variants: Tahoe resets `cwnd = 1` on any loss; Reno halves on mild loss (triple duplicate ACKs, with fast recovery) and resets only on timeout. |
| **Fast recovery** | Reno's post-halving phase: resume additive growth immediately instead of slow-starting. |

<a id="the-math"></a>
## 3. Purpose — Costs, AIMD Dynamics, Slow Start, Tahoe vs Reno

### 3.1 The Three Costs of Congestion

1. **Retransmission waste:** dropped packets must be re-sent, so the network carries the same bytes twice while delivering once.
2. **Buffer exhaustion and delay:** queues fill, queueing delay explodes, and eventually *all* arrivals drop (bufferbloat: full buffers, zero goodput gain).
3. **Unnecessary retransmissions:** premature timeouts duplicate packets already queued — the sender pays for impatience with pure overhead.

### 3.2 Operation Flow: AIMD — Additive Increase, Multiplicative Decrease

Each flow keeps a **congestion window** `cwnd` (bytes it may have unACKed) and adjusts per RTT (Round-Trip Time) with no explicit network signal — only loss as the congestion alarm:

::: toggle What is `cwnd` and `MSS`?
`cwnd` is the congestion window, the sender-side cap on unacknowledged bytes protecting the network.
`MSS` is the Maximum Segment Size, the largest TCP payload per segment and the unit of window growth.
Tiny example: `cwnd` 8 `MSS` allows 8 segments in flight, then grows by about 1 `MSS` per clean round trip.
:::

* **Additive increase:** no loss for an RTT → `cwnd += 1 MSS` (gentle probe upward).
* **Multiplicative decrease:** loss detected → `cwnd /= 2` (hard back-off).

::: toggle What does `AIMD` do each RTT?
`AIMD` adds about 1 `MSS` to `cwnd` per loss-free round trip, then halves `cwnd` on loss.
Why this shape: gentle probing finds capacity while hard back-off drains queues fast across all flows.
Tiny example: `cwnd` 8 grows to 9 clean, then halves to 4 on loss, tracing the sawtooth.
:::

```text
cwnd ^
     |        /\          /\          /\
     |       /  \        /  \        /  \
     |      /    \      /    \      /    \
     |_____/      \____/      \____/      \____> time
      slow   congestion           congestion
      start  avoidance            avoidance
      (x2)   (AIMD +1/RTT)        (AIMD +1/RTT)
              loss: halve          loss: halve
```

::: anim aimd-sawtooth The Sawtooth Breathing
Watch the congestion window climb additively and crash multiplicatively on each loss — the dot rides real AIMD dynamics while the caption calls each phase.
:::

Repeated across competing flows with similar RTTs and synchronized loss signals, AIMD converges toward **fairness**: overfull flows get halved more in absolute terms, so shares equalize — the celebrated "sawtooth" is the sound of fairness being enforced. Qualification: with very different RTTs (short-RTT flows probe faster) or unsynchronized losses, shares skew — AIMD *tends toward* fairness under comparable conditions; it does not legislate perfect equality in all topologies.

### 3.3 Slow Start, ssthresh, Tahoe vs. Reno

* **Slow start:** despite the name, *exponential* growth — `cwnd` doubles per RTT from 1 MSS until first loss or `ssthresh`. Used at connection birth and after heavy loss (Tahoe).
* **ssthresh:** the remembered danger line, set to `cwnd/2` at each loss event; below it grow fast (slow start), above it grow gently (congestion avoidance).
* **On loss:** **Tahoe** resets `cwnd = 1` and slow-starts (treats every loss as catastrophe); **Reno** distinguishes: **triple duplicate ACKs** (mild, isolated loss) → halve and continue (**fast recovery**, no slow start); **timeout** (severe, total silence) → Tahoe-style reset to 1 MSS.

::: toggle What are `slow start`, `ssthresh`, Tahoe and Reno?
`Slow start` doubles `cwnd` per RTT from 1 `MSS`, while `ssthresh` remembers half the pre-loss window as the danger line.
`Tahoe` resets to 1 on any loss, `Reno` halves on triple duplicate ACKs with fast recovery and resets only on timeout.
Tiny example: `cwnd` 24 hit by duplicate ACKs becomes 12 under Reno but 1 under Tahoe.
:::

::: callout-formula KTU Formula Vault: Congestion in 6 Lines
Costs: **retransmit waste + buffer delay + premature dupes**. AIMD: **+1 MSS/RTT**, **halve on loss** → sawtooth → **fairness (similar-RTT flows)**. Slow start: **double per RTT** to ssthresh. ssthresh = **cwnd/2 at loss**. Tahoe: **any loss → cwnd=1**. Reno: **3 dup-ACKs → halve + fast recovery**; **timeout → cwnd=1**.
:::

::: callout-pitfall Loss Means Congestion (in This Model)
TCP's founding bet: on wired networks, packet loss ≈ buffer overflow ≈ congestion — *not* link damage. So it always slows down on loss. The famous exception proving the rule: **wireless** links corrupt packets without congestion, where blind halving needlessly throttles — which is exactly why wireless-optimized TCP variants exist.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

`cwnd = 8` MSS, `ssthresh = 16`. One clean RTT → `cwnd = 9` (additive). Then triple duplicate ACKs → `ssthresh = 4`, `cwnd = 4` (halve, fast recovery). Same event under Tahoe → `cwnd = 1` and slow start. Mild loss: halved vs. flattened — the Reno improvement in one line.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
A Reno flow has `cwnd = 24` MSS and `ssthresh = 32` MSS in congestion avoidance. Event A: triple duplicate ACKs arrive. Event B (later, after recovery to `cwnd = 14`): the retransmission timer expires. Trace `cwnd` and `ssthresh` through both events.
:::

::: step [Step 2: Execution] Applying Reno Rules
**Event A (3 dup-ACKs, mild loss):** `ssthresh = 24/2 = 12`; `cwnd = 24/2 = 12` (halve, fast recovery — *no* slow start). Growth resumes additively from 12.
**Event B (timeout at cwnd 14, severe loss):** `ssthresh = 14/2 = 7`; `cwnd = 1` (full Tahoe-style reset). Slow start doubles 1 → 2 → 4 → 8 (crossing ssthresh=7 mid-way, switching to additive) and continues gently.
:::

::: step [Step 3: Conclusion] Final Result
Same flow, two philosophies: mild loss costs half the window and never leaves congestion avoidance; silence costs everything and restarts the climb from 1 MSS. The severity ladder — **dup-ACKs halve, timeouts reset** — is Reno's entire personality in one sentence.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| cwnd vs. rwnd | Network guard (sender-inferred) vs. receiver guard (advertised). |
| Slow start vs. congestion avoidance | Exponential doubling to ssthresh vs. +1 MSS/RTT AIMD above it. |
| Tahoe vs. Reno | Any loss → 1 vs. dup-ACKs halve + fast recovery, timeout → 1. |
| Triple dup-ACK vs. timeout | Mild isolated loss (network still delivering) vs. possible collapse (silence). |

**Watch out:** (1) "AIMD guarantees equal shares always" — add the similar-RTT/synchronized-loss qualifier. (2) Slow start is exponential, not slow — the name contrasts with instant full-rate blasting. (3) Forgetting to halve ssthresh on *both* loss types.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Three congestion costs (retransmit waste, buffer delay, premature dupes). AIMD: +1 MSS/RTT, halve on loss → sawtooth → fairness among similar-RTT flows. Slow start doubles to ssthresh (= cwnd/2 at loss). Tahoe: any loss → 1. Reno: 3 dup-ACKs → halve + fast recovery; timeout → 1. Wireless corruption breaks the loss≙congestion bet.
:::

**Active-recall checklist:** What are the three costs? Trace cwnd 24 → dup-ACKs → timeout at 14. When does fairness hold, and when does it skew? Why do wireless variants exist?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Why does AIMD produce fairness among competing TCP flows sharing a bottleneck?
() Because routers assign each flow an equal fixed quota
(*) Because every flow adds the same absolute amount per RTT but multiplicative decrease cuts heavy flows by more in absolute terms, so shares converge over repeated cycles
() Because faster flows voluntarily disconnect first
() AIMD actually produces starvation, not fairness
::: explanation
Additive increase is egalitarian (+1 MSS each regardless of size); multiplicative decrease is progressive (halving 20 costs 10, halving 4 costs 2). Over many sawtooth cycles the big flows surrender more, repeatedly, until all hover near equal shares — fairness emerging from identical local rules with no coordinator.
:::

::: quiz A Reno sender at cwnd 24 gets triple duplicate ACKs; later, at cwnd 14, its timer expires. What happens to cwnd in each case?
() Halved both times (24→12, then 14→7)
(*) First halved to 12 with fast recovery; then reset to 1 MSS with slow start
() Reset to 1 MSS both times
() Nothing changes — Reno ignores loss signals
::: explanation
Reno reads severity: 3 dup-ACKs = isolated loss with the network still delivering (halve, keep going); timeout = total silence, possibly collapsed network (reset to 1, reprobe with slow start). Tahoe, by contrast, resets on *any* loss — which is exactly the behavior Reno improved upon.
:::

::: quiz A network engineer observes heavy packet loss on a purely wireless hop with an otherwise idle network, yet TCP throughput collapses. What is the most likely mechanism?
() The wireless encryption is consuming all CPU
(*) TCP misreads corruption loss as congestion loss and multiplicatively shrinks cwnd, throttling a network that actually has spare capacity
() UDP cross-traffic is starving the TCP flow
() Checksum offloading is disabled on the access point
::: explanation
Classical TCP's core assumption — loss ≙ congestion — breaks on lossy wireless media, where frames die from interference, not queue overflow. Every corruption triggers an unjustified halving, ratcheting throughput down despite an empty network — the textbook motivation for wireless-aware TCP variants.
:::
