# PEX: Symbolic Execution & Parameterized Tests

**Running code on symbols — path constraints, solver verdicts, and unit tests that generate themselves.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Algebra Ghost Inputs
**Symbolic execution** drives code with *symbols* ($x$!) collecting **path constraints** (branch conditions as formulas!) per path; **solvers** (SMT: Z3-flavoured!) answer satisfiable? (yes → concrete witness input!; no → dead path pruned!). **Parameterized unit tests** turn pre/postconditions into *oracles-for-free* (assert over symbols → concrete cases auto-derived!). **Symbex trees** map explored/forked/pruned paths (coverage with *proofs* of thoroughness!). State explosion (loops/recursion branch forests!) managed by bounds/heuristics/composition.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Symbex mechanics + PUT shape + explosion management

* Symbolic state (store: var→expr!), fork on branches (constraint ±!), solver checks (SAT→witness test!; UNSAT→prune!), path merging/selective (cost control!).
* PUTs: `[PexMethod]`-style + assumptions (`Assume`) + assertions (universal claims over inputs!); generated suite = witnessed paths.
* Explosion: loop bounds, depth caps, summaries/compositional (function contracts!), search heuristics (coverage-guided!), concolic hybrid (concrete+symbolic: DART/CUTE lineage — concreteness guides, symbols generalise!).

::: callout-formula KTU Formula Vault: Symbex
Symbols in → **constraints per path** → solver **witness-or-prune** → PUTs **assert-universal**.
:::

::: callout-pitfall Solver-Timeout Limbo (Unknown ≠ Safe/Unsafe!)
Unknown verdicts (hard constraints!) need triage (concretise? bound? abstract? — unknown-budgeted, never silently dropped-or-assumed!). Unknown-handling policy (explicit per analysis!) separates rigorous tools from optimistic toys.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"`int f(int x){ if(x>0){ if(x<10) return 1; else return 2; } return 0; }` (a) Symbex tree + constraints? (b) Witness suite? (c) PUT assertion shape?"
:::

::: step [Step 2: Execution] Fork, Solve, Assert
1. (a) Root $x$: branch $x>0$? No-branch: $\{x\le0\}$ → return $0$. Yes: $x<10$? → $\{x>0,x<10\}$ return $1$; else $\{x>0,x\ge10\}$ return $2$. Three leaves, all SAT.
2. (b) Witnesses: $x=0$ (leaf 1!), $x=5$ (leaf 2!), $x=15$ (leaf 3!) — solver-picked representatives!
3. (c) PUT: `Assume(true)` + `Assert(result==((x<=0)?0:((x<10)?1:2)))` (spec-oracle universal!) → PEX derives the trio automatically.
:::

::: step [Step 3: Conclusion] Final Result
Constraint-per-leaf, witness-per-leaf, universal-assert overall. Leaf-constraint tables are the symbex deliverable — paths proved *and* populated.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Concolic (concrete+symbolic) hybrids beat pure symbex on:
(A) Nothing, purity wins
(*B) Hard constraints (concrete values simplify/solve-around solver-hard bits — hashes, syscalls!; symbols generalise the rest — pragmatism over purity, DART/CUTE-tested!)
(C) Speed only in theory
(D) Smaller codebases only
::: explanation
Solver-hardness sidestep (concretise the painful, symbolise the tractable!) — hybrid vigour for real code (environment/system calls!). Purity-vs-progress tradeoff named (soundness caveats stated!).
:::

::: quiz Q2: Foundational Concept
PUT oracles (universal assertions) vs example asserts differ by:
(A) Syntax flavour
(*B) Quantification (for-all-inputs claims checked per generated case — spec-level strength!; examples pin instances!) — universal-plus-witnesses (PEX proves-by-cases!) approaches verification-lite
(C) Runtime cost only
(D) Nothing testable
::: explanation
Universal-claim testing (assert over symbols → solver enumerates witnesses!) nears proof (bounded-verification flavour!). Oracle-strength ladder (examples < properties < universals!) positions PUTs near the top.
:::

::: quiz Q3: Foundational Concept
Path explosion management ranks by honesty:
(A) Ignore loops (unsound silence!)
(*B) Bound transparently (loop caps *stated* — bounded-verification honesty!) → heuristics (coverage-guided priority!) → summaries/compositional (contracts!) → concolic pragmatism — documented limits, never silent incompleteness
(C) More servers brute-force it
(D) Smaller programs only
::: explanation
Bounded-claim honesty (verified-to-depth-k *stated*!) beats silent incompleteness (missed deep bugs unacknowledged!). Limit-documentation (bounds in reports!) is the verification-hygiene rule.
:::
