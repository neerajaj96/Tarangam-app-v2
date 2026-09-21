/**
 * Tarangam canonical Course & Module Overview Layer (browser + Node, no
 * dependencies).
 *
 * Pure, deterministic overview models for Course → Module → Topic
 * navigation built ONLY from existing canonical modules:
 * - ./topic-intelligence.js (topics, modules, ready states, neighbors,
 *   prerequisite completion — the single source for structure)
 * - ./learner-state.js (canonical progress states — reused, never
 *   reinvented; learner state itself stays in the browser behind an
 *   injected reader, which this module never touches directly)
 * - ./exam-readiness.js (per-course/per-module readiness, weights untouched)
 * - ./revision.js (per-course/per-module review breakdowns, 7/14-day
 *   thresholds untouched)
 * - ./weak-topic-analysis.js (per-course/per-module attention counts,
 *   reasons preserved, never scored)
 * - ./assessment.js (coverage counts and per-topic assessment states only)
 * No DOM, no storage, no fetch, no Markdown, no AI/ML, no prediction, no
 * ratings of any kind, no gamification, no next-topic mechanism of any
 * kind (the canonical recommendation is never reimplemented, wrapped, or
 * shadowed here). Nothing locks or gates the learner; overviews only
 * inform and suggest. Identical inputs always produce identical outputs.
 *
 * Identity note: course identity (code, name) and module identity (number,
 * name) come from the manifest, which derives them from
 * data/curriculum.json plus topic front-matter. No description field
 * exists upstream, so none is fabricated here — overviews show catalog
 * facts (counts, progress, signals) only.
 */

import {
  STATUS_COMPLETED,
  STATUS_IN_PROGRESS,
  STATUS_NOT_STARTED,
} from './learner-state.js';
import {
  topicKey,
  getTopic,
  getCourseTopics,
  getModuleTopics,
  getReadyTopics,
  getPreviousInCourse,
  getNextInCourse,
  getDirectPrerequisiteCompletion,
  getRemainingDependencyCount,
} from './topic-intelligence.js';
import {
  getCourseExamReadiness,
  getModuleExamReadiness,
} from './exam-readiness.js';
import {
  getCourseReviewBreakdown,
  getModuleReviewBreakdown,
  getReviewStateForTopic,
} from './revision.js';
import {
  getCourseAttention,
  getModuleAttention,
} from './weak-topic-analysis.js';
import {
  getCoveredTopicsPerCourse,
  getQuestionsPerCourse,
  getQuestionsPerModule,
  getTopicQuestionCounts,
  getTopicAssessmentState,
} from './assessment.js';

// Course page links: the course page lives at the site root beside the
// explorer; topic pages sit one level below it. Pure and unit-tested.
export function courseHrefFrom(currentCourseCode, courseCode) {
  if (!courseCode) return '#';
  const prefix = currentCourseCode ? '../' : './';
  return `${prefix}course.html?course=${encodeURIComponent(courseCode)}`;
}

export function parseCourseQuery(search) {
  const text = typeof search === 'string' ? search.replace(/^\?/, '') : '';
  if (!text) return { courseCode: null };
  try {
    const params = new URLSearchParams(text);
    const course = params.get('course');
    return { courseCode: course && course.trim() ? course.trim() : null };
  } catch {
    return { courseCode: null };
  }
}

// --- Internal guards --------------------------------------------------------

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

function knownMinutes(topic) {
  return typeof topic.estimatedMinutes === 'number' && Number.isFinite(topic.estimatedMinutes)
    ? topic.estimatedMinutes
    : null;
}

function assessmentInputOf(assessment) {
  if (assessment && typeof assessment === 'object' && assessment.bank) {
    return { bank: assessment.bank, attempts: assessment.attempts };
  }
  return null;
}

function summarizeTopics(topicList, safeStatus) {
  let completed = 0;
  let inProgress = 0;
  let remainingMinutes = 0;
  let unknownMinutesCount = 0;
  for (const t of topicList) {
    const s = safeStatus(t.courseCode, t.id);
    if (s === STATUS_COMPLETED) completed += 1;
    else if (s === STATUS_IN_PROGRESS) inProgress += 1;
    if (s !== STATUS_COMPLETED) {
      const mins = knownMinutes(t);
      if (mins === null) unknownMinutesCount += 1;
      else remainingMinutes += mins;
    }
  }
  const total = topicList.length;
  return {
    total,
    completed,
    inProgress,
    notStarted: total - completed - inProgress,
    remaining: total - completed,
    percent: total ? Math.round((completed / total) * 100) : 0,
    remainingMinutes,
    unknownMinutesCount,
  };
}

function topicRow(manifest, getStatus, getTimestamp, readyKeys, assessment, now, topic) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const status = safe(topic.courseCode, topic.id);
  let reviewState = null;
  let daysSince = null;
  try {
    const rs = getReviewStateForTopic(manifest, getStatus, getTimestamp, topic.courseCode, topic.id, now);
    reviewState = rs.state;
    daysSince = rs.daysSince;
  } catch {
    reviewState = null;
    daysSince = null;
  }
  const input = assessmentInputOf(assessment);
  let assessmentState = {
    available: false, attempted: false, passed: false, needsReview: false,
    latestScore: null, state: 'not_attempted',
  };
  if (input) {
    try {
      const s = getTopicAssessmentState(input.bank, input.attempts, topic.courseCode, topic.id);
      assessmentState = {
        available: Boolean(s.available),
        attempted: Boolean(s.attempted),
        passed: Boolean(s.passed),
        needsReview: Boolean(s.needsReview),
        latestScore: s.latestScore ?? null,
        state: s.state ?? 'not_attempted',
      };
    } catch {
      // keep unavailable-shape defaults
    }
  }
  return {
    courseCode: topic.courseCode,
    id: topic.id,
    title: topic.title,
    sequence: topic.sequence,
    estimatedMinutes: knownMinutes(topic),
    difficulty: topic.difficulty ?? null,
    examRelevance: topic.examRelevance ?? null,
    status,
    isReady: readyKeys.has(topicKey(topic.courseCode, topic.id)),
    prereqCompletion: getDirectPrerequisiteCompletion(manifest, getStatus, topic.courseCode, topic.id),
    remainingDependencies: getRemainingDependencyCount(manifest, getStatus, topic.courseCode, topic.id),
    reviewState,
    daysSince,
    assessment: assessmentState,
  };
}

// Canonical in-course neighbors for one topic (manifest order within the
// course — the same ordering the static topic pages are built in).
// Null neighbors at the course boundaries; null record for unknown topics.
export function getTopicNeighbors(manifest, courseCode, topicId) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) return null;
  const nav = (t) => (t ? { courseCode: t.courseCode, id: t.id, title: t.title } : null);
  return {
    courseCode: topic.courseCode,
    id: topic.id,
    prev: nav(getPreviousInCourse(manifest, courseCode, topicId)),
    next: nav(getNextInCourse(manifest, courseCode, topicId)),
  };
}

// --- Module overview ----------------------------------------------------------

// Everything a module section needs, derived from the canonical modules.
// Returns null for unknown courses/modules (never throws). Topics arrive
// in canonical manifest order with per-topic status, readiness,
// prerequisite, review, and assessment facts attached.
export function getModuleOverview(manifest, getStatus, getTimestamp, courseCode, module, now, assessment) {
  const list = getModuleTopics(manifest, courseCode, module);
  if (!list.length) return null;
  const current = resolveNow(now);
  const safe = (c, id) => readStatus(getStatus, c, id);
  const readyKeys = new Set(
    getReadyTopics(manifest, safe)
      .filter((t) => t.courseCode === courseCode && t.module === module)
      .map((t) => topicKey(t.courseCode, t.id))
  );
  const summary = summarizeTopics(list, safe);
  const input = assessmentInputOf(assessment);
  let moduleQuestions = 0;
  let moduleCovered = 0;
  if (input) {
    try {
      const row = getQuestionsPerModule(input.bank, manifest)
        .find((r) => r.courseCode === courseCode && r.module === module);
      moduleQuestions = row ? row.questionCount : 0;
      const inModule = new Set(list.map((t) => t.id));
      moduleCovered = getTopicQuestionCounts(input.bank, manifest)
        .filter((r) => r.courseCode === courseCode && inModule.has(r.id)).length;
    } catch {
      // keep zeroed coverage
    }
  }
  const attention = getModuleAttention(manifest, getStatus, getTimestamp, courseCode, module, current, assessment);
  const { total: totalTopics, ...rest } = summary;
  return {
    courseCode,
    courseName: list[0].courseName || courseCode,
    module,
    moduleName: list[0].moduleName || `Module ${module}`,
    totalTopics,
    ...rest,
    exam: getModuleExamReadiness(manifest, getStatus, courseCode, module),
    review: getModuleReviewBreakdown(manifest, getStatus, getTimestamp, courseCode, module, current),
    attentionCounts: attention.counts,
    assessment: {
      totalQuestions: moduleQuestions,
      coveredCount: moduleCovered,
      totalTopics: list.length,
      uncoveredCount: Math.max(0, list.length - moduleCovered),
    },
    topics: list.map((t) => topicRow(manifest, getStatus, getTimestamp, readyKeys, assessment, current, t)),
    firstTopicId: list[0].id,
    lastTopicId: list[list.length - 1].id,
  };
}

// --- Course overview ------------------------------------------------------------

// Everything a course page needs, derived from the canonical modules.
// Returns null for unknown courses (never throws). Modules arrive in
// numeric order, each as getModuleOverview above.
export function getCourseOverview(manifest, getStatus, getTimestamp, courseCode, now, assessment) {
  const list = getCourseTopics(manifest, courseCode);
  if (!list.length) return null;
  const current = resolveNow(now);
  const safe = (c, id) => readStatus(getStatus, c, id);
  const summary = summarizeTopics(list, safe);
  const modules = [...new Set(list.map((t) => t.module))].sort((a, b) => a - b);
  const input = assessmentInputOf(assessment);
  let coveredCount = 0;
  let totalQuestions = 0;
  if (input) {
    try {
      const covered = getCoveredTopicsPerCourse(input.bank, manifest)
        .find((r) => r.courseCode === courseCode);
      coveredCount = covered ? covered.coveredCount : 0;
      const questions = getQuestionsPerCourse(input.bank)
        .find((r) => r.courseCode === courseCode);
      totalQuestions = questions ? questions.questionCount : 0;
    } catch {
      // keep zeroed coverage
    }
  }
  const attention = getCourseAttention(manifest, getStatus, getTimestamp, courseCode, current, assessment);
  const { total: totalTopics, ...rest } = summary;
  return {
    courseCode,
    courseName: list[0].courseName || courseCode,
    moduleCount: modules.length,
    totalTopics,
    ...rest,
    exam: getCourseExamReadiness(manifest, getStatus, courseCode),
    review: getCourseReviewBreakdown(manifest, getStatus, getTimestamp, courseCode, current),
    attentionCounts: attention.counts,
    assessment: {
      totalQuestions,
      coveredCount,
      totalTopics: list.length,
      uncoveredCount: Math.max(0, list.length - coveredCount),
    },
    modules: modules.map((module) => getModuleOverview(
      manifest, getStatus, getTimestamp, courseCode, module, current, assessment
    )),
  };
}

export function buildCourseOverviewList(manifest, getStatus, getTimestamp, now, assessment) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const codes = [...new Set(manifest.topics.map((t) => t.courseCode))].sort();
  return codes.map((code) => getCourseOverview(manifest, getStatus, getTimestamp, code, now, assessment));
}
