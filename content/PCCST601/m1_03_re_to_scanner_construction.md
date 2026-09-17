# From RE to Scanner: Construction & Implementation

**Thompson → subset → minimise → table-drive — the pipeline turning posters into a bouncer, plus longest-match discipline.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Poster to Bouncer Factory
**Thompson** stamps one Lego fragment per RE symbol/operator and snaps them with ε-bridges (NFA with choices). **Subset construction** replays all possibilities at once — each DFA state = the *set* of NFA states you'd be in (parallel universes collapsed to one). **Minimisation** merges twin-behaving states. The scanner then table-drives: state × character → next state, always taking the *longest* match, ties to the earlier-listed pattern.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The three constructions

* **Thompson:** base (symbol/ε) + concat (bridge) + union (new start/accept, ε-forks) + star (loop-back) — linear size.
* **Subset:** DFA state = ε-closure sets; transition by move+closure; worst-case exponential, in practice tame for language REs.
* **Minimisation (Hopcroft/partition):** split accept/non-accept, refine by distinguishability — canonical minimal DFA.

### 2.2 Scanner discipline

Buffering (twin buffers + sentinels), longest match (maximal munch), rule priority (first-listed wins ties: keywords before identifiers!), retract on overshoot, panic-free (error routine on no-match).

::: callout-formula KTU Formula Vault: Scanner Pipeline
Thompson **ε-fragments** · subset **sets-of-states** · minimise **merge twins** · scan **longest match, earliest rule**.
:::

::: callout-pitfall Keywords After Identifiers
`if` matches the identifier poster too — listed later, the keyword rule never fires (tie goes earliest). Lex rule order *is* semantics: keywords, then identifiers, then catch-alls. Misordering silently un-keywords the language.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Build the Thompson NFA skeleton for `(a|b)*abb` (describe fragments), state the DFA start state's ε-closure contents, and tokenise `ifx` vs `if ` given keyword-rule-first ordering.
:::

::: step [Step 2: Execution] Fragments, Closure, Munch
1. `a|b` union fragment → star loop → concat `a`, `b`, `b` bridges — one accept at the end; classic "ends with abb" NFA.
2. Start closure = {start + everything ε-reachable: union forks + star entries} — the whole prefix cloud before consuming input.
3. `ifx`: longest match swallows 3 chars → identifier (keyword `if` + `x` can't split a maximal token). `if `: keyword `if` (space ends it). Maximal munch decides both.
:::

::: step [Step 3: Conclusion] Final Result
Fragments compose, closures parallelise, munch arbitrates. "Which token" questions are always longest-match + rule-order — apply both, in that order.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why does maximal munch tokenise `ifx` as an identifier, not keyword `if` + `x`?
(A) Keywords are checked first
(*B) Longest match wins before rule priority — 3-char identifier beats 2-char keyword; priority only breaks equal-length ties
(C) `x` is illegal
(D) Scanners read right-to-left
::: explanation
Two-stage arbitration: longest first, earliest-rule second. `ifx` isn't a tie (lengths differ) so priority never engages — length decides alone.
:::

::: quiz Q2: Foundational Concept
Subset construction can blow up exponentially but scanners stay small because:
(A) Languages are finite
(*B) Programming-language REs are tame (no pathological nesting) — reachable subsets stay near-linear in practice; theory bounds worst cases, not real lexers
(C) Minimisation runs first
(D) NFAs are already small
::: explanation
Exponential subsets need adversarial patterns (e.g. `(a|b)*a(a|b){n}`); keyword/identifier/number REs never approach them. Worst-case vs practical-case distinction is the expected nuance.
:::

::: quiz Q3: Foundational Concept
What does minimisation guarantee?
(A) Faster matching per character
(*B) Fewest states for the language (canonical DFA) — smaller tables, same speed class; per-character cost was already $O(1)$ table lookup
(C) Fewer transitions only
(D) Longest-match behaviour
::: explanation
Minimisation compresses *tables*, not asymptotics — scanning stays $O(n)$ either way. Table size (cache, memory) is the payoff; quote it as space, not time.
:::
