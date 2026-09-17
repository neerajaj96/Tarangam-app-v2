# Knowledge-Based Agents & the Wumpus World

**Tell/Ask knowledge bases, entailment vs. inference, the Wumpus PEAS and percept rules, and why this toy dungeon drives all of logic-based AI.**

<a id="the-intuition"></a>
## 1. Why a Dungeon?

::: callout-intuition Core Mental Model: The Cautious Spelunker
You enter a pitch-dark cave rumored to hold gold, bottomless pits, and a sleeping monster. You cannot see — but the cave *talks*: a cold draft means a pit is next door; a foul smell means the monster is adjacent; a glint means gold is *here*. A **knowledge-based agent** plays exactly this game: it stores everything it perceives as **sentences** in a **knowledge base (KB)**, combines them with general rules ("draft ⇒ pit nearby"), and deduces safe moves it has never directly observed. The Wumpus World is the smallest universe where *reasoning beats seeing*.
:::

A knowledge-based agent runs one eternal loop: **TELL** the KB what it perceives, **ASK** the KB what to do, **EXECUTE** the answer. Declarative knowledge (facts + rules) stays cleanly separated from the dumb inference procedure that grinds on it — add zoology tomorrow by TELLing sentences, without touching a line of code.

---

<a id="the-dimensions"></a>
## 2. The World: PEAS, Percepts, Rules

**Performance:** +1000 for grabbing the gold and climbing out, −1000 for death (pit or live Wumpus), −1 per action, −10 per arrow fired. **Environment:** a $4 \times 4$ grid (walls all around), fixed pits, one Wumpus, one gold pile. **Actuators:** move forward, turn left/right, grab, shoot (one arrow, flies straight until wall or Wumpus — killing it produces a **Scream** everywhere), climb out. **Sensors:** five percept lists per square — **Stench** (Wumpus orthogonally adjacent), **Breeze** (pit orthogonally adjacent), **Glitter** (gold *here*), **Bump** (walked into a wall), **Scream** (Wumpus just died).

```text
y=4  [Stench]   [OK]       [Breeze]   [PIT]
y=3  [WUMPUS]   [St,Br,Gl] [PIT]      [Breeze]
y=2  [Stench]   [OK]       [Breeze]   [OK]
y=1  [START,OK] [Breeze]   [PIT]      [Breeze]
      x=1        x=2        x=3        x=4
```

::: callout-formula Formal Core: Entailment vs. Inference
The KB **entails** $\alpha$ ($KB \models \alpha$) if $\alpha$ is true in *every* world where the KB is true — a semantic, god's-eye fact. An **inference procedure** $i$ **derives** $\alpha$ ($KB \vdash_i \alpha$) by pushing symbols around syntactically. The procedure is **sound** if everything it derives is entailed, **complete** if it derives everything entailed. Sound + complete = reasoning you can bet the agent's life on.
:::

---

<a id="worked-example"></a>
## 3. Deducing Safety at (1,2)

Start: agent at (1,1), percepts `[None,None,None,None,None]` — TELL gives $\lnot P_{1,1} \land \lnot W_{1,1}$. Move to (1,2), perceive `[Stench,None,None,None,None]`. The KB holds the general rule $S_{x,y} \Leftrightarrow W_{x+1,y} \lor W_{x-1,y} \lor W_{x,y+1} \lor W_{x,y-1}$ (stink means Wumpus next door) plus visited-square facts. From $S_{1,2}$ plus $\lnot W_{1,1}$ (visited safe) and the wall at $(0,2)$, the live candidates are $(1,3)$ and $(2,2)$ — so the agent derives $W_{1,3} \lor W_{2,2}$ — *a disjunction, not a location*. It cannot prove either square safe, so the rational move is to retreat and probe (2,1) instead. That is logic doing genuine work: knowing *that you don't know*, exactly.

::: anim wumpus-deduce From Stench to Disjunction
Watch the visited square check in, the stench square flag, and the two candidate squares pulse — while the verdict stays what logic actually earned: a disjunction, never a guess.
:::

::: callout-pitfall Percepts Are Local, Conclusions Are Global
Stench reports *adjacency*, never identity — students constantly write "stench ⇒ Wumpus here." Breeze, stench, and glitter each constrain a *neighborhood*; only combined sentences across squares pin down single cells. Every Wumpus exam trap exploits this slippage.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz The agent perceives Glitter in its current square. What does it validly know, and what must it do?
(*) Gold is in this exact square (glitter is co-located, not adjacent) — Grab it
() Gold is in some neighboring square — go explore
() The Wumpus is here — shoot immediately
() Nothing — glitter carries no information
::: explanation
Glitter is the one *co-located* percept: unlike stench/breeze (adjacency), it fires only where the gold sits. The correct response is Grab — the one action whose precondition needs no inference at all.
:::

::: quiz Which statement best captures soundness versus completeness of an inference procedure?
() Sound means fast; complete means memory-efficient
(*) Sound means everything derived is truly entailed (no lies); complete means everything entailed can be derived (nothing missed)
() Sound means it handles Horn clauses; complete means it handles full FOL
() They are synonyms for determinism
::: explanation
Soundness ($KB \vdash \alpha \Rightarrow KB \models \alpha$) forbids false conclusions; completeness ($KB \models \alpha \Rightarrow KB \vdash \alpha$) forbids missed ones. A lying-but-thorough agent is complete yet unsound; a silent-but-honest one is sound yet incomplete. You need both before trusting deductions with the agent's life.
:::

::: quiz Why is the Wumpus World (rather than chess) the canonical testbed for knowledge representation?
() Chess has no legal moves worth representing
(*) It is small enough to fully specify yet forces genuinely partial observability, so survival depends on *combining* local percepts with general rules — the exact skill KR exists to provide
() The Wumpus can be bribed, unlike chess pieces
() Chess forbids knowledge bases by tournament rule
::: explanation
Chess is fully observable — search suffices, representation adds little. The dungeon's darkness makes raw search blind; only an agent that *stores percepts as sentences* and *derives unseen facts* survives. Partial observability + logical rules = the KR sweet spot in miniature.
:::

---

<a id="exam-focus"></a>
## 5. Worked University Exam Q&A

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** PEAS of the Wumpus agent, or the five percepts with meanings.
* **7 Marks:** Given a percept history, derive which squares are provably safe (show the Tell/Ask sentences used).
:::

### Sample 3-Mark Question
**Q: List the five Wumpus percepts and state what each indicates.**

**Model Answer:** **Stench** — Wumpus in an orthogonally adjacent square; **Breeze** — pit adjacent; **Glitter** — gold in the *current* square; **Bump** — attempted move into a wall (position unchanged); **Scream** — the Wumpus died (heard everywhere, once). Stench/breeze constrain neighborhoods; glitter alone is co-located.

### Sample 7-Mark Question
**Q: The agent visits (1,1) (no percepts) then (2,1) (breeze). Using KB sentences, prove (2,2) may hold a pit while (1,2) is provably safe.**

**Model Answer:** TELL: $\lnot P_{1,1}$, $\lnot W_{1,1}$, $B_{2,1}$. Rule: $B_{2,1} \Leftrightarrow P_{1,1} \lor P_{3,1} \lor P_{2,2}$. Since $\lnot P_{1,1}$, deduce $P_{3,1} \lor P_{2,2}$ — pit possibly at (2,2), unproven either way. For (1,2): breeze rule at (1,1) would be $B_{1,1} \Leftrightarrow P_{2,1} \lor P_{1,2}$; observed $\lnot B_{1,1}$ forces $\lnot P_{2,1} \land \lnot P_{1,2}$ — (1,2) provably pit-free. Combined with no stench anywhere visited, (1,2) is the safe probe.
