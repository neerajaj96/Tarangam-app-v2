# Tarangam Offline Reliability

Developer reference for the static offline layer (service worker, web
manifest, offline fallback). Planning only where noted — the mechanisms
below are shipped and gated by `scripts/check.js` (§22) plus
`scripts/pwa-offline.test.js`.

## Cache layers

Three versioned caches, all named `${TARANGAM_CACHE_VERSION}::<lane>`:

| Lane | Strategy | Holds |
| ---- | -------- | ----- |
| `shell` | Pinned at install (`cache.addAll`), cache-first at runtime | Entry pages, `style.css`, every local runtime module reachable from the entry surfaces, manifest, icons |
| `content` | Cache-first, runtime-filled | Generated topic/course HTML documents served while browsing |
| `data` | **Network-first**, cache fallback | `data/topic-manifest.json`, `data/assessments.json` (fresh syllabus when online, usable offline) |

Cross-origin requests (fonts, CDNs) pass through untouched — never cached,
never blocked; the app degrades to system fallbacks offline.

## Cache-first vs network-first behavior

- **Shell/content:** cache-first for instant static loads. Staleness is
  bounded by versioning (below), never indefinite.
- **Curriculum data:** network-first, so syllabus and bank edits reach
  learners on the next online visit even without a worker update.
- **Failed navigations** with no cache hit serve `offline.html`; failed
  sub-resources resolve to a JSON `{ error: 'offline' }` 503.

## Version bump procedure

There is **no manual bump step**. At build time
`computeServiceWorkerVersion()` (in `scripts/output.js`) mints
`tarangam-<12 hex>` as a SHA-256 over every shipped byte the user can
observe: the `SHELL_URLS` file list, curriculum data, topic Markdown,
templates, and entry pages. `injectServiceWorkerVersion()` stamps it into
`dist/sw.js`. Any visible change therefore:

1. produces a new version on the next `npm run build:notes`,
2. installs alongside the old worker and activates immediately
   (`skipWaiting` + `clients.claim`),
3. purges the previous generation on `activate` (only `tarangam-*`
   caches; foreign caches are never touched).

If `dist/sw.js` still carries `__TARANGAM_VERSION__`, the build step did
not run — treat that deploy as broken and rebuild.

## What is deliberately never cached

- Learner progress (browser storage — workers cannot observe it; the
  worker source must not reference storage keys, IndexedDB, or backends).
- Cross-origin responses.
- Non-GET requests (pass through untouched).

## GitHub Pages deployment considerations

- All worker URLs are same-directory relative (`./`, `sw.js`), so one
  worker file installs identically at the domain root (local dev) and
  under a Pages project subpath; `manifest.start_url`/`scope` are `./`.
- The worker only controls pages under its scope path; keep `sw.js` at
  the deployment root.
- `file://` checkouts cannot run workers — the app runs online-only
  there by design, and registration fails silently.

## Manual offline walkthrough

Requires a real browser with service-worker support (Chromium or
Firefox); it cannot be performed headless here, so it is documented —
never claimed — until run:

1. Serve the repo root over HTTP (`npx serve .` or equivalent) — do not
   use `file://`.
2. Load the app online; open DevTools → Application → Service Workers and
   confirm `sw.js` is activated with the current `tarangam-*` version.
3. Visit Dashboard, Explorer, a Course page, several Topic pages, and
   Assessment (populates the content and data lanes).
4. DevTools → Network → Offline (or OS airplane mode).
5. Reload each visited surface and navigate between cached pages — all
   must render with progress intact.
6. Open an uncached URL (e.g. a topic never visited) — `offline.html`
   must render with working Home/Dashboard/Explorer links.
7. Re-enable network and reload — fresh content returns; the data lane
   revalidates silently.
8. In Application → Cache Storage, confirm only the current
   `tarangam-*` generation remains after activation.
