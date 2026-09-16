# Tarangam — KTU Notes (S5 CSE, 2024 scheme)

Static-site notes: `content/<COURSE>/*.md` → `node scripts/build.js` → `dist/<COURSE>/*.html` via `templates/base.html` + `style.css`. Dashboard is `index.html`. Dev server is `server.ts`. Deploy is GitHub Pages from `dist/` (see `.github/workflows/deploy-pages.yml`).

> **Deployment model (important):** Pages serves the **branch root**, so the built `dist/` directory is **committed** to `main` (it is intentionally *not* git-ignored). Every content/build change must be followed by `npm run build:notes` + committing the regenerated `dist/`, or the live site goes stale and note links 404. `npm run check` (also a CI gate) validates links/quizzes/slugs before the build runs.

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

Current truth (2026-09-16):
- `PCCST501` Computer Networks: M1 only (5 topics)
- `PCCST502` DAA: M1 only (`m1_00` overview + 10 topics + `m1_99` lab)
- `PECST522` AI: M1 (5 topics, gap: `m1_06` missing) + M2 partial (3 topics) + `m1_99` lab
- `PCCST503` Machine Learning: PARKED — `content/PCCST503/` does not exist; dashboard cards are locked; `assets/videos/*.mp4` (ML-named) are orphaned until PCCST503 lands
- Dashboard `index.html` shows only existing pages as links; everything else is `.is-locked` + `<!-- TODO content/... -->`
- `src/` (React/Vite/Tailwind) is DEAD — unreferenced by any HTML; do not extend until build decision in Session 3
- AI/ML features PARKED: `@google/genai` in `package.json` is unused and `metadata.json` claims `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`, but `server.ts` exposes only `/api/health` — no tutor/RAG/quiz-gen exists. Spaced-repetition scheduling is the planned first use of the `tarangam_visited_ts_<COURSE>` timestamp map (stored since Session 10); quiz options are client-shuffled per load to neutralize a measured 71%-at-B position bias.

## Features already built

- **Topic-by-topic breakdown** — Module → smallest topic (27 `.md` files today: CN M1, DAA M1, AI M1–M2 partial), each a self-contained unit (intuition, framework, worked steps, quiz).
- **Worked problems** via `::: step [badge] title` cards where the syllabus has a computational method.
- **Dropdown / accordion sections** (`::: callout-*`, `::: toggle`) for extra depth so the main page stays uncluttered.
- **Self-check quizzes** on most topics — instant right/wrong feedback + markdown-rendered pedagogical explanation. No score persistence yet (only per-course visited-topic checkmarks in `localStorage` + progress bar).
- **Manim video studio** (`::: manim`) with per-clip speed controls — 8 mp4s exist but are currently orphaned (no `.md` references them).
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
