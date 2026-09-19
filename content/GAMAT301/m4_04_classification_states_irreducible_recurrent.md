---
id: m4_04_classification_states_irreducible_recurrent
courseCode: GAMAT301
module: 4
sequence: 4
title: 'Classification: Irreducible, Recurrent & Transient'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Partition states into communicating classes
  - Test closedness and return-everywhere recurrence
  - Run reachability, classes, closedness, and recurrence in order
concepts:
  - communicating classes
  - recurrence
  - transience
prerequisites:
  - m4_01_markov_chains_transition_matrix
examRelevance: medium
tags:
  - markov-chains
  - classification
---
# Classification: Irreducible, Recurrent & Transient

**Can you get there from here — and do you come back? Communicating classes, closed sets, and return behaviour.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Islands and Bridges
States are islands, positive-probability hops are bridges. **Communicate** = mutual ferries exist both ways (partitions islands into isolated archipelagos = **classes**). **Irreducible** = one archipelago (everywhere reachable). **Closed** = no outgoing bridges (Hotel California). **Recurrent** = you always sail home eventually; **transient** = there's an escape current — leave and you may never return. Finite closed classes are always recurrent (nowhere else to go).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Communication and irreducibility

$i \to j$ if $P_{ij}^{(n)} > 0$ for some $n$; $i \leftrightarrow j$ if both ways. $\leftrightarrow$ is an equivalence relation → classes. Irreducible: single class. Closed class $C$: $P_{ij} = 0$ for $i \in C$, $j \notin C$.

### 2.2 Recurrent vs transient

$f_i = P(\text{ever return to } i \mid X_0 = i)$: recurrent if $f_i = 1$, transient if $< 1$. Class property (all members share it). Finite-state chains: every closed class recurrent; all states of a finite irreducible chain recurrent. Symmetric 1D/2D walks recurrent; 3D transient (Pólya — enrichment only).

::: callout-formula KTU Formula Vault: Classification
Reachability **$P^{(n)}>0$** · classes = **$\leftrightarrow$ blocks** · irreducible = **one class** · recurrent **$f=1$**, transient **$f<1$** · finite closed ⇒ recurrent.
:::

::: callout-pitfall Aperiodicity Is Separate
Irreducible + finite ⇒ recurrent, but *not* necessarily aperiodic (a 2-cycleflip-flop is recurrent yet periodic with period $2$). Period needs gcd of return times — a different question from "do we return".
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Chain on $\{1,2,3\}$: $1\to2$, $2\to1$ or $3$, $3\to3$ (absorbing). Find classes, closed sets, and classify states.
:::

::: step [Step 2: Execution] Bridges Then Returns
1. $1\leftrightarrow2$ (class $\{1,2\}$); $3$ alone ($\{3\}$). Chain reducible.
2. $\{3\}$ closed (absorbing); $\{1,2\}$ open (leaks $2\to3$).
3. From $\{1,2\}$ escape to $3$ is possible and $3$ never returns → $1,2$ transient; $3$ recurrent (absorbing, finite closed).
:::

::: step [Step 3: Conclusion] Final Result
Reachability → classes → closedness → recurrence: always in this order. Absorbing states are the trivially closed, trivially recurrent anchors of every such analysis.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
A finite irreducible Markov chain must have which property?
(A) All states transient
(*B) All states recurrent — finite + closed (whole space) leaves no escape room
(C) Period $3$
(D) Absorbing states
::: explanation
The single class is closed (the chain can't leave its own state space) and finite — escape with permanent absence is impossible, so returns happen with probability $1$ everywhere.
:::

::: quiz Q2: Foundational Concept
State $i$ leads to $j$ but $j$ never returns to $i$. What follows?
(A) Both recurrent
(*B) $i$ is transient (escape route exists); $j$'s own status needs its class analysis
(C) Both transient
(D) Chain is irreducible
::: explanation
One-way passage breaks communication (distinct classes) and gives $i$ a non-returning exit — the definition of transience for $i$. $j$ may be recurrent (e.g. absorbing) or transient itself; analyse its class separately.
:::

::: quiz Q3: Foundational Concept
Why is recurrence a class property?
(A) By definition of classes
(*B) Communicating states share return-path structure: excursions from $i$ route through $j$ and back, tying their return probabilities together (both $1$ or both $<1$)
(C) All classes are singletons
(D) Transient states don't communicate
::: explanation
$i \leftrightarrow j$ gives positive-probability round trips linking their returns; $f_i = 1$ forces $f_j = 1$ through these bridges. Classify one member, inherit for the class — the standard time-saver.
:::
