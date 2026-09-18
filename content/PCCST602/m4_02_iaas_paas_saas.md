# IaaS, PaaS, SaaS: The Service Stack

**Who manages what — the layered responsibility cake from bare iron to finished apps.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Pizza as a Service
**On-prem**: grow wheat, bake at home (you do everything). **IaaS**: rented kitchen (provider: ovens/power; you: recipes/dishes — VMs, nets, disks). **PaaS**: pizza-kit delivery (provider: kitchen + dough + oven schedule; you: toppings/code — runtimes, buildpacks, managed DBs). **SaaS**: restaurant (eat finished pizza — Gmail, Salesforce; you: users + data + access policy). Higher layer = less control, faster serving; pick by undifferentiated-heavylifting appetite.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Layer lines and picks

* IaaS (EC2-style): hardware→hypervisor→network managed; OS/middleware/app yours. Control maximal, ops burden high.
* PaaS (App-Engine/Heroku/Beaanstalk-style): + runtime/build/scale managed; push code, platform runs it. Velocity maximal, opinionated constraints (statelessness, add-on services).
* SaaS: finished apps; configure + consume; data/portability + identity integration are the residual duties.
* Climbing rule: outsource undifferentiated layers (patching, scaling scaffolding), retain differentiating ones (domain logic, data gravity decisions).

::: callout-formula KTU Formula Vault: Service Stack
Higher = **less control, more velocity** · outsource **undifferentiated**, retain **differentiating**.
:::

::: callout-pitfall PaaS Constraints Bite Migrators
Opinionated platforms (request timeouts, no local disk, stateless mandates) reject lift-and-shift assumptions — replatforming cost is the migration line-item teams forget. Read constraints before climbing.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Place: (a) ML training needing custom kernels/drivers, (b) CRUD startup racing to launch, (c) company email. Layer + residual duty each."
:::

::: step [Step 2: Execution] Appetite Sorting
1. (a) IaaS (driver/kernel control non-negotiable; team owns OS/middleware burden knowingly).
2. (b) PaaS (undifferentiated scaffolding outsourced; team ships features; accepts statelessness + add-on DBs).
3. (c) SaaS (email is pure undifferentiated heavy lifting; residual: identity/retention policies + export drills).
:::

::: step [Step 3: Conclusion] Final Result
Control-need vs velocity-hunger sorts layers; residuals named per pick. Differentiation test ("does this layer win us customers?") is the one-line classifier.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Managed Kubernetes (GKE/EKS-style) sits where, and why debated?
(A) Pure SaaS
(*B) IaaS/PaaS border: provider manages control plane (PaaS-ish) while you own nodes/workloads/networking (IaaS-ish) — CaaS labels the middle; duties split mid-stack
(C) On-prem only
(D) Not cloud at all
::: explanation
Border services split the cake mid-layer: masters/Upgrades outsourced, workers/config yours. Responsibility-line literacy (who patches what) is the operational point — draw the line per service.
:::

::: quiz Q2: Foundational Concept
SaaS residual duties that never outsource:
(A) Nothing remains
(*B) Identity/access, data governance/retention, integration contracts, exit/portability drills — consuming finished apps still owns trust, compliance, and escape hatches
(C) Server patching
(D) Hypervisor choice
::: explanation
Finished-app convenience ends at trust boundaries: who accesses, how long data lives, how you leave. Exit drills (export formats, migration rehearsals) are the SaaS insurance premium — pay it upfront.
:::

::: quiz Q3: Foundational Concept
Lift-and-shift to PaaS fails typically on:
(A) Cost only
(*B) Platform opinions (statelessness, ephemeral disk, timeout ceilings, add-on-only state) vs stateful/monolithic assumptions — replatforming (12-factor-ising) is the hidden project inside the migration
(C) DNS issues
(D) Developer skill
::: explanation
PaaS contracts assume cloud-native shapes; legacy shapes breach them silently-then-loudly. Constraint inventory *before* migration estimates the true project — opinions read first, code second.
:::
