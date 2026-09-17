# Recursive Descent & Backtrack-Free Parsing

**Predictive procedures per nonterminal — when peeking decides, when guessing backtracks, and what guarantees freedom.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Tour Guides with Walkie-Talkies
Each nonterminal gets a guide procedure: glance at the next tourist group (lookahead token), radio the right sub-guide, march on. **Backtracking** = wrong guess, rewind the whole tour, retry (exponential worst-case). **Backtrack-free** = the glance *always* identifies the unique correct sub-guide (disjoint prediction sets) — one confident walk, linear time.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Recursive-descent skeleton

```text
parseE():  parseT(); while peek=='+': consume; parseT()
parseT():  parseF(); while peek=='*': consume; parseF()
parseF():  if peek==id: consume
           elif peek=='(': consume; parseE(); expect(')')
           else: error("expected factor")
```

Loops replace tail recursion (the $E'$ pattern compiled by hand). One procedure per nonterminal; `expect` matches terminals or raises syntax errors with position.

### 2.2 Backtrack-free condition (LL(1) preview)

Choice $A \to \alpha \mid \beta$ decidable by one token iff $\text{FIRST}(\alpha)\cap\text{FIRST}(\beta) = \varnothing$ (plus FOLLOW-awareness when $\alpha\Rightarrow^*\varepsilon$). Disjoint prediction ⇒ no guessing ⇒ linear predictive parsing.

::: callout-formula KTU Formula Vault: Descent
Procedure **per nonterminal** · loops for **tails** · decide by **lookahead** · disjoint FIRST ⇒ **no backtrack**.
:::

::: callout-pitfall Error Recovery Is Not Panic-Everywhere
`expect` failures should report *position + expected set* and synchronise (skip to `;`/`)`/statement ends), not abort at the first comma. Recovery strategy is a graded sub-answer — name panic-mode with sync tokens.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Write `parseF` for $F \to id \mid (E)$ and trace it on `(x)` vs `(x` (error case). Why is no backtracking needed?
:::

::: step [Step 2: Execution] Peek, Branch, Verify
1. Code as skeleton above. On `(x)`: `(` consumed → parseE → `x` → expect `)` ✓. On `(x`: expect `)` hits EOF → error "expected `)`, found end at position 3".
2. `id` vs `(` are disjoint FIRST sets — the peek discriminates perfectly, so no guess-and-rewind ever triggers.
:::

::: step [Step 3: Conclusion] Final Result
Peek-sets per branch, `expect` per terminal, error with position. Disjointness argued from FIRST sets turns "works" into "provably backtrack-free".
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What makes recursive descent backtrack?
(A) Deep parse trees
(*B) Overlapping prediction sets — a lookahead consistent with multiple branches forces guessing, rewinding, and retrying on failure
(C) Left recursion only
(D) Too many tokens
::: explanation
Backtracking = decision failure: the peek doesn't discriminate, so the parser bets and backpedals. Disjoint FIRST sets (via factoring/recursion surgery) remove the bet — prediction replaces search.
:::

::: quiz Q2: Foundational Concept
`parseE` uses `while peek=='+'` instead of recursing $E'$. Why equivalent?
(A) Style only
(*B) The $E' \to +TE'\mid\varepsilon$ tail loop *is* iteration — while-loop compiles the right-recursive tail directly, same language, constant stack
(C) Recursion is illegal
(D) Loops parse faster asymptotically
::: explanation
Right-recursive $\varepsilon$-terminated tails denote loops; hand-compiling to `while` saves call depth with identical acceptance. Tail-loop conversion is the standard descent optimisation — same class, less stack.
:::

::: quiz Q3: Foundational Concept
Best error message for `expect(')')` failing on `]`?
(A) "Error"
(*B) "Expected `)` but found `]` at line L, column C" plus panic-mode skip to a synchronising token — position + expectation + recovery
(C) Silent skip
(D) Abort with core dump
::: explanation
Position locates, expectation educates, synchronisation continues (more errors per run). Message quality is explicitly graded in parser questions — never one-word it.
:::
