# MLP Architecture & Forward Pass

**From perceptron to deep stacks — layers, weights, biases, and one full hand-computed forward sweep (S5 ML reunion).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Committee of Committees
A perceptron is one voter (weighted sum + threshold). An **MLP** is committees of committees: input layer presents evidence, hidden layers debate (each neuron votes with weights + bias, squashed by activation), output layer announces. Depth lets early committees detect edges and later ones detect *faces made of edges* — hierarchy is the whole power (M2's representation story starts here).
:::

::: anim mlp-layers Two Voters, Three Debaters, One Verdict
Inputs fan into every hidden unit, hidden chorus funnels to output — width counts the debaters, depth the committee rounds.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Forward equations

$$z^{(l)} = W^{(l)}a^{(l-1)} + b^{(l)}, \qquad a^{(l)} = \sigma(z^{(l)})$$

with $a^{(0)} = x$. Parameter count: $\sum_l (n_{l-1}+1)n_l$ (weights + biases). Universal approximation: one wide hidden layer approximates any continuous function (existence, not efficiency — depth wins practically).

::: callout-formula KTU Formula Vault: Forward
$z=Wx+b$, $a=\sigma(z)$ · params **$\sum(n_{in}+1)n_{out}$** · depth = **hierarchy**.
:::

::: callout-pitfall Bias Is Not Optional Decoration
Without $b$, every boundary must pass through the origin (hyperplane pinned!) — bias shifts decision surfaces freely. Dropped biases silently cripple expressivity; count $+1$ per neuron in parameter tallies.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Net $2$-$2$-$1$, sigmoid $\sigma(z)=1/(1+e^{-z})$, $x=[1,0]$. $W^{(1)}=[[0.5,-0.5],[0.3,0.8]]$ (rows = hidden units), $b^{(1)}=[0,0]$, $W^{(2)}=[[1.0,-1.0]]$, $b^{(2)}=[0]$. Forward output?
:::

::: step [Step 2: Execution] Multiply, Squash, Repeat
1. $z^{(1)} = [0.5(1)+(-0.5)(0),\, 0.3(1)+0.8(0)] = [0.5, 0.3]$. $a^{(1)} = [\sigma(0.5), \sigma(0.3)] \approx [0.6225, 0.5744]$.
2. $z^{(2)} = 1.0(0.6225)-1.0(0.5744) = 0.0481$. Out $= \sigma(0.0481) \approx 0.5120$.
:::

::: step [Step 3: Conclusion] Final Result
$0.512$ — barely above $0.5$ (untrained net shrugs). Matrix-rows-as-units convention stated once prevents all index confusion in traces.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Net $3$-$4$-$2$. Trainable parameters?
(A) $3\cdot4+4\cdot2 = 20$
(*B) $(3+1)4 + (4+1)2 = 16+10 = 26$ — biases included ($20$ weights + $6$ biases)
(C) $3+4+2 = 9$
(D) $4\cdot2+2 = 10$
::: explanation
Each target neuron owns weights *plus one bias*: $(n_{in}+1)\times n_{out}$ per layer. Bias-blind counts ($20$) undercount every parameter question — $+1$ per neuron, always.
:::

::: quiz Q2: Foundational Concept
Universal approximation (one wide hidden layer suffices) vs depth in practice:
(A) Depth is pointless then
(*B) Existence (width can fit anything, exponentially wide) vs efficiency (depth composes features hierarchically, parameter-frugal) — depth wins practice, width wins the theorem
(C) Width can't learn
(D) Depth reduces parameters always? Typically, not provably per case
::: explanation
Wide-shallow memorises (exponential width for compositional functions); deep-narrow *composes* (edges→parts→objects). Hierarchy matches world structure — the representation-learning thesis (M2 builds on it).
:::

::: quiz Q3: Foundational Concept
Why nonlinear $\sigma$ between layers (why not stack linears)?
(A) Speed
(*B) Linear$\circ$linear collapses to one linear map ($W_2W_1x$) — depth without nonlinearity adds zero expressivity; $\sigma$ breaks collapse (that's what makes depth *deep*)
(C) Tradition
(D) Biases demand it
::: explanation
Collapsed stacks are single perceptrons wearing trench coats. Nonlinearity per layer is the *definition* of depth's power — linear MLPs are a contradiction in terms, testable in one line.
:::
