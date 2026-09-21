---
id: m1_04_nature_of_task_environments
courseCode: PECST522
module: 1
sequence: 4
title: The Nature of Task Environments
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - Classify environments along all seven task dimensions
  - Model transitions from state to state under actions
  - Predict agent difficulty from environment properties
concepts:
  - task dimensions
  - transition models
  - observability
prerequisites:
  - m1_02_agents_and_environments_peas
examRelevance: medium
tags:
  - agents
  - environments
---
# The Nature of Task Environments

**Problem: the same agent brain can be trivial or hopeless depending on the world it faces. By the end you can classify any task on all seven environment dimensions and predict what the agent will need (memory, speed, models).**

<a id="start-zero"></a>
## 1. Start From Zero: Why Classify Before Coding?

Building a taxi brain assuming an empty parking lot, then deploying it in monsoon city traffic, guarantees failure. The environment decides the agent's memory, algorithms, and reaction speed. Classification comes before code.

::: callout-intuition The Easiest Dream World
The simplest environment is fully observable, single-agent, deterministic, episodic, static, discrete, and known — like untimed digital Sudoku. Every step toward the real world (hidden cards, opponents, dice, memory across moves, ticking clocks, continuous steering, unknown rules) makes the agent harder to build. Use this only as a difficulty compass.
:::

**Tiny beginner example:** a photo-labeling agent sees the whole image (fully observable), acts alone, and each photo is independent (episodic). A taxi sees only part of the road (partially observable), shares it with rivals, and every turn affects the next (sequential). Same "drive pixels to decisions" idea, wildly different difficulty.

<a id="basics"></a>
## 2. Basic Building Blocks: The Seven Dimensions

**Data/state:** the world state; **goal:** name each dimension correctly. Russell and Norvig dimensions:

**1. Observability (sensor quality):** Fully observable (chess — all pieces visible) vs. partially observable (poker — hidden hands; taxi — blind corners) vs. unobservable (no sensors).

**2. Agent count:** Single (crossword, Solitaire) vs. multi — competitive (chess opponent) or cooperative (taxis coordinating at a junction).

**3. Determinism (transition certainty):** Deterministic (chess knight move lands exactly) vs. stochastic (Backgammon dice; wet-road braking) with known probabilities vs. non-deterministic (outcomes possible, probabilities unknown).

::: callout-formula Environment Transition Model, Symbol by Symbol
Current state `s`, action `a`, next state `s'`. Deterministic: `s' = T(s, a)` (one guaranteed result from transition function `T`). Stochastic: `P(s' | s, a)` (probability of landing in `s'` given `s` and `a`). Tiny numbers: dry brake stops in 10 m always (deterministic); wet brake stops in 10 m with probability 0.7, 15 m with 0.3 (stochastic).
:::

::: callout-pitfall Deterministic vs. Stochastic vs. Non-deterministic
Deterministic: exactly one outcome. Stochastic: many outcomes with known odds. Non-deterministic: many outcomes, odds unknown. Do not call dice "non-deterministic" — dice odds are known, so dice are stochastic.
:::

**4. Episodic vs. sequential (memory horizon):** Episodic splits into independent episodes (apple defect scanner — apple 5 never affects apple 6). Sequential couples decisions (chess opening shapes move 40).

**5. Static vs. dynamic (time pressure):** Static waits while thinking (crossword). Dynamic changes during thinking (taxi — 5 seconds of thought is a crash). Semi-dynamic: world frozen but score decays while thinking (chess with a clock).

**6. Discrete vs. continuous (granularity):** Discrete is countable (chess squares, dice 1-6). Continuous is real-valued (steering 14.5 degrees, speed 45.2 km/h, flowing time).

**7. Known vs. unknown (rule knowledge):** Known means the agent holds the rulebook/physics (Solitaire rules given). Unknown means it must discover rules by trial (a new game with no manual).

::: callout-pitfall Known vs. Observable (Critical Exam Trap)
Known = I know the rules. Observable = I can see the current state. Poker is known (rules clear) but partially observable (hands hidden). Chess with unknown rules is fully observable (pieces visible) but unknown (laws missing).
:::

<a id="formal-model"></a>
## 3. Formal Reference: The Master Matrix

**Method:** classify dimension by dimension with one-line justifications. Memorize this reference (formal layer after the intuition above):

```text
Environment        | Observable | Agents | Transition   | Horizon    | Time     | Space
Crossword          | Fully      | Single | Deterministic| Episodic   | Static   | Discrete
Chess (no clock)   | Fully      | Multi  | Deterministic| Sequential | Static   | Discrete
Chess (clock)      | Fully      | Multi  | Deterministic| Sequential | Semi-dyn | Discrete
Poker              | Partially  | Multi  | Stochastic   | Sequential | Static   | Discrete
Backgammon         | Fully      | Multi  | Stochastic   | Sequential | Static   | Discrete
Part-picking robot | Fully      | Single | Deterministic| Episodic   | Semi-dyn | Continuous
Automated taxi     | Partially  | Multi  | Stochastic   | Sequential | Dynamic  | Continuous
Medical diagnosis  | Partially  | Single | Stochastic   | Sequential | Dynamic  | Continuous
```

**Hardest task:** the automated taxi — partially observable, multi-agent, stochastic, sequential, dynamic, continuous (plus unknown when streets change). That is why chess engines do not transfer to Level-5 driving.

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

**Procedure traced:** Solitaire after the deal (face-down cards fixed): partially observable (hidden cards) and deterministic (flips reveal exactly). Static vs. dynamic vs. semi-dynamic and episodic vs. sequential are the favourite 3-mark pairs.

| Similar pair | Distinction |
|---|---|
| Static vs. episodic | Time (does the world wait?) vs. memory (does this decision affect the next?) |
| Stochastic vs. non-deterministic | Known odds vs. unknown odds |
| Fully observable vs. known | Seeing the state vs. knowing the rules |

**Watch out:** (1) A clock makes chess semi-dynamic, not dynamic — pieces freeze, the score bleeds. (2) Single hidden cards already make Solitaire partially observable. (3) "Unknown" never means "unseen right now" — it means the laws themselves are missing.

**Limitations:** classification predicts difficulty but selects no algorithm; observability plus determinism plus discreteness still leave exponential search (Module 2's problem).

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz You program an AI to play standard Solitaire on a computer. Once the cards are shuffled and dealt, all the face-down cards are locked in position. Which of the following best describes this environment?
() Fully Observable and Stochastic
() Partially Observable and Multi-Agent
(*) Partially Observable and Deterministic
() Fully Observable and Deterministic
::: explanation
Hidden face-down cards make it partially observable. Fixed locked cards make flips exact, hence deterministic once dealt.
:::

::: quiz A defect-scanning agent inspects apples on a paused conveyor belt. Its verdict on apple #5 has no effect on apple #6 — each decision stands alone, and the belt waits while it deliberates. The environment is:
() Sequential and Dynamic
(*) Episodic and Static
() Sequential and Stochastic
() Episodic and Multi-Agent
::: explanation
Episodic because decisions are independent atomic episodes; static because the belt waits during deliberation with no score decay.
:::

::: quiz An agent plays chess against a human with no clock, but it was never given the rules of chess and must discover legal moves by trial and error. How is this environment classified on the time and knowledge dimensions?
() Dynamic and Known
(*) Static and Unknown
() Semi-dynamic and Known
() Static and Known
::: explanation
Static because the board waits with no clock; unknown because the rulebook is missing and must be learned. Full observability of pieces is a separate dimension.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: static/dynamic/semi-dynamic or episodic/sequential. 7 marks: classify a scenario (Ludo, medical, taxi) on all seven with one-line justifications.
:::

**Recap facts examiners reward:** seven dimension names with one example each; transition formulas; semi-dynamic definition; known-vs-observable trap line.

### Sample 3-Mark Question
**Q: Explain static, dynamic, and semi-dynamic environments.**

**Model Answer:** Static: world waits during thought (crossword). Dynamic: world evolves during thought (taxi). Semi-dynamic: world frozen, performance decays during thought (chess with clock).

### Sample 7-Mark Question
**Q: Classify Ludo against humans on all seven dimensions.**

**Model Answer:** Fully observable (all tokens visible); multi-agent competitive; stochastic (die 1-6); sequential (token choice shapes captures); static (board waits); discrete (squares, integer dice); known (full rulebook given).
:::
