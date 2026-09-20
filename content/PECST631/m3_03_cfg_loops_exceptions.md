---
id: m3_03_cfg_loops_exceptions
courseCode: PECST631
module: 3
sequence: 3
title: 'CFGs for Code: Loops & Exceptions'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Draw testable maps from straight-run basic blocks
  - Cover loop flavours with lap-accurate tours
  - Wire exception edges as extra arcs for coverage
concepts:
  - control-flow graphs
  - loop coverage
  - exception edges
prerequisites:
  - m3_01_graph_coverage_prime_paths
examRelevance: medium
tags:
  - white-box
  - cfg
---
# CFGs for Code: Loops & Exceptions

**Drawing testable maps — basic blocks, loop flavours, exception edges, and coverage on real control flow.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Subway Maps with Flood Routes
**Basic blocks** (stations: straight-line, single-entry/exit!). **Edges** (tracks: branches, loops-back, exception-jumps to handlers!). **Loops** need lap-flavours ($0/1/many$ + break/continue detours!). **Exceptions** add invisible tracks (every call *may* derail to `catch` — exceptional CFGs model them, or coverage lies about paths!). Map truthfully (all tracks!) then tour by rung (node/edge/prime!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Blocks, loop coverage, exceptional edges

* Block splitting (leaders: entries, branch-targets, post-branches!). Cyclomatic per method (M2 reunion: $e-n+2p$!).
* Loop testing (boundary laps $0/1/n$ + nested-loop strategies: innermost-first! + break/continue edge tours!).
* Exceptional CFG (try/catch/finally edges: normal + throw-arcs!; coverage must tour handler paths — untested catch blocks rot (dead rescue code!)).

::: callout-formula KTU Formula Vault: CFG Maps
Blocks **straight runs** · loops **lap-flavours** · exceptions **extra arcs** · tour **by rung**.
:::

::: callout-pitfall Handler-Never-Toured (Dead Rescue!)
Catch blocks untested (happy-path suites never throw!) rot silently (broken recovery discovered mid-incident!). Fault-injection tests (forced throws!) tour handlers deliberately — rescue paths need rescues rehearsed.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"`total=0; for(x in items){ try{ total+=price(x);} catch(e){log(e);} } return total;` (a) CFG blocks/edges sketch? (b) Loop+exception tour set? (c) Cyclomatic?"
:::

::: step [Step 2: Execution] Map and Tour
1. (a) B1 header/init → B2 loop-test → B3 try-body → B4 handler → B5 return; edges: test-true/false, body→test back, body→handler throw-arc, handler→test, test-exit→return.
2. (b) Empty items (zero-trip!) + one-clean-item + one-throwing-item (handler tour!) + multi-mixed (lap flavour!) — handler *forced* via throwing stub (injection!).
3. (c) Edges $\approx9$, nodes $5$: $V=9-5+2=6$ (basis floor: $6$ path-ambitions!).
:::

::: step [Step 3: Conclusion] Final Result
Throw-arcs drawn (not wished!), handler forced (not hoped!), $V(G)$ computed (ambition-floored!). Exceptional edges drawn explicitly — invisible tracks made visible.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Nested loops tested innermost-first because:
(A) Aesthetics
(*B) Inner behaviours compose outward (outer variations multiply inner cases — stabilise core first, then vary shells!; combinatorial explosion tamed layer by layer!)
(C) Compilers demand it
(D) Outer loops matter less
::: explanation
Compositional stabilisation (inner-correctness assumed testing outer!) contains explosion (fix inner $k$ cases, vary outer $m$ — product managed!). Inside-out discipline (core before shells!) generalises beyond loops.
:::

::: quiz Q2: Foundational Concept
`finally` blocks need touring *both* with and without exceptions since:
(A) They run twice always
(*B) Dual-entry paths (normal-fallthrough vs exceptional-unwind converge here — different *states* arrive!; resource-release correctness differs per arrival (half-acquired sets!) — both arrivals tested!)
(C) Syntax demands it
(D) Coverage tools count double
::: explanation
Convergence-point state variance (normal vs exceptional arrivals carry different messes!) — cleanup must handle both (idempotent release!). Arrival-variance testing (both paths in!) is the finally discipline.
:::

::: quiz Q3: Foundational Concept
Break/continue edges matter to coverage because:
(A) Style guides mention them
(*B) They *are* control transfers (extra CFG arcs — untested jumps hide behaviours: early-exit paths, skip-logic!; prime-path tours must include them or routes lie!)
(C) Loops forbid them
(D) Debuggers need them
::: explanation
Arc-completeness (every transfer modelled!) — hidden jumps untested = behaviours unverified (break-skipped validations!). Transfer inventory (list all jumps!) precedes tour claims.
:::
