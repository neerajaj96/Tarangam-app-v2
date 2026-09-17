# Mesh Current Analysis with Matrices

**Loop currents as unknowns — self vs mutual resistance, matrix assembly, and Cramer's-rule solutions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Roundabout Tolls
Assign each window (mesh) a circulating current. KVL round window $i$: own resistors × own current (self toll) minus shared resistors × neighbours' currents (mutual discounts) = voltage rises in that window. Stack all windows' toll equations → resistance matrix × mesh currents = source vector → solve. Shared walls couple the equations; that's the whole game.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Matrix assembly (2-mesh template)

$$\begin{bmatrix} R_{11} & -R_{12} \\ -R_{21} & R_{22} \end{bmatrix} \begin{bmatrix} I_1 \\ I_2 \end{bmatrix} = \begin{bmatrix} V_1 \\ V_2 \end{bmatrix}$$

$R_{ii}$ = sum in mesh $i$; $R_{ij}$ = shared (negative); $V_i$ = net rise clockwise. Solve by elimination/Cramer: $\Delta$, $\Delta_1$, $\Delta_2$. Branch current = algebraic difference of adjacent meshes.

### 2.2 Supermesh (shared current source)

Current source on a shared branch fixes $I_1 - I_2 = I_s$ — merge the meshes: KVL round the combined perimeter + constraint equation. (Syllabus asks matrix methods; supermesh is the named variation examiners add.)

```text
   Mesh 1 →  Mesh 2 →
   ┌───R1───┬───R2───┐
   │  (I1)  │  (I2)  │
   E1      R12(shared)
   │        │        │
   └────────┴────────┘
   R11=R1+R12, R22=R2+R12, mutual −R12
```

::: callout-formula KTU Formula Vault: Mesh
Diagonal **sums**, off-diagonal **−shared** · RHS = **rises clockwise** · branch = **mesh difference**.
:::

::: callout-pitfall Sign of the RHS
$V_i$ sums rises in the *assumed circulation direction* — a battery traversed $+$ to $-$ contributes negatively. Flipped RHS signs invert the whole solution; walk each source's direction deliberately.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Two meshes share $4\,\Omega$. Mesh 1: $12$ V rise, $2\,\Omega$ own + shared. Mesh 2: $3\,\Omega$ own + shared, no source. Find both mesh currents and the shared-branch current.
:::

::: step [Step 2: Execution] Assemble and Solve
1. $\begin{bmatrix}6&-4\\-4&7\end{bmatrix}[I_1,I_2]^T = [12,0]^T$. $\Delta = 42-16 = 26$.
2. $I_1 = 12\cdot7/26 = 84/26 \approx 3.23$ A; $I_2 = 12\cdot4/26 = 48/26 \approx 1.85$ A.
3. Shared branch: $I_1-I_2 \approx 1.38$ A (same direction assumed both) — audit via KVL: $12 - 2(3.23) - 4(1.38) \approx 12-6.46-5.54 = 0$ ✓.
:::

::: step [Step 3: Conclusion] Final Result
Assemble (sums/diagonals, −shared, rises), determinant, back-substitute, KVL-audit one loop. The audit line catches sign slips before submission.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$\begin{bmatrix}5&-2\\-2&4\end{bmatrix}[I_1,I_2]^T=[10,0]^T$. $I_1$?
(A) $1$ A
(*B) $\Delta = 20-4 = 16$; $I_1 = 10\cdot4/16 = 2.5$ A
(C) $2$ A
(D) $5$ A
::: explanation
Cramer: replace column 1 with RHS → $(10\cdot4-0)/16 = 2.5$. $I_2 = 10\cdot2/16 = 1.25$ A follows — determinant once, both currents.
:::

::: quiz Q2: Foundational Concept
A $5$ A independent source sits alone on the branch shared by meshes $1,2$. Equation?
(A) Ignore it
(*B) Supermesh: KVL round the merged perimeter plus constraint $I_1-I_2 = \pm5$ A (sign by assumed directions)
(C) Set both meshes to $5$ A
(D) Delete the branch
::: explanation
The source fixes the *difference*, killing one degree of freedom — one KVL (outer loop) + one constraint replaces two KVLs. Sign follows circulation arrows, stated, not guessed.
:::

::: quiz Q3: Foundational Concept
Mesh 1 current $3$ A clockwise, mesh 2 current $1$ A clockwise, shared branch between them. Branch current?
(A) $4$ A
(*B) $3-1 = 2$ A in mesh 1's direction — adjacent co-directional meshes subtract on shared branches
(C) $3$ A
(D) $1$ A
::: explanation
Shared branches carry the algebraic difference (opposing traversals). Same-direction assumptions subtract; if a mesh ran counter, they'd add — directions first, arithmetic second.
:::
