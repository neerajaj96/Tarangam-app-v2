---
id: m3_04_first_order_logic_unification_and_lifting
courseCode: PECST522
module: 3
sequence: 4
title: 'First-Order Logic: Quantifiers, Unification & Lifting'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Quantify objects, relations and functions with scope discipline
  - Unify with most general unifiers under the occur check
  - Lift Modus Ponens and chaining from propositional to first-order
concepts:
  - first-order quantification
  - unification
  - lifted inference
prerequisites:
  - m3_02_propositional_logic_syntax_semantics
  - m3_03_inference_resolution_and_horn_clauses
examRelevance: high
tags:
  - logic
  - first-order-logic
---
# First-Order Logic: Quantifiers, Unification & Lifting

**Problem: propositional stamps need one symbol per square — a thousand squares need a thousand symbols. By the end you can write quantified sentences, unify with most general unifiers, and lift inference to First-Order Logic (FOL).**

<a id="start-zero"></a>
## 1. Start From Zero: Stamps vs. Stencil Machine

Propositional logic hand-carves one stamp per fact: Pit(1,2), Pit(1,3), ... First-order logic owns a stencil machine: one quantified sentence `for all x,y: Breeze(x,y) => AdjacentPit(x,y)` stamps the rule everywhere at once.

**Definitions:** **objects** (squares, agents, the Wumpus); **relations/predicates** (Adjacent, At — truth-valued connections); **functions** (LocationOf, LeftOf — each mapping objects to exactly one object); **variables** (x, y — placeholders); **quantifiers**: `∀` ("for all") and `∃` ("there exists," at least one). One FOL sentence routinely replaces exponentially many propositional ones.

::: callout-intuition Core Mental Model: Stamps vs. Stencil Machine
Feel "one template, infinite groundings" here, then drop the machine; quantifier-plus-connective discipline below is the technical content.
:::

**Tiny beginner example:** `∀x (At(x,Cave) => Dark(x))` says every cave square is dark. `∃x (At(x,Cave) ∧ Glitter(x))` says some cave square glitters. Swapping connectives states nonsense (next section) — the most-tested syntax fact.

::: toggle What are `predicate`, `constant`, `variable`, `function`, `∀`, `∃`, `substitution`?
Predicate = truth-valued relation (At, Adjacent — connects objects into claims). Constant = named object (Wumpus, S12 — fixed referent). Variable = placeholder (x, y — ranges over objects). Function = object-to-object map (LeftOf(x) — exactly one output per input, unlike predicates). `∀x` = for every object x (universal — pairs with `=>`). `∃x` = for at least one x (existential — pairs with `∧`). Substitution `θ = {x/A}` = replace x by A everywhere (bindings applied simultaneously, not sequentially — order illusions corrupt proofs).
:::

::: toggle Trace `UNIFY(Knows(John,x), Knows(y,Mother(y)))` substitution by substitution
Same predicate (Knows), same arity (2) — proceed left to right with composition. Pair 1: John vs y → bind y/John (variable-meets-constant; record θ={y/John}). Compose forward: Mother(y) rewrites to Mother(John) *before* pair 2 is compared (early bindings rewrite later pairs — the load-bearing order). Pair 2: x vs Mother(John) → bind x/Mother(John); θ = {y/John, x/Mother(John)}. Occur check passes (no variable inside its own partner). Result is most general: any other unifier (e.g. grounding John further) is this one plus extra commitments. Reverse order (x first) would still work here, but left-to-right-with-composition is the rule that never over-binds.
:::

<a id="basics"></a>
## 2. Basic Layer: Syntax, Semantics, Pairings

**Data/state:** terms (constants like Wumpus, variables like x, functions of terms like LeftOf(x)); atomic sentences (predicate on terms: At(Agent,(1,1))). **Goal:** quantify correctly with scope discipline.

- `∀x P(x)`: true iff P holds for every object. `∃x P(x)`: true iff P holds for at least one. Order matters: `∀x ∃y Loves(x,y)` (everyone loves someone) differs from `∃y ∀x Loves(x,y)` (one universally-loved someone) — the scope swap examiners adore.
- **Correct pairings:** `∀` pairs with `=>` (all cave squares are dark). `∃` pairs with `∧` (some square glitters). Swapped, `∀x (At(x) ∧ Dark(x))` claims everything in the universe is a dark cave square (absurdly strong), and `∃x (At(x) => Glitter(x))` is satisfied by any non-cave object via vacuous truth (uselessly weak).

<a id="formal-model"></a>
## 3. Formal Layer: Unification and Lifted Inference

**Meaning, variables, intuition, formula:** **unification** `UNIFY(p, q)` finds the **most general unifier (MGU)** — variable bindings making `p` and `q` identical while committing to nothing extra. Rules: identical constants unify; variable-anything binds (record var/term) and **composes** through accumulated bindings (early bindings rewrite later pairs); different constants or arity mismatches fail. **Occur check:** x never unifies with a term containing x (else infinite regress x = f(x) = f(f(x)) = ...). Prolog skips it for speed, risking unsound loops — a documented trade, not a free optimization.

::: callout-formula Formal Core: Unification (UNIFY)
Same predicate and arity required. Bind variables minimally, compose substitutions forward, fail on constant/arity clash, refuse self-containing partners via the occur check. Generality preserved by binding-then-composing in order.
:::

**Lifted Modus Ponens:** from `∀v (p1 ∧ ... ∧ pn => q)` plus premises unifiable with every `pi` under one substitution `θ`, infer `qθ` — one step doing infinitely many propositional groundings' work. **FOL forward chaining** matches rules via unification, adding consequents. **FOL backward chaining** (Prolog's engine) unifies goals with rule heads depth-first with backtracking over unifiers.

::: callout-pitfall Standardize Apart Before You Unify
Two rules sharing `x` collide — unrelated bindings fuse silently. **Standardizing apart** (fresh names per use, e.g. x17) before every UNIFY is mandatory hygiene. Most "mysterious wrong bindings" trace here.
:::

**Worked unification:** rule `∀s (Stench(s) => WumpusNear(s))`, fact `Stench(S12)`. Standardize `s` to `s7`. UNIFY `Stench(s7)` with `Stench(S12)`: variable-meets-constant gives `θ = {s7/S12}`. Apply to consequent: `WumpusNear(S12)` — the neighbourhood disjunction in one lifted step. With `Stench(S12, extra)` (arity 2 vs. 1), unification fails immediately — arity mismatch is non-negotiable.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| `∀+=>` vs. `∃+∧` | Correct universal/existential forms vs. swapped nonsense/vacuity |
| MGU vs. any unifier | Least-committing bindings (compose in order) vs. over-bound instances |
| Lifted vs. grounded inference | One template step vs. infinitely many photocopied instances |

**Watch out:** (1) Bind-then-compose order is load-bearing when later terms contain earlier variables. (2) Scope order `∀∃` vs. `∃∀` changes meaning entirely. (3) Skipped occur checks admit cyclic terms.

**Limitations:** full FOL entailment is only semi-decidable (next topic); unification without indexing is expensive; functions create infinite groundings that only lifting tames.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What is the most general unifier of Knows(John, x) and Knows(y, Mother(y)), and why must y bind before the second argument is compared?
() No unifier exists — John and Mother(y) can never match
(*) θ = {y/John, x/Mother(John)} — binding y first lets Mother(y) resolve to Mother(John) before x commits, keeping the substitution maximally general
() θ = {x/John, y/John} — both variables simply take the constant
() θ = {y/Mother(y)} — self-binding is permitted without checks
::: explanation
Left-to-right with composition: y meets John first, rewriting the second pair to x vs. Mother(John). Early commitment in the wrong order over-binds; self-binding is occur-check-forbidden.
:::

::: quiz Which pairing of quantifier and connective is correct, and what goes wrong otherwise?
() ∀ with ∧ is the safe universal form; nothing goes wrong
(*) ∀ pairs with ⇒ ("all cave squares are dark"); ∃ pairs with ∧ ("some square glitters") — swapped, ∀+∧ claims everything is a dark cave-square and ∃+⇒ is trivially true of any non-cave object
() ∃ with ⇒ is the standard existential form
() Quantifiers don't interact with connectives at all
::: explanation
∀+∧ over-claims universally; ∃+=> holds vacuously off-target. Right connective per quantifier or the sentence misfires.
:::

::: quiz Two FOL rules both use variable x. Before unifying a goal against both, what must happen and why?
() Nothing — shared names automatically mean shared values across rules
(*) Standardize apart: rename each rule's variables uniquely, or bindings from one rule leak into the other and corrupt the proof
() Delete one rule to avoid the collision
() Convert both rules to propositional form first
::: explanation
Variable scope is per-rule-use. Fresh names per use cost nothing and prevent cross-rule binding leakage.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: one MGU, pairing rule, or occur check. 7 marks: lifted-Modus-Ponens trace (standardize, UNIFY, apply) or FOL chaining comparison.
:::

**Recap facts examiners reward:** term/atom/quantifier definitions; pairing rule with failure modes; MGU composition order; occur-check regress; standardize-apart hygiene; lifted-MP shape.

### Sample 3-Mark Question
**Q: Find the MGU of Knows(John, x) and Knows(y, Mother(y)).**

**Model Answer:** y vs. John gives {y/John}; composed second pair x vs. Mother(John) gives {x/Mother(John)}. Final {y/John, x/Mother(John)} — y-first is load-bearing.

### Sample 7-Mark Question
**Q: Explain lifted Modus Ponens with the Stench example and the standardize-apart need.**

**Model Answer:** From the universal rule plus unifiable premises under one θ infer qθ — here WumpusNear(S12) in one step. Standardizing apart renames each invocation (x to x17) so coincidental sharing cannot fuse independent bindings; without it derivations go unsound.
:::
