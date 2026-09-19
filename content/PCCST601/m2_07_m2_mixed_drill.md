---
id: m2_07_m2_mixed_drill
courseCode: PCCST601
module: 2
sequence: 7
title: 'M2 Mixed Drill: FIRST to Accept in One Sitting'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Run surgery, sets, cells and traces on one grammar end to end
  - Stop and repair at conflicts instead of tracing past them
  - Deliver accept verdicts with the belt checklist
concepts:
  - top-down pipeline
  - conflict repair
prerequisites:
  - m2_02_left_recursion_factoring
  - m2_04_ll1_first_follow_tables
  - m2_05_ll1_traces_errors
examRelevance: high
tags:
  - parsing
  - m2-drill
---
# M2 Mixed Drill: FIRST to Accept in One Sitting

**Full top-down workout — sets, table, trace, verdict — on one grammar end to end.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Conveyor Belt
Grammar in → surgery → FIRST/FOLLOW → table → trace → accept/error. Run the belt without skipping stations — each station's output feeds the next, and graders station-hop the same way.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Belt checklist

Surgery (recursion/factoring) → nullable audit → FIRST fixpoint → FOLLOW fixpoint → cells (FIRST, then FOLLOW for $\varepsilon$) → conflict scan → 3-column traces → sentinels check.

::: callout-formula KTU Formula Vault: Belt
Surgery → sets → cells → traces · conflicts = **stop and repair**.
:::

::: callout-exam KTU Exam Focus
The 9-marker is FIRST/FOLLOW + table + short trace (or surgery + table). Show sets with iteration traces (rounds until fixpoint), cells with rule citations, traces with three columns — evidence at every station.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$S \to aSb \mid c$. (a) Surgery needed? (b) FIRST/FOLLOW? (c) Table + verdict? (d) Trace `aacbb$` briefly?
:::

::: step [Step 2: Execution] Whole Belt, Small Grammar
1. No left recursion ($a$/$c$-leading), no shared prefixes — clean as written.
2. FIRST($S$) $= \{a,c\}$; FOLLOW($S$) $= \{\$,b\}$ ($b$ follows inner $S$ via $aSb$; $\$$ at top).
3. $M[S,a] = S\to aSb$; $M[S,c] = S\to c$; other cells blank — conflict-free ⇒ LL(1) ✓.
4. $S\Rightarrow aSb \Rightarrow aaSbb \Rightarrow aacbb$ ✓ accept (trace rows mirror these expansions with matches interleaved).
:::

::: step [Step 3: Conclusion] Final Result
Even tiny grammars exercise the full belt — surgery-verdict, fixpoint sets, cited cells, mirrored trace. Small-complete beats large-sketchy for revision.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$S \to aA$, $A \to b\mid\varepsilon$. FOLLOW($A$)?
(A) $\{b\}$
(*B) $\{\$\}$ — $A$ sits at production end, so FOLLOW($S$) $= \{\$\}$ propagates; $b$ belongs to FIRST, not FOLLOW, here
(C) $\{a,b\}$
(D) $\varnothing$
::: explanation
End-position rule: nothing follows $A$ in $S\to aA$ except $S$'s followers ($\{\$\}$). FIRST-vs-FOLLOW confusion (option A grabs $b$ from FIRST) is the planted trap — position decides which set.
:::

::: quiz Q2: Mixed Drill
$M[X, t]$ blank, top $X$, lookahead $t$. Next parser action?
(A) Pop $X$, continue
(*B) Syntax error at $t$ (expected FIRST($X$) or FOLLOW-context) + panic-mode recovery — blanks are errors, never silent moves
(C) Push $t$
(D) Accept input
::: explanation
Blank = no legal move = malformed input, period. Report (expected set from the row's filled cells), sync, resume — error citizenship in one move.
:::

::: quiz Q3: Mixed Drill
Which grammar is LL(1): $G_1: S\to aS\mid a$ or $G_2: S\to aS'\mid\varepsilon$-style factored equivalent?
(A) $G_1$ directly
(*B) $G_2$ (factored: $S\to aS'$, $S'\to S\mid\varepsilon$) — $G_1$'s shared prefix `a` double-fills $M[S,a]$; factoring separates continuation from exit
(C) Neither ever
(D) Both directly
::: explanation
$G_1$: $M[S,a]$ gets both productions (conflict). $G_2$: $M[S,a] = S\to aS'$ single; $S'$ row splits on FOLLOW ($S$ vs $\varepsilon$) cleanly. The minimal factoring parable — shared-prefix conflict and its cure side by side.
:::
