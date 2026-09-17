# Binary Heaps & Priority Queues

**Complete-tree + heap-order = $O(\log n)$ extremal access — sift mechanics and heapify cost.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Tournament Bracket
A max-heap is a single-elimination bracket frozen at all times: every parent beat its children (heap order), and the bracket is packed left-to-right with no gaps (completeness → array embedding). New player? Seat them last, let them challenge upward (**sift-up**). Champion leaves? Move the last player to the throne, let them sink past stronger children (**sift-down**). Every match halves the field: $O(\log n)$.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The two invariants and ops

Max-heap: parent $\ge$ children; min-heap mirrored. Insert: append + sift-up. Extract-max: swap root/last, drop last, sift-down. Peek $O(1)$; insert/extract $O(\log n)$; search $O(n)$ (not a BST!).

### 2.2 Build-heap and priority queues

Bottom-up heapify (sift-down from last parent): $\Theta(n)$, not $O(n\log n)$ — most nodes sit near leaves with tiny sift budgets. Priority queue = heap-backed ADT (insert + extract-extremal); heapsort reuses extract-max $n$ times (M4).

::: callout-formula KTU Formula Vault: Heap
Parent $\ge$ children (max) · insert/extract **$O(\log n)$** · peek **$O(1)$** · build **$\Theta(n)$** bottom-up.
:::

::: callout-pitfall Heap ≠ Sorted, Heap ≠ BST
Heap guarantees only ancestor-dominance (siblings unordered; inorder meaningless). Searching arbitrary keys is $O(n)$; sorted output needs $n$ extractions (heapsort). Claiming BST powers for heaps fails both ways.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Max-heap insert $10, 20, 5$ into empty, then extract-max. Show the array after each step (1-based).
:::

::: step [Step 2: Execution] Up Then Down
1. $[10]$ → append $20$, sift-up past $10$: $[20,10]$ → append $5$: $[20,10,5]$ (5's parent $20$ dominates, stays).
2. Extract: swap root/last → $[5,10]$, drop $20$; sift-down $5$ past $10$: $[10,5]$. Output $20$.
:::

::: step [Step 3: Conclusion] Final Result
Insert challenges upward; extraction sinks downward — name the direction per op and show the array, since index arithmetic is what's graded.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Min-heap $[2, 5, 3, 9, 6]$ (1-based array). Insert $1$. Final array?
(A) $[1, 2, 3, 9, 6, 5]$
(*B) Append: $[2,5,3,9,6,1]$; sift-up $1$ past $3$, past $2$: $[1,5,2,9,6,3]$
(C) $[1, 5, 3, 9, 6, 2]$
(D) $[2, 5, 3, 9, 6, 1]$ unchanged
::: explanation
$1$ bubbles from index $6$ → $3$ → $1$, swapping with $3$ then $2$. Each swap halves the index — $\log n$ hops, array shown per hop for marks.
:::

::: quiz Q2: Foundational Concept
Why is bottom-up heapify $\Theta(n)$ and not $O(n\log n)$?
(A) It skips leaves only
(*B) Sift-down cost shrinks with depth — half the nodes are leaves (cost $0$), and total work sums to linear via the $h/2^h$ series
(C) Heaps are small
(D) It uses extra memory
::: explanation
$\sum$ (nodes at height $h \times h$) $= n\sum h/2^h = \Theta(n)$: exponentially many nodes do near-zero work. Repeated-insert building pays $O(n\log n)$ — method matters, quote which you use.
:::

::: quiz Q3: Foundational Concept
Priority queue via heap vs via sorted array — trade?
(A) Sorted array wins everything
(*B) Heap: insert + extract $O(\log n)$ each; sorted array: extract $O(1)$ but insert $O(n)$ shifting — heaps balance both ends
(C) Heaps search faster
(D) No difference
::: explanation
Workloads mixing arrivals and service need both ops cheap — heaps deliver. Sorted arrays suit insert-rarely/extract-often extremes only. Match structure to op mix.
:::
