# Tarangam Source-Grounded Content Pipeline

Repeatable workflow for turning source material into Tarangam lessons:
SOURCE MATERIAL → generation → source-grounded draft → OpenCode
integration → build/check → review → commit. One topic at a time.
Governing teaching rules live in `docs/content-authoring-standard.md`;
this document defines who does what, in which order, with which
handoffs. No external platform, no new application, no new repo
infrastructure.

## 1. Roles

- **Source storage (outside the repo).** Books, PDFs, lecture notes,
  syllabus documents, and reference texts stay in their existing homes
  (Google Drive, local disk). They are NEVER committed to the repo
  (binary bloat, licensing, privacy). Each pipeline run references them
  by name + version/date only.
- **Gemini / content generation.** Produces the beginner-first draft
  from explicitly supplied source excerpts, following
  `docs/content-authoring-standard.md` and the continuity brief from
  OpenCode (previous-topic concepts, next-topic boundary).
- **OpenCode / integration.** Owns the repository: inspects exact
  structure, places content in the correct topic file, preserves
  metadata/schema/build conventions, uses existing widgets and
  visualization primitives, runs gates, and commits. Never invents
  citations, never rewrites unrelated topics.
- **Review (human or reviewer agent).** Independent verification against
  §5 before commit. Review findings go back to generation (teaching
  defects) or integration (convention defects), never straight to main.

Reference implementation of the full loop: the gold-standard elevation
of `content/PCCST501/m1_01_internet_overview_and_network_edge.md`.

## 2. Stage inputs and outputs

| Stage | Input | Output |
|---|---|---|
| 0. Select | Course/module sequence from `data/curriculum.json`; viz need from `data/viz-map.json` | One target topic id + file path |
| 1. Continuity brief (OpenCode) | Target file + its neighbors in sequence | Brief: established concepts (A/B list), next-topic boundary, missing-prerequisite candidates |
| 2. Source pack (human) | Drive/PDFs/notes | Named excerpts (doc, pages/sections, date) + syllabus scope for this topic only |
| 3. Generate (Gemini) | Standard + continuity brief + source pack + gold-standard reference | Draft Markdown + provenance record (claim → source location or “author derivation”) |
| 4. Integrate (OpenCode) | Draft + target file | Edited topic file: existing front matter kept, valid widgets only, no unrelated changes |
| 5. Gates | Edited file | `npm run build:notes` clean, `npm test` green, dist diff scoped to the topic |
| 6. Review (§5) | Gates-green tree | Pass → commit; fail → return to stage 3 or 4 with findings |
| 7. Commit | Reviewed tree | Single-topic commit; working tree clean |

## 3. Source and provenance expectations

- Generation receives source as pasted excerpts or cited sections, never
  “go find the book”. Vague sourcing (“from standard textbooks”) is
  rejected at review.
- The draft carries a short provenance record: each source-dependent
  claim maps to an excerpt location; unattributed sentences are the
  generator's own derivations (reasoning, examples, bridges) and must be
  technically checkable, not factual claims about the world.
- Never invent citations, page numbers, or quotations. Never present an
  unsupported claim as sourced. Conflicting sources are reconciled
  explicitly in the draft notes (which claim won and why), not silently
  merged.
- Real standards/figures (ADSL rates, IEEE numbers, protocol constants)
  keep their deployment-dependent qualifications from the source; never
  harden an illustrative figure into a universal constant.

## 4. Topic continuity mechanism

Per-topic state is tiny and explicit — no new system:

1. OpenCode reads the target file's `prerequisites:` plus the two
   neighboring files in sequence order.
2. The continuity brief lists: (A) concepts the draft may assume (with
   their established meanings), (B) the next topic's opening boundary
   the draft must not cross, (C) candidate gaps the draft must close
   in place.
3. The draft opens with the §3 bridge pattern and uses (A) as reminders
   only; anything in (C) gets minimum-foundation treatment.
4. Review re-checks the bridge against the actual neighbor files, not
   the brief.

## 5. Review checklist (all must pass)

- Technical correctness: every fact, number, formula, and example
  recomputed or re-derived, not trusted from the draft.
- Beginner accessibility: §2 rules of the standard, sentence by
  sentence on first read.
- Continuity: bridge matches real neighbors; (B) reminders brief;
  (C) gaps closed; no silent assumptions.
- No unnecessary repetition: old material reminded, not retaught; later
  topic reads one level deeper, never the same chapter again.
- Prerequisites: front-matter ids real and sufficient.
- Formulas/worked problems: §7/§8 of the standard, units included,
  classic mistakes addressed.
- KTU alignment: honest `examRelevance`, exam recap factual, traps real.
- Visualization: passes the “what becomes easier?” test; valid strict
  grammar; static-first readable; no decoration.
- Source integrity: provenance record complete; no fabricated
  references; qualifications preserved.
- Repository: filename/front matter/widgets/quiz gates valid; diff
  scoped to the topic (+ build-derived outputs); budgets unbreached.

## 6. Failure cases and routing

| Failure | Symptom | Route to |
|---|---|---|
| Teaching defect | Skipped step, undefined term, hidden jump, assumed prerequisite | Generation (stage 3), with the exact sentence quoted |
| Convention defect | Bad widget, broken gate, metadata drift, unrelated churn | Integration (stage 4) |
| Source defect | Unsupported claim, invented citation, over-hardened figure | Source pack (stage 2) — new excerpt required, never a guess |
| Scope defect | Next-topic material taught, neighbor re-explained | Generation, with boundary restated |
| Gate defect | `build:notes`/`test`/budget failure | Integration; commit blocked until green |

Never commit over a red gate. Never fix a teaching defect with an
integration shortcut (and vice versa).

## 7. Recommended topic-by-topic workflow

1. Pick the next topic in curriculum sequence (never skip ahead; the
   chain is the product).
2. OpenCode: inspect target + neighbors, write the continuity brief.
3. Human: supply the source pack for this topic only.
4. Gemini: draft against the standard, the brief, and the gold-standard
   reference; attach provenance.
5. OpenCode: integrate minimally, run `npm run build:notes` + `npm test`,
   inspect the dist diff for scope.
6. Review against §5; route failures per §6.
7. Commit one topic; confirm a clean tree.

## 8. Scaling strategy

- Start one topic at a time. Batch size grows only after consecutive
  topics pass review without teaching-defect returns.
- The gold-standard topic is the bar: a new topic ships when it reads
  like the next chapter of the same course, not like a new article.
- Never mass-generate the curriculum blindly. Parallel generation is
  allowed only for non-adjacent topics with frozen briefs, and each
  still reviews independently.
