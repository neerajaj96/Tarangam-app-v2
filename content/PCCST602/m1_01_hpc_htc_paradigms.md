---
id: m1_01_hpc_htc_paradigms
courseCode: PCCST602
module: 1
sequence: 1
title: 'Internet Computing Age: HPC, HTC & Paradigms'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Separate speed jobs from throughput jobs with HPC and HTC
  - Climb the centralized to cloud ladder by coupling strength
  - Price why one computer stopped sufficing
concepts:
  - high-performance computing
  - high-throughput computing
  - computing paradigms
prerequisites: []
examRelevance: medium
tags:
  - paradigms
  - hpc-htc
---
# Internet Computing Age: HPC, HTC & Paradigms

**Why one computer stopped sufficing — speed vs throughput, and the centralized→parallel→distributed→cloud ladder.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Kitchen Brigade vs Banquet Factory
**HPC** (high-performance computing) is a brigade racing one wedding cake (single hard problem, fast — FLOPS, tight coupling). **HTC** (high-throughput) is a banquet factory clearing lakhs of thalis (many loose jobs, capacity — jobs/month, loose coupling). Centralized = one chef; parallel = brigade in one kitchen (shared memory/stove); distributed = food trucks coordinated by radio (message passing, no shared stove); cloud = trucks rented by the hour with a dispatcher app.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Paradigms and design objectives

* **Centralized** (mainframe/sequential) → **parallel** (multicore/GPU, shared/low-latency) → **distributed** (autonomous nodes, message passing, partial failure) → **cloud** (elastic, metered, on-demand).
* **HPC objectives:** peak FLOPS, low latency interconnect, scalability of *one* job (Amdahl-bound).
* **HTC objectives:** completed jobs per month, availability, cost-per-job (embarrassingly parallel grids/condor pools).

::: callout-formula KTU Formula Vault: Paradigms
HPC = **one job fast** · HTC = **many jobs done** · coupling tightens **cloud→distributed→parallel**.
:::

::: callout-pitfall Amdahl Applies to HPC, Not HTC
Sequential fractions cap *single-job* speedup (HPC grief); HTC sidesteps it (independent jobs, near-linear throughput). Invoking Amdahl on throughput workloads misdiagnoses the scaling story.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Classify: (a) monsoon simulation on a supercomputer, (b) rendering 10,000 animation frames on a campus grid, (c) startup autoscaling a sale on rented VMs. HPC or HTC, which paradigm, why?"
:::

::: step [Step 2: Execution] Speed vs Throughput Triage
1. (a) HPC/parallel-distributed hybrid: one coupled fluid solve, latency-critical interconnect, FLOPS metric.
2. (b) HTC/grid: independent frames, throughput metric (frames/day), node failures merely retry.
3. (c) Cloud + HTC flavour: elastic rented capacity, cost-per-transaction metric, dispatcher (not owner) mindset.
:::

::: step [Step 3: Conclusion] Final Result
Coupling (tight/loose) + metric (FLOPS/jobs-per-month/rupees-per-job) classifies everything. State both per case — the pair is the full answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
HPC vs HTC — the core distinction?
(A) HPC uses GPUs, HTC doesn't
(*B) HPC minimises time-to-solution of *one* coupled problem; HTC maximises completed *independent* jobs per period — latency vs throughput objectives
(C) HPC is old, HTC is new
(D) Only clouds do HTC
::: explanation
Objective functions differ (seconds-per-run vs runs-per-month), so architectures differ (tight interconnect vs schedulable pools). Same hardware can serve either — workload shape decides the label.
:::

::: quiz Q2: Foundational Concept
Why does partial failure define distributed (not parallel) thinking?
(A) Parallel machines never fail
(*B) Distributed nodes fail independently mid-job with no shared memory to inspect — protocols must assume crashes/partitions (timeouts, retries, consensus); parallel failures halt one box together
(C) Clouds hide all failures
(D) HPC ignores faults
::: explanation
Shared fate (one box) vs independent fates (many boxes): the latter forces failure-first design. Fallacies of distributed computing (reliable network, zero latency…) are the named checklist — cite, don't assume.
:::

::: quiz Q3: Foundational Concept
Cloud's economic break from clusters is:
(A) Faster processors
(*B) Metered elasticity — rent-by-minute scaling with opex pricing vs owned-capital capacity planning; cost model, not clock speed, is the disruption
(C) Bigger disks
(D) New cables
::: explanation
Clusters capitalise peaks (idle troughs wasted); clouds meter troughs away. Design objectives shift to cost-per-job and elasticity speed — economics as architecture driver, the cloud-exam thesis.
:::
