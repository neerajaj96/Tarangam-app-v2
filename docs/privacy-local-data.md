# Privacy: local learner data

Tarangam is a static-first application. There are no accounts, no telemetry,
no analytics beacons, no AI services, no backend storage, and no cloud sync.
All learner data stays in the learner's own browser. This document states
exactly what is stored, what backup/restore contains, what is never
transmitted, and where the boundary between static application resources
and learner data lies.

## What learner data is stored locally

Everything below lives in the browser's `localStorage` on the learner's own
device (with an in-memory fallback when storage is unavailable). Nothing is
sent anywhere.

| Data | Key(s) | Contents |
| --- | --- | --- |
| Topic progress | `tarangam_topic_state_v1` | Per-topic status (`completed` / `in_progress`) plus `updatedAt` timestamps, keyed `COURSE/topicId`. Corrupt data is quarantined under `tarangam_topic_state_v1_corrupt_backup`, never deleted. Future schema generations (`tarangam_topic_state_vN`) are preserved read-only, never downgraded. |
| Legacy progress | `tarangam_visited_<COURSE>`, `tarangam_visited_ts_<COURSE>` | Pre-v1 visited-topic lists and visit timestamps. Kept so nothing previously recorded is lost; migrated into v1 on read. |
| Assessment attempts | `tarangam_assessments_v1` | Versioned attempt history (`{ version, attempts }`) used to derive attempted/not-attempted state. |
| Study plan config | `tarangam_study_plan_v1` | The learner's explicit plan target (`{ ...config, savedAt }`). Arithmetic only — no behavioural prediction. |
| Storage probe | `__tarangam_probe__` (transient) | A throwaway read used once to detect whether `localStorage` is available. Not learner data. |

Revision state, exam readiness, attention analysis, and adaptive views are
derived read-only from the records above at render time. They persist
nothing of their own.

## What backup/restore contains

`tarangam-learner-state-backup.json` (format `tarangam-learner-state-backup`,
version 1) is a local file the learner downloads and re-imports:

- `records`: the v1 progress map (`COURSE/topicId → { status, updatedAt }`).
- `legacy`: visited lists and timestamps per course.
- `schemaVersion` / `exportedAt`: integrity metadata so imports can refuse
  future versions instead of downgrading them.

Restore is validate-first and atomic: a failed import changes nothing.
No titles, bodies, or curriculum content ship inside the backup — only the
learner's own records. The transfer mechanism is a browser file download
(and `FileReader` on import), never a network upload.

## What is explicitly not transmitted

- No `fetch`, `XMLHttpRequest`, `sendBeacon`, WebSocket, or event-source
  calls carry learner data. (The curriculum loader may fetch static JSON
  such as `data/topic-manifest.json`; those requests never include learner
  keys or records.)
- No IndexedDB, no cookies, and no external storage or synchronization
  service (Firebase, Supabase, or otherwise) touches learner data.
- The service worker caches only static application bytes (shell, topic
  pages, `data/*.json`) and never observes, stores, or transmits
  `localStorage` contents.
- The bundled server (`server.ts`) serves static files plus a `GET
  /api/health` liveness check. It exposes no learner-data endpoints and
  accepts no learner-data writes.
- External network requests are limited to genuinely external static
  resources: Google Fonts, the MathJax CDN, and the Mermaid CDN. They
  receive no learner data.

## localStorage is browser-local, not a cloud account

`localStorage` is a per-browser, per-device store. Clearing browser data,
using a different browser, or switching devices starts fresh — that is
expected, and it is exactly why the local backup file exists. There is no
login, no account, and no server copy to reconcile against.

## Boundary: static resources vs learner data

- **Static application resources** (shipped bytes, cacheable): topic HTML,
  CSS/JS, icons, web manifest, service worker, `data/topic-manifest.json`,
  `data/assessments.json`, curriculum Markdown. Identical for every learner.
- **Learner data** (per-browser, never cached, never transmitted): the
  `localStorage` records and backup files above. Unique to each learner.

The `scripts/privacy-boundary.test.js` suite scans the runtime sources on
every `npm test` run and fails the build if any prohibited transmission or
persistence mechanism is introduced. `scripts/check.js` enforces the same
boundary during `npm run build:notes`.
