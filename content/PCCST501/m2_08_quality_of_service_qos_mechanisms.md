---
id: m2_08_quality_of_service_qos_mechanisms
courseCode: PCCST501
module: 2
sequence: 8
title: 'QoS: Guarantees Beyond Best Effort'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Name the four QoS knobs for a flow
  - Contrast IntServ reservations with DiffServ markings
  - Bound conformant traffic with token-bucket math
  - Divide links fairly with WFQ shares
  - Self-test with the exam recap and active-recall checklist
concepts:
  - quality of service
  - IntServ
  - DiffServ
  - token bucket
  - fair queueing
prerequisites: []
examRelevance: medium
tags:
  - qos
  - scheduling
---
# QoS: Guarantees Beyond Best Effort

**Bandwidth, delay, jitter, loss — IntServ reservations vs DiffServ markings, token-bucket math, and the scheduler that divides the link fairly.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

A video call and a file download share your link. The download tolerates any delay; the call dies if voice packets bunch up or arrive late. Default Internet service — **best effort**, every packet equal — treats both identically, so the call stutters whenever the download bursts.

The problem before the solution: give different flows *different promises* (rate, delay, smoothness, loss) without rebuilding the Internet. Two architectures answer at opposite price points: per-flow reservations (strong promises, heavy state) and per-class markings (coarser promises, trivial state).

::: callout-intuition Core Mental Model: Airline Cabins
Best effort flies everyone standby. **IntServ (Integrated Services)** sells **reserved seats** per passenger (RSVP — Resource Reservation Protocol — signalling, admission control — guaranteed, unscalable). **DiffServ (Differentiated Services)** paints **boarding groups** on tickets (DSCP — Differentiated Services Code Point — marks: EF — Expedited Forwarding — for first-class voice, AF — Assured Forwarding — classes for the rest) — no per-passenger state in the core, just priority handling per group. Same plane (link), different promises.

Dropping the airline now: QoS (Quality of Service) knobs = bandwidth, delay, jitter, loss; IntServ = per-flow RSVP state; DiffServ = per-class DSCP marks; token bucket = the rate meter; WFQ (Weighted Fair Queueing) = the fair divider.
:::

::: anim leaky-bucket Depth Bursts, Rate Meters
Ten packets slam a depth-$6$ bucket at $3$ tokens/s: six ride tokens through, four wait or fall — then the steady flow conforms at exactly the token rate.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **QoS (Quality of Service)** | Differentiated promises per flow: bandwidth (rate), delay (latency), jitter (delay variance — the voice killer), loss (drop fraction). |
| **IntServ (Integrated Services)** | Per-flow reservations via RSVP signalling + admission control — hard guarantees, per-flow router state. |
| **DiffServ (Differentiated Services)** | Per-class handling via DSCP marks set at the edge; core applies PHB (Per-Hop Behaviors): EF (expedited, low-delay lane) and AF (assured, tiered drop precedence). |
| **Token bucket $(r, C)$** | Rate meter: tokens accrue at $r$/s up to depth $C$; each packet spends one. Conformant traffic over window $T$ is bounded by $C + rT$. |
| **Shaping vs. policing** | Excess delayed into a queue (needs buffers) vs. excess dropped/remarked (no mercy). Same bucket, different furniture. |
| **WFQ (Weighted Fair Queueing)** | Scheduler dividing link bandwidth in proportion to class weights, with delay bounds. Contrast FIFO (no isolation) and strict priority (starvation risk). |

<a id="the-math"></a>
## 3. Purpose — Knobs, Architectures, Meters, Schedulers

### 3.1 The Four Knobs and Two Architectures

Flow needs: **bandwidth** (rate), **delay** (one-way latencies), **jitter** (delay variance — the VoIP — Voice over IP — killer), **loss** (fraction dropped). IntServ: per-flow RSVP reservation + admission control + packet classification/scheduling — guarantees, core-state explosion. DiffServ: edge marks DSCP, core applies per-hop behaviors (EF expedited, AF assured with drop precedences) — scalable, coarser promises.

### 3.2 Operation Flow: Shaping, Policing, Scheduling

**Token bucket** $(r, C)$: tokens accrue at $r$/s up to depth $C$; each packet spends one — conformant traffic over any window $T$ is bounded by $C + rT$. **Shaping** delays excess (smooths, needs buffers); **policing** drops/remarks excess (no mercy, no buffers). Schedulers split the link: FIFO (First-In First-Out, no isolation), strict priority (starvation risk), **WFQ** (weighted fair shares — weight-proportional bandwidth with delay bounds).

::: callout-formula KTU Formula Vault: QoS
Knobs: rate/delay/jitter/loss · IntServ $=$ RSVP per-flow (guaranteed, heavy) · DiffServ $=$ DSCP per-class (scalable, coarse) · conform $\le C + rT$ · WFQ shares $\propto$ weights.
:::

Policing vs shaping is *where excess goes* (floor vs waiting room), not how much is allowed — the bucket parameters are identical, the furniture differs.

::: callout-pitfall Priority Panacea
Strict priority for voice starves bulk traffic the moment voice saturates its share — guarantees for one class become denial for another. WFQ exists precisely to bound that damage with minimum shares — priority without weights is a loaded promise.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

Bucket $r = 1$/s, depth $C = 2$, starting full. Three packets arrive instantly: 2 spend tokens (conform), the third finds the bucket empty (excess). One second later one token returns — the next arrival conforms. Depth absorbed the burst head; rate meters the tail.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
Token bucket $r = 3$/s, depth $C = 6$, starting full. A burst of $10$ packets arrives instantly; then $50$ packets arrive steadily over the next $10$ s. How many conform in total, and how many are excess?
:::

::: step [Step 2: Execution] Spending Then Metering
Burst: $6$ spend the full bucket (conform), $4$ arrive tokenless (excess — shaped into queue or policed away). Next $10$ s: tokens accrue $3 \times 10 = 30$, all spent by the steady arrivals (conform $30$). Total conformant $= 6 + 30 = 36$; total arrivals $= 60$; excess $= 24$. Check against the bound: $C + rT = 6 + 30 = 36$ — exactly at the ceiling, as theory demands.
:::

::: step [Step 3: Conclusion] Final Result
$36$ conform, $24$ excess of $60$ arrivals. Depth absorbed the burst's head ($6$), rate metered the rest ($30$) — the bucket's two parameters visible as two separate numbers, and the $C + rT$ bound tight, not decorative.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| IntServ vs. DiffServ | Per-flow RSVP state (guarantees, unscalable core) vs. per-class DSCP marks ($O(1)$ core state, coarser). |
| Shaping vs. policing | Delay excess (buffers) vs. drop/remark excess — same bucket parameters. |
| Jitter vs. delay | Variance (needs EF + playout buffers) vs. mean (needs bandwidth/priority). |
| WFQ vs. strict priority | Guaranteed weight shares vs. winner-takes-all (starvation risk). |

**Watch out:** (1) Prescribing IntServ for core routers with hundreds of flows — state explosion kills it. (2) "More bandwidth fixes jitter" — bandwidth shrinks means, not variances. (3) Calling policing "smoothing" — smoothing is shaping's job.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Four knobs: rate/delay/jitter/loss. IntServ = per-flow RSVP (guaranteed, heavy); DiffServ = DSCP per-class (EF voice lane, AF tiers; scalable). Bucket $(r,C)$: conform $\le C+rT$; shaping queues excess, policing drops it. WFQ splits by weight; strict priority can starve.
:::

**Active-recall checklist:** Which architecture keeps per-flow state, and where does it break? What does $C$ vs. $r$ absorb? Which tool fixes jitter but not mean delay? How do WFQ shares split a 9 Mbps link at 3:2:1?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Q1: WFQ Shares
$9$ Mbps link, WFQ weights $3$:$2$:$1$ for voice/video/data, all backlogged. Shares?
(A) $3$ each, fairness means equal
(*B) $4.5$, $3$, $1.5$ Mbps — weight fractions $3/6$, $2/6$, $1/6$ of $9$, summing to exactly $9$ with voice triple data by design, not by accident
(C) $9$, $0$, $0$ by priority
(D) $1.5$, $3$, $4.5$ reversed
::: explanation
WFQ divides by weight proportion: $(3+2+1) = 6$ parts of $1.5$ Mbps. Backlogged-only sharing means idle classes yield their share — work-conserving fairness, verified by the sum $4.5 + 3 + 1.5 = 9$.
:::

::: quiz Q2: Architecture Sorting
256 VoIP flows cross a core router. IntServ vs DiffServ verdict?
(A) IntServ, guarantees rule
(*B) DiffServ — $256$ per-flow reservations per router is core-state explosion, while a dozen DSCP classes give voice its EF lane with $O(1)$ core state; IntServ stays at edges/data-centers where flow counts are tame
(C) Best effort, QoS is marketing
(D) Both identical at scale
::: explanation
State scales the architectures: per-flow state multiplies by flows × routers, per-class state is constant. Guarantees lose to arithmetic in the core — the scalability sentence that decides every such question.
:::

::: quiz Q3: Jitter Targeting
VoIP tolerates $150$ ms delay but dies at $30$ ms jitter; bulk transfer ignores both. Which mechanism for which?
(A) WFQ for VoIP delay, FIFO for all
(*B) EF per-hop behavior + de-jitter playout buffer for voice (jitter is variance — buffers trade a little delay to smooth it); bulk rides default/AF — each knob gets its own tool, delay budget vs variance budget separated
(C) More bandwidth fixes jitter
(D) Policing smooths jitter
::: explanation
Jitter (variance) and delay (mean) are different statistics needing different tools: priority/EF bounds queuing variance, playout buffers absorb residual wobble. Bandwidth shrinks means, not variances — the classic category error.
:::
