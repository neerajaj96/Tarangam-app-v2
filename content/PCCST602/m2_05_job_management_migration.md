---
id: m2_05_job_management_migration
courseCode: PCCST602
module: 2
sequence: 5
title: 'Job Management: Admin, Types & Migration'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Administer partitions, quality of service and accounts
  - Sort jobs by placement needs through their lifecycles
  - Migrate live work freeze-carry-resume with pre-copy
concepts:
  - job lifecycle
  - machine-room administration
  - job migration
prerequisites:
  - m2_04_job_scheduling
examRelevance: medium
tags:
  - clusters
  - job-management
---
# Job Management: Admin, Types & Migration

**Running the machine room — queues/partitions, job lifecycles, and moving live work without dropping it.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Hotel Management
**Administration** runs the hotel (partitions/queues per clientele, accounts, fair-share tickets, maintenance windows). **Job types** are guest kinds (serial/batch, parallel/MPI, array swarms, interactive debug sessions, GPU-greedy suites — each with placement needs). **Migration** moves a checked-in guest mid-stay (drain node for maintenance, rebalance load, flee failures): freeze bags (checkpoint), carry across (transfer), resume breathing (restore) — guest ideally never notices.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Admin, types, migration schemes

* Admin: partitions (pipes per SLA), QoS tiers, accounts/projects + fair-share decay, reservations (drain windows), accounting/audits.
* Types: serial, parallel (tight/loose), array (parameter sweeps), interactive, GPU, preemptible/spot (killable cheap).
* Migration: cold (stop-copy-restart) vs live (pre-copy/dirty-tracking, post-copy fault-fetch); process vs VM/container granularity; triggers (maintenance, load, failure-prediction, power).

::: callout-formula KTU Formula Vault: Management
Admin = **partitions+QoS+accounts** · types = **placement needs** · migration = **freeze-carry-resume** (live = **pre-copy**).
:::

::: callout-pitfall Live Migration Downtime ≠ Total Time
Pre-copy stretches *total* time (many dirty rounds) to crush *downtime* (final freeze milliseconds). Quoting total-time as outage misreads the metric — downtime (freeze window) is the SLA number, always separated.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Node N9 needs emergency maintenance in $30$ min with $3$ jobs aboard (batch MPI, debug interactive, GPU training). Plan: partition/QoS notes, per-type handling, migration picks."
:::

::: step [Step 2: Execution] Triage by Type
1. Announce drain (reservation blocks new placements on N9; admin broadcast).
2. MPI batch: checkpoint + cold-migrate to reserved nodes (gang implications noted to scheduler).
3. Interactive debug: live-migrate (pre-copy, ms freeze — human barely blinks) or politely requeue with priority boost.
4. GPU training: checkpoint-epoch + resume (device state migrates worst — framework checkpoints, not VM cold-copy, preferred).
:::

::: step [Step 3: Conclusion] Final Result
Drain-then-type-triage: batch checkpoints, interactive live-moves, GPU resumes at framework level. Type-aware handling is the ops mark — one size never fits.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Pre-copy vs post-copy live migration differ by:
(A) Speed of network only
(*B) Pre-copy iterates memory over while running (downtime = final delta freeze, ms); post-copy freezes first, resumes remotely, fault-fetches missing pages (downtime tiny, but source death mid-fetch is fatal)
(C) Both freeze equally long
(D) Post-copy never fails
::: explanation
Risk placement differs: pre-copy risks nothing (source intact till handoff); post-copy bets the source survives fetch-back needs. Downtime-vs-robustness is the choice axis — state both numbers when comparing.
:::

::: quiz Q2: Foundational Concept
Fair-share decay (aging usage) exists because:
(A) Accountants love math
(*B) Raw cumulative usage would bar reformed hogs forever — decay forgives (recent behaviour dominates), keeping long-run shares proportional yet responsive to change
(C) It raises revenue
(D) Queues need randomisation
::: explanation
Memoryless totals punish history permanently; half-life decay balances past debts against present needs. Policy-with-memory-tuning is the admin design point — name the half-life as the knob.
:::

::: quiz Q3: Foundational Concept
Preemptible/spot job types trade what for cheapness?
(A) Nothing, pure win
(*B) Killability: revoked on higher-priority demand (minutes' notice) — workloads must checkpoint often and resume anywhere; price tracks revocability
(C) Slower CPUs
(D) No networking
::: explanation
Discount = eviction risk priced in. Checkpoint-resume-anywhere discipline converts risk into savings — the discipline *is* the admission ticket, state it as prerequisite.
:::
