# Expression Trees & BST Operations

**Trees that compute, trees that search — postfix-to-tree building and BST insert/delete/search.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Mobile Sculpture
An **expression tree** hangs operators as branching joints with operands as weights: evaluating = shaking bottom-up (postorder). A **BST** is a phone book that stays sorted while growing: go left if smaller, right if bigger — every decision discards half the book ($O(h)$, and $O(\log n)$ when balanced).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Expression trees

Build from postfix: operand → push node; operator → pop right, pop left, push subtree. Inorder (+ brackets) recovers infix; postorder gives back postfix; evaluation recurses postorder. All $\Theta(n)$.

### 2.2 BST operations

Invariant: left $< $ node $<$ right (no duplicates, per syllabus convention). Search/insert: compare-and-descend, $O(h)$. Delete: leaf (drop), one child (bypass), two children (replace with inorder successor/predecessor, delete it). Worst $O(n)$ degenerate; average $O(\log n)$.

::: callout-formula KTU Formula Vault: BST + Expr
Expr build: **operands push, operators pop-right-left** · BST: **left<, right>** · delete-2-children = **successor swap** · costs **$O(h)$**.
:::

::: callout-pitfall Successor's Own Subtree
The inorder successor may own a right child — after copying its value up, bypass (don't drop) that child. Deleting the successor as a "leaf" orphans its subtree.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Build the expression tree for $AB+C\times$. (b) BST insert $50,30,70,20,40$; then delete $30$.
:::

::: step [Step 2: Execution] Stack Build and Successor Swap
1. $A,B$ pushed; $+$ pops $B$(right),$A$(left) → subtree; $C$ pushed; $\times$ pops $C$, subtree → root $\times$ with left $+$: $(A+B)\times C$.
2. $50$ root; $30$ left; $70$ right; $20$ left of $30$; $40$ right of $30$. Delete $30$ (two children): successor $40$ replaces it; $40$'s old slot (leaf) removed. Tree: $50$ with left $40$ (left $20$), right $70$.
:::

::: step [Step 3: Conclusion] Final Result
Expression traces show stack states; BST deletion names the case (0/1/2 children) before acting. Case-first is the grading trigger.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Insert $10, 5, 15, 3$ into an empty BST. Inorder?
(A) $10, 5, 15, 3$
(*B) $3, 5, 10, 15$ — inorder always sorts, regardless of insertion shape
(C) $3, 10, 5, 15$
(D) $15, 10, 5, 3$
::: explanation
BST inorder = sorted, always. Insertion order shapes the tree (here a near-chain) but never the inorder output — separate shape from sequence.
:::

::: quiz Q2: Foundational Concept
Deleting a node with two children uses the inorder successor because:
(A) It is the largest node
(*B) It is the smallest node bigger than all left-subtree keys and smaller than all right — the only value preserving the invariant in the vacated slot
(C) It is always a leaf
(D) It balances the tree
::: explanation
Successor (leftmost of right subtree) fits exactly the deleted key's bounds. Copy value, remove the duplicate origin (which has $\le 1$ child) — order preserved, structure minimally disturbed.
:::

::: quiz Q3: Foundational Concept
Worst-case BST search complexity and when?
(A) $O(\log n)$ always
(*B) $O(n)$ on degenerate (sorted-insertion chain) input — height, not node count, rules: $O(h)$
(C) $O(1)$ average
(D) $O(n^2)$
::: explanation
Sorted inserts grow a vine: every search walks all $n$. Cost is $O(h)$; balance (AVL territory, S5 DAA) restores $h = O(\log n)$. Quote $O(h)$, then instantiate.
:::
