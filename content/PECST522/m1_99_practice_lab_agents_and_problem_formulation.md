---
id: m1_99_practice_lab_agents_and_problem_formulation
courseCode: PECST522
module: 1
sequence: 99
title: 'Module 1 Practice Lab: AI Foundations, PEAS & Environment Matrix'
difficulty: intermediate
estimatedMinutes: 9
learningObjectives:
  - Specify spam filters, chatbots and farm bots with PEAS
  - Classify medical and Pac-Man environments on the matrix
  - Separate rational agents from omniscient ones exactly
concepts:
  - PEAS specification drills
  - environment matrix
  - rationality verdicts
prerequisites:
  - m1_02_agents_and_environments_peas
  - m1_03_concept_of_rationality
  - m1_04_nature_of_task_environments
examRelevance: high
tags:
  - agents
  - m1-lab
---
# Module 1 Practice Lab: AI Foundations, PEAS & Environment Matrix

**Problem: turn Module 1 theory into exam-ready classification skill. By the end you can PEAS-specify new systems, classify environments on all seven dimensions, and defend rationality verdicts.**

<a id="start-zero"></a>
## 1. Start From Zero: The Four-Step Analysis Habit

**Problem first:** exam scenarios mix definitions, PEAS, rationality, and environments in one paragraph. **Method:** run four steps in order.

::: callout-intuition How to Analyze AI and Agent Scenarios
Step 1: Matrix — internal thought or external action? Human mimicry or rational optimum? Step 2: PEAS — win condition, sandbox, changers, readers. Step 3: Rationality — best expected call on percepts available then? Step 4: Seven dimensions — observability, agents, determinism, horizon, time, space, rulebook. Drop the mnemonic after use; the steps are the skill.
:::

**Tiny beginner drill:** a spam filter. Matrix: acting rationally (scores probabilities, never chats). PEAS: performance (accuracy, low false positives); environment (mail stream); actuators (folder moves/tags); sensors (text stream). Rationality: judged on odds available then, not on one missed phish. Environment: partially observable, single-agent, stochastic, episodic, static, discrete, known.

::: toggle How do I write a PEAS specification from scratch?
Four slots in order: Performance (how winning is measured — accuracy, yield, safety margins). Environment (the world acted upon — mail stream, field, maze). Actuators (how the agent changes it — folder moves, nozzles, wheels). Sensors (how it perceives — text, probes, cameras). Tiny check on the spam filter above: every slot filled with concrete nouns, no slot borrowed from another (sensors read, actuators write — swapping them is the classic error).
:::

::: toggle How do I classify on all seven environment dimensions?
Ask in fixed order: Observable? (fully/partially — what is hidden). Agents? (single/multi — who else acts). Deterministic? (same action, same outcome — else stochastic). Episodic? (decisions independent — else sequential). Static? (world waits while deciding — else dynamic/semidynamic). Discrete? (finite distinct states — else continuous). Known? (rules known — else unknown). Pac-Man decoded: visible maze (fully observable) with ghosts (multi-agent) on fixed rules (known, deterministic-if-fixed) where pellets shape futures (sequential) in real-time (dynamic) on a grid (discrete).
:::

<a id="basics"></a>
## 2. Basic Layer: Five Worked Scenarios

**Data/state then goal then method applied per scenario:**

**Scenario 1 — Email spam filter:** calculates spam probability from word frequencies. Classification: acting rationally. Sensors: message text; actuators: folder/database tags.

**Scenario 2 — Chatbot contest (fool 30% of interrogators with typos and delays):** acting humanly (Turing Test approach) — judged on indistinguishability, not correctness.

**Scenario 3 — Orchard irrigation bot (soil under 20% triggers drip):** PEAS: performance (yield up, water down, disease down); environment (field, soil, weather, pests); actuators (wheels, nozzles, dispensers); sensors (moisture probes, multispectral cameras, temperature, GPS — Global Positioning System).

**Scenario 4 — MRI analyzer (one patient, then the next independently):** episodic (patient A never affects B), static (file frozen during inference), single-agent, partially observable (scan hints at hidden biology).

**Scenario 5 — Pac-Man vs. ghosts:** fully observable (maze visible), multi-agent (ghosts), deterministic under fixed ghost rules (note: commercial versions add randomness — qualify by implementation), sequential (pellets shape futures), dynamic in real-time play (board changes while thinking) or static in paused turn mode, discrete (grid), known (fixed rules).

<a id="formal-model"></a>
## 3. Formal Layer: Do-Not-Confuse Table

| Pair | Exam distinction |
|---|---|
| Agent function vs. program | Abstract `f: P* -> A` vs. executable code on hardware with limits |
| Rational vs. omniscient | Best expected call on limited info vs. foreknowledge of actual future |
| Fully observable vs. known | Seeing the state vs. knowing the rules (poker: known yet partially observable) |
| Static vs. episodic | Time (world waits?) vs. memory (decisions independent?) |
| Stochastic vs. non-deterministic | Known odds vs. unknown odds |
| Continuous vs. discrete | Real-valued steering/speeds vs. countable squares/turns |

::: callout-pitfall Exam Traps Ahead
Scrabble with no timer is static (board waits, score frozen) — sequential is a different dimension (memory), not a time answer. Thermostat relay is the actuator; thermometer is the sensor; power bill is performance. Sort slots by role, not by nouns.
:::

**Limitations of lab drills:** toy classifications assume textbook implementations; real Pac-Man randomness, live medical drift, and shifting spam tactics each move one dimension — always state assumptions in answers.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz If a company builds an AI system designed specifically to pass the Turing Test, which quadrant of the Russell & Norvig AI matrix are they targeting?
() Thinking Rationally
() Acting Rationally
(*) Acting Humanly
() Thinking Humanly
::: explanation
The Turing Test grades external indistinguishability from humans, which is exactly the Acting Humanly quadrant.
:::

::: quiz You are designing a PEAS framework for a Smart Thermostat in an IoT home. Which of the following represents its Actuator?
() The digital thermometer measuring ambient temperature.
() The resident walking into the living room.
(*) The electronic relay switch that turns the HVAC heating furnace on and off.
() Minimizing monthly electric utility costs.
::: explanation
The relay changes world temperature (actuation). The thermometer senses, the resident is environment, and cost is performance (HVAC: Heating, Ventilation and Air Conditioning; IoT: Internet of Things).
:::

::: quiz You are building an AI to play a digital version of Scrabble against a human opponent without any game timer. How is the time dimension classified?
() Dynamic
() Semi-dynamic
(*) Static
() Sequential
::: explanation
No timer means the board waits and the score never decays during thought — static. Sequential answers a different (memory) dimension.
:::

::: quiz Why is autonomous taxi driving considered a "Continuous" rather than a "Discrete" environment?
() Because the car never stops driving.
() Because the car must continuously learn new routes.
(*) Because the inputs and actions (speed, steering wheel angle, acceleration) can take on infinite real-valued numbers.
() Because the environment is fully observable.
::: explanation
Continuity is about real-valued state/action granularity (14.5 degrees, 45.2 km/h), not about driving duration or learning.
:::

<a id="exam-focus"></a>
## 5. Exam Recap and Worked Q&A

::: callout-exam Exam Strategy
Use tables for PEAS and numbered dimensions for environments. Always justify each cell in one line; bare labels earn partial credit only.
:::

**Recap facts examiners reward:** four-step habit; PEAS slot tests (changer vs. reader vs. judge); seven dimensions with one-line justifications; rationality-at-decision-time rule.

### Essay Question 1 (7 Marks)
**Q: Classify a time-extended medical diagnosis system on all seven dimensions.**

**Model Answer:** Partially observable (indirect tests, hidden biology); single-agent (body treated as environment); stochastic (variable drug response); sequential (today's dose shapes tomorrow); dynamic (patient changes during thought); continuous (vitals on real scales); known (documented medicine, unknown only when novel disease — qualify).

### Essay Question 2 (7 Marks)
**Q: Distinguish rationality from omniscience. Must rational agents succeed? What is autonomy?**

**Model Answer:** Rationality maximizes expected performance on history; omniscience foreknows actual outcomes (impossible). Rationality does not guarantee success under uncertainty. Autonomy grounds behavior in own experience so agents survive broken designer priors.
:::
