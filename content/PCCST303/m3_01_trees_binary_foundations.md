---
id: m3_01_trees_binary_foundations
courseCode: PCCST303
module: 3
sequence: 1
title: Trees & Binary Tree Foundations
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Use tree terminology with binary types and representation choices
  - Prove level, total-node and leaf properties for exam answers
  - Index array-embedded trees with the children doubling rule
concepts:
  - binary trees
  - tree properties
  - array representation
prerequisites: []
examRelevance: medium
tags:
  - trees
  - foundations
---
# Trees & Binary Tree Foundations

**Terminology, binary types, key properties, and array vs linked representation.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Family Tree Rules
Root (founder), children, leaves (childless), height (longest generation chain). **Binary** caps children at two (left/right matter — they're *labelled* seats, not just counts). **Full** = every parent has $0$ or $2$ children; **complete** = every level full except possibly the last, filled left-to-right (the heap's shape); **perfect** = all leaves same depth, totally full.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Representation

Linked nodes (data, left, right); general trees via leftmost-child/right-sibling encoding. Array embedding (heap-style): root at $1$ ($0$), children of $i$ at $2i, 2i+1$, parent at $\lfloor i/2\rfloor$ — $O(1)$ navigation, no pointers, needs completeness to avoid holes.

### 2.2 Core properties (prove-ready)

* Level $l$ holds at most $2^l$ nodes; height-$h$ tree holds at most $2^{h+1}-1$; $n$ nodes force $h \ge \lfloor\log_2 n\rfloor$.
* Full binary tree: leaves $=$ internal nodes $+ 1$.

::: callout-formula KTU Formula Vault: Binary Facts
Children **$2i, 2i+1$** · level $l$: **$\le 2^l$** · total: **$\le 2^{h+1}-1$** · full: **leaves = internal $+1$**.
:::

::: callout-pitfall Complete ≠ Full
Complete describes *shape packing* (left-filled); full describes *child counts* ($0$ or $2$). A tree can be complete-but-not-full and vice versa — tick both axes separately in classification questions.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Max nodes at level $3$? In a height-$3$ tree? (b) Full tree with $7$ leaves: total nodes? (c) Node at array index $5$ (1-based): parent, children?
:::

::: step [Step 2: Execution] Plug the Bounds
1. $2^3 = 8$; total $2^4-1 = 15$.
2. Internal $= 6$, total $= 13$.
3. Parent $\lfloor5/2\rfloor = 2$; children $10, 11$.
:::

::: step [Step 3: Conclusion] Final Result
Powers of two rule everything here — level, total, and index arithmetic are one formula family. State which bound each part invokes.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Height-$4$ binary tree (root level $0$). Maximum nodes?
(A) $16$
(*B) $2^5-1 = 31$
(C) $2^4 = 16$? No — that's one level; total sums all levels
(D) $20$
::: explanation
$\sum_{l=0}^{4}2^l = 2^5-1 = 31$. Single-level $2^h$ vs cumulative $2^{h+1}-1$ confusion is the planted trap — "maximum nodes *in*" (total) vs "*at* level".
:::

::: quiz Q2: Foundational Concept
Why does heap array embedding require completeness?
(A) Heaps are small
(*B) Index arithmetic assumes dense packing — gaps in incomplete trees waste array slots and break parent/child formulas positionally
(C) Pointers are faster
(D) Heaps forbid leaves
::: explanation
$2i/2i+1$ addressing works only when level-order positions are contiguous. Holes (missing left child with present right) desynchronise every index below — completeness guarantees contiguity.
:::

::: quiz Q3: Foundational Concept
Full binary tree with $n$ internal nodes has how many leaves?
(A) $n$
(*B) $n+1$
(C) $2n$
(D) $2n+1$ total? Total is $2n+1$, leaves $n+1$
::: explanation
Induction on internal nodes: each $0\to2$-child expansion nets $+1$ leaf. Leaves $= n+1$ (total $2n+1$) — quote leaves vs total precisely as asked.
:::
