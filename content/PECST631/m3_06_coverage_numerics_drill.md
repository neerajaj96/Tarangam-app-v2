---
id: m3_06_coverage_numerics_drill
courseCode: PECST631
module: 3
sequence: 6
title: 'Coverage Numerics Drill: Compute Everything'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Floor cyclomatic numbers and basis sets exactly
  - Tally du-pairs with equivalent exclusions stated
  - Minimise tours against score math at pace
concepts:
  - cyclomatic complexity
  - coverage arithmetic
prerequisites:
  - m2_03_mutation_operators_score
  - m3_01_graph_coverage_prime_paths
  - m3_02_dataflow_subsumption
examRelevance: medium
tags:
  - white-box
  - numerics-drill
---
# Coverage Numerics Drill: Compute Everything

**Numbers under the theory — cyclomatic, basis sets, du tallies, and score math at pace.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Surveyor's Kit
Count nodes/edges ($V(G)$!), list basis paths, tally du-pairs, score mutants — surveyor arithmetic before touring judgments. Measure, then move.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Survey formulas

$V(G)=e-n+2p$ (basis floor!) · du enumeration per variable (loop-backs included!) · score $K/(M-E)$ · prime-list maximality-trimmed · tours sidetrip-minimised.

::: callout-formula KTU Formula Vault: Survey Kit
$V(G)$ floors · du lists · scores exclude equivalents · tours minimise.
:::

::: callout-exam KTU Exam Focus
Coverage numerics (CFG+$V(G)$+basis paths, du tallies, score math!) anchor M3's 9-markers alongside one prose half (subsumption/Liskov/security-method!). Numbers-plus-doctrine per answer.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Method CFG: $9$ nodes, $11$ edges, $1$ component. (a) $V(G)$? (b) Basis-set size meaning? (c) $12$ mutants, $2$ equivalent, $8$ killed: score + action? (d) du-pairs: $x$ defined twice, used thrice (straight-line!): count?"
:::

::: step [Step 2: Execution] Survey Answers
1. (a) $11-9+2=4$ (four independent paths floor!).
2. (b) $\ge4$ path-ambitions (fewer provably under-tours!).
3. (c) $8/(12-2)=80\%$ + survivor-triage (2 unkilled non-equiv ⇒ missing tests, prescribe!).
4. (d) Defs $d_1,d_2$ × uses $u_1,u_2,u_3$ with later-def shadowing: $(d_1$: pairs to uses *before* $d_2$ only!) — order-aware pairing (redefinition scoping!): enumerate reachable-per-def, not cartesian!
:::

::: step [Step 3: Conclusion] Final Result
Floor-then-ambition, score-then-triage, order-aware pairing. Survey-then-judge ordering (numbers first, verdicts second!) throughout.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$V(G)=5$ but suite tours $3$ paths. Verdict?
(A) Adequate (majority!)
(*B) Provably under-ambitious (basis floor $5$ unmet — independent behaviours unexercised *by construction*!; add $\ge2$ tours or justify infeasibility with proof!)
(C) Over-tested
(D) Unmeasurable gap
::: explanation
Floor semantics (fewer-than-basis = guaranteed gaps!) — count-vs-floor comparison verdicts adequacy mechanically. Justify-or-extend (infeasibility proofs or new tours!) closes the finding.
:::

::: quiz Q2: Mixed Drill
Score $100\%$ with $6/10$ equivalent. Reading?
(A) Perfect suite, celebrate
(*B) $4$ killable, all killed (strong on tested ground!) — but $60\%$ equivalent signals *operator choice* issues (weak mutations picked!) or genuinely trivial code (re-audit operator set for teeth!)
(C) Meaningless metric
(D) Ship without review
::: explanation
Denominator-composition audit (equivalent-share tells operator quality!) — high-equivalent suites measure little (easy mutants!). Operator-set review (stronger mutations!) follows suspicious compositions.
:::

::: quiz Q3: Mixed Drill
Prime-path list includes a sub-path of another listed path. Verdict on list?
(A) Fine, extra coverage
(*B) Untrimmed (maximality violated — drop the subsumed!; prime = *maximal* simple, list hygiene matters for minimal tours!)
(C) Stronger for it
(D) Irrelevant detail
::: explanation
Maximality-trimming (drop subsumed!) keeps prime sets minimal-meaningful (extra entries waste tours!). List hygiene (trim check per entry!) is the enumeration discipline.
:::
