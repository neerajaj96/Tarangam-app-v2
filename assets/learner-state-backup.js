/**
 * Tarangam canonical Learner-State Backup & Restore (browser + Node, no
 * dependencies).
 *
 * Local-only export/import of the complete supported learner state:
 * explicit v1 progress records plus legacy visited/timestamp evidence
 * (both are read by the application, so both are preserved exactly —
 * statuses, timestamps, and legacy membership). Assessment attempts live
 * in a separate versioned store with their own round-trip and are
 * deliberately out of scope here.
 *
 * Backup format (deterministic JSON, stable key ordering, sorted keys):
 * {
 *   "format": "tarangam-learner-state-backup",
 *   "formatVersion": 1,
 *   "schemaVersion": 1,
 *   "exportedAt": <finite ms timestamp>,
 *   "records": { "COURSE/id": { "status": "...", "updatedAt": <n|null> } },
 *   "legacy": {
 *     "visited": { "COURSE": ["id", ...] },
 *     "timestamps": { "COURSE": { "id": <ms>, ... } }
 *   }
 * }
 * A legacy backup (`formatVersion: 0`, no `records`, legacy section only)
 * restores through the canonical migration layer. Backups declaring a
 * newer format or schema version are rejected without touching storage —
 * future data is never silently downgraded.
 *
 * Restore strategy: validate everything first (pure, zero writes), then
 * replace the canonical learner-state keys atomically (snapshot +
 * rollback on write failure). Failed imports leave storage byte-for-byte
 * unchanged. Stores already owned by a future writer are never touched:
 * restore refuses outright. Nothing here sends data anywhere: export
 * downloads a file, import reads a user-selected file, and both run
 * entirely in the browser. No backend, no sync, no accounts.
 */

import {
  VALID_STATUSES,
  V1_STATE_KEY,
  legacyVisitedKey,
  legacyTimestampKey,
} from './learner-state.js';
import {
  LEARNER_SCHEMA_VERSION,
  validateV1Map,
  validateLegacyVisited,
  validateLegacyStamps,
  validateStoredState,
  migrateStoredState,
  futureVersionKeys,
} from './learner-state-schema.js';
export const BACKUP_FORMAT = 'tarangam-learner-state-backup';
export const BACKUP_FORMAT_VERSION = 1;

export const BACKUP_EXPORT_FILENAME = 'tarangam-learner-state-backup.json';

// --- Internal guards --------------------------------------------------------

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeGet(store, key) {
  try {
    const value = store.getItem(key);
    return value === undefined ? null : value;
  } catch {
    return null;
  }
}

function safeSet(store, key, raw) {
  try {
    store.setItem(key, raw);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(store, key) {
  try {
    store.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function parseJson(raw) {
  if (typeof raw !== 'string' || !raw) return { ok: false, value: null };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, value: null };
  }
}

function enumerateKeys(store) {
  try {
    if (store && typeof store._dump === 'function') return Object.keys(store._dump());
    if (store && typeof store.length === 'number' && typeof store.key === 'function') {
      const out = [];
      for (let i = 0; i < store.length; i += 1) {
        try {
          out.push(store.key(i));
        } catch {
          // ignore unreadable slots
        }
      }
      return out.filter((k) => typeof k === 'string');
    }
  } catch {
    // enumeration unavailable
  }
  return [];
}

function legacyCoursesIn(store) {
  const courses = new Set();
  for (const key of enumerateKeys(store)) {
    // Timestamp keys first: they also match the visited prefix and would
    // otherwise phantom a `ts_<C>` course into snapshots and restores.
    let m = key.match(/^tarangam_visited_ts_(.+)$/);
    if (m) {
      courses.add(m[1]);
      continue;
    }
    m = key.match(/^tarangam_visited_(.+)$/);
    if (m) courses.add(m[1]);
  }
  return [...courses].sort();
}

function resolveNow(now) {
  return typeof now === 'number' && Number.isFinite(now) ? now : Date.now();
}

function sortedObject(entries) {
  const out = {};
  for (const key of Object.keys(entries).sort()) out[key] = entries[key];
  return out;
}

// --- Export -------------------------------------------------------------------

// Build the canonical backup object from a store (pure read; never writes).
// Statuses and timestamps are preserved exactly; key and id ordering is
// normalized (sorted) so repeated exports are byte-identical.
export function buildBackup(store, options = {}) {
  const now = resolveNow(options.now);
  const rawV1 = safeGet(store, V1_STATE_KEY);
  const parsed = parseJson(rawV1);
  const v1map = parsed.ok && isPlainObject(parsed.value) ? parsed.value : {};
  const records = {};
  for (const key of Object.keys(v1map).sort()) {
    const entry = v1map[key];
    if (!isPlainObject(entry) || !VALID_STATUSES.includes(entry.status)) continue;
    records[key] = {
      status: entry.status,
      updatedAt: typeof entry.updatedAt === 'number' && Number.isFinite(entry.updatedAt)
        ? entry.updatedAt
        : null,
    };
  }
  const visited = {};
  const timestamps = {};
  for (const course of legacyCoursesIn(store)) {
    const visitedParsed = parseJson(safeGet(store, legacyVisitedKey(course)));
    const ids = Array.isArray(visitedParsed.ok ? visitedParsed.value : null)
      ? [...new Set((visitedParsed.value).filter((id) => typeof id === 'string' && id))].sort()
      : [];
    const stampsParsed = parseJson(safeGet(store, legacyTimestampKey(course)));
    const stamps = {};
    if (stampsParsed.ok && isPlainObject(stampsParsed.value)) {
      for (const id of Object.keys(stampsParsed.value).sort()) {
        if (typeof stampsParsed.value[id] === 'number' && Number.isFinite(stampsParsed.value[id])) {
          stamps[id] = stampsParsed.value[id];
        }
      }
    }
    if (ids.length || Object.keys(stamps).length) {
      visited[course] = ids;
      timestamps[course] = stamps;
    }
  }
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: LEARNER_SCHEMA_VERSION,
    exportedAt: now,
    records,
    legacy: { visited: sortedObject(visited), timestamps: sortedObject(timestamps) },
  };
}

// Deterministic JSON serialization of a backup object.
export function serializeBackup(backup) {
  return JSON.stringify(backup);
}

// Full export: canonical deterministic JSON string. Pure apart from
// reading the store.
export function exportBackup(store, options = {}) {
  return serializeBackup(buildBackup(store, options));
}

// Browser download of the current backup. Returns false (never throws)
// outside a browser; otherwise triggers a local file download — data
// never leaves the device.
export function downloadBackup(store, options = {}) {
  try {
    if (typeof document === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') {
      return false;
    }
    const text = exportBackup(store, options);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = options.filename || BACKUP_EXPORT_FILENAME;
    if (document.body) document.body.appendChild(anchor);
    anchor.click();
    if (anchor.remove) anchor.remove();
    if (typeof URL.revokeObjectURL === 'function') {
      window.setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore revocation failures
        }
      }, 1000);
    }
    return true;
  } catch {
    return false;
  }
}

// --- Preview / validation (zero writes) ----------------------------------------

// Validate a backup (parsed object or JSON string) without touching
// storage. Returns { ok, errors[], warnings[], summary } where summary
// counts records, completed topics, legacy evidence, and unknown topic
// references (with a manifest). Unknown topics warn (kept, excluded from
// math by readers) rather than fail; everything else malformed fails.
export function previewBackupImport(rawOrParsed, manifest = null) {
  const errors = [];
  const warnings = [];
  let backup = rawOrParsed;
  if (typeof backup === 'string') {
    const parsed = parseJson(backup);
    if (!parsed.ok) return { ok: false, errors: ['backup is not valid JSON'], warnings, summary: null };
    backup = parsed.value;
  }
  if (!isPlainObject(backup)) {
    return { ok: false, errors: ['backup must be a JSON object'], warnings, summary: null };
  }
  if (backup.format !== BACKUP_FORMAT) {
    return { ok: false, errors: ['unrecognized backup identity (not a Tarangam learner-state backup)'], warnings, summary: null };
  }
  if (backup.formatVersion !== undefined && backup.formatVersion !== null
    && backup.formatVersion !== BACKUP_FORMAT_VERSION && backup.formatVersion !== 0) {
    return { ok: false, errors: [`unsupported backup format version ${JSON.stringify(backup.formatVersion)} (data preserved: restore refused, nothing written)`], warnings, summary: null };
  }
  if (typeof backup.schemaVersion === 'number' && backup.schemaVersion > LEARNER_SCHEMA_VERSION) {
    return { ok: false, errors: [`backup targets schema v${backup.schemaVersion} (newer than v${LEARNER_SCHEMA_VERSION}): refusing to downgrade future data`], warnings, summary: null };
  }
  // A v1 backup without records is malformed (only the legacy format
  // may omit records). Version mismatches were already rejected above.
  const isLegacyBackup = backup.formatVersion === 0
    || (backup.records === undefined && (backup.formatVersion === undefined || backup.formatVersion === null));
  if (isLegacyBackup) {
    if (!isPlainObject(backup.legacy)) {
      return { ok: false, errors: ['legacy backup is missing its legacy section'], warnings, summary: null };
    }
    return {
      ok: true,
      errors,
      warnings,
      summary: {
        kind: 'legacy',
        records: 0,
        completed: 0,
        legacyCourses: backup.legacy && isPlainObject(backup.legacy.visited) ? Object.keys(backup.legacy.visited).length : 0,
        unknownTopics: 0,
      },
    };
  }
  if (!isPlainObject(backup.records)) {
    return { ok: false, errors: ['backup is missing its records section'], warnings, summary: null };
  }
  if (backup.exportedAt !== undefined && !(typeof backup.exportedAt === 'number' && Number.isFinite(backup.exportedAt))) {
    return { ok: false, errors: ['backup exportedAt must be a finite timestamp'], warnings, summary: null };
  }
  const validated = validateV1Map(backup.records, manifest);
  errors.push(...validated.errors);
  // Import is strict where reads are tolerant: unknown topic references
  // stay warnings (kept, excluded from math by readers), but every other
  // anomaly — including non-numeric timestamps — fails validation.
  // Nothing is written until this passes completely.
  for (const warning of validated.warnings) {
    if (warning.includes('unknown topic reference')) warnings.push(warning);
    else errors.push(warning);
  }
  if (!isPlainObject(backup.legacy)) {
    errors.push('backup is missing its legacy section');
  } else {
    const visited = isPlainObject(backup.legacy.visited) ? backup.legacy.visited : null;
    const stamps = isPlainObject(backup.legacy.timestamps) ? backup.legacy.timestamps : null;
    if (!visited || !stamps) {
      errors.push('backup legacy section must hold visited and timestamps objects');
    } else {
      for (const course of Object.keys(visited)) {
        const result = validateLegacyVisited(visited[course]);
        // Strict on import (reads stay tolerant): malformed legacy values
        // fail the restore instead of propagating.
        errors.push(...result.errors.map((e) => `legacy visited ${course}: ${e}`));
        errors.push(...result.warnings.map((w) => `legacy visited ${course}: ${w}`));
      }
      for (const course of Object.keys(stamps)) {
        const result = validateLegacyStamps(stamps[course]);
        errors.push(...result.errors.map((e) => `legacy timestamps ${course}: ${e}`));
        errors.push(...result.warnings.map((w) => `legacy timestamps ${course}: ${w}`));
      }
    }
  }
  if (errors.length) {
    return { ok: false, errors, warnings, summary: null };
  }
  let completed = 0;
  for (const key of Object.keys(validated.cleaned)) {
    if (validated.cleaned[key].status === 'completed') completed += 1;
  }
  const unknownTopics = warnings.filter((w) => w.includes('unknown topic reference')).length;
  return {
    ok: true,
    errors,
    warnings,
    summary: {
      kind: 'full',
      records: Object.keys(validated.cleaned).length,
      completed,
      legacyCourses: backup.legacy && isPlainObject(backup.legacy.visited) ? Object.keys(backup.legacy.visited).length : 0,
      unknownTopics,
    },
  };
}

// --- Import (validate-first, then atomic replace) ---------------------------------

function snapshotStore(store) {
  const snapshot = { v1: safeGet(store, V1_STATE_KEY), legacy: {} };
  for (const course of legacyCoursesIn(store)) {
    snapshot.legacy[course] = {
      visited: safeGet(store, legacyVisitedKey(course)),
      stamps: safeGet(store, legacyTimestampKey(course)),
    };
  }
  return snapshot;
}

function rollbackStore(store, snapshot) {
  if (snapshot.v1 === null) safeRemove(store, V1_STATE_KEY);
  else safeSet(store, V1_STATE_KEY, snapshot.v1);
  for (const course of Object.keys(snapshot.legacy)) {
    const { visited, stamps } = snapshot.legacy[course];
    if (visited === null) safeRemove(store, legacyVisitedKey(course));
    else safeSet(store, legacyVisitedKey(course), visited);
    if (stamps === null) safeRemove(store, legacyTimestampKey(course));
    else safeSet(store, legacyTimestampKey(course), stamps);
  }
}

// Restore a backup into a store. Validates completely before writing a
// single byte: failed imports leave storage byte-for-byte unchanged.
// Successful restores replace the canonical learner-state keys (v1 map
// plus legacy visited/timestamp keys); future-version keys are never
// touched — if the target already holds future data, restore refuses.
export function importBackup(store, rawOrParsed, manifest = null) {
  const errors = [];
  const warnings = [];
  let preview;
  try {
    preview = previewBackupImport(rawOrParsed, manifest);
  } catch (e) {
    return { ok: false, errors: [String((e && e.message) || e)], warnings, summary: null };
  }
  if (!preview.ok) return preview;
  warnings.push(...preview.warnings);

  let future = [];
  try {
    future = futureVersionKeys(store);
  } catch {
    future = [];
  }
  if (future.length) {
    return {
      ok: false,
      errors: [`target storage holds future schema v${future.join(', v')} data: refusing to overwrite (nothing written)`],
      warnings,
      summary: null,
    };
  }

  const snapshot = snapshotStore(store);
  const before = JSON.stringify({ v1: snapshot.v1, legacy: snapshot.legacy });
  try {
    const backup = typeof rawOrParsed === 'string' ? JSON.parse(rawOrParsed) : rawOrParsed;
    if (preview.summary && preview.summary.kind === 'legacy') {
      // Legacy backup: write legacy keys, then run the canonical
      // migration layer to materialize the current format.
      const visited = (backup.legacy && backup.legacy.visited) || {};
      const stamps = (backup.legacy && backup.legacy.timestamps) || {};
      const courses = [...new Set([...Object.keys(visited), ...Object.keys(stamps)])].sort();
      safeRemove(store, V1_STATE_KEY);
      for (const course of legacyCoursesIn(store)) {
        safeRemove(store, legacyVisitedKey(course));
        safeRemove(store, legacyTimestampKey(course));
      }
      for (const course of courses) {
        if (visited[course] !== undefined) {
          if (!safeSet(store, legacyVisitedKey(course), JSON.stringify(visited[course]))) {
            throw new Error(`could not write legacy visited key for ${course}`);
          }
        }
        if (stamps[course] !== undefined) {
          if (!safeSet(store, legacyTimestampKey(course), JSON.stringify(stamps[course]))) {
            throw new Error(`could not write legacy timestamp key for ${course}`);
          }
        }
      }
      const migrated = migrateStoredState(store, manifest);
      errors.push(...migrated.errors);
      warnings.push(...migrated.warnings);
      if (errors.length || !migrated.migrated) {
        if (!errors.length) errors.push('legacy backup could not be migrated to the current format');
        rollbackStore(store, snapshot);
        return { ok: false, errors, warnings, summary: null };
      }
      return { ok: true, errors, warnings, summary: preview.summary };
    }

    // Full replacement with validated records.
    const validated = validateV1Map(backup.records, manifest);
    if (validated.errors.length) {
      return { ok: false, errors: [...errors, ...validated.errors], warnings, summary: null };
    }
    safeRemove(store, V1_STATE_KEY);
    for (const course of legacyCoursesIn(store)) {
      safeRemove(store, legacyVisitedKey(course));
      safeRemove(store, legacyTimestampKey(course));
    }
    if (!safeSet(store, V1_STATE_KEY, JSON.stringify(validated.cleaned))) {
      throw new Error('could not write restored v1 state');
    }
    const legacyVisited = (backup.legacy && backup.legacy.visited) || {};
    const legacyStamps = (backup.legacy && backup.legacy.timestamps) || {};
    for (const course of Object.keys(legacyVisited).sort()) {
      const checked = validateLegacyVisited(legacyVisited[course]);
      if (!safeSet(store, legacyVisitedKey(course), JSON.stringify(checked.cleaned))) {
        throw new Error(`could not write legacy visited key for ${course}`);
      }
    }
    for (const course of Object.keys(legacyStamps).sort()) {
      const checked = validateLegacyStamps(legacyStamps[course]);
      if (!safeSet(store, legacyTimestampKey(course), JSON.stringify(checked.cleaned))) {
        throw new Error(`could not write legacy timestamp key for ${course}`);
      }
    }
    // Read-back verification: the persisted state must validate cleanly.
    const reread = validateStoredState(store, manifest);
    if (!reread.valid) {
      throw new Error(`restored state failed read-back validation: ${reread.errors.join('; ')}`);
    }
    return { ok: true, errors, warnings, summary: preview.summary };
  } catch (e) {
    rollbackStore(store, snapshot);
    errors.push(String((e && e.message) || e));
    return { ok: false, errors, warnings, summary: null };
  }
}
