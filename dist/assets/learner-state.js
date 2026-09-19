/**
 * Tarangam unified learner state (browser + Node, no dependencies).
 *
 * Single interface for reading/writing learning progress. Backed by the
 * EXISTING localStorage keys — nothing previously stored is discarded:
 * - `tarangam_visited_<COURSE>` (JSON id array; legacy source of truth —
 *   a visited id keeps meaning "completed", exactly as the old UI labeled
 *   it) continues to be written on explicit completion so old readers
 *   keep working.
 * - `tarangam_visited_ts_<COURSE>` ({ id: timestamp } last-access map)
 *   continues to be touched on every start/completion.
 * - `tarangam_topic_state_v1` ({ "COURSE/id": { status, updatedAt } })
 *   carries the new explicit statuses and wins over legacy data.
 *
 * Status resolution per topic: explicit v1 record > legacy visited
 * (completed) > legacy timestamp only (in_progress) > not_started.
 * Viewing a topic marks it started (never downgrades an explicit
 * completed); completion is always an explicit action. Unknown topic ids
 * never crash: they resolve to not_started and are excluded from
 * manifest-based progress math. All 432 manifest topics count equally;
 */
import {
  getNextTopic as engineGetNextTopic,
  getReadyTopics as engineGetReadyTopics,
  getInProgressTopics as engineGetInProgressTopics,
} from './learner-path.js';

export const STATUS_NOT_STARTED = 'not_started';
export const STATUS_IN_PROGRESS = 'in_progress';
export const STATUS_COMPLETED = 'completed';
export const VALID_STATUSES = [STATUS_NOT_STARTED, STATUS_IN_PROGRESS, STATUS_COMPLETED];

export const V1_STATE_KEY = 'tarangam_topic_state_v1';

export const legacyVisitedKey = (courseCode) => `tarangam_visited_${courseCode}`;
export const legacyTimestampKey = (courseCode) => `tarangam_visited_ts_${courseCode}`;
export const topicKey = (courseCode, topicId) => `${courseCode}/${topicId}`;

function safeJsonParse(raw, fallback) {
  if (typeof raw !== 'string' || !raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

// In-memory storage with the localStorage interface — used for tests and
// as a safe fallback when localStorage is missing or throws.
export function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
    _dump: () => ({ ...data }),
  };
}

let sharedMemoryFallback = null;

// Browser localStorage, falling back to memory when unavailable
// (private mode, SSR, tests) so the app never breaks.
export function defaultStorage() {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.getItem('__tarangam_probe__');
      return globalThis.localStorage;
    }
  } catch {
    // fall through to memory
  }
  if (!sharedMemoryFallback) sharedMemoryFallback = memoryStorage();
  return sharedMemoryFallback;
}

function readV1Map(store) {
  const parsed = safeJsonParse(store.getItem(V1_STATE_KEY), {});
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

function readLegacyVisited(store, courseCode) {
  const parsed = safeJsonParse(store.getItem(legacyVisitedKey(courseCode)), []);
  return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
}

function readLegacyStamps(store, courseCode) {
  const parsed = safeJsonParse(store.getItem(legacyTimestampKey(courseCode)), {});
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

function writeJson(store, key, value) {
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // quota/private mode: state stays in memory only
  }
}

function sanitizeV1Entry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  if (!VALID_STATUSES.includes(entry.status)) return null;
  return {
    status: entry.status,
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : null,
  };
}

/**
 * Create a learner-state store. Options:
 * - manifest: topic manifest object or null (progress/prerequisite math
 *   needs it; topic pages work without it using rendered totals + nav).
 * - storage: localStorage-like object (defaults to browser localStorage
 *   with a memory fallback). Pass memoryStorage() in tests.
 */
export function createLearnerState({ manifest = null, storage = null } = {}) {
  const store = storage || defaultStorage();

  const manifestTopics = () => (manifest && Array.isArray(manifest.topics) ? manifest.topics : []);
  const findManifestTopic = (courseCode, topicId) =>
    manifestTopics().find((t) => t.courseCode === courseCode && t.id === topicId) ?? null;

  function getTopicState(courseCode, topicId) {
    const key = topicKey(courseCode, topicId);
    const record = sanitizeV1Entry(readV1Map(store)[key]);
    if (record) {
      return { status: record.status, updatedAt: record.updatedAt, legacy: false };
    }
    if (readLegacyVisited(store, courseCode).includes(topicId)) {
      return { status: STATUS_COMPLETED, updatedAt: null, legacy: true };
    }
    const stamps = readLegacyStamps(store, courseCode);
    if (typeof stamps[topicId] === 'number') {
      return { status: STATUS_IN_PROGRESS, updatedAt: stamps[topicId], legacy: true };
    }
    return { status: STATUS_NOT_STARTED, updatedAt: null, legacy: false };
  }

  function lastAccessed(courseCode, topicId) {
    const stamps = readLegacyStamps(store, courseCode);
    const fromStamps = typeof stamps[topicId] === 'number' ? stamps[topicId] : null;
    const record = sanitizeV1Entry(readV1Map(store)[topicKey(courseCode, topicId)]);
    return record && typeof record.updatedAt === 'number' ? record.updatedAt : fromStamps;
  }

  function touchTimestamp(courseCode, topicId, now = Date.now()) {
    const key = legacyTimestampKey(courseCode);
    const stamps = readLegacyStamps(store, courseCode);
    stamps[topicId] = now;
    writeJson(store, key, stamps);
  }

  function setTopicState(courseCode, topicId, status, now = Date.now()) {
    if (!VALID_STATUSES.includes(status)) {
      throw new TypeError(`Invalid topic status "${status}" — expected one of ${VALID_STATUSES.join(', ')}`);
    }
    const key = topicKey(courseCode, topicId);
    const v1 = readV1Map(store);
    // An explicit not_started is stored (not deleted) so it wins over
    // timestamp history; only clearCourseState truly erases records.
    v1[key] = { status, updatedAt: now };
    if (status === STATUS_NOT_STARTED) {
      const visited = readLegacyVisited(store, courseCode).filter((id) => id !== topicId);
      writeJson(store, legacyVisitedKey(courseCode), visited);
    } else if (status === STATUS_COMPLETED && !readLegacyVisited(store, courseCode).includes(topicId)) {
      const visited = readLegacyVisited(store, courseCode);
      visited.push(topicId);
      writeJson(store, legacyVisitedKey(courseCode), visited);
    }
    writeJson(store, V1_STATE_KEY, v1);
    touchTimestamp(courseCode, topicId, now);
    return getTopicState(courseCode, topicId);
  }

  // Viewing marks started when nothing is recorded yet; explicit
  // completed/in_progress states are never downgraded by a view.
  function markTopicStarted(courseCode, topicId, now = Date.now()) {
    const current = getTopicState(courseCode, topicId);
    if (current.status === STATUS_NOT_STARTED) {
      return setTopicState(courseCode, topicId, STATUS_IN_PROGRESS, now);
    }
    touchTimestamp(courseCode, topicId, now);
    return current;
  }

  function markTopicCompleted(courseCode, topicId, now = Date.now()) {
    return setTopicState(courseCode, topicId, STATUS_COMPLETED, now);
  }

  function toggleTopicCompleted(courseCode, topicId, now = Date.now()) {
    const current = getTopicState(courseCode, topicId);
    return setTopicState(
      courseCode, topicId,
      current.status === STATUS_COMPLETED ? STATUS_NOT_STARTED : STATUS_COMPLETED,
      now
    );
  }

  function isTopicCompleted(courseCode, topicId) {
    return getTopicState(courseCode, topicId).status === STATUS_COMPLETED;
  }

  function summarize(topicList) {
    const total = topicList.length;
    let completed = 0;
    let inProgress = 0;
    for (const t of topicList) {
      const s = getTopicState(t.courseCode, t.id).status;
      if (s === STATUS_COMPLETED) completed += 1;
      else if (s === STATUS_IN_PROGRESS) inProgress += 1;
    }
    const notStarted = total - completed - inProgress;
    return {
      total, completed, inProgress, notStarted,
      percent: total ? Math.round((completed / total) * 100) : 0,
    };
  }

  function getCourseProgress(courseCode) {
    return summarize(manifestTopics().filter((t) => t.courseCode === courseCode));
  }

  function getModuleProgress(courseCode, module) {
    return summarize(manifestTopics().filter((t) => t.courseCode === courseCode && t.module === module));
  }

  function getOverallProgress() {
    return summarize(manifestTopics());
  }

  function formatProgress(label, summary) {
    return `${label}: ${summary.completed} / ${summary.total} completed`;
  }

  // Prerequisite helpers use manifest data; without a manifest (topic
  // pages) they safely resolve to empty. Legacy topics carry no
  // prerequisites, so they report ordinary empty completion state.
  function prereqEntries(courseCode, topicId) {
    const topic = findManifestTopic(courseCode, topicId);
    if (!topic || !Array.isArray(topic.prerequisites)) return [];
    return topic.prerequisites.map((id) => ({
      courseCode,
      id,
      state: getTopicState(courseCode, id).status,
    }));
  }

  function getCompletedPrerequisites(courseCode, topicId) {
    return prereqEntries(courseCode, topicId).filter((p) => p.state === STATUS_COMPLETED);
  }

  function getIncompletePrerequisites(courseCode, topicId) {
    return prereqEntries(courseCode, topicId).filter((p) => p.state !== STATUS_COMPLETED);
  }

  function getPrerequisiteCompletion(courseCode, topicId) {
    const all = prereqEntries(courseCode, topicId);
    const completed = all.filter((p) => p.state === STATUS_COMPLETED).length;
    return {
      completed,
      total: all.length,
      percent: all.length ? Math.round((completed / all.length) * 100) : 100,
    };
  }

  // Removes all progress for one course (visited array, v1 records,
  // timestamps). Explicit reset action only — never called implicitly.
  function clearCourseState(courseCode) {
    try {
      store.removeItem(legacyVisitedKey(courseCode));
    } catch { /* ignore */ }
    try {
      store.removeItem(legacyTimestampKey(courseCode));
    } catch { /* ignore */ }
    const v1 = readV1Map(store);
    let changed = false;
    for (const key of Object.keys(v1)) {
      if (key.startsWith(`${courseCode}/`)) {
        delete v1[key];
        changed = true;
      }
    }
    if (changed) writeJson(store, V1_STATE_KEY, v1);
  }

  // Path-engine bindings (pure calculations in ./learner-path.js over
  // this store's statuses; getIncompletePrerequisites above covers the
  // remaining requested helper).
  const statusReader = (courseCode, topicId) => getTopicState(courseCode, topicId).status;

  function getNextTopic() {
    return engineGetNextTopic(manifest, statusReader);
  }

  function getReadyTopics() {
    return engineGetReadyTopics(manifest, statusReader);
  }

  function getInProgressTopics() {
    return engineGetInProgressTopics(manifest, statusReader);
  }

  return {
    manifest,
    getTopicState,
    lastAccessed,
    setTopicState,
    markTopicStarted,
    markTopicCompleted,
    toggleTopicCompleted,
    isTopicCompleted,
    getCourseProgress,
    getModuleProgress,
    getOverallProgress,
    formatProgress,
    getCompletedPrerequisites,
    getIncompletePrerequisites,
    getPrerequisiteCompletion,
    getNextTopic,
    getReadyTopics,
    getInProgressTopics,
    clearCourseState,
  };
}
