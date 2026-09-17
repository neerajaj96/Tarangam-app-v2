# First-Order Logic: Quantifiers, Unification & Lifting

**Objects, relations, and functions; ∀/∃ semantics; most general unifiers with the occur check; lifting Modus Ponens and chaining to FOL.**

<a id="the-intuition"></a>
## 1. From Propositions to Predicates

::: callout-intuition Core Mental Model: Stamps vs. Stencil Machine
Propositional logic hand-carves one stamp per fact: $\text{Pit}_{1,2}$, $\text{Pit}_{1,3}$, $\text{Pit}_{2,1}$ … — a thousand squares need a thousand stamps. **First-order logic owns a stencil machine**: one quantified sentence $\forall x,y\; \text{Breeze}(x,y) \Rightarrow \text{AdjacentPit}(x,y)$ stamps the rule onto *every* square at once. **Objects** (squares, agents, the Wumpus), **relations** ($\text{Adjacent}$, $\text{At}$), and **functions** ($\text{LocationOf}$, $\text{LeftOf}$ — each mapping objects to exactly one object) replace flat atoms; **variables** ($x, y$) plus **quantifiers** ($\forall$ "for all", $\exists$ "there exists") supply the generality. One FOL sentence routinely replaces exponentially many propositional ones.
:::

---

<a id="the-dimensions"></a>
## 2. Syntax and Semantics in One Pass

* **Terms:** constants (`Wumpus`, `A`), variables (`x`), or functions of terms (`LeftOf(x)`).
* **Atomic sentences:** predicate applied to terms: $\text{At}(\text{Agent}, (1,1))$, $\text{Adjacent}((1,2),(2,2))$.
* **Quantified sentences:** $\forall x\; P(x)$ (true iff $P$ holds for *every* object), $\exists x\; P(x)$ (true iff $P$ holds for *at least one*). Order matters: $\forall x\, \exists y\; \text{Loves}(x,y)$ ("everyone loves someone") $\neq$ $\exists y\, \forall x\; \text{Loves}(x,y)$ ("someone is loved by all") — the classic scope swap examiners adore.
* **Standard pitfall shapes:** $\forall x\; (\text{At}(x,\text{Cave}) \Rightarrow \text{Dark}(x))$ is the correct "all cave squares are dark" ($\forall$ pairs with $\Rightarrow$); $\exists x\; (\text{At}(x,\text{Cave}) \land \text{Glitter}(x))$ is "some cave square glitters" ($\exists$ pairs with $\land$). Swapping the connective ($\forall$+$\land$, $\exists$+$\Rightarrow$) states near-nonsense — the single most-tested FOL syntax fact.

::: callout-formula Formal Core: Unification (UNIFY)
$\text{UNIFY}(p, q)$ returns the **most general unifier (MGU)** $\theta$ — variable bindings making $p\theta = q\theta$ while committing to *nothing extra*. Rules: identical constants unify; variable–anything unifies (record $var/term$) and **compose** through all accumulated bindings; two different constants/arity-mismatches **fail**. **Occur check:** $x$ never unifies with a term *containing* $x$ (else infinite regress: $x = f(x) = f(f(x)) = \dots$). Skipping it (as Prolog does, for speed) risks unsound loops.
:::

---

<a id="terminology"></a>
## 3. Lifting Inference to FOL

**Lifted Modus Ponens:** from $\forall \vec{v}\; (p_1 \land \dots \land p_n \Rightarrow q)$ and premises $p_i'$ with a *single* $\theta$ unifying every $p_i$ with $p_i'$, infer $q\theta$ — one rule application doing the work of infinitely many propositional groundings. **Forward chaining** (FOL-FC) matches rules against known facts via unification, adding consequents until the query grounds out; **backward chaining** (FOL-BC, Prolog's engine) recursively unifies the goal with rule heads, proving premises depth-first with backtracking over alternative unifiers.

::: callout-pitfall Standardize Apart Before You Unify
Two rules sharing a variable name ($x$ in both) will collide during unification — silently merging unrelated bindings. **Standardizing apart** (renaming each rule-use's variables uniquely, e.g. $x_{17}$) is mandatory hygiene before every UNIFY call. Nearly every "mysterious wrong binding" in tracing questions traces back here.
:::

---

<a id="worked-example"></a>
## 4. Unifying to Fire a Rule

KB rule: $\forall s\; (\text{Stench}(s) \Rightarrow \text{WumpusNear}(s))$. Known fact: $\text{Stench}(S_{12})$ (stench sensed at square (1,2)).

Standardize apart: the rule's $s$ becomes $s_7$ (fresh, collision-proof). UNIFY premise $\text{Stench}(s_7)$ with fact $\text{Stench}(S_{12})$: same predicate, same arity; $s_7$ is a variable meeting a constant → $\theta = \{s_7/S_{12}\}$. Apply $\theta$ to the consequent: $\text{WumpusNear}(S_{12})$ — the Wumpus is constrained to $(1,2)$'s neighborhood, i.e. the $W_{1,3} \lor W_{2,2}$-style disjunction of this module's first topic, derived by *one lifted step* instead of a page of propositional clauses. Had the fact instead been $\text{Stench}(S_{12}, \text{extra})$ (arity 2 vs 1), unification would **fail** immediately — arity mismatch is non-negotiable.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz What is the most general unifier of Knows(John, x) and Knows(y, Mother(y)), and why must y bind before the second argument is compared?
() No unifier exists — John and Mother(y) can never match
(*) θ = {y/John, x/Mother(John)} — binding y first lets Mother(y) resolve to Mother(John) before x commits, keeping the substitution maximally general
() θ = {x/John, y/John} — both variables simply take the constant
() θ = {y/Mother(y)} — self-binding is permitted without checks
::: explanation
Unify left-to-right, composing as you go: $y$ meets $\text{John}$ → $\theta = \{y/\text{John}\}$; apply it through the accumulated substitution, so the second pair is $x$ vs. $\text{Mother}(\text{John})$ → add $x/\text{Mother}(\text{John})$. Committing $x$ early (option C) over-binds; self-binding (option D) is exactly what the occur check forbids.
:::

::: quiz Which pairing of quantifier and connective is correct, and what goes wrong otherwise?
() ∀ with ∧ is the safe universal form; nothing goes wrong
(*) ∀ pairs with ⇒ ("all cave squares are dark"); ∃ pairs with ∧ ("some square glitters") — swapped, ∀+∧ claims everything is a dark cave-square and ∃+⇒ is trivially true of any non-cave object
() ∃ with ⇒ is the standard existential form
() Quantifiers don't interact with connectives at all
::: explanation
$\forall x\; (\text{At}(x) \land \text{Dark}(x))$ asserts *every object in the universe* is a dark cave square — absurdly strong. $\exists x\; (\text{At}(x) \Rightarrow \text{Glitter}(x))$ is satisfied by *any* non-cave object (false antecedent) — vacuously, uselessly true. Right connective per quantifier, or the sentence means something unintended.
:::

::: quiz Two FOL rules both use variable x. Before unifying a goal against both, what must happen and why?
() Nothing — shared names automatically mean shared values across rules
(*) Standardize apart: rename each rule's variables uniquely, or bindings from one rule leak into the other and corrupt the proof
() Delete one rule to avoid the collision
() Convert both rules to propositional form first
::: explanation
Variable scope is per-rule-use; the $x$ in rule A and the $x$ in rule B are unrelated. Unifying without renaming fuses them into one variable, so a binding forced by rule A silently constrains rule B — the classic source of "correct rules, insane derivation." Fresh names per use ($x_1, x_2, \dots$) cost nothing and prevent everything.
:::

---

<a id="exam-focus"></a>
## 6. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** MGU of two given expressions, ∀/∃ connective pairing, or the occur check.
* **7 Marks:** Lifted Modus Ponens trace (standardize apart → UNIFY → apply θ), or FOL forward/backward chaining comparison.
:::

### Sample 3-Mark Question
**Q: Find the MGU of Knows(John, x) and Knows(y, Mother(y)), showing composition order.**

**Model Answer:** Compare argument-wise: first pair $y$ vs. $\text{John}$ gives $\theta_1 = \{y/\text{John}\}$. Compose $\theta_1$ into the remaining problem: second pair becomes $x$ vs. $\text{Mother}(\text{John})$, giving $\theta_2 = \{x/\text{Mother}(\text{John})\}$. Final MGU $\theta = \{y/\text{John},\, x/\text{Mother}(\text{John})\}$ — binding $y$ first is load-bearing, since $x$'s partner contains $y$.

### Sample 7-Mark Question
**Q: Explain lifted Modus Ponens with an example. Why is standardizing apart necessary?**

**Model Answer:** Lifted MP: from $\forall \vec{v}\; (p_1 \land \dots \land p_n \Rightarrow q)$ plus facts $p_i'$ unifiable with every $p_i$ under one $\theta$, infer $q\theta$ — e.g. the §4 Stench derivation in a single step. Standardizing apart renames each rule invocation's variables ($x \to x_{17}$) so that coincidental name-sharing between rules cannot fuse independent bindings; without it, one rule's committed substitution corrupts another's unification and the derivation goes unsound.
