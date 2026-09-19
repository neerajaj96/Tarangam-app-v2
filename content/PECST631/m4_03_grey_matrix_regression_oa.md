# Grey-Box Testing: Matrix, Regression & Orthogonal Arrays

**Informed functional testing — risk matrices, change-guards, and combinatorial thrift.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: General's Map Room
**Matrix testing** maps features × platforms/roles (coverage grid — gaps *visible* as empty cells!; risk-weighted fill order!). **Regression** guards yesterday's wins (change-impact selection: affected + neighbours, not everything always!; baselines versioned!). **Orthogonal arrays** compress combinatorial storms (pairwise/all-pairs coverage in $n^2$-ish rows not $2^n$ — Taguchi-borrowed thrift, most bugs are $1$–$2$-factor interactions empirically!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Matrix discipline + regression economics + OA mechanics

* Matrix: axes (features × envs/roles!), risk-weighted fill (critical cells first!), gap reviews (empty = untested-by-decision, signed!).
* Regression: selection (impact analysis!), prioritisation (fail-fast ordering!), baselines (golden outputs versioned!), CI gates (red blocks!).
* Orthogonal/pairwise: strength-$2$ arrays (every pair appears ≥once!); tools (PICT-style generators!); higher strengths for critical combos (triple-wise where warranted!).

::: callout-formula KTU Formula Vault: Grey Arsenal
Matrix **maps gaps** · regression **guards change** · pairwise **compresses combos**.
:::

::: callout-pitfall Pairwise-Blind Higher-Order Bugs (Rare but Real!)
Pairwise misses $3$+-factor interactions (crypto-protocol corners, config pileups!) — strength matched to criticality (pairwise default, triples for crown logic!). Strength-selection rationale (defect-history informed!) per suite.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Login matrix ($3$ browsers × $2$ roles × $2$ MFA modes = $12$ cells): (a) risk-fill order? (b) Pairwise-compress OS×browser×role ($3\times3\times2$)? (c) Regression subset after auth-service change?"
:::

::: step [Step 2: Execution] Fill, Compress, Guard
1. (a) Admin+MFA+Chrome (crown path!) → role/browser spread → exotic cells last (risk-ranked fill, gaps signed!).
2. (b) Full $18$ → pairwise $9$ rows exactly (lower bound: $9$ OS-browser pairs, one per row; role $=(i+j)\bmod2$ covers every OS-role and browser-role pair too).
3. (c) Auth suites + neighbours (session/profile!) + smoke-all (broad sanity!) — impact-radius selection (change blast map!).
:::

::: step [Step 3: Conclusion] Final Result
Risk-ordered fill, pairwise-compressed combos, blast-mapped regression. Combinatorial honesty (strength stated!) plus gap signatures (empty cells decided!) complete grey-box rigour.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Empty matrix cells must be *signed* (decision-recorded) because:
(A) Bureaucracy loves paper
(*B) Untested-by-choice differs from untested-by-accident (risk accepted explicitly — owner + rationale + revisit trigger!; silent gaps rot into surprises!)
(C) Matrices need filling fully always (wasteful absolutism — risk-ranked *partial* fill is legitimate *when decided*!)
(D) Auditors count cells
::: explanation
Decision-vs-drift distinction (chosen gaps carry owners/dates!) — signed emptiness is risk management, blank emptiness is neglect. Sign-off discipline (who accepted which gap when?) is the governance half of testing.
:::

::: quiz Q2: Foundational Concept
Pairwise's empirical license (most bugs ≤$2$-factor) implies for critical auth logic:
(A) Pairwise suffices universally
(*B) Escalate strength (triple-wise+ for crown paths — license is statistical, safety-critical tails need stronger nets!; defect-history tunes strength per area!)
(C) Abandon combinatorics
(D) Exhaustive always ($2^n$ forever!)
::: explanation
Statistical-license limits (tails matter where stakes peak!) — strength graded by criticality (pairwise baseline, triples+ for crown!). Risk-graded strength (history-informed!) beats uniform doctrine.
:::

::: quiz Q3: Foundational Concept
Regression baselines (golden outputs) rot when:
(A) Never, gold is eternal
(*B) Intended behaviour evolves (features change goldens legitimately! — baseline-update ceremony with diff-review distinguishes intended vs regressed deltas, not blind accept!)
(C) Tests run often
(D) Disks fill
::: explanation
Golden-evolution discipline (reviewed re-baselining!) — blind updates canonise bugs (drift accepted as gold!), stale baselines false-alarm everything. Diff-review ceremony (human judges each delta!) keeps golds honest.
:::
