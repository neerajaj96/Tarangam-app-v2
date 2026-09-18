# Bin Packing: Approximation Algorithms

**NP-hard packing, Next/First/Best-Fit online rules, First-Fit Decreasing, approximation ratios, and lower-bound certificates.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Packing a Moving Truck
Boxes arrive one by one and must go *somewhere now* (online) — or you've seen them all and can pre-sort (offline). **Next Fit** uses one open box, sealing it forever when the next item won't fit (amnesiac, wasteful). **First Fit** keeps all open boxes and slots each item into the *first* that fits (remembers everything). **Best Fit** picks the *tightest* fit (greedy tidiness). **First-Fit Decreasing** sorts big-to-small first — the tiny items at the end plug gaps like sand filling gravel. Sorting first is the whole superpower: FFD's worst case (~22% over optimum) crushes online rules (~70% over).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Problem and Lower Bounds

Items sizes $s_i \in (0,1]$, bins capacity 1, minimize bin count. Decision form is NP-complete (from Partition); optimization is NP-hard — approximation is the honest goal. Universal lower bounds for any instance: $\lceil \sum s_i \rceil$ bins (total size) and at least (#items $> 1/2$) bins (each needs its own).

### 2.2 The Algorithms and Their Guarantees

* **Next Fit (NF):** one open bin; overflow seals it forever. $\le 2\cdot OPT - 1$ (at most ~2× optimal — adjacent bin pairs always sum $> 1$).
* **First Fit (FF):** lowest-indexed fitting bin. $\le 1.7 \cdot OPT + 2$ — remembers all open bins, roughly halves the waste.
* **Best Fit (BF):** tightest-fitting bin. Same $1.7$ asymptotic family as FF.
* **First-Fit Decreasing (FFD):** sort descending, then First Fit. $\le \frac{11}{9} OPT + 1$ ($\approx 22\%$ over) — sorting first dominates every online rule; the bound's proof fills textbook chapters.

::: callout-formula KTU Formula Vault: Packing Ratios
Lower bounds: **⌈total size⌉**, **count of >1/2 items** · NF **≤ 2·OPT − 1** · FF/BF **≤ 1.7·OPT + 2** · FFD **≤ 11/9·OPT + 1** · mantra: **"sort descending first"** converts online mediocrity into near-optimality.
:::

::: callout-pitfall Ratios Are Worst-Case, Not Report Cards
$11/9 \cdot OPT + 1$ promises FFD is *never worse* than that — typical instances land far closer to optimal. Quoting the ratio as *expected* performance wildly undersells the algorithm; quoting optimal-on-all-inputs oversells it. Bounds bound the worst; practice lives near the best.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Capacity $10$, items $[6, 5, 5, 4, 4, 3, 2]$ (total $29$ → lower bound $\lceil 2.9 \rceil = 3$ bins). Run First Fit, then First-Fit Decreasing, and certify optimality.
:::

::: step [Step 2: Execution] Packing Twice
**First Fit (given order):** 6→B1{6}; 5→B1? $11 > 10$ ✗ → B2{5}; 5→B2 ($5+5=10$ ✓); 4→B1 ($6+4=10$ ✓); 4→B3{4}; 3→B3 ($7$ ✓); 2→B3 ($9$ ✓). **FF = 3 bins** (B1:{6,4}, B2:{5,5}, B3:{4,3,2}).
**FFD (sorted: same order here — already descending):** identical 3 bins. Lower bound was 3 → **OPT = 3, both optimal** on this instance.
:::

::: step [Step 3: Conclusion] Final Result
Three bins against a floor of three: optimal, certified without search — the lower bound did the proving, the algorithm did the packing. Note the luck: FFD *guarantees* near-optimal always, but *certificates* of optimality need a matching lower bound, which only sometimes cooperates.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
