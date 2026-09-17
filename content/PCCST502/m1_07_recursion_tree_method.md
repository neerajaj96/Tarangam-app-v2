# Solution of Recurrences: Recursion Tree Method

**Visualizing recursion depth, per-level work computation, leaf level cost, and summing geometric progressions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model
Imagine drawing an actual family tree for a recursive algorithm's calls. The very top (the "root") is the original call, on the full problem of size $n$. It has some children — the sub-problems it recurses into — each drawn as a node one level below, and each of *those* has its own children, one level further down, and so on, until you reach the bottom row of the tree: the "leaves," which are base cases that don't recurse any further.

The **recursion tree method** makes this drawing literal, and next to *each node*, you write down how much work that particular call does — not counting its children's work, just its own. Then the trick is: add up all the work *level by level* (every node at depth 0, then every node at depth 1, then depth 2, ...), and finally add up the totals across all levels. This turns an abstract recurrence equation into something you can literally see and count, which is often the most intuitive way to *discover* what the total complexity should be — even before you formally prove it (with the substitution method, for instance).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

**Building the tree for $T(n) = aT(n/b) + f(n)$:**
- The **root** represents the original problem, size $n$, doing $f(n)$ work at this level (not counting the recursive calls).
- The root has $a$ children, each representing a sub-problem of size $n/b$ — so **level 1** has $a$ nodes, each contributing $f(n/b)$ work, for a level total of $a \cdot f(n/b)$.
- **Level 2** has $a^2$ nodes (each of the $a$ level-1 nodes spawns $a$ children), each of size $n/b^2$, contributing a level total of $a^2 \cdot f(n/b^2)$.
- In general, **level $i$** has $a^i$ nodes, each of size $n/b^i$, contributing a level total of $a^i \cdot f(n/b^i)$.
- The tree **bottoms out** (reaches leaves / base cases) once the sub-problem size shrinks to $1$, i.e. $n/b^i = 1 \Rightarrow i = \log_b n$. So the tree has $\log_b n + 1$ levels (level 0 through level $\log_b n$).
- The **number of leaves** is $a^{\log_b n}$ (using the identity $a^{\log_b n} = n^{\log_b a}$), and since each leaf typically does $\Theta(1)$ work (it's a base case), the **total leaf-level cost** is $\Theta(n^{\log_b a})$.

**Total cost = sum of every level's total, across all levels:**
$$T(n) = \sum_{i=0}^{\log_b n} a^i \cdot f(n/b^i)$$
Once you have this sum, you evaluate it as a series (often geometric), and there are three typical outcomes, depending on whether the *per-level totals* are growing, shrinking, or staying constant as $i$ increases:
- If per-level cost **decreases** geometrically as you go down the tree, the **root's** cost dominates the whole sum, and $T(n) = \Theta(f(n))$.
- If per-level cost stays **roughly the same** at every level, the total is (number of levels) × (cost per level) $= \Theta(f(n)\log_b n)$.
- If per-level cost **increases** geometrically as you go down, the **leaves** dominate the whole sum, and $T(n) = \Theta(n^{\log_b a})$.

(Sharp-eyed readers will notice these three outcomes correspond directly to the three cases of the Master Theorem, covered next — the recursion tree method is, in a real sense, exactly *why* the Master Theorem's three cases exist and take the form they do.)

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Solve $T(n) = 3T(n/4) + n^2$ using the recursion tree method (here $a=3$, $b=4$, $f(n)=n^2$ — extra work at each level is $n^2$, the sub-problem count multiplies by 3, and sub-problem size divides by 4 at each level).
:::

::: step [Step 2: Execution] Applying Core Algorithm
**Level 0 (root):** 1 node of size $n$, cost $n^2$.
**Level 1:** 3 nodes, each of size $n/4$, each costing $(n/4)^2 = n^2/16$; level total $= 3 \cdot n^2/16$.
**Level 2:** 9 nodes, each of size $n/16$, each costing $(n/16)^2 = n^2/256$; level total $= 9 \cdot n^2/256 = (3/16)^2 n^2$.
**Level $i$ (general pattern):** level total $= (3/16)^i \cdot n^2$.
**Recognising the shape:** since $3/16 < 1$, each successive level's total is *smaller* than the one above it — a geometric series that shrinks — meaning the **root's** contribution ($n^2$) dominates the entire sum, and the sum of the full (infinite, in the limit) geometric series $\sum_{i=0}^{\infty} (3/16)^i$ converges to a constant ($\frac{1}{1-3/16} = \frac{16}{13}$), not growing with $n$.

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

::: step [Step 3: Conclusion] Final Result
Because the level totals shrink geometrically, the sum across all $\log_4 n$ levels is bounded by a constant multiple of the root's cost alone: $T(n) = \Theta(n^2)$. This matches Master Theorem Case 1 (covered next), where the "extra work" function $f(n)$ grows polynomially faster than $n^{\log_b a} = n^{\log_4 3} \approx n^{0.79}$, so the root dominates.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
