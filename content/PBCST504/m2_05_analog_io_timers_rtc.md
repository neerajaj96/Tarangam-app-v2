---
id: m2_05_analog_io_timers_rtc
courseCode: PBCST504
module: 2
sequence: 5
title: 'Analog I/O, Timers & RTC'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State what ADC resolution really buys in plain words first
  - Chain sensor, ADC, timer, and DAC into waveform thinking
  - Use interrupts and RTC for time without busy-waiting
concepts:
  - ADC resolution
  - DAC waveform
  - timer PWM and RTC
prerequisites:
  - m2_04_displays_keypad_relay
examRelevance: high
tags:
  - adc-dac
  - timers-rtc
---
# Analog I/O, Timers & RTC

**What problem continuous real-world signals pose for digital chips, how Analog-to-Digital Converter (ADC) resolution prices precision, how sensors (potentiometer, temperature, Light-Dependent Resistor (LDR), microphone) feed it, how Digital-to-Analog Converter (DAC) plus timers synthesise waveforms and audio, and how interrupts, counters, and the Real-Time Clock (RTC) keep time.**

<a id="the-problem"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

Temperature is smooth; chips count in steps. The problem: convert smooth voltages to numbers (ADC), numbers back to smooth waves (DAC), and measure time without staring at the clock (timers/RTC/interrupts). A weather node reads heat, stamps the hour, and beeps a tune — all five peripherals cooperating.

Tiny beginner example. Potentiometer knob at mid-travel feeds 1.65 V into a 12-bit ADC with 3.3 V reference: code = 1.65/3.3 × 4095 ≈ 2047. Half voltage, half scale — resolution turns volts into counts linearly.

Analogy as support, then dropped. Think of a staircase next to a ramp: ADC counts which stair matches the ramp height (more stairs = finer match); DAC rebuilds a ramp from stair instructions; timers are metronomes. From here on we use exact terms only: resolution, reference, sampling, Pulse-Width Modulation (PWM).

Abbreviations defined on first use: Analog-to-Digital Converter (ADC), Digital-to-Analog Converter (DAC), Light-Dependent Resistor (LDR), Real-Time Clock (RTC), Pulse-Width Modulation (PWM). Symbols: $V_{ref}$ reference volts, $N$ bits, LSB step $= V_{ref}/2^N$.

| Question to ask | Meaning |
|---|---|
| What does 12-bit buy? | 4096 steps; step ≈ 0.8 mV at 3.3 V |
| What is sampling? | Freezing the voltage at clocked instants, then converting |
| What is PWM? | Fixed-frequency square wave whose duty share carries analog meaning |

<a id="words-first"></a>
## 2. Words First — Analog Vocabulary

| Device (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Potentiometer / temperature sensor / LDR / microphone** | Voltage sources for position, heat, light, sound — each needs scaling to 0–$V_{ref}$ before the ADC |
| **ADC + sample time** | Converter plus the acquisition pause letting the internal capacitor charge — shortchanging it smears readings |
| **DAC + waveform/audio** | Number stream out as stepped volts; timers pace the stream (sine tables for tones, envelopes for beeps) |
| **Timer/counter + interrupt** | Counter ticks on a clock; compare-match fires an Interrupt Service Routine (ISR) — timekeeping without polling |
| **RTC + backup domain** | Calendar clock running in sleep/Standby on a coin cell — timestamps survive power modes |

::: callout-intuition Core Mental Model: Stairs, Metronome, Diary
ADC builds stairs beside the ramp and reports the nearest stair number. The metronome (timer) decides when to look and when to output the next DAC stair. The diary (RTC) dates every entry even while the household sleeps. Precision lives in stair count, rhythm in the metronome, memory in the diary.
:::

<a id="formal-theory"></a>
## 3. Formal Theory — Steps, Duties, Wakeups

**Resolution math (symbol by symbol):** code $= V_{in}/V_{ref} × (2^N − 1)$. Here $V_{in}$ is the scaled sensor volts, $V_{ref}$ the ruler length, $N$ the bit count. LSB $= V_{ref}/2^N$ is the smallest visible change (≈0.8 mV at 12-bit/3.3 V). Doubling bits halves the step but also halves the tolerable noise — 12 honest bits beat 16 noisy ones. Sensor scaling first: divide/amp each source into 0–$V_{ref}$, never beyond (overvoltage damages, under-range wastes steps).

**PWM thinking:** duty $= T_{on}/(T_{on}+T_{off})$; average volts $=$ duty $× V_{cc}$. LED dimming, motor speed, and servo angles all read duty, not frequency — frequency just must exceed flicker/inertia perception. DAC + timer-DMA plays true waveforms (audio tones from sine tables); PWM + filter fakes slow analog cheaply.

**Timers, interrupts, RTC (numbered practice):** (1) set prescaler + auto-reload for the wanted period; (2) enable compare-match interrupt, keep the ISR tiny (flag, not work); (3) counters count external events (pulses) where timers count clock ticks; (4) RTC alarms wake low-power modes (M2.02's wire!) with calendar stamps. Busy-waiting where an ISR/RTC fits is the viva-flagged sin.

::: callout-formula KTU Formula Vault: Analog Facts
code $= V_{in}/V_{ref}×(2^N−1)$ · LSB $= V_{ref}/2^N$ · scale sensors into range first · PWM average = duty × $V_{cc}$ · timers tick clocks, counters count events · ISR flags, main works · RTC dates through sleep.
:::

::: callout-pitfall Resolution Worship
More bits without quieter wiring just digitise noise finely. Reference stability, grounding, and sample time decide honest bits — quote the signal chain before the datasheet's $N$.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
12-bit ADC, $V_{ref} = 3.3$ V. Temperature sensor outputs 10 mV/°C, reading 0.75 V. (a) Temperature? (b) ADC code and LSB? (c) PWM at 25% duty on 3.3 V logic: average volts?
:::

::: step [Step 2: Execution] Converting Thrice
(a) $0.75/0.01 = 75$°C. (b) LSB $= 3.3/4096 ≈ 0.806$ mV; code $= 0.75/3.3 × 4095 ≈ 931$. (c) $0.25 × 3.3 = 0.825$ V average. (Arithmetic verified.)
:::

::: step [Step 3: Conclusion] Final Result
Sensor scaling (mV/°C) → codes (LSB math) → actuator meaning (duty average): the full sense-decide-drive chain in three divisions.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Feeding 5 V sensors directly. Anything above $V_{ref}$ (often above supply+diode) damages — divide first.
- Starving sample time on high-impedance sources (LDR dividers). The sampling capacitor needs its pause, or channels smear into each other.
- Fat ISRs. Long interrupt work jitters everything below its priority — flag and exit.

Exam recap: code/LSB formulas; scale-then-convert order; PWM duty averaging; timer vs counter vs RTC roles; ISR discipline; RTC as low-power wake wire.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz 10-bit ADC, Vref 5 V, input 2.5 V from a potentiometer. Code and LSB? What breaks if the pot wiper momentarily shorts to 9 V?
() Code 2048, LSB 9 mV; nothing breaks
(*) LSB $= 5/1024 ≈ 4.88$ mV; code $= 2.5/5 × 1023 ≈ 511$; the 9 V excursion overvoltages the pin (above supply) risking latch-up/damage — dividers and clamps exist for exactly this moment
() Code 1023 always; ADCs saturate safely at any volts
() LSB is independent of Vref
::: explanation
Ruler math first (LSB, then code), survival second: the ruler's length is also its limit. Overvoltage is a hardware injury, not a wrong reading — protection belongs in the schematic, not the code.
:::

::: quiz Servo needs 1.5 ms pulses every 20 ms; LED needs dimming; audio needs a 440 Hz tone. Assign PWM / PWM / DAC-timer and justify each.
() DAC for all — true analog everywhere
(*) Servo: PWM (duty encodes angle, 1.5/20 = 7.5%); LED: PWM (duty encodes brightness, frequency above flicker); audio: DAC + timer-paced sine table (true waveform at 440 Hz — PWM-plus-filter is too crude for clean tone)
() Timers cannot make sound by design
() Servos read frequency, not duty
::: explanation
Match mechanism to meaning: duty-carries for servo/LED, true-waveform for audio. Frequency is the carrier, duty (or samples) the message — never invert them.
:::

::: quiz Hourly temperature log must survive the night on battery with timestamps. Which peripherals, and why no busy-wait?
() Poll the sensor all night — simplest is best
(*) RTC alarm wakes from Stop hourly (the low-power wire) with calendar stamps; ADC converts on wake; ISR flags, main logs; busy-waiting would burn the battery holding the CPU for nothing
() RTC cannot wake sleeping chips
() Timestamps need internet, not RTC
::: explanation
Sleep-then-stamp is the architecture: RTC dates, alarm wakes, ADC measures, ISR defers. Every busy-waited hour is battery thrown away — the viva answer names the wire (RTC alarm) first.
:::
