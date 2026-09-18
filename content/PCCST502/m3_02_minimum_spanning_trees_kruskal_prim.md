# Minimum Spanning Trees: Kruskal & Prim

**Cut property, cycle property, Kruskal with Union-Find, Prim's frontier growth, and a hand-traced MST both ways.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Cheapest Islands Network
Six islands need bridges so all connect, minimizing total cost. Two instincts: **Kruskal** — sort all possible bridges by price, build the cheapest that doesn't close a loop (global shopping list, Union-Find as the loop detector). **Prim** — stand on one island, repeatedly build the cheapest bridge from *your connected territory* outward (territorial growth, one tree always). Different walks, same cheapest network — because both obey one law: the cut property.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Cut Property (the Only Theorem That Matters Here)

For **any** cut (partition of vertices into $S$ / $V-S$), the **lightest edge crossing it belongs to *some* MST**. Proof sketch (exchange): if the MST-to-be skipped that edge, adding it creates a cycle crossing the cut somewhere pricier — swap and improve. Corollary (**cycle property**): the *heaviest* edge on any cycle belongs to *no* MST.

* **Kruskal:** process edges lightest-first; take each unless it closes a cycle (Union-Find FIND test). Every taken edge is the lightest crossing *its* cut (the cut separating its young component) — cut property per step. $\Theta(E \log E)$ sorting dominates; Union-Find adds near-linear dust.
* **Prim:** grow one tree from a root; always attach the cheapest edge leaving the tree (priority queue). Each attachment invokes the cut property on (tree / rest). $\Theta(E \log V)$ with a binary heap.

```text
Kruskal (global list):            Prim from 1 (territory):

edges sorted: 1,2,2,3,            {1} --2--> {1,3} --1--> {1,3,2}
  4,5,6,8,10                      --5--> {1,3,2,4} --2--> ...
take unless cycle                 always cheapest edge OUT
```

::: callout-formula KTU Formula Vault: MST Facts
Cut: **lightest crossing edge ∈ some MST** · cycle: **heaviest on a cycle ∈ no MST** · Kruskal: **sort + Union-Find**, $\Theta(E\log E)$ · Prim: **grow + heap**, $\Theta(E\log V)$ · dense graphs: Prim wins (no sort of $V^2$ edges); sparse: Kruskal shines.
:::

::: callout-pitfall "Some MST" ≠ "The MST" (and Weights Must Differ for Uniqueness)
The cut property promises membership in *some* MST — with tied weights, Kruskal's and Prim's choices can legitimately differ and both be optimal. MST is **unique iff all edge weights are distinct**. Any "the algorithm finds THE tree" claim without distinctness is overstated.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Graph on $\{1..6\}$ with edges (weight): 2–3(1), 1–3(2), 4–5(2), 5–6(3), 1–2(4), 2–4(5), 4–6(6), 3–4(8), 3–5(10). Run Kruskal fully (with Union-Find states) and state Prim-from-1's attachment order.
:::

::: step [Step 2: Execution] Tracing Both
**Kruskal** (sorted): take 2–3(1) [{2,3}]; take 1–3(2) [{1,2,3}]; take 4–5(2) [{4,5}]; skip 1–2(4) (cycle 1–3–2); take 5–6(3) [{4,5,6}]; take 2–4(5) (merges {1,2,3}+{4,5,6} — all connected); skip 4–6(6), 3–4(8), 3–5(10) (cycles). MST edges: **{2–3, 1–3, 4–5, 5–6, 2–4}**, cost $1+2+2+3+5 = \mathbf{13}$.
**Prim from 1:** frontier cheapest out of {1}: 1–3(2) → {1,3}: cheapest out: 2–3(1) → {1,2,3}: cheapest out: 2–4(5) → {1,2,3,4}: cheapest out: 4–5(2) → add 5: cheapest out: 5–6(3). Same edge set, same cost 13 (both methods agree here, though the tied weight-2 edges mean uniqueness isn't forced in general — each tied edge just happens to be forced by its own cut).
:::

::: step [Step 3: Conclusion] Final Result
Both algorithms bank cost **13** via different disciplines — Kruskal rejected four cycle-closers (1–2, 4–6, 3–4, 3–5), Prim never considered them. Same optimum, complementary certificates: sorted-list greed vs. territorial greed, both licensed by the cut property.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
