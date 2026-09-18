# M4 Drill: Tenure, Layers & Housing Decisions

**Cloud bills, service layers, carving calls, and container verdicts — decision drills at exam pace.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Gavels
Tenure gavel (variance/compliance → home/rent/burst) · layer gavel (control/velocity → I/P/SaaS) · housing gavel (trust/density → VM/container). Bang all three per scenario, state sacrifices, done.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Gavel kit

Models: private/public/hybrid + egress-awareness · stack: outsource-undifferentiated · microservices: capability/data/failure triad · IPC: sync-budgeted/async-idempotent · housing: fortress-vs-apartments.

::: callout-formula KTU Formula Vault: Gavels
Tenure → layer → carve → talk → house · sacrifice **stated each**.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs a cloud/scenario placement (with bill-guards) and a microservices/containers comparison (with tradeoff tables). Decision-plus-sacrifice per part is the scoring pattern — verdicts without prices score half.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Startup: spiky/social app, tiny team, untrusted user uploads processed async. Tenure + layer + carve-slice + housing, each with its sacrifice."
:::

::: step [Step 2: Execution] Four Gavels
1. Tenure: public (spiky ⇒ rent; sacrifice: egress discipline + bill alarms from day one).
2. Layer: PaaS + managed services (velocity; sacrifice: opinionated constraints, stateless-first rewrite).
3. Carve: uploads/workers/billing split late (modular monolith first; sacrifice: strangler patience, no day-one distribution).
4. Housing: containers on managed K8s (density/velocity; sacrifice: shared-kernel threat model + image hygiene rituals).
:::

::: step [Step 3: Conclusion] Final Result
Scenario → four gavels → four sacrifices. Completeness = decisions × prices — the drill's exam simulation in one pass.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Egress-heavy video startup on public cloud bleeds cash. Two structural fixes?
(A) Bigger instances
(*B) CDN edge caching (serve hot bytes near viewers, origin pulls collapse) + tiered storage lifecycle (hot→cool→archive by age) — topology + lifecycle beat mashing the meter
(C) More regions
(D) Raise prices only
::: explanation
Egress billed per origin-egress byte: edge caches convert repeats to $0$-origin bytes; lifecycle demotes cold bytes to cheap tiers. Bill-architecture (not bill-paying) is the engineering response.
:::

::: quiz Q2: Mixed Drill
Sync order-flow across $5$ services, p99 $2$s: diagnosis + fix direction?
(A) Add capacity
(*B) Chain-depth disease (latencies add, availability multiplies, one slow hop poisons all): async-ify side effects (events/queues), budget+break the must-sync core, parallelise independent fans — depth surgery, not horsepower
(C) Faster JSON
(D) Bigger timeouts (hides, worsens queues — anti-fix; timeouts need budgets, not raises)
::: explanation
Depth arithmetic first (sums/products don't lie), then decouple (async), bound (budgets/breakers), fan (parallel). (D) named as the trap-fix (raising timeouts deepens queues) — diagnosis complete only with the anti-fix rejected.
:::

::: quiz Q3: Mixed Drill
Shared Postgres across $6$ "microservices": verdict?
(A) Pragmatic shortcut
(*B) Distributed monolith — shared data re-couples deploys/failures/scales (join-pressure, migration lockstep); carve data per service (or admit monolith honestly)
(C) Fine at small scale forever
(D) Rename it "modular"
::: explanation
Data-sharing voids autonomy (the independence triad's first leg): deploys tangle, one outage cascades, scaling skews. Honest monolith beats dishonest distribution — verdict with the way back (strangler from the seam).
:::
