# Compiler Structure: Front End, Optimizer, Back End

**What a compiler is made of — analysis up front, improvement in the middle, synthesis at the back, all shaking hands over IR.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Book Translation House
Source code is a French novel; target code the English edition. The **front end** reads French (scan words → parse sentences → check grammar/meaning) into a language-neutral story outline (**IR**). The **optimizer** tightens the outline (cut redundancies, same plot). The **back end** writes English from the outline (pick instructions, assign registers). Retargeting to German reuses everything before the back end — the outline pays for itself per language pair.
:::

::: anim compiler-pipeline Three Shops, One Handshake
Front end analyses, optimizer improves, back end synthesises — IR flows between all three, so N languages × M machines need N+M parts, not N×M.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Phases and their contracts

* **Front end:** scanning (characters→words/tokens) → parsing (tokens→syntax tree, rejects bad syntax) → semantic analysis (tree→checked IR, types/scopes). Machine-independent, language-specific.
* **Optimizer:** IR→IR transforms (value numbering, unrolling, placement). Optional but expected; must preserve meaning.
* **Back end:** instruction selection → register allocation → scheduling/emission. Machine-specific, language-blind.

### 2.2 Why IR in the middle

Decouples $N$ front ends from $M$ back ends; optimisation written once applies to all pairs. Graphical (trees/DAGs) vs linear (TAC) flavours — M3 details them.

::: callout-formula KTU Formula Vault: Structure
Front = **scan·parse·check** · middle = **IR→IR** · back = **select·allocate·emit** · N×M via **N+M**.
:::

::: callout-pitfall Analysis vs Synthesis Side
Scanning/parsing/semantics *understand* (analysis, front); selection/allocation *produce* (synthesis, back). Optimisation sits between as IR→IR. Mis-shelving phases (e.g. "parsing is back end") breaks the phase-order question.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Name the phases handling: (a) rejecting `x = + ;`, (b) reusing one C front end for x86 and ARM, (c) turning `a+b*c` into loads/adds."
:::

::: step [Step 2: Execution] Shelter Each Job
1. Parser (syntax) — token stream violates expression grammar → syntax error before any meaning is checked.
2. IR decoupling: C→IR once; x86-back and ARM-back both consume it — N+M reuse.
3. Back end: TAC → instruction selection (load/add/store), register allocation for $a,b,c$.
:::

::: step [Step 3: Conclusion] Final Result
Reject→front, reuse→IR, emit→back. Phase-placement questions are shelving exercises — name the shelf and its contract line.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why do compilers route through IR instead of translating directly?
(A) IR runs faster
(*B) Decoupling: $N$ front ends + $M$ back ends cover $N\times M$ pairs, and one optimizer serves all — direct translation rebuilds everything per pair
(C) IR is machine code
(D) Parsers require it
::: explanation
The outline amortises work: add a language (one front end) or a chip (one back end) independently. Direct $N\times M$ translators duplicate optimisation $N\times M$ times — the economics make IR inevitable.
:::

::: quiz Q2: Foundational Concept
Type error (`int + string`) is caught where?
(A) Scanner
(*B) Semantic analysis (front end) — syntax is fine, meaning violates type rules checked on the attributed tree
(C) Register allocator
(D) Optimizer only
::: explanation
Scanning/parsing accept the *shape*; semantics judges *sense* (types, scopes, declarations). Phase boundaries follow shape-vs-sense — the classification reflex for all "which phase" questions.
:::

::: quiz Q3: Foundational Concept
Which phases are machine-dependent?
(A) All equally
(*B) Back end (selection/allocation/scheduling target the chip); front end and most optimisation are machine-independent over IR
(C) Scanner only
(D) None
::: explanation
Dependence starts where IR ends: instruction shapes and register files are chip facts. Portability lives up front — retargeting swaps the back end, never the parser.
:::
