---
id: m1_09_balanced_search_trees_avl_foundations
courseCode: PCCST502
module: 1
sequence: 9
title: 'Balanced Search Trees: AVL Trees & Balance Factor'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Diagnose plain BST collapse to linear search time
  - Enforce the unit balance-factor invariant at every node
  - Prove the logarithmic height bound for exam answers
concepts:
  - AVL invariant
  - balance factor
  - height bound
prerequisites: []
examRelevance: medium
tags:
  - balanced-trees
  - avl-trees
---
# Balanced Search Trees: AVL Trees & Balance Factor

**Binary Search Tree properties, AVL invariant (|BF| <= 1), and height bound proof (h < 1.44 log2 n).**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Binary search on a sorted array is fast ($O(\log n)$) because each comparison kills half the candidates — but inserting into an array's middle means shifting everything after it ($O(n)$). A Binary Search Tree (BST) wants both: array-like search *and* cheap inserts. Catch: a BST is only fast if it actually *branches*. Insert $1, 2, 3, 4, 5$ in order and each node gets one child — a line, not a tree — and search degrades to $O(n)$ linear scanning.

::: callout-intuition Core Mental Model
A BST's speed equals its height (levels to descend). Sorted insertion builds a degenerate line of height $n$ — all "eliminate half" power gone, since nothing branches. An AVL (Adelson-Velsky and Landis) tree bolts on one rule: after every update, rebalance so the line shape can never form. "Fast if lucky" becomes "fast, guaranteed, always" — height pinned near $\log n$ whatever order keys arrive in.
:::

**Tiny toy example (3 keys).** Insert $1, 2, 3$ into a plain BST: $1 \to 2 \to 3$ line, height 2, finding 3 costs 3 visits. An AVL tree rotates mid-way into $2$ over $1, 3$: height 1, finding anything costs ≤ 2 visits. Same keys, different shape, different bill.

::: toggle What are `tree`, `binary tree`, `BST`, `height`, `balance`, `balance factor`?
`Tree` = nodes linked parent-to-child with exactly one root and no cycles. `Binary tree` = each node has at most two children (left, right). `BST` = binary tree plus ordering (left subtree smaller, right larger) enabling go-left-or-right search. `Height` = edges on the longest root-to-leaf path (levels descended = search cost). `Balance` = subtrees roughly equal height. `Balance factor` = left-height minus right-height (AVL demands −1, 0, or +1 everywhere).
:::

::: toggle Where does `h < 1.44 log₂ n` come from?
Sparsest legal AVL tree: one subtree of height $h−1$, the other $h−2$ (any shorter breaks $|BF| ≤ 1$). Node counts follow $N_h = N_{h−1} + N_{h−2} + 1$ (Fibonacci-like, exponential $\Theta(\phi^h)$, $\phi ≈ 1.618$). Inverting $n \ge N_h$ gives $h < 1.44\log_2 n$. What it means: even the skinniest allowed AVL is only ~1.44× taller than perfect — height stays logarithmic, so all operations stay $O(\log n)$.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols and abbreviations:** BST = Binary Search Tree; height of a node = edges on its longest path down to a leaf; height of the tree = height of the root; $n$ = node count; BF = balance factor.

**BST property (recap):** every node's left subtree holds smaller values, right subtree larger — so "go left or right" halves the candidates, *if* the tree branches.

**Height gap:** best case $\Theta(\log n)$ (balanced), worst case $\Theta(n)$ (skewed line). AVL closes this gap.

```text
SKEWED BST (insert 1,2,3,4,5)      AVL TREE (same keys, rebalanced)

  1                                        2
   \                                     /   \
    2                                   1     4
     \                                       / \
      3                                     3   5
       \
        4
         \
          5

height 4: search visits 5 nodes    height 2: search visits at most 3
```

**Balance factor.** For node $x$:
$$BF(x) = \text{height}(\text{left subtree of } x) - \text{height}(\text{right subtree of } x)$$
**AVL invariant:** every node satisfies $|BF(x)| \le 1$, i.e. $BF(x) \in \{-1, 0, +1\}$. A $\pm2$ anywhere means "invalid AVL — rotate now" (rotations are the next note).

**Why the invariant forces $O(\log n)$ height (proof sketch).** Let $N_h$ = fewest nodes in any valid AVL tree of height $h$ (the sparsest allowed shape). Its root has one subtree of height $h-1$ and the other as short as $h-2$ (shorter would break $|BF| \le 1$):
$$N_h = N_{h-1} + N_{h-2} + 1, \qquad N_0 = 1,\ N_{-1} = 0$$
This is essentially the Fibonacci recurrence: $N_h = \Theta(\phi^h)$ with golden ratio $\phi \approx 1.618$ (exponential in $h$). Since a real tree has $n \ge N_h$, inverting gives:
$$h < 1.44 \log_2 n$$
Even the sparsest legal AVL tree is only ~$1.44\times$ taller than perfect — so search, insertion, deletion are all worst-case $O(\log n)$.

---

<a id="worked-example"></a>
## 3. Worked example — checking one node's balance factor

::: step [Step 1: Setup] Formulating the Problem
Node $x$ has left-subtree height 3 and right-subtree height 1. Compute $BF(x)$ and judge the AVL invariant at $x$.
:::

::: step [Step 2: Execution] Applying Core Algorithm
$BF(x) = 3 - 1 = 2$ by definition.
:::

::: step [Step 3: Conclusion] Final Result
$BF = 2$ violates $|BF| \le 1$ — left-heavy beyond tolerance. A real AVL tree would rotate at once (some left-side rotation, next note) to restore $|BF| \le 1$ before proceeding.
:::

### 3.1 Interactive Walkthrough: Auditing One Small Tree Bottom-Up

::: viz stepper Audit 20 over 10 (over 5) and 30: heights then balance factors
1. Leaves first: 5 and 30 have no children, so height 0 each and BF (−1) − (−1) = 0 — empty children count as height −1
2. Node 10: left height 0 (node 5), right height −1 (empty) — BF = 0 − (−1) = +1, legal, height becomes 1
3. Node 30: leaf once more — BF 0, legal, height 0
4. Root 20: left height 1, right height 0 — BF = 1 − 0 = +1, legal, so the whole tree is a valid AVL with no rotation owed
5. Lesson: always audit leaves-up; the first ±2 met while climbing is the rotation site, and everything below it was already sound
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Sign convention: $BF = \text{left} - \text{right}$, so $+2$ leans *left*. Negating the convention flips every rotation choice.
- AVL demands $|BF| \le 1$ *everywhere*, not just at the root — one violator anywhere invalidates the tree.
- $1.44 \log_2 n$ is a proven *upper* bound on height, not the exact height of your tree.

| Similar pair | Distinction that earns marks |
|---|---|
| BST vs AVL tree | Ordering only vs ordering + balance invariant (worst $O(n)$ vs $O(\log n)$) |
| $BF = +2$ vs $BF = -2$ | Left-heavy vs right-heavy — mirror-image fixes |
| Height vs node count | Levels descended (cost) vs keys stored (size) — the proof links them |

**Exam recap (facts an examiner rewards):** BST property in one line; $BF$ formula with $|BF| \le 1$; the recurrence $N_h = N_{h-1} + N_{h-2} + 1$ and the $1.44 \log_2 n$ bound; skewed-insertion $O(n)$ diagnosis.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Why does a plain (unbalanced) Binary Search Tree degrade to $O(n)$ search time in the worst case?
() BSTs are inherently slower than arrays for all operations
(*) If elements are inserted in a already-sorted (or reverse-sorted) order, the tree can degenerate into a line with no branching, making search behave like linear search
() BSTs cannot store more than a fixed number of elements
() BST search always requires visiting every node regardless of structure
::: explanation
The BST property lets you eliminate roughly half the remaining candidates at each step *only if* the tree actually branches at each level. If every node has just one child (a "skewed" tree, which happens with already-sorted insertion order), there's no branching to exploit, and search must potentially visit every node — exactly linear search's behaviour.
:::

::: quiz What is the AVL invariant that must hold at every node of a valid AVL tree?
() Every node must have exactly two children
(*) The balance factor (height of left subtree minus height of right subtree) must satisfy $|BF(x)| \le 1$
() The tree must be a perfectly complete binary tree
() The left subtree must always be taller than the right subtree
::: explanation
The defining rule of an AVL tree is that no node's left and right subtree heights may differ by more than 1 — formally $BF(x) \in \{-1,0,+1\}$ for every node $x$. Any insertion or deletion that breaks this rule must trigger a rebalancing rotation.
:::

::: quiz The proven height bound for an AVL tree with $n$ nodes is approximately:
() $h < n$
() $h < \sqrt{n}$
(*) $h < 1.44 \log_2 n$
() $h < n \log n$
::: explanation
By analysing the minimum-node AVL tree of a given height (which follows a Fibonacci-like recurrence, $N_h = N_{h-1}+N_{h-2}+1$) and inverting the relationship between height and node count, the height is provably bounded by roughly $1.44 \log_2 n$ — a constant factor times $\log n$, guaranteeing logarithmic-height performance regardless of insertion order.
:::
