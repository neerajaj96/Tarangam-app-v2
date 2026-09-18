# Input Space Partitioning, ECP & BVA

**Slicing infinity testably — partitions, equivalence classes, and boundary-value obsession.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Orchard Grading
Input space is an orchard (infinite fruits!): **partition** into blocks behaving alike (ripe/rotten by spec clauses!), pick **one representative per block** (equivalence hypothesis: same-block ⇒ same-verdict!), then obsess over **fences between blocks** (boundary values: off-by-ones live *on* edges — min-1/min/min+1/max-1/max/max+1 sextuplets!). Grading effort follows defect-density folklore (edges first, interiors sampled!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 ISP characteristics + ECP/BVA mechanics

* Characteristics from specs (valid/invalid per clause!; multiple characteristics combine — pairwise/Each-choice coverage of combos!).
* ECP: one-per-class (valid + invalid classes both! — invalids test error-handling!).
* BVA: $6$-point edge sextuplets per numeric boundary (robustness variant adds just-outside invalids!); non-numeric boundaries (first/last/empty/full of collections!).

::: callout-formula KTU Formula Vault: Partitions
Partition by **spec clauses** · one **per class** · edges get **sextuplets** · invalids **test handling**.
:::

::: callout-pitfall Representative Rot (Stale Partitions!)
Specs evolve, partitions fossilise (new clauses untested — partition reviews per spec-change!). Partition-maintenance (living documents, traced!) beats one-time slicing — freshness audited, not assumed.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Ticket field: integers $1$–$100$ (spec!), quantity discount $\ge10$. (a) Partitions? (b) BVA sextuplet for $100$? (c) Invalid-class tests?"
:::

::: step [Step 2: Execution] Slice and Fence
1. (a) $[1,9]$ full-price, $[10,100]$ discounted, $(-\infty,0]$ invalid-low, $[101,\infty)$ invalid-high (clause-derived blocks!).
2. (b) $99,100,101$ (+$98$? classic sextuplet $99,100,101$ around max with $98$ extended-robustness!; min-side $0,1,2$!).
3. (c) $0,-5$ (rejection path!), $101,10^9$ (overflow-adjacent!), `"abc"` type-reject (non-numeric class!).
:::

::: step [Step 3: Conclusion] Final Result
Clause-blocks, edge-sextuplets, invalid-journeys — partition answers show all three (valid reps + fences + invalid handling!). Invalid-class courage (testing rejections!) separates thorough suites.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Equivalence hypothesis (same-block ⇒ same-verdict) risks:
(A) Nothing, always true
(*B) Intra-block variance (spec-missed sub-behaviours — floats vs ints in "numeric"!, hidden modes!) — hypothesis *assumed*, occasionally false (representative roulette!); boundaries + subdomain sampling hedge it
(C) Slower testing
(D) Tool incompatibility
::: explanation
Partition validity is itself a hypothesis (untestable exhaustively — that's the point!). Hedge with boundaries (edges!) + reasoned sub-splits (type-aware!) — hypothesis-aware testing states the bet.
:::

::: quiz Q2: Numerical Drill
Boundary at $x\ge18$ (adult gate). BVA sextuplet?
(A) $18$ only
(*B) $17,18$ (+$16$ robust-low!; $19$ robust-high side? Sextuplet $17,18$ core with $16,19$ robustness wings — min-side $16,17,18$ shown; max-side unbounded here ($18+$ open — no max fence!))
(C) $0,18,100$
(D) $18,19$
::: explanation
One-sided boundaries fence once ($17|18$ edge + robustness wings $16$ (+$19$ sanity!); open-ended side needs no max-fence!). Fence-shape honesty (one-sided vs two-sided!) tailors sextuplets — blind six-point rituals waste.
:::

::: quiz Q3: Foundational Concept
Invalid classes tested (not just valid) because:
(A) Sadism toward developers
(*B) Rejection paths are code (validators/parsers/error-pages — untested handlers crash/leak (stack traces spill internals!) — robustness *is* specified behaviour for bad input!)
(C) Coverage percentages
(D) Fuzzers demand it
::: explanation
Error-handling is specified behaviour (graceful rejection *is* the requirement for invalids!). Handler-touring (rejection journeys end-to-end!) plus leak-audits (verbose errors!) complete invalid-class testing.
:::
