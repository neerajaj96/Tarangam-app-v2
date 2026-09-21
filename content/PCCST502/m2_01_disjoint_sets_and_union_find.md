---
id: m2_01_disjoint_sets_and_union_find
courseCode: PCCST502
module: 2
sequence: 1
title: Disjoint Sets & Union-Find
difficulty: beginner
estimatedMinutes: 8
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
## 1. Start from zero — the problem first

**Problem first.** Given friendships forming over time ("A meets B — merge their groups"; "are C and D in the same group?"), how do we answer connectivity queries fast as merges keep coming? Re-scanning everyone per query is $O(n)$ each — too slow inside Kruskal's algorithm, which asks thousands of such questions. We need a data structure for *dynamic connectivity*: create groups, merge them, test membership — all nearly instantly.

::: callout-intuition Core Mental Model: Family Trees at a Reunion
Each family picks one elder as its **representative**. "Are these guests related?" = climb both family trees to the elders and compare. "These families married — merge" = graft one elder under the other. Two speed tricks: graft the **shorter tree under the taller** (union by rank), and whenever you climb, **re-hang everyone you pass directly under the elder** (path compression) — future queries then finish in one hop. Drop the reunion now: parents, ranks, and rewiring below are the exact mechanism.
:::

**Tiny toy example (3 guests).** Singletons $\{a\}, \{b\}, \{c\}$. UNION(a,b): $b$ under $a$. Query FIND(b): climb $b \to a$ (1 hop). UNION(a,c): $c$ under $a$. Every later query costs 1 hop — the structure flattens itself with use.

::: toggle What are `set`, `disjoint`, `representative`, `parent`, `root`, `forest`?
`Set` = a group of elements treated as one unit. `Disjoint` = sharing no elements (families don't overlap). `Representative` = the one member naming the set (the elder). `Parent` = each element's pointer upward (everyone except the root has one). `Root` = the element pointing to itself (the elder = the set's name). `Forest` = the collection of all such trees (all families at the reunion).
:::

::: toggle Why does `union by rank` help, and why does `path compression` help?
Union by rank grafts the shorter tree under the taller, so height grows only on ties (tall trees stay tall only when forced — bushiness preserved). Path compression rewires every climbed node directly under the root, so repeated queries shorten their own paths (the structure learns from use — first query pays, later ones ride free). Rank bounds growth; compression harvests reuse. Either alone degrades: tall-skinny trees without compression, unflattened paths without rank — the $\alpha(n)$ miracle needs both.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Input and data:** $n$ elements, each with a parent pointer; a root (its own parent) names its set. **Symbols:** rank $\approx$ upper bound on tree height (not node count); $\alpha(n)$ = inverse Ackermann function, $\le 4$ for every conceivable $n$ (effectively constant).

**Numbered steps — the three operations:**

1. **MAKE-SET(x):** new one-node tree; $x$ is its own parent and representative. Cost $O(1)$.
2. **FIND(x):** follow parent pointers to the root. *With path compression*, rewire every visited node directly under the root on the way back.
3. **UNION(x, y):** FIND both roots; attach the **smaller-rank** root under the larger; on ties pick either and increment its rank. Rank increments *only* on ties.

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

**Complexity.** With **both** heuristics, any $m$ operations on $n$ elements cost $O(m \cdot \alpha(n))$ amortized — near-constant each. Either heuristic alone degrades (compression alone still grows tall skinny trees; rank alone never flattens paths).

::: callout-formula KTU Formula Vault: Union-Find in 5 Lines
MAKE-SET $O(1)$ · FIND climbs to root · UNION attaches **smaller rank under larger** · compression **rewires the whole climb path** to the root · amortized cost $O(\alpha(n))$ ≈ constant **only with both heuristics together**.
:::

::: callout-pitfall Rank Is Not Size (and Compression Is Not Free Alone)
Rank bounds height; it is *not* the node count (that is union-by-*size*, a different variant). And path compression without union by rank still degrades. The $\alpha(n)$ miracle needs **both**. Any "one heuristic suffices" option is wrong.
:::

---

<a id="worked-example"></a>
## 3. Worked example — three unions plus a compressing find

::: step [Step 1: Setup] Formulating the Problem
Singletons $\{a\},\{b\},\{c\},\{d\}$. Execute UNION(a,b), UNION(c,d), UNION(a,c) by rank, then FIND(d) with compression. Draw the forest after each step; count FIND(d)'s hops twice.
:::

::: step [Step 2: Execution] Tracing Pointers
UNION(a,b): tie (0,0) → $b$ under $a$, rank($a$) = 1. UNION(c,d): $d$ under $c$, rank($c$) = 1. UNION(a,c): tie (1,1) → $c$ under $a$, rank($a$) = 2. Forest: $a$ with children $b, c$; $c$ with child $d$. FIND(d): climb $d \to c \to a$ (**2 hops**), rewiring $d$ directly under $a$. Second FIND(d): $d \to a$ (**1 hop**).
:::

::: step [Step 3: Conclusion] Final Result
First query paid 2 hops and flattened the path; every later query costs 1. Across Kruskal's thousands of UNION/FINDs, this self-flattening drags the total to near-linear — the structure gets faster the more you use it.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- Rank increments only on ties of equal rank — attaching smaller-under-larger changes no rank.
- Compression rewires *pointers*, never ranks — ranks stay valid height bounds after any FIND.
- FIND's path includes both endpoints: count hops as parent-pointer follows ($d \to c \to a$ = 2).

| Similar pair | Distinction that earns marks |
|---|---|
| Rank vs size | Height bound (by-rank) vs node count (by-size variant) |
| Compression vs union by rank | Flattens climbed paths vs keeps trees shallow — need both |
| FIND with vs without compression | Future queries 1 hop vs repeated full climbs |

**Exam recap (facts an examiner rewards):** smaller-rank-under-larger with tie-increment; compression rewires the whole climb; $O(m\,\alpha(n))$ needs both; Kruskal's set operations total $O(E\,\alpha(V))$ so sorting dominates.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

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
