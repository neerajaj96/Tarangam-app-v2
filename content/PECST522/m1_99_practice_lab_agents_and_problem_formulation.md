---
id: m1_99_practice_lab_agents_and_problem_formulation
courseCode: PECST522
module: 1
sequence: 99
title: 'Module 1 Practice Lab: AI Foundations, PEAS & Environment Matrix'
difficulty: intermediate
estimatedMinutes: 7
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

**Hands-on scenario classification, active recall drills, cheat-sheet comparisons, and university exam outlines.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

::: callout-intuition How to Analyze AI & Agent Scenarios
When dissecting an AI system:
1. **Dimension Matrix:** Is it judged by **internal thought** or **external action**? Is it mimicking **humans** or striving for **rational optimality**?
2. **PEAS Framework:** Identify **[P]**erformance Measure (what defines a win?), **[E]**nvironment (the operational sandbox), **[A]**ctuators (mechanisms to change the world), and **[S]**ensors (inputs).
3. **Rationality Check:** Did the agent make the best statistical choice based *only* on the percept sequence available at that moment?
4. **The 7 Environment Dimensions:** Check Observability, Agent count, Determinism, Horizon (Episodic/Sequential), Time (Static/Dynamic), State Space (Discrete/Continuous), and Rulebook (Known/Unknown).
:::

### Scenario 1: The Email Spam Filter
* **The Setup:** An algorithm sorts incoming emails into "Inbox" or "Spam". It doesn't care how human cognition works, nor does it converse with you. It simply calculates the mathematical probability of an email being spam based on word frequencies.
* **Classification:** **Acting Rationally**
* **Sensors & Actuators:** Sensors = incoming `.eml` text streams; Actuators = moving files to folder / database tags.

### Scenario 2: The Customer Service Chatbot Contest
* **The Setup:** Programmers enter a competition where the winning software tricks 30% of human interrogators into believing they are chatting with a real human agent, complete with typos and emotional delays.
* **Classification:** **Acting Humanly (The Turing Test Approach)**

### Scenario 3: The Smart Farming Irrigation Bot
* **The Setup:** A robotic system drives through an orchard. It checks soil moisture and inspects leaves via multi-spectral cameras. When soil moisture drops below 20%, it activates precision drip nozzles.
* **PEAS Breakdown:**
  * **[P] Performance Measure:** Maximizing crop yield, minimizing water consumption, preventing tree disease.
  * **[E] Environment:** Orchard field, soil, trees, changing weather, pests.
  * **[A] Actuators:** Wheel motors, steering servo, precision water spray nozzles, pesticide dispensers.
  * **[S] Sensors:** Soil moisture probes, multispectral leaf cameras, temperature sensors, GPS.

### Scenario 4: Automated Medical Image Analyzer (Environment Classification)
* **The Setup:** An AI examines an MRI scan, outputs "Tumor" or "Benign", generates a report, and then begins analyzing a completely independent new patient's scan.
* **Environment Classification:**
  * **Episodic:** Diagnosing Patient A has zero causal impact on the correct diagnosis for Patient B.
  * **Static:** The digital image file does not mutate or change while the neural network is calculating its inference.
  * **Single-Agent & Partially Observable:** Only the scan is provided (indirect observation of internal body state).

### Scenario 5: Pac-Man (Environment Classification)
* **The Setup:** An agent plays standard Pac-Man on an arcade machine against ghost algorithms.
* **Environment Classification:** Fully Observable, Multi-Agent (Ghosts), Deterministic (ghost rules follow fixed paths), Sequential (eating a power pellet changes future turns), Dynamic (ghosts move while agent thinks), Discrete (grid maze), Known (rules are fixed).

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

::: callout-pitfall Exam Traps Ahead
Examiners frequently test whether you know the subtle boundaries between closely related AI concepts. Memorize this table!
:::

```text
+-------------------------+-------------------------------------------------------------+
| Concept A               | Concept B (And Why They Are Different)                      |
+=========================+=============================================================+
| AGENT FUNCTION          | AGENT PROGRAM                                               |
| Abstract mathematical   | Concrete physical executable software running on hardware   |
| mapping: f: P* -> A     | (Python script, C++ binary) subject to memory & CPU limits. |
+-------------------------+-------------------------------------------------------------+
| RATIONAL AGENT          | OMNISCIENT AGENT                                            |
| Makes the *best choice* | Knows the *actual future outcome*. (Impossible in reality). |
| based on limited info.  | Rationality maximizes expected utility; omniscience knows   |
|                         | exact reality in advance.                                   |
+-------------------------+-------------------------------------------------------------+
| FULLY OBSERVABLE        | KNOWN                                                       |
| Sensors can see the     | Agent knows the rules & physics of the environment.         |
| entire current state.   | *Poker is KNOWN (rules are clear) but PARTIALLY OBSERVABLE* |
+-------------------------+-------------------------------------------------------------+
| STATIC                  | EPISODIC                                                    |
| Relates to TIME: World  | Relates to MEMORY: Current action has no impact on future   |
| pauses while thinking.  | decisions or performance scores.                            |
+-------------------------+-------------------------------------------------------------+
| STOCHASTIC              | NON-DETERMINISTIC                                           |
| Probability distribution| Multiple outcomes possible, but probabilities are unknown.  |
| of outcomes is known.   |                                                             |
+-------------------------+-------------------------------------------------------------+
```

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz If a company builds an AI system designed specifically to pass the Turing Test, which quadrant of the Russell & Norvig AI matrix are they targeting?
() Thinking Rationally
() Acting Rationally
(*) Acting Humanly
() Thinking Humanly
::: explanation
The Turing Test is the classic operational definition for "Acting Humanly" because it evaluates whether an external observer can distinguish the machine's behavior from a human.
:::

::: quiz You are designing a PEAS framework for a Smart Thermostat in an IoT home. Which of the following represents its Actuator?
() The digital thermometer measuring ambient temperature.
() The resident walking into the living room.
(*) The electronic relay switch that turns the HVAC heating furnace on and off.
() Minimizing monthly electric utility costs.
::: explanation
The relay switch is the actuator because it is the mechanism through which the agent acts upon and changes the physical temperature of the environment.
:::

::: quiz You are building an AI to play a digital version of Scrabble against a human opponent without any game timer. How is the time dimension classified?
() Dynamic
() Semi-dynamic
(*) Static
() Sequential
::: explanation
Without a timer, the board does not change and the agent's performance score does not degrade while it is deliberating its move.
:::

::: quiz Why is autonomous taxi driving considered a "Continuous" rather than a "Discrete" environment?
() Because the car never stops driving.
() Because the car must continuously learn new routes.
(*) Because the inputs and actions (speed, steering wheel angle, acceleration) can take on infinite real-valued numbers.
() Because the environment is fully observable.
::: explanation
Continuous environments feature continuous real-valued state and action spaces (e.g. steering angle $14.5^\circ$, velocity $45.2 \text{ km/h}$), unlike discrete games with countable squares and discrete turns.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam Exam Strategy
Always use structured tabular format for PEAS questions and clearly separated bullet points for 7-mark comparison essays.
:::

### Essay Question 1 (7 Marks)
**Categorize the task environment of a "Medical Diagnosis System" (an AI interacting with patients over time to diagnose and treat diseases) using the 7 environmental dimensions. Justify each classification.**

**Model Answer:**
1. **Partially Observable:** The agent cannot directly inspect all internal biological processes; it relies on indirect sensor data (blood tests, vital signs, reported symptoms).
2. **Single-Agent:** The system treats the patient's body and pathogens as part of the natural environment, not as strategic opponents.
3. **Stochastic:** Patient responses to pharmaceutical treatments exhibit biological variability and probabilistic outcomes rather than deterministic certainty.
4. **Sequential:** Prescriptions and medical interventions administered today directly alter the patient's health trajectory and future treatment options.
5. **Dynamic:** The patient's underlying physiological condition can deteriorate in real time while the AI is computing diagnostic assessments.
6. **Continuous:** Physiological metrics (blood pressure, oxygen saturation, glucose levels, time) vary over continuous numerical scales.
7. **Known:** The medical knowledge base, drug interaction tables, and physiological mechanisms are documented in medical literature.

### Essay Question 2 (7 Marks)
**Distinguish between Rationality and Omniscience in AI. Is a rational agent guaranteed to be successful? What role does autonomy play?**

**Model Answer Outline:**
* **Rationality vs. Omniscience (3 Marks):** Omniscience requires knowing the actual outcome of all actions in advance (impossible). Rationality requires choosing the action that maximizes *expected* performance measure based on the percept sequence history to date.
* **Success Guarantee (2 Marks):** Rationality does not guarantee success. Unpredictable environmental events or partial observability can cause a fully rational decision to result in an undesirable outcome.
* **Role of Autonomy (2 Marks):** Autonomy ensures the agent updates its internal model from its own experience and percepts rather than failing when designer assumptions no longer match the real world.
