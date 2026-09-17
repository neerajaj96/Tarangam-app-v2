# AVL Tree Rotations: LL, RR, LR, RL Operations

**Single rotations (LL, RR), double rotations (LR, RL), step-by-step insertion rebalancing, and deletion rebalancing.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model
Picture a old-fashioned two-pan balance scale that's tipped too far to one side. To fix it, you don't throw anything away — you just physically rearrange the weights, moving some from the heavy side to the light side, until the scale sits level again. Crucially, the *same* weights are still on the scale, just redistributed — nothing was added or removed.

A **rotation** in an AVL tree does exactly this for a "tipped" subtree — one whose balance factor has drifted outside the allowed $\{-1,0,+1\}$ range after an insertion or deletion. A rotation restructures a small, local piece of the tree — reassigning which node is the "parent" and which is the "child" among 2–3 nodes — *without* changing which elements are in the tree, and *without* breaking the crucial Binary Search Tree ordering property (left-smaller, right-larger must still hold everywhere afterward). There are exactly four named "shapes" of imbalance that can occur, and each has a specific, well-defined fix: **LL** and **RR** (single rotations, for a "straight-line" imbalance) and **LR** and **RL** (double rotations, for a "zig-zag" imbalance).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

**When rotations are triggered.** After inserting (or deleting) a node, walk back up from the changed node toward the root, updating each ancestor's height and balance factor. The *first* node found (closest to the newly inserted/deleted node) where $|BF|$ becomes $2$ is the node where a rotation is performed. Fixing the imbalance at this one node is provably always sufficient to restore the AVL invariant for the *entire* tree above it too (for insertion — deletion can occasionally require rotations to propagate further up, as noted below).

**Case 1 — LL (Left-Left), single right rotation.** Occurs when the imbalance is caused by inserting into the **left** subtree of the **left** child of the unbalanced node (a "straight line leaning left"). Fix: rotate the unbalanced node **right** — the left child becomes the new local root, the old root becomes the new root's right child, and the new root's *former* right subtree (if any) is reattached as the old root's new left subtree.

**Case 2 — RR (Right-Right), single left rotation.** The mirror image of LL: imbalance caused by inserting into the **right** subtree of the **right** child (a "straight line leaning right"). Fix: rotate the unbalanced node **left** — symmetric to the LL fix.

**Case 3 — LR (Left-Right), double rotation.** Occurs when the imbalance is caused by inserting into the **right** subtree of the **left** child (a "zig-zag" shape — left, then right). A single rotation cannot fix a zig-zag shape directly. Fix: first perform a **left** rotation on the left child (turning the zig-zag into a straight LL shape), *then* perform a **right** rotation on the original unbalanced node (now fixing that straight-line shape, exactly as in Case 1).

**Case 4 — RL (Right-Left), double rotation.** The mirror image of LR: imbalance caused by inserting into the **left** subtree of the **right** child (a zig-zag: right, then left). Fix: first a **right** rotation on the right child, then a **left** rotation on the original unbalanced node.

```text
LL BEFORE (BF = +2 at 30)          LL AFTER (single right rotation at 30)

      30                                       20
     /                                        /  \
    20                   ==>                  10    30
   /
  10                                all balance factors back to 0
```

Straight lines (LL, RR) need one rotation *against* the lean; zig-zags (LR, RL) need two — first unbend the elbow into a line, then fix the line.

**Rotations preserve the BST property.** Each rotation only rearranges pointers among a small, fixed set of 2–3 nodes and their subtrees, in a way carefully designed so that, after the rotation, every value still lies in the correct left/right position relative to every other value — the ordering is never violated, only the *shape* changes.

**A key difference for deletion.** After an insertion, fixing the balance factor at the single lowest unbalanced ancestor is always enough to re-balance the whole tree. After a *deletion*, however, a rotation performed at one level can sometimes reduce that subtree's height, which can in turn cause an imbalance to appear *further up* the tree — so deletion rebalancing must continue checking (and potentially rotating at) every ancestor all the way up to the root, not just stop at the first fix.

::: callout-formula KTU Formula Vault: Rotation Chooser
Straight line → **single** rotation: **LL** (left-left) → rotate **right**; **RR** → rotate **left**. Zig-zag → **double**: **LR** → **left** on child, then **right** on parent; **RL** → **right** on child, then **left** on parent. Mnemonic: the *first* rotation always pushes the "elbow" of the zig-zag outward into a straight line.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Insert the keys $30, 20, 10$ in that order into an initially empty AVL tree, and determine what rebalancing (if any) is needed after each insertion.
:::

::: step [Step 2: Execution] Applying Core Algorithm
Insert $30$: tree is just node $30$, balanced trivially ($BF=0$).
Insert $20$: as a BST, $20 < 30$, so $20$ becomes $30$'s left child. Check balance factors: $30$'s left subtree height is $0$, right subtree height is $-1$ (empty, conventionally height $-1$ or sometimes treated as $0$ nodes/height $-1$ depending on convention) — $BF(30) = 0-(-1)=1$, still within $\{-1,0,1\}$, no rotation needed.
Insert $10$: as a BST, $10 < 30$ so go left to $20$; $10 < 20$ so $10$ becomes $20$'s left child. Now check balance factors bottom-up: node $20$ is balanced ($BF=1$, fine). Node $30$: left subtree (rooted at $20$) now has height $1$, right subtree height $-1$; $BF(30) = 1-(-1) = 2$ — this violates the AVL invariant.
:::

::: step [Step 3: Conclusion] Final Result
The imbalance at node $30$ was caused by inserting into the **left** subtree of $30$'s **left** child ($20$) — the new node $10$ went left, then left again — this is exactly the **LL** shape. Fix: a single **right rotation** at node $30$. After rotation, $20$ becomes the new local root, with $10$ as its left child and $30$ as its right child — a perfectly balanced 3-node tree (every node's $BF=0$). This mirrors exactly how a real AVL insertion sequence self-corrects the moment it starts leaning too far in a straight line.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
