---
id: m1_01_ai_definition_foundations_and_history
courseCode: PECST522
module: 1
sequence: 1
title: 'Introduction to AI: Foundations & History'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Define AI across thinking, acting, human and rational framings
  - Judge machine thinking with the Turing Test contract
  - Place Dartmouth and the AI cycles on the history line
concepts:
  - Turing Test
  - rational agents
  - AI history cycles
prerequisites: []
examRelevance: medium
tags:
  - foundations
  - history
---
# Introduction to AI: Foundations & History

**The Turing Test, definitions of AI (Thinking/Acting Humanly/Rationally), Dartmouth workshop, and historical AI cycles.**

<a id="the-intuition"></a>
## 1. What is Artificial Intelligence?

Artificial Intelligence (AI) is the branch of computer science dedicated to creating systems capable of performing tasks that typically require human intelligence. At its core, it is the engineering of systems that can autonomously observe their surroundings, make reasoned decisions, and take actions to maximize their chances of success.

::: callout-intuition Core Mental Model: The Thermostat vs. The Self-Driving Car
Think of intelligence as a continuous loop of **Perception $\rightarrow$ Reasoning $\rightarrow$ Action**.

A basic room thermostat has perception (it measures temperature) and action (it turns on the AC). However, it lacks *reasoning*; it just follows a hardcoded `IF temperature > 24 THEN AC = ON` rule. It is automated, but not intelligent.

A self-driving car, however, takes in millions of camera pixels and LiDAR pulses (perception), calculates the probabilistic intent of a pedestrian crossing the road (reasoning), and smoothly applies the brakes (action). It handles uncertainty and novel situations without explicit line-by-line instructions.
:::

### The Agent-Environment Cycle

The fundamental architecture of an AI system is the **Agent-Environment Interaction Loop**:

```text
       +------------------------------------------------------+
       |                    ENVIRONMENT                       |
       +------------------------------------------------------+
             |                                          ^
     Percepts|                                    Action|
             v                                          |
       +-----------+                              +-----------+
       |  SENSORS  |                              | ACTUATORS |
       +-----------+                              +-----------+
             |                                          ^
             v                                          |
       +------------------------------------------------+
       |                  AGENT CORE                    |
       |  (Perception -> State Reasoning -> Decision)   |
       +------------------------------------------------+
```

---

<a id="the-dimensions"></a>
## 2. The 4 Approaches to AI (The Dimensions Matrix)

Historically, AI pioneers defined artificial intelligence along two distinct axes:
1. **Thought vs. Behavior:** Is the AI supposed to *think* (process internal logical inferences) or *act* (produce observable external behavior)?
2. **Humanly vs. Rationally:** Should the AI mimic human flaws, cognitive psychology, and biases, or should it behave with mathematical rationality (doing the optimal thing according to a performance measure)?

This gives us the standard **Stuart Russell & Peter Norvig 2x2 Matrix**:

```text
+-------------------+-----------------------------------+-----------------------------------+
|                   | Human-Centric                     | Rational-Centric                  |
+-------------------+-----------------------------------+-----------------------------------+
| Thought Processes | 1. Thinking Humanly               | 2. Thinking Rationally            |
| (Internal)        | (Cognitive Modeling Approach)     | ("Laws of Thought" / Logic)      |
+-------------------+-----------------------------------+-----------------------------------+
| Behavior / Action | 3. Acting Humanly                 | 4. Acting Rationally              |
| (External)        | (The Turing Test Approach)        | (The Rational Agent Approach)     |
+-------------------+-----------------------------------+-----------------------------------+
```

### 1. Acting Humanly (The Turing Test Approach)
* **Core Philosophy:** A machine is intelligent if its behavior cannot be distinguished from a human.
* **Benchmark:** Alan Turing's 1950 **Imitation Game**. If a human interrogator communicates via text terminal with a computer and a human and cannot reliably tell which is which, the machine passes.
* **Key Components Required:** Natural Language Processing (NLP), Knowledge Representation, Automated Reasoning, and Machine Learning (plus Computer Vision and Robotics for the *Total Turing Test*).

### 2. Thinking Humanly (The Cognitive Modeling Approach)
* **Core Philosophy:** To build machines that think like humans, we must first determine how the human brain actually functions.
* **Techniques:** Introspection (catching our own thoughts as they go by), psychological experiments (observing a person in action), and brain imaging (fMRI/EEG).
* **Connection:** Gave rise to **Cognitive Science** and biologically-inspired Artificial Neural Networks (ANNs).

### 3. Thinking Rationally (The "Laws of Thought" Approach)
* **Core Philosophy:** Codify right thinking through formal mathematical logic (syllogisms).
* **Example:** "Socrates is a man; all men are mortal; therefore, Socrates is mortal."
* **Obstacles:** Not all real-world knowledge is 100% certain, and informal knowledge is difficult to translate into formal logical notation without exponential computational complexity.

### 4. Acting Rationally (The Rational Agent Approach)
* **Core Philosophy:** An agent acts rationally if it takes the action expected to yield the best outcome (or highest expected utility) given what it knows.
* **Real-world Example:** DeepMind's AlphaGo or modern autonomous drone navigation. They do not simulate human mistakes; they compute the mathematically optimal move. **Modern AI engineering is predominantly based on this Rational Agent framework.**

::: callout-pitfall Rationality vs. Omniscience
A classic exam trap is confusing a **Rational Agent** with an **Omniscient Agent**. 
* **Omniscience** means knowing the actual outcome of all actions in advance (impossible in the real world).
* **Rationality** means making the *best possible decision* based on the *percept history and available information* to maximize expected performance.
:::

::: quiz Which approach to AI focuses on maximizing expected performance measure rather than mimicking human flaws?
() Acting Humanly (Turing Test)
() Thinking Humanly (Cognitive Modeling)
(*) Acting Rationally (Rational Agent)
() Thinking Rationally (Laws of Thought)
::: explanation
Acting Rationally focuses on doing the right thing to achieve the best expected outcome based on objective performance metrics, regardless of human cognitive biases.
:::

---

<a id="foundations"></a>
## 3. The Foundations of AI

AI is the interdisciplinary synthesis of several classical fields:

* **Philosophy (428 BC – Present):**
  * Established the foundations of formal logic, dualism vs. materialism, and the philosophy of mind.
  * Formulated knowledge as justified true belief and the connection between knowledge and action.

* **Mathematics (c. 800 – Present):**
  * **Logic & Computation:** Boolean algebra, Gödel's Incompleteness Theorem, and Turing's computability limits.
  * **Probability:** Bayes' Rule and probabilistic reasoning to handle real-world uncertainty.
  * **Optimization:** Linear programming and gradient-based algorithms.

* **Economics (1776 – Present):**
  * Formalized **Decision Theory** (combining probability with utility theory).
  * Developed **Game Theory** (Von Neumann & Morgenstern) for decision-making in multi-agent competitive environments.

* **Neuroscience (1861 – Present):**
  * Studied the physical brain and how biological neurons transmit action potentials.
  * Inspired connectionist architectures and Artificial Neural Networks.

* **Psychology (1879 – Present):**
  * Shifted from behaviorism to **Cognitive Psychology**, viewing the brain as an information-processing system.

* **Computer Engineering (1940 – Present):**
  * Provided high-speed CPUs, GPUs, TPUs, and memory architectures that make training complex AI models computationally feasible.

* **Control Theory & Cybernetics (1948 – Present):**
  * Developed negative feedback loops (e.g., governors, thermostats) that drive systems to minimize error over time.

* **Linguistics (1957 – Present):**
  * Noam Chomsky's syntactic structures connected formal language theory with computer science, founding modern Natural Language Processing (NLP).

::: callout-formula Expected Utility Theory (Economics + Math)
Modern rational agents make decisions under uncertainty by maximizing Expected Utility ($EU$):
$$EU(a) = \sum_{o} P(o \mid a) \cdot U(o)$$
where $P(o \mid a)$ is the probability of outcome $o$ occurring when action $a$ is executed, and $U(o)$ is the numeric reward (utility) of that outcome.
:::

---

<a id="history"></a>
## 4. History of AI: Breakthroughs, Winters & Modern Eras

The history of AI is marked by alternating cycles of intense optimism followed by funding droughts known as **AI Winters**.

```text
1943 |── McCulloch & Pitts: First mathematical model of artificial neurons
1950 |── Alan Turing proposes the "Imitation Game" (Turing Test)
1956 |── Dartmouth Summer Workshop: John McCarthy coins the term "Artificial Intelligence"
1969 |── Minsky & Papert publish "Perceptrons", proving XOR limitations (Single-layer NN)
1974 |── FIRST AI WINTER (1974–1980): Over-promising fails to deliver; Lighthill Report cuts funding
1980 |── Expert Systems Boom: Corporate adoption of rule-based systems (e.g., R1/XCON)
1987 |── SECOND AI WINTER (1987–1993): Collapse of specialized LISP machine market & brittle rules
1997 |── IBM Deep Blue defeats World Chess Champion Garry Kasparov
2012 |── Deep Learning Revolution: AlexNet wins ImageNet by a massive margin using GPUs
2017 |── "Attention Is All You Need" introduces the Transformer architecture
2020s|── Generative AI & Foundation Models (LLMs, Diffusion Models) achieve widespread adoption
```

::: quiz What was the primary cause of the "AI Winters" in the 1970s and late 1980s?
() The invention of the Turing Test made researchers abandon all other approaches.
(*) A massive gap between researcher hype/promises and actual technological delivery, leading to severe funding cuts.
() A global shortage of silicon chips prevented the manufacturing of computers.
() Chess engines solving the game of chess, leaving no more challenges for AI researchers.
::: explanation
AI Winters were triggered by inflated promises colliding with the reality of computational limitations and combinatorial explosions, causing government and corporate sponsors to cut funding.
:::

---

<a id="modern-engineering"></a>
## 5. AI in Modern Engineering: Weak vs. Strong AI

In contemporary engineering practice, AI systems are classified by their operational scope:

* **Weak AI (Narrow AI / Artificial Narrow Intelligence - ANI):**
  * Systems designed and trained for one specific task.
  * Highly proficient in their domain but completely incapable outside it.
  * *Examples:* AlphaGo, spam filters, Tesla Autopilot vision stack, facial recognition systems. **All currently deployed AI systems are Narrow AI.**

* **Strong AI (Artificial General Intelligence - AGI):**
  * A theoretical system possessing generalized human-level cognitive capabilities across arbitrary domains.
  * Capable of abstract reasoning, self-reflection, and transferring skills without task-specific retraining.

::: quiz Which of the following is a primary characteristic of Narrow AI (Weak AI)?
(*) It is highly optimized to perform one specific, well-defined task.
() It possesses true human consciousness and self-awareness.
() It can seamlessly transfer its learning from playing chess to driving a car.
() It is entirely a theoretical concept that has not yet been built in the real world.
::: explanation
Narrow AI operates strictly within the boundaries of its specialized task domain.
:::

---

<a id="exam-focus"></a>
## 6. Worked Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
1. **3 Marks:** The 2x2 Russell & Norvig definition matrix (Thinking/Acting vs. Human/Rational).
2. **7 Marks:** Tracing the history of AI with focus on Dartmouth 1956, the two AI Winters, and the distinction between Rationality vs. Omniscience.
:::

### Sample 3-Mark Question
**Q: Distinguish between "Thinking Rationally" and "Acting Rationally" in AI.**

**Model Answer:**
* **Thinking Rationally** is based on the *Laws of Thought* (formal deductive logic). It requires that internal inferences are logically sound deductions from known facts.
* **Acting Rationally** is based on the *Rational Agent* framework. It requires that the agent chooses actions that maximize expected utility given available percepts, even under uncertainty where pure logical deduction is impossible.

### Sample 7-Mark Question
**Q: Trace the historical evolution of Artificial Intelligence. Explain why the "AI Winters" occurred.**

**Model Answer:**
1. **Genesis (1943–1956):** McCulloch-Pitts neuron (1943), Turing's paper (1950), and the 1956 Dartmouth Workshop where McCarthy, Minsky, Rochester, and Shannon founded the field.
2. **Early Enthusiasm (1952–1969):** Microworld programs (Blocks World, ELIZA, GPS) created unrealistic expectations.
3. **The First AI Winter (1974–1980):** Triggered by combinatorial explosion, lack of compute, and negative evaluations like the Lighthill Report.
4. **The Expert Systems Rise & Second Winter (1980–1993):** Commercial success with rule-based systems followed by market collapse due to high maintenance costs and brittleness.
5. **Modern Deep Learning & AI Era (2012–Present):** Big data, GPU computing, and Transformers catalyzed today's generative AI breakthroughs.
