# Tarangam Master Product Roadmap

> The single planning reference for Tarangam. This document describes what is
> already built (verified against the repository, not assumed), where the
> product stands now, and what remains before a production-ready v1.
> Planning only — it changes no curriculum, content, data formats, or runtime
> behavior. Generated numbers below were read from the live manifest and
> question bank; regenerate them with `npm run build:notes` if they drift.

## 0. How to use this document

- **Status marks:** `[DONE]` = shipped, tested, and gated by `scripts/check.js`.
  `[IN PROGRESS]` = active work. `[PLANNED]` = approved future work with a
  defined phase below. Nothing else counts as committed scope.
- **Task sequencing rule (mandatory for all future work):**

  "Roadmap → Phase → Subsystem → Task → Implementation → Verification"

  Every implementation task must trace back through its subsystem and phase
  to this roadmap, and must end in verification (`npm test`,
  `npm run build:notes`, `npm run lint`, plus the phase's completion
  criteria). Work that cannot trace to this roadmap is out of scope.
- **Standing anti-goals (apply to every phase):** no AI-generated content in
  the shipped path without explicit opt-in, no LLM grading, no semantic
  similarity, no backend or cloud storage, no gamification, no mastery
  scores, no predictive analytics, no second next-topic mechanism, no
  polling-based sync. Learner data stays in the browser under versioned
  localStorage keys.

## 1. Product architecture already completed

All items below are `[DONE]` — implemented under `assets/`, tested under
`scripts/*.test.js`, and gated by `scripts/check.js`.

| # | Subsystem | Canonical module | Status |
| - | --------- | ---------------- | ------ |
| 1 | Curriculum / source of truth | `data/curriculum.json` + `content/**/*.md` → `dist/data/topic-manifest.json` via `scripts/build.js` | [DONE] |
| 2 | 100% topic metadata | 432/432 topics with validated front-matter (`scripts/topic-metadata.js`) | [DONE] |
| 3 | Topic knowledge graph | 605 prerequisite edges, max depth 11, 0 errors (`scripts/topic-graph.js`) | [DONE] |
| 4 | Topic intelligence | `assets/topic-intelligence.js` — single deterministic graph API (browser + Node share one copy) | [DONE] |
| 5 | Learner state | `assets/learner-state.js` — versioned localStorage progress (`tarangam_topic_state_v1`, legacy visited keys preserved) | [DONE] |
| 6 | Learner journey | `assets/learning-journey.js` — unified journey model; `getRecommendedNextTopics` is the single next-topic mechanism; `tarangam:progress-changed` is the single sync event | [DONE] |
| 7 | Exam readiness | `assets/exam-readiness.js` — fixed weights high=3 / medium=2 / low=1 / unknown=0 | [DONE] |
| 8 | Revision | `assets/revision.js` — 7-day due / 14-day overdue schedule, overdue → exam → dependents → manifest ordering | [DONE] |
| 9 | Learning analytics | `assets/learning-analytics.js` — descriptive only, no prediction | [DONE] |
| 10 | Study planning | `assets/study-planner.js` — arithmetic plans over explicit targets, prerequisite-order repair | [DONE] |
| 11 | Assessment engine | `assets/assessment.js` — exact evaluation (MCQ identity, normalized booleans, normalized short-answer + `acceptedAnswers`), pass threshold 70, versioned attempt store | [DONE] |
| 12 | Assessment coverage | `data/assessments.json` (296 questions / 226 topics) + generated `docs/assessment-coverage.md` (`scripts/generate-assessment-coverage.js`) | [DONE] |
| 13 | Assessment-aware revision | Completed `needs_review` attempts feed review relevance without touching the 7/14-day schedule (`assets/revision.js`, journey/planner/dashboard/explorer/context integrations) | [DONE] |
| 14 | Weak-topic / attention analysis | `assets/weak-topic-analysis.js` — descriptive attention reasons with deterministic ordering, journey + dashboard + explorer + study-context integrations | [DONE] |

Surfaces wired to these layers: Learner Dashboard (`dashboard.html`),
Curriculum Explorer (`explorer.html`), per-topic Study Context
(`templates/base.html` + `assets/topic-study-context.js`), and
Self-Assessment (`assessment.html`). Static output ships from `dist/`
(GitHub Pages artifact, deployed via `.github/workflows/deploy-pages.yml`).

## 2. Current verified baseline

Read live from the repository (`npm run build:notes`):

- 16 courses, 64 modules
- 432 topics, 432 metadata records
- 605 prerequisite edges, graph max depth 11, 0 graph errors
- 296 assessment questions across 226 covered topics
- 206 topics currently without assessment questions (reported, never implied assessed)
- Exam-relevant assessment coverage: 226 of 432 (52%)
- Verification suite: `npm test` green (325 tests), `npm run build:notes`
  green (`check passed`), `npm run lint` via `tsc --noEmit`

## 3. Current Position — where Tarangam is now

Tarangam is a **complete deterministic learning platform**: the full
evidence pipeline (progress → assessment → review → readiness → attention)
is built, integrated across all four surfaces, tested, and gated. The
product is **not yet v1**: the remaining work is breadth (assessment
coverage for the 206 uncovered topics), coherence (search, UX polish,
mobile, accessibility), and production hardening (offline resilience,
performance budgets, storage migrations, CI, release process, privacy
audit, final audit). No new analysis engines are needed; no speculative
features are planned. The next work item is Phase A.

## 4. Remaining product phases

### Phase A — Diagnostic / assessment expansion — v1
- **Objective:** extend `data/assessments.json` until the v1 coverage bar is met.
- **Why:** 206 topics still have no questions; diagnostics are weakest exactly there.
- **Dependencies:** none (bank tooling and QA already exist).
- **Major tasks:** author 1 deterministic question per remaining suitable topic in course/module/topic order (existing schema, existing types); triage unsuitable topics individually with a documented reason instead of fabricating; keep difficulty/examRelevance mirroring topic metadata; regenerate the coverage report.
- **Completion criteria:** every one of the 64 modules represented (already true — must hold); each of the 206 currently-uncovered topics either covered or triaged-with-reason; `validateAssessmentBank` clean; report reproducible; full suite green.

### Phase B — Adaptive deterministic learning — v1
- **Objective:** make ordering and display adapt to recorded evidence within the existing deterministic layers.
- **Why:** the layers already adapt (journey, readiness, attention); the product should use them coherently instead of adding new engines.
- **Dependencies:** journey, readiness, revision, attention (all [DONE]).
- **Major tasks:** deterministic difficulty-progression views; prerequisite-aware sequencing displays; evidence-driven surfacing rules that reuse attention reasons; all display-only, all explainable.
- **Completion criteria:** no new state system, no scores, no second next-topic mechanism; every adaptive display cites the existing reason it derives from; tests prove recommendation invariance.

### Phase C — Search and discovery — v1
- **Objective:** full-manifest search across titles, concepts, tags, and IDs with deterministic ranking.
- **Why:** 432 topics are unusable without search; discovery currently leans on browsing and the single recommendation.
- **Dependencies:** topic intelligence ([DONE]).
- **Major tasks:** substring/normalized search over the static manifest; deterministic ordering (manifest order + readiness/attention overlays, no relevance black box); search UI on Explorer; deep links to topic pages.
- **Completion criteria:** every topic findable by title fragment, concept, tag, or ID; ranking documented and tested; no backend, no index service.

### Phase D — Course / module / topic UX — v1
- **Objective:** coherent reading and navigation experience across course, module, and topic pages.
- **Why:** topic pages carry the study context but course/module overviews are thin.
- **Dependencies:** journey, analytics, attention ([DONE]).
- **Major tasks:** course/module overview content blocks reusing existing progress/readiness/attention models; consistent navigation (prev/next/module/course boundaries already canonical); study-context block ordering pass.
- **Completion criteria:** every page renders from the same models with no duplicated logic; visual design tokens unchanged unless ratified; no new state.

### Phase E — Mobile / responsive UX — v1
- **Objective:** all four surfaces fully usable on small screens.
- **Why:** learners study on phones; current layouts are desktop-first with partial responsive rules.
- **Dependencies:** Phase D.
- **Major tasks:** responsive audit per surface; touch targets; detail-panel behavior on narrow viewports; no content loss at 360px width.
- **Completion criteria:** checklist per surface at 360/768/1280px; no horizontal scroll; all actions reachable; tests where deterministic (static HTML checks).

### Phase F — Accessibility — v1
- **Objective:** WCAG 2.2 AA baseline for all learner flows.
- **Why:** a learning platform that excludes learners fails its purpose.
- **Dependencies:** Phase D, Phase E.
- **Major tasks:** landmarks/headings order; keyboard operability of all controls; focus visibility; aria for toggles/selects/progress; color-contrast pass (descriptive badges must not rely on color alone); reduced-motion respect.
- **Completion criteria:** axe-style static checks green where automatable; manual keyboard walkthrough per surface documented; contrast ratios recorded.

### Phase G — Offline / PWA / static resilience — v1
- **Objective:** the static-first promise holds under real network conditions.
- **Why:** GitHub Pages + localStorage already imply offline potential, but no service worker, manifest, or offline guarantees exist today.
- **Dependencies:** build pipeline ([DONE]), storage versioning (Phase I).
- **Major tasks:** web manifest + icons; service worker caching the static shell, manifest, and visited content with versioned invalidation; explicit offline fallback states (already partially present — complete them); never cache learner data anywhere but the device.
- **Completion criteria:** airplane-mode walkthrough per surface; stale-cache invalidation tested; learner data provably device-local.

### Phase H — Performance — v1
- **Objective:** set and hold performance budgets.
- **Why:** manifest-scale pages (432 topics) must stay fast on low-end devices.
- **Dependencies:** Phase D, Phase E.
- **Major tasks:** budgets (page weight, blocking time, manifest parse); remove render-time recomputation hot spots; keep bank/manifest loads lazy per surface as today.
- **Completion criteria:** budgets documented and asserted in CI where measurable; no regression on the 432-topic Explorer and Dashboard renders.

### Phase I — Data integrity / migrations — v1
- **Objective:** versioned, migratable, tested learner-data formats.
- **Why:** storage keys already versioned (`*_v1`) but no migration path or forward-compat tests exist.
- **Dependencies:** learner-state, assessment store ([DONE]).
- **Major tasks:** schema version registry; migration functions v1→v2 with fixtures; corrupt/legacy-data degradation tests; backup/export (file download) for learner peace of mind.
- **Completion criteria:** every stored format has a version, a validator, and migration tests; unknown future versions degrade to empty (never crash, never lose readable data silently).

### Phase J — Automated testing / CI — v1
- **Objective:** every push verified the same way, automatically.
- **Why:** verification currently depends on a developer running three commands.
- **Dependencies:** existing suite (325 tests), check.js gates.
- **Major tasks:** CI workflow running `npm test`, `npm run build:notes`, and lint on every PR; required-status gating on `main`; coverage-report freshness check (report matches live bank).
- **Completion criteria:** red main impossible to merge; CI runs the exact commands in section 6.

### Phase K — GitHub Pages deployment / release hardening — v1
- **Objective:** boring, repeatable releases.
- **Why:** deploy workflow exists but releases are unversioned and unannounced.
- **Dependencies:** Phase J.
- **Major tasks:** tagged releases with changelog; pre-deploy `dist/` validation (already in check.js — enforce in CI); deploy preview or staging check; rollback procedure (re-tag previous known-good).
- **Completion criteria:** release checklist documented; last three releases traceable from tag to deployed SHA.

### Phase L — Privacy / local-data boundaries — v1
- **Objective:** prove the no-backend promise.
- **Why:** learner trust rests on data never leaving the device; this must be audited, not asserted.
- **Dependencies:** all surfaces ([DONE]).
- **Major tasks:** static audit (no analytics beacons, no external POSTs, fonts/CDN inventory with self-host decision); privacy statement page; per-key data inventory (what is stored, where, why, how cleared).
- **Completion criteria:** audit rerunnable (`grep`-level checks in CI); published statement matches implementation; one-click local reset verified per surface.

### Phase M — Final v1 audit — v1
- **Objective:** gate v1 on evidence, not enthusiasm.
- **Why:** the last mile is verification completeness.
- **Dependencies:** all v1 phases above.
- **Major tasks:** re-run every completion criterion; curriculum/content/data diff review (must be content-neutral except ratified bank additions); full-suite + build + lint green; roadmap marks v1 items [DONE].
- **Completion criteria:** all v1 boxes checked in this document; v1 tag cut per Phase K.

### Phase N — Optional future AI/RAG integration — post-v1
- **Objective:** define where AI could ever fit without breaking the product's guarantees.
- **Why:** to prevent ad-hoc AI additions later; optionality with boundaries.
- **Dependencies:** v1 shipped (Phase M).
- **Major tasks (explicitly not started):** opt-in only; retrieval grounded strictly in shipped Markdown; deterministic layers remain authoritative (AI may explain, never grade, gate, or recommend over them); local-first preference; privacy re-audit before any networked call.
- **Completion criteria:** none active — this phase opens only by explicit roadmap amendment after v1.

## 5. Verification (run for any roadmap-affecting change)

- `npm test` — full suite green (currently 325 tests).
- `npm run build:notes` — manifest/bank/report consistency + `check passed`.
- `npm run lint` — `tsc --noEmit` (currently blocked: TypeScript absent from
  this environment; report as-is, do not reconfigure dependencies to hide it).
- Confirm `git status` shows no changes to `content/`, `data/curriculum.json`,
  learner-data formats, or runtime assets beyond the ratified scope.

## 6. Non-goals

Speculative features are out: social accounts, cloud sync, leaderboards,
streaks, XP, push notifications, comments/forums, marketplace content, and
any scoring or ranking system. If a future need arises, it enters this
document as a phase first — never as a surprise implementation.
