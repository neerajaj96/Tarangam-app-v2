---
id: m4_07_global_live_placement
courseCode: PCCST601
module: 4
sequence: 7
title: 'Global Optimization: Live Sets & Code Placement'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Solve liveness equations backward to fixpoint convergence
  - Alarm uninitialized uses from live-at-entry sets
  - Place each instruction once where needed across functions
concepts:
  - liveness analysis
  - data-flow fixpoint
  - code placement
prerequisites: []
examRelevance: high
tags:
  - optimization
  - data-flow-analysis
---
# Global Optimization: Live Sets & Code Placement

**Whole-function reasoning — liveness equations spotting uninitialized uses, and motion planning for instructions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Library Book Tracking
**Liveness** tracks which variables are "books currently borrowed" (defined upstream, read downstream) at every program point: equations flow *backwards* (a book is live if some future reader wants it). Reading an **uninitialized** variable = borrowing a book never bought (live at entry with no defining purchase — the bug detector). **Code placement** shelves instructions where they're needed exactly once (hoist/sink motion) — global feng shui minimising dynamic executions.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Live equations and uninit detection

$$\text{LiveIn}(B) = \text{Use}(B) \cup (\text{LiveOut}(B) - \text{Def}(B)), \quad \text{LiveOut}(B) = \bigcup_{S} \text{LiveIn}(S)$$

Iterate to fixpoint (backward). Uninitialized use: variable live at function entry (or a use reached by a definition-free path) ⇒ warn. Also powers dead-code elimination (define-but-never-live = dead) and register allocation (interference from overlapping lives).

### 2.2 Global code placement/motion

Hoist loop-invariants/sink to use points; partial-redundancy elimination places computations on exactly the paths needing them (hot-path focus); block layout for fall-through (M4 control-shape synergy).

::: callout-formula KTU Formula Vault: Global
LiveIn = **Use ∪ (Out−Def)** · backward **fixpoint** · live-at-entry = **uninit alarm** · placement = **once-where-needed**.
:::

::: callout-pitfall Liveness Flows Backwards
Forward-propagating liveness ("defined means live") flags every store as live — dead stores survive, uninit uses hide. Direction *is* the analysis: uses pull liveness backwards; iterate to fixpoint, then read entry sets.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
CFG: B1: `x=1` → B2: `y=x+1` → B3: uses `y`, defines nothing; plus path B1→B3 directly (branch). Compute LiveIn sets and flag uninit risks.
:::

::: step [Step 2: Execution] Backwards Pass
1. LiveOut(B3) $= \varnothing$ (exit); LiveIn(B3) $= \{y\}$ (use).
2. B2: Use $\{x\}$, Def $\{y\}$: LiveIn $= \{x\} \cup (\{y\}-\{y\}) = \{x\}$.
3. B1: Use $\varnothing$, Def $\{x\}$: successors B2 ($\{x\}$), B3 ($\{y\}$): LiveOut $= \{x,y\}$; LiveIn $= \varnothing \cup (\{x,y\}-\{x\}) = \{y\}$ — $y$ live at ENTRY ⇒ uninit read on the B1→B3 path (B2's definition skipped)! Warn exactly there.
:::

::: step [Step 3: Conclusion] Final Result
Equations per block, fixpoint order (reverse), entry-set verdict. The direct-edge bypass creating the alarm is the finding to circle — path-sensitivity narrated, not just sets listed.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why iterate liveness to a fixpoint instead of one backward pass?
(A) Single passes suffice for all CFGs
(*B) Back-edges circulate facts (B3's sets feed B1 feeds B2 feeds B3…) — repeated rounds pump loop-carried liveness until no set changes; one pass misses it
(C) Forward passes are faster instead
(D) Fixpoints look impressive
::: explanation
Circular dependencies need pumping to closure: iterate reverse-order until stabilised (finite lattice ⇒ guaranteed termination). Fixpoint = "nothing left to learn" — convergence, not ceremony.
:::

::: quiz Q2: Foundational Concept
Define-but-never-live variable means:
(A) Frequently used
(*B) Dead store — definition no path reads; deletable (unless volatile/I/O-visible side effects veto)
(C) Uninitialized use
(D) Loop invariant
::: explanation
Liveness *is* the dead-code test: no future reader ⇒ write is waste. Side-effect veto (calls, volatiles, I/O) gates deletion — permit-check before profit-taking, as always.
:::

::: quiz Q3: Foundational Concept
Code placement (global motion) optimises what, exactly?
(A) Source line count
(*B) Dynamic execution count — each computation executes on exactly the needing paths, as few times as possible (hoist/sink/PRE), trading static duplication for dynamic savings
(C) Register count only
(D) Parse speed
::: explanation
Static code may *grow* (duplicated into paths) while dynamic executions shrink — the profitability ledger counts runs, not lines. Hot-path focus (profile-guided) aims motion where executions concentrate.
:::
