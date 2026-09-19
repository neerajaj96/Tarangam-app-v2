---
id: m2_01_disjoint_sets_and_union_find
courseCode: PCCST502
module: 2
sequence: 1
title: Disjoint Sets & Union-Find
difficulty: beginner
estimatedMinutes: 5
learningObjectives:
  - Serve dynamic connectivity with make-set, find and union
  - Attach by rank with path compression on every climb
  - Claim the near-constant amortized bound with both tricks on
concepts:
  - disjoint sets
  - union by rank
  - path compression
prerequisites: []
examRelevance: high
tags:
  - disjoint-sets
  - union-find
---
# Disjoint Sets & Union-Find

**Dynamic connectivity, MAKE-SET/FIND/UNION, union by rank, path compression, and the near-constant inverse-Ackermann bound.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Family Trees at a Reunion
Imagine tracking which guests at a huge reunion belong to the same family. Each family picks one elder as its **representative**. Two operations cover everything: "are these two guests related?" (climb both family trees to the elders and compare) and "these two families just married — merge them" (graft one elder under the other). Two speed tricks make it fly: always graft the **shorter tree under the taller** (union by rank), and whenever you climb, **re-hang everyone you pass directly under the elder** (path compression) — future queries from those guests then finish in a single hop.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Three Operations

* **MAKE-SET(x):** create a one-node tree; $x$ is its own parent and representative. Cost $O(1)$.
* **FIND(x):** follow parent pointers to the root (the set's name). *With* path compression, every visited node is rewired to point at the root on the way back.
* **UNION(x, y):** FIND both roots; attach the root of **smaller rank** under the root of larger rank (union by rank); if tied, pick either and increment its rank. (Rank ≈ upper bound on tree height, *not* exact size — a common exam trap.)

```text
UNION(e, b) by rank:          FIND(c) with path compression:

  (a)r1        (d)r0                a                   a
 / \          /                    / \                 /|\
b   c        e          ==>       b   c    ==>        b c d
   / \
  d   e                          d
   (rank 1 subtree)              (d rewired to root a)
```

::: anim union-find Union, Then Flatten
Watch two rank-1 trees merge under one elder, then FIND(d) rewire straight to the root — every future query on that path costs a single hop.
:::

### 2.2 The Amortized Bound

With **both** heuristics, any sequence of $m$ operations on $n$ elements costs $O(m \cdot \alpha(n))$, where $\alpha$ is the **inverse Ackermann function** — a function growing so slowly that $\alpha(n) \le 4$ for every $n$ up to the number of atoms in the universe. Effectively constant time per operation.

::: callout-formula KTU Formula Vault: Union-Find in 5 Lines
MAKE-SET $O(1)$ · FIND climbs to root · UNION attaches **smaller rank under larger** · compression **rewires the whole climb path** to the root · amortized cost $O(\alpha(n))$ ≈ constant **only with both heuristics together**.
:::

::: callout-pitfall Rank Is Not Size (and Compression Is Not Free Alone)
Rank bounds height; it is *not* the node count (that's union-by-*size*, a different variant). And path compression alone — without union by rank — still degrades: tall skinny trees keep forming. The $\alpha(n)$ miracle needs **both**. Any "one heuristic suffices" option is wrong.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Start with singletons $\{a\},\{b\},\{c\},\{d\}$. Execute: UNION(a,b), UNION(c,d), UNION(a,c) — all by rank — then FIND(d) with path compression. Draw the forest after each step and count FIND(d)'s hops before and after a second FIND(d).
:::

::: step [Step 2: Execution] Tracing Pointers
UNION(a,b): ranks tie (0,0) → $b$ under $a$, rank($a$)=1. UNION(c,d): $d$ under $c$, rank($c$)=1. UNION(a,c): ranks tie (1,1) → $c$ under $a$, rank($a$)=2. Forest: $a$ with children $b,c$; $c$ with child $d$. FIND(d): climb $d \to c \to a$ (**2 hops**), rewiring $d$ (and confirming $c$) directly under $a$. Second FIND(d): $d \to a$ (**1 hop**).
:::

::: step [Step 3: Conclusion] Final Result
The first query paid 2 hops and flattened the path; every later query on $d$ costs 1. Across Kruskal's algorithm (thousands of UNION/FINDs on graph edges), this self-flattening is what drags the total to near-linear — the data structure literally gets faster the more you use it.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz During UNION(x, y) by rank, root Rx has rank 3 and root Ry has rank 1. What happens?
() Ry becomes parent and its rank rises to 4
(*) Rx becomes parent; ranks stay 3 and 1 (no increment, since ranks differ)
() Both ranks reset to 0 and the trees are rebuilt
() The operation is illegal — ranks must always match
::: explanation
Attach smaller under larger; rank increments *only* on ties (when height can genuinely grow). Here Ry's whole tree hangs under Rx with zero rank changes — the invariant (rank bounds height) is preserved for free.
:::

::: quiz What does path compression do during FIND(x), and what does it cost future operations?
() It deletes all nodes on the path to save memory
(*) It rewires every node on the climb directly under the root, so repeat queries on them finish in one hop — future work subsidized by present work
() It sorts the path nodes by key value
() Nothing observable; it is purely cosmetic
::: explanation
Compression spends a few extra pointer writes during this FIND to flatten the path permanently. The data structure amortizes: early queries pay to pave roads that all later queries drive on for free — half of the $\alpha(n)$ miracle.
:::

::: quiz Kruskal's algorithm sorts edges then UNIONs endpoints unless already connected. Which Union-Find facts make this fast?
() FIND without compression plus union by coin flip
(*) Union by rank keeps trees shallow and path compression flattens climbed paths, giving near-constant amortized operations across the whole edge sequence
() MAKE-SET alone; FIND/UNION are never actually called
() Kruskal doesn't use Union-Find at all
::: explanation
Kruskal issues $O(E)$ FIND/UNION operations; with both heuristics the total is $O(E\,\alpha(V))$ — effectively linear, so sorting dominates. Drop either heuristic and the disjoint-set work can balloon to $O(E \cdot V)$ in the worst case.
:::
