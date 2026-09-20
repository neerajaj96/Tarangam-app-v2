/**
 * Tarangam canonical Weak-Topic Analysis Layer (browser + Node, no dependencies).
 *
 * Pure, deterministic attention math over existing learner evidence:
 * - ./topic-intelligence.js (canonical graph, manifest order, dependents)
 * - ./learner-state.js (canonical progress states — reused, never reinvented)
 * - ./assessment.js (recorded attempts and coverage only)
 * - ./revision.js (existing 7/14-day review states only)
 * - ./exam-readiness.js (existing exam-relevance weights only)
 * No DOM, no storage, no fetch, no Markdown, no AI/ML, no prediction, no
 * numerical ratings of any kind, no proficiency percentages, no
 * gamification, no second next-topic mechanism. Nothing here locks or gates
 * only informs and suggests. The canonical next-topic mechanism
 * (getRecommendedNextTopics in ./topic-intelligence.js, surfaced through
 * ./learning-journey.js) is untouched and remains the single source for
 * "what next".
 *
 * Attention membership (explicit evidence only — every entry carries its
 * reason list, never a score):
 * - "assessment_needs_review": latest recorded attempt for the topic needs
 *   review (any progress status).
 * - "exam_needs_review": the topic is exam-relevant AND its latest attempt
 *   needs review (kept alongside assessment_needs_review, never merged).
 * - "review_overdue": completed topic 14+ days since last access (existing
 *   revision state; inherently "completed with overdue review").
 * - "review_due": completed topic 7+ days since last access.
 * - "exam_not_assessed": exam-relevant topic with questions available but
 *   zero recorded attempts. Topics WITHOUT questions (uncovered) are listed
 *   separately and NEVER enter attention through this reason: unassessed
 *   is not weak.
 * - "blocks_unfinished_exam_topic": the topic is a direct prerequisite of
 *   at least one unfinished exam-relevant topic (direct dependents only —
 *   no invented transitive dependency rules).
 *
 * Priority order (documented, deterministic, states only):
 * 1. has review_overdue
 * 2. has assessment_needs_review (or exam_needs_review)
 * 3. has review_due
 * 4. has exam_not_assessed
 * 5. dependency importance: more unfinished direct dependents first
 * 6. curriculum (manifest) order as the final tie-breaker
 * Entries with several reasons keep every reason; rank is the best
 * (lowest) applicable rank.
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
  getDependents,
} from './topic-intelligence.js';
import {
  getTopicAssessmentState,
  getAssessmentCoverage,
} from './assessment.js';
import {
  REVIEW_DUE_DAYS,
  REVIEW_OVERDUE_DAYS,
  REVIEW_STATE_DUE,
  REVIEW_STATE_OVERDUE,
  REVIEW_STATE_NOT_APPLICABLE,
  getReviewStateForTopic,
} from './revision.js';
import {
  isExamRelevantTopic,
  weightForTopic,
} from './exam-readiness.js';

// Canonical progress states, re-exported from the learner-state module so
// attention consumers share one vocabulary (never a parallel system).
export { STATUS_COMPLETED, STATUS_IN_PROGRESS, STATUS_NOT_STARTED };

// Explicit attention reasons (descriptive values only, never scores).
export const ATTENTION_REASON_ASSESSMENT_NEEDS_REVIEW = 'assessment_needs_review';
export const ATTENTION_REASON_EXAM_NEEDS_REVIEW = 'exam_needs_review';
export const ATTENTION_REASON_REVIEW_OVERDUE = 'review_overdue';
export const ATTENTION_REASON_REVIEW_DUE = 'review_due';
export const ATTENTION_REASON_EXAM_NOT_ASSESSED = 'exam_not_assessed';
export const ATTENTION_REASON_BLOCKS_EXAM_TOPIC = 'blocks_unfinished_exam_topic';

export const ATTENTION_REASONS = [
  ATTENTION_REASON_ASSESSMENT_NEEDS_REVIEW,
  ATTENTION_REASON_EXAM_NEEDS_REVIEW,
  ATTENTION_REASON_REVIEW_OVERDUE,
  ATTENTION_REASON_REVIEW_DUE,
  ATTENTION_REASON_EXAM_NOT_ASSESSED,
  ATTENTION_REASON_BLOCKS_EXAM_TOPIC,
];

export const ATTENTION_FILTERS = [
  'all',
  'needs_attention',
  'assessment_needs_review',
  'review_overdue',
  'review_due',
  'exam_not_assessed',
];

// Best-rank-first priority (lower wins). Blocking alone ranks after the
// four evidence ranks; dependency counts then order within equal ranks.
const REASON_RANK = {
  [ATTENTION_REASON_REVIEW_OVERDUE]: 0,
  [ATTENTION_REASON_ASSESSMENT_NEEDS_REVIEW]: 1,
  [ATTENTION_REASON_EXAM_NEEDS_REVIEW]: 1,
  [ATTENTION_REASON_REVIEW_DUE]: 2,
  [ATTENTION_REASON_EXAM_NOT_ASSESSED]: 3,
  [ATTENTION_REASON_BLOCKS_EXAM_TOPIC]: 4,
};

// How many top entries journey/dashboard surfaces show by default.
export const TOP_ATTENTION_LIMIT = 5;

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

function manifestIndex(manifest) {
  return new Map(manifestTopics(manifest).map((t, i) => [topicKey(t.courseCode, t.id), i]));
}

function assessmentInputOf(assessment) {
  if (assessment && typeof assessment === 'object' && assessment.bank) {
    return { bank: assessment.bank, attempts: assessment.attempts };
  }
  return null;
}

// --- Per-topic attention ----------------------------------------------------

function dependencyImpact(manifest, getStatus, topic) {
  const direct = getDependents(manifest, topic.courseCode, topic.id);
  const unfinished = direct.filter(
    (d) => readStatus(getStatus, d.courseCode, d.id) !== STATUS_COMPLETED
  );
  const blocksExamTopic = unfinished.some((d) => isExamRelevantTopic(d));
  return {
    directDependents: direct.map((d) => ({ courseCode: d.courseCode, id: d.id })),
    unfinishedDependents: unfinished.map((d) => ({ courseCode: d.courseCode, id: d.id })),
    unfinishedDependentCount: unfinished.length,
    blocksExamTopic,
  };
}

function assessmentEvidence(assessment, courseCode, topicId) {
  const input = assessmentInputOf(assessment);
  if (!input) {
    return {
      available: false, attempted: false, passed: false, needsReview: false,
      latestScore: null, bestScore: null, attempts: 0, state: 'not_attempted',
    };
  }
  try {
    const s = getTopicAssessmentState(input.bank, input.attempts, courseCode, topicId);
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
      available: false, attempted: false, passed: false, needsReview: false,
      latestScore: null, bestScore: null, attempts: 0, state: 'not_attempted',
    };
  }
}

// Full attention record for one topic. Null when the topic is unknown
// (never throws). `assessment` is an optional `{ bank, attempts }` pair;
// without a bank, assessment reasons degrade to absent (never fabricated).
export function getTopicAttention(manifest, getStatus, getTimestamp, courseCode, topicId, now, assessment) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) return null;
  const current = resolveNow(now);
  const safeStatus = (c, id) => readStatus(getStatus, c, id);
  const progressStatus = safeStatus(courseCode, topicId);
  const evidence = assessmentEvidence(assessment, courseCode, topicId);
  let reviewState = REVIEW_STATE_NOT_APPLICABLE;
  let daysSince = null;
  try {
    const rs = getReviewStateForTopic(manifest, getStatus, getTimestamp, courseCode, topicId, current);
    reviewState = rs.state;
    daysSince = rs.daysSince;
  } catch {
    reviewState = REVIEW_STATE_NOT_APPLICABLE;
    daysSince = null;
  }
  const examRelevant = isExamRelevantTopic(topic);
  const impact = dependencyImpact(manifest, getStatus, topic);

  const reasons = [];
  if (evidence.available && evidence.needsReview) {
    reasons.push(ATTENTION_REASON_ASSESSMENT_NEEDS_REVIEW);
    if (examRelevant) reasons.push(ATTENTION_REASON_EXAM_NEEDS_REVIEW);
  }
  if (reviewState === REVIEW_STATE_OVERDUE) reasons.push(ATTENTION_REASON_REVIEW_OVERDUE);
  else if (reviewState === REVIEW_STATE_DUE) reasons.push(ATTENTION_REASON_REVIEW_DUE);
  // Unassessed is not weak: only exam-relevant topics WITH questions and
  // zero attempts qualify here. Uncovered topics are reported separately.
  if (examRelevant && evidence.available && !evidence.attempted) {
    reasons.push(ATTENTION_REASON_EXAM_NOT_ASSESSED);
  }
  if (impact.blocksExamTopic) reasons.push(ATTENTION_REASON_BLOCKS_EXAM_TOPIC);

  return {
    courseCode: topic.courseCode,
    courseName: topic.courseName || topic.courseCode,
    module: topic.module,
    moduleName: topic.moduleName || `Module ${topic.module}`,
    id: topic.id,
    title: topic.title,
    progressStatus,
    assessmentAvailable: evidence.available,
    assessmentAttempted: evidence.attempted,
    assessmentPassed: evidence.passed,
    assessmentNeedsReview: evidence.needsReview,
    assessmentLatestScore: evidence.latestScore,
    assessmentBestScore: evidence.bestScore,
    assessmentAttempts: evidence.attempts,
    assessmentState: evidence.state,
    reviewState,
    daysSince,
    examRelevance: topic.examRelevance ?? null,
    examWeight: weightForTopic(topic),
    isExamRelevant: examRelevant,
    directDependents: impact.directDependents,
    unfinishedDependents: impact.unfinishedDependents,
    unfinishedDependentCount: impact.unfinishedDependentCount,
    blocksExamTopic: impact.blocksExamTopic,
    reasons,
    needsAttention: reasons.length > 0,
    topic,
  };
}

// Human-readable attention explanation. Empty string when nothing needs
// attention (callers render no warning block in that case).
export function explainAttention(entry) {
  if (!entry || !Array.isArray(entry.reasons) || !entry.reasons.length) return '';
  const label = {
    [ATTENTION_REASON_ASSESSMENT_NEEDS_REVIEW]: 'assessment needs review',
    [ATTENTION_REASON_EXAM_NEEDS_REVIEW]: 'exam-relevant and assessment needs review',
    [ATTENTION_REASON_REVIEW_OVERDUE]: 'review overdue',
    [ATTENTION_REASON_REVIEW_DUE]: 'review due',
    [ATTENTION_REASON_EXAM_NOT_ASSESSED]: 'exam-relevant topic not yet assessed',
    [ATTENTION_REASON_BLOCKS_EXAM_TOPIC]: 'prerequisite of an unfinished exam-relevant topic',
  };
  const title = entry.title || entry.id;
  if (entry.reasons.length === 1 && entry.reasons[0] === ATTENTION_REASON_EXAM_NOT_ASSESSED) {
    return `Exam-relevant topic not yet assessed — “${title}” has questions available but no recorded attempt.`;
  }
  return `Needs attention: ${entry.reasons.map((r) => label[r] || r).join(' + ')} — “${title}”.`;
}

function rankOf(entry) {
  let best = 5;
  for (const r of entry.reasons) {
    const rank = Object.prototype.hasOwnProperty.call(REASON_RANK, r) ? REASON_RANK[r] : 5;
    if (rank < best) best = rank;
  }
  return best;
}

function compareAttentionEntries(indexOf, a, b) {
  const ra = rankOf(a);
  const rb = rankOf(b);
  if (ra !== rb) return ra - rb;
  if (b.unfinishedDependentCount !== a.unfinishedDependentCount) {
    return b.unfinishedDependentCount - a.unfinishedDependentCount;
  }
  return (indexOf.get(topicKey(a.courseCode, a.id)) ?? 0)
    - (indexOf.get(topicKey(b.courseCode, b.id)) ?? 0);
}

// Every attention-needing topic in deterministic priority order.
export function getAttentionTopics(manifest, getStatus, getTimestamp, now, assessment) {
  const current = resolveNow(now);
  const indexOf = manifestIndex(manifest);
  const out = [];
  for (const topic of manifestTopics(manifest)) {
    const entry = getTopicAttention(
      manifest, getStatus, getTimestamp, topic.courseCode, topic.id, current, assessment
    );
    if (entry && entry.needsAttention) out.push(entry);
  }
  out.sort((a, b) => compareAttentionEntries(indexOf, a, b));
  return out;
}

export function getTopAttentionTopics(manifest, getStatus, getTimestamp, now, assessment, limit = TOP_ATTENTION_LIMIT) {
  const n = typeof limit === 'number' && Number.isFinite(limit) && limit >= 0
    ? Math.floor(limit)
    : TOP_ATTENTION_LIMIT;
  return getAttentionTopics(manifest, getStatus, getTimestamp, now, assessment).slice(0, n);
}

function countReasons(topics) {
  let needsReview = 0;
  let overdue = 0;
  let due = 0;
  let examNotAssessed = 0;
  let blocking = 0;
  for (const t of topics) {
    if (t.reasons.includes(ATTENTION_REASON_ASSESSMENT_NEEDS_REVIEW)) needsReview += 1;
    if (t.reasons.includes(ATTENTION_REASON_REVIEW_OVERDUE)) overdue += 1;
    if (t.reasons.includes(ATTENTION_REASON_REVIEW_DUE)) due += 1;
    if (t.reasons.includes(ATTENTION_REASON_EXAM_NOT_ASSESSED)) examNotAssessed += 1;
    if (t.reasons.includes(ATTENTION_REASON_BLOCKS_EXAM_TOPIC)) blocking += 1;
  }
  return { total: topics.length, needsReview, overdue, due, examNotAssessed, blocking };
}

// Uncovered assessment topics (questions unavailable) in manifest order.
// Reported separately: unassessed is not weak and never enters attention.
export function getUncoveredAttentionTopics(bank, manifest) {
  try {
    if (!bank) return [];
    return getAssessmentCoverage(bank, manifest).uncoveredTopics;
  } catch {
    return [];
  }
}

// Whole-curriculum attention snapshot plus the separate uncovered list.
export function buildAttentionModel(manifest, getStatus, getTimestamp, now, assessment) {
  const current = resolveNow(now);
  const topics = getAttentionTopics(manifest, getStatus, getTimestamp, current, assessment);
  const input = assessmentInputOf(assessment);
  return {
    attentionTopics: topics,
    topAttentionTopics: topics.slice(0, TOP_ATTENTION_LIMIT),
    counts: countReasons(topics),
    uncoveredAssessmentTopics: getUncoveredAttentionTopics(input ? input.bank : null, manifest),
    reviewDueDays: REVIEW_DUE_DAYS,
    reviewOverdueDays: REVIEW_OVERDUE_DAYS,
    now: current,
  };
}

// --- Course/module analysis -------------------------------------------------

function scopedAttention(manifest, getStatus, getTimestamp, now, assessment, scope) {
  const current = resolveNow(now);
  const indexOf = manifestIndex(manifest);
  const list = manifestTopics(manifest).filter((t) => {
    if (scope.courseCode && t.courseCode !== scope.courseCode) return false;
    if (scope.module !== undefined && t.module !== scope.module) return false;
    return true;
  });
  const topics = [];
  for (const t of list) {
    const entry = getTopicAttention(
      manifest, getStatus, getTimestamp, t.courseCode, t.id, current, assessment
    );
    if (entry && entry.needsAttention) topics.push(entry);
  }
  topics.sort((a, b) => compareAttentionEntries(indexOf, a, b));
  const input = assessmentInputOf(assessment);
  const uncovered = getUncoveredAttentionTopics(input ? input.bank : null, manifest)
    .filter((u) => {
      if (scope.courseCode && u.courseCode !== scope.courseCode) return false;
      if (scope.module === undefined) return true;
      const full = getTopic(manifest, u.courseCode, u.id);
      return full ? full.module === scope.module : false;
    });
  return {
    ...scope,
    totalTopics: list.length,
    attentionTopics: topics,
    topAttentionTopics: topics.slice(0, TOP_ATTENTION_LIMIT),
    counts: countReasons(topics),
    uncoveredAssessmentTopics: uncovered,
  };
}

export function getCourseAttention(manifest, getStatus, getTimestamp, courseCode, now, assessment) {
  return scopedAttention(manifest, getStatus, getTimestamp, now, assessment, { courseCode });
}

export function getModuleAttention(manifest, getStatus, getTimestamp, courseCode, module, now, assessment) {
  return scopedAttention(manifest, getStatus, getTimestamp, now, assessment, { courseCode, module });
}

export function buildCourseAttentionList(manifest, getStatus, getTimestamp, now, assessment) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const codes = [...new Set(manifest.topics.map((t) => t.courseCode))].sort();
  return codes.map((code) => getCourseAttention(manifest, getStatus, getTimestamp, code, now, assessment));
}

export function buildModuleAttentionList(manifest, getStatus, getTimestamp, courseCode, now, assessment) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const mods = [...new Set(
    manifest.topics.filter((t) => t.courseCode === courseCode).map((t) => t.module)
  )].sort((a, b) => a - b);
  return mods.map((module) => getModuleAttention(manifest, getStatus, getTimestamp, courseCode, module, now, assessment));
}

// --- Attention filter (preserves input order) -------------------------------

export function normalizeAttentionFilter(value) {
  return ATTENTION_FILTERS.includes(value) ? value : 'all';
}

// Filter an already-scoped topic list by attention evidence. Needs the
// manifest (topic lookup) plus status/timestamp readers, injected now, and
// the optional `{ bank, attempts }` assessment pair. Preserves input order;
// unknown filters fall back to 'all'.
export function filterTopicsByAttention(manifest, getStatus, getTimestamp, topicList, attentionFilter = 'all', now, assessment) {
  const filter = normalizeAttentionFilter(attentionFilter);
  const list = Array.isArray(topicList) ? topicList : [];
  if (filter === 'all') return [...list];
  const current = resolveNow(now);
  const reasonFor = (t) => {
    const entry = getTopicAttention(manifest, getStatus, getTimestamp, t.courseCode, t.id, current, assessment);
    if (!entry) return [];
    return entry.reasons;
  };
  if (filter === 'needs_attention') return list.filter((t) => reasonFor(t).length > 0);
  if (filter === 'assessment_needs_review') {
    return list.filter((t) => reasonFor(t).includes(ATTENTION_REASON_ASSESSMENT_NEEDS_REVIEW));
  }
  if (filter === 'review_overdue') {
    return list.filter((t) => reasonFor(t).includes(ATTENTION_REASON_REVIEW_OVERDUE));
  }
  if (filter === 'review_due') {
    return list.filter((t) => reasonFor(t).includes(ATTENTION_REASON_REVIEW_DUE));
  }
  return list.filter((t) => reasonFor(t).includes(ATTENTION_REASON_EXAM_NOT_ASSESSED));
}
