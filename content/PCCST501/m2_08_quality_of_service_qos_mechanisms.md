# QoS: Guarantees Beyond Best Effort

**Bandwidth, delay, jitter, loss — IntServ reservations vs DiffServ markings, token-bucket math, and the scheduler that divides the link fairly.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Airline Cabins
Best effort flies everyone standby. **IntServ** sells **reserved seats** per passenger (RSVP signalling, admission control — guaranteed, unscalable). **DiffServ** paints **boarding groups** on tickets (DSCP marks: EF for first-class voice, AF classes for the rest) — no per-passenger state in the core, just priority handling per group. Same plane (link), different promises.
:::

::: anim leaky-bucket Depth Bursts, Rate Meters
Ten packets slam a depth-$6$ bucket at $3$ tokens/s: six ride tokens through, four wait or fall — then the steady flow conforms at exactly the token rate.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The four knobs and two architectures

Flow needs: **bandwidth** (rate), **delay** (one-way latencies), **jitter** (delay variance — the VoIP killer), **loss** (fraction dropped). IntServ: per-flow RSVP reservation + admission control + packet classification/scheduling — guarantees, core-state explosion. DiffServ: edge marks DSCP, core applies per-hop behaviors (EF expedited, AF assured with drop precedences) — scalable, coarser promises.

### 2.2 Shaping, policing, scheduling

**Token bucket** $(r, C)$: tokens accrue at $r$/s up to depth $C$; each packet spends one — conformant traffic over any window $T$ is bounded by $C + rT$. **Shaping** delays excess (smooths, needs buffers); **policing** drops/remarks excess (no mercy, no buffers). Schedulers split the link: FIFO (no isolation), strict priority (starvation risk), **WFQ** (weighted fair shares — weight-proportional bandwidth with delay bounds).

::: callout-formula KTU Formula Vault: QoS
Knobs: rate/delay/jitter/loss · IntServ $=$ RSVP per-flow (guaranteed, heavy) · DiffServ $=$ DSCP per-class (scalable, coarse) · conform $\le C + rT$ · WFQ shares $\propto$ weights.
:::

Policing vs shaping is *where excess goes* (floor vs waiting room), not how much is allowed — the bucket parameters are identical, the furniture differs.

::: callout-pitfall Priority Panacea
Strict priority for voice starves bulk traffic the moment voice saturates its share — guarantees for one class become denial for another. WFQ exists precisely to bound that damage with minimum shares — priority without weights is a loaded promise.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Token bucket $r = 3$/s, depth $C = 6$, starting full. A burst of $10$ packets arrives instantly; then $50$ packets arrive steadily over the next $10$ s. How many conform in total, and how many are excess?
:::

::: step [Step 2: Execution] Spending Then Metering
Burst: $6$ spend the full bucket (conform), $4$ arrive tokenless (excess — shaped into queue or policed away). Next $10$ s: tokens accrue $3 \times 10 = 30$, all spent by the steady arrivals (conform $30$). Total conformant $= 6 + 30 = 36$; total arrivals $= 60$; excess $= 24$. Check against the bound: $C + rT = 6 + 30 = 36$ — exactly at the ceiling, as theory demands.
:::

::: step [Step 3: Conclusion] Final Result
$36$ conform, $24$ excess of $60$ arrivals. Depth absorbed the burst's head ($6$), rate metered the rest ($30$) — the bucket's two parameters visible as two separate numbers, and the $C + rT$ bound tight, not decorative.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
