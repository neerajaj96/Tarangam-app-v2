# Polynomials & Sparse Matrices with Arrays

**Sequential representation: term structs ordered by exponent, and the triplet trick that compresses near-empty matrices.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Attendance Register vs Absentee List
A dense $100\times100$ matrix with $12$ non-zeroes stored fully is an attendance register naming $10{,}000$ students to mark $12$ present. **Sparse (triplet) form** keeps an absentee-style shortlist — (row, column, value) triples plus dimensions — and every operation (add, transpose, multiply) works off the shortlist, skipping the silent majority.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Polynomial as ordered array

Term struct (coeff, exp), sorted by descending exponent; zero-coefficient terms dropped. Addition = two-pointer merge in $O(m+n)$: compare exponents, emit larger, sum equals (drop zero sums).

### 2.2 Sparse triplet and fast transpose

Header (rows, cols, count) + triples sorted row-major. Naive transpose scans per column ($O(\text{cols}\times\text{count})$); **fast transpose** counts column frequencies once, computes start positions, places each triple directly — $O(\text{cols} + \text{count})$.

::: callout-formula KTU Formula Vault: Sparse
Triples **(row, col, value)** + header · poly-add **merge $O(m+n)$** · fast transpose **$O(\text{cols}+\text{count})$**.
:::

::: callout-pitfall Row-Major Order Must Survive
Triples must stay row-major after every operation (add/transpose) for binary search and merging to work. An unsorted triple list is a corrupt representation — re-sort or place-by-position, never append blindly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Add $A = 3x^3 + 2x + 1$ and $B = 5x^2 + 2x + 4$ by the merge walk. Then state the triplet header for a $5\times4$ matrix with $3$ non-zeroes.
:::

::: step [Step 2: Execution] Merge and Header
1. $3x^3$ (A only) → emit. No $x^2$ in A → emit $5x^2$. $x$: $2+2 = 4x$. Const: $1+4 = 5$. Result $3x^3+5x^2+4x+5$.
2. Header $(5, 4, 3)$ followed by $3$ triples — $4$ records replace $20$ cells.
:::

::: step [Step 3: Conclusion] Final Result
Exponents drive the merge exactly like sorted-list merging; headers make sparsity self-describing. Both are "simulate the walk" questions — write each comparison step.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Merge-add $2x^2 + 1$ and $3x^2 + 4x$. Result?
(A) $5x^4 + 4x + 1$
(*B) $5x^2 + 4x + 1$ — equal exponents sum, the rest carry over
(C) $2x^2 + 3x^2$
(D) $5x^2 + 1$
::: explanation
$x^2$: $2+3 = 5$; $4x$ and $1$ unmatched, carried. Exponents never add during polynomial *addition* (that's multiplication) — merge, don't combine exponents.
:::

::: quiz Q2: Foundational Concept
When does triplet form beat full storage?
(A) Always
(*B) When non-zeroes $\ll$ rows$\times$cols — overhead per triple pays off only under real sparsity (roughly $< 1/3$–$1/4$ dense, counting triple width)
(C) For $1\times1$ matrices
(D) Never
::: explanation
Each triple costs $\sim 3$ cells; break-even sits where $3\times\text{count} <$ rows$\times$cols. Dense matrices waste *more* space as triples — representation choice follows measured sparsity.
:::

::: quiz Q3: Foundational Concept
Why is fast transpose faster than naive transpose?
(A) It skips sorting entirely
(*B) It precomputes per-column start positions from one frequency pass, placing each triple directly instead of re-scanning all triples per column
(C) It uses less accurate arithmetic
(D) It transposes twice
::: explanation
Naive rescans ($O(\text{cols}\times\text{count})$); fast invests one counting pass to learn destinations, then streams ($O(\text{cols}+\text{count})$). Counting-first is the same trick as counting sort — recognise the pattern.
:::
