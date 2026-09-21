---
id: m1_05_agent_architectures_reflex_to_learning
courseCode: PECST522
module: 1
sequence: 5
title: 'Structure of Agents: From Reflex to Learning Agents'
difficulty: beginner
estimatedMinutes: 14
learningObjectives:
  - Climb the five architectures from reflex to learning agents
  - Maintain internal state with percepts, actions and models
  - Trade goal satisfaction against utility scoring for decisions
concepts:
  - reflex agents
  - goal-based agents
  - learning agents
prerequisites:
  - m1_02_agents_and_environments_peas
  - m1_03_concept_of_rationality
  - m1_04_nature_of_task_environments
examRelevance: medium
tags:
  - agents
  - architectures
---
# Structure of Agents: From Reflex to Learning Agents

**Problem: a giant lookup table of "for every history, do this" would need more entries than atoms in the universe. By the end you can build five architectures that compute actions dynamically and say which handles partial observability, goals, trade-offs, and learning.**

<a id="start-zero"></a>
## 1. Start From Zero: Why Tables Fail

**Problem first:** a table-driven agent stores one action per percept history. With `|P|` possible percepts and horizon `t`, size is `|P|^t` (percept count to the power of time steps). Tiny numbers: 10 percepts over 20 steps needs 10^20 rows — physically impossible for a taxi. So agents compute instead of memorizing.

::: toggle What do `|P|`, `t` and `|P|^t` mean?
- `|P|` counts the distinct percepts possible at one step, like 10 sensor patterns.
- `t` counts the time steps of history, like 20 steps of driving.
- `|P|^t` multiplies choices per step, so 10 percepts over 2 steps need 100 rows, and over 20 steps need 10^20.
:::

**Foundation:** `Agent = Architecture + Program`. Architecture is the hardware (sensors, processors, memory, actuators). Program is the software mapping histories to actions. The five architectures below are five program designs of increasing power.

::: callout-intuition Core Mental Model: The Basic Thermostat
A thermostat fires `IF cold THEN heat` on the current reading only — no memory of yesterday. Feel "react now" here, then drop the device; the technical idea is condition-action rules without history.
:::

<a id="basics"></a>
## 2. Basic Layer: Reflex Agents (No Memory, Then Memory)

**Data/state:** current percept only (simple reflex) vs. current percept plus remembered world model (model-based). **Goal:** act correctly despite sensing limits.

**Architecture 1 — Simple Reflex:** `IF condition THEN action` on the current percept only.

```python
def Simple_Reflex_Agent(percept):
    state = interpret_input(percept)     # What is the world like now?
    rule = match_rule(state, rule_base)  # Match IF condition THEN action
    return rule.action
```

```text
Sensors --> [What world is like NOW] --> [Condition-Action Rules] --> Actuators
```

**Tiny trace:** vacuum senses `bump=true`, fires `IF bump THEN turn_left`, moves. If a wide table leg still blocks it, the same percept fires the same rule forever — an infinite loop. That failure in partially observable worlds is the whole lesson.

**Architecture 2 — Model-Based Reflex:** keeps an **internal state** (memory of unobserved aspects) updated by a transition model (how the world evolves) and a sensor model (how actions affect sensing):

$$S_t = \text{Update}(S_{t-1}, A_{t-1}, P_t)$$

Symbol by symbol: `S_t` = current internal state estimate; `S_{t-1}` = previous estimate; `A_{t-1}` = last action taken; `P_t` = newest percept. Intuition: remember where you were, account for what you did, correct with what you now see.

::: toggle What do `S_t`, `S_{t-1}`, `A_{t-1}` and `P_t` mean?
- `S_t` is the current guess about the hidden world, like still being centred in the tunnel.
- `S_{t-1}` is the previous guess and `A_{t-1}` is what the agent just did, like driving straight for 3 s.
- `P_t` is the newest percept correcting that prediction once GPS or vision returns.
:::

::: callout-intuition Core Mental Model: Driving Through a Mountain Tunnel
GPS drops in a tunnel, but the car propagates "60 km/h straight for 3 s means still centered" until signals return. Memory bridges blindness. Drop the tunnel after this; the equation above is the examinable content.
:::

::: callout-pitfall The Fatal Flaw of Pure Reflex
Simple reflex fails under partial observability because identical percepts can demand different actions. The fix is internal state, not more rules.
:::

<a id="formal-model"></a>
## 3. Formal Layer: Goals, Utilities, Learning

**Architecture 3 — Goal-Based:** adds explicit **goals** (desired situations) and plans by asking "what happens if I do X?" A GPS that knows its position still needs the destination "airport" to choose left vs. right. Method: search/planning over future states to reach the goal.

**Architecture 4 — Utility-Based:** goals are binary (reached/not). Real choices need quality trade-offs, so a **utility function** scores states with real numbers:

$$U: S \rightarrow \mathbb{R}$$

meaning function `U` maps each state `S` to a real number (its desirability). The agent picks:

$$a^* = \arg\max_{a \in A} \sum_{s'} P(s' \mid s, a) \cdot U(s')$$

Symbols: `a*` = best action; `A` = action set; `s'` = possible next state; `P` = transition probability; `U(s')` = next-state score. Tiny numbers: Route A (25 min, \$30, risky) scores 60; Route B (30 min, \$0, safe) scores 85 — goal-based calls both "arrive," utility-based picks B.

::: toggle What do `U`, `S`, `R` and `argmax` mean?
- `U` is the utility function scoring states; `S` is the set of states being scored.
- `R` means real numbers, so every state gets a numeric desirability like 60 or 85.
- `argmax` picks the action with the best expected score, which is why safe route B beats merely arriving route A.
:::

**Architecture 5 — Learning Agent (four parts):** starts with little knowledge and improves. (1) **Performance element** selects actions. (2) **Critic** grades against the external performance standard. (3) **Learning element** rewrites rules/models/utilities from that feedback. (4) **Problem generator** proposes exploratory actions (explore vs. exploit).

```text
Sensors --> PERFORMANCE ELEMENT --> Actuators --> Environment
              ^    |__ CRITIC --> LEARNING ELEMENT --> PROBLEM GENERATOR __|
```

Summary matrix (formal layer kept in full):

```text
Architecture      | Memory        | Decides by         | Partial obs? | Learns?
Simple reflex     | none          | condition-action   | No           | No
Model-based reflex| internal state| condition-action   | Yes          | No
Goal-based        | internal state| search to goal     | Yes          | No
Utility-based     | internal state| maximize U(s)      | Yes          | No
Learning agent    | evolves       | adapt via critic   | Yes          | Yes
```

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

**KTU procedure:** to draw any architecture, show sensors in, state/model boxes, decision box, actuators out; for learning agents add the critic-learning-generator loop explicitly.

| Similar pair | Distinction |
|---|---|
| Simple vs. model-based reflex | No memory (loops blind) vs. state memory bridging gaps |
| Goal vs. utility | Binary success vs. scored trade-offs (`U(s)` real numbers) |
| Performance element vs. learning element | Acts now vs. rewrites future acting rules |

**Watch out:** (1) Table size `|P|^t` is exponential in history length, not linear. (2) Goal agents still need a model to predict futures. (3) Utility functions are fixed unless a learning element updates them.

**Limitations:** reflex/goal/utility designs inherit designer models and cannot fix wrong priors — only the learning agent adapts. Learning costs samples, feedback design, and exploration risk.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Which agent architecture is required when an environment is Partially Observable and a simple reflex agent gets trapped in an infinite loop?
() Goal-Based Agent without internal state
() Simple Reflex Agent with a larger rule base
(*) Model-Based Reflex Agent
() Table-Driven Agent
::: explanation
Partial observability traps need internal state tracking unobserved aspects. Model-based reflex adds exactly that memory plus transition/sensor models.
:::

::: quiz What is the fundamental distinction between Goal-Based and Utility-Based Agents?
() Goal-based agents use sensors, while utility-based agents do not.
() Goal-based agents can learn, while utility-based agents cannot.
(*) Goal-based agents evaluate binary success/failure conditions, whereas utility-based agents optimize continuous quality trade-offs using a mathematical scoring function $U(s)$.
() Utility-based agents cannot handle state transitions.
::: explanation
Goals say arrived-or-not; utilities score how good each arrival is (time, cost, safety), enabling optimal trade-offs via expected-utility maximization.
:::

::: quiz In a Learning Agent, what is the specific responsibility of the "Problem Generator"?
() To generate errors for testing the hardware sensors.
(*) To propose exploratory actions that lead to novel experiences, balancing exploration against immediate reward exploitation.
() To execute the low-level motor commands to actuators.
() To evaluate actions against external performance benchmarks.
::: explanation
The problem generator suggests non-greedy probes so the agent discovers better long-term strategies instead of freezing on early rewards.
:::

::: quiz Why are Table-Driven Agents physically impossible to deploy for complex real-world tasks?
() Because lookup tables cannot execute in CPU cache.
(*) Because the size of the lookup table grows exponentially ($|P|^t$) with the percept sequence history, exceeding physical storage limits of the universe.
() Because lookup tables cannot store discrete actions.
() Because table-driven agents require a utility function.
::: explanation
Rows multiply per percept per step (|P|^t). Even tiny horizons explode beyond any buildable memory, forcing computed architectures.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: four learning-agent parts or simple-reflex limits. 7 marks: goal-vs-utility essay or full learning-agent diagram with parts.
:::

**Recap facts examiners reward:** `Agent = Architecture + Program`; `|P|^t` explosion; `S_t = Update(S_{t-1}, A_{t-1}, P_t)` with symbols; `U: S -> R` plus argmax rule; four learning parts; five-row comparison matrix.

### Sample 3-Mark Question
**Q: Draw simple reflex and state its core limit.**

**Model Answer:** Sensors -> present-state interpreter -> condition-action rules -> actuators. Limit: current-percept-only decisions loop forever when hidden state makes identical percepts need different actions.

### Sample 7-Mark Question
**Q: Explain the learning agent's four components with a diagram.**

**Model Answer:** Performance element acts; critic grades against external standard; learning element rewrites rules/models/utilities; problem generator explores. Diagram shows sensors feeding performance and critic, critic to learning, learning to performance plus generator loop, performance to actuators.
:::
