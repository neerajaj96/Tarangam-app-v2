# M4 Drill: Functional Mastery Sprint

**Partitions, tables, matrices, kinds, symbols — black/grey-box fluency at pace.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Function-First Sprint
Slice inputs (partitions!) → grid rules (tables!) → map matrices (gaps!) → pick kinds (load/stress/soak!) → symbolise paths (PEX!) → gate AI (curate!). Sprint functions-first (specs before structures!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sprint sheet

Classes+sextuplets · table-completeness · risk-matrices · kind-verdicts · symbex-witnesses · curated-copilots.

::: callout-formula KTU Formula Vault: Sprint
Slice → grid → map → kind → symbolise → curate.
:::

::: callout-exam KTU Exam Focus
M4's 9-markers stage ECP/BVA design *or* decision-table construction *or* grey/perf/PEX methodology with tools named. Designed-cases (tables of values!) plus methodology rationale per answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Grade-field: letters A–F (spec!), plus numeric $0$–$100$ input path. (a) Classes? (b) Fences? (c) Decision-table rows for pass/distinction ($D$: $\ge75$ + attendance $\ge80\%$)? (d) Symbolise `if(g!=null)` null-guard for PEX?"
:::

::: step [Step 2: Execution] Sprint Answers
1. (a) Valid $\{A..F\}$, invalid $\{G..Z, lowercase?, empty\}$ (spec-read classes! — lowercase: spec-silent ⇒ clarify-or-reject-test!).
2. (b) Numeric $0/1/99/100/101$ fences ($-1$ invalid-side!) + grade edges (F/E, D/C boundaries via score mapping!).
3. (c) Conditions (score$\ge75$? attend$\ge80$%?) × actions (distinction/pass/fail + borderline-review!) — $4$ combos, contradiction scan (both-yes-but-fail = smell!).
4. (d) Null vs non-null fork (constraints $g=null$ / $g\ne null$ + witnesses each!) — guard coverage via symbols.
:::

::: step [Step 3: Conclusion] Final Result
Classes-with-silences-flagged, fences-numbered, tables contradiction-scanned, guards symbolised. Silence-flagging (spec-gaps as findings!) is the diligence marker.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Spec-silent lowercase grades: test stance?
(A) Assume accepted
(*B) Flag as spec-gap finding (clarify-or-reject test written *and* query filed — testing surfaces ambiguity, doesn't resolve it unilaterally!)
(C) Ignore silently
(D) Assume rejected (same sin, other direction!)
::: explanation
Ambiguity-as-finding (filed queries with tests both ways!) — testers expose gaps (both-behaviour tests!), owners resolve (spec patch!). Unilateral assumption (either way!) buries contract holes.
:::

::: quiz Q2: Mixed Drill
Pairwise ($3\times3\times2$, browsers×OS×roles): rows ≈?
(A) $18$ (exhaustive!)
(*B) $9$ (lower bound $3\times3$ OS-browser pairs, one per row; achievable — role $=(i+j)\bmod2$ covers the rest; every pair somewhere!)
(C) $6$
(D) $3$
::: explanation
Covering-array economics ($9$ rows for $3\times3\times2$ strength-$2$: lower bound meets construction — PICT-style tools confirm!). Estimate-then-generate (rough $9$, tool-exact!) is the workflow.
:::

::: quiz Q3: Mixed Drill
Soak-flat $6$h then FD-climb at hour $7$. Verdict?
(A) Pass (mostly flat!)
(*B) Leak suspect (late climb = slow drip surfacing — extend run, heap/FD-dump diffs, fix-before-ship!; flat-then-climb is the classic leak shape, not noise!)
(C) Rerun same duration (reproduces? extends evidence — but *extend*, don't just repeat!)
(D) Blame monitoring
::: explanation
Shape-reading (flat-then-climb = leak signature!) triggers extended forensics (dumps at hours $6$ vs $8$ diffed!). Signature literacy (leak-shapes!) beats duration-box-ticking — read graphs, don't serve time.
:::
