---
id: m4_03_microservices_pros_cons
courseCode: PCCST602
module: 4
sequence: 3
title: 'Microservices: Pros, Cons & Decomposition'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Carve monoliths by business capability with data per service
  - Itemise the autonomy bill of distribution honestly
  - Design failure in with per-hop observability
concepts:
  - microservices
  - bounded decomposition
  - autonomy costs
prerequisites: []
examRelevance: medium
tags:
  - cloud
  - microservices
---
# Microservices: Pros, Cons & Decomposition

**Monolith surgery — when to carve, what it costs, and the autonomy bill itemised.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Restaurant vs Food Court
**Monolith**: one kitchen, one menu, one deploy (simple ops, scaling = whole-kitchen copies, one grease fire halts all). **Microservices**: food court (each stall: own menu/codebase, own deploy, own scale; shared: plumbing/discovery contracts). Wins: independent velocity, blast-radius containment, polyglot/right-size scaling. Bills: distributed-everything (tracing, transactions→sagas, versioning, ops maturity, network flakiness as normal weather).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Decompose by business capability/bounded context

Strangler-fig migration (carve edges first); data per service (no shared DB!); smart endpoints, dumb pipes; design for failure (timeouts/retries/circuit-breakers/bulkheads); observability as first-class (trace IDs cross every hop).

::: callout-formula KTU Formula Vault: Microservices
Carve by **capability** · data **per service** · failure **designed-in** · observe **every hop**.
:::

::: callout-pitfall Distributed Monolith (Worst of Both)
Chatty fine-grained services with shared DB + lockstep deploys = network-latency monolith (fragile *and* slow). Independence (data, deploy, failure) is pass/fail — shared anything central re-monoliths you remotely.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Shop monolith: catalog (read-heavy), orders (transactional), notify (bursty). Carve plan + per-service data/scale notes + one anti-pattern to dodge."
:::

::: step [Step 2: Execution] Capability Carving
1. Catalog service (read replicas + cache, scales on traffic), orders (own DB, saga across payment/stock — no distributed transactions!), notify (queue-fed workers, bursty autoscale).
2. Strangler order: notify first (edge, low coupling), catalog next, orders last (transactional heart).
3. Dodge: shared orders DB with catalog (join-pressure + deploy coupling) — per-service data or bust.
:::

::: step [Step 3: Conclusion] Final Result
Capability boundaries, data ownership, strangler order, named anti-pattern — carving answers need all four; three is a sketch.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Bounded context's job in decomposition:
(A) Team naming
(*B) Linguistic ownership boundary (one ubiquitous language per context: "order" means one thing inside) — contexts become service candidates with sealed vocabularies, stopping semantic bleed
(C) Network zones
(D) Database shards only
::: explanation
Shared words with split meanings ("account" billing-vs-support) breed coupling bugs; contexts seal meaning per service. Language boundaries *are* service boundaries — model language first, deploy second.
:::

::: quiz Q2: Foundational Concept
Saga vs distributed (2PC) transactions across services:
(A) 2PC preferred at scale
(*B) Sagas choreograph/orchestrate local transactions + compensations (eventual consistency, no cross-service locks); 2PC locks across services (blocking, fragile at scale) — autonomy forbids distributed locks
(C) Same guarantees
(D) Sagas need shared DB
::: explanation
No shared locks across autonomous services (availability + ownership veto); compensating actions unwind semantically. Consistency downgraded knowingly (eventual) for autonomy — the distributed-systems bargain restated.
:::

::: quiz Q3: Foundational Concept
Monolith-first (not microservices-day-one) because:
(A) Monoliths scale better infinitely
(*B) Boundaries unknown early — premature carving fossilises wrong cuts (distributed-monolith risk); modular monolith first, then strangler proven seams once domains clarify
(C) Microservices are banned for startups
(D) Frameworks forbid it
::: explanation
Decomposition needs discovered boundaries; startups need velocity. Modular-monolith-then-strangler sequences learning before distribution — timing *is* the architecture decision.
:::
