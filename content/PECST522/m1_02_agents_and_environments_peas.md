---
id: m1_02_agents_and_environments_peas
courseCode: PECST522
module: 1
sequence: 2
title: 'Agents and Environments: The PEAS Framework'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - Separate agent functions from agent programs with percept sequences
  - Specify any task with Performance, Environment, Actuators and Sensors
  - Trace sensors to actuators through the agent loop
concepts:
  - agent function
  - PEAS specification
  - percept sequences
prerequisites:
  - m1_01_ai_definition_foundations_and_history
examRelevance: high
tags:
  - agents
  - peas
---
# Agents and Environments: The PEAS Framework

**Problem: before writing any code we must say exactly what the machine senses, what it can do, and what counts as success. By the end you can write a PEAS specification for any task and separate the abstract agent function from its program.**

<a id="start-zero"></a>
## 1. Start From Zero: You Are an Agent

Crossing a street, your eyes and ears (sensors) take in cars, your legs and voice (actuators) move you or warn drivers, the road and weather (environment) surround you, and arriving safely (performance) judges you. Your brain (program) turns what you saw into what you do.

**Definitions:** an **agent** is anything that perceives through **sensors** and acts through **actuators**. The **environment** is everything it interacts with but does not directly control. A software example: a price-tracking bot whose sensors read web pages, whose environment is the web, and whose actuators send requests and save alerts.

::: callout-intuition Core Mental Model: You Are an Agent
Sensors in, brain decides, actuators out. Keep the analogy only to feel the loop; the technical content is the four PEAS slots defined below, not the street story.
:::

**Tiny beginner example:** a 1-room vacuum agent. Sensor: dirt detector (clean/dirty). Actuator: suck or move. Environment: one square. Performance: clean squares per minute. Four slots, zero code, fully specified task.

<a id="basics"></a>
## 2. Basic Building Blocks: Percepts, Sequences, Function vs. Program

**Data/state:** a **percept** is one sensor snapshot right now (one camera frame). A **percept sequence** is the full history of percepts since startup. An **action** is one actuator command (brake 15%).

**Meaning then variables then formula:** the **agent function**, written `f`, is the abstract rule saying which action follows each possible history. Meaning: "for this past, do that." Variables: `P*` (the set of all possible percept sequences — `*` means any length history), `A` (the set of all possible actions):

$$f: P^* \rightarrow A$$

So `f(history) = action`. The **agent program** is the concrete software (Python/C++) running on real hardware (CPU/GPU) that computes `f` under memory and time limits. Function is mathematics; program is engineering.

```text
Environment --percepts--> Sensors --> Agent Program --> Actuators --actions--> Environment
```

::: callout-formula The Agent Function, Symbol by Symbol
`f` = the rule. `P*` = every possible history of sensor readings. `A` = every possible action. Arrow = maps each history to one action. Exam line: function is abstract and total; program is physical and resource-limited.
:::

<a id="formal-model"></a>
## 3. Formal Model: The PEAS Contract (Method)

**Method:** specify every task as **PEAS** before building. **Model:** four slots.

- **[P] Performance Measure:** external success criteria (what counts as winning). Example: taxi judged on safety, speed, legality, comfort, profit.
- **[E] Environment:** the world or simulator acted upon. Example: roads, traffic, pedestrians, weather.
- **[A] Actuators:** mechanisms that change the world. Example: steering, throttle, brakes, signals.
- **[S] Sensors:** devices reading the world. Example: cameras, LiDAR (laser distance sensing), GPS (satellite positioning), speedometer.

::: callout-pitfall Performance Measure vs. Internal Utility
The performance measure is set externally by the designer and judges outcomes in the world (did the taxi arrive safely?). The agent's internal score during planning is only a means to that end. Never grade the agent on its own optimism.
:::

Classic PEAS table (layered after foundations, kept in full):

```text
Agent            | Performance              | Environment            | Actuators                  | Sensors
Automated taxi   | safe, fast, legal, comfy | roads, traffic, people | steering, throttle, brakes | camera, LiDAR, GPS
Medical diagnosis| accuracy, low false alarms| patient, hospital data| screen display             | keyboard, lab feed
Factory picker   | correct bins, speed      | belt, parts            | arm, gripper               | camera, joint sensors
English tutor    | scores, engagement       | student, test agency   | screen display             | keyboard, microphone
Vacuum world     | clean room, low energy   | room, dirt, furniture  | wheels, suction            | dirt, bump sensors
```

<a id="worked-example"></a>
## 4. Worked Example: The Vacuum Paradox and Limitations

**Procedure: how to write PEAS in exams (steps then trace).** Step 1: name the performance in measurable world terms. Step 2: list environment items the agent cannot control. Step 3: list actuators (things that change the world). Step 4: list sensors (things that read the world). Trace on a poker bot: performance = money won under official rules; environment = cards, opponents, table software; actuators = click fold/call/raise; sensors = card reader plus bet display. Money is performance, clicking is actuation, reading cards is sensing.

::: callout-intuition The Vacuum Cleaner Paradox
Rewarding "dirt sucked up" invites cheating: clean, dump the bin, suck it again for infinite score. Reward the world state instead: "+1 per clean square per minute." Use the story only to remember: measure desired environments, not agent motions.
:::

| Similar pair | Distinction |
|---|---|
| Agent function vs. agent program | Abstract mapping `f: P* -> A` vs. executable code on hardware |
| Sensor vs. actuator | Reads the world vs. changes the world |
| Performance vs. internal score | External judging rule vs. internal planning number |

**Watch out:** (1) Cards on screen are environment, not sensors; the reader is the sensor. (2) Winnings are performance, not actuation. (3) Always make performance about world states over time, or rational agents will game it.

**Limitations:** PEAS specifies the task but says nothing about which architecture (reflex, goal, utility, learning) can solve it — that needs the environment classification (next notes) and architecture choice.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Which of the following best describes the difference between an Agent Function and an Agent Program?
() The Agent Program is the physical hardware, while the Agent Function is the software.
() They are exactly the same thing; the terms are used interchangeably.
(*) The Agent Function is an abstract mathematical mapping of inputs to outputs, while the Agent Program is the actual executable code running on a machine.
() The Agent Function only handles sensors, while the Agent Program handles actuators.
::: explanation
The function is the theoretical what-for-every-history rule (f: P* -> A); the program is the practical how-on-limited-hardware implementation.
:::

::: quiz You are designing an AI system to play online Poker against humans. Which of the following correctly identifies its Actuators?
() The amount of money won at the end of the game.
() The digital cards dealt by the dealer.
(*) The graphical UI buttons the AI clicks to "Fold", "Call", or "Raise".
() The optical character recognition (OCR) used to read the cards on the screen.
::: explanation
Actuators change the world: clicking Fold/Call/Raise alters game state. Money is performance, cards are environment, OCR (Optical Character Recognition) is a sensor.
:::

::: quiz Why is it dangerous to set a self-driving car's performance measure strictly to "Minimize total trip duration to the destination"?
() The car will fail to initialize its GPS sensors.
(*) The car might speed excessively, ignore traffic lights, and endanger pedestrians to shave off seconds.
() The car will drive in infinite circles to gather percepts.
() The car will run out of battery before planning a route.
::: explanation
A rational agent maximizes exactly what it is given. Time-only rewards ignore safety and legality, so the optimum is reckless driving.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: define PEAS with one line per letter. 7 marks: function-vs-program distinction plus a full PEAS table for taxi, medical, or factory domains.
:::

**Recap facts examiners reward:** agent/sensor/actuator/percept/percept-sequence definitions; `f: P* -> A` with symbols; PEAS expansions; vacuum-paradox fix (reward clean states, not sucked dirt).

### Sample 3-Mark Question
**Q: Define the PEAS framework.**

**Model Answer:** Performance (success metric), Environment (external world), Actuators (world-changing outputs), Sensors (world-reading inputs) — specified before any code or model is chosen.

### Sample 7-Mark Question
**Q: Distinguish agent function from agent program and give PEAS for an automated taxi.**

**Model Answer:** Function: abstract mapping from every percept sequence to an action. Program: concrete code on physical hardware realizing it. Taxi PEAS: performance (safety, speed, legality, comfort, efficiency, profit); environment (roads, traffic, pedestrians, weather); actuators (steering, throttle, brakes, signals, display); sensors (cameras, LiDAR, radar, GPS, speedometer, engine sensors).
:::
