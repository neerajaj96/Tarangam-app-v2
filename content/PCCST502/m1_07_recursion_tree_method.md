---
id: m1_07_recursion_tree_method
courseCode: PCCST502
module: 1
sequence: 7
title: 'Solution of Recurrences: Recursion Tree Method'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Draw per-level node counts with shrinking sub-problem sizes
  - Price each level including the leaf floor separately
  - Sum geometric level progressions into closed totals
concepts:
  - recursion trees
  - per-level work
  - leaf cost
prerequisites:
  - m1_05_recurrence_equations_and_substitution_method
examRelevance: medium
tags:
  - recurrences
  - recursion-tree
---
# Solution of Recurrences: Recursion Tree Method

**Visualizing recursion depth, per-level work computation, leaf level cost, and summing geometric progressions.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Iteration unrolls recursion as algebra — but many learners *see* better than they symbol-push. The recursion tree turns the same unrolling into a picture: the root is the original call on size $n$, its children are the sub-calls, and so on down to base-case leaves. Write each node's own work beside it, total each *row*, then add the rows.

::: callout-intuition Core Mental Model
Draw a family tree of the calls. Root = the size-$n$ call. Children = the sub-problems it spawns; grandchildren = theirs. Leaves = base cases that stop. Next to each node write only *its own* work (not its children's). Row totals reveal the pattern instantly: rows shrinking → root rules; rows equal → count the rows; rows growing → leaves rule.
:::

**Tiny toy example.** $T(n) = 2T(n/2) + 1$ for $n = 4$: root work 1; two children on size 2, work 1 each (row = 2); four leaves on size 1 (row = 4). Total $1 + 2 + 4 = 7$ — rows doubling downward, leaves dominating already visible.

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols:** $a$ = children per node (recursive calls); $b$ = shrink factor (size divides by $b$); $f(n)$ = one node's own work; level $i$ counts from the root ($i = 0$).

**Building the tree for $T(n) = aT(n/b) + f(n)$:**

- Root: size $n$, work $f(n)$.
- Level 1: $a$ nodes of size $n/b$ → row total $a \cdot f(n/b)$.
- Level 2: $a^2$ nodes of size $n/b^2$ → row total $a^2 \cdot f(n/b^2)$.
- Level $i$: $a^i$ nodes of size $n/b^i$ → row total $a^i \cdot f(n/b^i)$.
- Bottom: size hits 1 when $n/b^i = 1 \Rightarrow i = \log_b n$; total levels $\log_b n + 1$.
- Leaves: $a^{\log_b n} = n^{\log_b a}$ of them (log identity), each $\Theta(1)$ → leaf floor $\Theta(n^{\log_b a})$.

**Grand total (sum of row totals):**
$$T(n) = \sum_{i=0}^{\log_b n} a^i \cdot f(n/b^i)$$
Three typical outcomes: rows **shrink** geometrically → root dominates, $T(n) = \Theta(f(n))$; rows **flat** → levels × row cost $= \Theta(f(n)\log_b n)$; rows **grow** → leaves dominate, $T(n) = \Theta(n^{\log_b a})$. These three are exactly *why* the Master Theorem (next) has three cases.

---

<a id="worked-example"></a>
## 3. Worked example — $T(n) = 3T(n/4) + n^2$

::: step [Step 1: Setup] Formulating the Problem
Solve $T(n) = 3T(n/4) + n^2$ ($a = 3$, $b = 4$, $f(n) = n^2$): count triples each level, size quarters, own-work squares.
:::

::: step [Step 2: Execution] Applying Core Algorithm
**Level 0:** 1 node, cost $n^2$. **Level 1:** 3 nodes of size $n/4$, each $(n/4)^2 = n^2/16$ → row $3n^2/16$. **Level 2:** 9 nodes of $n^2/256$ → row $(3/16)^2n^2$. **Level $i$:** row $(3/16)^i n^2$. Since $3/16 < 1$, rows shrink geometrically; $\sum_{i\ge0}(3/16)^i = \frac{1}{1-3/16} = \frac{16}{13}$, a constant.

```text
Level 0 (root):              [ cost n^2 ]                    total = n^2
                          /      |      \
Level 1:          [n^2/16]  [n^2/16]  [n^2/16]               total = 3n^2/16
                    /|\         ...         ...
Level 2:         9 nodes, each n^2/256                      total = 9n^2/256 = (3/16)^2 n^2
    ...
Level i:         3^i nodes, each (n/4^i)^2                   total = (3/16)^i n^2  -->  shrinking
```
:::

::: anim recursion-tree Tree Growth, Level by Level
Watch the root sprout 3 children, then 9 grandchildren — level totals printed beside each row, each row (3/16)th the last, the root's dominance made visible.
:::

::: step [Step 3: Conclusion] Final Result
Rows shrink, root dominates: $T(n) = \Theta(n^2)$. Matches Master Case 1, since $f(n) = n^2$ outgrows $n^{\log_4 3} \approx n^{0.79}$ polynomially.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Node count multiplies by $a$ ($a^i$), size divides by $b$ ($n/b^i$) — swapping them is the classic slip.
- The leaf floor ($n^{\log_b a}$ leaves) is a *separate* term: in growing-row trees it wins; in shrinking ones it is already absorbed.
- Row totals, not node counts, decide: 9 nodes of tiny cost can still total less than 1 big root.

| Similar pair | Distinction that earns marks |
|---|---|
| $a^i$ vs $n/b^i$ | Node count (grows) vs sub-problem size (shrinks) at level $i$ |
| Root-dominated vs leaf-dominated | Shrinking rows $\Theta(f(n))$ vs growing rows $\Theta(n^{\log_b a})$ |
| Recursion tree vs iteration method | Picture with row sums vs algebra with level-$k$ formula — same total |

**Exam recap (facts an examiner rewards):** level-$i$ row total $a^i f(n/b^i)$; depth $\log_b n$; leaves $n^{\log_b a}$; the three row behaviours prefigure the three Master cases.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz In a recursion tree for $T(n) = aT(n/b) + f(n)$, how many nodes exist at level $i$, and what is the size of the sub-problem at each of those nodes?
() $b^i$ nodes, each of size $n/a^i$
(*) $a^i$ nodes, each of size $n/b^i$
() $a \cdot i$ nodes, each of size $n - i$
() $i$ nodes, each of size $n/i$
::: explanation
Each node spawns $a$ children (since the recurrence has $a$ recursive calls per call), so the node count multiplies by $a$ each level, giving $a^i$ nodes at level $i$. The sub-problem shrinks by a factor of $b$ each level (division by $b$), giving size $n/b^i$ at level $i$.
:::

::: quiz If, when summing level totals in a recursion tree, the total work *decreases* geometrically as you go from the root toward the leaves, which part of the tree dominates the overall complexity?
(*) The root (top level)
() The leaves (bottom level)
() All levels contribute equally
() The middle level always dominates
::: explanation
A geometric series that shrinks from level to level is dominated by its first (largest) term — here, the root's own cost $f(n)$ — because the sum of all the remaining, smaller terms converges to at most a constant multiple of that first term.
:::

::: quiz For $T(n) = 3T(n/4) + n^2$, the recursion tree method concludes that $T(n)$ is:
() $\Theta(n \log n)$
(*) $\Theta(n^2)$
() $\Theta(n^{\log_4 3})$
() $\Theta(n^3)$
::: explanation
Since the per-level totals form a shrinking geometric series (ratio $3/16 < 1$), the root's own cost $n^2$ dominates the entire sum, giving $T(n) = \Theta(n^2)$ — as shown step by step in the worked example.
:::
