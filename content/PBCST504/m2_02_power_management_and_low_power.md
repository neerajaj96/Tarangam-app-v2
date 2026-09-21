---
id: m2_02_power_management_and_low_power
courseCode: PBCST504
module: 2
sequence: 2
title: 'Power Management & Low-Power Modes'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State why sleep current matters more than MHz in plain words first
  - Order STM32 sleep depths by savings and wake cost
  - Use low-power libraries without fighting the hardware
concepts:
  - low-power modes
  - sleep current
  - low-power libraries
prerequisites:
  - m2_01_stm32_family_and_u575
examRelevance: high
tags:
  - low-power
  - power-modes
---
# Power Management & Low-Power Modes

**What problem battery life poses for always-on sensing, what current numbers decide it, how STM32 sleep depths trade savings against wake-up cost, and how low-power libraries package the hardware correctly.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A door sensor must live two years on a coin cell yet answer instantly when the door opens. The problem: running at full speed drains the cell in days; sleeping deeply risks missing the event. Power management is the art of being almost-dead yet instantly-wakeable — sleep 99.9% of the time, sprint 0.1%.

Tiny beginner example. Active current 10 mA, deep-sleep current 1 µA (microamp), awake 1 second per hour. Average ≈ (10 mA × 1 + 0.001 mA × 3599)/3600 ≈ 0.0038 mA — the cell lasts years because sleep dominates the average, not because active sipping was optimised.

Analogy as support, then dropped. Think of a night guard: dozing in the chair (sleep, ears open for the alarm wire) versus patrolling (active, torch on). The wire (wake-up source) matters more than the doze depth. From here on we use exact terms only: Run/Sleep/Stop/Standby/Shutdown, wake-up source, average current.

Abbreviations defined on first use: Microamp (µA), Real-Time Clock (RTC), Low-Power (LP). Symbols: mA/µA/nA (milli/micro/nanoamp).

| Question to ask | Meaning |
|---|---|
| What dominates battery? | Sleep current × sleep time (the 99.9%, not the sprint) |
| What is a wake-up source? | The peripheral allowed to interrupt sleep (pin, RTC, radio) |
| What do LP libraries give? | Correct register sequences for entering/exiting each depth |

<a id="words-first"></a>
## 2. Words First — Sleep Ladder

| Mode (deeper downward) | What stays alive | Plain meaning |
|---|---|---|
| **Run / Sleep** | CPU paused, peripherals on | Lightest doze; any interrupt wakes instantly; microamps-to-milliamp savings only |
| **Stop** | RAM kept, most clocks off | Deep sleep; wake on pin/RTC/comm; tens-of-microamps territory |
| **Standby** | Minimal retention, RTC optional | Near-off; wake resets much state; sub-microamp |
| **Shutdown** | Almost nothing (wake pins + reset) | Deepest; nanoamps; wake is near-reboot |
| **LP libraries (e.g. ULP helpers)** | Tested sequences | Enter-mode, configure wake sources, restore clocks on exit — packaging, not magic |

::: callout-intuition Core Mental Model: Guard's Doze Depths
Chair-doze (Sleep) hears everything but rests little; bunk-sleep with alarm wire (Stop) rests deeply yet wakes on the wire; off-duty (Standby/Shutdown) needs a shake (reset-like wake). Pick the deepest doze whose wire still reaches the event — depth without a wire is just being absent.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Average Current and Wake Contracts

**The only formula that matters:** $I_{avg} = (I_{active}T_{active} + I_{sleep}T_{sleep})/(T_{active}+T_{sleep})$. Meaning: charge spent awake plus charge spent asleep, over total time. Variables: $I$ currents, $T$ durations. Intuition: with 0.1% duty cycle, sleep current sets the answer — halving active current barely moves $I_{avg}$; halving sleep current nearly halves it. Worked above: 10 mA × 1 s vs 1 µA × 3599 s gives ≈ 3.8 µA average. Exam move: always compute both terms before declaring a winner.

**Wake contracts per depth:** lighter modes keep clocks and RAM (fast wake, state intact); Stop keeps RAM but kills most clocks (re-init clocks on exit — LP libraries do this); Standby/Shutdown lose most state (design wake as re-entry, save essentials in backup registers/RTC domain first). Peripherals as wake sources must be explicitly enabled pre-sleep; a sleeping UART (Universal Asynchronous Receiver-Transmitter) receives nothing unless its clock stays on — the classic "slept through the message" bug.

**LP libraries honestly:** they sequence regulator scaling, clock gating, mode entry, and wake restore — the exact order the reference manual demands. They cannot choose your wake source or duty cycle; architecture still decides, libraries only execute.

::: callout-formula KTU Formula Vault: Power Facts
$I_{avg}$ = charge-weighted mean (sleep term usually dominates) · deeper = cheaper sleep + costlier wake + less retention · wake sources enabled pre-sleep · Stop keeps RAM, Standby/Shutdown ~reboot · libraries sequence, architects decide.
:::

::: callout-pitfall Megahertz Myopia
Optimising active MHz while sleeping at milliamps loses to a slower chip sleeping at nanoamps — the average-current formula punishes the 99.9%, not the sprint. Quote duty cycle before clock speed in every power answer.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Sensor wakes 2 s hourly at 8 mA, sleeps otherwise at 2 µA. (a) Compute $I_{avg}$. (b) A rival chip halves active current but sleeps at 200 µA. Which wins, by what margin?
:::

::: step [Step 2: Execution] Charge-Weighted Means
(a) $(8×2 + 0.002×3598)/3600 = (16 + 7.196)/3600 ≈ 6.44$ µA. (b) Rival: $(4×2 + 0.2×3598)/3600 = (8 + 719.6)/3600 ≈ 202$ µA — loses by ~31×. Sleep current dominates; active halving is invisible next to 100× worse sleep. (Arithmetic verified.)
:::

::: step [Step 3: Conclusion] Final Result
6.4 µA vs 202 µA: the "efficient active" chip is thirty times worse. Battery answers are sleep answers wearing duty-cycle clothes.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Comparing chips by active current alone. Without duty cycle and sleep current the comparison is meaningless.
- Sleeping without enabling wake sources. Deep sleep with no wire is a brick until reset.
- Expecting Standby wake to resume seamlessly. Design wake as controlled re-entry with saved essentials.

Exam recap: $I_{avg}$ formula both terms; sleep ladder with retention per rung; wake-source enabling; Stop-vs-Standby state contracts; libraries sequence, duty cycle decides.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Node A: 20 mA active, 0.5 µA sleep. Node B: 5 mA active, 50 µA sleep. Duty cycle 0.1% awake in both. Which battery lasts longer and what general rule does this prove?
() B — lower active current always wins
(*) A: A ≈ (20×3.6 + 0.0005×3596.4)/3600 ≈ 20.5 µA vs B ≈ (5×3.6 + 0.05×3596.4)/3600 ≈ 55 µA — sleep current dominates at low duty cycles, so optimise the 99.9% first
() Tie — active and sleep trade exactly
() Neither; duty cycle is irrelevant
::: explanation
Charge-weight both terms every time: A's 4× worse active vanishes against 100× better sleep. "Optimise sleep first" is the rule; the arithmetic is the proof.
:::

::: quiz Firmware enters Stop mode but the RTC alarm never wakes it. Name the two most likely causes in order.
() Chip is broken; replace hardware
(*) (1) RTC not enabled/configured as a wake-up source before entering Stop; (2) clocks the RTC needs were gated off. Sleep obeys wiring: unwired events never arrive, however deep the doze
() Stop mode forbids all wake-ups by definition
() LP libraries cannot wake any chip ever
::: explanation
Wake is a contract signed before sleeping: enable the source, keep its clock. Debugging sleep starts at the wire, never at the depth.
:::

::: quiz What do low-power libraries actually provide, and what decision must the architect still make?
() Libraries invent lower currents than silicon allows
(*) Libraries package the exact enter/configure-wake/restore-clock register sequences per the manual; the architect still chooses duty cycle, sleep depth, and wake sources — execution versus decisions
() Libraries replace the reference manual entirely
() Architects are unnecessary once libraries exist
::: explanation
Split the work: silicon sets possibilities, architect picks the operating point, library executes the sequence flawlessly. Credit each layer correctly and power answers write themselves.
:::
