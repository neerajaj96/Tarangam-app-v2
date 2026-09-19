---
id: m4_06_hashing_functions_collisions
courseCode: PCCST303
module: 4
sequence: 6
title: 'Hashing: Functions & Collision Resolution'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Hash with the four syllabus functions and the load-factor gauge
  - Resolve collisions with probing, doubling and chaining
  - Rehash past the occupancy threshold for exam answers
concepts:
  - hash functions
  - collision resolution
  - load factor
prerequisites:
  - m4_05_linear_binary_search
examRelevance: high
tags:
  - searching
  - hashing
---
# Hashing: Functions & Collision Resolution

**$O(1)$ average lookup — the four KTU hash functions and the probing/double/chaining fixes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Coat Check
Hash function = attendant assigning numbered pegs from ticket stubs (keys → slots). Collisions = two coats, one peg. **Chaining** hangs multiple coats per peg (open hashing — lists off-table). **Open addressing** re-hangs into backup pegs by fixed rules (closed hashing — all coats on pegs): linear (+1,+2,…), quadratic ($+1,+4,+9$), or double-hash steps. Load factor $\alpha = n/m$ measures crowding — past $\sim 0.7$, rehash bigger.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The four functions (syllabus list)

* **Division:** $h = k \bmod m$ (prime $m$, not near powers of $2$).
* **Mid-square:** square $k$, extract middle digits (uses all key digits).
* **Folding:** split key into parts, add (shift vs boundary variants), mod $m$.
* **Digit analysis:** inspect key distribution, pick stable discriminating positions.

### 2.2 Resolution and costs

* **Chaining:** lists at slots; search $O(1+\alpha)$; deletions easy; extra pointers.
* **Linear probing:** $+i$ steps; clusters badly (primary clustering); delete needs tombstones.
* **Quadratic probing:** $+i^2$; eases primary clustering; needs half-full-ish tables + prime $m$ for guarantees; secondary clustering remains.
* **Double hashing:** step $= h_2(k)$ (non-zero, coprime to $m$); best distribution, near-uniform probing.
* **Open hashing** = chaining (buckets outside); **closed** = probing within.

::: callout-formula KTU Formula Vault: Hash
$\alpha = n/m$ · division **$k\bmod m$** · linear **$+i$** · quad **$+i^2$** · double **$+i\cdot h_2$** · rehash past **$\approx0.7$**.
:::

::: callout-pitfall Deleting in Linear Probing
Blanking a slot snaps probe chains — later searches stop early and miss keys beyond the gap. Tombstones (deleted-markers) preserve chains; state the marker, don't just erase.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$m = 7$, division hashing. Insert $50, 700, 76$ by (a) chaining, (b) linear probing. Show table states.
:::

::: step [Step 2: Execution] Two Placements
1. Slots: $50\bmod7 = 1$; $700\bmod7 = 0$; $76\bmod7 = 6$. No collisions at all — chains hold singletons, probing places directly. (Clean data shows the mechanism's happy path first.)
2. Now insert $14$ ($0$): chaining appends to slot $0$'s list; linear probing tries $0$ (busy, $700$), steps to $1$ (busy, $50$), lands $2$. Probe chains $[0\to1\to2]$ narrate clustering's birth.
:::

::: step [Step 3: Conclusion] Final Result
Hash traces show slot states *per insert* with collision notes. Chaining appends; probing walks — the walk sequence is the graded content.
:::

::: anim probe-walk 14 Walks 0 to 1 to 2
Watch 14 hash to occupied 0, step past occupied 1, and land in 2 — the walk arrows are the probe chain that narrates clustering's birth.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$m = 11$, keys $22, 33$. Division slots? Collide?
(A) $2$ and $3$ — no collision
(*B) $22\bmod11 = 0$, $33\bmod11 = 0$ — collide at $0$ (multiples of $m$ always pile up)
(C) $0$ and $1$ — no collision
(D) $11$ and $0$ — invalid slot
::: explanation
Both multiples of $11$ land slot $0$ — division hashing clusters key patterns sharing $m$'s factors, which is why $m$ should be prime *distant* from key structure. ($11$ is not a valid slot for $m = 11$ — indices run $0$–$10$.)
:::

::: quiz Q2: Foundational Concept
Linear vs quadratic probing — what clustering does each suffer?
(A) Neither clusters
(*B) Linear: primary clustering (runs merge into mega-runs); quadratic: only secondary (same-$h$ keys share probe paths)
(C) Quadratic is worse always
(D) Clustering is good
::: explanation
$+i$ steps extend occupied runs (rich-get-richer); $+i^2$ jumps over runs but identical home slots still march together. Double hashing decorrelates even that — the escalation ladder linear → quadratic → double.
:::

::: quiz Q3: Foundational Concept
Table $m = 100$, $n = 90$ with linear probing. Problem and fix?
(A) Fine as is
(*B) $\alpha = 0.9$: probe runs explode (expected probes $\approx 1/(1-\alpha)$ scale) — rehash to $\approx 2\times$ size
(C) Switch to BST
(D) Delete random keys
::: explanation
Near-full open addressing degenerates toward linear search per op; doubling ($m \approx 200$, $\alpha \approx 0.45$) restores short probes. Load-factor policing *is* hash-table maintenance — quote $\alpha$ first.
:::
