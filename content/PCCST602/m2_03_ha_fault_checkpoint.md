# HA, Fault Tolerance, Checkpoint & Recovery

**Surviving the inevitable — redundancy shapes, replica discipline, and time-travel via checkpoints.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Understudies and Save Points
**HA pairs** keep a hot understudy (heartbeat-checked; failover = costume change, seconds of drama). **Fault-tolerant configs** run triple-redundant voters (TMR: two must agree — Byzantine-grade, triple cost) or erasure-coded quorums. **Checkpointing** saves game periodically (full/incremental, coordinated vs uncoordinated with message logging); **recovery** reloads the last save and replays the log — Young/Daly's interval math balances save-cost against redo-cost (checkpoint every $\sqrt{2\cdot C\cdot M}$-ish: costlier saves ⇒ rarer saves).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Redundancy shapes and checkpoint kinds

* Active/passive (failover), active/active (load-shared, split-brain fencing needed!), N+1/N+M sparing, TMR voting.
* Checkpoint: coordinated (global consistent cut, no domino) vs uncoordinated + message logging (domino risk); incremental/differential (delta size vs restore chains).
* Recovery: last checkpoint + log replay; MTTR includes detection + failover + replay.

::: callout-formula KTU Formula Vault: Survival
HA = **understudy+heartbeat** · TMR = **vote-of-3** · checkpoint **cost↔redo tradeoff** · uncoordinated risks **domino**.
:::

::: callout-pitfall Split-Brain Kills Active/Active
Two primaries both writing = corrupted state (worse than downtime) — fencing/STONITH (shoot the other node first!) is mandatory, not optional. Redundancy without fencing is data corruption with extra steps.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Hour-long job, node MTTF $10$h, checkpoint cost $5$ min. (a) Restart-only expected waste? (b) Sensible interval + waste with checkpointing? (c) Uncoordinated + no logging risk?
:::

::: step [Step 2: Execution] Save-Point Math
1. Restart-only: failure mid-run ($p\approx1-e^{-1/10}\approx9.5\%$) wastes $\approx$ half-run average $\sim$ minutes-to-tens-of-minutes expectation — plus tail risk of repeated bad luck.
2. Young-ish: interval $\approx \sqrt{2\cdot5\text{min}\cdot600\text{min}} \approx 77$ min ≈ hourly checkpoints: waste ≈ save overhead ($5$ min) + redo-half-interval on failure ($\approx 9.5\%\times30$ min $\approx 3$ min) — single digits vs restart roulette.
3. Domino: cascading rollbacks to job start (no consistent cut, no log) — the nightmare checkpointing exists to prevent; coordinated or logged, always.
:::

::: step [Step 3: Conclusion] Final Result
Cost-vs-redo interval, fencing for pairs, domino warning for the uncoordinated — survival design in three clauses.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Coordinated vs uncoordinated checkpointing trade:
(A) Same guarantees
(*B) Coordinated pays sync pauses for domino-freedom (clean global cuts); uncoordinated runs free but risks cascading rollbacks unless message-logged — pause-certainty vs gamble-speed
(C) Uncoordinated is strictly better
(D) Checkpoints are obsolete
::: explanation
Consistent cuts make recovery single-step; independence gambles on logs covering the gaps. Domino effect (rolling to start) is the named catastrophe — design names it to avoid it.
:::

::: quiz Q2: Foundational Concept
STONITH/fencing exists because:
(A) Nodes enjoy shooting
(*B) Dual-primaries corrupt shared state irreversibly — surviving node must *prove* the peer dead (power-cut it) before promoting; heartbeat-loss alone never suffices (partitions mimic death)
(C) It speeds failover
(D) Logs need it
::: explanation
Partitioned-alive peers look dead to each other; both promoting = split-brain writes. Fencing converts suspicion into certainty (the other side *cannot* write). Certainty-before-promotion is the HA commandment.
:::

::: quiz Q3: Foundational Concept
Checkpoint interval intuition (Young/Daly):
(A) As often as possible
(*B) Balance save-cost (frequent pain) vs redo-cost (rare catastrophe): costlier saves ⇒ sparser saves ($\sqrt{\text{cost}\times\text{MTTF}}$ shape) — optimum, not maximum, frequency
(C) Once per job
(D) Never with SSDs
::: explanation
Too often burns time saving; too rarely burns time redoing. Square-root law splits the difference — interval *math*, not vibes, sets the cron. Quote the tradeoff, not just the formula.
:::
