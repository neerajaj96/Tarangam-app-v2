# Selection & Insertion Sort with Analysis

**The two quadratic incumbents — extremal picking vs card-hand insertion, traced and costed.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Lineup vs Card Hand
**Selection:** repeatedly draft the shortest remaining person to the front — $n$ drafts, draft $k$ scans $n-k+1$ candidates (no early exit, comparisons fixed). **Insertion:** grow a sorted hand card by card, sliding each newcomer left past bigger cards — nearly-sorted hands finish in near-linear time (adaptive!), reversed hands pay full quadratic.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Mechanics and costs

* **Selection:** $n-1$ passes, pass $i$ finds min of suffix ($n-i$ compares), swaps once. Comparisons $\sum = n(n-1)/2 = \Theta(n^2)$ always; swaps $O(n)$. Unstable (long swaps leapfrog equals).
* **Insertion:** insert $a[i]$ into sorted prefix by shifting bigger elements right. Worst/reverse $\Theta(n^2)$; best/sorted $\Theta(n)$ (each newcomer compares once); average $\Theta(n^2)$. Stable, adaptive, $O(1)$ space. Both in-place.

::: callout-formula KTU Formula Vault: Quadratics
Selection: **$\Theta(n^2)$ always, $O(n)$ swaps, unstable** · insertion: **best $\Theta(n)$, worst $\Theta(n^2)$, stable, adaptive**.
:::

::: callout-pitfall Selection Never Adapts
Sorted input still costs selection all $n(n-1)/2$ comparisons (no early-exit possible — the min *must* be verified). "Selection on sorted data is $O(n)$" is false; that's insertion's trick.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Sort $[29, 10, 14, 37, 13]$ by selection (show array per pass) and count insertion-sort shifts on the same array.
:::

::: step [Step 2: Execution] Passes and Shifts
1. Pass1 min $10$: $[10,29,14,37,13]$. Pass2 min $13$: $[10,13,14,37,29]$. Pass3 $14$ stays. Pass4 min $29$: $[10,13,14,29,37]$. Done ($4$ passes, $10$ compares).
2. Insertion: $10$ shifts past $29$ (1); $14$ past $29$ (1); $37$ none; $13$ past $37,29,14$ (3). Total $5$ shifts.
:::

::: step [Step 3: Conclusion] Final Result
Selection traces show the growing sorted prefix + shrinking scan zone; insertion traces count shifts per card. Prefix/zone discipline is what graders check per pass.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Selection-sort comparisons for $n = 8$ (any input)?
(A) $64$
(*B) $n(n-1)/2 = 28$ — input-independent
(C) $8$
(D) $8\log 8$
::: explanation
Passes scan $7+6+\dots+1 = 28$ regardless of order — selection's comparison count is a pure function of $n$. (Swaps vary, comparisons don't.)
:::

::: quiz Q2: Foundational Concept
Insertion sort on already-sorted input costs:
(A) $\Theta(n^2)$
(*B) $\Theta(n)$ — each card compares once with its sorted neighbour and stays
(C) $\Theta(n\log n)$
(D) $\Theta(1)$
::: explanation
Adaptivity: sorted Prefix means one compare + zero shifts per card, $n-1$ total. Best-case linearity is insertion's headline over selection — quote the pair contrasted.
:::

::: quiz Q3: Foundational Concept
Which is stable: selection or insertion, and why does it matter?
(A) Selection — swaps preserve order
(*B) Insertion — equal cards never cross (shifts stop at $>$); stability keeps satellite data (e.g. names) ordered by earlier sorts
(C) Both equally
(D) Neither ever
::: explanation
Insertion shifts only strictly-greater cards, so equals keep arrival order; selection's long swap can hurl an equal past its twin. Stability matters for multi-key sorting (sort by name, then stably by grade).
:::
