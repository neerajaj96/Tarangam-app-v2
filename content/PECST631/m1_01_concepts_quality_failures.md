# Testing Concepts, Quality & Famous Failures

**Why test at all — quality models, cost-of-defect curve, and the disasters that priced complacency.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Fuse Boxes and Falling Rockets
**Testing** doesn't *prove* correctness (Dijkstra: tests show presence of bugs, never absence!) — it *prices risk down* (each bug class caught earlier costs $10\times$ less: requirements → design → code → field!). **Ariane 5** ($370$M fireworks: reused Ariane-4 inertial code, unguarded float→int overflow!) and **Therac-25** (race-condition overdoses: removed hardware interlocks, software-only safety!) are the twin tombstones: untested assumptions kill budgets *and* patients. **Quality** (ISO 25010-ish: functionality/reliability/usability/efficiency/maintainability/portability!) is the multi-axis scorecard tests sample.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Quality + cost curve + failure files

* Quality facets (name 4+!): correctness, reliability (MTTF!), usability, performance, security, maintainability.
* Cost curve: $1\times$ (requirements review!) → $10\times$ (design!) → $100\times$ (code/test!) → $1000\times$ (field recall/lawsuit!) — shift-left economics!
* Ariane 5: $64$-bit float → $16$-bit int overflow (horizontal velocity larger than Ariane-4's envelope!; exception unhandled → self-destruct!). Therac-25: counter overflow + race + no hardware interlock (software-only safety + cryptic error codes!).

::: callout-formula KTU Formula Vault: Why Test
Tests show **presence, never absence** · cost **$10\times$ per phase slipped** · quality = **multi-axis scorecard**.
:::

::: callout-pitfall "Tested = Correct" Overclaim
Tests sample (coverage-bounded!) — absence-of-*found*-bugs ≠ absence-of-bugs (oracle problem + input-space infinity!). Claims scoped (tested-X-under-Y!) — certainty language banned outside proofs.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"A reused guidance module (new rocket, faster!) overflows an int conversion mid-flight (Ariane-shaped!). (a) Root class? (b) Which review/test gate catches it cheapest? (c) Therac-parallel lesson?"
:::

::: step [Step 2: Execution] Tombstone Reading
1. (a) Assumption-violation (environment envelope changed, code didn't — reused-component context shift!) + unhandled exception (fail-*deadly* default!).
2. (b) Requirements/design review (envelope re-validation: $1\times$!) or static analysis/range checks (overflow sentinels!) — field price ($370$M!) vs review price (meeting!).
3. (c) Software-only safety without independent interlocks (defense-in-depth hardware + software!) + inscrutable errors (operator-readable diagnostics!).
:::

::: step [Step 3: Conclusion] Final Result
Context-shift + unhandled-exception + missing-interlock: tombstone anatomy in three parts. Shift-left pricing (review-cost vs field-cost!) closes every failure-case answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Dijkstra's "tests show presence, never absence" means for claims:
(A) Testing is useless
(*B) Passing suites bound *found* bugs to zero, not *existing* bugs (input infinity + oracle limits!) — claims scoped to coverage run, certainty reserved for proofs (model checking on finite models!)
(C) More tests always suffice
(D) Proofs are testing
::: explanation
Sampling logic (tested subset vs input universe!) caps certainty — coverage *quantifies* the sampled fraction (honest denominator!). Scope language (tested-X!) replaces correctness theater.
:::

::: quiz Q2: Foundational Concept
Ariane 5's root cause class (exam one-liner):
(A) Bad luck with weather
(*B) Reused component outside validated envelope (faster rocket, old overflow guard!) + unhandled conversion exception triggering self-destruct (fail-deadly default!) — context-shift + exception-policy twin causes
(C) Too few tests run
(D) Hardware wore out
::: explanation
Reuse-without-revalidation (envelope changed!) plus exception-as-self-destruct (fail-*safe* design would safe the vehicle!). Twin-cause format (shift + policy!) is the case-study answer shape.
:::

::: quiz Q3: Foundational Concept
Cost-of-defect $10\times$-per-phase implies project strategy:
(A) Test only at the end (big-bang!)
(*B) Shift-left (reviews/static analysis/unit discipline early — cheapest gates first!; field failures priced $1000\times$ fund all earlier gates combined!)
(C) Skip requirements reviews (code first!)
(D) Testing has fixed cost regardless
::: explanation
Exponential price curve (phase-slipped!) makes early gates ROI-positive almost always (one field recall funds a review culture for years!). Economics, not virtue, sells shift-left — price-tagged reasoning.
:::
