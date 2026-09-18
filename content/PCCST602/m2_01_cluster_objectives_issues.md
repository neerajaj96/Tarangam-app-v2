# Clusters for Massive Parallelism: Goals & Issues

**Why bolt boxes together — design objectives, availability math, and the issue list that shapes everything after.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ant Colony vs Elephant
One elephant (SMP/supermachine) is strong until it trips (single fate, brutal price curve). An ant colony (cluster) lifts more, survives losses, and grows by adding ants (commodity scaling) — but needs pheromone discipline (interconnect, single-system-image, schedulers) or it's just scattered ants. Objectives: speed, availability, scalability-per-rupee; issues: the discipline bill.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Objectives and families

Performance (HPC: Beowulf-style), availability (failover/HA pairs), throughput (HTC farms), scalability + cost-effectiveness (commodity + open source). Families: HPC, HA, load-balancing, (storage/compute flavours).

### 2.2 Availability arithmetic + issue list

Series: $A = \prod A_i$ (chain weakens); parallel/redundant: $A = 1-\prod(1-A_i)$ — two $99\%$ boxes ⇒ $99.99\%$. Issues: interconnect latency/bandwidth, SSI coherence, scheduling, fault handling, manageability, security perimeter, heterogeneity drift.

::: callout-formula KTU Formula Vault: Cluster Goals
Series **multiply $A$** · redundant **$1-\prod(1-A_i)$** · scale by **ants, not elephants**.
:::

::: callout-pitfall Availability ≠ Reliability
Reliability (no-failure interval, MTTF) vs availability (uptime fraction incl. repair: $A = $ MTTF/(MTTF+MTTR)). Fast repair buys availability without reliability — HA designs optimise the fraction, often via MTTR, not MTTF.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Two nodes, each $A = 0.9$, in (a) series workflow (both needed), (b) redundant failover. Compare. What MTTR change doubles a $99\%$ ($100$h MTTF) service to $99.5\%$?
:::

::: step [Step 2: Execution] Multiply vs Complement
1. Series $0.81$; redundant $1-0.01 = 0.99$? No: $(1-0.9)^2 = 0.01$ ⇒ $0.99$. Redundancy beats chaining by $18$ points here.
2. $0.99 = 100/(100+M)$ ⇒ $M \approx 1.01$h. $0.995 = 100/(100+M')$ ⇒ $M' \approx 0.5$h — halve repair time (hot spares, automation), not MTBF heroics.
:::

::: step [Step 3: Conclusion] Final Result
Redundancy math first, MTTR lever second. HA budgets spend on repair speed (spares, failover automation) — the exam's cost-effectiveness moral.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Three $95\%$ components in series vs triple-redundant ($1$-of-$3$). Availability?
(A) Equal $95\%$
(*B) Series $0.95^3 \approx 0.857$; redundant $1-0.05^3 = 0.999875$ — architecture dwarfs parts ($86\%$ vs $99.99\%$)
(C) Redundant $95\%$
(D) Series $99\%$
::: explanation
Chaining multiplies weakness; redundancy multiplies strength (of complements). Same parts, $14$-point chasm — redundancy is architecture, not shopping.
:::

::: quiz Q2: Foundational Concept
MTTF $500$h, MTTR $5$h. Availability? Fastest lever to $99.9\%$?
(A) $99\%$, buy reliable parts
(*B) $A = 500/505 \approx 99.01\%$; halving MTTR (spares/automation) beats heroic MTTF gains — repair speed is the cheap lever
(C) $100\%$, nothing needed
(D) $90\%$, replace all
::: explanation
$A = $ MTTF/(MTTF+MTTR): denominator dominated by the small term's leverage — cutting $5$h→$0.5$h repair buys more nines than doubling MTBF. Optimise the fraction's sensitive side.
:::

::: quiz Q3: Foundational Concept
Beowulf-style commodity clusters won on:
(A) Fastest single node
(*B) Price/performance + open-source software + incremental scaling — good-enough nodes, great economics, grow-by-ants
(C) Vendor lock-in
(D) Mainframe nostalgia
::: explanation
Economics as architecture: commodity curves beat boutique peaks per rupee, and growth needs no forklift. Cost-effectiveness *is* a design objective in the syllabus — quote it as first-class.
:::
