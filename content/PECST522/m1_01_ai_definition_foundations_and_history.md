---
id: m1_01_ai_definition_foundations_and_history
courseCode: PECST522
module: 1
sequence: 1
title: 'Introduction to AI: Foundations & History'
difficulty: beginner
estimatedMinutes: 12
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

**Problem: how do we build machines that perceive, reason, and act — and how do we even define "intelligence" precisely enough to engineer it? By the end you can place any AI system in the 2x2 definition matrix and trace the history line from Dartmouth to modern AI.**

<a id="start-zero"></a>
## 1. Start From Zero: What Problem Does AI Solve?

Imagine two machines. A room thermostat measures temperature and flips the air conditioner on. A self-driving car watches video, predicts what a pedestrian will do, and brakes smoothly. Both sense and act — but only the second handles **uncertainty and novelty** without line-by-line instructions. That gap is the problem Artificial Intelligence (AI) exists to close.

**Definition for beginners:** Artificial Intelligence (AI) is the branch of computer science that builds systems which **perceive** their surroundings, **reason** under uncertainty, and **act** to achieve goals.

::: toggle What do `perceive`, `reason` and `act` mean here?
- `perceive` means reading the world through sensors, like a spam filter reading email words.
- `reason` means combining those readings under uncertainty, like estimating spam probability.
- `act` means changing the world toward a goal, like moving the mail to spam.
:::

The basic loop every AI system follows is:

```text
PERCEIVE (sensors) --> REASON (decide) --> ACT (actuators) --> world changes --> repeat
```

::: callout-intuition Core Mental Model: Thermostat vs. Self-Driving Car
A thermostat follows one hard rule: `IF temperature > 24 THEN AC = ON`. It has perception and action but almost no reasoning. A self-driving car fuses camera and Light Detection and Ranging (LiDAR — laser distance sensing) data, estimates pedestrian intent probabilistically, and brakes. Use this comparison only to feel the perception-reasoning-action loop; the technical definition is the loop itself, not the vehicles.
:::

**Tiny beginner example:** a spam filter perceives words in an email, reasons about the probability of spam, and acts by moving the mail. No cognition is copied — the goal is the right action.

<a id="basics"></a>
## 2. Basic Building Blocks: The Four Definitions

**Data/state here:** the agent's percepts (sensor snapshots) and the environment it acts in. **Goal:** pick actions that score well on a performance measure.

Pioneers split definitions along two axes: **thought (internal reasoning) versus behavior (external action)**, and **human-like (copy people, flaws included) versus rational (do the mathematically best thing)**. This gives the Stuart Russell and Peter Norvig 2x2 matrix:

```text
+-------------------+---------------------------+---------------------------+
|                   | Human-Centric             | Rational-Centric          |
+-------------------+---------------------------+---------------------------+
| Thought (inside)  | 1. Thinking Humanly       | 2. Thinking Rationally    |
|                   | (cognitive modelling)     | (laws of thought / logic)|
+-------------------+---------------------------+---------------------------+
| Action (outside)  | 3. Acting Humanly         | 4. Acting Rationally      |
|                   | (Turing Test approach)    | (rational-agent approach)|
+-------------------+---------------------------+---------------------------+
```

- **1. Acting Humanly:** behaviour indistinguishable from a human. Benchmark: Alan Turing's 1950 **Imitation Game (Turing Test)** — a human interrogator chats by text with a hidden human and a machine; the machine passes if the interrogator cannot reliably tell which is which. Needs Natural Language Processing (NLP — computers handling human language), knowledge representation, reasoning, and learning (plus vision and robotics for the *Total* Turing Test).
- **2. Thinking Humanly:** how humans actually think, studied via introspection, psychology experiments, and brain imaging. Founded cognitive science and inspired Artificial Neural Networks (ANNs — layered computational models loosely inspired by neurons).
- **3. Thinking Rationally:** correct inference via formal logic. Example syllogism: "Socrates is a man; all men are mortal; therefore Socrates is mortal." Limitation: real knowledge is uncertain and hard to encode without explosive computation.
- **4. Acting Rationally:** choose the action with the best **expected outcome** given available information. Example: a navigation agent rerouting around traffic. **Modern AI engineering is predominantly built on this rational-agent view** — not because it copies humans, but because it optimizes a performance measure.

::: toggle What does `rational` mean here?
- `rational` means picking the action with the best expected score on the available information.
- Why not copy humans: human-like behaviour keeps human flaws, while rational behaviour optimises the goal.
- How to test: ask what the percepts justified at decision time, not whether the outcome was lucky.
:::

::: callout-pitfall Rationality vs. Omniscience
**Rational** means best decision given available information. **Omniscient** means knowing actual future outcomes in advance (impossible). Examiners love this trap: a rational car that stops at a red light is still rational even if another driver rear-ends it.
:::

<a id="formal-model"></a>
## 3. Formal Model: Expected Utility and Foundations

**Method:** the rational agent selects actions maximizing Expected Utility (EU). **Mathematical model:** let `a` be an action, `o` a possible outcome, `P(o | a)` (probability of outcome `o` given action `a`), and `U(o)` (numeric utility, i.e. desirability score, of `o`):

$$EU(a) = \sum_{o} P(o \mid a) \cdot U(o)$$

Symbol by symbol: `EU(a)` is the score of action `a`; the sum ranges over all outcomes; each term multiplies likelihood by desirability. The agent picks the `a` with the largest `EU(a)`.

::: toggle What do `EU(a)`, `P(o | a)`, `U(o)` and `+` mean?
- `EU(a)` is the total score of action `a`; `P(o | a)` is how likely outcome `o` is after `a`.
- `U(o)` is the desirability number of `o`; `+` (the sum) adds likelihood-times-value over all outcomes.
- Tiny example: `EU(umbrella) = 0.5 x 10 + 0.5 x -2 = 4`, so carry when the rival action scores 3.
:::

**Foundations (each parent discipline defined):** Philosophy (logic, mind, knowledge as justified true belief); Mathematics (Boolean algebra, computability, Bayes' rule for updating probabilities, optimization); Economics (Decision Theory combining probability with utility; Game Theory — Von Neumann and Morgenstern — for multi-agent competition); Neuroscience (how biological neurons fire; inspiration for ANNs); Psychology (cognitive psychology treats the brain as an information processor); Computer Engineering (Central Processing Units (CPUs), Graphics Processing Units (GPUs), Tensor Processing Units (TPUs) that make training feasible); Control Theory and Cybernetics (feedback loops minimizing error); Linguistics (Noam Chomsky's syntax theory; basis of NLP).

::: callout-formula Expected Utility: Symbol Guide
`a` = candidate action. `o` = one possible outcome. `P(o | a)` = probability of `o` if `a` is taken. `U(o)` = reward of `o`. Multiply, sum, maximize. Tiny numbers: rain likely (0.8, utility of carrying umbrella +5) vs. unlikely (0.2): EU(carry) = 0.8*5 + 0.2*(-1) = 3.8; EU(skip) lower, so carry wins.
:::

<a id="worked-example"></a>
## 4. Worked Example: History Line, Weak vs. Strong, Limitations

**Training/search procedure for this topic:** none to run — the procedure is classification: place each system in the matrix, then on the timeline.

```text
1943 McCulloch-Pitts neuron | 1950 Turing Test | 1956 Dartmouth workshop (John McCarthy coins "Artificial Intelligence")
1969 Perceptron limits | 1974-80 FIRST AI WINTER (Lighthill report, funding cuts)
1980s Expert systems boom | 1987-93 SECOND AI WINTER (Lisp-machine collapse, brittle rules)
1997 Deep Blue beats Kasparov | 2012 AlexNet wins ImageNet on GPUs
2017 Transformer ("Attention Is All You Need") | 2020s generative/foundation models
```

**Why winters happened:** hype promised more than hardware and algorithms could deliver (combinatorial explosion, little data/compute); sponsors cut funding. Lesson: progress claims must be qualified by compute and data assumptions.

**Weak (Narrow) AI versus Strong AI (Artificial General Intelligence — AGI):** Narrow AI does one task well (spam filters, game players, vision stacks) and fails outside it — **all deployed systems today are Narrow AI**. AGI (general human-level ability across domains) is theoretical; no deployed system qualifies.

| Similar pair | Distinction |
|---|---|
| Thinking Rationally vs. Acting Rationally | Sound internal logic vs. best external action under uncertainty |
| Rational vs. Omniscient | Best expected call vs. knowing the actual future |
| Weak vs. Strong AI | One-task specialist (real) vs. general mind (theoretical) |

**Watch out:** (1) Turing Test measures human-likeness, not rationality. (2) Logic alone cannot handle uncertainty. (3) History dates are evidence, not decoration — cite Dartmouth 1956 and both winters by cause.

**Limitations:** definitions do not tell you how to build anything; the rational-agent view still needs a task specification (Module 1.2's PEAS), a performance measure, and tractable algorithms.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Which approach to AI focuses on maximizing expected performance measure rather than mimicking human flaws?
() Acting Humanly (Turing Test)
() Thinking Humanly (Cognitive Modeling)
(*) Acting Rationally (Rational Agent)
() Thinking Rationally (Laws of Thought)
::: explanation
Acting Rationally picks the action with the best expected outcome on an objective performance measure, ignoring whether humans would decide that way.
:::

::: quiz What was the primary cause of the "AI Winters" in the 1970s and late 1980s?
() The invention of the Turing Test made researchers abandon all other approaches.
(*) A massive gap between researcher hype/promises and actual technological delivery, leading to severe funding cuts.
() A global shortage of silicon chips prevented the manufacturing of computers.
() Chess engines solving the game of chess, leaving no more challenges for AI researchers.
::: explanation
Over-promising plus combinatorial explosion and weak hardware collided with evaluations like the Lighthill report, so sponsors withdrew funding.
:::

::: quiz Which of the following is a primary characteristic of Narrow AI (Weak AI)?
(*) It is highly optimized to perform one specific, well-defined task.
() It possesses true human consciousness and self-awareness.
() It can seamlessly transfer its learning from playing chess to driving a car.
() It is entirely a theoretical concept that has not yet been built in the real world.
::: explanation
Narrow AI is a one-domain specialist. Transfer across unrelated tasks and consciousness belong to the theoretical Strong AI/AGI category.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: reproduce the 2x2 matrix. 7 marks: trace history with Dartmouth 1956, both winters with causes, plus rationality vs. omniscience.
:::

**Recap facts examiners reward:** matrix axes and four cells; Turing 1950 Imitation Game; Dartmouth 1956 coinage; winter dates and funding-cut mechanism; EU formula with symbols; Narrow AI is all that is deployed.

### Sample 3-Mark Question
**Q: Distinguish "Thinking Rationally" from "Acting Rationally."**

**Model Answer:** Thinking Rationally demands logically sound internal deductions (laws of thought). Acting Rationally demands actions maximizing expected utility given percepts, even when deduction under uncertainty is impossible.

### Sample 7-Mark Question
**Q: Trace AI history and explain the AI Winters.**

**Model Answer:** Genesis (1943 neuron, 1950 Turing, 1956 Dartmouth founding by McCarthy, Minsky, Rochester, Shannon); early microworlds bred hype; First Winter (1974-80, combinatorial explosion plus Lighthill cuts); expert-system boom then Second Winter (1987-93, brittle rules plus hardware-market collapse); deep learning revival (2012 GPUs/data, 2017 Transformers) to present generative models.
:::
