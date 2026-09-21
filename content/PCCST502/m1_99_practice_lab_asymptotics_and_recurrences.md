---
id: m1_99_practice_lab_asymptotics_and_recurrences
courseCode: PCCST502
module: 1
sequence: 99
title: 'Module 1 Practice Lab: Asymptotic Proofs & Recurrence Solvers'
difficulty: intermediate
estimatedMinutes: 10
learningObjectives:
  - Prove bounds with loop sums and substitution discipline
  - Solve recurrences three ways with Master-case shortcuts
  - Catch AVL rotations insertion by insertion without misses
concepts:
  - asymptotic proofs
  - recurrence solvers
  - AVL rotation traces
prerequisites:
  - m1_04_complexity_calculation_of_iterative_algorithms
  - m1_05_recurrence_equations_and_substitution_method
  - m1_07_recursion_tree_method
  - m1_08_master_theorem_and_cases
  - m1_10_avl_tree_rotations_insertion_and_deletion
examRelevance: high
tags:
  - asymptotics
  - m1-lab
---
# Module 1 Practice Lab: Asymptotic Proofs & Recurrence Solvers

**Stepped calculations for Master Theorem cases, recursion tree summations, and AVL insertion rotation sequences.**

<a id="the-intuition"></a>
## 1. Start from zero — how to use this lab

**Problem first.** Reading derivations feels like understanding — until you face a blank page in the exam. This lab converts recognition into reflex: for each drill, cover the answer, write your own full trace (sums with formulas, recurrences with named cases, AVL insertions with per-step balance factors), then compare. Abbreviations below: $T(n)$ = cost function; BF = balance factor; LL/RR/LR/RL = the four rotation shapes.

::: callout-intuition Core Mental Model
Technique selection *is* the skill: loop → summation with series formulas; recurrence + claimed bound → substitution (guess, assume, substitute, verify); recurrence + no claim → iteration or tree; standard form $aT(n/b) + f(n)$ with clean $f$ → Master shortcut; key sequence → per-insertion BF checks. The drills below force each choice.
:::

**Tiny warm-up.** $T(n) = 3T(n/2) + \Theta(n)$: watershed $n^{\log_2 3} \approx n^{1.58}$; $f = n$ is polynomially smaller → Case 1 → $\Theta(n^{1.58})$. Thirty seconds once the reflex exists.

---

<a id="the-math"></a>
## 2. The technique chooser (formal recap)

- **Loop (single, nested, logarithmic)** → summation method: sum iterations, apply arithmetic/geometric formulas, keep the dominant term.
- **Recurrence + claimed bound** → **substitution**: guess, assume for smaller inputs, substitute, verify algebraically.
- **Recurrence, no claim** → **iteration** (unroll to level $k$, stop at base case) or **recursion tree** (row totals, then sum).
- **Standard form $T(n) = aT(n/b) + f(n)$, clean $f$** → **Master Theorem**: compare $f$ to $n^{\log_b a}$; gap cases fall back to unrolling.
- **Key sequence** → after *each* insert/delete, walk up recomputing balance factors; rotate at the first $|BF| > 1$ before the next operation.

**Debugging habit:** if loop-summation and tree/iteration disagree on the same task, one derivation has an arithmetic slip — cross-checking beats re-reading.

---

<a id="worked-example"></a>
## 3. Worked example — Master case plus AVL insertion run

::: step [Step 1: Setup] Formulating the Problem
(a) Solve $T(n) = 4T(n/2) + n^2$ by the Master Theorem. (b) Insert $10, 20, 30, 40, 50$ in order into an empty AVL tree; name every rotation.
:::

::: step [Step 2: Execution] Applying Core Algorithm
**(a)** $a = 4, b = 2$: watershed $n^{\log_2 4} = n^2$; $f = n^2$ matches exactly → **Case 2**. **(b)** Insert $10$ (root), $20$ (right of 10, $BF(10) = -1$ fine). Insert $30$: right of 20; $BF(10) = -2$ (right-of-right) → **RR**: left-rotate $10$ → root $20$ with $10$, $30$. Insert $40$: right of $30$; $BF(20) = -1$ fine, no rotation. Insert $50$: right of $40$; $BF(30) = -2$ (right-of-right) → **RR**: left-rotate $30$.
:::

::: step [Step 3: Conclusion] Final Result
**(a)** Case 2: $T(n) = \Theta(n^2 \log n)$. **(b)** Two RR single-left rotations (at $10$ after inserting $30$; at $30$ after inserting $50$); final tree root $20$: left $10$, right $40$ with $30$, $50$. Sorted input self-corrects repeatedly instead of degenerating into a line.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- $\log_2 4 = 2$, not 1 — miscomputing the watershed picks the wrong case.
- AVL checks run after *every single* insertion, bottom-up from the new key — batching checks at the end misses intermediate violations.
- Case 2 needs an *exact* $\Theta$-match; off-by-log is the gap, not Case 2.

| Similar pair | Distinction that earns marks |
|---|---|
| Case 2 vs gap | Exact match vs log-factor off (unroll instead) |
| RR pattern vs no rotation | Straight right line ($BF = -2$) vs $|BF| \le 1$ everywhere |
| Substitution vs Master | Any recurrence + claim vs standard form + clean $f$ |

**Exam recap (facts an examiner rewards):** $4T(n/2) + n^2 \Rightarrow$ Case 2 $\Theta(n^2 \log n)$; increasing inserts trigger repeated RR rotations; cross-check derivations across methods.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

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
