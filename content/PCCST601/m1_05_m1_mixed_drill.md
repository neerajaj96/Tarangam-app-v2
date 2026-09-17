# M1 Drill: REs, Automata & Lex Traces

**Pattern-writing, construction sketches, and tokenisation verdicts — the module's exam shapes in one sitting.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Reflexes
Write the poster (RE exactness) → sketch the bouncer (fragments/closures) → referee the arrests (longest + earliest). M1 marks split across the three — drill each to under three minutes.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Reflex sheet

Precedence star·concat·union · Thompson ε-fragments · subset = state-sets · longest-match then rule-order · Lex drawers + `yytext/yylval` + catch-all-last.

::: callout-formula KTU Formula Vault: M1 Reflexes
Poster **exact** · bouncer **composed** · arrests **longest, then earliest**.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs an RE-design + NFA-sketch with a tokenisation trace (or Lex rules + trace). Exactness in patterns, fragment labels in sketches, both arbitration rules in traces — one scoring move each.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) RE for binary strings ending in `01`? (b) Thompson fragments count (rough)? (c) Rules keyword-`do` before identifier: tokenise `done` and `do `.
:::

::: step [Step 2: Execution] Poster, Parts, Verdicts
1. `(0|1)*01` — any prefix, fixed suffix.
2. Union(2 symbols) + star + 2 concats ≈ $6$–$8$ NFA states with ε-bridges — order-of-magnitude sketch, labelled fragments.
3. `done` → longest `done` = identifier (4 beats 2). `do ` → keyword `do` (space ends). Same arbitration as `ifx`.
:::

::: step [Step 3: Conclusion] Final Result
Suffix-patterns (`*suffix`), fragment counting by operator, munch verdicts — the drill's three stations, each one line once trained.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
RE for strings over $\{a,b\}$ with exactly two $b$'s?
(A) $(a|b)*bb(a|b)*$
(*B) $a*ba*ba*$ — $b$'s fixed at two, $a$'s free in three gaps (exactly, not at-least)
(C) $(ab)*$
(D) $bba*$
::: explanation
"Exactly $n$" patterns pin the counted symbols and star the rest around them. (A) allows $3+$ $b$'s (at-least) — exactly-vs-at-least is the quantifier trap.
:::

::: quiz Q2: Mixed Drill
Why list keywords before identifiers in Lex?
(A) Speed
(*B) Equal-length tie (`if` matches both posters) breaks to the earlier rule — keywords must precede to ever fire
(C) Alphabetical convention
(D) Identifiers are illegal otherwise
::: explanation
Tie-breaking is positional; `if`-length ties occur constantly. Order encodes priority — the single most-tested Lex fact, answerable in one line.
:::

::: quiz Q3: Mixed Drill
Input `123abc` with integer-rule before identifier-rule: token(s)?
(A) Single identifier `123abc`
(*B) NUM(123) then ID(abc) — integer reach stops at `3` (letters excluded), identifier can't start at a digit; maximal runs per poster, then arbitration
(C) NUM(123abc)
(D) Lexical error
::: explanation
Longest match applies *within each pattern's own reach*: `[0-9]+` maximally eats `123`; the identifier poster needs a letter start, so `abc` lexes separately. Reach-limits precede arbitration — check what each poster *can* eat first.
:::
