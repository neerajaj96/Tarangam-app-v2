# Mutation Testing: Operators, Score & Muclipse

**Seeding fake bugs to grade your tests — competent-programmer hypothesis, coupling effect, and score math.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Vaccine Challenge Trials
**Mutants** (seeded faults: `+`→`-`, `<`→`<=`, off-by-ones, constant tweaks — first-order small changes per competent-programmer hypothesis: real bugs are *small* deviations from correct!). **Killed** (suite fails on mutant — immunity proven!) vs **survived** (suite green — blind spot indicted: write the missing test!) vs **equivalent** (mutant *semantically identical* — unkilled by any test, excluded from scoring!). **Score** = killed/(total−equivalent) — suite report card. **Muclipse** automates the plague (Eclipse plugin: generate→run→score→highlight survivors!).
:::

::: anim mutant-score Twenty Mutants Walk In…
Seventeen die on your tests (immunity!), three stroll through green (write those tests!) — score $85\%$, survivors highlighted.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Hypotheses + operators + score + cost control

* Competent programmer (small deviations!) + coupling effect (simple-fault tests catch complex ones — test simple kills, trust coupling!).
* Operators: arithmetic/relational/logical swaps, constant tweaks, statement deletion, return-value mutations (language-tuned sets!).
* Score $= K/(M-E)$ (equivalent-excluded!); cost controls (selective operators, sampling, weak/firm mutation: state-infection vs propagation-to-output!).

::: callout-formula KTU Formula Vault: Mutation
Seed **small faults** · killed/(total−equivalent) · survivors = **missing tests** · equivalent **excluded, hard to spot**.
:::

::: callout-pitfall Equivalent-Mutant Quicksand (Undecidable Tax!)
Equivalence is undecidable generally (manual review per survivor — expensive!). High-survivor suites drown triage (equivalent-vs-missing-test each!). Budget triage (sample survivors!) and operator choice (fewer equivalents!) manage the tax — score honesty requires equivalent-hunting, not ignoring.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"`if (a<b) m=a; else m=b;` suite: $T_1(a=1,b=2)$, $T_2(a=3,b=3)$. (a) Mutant `<`→`<=`: killed? (b) Mutant `m=a`→`m=b` in else: verdict? Equivalent anywhere? (c) Score?"
:::

::: step [Step 2: Execution] Kill Roll Call
1. (a) $T_2$ ($3,3$): orig $m=3$ (else, $3\not<3$!); mutant ($3\le3$!) takes if-branch $m=3$ — same output ($3$!) → *survives* (need $T_3$ distinguishing... wait: mutant output equals orig on both tests? $T_1$: orig $1$, mutant $1$ ✓ same; $T_2$: both $3$ ✓ same — survives! Killing needs boundary-distinguishing input... hmm `<`vs`<=` differ *only* at equality, where both branches yield $a=b$ value — *equivalent* mutant! (outputs identical ∀ inputs!). Verdict: equivalent, exclude!
2. (b) else-branch $m=b$→$m=a$?? Mutant `m=b`→`m=a` in else: $T_1$ ($1,2$ takes if...) else untested by $T_1$; $T_2$ else-branch: orig $m=3$, mutant $m=3$ (equal values!) — survives on suite; killing input: $a=5,b=3$ (orig $3$, mutant $5$!) — *missing test indicted*, write $T_3$!
3. (c) Score: mutants $2$, equivalent $1$ → denominator $1$; killed $0$ → $0\%$ (+ action: add $T_3$ → $100\%$!).
:::

::: step [Step 3: Conclusion] Final Result
Equivalent-vs-survivor triage (identical-outputs-∀-inputs test!) plus missing-test prescription per survivor. Triage-then-prescribe per mutant is the mutation answer motion.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Coupling effect justifies first-order mutants by:
(A) Simplicity preference
(*B) Tests killing simple faults *couple* to complex-fault detection (complex bugs contain simple-fault-like behaviours as components — empirically validated, DeMillo-ish heritage!) — small-seed confidence scales up
(C) Cheaper generation only
(D) Tradition
::: explanation
Coupling hypothesis (simple-kill ⇒ complex-catch, statistically!) underwrites mutant *representativeness* (synthetic faults stand for real ones!). Hypothesis-cited confidence (not blind faith!) is the methodology answer.
:::

::: quiz Q2: Foundational Concept
Equivalent mutants excluded from score denominator because:
(A) They flatter tools
(*B) Unkillable *by any* test (semantically identical!) — including them punishes perfect suites (score ceiling $<100\%$ unfairly!); exclusion needs *proof* per mutant (hardest triage step — undecidable generally!)
(C) They run slowly
(D) Operators forbid it
::: explanation
Denominator honesty (killable-only!) — equivalent-included scores mislead (suite blamed for logic!). Proof burden (show equivalence!) per exclusion prevents score-gaming the other way (calling survivors "equivalent" lazily!).
:::

::: quiz Q3: Foundational Concept
Weak vs strong (firm) mutation differ by:
(A) Tool branding
(*B) Kill condition depth (weak: infect *state* post-mutant — cheaper, earlier signal!; strong/firm: propagate to *output* — full RIP demand, pricier!) — cost-strength ladder (weak screens cheap, strong confirms!)
(C) Language support
(D) Nothing measurable
::: explanation
RIP-depth selection (infect-only vs propagate-to-output!) trades cost for strength (weak-fast-approximate, strong-slow-decisive!). Ladder deployment (weak screen → strong confirm on survivors!) optimises budgets.
:::
