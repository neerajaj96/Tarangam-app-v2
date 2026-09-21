---
id: m3_99_practice_lab_logic_drills
courseCode: PECST522
module: 3
sequence: 99
title: 'Module 3 Practice Lab: Logic Drills'
difficulty: intermediate
estimatedMinutes: 9
learningObjectives:
  - Prove safety under time pressure with Wumpus rules
  - Race model counting to one verdict on three atoms
  - Refute in three steps with survivors never allowed
concepts:
  - safety proofs
  - model-counting race
  - refutation drills
prerequisites:
  - m3_01_knowledge_based_agents_and_wumpus_world
  - m3_02_propositional_logic_syntax_semantics
  - m3_03_inference_resolution_and_horn_clauses
  - m3_04_first_order_logic_unification_and_lifting
examRelevance: high
tags:
  - logic
  - m3-lab
---
# Module 3 Practice Lab: Logic Drills

**Problem: turn logic theory into timed proof skill. By the end you can prove Wumpus safety in a minute, race model counting against refutation, and run unification trials without binding leaks.**

<a id="start-zero"></a>
## 1. Start From Zero: Four Timed Scenarios

**Problem first:** exams compress Tell/Ask, model sets, refutation, and UNIFY into single questions. **Method:** one worked drill per machinery, then the confusion table.

**Scenario 1 — Safety proof under time pressure:** visited (1,1) silent (`¬B`, `¬S`); visited (2,1) breezy without stench. Breeze rule at (2,1) gives `P(1,1) ∨ P(3,1) ∨ P(2,2)`; `¬P(1,1)` leaves suspects `P(3,1) ∨ P(2,2)` — neither provable. Silence at (1,1) forces `¬P(2,1) ∧ ¬P(1,2)` and `¬W(2,1) ∧ ¬W(1,2)`. Verdict in 60 seconds: **(1,2) provably safe** (pit-free and Wumpus-free); (2,2)/(3,1) possibly mined — probe (1,2). Disjunctions locate suspicion; only negated rules locate safety.

**Scenario 2 — Model-counting race (3 atoms, 8 rows, 1 verdict):** KB `{A, A => B}` over `{A, B, Z}` (Z free). Rows: 8 total; `A` kills 4; `A => B` kills A-true-B-false rows (2 of the 4); survivors `(A,B,Z)` in `{(T,T,T),(T,T,F)}` — B true in both, so `KB |= B`. Free atom Z doubles rows while changing nothing: model checking prices vocabulary, not content (the inefficiency, demonstrated).

**Scenario 3 — Three-step refutation (no survivors):** clauses `(¬A ∨ B)`, `(¬B ∨ C)`, `(A)`, negated query `(¬C)`. Resolve `(A)` with `(¬A ∨ B)` to `(B)`; with `(¬B ∨ C)` to `(C)`; with `(¬C)` to the empty box. Same verdict class as Scenario 2 with zero census — the efficiency gap, quantified.

**Scenario 4 — Unification trials (three calls, three fates):** (a) `Loves(x,y)` vs. `Loves(Mary,z)` gives `{x/Mary, y/z}` — clean and most general. (b) `Knows(John,x)` vs. `Knows(y,Mother(y))` binds y first (`{y/John}`), composes through, then `x/Mother(John)` — order matters. (c) `P(x,f(x))` vs. `P(y,y)` reduces (after x/y) to x vs. `f(x)`: **occur-check failure** — refuse, or infinite regress follows. Success, composition, refusal: the complete docket.

<a id="basics"></a>
## 2. Basic Layer: Do-Not-Confuse Table

| Pair | Exam distinction |
|---|---|
| Tell vs. Ask | Add sentences vs. query entailment (loop: perceive-Tell, decide-Ask) |
| Entailment vs. derivation | Semantic all-models truth vs. syntactic rule-pushing (soundness + completeness bridge) |
| Valid vs. satisfiable vs. unsat | All models / some model / no models (refutation needs the third) |
| MP vs. MT vs. fallacies | `P,P=>Q ⊢ Q` and contrapositive only — affirming/denying invalid |
| Model checking vs. resolution | `2^n` census (complete, hopeless) vs. refutation proofs (complete, directed) |
| Horn vs. general clauses | At most one positive (chaining-complete) vs. resolution-only territory |
| Forward vs. backward chaining | Fire-all flood vs. goal-driven slice on huge KBs |
| `∀+=>` vs. `∃+∧` | Correct pairings; swapped versions state nonsense/vacuities |
| Unify order | Bind-then-compose (early bindings flow into later pairs) |
| Standardize apart | Fresh names per rule-use before every UNIFY (no leakage) |

**Limitations of drills:** hand proofs use tiny vocabularies; real KBs need indexing, strategies, and subsumption. Timed verdicts assume stated rules — missing rules mean withheld judgment, not guessed safety.

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz KB = {A, A⇒B} over atoms {A, B, Z}. How many rows survive model checking, and what does the free atom Z teach about the method's cost?
() 8 rows survive; Z proves model checking is efficient
(*) 2 rows survive ({A,B} true, Z either way); Z doubles rows while changing nothing — model checking prices irrelevant atoms identically to relevant ones, which is exactly why it scales as 2^n
() 0 rows survive; the KB is contradictory
() Z must be deleted from the language first
::: explanation
Filtering keeps only A-and-B rows (2 of 8); Z rides along irrelevantly yet enumerated. Cost tracks vocabulary, not content — resolution never names Z at all.
:::

::: quiz P(x, f(x)) vs. P(y, y): walk the unification to its verdict.
() Succeeds with θ = {x/y} — the nesting is harmless
(*) x meets y (bind), then f(x) meets x — x occurs inside its own partner: occur-check failure, refuse (else infinite regress x = f(x) = f(f(x))…)
() Succeeds with θ = {y/f(y)} by symmetric reasoning
() Unification is undefined for nested terms
::: explanation
After {x/y}, the second pair is f(x) vs. x — a variable against its own container. Accepting builds an infinite term; Prolog's skipping this check is documented unsoundness for speed.
:::

::: quiz Forward chaining floods all consequences; backward chaining works back from the query. A million-rule KB faces one focused diagnostic question. Which engine and what complexity reality?
() Forward — completeness demands total derivation
(*) Backward — demand-driven grounding explores only goal-relevant rules (potentially logarithmic slice of the KB); forward's linear-in-KB flood is complete but wasteful here
() Neither — million-rule KBs are undecidable in principle
() Both explore identically; the names are historical
::: explanation
Effort follows relevance: backward recursion visits the query's premise cone only. Forward's virtue (everything derived) is its cost for one-corner questions.
:::

::: quiz Stench at (1,2), visited-safe (1,1), wall at (0,2). A student concludes "Wumpus at (1,3), certainly." Give the correct conclusion with its logical form.
() The student is right — stench pinpoints uniquely
(*) Disjunction W_{1,3} ∨ W_{2,2} (candidates after eliminating (1,1) and the wall) — certainty about a *set*, ignorance within it; probing must respect the disjunction (retreat to testable squares, never assume a disjunct)
() No conclusion whatsoever follows from stench
() The Wumpus is certainly at (2,2) by elimination
::: explanation
One percept with two survivors yields disjunctive knowledge. Acting on single-disjunct certainty risks death in the other world; acting on the disjunction probes elsewhere.
:::

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
3 marks: any table row (MP/MT and Horn lead) or single MGU. 7 marks: Wumpus safety proof, refutation to the box, or UNIFY trace with ordering.
:::

**Recap facts examiners reward:** disjunction-not-location discipline; 2-of-8 survivor count with Z lesson; three resolvents with pairs named; MGU composition order; occur-check refusal shape.

### Essay Question 1 (7 Marks)
**Q: From clauses (¬A∨B), (¬B∨C), (A), prove C by resolution, showing pairs. Why does the box end it?**

**Model Answer:** (A) with (¬A∨B) on A gives (B). (B) with (¬B∨C) on B gives (C). (C) with negated query (¬C) gives the box. The box is derived contradiction under ¬C alongside the KB — KB ∧ ¬C unsatisfiable means KB |= C. The box is absence-of-survivors, not another fact.

### Essay Question 2 (7 Marks)
**Q: Unify Knows(John, x) with Knows(y, Mother(y)) with order, plus the occur-check case.**

**Model Answer:** y vs. John gives {y/John}; composed second pair x vs. Mother(John) gives {x/Mother(John)}; MGU as shown. y-first is load-bearing since x's partner contains y. Occur case P(x,f(x)) vs. P(y,y) reduces to x vs. f(x) — self-containing partner, refuse, blocking x = f(x) = ... regress.
:::
