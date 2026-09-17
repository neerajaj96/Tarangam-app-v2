# Branch & Bound: Control Abstraction

**Live/E/dead nodes, LC-search vs. FIFO/LIFO, bounding functions, and how cost-bounds generalize backtracking's feasibility pruning.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Treasure Hunter with a Map Legend
Backtracking explores caves corridor by corridor, retreating only from dead ends. **Branch & bound** carries one extra instrument: a legend estimating the *best treasure any tunnel could possibly hold* (**bound**). At each fork it explores the most promising tunnel first (**least-cost search**), and abandons any tunnel whose legend reads worse than treasure already in hand (**prune by bound**). Same caves, far fewer footsteps — the map legend converts blind retreat into informed abandonment.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Vocabulary: Live, E, Dead

* The **state-space tree** enumerates partial solutions (level $i$ fixes decision $i$).
* A **live node** is generated but unexplored (waiting in the queue); the **E-node** (expansion node) is the live node currently being expanded; a node becomes **dead** once fully expanded or killed.
* **Bounding function** $\hat{c}(x)$: a cheap, optimistic estimate of the best achievable cost in $x$'s subtree (lower bound for minimization). If $\hat{c}(x) \ge$ **incumbent** (best complete solution found so far), kill $x$ — its subtree cannot improve anything.

### 2.2 Search Strategies: Who Becomes E-Node Next?

| Strategy | Next E-node | Personality |
|---|---|---|
| FIFO (breadth) | Oldest live node | Level-by-level sweep |
| LIFO (depth) | Newest live node | Backtracking in disguise |
| **LC (least-cost)** | Smallest $\hat{c}(x)$ | Always chase the most promising bound |

LC-search + strong bounds is the flagship combination (TSP next topic); FIFO/LIFO need only a ranking counter, LC needs a priority queue on $\hat{c}$.

### 2.3 B&B vs. Backtracking (Superset, Not Rival)

Backtracking prunes on **feasibility** (constraint violation ⇒ dead). Branch & bound prunes on feasibility **plus cost** ($\hat{c}(x)$ worse than incumbent ⇒ dead). Every backtracking search is B&B with the cost machinery idle; every B&B run on a pure satisfaction problem collapses to backtracking. Worst case stays exponential — bounds buy typical-case miracles, never complexity cures (Module 3's pitfall, inherited).

::: callout-formula KTU Formula Vault: B&B Facts
Nodes: **live → E-node → dead** · strategies: **FIFO / LIFO / LC** (least-$\hat{c}$) · prune when **$\hat{c}(x) \ge$ incumbent** · bound must be **optimistic** (never overestimate promise for minimization) **and cheap** (a bound slower than search defeats itself).
:::

::: callout-pitfall Optimistic Bounds Only — Direction Matters
For minimization, $\hat{c}$ must **underestimate** (admissible, like A* heuristics): an overestimate prunes the optimum and the answer goes wrong *silently*. For maximization, mirror it (overestimate). A bound erring toward pessimism isn't "safe" — it's a correctness bug wearing caution's clothes.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
4-job assignment-style selection: partial solution $x$ fixes jobs 1–2 costing 12 so far; remaining jobs 3–4 have cheapest-possible completions 9 and 11 (ignoring conflicts — optimistic by construction). Incumbent full solution costs 30. Bound $x$, decide its fate, and state which strategy picks the next E-node under LC vs FIFO.
:::

::: step [Step 2: Execution] Bounding and Choosing
$\hat{c}(x) = 12 + 9 + 11 = 32 \ge 30 =$ incumbent → **kill $x$ unexpanded** (no completion through $x$ can beat 30). LC-search would next expand the live node with smallest $\hat{c}$; FIFO would take the oldest regardless of promise — here LC's priority queue skips straight past $x$'s entire subtree.
:::

::: step [Step 3: Conclusion] Final Result
One addition ($12+9+11$) pruned an exponentially-sized subtree sight unseen — provided the bound was genuinely optimistic (conflict-ignoring estimates always are: reality can only cost *more*). That inequality direction is the whole algorithm; everything else is queue discipline.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
