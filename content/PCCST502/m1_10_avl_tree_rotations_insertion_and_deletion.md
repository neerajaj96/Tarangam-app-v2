---
id: m1_10_avl_tree_rotations_insertion_and_deletion
courseCode: PCCST502
module: 1
sequence: 10
title: 'AVL Tree Rotations: LL, RR, LR, RL Operations'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - Match straight-line imbalances to single rotations with direction
  - Match zig-zag imbalances to double rotations in child-first order
  - Rebalance insertions and deletions without changing the key set
concepts:
  - tree rotations
  - insertion rebalancing
  - deletion rebalancing
prerequisites:
  - m1_09_balanced_search_trees_avl_foundations
examRelevance: high
tags:
  - balanced-trees
  - avl-rotations
---
# AVL Tree Rotations: LL, RR, LR, RL Operations

**Single rotations (LL, RR), double rotations (LR, RL), step-by-step insertion rebalancing, and deletion rebalancing.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** The invariant $|BF| \le 1$ is easy to state — but inserting a key can break it, and we must repair the shape *without* breaking BST ordering and *without* losing keys. The repair tool is **rotation**: a local parent/child swap among 2–3 nodes that changes heights while preserving left-smaller/right-larger order everywhere.

::: callout-intuition Core Mental Model
Picture a two-pan balance tipped left. You do not discard weights — you redistribute them until it levels, same weights, new arrangement. A rotation does this to a tipped subtree ($|BF| = 2$): reassign parents among a few nodes, keep every key, keep BST order, restore balance. Straight-line leans (LL, RR) need one rotation against the lean; elbow (zig-zag) leans (LR, RL) need two — unbend the elbow, then fix the line. Drop the scale now: the four cases below are exact.
:::

**Tiny toy example.** Nodes $30$ over $20$ over $10$ (a left line): right-rotate $30$ → $20$ on top with $10$, $30$ as children. Keys $\{10, 20, 30\}$ unchanged, order intact, all $BF = 0$.

::: toggle Trace the LL rotation pointer by pointer
Before: 30 (BF +2) with left child 20, 20's right subtree T (possibly empty). Step 1: detach T from 20 (remember it). Step 2: 20 becomes local root; 30 becomes 20's right child. Step 3: reattach T as 30's left child (T's keys sit between 20 and 30, so BST order holds: 20 < T < 30). After: 20 over 10 and 30, all BF = 0. Why each step: steps 1–2 swap the lean; step 3 parks the middle subtree where order demands — skipping it loses keys.
:::

::: toggle How do I choose between LL, RR, LR, RL from the insertion path?
Read the last two turns from the unbalanced node toward the new key: left-then-left = LL (single right rotation); right-then-right = RR (single left); left-then-right = LR (left on child, then right on parent); right-then-left = RL (right on child, then left on parent). Straight (same direction twice) → one rotation against the lean; elbow (directions differ) → child-first double rotation. Deletion reuses the shapes but must recheck every ancestor upward (heights can shrink).
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**When rotations fire.** After an insert/delete, walk from the changed node up to the root, updating heights and balance factors. The *first* ancestor (nearest the change) with $|BF| = 2$ is where you rotate. For insertion, that single fix provably restores the whole tree; deletion may need to continue upward (below).

**Input to each case:** the unbalanced node plus *where* the new key landed relative to it. Steps and trace follow the same pattern every time: name the shape → rotate → recheck factors.

**Case LL (Left-Left) — single right rotation.** New key went into the **left** subtree of the **left** child (line leaning left). Fix: rotate the unbalanced node **right** — left child becomes local root; old root becomes its right child; the new root's former right subtree reattaches as the old root's left subtree.

**Case RR (Right-Right) — single left rotation.** Mirror image: key into the **right** of the **right** child. Fix: rotate **left**.

**Case LR (Left-Right) — double rotation.** Key into the **right** subtree of the **left** child (elbow: left, then right). A single rotation cannot fix an elbow. Fix: **left**-rotate the left child (elbow → straight LL line), **then right**-rotate the unbalanced node.

**Case RL (Right-Left) — double rotation.** Mirror: key into the **left** of the **right** child. Fix: **right**-rotate the right child, **then left**-rotate the parent.

```text
LL BEFORE (BF = +2 at 30)          LL AFTER (single right rotation at 30)

      30                                       20
     /                                        /  \
    20                   ==>                  10    30
   /
  10                                all balance factors back to 0
```

Straight lines need one rotation *against* the lean; zig-zags need two — elbow outward into a line first, then the line fix.

::: anim avl-ll LL Rotation in Motion
Watch the leaning tower (30 over 20 over 10) swing right into balance (20 over 10 and 30) — same three nodes, same order, new shape, all balance factors zero.
:::

**Rotations preserve BST order** by construction: only pointers among 2–3 nodes plus their subtrees move, and every value stays on its correct side. **Deletion difference:** insertion's fix restores the subtree's old height, so one rotation suffices; deletion's fix can *shrink* the subtree, unbalancing an ancestor — so deletion must recheck every ancestor up to the root, possibly rotating at several levels.

::: callout-formula KTU Formula Vault: Rotation Chooser
Straight line → **single**: **LL** → rotate **right**; **RR** → rotate **left**. Zig-zag → **double**: **LR** → **left** on child, then **right** on parent; **RL** → **right** on child, then **left** on parent. Mnemonic: the *first* rotation always pushes the elbow outward into a straight line.
:::

**Complexity.** Each rotation is $O(1)$ pointer work; the upward walk touches $O(\log n)$ ancestors (height-bounded) — so insertion/deletion stay $O(\log n)$ total.

---

<a id="worked-example"></a>
## 3. Worked example — inserting 30, 20, 10

::: step [Step 1: Setup] Formulating the Problem
Insert keys $30, 20, 10$ in order into an empty AVL tree; rebalance after each insertion. (Empty-subtree height convention: $-1$, so a lone leaf has $BF = 0$.)
:::

::: step [Step 2: Execution] Applying Core Algorithm
Insert $30$: single node, $BF = 0$. Insert $20$: $20 < 30$, left child; $BF(30) = 0-(-1) = 1$, legal. Insert $10$: left of $20$; bottom-up: $BF(20) = 1$ fine; $BF(30) = 1-(-1) = 2$ — violation, key went left-of-left → **LL**.
:::

::: step [Step 3: Conclusion] Final Result
Single **right rotation** at $30$: $20$ becomes root, $10$ left, $30$ right — every $BF = 0$. The tree self-corrected the moment it leaned into a straight line.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Rotate *against* the lean: left line → right rotation. Rotating with the lean worsens it.
- LR starts on the *child* (left on left child), not the unbalanced node — order matters; parent-first breaks ordering.
- Insertion stops after one fix; deletion keeps climbing to the root. Stopping early after a deletion is the standard lost mark.

| Similar pair | Distinction that earns marks |
|---|---|
| LL vs LR (and RR vs RL) | Straight line, one rotation vs elbow, child-first double rotation |
| Insertion vs deletion rebalancing | One fix suffices vs recheck to the root (height can shrink) |
| Rotation vs reinsertion | Same keys rearranged ($O(1)$) vs rebuilding (never needed) |

**Exam recap (facts an examiner rewards):** the four shape→fix mappings; child-first order for doubles; BST order and key set preserved; deletion climbs to root; $O(\log n)$ per update.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz An imbalance caused by inserting into the right subtree of the left child of an unbalanced node requires which type of rotation?
() LL (single right rotation)
() RR (single left rotation)
(*) LR (double rotation: left rotation on the child, then right rotation on the parent)
() RL (double rotation: right rotation on the child, then left rotation on the parent)
::: explanation
"Right subtree of the left child" is exactly the definition of the LR (Left-Right) zig-zag case. A single rotation can't straighten a zig-zag shape, so the fix requires two rotations: first a left rotation on the left child (converting the zig-zag into a straight LL shape), then a right rotation on the original unbalanced node.
:::

::: quiz Do rotations in an AVL tree change which set of values is stored in the tree?
() Yes, some values must be discarded during rotation
(*) No — rotations only rearrange parent/child pointers among a small local group of nodes; the same set of values remains, just restructured, and the BST ordering property is preserved
() Yes, rotation always adds a new dummy node
() Rotations only affect leaf nodes, never internal structure
::: explanation
A rotation is purely a structural rearrangement — like redistributing weights on a balance scale without adding or removing any. Every value that was in the tree before the rotation is still in the tree afterward, and the rotation is specifically designed so the left-smaller/right-larger BST property still holds for every node once the dust settles.
:::

::: quiz Why can a single rotation performed during a deletion sometimes require checking and rebalancing further up the tree, unlike after an insertion?
() Deletion never actually requires rebalancing
(*) A rotation during deletion can reduce that subtree's height, which may cause a new imbalance to appear at an ancestor further up, so all ancestors up to the root must be checked
() Deletion always requires exactly two rotations regardless of shape
() Insertion and deletion always trigger identical rebalancing behaviour
::: explanation
After insertion, fixing the lowest unbalanced ancestor is provably sufficient because the subtree's height after rotation is restored to what it was before the insertion. After deletion, a rotation can actually shrink the subtree's height further, and that shrinkage can propagate upward and trigger a fresh imbalance at an ancestor — so deletion rebalancing must walk all the way up to the root, potentially rotating at multiple levels, not just the first one found.
:::
