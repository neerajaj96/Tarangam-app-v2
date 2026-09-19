---
id: m1_09_balanced_search_trees_avl_foundations
courseCode: PCCST502
module: 1
sequence: 9
title: 'Balanced Search Trees: AVL Trees & Balance Factor'
difficulty: beginner
estimatedMinutes: 7
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
## 1. The Intuition

::: callout-intuition Core Mental Model
Recall from earlier in this module: binary search on a sorted array is fast ($O(\log n)$) because each comparison eliminates half the remaining possibilities. A **Binary Search Tree (BST)** tries to give you that same "eliminate half each time" speed, but for a data structure that also supports fast insertion and deletion (which a plain sorted array does *not* — inserting into the middle of an array means shifting everything after it).

Here's the catch: a BST's search speed depends entirely on its **height** (how many levels it has) — and if you insert elements in an unlucky order (say, already-sorted order: 1, 2, 3, 4, 5, ...), a plain BST degenerates into what's essentially a straight line — every node has only one child, no branching at all. Searching in that "tree" is no better than linear search through an array: $O(n)$, not $O(\log n)$. All the speed advantage of "eliminate half each time" evaporates, because there's no branching left to eliminate half of anything.

An **AVL tree** (named after its inventors, Adelson-Velsky and Landis) is a BST with an extra rule bolted on: after every insertion or deletion, the tree checks itself and — if needed — rebalances, so that it can *never* degenerate into that bad, line-like shape. This guarantees the height always stays close to $\log n$, no matter what order you insert elements in — turning "fast *if you're lucky*" into "fast, guaranteed, always."
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

**Binary Search Tree (BST) property (prerequisite recap):** for every node, all values in its left subtree are smaller than the node's own value, and all values in its right subtree are larger. This property is what makes "go left or go right" a meaningful way to eliminate half the remaining search space at each step — *provided* the tree is reasonably balanced.

**Height of a tree.** The height of a node is the number of edges on the longest path from that node down to a leaf; the height of the whole tree is the height of its root. For a BST holding $n$ nodes: the *best possible* height is $\Theta(\log n)$ (a perfectly balanced tree), but the *worst possible* height is $\Theta(n)$ (a completely skewed, line-like tree) — this gap is exactly the problem AVL trees solve.

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

**Balance factor.** For any node $x$ in an AVL tree, define:
$$BF(x) = \text{height}(\text{left subtree of } x) - \text{height}(\text{right subtree of } x)$$
**The AVL invariant:** every single node in a valid AVL tree must satisfy $|BF(x)| \le 1$ — i.e. $BF(x) \in \{-1, 0, +1\}$. If an insertion or deletion ever causes some node's balance factor to become $-2$ or $+2$, the tree is no longer a valid AVL tree, and a rebalancing operation (rotation — covered in the next topic) must be performed to restore the invariant.

**Why this invariant guarantees $O(\log n)$ height — the proof sketch.** Let $N_h$ be the *minimum* number of nodes possible in an AVL tree of height $h$ (i.e., the "worst allowed" AVL shape — the sparsest tree still satisfying $|BF|\le1$ everywhere). Such a tree's root has one subtree of height $h-1$ and — because the balance factor can differ by at most 1 — the other subtree can be as short as height $h-2$ (not shorter, or the invariant would be violated). This gives the recurrence:
$$N_h = N_{h-1} + N_{h-2} + 1, \qquad N_0 = 1,\ N_{-1} = 0$$
This is (up to the $+1$ and slightly shifted indices) essentially the **Fibonacci recurrence**. Solving it (via its characteristic equation, related to the golden ratio $\phi \approx 1.618$) shows that $N_h$ grows *exponentially* in $h$, specifically $N_h = \Theta(\phi^h)$. Inverting this relationship — solving for $h$ in terms of $n$ (since a real tree has $n \ge N_h$ nodes for its height $h$) — gives the height bound:
$$h < 1.44 \log_2 n$$
In plain words: even in the *sparsest, most reluctantly-balanced* AVL tree allowed by the invariant, the height can never exceed roughly $1.44 \times \log_2 n$ — a constant multiple of $\log n$, which is exactly the guarantee we wanted. This is what makes every AVL search, insertion, and deletion provably $O(\log n)$ in the worst case, unlike a plain BST's $O(n)$ worst case.

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Given a BST node $x$ whose left subtree has height $3$ and right subtree has height $1$, determine its balance factor and whether the AVL invariant is satisfied at this node.
:::

::: step [Step 2: Execution] Applying Core Algorithm
By definition, $BF(x) = \text{height(left)} - \text{height(right)} = 3 - 1 = 2$.
:::

::: step [Step 3: Conclusion] Final Result
$BF(x) = 2$ violates the AVL invariant $|BF(x)| \le 1$ — this node is "left-heavy" beyond the allowed tolerance. In a real AVL tree, this situation would trigger a rebalancing rotation (specifically, some form of left-side rotation, detailed in the next topic) immediately after whichever insertion caused this imbalance, restoring $|BF(x)|$ to at most 1 before any further operations proceed.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
