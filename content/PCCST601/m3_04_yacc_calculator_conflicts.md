---
id: m3_04_yacc_calculator_conflicts
courseCode: PCCST601
module: 3
sequence: 4
title: 'YACC Hands-On: Calculator & Table Errors'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Lay out grammar files across declarations, rules and code
  - Thread stack values through actions with precedence directives
  - Confess table errors through the y.output report
concepts:
  - YACC specification
  - precedence directives
  - conflict reports
prerequisites:
  - m3_03_lr_tables_lalr_shrinking
examRelevance: high
tags:
  - parsing
  - yacc-tool
---
# YACC Hands-On: Calculator & Table Errors

**From grammar file to running calculator — declarations, rules with actions, precedence directives, and conflict reports.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Lex Grows Up
If Lex pairs posters with alarms, **YACC** pairs grammar rules with payoffs: on reducing $E\to E+T$, run `{ $$ = $1 + $3; }` (dollars = stack values: $1st, $3rd symbols, $$ the new $E$'s worth). **Declarations** name tokens/types/associativity; **precedence directives** (`%left '+'`, `%left '*'`) auto-resolve the expression conflicts you'd otherwise table-debug. `yacc -v` writes `y.output` — the states, items, and conflicts, confessed in plain text.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 File anatomy and calculator core

```text
%{ #include <stdio.h> %}
%token NUM
%left '+' '-'
%left '*' '/'
%%
line : expr '\n'   { printf("%d\n", $1); }
     ;
expr : expr '+' expr { $$ = $1 + $3; }
     | expr '*' expr { $$ = $1 * $3; }
     | NUM           { $$ = $1; }
     ;
%%
```

`%left` lines order precedence (later = tighter) and encode left-associativity; shift/reduce conflicts on `+`/`*` dissolve per declarations. `y.output` conflict census ("3 shift/reduce") must be *read*, never ignored — unexpected counts mean grammar bugs.

::: callout-formula KTU Formula Vault: YACC
Sections **decls %% rules %% code** · `$$/$1/$3` = **stack values** · `%left` = **assoc+precedence** · `y.output` = **confession file**.
:::

::: callout-pitfall Unread Conflict Reports
"3 shift/reduce conflicts, expected" differs from "17, investigate" — counts surprise. Every YACC build ends at `y.output`: predicted conflicts signed off, surprises debugged. Shipping blind is how dangling-elses haunt production.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Write the YACC core for `+`/`*`/NUM with correct precedence, predict the conflict census, and state what `y.output` must show."
:::

::: step [Step 2: Execution] Directives Then Census
1. File as above: `%left '+' '-'` above `%left '*' '/'` (tighter later), rules with actions.
2. Census: the ambiguous core raises shift/reduce conflicts per operator pair — directives resolve all toward shift-with-precedence; `y.output` should show the *expected* small count with rules cited (e.g. "conflicts resolved as shift"). Any reduce/reduce or unexpected growth ⇒ investigate grammar, not directives.
:::

::: step [Step 3: Conclusion] Final Result
Directives declare intent, actions compute, `y.output` audits. Intent-audit pairing is the professional YACC workflow in three artefacts.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
`$$ = $1 + $3` in `expr: expr '+' expr` means:
(A) String concatenation of source text
(*B) On reducing, pop three stack values (left, ignored `+`, right), push their sum as the new $E$'s semantic value — syntax-directed evaluation piggybacking the parse
(C) Token counting
(D) Error message
::: explanation
Positional `$n` addresses RHS symbols' values; `$$` plants the LHS result. Reductions become computation steps — parsing *evaluates* as it recognises (the SDT seed for later topics).
:::

::: quiz Q2: Foundational Concept
`%left '*' '/'` placed *below* `%left '+' '-'` encodes:
(A) Same precedence, alphabetical
(*B) Higher precedence for `*`/`/` (later lines bind tighter) plus left-associativity — `a*b*c` groups left, `a+b*c` multiplies first
(C) Right associativity
(D) Nothing; comments
::: explanation
Order = precedence rank, `%left` = grouping direction. Two facts per directive line — read both when tracing conflict resolutions in `y.output`.
:::

::: quiz Q3: Foundational Concept
`y.output` reports 12 shift/reduce conflicts on a small expression grammar. Response?
(A) Ship it, YACC resolves all
(*B) Investigate — small grammars warrant single-digit expected counts; a dozen signals real ambiguity (likely dangling-else-style or missing directives), audit each against intent
(C) Delete directives
(D) Switch to Lex
::: explanation
Conflict *census vs expectation* is the diagnostic: match ⇒ sign off with reasons; surplus ⇒ debug grammar/declarations. Count-first triage turns `y.output` from wallpaper into instrument.
:::
