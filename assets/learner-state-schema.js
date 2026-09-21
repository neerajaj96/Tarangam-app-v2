/**
 * Tarangam canonical Learner-State Schema Registry (browser + Node, no
 * dependencies).
 *
 * One explicit home for the learner-state storage contract: the current
 * schema version, every persisted key, the shape of persisted data,
 * deterministic validation, and the migration pipeline
 * (load → detect version → migrate sequentially → validate → persist).
 * Data stays local-only: this module talks to an injected browser-store
 * object and never touches global storage singletons, IDB-style stores,
 * fetch, or any backend itself.
 *
 * Version history (append-only; never rewrite history):
 * - v0 "legacy": per-course `tarangam_visited_<COURSE>` id arrays
 *   (completed) plus `tarangam_visited_ts_<COURSE>` last-access maps.
 *   Still written by the state layer so old readers keep working.
 * - v1 (current): `tarangam_topic_state_v1`, a plain object mapping
 *   `"COURSE/id"` to `{ status, updatedAt }` with status in
 *   not_started | in_progress | completed and updatedAt a finite number
 *   or null. No wrapper, no version field inside — the "v1" lives in the
 *   key name, exactly as shipped. Unknown topic ids are tolerated (kept,
 *   flagged, excluded from manifest math by readers).
 * - v2+ (future): MUST use `tarangam_topic_state_vN`. Presence of a
 *   higher-version key means a newer writer owns the data: readers enter
 *   a safe read-only mode that never writes, downgrades, or overwrites.
 *
 * Recovery rules (all total — never throw on hostile storage):
 * - missing everything → valid default (empty v1 map).
 * - unparseable or structurally invalid v1 → back the raw blob up under
 *   a fixed backup key, then recover (rebuild from legacy evidence when
 *   any exists, else the default).
 * - malformed entries/fields → dropped (entries) or coerced to null
 *   (updatedAt), with the rest preserved byte-identically.
 * - unknown future version → preserve everything, read-only, no writes.
 */

import {
  VALID_STATUSES,
  STATUS_COMPLETED,
  STATUS_IN_PROGRESS,
  STATUS_NOT_STARTED,
  V1_STATE_KEY,
  V1_CORRUPT_BACKUP_KEY,
  V2_STATE_KEY,
  legacyVisitedKey,
  legacyTimestampKey,
  topicKey,
} from './learner-state.js';

export { V1_CORRUPT_BACKUP_KEY, V2_STATE_KEY };

export const LEARNER_SCHEMA_VERSION = 1;

export const VERSION_EMPTY = 'empty';
export const VERSION_LEGACY = 'legacy';
export const VERSION_CURRENT = 'current';
export const VERSION_CORRUPT = 'corrupt';
export const VERSION_FUTURE = 'future';

// Central registry: version, keys, and shapes in one inspectable place.
export function describeLearnerSchema() {
  return {
    version: LEARNER_SCHEMA_VERSION,
    keys: {
      v1State: V1_STATE_KEY,
      legacyVisited: 'tarangam_visited_<COURSE>',
      legacyTimestamps: 'tarangam_visited_ts_<COURSE>',
      futureState: 'tarangam_topic_state_vN (N > 1)',
      corruptBackup: V1_CORRUPT_BACKUP_KEY,
    },
    v1Entry: {
      status: [...VALID_STATUSES],
      updatedAt: 'finite number or null',
    },
    legacyVisited: 'array of topic id strings (each means completed)',
    legacyTimestamps: 'object mapping topic id to finite-number timestamps',
    locality: 'injected browser store only; no backend, no sync',
  };
}

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

function parseJson(raw) {
  if (typeof raw !== 'string' || !raw) return { ok: false, value: null };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, value: null };
  }
}

function storageKeys(store) {
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
  for (const key of storageKeys(store)) {
    // Timestamp keys (`…_ts_<COURSE>`) must be tested first: they also
    // match the visited prefix and would otherwise phantom a `ts_<C>`
    // course into every validation/migration report.
    let m = typeof key === 'string' && key.match(/^tarangam_visited_ts_(.+)$/);
    if (m) {
      courses.add(m[1]);
      continue;
    }
    m = typeof key === 'string' && key.match(/^tarangam_visited_(.+)$/);
    if (m) courses.add(m[1]);
  }
  return [...courses].sort();
}

// --- Detection ---------------------------------------------------------------

// Every future-version key present in storage: any
// `tarangam_topic_state_vN` with N > LEARNER_SCHEMA_VERSION, sorted
// ascending. Best-effort enumeration (_dump, then length/key); stores
// without enumeration fall back to the direct V2 probe in
// detectStoredVersion below. Never throws.
export function futureVersionKeys(store) {
  const found = new Set();
  try {
    for (const key of storageKeys(store)) {
      const m = typeof key === 'string' && key.match(/^tarangam_topic_state_v(\d+)$/);
      if (m && Number(m[1]) > LEARNER_SCHEMA_VERSION) found.add(Number(m[1]));
    }
  } catch {
    // enumeration unavailable
  }
  // Direct probe: catches v2 even where enumeration is unsupported.
  try {
    if (store && typeof store.getItem === 'function' && store.getItem(V2_STATE_KEY) !== null) {
      found.add(2);
    }
  } catch {
    // unreadable probe
  }
  return [...found].sort((a, b) => a - b).filter((n) => n > LEARNER_SCHEMA_VERSION);
}

// Classify what a store holds without changing a byte. Never throws.
// Future detection recognizes ANY vN above the current version.
export function detectStoredVersion(store) {
  const futureVersions = futureVersionKeys(store);
  if (futureVersions.length) {
    return {
      kind: VERSION_FUTURE, version: null, futureVersions,
      hasV1: safeGet(store, V1_STATE_KEY) !== null,
    };
  }
  const raw = safeGet(store, V1_STATE_KEY);
  if (raw === null) {
    const courses = legacyCoursesIn(store);
    if (courses.length) return { kind: VERSION_LEGACY, version: 0, courses };
    return { kind: VERSION_EMPTY, version: null, courses: [] };
  }
  const parsed = parseJson(raw);
  if (!parsed.ok || !isPlainObject(parsed.value)) {
    return { kind: VERSION_CORRUPT, version: null, courses: legacyCoursesIn(store) };
  }
  return { kind: VERSION_CURRENT, version: 1, courses: legacyCoursesIn(store) };
}

export function isFutureVersion(store) {
  try {
    return detectStoredVersion(store).kind === VERSION_FUTURE;
  } catch {
    return false;
  }
}

// --- Validation ----------------------------------------------------------------

// Validate one v1 entry. Returns a cleaned entry or null (drop), plus
// per-entry error/warning strings. Unknown topic ids are KEPT (flagged as
// warnings with a manifest): readers exclude them from math, and dropping
// user data would be data loss.
export function validateV1Entry(key, entry, manifest = null) {
  const errors = [];
  const warnings = [];
  if (typeof key !== 'string' || !key) {
    return { entry: null, errors: ['entry key must be a non-empty string'], warnings };
  }
  if (!isPlainObject(entry)) {
    return { entry: null, errors: [`${key}: entry must be an object`], warnings };
  }
  if (!VALID_STATUSES.includes(entry.status)) {
    return { entry: null, errors: [`${key}: invalid status ${JSON.stringify(entry.status)}`], warnings };
  }
  let updatedAt = null;
  if (entry.updatedAt !== undefined && entry.updatedAt !== null) {
    if (typeof entry.updatedAt === 'number' && Number.isFinite(entry.updatedAt)) {
      updatedAt = entry.updatedAt;
    } else {
      warnings.push(`${key}: non-numeric updatedAt coerced to null`);
    }
  }
  if (manifest && Array.isArray(manifest.topics)) {
    const slash = key.indexOf('/');
    const course = slash === -1 ? null : key.slice(0, slash);
    const id = slash === -1 ? key : key.slice(slash + 1);
    const known = course !== null && manifest.topics.some((t) => t.courseCode === course && t.id === id);
    if (!known) warnings.push(`${key}: unknown topic reference (kept, excluded from manifest math)`);
  }
  return { entry: { status: entry.status, updatedAt }, errors, warnings };
}

// Validate a whole v1 map. Never throws; cleaned drops only malformed
// entries, preserving every valid byte of the rest.
export function validateV1Map(value, manifest = null) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(value)) {
    return { valid: false, cleaned: {}, errors: ['v1 state must be a plain object'], warnings };
  }
  const cleaned = {};
  for (const key of Object.keys(value)) {
    const result = validateV1Entry(key, value[key], manifest);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.entry) cleaned[key] = result.entry;
  }
  return { valid: errors.length === 0, cleaned, errors, warnings };
}

export function validateLegacyVisited(value) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(value)) {
    return { valid: false, cleaned: [], errors: ['legacy visited must be an array'], warnings };
  }
  const cleaned = [];
  for (const id of value) {
    if (typeof id === 'string' && id) cleaned.push(id);
    else warnings.push('legacy visited dropped a non-string entry');
  }
  return { valid: errors.length === 0, cleaned, errors, warnings };
}

export function validateLegacyStamps(value) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(value)) {
    return { valid: false, cleaned: {}, errors: ['legacy timestamps must be a plain object'], warnings };
  }
  const cleaned = {};
  for (const key of Object.keys(value)) {
    if (typeof value[key] === 'number' && Number.isFinite(value[key])) cleaned[key] = value[key];
    else warnings.push(`legacy timestamps dropped non-numeric entry for "${key}"`);
  }
  return { valid: errors.length === 0, cleaned, errors, warnings };
}

// Aggregate validation of everything a store holds. Never throws and
// never writes.
export function validateStoredState(store, manifest = null) {
  const errors = [];
  const warnings = [];
  const detected = detectStoredVersion(store);
  let v1 = null;
  if (detected.kind === VERSION_CURRENT) {
    const raw = safeGet(store, V1_STATE_KEY);
    const parsed = parseJson(raw);
    v1 = validateV1Map(parsed.ok ? parsed.value : null, manifest);
    errors.push(...v1.errors);
    warnings.push(...v1.warnings);
  } else if (detected.kind === VERSION_CORRUPT) {
    errors.push('v1 state is unparseable or structurally invalid');
  }
  const legacy = { visited: {}, stamps: {} };
  for (const course of legacyCoursesIn(store)) {
    // A missing legacy key is simply empty (not an error); only present
    // but malformed values are reported.
    const visitedRaw = safeGet(store, legacyVisitedKey(course));
    const visited = visitedRaw === null
      ? { valid: true, cleaned: [], errors: [], warnings: [] }
      : validateLegacyVisited(parseJson(visitedRaw).value);
    const stampsRaw = safeGet(store, legacyTimestampKey(course));
    const stamps = stampsRaw === null
      ? { valid: true, cleaned: {}, errors: [], warnings: [] }
      : validateLegacyStamps(parseJson(stampsRaw).value);
    legacy.visited[course] = visited;
    legacy.stamps[course] = stamps;
    errors.push(...visited.errors, ...stamps.errors);
    warnings.push(...visited.warnings, ...stamps.warnings);
  }
  return { ...detected, v1, legacy, errors, warnings, valid: errors.length === 0 };
}

// --- Migration ------------------------------------------------------------------

function materializeFromLegacy(store) {
  const warnings = [];
  const records = {};
  for (const course of legacyCoursesIn(store)) {
    const visitedParsed = parseJson(safeGet(store, legacyVisitedKey(course)));
    const stampsParsed = parseJson(safeGet(store, legacyTimestampKey(course)));
    const visited = validateLegacyVisited(visitedParsed.ok ? visitedParsed.value : []).cleaned;
    const stamps = validateLegacyStamps(stampsParsed.ok ? stampsParsed.value : {}).cleaned;
    const visitedSet = new Set(visited);
    for (const id of visitedSet) {
      const stamp = stamps[id];
      records[topicKey(course, id)] = {
        status: STATUS_COMPLETED,
        updatedAt: typeof stamp === 'number' ? stamp : null,
      };
    }
    for (const id of Object.keys(stamps)) {
      if (!visitedSet.has(id)) {
        records[topicKey(course, id)] = { status: STATUS_IN_PROGRESS, updatedAt: stamps[id] };
      }
    }
    if (!visited.length && !Object.keys(stamps).length) {
      warnings.push(`${course}: legacy keys held no usable entries`);
    }
  }
  return { records, warnings };
}

// Explicit migration pipeline: load → detect → migrate sequentially →
// validate → persist. Idempotent: reruns detect a current store and change
// nothing. Future versions: no writes at all (read-only preservation).
// Legacy keys are never deleted (old readers keep working).
export function migrateStoredState(store, manifest = null) {
  const errors = [];
  const warnings = [];
  let detected;
  try {
    detected = detectStoredVersion(store);
  } catch (e) {
    return { migrated: false, from: null, to: null, readOnly: false, errors: [String((e && e.message) || e)], warnings };
  }

  if (detected.kind === VERSION_FUTURE) {
    return { migrated: false, from: 'future', to: null, readOnly: true, errors, warnings };
  }

  if (detected.kind === VERSION_CURRENT) {
    const report = validateStoredState(store, manifest);
    return {
      migrated: false, from: 'current', to: LEARNER_SCHEMA_VERSION, readOnly: false,
      errors: report.errors, warnings: report.warnings,
    };
  }

  // Legacy, corrupt, or empty: build the canonical v1 map.
  const merged = {};
  if (detected.kind === VERSION_CORRUPT) {
    const raw = safeGet(store, V1_STATE_KEY);
    safeSet(store, V1_CORRUPT_BACKUP_KEY, typeof raw === 'string' ? raw : '');
    warnings.push('unparseable v1 blob backed up before recovery');
  }
  const built = materializeFromLegacy(store);
  warnings.push(...built.warnings);
  Object.assign(merged, built.records);

  const validated = validateV1Map(merged, manifest);
  errors.push(...validated.errors);
  warnings.push(...validated.warnings);
  if (errors.length) {
    return { migrated: false, from: detected.kind, to: null, readOnly: false, errors, warnings };
  }
  if (!safeSet(store, V1_STATE_KEY, JSON.stringify(validated.cleaned))) {
    errors.push('could not persist migrated state (storage unavailable)');
    return { migrated: false, from: detected.kind, to: null, readOnly: false, errors, warnings };
  }
  return {
    migrated: true,
    from: detected.kind === VERSION_EMPTY ? 'empty' : detected.kind,
    to: LEARNER_SCHEMA_VERSION,
    readOnly: false,
    errors,
    warnings,
  };
}

// Ensure a valid default exists without disturbing anything readable.
// Used at load time; never throws.
export function ensureDefaultState(store) {
  try {
    const detected = detectStoredVersion(store);
    if (detected.kind === VERSION_EMPTY) {
      safeSet(store, V1_STATE_KEY, JSON.stringify({}));
      return { ensured: true, kind: VERSION_EMPTY };
    }
    if (detected.kind === VERSION_CORRUPT) {
      const raw = safeGet(store, V1_STATE_KEY);
      safeSet(store, V1_CORRUPT_BACKUP_KEY, typeof raw === 'string' ? raw : '');
      safeSet(store, V1_STATE_KEY, JSON.stringify({}));
      return { ensured: true, kind: VERSION_CORRUPT };
    }
    return { ensured: false, kind: detected.kind };
  } catch {
    return { ensured: false, kind: null };
  }
}

export { STATUS_COMPLETED, STATUS_IN_PROGRESS, STATUS_NOT_STARTED };
