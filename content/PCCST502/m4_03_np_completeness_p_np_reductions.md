---
id: m4_03_np_completeness_p_np_reductions
courseCode: PCCST502
module: 4
sequence: 3
title: 'NP-Completeness: P, NP & Reductions'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Separate poly-time solvable from poly-time verifiable classes
  - Prove hardness with known-hard-to-target polynomial reductions
  - Replay the 3-SAT to Clique proof pattern with Cook's theorem
concepts:
  - complexity classes
  - polynomial reductions
  - NP-completeness
prerequisites: []
examRelevance: high
tags:
  - complexity-theory
  - np-completeness
---
# NP-Completeness: P, NP & Reductions

**Decision problems, certificates vs. solutions, polynomial reductions, Cook's theorem, the 3-SAT→Clique proof pattern, vertex cover via Clique, and coping when completeness bites.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Some puzzles are easy to *solve* (2-piece jigsaw); others are hard to solve yet easy to *check* (a stranger hands you a finished 1000-piece sky — verifying takes seconds, finding it took hours). Complexity theory sorts decision problems (yes/no questions) by this solve-vs-check gap: **P** = solvable fast; **NP** = *verifiable* fast given a claimed answer; **NP-complete** = the hardest NP problems, all secretly the *same* puzzle in disguise — a fast solver for one converts, via translations called **reductions**, into fast solvers for all.

::: callout-intuition Core Mental Model: Jigsaws and Solution Checkers
**P** = puzzles you solve fast. **NP** = puzzles whose claimed solutions you *check* fast (a certificate — proposed answer — verifiable in polynomial time). **NP-complete** = NP puzzles every other NP puzzle translates into: crack one fast and every NP problem collapses to fast (the P = NP question — a million-dollar Clay prize — with carefully qualified, not apocalyptic, consequences spelled out below). A **reduction** is the disguise-remover: translate A into B so B's solver solves A. Drop the jigsaws now: verifiers, classes, and the $A \le_p B$ arrow below are the exact machinery.
:::

**Tiny toy example (check vs solve).** Sudoku: *solving* a hard 9×9 from scratch can take ages; *checking* a filled grid takes seconds (scan rows, columns, boxes). "Checkable fast, solvable unknown-fast" is the NP signature in miniature.

::: toggle What are `decision problem`, `certificate`, `verifier`, `P`, `NP`?
`Decision problem` = a yes/no question (is this satisfiable? — not "find the assignment"). `Certificate` = a claimed yes-answer (the filled grid — proposed, not derived). `Verifier` = a fast checker of instance + certificate (scan rows/columns/boxes in polytime). `P` = decidable fast (solver runs in $O(n^k)$). `NP` = verifiable fast given a certificate (equivalently: solvable fast by a guessing machine). NP does NOT mean "not polynomial" — it means nondeterministic-polynomial (guess, then verify fast).
:::

::: toggle What does `A ≤p B` say, and why does direction matter?
$A \le_p B$ = a polytime map $f$ with $x \in A \iff f(x) \in B$ (translate A's instances into B's, preserving yes/no). Hardness flows WITH the arrow: reducing known-hard $A$ to $B$ proves $B$ hard (B inherits A's difficulty — a fast B-solver would solve A). Algorithms flow AGAINST it (B's solver solves A through the map). Backwards reductions prove nothing about hardness: reducing $X$ to 3-SAT shows $X \in$ NP at best (no harder than NPC), never completeness.
:::

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Symbols and abbreviations:** SAT = satisfiability (is a Boolean formula satisfiable?); 3-SAT = SAT with 3 literals per clause; $A \le_p B$ = A polynomial-time reduces to B (a polytime map $f$ with $x \in A \iff f(x) \in B$); NPC = NP-complete; $\lnot x$ = negation of variable $x$.

**The classes — numbered:**

1. **P:** decision problems solvable in polynomial time ($O(n^k)$, fixed $k$) — sorting, shortest paths, MST (minimum spanning tree), 2-SAT.
2. **NP:** problems with polynomial-time **verifiers** — instance + *certificate* checked fast. Equivalently, solvable in polytime by a *nondeterministic* machine (guess-then-verify). P ⊆ NP; equality unknown.
3. **NP-complete:** $L \in$ NP **and** every NP problem reduces to $L$ in polytime. First known: **SAT** (**Cook–Levin theorem**, 1971) — circuit satisfiability encodes arbitrary NP computation. From SAT flow 3-SAT, Clique, Vertex Cover, Hamiltonian Cycle, Subset Sum, Bin Packing (decision form), TSP (decision form).

**Reductions: the only proof move.** Two uses, opposite directions — **the #1 confusion**:

* To prove $B$ is **hard**: reduce a *known-hard* $A$ **to** $B$ ($A \le_p B$ — hardness flows forward into $B$).
* To prove $A$ is **easy** given $B$'s solver: same arrow ($A \le_p B$) — easiness flows backward (algorithms flow against the arrow).

Direction mnemonic: **hardness flows WITH the arrow** (known-hard → target); algorithms flow against it.

**Proof pattern: 3-SAT → Clique.** Given 3-CNF (conjunctive normal form: AND of OR-clauses) formula with $k$ clauses: one vertex per literal occurrence; connect vertices from *different* clauses unless **contradictory** ($x$ vs $\lnot x$). Claim: $G$ has a $k$-clique (a set of $k$ pairwise-adjacent vertices) **iff** the formula is satisfiable. (⇒) A $k$-clique picks one literal per clause, pairwise consistent → set them true → all clauses satisfied. (⇐) A satisfying assignment offers one true literal per clause; those $k$ vertices pairwise agree → clique. Polynomial construction ($3k$ vertices) — hardness transfers; Clique is NP-complete.

**Vertex cover — definition plus reduction sketch from Clique.** A **vertex cover** of a graph $G = (V, E)$ is a set $C \subseteq V$ touching every edge (each edge has at least one endpoint in $C$); the decision problem asks whether a cover of size at most $t$ exists. It is NP-complete by reduction *from* Clique: given a Clique instance $(G, k)$, build the **complement graph** $\bar{G}$ (same vertices; edge in $\bar{G}$ iff *not* an edge in $G$, ignoring self-loops) and ask for a vertex cover of size $n - k$ where $n = |V|$. Sketch: $S$ is a $k$-clique in $G$ iff its $n - k$ leftover vertices $V \setminus S$ touch every edge of $\bar{G}$ (any uncovered $\bar{G}$-edge would join two vertices of $S$, contradicting the clique) — so $G$ has a $k$-clique ⟺ $\bar{G}$ has an $(n-k)$-cover. The construction is polynomial, and Vertex Cover ∈ NP (verify a claimed cover by scanning all edges) — both NPC obligations met.

::: callout-formula KTU Formula Vault: Complexity Facts
P = **poly-time solvable** · NP = **poly-time verifiable** · NPC = **in NP + all NP reduces to it** · first NPC: **SAT (Cook–Levin)** · reduce **known-hard → target** to prove hardness · 3-SAT→Clique: **triangle per clause, edges skip contradictions, k-clique ⟺ satisfiable** · Clique→Vertex-Cover: **complement graph, $k$-clique ⟺ $(n-k)$-cover**.
:::

::: callout-pitfall Reducing the Wrong Way (Proves Nothing)
To show problem X is hard, reduce a known NPC problem **to X** — never X to the NPC problem (that shows X is *no harder than* NPC, i.e. possibly easy!). "I reduced X to 3-SAT, therefore X is NP-complete" is backwards and earns zero: it proves $X \in$ NP at best.
:::

**Qualified note on P = NP consequences (read carefully).** A proof that P = NP would show polynomial-time algorithms *exist in principle* for every NP problem (NPC ones included, via reductions) — a landmark for theory and for the Clay prize. It would **not** automatically hand us *practical* algorithms (exponents and constants could be astronomically large), and its effect on cryptography is qualified: RSA-style systems rest on factoring / discrete-log hardness, problems that lie in NP but are **not known to be NP-complete** — so P = NP would imply they fall to polytime *in principle*, but whether the resulting attacks run feasibly is unknown, and symmetric-key cryptography and hashing might survive with larger parameters. Correct exam phrasing: cryptography would need urgent re-evaluation — never "in ruins overnight".

---

<a id="worked-example"></a>
## 3. Worked example — 3-SAT→Clique on two clauses

::: step [Step 1: Setup] Formulating the Problem
Formula $\phi = (x_1 \lor \lnot x_2 \lor x_3) \land (\lnot x_1 \lor x_2 \lor x_3)$ ($k=2$ clauses). Build the graph; decide satisfiability via the clique claim.
:::

::: step [Step 2: Execution] Constructing and Finding
Vertices: clause 1 $\{x_1, \lnot x_2, x_3\}$, clause 2 $\{\lnot x_1, x_2, x_3\}$ (6 vertices). Edges: all cross-clause pairs *except* contradictions — missing: $(x_1, \lnot x_1)$, $(\lnot x_2, x_2)$; same-literal pair $(x_3, x_3\text{-copy})$ is *consistent*, so that edge **exists**. Seek a 2-clique: any cross edge qualifies — e.g. $(x_1, x_2)$: set $x_1 =$ true, $x_2 =$ true; clause 1 via $x_1$, clause 2 via $x_2$ ($x_3$ free). Satisfiable ✓.
:::

::: step [Step 3: Conclusion] Final Result
The 2-clique $\{x_1, x_2\}$ *is* the satisfying assignment in disguise. Degenerate tell: with $k=2$ any formula sharing *any* consistent cross pair is satisfiable; hardness needs bigger $k$, where cliques stop being trivially findable.
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- "NPC" needs *both* halves: membership ($X \in$ NP via a verifier) *and* hardness (NPC $\le_p X$). One half is half the marks.
- A single hard instance proves nothing — complexity quantifies over infinite families and worst-case asymptotics, never anecdotes or laptop timings.
- Factoring/Discrete-log ∈ NP but not *known* NPC: keep them out of "therefore NP-complete" chains.

| Similar pair | Distinction that earns marks |
|---|---|
| $A \le_p B$ for hardness vs easiness | Known-hard → target proves hard; target → known-easy proves at most |
| Clique vs vertex cover | Pairwise-adjacent $k$-set vs edge-touching $(n-k)$-set on the complement |
| P = NP theory vs practice | Polytime existence in principle vs feasible exponents/constants |

**Exam recap (facts an examiner rewards):** P/NP/NPC one-liners; Cook–Levin first-NPC; reduction direction with the arrow mnemonic; 3-SAT→Clique construction both directions; Clique→Vertex-Cover via complement ($k$ ⟺ $n-k$); qualified P=NP phrasing.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz To prove a new problem X is NP-complete, which reduction must you exhibit (and which extra membership fact)?
() Reduce X to 3-SAT (showing X is no harder than a known problem)
(*) Reduce a known NP-complete problem to X (hardness flows forward), and separately show X ∈ NP (poly-time verifier)
() Reduce X to a problem in P
() No reduction is needed — one hard instance suffices
::: explanation
Two obligations: (1) $X \in$ NP via a verifier; (2) some NPC $A \le_p X$, transferring universal hardness *into* $X$. Reversing (2) proves easiness, not hardness — the direction error that voids entire proofs.
:::

::: quiz In the 3-SAT→Clique construction, why are contradictory literals (x vs. ¬x) left unconnected across clauses?
() To make the graph prettier for diagrams
(*) An edge asserts co-selectability in one clique; contradictory literals can never be simultaneously true, so connecting them would let cliques encode impossible assignments and break the ⟺ claim
() Contradictory literals always belong to the same clause
() Unconnected vertices are required for the graph to stay planar
::: explanation
The clique ⟺ satisfying-assignment correspondence needs edges $\equiv$ mutual consistency. A contradictory edge would admit cliques naming $x$ true *and* false — "satisfying" assignments that satisfy nothing. The missing edges carry the proof's soundness.
:::

::: quiz If someone proves P = NP tomorrow, what follows for NP-complete problems and for RSA-style cryptography, stated carefully?
() Nothing changes anywhere in computer science
(*) Every NP problem (NPC ones included, via reductions) gains a polynomial-time algorithm in principle — but practical feasibility depends on unknown exponents/constants; RSA-style systems (factoring/discrete-log, in NP but not known NPC) would need urgent re-evaluation rather than automatically collapsing overnight, while verifiers stay exactly as they are
() Only sorting gets faster; everything else is unaffected
() NP-complete problems become undecidable instead
::: explanation
$P = NP$ promotes every NP problem into polynomial solvability *in principle* — that is the theoretical earthquake. But Big-O hides exponents and constants, so "polynomial" need not mean "runnable"; and since factoring/discrete-log are not known to be NP-complete, their fate is implied only indirectly (they sit in NP, so they fall in principle too — feasibility unknown). Cryptography faces re-evaluation, not certified instant doom. Verification was always easy; it is *search* that changes status.
:::

::: quiz Given a Clique instance (G, k) with n vertices, which Vertex Cover instance proves hardness via the complement construction, and why does the size shift to n − k?
() Ask for a k-cover in the same graph G — cliques and covers coincide directly
(*) Ask for an (n − k)-cover in the complement Ḡ: the k clique vertices' leftovers touch every Ḡ-edge (any uncovered Ḡ-edge would join two clique members, impossible), and the argument reverses — so k-clique ⟺ (n − k)-cover
() Ask for a k-cover in Ḡ — sizes never shift in reductions
() Vertex cover needs no reduction since it is obviously in P
::: explanation
The complement flips adjacency: non-edges of $G$ become the edges $\bar{G}$'s cover must touch. A $k$-clique leaves exactly $n - k$ vertices, and those leftovers hit every $\bar{G}$-edge (else two clique members would be non-adjacent in $G$). Both directions hold, the map is polynomial, and Vertex Cover's own verifier (scan all edges) supplies membership — the full NPC proof in miniature.
:::
