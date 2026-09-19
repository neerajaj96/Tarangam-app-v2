---
id: m3_05_propositional_vs_fol_inference
courseCode: PECST522
module: 3
sequence: 5
title: Propositional vs First-Order Inference
difficulty: beginner
estimatedMinutes: 4
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

**Grounding blowup quantified, lifted inference as the escape, decidability contrast stated plainly — the syllabus comparison as its own topic.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Photocopy Shop vs Master Template
Propositional inference **photocopies** every first-order rule for every object combo (grounding), then reasons over the paper mountain. Lifted inference reasons from the **master template** directly — one UNIFY step doing the work of infinitely many photocopies. Templates beat mountains whenever objects multiply; mountains win only when objects are few and templates tangled.
:::

M3.2–M3.3 built the paper mountain (models, resolution); M3.4 cut the master-template tools (UNIFY, lifted Modus Ponens, FOL chaining) — this topic prices the two against each other.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Grounding arithmetic

A FOL KB with $p$ predicate symbols of max arity $k$ over $d$ constants grounds to $\approx p \cdot d^k$ atoms: $2$ binary predicates and $10$ constants already yield $200$ atoms and $2^{200}$ models — model checking (M3.2) dies standing, and propositional resolution drowns in clauses it never needed. Lifted rules (generalized Modus Ponens, FOL-FC/BC with UNIFY) sidestep the mountain by binding variables only as the proof demands.

### 2.2 Decidability and practice

Propositional entailment is **decidable** (co-NP-complete — exponential worst case, but an answer always arrives). FOL entailment is only **semi-decidable**: complete procedures confirm entailment eventually, but may loop forever on non-entailed queries. Practice: Datalog-style restricted FOL regains decidability; Prolog's backward chaining trades completeness (depth-first, no occur-check) for speed.

::: callout-formula KTU Formula Vault: PL vs FOL
Grounding $\approx p \cdot d^k$ atoms · PL decidable (co-NP-complete) · FOL semi-decidable (loops possible on NO) · lift with UNIFY, restrict (Datalog) or trade (Prolog) to cope.
:::

Lifting is not free magic: full FOL resolution still needs factoring, subsumption, and strategy — the mountain shrinks to a hill, and hills still need climbing gear.

::: callout-pitfall Grounding as a "Solution"
An option proposing "ground then use propositional resolution" as the efficient FOL method mistakes a *reduction proof* for an algorithm. Grounding is the baseline that proves FOL *can* be handled — lifted inference is what handles it affordably.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
KB: $\forall x\; (\text{Cat}(x) \Rightarrow \text{Mammal}(x))$, fact $\text{Cat}(\text{Tom})$, query $\text{Mammal}(\text{Tom})$ — with $9$ more cats in the KB ($10$ constants). Count the grounding versus the lifted proof.
:::

::: step [Step 2: Execution] Mountain vs Template
Grounding instantiates the rule $10$ times ($\text{Cat}(\text{Tom}) \Rightarrow \text{Mammal}(\text{Tom})$, $\dots$) plus $20$ atoms — then Modus Ponens fires on the Tom instance. Lifted Modus Ponens unifies $\text{Cat}(x)$ with $\text{Cat}(\text{Tom})$, $\theta = \{x/\text{Tom}\}$, and concludes in **one** step touching **one** fact. With function symbols (e.g. $\text{Father}(x)$) grounding is infinite — photocopies without end — while lifting still takes one step.
:::

::: step [Step 3: Conclusion] Final Result
$10$ ground instances (finite case) or infinitely many (functions) versus $1$ lifted step. The exam moral: quote $p \cdot d^k$ for the mountain, UNIFY-once for the escape, functions for the kill-shot proving grounding cannot always work.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Grounding Arithmetic
$3$ binary predicates, $5$ constants. Ground atoms?
(A) $15$, predicates times constants
(*B) $3 \times 5^2 = 75$ — each binary predicate spans all ordered pairs, so arity exponentiates, and $2^{75}$ models already bury model checking
(C) $3^5 = 243$
(D) $8$, binary means two
::: explanation
Arity is the exponent: $d^k$ combos per predicate ($25$ pairs here), times $p$ predicates. Linear intuitions ($15$) miss the square — arity-driven blowup is the whole argument for lifting.
:::

::: quiz Q2: Decidability Sorting
"PL entailment always terminates; FOL procedures may loop on some inputs." Precise?
(A) Both always terminate
(*B) Yes — PL is decidable (answer guaranteed), FOL only semi-decidable: YES-instances confirmed in finite time, NO-instances may loop forever, which no strategy fixes in general
(C) FOL always terminates faster
(D) Decidability is about memory, not time
::: explanation
Semi-decidable means one-sided guarantee: proofs arrive, refutations may not. A looping prover on a NO-query is not buggy, it is bumping the theory ceiling — restrict the logic (Datalog) to lower it.
:::

::: quiz Q3: Prolog Bargain
Prolog drops the occur check and searches depth-first. What did it trade?
(A) Nothing, pure gain
(*B) Completeness and soundness corners for speed — depth-first can loop where breadth would succeed, and missing occur-check admits unsound unifications, buying industrial pace with theoretical dents
(C) It gained completeness
(D) Syntax only, semantics untouched
::: explanation
Real systems spend theory to buy speed: DFS risks infinite branches, skipped occur-check risks cyclic bindings. Knowing the dents (and when they bite) is the honest Prolog story — and a recurring 3-marker.
:::
