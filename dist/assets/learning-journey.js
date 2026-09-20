/**
 * Tarangam unified Learning Journey model (browser + Node, no dependencies).
 *
 * Pure, deterministic journey layer on top of the canonical Topic
 * Intelligence Layer (./topic-intelligence.js). No DOM, no storage, no
 * fetch, no Markdown, no AI/ML, no gamification. A status reader is any
 * `(courseCode, topicId) => status` with 'completed' | 'in_progress' |
 * 'not_started'; anything else counts as unfinished (same contract as the
 * intelligence layer). Nothing here locks or gates the learner; readiness
 * only informs and suggests.
 *
 * Exposes one coherent journey model for Dashboard, Explorer, and Topic
 * Study Context, plus the single browser event contract for progress
 * changes (`tarangam:progress-changed`, shared with the study context and
 * topic pages). Event helpers work with `document` in browsers and fall
 * back to an in-memory bus in Node/tests (no polling, localStorage stays
 * the source of truth — the event only signals "re-read").
 */

import {
  STATUS_COMPLETED,
  STATUS_IN_PROGRESS,
  STATUS_NOT_STARTED,
  topicKey,
  getTopic,
  getCourseTopics,
  getModuleTopics,
  courseCodes,
  getPrerequisites,
  getDependents,
  getAncestors,
  getDescendants,
  getPreviousTopic,
  getNextTopic,
  getDirectPrerequisiteCompletion,
  getAncestorCompletion,
  getRemainingDependencyCount,
  getReadyTopics,
  getInProgressTopics,
  getCompletedTopics,
  unfinishedTopics,
  getRecommendedNextTopics,
  getNextRecommendedTopic,
} from './topic-intelligence.js';

// Re-export the canonical recommendation entry points so journey consumers
// (Dashboard, Explorer, Study Context) import from one unified module
// without a second engine.
export { getRecommendedNextTopics, getNextRecommendedTopic };

import {
  buildExamReadiness,
  getNextExamTopic,
  getExamGaps,
  getInProgressExamTopics,
} from './exam-readiness.js';

// Exam focus is a filter over the canonical recommendation order (see
// assets/exam-readiness.js), never a second algorithm. These wrappers let
// journey consumers read exam state through the journey without replacing
// the normal recommendation.
export { buildExamReadiness, getNextExamTopic, getExamGaps, getInProgressExamTopics };

import {
  buildRevisionModel,
  getReviewDue,
  getReviewOverdue,
  getExamReviewDue,
  getNextReviewTopic,
  getReviewCounts,
} from './revision.js';

// Revision is an additional learning mode over existing timestamps and
// metadata (see assets/revision.js), never a replacement for the canonical
// next-topic algorithm. These re-exports let surfaces read review state
// through the journey without duplicating logic.
export { buildRevisionModel, getReviewDue, getReviewOverdue, getExamReviewDue, getNextReviewTopic, getReviewCounts };

import { buildLearningAnalytics } from './learning-analytics.js';

// Analytics is an observational layer over recorded facts (see
// assets/learning-analytics.js): it never recommends, predicts, or scores
// intelligence. Re-exported so surfaces read analytics through the journey
// without duplicating logic.
export { buildLearningAnalytics };

// --- Recommendation reasons (stable contract) -------------------------------

export const REASON_CONTINUE_IN_PROGRESS = 'continue_in_progress';
export const REASON_UNBLOCKS_FUTURE = 'unblocks_future_topic';
export const REASON_READY_ORDER = 'ready_curriculum_order';
export const REASON_FALLBACK = 'curriculum_fallback';

export const JOURNEY_REASONS = [
  REASON_CONTINUE_IN_PROGRESS,
  REASON_UNBLOCKS_FUTURE,
  REASON_READY_ORDER,
  REASON_FALLBACK,
];

// --- Browser event contract (single source) ---------------------------------

export const PROGRESS_CHANGED_EVENT = 'tarangam:progress-changed';
export const JOURNEY_PROGRESS_EVENT = PROGRESS_CHANGED_EVENT;

const memoryListeners = new Set();

export function clearJourneyListeners() {
  memoryListeners.clear();
}

export function emitJourneyProgressChanged(detail) {
  if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
    try {
      document.dispatchEvent(new CustomEvent(PROGRESS_CHANGED_EVENT, { detail: detail ?? null }));
    } catch {
      // fall through to memory bus
    }
  }
  for (const fn of [...memoryListeners]) {
    try {
      fn(detail ?? null);
    } catch {
      // one bad listener never breaks the bus
    }
  }
}

export function onJourneyProgressChanged(handler) {
  if (typeof handler !== 'function') return () => {};
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    const wrapped = (event) => {
      try {
        handler(event && 'detail' in event ? event.detail : null);
      } catch {
        // never throw out of the event path
      }
    };
    document.addEventListener(PROGRESS_CHANGED_EVENT, wrapped);
    return () => {
      try {
        document.removeEventListener(PROGRESS_CHANGED_EVENT, wrapped);
      } catch {
        // ignore
      }
    };
  }
  memoryListeners.add(handler);
  return () => {
    memoryListeners.delete(handler);
  };
}

// --- Internal guards --------------------------------------------------------

function manifestTopics(manifest) {
  return manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
}

function readStatus(getStatus, courseCode, topicId) {
  try {
    const s = getStatus(courseCode, topicId);
    if (s === STATUS_COMPLETED) return STATUS_COMPLETED;
    if (s === STATUS_IN_PROGRESS) return STATUS_IN_PROGRESS;
    return STATUS_NOT_STARTED;
  } catch {
    return STATUS_NOT_STARTED;
  }
}

function prereqIds(topic) {
  return topic && Array.isArray(topic.prerequisites) ? topic.prerequisites : [];
}

// Unfinished transitive descendants — the provable "later topics this
// unlocks" set. Manifest order, cycle-safe via the intelligence layer.
export function getUnfinishedDescendants(manifest, getStatus, courseCode, id) {
  if (!getTopic(manifest, courseCode, id)) return [];
  return getDescendants(manifest, courseCode, id)
    .filter((t) => readStatus(getStatus, t.courseCode, t.id) !== STATUS_COMPLETED);
}

// Direct dependents that are currently ready (unfinished + every direct
// prerequisite complete). This is the provable "unlocked by this topic"
// set shown after completion and as "will unlock" preview.
export function getUnlockedDependents(manifest, getStatus, courseCode, id) {
  const topic = getTopic(manifest, courseCode, id);
  if (!topic) return [];
  return getDependents(manifest, courseCode, id).filter((dep) => {
    if (readStatus(getStatus, dep.courseCode, dep.id) === STATUS_COMPLETED) return false;
    return prereqIds(dep).every((p) => readStatus(getStatus, dep.courseCode, p) === STATUS_COMPLETED);
  });
}

// Dependents that became newly ready because `courseCode/id` flipped to
// completed: ready under `getStatusAfter` but not under `getStatusBefore`.
// Pure diff — callers pass the two readers around a single completion.
export function getNewlyUnlockedDependents(manifest, getStatusBefore, getStatusAfter, courseCode, id) {
  const before = new Set(
    getUnlockedDependents(manifest, getStatusBefore, courseCode, id)
      .map((t) => topicKey(t.courseCode, t.id))
  );
  return getUnlockedDependents(manifest, getStatusAfter, courseCode, id)
    .filter((t) => !before.has(topicKey(t.courseCode, t.id)));
}

// --- Recommendation reasoning (deterministic, explainable) ------------------

function isReadyTopic(manifest, getStatus, topic) {
  if (!topic) return false;
  if (readStatus(getStatus, topic.courseCode, topic.id) === STATUS_COMPLETED) return false;
  return prereqIds(topic).every((p) => readStatus(getStatus, topic.courseCode, p) === STATUS_COMPLETED);
}

// Classify one recommended topic. Never throws; unknown topics yield the
// curriculum fallback so the UI always has something truthful to say.
export function getRecommendationReason(manifest, getStatus, topic) {
  if (!topic || !getTopic(manifest, topic.courseCode, topic.id)) return REASON_FALLBACK;
  if (readStatus(getStatus, topic.courseCode, topic.id) === STATUS_IN_PROGRESS) {
    return REASON_CONTINUE_IN_PROGRESS;
  }
  if (isReadyTopic(manifest, getStatus, topic)) {
    const unlocks = getUnfinishedDescendants(manifest, getStatus, topic.courseCode, topic.id).length;
    if (unlocks > 0) return REASON_UNBLOCKS_FUTURE;
    return REASON_READY_ORDER;
  }
  return REASON_FALLBACK;
}

// Human-readable explanation for a recommendation. Every claim is provable
// from the graph + statuses: started state, unlock counts from unfinished
// descendants, direct-prerequisite completion, or plain curriculum order.
export function explainRecommendation(manifest, getStatus, topic) {
  if (!topic) {
    return {
      reason: null,
      message: 'Curriculum complete — all topics done. Explorer and topic pages stay open.',
      unlockCount: 0,
    };
  }
  const reason = getRecommendationReason(manifest, getStatus, topic);
  const title = topic.title || topic.id;
  if (reason === REASON_CONTINUE_IN_PROGRESS) {
    return {
      reason,
      message: `Continue: you already started “${title}”.`,
      unlockCount: getUnfinishedDescendants(manifest, getStatus, topic.courseCode, topic.id).length,
    };
  }
  if (reason === REASON_UNBLOCKS_FUTURE) {
    const n = getUnfinishedDescendants(manifest, getStatus, topic.courseCode, topic.id).length;
    const plural = n === 1 ? '1 later topic' : `${n} later topics`;
    return {
      reason,
      message: `Recommended: completing “${title}” helps unlock ${plural}.`,
      unlockCount: n,
    };
  }
  if (reason === REASON_READY_ORDER) {
    return {
      reason,
      message: `Ready: all prerequisites are complete — “${title}” is next in curriculum order.`,
      unlockCount: 0,
    };
  }
  const remaining = getRemainingDependencyCount(manifest, getStatus, topic.courseCode, topic.id);
  if (remaining > 0) {
    return {
      reason,
      message: `Available next: “${title}” is the next unfinished topic in curriculum order (${remaining} prerequisite ${remaining === 1 ? 'topic' : 'topics'} still incomplete — nothing is ever locked).`,
      unlockCount: getUnfinishedDescendants(manifest, getStatus, topic.courseCode, topic.id).length,
    };
  }
  return {
    reason,
    message: `Available next: “${title}” is the next unfinished topic in curriculum order.`,
    unlockCount: 0,
  };
}

// --- Progress math (delegates to learner-state shapes, pure here) -----------

function summarizeList(manifest, getStatus, topicList) {
  const total = topicList.length;
  let completed = 0;
  let inProgress = 0;
  for (const t of topicList) {
    const s = readStatus(getStatus, t.courseCode, t.id);
    if (s === STATUS_COMPLETED) completed += 1;
    else if (s === STATUS_IN_PROGRESS) inProgress += 1;
  }
  const notStarted = total - completed - inProgress;
  return {
    total,
    completed,
    inProgress,
    notStarted,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}

export function getOverallProgress(manifest, getStatus) {
  return summarizeList(manifest, getStatus, manifestTopics(manifest));
}

export function getCourseProgress(manifest, getStatus, courseCode) {
  return summarizeList(manifest, getStatus, getCourseTopics(manifest, courseCode));
}

export function getModuleProgress(manifest, getStatus, courseCode, module) {
  return summarizeList(manifest, getStatus, getModuleTopics(manifest, courseCode, module));
}

export function buildCourseProgressList(manifest, getStatus) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const names = new Map();
  for (const t of manifest.topics) {
    if (!names.has(t.courseCode)) names.set(t.courseCode, t.courseName || t.courseCode);
  }
  return [...names.keys()].sort().map((code) => ({
    courseCode: code,
    courseName: names.get(code),
    ...getCourseProgress(manifest, getStatus, code),
  }));
}

// --- Unified journey model --------------------------------------------------

/**
 * Global journey snapshot: where am I, what is done, what is next and why.
 * `getTimestamp` is optional `(courseCode, topicId) => number|null` used
 * only for recently-completed ordering; without it that list stays empty
 * (never fabricated).
 */
export function buildJourneyModel(manifest, getStatus, options = {}) {
  const topics = manifestTopics(manifest);
  const safeStatus = (c, id) => readStatus(getStatus, c, id);
  const inProgress = getInProgressTopics(manifest, safeStatus);
  const ready = getReadyTopics(manifest, safeStatus);
  const completed = getCompletedTopics(manifest, safeStatus);
  const recommended = getNextRecommendedTopic(manifest, safeStatus);
  const explained = explainRecommendation(manifest, safeStatus, recommended);
  const overall = getOverallProgress(manifest, safeStatus);
  const courseProgress = buildCourseProgressList(manifest, safeStatus);
  const isComplete = topics.length > 0 && completed.length === topics.length;
  const isEmpty = completed.length === 0 && inProgress.length === 0;

  let recommendationDetail = null;
  if (recommended) {
    const prereqCompletion = getDirectPrerequisiteCompletion(manifest, safeStatus, recommended.courseCode, recommended.id);
    recommendationDetail = {
      courseCode: recommended.courseCode,
      id: recommended.id,
      status: safeStatus(recommended.courseCode, recommended.id),
      estimatedMinutes: recommended.estimatedMinutes ?? null,
      completedPrereqs: prereqCompletion.completed,
      totalPrereqs: prereqCompletion.total,
      prereqPercent: prereqCompletion.percent,
      remainingDependencies: getRemainingDependencyCount(manifest, safeStatus, recommended.courseCode, recommended.id),
      unlockCount: explained.unlockCount,
      isReady: isReadyTopic(manifest, safeStatus, recommended),
    };
  }

  const focusCourse = options.focusCourseCode;
  const focusId = options.focusTopicId;
  let focus = null;
  if (focusCourse && focusId) {
    focus = buildTopicJourney(manifest, safeStatus, focusCourse, focusId);
  }

  // Exam readiness rides along without changing the normal recommendation.
  const examReadiness = buildExamReadiness(manifest, safeStatus);

  // Revision rides along as an additional mode: same canonical
  // recommendation above is untouched. Timestamps are optional — without
  // them the review queue stays empty (never fabricated).
  const getTimestamp = typeof options.getTimestamp === 'function' ? options.getTimestamp : null;
  const reviewNow = options.now;
  const revision = buildRevisionModel(manifest, safeStatus, getTimestamp, reviewNow);

  // Descriptive analytics ride along as an observational layer: the normal,
  // exam, and review recommendations above are untouched.
  const analytics = buildLearningAnalytics(manifest, safeStatus, getTimestamp, reviewNow);

  return {
    inProgress,
    ready,
    completed,
    unfinished: unfinishedTopics(manifest, safeStatus),
    recommended,
    recommendationReason: explained.reason,
    recommendationExplanation: explained.message,
    recommendationDetail,
    overall,
    courseProgress,
    isComplete,
    isEmpty,
    totalTopics: topics.length,
    focus,
    examReadiness,
    nextExamTopic: examReadiness.nextExamTopic,
    examGaps: examReadiness.examGaps,
    examRelevantInProgress: examReadiness.inProgressExamTopics,
    reviewDue: revision.reviewDue,
    reviewOverdue: revision.reviewOverdue,
    nextReviewTopic: revision.nextReviewTopic,
    examReviewDue: revision.examReviewDue,
    reviewCounts: revision.counts,
    revision,
    analytics,
  };
}

/**
 * Per-topic journey slice: dependencies, navigation, and unlock preview
 * for one topic card/detail/study-context. Null when the topic is unknown.
 */
export function buildTopicJourney(manifest, getStatus, courseCode, topicId) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) return null;
  const safeStatus = (c, id) => readStatus(getStatus, c, id);
  const status = safeStatus(courseCode, topicId);
  const prereqCompletion = getDirectPrerequisiteCompletion(manifest, safeStatus, courseCode, topicId);
  const ancestorCompletion = getAncestorCompletion(manifest, safeStatus, courseCode, topicId);
  const remainingDependencies = getRemainingDependencyCount(manifest, safeStatus, courseCode, topicId);
  const recommended = getNextRecommendedTopic(manifest, safeStatus);
  const isRecommended = recommended
    ? topicKey(recommended.courseCode, recommended.id) === topicKey(courseCode, topicId)
    : false;
  const readyList = getReadyTopics(manifest, safeStatus);
  const isReady = readyList.some((t) => topicKey(t.courseCode, t.id) === topicKey(courseCode, topicId));
  return {
    courseCode: topic.courseCode,
    courseName: topic.courseName || topic.courseCode,
    module: topic.module,
    moduleName: topic.moduleName || `Module ${topic.module}`,
    id: topic.id,
    title: topic.title,
    estimatedMinutes: topic.estimatedMinutes ?? null,
    difficulty: topic.difficulty ?? null,
    examRelevance: topic.examRelevance ?? null,
    status,
    isReady,
    isRecommended,
    recommendationReason: isRecommended ? getRecommendationReason(manifest, safeStatus, topic) : null,
    prereqCompletion,
    completedPrereqs: prereqCompletion.completed,
    totalPrereqs: prereqCompletion.total,
    ancestorCompletion,
    remainingDependencies,
    prerequisites: getPrerequisites(manifest, courseCode, topicId),
    dependents: getDependents(manifest, courseCode, topicId),
    unlockedDependents: getUnlockedDependents(manifest, safeStatus, courseCode, topicId),
    unfinishedDescendantCount: getUnfinishedDescendants(manifest, safeStatus, courseCode, topicId).length,
    immediateNext: getNextTopic(manifest, courseCode, topicId),
    immediatePrev: getPreviousTopic(manifest, courseCode, topicId),
    nearbyModuleTopics: getModuleTopics(manifest, courseCode, topic.module),
    courseProgress: getCourseProgress(manifest, safeStatus, courseCode),
    moduleProgress: getModuleProgress(manifest, safeStatus, courseCode, topic.module),
    overall: getOverallProgress(manifest, safeStatus),
  };
}

// --- Dashboard model --------------------------------------------------------

// Recently completed in deterministic order: newest timestamp first, ties
// broken by reverse manifest order (later curriculum topics first), topics
// without timestamps excluded (never fabricated).
export function getRecentlyCompleted(manifest, getStatus, getTimestamp, limit = 5) {
  if (typeof getTimestamp !== 'function') return [];
  const topics = manifestTopics(manifest);
  const indexOf = new Map(topics.map((t, i) => [topicKey(t.courseCode, t.id), i]));
  const done = topics.filter((t) => readStatus(getStatus, t.courseCode, t.id) === STATUS_COMPLETED);
  const withTime = [];
  for (const t of done) {
    let ts = null;
    try {
      ts = getTimestamp(t.courseCode, t.id);
    } catch {
      ts = null;
    }
    if (typeof ts === 'number' && Number.isFinite(ts)) {
      withTime.push({ topic: t, ts });
    }
  }
  withTime.sort((a, b) => {
    if (b.ts !== a.ts) return b.ts - a.ts;
    return (indexOf.get(topicKey(b.topic.courseCode, b.topic.id)) ?? 0)
      - (indexOf.get(topicKey(a.topic.courseCode, a.topic.id)) ?? 0);
  });
  return withTime.slice(0, Math.max(0, limit)).map((e) => e.topic);
}

export function buildDashboardModel(manifest, getStatus, options = {}) {
  const getTimestamp = options.getTimestamp || null;
  const journey = buildJourneyModel(manifest, getStatus, { getTimestamp, now: options.now });
  const recentLimit = options.recentLimit ?? 5;
  const readyLimit = options.readyLimit ?? 12;
  const progressLimit = options.inProgressLimit ?? 12;
  const recentlyCompleted = getRecentlyCompleted(manifest, getStatus, getTimestamp, recentLimit);
  return {
    ...journey,
    currentWork: journey.inProgress.slice(0, progressLimit),
    readyToLearn: journey.ready.slice(0, readyLimit),
    readyTotal: journey.ready.length,
    recentlyCompleted,
  };
}

// --- Explorer model ---------------------------------------------------------

export const JOURNEY_FILTERS = ['all', 'not_started', 'in_progress', 'completed', 'ready'];

export function normalizeJourneyFilter(value) {
  return JOURNEY_FILTERS.includes(value) ? value : 'all';
}

// One enriched row per topic for Explorer cards/details. Pure and total:
// unknown topics yield null (never throw).
export function buildExplorerTopicModel(manifest, getStatus, courseCode, topicId) {
  const journey = buildTopicJourney(manifest, getStatus, courseCode, topicId);
  if (!journey) return null;
  const readyLabel = journey.status === STATUS_COMPLETED
    ? 'Completed'
    : journey.isReady
      ? 'Ready — all prerequisites complete'
      : `Not ready — ${journey.remainingDependencies} remaining ${journey.remainingDependencies === 1 ? 'dependency' : 'dependencies'} (informational only)`;
  return {
    ...journey,
    readyLabel,
  };
}

// Journey-aware filter over an already-scoped topic list. Preserves input
// order (callers pass manifest order). 'ready' means unfinished with every
// direct prerequisite complete.
export function filterTopicsByJourney(manifest, getStatus, topicList, journeyFilter = 'all') {
  const filter = normalizeJourneyFilter(journeyFilter);
  const list = Array.isArray(topicList) ? topicList : [];
  if (filter === 'all') return [...list];
  if (filter === 'ready') {
    const readyKeys = new Set(
      getReadyTopics(manifest, (c, id) => readStatus(getStatus, c, id))
        .map((t) => topicKey(t.courseCode, t.id))
    );
    return list.filter((t) => readyKeys.has(topicKey(t.courseCode, t.id)));
  }
  return list.filter((t) => readStatus(getStatus, t.courseCode, t.id) === filter);
}
