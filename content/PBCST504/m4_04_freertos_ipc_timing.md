---
id: m4_04_freertos_ipc_timing
courseCode: PBCST504
module: 4
sequence: 4
title: 'FreeRTOS Timing, Queues & Semaphores'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what each IPC primitive forbids in plain words first
  - Move data with queues and guard hardware with mutexes
  - Time behaviour with delays and software timers
concepts:
  - queues
  - mutex and semaphore
  - delays and timers
prerequisites:
  - m4_03_rtos_freertos_tasks
examRelevance: high
tags:
  - freertos-ipc
  - queues-semaphores
---
# FreeRTOS Timing, Queues & Semaphores

**What problem tasks sharing data and hardware pose, how queues move bytes safely, how mutexes and counting semaphores guard and signal, and how delays plus software timers schedule time without spinning.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

The sensor task fills a buffer the radio task empties; both print through one UART; the display must update every 200 ms exactly. The problem: shared data races, shared hardware garbles, and "every 200 ms" drifts when built on `HAL_Delay`. Answers: queues (safe handoff), mutexes (one-at-a-time hardware), semaphores (event counting), delays/timers (scheduler-grade time).

Tiny beginner example. Sensor `xQueueSend(q, &temp)`; radio `xQueueReceive(q, &temp)` blocks till data arrives — zero CPU while waiting, zero corruption ever, sender never knowing the receiver.

Analogy as support, then dropped. Think of a post room: pigeonholes (queues) hold letters between staff; the printer room key (mutex) admits one; a bell counter (semaphore) rings per parcel; wall clock chimes (timers) pace the day. From here on we use exact terms only: queue depth, holder, give/take.

Abbreviations defined on first use: Inter-Process Communication (IPC), First-In-First-Out (FIFO). Symbols: ticks (scheduler time units), `portMAX_DELAY` (wait forever).

| Question to ask | Meaning |
|---|---|
| Queue vs global? | Queue copies under scheduler protection; bare globals race between preemptions |
| Mutex vs binary semaphore? | Mutex = owned lock with inheritance (M4.03 cure); binary semaphore = ownerless flag (ISR-safe signalling) |
| Delay vs timer? | Delay sleeps one task; timer callback fires for the system on schedule |

<a id="words-first"></a>
## 2. Words First — IPC Vocabulary

| Primitive (abbreviation expanded on first use) | Use it for | Plain meaning |
|---|---|---|
| **Queue (`xQueueCreate` depth×size)** | Task-to-task data | FIFO mailbox: send copies in, receive copies out, full/empty block with timeouts |
| **Mutex (`xSemaphoreCreateMutex`)** | Shared hardware | Owned key: take before UART/flash use, give after; inheritance defeats inversion |
| **Binary semaphore** | ISR→task events | Ownerless flag: ISR gives, task takes and blocks till then — never take in ISR, never hold like a lock |
| **Counting semaphore** | Resource pools / event counts | N identical slots or N pending events; take decrements, give increments |
| **`vTaskDelay` / software timers** | Pacing | Delay sleeps the caller till tick X (`...Until` variant kills drift); timer callbacks run on schedule, kept tiny |

::: callout-intuition Core Mental Model: Post Room Rules
Letters (data) travel only by pigeonhole (queue) — never hand-carried across preemptions. The printer key (mutex) has one holder with inheritance manners. The bell (semaphore) counts parcels, rung even by interrupt hands. The wall clock (timers) chimes; nobody watches sandglasses (busy-waits).
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Ownership and Time

**Ownership rules (exam-grade):** mutexes are taken and given by the same task (ownership + inheritance); binary semaphores are given from ISRs (`...FromISR` forms) and taken by tasks (no ownership, no inheritance — hence never guard hardware with one, or inversion returns unopposed). Counting semaphores guard pools (three DMA channels) or count events (ten button presses = ten takes). Wrong-primitive bugs: mutex-from-ISR (illegal), semaphore-guarded UART (garble under inversion), queue of pointers to task stacks (dangling on return — copy values or use static pools).

**Timing without drift:** `vTaskDelay(200)` sleeps 200 ticks from *now* (drifts under jitter); `vTaskDelayUntil(&last, 200)` sleeps till *last+200* (self-correcting period). Software timers: one-shot (doorbell) vs auto-reload (heartbeat); callbacks must never block (they run in timer service context). "Every 200 ms exactly" is Until-or-timer, never Delay.

**Queue sizing honesty:** depth × item size = RAM cost; depth 1 + fast consumer = mailbox; matching producer bursts + slow consumer = depth covers the burst or data drops by design (overflow policy: block, overwrite, or drop — chosen, never accidental).

::: callout-formula KTU Formula Vault: IPC Facts
Queues copy safely (depth = burst cover) · mutex owned + inheritance (hardware guard) · binary ownerless (ISR→task signal) · counting pools/counts · Delay drifts, Until corrects, timers chime tiny · never mutex-from-ISR, never pointers-to-stacks in queues.
:::

::: callout-pitfall ISR Overreach
ISRs give semaphores and send to queues (FromISR forms) but never take mutexes or block. A blocking ISR freezes everything below its priority — the fastest way to turn a bell into a wall.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Sensor task (P2) produces 10 temps/s; radio task (P1) sends each; both log via one UART; display updates every 200 ms sharp. (a) Pick primitives for data, UART, pacing. (b) Radio is slow: depth choice? (c) Why must the UART guard be a mutex, not a binary semaphore?
:::

::: step [Step 2: Execution] Post-Room Assignment
(a) Queue (depth ~10+) for temps; mutex for UART; `vTaskDelayUntil(200)` or timer for display. (b) Depth covers burst-vs-drain backlog or apply drop-oldest policy deliberately. (c) Only mutexes carry inheritance — a binary-guarded UART re-invites M4.03's inversion with no cure attached.
:::

::: step [Step 3: Conclusion] Final Result
Data by queue, hardware by mutex, events by semaphore, pace by Until/timer — four primitives, four jobs, zero overlap. Misassignment is the exam's favourite wrong answer.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Queueing stack pointers. The sender's frame vanishes on return — copy values, pool buffers, or regret it.
- `vTaskDelay` for exact periods. Jitter accumulates; Until anchors every period to the last wake.
- Blocking timer callbacks. Service context shared by all timers — one sleeper stalls every chime.

Exam recap: four-primitive job table; ownership + inheritance split; FromISR restrictions; Until-vs-Delay drift math; depth sizing with overflow policy; no-mutex-in-ISR law.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz UART garbles when sensor and radio tasks both print. Guard with mutex or binary semaphore, and why does the other fail?
() Binary semaphore — lighter and faster
(*) Mutex: owned with priority inheritance, so an urgent waiter lends urgency to the holder (M4.03 cure built in); binary semaphores lack ownership/inheritance, so a medium task can still wedge between holder and waiter — inversion returns
() Neither — UARTs serialize themselves
() Disable preemption during prints instead
::: explanation
Guards need ownership: inheritance is the difference, not weight. "Lighter" primitives guarding hardware reintroduce the exact hazard the course just cured — name inheritance in the answer.
:::

::: quiz Display must tick every 200 ms sharp for an hour. vTaskDelay(200) vs vTaskDelayUntil(&last,200) vs software timer — choose and show drift thinking.
() Delay — simplest reads sharpest
(*) Until or timer: Delay sleeps 200 from *now*, so each period's jitter accumulates (drift grows with hours); Until anchors to last wake (self-correcting); timers chime from service context. Sharpness needs anchors, not naps
() All three drift identically by definition
() Sharpness needs faster ticks, not anchors
::: explanation
Drift is cumulative error: nap-based timing stacks jitter, anchored timing sheds it. Quote the accumulation ("jitter × periods") to prove the choice — examiners award the multiplication.
:::

::: quiz ISR must wake a task per button press, bursts of 5 possible. Binary or counting semaphore, and what must the ISR never do?
() Binary — one button, one flag
(*) Counting (depth ≥ burst): 5 rapid presses = 5 counts, none lost; binary would merge the burst into one. ISR uses give-FromISR only — never take, never block, never touch a mutex
() Mutex from ISR — ownership starts at interrupts
() Poll the button in the ISR instead
::: explanation
Count events with counters, signal with flags: bursts decide. And ISR law is prohibitive (no take/block/mutex) — the bell rings, it never holds meetings.
:::
