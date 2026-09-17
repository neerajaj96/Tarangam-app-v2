# Regional Optimization: Superlocal VN & Loop Unrolling

**Beyond one block — extended-block numbering and lap-joining for loops, with profitability brakes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Neighbourhood Watch + Lapping Runners
**Superlocal VN** extends the stamp book across straight-line block *chains* (extended basic blocks — one entry, many exits): values flow down all paths from the entry, kills scoped per path. **Loop unrolling** glues $k$ laps into one giant lap: fewer branch/condition overheads, longer straight runs (more LVN/scheduling room) — paid in code bloat and instruction-cache pressure. Unroll hot small loops; leave cold/large ones lapping.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Superlocal VN mechanics

EBB = entry block + its dominated straight-line successors; run LVN down each path with scoped tables (fork state at branches, kills only along taken paths); merge conservatively at joins (intersection of facts — safe on all arrivals).

### 2.2 Unrolling economics

$k\times$ body, $1/k$ branches; enables cross-iteration CSE/scheduling; costs $k\times$ size (+I-cache), register pressure rises; profitability: small hot bodies, known trip counts (remainder loop for ragged edges); early exits preserved via guards (no speculative lap-gluing past may-exits).

::: callout-formula KTU Formula Vault: Regional
Superlocal = **LVN down EBB paths, intersect at joins** · unroll = **fewer branches, more room, more bloat**.
:::

::: callout-pitfall Unrolling Past Exits Changes Semantics
Early-exit/break conditions bound unrolling legality — unrolled copies must preserve exit checks (or prove trip counts). Lap-gluing past a may-exit is speculation requiring guards/proofs — safety permit first.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
EBB: B1: $t=a+b$; branches to B2 ($u=a+b$; …) or B3 (…, $a=0$, $v=a+b$). Superlocal verdicts per block? Then unroll `for(i=0;i<100;i++) s+=a[i]*k` $2\times$ with the cross-iteration win named.
:::

::: step [Step 2: Execution] Scoped Stamps, Glued Laps
1. B1 stamps $a+b$→#1. B2 path: $u$ hits #1 → copy (no recompute) ✓. B3 path: $a=0$ kills → $v$ misses → compute. Joins: only B2-path facts survive selectively (intersection discipline).
2. $2\times$: halves branches/compares; $k$ loop-invariant per lap-pair (hoistable — regional+loop synergy); $a[i],a[i+1]$ adjacent (vectoriser food). Remainder: none ($100$ even) — state the ragged check!
:::

::: step [Step 3: Conclusion] Final Result
Path-scoped hits/kills plus join-intersection; unroll factor with remainder handling and named downstream wins. Ragged-edge accounting is the completeness mark.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Superlocal vs local VN — the extra power and its price?
(A) Same power, more code
(*B) Sees across block boundaries down EBB paths (cross-block redundancy dies); price: path-scoped tables + conservative join-merges (facts must hold on *all* arrivals)
(C) Handles loops fully
(D) No difference
::: explanation
Single-entry straight chains extend stamp lifetimes past branches; joins intersect (sound on every arrival). EBB restriction keeps it tractable — full-CFG generality is global's job (next topic).
:::

::: quiz Q2: Foundational Concept
Unrolling $8\times$ a $200$-instruction loop body is usually rejected because:
(A) Compilers dislike 8
(*B) $1600$-instruction bloat thrashes I-cache and explodes pressure — profitability veto: size/schedule costs swamp branch savings; small hot bodies only
(C) Semantics forbid it
(D) Registers vanish
::: explanation
Budget (profitability) gates factor choice: savings (branches) vs costs (size, I-cache, pressure). Big bodies already fill schedulers — unrolling adds bloat without room gains. Factor justification cites both sides.
:::

::: quiz Q3: Foundational Concept
`for(i=0;i<n;i++)` unrolled $4\times$ with unknown $n$ needs:
(A) Nothing extra
(*B) Remainder loop (or guarded epilogue) for the $n\bmod4$ leftover laps — ragged edges execute separately; skipping them drops iterations (wrong code)
(C) Bigger registers
(D) New variables only
::: explanation
Unrolling assumes divisibility; reality rarely complies. Remainder handling (cleanup loop/prologue) preserves exact trip counts — edge completeness is a correctness (permit-level) requirement, not tidiness.
:::
