---
id: m3_99_practice_lab_logic_drills
courseCode: PECST522
module: 3
sequence: 99
title: 'Module 3 Practice Lab: Logic Drills'
difficulty: intermediate
estimatedMinutes: 7
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

**Wumpus safety proofs, model-counting races, three-step refutations, unification trials, and exam essay models.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

### Scenario 1: Safety Proof Under Time Pressure (Wumpus Rules Apply)

Visited (1,1): silence (¬B, ¬S). Visited (2,1): breeze, no stench. Prove (1,2) safe, decide (2,2) and (3,1) in 60 seconds: breeze rule at (2,1) gives $P_{1,1} \lor P_{3,1} \lor P_{2,2}$; $\lnot P_{1,1}$ (visited) leaves $P_{3,1} \lor P_{2,2}$ — both suspects, neither provable. At (1,1): $\lnot B_{1,1}$ forces $\lnot P_{2,1} \land \lnot P_{1,2}$; $\lnot S_{1,1}$ forces $\lnot W_{2,1} \land \lnot W_{1,2}$. Verdict: **(1,2) provably safe** (no pit, no Wumpus), (2,2)/(3,1) each possibly mined — probe (1,2). Disjunctions locate *suspicion*; only negated rules locate *safety*.

### Scenario 2: Model-Counting Race (3 Atoms, 8 Rows, 1 Verdict)

KB: $A$, $A \Rightarrow B$, $(B \land C) \Rightarrow D$... precisely in clausal spirit: facts $\{A, \lnot B \lor C\}$ plus query $C$? No — query must *follow*: KB $= \{A,\ A \Rightarrow B\}$ (2 atoms relevant, third atom $Z$ free). Rows: 8 total; $A$ kills 4; $A \Rightarrow B$ kills $A$-true-$B$-false rows (2 of the 4); survivors: $(A,B,Z) \in \{(T,T,T),(T,T,F)\}$ — $B$ true in both: $KB \models B$ proven. The free atom $Z$ doubles rows and changes nothing — model counting prices *relevant* atoms; vending-machine $2^n$ counts the irrelevant too (the inefficiency, demonstrated).

### Scenario 3: Three-Step Refutation (No Survivors)

Clauses: $(\lnot A \lor B)$, $(\lnot B \lor C)$, $(A)$, plus negated query $(\lnot C)$. Resolve $(A) \otimes (\lnot A \lor B) \to (B)$; $(B) \otimes (\lnot B \lor C) \to (C)$; $(C) \otimes (\lnot C) \to \Box$. Contradiction in three steps — entailment certified without enumerating a single model. Compare Scenario 2's 8-row census: same verdict class, no census bureau.

### Scenario 4: Unification Trials (Three Calls, Three Fates)

(a) $\text{Loves}(x, y)$ vs. $\text{Loves}(\text{Mary}, z)$ → $\theta = \{x/\text{Mary},\ y/z\}$ — clean, most general, nothing extra. (b) $\text{Knows}(\text{John}, x)$ vs. $\text{Knows}(y, \text{Mother}(y))$ → bind $y$ first ($\{y/\text{John}\}$), compose through, then $x/\text{Mother}(\text{John})$ — order matters, generality preserved. (c) $P(x, f(x))$ vs. $P(y, y)$ → $x$ meets $y$, then $f(x)$ meets $x$: **occur-check failure** ($x$ inside its own partner) — unify must refuse, or infinite regress $x = f(x) = f(f(x))\dots$ follows. Success, composition, refusal: the complete trial docket.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| Tell vs. Ask | Add sentences vs. query entailment (KB loop: perceive-Tell, decide-Ask) |
| Entailment vs. derivation | Semantic truth-in-all-models vs. syntactic rule-pushing (soundness + completeness bridge them) |
| Valid vs. satisfiable vs. unsat | All models / some model / no models (refutation needs the third) |
| MP vs. MT vs. fallacies | $P,P\Rightarrow Q\vdash Q$ and contrapositive only — affirming/denying variants invalid |
| Model checking vs. resolution | $2^n$ census (complete, hopeless) vs. refutation proofs (complete, directed) |
| Horn vs. general clauses | ≤1 positive literal (chaining-complete) vs. resolution-only territory |
| Forward vs. backward chaining | Fire-all vs. goal-driven (demand-shaped effort on huge KBs) |
| $\forall$+$\Rightarrow$ vs. $\exists$+$\land$ | Correct pairings; swapped versions state nonsense/vacuities |
| Unify order | Bind-then-compose (early bindings flow into later pairs) |
| Standardize apart | Fresh names per rule-use before every UNIFY (no binding leakage) |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz KB = {A, A⇒B} over atoms {A, B, Z}. How many rows survive model checking, and what does the free atom Z teach about the method's cost?
() 8 rows survive; Z proves model checking is efficient
(*) 2 rows survive ({A,B} true, Z either way); Z doubles rows while changing nothing — model checking prices irrelevant atoms identically to relevant ones, which is exactly why it scales as 2^n
() 0 rows survive; the KB is contradictory
() Z must be deleted from the language first
::: explanation
Filtering keeps only $A \land B$ rows (2 of 8); $Z$'s two values ride along irrelevantly — yet were enumerated and tested. Cost tracks *vocabulary*, not *content*: 10 idle atoms cost $1024\times$ for zero information. Resolution (Scenario 3) never names $Z$ at all — the efficiency gap, quantified.
:::

::: quiz P(x, f(x)) vs. P(y, y): walk the unification to its verdict.
() Succeeds with θ = {x/y} — the nesting is harmless
(*) x meets y (bind), then f(x) meets x — x occurs inside its own partner: occur-check failure, refuse (else infinite regress x = f(x) = f(f(x))…)
() Succeeds with θ = {y/f(y)} by symmetric reasoning
() Unification is undefined for nested terms
::: explanation
After $\{x/y\}$, the second pair is $f(x)$ vs. $x$ — a variable against a term *containing it*. Accepting builds $x = f(x)$, an infinite term no finite structure satisfies. The occur check exists for exactly this shape; Prolog's skipping it (for speed) is a documented unsoundness, not an optimization free lunch.
:::

::: quiz Forward chaining floods all consequences; backward chaining works back from the query. A million-rule KB faces one focused diagnostic question. Which engine and what complexity reality?
() Forward — completeness demands total derivation
(*) Backward — demand-driven grounding explores only goal-relevant rules (potentially logarithmic slice of the KB); forward's linear-in-KB flood is complete but wasteful here
() Neither — million-rule KBs are undecidable in principle
() Both explore identically; the names are historical
::: explanation
Effort follows relevance: backward chaining's recursion visits the query's premise cone only — vast KB regions never load. Forward chaining's virtue (everything derived, query-agnostic reuse) is exactly its cost when one question needs one corner. Engine choice = workload shape, always.
:::

::: quiz Stench at (1,2), visited-safe (1,1), wall at (0,2). A student concludes "Wumpus at (1,3), certainly." Give the correct conclusion with its logical form.
() The student is right — stench pinpoints uniquely
(*) Disjunction $W_{1,3} \lor W_{2,2}$ (candidates after eliminating (1,1) and the wall) — certainty about a *set*, ignorance within it; probing must respect the disjunction (retreat to testable squares, never assume a disjunct)
() No conclusion whatsoever follows from stench
() The Wumpus is certainly at (2,2) by elimination
::: explanation
One percept, two surviving candidates — logic delivers *disjunctive* knowledge honestly instead of guessing. Acting on $W_{1,3}$-certainty risks the $W_{2,2}$ world (death by overconfidence); acting on the disjunction (probe elsewhere, gather more percepts) is rationality under uncertainty — Module 1's moral, wearing Logic's clothes.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (MP/MT and Horn lead); single MGU computations.
* **7 Marks:** Wumpus safety proofs with sentences, refutation traces to □, or UNIFY traces with ordering rationale.
:::

### Essay Question 1 (7 Marks)
**Q: From clauses (¬A∨B), (¬B∨C), (A), prove C by resolution, showing each resolvent and the complementary pair used. Why does □ end the proof?**

**Model Answer:** $(A) \otimes (\lnot A \lor B)$ on $A$/$\lnot A$ → $(B)$. $(B) \otimes (\lnot B \lor C)$ on $B$/$\lnot B$ → $(C)$. $(C) \otimes (\lnot C)$ [negated query] → $\Box$. The empty clause = derived contradiction under the assumption $\lnot C$ alongside the KB — since $KB \land \lnot C$ is unsatisfiable, $KB \models C$ (deduction theorem). □ isn't another fact; it's the *absence* of survivors — proof by "no counter-model left standing."

### Essay Question 2 (7 Marks)
**Q: Unify Knows(John, x) with Knows(y, Mother(y)) showing composition order, and explain why binding y first is load-bearing plus what the occur check would catch in P(x,f(x)) vs P(y,y).**

**Model Answer:** Left-to-right: $y$ vs. $\text{John}$ → $\theta_1 = \{y/\text{John}\}$; compose through remaining problem ($x$ vs. $\text{Mother}(\text{John})$) → $\theta_2 = \{x/\text{Mother}(\text{John})\}$; MGU $\{y/\text{John}, x/\text{Mother}(\text{John})\}$. Binding $y$ first matters because $x$'s partner *contains* $y$ — reversed order over-binds or fails to find the most general form. Occur check: $P(x,f(x))$ vs $P(y,y)$ reduces (after $x/y$) to $x$ vs. $f(x)$ — self-containing partner ⇒ refuse, blocking the infinite regress $x = f(x) = f(f(x))\dots$ that naive unifiers construct.
