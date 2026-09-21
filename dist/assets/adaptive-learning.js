/**
 * Tarangam canonical Adaptive Learning Views (browser + Node, no dependencies).
 *
 * Pure, deterministic presentation over existing learner evidence. This layer
 * answers, without any new mechanism of its own:
 * - next: what to work on next (the canonical next-topic mechanism,
 *   called — never reimplemented — via ./topic-intelligence.js and
 *   explained via ./learning-journey.js).
 * - strengthen: what to strengthen (existing attention evidence from
 *   ./weak-topic-analysis.js with its explicit reasons preserved).
 * - progression: prerequisite-aware progression states from the existing
 *   topic graph (completed / available / blocked / future — derived only
 *   from recorded statuses plus direct-prerequisite completeness).
 * - difficulty: deterministic views grouped by existing metadata
 *   difficulty (counts and ordered remaining lists only).
 * - exam: exam-relevant presentation reusing ./exam-readiness.js unchanged
 *   (same weights, same readiness math; ordering is a filter over the
 *   canonical order).
 * - revision: revision presentation reusing ./revision.js unchanged (same
 *   7-day / 14-day states and ordering, with recorded assessment attempts
 *   as additional evidence only).
 * Context riders: remaining study minutes (./learning-analytics.js),
 * assessment coverage counts (./assessment.js), and the explicit study plan
 * (./study-planner.js) pass through untouched.
 *
 * No DOM, no storage, no fetch, no Markdown, no AI/ML, no prediction, no
 * learner ability or level computation, no numerical ratings of any kind,
 * no gamification, no second next-topic mechanism, no new learner state.
 * Nothing here locks or gates the learner; views only inform and suggest.
 * Identical inputs always produce identical outputs.
 */

import {
  STATUS_COMPLETED,
  STATUS_IN_PROGRESS,
  STATUS_NOT_STARTED,
} from './learner-state.js';
import {
  getTopic,
  getCourseTopics,
  getModuleTopics,
  getDependencyChain,
  getRecommendedNextTopics,
  getNextRecommendedTopic,
} from './topic-intelligence.js';
import {
  explainRecommendation,
  getRecommendationReason,
} from './learning-journey.js';
import {
  buildExamReadiness,
  getNextExamTopic,
  isExamRelevantTopic,
  weightForTopic,
} from './exam-readiness.js';
import {
  REVIEW_DUE_DAYS,
  REVIEW_OVERDUE_DAYS,
  getReviewQueue,
  getAssessmentAwareReviewQueue,
} from './revision.js';
import {
  getTopAttentionTopics,
  explainAttention,
} from './weak-topic-analysis.js';
import {
  getAssessmentCoverage,
} from './assessment.js';
import { buildLearningAnalytics } from './learning-analytics.js';
import { buildStudyPlan } from './study-planner.js';

// Canonical progression states, derived only from recorded statuses plus
// direct-prerequisite completeness (same contract as the intelligence
// layer). Completed and available mirror the canonical ready computation;
// blocked vs future only describes whether work is already underway in the
// topic's direct prerequisites — no new graph semantics.
export const PROGRESSION_COMPLETED = 'completed';
export const PROGRESSION_AVAILABLE = 'available';
export const PROGRESSION_BLOCKED = 'blocked';
export const PROGRESSION_FUTURE = 'future';

export const PROGRESSION_STATES = [
  PROGRESSION_COMPLETED,
  PROGRESSION_AVAILABLE,
  PROGRESSION_BLOCKED,
  PROGRESSION_FUTURE,
];

export const STRENGTHEN_LIMIT = 5;
export const EXAM_FOCUS_LIMIT = 5;
export const REVISION_FOCUS_LIMIT = 5;

export const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced'];

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

function resolveNow(now) {
  return typeof now === 'number' && Number.isFinite(now) ? now : Date.now();
}

function prereqIds(topic) {
  return topic && Array.isArray(topic.prerequisites) ? topic.prerequisites : [];
}

function knownMinutes(topic) {
  return typeof topic.estimatedMinutes === 'number' && Number.isFinite(topic.estimatedMinutes)
    ? topic.estimatedMinutes
    : null;
}

// --- Next (canonical mechanism, called — never reimplemented) ---------------

// What to work on next: the head of the canonical order plus its existing
// journey explanation. Null topic with a curriculum-complete message when
// everything is done. This delegates entirely; no ordering logic lives here.
export function getAdaptiveNext(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const next = getNextRecommendedTopic(manifest, safe);
  const explained = explainRecommendation(manifest, safe, next);
  if (!next) {
    return { topic: null, reason: explained.reason, explanation: explained.message };
  }
  return {
    topic: next,
    reason: getRecommendationReason(manifest, safe, next),
    explanation: explained.message,
  };
}

// --- Strengthen (existing attention evidence, reasons preserved) -------------

// What to strengthen: top attention entries with their explicit reasons and
// explanations attached. Sorted by the canonical attention priority; the
// reasons are never collapsed into a rating.
export function getStrengthenList(manifest, getStatus, getTimestamp, now, assessment, limit = STRENGTHEN_LIMIT) {
  const n = typeof limit === 'number' && Number.isFinite(limit) && limit >= 0
    ? Math.floor(limit)
    : STRENGTHEN_LIMIT;
  return getTopAttentionTopics(manifest, getStatus, getTimestamp, now, assessment, n)
    .map((e) => ({ ...e, explanation: explainAttention(e) }));
}

// --- Prerequisite progression -------------------------------------------------

// One topic's progression state from recorded evidence only:
// - completed: recorded completed.
// - available: unfinished with every direct prerequisite completed.
// - blocked: unfinished, at least one direct prerequisite incomplete, and
//   work is underway in its direct prerequisites (at least one completed
//   or in progress).
// - future: unfinished, at least one direct prerequisite incomplete, and
//   every direct prerequisite still not started.
// Null when the topic is unknown (never throws).
export function getProgressionState(manifest, getStatus, courseCode, topicId) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) return null;
  const safe = (c, id) => readStatus(getStatus, c, id);
  if (safe(courseCode, topicId) === STATUS_COMPLETED) return PROGRESSION_COMPLETED;
  const prereqs = prereqIds(topic);
  if (prereqs.every((p) => safe(courseCode, p) === STATUS_COMPLETED)) {
    return PROGRESSION_AVAILABLE;
  }
  const underway = prereqs.some((p) => {
    const s = safe(courseCode, p);
    return s === STATUS_COMPLETED || s === STATUS_IN_PROGRESS;
  });
  return underway ? PROGRESSION_BLOCKED : PROGRESSION_FUTURE;
}

// Whole-manifest progression partition in manifest order. Every known topic
// lands in exactly one bucket.
export function getProgressionBreakdown(manifest, getStatus) {
  const buckets = {
    [PROGRESSION_COMPLETED]: [],
    [PROGRESSION_AVAILABLE]: [],
    [PROGRESSION_BLOCKED]: [],
    [PROGRESSION_FUTURE]: [],
  };
  for (const t of manifestTopics(manifest)) {
    const state = getProgressionState(manifest, getStatus, t.courseCode, t.id);
    if (state) buckets[state].push(t);
  }
  const total = manifestTopics(manifest).length;
  return {
    total,
    completed: buckets[PROGRESSION_COMPLETED],
    available: buckets[PROGRESSION_AVAILABLE],
    blocked: buckets[PROGRESSION_BLOCKED],
    future: buckets[PROGRESSION_FUTURE],
    counts: {
      total,
      completed: buckets[PROGRESSION_COMPLETED].length,
      available: buckets[PROGRESSION_AVAILABLE].length,
      blocked: buckets[PROGRESSION_BLOCKED].length,
      future: buckets[PROGRESSION_FUTURE].length,
    },
  };
}

export function getCourseProgression(manifest, getStatus, courseCode) {
  const list = getCourseTopics(manifest, courseCode);
  const scoped = { version: 1, topics: list };
  return { courseCode, ...getProgressionBreakdown(scoped, getStatus) };
}

export function getModuleProgression(manifest, getStatus, courseCode, module) {
  const list = getModuleTopics(manifest, courseCode, module);
  const scoped = { version: 1, topics: list };
  return { courseCode, module, ...getProgressionBreakdown(scoped, getStatus) };
}

// Prerequisite-aware progression path for one topic: its dependency chain
// with each node's progression state attached. Null when unknown.
export function getProgressionPath(manifest, getStatus, courseCode, topicId) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) return null;
  const chain = getDependencyChain(manifest, courseCode, topicId);
  return {
    courseCode: topic.courseCode,
    id: topic.id,
    title: topic.title,
    state: getProgressionState(manifest, getStatus, courseCode, topicId),
    path: chain.map((t) => ({
      courseCode: t.courseCode,
      id: t.id,
      title: t.title,
      current: t.id === topicId && t.courseCode === courseCode,
      state: getProgressionState(manifest, getStatus, t.courseCode, t.id),
    })),
  };
}

// --- Difficulty progression (metadata groups only, no ability math) ----------

// Deterministic per-difficulty view: known difficulties in canonical order
// (beginner, intermediate, advanced, then any others alphabetically), each
// with counts, known-minute sums, and remaining topics in manifest order.
// No learner ability, level, or prediction is computed anywhere here.
export function getDifficultyProgression(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const seen = new Map();
  for (const t of manifestTopics(manifest)) {
    const level = t.difficulty ?? null;
    if (!seen.has(level)) seen.set(level, []);
    seen.get(level).push(t);
  }
  const ordered = [...seen.keys()].sort((a, b) => {
    const ia = DIFFICULTY_ORDER.indexOf(a);
    const ib = DIFFICULTY_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    return String(a).localeCompare(String(b));
  });
  return ordered.map((level) => {
    const topics = seen.get(level);
    let completed = 0;
    let inProgress = 0;
    let remainingMinutes = 0;
    let unknownMinutesCount = 0;
    const remaining = [];
    for (const t of topics) {
      const s = safe(t.courseCode, t.id);
      if (s === STATUS_COMPLETED) {
        completed += 1;
        continue;
      }
      if (s === STATUS_IN_PROGRESS) inProgress += 1;
      remaining.push(t);
      const mins = knownMinutes(t);
      if (mins === null) unknownMinutesCount += 1;
      else remainingMinutes += mins;
    }
    return {
      difficulty: level,
      total: topics.length,
      completed,
      inProgress,
      remaining: remaining.length,
      remainingMinutes,
      unknownMinutesCount,
      remainingTopics: remaining,
    };
  });
}

// --- Exam focus (existing model, filter presentation) -------------------------

// Exam-relevant presentation reusing the exam-readiness model unchanged:
// same weights, same readiness math. The ordered list is a filter over the
// canonical order (the documented exam-focus pattern), capped for display.
export function getExamFocus(manifest, getStatus, limit = EXAM_FOCUS_LIMIT) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const readiness = buildExamReadiness(manifest, safe);
  const n = typeof limit === 'number' && Number.isFinite(limit) && limit >= 0
    ? Math.floor(limit)
    : EXAM_FOCUS_LIMIT;
  const ordered = getRecommendedNextTopics(manifest, safe)
    .filter(isExamRelevantTopic)
    .slice(0, n)
    .map((t) => ({
      courseCode: t.courseCode,
      id: t.id,
      title: t.title,
      examRelevance: t.examRelevance ?? null,
      weight: weightForTopic(t),
    }));
  return {
    readinessPercent: readiness.readinessPercent,
    weightedCompleted: readiness.weightedCompleted,
    weightedTotal: readiness.weightedTotal,
    totalExamTopics: readiness.totalExamTopics,
    completedExamTopics: readiness.completedExamTopics,
    nextExamTopic: getNextExamTopic(manifest, safe),
    orderedTopics: ordered,
  };
}

// --- Revision focus (existing model, unchanged thresholds) ----------------------

// Revision presentation reusing the 7/14-day model unchanged. With recorded
// assessment attempts, the assessment-aware queue is shown (same schedule,
// additional evidence only); without a bank it degrades to the
// timestamp-only queue. Entries carry their existing reason text.
export function getRevisionFocus(manifest, getStatus, getTimestamp, now, assessment, limit = REVISION_FOCUS_LIMIT) {
  const current = resolveNow(now);
  const n = typeof limit === 'number' && Number.isFinite(limit) && limit >= 0
    ? Math.floor(limit)
    : REVISION_FOCUS_LIMIT;
  const hasBank = assessment && typeof assessment === 'object' && assessment.bank;
  const queue = hasBank
    ? getAssessmentAwareReviewQueue(manifest, getStatus, getTimestamp, current, assessment)
    : getReviewQueue(manifest, getStatus, getTimestamp, current);
  return {
    dueDays: REVIEW_DUE_DAYS,
    overdueDays: REVIEW_OVERDUE_DAYS,
    total: queue.length,
    nextReviewTopic: queue.length ? queue[0] : null,
    orderedTopics: queue.slice(0, n),
  };
}

// --- Unified adaptive model -----------------------------------------------------

/**
 * Deterministic adaptive-learning snapshot: next, strengthen, progression,
 * difficulty, exam, and revision views over the same recorded evidence,
 * plus untouched context riders (study minutes, assessment coverage, the
 * explicit study plan). `options` is `{ getTimestamp, now, assessment,
 * planConfig, limits }`; every field degrades gracefully when its input is
 * absent (never fabricated).
 */
export function buildAdaptiveModel(manifest, getStatus, options = {}) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const getTimestamp = typeof options.getTimestamp === 'function' ? options.getTimestamp : null;
  const current = resolveNow(options.now);
  const assessment = options.assessment && typeof options.assessment === 'object' ? options.assessment : null;
  const limits = options.limits && typeof options.limits === 'object' ? options.limits : {};

  const next = getAdaptiveNext(manifest, safe);
  const strengthen = getStrengthenList(
    manifest, safe, getTimestamp, current, assessment, limits.strengthen ?? STRENGTHEN_LIMIT
  );
  const progression = getProgressionBreakdown(manifest, safe);
  const difficulty = getDifficultyProgression(manifest, safe);
  const exam = getExamFocus(manifest, safe, limits.exam ?? EXAM_FOCUS_LIMIT);
  const revision = getRevisionFocus(
    manifest, safe, getTimestamp, current, assessment, limits.revision ?? REVISION_FOCUS_LIMIT
  );

  let remainingMinutes = null;
  try {
    remainingMinutes = buildLearningAnalytics(manifest, safe, getTimestamp, current).studyTime.remainingMinutes;
  } catch {
    remainingMinutes = null;
  }

  let assessmentCoverage = null;
  if (assessment && assessment.bank) {
    try {
      const coverage = getAssessmentCoverage(assessment.bank, manifest);
      assessmentCoverage = {
        totalQuestions: coverage.totalQuestions,
        coveredCount: coverage.coveredCount,
        totalTopics: coverage.totalTopics,
        uncoveredCount: coverage.uncoveredTopics.length,
      };
    } catch {
      assessmentCoverage = null;
    }
  }

  const plan = buildStudyPlan(manifest, safe, getTimestamp, options.planConfig, current);

  return {
    next,
    strengthen,
    progression,
    difficulty,
    exam,
    revision,
    remainingMinutes,
    assessmentCoverage,
    planStatus: plan.status,
    now: current,
  };
}
