---
id: m4_05_trustzone_debug_miniproject
courseCode: PBCST504
module: 4
sequence: 5
title: 'TrustZone Deployment, Debugging & Mini-Project'
difficulty: beginner
estimatedMinutes: 14
learningObjectives:
  - State the secure/non-secure partition plan in plain words first
  - Place code and peripherals on the U575 correctly
  - Debug systematically and scope the hardware mini-project
concepts:
  - TrustZone partitioning
  - debugging method
  - mini-project scope
prerequisites:
  - m4_04_freertos_ipc_timing
examRelevance: high
tags:
  - trustzone-deploy
  - miniproject
---
# TrustZone Deployment, Debugging & Mini-Project

**What problem shipping trustworthy firmware poses, how Secure/Non-secure partitioning deploys on the STM32U575, how systematic debugging plus optimisation tame real bugs, and how the mandatory hardware mini-project is scoped and marked.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

All course skills must ship as one trustworthy gadget: keys guarded, radio working, battery lasting, bugs found fast. The problem: partition the firmware into worlds, prove each half, and demo a working device. The U575's TrustZone plus a debugging method plus a scoped project plan close the course.

Tiny beginner example. Smart room node: temperature (I2C) displayed (LCD), reported over radio hourly, keys vaulted, battery two years. Secure world: keys, crypto, attestation. Non-secure: sensors, display, radio, FreeRTOS tasks. Debug probe watches both; power profiler confirms sleep.

Analogy as support, then dropped. Think of opening a shop: vault installed first (Secure), shop floor stocked (Non-secure), inspector checks wiring (debug), accountant verifies margins (power), opening day demo (mini-project). From here on we use exact terms only: partition plan, veneer, secure fault, scope.

Abbreviations defined on first use: Software Development Kit (SDK) partition templates, Secure Fault (the TrustZone violation exception). Symbols: none.

| Question to ask | Meaning |
|---|---|
| What goes Secure? | Keys, crypto, attestation, boot, veneers — minimal attack surface |
| What goes Non-secure? | App logic, drivers, radio stacks, tasks — everything replaceable |
| What proves it works? | Debug evidence + power numbers + demo, documented |

<a id="words-first"></a>
## 2. Words First — Deployment Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Partition plan** | Written list: every flash region, RAM block, and peripheral labelled Secure/Non-secure/Callable before coding — the vault blueprint. |
| **Veneer functions** | The only legal gates (M1.04): Non-secure calls land here, arguments validated, then Secure serves — narrow by design. |
| **SecureFault debugging** | Violation reads as an exception with fault registers naming the offender address — evidence, not mystery. |
| **Optimisation axes** | Size (−Os, const tables to flash), speed (hot paths to RAM, -O2), power (sleep depths, clock trims) — one axis at a time, measured. |
| **Mini-project scope** | Sense + decide + drive + report + vault: one sensor, one output, one link, keys guarded, battery story told — demoable in ten minutes. |

::: callout-intuition Core Mental Model: Shop Opening
Vault first (partition + keys), stock the floor (app + drivers), inspector visits (debug faults to zero), accountant signs (power budget met), doors open (demo). Skipping straight to doors-open is how projects fail the night before evaluation.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Partition, Debug, Optimise

**U575 partition (numbered):** (1) Secure flash/RAM for boot, keys, crypto, veneers; Non-secure flash/RAM for app + tasks; shared veneer region callable. (2) Peripherals split: radio/UI to Non-secure, crypto/RTC-backup/keys to Secure. (3) SAU + IDAU + MPC/PPC gates enforce labels (course-level: boot code programs them, faults prove them). (4) Debug authenticated per lifecycle (open during dev, locked for release — M1.04's gate).

**Debugging method (the viva answer):** reproduce → isolate (binary-search the code half) → inspect (breakpoint/watch/fault registers) → hypothesise one cause → fix → regression-test. Optimise only measured hotspots: profiler before `-O` flags; `volatile` correctness before speed; sleep profiling (M2.02) before MHz tuning.

**Mini-project rubric shape:** working demo (sense-decide-drive-report live) + vault evidence (keys Secure, fault demo?) + power story ($I_{avg}$ math) + report (partition plan, schematics, code) + viva (any module questioned). Scope discipline: one sensor, one actuator, one link — depth over breadth, finished over fancy.

::: callout-formula KTU Formula Vault: Deployment Facts
Secure = keys/crypto/boot/veneers minimal · Non-secure = replaceable everything · faults name offenders · debug = reproduce/isolate/inspect/hypothesise/regress · optimise measured axes singly · project = sensor + output + link + vault + power story.
:::

::: callout-pitfall Demo-Day Hardware
Untested power supplies, loose jumpers, and uncharged laptop batteries kill more demos than code bugs. Pack spares, freeze code the night before, rehearse the ten-minute story — logistics is part of engineering.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Scope a room node: I2C temperature, LCD, hourly radio report, vaulted keys, 2-year battery claim. (a) Partition list? (b) Power proof shape? (c) Debug plan when reports stop but display works?
:::

::: step [Step 2: Execution] Plan, Proof, Method
(a) Secure: keys, crypto, boot, veneers. Non-secure: sensor/LCD/radio/tasks. Callable veneers: "encrypt-and-sign(report)". (b) Duty-cycle $I_{avg}$ math (M2.02) + measured sleep current + battery capacity ÷ $I_{avg}$ ≥ 2 years. (c) Display works ⇒ sensor+tasks alive; isolate radio path: link budget? broker credentials? veneer faults? — binary-search halves, fault registers witness.
:::

::: step [Step 3: Conclusion] Final Result
Partition written before code, power proven by division, bugs halved systematically — the deployment triad that turns coursework into a shippable gadget.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Vaulting everything Secure. Bloated Secure worlds are unauditable — minimal Secure, maximal Non-secure.
- Optimising unmeasured code. Profiler first; intuition about hotspots is usually wrong.
- Scoping three projects as one. One sensor-output-link-vault chain done well beats three half-wired dreams.

Exam recap: partition contents per world; veneer-only entry; fault-register evidence; debug five-step method; single-axis optimisation; mini-project five-part rubric.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Partition a door-lock firmware: PIN store, PIN checker, Bluetooth stack, LED, log memory. Which world each, and where do calls cross?
() All Secure — safest is everything guarded
(*) Secure: PIN store + checker (+boot/keys); Non-secure: Bluetooth, LED, logs; crossings only via "verify(pin)→yes/no" veneers — minimal Secure stays auditable, radio bugs can't reach PIN bytes
() All Non-secure — TrustZone is optional decoration
() PIN in Non-secure flash is fine with TLS
::: explanation
Minimal-vault rule: guard secrets and their checkers, exile everything replaceable, narrow the gates to yes/no answers. "Everything Secure" fails auditability — the mark rewards restraint.
:::

::: quiz Reports stop; display and sensing continue. Give the isolation sequence and the evidence each step yields.
() Rewrite the radio driver immediately
(*) Halve the path: sensor/tasks alive (display proves) ⇒ suspect radio/broker/credentials/veneers; check fault registers (SecureFault?), link/reception, broker logs, credential validity — each check eliminates a half with witness evidence, never guesses
() Reboot until it works; document nothing
() Blame the cloud provider in the report
::: explanation
Binary search with witnesses: display-alive eliminates three suspects at once; registers and logs eliminate the rest one by one. Method beats memory — viva rewards the sequence, not the lucky guess.
:::

::: quiz Battery claim "2 years" with no math: what proof does the rubric demand?
() Trust the ULP logo — marketing suffices
(*) Duty-cycle $I_{avg}$ computation (active + sleep terms), measured sleep current, battery capacity ÷ $I_{avg}$ ≥ claimed life, plus stated assumptions (temperature, self-discharge, radio retries) — claims without division are wishes
() Bigger battery retrofitted at demo
() Claims need no evidence in projects
::: explanation
Power stories are arithmetic with witnesses: formula, measurement, capacity, margin. The M2.02 law returns at project scale — quote all four or the claim is decoration.
:::
