# Nodal Analysis with Matrices

**Node voltages as unknowns — self vs mutual conductance, supernodes, and current-source-friendly solutions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Water Levels
Ground is sea level ($0$ V); every other node's voltage is its water height. KCL at node $i$: own-conductance × own height minus mutual-conductance × neighbours' heights = injected current. Conductance ($G = 1/R$) replaces resistance because nodes trade in *currents leaving through branches*. Fewer nodes than meshes? Go nodal — equations equal non-reference nodes.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Matrix assembly

$$\begin{bmatrix} G_{11} & -G_{12} \\ -G_{21} & G_{22} \end{bmatrix} \begin{bmatrix} V_1 \\ V_2 \end{bmatrix} = \begin{bmatrix} I_1 \\ I_2 \end{bmatrix}$$

$G_{ii}$ = conductances tied to node $i$; $G_{ij}$ = branch conductance between; $I_i$ = net current *injected* into $i$. Supernode: voltage source between two non-reference nodes merges them (KCL over the envelope + $V_1-V_2 = V_s$ constraint).

### 2.2 Mesh-vs-nodal choice rule

Fewer meshes → mesh; fewer non-reference nodes → nodal; current sources favour nodal (they *are* the RHS); voltage sources favour mesh. Either solves any planar circuit — pick the smaller matrix.

::: callout-formula KTU Formula Vault: Nodal
Diagonal **$\sum G$**, off-diagonal **$-G_{ij}$** · RHS = **injected currents** · supernode for **floating voltage sources**.
:::

::: callout-pitfall Conductance, Not Resistance
Nodal diagonals sum $1/R$'s — plugging ohms directly scales answers by $R^2$. Convert every branch to siemens first; the matrix then assembles exactly like mesh with $G\leftrightarrow R$ swapped.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Node 1: $2$ A injected, tied via $1\,\Omega$ to ground and $2\,\Omega$ to node 2. Node 2: $1\,\Omega$ to ground, no injection. Find $V_1, V_2$ and the $2\,\Omega$ branch current.
:::

::: step [Step 2: Execution] Siemens In, Volts Out
1. $G$: $\begin{bmatrix}1+0.5&-0.5\\-0.5&0.5+1\end{bmatrix} = \begin{bmatrix}1.5&-0.5\\-0.5&1.5\end{bmatrix}$, RHS $[2,0]^T$. $\Delta = 2.25-0.25 = 2$.
2. $V_1 = 2(1.5)/2 = 1.5$ V; $V_2 = 2(0.5)/2 = 0.5$ V. Branch: $(1.5-0.5)/2 = 0.5$ A (1→2). Audit node 2: in $0.5$ = out $0.5/1$ ✓.
:::

::: step [Step 3: Conclusion] Final Result
Convert→assemble→determinant→branch currents→KCL audit. Branch currents always flow high→low voltage — direction checks are free error detectors.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$\begin{bmatrix}3&-1\\-1&2\end{bmatrix}[V_1,V_2]^T=[4,1]^T$. $V_1, V_2$?
(A) $1, 1$
(*B) $\Delta = 5$; $V_1 = (4\cdot2+1\cdot1)/5 = 9/5 = 1.8$ V; $V_2 = (3\cdot1+1\cdot4)/5 = 7/5 = 1.4$ V
(C) $4, 1$
(D) $2, 2$
::: explanation
Cramer with RHS $[4,1]$: $V_1 = (8+1)/5 = 1.8$, $V_2 = (3+4)/5 = 1.4$. Off-diagonal sign ($-1$) enters $\Delta = 6-1 = 5$ — dropped minus signs detonate here first.
:::

::: quiz Q2: Foundational Concept
A $10$ V source connects nodes $1$–$2$ (neither ground). Treatment?
(A) Normal nodal with $10$ A injection
(*B) Supernode: KCL over the $\{1,2\}$ envelope plus constraint $V_1-V_2 = \pm10$ V
(C) Ignore the source
(D) Ground node $1$ forcibly
::: explanation
The source fixes the *difference*, its current unknown — envelope KCL absorbs the unknown internal current, constraint restores equation count. Mirror of the mesh supermesh, in $G$ instead of $R$.
:::

::: quiz Q3: Foundational Concept
Circuit has $2$ meshes but $1$ non-reference node. Efficient choice?
(A) Mesh (2 equations)
(*B) Nodal (1 equation) — unknowns equal non-reference nodes; always count both and pick fewer
(C) Star-delta
(D) Superposition only
::: explanation
One node ⇒ one KCL equation vs two KVLs. Equation-count comparison *is* the method-selection algorithm — run it before writing anything.
:::
