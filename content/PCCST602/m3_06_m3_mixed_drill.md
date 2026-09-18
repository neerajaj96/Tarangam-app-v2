# M3 Drill: Floor Picks & Bargain Arithmetic

**Trust-gap flooring, exit/walk ledgers, and convergence inequalities — virtualization decisions at pace.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Rulers
Trust ruler (floor), tax ruler (exits/walks per workload), race ruler (dirt vs pipe). Measure all three before housing or moving anything.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Ruler kit

Floors light→tight · VMM native-hot-path · mem shadow→EPT (+hugepages) · IO emulate→paravirt→passthrough · VC overlays+packing · move iff dirt < pipe.

::: callout-formula KTU Formula Vault: Rulers
Trust → floor · workload → technique · dirt/pipe → go/no-go.
:::

::: callout-exam KTU Exam Focus
The 9-marker pairs level-comparison (with trust-gap reasoning) and a technique drill (CPU *or* memory *or* I/O bargain) plus migration stages. Bargain-stated-per-pick (what's sacrificed) is the recurring scoring move.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Untrusted student code at scale: floor? (b) $8$ GB VM, dirt $100$ MB/s, $1$ Gbps link: migrate live? (c) GPU inference fleet, daily reshuffle: I/O pick?
:::

::: step [Step 2: Execution] Three Rulers
1. Hardware VMs (untrusted ⇒ fortress; density sacrificed knowingly).
2. Pipe $125$ MB/s vs dirt $100$ MB/s: converges (ratio $0.8$/round): $8$ GB → $6.4$ → … freeze seconds-ish → borderline-OK off-peak; throttle to be safe.
3. Paravirt + MIG slices (mobility for reshuffles; passthrough would nail the fleet down — stated sacrifice).
:::

::: step [Step 3: Conclusion] Final Result
Floor by adversary, go/no-go by inequality, mobility by technique — rulers beat vibes every time.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Banking ledgers beside cat videos on one host: housing?
(A) Containers side by side
(*B) Separate hardware VMs — untrusted + regulated tenants need kernel separation; container kernel-sharing is the disqualifier here
(C) Same container for both
(D) Bare metal each (safe but cost-rejected vs VMs)
::: explanation
Regulated + untrusted ⇒ fortress floor (VMs); cost rules out bare-metal-per-tenant. Name the disqualifying sharing (one kernel) to kill the container option explicitly.
:::

::: quiz Q2: Mixed Drill
EPT + hugepages for a pointer-chasing DB: verdict?
(A) Always helps massively
(*B) Mixed: EPT kills shadow exits (win) but deepened walks punish TLB misses (loss) — hugepages cut miss *count* (fewer, fatter entries), net usually positive; profile miss-rate to confirm
(C) Disable EPT
(D) Irrelevant knobs
::: explanation
Two opposing arrows (exits down, walk-depth up) netted per workload miss profile. Hugepages blunt the loss arrow — knob-combination reasoning, not single-switch verdicts.
:::

::: quiz Q3: Mixed Drill
Pre-copy rounds: $4$ GB, dirt $400$ MB/s, pipe $1$ GB/s. Round sizes + freeze sense?
(A) Grows forever
(*B) Ratio $0.4$: $4\to1.6\to0.64\to0.26$ GB… freeze sub-second after $3$–$4$ rounds — converges ($0.4<1$), stop-and-copy tail is ms-scale
(C) Freeze $4$ s
(D) Impossible
::: explanation
Geometric shrink ($0.4^k$) converges fast; freeze = final delta / pipe $\approx$ fractions of a second. Ratio-first ($<1$ ⇒ go) then round-sketch — the migration estimate format.
:::
