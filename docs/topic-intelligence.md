# Topic Intelligence Layer — Developer Guide

The metadata migration is complete (432/432 topics). This document describes
the canonical Topic Intelligence Layer that powers learner features on top of
the finished metadata/graph system. No AI/LLMs are involved: everything here
is deterministic and explainable.

## Canonical topic model

The single source of truth is the static topic manifest
(`dist/data/topic-manifest.json`, built by `scripts/build.js` from
`data/curriculum.json` + `content/**/*.md`). One entry per topic:

- Identity/order: `id` (filename without `.md`), `courseCode`, `module`,
  `sequence`, `filename`. Manifest order is the curriculum order
  (course, module, sequence, id) and every listing preserves it.
- Content: `title`, `learningObjectives[]`, `concepts[]`, `tags[]`,
  `difficulty` (`beginner|intermediate|advanced`),
  `estimatedMinutes`, `examRelevance` (`low|medium|high`).
- Graph: `prerequisites[]` (same-course bare ids),
  `prerequisiteDepth` (longest chain to a root), `hasMetadata`.

Bare prerequisite ids repeat across courses, so **all resolution is
same-course** (`courseCode/id` keys) — the same rule as
`scripts/topic-graph.js`. Unknown courses/topics yield null/[]/false, never
throw. Cycles and dangling ids terminate via visited-sets and are skipped.

## Intelligence API

Single implementation: `assets/topic-intelligence.js` (browser + Node, zero
dependencies). Node tooling uses `scripts/topic-intelligence.js`, a pure
re-export (the `scripts/learner-path.js` precedent). Older query copies now
delegate here: the manifest queries in `scripts/topic-manifest.js`, the pure
queries in `assets/curriculum-data.js`, the engine in
`assets/learner-path.js`, and the prerequisite helpers in
`assets/learner-state.js`. No competing format was created; the manifest is
unchanged (every derived relationship is computed, never stored).

- Relationships: `getPrerequisites`, `getDependents`, `getAncestors`,
  `getDescendants`, `getDependencyChain` (ancestors in curriculum order plus
  self), `getPrerequisiteDepth`, `isRootTopic`, `isLeafTopic`.
- Navigation: `getPreviousTopic`/`getNextTopic` (global manifest order),
  `getPreviousInCourse`/`getNextInCourse`,
  `getPreviousInModule`/`getNextInModule`, `getModuleBoundaries`,
  `getCourseBoundaries` (`{first, last}`, nulls when empty/unknown).
- Classification: `getDifficulty`, `getExamRelevance`,
  `getEstimatedMinutes`, `getConcepts`, `getTags`, `getLearningObjectives`
  (null-safe; arrays are copies).
- Discovery: `searchTopics` (title/id/concepts/tags),
  `searchConcepts`, `filterByTags` (`'all'`/`'any'`), `filterByDifficulty`,
  `filterByExamRelevance`, `filterByMaxMinutes` (unknown estimates never
  match), `combinedFilter` (all facets ANDed; arrays OR within).
- Progress (over a status reader `(courseCode, id) => status`, unknown
  statuses count as unfinished): `getCompletedPrerequisites`,
  `getBlockedPrerequisites`, `getDirectPrerequisiteCompletion`,
  `getReadyTopics`, `getInProgressTopics`, `getRecommendedNextTopics`
  (in-progress, then unblockers, then ready), `getNextRecommendedTopic`,
  `getAncestorCompletion` (`{completed, total, percent}`, 100% when empty),
  `getRemainingDependencyCount`.

## Graph semantics

Edges point from a topic to its prerequisites (same course). Roots have no
prerequisites; leaves have no dependents. Depth is the longest chain to a
root. The live graph (432 topics, 605 edges, max depth 11, 0 errors) is
validated by `npm run build:notes`; five standalone intro topics warn as
relationship-free without failing.

## Progress semantics

Statuses are `completed` > `in_progress` > `not_started` (see
`assets/learner-state.js` for storage). Readiness never blocks: a topic with
complete prerequisites is *ready*; anything else is informational
(`getBlockedPrerequisites`, ancestor percentages, remaining counts).
Recommendations are deterministic curriculum order within each tier.

## Browser/Node usage

- Browser: `import { combinedFilter, getAncestors, ... } from
  './topic-intelligence.js'` (Explorer), or via `./curriculum-data.js`
  re-exports; progress via `createLearnerState` from `./learner-state.js`.
- Node/tests: `import { ... } from './topic-intelligence.js'` (under
  `scripts/`) or the modules that delegate to it.
- Manifest loading stays in `assets/curriculum-data.js` (`loadManifest`
  with hosting-mode candidates and caching).

## Consuming this layer for future features

Build on these functions instead of re-walking `manifest.topics`: use
`combinedFilter` for discovery UIs, `getDependencyChain` +
`getAncestorCompletion` for study plans, `getRecommendedNextTopics` for
continue-learning surfaces, and navigation helpers for prev/next controls.
Keep new logic pure and deterministic; add fixture + live-repo tests in
`scripts/topic-intelligence.test.js`. Never invent a second topic format —
extend this API instead.
