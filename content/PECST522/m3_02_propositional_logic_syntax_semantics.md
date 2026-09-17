# Propositional Logic: Syntax, Semantics & Entailment

**Atomic sentences, connectives and precedence, models, entailment vs. validity vs. satisfiability, and why truth tables don't scale.**

<a id="the-intuition"></a>
## 1. Logic as Legos and Worlds

::: callout-intuition Core Mental Model: Blueprints vs. Buildings
**Syntax** is the Lego manual: which brick-shapes (sentences) you may snap together and in what orders — pure form, no meaning. **Semantics** is the buildings: each fully-specified way the world *could* be (a **model**, i.e. a true/false assignment to every atom) either satisfies your construction or collapses it. **Entailment** ($KB \models \alpha$) is the engineer's guarantee: *in every building where your premises stand, the conclusion stands too* — no exceptions, no luck.
:::

---

<a id="the-dimensions"></a>
## 2. Syntax: Atoms, Connectives, Precedence

* **Atomic sentences:** single proposition symbols ($P$, $Q$, $P_{1,2}$) — indivisible true/false facts.
* **Complex sentences** via connectives: $\lnot$ (not), $\land$ (and), $\lor$ (or), $\Rightarrow$ (implies), $\Leftrightarrow$ (iff).
* **Precedence** (tightest first): $\lnot$, then $\land$, then $\lor$, then $\Rightarrow$, then $\Leftrightarrow$. So $P \lor Q \Rightarrow R$ parses as $(P \lor Q) \Rightarrow R$ — and when in doubt, parenthesize: exams punish precedence slips.
* **Implication truth table** (the one everyone must memorize): $P \Rightarrow Q$ is false in exactly one row — $P$ true, $Q$ false. True premise with false conclusion is the *only* broken promise; a false premise implies *anything* (vacuous truth).

::: callout-formula Formal Core: Entailment, Validity, Satisfiability
$M(\alpha)$ = the set of models where $\alpha$ is true. **Entailment:** $KB \models \alpha \iff M(KB) \subseteq M(\alpha)$. **Valid** (tautology): true in *all* models ($M(\alpha) =$ everything). **Satisfiable:** true in *at least one* model. **Unsatisfiable:** true in *none*. Deduction theorem bridge: $KB \models \alpha$ **iff** $KB \land \lnot\alpha$ is **unsatisfiable** — the fact resolution (next topic) is built on.
:::

---

<a id="terminology"></a>
## 3. Model Checking and Its Wall

**Model checking** (TT-ENTAILS?) enumerates all $2^n$ assignments for $n$ atoms and keeps only rows satisfying the KB: $\alpha$ is entailed iff it holds in every surviving row. Sound and complete — and hopeless past toy sizes: 30 atoms means a billion rows. This exponential wall is *why* inference procedures (resolution, chaining) exist at all: entailment is co-NP-complete, so no general shortcut is believed possible — only smarter proof search.

::: callout-pitfall Implication Is Not Causation (or Equivalence)
$P \Rightarrow Q$ says nothing about $Q \Rightarrow P$ (affirming the consequent: from $Q$, concluding $P$ — **invalid**). Denying the antecedent (from $\lnot P$, concluding $\lnot Q$) is equally invalid. Only **Modus Ponens** (from $P \Rightarrow Q$ and $P$, conclude $Q$) and **Modus Tollens** (from $P \Rightarrow Q$ and $\lnot Q$, conclude $\lnot P$) are licensed moves. Two valid rules; every other "obvious" step is a trap.
:::

---

<a id="worked-example"></a>
## 4. Proving Entailment by Hand (Wumpus Fragment)

KB: $R_1: \lnot P_{1,1}$ · $R_2: B_{1,1} \Leftrightarrow (P_{1,2} \lor P_{2,1})$ · $R_3: \lnot B_{1,1}$ (observed). Query: $\alpha = \lnot P_{1,2}$ (square (1,2) is pit-free).

Relevant atoms: $P_{1,1}, P_{1,2}, P_{2,1}, B_{1,1}$ — 16 rows. $R_1$ kills 8 (fixes $P_{1,1}=$ false); $R_3$ kills all but $B_{1,1}=$ false rows. In every surviving row, $R_2$'s biconditional with $B_{1,1}$ false forces $(P_{1,2} \lor P_{2,1})$ false, i.e. both false — so $\alpha$ holds in *all* surviving models: $KB \models \lnot P_{1,2}$ proven. Four atoms needed 16 rows; the full $4\times4$ dungeon's 64+ atoms would need $2^{64}$ — the wall, demonstrated.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Which row of the truth table makes P ⇒ Q false, and what does that imply about vacuous truth?
() The row where both are false — implication needs truth on both sides
(*) The row P=true, Q=false — the only broken promise; with a false premise the implication is automatically (vacuously) true
() No row ever falsifies an implication
() The row P=false, Q=true — a true conclusion can't follow a false premise
::: explanation
Implication is a *promise*: "if P, then Q." Only P-true-with-Q-false breaks it. P-false rows (whatever Q) keep the promise vacuously — the single most-tested truth-table fact, and the engine behind half the exam traps on this topic.
:::

::: quiz KB ⊨ α holds exactly when which model-set relationship (or satisfiability fact) holds?
() M(α) ⊆ M(KB) — the query's models are fewer
(*) M(KB) ⊆ M(α) — every KB-model is an α-model; equivalently KB ∧ ¬α is unsatisfiable
() M(KB) and M(α) are disjoint
() KB and α share at least one atom symbol
::: explanation
Entailment means *no counterexample*: no model satisfying the KB violates $\alpha$. Set-wise, KB-models sit inside $\alpha$-models; equivalently, assuming the KB *plus the query's negation* explodes into contradiction. The second phrasing is what resolution mechanizes next topic.
:::

::: quiz An agent reasons: "If there's a breeze there must be a pit nearby (B ⇒ P-nearby). No breeze here, so no pit nearby." Valid or fallacy, and why?
() Valid — this is Modus Ponens applied correctly
() Valid — this is Modus Tollens applied correctly
(*) Fallacy — denying the antecedent: from ¬B nothing follows about P-nearby under this rule alone (the rule constrains breezy squares, not calm ones)
() Fallacy — affirming the consequent, because the agent observed a conclusion
::: explanation
Modus Tollens needs $\lnot Q$ to conclude $\lnot P$ — here the rule's consequent is "pit nearby," and the observation is about *breeze*, the antecedent. Denying the antecedent proves nothing (the rule is silent about calm squares). Contrast the *valid* twin: breeze-rule contrapositive runs through $\lnot P$-facts, not $\lnot B$-observations.
:::

---

<a id="exam-focus"></a>
## 6. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Precedence order, implication truth table, or define entailment/validity/satisfiability.
* **7 Marks:** Model-checking proof of a Wumpus entailment (enumerate rows, filter by KB, verdict).
:::

### Sample 3-Mark Question
**Q: State the precedence of propositional connectives and the condition under which P ⇒ Q is false.**

**Model Answer:** Tightest first: $\lnot$, $\land$, $\lor$, $\Rightarrow$, $\Leftrightarrow$. $P \Rightarrow Q$ is false in exactly one case: $P$ true and $Q$ false; all three other rows are true (vacuous truth when $P$ is false).

### Sample 7-Mark Question
**Q: With the KB of §4, prove by model checking that square (1,2) is pit-free. Why is this method impractical in general?**

**Model Answer:** List the 16 assignments over $\{P_{1,1}, P_{1,2}, P_{2,1}, B_{1,1}\}$; discard rows violating $R_1$ ($P_{1,1}$ true), $R_3$ ($B_{1,1}$ true), or $R_2$ (biconditional mismatch); observe $\lnot P_{1,2}$ in every survivor — hence entailment. Impractical because rows double per atom ($2^n$): a 64-atom dungeon needs $\sim 10^{19}$ rows — sound, complete, and unusable, motivating resolution.
