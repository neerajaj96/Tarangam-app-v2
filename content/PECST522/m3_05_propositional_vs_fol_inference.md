---
id: m3_05_propositional_vs_fol_inference
courseCode: PECST522
module: 3
sequence: 5
title: Propositional vs First-Order Inference
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Quantify grounding blowup against propositional decidability
  - Escape with lifted inference, Datalog limits or Prolog trades
  - State the semi-decidability contrast plainly for comparisons
concepts:
  - grounding blowup
  - decidability contrast
prerequisites:
  - m3_03_inference_resolution_and_horn_clauses
  - m3_04_first_order_logic_unification_and_lifting
examRelevance: medium
tags:
  - logic
  - inference-comparison
---
# Propositional vs First-Order Inference

**Problem: grounding (photocopying every rule for every object) proves FOL can be handled — but can it be afforded? By the end you can price grounding blowup, state the decidability contrast, and choose lifting, restriction, or Prolog's trade.**

<a id="start-zero"></a>
## 1. Start From Zero: Photocopy Shop vs. Master Template

Propositional inference photocopies each first-order rule for every object combo (grounding), then reasons over the paper mountain. Lifted inference reasons from the master template directly — one UNIFY step doing infinitely many photocopies' work. Templates beat mountains whenever objects multiply.

**Definitions:** **grounding** instantiates all variables with all constants. **Lifted inference** binds variables only as proofs demand (generalized Modus Ponens, FOL forward/backward chaining with UNIFY). **Decidable** means an answer always arrives in finite time. **Semi-decidable** means yes-instances are confirmed in finite time but no-instances may loop forever.

::: callout-intuition Core Mental Model: Photocopy Shop vs Master Template
Feel "mountain versus template" here, then drop the shop; grounding arithmetic plus decidability below are the technical content.
:::

**Tiny beginner example:** rule `Cat(x) => Mammal(x)` with 10 cats grounds to 10 copies plus 20 atoms — then fires on Tom. Lifted Modus Ponens unifies once (`x/Tom`) and concludes in one step touching one fact.

<a id="basics"></a>
## 2. Basic Layer: Grounding Arithmetic

**Data/state:** `p` predicate symbols of max arity `k` over `d` constants. **Goal:** count the mountain.

**Meaning, variables, formula:** each `k`-ary predicate spans all ordered `k`-tuples (`d^k` combos); times `p` predicates:

$$\text{ground atoms} \approx p \cdot d^k$$

Tiny numbers: 2 binary predicates over 10 constants give 200 atoms and `2^200` models — model checking dies standing, propositional resolution drowns in never-needed clauses. With function symbols (e.g. Father(x)), grounding is infinite — photocopies without end — while lifting still takes one step.

<a id="formal-model"></a>
## 3. Formal Layer: Decidability and Practice

**Decidability contrast (qualified):** propositional entailment is **decidable** (co-NP-complete: exponential worst case, but an answer always arrives). FOL entailment is only **semi-decidable**: complete procedures confirm entailed queries eventually but may loop forever on non-entailed ones — no strategy fixes this in general (a theory ceiling, not a bug).

**Practical escapes:** **Datalog-style restricted FOL** (no functions, constrained rules) regains decidability. **Prolog's backward chaining** trades completeness (depth-first search can loop where breadth succeeds) and soundness corners (skipped occur check admits cyclic unifications) for industrial speed. Lifting itself needs factoring, subsumption, and strategy — the mountain shrinks to a hill that still needs climbing gear.

::: callout-formula KTU Formula Vault: PL vs FOL
Grounding approx `p * d^k` atoms. PL decidable (co-NP-complete). FOL semi-decidable (NO-answers may loop). Cope by lifting with UNIFY, restricting (Datalog), or trading (Prolog).
:::

::: callout-pitfall Grounding as a "Solution"
"Ground then use propositional resolution" is a reduction proof that FOL can be handled — not an efficient algorithm. Lifted inference is what handles it affordably. Options proposing grounding as the efficient method confuse existence with tractability.
:::

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Grounding vs. lifting | Exhaustive instantiation (complete, explosive) vs. demand-bound templates (affordable) |
| Decidable vs. semi-decidable | Both answers guaranteed vs. yes-only guaranteed (no-queries may loop) |
| Datalog vs. Prolog coping | Restrict the logic (decidability back) vs. trade theory corners (speed now) |

**Watch out:** (1) Arity exponentiates (`d^k`), predicates multiply (`p*`) — linear intuitions miss the square. (2) A looping prover on a NO-query is bumping theory, not buggy. (3) Prolog's dents (DFS loops, missing occur check) are recurring 3-mark material.

**Limitations:** lifting does not restore decidability; Datalog restricts expressiveness; Prolog sacrifices guarantees. Choose by workload: few objects tolerate grounding, many objects demand templates, infinite (functional) domains forbid grounding entirely.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Q1: Grounding Arithmetic
3 binary predicates, 5 constants. Ground atoms?
(A) 15, predicates times constants
(*B) 3 × 5^2 = 75 — each binary predicate spans all ordered pairs, so arity exponentiates, and 2^75 models already bury model checking
(C) 3^5 = 243
(D) 8, binary means two
::: explanation
Arity is the exponent: d^k combos per predicate (25 pairs), times p predicates. Linear guesses miss the square — the whole argument for lifting.
:::

::: quiz Q2: Decidability Sorting
"PL entailment always terminates; FOL procedures may loop on some inputs." Precise?
(A) Both always terminate
(*B) Yes — PL is decidable (answer guaranteed), FOL only semi-decidable: YES-instances confirmed in finite time, NO-instances may loop forever, which no strategy fixes in general
(C) FOL always terminates faster
(D) Decidability is about memory, not time
::: explanation
Semi-decidable is a one-sided guarantee: proofs arrive, refutations may not. Restrict the logic (Datalog) to lower the ceiling.
:::

::: quiz Q3: Prolog Bargain
Prolog drops the occur check and searches depth-first. What did it trade?
(A) Nothing, pure gain
(*B) Completeness and soundness corners for speed — depth-first can loop where breadth would succeed, and missing occur-check admits unsound unifications, buying industrial pace with theoretical dents
(C) It gained completeness
(D) Syntax only, semantics untouched
::: explanation
Real systems spend theory for speed. Knowing the dents and when they bite is the honest Prolog story.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: grounding count, decidability contrast, or Prolog trade. 7 marks: Cat/Tom mountain-vs-template with functions as the kill-shot.
:::

**Recap facts examiners reward:** `p*d^k` with one worked power; PL-decidable vs. FOL-semi-decidable with loop direction; UNIFY-once escape; function symbols making grounding infinite.

### Sample 3-Mark Question
**Q: State the grounding count and decidability contrast.**

**Model Answer:** ~p*d^k atoms (arity exponentiates). PL entailment decidable (answer guaranteed); FOL only semi-decidable (yes confirmed, no may loop).

### Sample 7-Mark Question
**Q: Contrast grounding with lifting on Cat(x)=>Mammal(x) with 10 cats, plus functions.**

**Model Answer:** Grounding instantiates 10 copies plus atoms then fires on Tom; lifting unifies x/Tom once. With Father(x), grounding is infinite while lifting stays one step — photocopies without end versus one template application.
:::
