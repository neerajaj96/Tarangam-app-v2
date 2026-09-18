# Detailed Design: SRD, DFM, Cost & DFMEA

**From PoC to blueprints — requirements that bind, manufacture-friendly shapes, cost ceilings, and failure autopsies in advance.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Construction Blueprints with Doom Diaries
**SRD/SRS** writes the binding promise (what/well/how-verified — signed by stakeholders!). **DFM** shapes for factories (tolerances machines hold! parts counted down! assembly idiot-proofed!). **Design-to-cost** budgets backwards (price − margin = allowable cost — cost as *input*, not outcome!). **Pre-compliance** pre-audits regulations (certify-early, not recall-late!). **DFMEA** autopsies futures (failure modes × severity × occurrence × detection = RPN-ranked! — fix high-RPN first!). **Forecasting changes** versions gracefully (modularity where churn lives!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Design spine + DFMEA arithmetic + change-proofing

* SRD/SRS anatomy (functional/non-functional/constraints/acceptance criteria! + traceability!).
* DFM rules (minimise parts/processes/tolerances-tight-only-where-needed!; standard components!).
* Cost ceilings (target costing!; teardown-benchmarking!).
* DFMEA: RPN $= S\times O\times D$ ($1$–$10$ scales!; actions on thresholds!; living document!).
* Pre-compliance (standards-mapped early!) + change forecasting (platform/modular margins!).

::: callout-formula KTU Formula Vault: Design Spine
Promise (**SRD**) → shape (**DFM**) → budget (**cost-in**) → pre-audit (**compliance**) → autopsy (**RPN**) → flex (**modular**).
:::

::: callout-pitfall RPN Theater (Numbers Without Action!)
Scored-but-unacted FMEAs (high-RPN items lingering!) are paperwork (action owners + dates per RPN tier, or ritual!). Action-attached scoring (score→owner→date→verify!) is the FMEA discipline — numbers that move metal.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"QR-token display unit: (a) $5$-line SRD core? (b) DFM pick + cost ceiling sketch? (c) DFMEA top-$2$ rows with RPNs + actions? (d) Pre-compliance + change-forecast lines?"
:::

::: step [Step 2: Execution] Blueprint Pack
1. (a) Display QR $\le3$s at $2$m sunlight-readable; uptime $99\%$ canteen hours; fallback slips on power-cut; install $<30$ min/untrained; verify by metered pilot.
2. (b) Commodity tablet + 3D-printed hood (standard parts!); ceiling: hardware $<₹X$ (price−margin math!).
3. (c) Row 1: display theft ($S9\times O3\times D4=108$ → Kensington + mount design!). Row 2: sun-glare misreads ($8\times5\times3=120$ → hood + brightness sensor!). Actions owned/dated.
4. (d) Electrical-safety pre-check booked early; modular mount (counter/wall/pole variants forecast!).
:::

::: step [Step 3: Conclusion] Final Result
Promise-lines, DFM picks, RPN rows with owners, pre-audit bookings, modular margins. Owner-dated actions per finding — paperwork that moves metal.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
SRD acceptance criteria (vs feature lists) matter because:
(A) Longer documents impress
(*B) Verifiability contracts (pass/fail decidable per criterion! — disputes resolved by measurement, not memory!) — testability designed in (each requirement carries its proof method!)
(C) Developers love reading
(D) Auditors count pages
::: explanation
Decidability design (criterion ⇒ test exists!) prevents acceptance theatre (shipped-but-unjudgeable!). Proof-method-per-requirement (how-will-we-know!) is the SRD quality bar.
:::

::: quiz Q2: Foundational Concept
RPN $= S\times O\times D$ prioritises by:
(A) Alphabetical failure names
(*B) Risk product (severity × occurrence × *undetectability* — high-RPN = bad × likely × hidden!; thresholds trigger actions; detection-improvement counts as mitigation!)
(C) Repair cost alone
(D) Engineer preferences
::: explanation
Triple-product risk (harm × frequency × stealth!) ranks attention (top-RPN first!). Detection-lever (better monitors *lower* RPN legitimately!) expands mitigation beyond redesign — detectability engineered too.
:::

::: quiz Q3: Foundational Concept
Design-to-cost inverts normal budgeting by:
(A) Spending more freely
(*B) Cost-as-input (market-price minus margin = allowable cost, designed *to* — overruns redesign, not re-price!) — flips cost from outcome to constraint (creativity *within* ceilings!).
(C) Ignoring quality
(D) Fixed supplier contracts
::: explanation
Constraint-first creativity (ceiling given, ingenuity fills!) vs cost-plus drift (spend then price-wish!). Teardown-benchmarking (competitor cost autopsy!) grounds ceilings in reality.
:::
