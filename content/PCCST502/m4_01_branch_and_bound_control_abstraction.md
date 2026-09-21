---
id: m4_01_branch_and_bound_control_abstraction
courseCode: PCCST502
module: 4
sequence: 1
title: 'Branch & Bound: Control Abstraction'
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Sort live, E-node and dead states across FIFO, LIFO and LC search
  - Prune with optimistic bounds against the incumbent cost
  - Generalize backtracking feasibility into cost-bound pruning
concepts:
  - branch and bound
  - bounding functions
  - LC-search
prerequisites:
  - m3_05_backtracking_n_queens_state_space
examRelevance: high
tags:
  - branch-and-bound
  - design-paradigms
---
# Branch & Bound: Control Abstraction

**Live/E/dead nodes, LC-search vs. FIFO/LIFO, bounding functions, and how cost-bounds generalize backtracking's feasibility pruning.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Backtracking prunes dead ends (infeasible branches) — but optimization problems (cheapest tour, best assignment) need more: abandoning branches that are feasible yet *provably worse than a solution already in hand*. **Branch & Bound (B&B)** adds exactly this second blade: an optimistic cost estimate (bound) per branch plus a running best (incumbent), killing branches that cannot win.

::: callout-intuition Core Mental Model: The Treasure Hunter with a Map Legend
Backtracking explores caves corridor by corridor, retreating only from dead ends. **Branch & bound** carries one extra instrument: a legend estimating the *best treasure any tunnel could possibly hold* (**bound**). At each fork it explores the most promising tunnel first (**least-cost search**), and abandons any tunnel whose legend reads worse than treasure already in hand (**prune by bound**). Same caves, far fewer footsteps — the legend converts blind retreat into informed abandonment. Drop the caves now: bounds, incumbents, and queue disciplines below are the exact machinery.
:::

**Tiny toy example (minimize).** Two branches: left promises ≥ 20 (bound), right promises ≥ 40. Explore left first, find a full solution costing 25 (incumbent 25). Right's bound 40 ≥ 25 → kill it unvisited. One addition saved a whole subtree.

::: toggle What are `branch`, `bound`, `incumbent`, `E-node`, `live`, `dead`?
`Branch` = one fork's subtree (a partial decision plus all its completions). `Bound` $\hat{c}(x)$ = cheap optimistic estimate of the best cost under $x$ (lower bound for minimization — never overestimate promise). `Incumbent` = best complete solution found so far (the treasure in hand — only full solutions update it). `E-node` = the live node being expanded right now. `Live` = generated, waiting; `dead` = expanded or killed. Kill rule: $\hat{c}(x) \ge$ incumbent ⇒ nothing underneath wins ⇒ discard unvisited.
:::

::: toggle Why is the branch discarded (trace the toy)?
Left's bound 20 < ∞ (no incumbent yet) → explore first (LC picks smallest bound). Full solution 25 found → incumbent = 25. Right's bound 40 ≥ 25 → every completion through right costs ≥ 40 > 25 → cannot improve → kill without visiting (one comparison saved a subtree). Had the incumbent been 45 instead, right would survive (40 < 45 — still promising) — pruning compares against the *current* best, never a fixed threshold.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols and abbreviations:** E-node = expansion node (the live node currently being expanded); $\hat{c}(x)$ = bounding function (cheap optimistic estimate of the best cost in $x$'s subtree); incumbent = best complete solution found so far; FIFO = first-in-first-out (queue); LIFO = last-in-first-out (stack); LC = least-cost (priority queue on $\hat{c}$).

**Vocabulary — numbered states:**

1. The **state-space tree** enumerates partial solutions (level $i$ fixes decision $i$).
2. A **live node** is generated but unexplored (waiting); the **E-node** is being expanded now; a node is **dead** once expanded or killed.
3. **Bounding function** $\hat{c}(x)$: optimistic best cost below $x$ (lower bound for minimization). If $\hat{c}(x) \ge$ **incumbent**, kill $x$ — nothing underneath improves anything.

**Search strategies (who becomes E-node next?):**

| Strategy | Next E-node | Personality |
|---|---|---|
| FIFO (breadth) | Oldest live node | Level-by-level sweep |
| LIFO (depth) | Newest live node | Backtracking in disguise |
| **LC (least-cost)** | Smallest $\hat{c}(x)$ | Always chase the most promising bound |

LC + strong bounds is the flagship (TSP next); FIFO/LIFO need only a counter, LC needs a priority queue on $\hat{c}$.

**B&B vs backtracking (superset, not rival).** Backtracking prunes on **feasibility** (violation ⇒ dead). B&B prunes on feasibility **plus cost** ($\hat{c}(x)$ worse than incumbent ⇒ dead). Backtracking = B&B with cost machinery idle; B&B on pure satisfaction collapses to backtracking. Worst case stays exponential — bounds buy typical-case miracles, never complexity cures.

::: callout-formula KTU Formula Vault: B&B Facts
Nodes: **live → E-node → dead** · strategies: **FIFO / LIFO / LC** (least-$\hat{c}$) · prune when **$\hat{c}(x) \ge$ incumbent** · bound must be **optimistic** (never overestimate promise for minimization) **and cheap** (a bound slower than search defeats itself).
:::

::: callout-pitfall Optimistic Bounds Only — Direction Matters
For minimization, $\hat{c}$ must **underestimate** (admissible, like A* heuristics): an overestimate prunes the optimum and the answer goes wrong *silently*. For maximization, mirror it (overestimate). A bound erring toward pessimism isn't "safe" — it's a correctness bug wearing caution's clothes.
:::

---

<a id="worked-example"></a>
## 3. Worked example — bound, kill, and choose the next E-node

::: step [Step 1: Setup] Formulating the Problem
4-job selection: partial solution $x$ fixes jobs 1–2 costing 12; remaining jobs 3–4 have cheapest-possible completions 9 and 11 (conflicts ignored — optimistic by construction). Incumbent full solution costs 30. Bound $x$, decide its fate; say who LC vs FIFO expands next.
:::

::: step [Step 2: Execution] Bounding and Choosing
$\hat{c}(x) = 12 + 9 + 11 = 32 \ge 30 =$ incumbent → **kill $x$ unexpanded** (no completion through $x$ beats 30). LC-search next expands the live node with smallest $\hat{c}$; FIFO takes the oldest regardless of promise — here LC's queue skips $x$'s entire subtree.
:::

::: step [Step 3: Conclusion] Final Result
One addition ($12+9+11$) pruned an exponential subtree sight unseen — valid only because the bound was genuinely optimistic (conflict-ignoring estimates always are: reality costs *more*). Inequality direction is the whole algorithm; the rest is queue discipline.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Prune on $\ge$, not $>$: equality means "can at best tie" — ties never improve, so killing on equality is correct (more next note).
- Loose-but-optimistic bounds waste time, never correctness; tight-but-pessimistic bounds destroy correctness silently. Only one direction is safe.
- A bound costlier than the search it saves is self-defeating — "cheap" is a requirement, not a wish.

| Similar pair | Distinction that earns marks |
|---|---|
| Live vs E-node vs dead | Waiting vs expanding vs finished/killed (lifecycle, not priority) |
| FIFO vs LIFO vs LC | Oldest vs newest vs smallest-bound next (LC pairs with bounding) |
| Backtracking vs B&B | Feasibility pruning vs + cost-vs-incumbent pruning |

**Exam recap (facts an examiner rewards):** the three node states; the three strategies with LC's promise-chasing; prune rule $\hat{c}(x) \ge$ incumbent; optimistic direction (underestimate for minimization) + cheapness.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz A minimization B&B node x has bound ĉ(x) = 32 and the incumbent costs 30. A student argues for expanding x "in case the bound is loose." What is wrong?
() Nothing — loose bounds should always be double-checked by expansion
(*) If the bound is validly optimistic, no completion through x beats 30 — expanding it cannot improve the answer, only burn time; looseness wastes opportunity, never correctness
() The incumbent should be discarded instead
() Bounds apply only to maximization problems
::: explanation
Optimistic $\hat{c}(x)=32$ *certifies* the subtree's best at $\ge 32 > 30$. Expansion can't change the certificate — only re-verify it at exponential cost. Loose bounds prune *less* (more search), never wrongly; the danger direction is pessimistic bounds, which prune the optimum itself.
:::

::: quiz How do FIFO, LIFO, and LC search differ, and which pairs with bounding most powerfully?
() They differ only in memory usage and are otherwise identical
(*) FIFO takes oldest, LIFO newest (backtracking-like), LC takes smallest bound — LC pairs with bounding because it chases promise and finds strong incumbents early, making later pruning brutal
() LC search ignores bounds entirely by definition
() FIFO is always optimal regardless of bounds
::: explanation
Early strong incumbents are pruning fuel: every unit the incumbent drops kills more subtrees. LC finds good solutions fast by following optimism, so bound+LC compound — FIFO/LIFO stumble onto incumbents whenever queue order happens to favor them.
:::

::: quiz Backtracking is described as "B&B with cost machinery idle." What precisely does this mean?
() Backtracking cannot solve optimization problems even slowly
(*) On pure satisfaction problems (feasible/infeasible, no costs), B&B's bound/incumbent machinery has nothing to compare — pruning reduces to feasibility exactly, i.e. backtracking
() Backtracking is exponentially faster than B&B on all inputs
() The two methods share no code or concepts whatsoever
::: explanation
Remove costs and $\hat{c}(x) \ge$ incumbent is meaningless — only constraint propagation remains, which *is* backtracking. B&B strictly generalizes: feasibility pruning plus cost pruning, collapsing gracefully when costs vanish.
:::
