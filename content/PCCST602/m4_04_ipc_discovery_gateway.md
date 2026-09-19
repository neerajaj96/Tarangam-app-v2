---
id: m4_04_ipc_discovery_gateway
courseCode: PCCST602
module: 4
sequence: 4
title: 'IPC, Discovery, Gateway & Registry'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Couple synchronously or decouple eventually across stalls
  - Find services with registry plus health discipline
  - Enforce door policy at the gateway edge
concepts:
  - inter-service communication
  - service discovery
  - API gateway
prerequisites:
  - m4_03_microservices_pros_cons
examRelevance: medium
tags:
  - cloud
  - service-mesh
---
# IPC, Discovery, Gateway & Registry

**How stalls talk — sync/async, protocols/formats, finding each other, and the door policy.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Food-Court Operations
**IPC**: shout across (sync REST/gRPC — wait for the answer) vs ticket-and-buzzer (async queues/events — fire, continue, react). **Protocol/format**: agreed languages + menu cards (HTTP/REST+JSON readable, gRPC+Protobuf tight, events+Avro/JSON evolving). **Discovery+registry**: stall directory (services register; callers look up — client-side or server-side via load balancer). **Gateway**: mall entrance (one door: auth, rate limits, routing, aggregation — strangler seam lives here too).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Interaction kinds and plumbing

* Sync (request/response: REST, gRPC): simple reasoning, temporal coupling (callee-down = caller-blocked; timeouts/budgets mandatory).
* Async (queues/streams: AMQP/Kafka-style events): decoupled, buffered, eventual; needs idempotency + schema evolution discipline.
* Discovery: self-registration + health checks; client-side (caller picks) vs server-side (LB picks). Registry staleness ⇒ outlier ejection + retries with backoff/jitter.
* Gateway: edge policy (auth/rate/route/versioning/BFF aggregation); anti-corruption layer for legacy seams.

::: callout-formula KTU Formula Vault: Stall Talk
Sync = **coupled-simple** · async = **decoupled-eventual** · directory = **registry+health** · door = **gateway policy**.
:::

::: callout-pitfall Sync Chains Multiply Failure
A→B→C→D sync: availability multiplies ($0.99^3 \approx 0.97$) and tail latencies add (p99 sums!) — depth is danger. Async breaks chains (buffer absorbs); where sync must stand, budgets+breakers bound the blast.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Checkout needs stock-check, payment, receipt-mail. Sync/async per hop? Where gateway/registry sit? One failure-mode fix."
:::

::: step [Step 2: Execution] Coupling Budget
1. Client → gateway (auth/rate/route) → orders; orders → stock/payment **sync** (need answers now; budgets $200$ ms, breaker on payment); receipt via **event** (async mailer, retries, idempotent sends).
2. Registry: all register + health; gateway routes by path/version. Fix: payment breaker + queue-backed mail (no sync mail on the hot path — latency amputation).
:::

::: step [Step 3: Conclusion] Final Result
Hot path sync-with-budgets, side effects async-with-retries, gateway at edge, registry beneath. Coupling budgeted per hop (sync only where answers gate progress) is the design discipline.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Client-side vs server-side discovery differ by:
(A) Speed only
(*B) Who picks the instance: caller consults registry directly (client-side: smart client, no hop) vs via load balancer (server-side: dumb client, extra hop, central policy point)
(C) Protocol used
(D) Nothing observable
::: explanation
Picker placement trades client smarts for central control: client-side skips hops (caching/stickiness logic in caller); server-side centralises policy (canary/mirroring at LB). Hop-vs-smarts is the axis — choose per team topology.
:::

::: quiz Q2: Foundational Concept
Idempotency matters for async/event flows because:
(A) Queues are slow
(*B) At-least-once delivery retries duplicates — handlers must absorb repeats harmlessly (keys/dedup/state-machine design), else money moves twice
(C) Events are large
(D) Ordering is free
::: explanation
Retries + redelivery make duplicates *normal*, not exceptional. Design effects idempotent (same result N times) — exactly-once is a myth's name; idempotent-at-least-once is the engineering reality.
:::

::: quiz Q3: Foundational Concept
API gateway aggregating (BFF) helps mobile clients by:
(A) Adding latency always
(*B) One tailored call replaces chatty N-service fan-out (battery/radio-friendly payloads, versioned per client) — chatter collapses at the edge, backends stay fine-grained
(C) Removing backends
(D) Caching everything forever
::: explanation
Radio/battery punish chatter; BFFs compose server-side (parallel fans, trimmed shapes). Edge aggregation decouples client cadence from service topology — each evolves at its pace.
:::
