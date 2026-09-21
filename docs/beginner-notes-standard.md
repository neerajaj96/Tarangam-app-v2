# Tarangam Beginner-Notes Authoring Standard

Canonical content standard for Tarangam notes. Every conceptual note must
satisfy all 18 rules below; reviewers check against this list, not taste.

## The 18 rules

1. Assume the learner knows nothing about the topic — first principles first.
2. Define every abbreviation on first use (e.g. "TCP (Transmission Control Protocol)").
3. Define mathematical symbols before relying on them.
4. Explain the problem before explaining the solution.
5. Give an intuitive explanation without replacing the formal definition.
6. Include a very small beginner example (toy numbers, 3–4 node graphs, one packet).
7. Include a KTU-relevant worked example where appropriate.
8. Explain formulas symbol-by-symbol.
9. Explain algorithms step-by-step (numbered steps, then a trace).
10. Include common mistakes/confusions (a short "watch out" list).
11. Include a concise exam-oriented recap (facts an examiner rewards).
12. End with active-recall questions (answered by the note's quizzes/widgets).
13. Preserve rigorous technical detail; never simplify away syllabus material.
14. Avoid unexplained jargon; every term earns its place by being defined.
15. Avoid humour/analogy that obscures the actual concept.
16. Use analogies only as support for the exact technical explanation, then drop them.
17. Explicitly distinguish similar concepts (tables preferred: TCP vs UDP,
    precision vs accuracy, DFS vs BFS, LASSO vs RIDGE).
18. Correct technically over-absolute or misleading statements; qualify
    guarantees (convexity, optimality, convergence, "P = NP" consequences).

19. Every difficult element must be explainable in place. Whenever reasonably
    useful, provide an expandable explanation close to first use — not just a
    once-defined glossary — for: technical terms, abbreviations, acronyms,
    mathematical symbols, variables, formulas, notation, commands, command
    arguments, flags/options, API functions, programming statements,
    parameters, return values, hardware components, register names, protocols,
    algorithms, data structures, graph terms, ML/AI/networking/OS terminology,
    laboratory equipment, configuration values, units, diagrams, outputs,
    error messages, prerequisite concepts, individual procedural steps, and
    any phrase a first-time learner may reasonably find unfamiliar. The test
    is: "can a person who knows almost nothing understand this page itself?"
    Never compress several cognitive steps into one unexplained instruction:
    split compound steps (e.g. timer setup → what/why timer, prescaler,
    counter, interrupt, register, value, aftermath) with What/Why/How help
    where appropriate. Layer substantial concepts progressively (one-line
    meaning → beginner explanation → why → how → tiny example → formal/exam
    definition → common confusion), using progressive disclosure so the main
    flow stays readable: main explanation first, deeper and exam detail
    behind expandable help.

## Expandable-explanation mechanism

Use the existing `::: toggle <summary>` widget (renders as
`<details><summary>` — no new widget system):

::: toggle What does `EXAMPLE` mean?
Plain-markdown micro-explanation: what it is, why it is needed, and what
goes in / comes out. Never nest other `:::` widgets inside a toggle body.
:::

Cover per-item: for commands, each argument/flag plus what it changes, why,
verification, and undo; for code lines, what it does, why needed, inputs,
outputs; for formulas, every symbol and operation plus a tiny numerical
example; for errors, what happened and the fix. Keep toggle bodies to plain
markdown (text, lists, inline code, fenced code) so widget parsing stays
unambiguous.

## Canonical orders

- **Mathematics-heavy:** meaning → variables → intuition → formula → worked
  example → exam problem.
- **Algorithm-heavy:** problem → idea → data/input → step-by-step algorithm
  → trace → complexity → exam problem.
- **Networking:** real-world situation → terminology → protocol purpose →
  packet/message structure → operation flow → example.
- **ML/AI:** problem → data/state → goal → method → mathematical model →
  training/search procedure → example → limitations.

## Layering (mandatory shape)

Absolute beginner → basic understanding → formal theory → exam-level
application. Do not merely prepend an intro paragraph: rebuild the note so
a first-time learner can follow it end to end. Keep useful advanced
material; layer it after the foundations, never instead of them.

## Mechanical constraints (build gates)

- Keep topic IDs, filenames, front-matter shape, prerequisites, exam
  relevance, and widget syntax unless a factual correction requires change.
- Every `::: quiz` needs a matching `::: explanation`, exactly one correct
  option, and ≥2 options; explanations must be non-empty.
- Anchor `<a id="…">` ids must be unique within the page; code fences must
  balance; never nest widgets (no consecutive `:::` closers).
- `::: anim <id>` ids must already exist in `scripts/scenes.js` — never
  invent new ones. Keep existing `::: manim` video references as-is.
