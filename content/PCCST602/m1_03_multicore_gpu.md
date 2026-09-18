# Multicore, Multithreading & GPU Computing

**One chip, many hands — cores vs threads, parallelism's ceilings, and why graphics cards eat matrices.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Kitchen Staffing
**Multicore** = more chefs (true parallelism, but they share one pantry — cache coherence traffic!). **Multithreading** = one chef juggling orders (hide latency: chop while curry simmers; SMT/hyper-threading shares one chef's hands). **GPU** = thousand commis chefs chopping identical carrots in lockstep (SIMT: same instruction, massive data — matrices, pixels, ML) — brilliant at uniform feasts, helpless at branching banquets (divergence stalls the line).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Parallelism vocabulary and ceilings

* Bit/instruction/data/task-level parallelism; Flynn: SISD/SIMD/MIMD (GPUs ≈ SIMT flavour of SIMD).
* **Amdahl:** speedup ≤ $1/(s + (1-s)/p)$ — sequential fraction $s$ caps cores' payoff.
* **Gustafson:** scaled speedup $s + (1-s)p$ — bigger problems parallelise better (weak scaling optimism).
* Coherence (MESI-ish), false sharing, memory walls — why cores ≠ linear speedup.

### 2.2 GPU computing model

Host (CPU) + device (GPU): copy in → launch grids of thread-blocks → copy out. Throughput monsters for regular data-parallel kernels (GEMM, convolutions, Monte Carlo); branchy/pointer-chasing code stays CPU-side.

::: callout-formula KTU Formula Vault: Parallel Ceilings
Amdahl **$1/(s+(1-s)/p)$** (fixed size) · Gustafson **scaled** (growing size) · GPU = **SIMT throughput** · divergence **stalls**.
:::

::: callout-pitfall Cores ≠ Speedup Without Parallel Fraction
32 cores on 90%-sequential code caps near $10\times$ (Amdahl) — hardware can't parallelise the inherently serial. Profile $s$ first; buy cores for parallel fractions, clocks/memory for serial ones.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Program $80\%$ parallelisable. (a) Max speedup on $16$ cores? (b) How many cores for $4\times$? (c) GPU-fit or not for linked-list traversal vs matrix multiply?
:::

::: step [Step 2: Execution] Plug Amdahl, Then Judge Shape
1. $1/(0.2+0.8/16) = 1/0.25 = 4\times$.
2. $1/(0.2+0.8/p) = 4$ → $0.2+0.8/p = 0.25$ → $p = 16$. (Diminishing: next doubling buys little.)
3. List traversal: pointer-chasing, divergent — CPU. Matmul: regular, arithmetic-dense — GPU feast.
:::

::: step [Step 3: Conclusion] Final Result
Amdahl arithmetic for ceilings; regularity test for GPU fit (uniform + dense = offload; branchy/sparse-pointer = retain). Ceiling-then-shape is the two-move analysis.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$95\%$ parallel code, $20$ cores. Speedup cap?
(A) $20\times$
(*B) $1/(0.05+0.95/20) = 1/0.0975 \approx 10.26\times$ — half the cores' promise eaten by $5\%$ serial
(C) $19\times$
(D) $1.05\times$
::: explanation
$0.05+0.0475 = 0.0975$ → $\approx 10.3\times$. Serial slivers dominate at scale — the $5\%$ costs nearly half the machine. Quote the sliver's revenge explicitly.
:::

::: quiz Q2: Foundational Concept
SMT (hyper-threading) vs multicore — different how?
(A) Same thing, marketing
(*B) SMT shares one core's execution units across thread contexts (latency-hiding, modest gains); multicore duplicates whole cores (true parallel throughput, coherence costs)
(C) SMT is faster always
(D) Multicore shares registers
::: explanation
Juggling (SMT) vs cloning (multicore): one hides stalls, the other adds muscle. Workloads bound by memory latency love SMT; compute-bound parallel code wants real cores.
:::

::: quiz Q3: Foundational Concept
Branch divergence cripples GPU kernels because:
(A) GPUs lack branches
(*B) SIMT lockstep forces *both* paths serially per warp (masked lanes idle) — divergent warps pay sum-of-paths, coherent warps pay one path
(C) Compilers reject ifs
(D) Memory vanishes
::: explanation
Thirty-two lanes march together; divergence serialises the march with idle lanes billed anyway. Coherent control (uniform predicates) is the GPU programming commandment — structure data to match.
:::
