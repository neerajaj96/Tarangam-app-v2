# M1 Drill: Paradigm Triage & Ceilings

**Speed-vs-throughput verdicts, Amdahl arithmetic, and model labelling at exam pace.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Stamps
Stamp the workload (HPC/HTC/IoT/CPS) → stamp the ceiling (Amdahl number) → stamp the housing (cluster/grid/P2P/cloud). Three stamps, full M1 marks.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Stamp kit

HPC = coupled+latency · HTC = loose+throughput · CPS needs loop+deadlines · Amdahl $1/(s+(1-s)/p)$ · housing by ownership/coupling/trust.

::: callout-formula KTU Formula Vault: Stamps
Workload → ceiling → housing.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs Amdahl arithmetic with a paradigm/model comparison table (own three rows: control, coupling/trust, metric). Numbers plus table = complete.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) $70\%$ parallel on $10$ cores: cap? (b) Crash-simulation coupling a million cells per step: HPC or HTC? (c) Volunteer computing (BOINC): model + scheduling implication?
:::

::: step [Step 2: Execution] Number, Shape, House
1. $1/(0.3+0.07) = 1/0.37 \approx 2.7\times$.
2. HPC (tightly coupled stencil exchanges per step — latency-bound interconnect, single-job metric).
3. Grid/HTC-flavoured P2P-ish volunteering: untrusted churn-heavy hosts ⇒ redundant validation (replicate + vote), credit incentives, checkpoint-friendly workunits.
:::

::: step [Step 3: Conclusion] Final Result
Arithmetic, coupling verdict, trust design — M1's complete triage in three lines.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Doubling cores $8\to16$ on $90\%$-parallel code gains:
(A) $2\times$
(*B) $1/(0.1+0.9/8)=4.71\times$ → $1/(0.1+0.9/16)=6.4\times$: $+36\%$, not double — serial $10\%$ taxes scaling
(C) $16\times$
(D) Nothing
::: explanation
$4.71\to6.4$: the serial tenth dominates at scale. Diminishing-returns arithmetic is the "worth upgrading?" answer — compute both ends, quote the delta.
:::

::: quiz Q2: Mixed Drill
Smart traffic lights adapting city-wide in real time: IoT or CPS?
(A) IoT (sensors only)
(*B) CPS — sense→compute→actuate (signals) with city-scale timing/safety obligations; failure modes are physical (gridlock, crashes), not just stale dashboards
(C) Neither, it's HPC
(D) Pure cloud
::: explanation
Actuation + physical consequences + timing = CPS, however "smart-city-IoT" the brochure sounds. Consequences classify: bits-only vs atoms-moving.
:::

::: quiz Q3: Mixed Drill
University cluster vs multi-university grid for one big tightly-coupled simulation:
(A) Grid always wins (more nodes)
(*B) Cluster — tight coupling needs low-latency interconnect + central scheduling; grid latency/federation overheads punish per-step exchanges (use grid for bags of tasks, not one mesh)
(C) P2P swarm
(D) Single laptop
::: explanation
Coupling fit beats node count: microsecond exchanges die on millisecond federated links. Housing follows coupling — the placement rule that generalises beyond this example.
:::
