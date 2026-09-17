# LL(1) Parsing Traces & Error Handling

**Running the table: stack–input–action traces, accept vs error, and panic-mode recovery.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Waiter with the Pad
Stack = pending cravings (top = current); input = arriving dishes; table = the pad (recipe per craving+dish). Match terminal tops against dishes (eat both); expand nonterminal tops via the pad's recipe (replace craving with recipe steps). Empty stack + `$` = satisfied customer (accept). Blank pad cell = wrong order (error → recover, don't storm out).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Driver loop and trace columns

Stack `[$, S]`, pointer at input start. Loop: top terminal → match/consume or error; top nonterminal → $M[top, lookahead]$ expand or error. Trace rows: (stack, input, action). Accept: stack `$`, input `$`. Errors: terminal mismatch / blank cell → report + panic-mode skip to sync set (FOLLOW of top / statement delimiters).

::: callout-formula KTU Formula Vault: LL Driver
Match **terminals**, expand **nonterminals** · blank cell = **error** · recover via **sync tokens**.
:::

::: callout-pitfall Forgetting the `$` Sentinels
Stack-bottom and input-end `$` markers make "done" detectable ($+$ $=$ accept). Missing sentinels accept prefixes ($id+$ accepted as $id$) or loop at EOF — initialise both, check both.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Using the $E$-grammar table (previous topic), trace `id+id$` (show stack/input/action per step) and pinpoint where `id++id` fails.
:::

::: step [Step 2: Execution] Rows and the Blank Cell
1. `[$E] | id+id$` → expand $E\to TE'$ → … (routine expansions) → match `id`, expand $E'\to+TE'$ on `+`, match `+`, $T\Rightarrow^*id$, $E',T'\to\varepsilon$ on `$` → `[$] | $` accept.
2. `id++id`: after first `+TE'` expansion and matching second `+`, top $T$ faces `+` — $M[T,+]$ blank (FIRST($T$)$=\{(,id\}$) → error "unexpected `+`, expected operand", skip to sync (`$`/`)`), report, continue.
:::

::: step [Step 3: Conclusion] Final Result
Every row shows all three columns; errors name the blank cell (top × lookahead). Graders check row discipline — one missing column per row compounds fast.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Stack top terminal `)` with lookahead `]`. Action?
(A) Expand via table
(*B) Mismatch error — terminals match-or-fail (no table consulted); report expected-vs-found, recover
(C) Skip input silently
(D) Pop both
::: explanation
Tables govern nonterminals only; terminals demand literal equality. Popping both on mismatch accepts corrupt input — match-or-error is the terminal contract.
:::

::: quiz Q2: Foundational Concept
Panic-mode recovery on blank $M[A, a]$ does what?
(A) Aborts compilation
(*B) Reports, then skips input to a synchronising token (FOLLOW($A$), delimiters) and resumes — harvesting multiple errors per run
(C) Guesses a production
(D) Restarts scanning
::: explanation
One-error-per-compile wastes the user's time; sync sets (statement ends, `)`, `$`) re-anchor parsing. Recovery *strategy* (which sync set, pop-vs-skip) is the graded design content.
:::

::: quiz Q3: Numerical Drill
How many stack actions (push/pop/expand/match) roughly for input length $n$ (fixed grammar)?
(A) $O(n^2)$
(*B) $O(n)$ — each token matched once, each expansion derives ≥1 token (no left recursion!), so expansions are $O(n)$ too
(C) $O(2^n)$
(D) $O(\log n)$
::: explanation
Left-recursion-free grammars expand $O(n)$ nodes for $n$ tokens (tree size linear); matching consumes $n$. Linearity is why LL(1) is a *fast* parser — progress per action, no repeats.
:::
