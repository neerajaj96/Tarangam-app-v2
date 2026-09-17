# Regular Expressions & FSA Brush-Up for Scanners

**Word patterns as algebra — RE operators, precedence, and the automata they denote (ToC revision, scanner-flavoured).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Wanted Posters
A **regular expression** is a wanted poster describing a gang of words ("starts with a letter, then letters/digits" = identifier gang). **FSA** is the bouncer checking arrivals against the poster, no memory beyond the current state. Posters compose: sequence (one gang then another), choice (either gang), star (repeat the gang, possibly zero times). Scanner = set of posters + priority rules for disputed arrests.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 RE operators and precedence (high→low)

Kleene star `*` (and `+`, `?` sugars) · concatenation (silent) · alternation `|`. Classes `[a-z]`, complement, `.` (any-but-newline in Lex). Examples: identifier `[A-Za-z][A-Za-z0-9]*`; integer `[0-9]+`; float `[0-9]+\.[0-9]+`.

### 2.2 FSA correspondence (brush-up)

Every RE denotes a regular language recognised by some DFA; Thompson builds NFA fragments (start/accept per operator), subset construction determinises, minimisation compacts. Scanner correctness = language equality between REs and the automaton.

::: callout-formula KTU Formula Vault: RE→FSA
Precedence **star·concat·union** · id **`[A-Za-z][A-Za-z0-9]*`** · RE ≡ NFA ≡ DFA ≡ minimal DFA.
:::

::: callout-pitfall Star Binds Tightest
`ab*` = `a` then `b*` (only `b` repeats), not `(ab)*`. Missing parens around multi-symbol repeats is the RE-reading error behind half of all wrong patterns — parenthesise repeats deliberately.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Write REs for: (a) C identifiers, (b) unsigned integers, (c) decimals requiring digits both sides of the point. Then mark operator precedence in `a|bc*`.
:::

::: step [Step 2: Execution] Posters and Parsing
1. `[A-Za-z_][A-Za-z0-9_]*` (C allows underscore — state the dialect!).
2. `[0-9]+`.
3. `[0-9]+\.[0-9]+` (escaped dot — bare `.` means any-char!).
4. `a|(b(c*))`: star first, then concat, then union.
:::

::: step [Step 3: Conclusion] Final Result
Dialect details (underscore, escaped dot) plus precedence discipline. Scanner RE questions grade literal exactness — one metacharacter off, pattern wrong.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What does `ab*` match that `(ab)*` doesn't (and vice versa)?
(A) Identical languages
(*B) `ab*` forces one leading `a` (`a`, `ab`, `abb…`); `(ab)*` allows empty and repeats pairs (`ε`, `ab`, `abab…`) but never lone `a`
(C) Both match everything
(D) Neither matches `a`
::: explanation
Star scope is everything to its left atom — one symbol vs the parenthesised pair. Precedence (star > concat) decides scope; parens override — the two-line precedence demo.
:::

::: quiz Q2: Foundational Concept
Why must `.` be escaped (`\.`) to match a decimal point?
(A) Style preference
(*B) Bare `.` is the any-character metacharacter — unescaped, `3.14` also matches `3x14`; escaping demotes it to a literal dot
(C) Dots are illegal
(D) Lex requires it randomly
::: explanation
Metacharacter-vs-literal is the constant RE tension: escape claims literality. Every regex dialect shares it — state which symbols you escaped and why when writing patterns.
:::

::: quiz Q3: Foundational Concept
RE, NFA, DFA, minimal DFA — the relationship?
(A) Strictly increasing power
(*B) Equal expressive power (all = regular languages); the chain is engineering (human-friendly → executable → fast → compact), not capability
(C) DFAs accept more
(D) Minimal DFAs accept less
::: explanation
Equivalence theorems (Thompson, subset, minimisation) preserve language exactly. Conversions trade *form* (nondeterminism, size) for scanner needs — power never changes, the exam's favourite true/false.
:::
