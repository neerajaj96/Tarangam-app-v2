---
id: m3_03_inference_resolution_and_horn_clauses
courseCode: PECST522
module: 3
sequence: 3
title: 'Inference: Resolution, Horn Clauses & Chaining'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Prove by refutation with CNF conversion to the empty clause
  - Restrict to Horn form for complete forward and backward chaining
  - Trace chaining to goals on Wumpus fragments
concepts:
  - resolution refutation
  - Horn clauses
  - forward-backward chaining
prerequisites:
  - m3_01_knowledge_based_agents_and_wumpus_world
  - m3_02_propositional_logic_syntax_semantics
examRelevance: high
tags:
  - logic
  - inference
---
# Inference: Resolution, Horn Clauses & Chaining

**Problem: truth tables are exponential — can proofs replace the census? By the end you can convert to CNF (Conjunctive Normal Form), resolve to the empty clause, and trace Horn chaining.**

<a id="start-zero"></a>
## 1. Start From Zero: Courtroom vs. Census

Model checking is a census: visit all `2^n` worlds and count. Theorem proving is a courtroom: start from admitted evidence and apply airtight rules until the verdict falls out — never visiting the worlds. Resolution is the courtroom's single gavel: one rule that, with the right setup, derives any entailed sentence. Chaining is the fast-track court for well-behaved (Horn) evidence.

::: callout-intuition Core Mental Model: Courtroom vs. Census
Feel "proofs instead of enumeration" here, then drop the court; CNF plus the resolution rule below are the technical content.
:::

**Tiny beginner example:** from `(P)` and `(¬P ∨ Q)`, resolve on `P/¬P` to get `(Q)` — Modus Ponens in disguise, with zero worlds visited.

<a id="basics"></a>
## 2. Basic Layer: CNF and the Resolution Rule

**Data/state:** clauses (disjunctions of literals; a **literal** is an atom or its negation). **Goal:** derive contradiction from KB plus negated query.

**CNF (Conjunctive Normal Form)** means a conjunction (AND) of clauses, each clause a disjunction (OR) of literals. Conversion pipeline (steps): Step 1: eliminate `<=>` (`P <=> Q` becomes `(P => Q) ∧ (Q => P)`) and `=>` (`P => Q` becomes `¬P ∨ Q`). Step 2: push `¬` inward (de Morgan laws plus double negation). Step 3: distribute `∨` over `∧`.

**Resolution rule (one rule):** from clauses sharing a complementary pair (`l` and `¬l`), infer the **resolvent** — everything except the cancelled pair. Unit special case above is the workhorse.

**Refutation proof of `KB |= alpha` (steps):** Step 1: convert `KB ∧ ¬alpha` to CNF. Step 2: resolve repeatedly. Step 3: deriving the **empty clause** (written as a box — a contradiction with nothing left) proves entailment, since `KB |= alpha` iff `KB ∧ ¬alpha` is unsatisfiable. Resolution is sound and **refutation-complete** (qualified: if entailment holds, the empty clause will appear — it is not complete for deriving arbitrary non-contradictory sentences directly). Price: worst-case exponential search for pairings.

::: callout-formula Formal Core: Resolution in 3 Lines
Resolve complementary literals, keep the rest. Prove alpha by refuting ¬alpha: CNF(KB ∧ ¬alpha) through resolvents to the empty box. Complete for refutation over full propositional logic.
:::

<a id="formal-model"></a>
## 3. Formal Layer: Horn Clauses and Chaining

**Meaning, variables, definition:** a **Horn clause** has at most one positive (un-negated) literal — equivalently an implication of positive premises `P1 ∧ ... ∧ Pk => Q`. A **definite clause** has exactly one positive head; a bare fact `Q` is the k=0 case. Counting test: circle un-negated atoms; more than one means non-Horn. The Wumpus `B => (P1 ∨ P2)` is non-Horn (two positives) — but danger-style Horn rules dominate practical KBs because they unlock linear-time chaining.

- **Forward chaining (data-driven):** fire every rule whose premises are known; repeat until the query appears or nothing new fires. Complete for Horn KBs, linear in KB size — rediscovers everything.
- **Backward chaining (goal-driven):** start from the query; recursively prove each premise (facts succeed, rules recurse). Touches only relevant rules — demand-driven. Basis of Prolog (a logic programming language).

::: callout-pitfall Horn Means ≤1 Positive Literal — Count Carefully
`(A ∨ ¬B ∨ ¬C)` is Horn (one positive: A); `(A ∨ B ∨ ¬C)` is not (two positives). Neither chaining algorithm is complete outside Horn — that territory belongs to resolution alone.
:::

**Refutation trace (Wumpus telling with a draft):** clauses C1 `(¬B ∨ P12 ∨ P21)` (breeze rule), C2 `(¬P12)` (probed safe), C3 `(B)` (observed breeze), query `P12 ∨ P21` (pit neighbours (1,1)). Negated query adds `(¬P12)` (reused) and `(¬P21)`. C1 with C3 on B gives `(P12 ∨ P21)`; with C2 on P12 gives `(P21)`; with `(¬P21)` gives the empty box. Contradiction derived — query entailed: a pit must neighbour (1,1), here (2,1).

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Resolution vs. chaining | Refutation-complete generally (exponential worst case) vs. linear but Horn-only complete |
| Forward vs. backward chaining | Fire-all (reusable flood) vs. goal-driven (focused slice, Prolog's engine) |
| Horn vs. general clauses | ≤1 positive (chaining-safe) vs. resolution-only territory |

**Watch out:** (1) Resolution needs CNF first — implications resolve nothing directly. (2) Chaining on non-Horn silently misses entailed conclusions. (3) The empty box is absence-of-survivors, not another fact.

**Limitations:** resolution proof search explodes worst-case; Horn restriction forbids natural disjunctive rules; chaining still needs the KB in Horn form (conversion can itself blow up).

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz To prove KB ⊨ α by resolution, what exact set do you convert to CNF and what terminal symbol ends the proof?
() CNF(KB) alone, ending when α appears verbatim as a clause
(*) CNF(KB ∧ ¬α), ending with the empty clause □ (a derived contradiction)
() CNF(¬KB ∧ α), ending with a tautology clause
() No conversion needed; resolution works directly on implications
::: explanation
Assume the query false alongside the KB and derive impossibility. The empty box certifies no counter-model exists — anything else proves nothing.
:::

::: quiz Which clause is NOT Horn, and what breaks if you feed it to a chaining engine?
() (¬A ∨ ¬B ∨ C) — breaks nothing; it is Horn
(*) (A ∨ B ∨ ¬C) — two positive literals; chaining is incomplete outside Horn, so entailed conclusions can be silently missed
() (¬A ∨ ¬B ∨ ¬C) — a goal clause; breaks nothing
() (A) — a unit fact; the engine's favorite food
::: explanation
Horn allows at most one un-negated atom. Chaining's completeness proof assumes Horn form; outside it, use resolution.
:::

::: quiz Forward chaining fires every applicable rule each round; backward chaining starts from the query. When is backward chaining the clear winner?
() When the KB is tiny enough to memorize entirely
(*) When the query needs only a small relevant slice of a huge KB — it explores goal-relevant rules instead of re-deriving all consequences
() When the KB is non-Horn and resolution is unavailable
() Backward chaining never wins; it is strictly slower
::: explanation
Forward floods every derivable fact; backward is demand-driven on the query's premise cone — decisive on million-rule KBs with focused questions.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: resolution rule, Horn definition, or chaining contrast. 7 marks: full refutation to the box or a chaining trace.
:::

**Recap facts examiners reward:** CNF pipeline; complementary-pair resolvent; `KB ∧ ¬alpha`-to-box method with refutation-completeness qualification; Horn count test; forward/backward effort shapes.

### Sample 3-Mark Question
**Q: State the resolution rule and its application condition.**

**Model Answer:** From clauses with a complementary pair l/¬l, infer the disjunction of all remaining literals. One pair per step; the empty box signals contradiction.

### Sample 7-Mark Question
**Q: Prove by resolution that a pit neighbours (1,1) on the §3 KB.**

**Model Answer:** CNF clauses as listed; C1 with C3 gives (P12 ∨ P21); with (¬P12) gives (P21); with (¬P21) gives the box. Refutation complete, entailment proven, survivor history even locates the pit.
:::
