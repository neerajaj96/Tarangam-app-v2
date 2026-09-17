# Grammar Transformations Drill: All Variations

**Left recursion (direct + indirect), factoring (nested + maximal), and combined pipelines — pure workout.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Assembly Line Order
Indirect first (substitute $A_j, j<i$), immediate second ($\beta$-seed/$\alpha$-loop), factoring third (maximal prefixes), nullability audit throughout. Fixed pipeline order prevents rework — surgery in sequence, verify at the end.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Pipeline and checks

1. Order nonterminals; for each $A_i$: substitute earlier $A_j$ bodies; kill immediate left recursion.
2. Factor maximal common prefixes (repeat).
3. Verify: no $A$-leading productions, no shared prefixes, FIRST/FOLLOW conflict scan (next drill confirms via tables).

::: callout-formula KTU Formula Vault: Pipeline
Substitute **earlier first** · seed **$\beta$**, loop **$\alpha$** · hoist **maximal** · verify **both properties**.
:::

::: callout-pitfall Substitution Direction
Substitute *earlier* ($j<i$) into *later* ($i$) — reversed direction manufactures recursion instead of removing it. Index discipline first, formulas second.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$S \to Aa \mid b$; $A \to Ac \mid Sd \mid e$. Remove left recursion (order $S < A$), then factor anything factorable.
:::

::: step [Step 2: Execution] Order, Substitute, Kill, Hoist
1. $i=S$: no earlier, no immediate recursion ($Aa$ leads with $A$, not $S$) — untouched.
2. $i=A$: substitute $S$ (earlier): $A \to Ac \mid Aad \mid bd \mid e$. Immediate recursion with $\alpha=\{c, ad\}$, $\beta=\{bd, e\}$: $A \to bdA' \mid eA'$; $A' \to cA' \mid adA' \mid \varepsilon$.
3. $S \to Aa\mid b$: no shared prefix ($A\ldots$ vs $b$) — nothing to factor. Done: recursion-free, prefix-clean.
:::

::: step [Step 3: Conclusion] Final Result
Substitution exposed the hidden recursion ($Aad$); $\beta/\alpha$ split killed it; prefix scan found nothing. Hidden-recursion exposure is the indirect case's whole lesson.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$S \to Sab \mid Sc \mid d$. Transformed?
(A) $S \to dS'$, $S' \to SabS'\mid\varepsilon$
(*B) $S \to dS'$, $S' \to abS'\mid cS'\mid\varepsilon$ — two $\alpha$ tails ($ab$, $c$) loop, $\beta = \{d\}$ seeds
(C) $S \to S'd$, $S' \to ab\mid c$
(D) Already clean
::: explanation
$\alpha$-set $= \{ab, c\}$ (both $S$-leading tails), $\beta = \{d\}$. Multi-$\alpha$ just means multi-loop-alternatives on $A'$ — same pattern, longer tail list.
:::

::: quiz Q2: Foundational Concept
$A \to xyA \mid xyB \mid z$. Factor maximally:
(A) $A \to xA'\mid z$
(*B) $A \to xyA'\mid z$, $A' \to A\mid B$ — hoist full `xy`, choose remainders
(C) $A \to A'xy\mid z$
(D) $A \to xy\mid z$
::: explanation
Maximal prefix is `xy` (not `x` — hoisting `x` leaves `yA|yB` still sharing). Full-hoist then verify $A'$ branches disjoint ($A$ vs $B$ start differently — predictor-safe).
:::

::: quiz Q3: Foundational Concept
After surgery, how do you *prove* top-down readiness?
(A) Eyeball it
(*B) Compute FIRST/FOLLOW, build the LL(1) table, confirm zero multiply-filled cells — the table is the certificate (next drill runs it)
(C) Run the parser once
(D) Count productions
::: explanation
Surgery is preparation; the table is verification. A single test parse proves one path; conflict-freedom proves *all* paths — certificates beat anecdotes.
:::
