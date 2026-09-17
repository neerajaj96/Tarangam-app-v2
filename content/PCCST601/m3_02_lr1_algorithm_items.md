# LR(1) Parsing Algorithm & Items

**Canonical LR power — lookahead-carrying items, closures, gotos, and the ACTION/GOTO tables.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Assembly Foreman with Binoculars
An **LR(1) item** $[A\to\alpha\bullet\beta, a]$ says: "built $\alpha$ so far, expecting $\beta$ next, and the customer's next order after this whole $A$ is $a$." **Closure** briefs the crew (expand expected nonterminals with propagated lookaheads); **goto** moves crews between stations on symbols. The foreman never guesses: state + lookahead dictate shift/reduce/accept uniquely — maximal determinism, minimal table mercy.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Items, closure, goto (canonical construction)

* Item set per state; closure adds $[B\to\bullet\gamma, b]$ for $b\in$ FIRST($\beta a$) whenever $[A\to\alpha\bullet B\beta, a]$ present.
* goto($I, X$) = closure of kernel items advanced past $X$.
* ACTION[state, terminal]: shift (goto on terminal), reduce $[A\to\alpha\bullet, a]$, accept ($[S'\to S\bullet, \$]$), else error. GOTO[state, nonterminal] = state jumps.

::: callout-formula KTU Formula Vault: LR(1)
Item = **progress + lookahead** · closure **briefs**, goto **moves** · ACTION on **terminals**, GOTO on **nonterminals**.
:::

::: callout-pitfall Lookahead Propagation, Not Invention
New items' lookaheads derive from FIRST($\beta a$) — computed, never guessed. Hand-closure errors almost always invent lookaheads ($\{\$\}$ everywhere) instead of propagating — propagate mechanically.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Augmented $S' \to S$, $S \to aA \mid b$, $A \to c$. Compute closure($\{[S'\to\bullet S, \$]\}$) — the initial state $I_0$.
:::

::: step [Step 2: Execution] Brief the Crew
1. Seed $[S'\to\bullet S, \$]$ expects $S$: add $S$-productions with lookahead FIRST($\varepsilon\,\$$) $= \{\$\}$: $[S\to\bullet aA, \$]$, $[S\to\bullet b, \$]$.
2. Terminals $a,b$ need no expansion (closure only briefs *nonterminals*). $I_0$ $=$ those $3$ items — done (A-closure comes after gotos move).
:::

::: step [Step 3: Conclusion] Final Result
Seed → expand nonterminals → propagate FIRST($\beta a$) → stop at terminals. Closure discipline (nonterminals only, computed lookaheads) is the mark-earner.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What does the dot in $[A\to\alpha\bullet\beta, a]$ track?
(A) Error position
(*B) Construction progress: $\alpha$ already on the stack (built), $\beta$ still expected — the item is a progress report plus its valid lookahead context
(C) Token count
(D) Table size
::: explanation
Dot-at-start = prediction; dot-at-end ($[A\to\alpha\bullet, a]$) = completion proposing reduce-on-$a$. Positions between = mid-assembly states. Dots turn parsing into bookkeeping — read each item as a status line.
:::

::: quiz Q2: Foundational Concept
ACTION vs GOTO tables split by:
(A) Row count
(*B) Symbol kind: ACTION on terminals (shift/reduce/accept/error = *doing*), GOTO on nonterminals (state jump after a reduction *lands*) — act on input, jump on structure
(C) Size only
(D) No difference
::: explanation
Terminals drive machine actions; nonterminals route the pushed symbol to its continuation state. Reduce-then-GOTO is the two-beat rhythm: collapse, then relocate.
:::

::: quiz Q3: Foundational Concept
Why augment with $S' \to S$?
(A) More states
(*B) A unique accept item $[S'\to S\bullet, \$]$: distinguishes done-parsing from merely reducing to $S$ mid-derivation (accept vs reduce disambiguated)
(C) Faster tables
(D) Tradition only
::: explanation
Without $S'$, "reduce to $S$" and "finished" collide on the same item shape. The wrapper buys a dedicated accept action — one production for total clarity.
:::
