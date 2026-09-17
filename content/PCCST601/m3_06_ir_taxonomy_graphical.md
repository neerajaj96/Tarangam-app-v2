# IR Taxonomy & Graphical IRs

**The handshake zoo — why two IR families exist, trees vs DAGs vs graphs, and which phase prefers what.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Family Photos vs Assembly Instructions
**Graphical IRs** (syntax trees, DAGs, CFGs) photograph *structure*: nesting, sharing, flow — optimizers read photos to spot redundancy (same subtree twice = compute once). **Linear IRs** (stack code, TAC — next topic) write *assembly instructions*: flat, sequential, machine-near — back ends emit from lists, not photos. Front ends hang photos; back ends read instructions; optimizers browse both.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Taxonomy and graphical forms

* **Syntax (parse) trees:** concrete, grammar-faithful (punctuation nodes included) — parser output.
* **ASTs:** abstracted (operators/operands only) — semantic input, SDT output.
* **DAGs:** shared common subexpressions (one node, many parents) — value-numbering made visible.
* **(Control-)flow graphs:** basic-block nodes, edge = jump — control optimisation's home (M4's live sets walk these).

### 2.2 Choice rules

Trees for syntax-directed passes; DAGs where sharing matters (CSE previews); graphs for flow analyses; linear for emission. Level of abstraction slides: high (AST) → mid (TAC) → low (RTL/machine).

::: callout-formula KTU Formula Vault: IR Zoo
Parse tree **concrete** · AST **abstract** · DAG **shares** · CFG **flows** · linear **emits**.
:::

::: callout-pitfall AST ≠ Parse Tree
Parse trees keep grammar scaffolding (chain rules, parens); ASTs keep meaning (operators/operands). "AST with punctuation nodes" contradicts the abstraction — strip concrete syntax when abstracting.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Draw parse tree vs AST vs DAG for `a+a*(b-c)` (grammar $E\to E+T\mid T$ etc.), and state what each drops or shares.
:::

::: step [Step 2: Execution] Three Portraits
1. **Parse tree:** full chain-rule spine ($E\to T\to F\to a$) plus paren nodes — faithful, bushy.
2. **AST:** root $+$, left $a$, right $\times(b,c-minus)$ — operators/operands only, precedence in shape.
3. **DAG:** same as AST here (no repeated subexpression to share); with `(a+b)*(a+b)` the $a+b$ node gains two parents — sharing drawn, recomputation implied-gone.
:::

::: step [Step 3: Conclusion] Final Result
Scaffolding → meaning → sharing: three drawings, one expression. Sharing-nodes (multi-parent) are DAG's visual signature — circle them when asked "why DAG".
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What does a DAG expose that an AST hides?
(A) Operator precedence
(*B) Value reuse — shared subexpression nodes with multiple parents name recomputation the optimizer can eliminate (CSE seed)
(C) Token positions
(D) Type errors
::: explanation
ASTs duplicate shared computations (tree = no sharing); DAGs fuse them visibly. Multi-parent nodes *are* the redundancy report — construction anticipates optimisation.
:::

::: quiz Q2: Foundational Concept
Why do flow analyses want CFGs, not ASTs?
(A) ASTs are bigger
(*B) Optimisation questions (liveness, reaching definitions) ask about *execution paths and joins* — block/edge graphs model control directly; ASTs model nesting, where flow is implicit
(C) CFGs parse faster
(D) ASTs lack operators
::: explanation
Representation follows query: flow questions need flow graphs. Data-flow equations (M4) iterate over CFG nodes/edges — the structure *is* the algorithm's input format.
:::

::: quiz Q3: Foundational Concept
Parse tree → AST transformation drops what, keeps what?
(A) Drops operators
(*B) Drops concrete scaffolding (chain productions, punctuation, keywords-as-nodes); keeps semantic skeleton (operations, operands, control structure)
(C) Drops identifiers
(D) Keeps everything
::: explanation
Abstraction = meaning minus grammar bookkeeping. SDT actions typically build AST nodes directly during parsing (rather than parse-then-strip) — construction beats conversion.
:::
