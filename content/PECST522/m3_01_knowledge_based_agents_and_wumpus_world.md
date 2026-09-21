---
id: m3_01_knowledge_based_agents_and_wumpus_world
courseCode: PECST522
module: 3
sequence: 1
title: Knowledge-Based Agents & the Wumpus World
difficulty: beginner
estimatedMinutes: 8
learningObjectives:
  - Separate entailment as semantic fact from inference as procedure
  - Specify the Wumpus PEAS with its five percept meanings
  - Derive safe squares from percept histories with Tell and Ask
concepts:
  - knowledge bases
  - entailment
  - Wumpus world
prerequisites:
  - m1_02_agents_and_environments_peas
examRelevance: high
tags:
  - knowledge-representation
  - wumpus-world
---
# Knowledge-Based Agents & the Wumpus World

**Problem: the agent cannot see the dungeon — how can it still act safely? By the end you can run the Tell/Ask loop, separate entailment from inference, and derive provably safe squares from percept histories.**

<a id="start-zero"></a>
## 1. Start From Zero: Why a Dungeon?

You enter a dark cave with gold, pits, and a monster. You cannot see — but the cave talks: a draft means a pit is next door; a smell means the monster is adjacent; a glint means gold is *here*. A **knowledge-based agent** stores everything as **sentences** in a **knowledge base (KB)** — a stored set of facts plus general rules — combines them, and deduces safe moves it never observed.

**Definitions:** **TELL** adds percept sentences to the KB. **ASK** queries what follows (what to do). **Entailment** (`KB |= alpha`, read "KB entails alpha") is the semantic fact that `alpha` is true in every world where the KB is true. **Inference** (`KB |- alpha`, "derives") is the syntactic procedure pushing symbols. **Sound** means everything derived is entailed (no lies). **Complete** means everything entailed is derivable (nothing missed).

::: toggle What are `knowledge base`, `sentence`, `percept`, `model`, `entailment`, `inference`?
Knowledge base = stored sentences (facts + general rules — the agent's written beliefs). Sentence = one logical claim (percept reports like "stench at (1,2)", rules like "stench iff adjacent Wumpus"). Percept = one sensor snapshot (stench/breeze/glitter/bump/scream at the current square). Model = one fully-specified world (every square's contents fixed — a what-if reality). Entailment (`|=`) = true in every KB-satisfying model (semantic fact — god's-eye). Inference (`|-`) = reached by running rules on symbols (syntactic procedure — machine's-eye). Sound + complete procedures make the two coincide.
:::

::: toggle Trace safety at (1,2) from the stench percept
Perceive stench at (1,2): TELL `Stench(1,2)`. Rule: stench iff Wumpus orthogonally adjacent → candidates (1,1), (2,2), (1,3) — (0,2) is wall (eliminate). Visited-safe (1,1) eliminates itself (no Wumpus where the agent stood alive unharmed... precisely: visited squares proved safe). Remaining disjunction: `W(1,3) OR W(2,2)` — certainty about the set, ignorance within it. ASK "is (1,3) safe?" → unprovable (no disjunct entailed). Rational move: probe elsewhere (2,1) instead of guessing a disjunct. Logic earns "I don't know which" — acting on ignorance is rationality.
:::

::: callout-intuition Core Mental Model: The Cautious Spelunker
Reasoning beats seeing where seeing is impossible. Drop the cave after this; Tell/Ask plus entailment-vs-inference are the technical content.
:::

**Tiny beginner example:** KB holds "draft means adjacent pit" plus "square (1,1) had no draft." ASK "is (1,2) pit-free?" — yes, proven without visiting, because the rule plus the observation jointly force it.

<a id="basics"></a>
## 2. Basic Layer: PEAS, Percepts, Rules

**Data/state:** five percept lists per square. **Goal:** grab gold and climb out alive.

**Performance:** +1000 gold-and-out, -1000 death (pit or live Wumpus), -1 per action, -10 per arrow. **Environment:** 4x4 grid with walls, fixed pits, one Wumpus, one gold pile. **Actuators:** step forward, turn left/right, grab, shoot (one arrow flying straight; killing the Wumpus broadcasts a **Scream** everywhere), climb out. **Sensors:** **Stench** (Wumpus orthogonally adjacent — sharing an edge, not diagonal), **Breeze** (pit orthogonally adjacent), **Glitter** (gold co-located *here*), **Bump** (walked into a wall, position unchanged), **Scream** (Wumpus just died, heard everywhere once).

```text
y=4  [Stench]   [OK]       [Breeze]   [PIT]
y=3  [WUMPUS]   [St,Br,Gl] [PIT]      [Breeze]
y=2  [Stench]   [OK]       [Breeze]   [OK]
y=1  [START,OK] [Breeze]   [PIT]      [Breeze]
      x=1        x=2        x=3        x=4
```

::: callout-formula Formal Core: Entailment vs. Inference
`KB |= alpha`: true in every KB-world (god's-eye fact). `KB |- alpha`: derived by procedure `i` (symbol pushing). Sound: derives only entailed. Complete: derives all entailed. Sound plus complete means deductions are bet-your-life trustworthy.
:::

The agent loops forever: TELL percepts, ASK for action, EXECUTE. Declarative knowledge stays separate from the inference engine — new zoology arrives as sentences, not code changes.

<a id="formal-model"></a>
## 3. Formal Layer: Deducing Safety at (1,2)

**Procedure — percept-to-safety deduction (steps then trace):** Step 1: TELL visited facts (at (1,1) with silence: no pit, no Wumpus here). Step 2: TELL general rules (stench at (x,y) iff Wumpus in an orthogonal neighbour). Step 3: ASK about candidates; accept only proven-safe squares.

**Trace:** start (1,1) silent — TELL `not P(1,1)`, `not W(1,1)`. Move to (1,2), perceive stench only. Rule: stench means Wumpus in (1,1)/(2,2)/(1,3)/(0,2). Eliminate (1,1) by visited-safe and (0,2) by wall: live candidates (1,3), (2,2). Derive `W(1,3) OR W(2,2)` — a disjunction (an "or" statement), not a location. Cannot prove either square safe, so retreat and probe (2,1) instead. Logic's honest output is sometimes "I don't know which" — and acting on that ignorance (probing elsewhere) is rationality.

::: anim wumpus-deduce From Stench to Disjunction
Watch the visited square check in, the stench square flag, and the two candidate squares pulse — while the verdict stays what logic actually earned: a disjunction, never a guess.
:::

::: callout-pitfall Percepts Are Local, Conclusions Are Global
Stench reports adjacency, never identity — "stench implies Wumpus here" is the exam trap. Breeze, stench, and glitter constrain neighbourhoods; only combined sentences across squares pin single cells.
:::

<a id="worked-example"></a>
## 4. Worked Example, Distinctions, Limitations

| Similar pair | Distinction |
|---|---|
| Entailment vs. derivation | Semantic truth-in-all-models vs. syntactic rule-pushing (soundness/completeness bridge them) |
| Stench/breeze vs. glitter | Adjacent-world constraint vs. co-located fact (only glitter means "here") |
| Disjunction vs. location | Certainty about a set vs. certainty within it (probe, never assume a disjunct) |

**Watch out:** (1) Scream is global and one-time; bump means position frozen. (2) One silent square proves its neighbours pit-free only via the biconditional rule, not by vibes. (3) Safe means proven pit-free *and* Wumpus-free — check both.

**Limitations:** propositional encoding needs one symbol per square-property (scales poorly — next topics' motivation); inference without probabilities cannot rank risks, only prove or withhold safety.

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz The agent perceives Glitter in its current square. What does it validly know, and what must it do?
(*) Gold is in this exact square (glitter is co-located, not adjacent) — Grab it
() Gold is in some neighboring square — go explore
() The Wumpus is here — shoot immediately
() Nothing — glitter carries no information
::: explanation
Glitter fires only where gold sits, unlike adjacency percepts. Grab needs no inference — its precondition is already met.
:::

::: quiz Which statement best captures soundness versus completeness of an inference procedure?
() Sound means fast; complete means memory-efficient
(*) Sound means everything derived is truly entailed (no lies); complete means everything entailed can be derived (nothing missed)
() Sound means it handles Horn clauses; complete means it handles full FOL
() They are synonyms for determinism
::: explanation
Soundness forbids false conclusions; completeness forbids missed ones. Trustworthy reasoning needs both.
:::

::: quiz Why is the Wumpus World (rather than chess) the canonical testbed for knowledge representation?
() Chess has no legal moves worth representing
(*) It is small enough to fully specify yet forces genuinely partial observability, so survival depends on *combining* local percepts with general rules — the exact skill KR exists to provide
() The Wumpus can be bribed, unlike chess pieces
() Chess forbids knowledge bases by tournament rule
::: explanation
Chess is fully observable so search suffices. The dungeon's darkness makes raw search blind; only sentence-storing, fact-deriving agents survive. KR = Knowledge Representation.
:::

<a id="exam-focus"></a>
## 6. Exam Recap and Worked Q&A

::: callout-exam KTU University Exam Focus
3 marks: Wumpus PEAS or five percepts with meanings. 7 marks: percept-history safety proof showing Tell/Ask sentences.
:::

**Recap facts examiners reward:** Tell/Ask/Execute loop; `|=` vs. `|-` with sound/complete; five percepts (stench/breeze adjacent, glitter co-located, bump wall, scream global); disjunction-not-location discipline.

### Sample 3-Mark Question
**Q: List the five Wumpus percepts and meanings.**

**Model Answer:** Stench: adjacent Wumpus. Breeze: adjacent pit. Glitter: gold here. Bump: wall hit, unmoved. Scream: Wumpus died, heard everywhere once.

### Sample 7-Mark Question
**Q: Visited (1,1) silent then (2,1) breezy — prove (1,2) safe, judge (2,2).**

**Model Answer:** TELL `not P(1,1)`, `not W(1,1)`, breeze at (2,1). Breeze rule forces `P(1,1) OR P(3,1) OR P(2,2)`; with `not P(1,1)` leaves suspects (3,1)/(2,2), neither provable. Silence at (1,1) via the (1,1)-breeze biconditional forces `not P(2,1)` and `not P(1,2)`; no stench forces Wumpus-free — (1,2) provably safe, (2,2) possibly mined, so probe (1,2).
:::
