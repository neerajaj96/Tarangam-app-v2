---
id: m3_02_propositional_logic_syntax_semantics
courseCode: PECST522
module: 3
sequence: 2
title: 'Propositional Logic: Syntax, Semantics & Entailment'
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Build sentences with connectives in precedence order
  - Prove entailment by hand on Wumpus fragments with model sets
  - Price truth-table scaling that motivates inference machinery
concepts:
  - propositional syntax
  - model checking
  - validity
prerequisites:
  - m3_01_knowledge_based_agents_and_wumpus_world
examRelevance: medium
tags:
  - logic
  - propositional-logic
---
# Propositional Logic: Syntax, Semantics & Entailment

**Problem: how do we write dungeon knowledge so precisely that safety proofs are mechanical? By the end you can build sentences with correct precedence, test entailment by model sets, and price why truth tables cannot scale.**

<a id="start-zero"></a>
## 1. Start From Zero: Blueprints vs. Buildings

Lego manuals say which brick shapes snap together (form, no meaning). Buildings are what the shapes become (meaning). In logic: **syntax** is the manual (legal sentences), **semantics** is the buildings (each fully-specified world, called a **model** — a true/false assignment to every atomic symbol — either satisfies your sentences or breaks them). **Entailment** (`KB |= alpha`) is the engineer's guarantee: in every KB-satisfying world, the conclusion holds too.

::: callout-intuition Core Mental Model: Blueprints vs. Buildings
Feel "form versus worlds" here, then drop the bricks; connectives plus the model-set definition below are the technical content.
:::

**Tiny beginner example:** atoms `P` (pit at (1,2)), `B` (breeze at (1,1)). Sentence `B => (P-nearby)` is syntax. A model sets `B = true, P-nearby = true` (satisfies) or `B = true, P-nearby = false` (violates). Entailment asks about *all* satisfying models.

<a id="basics"></a>
## 2. Basic Layer: Atoms, Connectives, Precedence

**Data/state:** proposition symbols (indivisible true/false facts like `P`, `Q`, `P(1,2)`). **Goal:** build complex sentences correctly.

Complex sentences via connectives: `¬` (not), `∧` (and), `∨` (or), `=>` (implies), `<=>` (if-and-only-if). **Precedence** tightest-first: `¬`, then `∧`, then `∨`, then `=>`, then `<=>`. So `P ∨ Q => R` parses as `(P ∨ Q) => R`. When in doubt, parenthesize — exams punish precedence slips.

**Implication truth table (memorize):** `P => Q` is false in exactly one row: `P` true with `Q` false (the only broken promise). False premise implies anything (vacuous truth): `P = false` rows are true regardless of `Q`.

<a id="formal-model"></a>
## 3. Formal Layer: Entailment, Validity, and the Wall

**Meaning, variables, formula:** let `M(alpha)` be the set of models where `alpha` is true. **Entailment:** `KB |= alpha` iff `M(KB)` is a subset of `M(alpha)` — every KB-world is an alpha-world (no counterexamples). **Valid (tautology):** true in all models. **Satisfiable:** true in at least one. **Unsatisfiable:** true in none. Bridge (deduction theorem): `KB |= alpha` iff `KB ∧ ¬alpha` is unsatisfiable — the fact resolution exploits next topic.

**Procedure — model checking (TT-ENTAILS?, steps):** Step 1: enumerate all `2^n` assignments (`n` atoms). Step 2: keep rows satisfying every KB sentence. Step 3: entailment holds iff the query holds in every surviving row. Sound and complete — and hopeless past toys: 30 atoms need a billion rows. Entailment is co-NP-complete (a complexity class meaning: counterexamples check fast, but no general fast prover is believed to exist) — hence inference machinery exists.

::: callout-formula Formal Core: Entailment, Validity, Satisfiability
`M(alpha)` = models satisfying alpha. Entailment: `M(KB) ⊆ M(alpha)`. Valid: all models. Satisfiable: some model. Unsatisfiable: none. Refutation bridge: `KB |= alpha` iff `KB ∧ ¬alpha` unsatisfiable.
:::

::: callout-pitfall Implication Is Not Causation (or Equivalence)
From `P => Q` plus `Q`, concluding `P` (affirming the consequent) is invalid. From `¬P`, concluding `¬Q` (denying the antecedent) is invalid. Only **Modus Ponens** (`P => Q`, `P`, therefore `Q`) and **Modus Tollens** (`P => Q`, `¬Q`, therefore `¬P`) are licensed. Two valid moves; every other "obvious" step is a trap.
:::

**Hand proof (Wumpus fragment):** KB: `¬P(1,1)`; `B(1,1) <=> (P(1,2) ∨ P(2,1))`; observed `¬B(1,1)`. Query `¬P(1,2)`. Four atoms give 16 rows; KB facts kill all but `B = false` rows; the biconditional then forces both disjuncts false — query holds in every survivor, so entailed. Four atoms cost 16 rows; a 64-atom dungeon would cost `2^64` — the wall, demonstrated.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Entailment vs. validity | Query true in all KB-worlds vs. true in all worlds outright |
| Satisfiable vs. valid vs. unsat | Some model vs. all models vs. no models (refutation needs the third) |
| Modus Ponens/Tollens vs. fallacies | `P,P=>Q ⊢ Q` and contrapositive only — affirming/denying variants invalid |

**Watch out:** (1) `¬B` observations alone prove nothing about pits under a `B => P` rule (denying the antecedent) — valid pit-freedom needs the biconditional plus silence. (2) Precedence errors re-parse exam sentences. (3) Vacuous truth makes `∃`-with-`=>` style claims trivially true (next module's quantifier trap previews here).

**Limitations:** model checking is exponential (`2^n`); propositional symbols cannot generalize across squares (one stamp per fact) — First-Order Logic (FOL — quantified logic over objects) is the escape.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Which row of the truth table makes P ⇒ Q false, and what does that imply about vacuous truth?
() The row where both are false — implication needs truth on both sides
(*) The row P=true, Q=false — the only broken promise; with a false premise the implication is automatically (vacuously) true
() No row ever falsifies an implication
() The row P=false, Q=true — a true conclusion can't follow a false premise
::: explanation
Only true-premise-with-false-conclusion breaks the promise. False-premise rows hold vacuously — the most-tested truth-table fact.
:::

::: quiz KB ⊨ α holds exactly when which model-set relationship (or satisfiability fact) holds?
() M(α) ⊆ M(KB) — the query's models are fewer
(*) M(KB) ⊆ M(α) — every KB-model is an α-model; equivalently KB ∧ ¬α is unsatisfiable
() M(KB) and M(α) are disjoint
() KB and α share at least one atom symbol
::: explanation
No counterexamples: no KB-world violates alpha. The unsatisfiability phrasing is what resolution mechanizes next.
:::

::: quiz An agent reasons: "If there's a breeze there must be a pit nearby (B ⇒ P-nearby). No breeze here, so no pit nearby." Valid or fallacy, and why?
() Valid — this is Modus Ponens applied correctly
() Valid — this is Modus Tollens applied correctly
(*) Fallacy — denying the antecedent: from ¬B nothing follows about P-nearby under this rule alone (the rule constrains breezy squares, not calm ones)
() Fallacy — affirming the consequent, because the agent observed a conclusion
::: explanation
Modus Tollens needs ¬Q to conclude ¬P. Here the observation denies the antecedent, which the rule leaves silent. The valid twin runs through ¬P-facts, not ¬B-observations.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: precedence, implication table, or entailment/validity/satisfiability definitions. 7 marks: model-checking proof on a Wumpus fragment with the scaling verdict.
:::

**Recap facts examiners reward:** `¬ ∧ ∨ => <=>` order; one falsifying row; `M(KB) ⊆ M(alpha)`; `2^n` wall with a 16-row hand proof.

### Sample 3-Mark Question
**Q: State connective precedence and when P => Q is false.**

**Model Answer:** Tightest: ¬, ∧, ∨, =>, <=>. False exactly when P true and Q false; other three rows true.

### Sample 7-Mark Question
**Q: Prove (1,2) pit-free by model checking. Why impractical generally?**

**Model Answer:** 16 assignments over four atoms; discard rows violating each KB sentence; ¬P(1,2) in every survivor gives entailment. Impractical since rows double per atom (2^n): 64 atoms need ~10^19 rows — sound, complete, unusable, motivating resolution.
:::
