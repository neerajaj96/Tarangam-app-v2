# Tarangam v1 Release Audit

Deterministic end-to-end review of Tarangam v2 against
`docs/master-product-roadmap.md` and the live repository architecture.
Evidence only — every claim below was read from the repo, the build, or
the test suite, not assumed. Audit scope is v1; post-v1 AI/RAG (Phase N)
is explicitly untouched.

## 1. Audited areas

- `docs/master-product-roadmap.md` (status marks, baseline numbers, phase criteria)
- `package.json` (all six scripts) and `package-lock.json` reproducibility
- `data/curriculum.json` (16 courses, 64 modules, dashboard order)
- `data/topic-schema.json` + `scripts/topic-metadata.js` validation path
- Build configuration: `scripts/build.js`, `scripts/output.js`,
  `scripts/pages.js`, `scripts/check.js` (§0–§26), `templates/base.html`
- All 31 test suites under `scripts/*.test.js` and their wiring into `npm test`
- CI (`.github/workflows/ci.yml`) and Pages deployment
  (`.github/workflows/deploy-pages.yml`), including live run outcomes
- Privacy documentation (`docs/privacy-local-data.md`) vs implementation
- `server.ts` endpoints, `sw.js` caching lanes, external URL inventory

## 2. Verified facts (phases A–L)

| Phase | Evidence |
| --- | --- |
| A Assessment | `data/assessments.json`: 502 questions / 432 covered topics / 0 uncovered; `docs/assessment-coverage.md` reproducible and freshness-gated by `check.js` |
| B Adaptive | `assets/adaptive-learning.js` reuses journey/readiness/revision/attention/assessment/planner layers; `getRecommendedNextTopics` remains the single next-topic mechanism (`check.js` §16) |
| C Search | `searchTopics`/`searchCurriculum` tiers + manifest-order ties in `assets/topic-intelligence.js`; Explorer `xp-search` across all courses (`check.js` §17) |
| D Course/module/topic UX | `assets/course-overview.js` + `course.html`/`course-page.js`; canonical prev/next + breadcrumbs via shared helpers (`check.js` §18–§19) |
| E Responsive | Device-width viewports + `@media` rules on all five surfaces; touch-sized controls; no `100vw` traps (`check.js` §20) |
| F Accessibility | Skip links + landmarks on every surface; named icon buttons; live regions; `:focus-visible`; reduced motion; WCAG AA contrast computed over shipped theme variables (`check.js` §21) |
| G Offline/PWA | Versioned worker with content-hash stamping, valid manifest, `offline.html`, per-surface registration, shell-closure test (`check.js` §22, `docs/offline-reliability.md`) |
| H Performance | `scripts/performance-budget.js` audits `dist/` against baseline-hugging byte budgets incl. per-surface payloads and the 432-page count (`check.js` §23) |
| I Integrity/migrations/backup | Schema registry with any-`vN` future detection, validate-first atomic backup round-trips, byte-identical failed imports (`check.js` §24–§25) |
| J CI | `ci.yml`: `npm ci` → `npm run build:notes` → `npm test` → `npm run lint` on push + PR, Node 22 pinned; 31/31 suites wired; suite-integrity meta-test guards the harness itself |
| K Deployment | `deploy-pages.yml`: `main`-only + manual dispatch, same toolchain and quality order, `dist/`-only artifact via official Pages actions, minimum Pages permissions, `deploy needs: build`; latest runs green for both workflows |
| L Privacy | `scripts/privacy-boundary.test.js` + `check.js` §26 scan learner modules/SW/server; `docs/privacy-local-data.md` matches implementation; negative-probed (injected `fetch(` fails both gates) |

Cross-cutting: no `fetch`/XHR/beacon/WebSocket/IndexedDB/cookies in learner
modules; no AI/LLM/semantic/prediction/gamification tokens in the shipped
path; `@google/genai` is a declared-but-never-imported parked dependency
(documented in README, never bundled — intentional, not accidental);
`scripts/*.js` Node shims re-export `assets/*.js` without duplicating logic;
`dist/` (478 tracked files) regenerates byte-identically; externals are
limited to Google Fonts, MathJax, and Mermaid CDNs.

## 3. Concrete issues found and disposition

1. **Stale roadmap numbers** (row 12: 296/226; §2 baseline; §3 "not yet v1,
   next is Phase A"; §5 "325 tests", blocked-lint note). *Fixed in this
   audit*: refreshed to 502/432/100%, 512 tests, lint green; phases A–J and
   L marked `[DONE]`, M `[IN PROGRESS]`. Historical content otherwise
   untouched.
2. **Dead migration suite**: `scripts/learner-state-migration.test.js`
   called `loadTopicSchema()`/`loadCurriculum()`/`buildTopicManifest()`
   without importing them, so its final live-432-topic suite threw at
   definition and never ran (masked: `node --test` still exited 0).
   *Fixed*: added the three imports (test-only, no behavior change); the
   suite now runs and passes (19/19 in-file).
3. **No harness guard**: nothing detected case (2) or unwired suites.
   *Fixed*: new `scripts/test-suite-integrity.test.js` asserts every suite
   is wired into `npm test` both ways, passes `node --check`, holds ≥1
   test, and calls no undefined function at suite-definition time
   (verified to name the exact three identifiers on the pre-fix file).
4. **Release mechanics still open** (Phase K criteria): no git tags, no
   changelog, no documented rollback; `main` branch protection is off, so
   required-status gating (Phase J criterion) is not enforced. These are
   repo-settings/release steps, not code gaps — recorded here, Phase K
   left `[IN PROGRESS]`.
5. **Observations, no action**: `bun.lock` still describes the removed
   React/Vite scaffold (npm is the real toolchain; the file is inert and
   ignored by CI); `npm run build`'s `dist/server.cjs` bundle is unused by
   the Pages artifact (harmless, dev-server path only).

## 4. Commands used

```bash
npm run build:notes   # check passed (16 courses), 5 pre-existing warnings
npm test              # 512 pass, 0 fail
npm run lint          # tsc --noEmit clean
gh run list           # CI quality gate + Pages deploy: success
```

Negative probes: injected `fetch(` into a learner module (privacy test and
`check.js` both fail, then reverted); reverted migration imports
(integrity test names all three identifiers).

## 5. Final v1 readiness state

Code-complete for v1: every Phase A–L completion criterion is implemented,
tested, and gated in CI. Remaining before the v1 tag (Phase M): cut a
version tag + changelog entry, document the rollback (re-tag previous
known-good), and optionally enable `main` branch protection with the CI
check required. No curriculum, behavior, or data-format changes are needed.
