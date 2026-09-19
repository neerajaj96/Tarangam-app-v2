---
id: m3_02_traversals_operations
courseCode: PCCST303
module: 3
sequence: 2
title: Traversals & Tree Operations
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Write inorder, preorder, postorder and level-order traversals
  - Simulate recursion with explicit stacks and queues
  - Reconstruct trees from inorder plus one more traversal
concepts:
  - tree traversals
  - tree reconstruction
prerequisites:
  - m3_01_trees_binary_foundations
examRelevance: high
tags:
  - trees
  - traversals
---
# Traversals & Tree Operations

**Inorder/preorder/postorder/level-order — recursive definitions, stack simulation, and reconstruction.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Museum Routes
Inorder = left wing, lobby (node), right wing (sorted order for BSTs); preorder = lobby first (copy the building: root before contents); postorder = lobby last (demolish children before parent); level-order = floor by floor (queue, not stack). Same museum, four itineraries — each serves the task matching its visit order.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Recursive definitions (all $\Theta(n)$)

* Inorder: left, node, right.
* Preorder: node, left, right.
* Postorder: left, right, node.
* Level-order: BFS with a queue.

### 2.2 Uses and reconstruction

Inorder of BST = sorted. Preorder + inorder (or postorder + inorder) reconstructs a unique tree; preorder + postorder alone does *not*. Iterative versions use explicit stacks (preorder/inorder) mirroring call frames.

::: callout-formula KTU Formula Vault: Traversals
In **L-N-R** · pre **N-L-R** · post **L-R-N** · level = **queue** · rebuild needs **inorder + one more**.
:::

::: callout-pitfall Pre + Post Can't Rebuild
Without inorder's left/right split point, pre+post pairs admit multiple trees. Any "reconstruct from pre+post" claim is false — cite the ambiguity, don't attempt the build.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Tree: root $1$, left $2$ (children $4,5$), right $3$. Give all four traversals. Then rebuild from inorder $[4,2,5,1,3]$ + preorder $[1,2,4,5,3]$.
:::

::: step [Step 2: Execution] Walk and Rebuild
1. In $[4,2,5,1,3]$; pre $[1,2,4,5,3]$; post $[4,5,2,3,1]$; level $[1,2,3,4,5]$.
2. Pre-first $1$ = root; inorder splits $[4,2,5]\mid[3]$; recurse: $2$ roots left with $4\mid5$ around it. Original tree recovered.
:::

::: step [Step 3: Conclusion] Final Result
Traversal traces are mechanical; rebuilding recurses "root-first, split, repeat". Show the split lines — they're the graded steps.
:::

::: anim traversal-orders In, Pre, Post on the Worked Tree
Watch all three orders light on the same tree — then the level row and the rebuild rule that needs inorder plus one more.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Postorder of: root A, left B (left D), right C?
(A) A,B,D,C
(*B) D,B,C,A — left subtree, right subtree, then root
(C) D,C,B,A
(D) A,D,B,C
::: explanation
Postorder visits $D$ (B's left), then $B$, then $C$, then $A$: $[D,B,C,A]$. Root-last is the check — any root-first option is preorder contamination.
:::

::: quiz Q2: Foundational Concept
Inorder traversal of a BST yields:
(A) Reverse order
(*B) Ascending sorted order — left < node < right at every subtree, inductively global
(C) Random order
(D) Level order
::: explanation
BST invariant ($L <$ node $< R$) makes inorder emit sorted sequence — the property behind BST sorting and validation-by-traversal. One-line proof by subtree induction.
:::

::: quiz Q3: Foundational Concept
Which pair rebuilds a unique binary tree?
(A) Preorder + postorder
(*B) Inorder + preorder (root from pre, split from in — recursion closes it)
(C) Any single traversal
(D) Level-order alone
::: explanation
Preorder names roots in order; inorder positions each root among left/right. Together they recurse deterministically. Pre+post lacks the split oracle — ambiguous, unusable alone.
:::
