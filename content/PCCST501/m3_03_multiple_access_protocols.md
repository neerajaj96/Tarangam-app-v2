---
id: m3_03_multiple_access_protocols
courseCode: PCCST501
module: 3
sequence: 3
title: 'Multiple Access: Sharing One Channel'
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - Contrast partitioning with random-access etiquette
  - Rank Aloha, slotted Aloha, CSMA, and CSMA/CD by efficiency
  - Assign CD to wire and CA to radio from the physics
concepts:
  - TDMA
  - Aloha
  - CSMA/CD
prerequisites: []
examRelevance: high
tags:
  - data-link
  - multiple-access
---
# Multiple Access: Sharing One Channel

**Channel partitioning (TDMA/FDMA/CDMA), random access (Aloha, CSMA, CSMA/CD), efficiency math, and why Ethernet listens before and during talking.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Dinner Table
Six people, one conversation channel. **Partitioning** assigns turns (round-robin), topics (frequency bands), or languages (codes) — orderly, but a lone speaker wastes everyone else's slots. **Random access** lets anyone blurt out, with etiquette for collisions: Aloha shouts and hopes; CSMA *listens first*; CSMA/CD keeps listening *while* talking and stops mid-word on collision ("sorry — you go"). The exam is entirely about which etiquette fits which crowd size and what fraction of airtime survives.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Channel Partitioning: Collision-Free by Construction

* **TDMA:** time sliced into frames → slots; each node owns periodic slots. Wasteful when idle (empty slots), perfect when all busy.
* **FDMA:** band split into sub-bands per node. Same trade, frequency-flavored (classic radio/TV).
* **CDMA:** all share time *and* frequency; orthogonal codes separate speakers (each receiver filters by its code). No idle waste from scheduling, but needs code agreement and power control (the near-far problem).

### 2.2 Random Access: Collisions Managed, Not Prevented

* **Pure Aloha:** transmit whenever; frames collide partially → max efficiency only **18%** ($1/2e$).
* **Slotted Aloha:** transmit only at slot starts (needs clock sync); collisions are total-or-nothing → efficiency doubles to **37%** ($1/e$) — the price of collision *vulnerability windows*.
* **CSMA:** **listen before talk** — defer while the channel sounds busy. Collisions still happen (propagation delay: two nodes can both hear silence and start together), but far less often.
* **CSMA/CD (classic Ethernet):** listen *while* talking; on collision detection, **abort + jam signal + binary exponential backoff** (wait random $0..2^k-1$ slot times after $k$th collision). Minimum frame size exists precisely so a sender is *still transmitting* when the collision echo returns ($2\tau$ rule: frame time ≥ worst round-trip propagation).

::: callout-formula KTU Formula Vault: Efficiency Ladder
Pure Aloha **18%** ($1/2e$) · slotted Aloha **37%** ($1/e$) · CSMA better (carrier sense shrinks the vulnerable window to propagation delay) · CSMA/CD best on wire (abort + backoff). Binary backoff after $k$ collisions: uniform in $[0, 2^k-1]$ slots. Min-frame rule: transmission time $\ge 2\tau_{max}$.
:::

::: callout-pitfall CD Needs a Wire (Collision *Detection* ≠ Avoidance)
Detecting your own collision while transmitting works on wires (measure the voltage) but **not on wireless** (your own transmitter deafens your receiver — the hidden-terminal problem). So Ethernet uses CSMA/**CD**, Wi-Fi uses CSMA/**CA** (avoidance: RTS/CTS + backoff, next topics). Swapping the acronyms is the #1 protocol-naming trap.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Four stations share a 10 Mbps channel with slotted Aloha, each frame 1 ms, each station attempting with probability $p = 0.25$ per slot. Compute the vulnerable reasoning: success probability per slot, throughput, and how CSMA/CD would change the picture on a short wire.
:::

::: step [Step 2: Execution] Crunching Slots
A slot succeeds iff **exactly one** station transmits: $4 \times 0.25 \times 0.75^3 = 0.4219$... but optimal $p = 1/4$ gives the classic $N p (1-p)^{N-1} \approx 1/e \approx 0.37$ at large $N$; here exactly $4(0.25)(0.75)^3 \approx 0.42$ (≈42% slots useful, above the large-$N$ bound since $N=4$ is small). Throughput $\approx 0.42 \times 10$ Mbps $\approx 4.2$ Mbps shared. On a short wire, CSMA/CD's listen-before-talk plus abort-on-collision would push useful share far higher — collisions cost a $2\tau$ abort instead of a full wasted frame.
:::

::: step [Step 3: Conclusion] Final Result
Random access without sensing wastes most airtime on collisions (Aloha's 18–37%); sensing (CSMA) and aborting (CD) convert wasted frames into tiny $2\tau$ gaps — the exact ladder the vault lists, now with numbers attached.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Slotted Aloha doubles pure Aloha's efficiency (18% → 37%). What single mechanism causes the doubling?
() Slots make frames travel faster than light
(*) Slot synchronization shrinks the collision vulnerable window from two frame times to one — collisions become all-or-nothing instead of partial
() Slots encrypt frames so they never collide
() Slotted stations transmit at double power
::: explanation
Pure Aloha: a frame sent at $t$ collides with anything in $[t-T, t+T]$ (two frame times of vulnerability). Slots align starts, so a frame collides only with same-slot rivals (one frame time). Half the vulnerability → double the peak throughput ($1/e$ vs $1/2e$) — synchronization's entire payoff.
:::

::: quiz Why does classic Ethernet mandate a minimum frame size, and what sets its value?
() Bigger frames look more professional on oscilloscopes
(*) The sender must still be transmitting when a worst-case collision echo returns (frame time ≥ 2τmax), otherwise it finishes deaf to its own collision and never backs off
() Minimum size encrypts the preamble automatically
() It reserves room for future IPv6 headers
::: explanation
Collision *detection* requires overlap between transmitting and the returning collision signal. Too-short frames go silent before the echo arrives — the sender "succeeds" while its frame actually died mid-wire. The $2\tau$ rule ties frame size to the network's physical diameter.
:::

::: quiz A wireless and a wired LAN both need shared-medium access. Which pair is correct, and why can't they swap?
() Both use CSMA/CD — wireless adapters detect collisions identically
(*) Wired uses CSMA/CD (voltage measurable while sending); wireless uses CSMA/CA (own transmitter deafens receiver + hidden terminals), because collision detection is physically impossible over radio
() Wireless uses TDMA exclusively; random access is wired-only
() They swap freely with no performance difference
::: explanation
CD = measure-the-wire-during-talk (needs a wire); CA = avoid-by-protocol (RTS/CTS reservations + backoff) because radios can't listen while shouting and hidden nodes can't hear each other at all. The acronyms encode the physics — memorize the expansion, not just the letters.
:::
