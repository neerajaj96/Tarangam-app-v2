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

Current truth (2026-09-17) — full syllabus complete, 83 topics:
- `PCCST501` Computer Networks: M1–M4 complete (20 topics)
- `PCCST502` DAA: M1–M4 complete (26 topics, incl. `m1_00` overview + `m1_99` lab)
- `PECST522` AI: M1–M4 complete (21 topics, incl. `m1_99` lab)
- `PCCST503` Machine Learning: M1–M4 complete (18 topics)
- Dashboard `index.html`: every card unlocked, zero `TODO content/…` remaining
- All 8 `assets/videos/*.mp4` wired into topics via `::: manim` (0 orphan warnings)
- `npm run check`: 0 errors, 0 warnings (was: 8 orphan-video warnings at peak)
- Toolchain is exactly `express` + `marked` (+ `@google/genai`/`dotenv`, reserved for the parked AI tutor — dead React/Vite scaffold removed in Session 12).
- Parked intelligence: no tutor/RAG/quiz-gen exists yet (`metadata.json` capability vs `/api/health`-only server). Spaced repetition is the planned first use of the `tarangam_visited_ts_<COURSE>` timestamp map (stored since Session 10); quiz options are client-shuffled per load to neutralize a measured 71%-at-B position bias.

## Features already built

- **Topic-by-topic breakdown** — Module → smallest topic (83 `.md` files: 4 complete courses), each a self-contained unit (intuition, framework, worked steps, quiz).
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
3. Rebuild; add unlocked cards in `index.html` (copy `.card` pattern, never point at missing files).

## Adding a new year

The sidebar's "1st & 2nd" / "4th" pills are present but locked (`data-locked`) — intentionally, since only 3rd year has content right now. Wire them up the same way as subjects once that content exists.

## Design notes

Palette and type were chosen deliberately for this subject (a technical, formula-heavy set of notes meant for focused reading), not the default AI-generated look — see the "Restraint and self-critique" section of the brief this was built against. Space Grotesk (display) + Source Serif 4 (body) + IBM Plex Mono (data/labels); a cobalt/amber accent pair rather than the usual cream-and-terracotta combo; module numbers used as real navigation info, not decoration.
