# Tarangam Content Authoring Standard

Authoritative standard for every Tarangam lesson/topic. A content-generation
agent must be able to use this document directly: follow it section by
section, then pass the checklists at the end before submitting a topic.

Relationship to existing documents (not a competing framework):

- `docs/beginner-notes-standard.md` — the 18 beginner rules plus the
  `::: toggle` expandable-explanation mechanism. This standard incorporates
  those rules and adds continuity, progression, formulas, worked problems,
  recall, exam alignment, source grounding, visualization selection, and
  repository alignment. Where the two overlap, this document governs; the
  toggle mechanism itself is defined there and reused here unchanged.
- `data/topic-schema.json` — canonical front-matter shape (fields,
  patterns, enums). Never invent new keys (`additionalProperties: false`).
- `data/curriculum.json` — canonical course/module/topic-count source.
  Never auto-edit it to fit new content.
- `docs/visualization-map.md` + `data/viz-map.json` — which topics need
  which representation. Consult before adding any visual.

## 1. Learner model

Assume the learner is an absolute beginner unless a concept was explicitly
established in an earlier Tarangam topic. The learner has read the
preceding topics in path order and nothing else. The target: a learner who
knows almost nothing can follow the topic without feeling that the author
skipped a step. Every added sentence must introduce knowledge, explain
reasoning, connect ideas, demonstrate with an example, prevent confusion,
or help solve a problem — otherwise delete it.

## 2. Absolute-beginner teaching rules

For every new concept, term, notation, symbol, formula, procedure, or
conclusion:

1. Say WHAT it is in simple everyday language first.
2. Say WHY it exists / why we need it.
3. Say HOW it works.
4. Say WHEN/WHERE it is used, when relevant.
5. Introduce every technical word BEFORE relying on it — never use a term
   as if the learner already knows it.
6. Explain every symbol in an equation before using the equation.
7. Show intermediate reasoning for every mathematical, algebraic, or
   logical step that is educationally important. No hidden jumps.
8. Convert abstract ideas into a small concrete example (toy numbers,
   3–4 node graphs, one packet) whenever it improves understanding.
9. Explain the rule AND the reason behind the rule.
10. Explain the purpose of important steps, not just their execution.
11. Distinguish easily confused concepts explicitly (see §10).
12. Never assume background knowledge: no hidden prerequisite jumps
    (see §4). If Topic B needs Concept X that no earlier topic
    established, teach the minimum foundation for X first.
13. Explain reasoning, not merely conclusions.
14. Technical correctness alone is not clarity: never assume a beginner
    understands a sentence merely because its terminology is correct.
15. No meaningless verbosity — §1 governs every sentence.

The learner must never reach an important sentence and think:
“How was I supposed to know that?”

## 3. Continuity — hard rule

Tarangam is ONE continuous course, not isolated notes. The chain is:
previous topic → understood concepts → next topic → new layer.

Every topic must:

- Connect explicitly to the immediately relevant previously established
  concepts.
- Begin with a short bridge from prior learning when needed. Pattern:
  “In the previous topic, we learned X. X tells us ____. Now we need one
  more idea: Y. Y extends X by ____.”
- Treat earlier concepts as already learned. Do NOT reteach them.
- Give only a concise reminder when an earlier concept is needed, then
  continue into the new material.
- Introduce (not assume) any prerequisite no earlier topic established.

“Continuation without repetition” does NOT mean removing explanations:

- (A) Genuinely NEW material → explain deeply (full §2 treatment).
- (B) Already-established material → brief reminder, then build on it.
- (C) Genuinely MISSING prerequisites → introduce the minimum foundation,
  then continue. Never silently assume.

Repetition for reinforcement is allowed; copying an old explanation is
not. A later topic must feel like “one level deeper”, never “the same
chapter again”. Do NOT do “let us again learn X from scratch” unless the
topic genuinely requires a deeper treatment of X.

## 4. Prerequisite handling

- List real prerequisites in front-matter `prerequisites:` (topic ids).
- In prose, bridge with a 1–2 sentence reminder that names the established
  meaning, e.g. “Recall from {topic}: a queue serves first-in-first-out,
  so the first discovered node leaves first.”
- If the dependency chain has a gap (needed concept never established):
  name it, teach the smallest sufficient foundation in place, then
  proceed. The final quality test (§15) must pass on every sentence.

## 5. Progressive depth

Teach in layers, in this preferred order:

intuition → precise definition → terminology → why it exists →
how it works → relation to previous concepts → concrete example →
worked example → deeper reasoning → application → common
mistakes/confusions → active recall → practice problems → KTU relevance.

Use this as a teaching model, not a rigid visual template: do not force
every heading when it does not fit, but never begin with the formal
definition when an intuition would make it understandable, and never stop
at intuition when later topics or exams need the precise definition.

Canonical orders per topic kind (from the beginner standard):

- Mathematics-heavy: meaning → variables → intuition → formula → worked
  example → exam problem.
- Algorithm-heavy: problem → idea → data/input → step-by-step algorithm →
  trace → complexity → exam problem.
- Networking: real-world situation → terminology → protocol purpose →
  packet/message structure → operation flow → example.
- ML/AI: problem → data/state → goal → method → mathematical model →
  training/search procedure → example → limitations.

Layer as: absolute beginner → basic understanding → formal theory →
exam-level application. Keep advanced material; put it after foundations.

## 6. Terminology rules

- Define every abbreviation on first use (“TCP (Transmission Control
  Protocol)”), then use the short form.
- Define every mathematical symbol before relying on it.
- No unexplained jargon; every term earns its place by being defined.
- Analogies only support the exact technical explanation, then drop
  them. Never use humour/analogy that obscures the concept.
- For any item a first-time learner may find unfamiliar (terms, symbols,
  commands, flags, API calls, parameters, errors, units, diagram outputs,
  individual procedural steps), prefer an in-place `::: toggle`
  micro-explanation near first use so the page itself is self-contained.
  Toggle bodies stay plain Markdown (text, lists, inline code, fenced
  code) and never nest other `:::` widgets.

## 7. Formulas and numerical topics

Whenever a formula appears, in order:

1. State the formula.
2. Say what it means in plain language.
3. Explain every symbol.
4. Explain why it works / what relationship it expresses.
5. Substitute actual values.
6. Show the calculation step by step.
7. State the result with units where applicable.
8. Explain what the result means in ordinary language.
9. Mention the common mistake when relevant.

Never write a formula and immediately use it. Never present a final
calculation as a black box.

## 8. Worked problems

For every meaningful worked problem (numerical, algorithmic,
programming, networking, logical), expose all of:

- What is being asked.
- What information is known; what is unknown (what must be found).
- Which concept/formula/algorithm applies — and WHY it applies here.
- Each solution step, with its reasoning.
- The final result plus its plain-language interpretation.
- The likely beginner mistake.

Example skeleton (adapt, do not copy blindly):

```markdown
::: step [Step 1: Setup] Formulating the Problem
What is asked, what is known, what must be found.
:::
::: step [Step 2: Execution] Applying <method>
Why this method fits, then each step with its reason.
:::
::: step [Step 3: Conclusion] Final Result
Result with units, what it means, and the beginner mistake to avoid.
:::
```

## 9. Concrete examples

- Include a very small beginner example early (toy numbers, one packet,
  3–4 nodes) AND a KTU-relevant worked example where appropriate.
- Examples must be checkable: the learner can redo them by hand.
- Bridge example: “In the previous topic we queued [1] → [2,3]. Now the
  same queue on a new graph …” — old skill, new layer.

## 10. Common confusions

- Maintain a short “watch out” list per topic: sign conventions,
  boundary conditions, overloaded words, mirrored cases.
- Distinguish similar pairs explicitly, tables preferred
  (TCP vs UDP, precision vs accuracy, DFS vs BFS, LASSO vs RIDGE,
  state vs node, BFS layers vs DFS depth).
- Correct over-absolute statements: qualify guarantees (optimality,
  convergence, completeness) with their exact conditions.

## 11. Active recall

- Important topics end with retrieval practice testing understanding,
  not memorization (“why does BFS give shortest paths?” beats “what does
  BFS stand for?”).
- Use the `::: quiz` system: every quiz needs its `::: explanation`,
  exactly one correct option (marked `(*`), ≥2 options, non-empty
  explanation. Distractors must encode real misconceptions from §10.

## 12. KTU / exam alignment

Keep content academically useful for KTU examinations without letting
exam formatting destroy conceptual teaching. Where appropriate,
distinguish: concept understanding, definition-style answers,
short-answer material, descriptive answers, numerical/problem-solving,
common exam traps. End theory-heavy topics with a concise exam recap —
facts an examiner rewards — plus `examRelevance: low|medium|high` set
honestly in front matter.

## 13. Source grounding

Future content may derive from books, PDFs, lecture notes, or supplied
material. Then: be factually accurate; ground source-dependent claims in
the source; never fabricate citations; never pretend an unsupported claim
came from a source; preserve important source distinctions; reconcile
conflicting sources explicitly rather than silently inventing a
conclusion.

## 14. Visualization selection

Visualization is not decoration. Add one only when it makes something
materially easier to understand than text alone. Every visual must
answer: “What becomes easier to understand because this exists?” Do not
create a visualization merely because a primitive exists.

| Learning task | Representation |
|---|---|
| Exact comparison | Table / `::: viz compare` |
| Ordered process | `::: viz flow` / `::: viz stepper` |
| Evolving algorithmic state | `::: viz trace` |
| Branching / hierarchy | `::: viz tree` |
| Network / cycles / topology | `::: viz graph` (+ SVG scenes) |
| Fixed field layout (headers, packets) | `::: viz structure` |
| Quantitative reasoning | `::: viz lab` (+ registered calculation) |
| Multiple perspectives | `::: viz tabs` |
| Bespoke motion | `::: anim <registry-id>` (ids must exist in `scripts/scenes.js`; never invent) |
| Retrieval | `::: quiz` |

Widget discipline (build gates fail otherwise):

- Never nest widgets (no consecutive `:::` closers); toggle bodies stay
  plain Markdown.
- Keep `::: manim` video references as-is; do not invent media.
- Each primitive has strict grammar enforced by `scripts/check.js`
  (flow/stepper steps, tabs `Label :: content`, compare `##` sections,
  structure fields, lab ids, trace state/op chains, tree hierarchy,
  graph nodes/edges). Malformed blocks stay raw and fail the check —
  write valid blocks or plain prose.
- Static-first: every widget must read completely without JavaScript.

## 15. Metadata, naming, and budgets

- File: `content/<COURSE>/m{module}_{sequence}_{slug}.md`
  (`00` = module overview, `99` = practice lab). Never rename to chase
  content; `topicCount` and the manifest gate on these.
- Front matter (exact keys, `data/topic-schema.json`): `id` (= filename
  without `.md`), `courseCode`, `module`, `sequence`, `title`
  (≤200 chars), `difficulty`, `estimatedMinutes`, `learningObjectives`
  (≥1), `concepts`, `prerequisites`, `examRelevance`, `tags` (slugs).
- Anchor `<a id="…">` ids unique per page; code fences balanced.
- Respect performance budgets (`scripts/performance-budget.js`): largest
  single topic page 160 KiB — depth is welcome, bloat is not. Prefer one
  tiny hand-checkable example over a large dump.

## 16. Content quality checklist

Before submitting, verify every item:

- [ ] First-principles opening; problem before solution.
- [ ] Every new term/symbol defined before use; abbreviations expanded.
- [ ] What → why → how (+ when/where if relevant) for each key idea.
- [ ] No hidden logical/mathematical/conceptual jumps.
- [ ] Tiny beginner example plus KTU worked example where appropriate.
- [ ] Formulas follow §7; problems follow §8.
- [ ] Confusions distinguished; guarantees qualified.
- [ ] Quizzes test understanding; quiz gates pass.
- [ ] Bridge to previous topics present; old material reminded, not
  retaught; missing prerequisites introduced, none assumed.
- [ ] Visuals justified (§14 test); widget grammars valid.
- [ ] Front matter/naming/anchors/fences valid; budgets respected.
- [ ] Sources grounded; no fabricated citations.

## 17. Author self-review and definition of done

Final author test (both must be “yes”):

1. “Could a learner who studied only the preceding Tarangam topics
   understand every important sentence of this topic?”
2. “Did this topic teach the new layer rather than restart the previous
   topic?”

Enforcement line: deeply explain every genuinely new idea; briefly
reinforce already-established ideas; never hide a prerequisite; never
create unnecessary repetition.

A topic is DONE when: it passes §16, passes both questions above, and
passes the repository gates (`npm run build:notes`, `npm test`).
