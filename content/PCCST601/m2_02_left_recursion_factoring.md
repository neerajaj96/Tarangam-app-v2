# Left Recursion & Left Factoring

**Two grammar surgeries for top-down parsing — why loops choke predictors and how common prefixes delay decisions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Hallway of Mirrors vs Shared Driveway
**Left recursion** ($A \to A\alpha$) is a hallway of mirrors: a predictor expanding $A$ meets $A$ again *before eating input* — infinite regress, zero progress. Surgery replaces the loop with a tail-repeater ($A \to \beta A'$, $A' \to \alpha A' \mid \varepsilon$). **Left factoring** fixes shared driveways ($A \to \alpha\beta_1 \mid \alpha\beta_2$): postpone the choice until past the shared $\alpha$ ($A \to \alpha A'$, $A' \to \beta_1 \mid \beta_2$) — decide with more input in hand.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Eliminating (immediate) left recursion

$$A \to A\alpha_1\mid\cdots\mid A\alpha_m\mid\beta_1\mid\cdots\mid\beta_n \ (\beta\text{'s not }A\text{-leading})$$

becomes $A \to \beta_1A'\mid\cdots\mid\beta_nA'$, $A' \to \alpha_1A'\mid\cdots\mid\alpha_mA'\mid\varepsilon$. Indirect recursion ($A\Rightarrow^+\!A$ via others) needs ordered substitution first (Dragon algorithm: for $i$: substitute $A_j, j<i$ into $A_i$, then kill immediate).

### 2.2 Left factoring

$$A \to \alpha\beta_1\mid\cdots\mid\alpha\beta_n\mid\gamma \;\Rightarrow\; A \to \alpha A'\mid\gamma,\ A' \to \beta_1\mid\cdots\mid\beta_n$$

Maximal common prefixes; repeat until no shared prefix (or until LL(1)-ready).

::: callout-formula KTU Formula Vault: Surgeries
Left-rec: **$\beta A'$ + $\alpha A'\mid\varepsilon$** · factoring: **shared $\alpha$ out front** · indirect: **substitute in order first**.
:::

::: callout-pitfall Factoring ≠ Recursion Removal
Factored grammars can *still* left-recurse ($E \to T E'$, $E' \to +TE'\mid\varepsilon$ is fine, but $A\to Aa\mid b$ unfactored-yet-recursive loops). Apply *both* surgeries when needed, in either order — check each property separately.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Transform for top-down parsing: (a) $E \to E+T \mid T$, (b) $S \to if\ E\ then\ S \mid if\ E\ then\ S\ else\ S \mid a$.
:::

::: step [Step 2: Execution] Loop, Then Driveway
1. (a): $\beta = \{T\}$, $\alpha = \{+T\}$ → $E \to TE'$, $E' \to +TE' \mid \varepsilon$.
2. (b): shared `if E then S` → $S \to if\ E\ then\ S\ S' \mid a$, $S' \to else\ S \mid \varepsilon$ (dangling-else ambiguity *remains* — factoring aids prediction, ambiguity needs precedence rules; say so!).
:::

::: step [Step 3: Conclusion] Final Result
$\beta$-first listing, $\varepsilon$-terminated tails, shared-prefix hoisting. The dangling-else footnote shows surgical honesty — factoring ≠ disambiguation.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Eliminate left recursion: $A \to Aa \mid Ab \mid c \mid d$.
(A) $A \to cA'\mid dA'$, $A' \to A'\mid\varepsilon$
(*B) $A \to cA'\mid dA'$, $A' \to aA'\mid bA'\mid\varepsilon$ — $\beta$'s seed, $\alpha$'s loop, $\varepsilon$ exits
(C) $A \to A'c\mid A'd$
(D) Unchanged, it's fine
::: explanation
Non-$A$-leading $\{c,d\}$ seed $A$; $A$-leading tails $\{a,b\}$ loop on $A'$. (A) loops $A'$ on itself (still recursive!); (C) mirrors backwards — $\beta$-seed/$\alpha$-loop order is the whole pattern.
:::

::: quiz Q2: Foundational Concept
Why does left recursion hang a recursive-descent parser?
(A) Stack overflow from deep trees
(*B) Expanding $A$ immediately re-invokes $A$ with no input consumed — infinite procedure recursion before any token is matched
(C) It confuses the scanner
(D) Grammars forbid it
::: explanation
Prediction without progress: same procedure, same input position, forever. The rewrite converts recursion-on-nothing into iteration-over-$\alpha$ (the $A'$ loop) — progress per call restored.
:::

::: quiz Q3: Foundational Concept
Left-factor $S \to abS \mid abT \mid c$. Result?
(A) $S \to aS'\mid c$
(*B) $S \to abS'\mid c$, $S' \to S\mid T$ — hoist the *maximal* shared prefix `ab`, not just `a`
(C) $S \to S'ab\mid c$
(D) Already factored
::: explanation
Maximal prefix `ab` out front; $S'$ chooses remainders $S,T$. Hoisting only `a` leaves `bS|bT` still sharing — factor *maximally*, then re-check.
:::
