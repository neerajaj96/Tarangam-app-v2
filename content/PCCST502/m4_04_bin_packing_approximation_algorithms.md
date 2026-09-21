---
id: m4_04_bin_packing_approximation_algorithms
courseCode: PCCST502
module: 4
sequence: 4
title: 'Bin Packing: Approximation Algorithms'
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Certify packings with total-size and oversized-item lower bounds
  - Price online Next, First and Best-Fit rules against optimal
  - Convert mediocrity with sort-descending-first guarantees
concepts:
  - approximation ratios
  - lower-bound certificates
  - fit heuristics
prerequisites:
  - m4_03_np_completeness_p_np_reductions
examRelevance: high
tags:
  - approximation
  - bin-packing
---
# Bin Packing: Approximation Algorithms

**NP-hard packing, Next/First/Best-Fit online rules, First-Fit Decreasing, approximation ratios, and lower-bound certificates.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Items of sizes $s_i \in (0,1]$ arrive; bins hold capacity 1; use as few bins as possible. The decision form is NP-complete (from Partition), the optimization NP-hard — exact optima are off the table for large inputs, so the honest goal is a *guaranteed-near* packing: never worse than a stated multiple of optimal. Abbreviations: OPT = optimal bin count; NF/FF/BF/FFD = Next/First/Best-Fit/(Decreasing) heuristics; "online" = items arrive one by one, decide-now-forever.

::: callout-intuition Core Mental Model: Packing a Moving Truck
Boxes arrive one by one and must go *somewhere now* (online) — or you have seen them all and can pre-sort (offline). **Next Fit** uses one open box, sealing it forever on overflow (amnesiac). **First Fit** keeps all boxes open, slotting each item into the *first* that fits (total recall). **Best Fit** picks the *tightest* fit (tidiness). **First-Fit Decreasing** sorts big-to-small first — tiny items at the end plug gaps like sand in gravel. Sorting is the superpower: FFD's worst case (~22% over) crushes online rules (~70% over). Drop the truck now: ratios and lower bounds below are the exact guarantees.
:::

**Tiny toy example (capacity 10).** Items $[6, 4, 5]$: Next Fit packs {6,4} then {5} → 2 bins (optimal here). Items $[5, 5, 6, 4]$ in that order: NF packs {5,5} then {6,4} → 2 bins — but order $[6, 4, 5, 5]$? Same 2. Online pain needs adversarial orders (covered in quizzes) — the point stands: order decides waste.

::: toggle What are `bin`, `OPT`, `online`, `approximation ratio`, `lower bound`?
`Bin` = capacity-1 container (items are fractions $s_i \in (0,1]$ of it). `OPT` = the optimal (minimum) bin count for this instance (unknown in practice — bounds estimate it). `Online` = items arrive one by one, decide-now-forever (no lookahead, no reorder). `Approximation ratio` = worst-case multiple of OPT the rule never exceeds (FFD ≤ 11/9·OPT + 1 — a ceiling, not a report card). `Lower bound` = a count no packing beats ($\lceil\sum s_i\rceil$ total-size floor, oversized-item floor) — matching bound + packing certifies optimality without search.
:::

::: toggle Trace Next Fit vs First Fit on `[5, 5, 6, 4]` (capacity 10)
Next Fit (one open bin, amnesiac): 5→B1{5}; 5→B1{5,5} full; 6 overflows → seal B1, open B2{6}; 4→B2{6,4}. Total 2. First Fit (all bins open, lowest fitting): 5→B1; 5→B1; 6→B2 (B1 overflows); 4→B1 (first fit — B1 has room 5 ≥ 4!). Total 2, but B1 reused where NF sealed it — memory (all open bins) vs amnesia (one open bin) is the whole difference, and the $2·OPT−1$ proof counts sealed pairs summing > 1.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Problem and lower bounds — numbered facts:**

1. Items $s_i \in (0,1]$, bins capacity 1, minimise bin count.
2. Universal lower bounds for any instance: $\lceil \sum s_i \rceil$ bins (total size — bins cannot hold more than 1) and at least (#items $> 1/2$) bins (each needs its own — two never share).
3. Matching lower bound + packing certifies *optimality* without search.

**Algorithms and guarantees — numbered:**

1. **Next Fit (NF):** one open bin; overflow seals it forever. $\le 2\cdot OPT - 1$ (adjacent bin pairs always sum $> 1$ — sealed bins were each overfull with the next item).
2. **First Fit (FF):** lowest-indexed fitting bin. $\le 1.7 \cdot OPT + 2$ — memory halves the waste.
3. **Best Fit (BF):** tightest-fitting bin. Same $1.7$ asymptotic family as FF.
4. **First-Fit Decreasing (FFD):** sort descending, then First Fit. $\le \frac{11}{9} OPT + 1$ ($\approx 22\%$ over) — sorting dominates every online rule; the full proof fills textbook chapters.

::: callout-formula KTU Formula Vault: Packing Ratios
Lower bounds: **⌈total size⌉**, **count of >1/2 items** · NF **≤ 2·OPT − 1** · FF/BF **≤ 1.7·OPT + 2** · FFD **≤ 11/9·OPT + 1** · mantra: **"sort descending first"** converts online mediocrity into near-optimality.
:::

::: callout-pitfall Ratios Are Worst-Case, Not Report Cards
$11/9 \cdot OPT + 1$ promises FFD is *never worse* than that — typical instances land far closer to optimal. Quoting the ratio as *expected* performance undersells the algorithm; claiming optimal-on-all-inputs oversells it. Bounds bound the worst; practice lives near the best.
:::

---

<a id="worked-example"></a>
## 3. Worked example — First Fit traced, optimality certified

::: step [Step 1: Setup] Formulating the Problem
Capacity $10$, items $[6, 5, 5, 4, 4, 3, 2]$ (total $29$ → lower bound $\lceil 2.9 \rceil = 3$ bins). Run First Fit, then First-Fit Decreasing; certify.
:::

::: step [Step 2: Execution] Packing Twice
**First Fit (given order):** 6→B1{6}; 5→B2{5} (B1 overflows); 5→B2 ($10$ ✓); 4→B1 ($10$ ✓); 4→B3{4}; 3→B3 ($7$ ✓); 2→B3 ($9$ ✓). **FF = 3 bins** (B1:{6,4}, B2:{5,5}, B3:{4,3,2}). **FFD (sorted — already descending):** identical 3 bins. Lower bound was 3 → **OPT = 3, both optimal** here.
:::

::: step [Step 3: Conclusion] Final Result
Three bins against a floor of three: optimal, certified without search — the bound proved, the algorithm packed. The luck: FFD *guarantees* near-optimal always, but *certificates* of optimality need a cooperating lower bound, which only sometimes matches.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- FFD's sort is banned *online* — quoting FFD ratios for fixed-order arrivals is a category error; FF/BF is the online answer.
- $\lceil\sum s_i\rceil$ alone rarely matches: combine both lower bounds and take the stronger.
- Packing 8 into a floor-7 instance proves *near*-optimal (gap ≤ 1), never optimal — closing needs a 7-packing or a stronger floor.

| Similar pair | Distinction that earns marks |
|---|---|
| Online vs offline rules | Decide-now-forever (NF/FF/BF) vs sort-first (FFD) — different ratios |
| Ratio vs certificate | Never-worse-than (always) vs optimal-here (needs matching bound) |
| NF vs FF memory | One open bin (amnesia, 2×) vs all open bins (recall, 1.7×) |

**Exam recap (facts an examiner rewards):** both lower bounds; all four ratios with the sort-descending mantra; ratio = worst-case, not typical; the 3-bin trace with its matching floor.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Items arrive online (order fixed, no sorting allowed). Which rule, and what worst-case price versus optimal?
() First-Fit Decreasing at 11/9·OPT + 1 — sorting is always permitted
(*) First Fit at ≤ 1.7·OPT + 2 (or Best Fit, same family) — without presorting, ~70% overhead is the price of irrevocable online decisions
() Next Fit at exactly OPT — online never costs anything
() Random placement, which is optimal in expectation
::: explanation
FFD's power *is* the sort — banned online. Among true online rules, FF/BF remember all open bins ($\le 1.7\times$) while NF's amnesia costs up to $2\times$. "Online" means decide-now-forever; the ratio prices exactly that handicap.
:::

::: quiz A lower bound says OPT ≥ 7 bins and your algorithm packed 8. What have you proven about your packing, and what remains open?
() Proven optimal — bounds are always tight
(*) Proven at most 1 bin from optimal (8 vs ≥7) — near-optimal certified; whether 7 is achievable (bound loose?) or 8 is truly optimal stays open without more work
() Proven nothing — lower bounds carry no information
() Proven the bound itself is wrong
::: explanation
Bounds sandwich: $7 \le OPT \le 8$. The packing is certified *near*-optimal (gap ≤ 1) — often enough to stop. Closing the gap needs either a better packing (7 found?) or a stronger bound (raise the floor) — the standard approximation workflow.
:::

::: quiz Why does sorting descending first (FFD) beat First Fit so decisively, in one mechanism?
() Sorting makes items physically smaller
(*) Big items placed early face empty bins (no awkward leftovers yet); tiny items placed late plug the remaining gaps like sand — ascending order strands big items against fragmented space instead
() Descending order is required for the bins to close properly
() Sorting changes the approximation ratio by definition
::: explanation
Fragmentation is created by *early small* items chopping bins into unusable slivers that later big items can't fill. Big-first reserves clean large slots; small-last filters into cracks. Order of arrival is FFD's only advantage over FF — and it's worth nearly 50 points of ratio.
:::
