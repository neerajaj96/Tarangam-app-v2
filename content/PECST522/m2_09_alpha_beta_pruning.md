# Alpha-Beta Pruning: Same Move, Less Work

**Bounds that behead branches — $\alpha$/$\beta$ window mechanics, the 4-of-6 trace on the minimax tree, move ordering that doubles the cut rate.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Already-Beaten Escape Hatch
While exploring a MIN branch, the moment it proves *worse-or-equal* to an option MAX already holds ($\beta \le \alpha$), further leaves cannot change the decision — so stop looking. Alpha-beta never alters the move (same minimax value guaranteed); it merely refuses to price branches whose verdict is already sealed. Best ordering (strong moves first) seals verdicts fastest.
:::

::: anim alphabeta-cut Two Leaves Never Born
The left branch sets $\alpha = 3$; the right branch's first leaf ($2$) falls below it and the remaining two leaves are cut — identical move, one-third less work.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Window mechanics

$\alpha$ = best value MAX is assured (rises); $\beta$ = best value MIN is assured (falls). At a MIN node with inherited $\alpha$: any child value $\le \alpha$ triggers a **beta-cutoff** (prune rest); symmetric **alpha-cutoff** at MAX nodes when a child $\ge \beta$. Cutoffs need bounds from *already-explored* siblings — left-to-right order decides everything.

### 2.2 Ordering economics

Random order: $\approx O(b^{3m/4})$ — good. Perfect order (best moves first): $O(b^{m/2})$ — effective depth doubled. Worst order (worst first): $O(b^m)$ — zero cuts, full minimax price. Iterative deepening feeds move ordering almost for free (shallow results sort deep search).

::: callout-formula KTU Formula Vault: Alpha-Beta
$\alpha$ rises (MAX assured) · $\beta$ falls (MIN assured) · cut when $\beta \le \alpha$ · same value as minimax, always · best order $O(b^{m/2})$, worst $O(b^m)$.
:::

Cutoff direction is the exam trap: MIN nodes cut on $\beta \le \alpha$ using the *inherited* $\alpha$ — students who compare against the node's own running minimum instead of the window prune branches that could still matter.

::: callout-pitfall Pruning the Best Move
Alpha-beta prunes only branches proven irrelevant to the root decision. An option claiming it "risks missing the optimal move for speed" confuses it with cutoff-and-evaluate approximations — exact pruning never changes the backed-up value, by proof, not by luck.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Same tree as M2.8: MAX root ($\alpha = -\infty$, $\beta = +\infty$) over MIN $A$ (leaves $3, 12, 8$) and MIN $B$ (leaves $2, 4, 6$), explored left to right. Trace every bound and count evaluated leaves.
:::

::: step [Step 2: Execution] Bounds Closing In
Node $A$ (inherits $\alpha = -\infty$): leaf $3$ sets running min $3$; leaves $12$, $8$ cannot lower it — $A$ returns $3$. Root $\alpha$ rises to $3$. Node $B$ (inherits $\alpha = 3$, $\beta = +\infty$): first leaf $2$ sets running min $2 \le \alpha = 3$ — cutoff! Leaves $4$, $6$ are never generated. $B$ returns $2$ (at most $2$, provably no better than $3$). Root $= \max(3, 2) = 3$.
:::

::: step [Step 3: Conclusion] Final Result
Same value $3$, same move (toward $A$), but $4$ leaves evaluated instead of $6$ — $2$ pruned. The cut needed the left branch *first*: exploring $B$ before $A$ would have cut nothing ($\alpha$ still $-\infty$), which is why ordering economics (best-first) is half the topic.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Cutoff Arithmetic
MIN node, inherited $\alpha = 5$, children evaluated so far: $7$. Next child returns $4$. Action?
(A) Continue, $4$ may still improve MIN below $7$
(*B) Prune the rest — running min is now $4 \le \alpha = 5$, so MAX already holds $5$ elsewhere and this branch cannot be chosen regardless of remaining leaves
(C) Raise $\alpha$ to $7$
(D) Reorder the evaluated children
::: explanation
The window test fires on the *running* minimum versus inherited $\alpha$: $4 \le 5$ seals it. Waiting for "all children" reverts to minimax — the cutoff exists precisely to skip that labour.
:::

::: quiz Q2: Ordering Economics
Same tree, $6$ leaves, worst-first order. Evaluations?
(A) $3$, ordering never matters
(*B) All $6$ — bounds arrive too late to cut anything (every branch looks best until refuted), so worst order pays full minimax price with alpha-beta overhead added
(C) $0$, everything prunes
(D) $6$ but a different move results
::: explanation
Cuts need early good news: best-first sets tight windows immediately, worst-first explores doomed branches fully before learning better. Order decides the discount — the value stays $3$ either way.
:::

::: quiz Q3: Exactness Guarantee
"Alpha-beta may change the chosen move." Verdict?
(A) True under time pressure
(*B) False — pruned branches are proven unable to affect the root value, so the returned move equals minimax's on every input; speed differs, decisions never
(C) True with iterative deepening
(D) True past depth $4$
::: explanation
Cutoff condition ($\beta \le \alpha$) is a proof of irrelevance, not a heuristic guess. Identical values on all inputs is the theorem — approximations (depth caps, evaluations) live one topic over, in cutoff play.
:::
