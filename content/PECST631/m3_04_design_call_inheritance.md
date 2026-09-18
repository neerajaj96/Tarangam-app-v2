# Design Elements: Call Graphs, Inheritance & Coupling

**Above single functions — inter-procedural, OO, and integration-level graph testing.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: City Transit Maps
**Call graphs** (who-rides-whom: nodes=functions, edges=calls — integration tour map!). **Inheritance testing** (subclass-behavioural-substitutability: Liskov! — override *extends*, never *betrays*: preconditions weakened-or-equal, postconditions strengthened-or-equal!). **Coupling pairs** (caller-def ↔ callee-use across the fence — inter-procedural du-testing!; shared-state/global couplings smell!). Levels rise (unit→integration→system!) with graphs to match (CFG→call-graph→state-models!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Call-graph tours + Liskov checks + coupling du-pairs

* Call-graph coverage (call every edge! recursive-cycle touring! callback/event-driven hidden edges!).
* Inheritance: flatten-vs-incremental strategies (retest overrides + inherited risks!); Liskov contract checks (history rule: superclass-observable behaviour preserved!).
* Coupling pairs (def-in-caller/use-in-callee + return-value flows!; global/shared-state couplings flagged as testability smells → inject!).

::: callout-formula KTU Formula Vault: Design Graphs
Calls **toured** · overrides **substitutable** · cross-fence **du-paired** · smells **injected-away**.
:::

::: callout-pitfall Override Narrowing Preconditions (Liskov Break!)
Subclass demanding *more* (stricter inputs!) breaks substitutability (client code valid for parent crashes on child!) — contravariance-rules (inputs-looser, outputs-tighter!) checked per override. Contract-direction discipline (weaken-in, strengthen-out!) is the review check.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"`Order.place()` calls `pay.charge()` then `stock.reserve()`. (a) Call-graph tour set? (b) Coupling pairs? (c) Subclass `ExpressOrder` overriding `reserve()` (faster, skips backorder!): Liskov verdict?"
:::

::: step [Step 2: Execution] Tours, Pairs, Contracts
1. (a) Tours: success path (charge-ok→reserve-ok!), charge-fail branch (compensate/rollback!), reserve-fail branch (refund path!) — outcome-split touring!
2. (b) Pairs: amount-def→charge-use, reservation-id→downstream-use, failure-flags→compensation-use (cross-fence journeys!).
3. (c) Skipping backorder *narrows* behaviour (parent promises eventual-fulfilment!) — violates unless contract allows express-semantics (documented variance!) — substitutability judged against *contract*, not vibes.
:::

::: step [Step 3: Conclusion] Final Result
Outcome-split tours, cross-fence pairs, contract-judged overrides. Contract-as-oracle (written pre/post!) underpins all three — unwritten contracts untestable, write them first.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Callback/event-driven edges hide from call graphs because:
(A) Graphs can't show them
(*B) Registration (not invocation!) appears statically (handler *registered*, fired by framework later — inversion-of-control indirection!); dynamic/event graphs + integration tests surface them (fire events, observe!)
(C) Callbacks never execute
(D) Static analysis forbids them
::: explanation
Inversion hides call-sites (framework calls *you*!) — static edges miss runtime firings (registration ≠ invocation!). Event-firing tests (trigger → assert handler effects!) cover the hidden arcs — dynamic proof for dynamic edges.
:::

::: quiz Q2: Foundational Concept
Shared-global-state coupling smells for testing since:
(A) Globals are slow
(*B) Invisible channels (def/use unlinked in call graphs — spooky action!; order-dependent flakes; parallel-unsafe!) — inject dependencies (parameters/constructors!) making channels explicit + tourable
(C) Memory waste
(D) Style guides dislike them
::: explanation
Hidden-channel harm (untraced flows! unrepeatable orders!) — explicitness therapy (inject, don't reach out!) restores tourability. Channel-visibility principle (all flows modelled!) guides refactors-for-testability.
:::

::: quiz Q3: Foundational Concept
Integration testing's distinctive prey (vs unit/system) is:
(A) Algorithm bugs (unit's!)
(*B) Interface mismatches (protocol/format/timing assumptions across units — contract violations live *between*, invisible to isolated units and too-narrow for E2E symptoms!) — fence-line faults
(C) UI typos (system's!)
(D) Nothing unique
::: explanation
Between-space bugs (assumption drift per side!) — contract tests + fence-pair tours hunt them (neither unit-solitude nor E2E-blur sees sharply!). Fence-line focus (interfaces as first-class test targets!) defines the level.
:::
