# Congestion Control: Principles & TCP Dynamics

**Why the network chokes, the three costs of congestion, AIMD sawtooth fairness, slow start, and Tahoe vs. Reno on loss.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Highway On-Ramp
Packet loss is not a pothole (broken road) — it is a **traffic jam** (too many cars). And jams are self-inflicted: every driver entering faster makes everyone slower. TCP drivers therefore follow one shared etiquette: *probe for space by speeding up gently, and back off hard at the first brake lights*. If every flow obeys it, the highway self-organizes near capacity; if flows ignored it (like early UDP blasters), the road collapses into gridlock where almost no useful traffic moves at all.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Three Costs of Congestion

1. **Retransmission waste:** dropped packets must be re-sent, so the network carries the same bytes twice while delivering once.
2. **Buffer exhaustion and delay:** queues fill, queueing delay explodes, and eventually *all* arrivals drop (bufferbloat: full buffers, zero goodput gain).
3. **Unnecessary retransmissions:** premature timeouts duplicate packets already queued — the sender pays for impatience with pure overhead.

### 2.2 AIMD: Additive Increase, Multiplicative Decrease

Each flow keeps a **congestion window** `cwnd` (bytes it may have unACKed) and adjusts per RTT with no explicit network signal — only loss as the congestion alarm:

* **Additive increase:** no loss for an RTT → `cwnd += 1 MSS` (gentle probe upward).
* **Multiplicative decrease:** loss detected → `cwnd /= 2` (hard back-off).

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

Repeated across competing flows, AIMD converges to **fairness**: overfull flows get halved more often in absolute terms, so shares equalize — the celebrated "sawtooth" is the sound of fairness being enforced.

### 2.3 Slow Start, ssthresh, Tahoe vs. Reno

* **Slow start:** despite the name, *exponential* growth — `cwnd` doubles per RTT from 1 MSS until first loss or `ssthresh`. Used at connection birth and after heavy loss (Tahoe).
* **ssthresh:** the remembered danger line, set to `cwnd/2` at each loss event; below it grow fast (slow start), above it grow gently (congestion avoidance).
* **On loss:** **Tahoe** resets `cwnd = 1` and slow-starts (treats every loss as catastrophe); **Reno** distinguishes: **triple duplicate ACKs** (mild, isolated loss) → halve and continue (**fast recovery**, no slow start); **timeout** (severe, total silence) → Tahoe-style reset to 1 MSS.

::: callout-formula KTU Formula Vault: Congestion in 6 Lines
Costs: **retransmit waste + buffer delay + premature dupes**. AIMD: **+1 MSS/RTT**, **halve on loss** → sawtooth → **fairness**. Slow start: **double per RTT** to ssthresh. ssthresh = **cwnd/2 at loss**. Tahoe: **any loss → cwnd=1**. Reno: **3 dup-ACKs → halve + fast recovery**; **timeout → cwnd=1**.
:::

::: callout-pitfall Loss Means Congestion (in This Model)
TCP's founding bet: on wired networks, packet loss ≈ buffer overflow ≈ congestion — *not* link damage. So it always slows down on loss. The famous exception proving the rule: **wireless** links corrupt packets without congestion, where blind halving needlessly throttles — which is exactly why wireless-optimized TCP variants exist.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

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

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
