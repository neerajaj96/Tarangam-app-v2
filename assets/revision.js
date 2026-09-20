/**
 * Tarangam deterministic Revision & Review Layer (browser + Node, no dependencies).
 *
 * Pure, explainable review math on top of the canonical Topic Intelligence
 * Layer (./topic-intelligence.js) plus existing exam-relevance weights
 * (./exam-readiness.js) and existing learner timestamps (learner-state
 * `lastAccessed`, i.e. `tarangam_visited_ts_*` / v1 `updatedAt`). No DOM,
 * no storage, no fetch, no Markdown, no AI/ML, no predictions, no
 * gamification. Nothing here locks or gates the learner; review only
 * informs and suggests.
 *
 * Review schedule (centralized constants — the only place thresholds live):
 * - REVIEW_DUE_DAYS = 7: a completed topic with daysSince >= 7 is "review_due".
 * - REVIEW_OVERDUE_DAYS = 14: daysSince >= 14 is "review_overdue".
 * - Otherwise (0..6 days) it is "fresh".
 * Bounds are inclusive on the lower end: exactly 7 days counts as due,
 * exactly 14 days counts as overdue.
 *
 * Timestamp rules (never fabricated):
 * - Only completed topics can enter review queues. Unfinished or unknown
 *   topics resolve to "not_applicable" and never appear as due/overdue.
 * - `getTimestamp(courseCode, topicId)` must return a finite number or
 *   null/undefined. Missing, non-numeric, or non-finite timestamps resolve
 *   to "fresh" with daysSince null — they never enter due queues.
 * - Future timestamps (now < ts) clamp to 0 days ("fresh").
 * - `now` is always injected (default Date.now()) so tests never depend on
 *   the real clock.
 *
 * Priority order (documented, deterministic, metadata-only):
 * 1. review state: overdue before due (fresh never queued).
 * 2. exam relevance weight: high (3) > medium (2) > low (1) > none (0).
 * 3. dependency importance: more direct dependents first (topics that
 *    unlock more later work revise first).
 * 4. curriculum (manifest) order as the final tie-breaker.
 * No ML, profiling, prediction, or hidden scoring. Every recommendation
 * carries a human-readable reason built only from these four inputs.
 */

import {
  STATUS_COMPLETED,
  topicKey,
  getTopic,
  getCourseTopics,
  getModuleTopics,
  getDependents,
} from './topic-intelligence.js';
import { weightForTopic } from './exam-readiness.js';
import { getTopicAssessmentState } from './assessment.js';

export const REVIEW_DUE_DAYS = 7;
export const REVIEW_OVERDUE_DAYS = 14;
export const DAY_MS = 24 * 3600 * 1000;
export const REVIEW_DUE_MS = REVIEW_DUE_DAYS * DAY_MS;
export const REVIEW_OVERDUE_MS = REVIEW_OVERDUE_DAYS * DAY_MS;

export const REVIEW_STATE_FRESH = 'fresh';
export const REVIEW_STATE_DUE = 'review_due';
export const REVIEW_STATE_OVERDUE = 'review_overdue';
export const REVIEW_STATE_NOT_APPLICABLE = 'not_applicable';

export const REVIEW_FILTERS = ['all', 'review_due', 'review_overdue', 'exam_review_due'];

// Explicit assessment-aware review reasons (descriptive values only, never
// scores). Timestamp reasons preserve the existing schedule; the assessment
// reason is additional evidence only.
export const REVIEW_REASON_OVERDUE = 'overdue';
export const REVIEW_REASON_DUE = 'due';
export const REVIEW_REASON_ASSESSMENT_NEEDS_REVIEW = 'assessment_needs_review';
export const REVIEW_REASON_FRESH = 'fresh';
export const REVIEW_REASON_NOT_APPLICABLE = 'not_applicable';

export const REVIEW_REASONS = [
  REVIEW_REASON_OVERDUE,
  REVIEW_REASON_DUE,
  REVIEW_REASON_ASSESSMENT_NEEDS_REVIEW,
  REVIEW_REASON_FRESH,
  REVIEW_REASON_NOT_APPLICABLE,
];

// --- Internal guards --------------------------------------------------------

function manifestTopics(manifest) {
  return manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
}

function readStatus(getStatus, courseCode, topicId) {
  try {
    const s = getStatus(courseCode, topicId);
    if (s === STATUS_COMPLETED) return STATUS_COMPLETED;
    return s;
  } catch {
    return null;
  }
}

function readTimestamp(getTimestamp, courseCode, topicId) {
  if (typeof getTimestamp !== 'function') return null;
  try {
    const ts = getTimestamp(courseCode, topicId);
    return typeof ts === 'number' && Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

function resolveNow(now) {
  return typeof now === 'number' && Number.isFinite(now) ? now : Date.now();
}

function manifestIndex(manifest) {
  return new Map(manifestTopics(manifest).map((t, i) => [topicKey(t.courseCode, t.id), i]));
}

// --- Per-topic review state ---------------------------------------------------

export function getDaysSince(timestamp, now) {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return null;
  const current = resolveNow(now);
  const diff = current - timestamp;
  if (diff < 0) return 0;
  return Math.floor(diff / DAY_MS);
}

export function getReviewStateForTopic(manifest, getStatus, getTimestamp, courseCode, topicId, now) {
  const topic = getTopic(manifest, courseCode, topicId);
  const current = resolveNow(now);
  if (!topic) {
    return { state: REVIEW_STATE_NOT_APPLICABLE, daysSince: null, threshold: null, timestamp: null };
  }
  if (readStatus(getStatus, courseCode, topicId) !== STATUS_COMPLETED) {
    return { state: REVIEW_STATE_NOT_APPLICABLE, daysSince: null, threshold: null, timestamp: null };
  }
  const ts = readTimestamp(getTimestamp, courseCode, topicId);
  if (ts === null) {
    return { state: REVIEW_STATE_FRESH, daysSince: null, threshold: REVIEW_DUE_DAYS, timestamp: null };
  }
  const daysSince = getDaysSince(ts, current);
  if (daysSince === null) {
    return { state: REVIEW_STATE_FRESH, daysSince: null, threshold: REVIEW_DUE_DAYS, timestamp: null };
  }
  if (daysSince >= REVIEW_OVERDUE_DAYS) {
    return { state: REVIEW_STATE_OVERDUE, daysSince, threshold: REVIEW_OVERDUE_DAYS, timestamp: ts };
  }
  if (daysSince >= REVIEW_DUE_DAYS) {
    return { state: REVIEW_STATE_DUE, daysSince, threshold: REVIEW_DUE_DAYS, timestamp: ts };
  }
  return { state: REVIEW_STATE_FRESH, daysSince, threshold: REVIEW_DUE_DAYS, timestamp: ts };
}

export function explainReviewReason(manifest, topic, reviewState) {
  if (!topic) return 'Unknown topic — no review reason.';
  const title = topic.title || topic.id;
  const weight = weightForTopic(topic);
  const level = topic.examRelevance && weight > 0 ? topic.examRelevance : null;
  const dependents = getDependents(manifest, topic.courseCode, topic.id).length;
  const examPart = level ? `${level} exam relevance` : 'no recorded exam relevance';
  const depPart = dependents === 1 ? 'unlocks 1 topic' : `unlocks ${dependents} topics`;
  if (reviewState.state === REVIEW_STATE_OVERDUE) {
    return `Overdue by ${reviewState.daysSince} days (threshold ${REVIEW_OVERDUE_DAYS}) — “${title}”: ${examPart}, ${depPart}.`;
  }
  if (reviewState.state === REVIEW_STATE_DUE) {
    return `Due after ${reviewState.daysSince} days (threshold ${REVIEW_DUE_DAYS}) — “${title}”: ${examPart}, ${depPart}.`;
  }
  if (reviewState.state === REVIEW_STATE_FRESH) {
    if (reviewState.daysSince === null) {
      return `Fresh — “${title}”: no usable timestamp, so never marked due. ${examPart}, ${depPart}.`;
    }
    return `Fresh — “${title}” last visited ${reviewState.daysSince} ${reviewState.daysSince === 1 ? 'day' : 'days'} ago (due at ${REVIEW_DUE_DAYS}). ${examPart}, ${depPart}.`;
  }
  return `Not applicable — “${title}” is not completed, so it never enters review.`;
}

// --- Review queues --------------------------------------------------------------

function compareReviewPriority(manifest, indexOf, a, b) {
  // 1. overdue before due.
  const rank = (e) => (e.reviewState === REVIEW_STATE_OVERDUE ? 0 : 1);
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  // 2. exam relevance weight, higher first.
  if (b.examWeight !== a.examWeight) return b.examWeight - a.examWeight;
  // 3. dependency importance: more direct dependents first.
  if (b.dependentCount !== a.dependentCount) return b.dependentCount - a.dependentCount;
  // 4. curriculum order.
  return (indexOf.get(topicKey(a.courseCode, a.id)) ?? 0) - (indexOf.get(topicKey(b.courseCode, b.id)) ?? 0);
}

function reviewEntry(manifest, topic, reviewState) {
  return {
    courseCode: topic.courseCode,
    courseName: topic.courseName || topic.courseCode,
    module: topic.module,
    moduleName: topic.moduleName || `Module ${topic.module}`,
    id: topic.id,
    title: topic.title,
    examRelevance: topic.examRelevance ?? null,
    examWeight: weightForTopic(topic),
    dependentCount: getDependents(manifest, topic.courseCode, topic.id).length,
    reviewState: reviewState.state,
    daysSince: reviewState.daysSince,
    threshold: reviewState.threshold,
    timestamp: reviewState.timestamp,
    reason: explainReviewReason(manifest, topic, reviewState),
    topic,
  };
}

export function getReviewQueue(manifest, getStatus, getTimestamp, now) {
  const current = resolveNow(now);
  const indexOf = manifestIndex(manifest);
  const queue = [];
  for (const topic of manifestTopics(manifest)) {
    const rs = getReviewStateForTopic(manifest, getStatus, getTimestamp, topic.courseCode, topic.id, current);
    if (rs.state !== REVIEW_STATE_DUE && rs.state !== REVIEW_STATE_OVERDUE) continue;
    queue.push(reviewEntry(manifest, topic, rs));
  }
  queue.sort((a, b) => compareReviewPriority(manifest, indexOf, a, b));
  return queue;
}

export function getReviewDue(manifest, getStatus, getTimestamp, now) {
  return getReviewQueue(manifest, getStatus, getTimestamp, now)
    .filter((e) => e.reviewState === REVIEW_STATE_DUE);
}

export function getReviewOverdue(manifest, getStatus, getTimestamp, now) {
  return getReviewQueue(manifest, getStatus, getTimestamp, now)
    .filter((e) => e.reviewState === REVIEW_STATE_OVERDUE);
}

export function getExamReviewDue(manifest, getStatus, getTimestamp, now) {
  return getReviewQueue(manifest, getStatus, getTimestamp, now)
    .filter((e) => e.examWeight > 0);
}

export function getNextReviewTopic(manifest, getStatus, getTimestamp, now) {
  const queue = getReviewQueue(manifest, getStatus, getTimestamp, now);
  return queue.length ? queue[0] : null;
}

export function getReviewCounts(manifest, getStatus, getTimestamp, now) {
  const queue = getReviewQueue(manifest, getStatus, getTimestamp, now);
  const due = queue.filter((e) => e.reviewState === REVIEW_STATE_DUE).length;
  const overdue = queue.filter((e) => e.reviewState === REVIEW_STATE_OVERDUE).length;
  const examDue = queue.filter((e) => e.examWeight > 0).length;
  return { total: queue.length, due, overdue, examDue };
}

export function buildRevisionModel(manifest, getStatus, getTimestamp, now) {
  const current = resolveNow(now);
  const queue = getReviewQueue(manifest, getStatus, getTimestamp, current);
  const due = queue.filter((e) => e.reviewState === REVIEW_STATE_DUE);
  const overdue = queue.filter((e) => e.reviewState === REVIEW_STATE_OVERDUE);
  const examDue = queue.filter((e) => e.examWeight > 0);
  return {
    reviewDue: due,
    reviewOverdue: overdue,
    reviewQueue: queue,
    examReviewDue: examDue,
    nextReviewTopic: queue.length ? queue[0] : null,
    counts: { total: queue.length, due: due.length, overdue: overdue.length, examDue: examDue.length },
    now: current,
  };
}

export function getCourseReviewBreakdown(manifest, getStatus, getTimestamp, courseCode, now) {
  const current = resolveNow(now);
  const list = getCourseTopics(manifest, courseCode);
  let due = 0;
  let overdue = 0;
  let examDue = 0;
  let completed = 0;
  for (const t of list) {
    if (readStatus(getStatus, t.courseCode, t.id) !== STATUS_COMPLETED) continue;
    completed += 1;
    const rs = getReviewStateForTopic(manifest, getStatus, getTimestamp, t.courseCode, t.id, current);
    if (rs.state === REVIEW_STATE_DUE) {
      due += 1;
      if (weightForTopic(t) > 0) examDue += 1;
    } else if (rs.state === REVIEW_STATE_OVERDUE) {
      overdue += 1;
      if (weightForTopic(t) > 0) examDue += 1;
    }
  }
  return { courseCode, total: list.length, completed, due, overdue, examDue, queueTotal: due + overdue };
}

export function getModuleReviewBreakdown(manifest, getStatus, getTimestamp, courseCode, module, now) {
  const current = resolveNow(now);
  const list = getModuleTopics(manifest, courseCode, module);
  let due = 0;
  let overdue = 0;
  let examDue = 0;
  let completed = 0;
  for (const t of list) {
    if (readStatus(getStatus, t.courseCode, t.id) !== STATUS_COMPLETED) continue;
    completed += 1;
    const rs = getReviewStateForTopic(manifest, getStatus, getTimestamp, t.courseCode, t.id, current);
    if (rs.state === REVIEW_STATE_DUE) {
      due += 1;
      if (weightForTopic(t) > 0) examDue += 1;
    } else if (rs.state === REVIEW_STATE_OVERDUE) {
      overdue += 1;
      if (weightForTopic(t) > 0) examDue += 1;
    }
  }
  return { courseCode, module, total: list.length, completed, due, overdue, examDue, queueTotal: due + overdue };
}

export function buildCourseReviewList(manifest, getStatus, getTimestamp, now) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const codes = [...new Set(manifest.topics.map((t) => t.courseCode))].sort();
  return codes.map((code) => getCourseReviewBreakdown(manifest, getStatus, getTimestamp, code, now));
}

export function buildModuleReviewList(manifest, getStatus, getTimestamp, courseCode, now) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const mods = [...new Set(
    manifest.topics.filter((t) => t.courseCode === courseCode).map((t) => t.module)
  )].sort((a, b) => a - b);
  return mods.map((module) => getModuleReviewBreakdown(manifest, getStatus, getTimestamp, courseCode, module, now));
}

// --- Revision filter (preserves input order) -------------------------------------

export function normalizeReviewFilter(value) {
  return REVIEW_FILTERS.includes(value) ? value : 'all';
}

// Filter an already-scoped topic list by review state. Needs the manifest
// (for topic lookup) plus status/timestamp readers and an injected now.
// 'exam_review_due' means due-or-overdue AND exam-relevant.
export function filterTopicsByReview(manifest, getStatus, getTimestamp, topicList, reviewFilter = 'all', now) {
  const filter = normalizeReviewFilter(reviewFilter);
  const list = Array.isArray(topicList) ? topicList : [];
  if (filter === 'all') return [...list];
  const current = resolveNow(now);
  return list.filter((t) => {
    const rs = getReviewStateForTopic(manifest, getStatus, getTimestamp, t.courseCode, t.id, current);
    if (filter === 'review_due') return rs.state === REVIEW_STATE_DUE;
    if (filter === 'review_overdue') return rs.state === REVIEW_STATE_OVERDUE;
    return (rs.state === REVIEW_STATE_DUE || rs.state === REVIEW_STATE_OVERDUE) && weightForTopic(t) > 0;
  });
}

// --- Assessment-aware review (additional evidence only) ----------------------
// Completed assessment attempts feed descriptive evidence into the existing
// review decisions. Existing timestamp rules are unchanged:
//
// - Only completed topics can be review-relevant. Unfinished or unknown
//   topics stay "not_applicable" even with assessment attempts.
// - A "needs_review" latest attempt makes a completed topic review-relevant
//   immediately, even when its timestamp is fresh or missing.
// - A passed attempt never resets or bypasses the 7/14-day schedule: fresh
//   stays fresh, due stays due, overdue stays overdue.
// - Ordering preserves overdue > due > assessment > exam weight >
//   dependents > manifest order, so existing timestamp queues keep their
//   relative order and assessment items append deterministically.
//
// `assessment` is an optional `{ bank, attempts }` pair; null, missing, or
// malformed values degrade to timestamp-only behavior (never throw).

export function getAssessmentEvidence(bank, store, courseCode, topicId) {
  try {
    const s = getTopicAssessmentState(bank, store, courseCode, topicId);
    return {
      available: Boolean(s.available),
      attempted: Boolean(s.attempted),
      passed: Boolean(s.passed),
      needsReview: Boolean(s.needsReview),
      latestScore: s.latestScore ?? null,
      bestScore: s.bestScore ?? null,
      attempts: typeof s.attempts === 'number' ? s.attempts : 0,
      state: s.state ?? 'not_attempted',
    };
  } catch {
    return {
      available: false,
      attempted: false,
      passed: false,
      needsReview: false,
      latestScore: null,
      bestScore: null,
      attempts: 0,
      state: 'not_attempted',
    };
  }
}

function reviewReasonFor(baseState, assessmentNeedsReview) {
  if (baseState === REVIEW_STATE_OVERDUE) return REVIEW_REASON_OVERDUE;
  if (baseState === REVIEW_STATE_DUE) return REVIEW_REASON_DUE;
  if (baseState === REVIEW_STATE_NOT_APPLICABLE) return REVIEW_REASON_NOT_APPLICABLE;
  if (assessmentNeedsReview) return REVIEW_REASON_ASSESSMENT_NEEDS_REVIEW;
  return REVIEW_REASON_FRESH;
}

export function getAssessmentAwareReviewState(manifest, getStatus, getTimestamp, courseCode, topicId, now, assessment) {
  const current = resolveNow(now);
  const base = getReviewStateForTopic(manifest, getStatus, getTimestamp, courseCode, topicId, current);
  const bank = assessment && typeof assessment === 'object' ? assessment.bank ?? null : null;
  const store = assessment && typeof assessment === 'object' ? assessment.attempts : undefined;
  const evidence = getAssessmentEvidence(bank, store, courseCode, topicId);
  const isCompleted = base.state !== REVIEW_STATE_NOT_APPLICABLE;
  const assessmentNeedsReview = isCompleted && evidence.available && evidence.needsReview;
  const assessmentPassed = isCompleted && evidence.available && evidence.passed;
  const assessmentAttempted = isCompleted && evidence.available && evidence.attempted;
  const reviewReason = reviewReasonFor(base.state, assessmentNeedsReview);
  const isAssessmentDriven = isCompleted
    && base.state === REVIEW_STATE_FRESH
    && assessmentNeedsReview;
  const isReviewRelevant = base.state === REVIEW_STATE_DUE
    || base.state === REVIEW_STATE_OVERDUE
    || isAssessmentDriven;
  return {
    state: base.state,
    daysSince: base.daysSince,
    threshold: base.threshold,
    timestamp: base.timestamp,
    assessmentAvailable: evidence.available,
    assessmentAttempted,
    assessmentPassed,
    assessmentNeedsReview,
    assessmentLatestScore: evidence.latestScore,
    assessmentBestScore: evidence.bestScore,
    assessmentAttempts: evidence.attempts,
    assessmentState: evidence.state,
    reviewReason,
    isAssessmentDriven,
    isReviewRelevant,
  };
}

function compareAssessmentAwarePriority(manifest, indexOf, a, b) {
  const rank = (e) => {
    if (e.reviewState === REVIEW_STATE_OVERDUE) return 0;
    if (e.reviewState === REVIEW_STATE_DUE) return 1;
    if (e.reviewReason === REVIEW_REASON_ASSESSMENT_NEEDS_REVIEW) return 2;
    return 3;
  };
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  if (b.examWeight !== a.examWeight) return b.examWeight - a.examWeight;
  if (b.dependentCount !== a.dependentCount) return b.dependentCount - a.dependentCount;
  return (indexOf.get(topicKey(a.courseCode, a.id)) ?? 0) - (indexOf.get(topicKey(b.courseCode, b.id)) ?? 0);
}

function assessmentAwareEntry(manifest, topic, baseState, aware) {
  const entry = reviewEntry(manifest, topic, baseState);
  return {
    ...entry,
    assessmentAvailable: aware.assessmentAvailable,
    assessmentAttempted: aware.assessmentAttempted,
    assessmentPassed: aware.assessmentPassed,
    assessmentNeedsReview: aware.assessmentNeedsReview,
    assessmentLatestScore: aware.assessmentLatestScore,
    assessmentBestScore: aware.assessmentBestScore,
    assessmentAttempts: aware.assessmentAttempts,
    assessmentState: aware.assessmentState,
    reviewReason: aware.reviewReason,
    isAssessmentDriven: aware.isAssessmentDriven,
    isReviewRelevant: aware.isReviewRelevant,
  };
}

export function getAssessmentAwareReviewQueue(manifest, getStatus, getTimestamp, now, assessment) {
  const current = resolveNow(now);
  const indexOf = manifestIndex(manifest);
  const queue = [];
  for (const topic of manifestTopics(manifest)) {
    const base = getReviewStateForTopic(manifest, getStatus, getTimestamp, topic.courseCode, topic.id, current);
    const aware = getAssessmentAwareReviewState(manifest, getStatus, getTimestamp, topic.courseCode, topic.id, current, assessment);
    if (!aware.isReviewRelevant) continue;
    queue.push(assessmentAwareEntry(manifest, topic, base, aware));
  }
  queue.sort((a, b) => compareAssessmentAwarePriority(manifest, indexOf, a, b));
  return queue;
}

export function getAssessmentDrivenReviews(manifest, getStatus, getTimestamp, now, assessment) {
  return getAssessmentAwareReviewQueue(manifest, getStatus, getTimestamp, now, assessment)
    .filter((e) => e.isAssessmentDriven);
}

export function buildAssessmentAwareRevisionModel(manifest, getStatus, getTimestamp, now, assessment) {
  const current = resolveNow(now);
  const queue = getAssessmentAwareReviewQueue(manifest, getStatus, getTimestamp, current, assessment);
  const due = queue.filter((e) => e.reviewState === REVIEW_STATE_DUE);
  const overdue = queue.filter((e) => e.reviewState === REVIEW_STATE_OVERDUE);
  const driven = queue.filter((e) => e.isAssessmentDriven);
  const examDue = queue.filter((e) => e.examWeight > 0);
  return {
    reviewDue: due,
    reviewOverdue: overdue,
    assessmentDriven: driven,
    reviewQueue: queue,
    examReviewDue: examDue,
    nextReviewTopic: queue.length ? queue[0] : null,
    counts: {
      total: queue.length,
      due: due.length,
      overdue: overdue.length,
      examDue: examDue.length,
      assessmentDriven: driven.length,
      assessmentNeedsReview: driven.length,
    },
    now: current,
  };
}
