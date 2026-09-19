---
id: m2_06_m2_mixed_drill
courseCode: PCCST602
module: 2
sequence: 6
title: 'M2 Drill: Availability, Scheduling & Survival'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Compute redundancy both ways without complement slips
  - Fit timelines into gaps while guarding reservations
  - Fence failed nodes before promoting understudies
concepts:
  - operations workout
  - failure triage
prerequisites:
  - m2_01_cluster_objectives_issues
  - m2_03_ha_fault_checkpoint
  - m2_04_job_scheduling
examRelevance: high
tags:
  - clusters
  - m2-drill
---
# M2 Drill: Availability, Scheduling & Survival

**Redundancy math, fit-timelines, and failure triage — the operations workout.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ops Duty Roster
Redundancy arithmetic before coffee, gap-fitting before lunch, failure triage before pagers. Three duties, one drill.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Duty sheet

$A_{series}=\prod$, $A_{red}=1-\prod(1-A)$ · MTTR lever · FCFS/backfill/gang/fair-share picks · fencing/STONITH · checkpoint interval sense · migration-granularity picks.

::: callout-formula KTU Formula Vault: Ops Duties
Multiply **weakness**, complement **strength** · fit **gaps**, guard **reservations** · fence **before promote**.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs availability arithmetic (series/parallel + MTTR lever) with a scheduling trace (FCFS vs backfill fit-math) or an HA/checkpoint design. Numbers plus triage reasoning, both shown.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Dual $98\%$ PSUs, either suffices: availability? (b) $2$ nodes, J1 ($2$ nodes, $30$ min) first, J2 ($1$ node, $10$ min): backfill gain? (c) Active/passive DB pair, heartbeat lost: first action?
:::

::: step [Step 2: Execution] Three Duties
1. $1-0.02^2 = 0.9996$ ($99.96\%$) — complements multiply.
2. FCFS: J2 waits $30$ min (HoL, $1$ node idle); backfill: J2 runs $0$–$10$ on node $2$ — $20$ min saved, utilisation doubled early.
3. Fence (STONITH the silent peer) *before* promoting — suspicion is not proof; promotion without fencing risks split-brain.
:::

::: step [Step 3: Conclusion] Final Result
Complements, gaps, fencing — duty order is severity order (corruption beats waiting). Severity-ordered response is the ops-exam signature.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$4$-node job, each node $99\%$, needs all $4$ (series). Availability? With one spare (any $4$-of-$5$)?
(A) $99\%$ both
(*B) Series $0.99^4 \approx 0.9606$; $4$-of-$5$: $\binom{5}{4}0.99^40.01 + 0.99^5 \approx 0.0480+0.9510 = 0.9990$ — one spare buys $96\%\to99.9\%$
(C) $96\%$ both
(D) $100\%$ with spare
::: explanation
Binomial k-of-n math: $5(0.9606)(0.01) + 0.9510 \approx 0.999$. Sparing converts series fragility near-redundant — N+1's famous leverage, computed not chanted.
:::

::: quiz Q2: Mixed Drill
Gang-schedule a chatty $8$-way MPI job vs backfill it piecemeal:
(A) Piecemeal (higher utilisation)
(*B) Gang together — time-sliced-apart ranks spin-wait (burn paid cycles); co-scheduling trades packing efficiency for communication sanity
(C) Serialise it
(D) Drop it
::: explanation
Communicating jobs' efficiency assumes simultaneity; piecemeal placement buys utilisation numbers with spin-waste reality. Metric honesty (effective vs nominal utilisation) decides — communicate the tradeoff.
:::

::: quiz Q3: Mixed Drill
Checkpoint every $10$ min at $1$ min cost, MTTF $50$h. Sane?
(A) Perfect
(*B) Over-frequent: interval $\approx \sqrt{2\cdot1\cdot3000} \approx 77$ min — $10$-min cadence burns $\sim 10\%$ overhead vs $\sim 1.3\%$ optimal; sparse out $7$–$8\times$
(C) Too sparse
(D) Checkpoints harm always
::: explanation
$\sqrt{2CM}$ with $C=1$ min, $M=3000$ min gives $\approx 77$ min. $10$-min cadence spends $6$ min/hour saving for $\approx$zero redo gain (failures rare). Interval math overrules gut frequency.
:::
