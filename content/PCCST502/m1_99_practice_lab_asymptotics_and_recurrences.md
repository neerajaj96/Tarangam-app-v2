# Module 1 Practice Lab: Asymptotic Proofs & Recurrence Solvers

**Stepped calculations for Master Theorem cases, recursion tree summations, and AVL insertion rotation sequences.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model
Every skill in this module — proving a Big-O bound, solving a recurrence three different ways, and rebalancing an AVL tree — is something you only truly own once you've done it yourself, by hand, several times, without a worked example to lean on. Reading a derivation is like watching someone else ride a bicycle: it looks completely obvious right up until *you* get on and have to balance yourself.

This practice lab is a deliberately varied set of drills that force you to apply Module 1's tools in combination — sometimes recognising which Master Theorem case applies, sometimes drawing a small recursion tree from scratch, sometimes tracing through several AVL insertions in a row and catching every rotation as it happens. The goal isn't new theory; it's building the reflex of *pattern recognition* — glancing at a recurrence or a tree and immediately knowing which technique from this module to reach for.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

This lab deliberately doesn't introduce new formulas — it's a checklist of the tools from this module, and *when* to reach for each one:

- **Given a loop (single, nested, or logarithmic)** → use the summation method from "Complexity Analysis of Iterative Loops": express total iterations as a sum, evaluate using arithmetic/geometric series formulas, extract the dominant term.
- **Given a recurrence and asked to *prove* a specific bound** → use the **substitution method**: guess the bound, assume it for smaller inputs, substitute into the recurrence, verify algebraically.
- **Given a recurrence and asked to *find* the bound (with no guess supplied)** → use the **iteration/expansion method** (unroll level by level until the pattern is clear) or the **recursion tree method** (draw it, sum level totals) — whichever you find more visual.
- **Given a recurrence in the exact form $T(n)=aT(n/b)+f(n)$** → check whether it fits one of the three **Master Theorem** cases by comparing $f(n)$ to $n^{\log_b a}$; if it fits cleanly, this is the fastest route to an answer.
- **Given a sequence of AVL insertions or deletions** → after each single insertion/deletion, walk from the changed node up toward the root, recomputing balance factors, and apply the correct rotation (LL/RR/LR/RL) the moment any $|BF|>1$ appears, before moving on to the next operation.

**A general debugging habit worth building now:** whenever a derived complexity looks suspicious (e.g., you calculated $O(n)$ for something that clearly does nested work over all pairs of elements), re-derive it a second way — if the loop-based summation and the recursion-tree method (for an equivalent recursive version of the same task) disagree, you've made an arithmetic slip somewhere, and cross-checking is far faster than re-reading your own derivation looking for the mistake.

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Mixed drill: (a) solve $T(n) = 4T(n/2) + n^2$ using the Master Theorem; (b) insert the keys $10, 20, 30, 40, 50$ in that order into an initially empty AVL tree, and identify every rotation triggered along the way.
:::

::: step [Step 2: Execution] Applying Core Algorithm
**(a)** Here $a=4, b=2$, so $\log_b a = \log_2 4 = 2$, reference function $n^2$. Compare to $f(n)=n^2$: this is an *exact match* ($f(n) = \Theta(n^{\log_b a})$), so **Case 2** applies.
**(b)** Insert $10$: tree is just $\{10\}$, balanced. Insert $20$: becomes $10$'s right child; $BF(10) = -1$, fine. Insert $30$: goes right of $10$, then right of $20$; check $BF(20)$: left empty ($-1$), right child $30$ (height $0$) gives $-1$ — fine, no rotation. Check $BF(10)$: left height $-1$, right height (subtree rooted at 20, now height 1) $=1$; $BF(10) = -1-1=-2$ — imbalance! This is caused by inserting into the right subtree of the right child (30 went right of 20, which is right of 10) — an **RR** shape. Fix: single left rotation at $10$. Result: $20$ becomes root, $10$ its left child, $30$ its right child — balanced. Insert $40$: goes right of $30$; $BF(30)=-1$, fine; $BF(20)$ recomputed: right subtree (rooted at 30) height is now $1$, left subtree (just node 10) height $0$; $BF(20)=0-1=-1$, still fine, no rotation. Insert $50$: goes right of $40$; check up the chain: $BF(40)=-1$ fine; $BF(30)$: right subtree (rooted at 40) now height $1$, left subtree height $-1$ (empty); $BF(30) = -1-1=-2$ — imbalance, another **RR** shape (50 went right of 40, which is right of 30). Fix: single left rotation at $30$.
:::

::: step [Step 3: Conclusion] Final Result
**(a)** By Case 2, $T(n) = \Theta(n^2 \log n)$.
**(b)** Two rotations were triggered in total — both RR (single left rotations), once at node $10$ (after inserting $30$) and once at node $30$ (after inserting $50$) — leaving a final, fully balanced 5-node AVL tree with root $20$: left child $10$, right child $40$ (whose own children are $30$ and $50$). This kind of "insert several keys in increasing order, watch it self-correct repeatedly" drill is exactly what would otherwise degenerate into a useless straight-line BST — the whole point of Module 1's AVL topics.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz When a recurrence is given in the exact form $T(n) = aT(n/b) + f(n)$ and you can cleanly classify $f(n)$ against $n^{\log_b a}$, which technique is usually fastest?
() Always draw a full recursion tree regardless
(*) Apply the Master Theorem directly, since it's a shortcut precisely for recurrences of this standard form
() Always use the substitution method with a random guess
() Rewrite the recursion as an iterative loop first
::: explanation
The Master Theorem exists exactly to shortcut the recursion-tree/iteration reasoning for this common recurrence shape — if $f(n)$ classifies cleanly into one of the three cases, you get the answer immediately without unrolling anything by hand.
:::

::: quiz While inserting keys in strictly increasing order into an AVL tree (e.g., 10, 20, 30, 40, 50, ...), what pattern of rotations would you expect to repeatedly see, and why?
() LR and RL double rotations, because increasing order always creates zig-zag shapes
(*) RR single (left) rotations, because each new maximum key extends a straight line down the right side, repeatedly triggering the "straight-line-leaning-right" imbalance
() No rotations are ever needed for sorted insertion order
() LL single rotations, because the tree leans left
::: explanation
Inserting strictly increasing keys always extends the rightmost path of the tree — exactly the RR (straight-line-right) imbalance shape — so AVL trees repeatedly trigger single left rotations to keep correcting this lean, which is exactly the mechanism that prevents the tree from ever becoming the fully degenerate, $O(n)$-height line that a plain (non-self-balancing) BST would become under the same insertion order.
:::

::: quiz If two different valid derivation methods (e.g., the loop-summation method and the recursion-tree method applied to an equivalent recursive formulation) give *different* final Big-O answers for what should be the same underlying algorithm, what does this most likely indicate?
() Both answers are correct simultaneously and no contradiction exists
(*) An arithmetic or setup error was made in one of the derivations, and re-deriving via the other method is a fast way to locate the mistake
() Big-O notation is inherently inconsistent between methods
() The algorithm's complexity is undefined
::: explanation
A given algorithm has one true asymptotic complexity; every valid analysis method, applied correctly, must agree on it. A disagreement between two independently-applied methods is a strong, practical signal to recheck your work — usually faster than staring at a single derivation looking for a subtle mistake.
:::
