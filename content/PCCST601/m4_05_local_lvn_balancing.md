# Local Optimization: LVN & Tree-Height Balancing

**One block, two tricks — numbering values to kill repeats, and reshaping expression trees for parallelism.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Stamp Collector + Seesaw Engineer
**LVN** stamps each computed value with a number ($a+b$ → #1); recomputation with same-numbered operands reuses the stamp (skip the work, copy the temp). Kills (redefinitions) retire stamps. **Tree-height balancing** re-hangs lopsided expression seesaws ($((a+b)+c)+d$ → balanced pairs) so parallel evaluators finish in $\log n$ instead of $n$ steps — associativity exploited, height minimised.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 LVN algorithm sketch

Table: value-number per variable/expression; process quads in order: $x = y\ op\ z$ → look up (VN($y$), op, VN($z$)); hit ⇒ replace with copy ($x$ = temp); miss ⇒ new number + emit. Kills: redefinition assigns fresh numbers (old stamps for that variable die). Hash-consing makes lookup $O(1)$.

### 2.2 Tree-height balancing

Reassociate chains using associativity/commutativity into minimal-height trees; Sethi-Ullman need drops (parallelism rises). Safety: FP reassociation gated (fast-math only) — integers freely.

::: callout-formula KTU Formula Vault: Local Opts
LVN: **stamp (operands,op), reuse on hit, kill on redefine** · balancing: **rehang for height, associativity-powered**.
:::

::: callout-pitfall LVN Sees Values, Not Variables
`a+b` vs `c+d` with same-numbered operands are *equal* (reuse!) though textually different; same text after a kill differs (no reuse). Value-equality (numbers) vs name-equality (text) is LVN's whole point — compare stamps, not spellings.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
LVN-trace: $t_1=a+b$; $t_2=a+b$; $a=5$; $t_3=a+b$. Which compute, which copy? Then balance $((a+b)+(c+d))$ height commentary.
:::

::: step [Step 2: Execution] Stamps and Seesaws
1. $t_1$: miss → #1 (emit). $t_2$: operands same numbers → hit → $t_2=t_1$ (copy, no add!). $a=5$: kill $a$'s stamps (fresh #). $t_3$: $a$ renumbered → miss → compute (emit). Score: 2 computed, 1 copied.
2. Already height $2$ (balanced pairs) — optimal; a left-leaning $((a+b)+c)+d$ (height $3$) would rehang to this.
:::

::: step [Step 3: Conclusion] Final Result
Hit/copy/kill per quad is the LVN trace format; height-before/after is the balancing format. Kill-handling (step 3 above) is the most-skipped trace row — never omit redefinitions.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
LVN finds $a+b$ twice but $c+d$ (same values) once more. Copy allowed?
(A) No, texts differ
(*B) Yes — value numbers match (same operand numbers + same op), so it's the same computation regardless of spelling; emit a copy
(C) Only with DAGs
(D) Never across statements
::: explanation
Numbers abstract values from names: equal stamps = provably equal results (in-block, kills respected). Textual difference is irrelevant — stamps decide, the mechanism's raison d'être.
:::

::: quiz Q2: Foundational Concept
After `a = 5`, why must LVN kill $a$'s value number?
(A) Memory hygiene
(*B) Old stamps describe the *previous* $a$ — reusing them equates stale and fresh values (wrong-code bug); fresh number restarts $a$'s identity
(C) Tables overflow
(D) Standard requires it
::: explanation
Kills end value lifetimes: post-definition $a$ is a new value wearing an old name. Stale-stamp reuse is silent miscompilation — kill discipline is LVN's safety core.
:::

::: quiz Q3: Foundational Concept
Balancing $a+b+c+d$ left-leaning to paired form helps whom?
(A) Single-issue in-order cores equally
(*B) Parallel/superscalar evaluation (independent pairs run concurrently: depth $3\to2$, wider issue) and register pressure (Sethi-Ullman need falls) — shape serves resources
(C) Nobody measurably
(D) Only the parser
::: explanation
Height = critical path with infinite parallelism; numbering = register need. Rehanging optimises both downstream consumers — shape work now, resource wins later.
:::
