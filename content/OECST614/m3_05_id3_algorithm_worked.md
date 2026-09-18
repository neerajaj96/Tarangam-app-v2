# ID3 Algorithm: Growing the Tree by Hand

**Greedy recursion to a full classifier — pick max gain, branch, recurse on pure-or-pure-enough subsets, stop with majority leaves.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Divide and Rule Book
ID3 writes a rule book by conquest: find the most clarifying question, split the room by its answers, then conquer each sub-room independently with the same tactic. Pure rooms become verdict leaves; mixed rooms get another question. Recursion bottoms out because every split shrinks the room.
:::

Uses M3.4's gain as its compass at every node — entropy arithmetic in, tree out.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 ID3 recursion

At each node: (i) if all labels agree, emit a leaf; (ii) if no attributes remain, emit the majority label; (iii) else compute gain for every unused attribute, split on the max, recurse per value. No pruning, no numeric handling — overfitting is ID3's honest flaw (pruning and ratios came later).

### 2.2 Reading the result

Each root-to-leaf path is one readable IF-THEN rule. Depth prices caution: deep paths memorize, shallow paths generalize.

::: callout-formula KTU Formula Vault: ID3
Pure → leaf · empty attributes → majority · else max-gain split, recurse · paths are rules · greedy, no backtracking.
:::

Greedy means committed: ID3 never revisits a chosen split, so early mistakes persist — the price of speed examiners contrast with optimal search.

::: callout-exam KTU Exam Focus
9-markers hand 8–14 rows and ask for the root split plus one subtree. Compute parent entropy once, gains per attribute, branch the winner only — full-tree expansion wastes the hour. State stopping reasons per leaf.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Continue the M3.4 tennis data where Outlook won the root (gain $0.2956$). Grow the Sunny branch: Sunny days are $3$ ($1$Y/$2$N) with Wind values Weak ($1$ day: $1$Y/$0$N) and Strong ($2$ days: $0$Y/$2$N). Finish this branch with ID3.
:::

::: step [Step 2: Execution] Conquering the Sub-Room
Sunny entropy is $0.918$ (M3.4). Splitting on Wind: Weak child pure Yes ($H = 0$), Strong child pure No ($H = 0$). Weighted child entropy $= 0$; gain $= 0.918 - 0 = 0.918$ — maximal, Wind perfectly classifies Sunny days. Both children are pure, so ID3 emits leaves: Weak → Yes, Strong → No.
:::

::: step [Step 3: Conclusion] Final Result
Sunny branch solved in one question: Weak blows play, Strong blows stay home. Rule path reads: IF Outlook=Sunny AND Wind=Weak THEN Play=Yes — the printable-placard payoff of trees.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Stopping Discipline
A node holds $4$ Yes and $0$ No with attributes still unused. ID3 action?
(A) Split further for safety
(*B) Emit a Yes leaf immediately, because purity stops recursion regardless of leftover attributes — splitting pure nodes can only memorize noise
(C) Ask the majority instead
(D) Backtrack to the root
::: explanation
Purity is the primary stop rule; unused attributes are irrelevant once labels agree. Further splits manufacture depth without information — overfitting by construction.
:::

::: quiz Q2: Majority Leaves
A node holds $2$ Yes, $3$ No with zero attributes left. Leaf label?
(A) Yes, optimism
(*B) No by $3$-to-$2$ majority — with nothing left to ask, the plurality is the best available verdict and the honest admission of limits
(C) Undecided forever
(D) Split on nothing
::: explanation
Exhausted attributes plus mixed labels equals majority leaf. The tree confesses uncertainty instead of inventing questions — that humility is built into the algorithm.
:::

::: quiz Q3: Greedy Honesty
ID3 picks Outlook at the root, but the globally optimal tree starts with Wind. Can ID3 recover?
(A) Yes, it backtracks automatically
(*B) No — greedy means committed, the root choice is never revisited, so ID3 can miss the global optimum while staying fast and usually good
(C) Yes with more data
(D) No, so ID3 never works
::: explanation
No backtracking is the stated price of greed: local maxima at each node, no global guarantees. Speed and readability are what you buy with that coin.
:::
