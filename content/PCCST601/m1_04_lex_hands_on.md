---
id: m1_04_lex_hands_on
courseCode: PCCST601
module: 1
sequence: 4
title: 'Hands-On Lex: Rules, Patterns & Actions'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Lay out Lex files across definitions, rules and code drawers
  - Pair patterns with actions using order-as-priority idioms
  - Trace examiner patterns with yytext and yylval carriers
concepts:
  - Lex specification
  - pattern-action pairs
  - scanner idioms
prerequisites:
  - m1_03_re_to_scanner_construction
examRelevance: high
tags:
  - lexical-analysis
  - lex-tool
---
# Hands-On Lex: Rules, Patterns & Actions

**Writing a real scanner — file anatomy, pattern-action pairs, and the idioms examiners trace.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Recipe Cards with Alarms
A Lex file is three drawers: **definitions** (named posters: `letter`, `digit`), **rules** (poster → alarm action in C: "on identifier, count++ and return ID"), **user code** (`main`, helpers). Feed source text: longest-match rings one alarm per lexeme; unmatched characters echo by default (the silent bug!). Lex compiles the drawers into the bouncer automaton plus your alarms.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 File anatomy and idioms

```text
%{ C declarations %}
letter   [A-Za-z]
digit    [0-9]
%%
if|else|while        { return KEYWORD; }
{letter}({letter}|{digit})*   { count++; return ID; }
[0-9]+               { yylval = atoi(yytext); return NUM; }
[ \t\n]+             ;          /* skip whitespace, no action */
.                    { return yytext[0]; }  /* catch-all LAST */
%%
int main() { yylex(); }
```

`yytext` (matched lexeme), `yyleng`, `yylval` (semantic value to parser). Rule order = priority; catch-all `.` must sit last.

::: callout-formula KTU Formula Vault: Lex
Drawers: **defs %% rules %% code** · carriers **yytext/yylval** · order = **priority** · `.` **last**.
:::

::: callout-pitfall Default Echo on No-Match
Lex's default action *copies* unmatched input to output — a missing catch-all silently passes garbage downstream instead of erroring. Explicit `.` error/catch-all last is defensive scanning 101.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Write Lex rules counting keywords (`if`, `while`), identifiers, and integers in input, skipping whitespace. Trace on `if x1 42`."
:::

::: step [Step 2: Execution] Rules Then Trace
1. Definitions `letter/digit`; rules: `if|while {kw++}`, `{letter}({letter}|{digit})* {id++}`, `{digit}+ {num++}`, whitespace skip, `.` error last.
2. `if` → longest match `if` (space ends; `ifx` would differ) → kw $=1$; `x1` → id $=1$; `42` → num $=1$. Whitespace skipped silently.
:::

::: step [Step 3: Conclusion] Final Result
Definitions name, rules pair, actions record; traces walk longest-match per lexeme. Rule-order justification (keywords first) is the mandatory comment line.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What do `yytext` and `yylval` carry, and who consumes them?
(A) Both go to output files
(*B) `yytext` = matched lexeme string (for messages/counts); `yylval` = semantic value passed to the YACC parser as the token's payload
(C) Both are counters
(D) Lex keeps both private
::: explanation
Text serves the scanner's own bookkeeping; value bridges to parsing (`NUM`'s $42$, `ID`'s symbol-table index). Bridge-vs-local is the interface to name in tool-chain questions.
:::

::: quiz Q2: Foundational Concept
Why must the catch-all `.` rule sit last?
(A) Lex sorts rules anyway
(*B) Equal-length ties go to the earliest rule — an early `.` devours every character before specific patterns match anything
(C) Last rules run fastest
(D) Dots are slow
::: explanation
Priority is positional: first-listed wins ties, and `.` ties with *everything* (length 1). Last place makes it the fallback it should be — position *is* the semantics.
:::

::: quiz Q3: Foundational Concept
`[ \t\n]+ ;` — what and why?
(A) Counts spaces
(*B) Matches whitespace runs with an empty action — discards layout silently so the parser never sees it (layout is rarely grammar)
(C) Errors on spaces
(D) Returns layout tokens
::: explanation
Scanners filter noise (spaces, comments) that grammars shouldn't model. Empty-action rules are the mechanism — match-and-drop, the quiet majority of real Lex files.
:::
