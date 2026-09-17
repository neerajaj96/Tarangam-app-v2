# LR Drill: Tables, Traces & Conflict Verdicts

**State inventories, ACTION/GOTO reads, stack traces, and conflict triage — bottom-up workout.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Crane Operator Drill
Read the load chart (tables), swing loads (shift), unhook at marks (reduce on lookahead), park at GOTO bays, and halt on red lights (conflicts) with a written verdict. Smooth operators never move without a chart entry.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Drill loop

Inventory states (closure/goto) → read ACTION (shift/reduce/accept/error) → trace stack/input with GOTO landings → census conflicts → verdict (surgery/declaration/escalation).

::: callout-formula KTU Formula Vault: LR Drill
Chart → swing → unhook → park → red-light **verdict**.
:::

::: callout-exam KTU Exam Focus
The 9-marker is LR(0)/SLR item sets + table fragment + trace, or conflict reading from a given table. Item dots, lookahead sets, and GOTO landings are the three graded columns — show all.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$S \to aSb \mid ab$ (i.e. $a^nb^n$). (a) LR(0) shape sketch? (b) Trace `aabb$` actions? (c) Any conflicts expected?
:::

::: step [Step 2: Execution] Inventories and Swings
1. States track $a$-runs then $b$-matching: $I_0$ closure $\{S'\to\bullet S, S\to\bullet aSb, S\to\bullet ab\}$; goto-$a$ loops/stacks; items stay deterministic (no shared-prefix ambiguity in LR view).
2. shift $a$, shift $a$, shift $b$, reduce $S\to ab$?? — careful: stack $a\,a\,b$: top $ab$ reduces to $S$ → stack $aSb$ → reduce $S\to aSb$ → $S$, accept on $\$$. Handles innermost-first.
3. Canonical tables conflict-free (language is deterministic context-free); SLR likewise here — verdict: clean, cite innermost-handle order as evidence.
:::

::: step [Step 3: Conclusion] Final Result
Nested languages reduce inside-out; conflict-freedom argued from deterministic handle choice. Inside-out order is the trace's signature to highlight.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
After reducing to nonterminal $A$ atop state $s$, the parser next must:
(A) Shift input
(*B) GOTO[$s, A$] — land the pushed $A$ in its continuation state (reduce-then-relocate rhythm)
(C) Accept immediately
(D) Re-scan input
::: explanation
Reductions push structure, not input: GOTO routes it. Shift-without-GOTO strands the parse in the pre-reduction state — the two-beat rhythm is inviolable.
:::

::: quiz Q2: Mixed Drill
ACTION[$s, a$] = {shift $t$, reduce $A\to\alpha$}. First response?
(A) Prefer shift silently
(*B) Record shift/reduce conflict; resolve by grammar intent (precedence declarations / rewrite) and document — YACC's shift-default is a fallback, not a verdict
(C) Split the state
(D) Drop the lookahead
::: explanation
Verdict-before-default: understand (dangling-else? operator stacking?), then declare. Documented intent in directives + `y.output` sign-off is the professional close.
:::

::: quiz Q3: Mixed Drill
$a^nb^n$ parser reduces innermost $ab$ first because:
(A) Shorter rules first always
(*B) Innermost $ab$ is the handle — the only rightmost-consistent reducible chunk; outer $aSb$ completes only after inner collapses
(C) Scanner orders it
(D) Random choice
::: explanation
Handle discipline picks innermost: stack-top $ab$ spells a full RHS on-track; $aSb$ isn't complete yet. Completeness-plus-consistency (handle test) beats eagerness every time.
:::
