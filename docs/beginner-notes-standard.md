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
