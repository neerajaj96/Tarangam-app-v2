---
id: m3_02_minimum_spanning_trees_kruskal_prim
courseCode: PCCST502
module: 3
sequence: 2
title: Minimum Spanning Trees: Kruskal & Prim
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Bless MST edges with the cut property and skip with the cycle property
  - Trace Kruskal with sorting plus Union-Find cycle checks
  - Grow Prim's frontier with heap-priced attachments
concepts:
  - cut property
  - Kruskal's algorithm
  - Prim's algorithm
prerequisites:
  - m2_01_disjoint_sets_and_union_find
  - m3_01_greedy_strategy_control_abstraction
examRelevance: high
tags:
  - greedy
  - spanning-trees
---
# Minimum Spanning Trees: Kruskal & Prim

**Cut property, cycle property, Kruskal with Union-Find, Prim's frontier growth, and a hand-traced MST both ways.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Connect all vertices (islands) with the cheapest set of edges (bridges) that keeps everything reachable — no cycles (a cycle wastes a bridge), minimum total weight. That set is a **Minimum Spanning Tree (MST)**: spanning (touches every vertex), tree (acyclic), minimum (cheapest possible total). Two greedy instincts solve it differently — and one theorem licenses both.

::: callout-intuition Core Mental Model: Cheapest Islands Network
**Kruskal** (named after Joseph Kruskal): sort all bridges by price; build the cheapest that does not close a loop (global shopping list, Union-Find as loop detector). **Prim** (named after Robert Prim): stand on one island; repeatedly build the cheapest bridge from *your territory* outward (one tree always). Different walks, same cheapest network — because both obey the cut property. Drop the islands now: cuts, sorts, and frontiers below are the exact content.
:::

**Tiny toy example (3 vertices).** Triangle edges: $a$–$b$ (1), $b$–$c$ (2), $a$–$c$ (3). MST = {1, 2}, cost 3. Kruskal: take 1, take 2, skip 3 (cycle). Prim from $a$: take 1 to $b$, then 2 to $c$. Both agree here.

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols:** cut = a partition of vertices into $S$ / $V-S$; an edge "crosses" the cut if its endpoints lie on opposite sides; MST = minimum spanning tree.

**The cut property (the only theorem here).** For **any** cut, the **lightest edge crossing it belongs to *some* MST**. Proof sketch (exchange): if the MST-to-be skipped it, adding it creates a cycle crossing the cut at a pricier edge — swap and improve. Corollary (**cycle property**): the *heaviest* edge on any cycle belongs to *no* MST.

**Kruskal — numbered steps:**

1. Sort all edges lightest-first: $\Theta(E \log E)$.
2. Scan: take each edge unless its endpoints are already connected (Union-Find FIND test); each taken edge is lightest across its component's cut.
3. Stop at $V-1$ edges. Union-Find adds near-linear dust.

**Prim — numbered steps:**

1. Root an arbitrary start vertex; its singleton is the territory.
2. Repeatedly attach the cheapest edge leaving the territory (priority queue = heap, a structure always yielding the minimum).
3. Each attachment invokes the cut property on (territory / rest). Cost $\Theta(E \log V)$ with a binary heap.

```text
Kruskal (global list):            Prim from 1 (territory):

edges sorted: 1,2,2,3,            {1} --2--> {1,3} --1--> {1,3,2}
  4,5,6,8,10                      --5--> {1,3,2,4} --2--> ...
take unless cycle                 always cheapest edge OUT
```

::: callout-formula KTU Formula Vault: MST Facts
Cut: **lightest crossing edge ∈ some MST** · cycle: **heaviest on a cycle ∈ no MST** · Kruskal: **sort + Union-Find**, $\Theta(E\log E)$ · Prim: **grow + heap**, $\Theta(E\log V)$ · dense graphs: Prim wins (no sort of $V^2$ edges); sparse: Kruskal shines.
:::

::: callout-pitfall "Some MST" ≠ "The MST" (Distinct Weights Guarantee Uniqueness)
The cut property promises membership in *some* MST — with tied weights, Kruskal's and Prim's choices can legitimately differ yet both be optimal. Distinct edge weights *guarantee* a unique MST; equal weights merely *allow* multiple optima (they do not force them). Any "the algorithm finds THE tree" claim without distinctness is overstated.
:::

---

<a id="worked-example"></a>
## 3. Worked example — six vertices, both algorithms

::: step [Step 1: Setup] Formulating the Problem
Graph on $\{1..6\}$, edges (weight): 2–3(1), 1–3(2), 4–5(2), 5–6(3), 1–2(4), 2–4(5), 4–6(6), 3–4(8), 3–5(10). Run Kruskal fully (with Union-Find states); give Prim-from-1's attachment order.
:::

::: step [Step 2: Execution] Tracing Both
**Kruskal** (sorted): take 2–3(1) [{2,3}]; take 1–3(2) [{1,2,3}]; take 4–5(2) [{4,5}]; skip 1–2(4) (cycle 1–3–2); take 5–6(3) [{4,5,6}]; take 2–4(5) (merges {1,2,3}+{4,5,6}); skip 4–6(6), 3–4(8), 3–5(10) (cycles). MST **{2–3, 1–3, 4–5, 5–6, 2–4}**, cost $1+2+2+3+5 = \mathbf{13}$. **Prim from 1:** out of {1}: 1–3(2) → {1,3}: cheapest out 2–3(1) → {1,2,3}: cheapest out 2–4(5) → add 4: cheapest out 4–5(2) → add 5: cheapest out 5–6(3). Same edge set, cost 13.
:::

::: step [Step 3: Conclusion] Final Result
Both bank cost **13** by different disciplines — Kruskal rejected four cycle-closers; Prim never considered them. Same optimum, complementary certificates: sorted-list greed vs territorial greed, both licensed by the cut property. (The tied weight-2 edges merely *allow* divergence in general; here each is forced by its own cut.)
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- "Lightest crossing *some* cut" is per-step: Kruskal's edge is lightest for *its component's* cut, not globally lightest remaining (skipped edges are heavier on their cycle).
- Dense vs sparse preference flips: Kruskal's sort wall is $\Theta(V^2 \log V)$ when dense.
- $V-1$ edges is the stop rule for connected graphs — count them to catch trace slips.

| Similar pair | Distinction that earns marks |
|---|---|
| Cut vs cycle property | Lightest-crossing ∈ some MST vs heaviest-on-cycle ∈ no MST |
| Kruskal vs Prim growth | Merging forest (global sort) vs single growing tree (heap frontier) |
| Unique vs some MST | Distinct weights ⇒ unique; ties allow (never force) divergence |

**Exam recap (facts an examiner rewards):** cut property statement + exchange sketch; Kruskal $\Theta(E \log E)$ with Union-Find cycle test; Prim $\Theta(E \log V)$ heap; dense→Prim, sparse→Kruskal.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Kruskal considers edge e (weight 7) connecting two vertices already in the same Union-Find set. Why must e be skipped, and which property blesses the skip?
() e is skipped because 7 is always too heavy for any MST
(*) Its endpoints are already connected by cheaper taken edges, so e would close a cycle — and the cycle property says a heaviest-on-cycle edge belongs to no MST (e, arriving in sorted order, is the heaviest so far on that cycle)
() Union-Find cannot process weight-7 edges by design
() Skipping is optional; taking it also yields an MST
::: explanation
Same-set endpoints = a path already links them using only lighter taken edges; adding $e$ closes a cycle on which $e$ is heaviest (sorted processing guarantees it). The cycle property then *forbids* $e$ from every MST — skipping isn't caution, it's correctness.
:::

::: quiz Prim grows one tree from a root while Kruskal grows a forest that merges. Why are both correct despite opposite shapes?
() They solve different problems that happen to coincide here
(*) Each step of either algorithm takes the lightest edge across *some* cut (Kruskal: its component's cut; Prim: the grown tree's cut) — the cut property licenses every single attachment in both
() Forests always outperform single trees asymptotically
() Prim secretly restarts as Kruskal halfway through
::: explanation
Shape differs, license is identical: each committed edge is a lightest-crossing edge of the cut it bridges. Kruskal's cuts are its young components; Prim's cut is the territory boundary. One theorem, two walk styles — which is why both land on MST cost.
:::

::: quiz On a dense graph (E ≈ V²) versus a sparse graph (E ≈ V), which MST algorithm is preferred and why?
() Kruskal always — sorting is free on dense graphs
(*) Dense: Prim with a binary heap Θ(E log V) avoids Kruskal's Θ(E log E) = Θ(V² log V) sort wall; sparse: Kruskal's near-linear Union-Find phase after a cheap sort wins
() Neither — MST on dense graphs is NP-hard
() Always Prim, because Kruskal cannot handle dense input
::: explanation
Kruskal pays sorting up front: $\Theta(V^2 \log V)$ when dense. Prim's heap operations scale with actual edges touched. Sparse flips it: sorting $O(V)$ edges is trivial and Union-Find is nearly free. Match the algorithm to the density — the standard complexity tradeoff question.
:::
