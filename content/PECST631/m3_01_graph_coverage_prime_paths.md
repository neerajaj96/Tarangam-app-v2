# Graph Coverage: Node, Edge, Path & Prime Paths

**Touring control-flow graphs — coverage rungs, prime-path power, and round-trip sightseeing.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Theme-Park Tickets
**Node coverage** (ride every attraction once!). **Edge coverage** (every *path between* rides too — subsumes nodes!). **Path coverage** (every *route through the park* — infinite with loops! bounded via prime paths!). **Prime paths** (longest simple non-repeating routes — the *smart* finite set touring all loop flavours: zero/one/many laps!). **Round-trip** (start-and-end-same sightseeing — loop testing formalised!). Subsumption ladder (paths ⊃ edges ⊃ nodes — higher costs, deeper confidence!).
:::

::: anim cfg-cover Nodes, Then Edges, Then Paths
Four nodes light, four edges ride, then the S-A-E / S-B-E routes complete — each rung containing the last.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Coverage rungs + prime/round-trip definitions + tour requirements

* Node/edge/all-edges incl. branches!; prime path (simple, maximal — no extension stays simple!); round-trip (prime cycle from a node!); sidetrips allowed in tours (detour-then-continue counts!).
* Tours with sidetrips (practical test paths embedding prime requirements!). Infeasible requirements (dead logic — triage like M2 du-pairs!).

::: callout-formula KTU Formula Vault: Graph Rungs
Nodes ⊂ edges ⊂ prime-paths · round-trips = **loop coverage** · sidetrips **allowed**.
:::

::: callout-pitfall Path-Count Explosion Excuse (Loops!)
All-paths infinite with loops (unbounded laps!) — prime paths bound it *intelligently* (representative lap-flavours, not all counts!). Infinity-cited surrender (untestable loops!) misses the prime-path point — bound smartly, don't surrender.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"CFG: S→A→E, S→B→E, A→B cross edge (diamond+diagonal!). (a) Prime paths? (b) Minimal tour set with sidetrips? (c) Round-trip needs here?"
:::

::: step [Step 2: Execution] Routes Listed
1. (a) Simple maximals: S-A-E, S-B-E, S-A-B-E, plus singles S,A,B,E (maximality trims subsumed!). A-B diagonal creates the $3$-route richness.
2. (b) One tour S-A-B-E covers all edges *and* prime S-A-B-E; plus S-B-E?? Covered? S-B-E nodes/edges all inside tour? Edges S-B ✓, B-E ✓ (tour traverses B→E ✓) — single tour covers *all* (sidetrip-free even!). Minimal = $1$.
3. (c) No cycles (DAG!) — round-trip vacuous here (loops absent, nothing to trip!). Note explicitly (vacuous-coverage honesty!).
:::

::: step [Step 3: Conclusion] Final Result
Prime-list (maximality-trimmed!), tour-minimisation (sidetrip-aware!), vacuous-case honesty (DAG ⇒ no round-trips!). Maximality-trimming (subsumed routes dropped!) is the listing discipline.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Prime path maximality (non-extendable simplicity) buys:
(A) Fewer tests always
(*B) Finite representative touring (unbounded simple-path sets trimmed to longest-per-shape — loop flavours $0/1/$many preserved, counts abstracted!) — infinity tamed representatively
(C) Weaker coverage
(D) Skipped branches
::: explanation
Maximal-simplicity (extend-until-repeat-or-end!) captures each shape once (loop Skipped/once/lapped flavours!). Representation-not-enumeration (shapes, not counts!) is the bounding wisdom — finite teeth on infinite graphs.
:::

::: quiz Q2: Foundational Concept
Tours with sidetrips allowed means:
(A) Sloppy testing accepted
(*B) Requirements embedded in longer executable paths (detour off, rejoin — practicality: fewer tests touring more requirements!; infeasible-sidetrip triage when detours can't execute!)
(C) Random wandering counts
(D) Paths needn't execute
::: explanation
Executability-first touring (requirements *ridden*, not listed!) with detour freedom (pragmatic minimisation!). Feasibility gating (sidetrip must run!) keeps tours honest — executable-or-excluded discipline.
:::

::: quiz Q3: Foundational Concept
Subsumption (paths ⊃ edges ⊃ nodes) guides:
(A) Always pick strongest (budget-blind maximalism wastes on low-risk code!)
(*B) Risk-matched rung choice (critical loops: prime/round-trip!; glue code: edges suffice!; triage: nodes as smoke!) — strength priced per rung (cost climbs with power!)
(C) Weakest always suffices
(D) Rungs are equivalent
::: explanation
Cost-strength frontier per component criticality (graded investment!) — uniform-maximum bankrupts, uniform-minimum gambles. Risk-matched rung selection (assess, then climb!) is the professional coverage policy.
:::
