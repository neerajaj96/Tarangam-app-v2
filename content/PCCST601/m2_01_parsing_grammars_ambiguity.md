# Parsing Intro: Grammars, Derivations & Ambiguity

**Syntax as contract — productions, leftmost/rightmost derivations, parse trees, and why ambiguity must die.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Lego Manual
A **grammar** is the Lego manual: productions are assembly steps, terminals the bricks, nonterminals the named sub-assemblies, start symbol the box cover. A **derivation** builds step-by-step (leftmost = always extend the leftmost unfinished part); the **parse tree** is the finished model photo. **Ambiguity** = one photo, two manuals (e.g. `a+b*c` grouping two ways) — the compiler can't know which you meant, so grammars must admit exactly one tree per program.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Grammar machinery (ToC-grounded)

$G = (N, T, P, S)$; derivations $\Rightarrow$, $\Rightarrow^*$, leftmost ($\Rightarrow_{lm}$) / rightmost ($\Rightarrow_{rm}$); parse tree nodes = applied productions; yield = frontier terminals. Expression grammar layering (E→E+T|T, T→T*F|F, F→(E)|id) bakes precedence/associativity into shape.

### 2.2 Ambiguity and its cures

Ambiguous: some string, two trees (dangling-else, `E→E+E|E*E|id`). Cures: layered grammars, precedence/associativity declarations (YACC `%left`), or grammar rewriting — never "parse harder".

::: callout-formula KTU Formula Vault: Syntax
Grammar **$(N,T,P,S)$** · trees from **derivations** · one program = **one tree** · precedence by **layering**.
:::

::: callout-pitfall Ambiguity Is a Grammar Property
"Ambiguous string" is shorthand — ambiguity belongs to the *grammar* (two trees for one string), proven by exhibiting both trees. One tree shown proves nothing; two trees convict.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Grammar $E \to E+E \mid E*E \mid id$. (a) Two trees for $id+id*id$? (b) Layered unambiguous rewrite? (c) Leftmost derivation under the rewrite?
:::

::: step [Step 2: Execution] Convict, Then Fix
1. Tree 1: $+$ at root ($* $ binds inside right: correct math). Tree 2: $*$ at root ($+$ inside left: $(a+b)*c$ reading) — two trees ⇒ ambiguous ✓.
2. $E\to E+T\mid T$; $T\to T*F\mid F$; $F\to id$ — $*$ deeper = tighter.
3. $E \Rightarrow_{lm} E+T \Rightarrow_{lm} T+T \Rightarrow_{lm} F+T \Rightarrow_{lm} id+T \Rightarrow_{lm} id+T*F \Rightarrow^*_{lm} id+id*id$.
:::

::: step [Step 3: Conclusion] Final Result
Exhibit both trees (conviction), layer by precedence (cure), derive leftmost (mechanics). The triple is the complete ambiguity answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why must programming-language grammars be unambiguous?
(A) Ambiguous grammars parse slowly
(*B) Two trees = two meanings (different evaluation orders) — the compiler cannot choose semantics for the programmer
(C) Parsers crash on them
(D) Trees use more memory
::: explanation
$id+id*id$ as $(a+b)*c$ vs $a+(b*c)$ computes differently — meaning must be single. Disambiguation (layering/declarations) fixes meaning *in the grammar*, before parsing starts.
:::

::: quiz Q2: Foundational Concept
Leftmost vs rightmost derivation of the same string differ in:
(A) Resulting parse tree
(*B) Only the expansion order — both build the identical tree; leftmost expands the leftmost nonterminal each step, rightmost the rightmost
(C) Accepted language
(D) Speed class
::: explanation
Derivations are linearisations of tree construction; the tree is order-free. Top-down parsers trace leftmost, bottom-up rightmost — same tree, opposite bookkeeping.
:::

::: quiz Q3: Foundational Concept
How does layering $E\to E+T\mid T$, $T\to T*F\mid F$ enforce precedence?
(A) Longer rules win
(*B) $*$ sits deeper (binds tighter, evaluated lower in the tree); $+$-nodes higher evaluate last — tree height encodes precedence, left-recursion encodes left-associativity
(C) Alphabetical order
(D) It doesn't; YACC does
::: explanation
Shape *is* semantics: deeper = sooner. Left-recursive spine groups left (left-assoc); right-recursive would group right (needed for `=`/`^`). Read associativity off recursion direction.
:::
