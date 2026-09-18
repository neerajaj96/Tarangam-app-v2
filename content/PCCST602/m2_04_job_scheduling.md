# Job Scheduling Methods

**Who runs where, when — queues, backfilling, gang, fair-share, and the metrics schedulers actually optimise.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Airport Runways
Jobs are planes (sizes = runtimes, classes = queues); nodes are runways. **FCFS** lands in arrival order (head-of-line jumbo blocks Cessnas — *head-of-line blocking*). **Backfilling** slides Cessnas into runway gaps without delaying the jumbo (needs runtime estimates — lies hurt everyone). **Gang** co-schedules parallel jobs' pieces together (they chat constantly — solo pieces idle). **Fair-share** rations by group tickets (labs get proportional skies, not FIFO scraps). Metrics: utilisation, throughput, wait/turnaround, slowdown, fairness.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Methods and metric tensions

* FCFS (+priorities): simple, starvation-prone, HoL blocking.
* Backfill (conservative/aggressive-EASY): utilisation jump via estimates; accuracy dependence.
* Gang/co-scheduling: communicating parallel jobs march together; fragmentation/coordination cost.
* Fair-share/capacity/fifo pools (YARN-style): hierarchical tickets, preemption for guarantees.
* Metrics tension: utilisation vs responsiveness (pack tight ⇒ queue long); throughput vs fairness; slowdown (response/runtime) guards small-job starvation.

::: callout-formula KTU Formula Vault: Scheduling
FCFS **simple, blocks** · backfill **gaps via estimates** · gang **march together** · fair-share **tickets** · watch **slowdown**.
:::

::: callout-pitfall Backfill Lies Compound
User runtime estimates inflate (insurance padding) — padded estimates shrink apparent gaps, killing backfill's win while *also* delaying reservations honestly. Estimate accuracy is load-bearing; some sites measure-and-punish chronic liars.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$4$ nodes free. Queue order: J1 ($2$ nodes, $60$ min), J2 ($2$ nodes, $10$ min), J3 ($2$ nodes, $10$ min). FCFS vs EASY-backfill timelines? And how is later J4 ($4$ nodes) protected?
:::

::: step [Step 2: Execution] Gaps and Reservations
1. **FCFS:** J1 runs $0$–$60$ on nodes $1$–$2$; J2 waits despite $2$ idle nodes (order-fairness wastes half the machine); J3 after J2. Makespan $80$ min, early utilisation $50\%$.
2. **Backfill:** J2 slides into nodes $3$–$4$ at $t=0$ (fits the gap, delays nobody) — finishes $t=10$; J3 next on $3$–$4$ ($10$–$20$). Same makespan, early utilisation $100\%$.
3. **J4 guard:** EASY reserves J4 a start time once at head; backfill only uses gaps *before* it — reservations bound leapfrogging, curing starvation.
:::

::: step [Step 3: Conclusion] Final Result
HoL-blocking demo, gap-fit arithmetic, reservation-as-fairness-guard. Fit-math per decision is the trace format — show which jobs fit where, and whose promise constrains them.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Head-of-line blocking in FCFS schedulers is:
(A) Network congestion
(*B) A big early job idles fitting capacity behind it — small jobs wait though resources sit half-free; order-fairness wastes utilisation
(C) Disk failure
(D) Priority inversion only
::: explanation
FIFO order vs bin-packing efficiency collide: the head dictates while gaps starve. Backfill exists precisely as the ordered-but-opportunistic fix — order for fairness, gaps for utilisation.
:::

::: quiz Q2: Foundational Concept
Gang scheduling's raison d'être:
(A) Simpler queues
(*B) Tightly-coupled parallel pieces busy-wait on each other — co-scheduled they chat instantly; time-sliced apart they burn cycles waiting (spin-waste), so march them together
(C) Fairness across users
(D) Shorter jobs first
::: explanation
Spin-waiting on unscheduled peers converts parallelism into idle burn. Co-scheduling (same time slices across nodes) keeps conversations live — coordination cost buys communication sanity.
:::

::: quiz Q3: Foundational Concept
Slowdown metric guards what averages hide?
(A) Total throughput
(*B) Small-job starvation — response/runtime ratio explodes for tiny jobs stuck behind giants (average wait looks fine, dominated by big jobs' tolerance); bounded slowdown enforces proportionate waits
(C) Power draw
(D) Disk usage
::: explanation
Averages let giants mask minnows' misery ($1$-min job waiting an hour = slowdown $60$). Fair schedulers bound worst-case slowdown — metric choice *is* policy, name it as such.
:::
