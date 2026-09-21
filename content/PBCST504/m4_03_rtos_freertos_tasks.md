---
id: m4_03_rtos_freertos_tasks
courseCode: PBCST504
module: 4
sequence: 3
title: 'RTOS, FreeRTOS & Task Scheduling'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State what an RTOS guarantees in plain words first
  - Split firmware into FreeRTOS tasks cleanly
  - Read a schedule for starvation and priority inversion
concepts:
  - RTOS guarantees
  - FreeRTOS tasks
  - scheduling and starvation
prerequisites:
  - m4_02_wireless_gsm_ble_lora_security
examRelevance: high
tags:
  - rtos
  - freertos-tasks
---
# RTOS, FreeRTOS & Task Scheduling

**What problem juggling many deadlines poses for one super-loop, what a Real-Time Operating System (RTOS) guarantees instead, how FreeRTOS tasks split the work, and how scheduling, starvation, and priority inversion read on a timeline.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Firmware must blink LEDs, read sensors, serve radio, and log data — all "at once," with the brake deadline never missed because the display was busy. The problem: a super-loop's timing is the sum of everything before each job (adding display code delays braking). An RTOS runs each job as a task with priorities: urgent work preempts (interrupts) the casual, deterministically.

Tiny beginner example. Tasks: brake (priority 3, every 5 ms), sensor (priority 2, every 100 ms), display (priority 1, when free). Display mid-draw is preempted by sensor, which is preempted by brake — each meets its deadline because priority, not code order, decides.

Analogy as support, then dropped. Think of an emergency room: triage tags (priorities) pull doctors off routine checks the instant trauma arrives; nobody reschedules by arrival order. From here on we use exact terms only: task, preemption, tick, starvation.

Abbreviations defined on first use: Real-Time Operating System (RTOS), Time-To-Deadline discipline (scheduling policy). Symbols: priorities as numbers (higher = more urgent, FreeRTOS convention).

| Question to ask | Meaning |
|---|---|
| What is a task? | An independent thread with its own stack, sharing one CPU by scheduler decision |
| What is preemption? | Higher-priority readiness suspending lower work mid-execution, resumed later |
| What is the tick? | The periodic interrupt (e.g. 1 kHz) driving time-slicing and delays |

<a id="words-first"></a>
## 2. Words First — RTOS Vocabulary

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Super-loop vs RTOS** | One `while(1)` doing all jobs in turn (timing = code order) vs scheduler running priority-ordered tasks (timing = urgency). |
| **Task states (Ready/Running/Blocked)** | Ready (wants CPU), Running (has it), Blocked (waits on delay/queue/semaphore) — Blocked tasks consume zero CPU. |
| **FreeRTOS `xTaskCreate`** | Spawns a task: function + name + stack words + priority + handle — stack sized per task's worst nesting (M1.05 returns!). |
| **Scheduler (preemptive)** | Always runs the highest-priority Ready task; equal priorities time-slice on ticks. Determinism is the product. |
| **Starvation / priority inversion** | Low task never runs (starvation); medium task delays high task stuck on low task's lock (inversion — mutex inheritance cures it). |

::: callout-intuition Core Mental Model: Triage Tags
Every job wears a triage tag (priority). The scheduler-doctor always treats the worst tag waiting; routine cases pause mid-stitch when trauma arrives (preemption) and resume after. Starvation is a forgotten waiting room; inversion is a nurse blocking the surgeon over a shared cabinet (lock) — labelled, watchable, curable.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Guarantees and Timelines

**RTOS guarantees (the examinable four):** (1) bounded preemption latency (urgent Ready→Running within microseconds, not loop-length); (2) priority-ordered execution always; (3) blocking without spinning (delayed/queued tasks sleep, saving power per M2.02); (4) inter-task communication without corruption (queues/semaphores, M4.04). An RTOS never makes code faster — it makes timing predictable, which is what deadlines buy.

**Reading a schedule (worked pattern):** timeline with tasks H(3), M(2), L(1); L runs, M readies → preempts L; H readies → preempts M; H blocks on delay → M resumes; M blocks → L resumes. Starvation check: L's total share vs its minimum — raise L, add aging, or cap H/M bursts. Inversion check: H waits on a mutex L holds while M runs — cure is priority inheritance (L briefly inherits H's priority) or lock-free design.

**FreeRTOS minimal shapes:**

```c
xTaskCreate(vBrake, "brake", 256, NULL, 3, NULL);  /* function, name, stack words, arg, priority, handle */
vTaskStartScheduler();                             /* never returns; scheduler owns the CPU now */
```

Stack words per task cover its call depth + ISRs nesting into it — undersized task stacks overflow exactly like M1.05's single stack, per task.

::: callout-formula KTU Formula Vault: RTOS Facts
RTOS = predictable timing, not speed · tasks have stacks + priorities · scheduler runs highest Ready · Blocked = zero CPU · starvation (forgotten low) vs inversion (medium blocks high-via-low) ⇒ inheritance/lock-free · stack per task, sized for worst nesting.
:::

::: callout-pitfall Priority Negotiations
"Just raise everything to max" collapses to a super-loop with overhead — priorities are relative contracts, and every max-priority task starves the rest equally. Design the ladder, don't inflate it.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Tasks: keypad scan P1/50 ms, LCD refresh P1/200 ms, radio TX P2/1 s, emergency stop P3/event. (a) Who preempts whom? (b) LCD starves — two cures? (c) Stop shares a buffer with LCD via mutex; radio (P2) runs long — name the hazard and cure.
:::

::: step [Step 2: Execution] Ladders and Hazards
(a) Stop preempts all; radio preempts keypad/LCD; keypad/LCD time-slice between themselves. (b) Raise LCD, or bound radio bursts / add aging — starvation is share arithmetic. (c) Priority inversion: radio delays stop via LCD's lock — cure: mutex priority inheritance (LCD inherits P3 while holding) or lock-free buffer.
:::

::: step [Step 3: Conclusion] Final Result
Preemption follows numbers; starvation follows shares; inversion follows locks — three timeline readings, each with its named cure.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Stuffing all work in the highest task. Priority without decomposition is a super-loop wearing scheduler clothes.
- Blocking on bare flags with polling. `vTaskDelay`/queues block properly (zero CPU + power); spin-waits burn both.
- Ignoring per-task stacks. Each task needs worst-case stack; one overflow corrupts its neighbour task's memory.

Exam recap: four RTOS guarantees; Ready/Running/Blocked; xTaskCreate fields; preemption timeline reading; starvation vs inversion with cures; stacks per task.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Super-loop adds a display routine; braking occasionally misses its 5 ms deadline. Why does an RTOS fix this structurally, not just by speed?
() RTOS runs code faster than loops
(*) Loop timing = sum of all code before each job (display delays brake); RTOS preempts by priority (brake P3 interrupts display P1), bounding brake latency regardless of display length — determinism by ladder, not Megahertz
() RTOS removes the display routine automatically
() Deadlines don't apply to loops by definition
::: explanation
Name the sums: loop latency couples every job to every other; scheduler latency couples each job only to higher priorities. Structure, not speed, is the fix — quote both sums.
:::

::: quiz High task waits on a mutex held by low task while medium task computes for 100 ms. Name the hazard, the timeline effect, and the standard cure.
() Starvation — raise the medium task higher
(*) Priority inversion: high (P3) blocked on low (P1) while medium (P2) runs — effective priority inverts to P1's level for 100 ms. Cure: mutex priority inheritance (low inherits P3 till release) or lock-free sharing
() Deadlock — reboot the scheduler
() No hazard; medium always yields politely
::: explanation
Inversion needs three rungs: waiter, holder, and middle spoiler. Inheritance lends the waiter’s urgency to the holder — the textbook one-line cure with its exact trigger named.
:::

::: quiz Task crashes corrupting its neighbour's variables. Which RTOS resource was undersized and how is it sized?
() Heap too small — enlarge globally
(*) The task's own stack (call depth + ISR nesting + locals) overflowed into adjacent task memory; size per task for worst-case nesting (measure high-water mark via stack watermark APIs, then add margin) — M1.05 stacking, per task
() Priority too low corrupts memory
() Tick rate too high overflows stacks
::: explanation
Stacks are per-task M1.05 instances: grows-down, SP-tracked, overflow-eats-neighbours. Watermark measurement plus margin is the professional sizing ritual — quote it, don't guess bytes.
:::
