/**
 * Tarangam deterministic Exam Readiness Layer (browser + Node, no dependencies).
 *
 * Pure, explainable readiness math on top of the canonical Topic
 * Intelligence Layer (./topic-intelligence.js). No DOM, no storage, no
 * fetch, no Markdown, no AI/ML, no predictions, no gamification. A status
 * reader is any `(courseCode, topicId) => status` with
 * 'completed' | 'in_progress' | 'not_started'; anything else counts as
 * unfinished (same contract as the intelligence layer). Nothing here locks
 * or gates the learner; readiness only informs and suggests. Completion
 * tracks coverage only — it never guarantees examination success.
 *
 * Weighting scheme (transparent, deterministic, testable):
 * - examRelevance "high"   -> weight 3
 * - examRelevance "medium" -> weight 2
 * - examRelevance "low"    -> weight 1
 * - missing/unknown        -> weight 0 (not exam-relevant, excluded)
 *
 * readinessPercent = round(100 * weightedCompleted / weightedTotal),
 * 0 when there is nothing weighted to complete. Unweighted
 * completed/total counts are reported alongside, never instead.
 * An "exam-relevant" topic is any manifest topic with a known
 * high/medium/low examRelevance. Exam focus is a filter over the
 * canonical recommendation order (getRecommendedNextTopics), never a
 * second recommendation algorithm.
 */

import {
  STATUS_COMPLETED,
  STATUS_IN_PROGRESS,
  STATUS_NOT_STARTED,
  topicKey,
  getTopic,
  getCourseTopics,
  getModuleTopics,
  getPrerequisites,
  getReadyTopics,
  getInProgressTopics,
  getCompletedTopics,
  getRecommendedNextTopics,
} from './topic-intelligence.js';

export const EXAM_WEIGHTS = { high: 3, medium: 2, low: 1 };
export const EXAM_RELEVANCE_LEVELS = ['high', 'medium', 'low'];
export const EXAM_FILTERS = ['all', 'exam_relevant', 'exam_completed', 'exam_remaining'];

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

// --- Weighting --------------------------------------------------------------

export function weightForExamRelevance(level) {
  return Object.prototype.hasOwnProperty.call(EXAM_WEIGHTS, level) ? EXAM_WEIGHTS[level] : 0;
}

export function weightForTopic(topic) {
  if (!topic) return 0;
  return weightForExamRelevance(topic.examRelevance);
}

export function isExamRelevantTopic(topic) {
  return weightForTopic(topic) > 0;
}

export function normalizeExamFilter(value) {
  return EXAM_FILTERS.includes(value) ? value : 'all';
}

// --- Exam-relevant sets (all in manifest order) ------------------------------

export function getExamRelevantTopics(manifest) {
  return manifestTopics(manifest).filter(isExamRelevantTopic);
}

export function getCompletedExamTopics(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  return getExamRelevantTopics(manifest).filter(
    (t) => safe(t.courseCode, t.id) === STATUS_COMPLETED
  );
}

export function getRemainingExamTopics(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  return getExamRelevantTopics(manifest).filter(
    (t) => safe(t.courseCode, t.id) !== STATUS_COMPLETED
  );
}

export function getInProgressExamTopics(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  return getInProgressTopics(manifest, safe).filter(isExamRelevantTopic);
}

export function getReadyExamTopics(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  return getReadyTopics(manifest, safe).filter(isExamRelevantTopic);
}

// --- Breakdowns --------------------------------------------------------------

function emptyLevelRow(level) {
  return {
    level,
    weight: weightForExamRelevance(level),
    total: 0,
    completed: 0,
    inProgress: 0,
    remaining: 0,
    weightedTotal: 0,
    weightedCompleted: 0,
  };
}

export function getRelevanceBreakdown(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const rows = {};
  for (const level of EXAM_RELEVANCE_LEVELS) rows[level] = emptyLevelRow(level);
  for (const t of getExamRelevantTopics(manifest)) {
    const row = rows[t.examRelevance];
    if (!row) continue;
    const w = weightForTopic(t);
    const s = safe(t.courseCode, t.id);
    row.total += 1;
    row.weightedTotal += w;
    if (s === STATUS_COMPLETED) {
      row.completed += 1;
      row.weightedCompleted += w;
    } else {
      row.remaining += 1;
      if (s === STATUS_IN_PROGRESS) row.inProgress += 1;
    }
  }
  return rows;
}

function summarizeExamList(topicList, getStatus) {
  const safe = getStatus;
  let weightedTotal = 0;
  let weightedCompleted = 0;
  let completed = 0;
  let inProgress = 0;
  for (const t of topicList) {
    const w = weightForTopic(t);
    weightedTotal += w;
    const s = safe(t.courseCode, t.id);
    if (s === STATUS_COMPLETED) {
      completed += 1;
      weightedCompleted += w;
    } else if (s === STATUS_IN_PROGRESS) {
      inProgress += 1;
    }
  }
  const total = topicList.length;
  return {
    total,
    completed,
    inProgress,
    remaining: total - completed,
    percent: total ? Math.round((completed / total) * 100) : 0,
    weightedTotal,
    weightedCompleted,
    readinessPercent: weightedTotal ? Math.round((weightedCompleted / weightedTotal) * 100) : 0,
  };
}

export function buildExamReadiness(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const examTopics = getExamRelevantTopics(manifest);
  const completed = getCompletedExamTopics(manifest, safe);
  const remaining = getRemainingExamTopics(manifest, safe);
  const inProgress = getInProgressExamTopics(manifest, safe);
  const ready = getReadyExamTopics(manifest, safe);
  const summary = summarizeExamList(examTopics, safe);
  const breakdown = getRelevanceBreakdown(manifest, safe);
  const nextExamTopic = getNextExamTopic(manifest, safe);
  const examGaps = getExamGaps(manifest, safe);
  const isEmpty = completed.length === 0 && inProgress.length === 0;
  const isComplete = examTopics.length > 0 && completed.length === examTopics.length;
  return {
    totalExamTopics: examTopics.length,
    completedExamTopics: completed.length,
    remainingExamTopics: remaining.length,
    inProgressExamTopics: inProgress,
    readyExamTopics: ready,
    completedList: completed,
    remainingList: remaining,
    percent: summary.percent,
    weightedTotal: summary.weightedTotal,
    weightedCompleted: summary.weightedCompleted,
    readinessPercent: summary.readinessPercent,
    breakdown,
    nextExamTopic,
    examGaps,
    isEmpty,
    isComplete,
  };
}

export function getCourseExamReadiness(manifest, getStatus, courseCode) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const list = getCourseTopics(manifest, courseCode).filter(isExamRelevantTopic);
  return { courseCode, ...summarizeExamList(list, safe) };
}

export function getModuleExamReadiness(manifest, getStatus, courseCode, module) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const list = getModuleTopics(manifest, courseCode, module).filter(isExamRelevantTopic);
  return { courseCode, module, ...summarizeExamList(list, safe) };
}

export function buildCourseExamReadinessList(manifest, getStatus) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const names = new Map();
  for (const t of manifest.topics) {
    if (!names.has(t.courseCode)) names.set(t.courseCode, t.courseName || t.courseCode);
  }
  return [...names.keys()].sort().map((code) => ({
    courseCode: code,
    courseName: names.get(code),
    ...getCourseExamReadiness(manifest, getStatus, code),
  }));
}

export function buildModuleExamReadinessList(manifest, getStatus, courseCode) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const mods = new Map();
  for (const t of manifest.topics) {
    if (t.courseCode !== courseCode || mods.has(t.module)) continue;
    mods.set(t.module, t.moduleName || `Module ${t.module}`);
  }
  return [...mods.keys()].sort((a, b) => a - b).map((module) => ({
    courseCode,
    module,
    moduleName: mods.get(module),
    ...getModuleExamReadiness(manifest, getStatus, courseCode, module),
  }));
}

// --- Exam gaps ---------------------------------------------------------------
// Distinct unfinished exam-relevant topics that are direct prerequisites of
// remaining exam-relevant topics (manifest order). Provable "what still
// blocks exam topics" set; informational only, never locking.
export function getExamGaps(manifest, getStatus, limit = 12) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const remaining = getRemainingExamTopics(manifest, safe);
  const gapKeys = new Set();
  const gaps = [];
  const indexOf = new Map(manifestTopics(manifest).map((t, i) => [topicKey(t.courseCode, t.id), i]));
  for (const topic of remaining) {
    for (const pid of prereqIds(topic)) {
      const pre = getTopic(manifest, topic.courseCode, pid);
      if (!pre || !isExamRelevantTopic(pre)) continue;
      if (safe(pre.courseCode, pre.id) === STATUS_COMPLETED) continue;
      const key = topicKey(pre.courseCode, pre.id);
      if (gapKeys.has(key)) continue;
      gapKeys.add(key);
      gaps.push(pre);
    }
  }
  gaps.sort((a, b) => (indexOf.get(topicKey(a.courseCode, a.id)) ?? 0) - (indexOf.get(topicKey(b.courseCode, b.id)) ?? 0));
  return gaps.slice(0, Math.max(0, limit));
}

// --- Next exam topic ----------------------------------------------------------
// Exam focus is a filter over the canonical recommendation order, not a
// second engine: first unfinished exam-relevant topic in
// getRecommendedNextTopics order, falling back to the first remaining
// exam-relevant topic in manifest order (mirrors the intelligence-layer
// fallback). Null when no exam-relevant topic remains.
export function getNextExamTopic(manifest, getStatus) {
  const safe = (c, id) => readStatus(getStatus, c, id);
  const ordered = getRecommendedNextTopics(manifest, safe).filter(isExamRelevantTopic);
  if (ordered.length) return ordered[0];
  const remaining = getRemainingExamTopics(manifest, safe);
  return remaining.length ? remaining[0] : null;
}

// --- Per-topic exam model ------------------------------------------------------

export function explainExamContribution(manifest, getStatus, courseCode, topicId) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) {
    return {
      contributes: false,
      weight: 0,
      level: null,
      message: 'Unknown topic — does not change exam readiness.',
    };
  }
  const level = Object.prototype.hasOwnProperty.call(EXAM_WEIGHTS, topic.examRelevance)
    ? topic.examRelevance
    : null;
  const weight = weightForTopic(topic);
  if (!level) {
    return {
      contributes: false,
      weight: 0,
      level: null,
      message: 'No recorded exam relevance — does not change exam readiness.',
    };
  }
  const status = readStatus(getStatus, courseCode, topicId);
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  const suffix = 'Completion tracks coverage only, not a guarantee of exam success.';
  if (status === STATUS_COMPLETED) {
    return {
      contributes: true,
      weight,
      level,
      message: `${label} exam relevance (weight ${weight}) — completed; counted in readiness. ${suffix}`,
    };
  }
  if (status === STATUS_IN_PROGRESS) {
    return {
      contributes: false,
      weight,
      level,
      message: `${label} exam relevance (weight ${weight}) — in progress; completing it adds ${weight} to earned weight. ${suffix}`,
    };
  }
  return {
    contributes: false,
    weight,
    level,
    message: `${label} exam relevance (weight ${weight}) — remaining; completing it adds ${weight} to earned weight. ${suffix}`,
  };
}

export function buildTopicExamModel(manifest, getStatus, courseCode, topicId) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) return null;
  const safe = (c, id) => readStatus(getStatus, c, id);
  const status = safe(courseCode, topicId);
  const explanation = explainExamContribution(manifest, getStatus, courseCode, topicId);
  const remainingExamPrereqs = getPrerequisites(manifest, courseCode, topicId)
    .filter(isExamRelevantTopic)
    .filter((t) => safe(t.courseCode, t.id) !== STATUS_COMPLETED);
  return {
    courseCode: topic.courseCode,
    id: topic.id,
    title: topic.title,
    examRelevance: explanation.level,
    weight: explanation.weight,
    isExamRelevant: isExamRelevantTopic(topic),
    status,
    contributes: explanation.contributes,
    explanation: explanation.message,
    remainingExamPrereqs,
    remainingExamPrereqCount: remainingExamPrereqs.length,
  };
}

// --- Exam filter (preserves input order) ---------------------------------------

export function filterTopicsByExam(manifest, getStatus, topicList, examFilter = 'all') {
  const filter = normalizeExamFilter(examFilter);
  const list = Array.isArray(topicList) ? topicList : [];
  if (filter === 'all') return [...list];
  const safe = (c, id) => readStatus(getStatus, c, id);
  if (filter === 'exam_relevant') return list.filter(isExamRelevantTopic);
  if (filter === 'exam_completed') {
    return list.filter((t) => isExamRelevantTopic(t) && safe(t.courseCode, t.id) === STATUS_COMPLETED);
  }
  return list.filter((t) => isExamRelevantTopic(t) && safe(t.courseCode, t.id) !== STATUS_COMPLETED);
}

// --- Descriptive assessment evidence (diagnostics only) ----------------------
// The weighted readiness calculation above is unchanged: high = 3,
// medium = 2, low = 1, unknown = 0. Assessment evidence never alters the
// readiness percentage; it only describes, among exam-relevant topics with
// questions, how many were attempted, passed, need review, or were not
// assessed. Uncovered exam topics (no questions) are listed as not assessed
// — never implied to be assessed. Never throws; malformed banks or stores
// degrade to zeroed diagnostics.
export function getExamAssessmentEvidence(bank, manifest, store) {
  const topics = manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
  const examTopics = topics.filter(isExamRelevantTopic);
  const bankByTopic = new Map();
  const questions = bank && Array.isArray(bank.questions) ? bank.questions : [];
  for (const q of questions) {
    if (!q || typeof q.courseCode !== 'string' || typeof q.topicId !== 'string') continue;
    bankByTopic.set(`${q.courseCode}/${q.topicId}`, true);
  }
  const covered = examTopics.filter((t) => bankByTopic.has(`${t.courseCode}/${t.id}`));
  const uncovered = examTopics.filter((t) => !bankByTopic.has(`${t.courseCode}/${t.id}`));
  let attempted = 0;
  let passed = 0;
  let needsReview = 0;
  const attemptedList = [];
  const passedList = [];
  const needsReviewList = [];
  const coveredNotAttemptedList = [];
  try {
    // Reuse the canonical assessment state without duplicating its logic.
    // Dynamic import is avoided for static-first bundling; the lookup below
    // mirrors getTopicAssessmentState over recorded attempts only.
    const attempts = store && Array.isArray(store.attempts) ? store.attempts : [];
    const byTopic = new Map();
    const questionById = new Map(questions.map((q) => [q && q.id, q]));
    for (const a of attempts) {
      if (!a || typeof a !== 'object') continue;
      const keys = new Set();
      if (Array.isArray(a.topics)) {
        for (const t of a.topics) {
          if (t && typeof t.courseCode === 'string' && typeof t.id === 'string') keys.add(`${t.courseCode}/${t.id}`);
        }
      }
      if (Array.isArray(a.questionIds)) {
        for (const qid of a.questionIds) {
          const q = questionById.get(qid);
          if (q && typeof q.courseCode === 'string' && typeof q.topicId === 'string') keys.add(`${q.courseCode}/${q.topicId}`);
        }
      }
      if (a.scope && typeof a.scope.courseCode === 'string' && typeof a.scope.topicId === 'string' && a.scope.topicId) {
        keys.add(`${a.scope.courseCode}/${a.scope.topicId}`);
      }
      for (const key of keys) {
        if (!byTopic.has(key)) byTopic.set(key, []);
        byTopic.get(key).push(a);
      }
    }
    for (const t of covered) {
      const key = `${t.courseCode}/${t.id}`;
      const related = (byTopic.get(key) || []).slice().sort((a, b) => b.submittedAt - a.submittedAt);
      if (!related.length) {
        coveredNotAttemptedList.push({ courseCode: t.courseCode, id: t.id });
        continue;
      }
      const latest = related[0];
      attempted += 1;
      attemptedList.push({ courseCode: t.courseCode, id: t.id });
      if (latest.state === 'passed') {
        passed += 1;
        passedList.push({ courseCode: t.courseCode, id: t.id });
      } else if (latest.state === 'needs_review') {
        needsReview += 1;
        needsReviewList.push({ courseCode: t.courseCode, id: t.id });
      }
    }
  } catch {
    // degrade to zeroed attempt counts; coverage above still holds
  }
  const notAssessed = examTopics.length - attempted;
  return {
    totalExamTopics: examTopics.length,
    coveredExamTopics: covered.length,
    uncoveredExamTopics: uncovered.length,
    attempted,
    passed,
    needsReview,
    coveredNotAttempted: coveredNotAttemptedList.length,
    notAssessed,
    attemptedList,
    passedList,
    needsReviewList,
    coveredNotAttemptedList,
    uncoveredList: uncovered.map((t) => ({ courseCode: t.courseCode, id: t.id })),
  };
}
