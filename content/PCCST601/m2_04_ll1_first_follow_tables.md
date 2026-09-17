# LL(1): FIRST, FOLLOW & Table Construction

**The prediction sets behind table-driven parsing — fixpoint computation, table filling, and conflict reading.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Restaurant Order Pads
**FIRST($\alpha$)** = dishes a table *could* start with (possible first tokens). **FOLLOW($A$)** = what the *next* table might order after $A$ finishes (needed when $A$ can vanish via $\varepsilon$). The **LL(1) table** is the waiter's pad: row = current craving (nonterminal), column = dish arriving (token) → exactly one recipe (production). Two recipes in one cell = shouting match (conflict → not LL(1)).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 FIRST/FOLLOW rules

* FIRST: terminal $a$: $\{a\}$; $\varepsilon$: $\{\varepsilon\}$; $X_1\ldots X_n$: accumulate FIRST($X_i$), crossing only nullable prefixes; $A\to\alpha$: union over productions; iterate to fixpoint.
* FOLLOW: $\$ \in$ FOLLOW($S$); $A\to\alpha B\beta$: FIRST($\beta$)$\setminus\varepsilon \subseteq$ FOLLOW($B$); if $\beta\Rightarrow^*\varepsilon$: FOLLOW($A$) $\subseteq$ FOLLOW($B$); iterate.
* Table: for $A\to\alpha$, for each $a\in$FIRST($\alpha$): $M[A,a] = $ production; if $\varepsilon\in$FIRST($\alpha$): also for $a\in$FOLLOW($A$). Multiple entries = conflict.

::: callout-formula KTU Formula Vault: LL(1)
FIRST = **can-start-with** · FOLLOW = **can-follow** (needs nullability) · cell = **one production** · two = **conflict**.
:::

::: callout-pitfall FOLLOW Needs Nullable $\beta$ Check
Adding FOLLOW($A$) to FOLLOW($B$) when $\beta$ *cannot* vanish pollutes sets with impossible tokens — phantom conflicts or missed real ones. Nullability verdict on $\beta$ precedes every FOLLOW propagation.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$E \to TE'$, $E' \to +TE'\mid\varepsilon$, $T \to FT'$, $T' \to *FT'\mid\varepsilon$, $F \to (E)\mid id$. Compute FIRST/FOLLOW for $E', T'$ and fill their table rows.
:::

::: step [Step 2: Execution] Sets Then Cells
1. FIRST($E'$) $= \{+,\varepsilon\}$; FIRST($T'$) $= \{*,\varepsilon\}$. FOLLOW($E'$) $=$ FOLLOW($E$) $= \{), \$\}$; FOLLOW($T'$) $=$ FIRST($E'$)$\setminus\varepsilon \cup$ FOLLOW($T$) $= \{+, ), \$\}$.
2. Row $E'$: $M[E',+] = E'\to+TE'$; $M[E',)] = M[E',\$] = E'\to\varepsilon$. Row $T'$: $M[T',*] = T'\to*FT'$; $M[T',+], M[T',)], M[T',\$] = T'\to\varepsilon$. No doubled cells ⇒ LL(1) ✓.
:::

::: step [Step 3: Conclusion] Final Result
Nullable-marked FIRST, FOLLOW with $\varepsilon$-awareness, cells by rule, conflict scan. The row table *is* the LL(1) verdict — show it, don't just claim it.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
FIRST of $ABC$ where $A\Rightarrow^*\varepsilon$, $B$ starts $\{b\}$, $C$ starts $\{c\}$?
(A) $\{b\}$
(*B) $\{b\}$ — $A$ contributes nothing visible (nullable), $B$'s $\{b\}$ seals it; $C$ unreachable-first since $B$ non-nullable
(C) $\{a,b,c\}$
(D) $\{\varepsilon\}$
::: explanation
Cross nullable $A$ silently; stop at first non-nullable $B$. $\varepsilon$ joins only if *all* vanish. Prefix-crossing discipline is the computation — narrate each hop.
:::

::: quiz Q2: Foundational Concept
Why does FOLLOW($B$) need FIRST($\beta$) for $A\to\alpha B\beta$?
(A) It doesn't
(*B) Whatever $\beta$ can start with may immediately follow $B$ in a derivation — the adjacency is positional: $B$'s successors begin where $\beta$ begins
(C) FIRST is bigger
(D) Convention only
::: explanation
Derivation adjacency $B\beta \Rightarrow B\,b\ldots$ puts $b\in$FIRST($\beta$) right after $B$'s yield. Positional reasoning (who sits next) derives every FOLLOW rule — no memorised magic.
:::

::: quiz Q3: Foundational Concept
Table cell $M[E, (]$ holds two productions. Verdict and fixes?
(A) Fine, pick either
(*B) Not LL(1) — nondeterministic choice; fix by left-factoring (if shared prefix), recursion surgery, or grammar redesign; alternatively stronger parsing (LR)
(C) Add more lookahead columns
(D) Delete a production
::: explanation
Doubled cell = one token, two legal moves = unpredictability. Surgery targets the *cause* (common prefixes/recursion); method-switch (LR) admits defeat gracefully with justification.
:::
