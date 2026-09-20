/**
 * Tarangam canonical Deterministic Learning Analytics Layer (browser + Node,
 * no dependencies).
 *
 * Pure, descriptive analytics over the existing canonical modules:
 * - ./topic-intelligence.js (counts, course/module scope, readiness)
 * - ./exam-readiness.js (exam breakdown, weighted readiness)
 * - ./revision.js (review queues, per-course/module review breakdowns)
 * - ./learner-state.js timestamps via an injected getTimestamp reader
 *   (never read directly — no DOM, no storage here).
 * No DOM, no storage, no fetch, no Markdown, no AI/ML, no prediction, no
 * gamification, no recommendation engine. Nothing locks or gates the
 * learner; every number describes recorded facts only.
 *
 * Descriptive topic states (no artificial mastery score — a combined state
 * is derived transparently only from existing facts):
 * - "not_started"  — status reader says not_started (or unknown).
 * - "in_progress"  — status reader says in_progress.
 * - "completed"    — completed and review-fresh (or no usable timestamp).
 * - "review_due"   — completed AND revision layer says review_due.
 * - "review_overdue" — completed AND revision layer says review_overdue.
 * Rule: review states refine "completed"; unfinished topics never report
 * review states. See getTopicDescriptiveState.
 *
 * Study-time convention: topics with a non-numeric estimatedMinutes are
 * excluded from minute math (they contribute 0 and are excluded from
 * averages, which divide only by topics with known minutes). Averages are
 * rounded to one decimal; percents are whole-rounded except the summary
 * coverage line, which uses one decimal.
 *
 * Ordering: courses/modules follow manifest first-appearance order
 * (curriculum order); coverage rankings tie-break by that same order.
 * Every listing is deterministic across runs.
 */

import {
  STATUS_COMPLETED,
  STATUS_IN_PROGRESS,
  topicKey,
  getTopic,
  getCourseTopics,
  getModuleTopics,
  getCompletedTopics,
  getInProgressTopics,
} from './topic-intelligence.js';
import {
  buildExamReadiness,
  getCourseExamReadiness,
} from './exam-readiness.js';
import {
  REVIEW_STATE_DUE,
  REVIEW_STATE_OVERDUE,
  getReviewStateForTopic,
  getReviewCounts,
  getCourseReviewBreakdown,
  getModuleReviewBreakdown,
} from './revision.js';

export const DESCRIPTIVE_STATES = ['not_started', 'in_progress', 'completed', 'review_due', 'review_overdue'];

// --- Internal guards --------------------------------------------------------

function manifestTopics(manifest) {
  return manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
}

function readStatus(getStatus, courseCode, topicId) {
  try {
    const s = getStatus(courseCode, topicId);
    if (s === STATUS_COMPLETED) return STATUS_COMPLETED;
    if (s === STATUS_IN_PROGRESS) return STATUS_IN_PROGRESS;
    return 'not_started';
  } catch {
    return 'not_started';
  }
}

function resolveNow(now) {
  return typeof now === 'number' && Number.isFinite(now) ? now : Date.now();
}

function knownMinutes(topic) {
  return typeof topic.estimatedMinutes === 'number' && Number.isFinite(topic.estimatedMinutes)
    ? topic.estimatedMinutes
    : null;
}

function courseOrder(manifest) {
  const order = [];
  const seen = new Set();
  for (const t of manifestTopics(manifest)) {
    if (!seen.has(t.courseCode)) {
      seen.add(t.courseCode);
      order.push({ courseCode: t.courseCode, courseName: t.courseName || t.courseCode });
    }
  }
  return order;
}

function moduleOrder(manifest, courseCode) {
  const order = [];
  const seen = new Set();
  for (const t of manifestTopics(manifest)) {
    if (t.courseCode !== courseCode || seen.has(t.module)) continue;
    seen.add(t.module);
    order.push({ module: t.module, moduleName: t.moduleName || `Module ${t.module}` });
  }
  order.sort((a, b) => a.module - b.module);
  return order;
}

// --- Descriptive state ---------------------------------------------------------

export function getTopicDescriptiveState(manifest, getStatus, getTimestamp, courseCode, topicId, now) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) return 'not_started';
  const status = readStatus(getStatus, courseCode, topicId);
  if (status !== STATUS_COMPLETED) return status === STATUS_IN_PROGRESS ? 'in_progress' : 'not_started';
  const rs = getReviewStateForTopic(manifest, getStatus, getTimestamp, courseCode, topicId, now);
  if (rs.state === REVIEW_STATE_OVERDUE) return 'review_overdue';
  if (rs.state === REVIEW_STATE_DUE) return 'review_due';
  return 'completed';
}

// --- Overall completion ----------------------------------------------------------

export function getCompletionSummary(manifest, getStatus) {
  const topics = manifestTopics(manifest);
  let completed = 0;
  let inProgress = 0;
  for (const t of topics) {
    const s = readStatus(getStatus, t.courseCode, t.id);
    if (s === STATUS_COMPLETED) completed += 1;
    else if (s === STATUS_IN_PROGRESS) inProgress += 1;
  }
  const total = topics.length;
  const notStarted = total - completed - inProgress;
  return {
    total,
    completed,
    inProgress,
    notStarted,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}

// --- Distributions -----------------------------------------------------------------

function distributeBy(topics, getStatus, keyOf) {
  const rows = {};
  for (const t of topics) {
    const key = keyOf(t) ?? 'unknown';
    if (!rows[key]) rows[key] = { total: 0, completed: 0, remaining: 0 };
    rows[key].total += 1;
    if (readStatus(getStatus, t.courseCode, t.id) === STATUS_COMPLETED) rows[key].completed += 1;
    else rows[key].remaining += 1;
  }
  return rows;
}

export function getDifficultyDistribution(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  return distributeBy(manifestTopics(manifest), safe, (t) => t.difficulty);
}

export function getExamRelevanceDistribution(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  return distributeBy(manifestTopics(manifest), safe, (t) => t.examRelevance);
}

// --- Study time -----------------------------------------------------------------------

function averageRounded(sum, count) {
  if (!count) return 0;
  return Math.round((sum / count) * 10) / 10;
}

export function getStudyTimeSummary(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  let totalMinutes = 0;
  let totalKnown = 0;
  let completedMinutes = 0;
  let completedKnown = 0;
  let remainingMinutes = 0;
  let remainingKnown = 0;
  for (const t of manifestTopics(manifest)) {
    const mins = knownMinutes(t);
    if (mins === null) continue;
    totalMinutes += mins;
    totalKnown += 1;
    if (safe(t.courseCode, t.id) === STATUS_COMPLETED) {
      completedMinutes += mins;
      completedKnown += 1;
    } else {
      remainingMinutes += mins;
      remainingKnown += 1;
    }
  }
  return {
    avgTotal: averageRounded(totalMinutes, totalKnown),
    avgCompleted: averageRounded(completedMinutes, completedKnown),
    avgRemaining: averageRounded(remainingMinutes, remainingKnown),
    completedMinutes,
    remainingMinutes,
    totalMinutes,
  };
}

// --- Course / module analytics ----------------------------------------------------------

export function getCourseAnalytics(manifest, getStatus, getTimestamp, courseCode, now) {
  const current = resolveNow(now);
  const list = getCourseTopics(manifest, courseCode);
  const names = new Map(list.map((t) => [t.courseCode, t.courseName || t.courseCode]));
  let completed = 0;
  let inProgress = 0;
  for (const t of list) {
    const s = readStatus(getStatus, t.courseCode, t.id);
    if (s === STATUS_COMPLETED) completed += 1;
    else if (s === STATUS_IN_PROGRESS) inProgress += 1;
  }
  const total = list.length;
  const exam = getCourseExamReadiness(manifest, getStatus, courseCode);
  const review = getCourseReviewBreakdown(manifest, getStatus, getTimestamp, courseCode, current);
  let remainingMinutes = 0;
  for (const t of list) {
    if (readStatus(getStatus, t.courseCode, t.id) === STATUS_COMPLETED) continue;
    const mins = knownMinutes(t);
    if (mins !== null) remainingMinutes += mins;
  }
  return {
    courseCode,
    courseName: names.get(courseCode) || courseCode,
    total,
    completed,
    inProgress,
    remaining: total - completed,
    percent: total ? Math.round((completed / total) * 100) : 0,
    examReadiness: exam.readinessPercent,
    examCompleted: exam.completed,
    examRemaining: exam.total - exam.completed,
    reviewDue: review.due,
    reviewOverdue: review.overdue,
    remainingMinutes,
  };
}

export function getCourseAnalyticsList(manifest, getStatus, getTimestamp, now) {
  return courseOrder(manifest).map(({ courseCode }) =>
    getCourseAnalytics(manifest, getStatus, getTimestamp, courseCode, now));
}

export function getModuleAnalytics(manifest, getStatus, getTimestamp, courseCode, module, now) {
  const current = resolveNow(now);
  const list = getModuleTopics(manifest, courseCode, module);
  const moduleName = (list[0] && (list[0].moduleName || `Module ${module}`)) || `Module ${module}`;
  let completed = 0;
  let inProgress = 0;
  for (const t of list) {
    const s = readStatus(getStatus, t.courseCode, t.id);
    if (s === STATUS_COMPLETED) completed += 1;
    else if (s === STATUS_IN_PROGRESS) inProgress += 1;
  }
  const total = list.length;
  const examDist = distributeBy(list, (c, id) => readStatus(getStatus, c, id), (t) => t.examRelevance);
  const review = getModuleReviewBreakdown(manifest, getStatus, getTimestamp, courseCode, module, current);
  let remainingMinutes = 0;
  for (const t of list) {
    if (readStatus(getStatus, t.courseCode, t.id) === STATUS_COMPLETED) continue;
    const mins = knownMinutes(t);
    if (mins !== null) remainingMinutes += mins;
  }
  return {
    courseCode,
    module,
    moduleName,
    total,
    completed,
    inProgress,
    remaining: total - completed,
    percent: total ? Math.round((completed / total) * 100) : 0,
    examRelevance: examDist,
    reviewDue: review.due,
    reviewOverdue: review.overdue,
    remainingMinutes,
  };
}

export function getModuleAnalyticsList(manifest, getStatus, getTimestamp, courseCode, now) {
  return moduleOrder(manifest, courseCode).map(({ module }) =>
    getModuleAnalytics(manifest, getStatus, getTimestamp, courseCode, module, now));
}

// --- Coverage areas (descriptive only — never "best"/"worst") -----------------------------

function rankByCoverage(rows, indexOf, key, dir, limit) {
  const sorted = [...rows].sort((a, b) => {
    if (a.percent !== b.percent) return dir === 'desc' ? b.percent - a.percent : a.percent - b.percent;
    return (indexOf.get(key(a)) ?? 0) - (indexOf.get(key(b)) ?? 0);
  });
  return sorted.slice(0, Math.max(0, limit));
}

export function getCoverageAreas(manifest, getStatus, getTimestamp, now, limit = 3) {
  const courses = getCourseAnalyticsList(manifest, getStatus, getTimestamp, now);
  const courseIndex = new Map(courses.map((c, i) => [c.courseCode, i]));
  const modules = [];
  for (const c of courses) {
    for (const m of getModuleAnalyticsList(manifest, getStatus, getTimestamp, c.courseCode, now)) {
      modules.push(m);
    }
  }
  const moduleIndex = new Map(modules.map((m, i) => [`${m.courseCode}:M${m.module}`, i]));
  return {
    highestCourses: rankByCoverage(courses, courseIndex, (c) => c.courseCode, 'desc', limit),
    lowestCourses: rankByCoverage(courses, courseIndex, (c) => c.courseCode, 'asc', limit),
    highestModules: rankByCoverage(modules, moduleIndex, (m) => `${m.courseCode}:M${m.module}`, 'desc', limit),
    lowestModules: rankByCoverage(modules, moduleIndex, (m) => `${m.courseCode}:M${m.module}`, 'asc', limit),
  };
}

// --- Recent / active --------------------------------------------------------------------------

export function getRecentTopics(manifest, getStatus, getTimestamp, limit = 5) {
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
    if (typeof ts === 'number' && Number.isFinite(ts)) withTime.push({ topic: t, ts });
  }
  withTime.sort((a, b) => {
    if (b.ts !== a.ts) return b.ts - a.ts;
    return (indexOf.get(topicKey(b.topic.courseCode, b.topic.id)) ?? 0)
      - (indexOf.get(topicKey(a.topic.courseCode, a.topic.id)) ?? 0);
  });
  return withTime.slice(0, Math.max(0, limit)).map((e) => e.topic);
}

export function getActiveTopics(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  return getInProgressTopics(manifest, safe);
}

// --- Canonical analytics model -------------------------------------------------------------------

export function buildLearningAnalytics(manifest, getStatus, getTimestamp, now) {
  const current = resolveNow(now);
  const safe = (c, id) => readStatus(getStatus, c, id);
  const completion = getCompletionSummary(manifest, safe);
  const exam = buildExamReadiness(manifest, safe);
  const review = getReviewCounts(manifest, safe, getTimestamp, current);
  const studyTime = getStudyTimeSummary(manifest, safe);
  const courses = getCourseAnalyticsList(manifest, safe, getTimestamp, current);
  const coverage = getCoverageAreas(manifest, safe, getTimestamp, current);
  const recent = getRecentTopics(manifest, safe, getTimestamp);
  const active = getActiveTopics(manifest, safe);
  const total = completion.total || 0;
  const coverageOneDecimal = total ? (Math.round((completion.completed / total) * 1000) / 10) : 0;
  const summary = `${completion.completed} of ${total} topics completed — ${coverageOneDecimal}% curriculum coverage.`;
  const activity = {
    completedCount: completion.completed,
    inProgressCount: completion.inProgress,
    dueCount: review.due,
    overdueCount: review.overdue,
    examReadinessPercent: exam.readinessPercent,
    message: `${completion.completed} completed · ${completion.inProgress} in progress · ${review.due + review.overdue} due for review · exam readiness ${exam.readinessPercent}%.`,
  };
  return {
    totals: completion,
    summary,
    coveragePercent: coverageOneDecimal,
    byDifficulty: getDifficultyDistribution(manifest, safe),
    byExamRelevance: getExamRelevanceDistribution(manifest, safe),
    examCompleted: exam.completedExamTopics,
    examRemaining: exam.remainingExamTopics,
    examReadiness: exam,
    reviewDue: review.due,
    reviewOverdue: review.overdue,
    reviewCounts: review,
    studyTime,
    courses,
    coverage,
    recent,
    active,
    activity,
    now: current,
  };
}

// --- Per-topic analytics contribution ---------------------------------------------------------------

export function buildTopicAnalyticsContribution(manifest, getStatus, getTimestamp, courseCode, topicId, now) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) return null;
  const current = resolveNow(now);
  const safe = (c, id) => readStatus(getStatus, c, id);
  const course = getCourseAnalytics(manifest, safe, getTimestamp, topic.courseCode, current);
  const module = getModuleAnalytics(manifest, safe, getTimestamp, topic.courseCode, topic.module, current);
  const examRelevant = topic.examRelevance === 'high' || topic.examRelevance === 'medium' || topic.examRelevance === 'low';
  const reviewState = getTopicDescriptiveState(manifest, safe, getTimestamp, courseCode, topicId, current);
  return {
    courseCode: topic.courseCode,
    id: topic.id,
    courseCompletion: { completed: course.completed, total: course.total, percent: course.percent },
    moduleCompletion: { module: module.module, completed: module.completed, total: module.total, percent: module.percent },
    moduleRemainingMinutes: module.remainingMinutes,
    contributesToExam: examRelevant,
    examRelevance: topic.examRelevance ?? null,
    reviewState,
    isDueForReview: reviewState === 'review_due' || reviewState === 'review_overdue',
  };
}
