# Tarangam — KTU Notes (S5 CSE, 2024 scheme)

Static-site notes: `content/<COURSE>/*.md` → `node scripts/build.js` → `dist/<COURSE>/*.html` via `templates/base.html` + `style.css`. Dashboard is `index.html`. Dev server is `server.ts`. Deploy is GitHub Pages from `dist/` (see `.github/workflows/deploy-pages.yml`).

> **Deployment model (important, learned 2026-09-16):** this repo is served by GitHub Pages in **Actions-artifact mode** (`dist/` uploaded by `deploy-pages.yml`), while forks/copies may serve the **branch root**. The built `dist/` directory is therefore **committed** to `main` (intentionally *not* git-ignored). All generated topic links use single-level `../` asset refs (`../style.css`, `../index.html`) plus `./` same-dir nav links — this resolves identically at artifact depth (`/<repo>/<COURSE>/…`) and branch depth (`/<repo>/dist/<COURSE>/…`), so no hardcoded `/Tarangam-app-v2/` base is needed and both modes stay styled. Every content/build change must be followed by `npm run build:notes` + committing the regenerated `dist/`, or the live site goes stale. `npm run check` (also a CI gate, run after the build) validates links/quizzes/slugs, rejects `../../` escapes, and rejects `dist/` prefixes in the standalone artifact index.

## Run it

```bash
npm install
npm run build:notes
npm run dev   # tsx server.ts on :3000, serves repo root
# or: npx serve dist/  # production preview of Pages artifact
```

## Content layout (locked convention — Session 2)

```
content/<COURSE>/m{mod}_{seq}_{slug}.md
  seq 00 = module overview (optional, one per module, sorts first)
  seq 01-98 = topics in reading order
  seq 99 = practice lab (optional, one per module, sorts last)
```

Current truth (2026-09-21) — full syllabus complete, 486 topics (S5 now 8 subjects):
- `PCCST501` Computer Networks: M1–M4 complete (37 topics, incl. socket programming/select/poll)
- `PCCST502` DAA: M1–M4 complete (31 topics, incl. `m1_00` overview + `m1_99` lab)
- `PECST522` AI: M1–M4 complete (30 topics, incl. `m1_99` lab; M2 now covers greedy, A*, generate-and-test, CSP/AC-3, minimax, alpha-beta)
- `PBCST504` Microcontrollers: M1–M4 complete (20 topics: embedded/ARM, STM32, serial, IoT/RTOS/project)
- `PCCSL507` Networks Lab: M1–M3 complete (12 practical topics: Linux/sockets, monitoring/protocols, routing/simulation)
- `PCCSL508` Machine Learning Lab: M1–M3 complete (15 practical topics: Python, regression/classification, clustering/ensembles/capstone)
- `UCHUM506` Constitution of India (MOOC): M1 guide complete (4 topics: purpose, method, evidence, revision — no invented syllabus)
- `PCCST503` Machine Learning: M1–M4 complete (25 topics, incl. regression metrics/regularisation + classification evaluation)
- `GZPHT121` Physics for Physical Science and Life Science (S1/S2, Groups C & D): M1–M4 theory complete (26 topics, no lab, 14 animated SVG scenes + graphs + tables — fully enriched)
- `GAMAT301` Mathematics for Information Science-3 (S3, Group A): M1–M4 complete (24 topics, no lab, 14 animated SVG scenes + graphs so far — fully enriched)
- `PCCST303` Data Structures and Algorithms (S3): M1–M4 theory complete (27 topics, no lab, 10 animated SVG scenes)
- `GXEST104` Intro to Electrical & Electronics Eng. (S1/S2, Groups A & B): M1–M4 complete (33 topics, no lab, 5 animated SVG scenes)
- `PCCST601` Compiler Design (S6): M1–M4 theory complete (29 topics, no lab, 3 animated SVG scenes)
- `PCCST602` Advanced Computing Systems (S6): M1–M4 theory complete (23 topics, no lab, 3 animated SVG scenes)
- `PBCST604` Fundamentals of Cyber Security (S6, PBL): M1–M4 theory complete (26 topics, no lab, 7 animated SVG scenes)
- `PECST632` Deep Learning (S6 elective): M1–M4 theory complete (25 topics, no lab, 3 animated SVG scenes)
- `PECST637` Fundamentals of Cryptography (S6 elective): M1–M4 theory complete (25 topics, no lab, 3 animated SVG scenes)
- `PECST631` Software Testing (S6 elective): M1–M4 theory complete (26 topics, no lab, 3 animated SVG scenes)
- `GXEST605` Design Thinking and Product Development (S6): M1–M4 complete (24 topics, no lab, 3 animated SVG scenes)
- `OECST614` Machine Learning for Engineers (S6 OE-1 elective): M1–M4 theory complete (24 topics, no lab, 8 animated SVG scenes)
- Dashboard `index.html`: every card unlocked, zero `TODO content/…` remaining
- All 8 `assets/videos/*.mp4` wired into topics via `::: manim` (0 orphan warnings)
- `npm run check`: 0 errors, 0 warnings (was: 8 orphan-video warnings at peak)
- Toolchain is exactly `express` + `marked` (+ `@google/genai`/`dotenv`, reserved for the parked AI tutor — dead React/Vite scaffold removed in Session 12).
- Parked intelligence: no tutor/RAG/quiz-gen exists yet (`metadata.json` capability vs `/api/health`-only server). Spaced review v1 is live (7-day due flags + counter, stamps refreshed on visit); quiz options are client-shuffled per load to neutralize a measured 71%-at-B position bias.

## Features already built

- **Topic-by-topic breakdown** — Module → smallest topic (486 `.md` files: 20 complete courses), each a self-contained unit (intuition, framework, worked steps, quiz).
- **Worked problems** via `::: step [badge] title` cards where the syllabus has a computational method.
- **Dropdown / accordion sections** (`::: callout-*`, `::: toggle`) for extra depth so the main page stays uncluttered.
- **Self-check quizzes** on most topics — instant right/wrong feedback + markdown-rendered pedagogical explanation. No score persistence yet (only per-course visited-topic checkmarks in `localStorage` + progress bar).
- **Manim video studio** (`::: manim`) with per-clip speed controls — all 8 mp4s wired into ML topics (0 orphaned).
- **Four appearance modes** — dark, light, sepia reading, Nordic — plus 3 font scales, in Settings. Pre-paint script avoids theme flash.
- **Progress tracking** — visited topics per course in `localStorage` (`tarangam_visited_<COURSE>`), checkmarks in nav, one-click reset. Practice labs count.
- **MathJax** for all formulas — no screenshots of equations.
- Responsive down to a phone screen; collapsible sidebar; skip link; `[`/`]` topic navigation (arrows deliberately left for scrolling).

## Adding real Manim videos

Each topic embeds video via `::: manim assets/videos/<file>.mp4 <title>` in its `.md` (see `scripts/build.js:136 transformCustomWidgets`). To add a clip:

1. Render it with Manim, save output as `assets/videos/<file>.mp4`
2. Reference it from the topic `.md`; `scripts/build.js` copies `assets/` → `dist/assets/`
3. Currently all 8 mp4s are ORPHANED (no `.md` references them) — rewire or delete in content pass.

## Adding a new subject

Content is decoupled from the shell. To add, say, DBMS as `PCCXX999`:

1. Create `content/PCCXX999/m1_01_*.md` following `m{mod}_{seq}_{slug}.md` + widget syntax (`::: callout-*`, `::: quiz`, `::: step`, `::: toggle`, `::: manim`).
2. Add `PCCXX999: 'Name'` to `COURSE_METADATA` + module titles to `MODULE_NAMES` in `scripts/build.js:9`.
3. Rebuild; add a `course-section` with a `subject-btn` (`data-go-subject` + empty `data-topic-count` span) in `index.html` — `node scripts/build.js` then fills the Topics-step detail blocks and topic counts from content (never hand-write topic links).

## Adding a new year/semester

The dashboard (`index.html`) is a stepped flow: **Years view** (4 year cards) → **Semesters view** (semester cards for that year) → **Subjects view** (one button per course) → **Topics view** (that subject's 4 modules as dropdowns listing every topic), with breadcrumb back-links and the position persisted in `localStorage` (`tarangam_dash_nav`). To add a subject, drop its `course-section` into the right semester block (year blocks carry `data-year`, semester blocks `data-sem`); then bump the hardcoded subject counts on the corresponding year card, semester card, and semester label. Empty semesters render a "check back soon" note with no dead links. All cards and topic links stay in the DOM so `npm run check` still validates every link.

## Elective policy

Add exactly the required number of electives per slot — one representative subject, not the full option list (already-added extras are grandfathered, not removed).

## Design notes

Palette and type were chosen deliberately for this subject (a technical, formula-heavy set of notes meant for focused reading), not the default AI-generated look — see the "Restraint and self-critique" section of the brief this was built against. Space Grotesk (display) + Source Serif 4 (body) + IBM Plex Mono (data/labels); a cobalt/amber accent pair rather than the usual cream-and-terracotta combo; module numbers used as real navigation info, not decoration.

## Component rules (whole project — every component flexible, perfect in context)

1. **One source per component.** Widget markup comes from exactly one place (`transformCustomWidgets` in `scripts/build.js`, `SCENES` in `scripts/scenes.js`, dashboard blocks in `index.html`) — never hand-duplicated.
2. **Theme discipline.** Topic pages use `style.css` variables only (no hardcoded colors except intentional swatches); the dashboard is a fixed dark system with one shared accent pair.
3. **`hidden` always pairs with CSS.** Any element toggled via the `hidden` attribute gets an explicit `[hidden]{display:none}` rule at equal-or-higher specificity — bare `hidden` loses to any author `display` (this exact bug once showed every semester at once).
4. **Static-first.** No fetching for content: `build.js` injects dashboard topic lists at build time, so `file://`, offline, and both Pages modes render identically.
5. **Responsive + motion-safe.** New components must survive 360px (wrap, never fixed widths) and add no motion outside the `prefers-reduced-motion` guard that collapses scenes to final state.
6. **Check-validated links.** Every link stays in static DOM so `npm run check` validates it; generated regions are delimited by markers and deterministic (same content → same bytes).
