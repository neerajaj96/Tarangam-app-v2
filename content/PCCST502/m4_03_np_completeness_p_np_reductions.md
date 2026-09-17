# NP-Completeness: P, NP & Reductions

**Decision problems, certificates vs. solutions, polynomial reductions, Cook's theorem, the 3-SAT→Clique proof pattern, and coping when completeness bites.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Jigsaws and Solution Checkers
Some puzzles are *easy to solve* (2-piece jigsaw); some are *hard to solve but easy to verify* (a stranger hands you a finished 1000-piece sky — checking takes seconds, finding it took them hours). **P** = solvable fast. **NP** = *verifiable* fast (a claimed answer checkable in polynomial time). **NP-complete** = the hardest NP puzzles, all secretly the *same* puzzle in disguise: crack one fast and every NP problem collapses to fast (P = NP, million-dollar Clay prize, modern cryptography in ruins). A **reduction** is the disguise-remover: translate puzzle A into puzzle B so B's solver solves A.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Classes

* **P:** decision problems solvable in polynomial time ($O(n^k)$ for some fixed $k$) — sorting, shortest paths, MST, 2-SAT.
* **NP:** problems with polynomial-time **verifiers** — given instance + *certificate* (proposed solution), correctness is checkable fast. Equivalently, solvable in polynomial time by a *nondeterministic* machine (guess-then-verify). P ⊆ NP; equality unknown.
* **NP-complete:** $L \in$ NP **and** every NP problem reduces to $L$ in polynomial time. First known: **SAT** (**Cook–Levin theorem**, 1971) — circuit satisfiability encodes arbitrary NP computation. From SAT flow 3-SAT, Clique, Vertex Cover, Hamiltonian Cycle, Subset Sum, Bin Packing (decision form), TSP (decision form)...

### 2.2 Reductions: The Only Proof Move

$A \le_p B$ (A reduces to B): a polynomial-time map $f$ with $x \in A \iff f(x) \in B$. Two uses, opposite directions — **the #1 confusion**:

* To prove $B$ is **hard**: reduce a *known-hard* $A$ **to** $B$ ($A \le_p B$ — hardness flows forward into $B$).
* To prove $A$ is **easy** given $B$'s solver: same arrow ($A \le_p B$) — easiness flows backward.

Direction mnemonic: **hardness flows WITH the arrow** (known-hard → target); algorithms flow against it.

### 2.3 Proof Pattern: 3-SAT → Clique

Given 3-CNF formula with $k$ clauses: create one vertex per literal occurrence; connect vertices from *different* clauses unless they are **contradictory** ($x$ vs $\lnot x$). Claim: $G$ has a $k$-clique **iff** the formula is satisfiable. (⇒) A $k$-clique picks one literal per clause, pairwise non-contradictory → set them true → all clauses satisfied. (⇐) A satisfying assignment offers one true literal per clause; those $k$ vertices pairwise agree → clique. Construction is polynomial ($3k$ vertices) — hardness transfers, Clique is NP-complete.

::: callout-formula KTU Formula Vault: Complexity Facts
P = **poly-time solvable** · NP = **poly-time verifiable** · NPC = **in NP + all NP reduces to it** · first NPC: **SAT (Cook–Levin)** · reduce **known-hard → target** to prove hardness · 3-SAT→Clique: **triangle per clause, edges skip contradictions, k-clique ⟺ satisfiable**.
:::

::: callout-pitfall Reducing the Wrong Way (Proves Nothing)
To show problem X is hard, reduce a known NPC problem **to X** — never X to the NPC problem (that shows X is *no harder than* NPC, i.e. possibly easy!). "I reduced X to 3-SAT, therefore X is NP-complete" is backwards and earns zero: it proves $X \in$ NP at best.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Formula $\phi = (x_1 \lor \lnot x_2 \lor x_3) \land (\lnot x_1 \lor x_2 \lor x_3)$ ($k=2$ clauses). Build the 3-SAT→Clique graph and decide satisfiability via the clique claim.
:::

::: step [Step 2: Execution] Constructing and Finding
Vertices: clause 1 $\{x_1, \lnot x_2, x_3\}$, clause 2 $\{\lnot x_1, x_2, x_3\}$ (6 vertices). Edges: all cross-clause pairs *except* contradictory ones — missing edges: $(x_1, \lnot x_1)$, $(\lnot x_2, x_2)$ (and $x_3$–$x_3$? same literal twice is *consistent*, so edge $(x_3, x_3\text{-copy})$ **exists**). Seek a 2-clique: any single cross edge qualifies — e.g. $(x_1, x_2)$: set $x_1 =$ true, $x_2 =$ true; clause 1 satisfied by $x_1$, clause 2 by $x_2$ ($x_3$ free). Satisfiable ✓.
:::

::: step [Step 3: Conclusion] Final Result
The 2-clique $\{x_1, x_2\}$ *is* the satisfying assignment in disguise — the reduction's promise made concrete. And note the degenerate tell: with $k=2$ any formula whose clauses share *any* non-contradictory pair is satisfiable; hardness needs bigger $k$, where cliques stop being trivially findable.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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

::: quiz If someone proves P = NP tomorrow, what happens to NP-complete problems and to RSA-style cryptography?
() Nothing changes anywhere in computer science
(*) Every NPC problem gains a polynomial algorithm (reductions convert it), and cryptography founded on factoring/discrete-log hardness assumptions collapses — while verifiers stay exactly as they are
() Only sorting gets faster; everything else is unaffected
() NP-complete problems become undecidable instead
::: explanation
$P = NP$ promotes *every* NP problem (all NPC ones included, via reductions) into polynomial solvability — hardness assumptions underpinning RSA dissolve overnight. Verification was always easy; it's *search* that gets revolutionized.
:::
