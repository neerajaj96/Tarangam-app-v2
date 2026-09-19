# M1 Mixed Drill: Every Variation

**Method selection in 10 seconds, supermesh/supernode, power audits, and magnetic-path triage — the whole module in one sitting.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Triage Desk
Count meshes vs nodes (smaller wins) → scan source types (current→nodal, voltage→mesh) → flag shared/floating sources (super-structures) → solve → audit with power balance ($\sum$ delivered = $\sum$ absorbed). Diagnosis first, algebra second — wrong method with perfect math still bleeds time.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Triage and audit kit

| Signal | Move |
|---|---|
| fewer nodes | nodal ($G$ matrix) |
| fewer meshes | mesh ($R$ matrix) |
| shared current source | supermesh + difference constraint |
| floating voltage source | supernode + difference constraint |
| dependent source | constraint expressing it in unknowns, substitute before solving |
| series magnetic path | reluctances add ($\mathcal{R}_{iron} + \mathcal{R}_{gap}$), flux $= NI/\sum\mathcal{R}$ |
| parallel magnetic limbs | MMF common, flux divides inverse to $\mathcal{R}$ (current-division grammar) |
| air gap in iron ring | gap reluctance dominates ($\times\mu_r$ leverage — check it first) |
| any solution | power audit: $\sum VI$ delivered $=$ absorbed |

::: callout-formula KTU Formula Vault: Triage
Small count wins · currents→**nodal**, voltages→**mesh** · shared/floating→**super** · always **power-audit**.
:::

::: callout-exam KTU Exam Focus
The 9-marker is one 2-mesh/2-node solve with a twist (shared source or dependent source) plus branch-current/power questions. Method-choice line first — it earns the diagnosis mark even under time pressure.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$10$ V source ($+$ top) feeds node A through $2\,\Omega$; node A ties to ground through $3\,\Omega$; a $2$ A source injects upward into A from ground. Find $V_A$ and audit power.
:::

::: step [Step 2: Execution] Nodal Solve, Then Audit
1. **KCL at A** (leaving positive): $(V_A-10)/2 + V_A/3 = 2$ → $\times6$: $3V_A-30+2V_A = 12$ → $V_A = 8.4$ V.
2. Branch currents: $2\,\Omega$: $(8.4-10)/2 = -0.8$ A (i.e. $0.8$ A flows back toward the source top); $3\,\Omega$: $2.8$ A down. Check: $-0.8+2.8 = 2.0$ ✓ equals injection.
3. **Power audit:** $2$ A source delivers $8.4\times2 = 16.8$ W; $10$ V source absorbs $10\times0.8 = 8$ W (being charged). Resistors absorb $0.8^2\times2 + 2.8^2\times3 = 1.28+23.52 = 24.8$ W $= 16.8+8$ ✓ balanced.
:::

::: step [Step 3: Conclusion] Final Result
Sign discipline (leaving-positive KCL) writes the equation; power balance certifies it. Two audit lines buy near-certainty against sign slips.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$3$ meshes, $2$ non-reference nodes, no special sources. Fastest?
(A) Mesh, $3\times3$
(*B) Nodal, $2\times2$ — fewer unknowns, smaller determinant, less arithmetic
(C) Star-delta first always
(D) Equal effort
::: explanation
$2\times2$ determinants are one line; $3\times3$ invite cofactor errors. Equation count is a reliable proxy for exam-minutes — count first.
:::

::: quiz Q2: Mixed Drill
Why audit with power balance?
(A) It finds the currents
(*B) It verifies consistency — KCL+KVL solutions must conserve energy; imbalance pinpoints sign/arithmetic slips without re-solving
(C) It replaces analysis
(D) Examiners ignore it
::: explanation
$\sum P = 0$ (signed) is independent of the solution path — a failed audit means a slip *somewhere*, and per-element powers localise it. Two audit lines buy near-certainty.
:::

::: quiz Q3: Mixed Drill
Dependent source $3V_x$ (where $V_x$ is a resistor drop) appears. Extra step?
(A) Ignore dependency
(*B) Express the dependency in chosen unknowns ($V_x$ as mesh/node difference) and substitute before solving — same matrix size, modified entries
(C) New super-structure always
(D) Unsolvable
::: explanation
Dependencies add relations, not unknowns: rewrite $3V_x$ via unknown differences, fold into the matrix. Count stays; entries change — the only twist.
:::
