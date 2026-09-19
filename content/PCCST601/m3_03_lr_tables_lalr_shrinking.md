---
id: m3_03_lr_tables_lalr_shrinking
courseCode: PCCST601
module: 3
sequence: 3
title: Building & Shrinking LR Tables
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Grow the canonical collection with goto-closure steps
  - Merge cores into LALR at SLR size with open eyes
  - Read conflicts and ghost FOLLOW issues as verdicts
concepts:
  - canonical collection
  - LALR merging
  - SLR trade-offs
prerequisites:
  - m3_02_lr1_algorithm_items
examRelevance: high
tags:
  - parsing
  - lr-parsing
---
# Building & Shrinking LR Tables

**Canonical collection via goto-closure, LALR merging, and table errors — size vs power bargains.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Factory Floor Plan
**Canonical LR(1)** builds every crew station (state) the grammar can staff — hundreds for real languages (power at volume). **LALR** merges stations with identical assembly cores differing only in binoculars (lookaheads) — same headcount as SLR, near-LR(1) eyesight. **SLR** consults FOLLOW sets (cheap, myopic); conflicts it reports may be ghosts that LALR/LR(1) wouldn't raise. Errors during construction (multiply-filled cells) are grammar verdicts, not typos.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Construction ladder and reductions

* Canonical: closure($I_0$) + gotos to fixpoint → ACTION/GOTO (most states, most power).
* LALR: merge same-core states (union lookaheads) → SLR-sized tables, resolves most SLR ghosts; rare new reduce/reduce ghosts possible (never new shift/reduce — citable nuance).
* Table errors: shift/reduce or reduce/reduce in one ACTION cell ⇒ grammar not in that class (escalate method or rewrite grammar).

::: callout-formula KTU Formula Vault: LR Ladder
LR(1) **max states, max power** · LALR **merge cores, SLR size** · SLR **FOLLOW-cheap, ghost-prone** · conflicts = **verdicts**.
:::

::: callout-pitfall Merging Cores ≠ Merging Randomly
LALR merges only *identical LR(0) cores* — merging lookalike-but-different cores corrupts parsing. Core-equality first, lookahead-union second; order is the correctness condition.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
States $I_4 = \{[A\to c\bullet, a/b]\}$-ish core $\{[X\to\alpha\bullet]\}$ with lookaheads $\{a\}$ and $I_9$ same core with $\{b\}$. LALR-merge? Resulting reduce row? What conflict class can merging introduce?
:::

::: step [Step 2: Execution] Merge and Warn
1. Same core ⇒ merge: reduce $X\to\alpha$ on $\{a,b\}$ — row union, states fused.
2. Merging can birth reduce/reduce ghosts (two completions sharing fused lookaheads) but never shift/reduce ones — the asymmetry to quote when asked.
:::

::: step [Step 3: Conclusion] Final Result
Core-equality check, lookahead union, ghost-class caveat. Three lines cover the "explain LALR construction" sub-answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
SLR reports a conflict where canonical LR(1) parses cleanly. Explanation?
(A) Bug in SLR
(*B) SLR's FOLLOW-based reduce lookaheads over-approximate (context-free ghosts) — LR(1)'s propagated exact lookaheads exclude the phantom; LALR usually agrees with LR(1)
(C) Grammar changed
(D) Tables corrupted
::: explanation
FOLLOW($A$) includes contexts unreachable in *this* state; exact lookaheads don't. Ghost conflicts indict the method's myopia, not the grammar — escalate before rewriting.
:::

::: quiz Q2: Foundational Concept
LALR table size vs SLR for the same grammar?
(A) Much bigger
(*B) Equal state counts (same merged cores) — LALR redistributes lookahead precision within SLR's skeleton, buying power at zero size cost
(C) Much smaller
(D) Unrelated
::: explanation
Merging targets canonical's explosion down to SLR's count; precision lives in the *lookahead sets*, not state numbers. Size parity + power jump is LALR's whole value proposition (why YACC defaults to it).
:::

::: quiz Q3: Foundational Concept
ACTION cell holds shift (on $a$) and reduce $A\to\alpha$ (on $a$). Options?
(A) Ignore and ship
(*B) Grammar surgery (factor/rewrite the ambiguity), precedence/associativity declarations (YACC `%left`, shift-preferred defaults documented), or escalate parser class — chosen deliberately, stated explicitly
(C) Delete the terminal
(D) Merge the actions
::: explanation
Conflicts are verdicts demanding decisions: reshape the language, declare intent (dangling-else shift!), or wield stronger machinery. Silent defaults are bugs wearing table entries — decide out loud.
:::
