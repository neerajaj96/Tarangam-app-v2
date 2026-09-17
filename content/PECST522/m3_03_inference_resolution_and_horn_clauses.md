# Inference: Resolution, Horn Clauses & Chaining

**CNF conversion, the resolution rule and refutation proofs, Horn form, and forward vs. backward chaining with the Wumpus agent.**

<a id="the-intuition"></a>
## 1. From Truth Tables to Proofs

::: callout-intuition Core Mental Model: Courtroom vs. Census
Model checking is a **census**: interrogate every possible world ($2^n$ of them) and count. **Theorem proving** is a **courtroom**: start from admitted evidence (the KB) and apply airtight rules until the verdict falls out — never visiting the worlds at all. Resolution is the courtroom's single gavel: one rule, applied relentlessly, that can derive *any* entailed sentence (given the right setup). Chaining is the fast-track court for well-behaved (Horn) evidence.
:::

---

<a id="the-dimensions"></a>
## 2. CNF and the Resolution Rule

**Conjunctive Normal Form:** a conjunction of **clauses**, each clause a disjunction of **literals** (an atom or its negation): $(A \lor \lnot B) \land (B \lor C) \land (\lnot C)$. Conversion pipeline — **eliminate** $\Leftrightarrow$ ($P \Leftrightarrow Q \to (P \Rightarrow Q) \land (Q \Rightarrow P)$) and $\Rightarrow$ ($P \Rightarrow Q \to \lnot P \lor Q$), **push** $\lnot$ inward (de Morgan + double negation), **distribute** $\lor$ over $\land$.

**The resolution rule** (one rule to derive them all): from $(l_1 \lor \dots \lor l_k)$ and $(m_1 \lor \dots \lor m_n)$ where $l_i$ and $m_j$ are **complementary** ($l_i = \lnot m_j$), infer the **resolvent** — the disjunction of everything *except* the cancelled pair. Unit-clause special case: from $(P)$ and $(\lnot P \lor Q)$, infer $(Q)$ — Modus Ponens in disguise.

**Refutation proof of $KB \models \alpha$:** convert $KB \land \lnot\alpha$ to CNF, resolve repeatedly — deriving the **empty clause** $\Box$ (a contradiction) *proves* entailment (recall: $KB \models \alpha \iff KB \land \lnot\alpha$ unsatisfiable). Resolution is **sound** and **refutation-complete**: if entailment holds, the empty clause *will* appear.

::: callout-formula Formal Core: Resolution in 3 Lines
**Resolve** complementary literals, keep the rest: $\frac{(l \lor C),\; (\lnot l \lor D)}{(C \lor D)}$. **Prove** $\alpha$ by refuting $\lnot\alpha$: CNF($KB \land \lnot\alpha$) $\leadsto \cdots \leadsto \Box$. **Complete** for full propositional logic — the price is worst-case exponential search for the right pairings.
:::

---

<a id="terminology"></a>
## 3. Horn Clauses: Chaining Territory

A **Horn clause** has *at most one positive* literal — equivalently, an implication with a conjunction of positive premises: $(P_1 \land \dots \land P_k) \Rightarrow Q$ (a **definite clause** when exactly one positive head exists; a bare fact $Q$ is the $k=0$ case). The Wumpus rule $B_{1,1} \Rightarrow (P_{1,2} \lor P_{2,1})$ is **not** Horn (two positives) — but $P_{1,2} \land P_{2,1} \Rightarrow \text{Danger}$-style rules are, and most practical KBs are written Horn on purpose, because Horn unlocks linear-time chaining:

* **Forward chaining (data-driven):** fire every rule whose premises are all known; repeat until the query appears or nothing new fires. Complete for Horn KBs, linear in KB size — the honest detective rediscovering *everything* from the evidence.
* **Backward chaining (goal-driven):** start from the query; recursively prove each premise (facts succeed instantly, rules recurse). Touches only relevant rules — the lazy genius working backward from the verdict. Basis of Prolog.

::: callout-pitfall Horn Means ≤1 Positive Literal — Count Carefully
$(A \lor \lnot B \lor \lnot C)$ is Horn (one positive: $A$); $(A \lor B \lor \lnot C)$ is **not** (two positives). Students miscount under time pressure — circle the *un-negated* atoms and count those. And neither chaining algorithm is complete for *non*-Horn KBs: that territory belongs to resolution alone.
:::

---

<a id="worked-example"></a>
## 4. Refuting Our Way to a Safe Square

KB (clausal): $C_1: (\lnot B_{1,1} \lor P_{1,2} \lor P_{2,1})$ [breeze rule, $\Rightarrow$-eliminated] · $C_2: (\lnot P_{1,2})$ [probed safe] · $C_3: (B_{1,1})$ [observed breeze at (1,1)... in *this* telling the agent felt a draft]. Query: is there a pit nearby — $\alpha = (P_{1,2} \lor P_{2,1})$?

Negate the query: $\lnot\alpha = (\lnot P_{1,2}) \land (\lnot P_{2,1})$ — add $C_4: (\lnot P_{1,2})$ (already $C_2$, reused) and $C_5: (\lnot P_{2,1})$. Resolve $C_1$ with $C_3$ on $B_{1,1}$ → $(P_{1,2} \lor P_{2,1})$; resolve with $C_4$ on $P_{1,2}$ → $(P_{2,1})$; resolve with $C_5$ on $P_{2,1}$ → $\Box$. **Contradiction derived — the query is entailed**: given breeze at (1,1) and a safe (1,2), a pit *must* neighbor (1,1) somewhere — here, (2,1).

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz To prove KB ⊨ α by resolution, what exact set do you convert to CNF and what terminal symbol ends the proof?
() CNF(KB) alone, ending when α appears verbatim as a clause
(*) CNF(KB ∧ ¬α), ending with the empty clause □ (a derived contradiction)
() CNF(¬KB ∧ α), ending with a tautology clause
() No conversion needed; resolution works directly on implications
::: explanation
Refutation: *assume the query false alongside the KB* and derive impossibility. CNF-ize $KB \land \lnot\alpha$; resolve until $\Box$ — the contradiction certifies no counter-model exists, i.e. entailment holds. Ending at anything else proves nothing.
:::

::: quiz Which clause is NOT Horn, and what breaks if you feed it to a chaining engine?
() (¬A ∨ ¬B ∨ C) — breaks nothing; it is Horn
(*) (A ∨ B ∨ ¬C) — two positive literals; chaining is incomplete outside Horn, so entailed conclusions can be silently missed
() (¬A ∨ ¬B ∨ ¬C) — a goal clause; breaks nothing
() (A) — a unit fact; the engine's favorite food
::: explanation
Horn = at most one un-negated atom; $(A \lor B \lor \lnot C)$ has two. Chaining's completeness proof assumes Horn form — outside it, the engine may halt without the answer although resolution would find it. Feed non-Horn KBs to resolution instead.
:::

::: quiz Forward chaining fires every applicable rule each round; backward chaining starts from the query. When is backward chaining the clear winner?
() When the KB is tiny enough to memorize entirely
(*) When the query needs only a small relevant slice of a huge KB — it explores goal-relevant rules instead of re-deriving all consequences
() When the KB is non-Horn and resolution is unavailable
() Backward chaining never wins; it is strictly slower
::: explanation
Forward chaining floods: every derivable fact, relevant or not. Backward chaining is demand-driven — it recursively grounds only the query's premise tree. On million-rule KBs with focused questions (diagnosis, Prolog queries), that selectivity is the whole game.
:::

---

<a id="exam-focus"></a>
## 6. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** State the resolution rule, define Horn clause, or contrast forward vs. backward chaining.
* **7 Marks:** Full refutation proof on a Wumpus fragment (CNF → resolve → □), or trace chaining to a goal.
:::

### Sample 3-Mark Question
**Q: State the resolution rule and the condition for applying it.**

**Model Answer:** From clauses $(l_1 \lor \dots \lor l_k)$ and $(m_1 \lor \dots \lor m_n)$ containing a complementary pair $l_i = \lnot m_j$, infer the resolvent: the disjunction of all remaining literals. One complementary pair per step; the empty clause $\Box$ signals contradiction.

### Sample 7-Mark Question
**Q: Using the KB of §4, prove by resolution that a pit neighbors (1,1).**

**Model Answer:** As traced: CNF gives $C_1: (\lnot B_{1,1} \lor P_{1,2} \lor P_{2,1})$, $C_2: (\lnot P_{1,2})$, $C_3: (B_{1,1})$, negated query $C_5: (\lnot P_{2,1})$. $C_1 \otimes C_3 \to (P_{1,2} \lor P_{2,1})$; $\otimes\, C_2 \to (P_{2,1})$; $\otimes\, C_5 \to \Box$. Refutation complete — entailment proven, and the surviving disjunct history even shows *where* the pit must be.
