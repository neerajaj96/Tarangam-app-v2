/**
 * Tarangam canonical Assessment & Knowledge Verification Layer (browser +
 * Node, no dependencies).
 *
 * Pure, deterministic self-assessment over the existing topic manifest.
 * Questions live in data/assessments.json (never generated, never in
 * Markdown); every question references an existing course/topic. No DOM,
 * no storage, no fetch, no AI/LLMs, no semantic grading, no backend, no
 * gamification, no artificial mastery scores, no recommendation engine.
 * Nothing here locks or gates the learner; assessment only informs.
 *
 * Conventions (stable contract):
 * - A bank is `{ version, questions: [...] }` in author order; every
 *   listing preserves that order (no random selection).
 * - Question types: "multiple_choice" (options required), "true_false"
 *   (boolean answer), "short_answer" (exact match after normalization).
 *   Short answers may carry optional "acceptedAnswers" (non-empty string
 *   array); evaluation matches the normalized answer OR any normalized
 *   variant, and validation requires the primary answer to be listed when
 *   both are present. Other types must not carry "acceptedAnswers".
 * - Pass threshold is centralized: PASS_THRESHOLD = 70. Submitted
 *   sessions at/above 70% are "passed", below are "needs_review".
 *   Attempt states: "not_attempted" | "attempted" | "passed" |
 *   "needs_review" — descriptive only, never a mastery score.
 * - Evaluation is exact: MCQ compares option identity (===), true/false
 *   compares normalized booleans, short answers compare after trim +
 *   lowercase + whitespace-collapse. No semantic similarity, ever.
 * - Coverage APIs are pure counts only (total questions, covered/
 *   uncovered topics, per-course/per-module breakdowns, single vs multi,
 *   exam-relevant covered/uncovered, type distribution). No quality
 *   scores, ever. Uncovered topics are listed explicitly and never
 *   implied to be assessed.
 * - Attempts persist under ASSESSMENT_STORAGE_KEY ({ version, attempts })
 *   holding only identifiers, answers, results, and timestamps — never a
 *   copy of learner progress. Malformed data parses to an empty store.
 * - `now` is always injected (default Date.now()) so tests never depend
 *   on the real clock.
 */

import { getTopic } from './topic-intelligence.js';

export const ASSESSMENT_VERSION = 1;
export const ASSESSMENT_STORAGE_KEY = 'tarangam_assessments_v1';
export const PASS_THRESHOLD = 70;

export const QUESTION_TYPE_MCQ = 'multiple_choice';
export const QUESTION_TYPE_TF = 'true_false';
export const QUESTION_TYPE_SHORT = 'short_answer';
export const QUESTION_TYPES = [QUESTION_TYPE_MCQ, QUESTION_TYPE_TF, QUESTION_TYPE_SHORT];

// Allowed difficulty metadata for bank questions (mirrors topic metadata).
export const ASSESSMENT_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export const ASSESSMENT_STATE_NOT_ATTEMPTED = 'not_attempted';
export const ASSESSMENT_STATE_ATTEMPTED = 'attempted';
export const ASSESSMENT_STATE_PASSED = 'passed';
export const ASSESSMENT_STATE_NEEDS_REVIEW = 'needs_review';

export const ASSESSMENT_FILTERS = ['all', 'available', 'attempted', 'passed', 'needs_review'];

// Exam-relevant question levels, aligned with assets/exam-readiness.js
// (high/medium/low carry weight there; all three count as exam-relevant).
export const EXAM_ASSESSMENT_LEVELS = ['high', 'medium', 'low'];

export const ASSESSMENT_CANDIDATES = [
  'data/assessments.json',
  'dist/data/assessments.json',
  '/data/assessments.json',
];

export const ASSESSMENT_LOAD_ERROR = 'ASSESSMENT_LOAD_ERROR';

export function assessmentLoadError(message, cause) {
  const err = new Error(message);
  err.code = ASSESSMENT_LOAD_ERROR;
  if (cause !== undefined) err.cause = cause;
  return err;
}

let cachedBank = null;
let cachedBankUrl = null;
let cachedBankPromise = null;

export function clearAssessmentBankCache() {
  cachedBank = null;
  cachedBankUrl = null;
  cachedBankPromise = null;
}

function resolveFetch(fetchImpl) {
  if (fetchImpl) return fetchImpl;
  const g = globalThis.fetch;
  if (typeof g !== 'function') {
    throw assessmentLoadError('No fetch implementation available in this environment.');
  }
  return g.bind(globalThis);
}

function candidateUrls(baseHref) {
  const urls = [];
  const seen = new Set();
  const push = (u) => {
    if (!seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  };
  for (const c of ASSESSMENT_CANDIDATES) {
    try {
      if (c.startsWith('/') && baseHref && !/^https?:/i.test(baseHref)) continue;
      push(new URL(c, baseHref || undefined).href);
    } catch {
      push(c);
    }
  }
  return urls;
}

function looksLikeBank(value) {
  return Boolean(value && typeof value === 'object' && Array.isArray(value.questions));
}

// Load (and cache) the question bank, trying each candidate location.
// Returns { bank, sourceUrl, cached }. Failures surface as controlled
// assessmentLoadErrors (never unhandled rejections).
export async function loadAssessmentBank(options = {}) {
  if (cachedBank) {
    return { bank: cachedBank, sourceUrl: cachedBankUrl, cached: true };
  }
  if (cachedBankPromise) return cachedBankPromise;
  cachedBankPromise = (async () => {
    const fetchImpl = resolveFetch(options.fetchImpl);
    const urls = options.candidates || candidateUrls(options.baseHref || (typeof document !== 'undefined' && document.baseURI));
    const failures = [];
    for (const url of urls) {
      let response;
      try {
        response = await fetchImpl(url);
      } catch (e) {
        failures.push(`${url} (${e && e.message ? e.message : e})`);
        continue;
      }
      if (!response || !response.ok) {
        failures.push(`${url} (HTTP ${response ? response.status : 'no response'})`);
        continue;
      }
      let json;
      try {
        json = await response.json();
      } catch (e) {
        failures.push(`${url} (invalid JSON: ${e && e.message ? e.message : e})`);
        continue;
      }
      if (!looksLikeBank(json)) {
        failures.push(`${url} (not an assessment bank: missing "questions" array)`);
        continue;
      }
      cachedBank = json;
      try {
        cachedBankUrl = new URL('.', url).href;
      } catch {
        cachedBankUrl = null;
      }
      return { bank: cachedBank, sourceUrl: url, cached: false };
    }
    throw assessmentLoadError(
      `Could not load the assessment bank from any known location: ${failures.join('; ') || 'no candidates'}.`
    );
  })();
  try {
    return await cachedBankPromise;
  } catch (e) {
    cachedBankPromise = null;
    throw e;
  }
}

// --- Bank guards ------------------------------------------------------------

function bankQuestions(bank) {
  return bank && Array.isArray(bank.questions) ? bank.questions : [];
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Validate one question object. Returns error strings (empty = valid).
// Never throws on malformed input.
export function validateQuestion(question, index) {
  const errors = [];
  const label = question && typeof question.id === 'string' && question.id
    ? `question "${question.id}"`
    : `question at index ${index}`;
  if (!question || typeof question !== 'object' || Array.isArray(question)) {
    return [`${label}: must be an object`];
  }
  for (const field of ['id', 'courseCode', 'topicId', 'type', 'question', 'answer', 'explanation', 'difficulty', 'examRelevance']) {
    if (question[field] === undefined || question[field] === null) {
      errors.push(`${label}: missing required field "${field}"`);
    }
  }
  if (question.id !== undefined && !isNonEmptyString(question.id)) {
    errors.push(`${label}: "id" must be a non-empty string`);
  }
  if (question.courseCode !== undefined && !isNonEmptyString(question.courseCode)) {
    errors.push(`${label}: "courseCode" must be a non-empty string`);
  }
  if (question.topicId !== undefined && !isNonEmptyString(question.topicId)) {
    errors.push(`${label}: "topicId" must be a non-empty string`);
  }
  if (!QUESTION_TYPES.includes(question.type)) {
    errors.push(`${label}: invalid type "${question.type}" — expected one of ${QUESTION_TYPES.join(', ')}`);
  }
  if (question.question !== undefined && !isNonEmptyString(question.question)) {
    errors.push(`${label}: "question" must be a non-empty string`);
  }
  if (question.explanation !== undefined && !isNonEmptyString(question.explanation)) {
    errors.push(`${label}: "explanation" must be a non-empty string`);
  }
  if (question.difficulty !== undefined && !ASSESSMENT_DIFFICULTIES.includes(question.difficulty)) {
    errors.push(`${label}: invalid difficulty "${question.difficulty}" — expected one of ${ASSESSMENT_DIFFICULTIES.join(', ')} (malformed metadata)`);
  }
  if (question.examRelevance !== undefined && !EXAM_ASSESSMENT_LEVELS.includes(question.examRelevance)) {
    errors.push(`${label}: invalid examRelevance "${question.examRelevance}" — expected one of ${EXAM_ASSESSMENT_LEVELS.join(', ')} (malformed metadata)`);
  }
  if (question.type === QUESTION_TYPE_MCQ) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push(`${label}: multiple_choice needs "options" with at least 2 entries`);
    } else {
      if (!question.options.every((o) => typeof o === 'string')) {
        errors.push(`${label}: "options" must all be strings`);
      }
      if (question.options.some((o) => typeof o !== 'string' || !o.trim())) {
        errors.push(`${label}: "options" must all be non-empty strings (empty option)`);
      }
      if (new Set(question.options).size !== question.options.length) {
        errors.push(`${label}: "options" must be unique (duplicate MCQ options)`);
      }
      if (!question.options.includes(question.answer)) {
        errors.push(`${label}: correct answer must belong to "options" (invalid answer ref)`);
      }
    }
    if (question.acceptedAnswers !== undefined) {
      errors.push(`${label}: multiple_choice must not carry "acceptedAnswers" (only short_answer may)`);
    }
  }
  if (question.type === QUESTION_TYPE_TF && typeof question.answer !== 'boolean') {
    errors.push(`${label}: true_false "answer" must be a boolean (invalid answer ref)`);
  }
  if (question.type === QUESTION_TYPE_TF && question.acceptedAnswers !== undefined) {
    errors.push(`${label}: true_false must not carry "acceptedAnswers" (only short_answer may)`);
  }
  if (question.type === QUESTION_TYPE_SHORT) {
    if (typeof question.answer !== 'string' || !question.answer.trim()) {
      errors.push(`${label}: short_answer "answer" must be a non-empty string (invalid answer ref)`);
    }
    if (question.options !== undefined) {
      errors.push(`${label}: short_answer must not carry "options"`);
    }
    if (question.acceptedAnswers !== undefined) {
      if (!Array.isArray(question.acceptedAnswers) || question.acceptedAnswers.length === 0) {
        errors.push(`${label}: short_answer "acceptedAnswers" must be a non-empty array when present`);
      } else {
        if (!question.acceptedAnswers.every((a) => typeof a === 'string' && a.trim().length > 0)) {
          errors.push(`${label}: short_answer "acceptedAnswers" must all be non-empty strings`);
        } else {
          const normalizedAccepted = question.acceptedAnswers.map((a) => normalizeShortAnswer(a));
          if (new Set(normalizedAccepted).size !== normalizedAccepted.length) {
            errors.push(`${label}: short_answer "acceptedAnswers" must be unique after normalization`);
          }
          if (typeof question.answer === 'string' && question.answer.trim()) {
            const normalizedAnswer = normalizeShortAnswer(question.answer);
            if (!normalizedAccepted.includes(normalizedAnswer)) {
              errors.push(`${label}: short_answer "answer" must be listed in "acceptedAnswers" when both are present`);
            }
          }
        }
      }
    }
  }
  return errors;
}

// Validate a whole bank against a manifest. Returns error strings
// (empty = valid): unique ids, duplicate question text within a topic,
// required fields, valid types, existing course/topic references, answer
// integrity, explanation presence, option integrity, acceptedAnswers
// integrity, malformed metadata. Never throws.
export function validateAssessmentBank(bank, manifest) {
  if (!bank || typeof bank !== 'object' || !Array.isArray(bank.questions)) {
    return ['assessment bank must be an object with a "questions" array'];
  }
  const errors = [];
  const seen = new Set();
  const textSeen = new Map();
  bank.questions.forEach((q, i) => {
    for (const e of validateQuestion(q, i)) errors.push(e);
    if (q && typeof q.id === 'string' && q.id) {
      if (seen.has(q.id)) errors.push(`duplicate question id "${q.id}"`);
      seen.add(q.id);
    }
    if (q && typeof q.courseCode === 'string' && typeof q.topicId === 'string' && manifest) {
      if (!getTopic(manifest, q.courseCode, q.topicId)) {
        errors.push(`question "${q.id || i}": orphan reference to unknown topic "${q.courseCode}/${q.topicId}"`);
      }
    }
    if (q && typeof q.question === 'string' && typeof q.courseCode === 'string' && typeof q.topicId === 'string') {
      const key = `${q.courseCode}/${q.topicId}::${normalizeShortAnswer(q.question)}`;
      if (q.question.trim()) {
        if (textSeen.has(key)) {
          errors.push(`duplicate question text in topic "${q.courseCode}/${q.topicId}": "${q.id || i}" duplicates "${textSeen.get(key)}"`);
        } else {
          textSeen.set(key, q.id || String(i));
        }
      }
    }
  });
  return errors;
}

// --- Question accessors (bank order preserved) --------------------------------

export function getQuestionsForTopic(bank, courseCode, topicId) {
  return bankQuestions(bank).filter((q) => q.courseCode === courseCode && q.topicId === topicId);
}

export function getQuestionsForModule(bank, manifest, courseCode, module) {
  const ids = new Set(
    (manifest && Array.isArray(manifest.topics) ? manifest.topics : [])
      .filter((t) => t.courseCode === courseCode && t.module === Number(module))
      .map((t) => t.id)
  );
  return bankQuestions(bank).filter((q) => q.courseCode === courseCode && ids.has(q.topicId));
}

export function getQuestionsForCourse(bank, courseCode) {
  return bankQuestions(bank).filter((q) => q.courseCode === courseCode);
}

export function isExamRelevantQuestion(question) {
  return Boolean(question && EXAM_ASSESSMENT_LEVELS.includes(question.examRelevance));
}

export function getExamRelevantQuestions(bank) {
  return bankQuestions(bank).filter(isExamRelevantQuestion);
}

// --- Coverage ------------------------------------------------------------------

// Deterministic bank coverage over the manifest (bank order for covered
// topics, manifest order for uncovered). Uncovered topics are listed
// explicitly — never pretended to be assessed.
export function getAssessmentCoverage(bank, manifest) {
  const topics = manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
  const coveredKeys = new Set();
  const covered = [];
  for (const q of bankQuestions(bank)) {
    if (!q || typeof q.courseCode !== 'string' || typeof q.topicId !== 'string') continue;
    if (manifest && !getTopic(manifest, q.courseCode, q.topicId)) continue;
    const key = `${q.courseCode}/${q.topicId}`;
    if (!coveredKeys.has(key)) {
      coveredKeys.add(key);
      covered.push({ courseCode: q.courseCode, id: q.topicId });
    }
  }
  const uncovered = topics
    .filter((t) => !coveredKeys.has(`${t.courseCode}/${t.id}`))
    .map((t) => ({ courseCode: t.courseCode, id: t.id }));
  return {
    totalQuestions: bankQuestions(bank).length,
    coveredTopics: covered,
    uncoveredTopics: uncovered,
    coveredCount: covered.length,
    totalTopics: topics.length,
  };
}

// --- Pure deterministic coverage breakdowns (counts only, no scores) --------
// Every function is pure, dependency-free apart from the manifest lookup,
// deterministic across runs, and never implies uncovered topics are
// assessed. Orderings: courses sorted by code, modules by (course, number),
// covered topics in bank order, uncovered in manifest order.

// Total questions in the bank (author order length, orphans included).
export function getAssessmentQuestionCount(bank) {
  return bankQuestions(bank).length;
}

// Topics with questions (bank order, deduplicated) and without (manifest order).
export function getCoveredTopics(bank, manifest) {
  return getAssessmentCoverage(bank, manifest).coveredTopics;
}

export function getUncoveredTopics(bank, manifest) {
  return getAssessmentCoverage(bank, manifest).uncoveredTopics;
}

// Questions per course, sorted by courseCode.
export function getQuestionsPerCourse(bank) {
  const counts = new Map();
  for (const q of bankQuestions(bank)) {
    if (!q || typeof q.courseCode !== 'string' || !q.courseCode.trim()) continue;
    counts.set(q.courseCode, (counts.get(q.courseCode) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([courseCode, questionCount]) => ({ courseCode, questionCount }));
}

// Covered vs total topics per course, sorted by courseCode. Manifest gives
// totals; the bank gives covered sets (orphans excluded when a manifest is
// supplied). Uncovered = total - covered, never negative.
export function getCoveredTopicsPerCourse(bank, manifest) {
  const topics = manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
  const totals = new Map();
  const names = new Map();
  for (const t of topics) {
    totals.set(t.courseCode, (totals.get(t.courseCode) || 0) + 1);
    if (!names.has(t.courseCode)) names.set(t.courseCode, t.courseName || t.courseCode);
  }
  const covered = new Map();
  for (const q of bankQuestions(bank)) {
    if (!q || typeof q.courseCode !== 'string' || typeof q.topicId !== 'string') continue;
    if (manifest && !getTopic(manifest, q.courseCode, q.topicId)) continue;
    if (!covered.has(q.courseCode)) covered.set(q.courseCode, new Set());
    covered.get(q.courseCode).add(q.topicId);
  }
  const codes = new Set([...totals.keys(), ...covered.keys()]);
  return [...codes].sort().map((courseCode) => {
    const coveredCount = covered.has(courseCode) ? covered.get(courseCode).size : 0;
    const totalTopics = totals.get(courseCode) || 0;
    return {
      courseCode,
      courseName: names.get(courseCode) || courseCode,
      coveredCount,
      totalTopics,
      uncoveredCount: Math.max(0, totalTopics - coveredCount),
    };
  });
}

// Questions per (course, module), sorted by (courseCode, module). Module
// resolution comes from the manifest (orphans excluded); without a manifest
// there is no module to attribute, so the result is empty. Every manifest
// module appears exactly once, even with zero questions.
export function getQuestionsPerModule(bank, manifest) {
  const topics = manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
  if (!topics.length) return [];
  const counts = new Map();
  const names = new Map();
  for (const t of topics) {
    const key = `${t.courseCode}/${t.module}`;
    if (!counts.has(key)) {
      counts.set(key, 0);
      names.set(key, t.moduleName || `Module ${t.module}`);
    }
  }
  for (const q of bankQuestions(bank)) {
    if (!q || typeof q.courseCode !== 'string' || typeof q.topicId !== 'string') continue;
    const topic = getTopic(manifest, q.courseCode, q.topicId);
    if (!topic) continue;
    const key = `${topic.courseCode}/${topic.module}`;
    counts.set(key, (counts.get(key) || 0) + 1);
    if (topic.moduleName) names.set(key, topic.moduleName);
  }
  const rows = [];
  for (const [key, questionCount] of counts.entries()) {
    const slash = key.lastIndexOf('/');
    const courseCode = key.slice(0, slash);
    const module = Number(key.slice(slash + 1));
    rows.push({ courseCode, module, moduleName: names.get(key) || `Module ${module}`, questionCount });
  }
  rows.sort((a, b) => a.courseCode.localeCompare(b.courseCode) || a.module - b.module);
  return rows;
}

// Question counts per covered topic (bank order, deduplicated).
export function getTopicQuestionCounts(bank, manifest) {
  const counts = new Map();
  const order = [];
  for (const q of bankQuestions(bank)) {
    if (!q || typeof q.courseCode !== 'string' || typeof q.topicId !== 'string') continue;
    if (manifest && !getTopic(manifest, q.courseCode, q.topicId)) continue;
    const key = `${q.courseCode}/${q.topicId}`;
    if (!counts.has(key)) {
      counts.set(key, 0);
      order.push({ courseCode: q.courseCode, id: q.topicId });
    }
    counts.set(key, counts.get(key) + 1);
  }
  return order.map(({ courseCode, id }) => ({
    courseCode,
    id,
    questionCount: counts.get(`${courseCode}/${id}`),
  }));
}

// Single-question topics (exactly 1) vs multi-question topics (>1).
export function getSingleQuestionTopics(bank, manifest) {
  return getTopicQuestionCounts(bank, manifest).filter((r) => r.questionCount === 1);
}

export function getMultiQuestionTopics(bank, manifest) {
  return getTopicQuestionCounts(bank, manifest).filter((r) => r.questionCount > 1);
}

// Exam-relevant coverage (pure, no attempts): which exam-relevant manifest
// topics have questions. Uncovered exam topics are listed explicitly — never
// claimed as assessed.
export function getExamQuestionCoverage(bank, manifest) {
  const topics = manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
  const examTopics = topics.filter((t) => EXAM_ASSESSMENT_LEVELS.includes(t.examRelevance));
  const coveredKeys = new Set();
  for (const q of bankQuestions(bank)) {
    if (!q || typeof q.courseCode !== 'string' || typeof q.topicId !== 'string') continue;
    if (manifest && !getTopic(manifest, q.courseCode, q.topicId)) continue;
    coveredKeys.add(`${q.courseCode}/${q.topicId}`);
  }
  const covered = examTopics
    .filter((t) => coveredKeys.has(`${t.courseCode}/${t.id}`))
    .map((t) => ({ courseCode: t.courseCode, id: t.id }));
  const uncovered = examTopics
    .filter((t) => !coveredKeys.has(`${t.courseCode}/${t.id}`))
    .map((t) => ({ courseCode: t.courseCode, id: t.id }));
  return {
    totalExamTopics: examTopics.length,
    coveredExamTopics: covered.length,
    uncoveredExamTopics: uncovered.length,
    covered,
    uncovered,
    coverage: examTopics.length ? Math.round((covered.length / examTopics.length) * 100) : 0,
  };
}

// Question-type distribution (counts only, no scores).
export function getQuestionTypeDistribution(bank) {
  const dist = { multiple_choice: 0, true_false: 0, short_answer: 0 };
  for (const q of bankQuestions(bank)) {
    if (q && Object.prototype.hasOwnProperty.call(dist, q.type)) dist[q.type] += 1;
  }
  return dist;
}

// --- Session engine (deterministic, no randomness) -------------------------------

function hashIds(ids) {
  let h = 5381;
  const s = ids.join('|');
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

function resolveNow(now) {
  return typeof now === 'number' && Number.isFinite(now) ? now : Date.now();
}

function scopeQuestions(bank, manifest, scope = {}) {
  const { type = 'topic', courseCode = null, topicId = null, module = null, examOnly = false, limit = null } = scope;
  let questions;
  if (type === 'topic') {
    questions = getQuestionsForTopic(bank, courseCode, topicId);
  } else if (type === 'module') {
    questions = getQuestionsForModule(bank, manifest, courseCode, module);
  } else if (type === 'course') {
    questions = getQuestionsForCourse(bank, courseCode);
  } else if (type === 'exam') {
    questions = getExamRelevantQuestions(bank);
    if (courseCode) questions = questions.filter((q) => q.courseCode === courseCode);
  } else {
    questions = [];
  }
  if (examOnly && type !== 'exam') questions = questions.filter(isExamRelevantQuestion);
  if (typeof limit === 'number' && Number.isFinite(limit) && limit >= 0) {
    questions = questions.slice(0, Math.floor(limit));
  }
  return questions;
}

// Create a session over a scope. Deterministic bank order, fixed limit,
// stable id derived from the question ids. Returns null for unknown
// scopes; empty scopes yield an answerable-but-empty session.
export function createAssessmentSession(bank, manifest, scope = {}, now) {
  const questions = scopeQuestions(bank, manifest, scope);
  const ids = questions.map((q) => q.id);
  return {
    id: `sess-${hashIds(ids.length ? ids : [JSON.stringify(scope)])}`,
    scope: { type: scope.type || 'topic', courseCode: scope.courseCode ?? null, topicId: scope.topicId ?? null, module: scope.module ?? null, examOnly: Boolean(scope.examOnly), limit: scope.limit ?? null },
    questionIds: ids,
    questions: questions.map((q) => ({ ...q })),
    currentIndex: 0,
    answers: {},
    submittedQuestions: {},
    submitted: false,
    submittedAt: null,
    createdAt: resolveNow(now),
  };
}

export function getSessionQuestion(session, index) {
  if (!session || !Array.isArray(session.questions)) return null;
  const i = index === undefined ? session.currentIndex : index;
  return session.questions[i] ?? null;
}

// Record an answer (pure: returns a new session object). Unknown question
// ids leave the session unchanged. Never throws.
export function answerQuestion(session, questionId, answer) {
  if (!session || !Array.isArray(session.questionIds) || !session.questionIds.includes(questionId)) {
    return session;
  }
  return {
    ...session,
    questions: session.questions,
    answers: { ...session.answers, [questionId]: answer },
  };
}

// Mark one question submitted (pure). Unknown ids leave it unchanged.
export function submitQuestionAnswer(session, questionId) {
  if (!session || !Array.isArray(session.questionIds) || !session.questionIds.includes(questionId)) {
    return session;
  }
  return {
    ...session,
    questions: session.questions,
    answers: { ...session.answers },
    submittedQuestions: { ...session.submittedQuestions, [questionId]: true },
  };
}

// --- Evaluation (exact only — never semantic) ---------------------------------------

export function normalizeShortAnswer(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  if (typeof value === 'string') {
    const t = value.trim().toLowerCase();
    if (t === 'true' || t === 't' || t === 'yes' || t === 'y') return true;
    if (t === 'false' || t === 'f' || t === 'no' || t === 'n') return false;
  }
  return null;
}

// Normalized acceptable answers for a short-answer question: the primary
// answer plus any acceptedAnswers, deduplicated after normalization.
// Non-short questions yield []. Never throws.
export function getShortAnswerVariants(question) {
  if (!question || question.type !== QUESTION_TYPE_SHORT) return [];
  const seen = new Set();
  const out = [];
  const push = (value) => {
    if (typeof value !== 'string') return;
    const normalized = normalizeShortAnswer(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    out.push(normalized);
  };
  push(question.answer);
  if (Array.isArray(question.acceptedAnswers)) {
    for (const variant of question.acceptedAnswers) push(variant);
  }
  return out;
}

// Evaluate one answer. Returns { correct, expected, received }.
// Unanswerable input (undefined/null/'' for short text) counts incorrect.
// Short answers match (after normalization) the primary answer OR any
// acceptedAnswers variant — exact only, never semantic.
export function evaluateAnswer(question, answer) {
  if (!question || !QUESTION_TYPES.includes(question.type)) {
    return { correct: false, expected: null, received: answer ?? null };
  }
  if (question.type === QUESTION_TYPE_MCQ) {
    return { correct: answer === question.answer, expected: question.answer, received: answer ?? null };
  }
  if (question.type === QUESTION_TYPE_TF) {
    const normalized = normalizeBoolean(answer);
    return {
      correct: normalized !== null && normalized === question.answer,
      expected: question.answer,
      received: normalized,
    };
  }
  const received = normalizeShortAnswer(answer);
  const expected = normalizeShortAnswer(question.answer);
  const variants = new Set(getShortAnswerVariants(question));
  if (!variants.size) variants.add(expected);
  return { correct: received.length > 0 && variants.has(received), expected, received };
}

// --- Scoring --------------------------------------------------------------------------

export function scoreSession(session) {
  const questions = session && Array.isArray(session.questions) ? session.questions : [];
  const answers = (session && session.answers && typeof session.answers === 'object') ? session.answers : {};
  let correct = 0;
  let answered = 0;
  const perQuestion = {};
  for (const q of questions) {
    const has = Object.prototype.hasOwnProperty.call(answers, q.id)
      && answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
    if (!has) {
      perQuestion[q.id] = { answered: false, correct: false };
      continue;
    }
    answered += 1;
    const result = evaluateAnswer(q, answers[q.id]);
    perQuestion[q.id] = { answered: true, correct: result.correct };
    if (result.correct) correct += 1;
  }
  const total = questions.length;
  const incorrect = answered - correct;
  const unanswered = total - answered;
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  const state = percentage >= PASS_THRESHOLD ? ASSESSMENT_STATE_PASSED : ASSESSMENT_STATE_NEEDS_REVIEW;
  return { total, answered, correct, incorrect, unanswered, percentage, state, perQuestion };
}

export function getSessionState(session) {
  if (!session) return ASSESSMENT_STATE_NOT_ATTEMPTED;
  if (session.submitted) return scoreSession(session).state;
  const answers = session.answers && typeof session.answers === 'object' ? session.answers : {};
  const hasAny = Object.keys(answers).some((k) => answers[k] !== undefined && answers[k] !== null && answers[k] !== '');
  return hasAny ? ASSESSMENT_STATE_ATTEMPTED : ASSESSMENT_STATE_NOT_ATTEMPTED;
}

// Submit a whole session (pure): returns the submitted snapshot including
// its deterministic result. Empty sessions submit as needs_review at 0%.
export function submitSession(session, now) {
  if (!session) return session;
  const submittedAt = resolveNow(now);
  const result = scoreSession(session);
  return {
    ...session,
    questions: session.questions,
    answers: { ...session.answers },
    submittedQuestions: { ...session.submittedQuestions },
    submitted: true,
    submittedAt,
    result,
  };
}

// Topics represented in a session (bank order, deduplicated).
export function getSessionTopics(session) {
  if (!session || !Array.isArray(session.questions)) return [];
  const seen = new Set();
  const out = [];
  for (const q of session.questions) {
    const key = `${q.courseCode}/${q.topicId}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ courseCode: q.courseCode, id: q.topicId });
    }
  }
  return out;
}

// --- Attempts persistence (versioned, resilient) ------------------------------------------

export function emptyAttemptStore() {
  return { version: ASSESSMENT_VERSION, attempts: [] };
}

// Parse raw storage content into a store shape. Missing data, malformed
// JSON, wrong versions, and malformed entries all degrade to an empty (or
// filtered) store — never throw.
export function parseAttemptStore(raw) {
  if (raw === undefined || raw === null) return emptyAttemptStore();
  let parsed = raw;
  if (typeof raw === 'string') {
    if (!raw) return emptyAttemptStore();
    try {
      parsed = JSON.parse(raw);
    } catch {
      return emptyAttemptStore();
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptyAttemptStore();
  if (parsed.version !== ASSESSMENT_VERSION) return emptyAttemptStore();
  if (!Array.isArray(parsed.attempts)) return emptyAttemptStore();
  const attempts = parsed.attempts.filter((a) =>
    a && typeof a === 'object' && !Array.isArray(a)
    && typeof a.id === 'string' && typeof a.submittedAt === 'number' && Number.isFinite(a.submittedAt)
    && typeof a.total === 'number' && typeof a.correct === 'number'
    && typeof a.percentage === 'number' && typeof a.state === 'string'
    && a.questionIds !== undefined
  );
  return { version: ASSESSMENT_VERSION, attempts };
}

export function serializeAttemptStore(store) {
  const clean = store && typeof store === 'object' && Array.isArray(store.attempts)
    ? { version: ASSESSMENT_VERSION, attempts: store.attempts }
    : emptyAttemptStore();
  return JSON.stringify(clean);
}

// Record a submitted session snapshot as an attempt (pure: returns a new
// store). Only submitted snapshots are recorded; anything else returns the
// store unchanged. The optional bank lets the attempt carry its covered
// topics explicitly, so later lookups never depend on question-id shapes.
export function recordAttempt(store, submittedSession, bank) {
  const base = store && typeof store === 'object' && Array.isArray(store.attempts)
    ? { version: ASSESSMENT_VERSION, attempts: [...store.attempts] }
    : emptyAttemptStore();
  if (!submittedSession || submittedSession.submitted !== true) return base;
  const result = submittedSession.result && typeof submittedSession.result === 'object'
    ? submittedSession.result
    : scoreSession(submittedSession);
  const byId = new Map(bankQuestions(bank).map((q) => [q.id, q]));
  const seen = new Set();
  const topics = [];
  for (const qid of Array.isArray(submittedSession.questionIds) ? submittedSession.questionIds : []) {
    const q = byId.get(qid);
    const key = q ? `${q.courseCode}/${q.topicId}` : null;
    if (key && !seen.has(key)) {
      seen.add(key);
      topics.push({ courseCode: q.courseCode, id: q.topicId });
    }
  }
  const attempt = {
    id: `att-${base.attempts.length + 1}-${submittedSession.submittedAt}`,
    sessionId: submittedSession.id ?? null,
    scope: submittedSession.scope ?? null,
    questionIds: Array.isArray(submittedSession.questionIds) ? [...submittedSession.questionIds] : [],
    topics,
    answers: { ...(submittedSession.answers || {}) },
    correct: result.correct,
    total: result.total,
    percentage: result.percentage,
    state: result.state,
    submittedAt: submittedSession.submittedAt,
  };
  base.attempts.push(attempt);
  return base;
}

function attemptsForTopic(bank, store, courseCode, topicId) {
  if (!store || !Array.isArray(store.attempts)) return [];
  const byId = new Map(bankQuestions(bank).map((q) => [q.id, q]));
  return store.attempts.filter((a) => {
    if (Array.isArray(a.topics) && a.topics.some((t) => t.courseCode === courseCode && t.id === topicId)) {
      return true;
    }
    const ids = Array.isArray(a.questionIds) ? a.questionIds : [];
    if (ids.some((qid) => {
      const q = byId.get(qid);
      return Boolean(q && q.courseCode === courseCode && q.topicId === topicId);
    })) {
      return true;
    }
    return Boolean(a.scope && a.scope.courseCode === courseCode && a.scope.topicId === topicId);
  });
}

// Derive topic-level assessment state from recorded attempts. Complements
// (never replaces) learner completion state. passed/needsReview reflect
// the latest attempt; unknown topics report not_attempted.
export function getTopicAssessmentState(bank, store, courseCode, topicId) {
  const questions = getQuestionsForTopic(bank, courseCode, topicId);
  const available = questions.length > 0;
  const attempts = attemptsForTopic(bank, store, courseCode, topicId)
    .slice()
    .sort((a, b) => b.submittedAt - a.submittedAt);
  if (!attempts.length) {
    return {
      available,
      questionCount: questions.length,
      attempted: false,
      attempts: 0,
      latestScore: null,
      bestScore: null,
      passed: false,
      needsReview: false,
      lastTimestamp: null,
      state: ASSESSMENT_STATE_NOT_ATTEMPTED,
    };
  }
  const latest = attempts[0];
  const best = attempts.reduce((m, a) => Math.max(m, a.percentage), 0);
  return {
    available,
    questionCount: questions.length,
    attempted: true,
    attempts: attempts.length,
    latestScore: latest.percentage,
    bestScore: best,
    passed: latest.state === ASSESSMENT_STATE_PASSED,
    needsReview: latest.state === ASSESSMENT_STATE_NEEDS_REVIEW,
    lastTimestamp: latest.submittedAt,
    state: latest.state,
  };
}

// --- Revision integration (additional reason only) -------------------------------------------
// Topics whose latest attempt needs review, in manifest order. This never
// alters the 7-day / 14-day timestamp schedule — it only names topics
// where assessment gives one more reason to revise.
export function getAssessmentReviewTopics(bank, manifest, store) {
  const topics = manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
  const out = [];
  for (const t of topics) {
    const state = getTopicAssessmentState(bank, store, t.courseCode, t.id);
    if (!state.attempted || !state.needsReview) continue;
    out.push({
      courseCode: t.courseCode,
      id: t.id,
      title: t.title,
      latestScore: state.latestScore,
      reason: `Latest assessment ${state.latestScore}% needs review (threshold ${PASS_THRESHOLD}%).`,
    });
  }
  return out;
}

export function isAssessmentReviewDue(bank, store, courseCode, topicId) {
  return getTopicAssessmentState(bank, store, courseCode, topicId).needsReview;
}

// --- Exam-readiness integration (alongside only) ------------------------------------------------
// Assessment counts next to (never inside) the existing weighted exam
// readiness: attempted/passed/needs-review among covered exam-relevant
// topics, plus coverage. The weighting system is untouched.
export function getExamAssessmentStats(bank, manifest, store) {
  const topics = manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
  const examTopics = topics.filter((t) => EXAM_ASSESSMENT_LEVELS.includes(t.examRelevance));
  const bankByTopic = new Map();
  for (const q of bankQuestions(bank)) {
    if (!q || typeof q.courseCode !== 'string' || typeof q.topicId !== 'string') continue;
    bankByTopic.set(`${q.courseCode}/${q.topicId}`, true);
  }
  const covered = examTopics.filter((t) => bankByTopic.has(`${t.courseCode}/${t.id}`));
  let attempted = 0;
  let passed = 0;
  let needsReview = 0;
  for (const t of covered) {
    const state = getTopicAssessmentState(bank, store, t.courseCode, t.id);
    if (!state.attempted) continue;
    attempted += 1;
    if (state.passed) passed += 1;
    if (state.needsReview) needsReview += 1;
  }
  return {
    totalExamTopics: examTopics.length,
    coveredExamTopics: covered.length,
    attempted,
    passed,
    needsReview,
    coverage: examTopics.length ? Math.round((covered.length / examTopics.length) * 100) : 0,
  };
}

// --- Journey integration (observational only) ------------------------------------------------------
// Summary for the Learning Journey model: status counts, coverage, topics
// needing a first assessment, topics needing assessment-based review.
// Never recommends — surfaces only.
export function buildAssessmentSummary(bank, manifest, store) {
  const coverage = getAssessmentCoverage(bank, manifest);
  const topics = manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
  let attempted = 0;
  let passed = 0;
  let needsReview = 0;
  const needsAssessment = [];
  const needsAssessmentReview = [];
  for (const t of coverage.coveredTopics) {
    const state = getTopicAssessmentState(bank, store, t.courseCode, t.id);
    if (!state.attempted) {
      needsAssessment.push({ courseCode: t.courseCode, id: t.id });
      continue;
    }
    attempted += 1;
    if (state.passed) passed += 1;
    if (state.needsReview) {
      needsReview += 1;
      needsAssessmentReview.push({ courseCode: t.courseCode, id: t.id, latestScore: state.latestScore });
    }
  }
  void topics;
  const recent = Array.isArray(store?.attempts) && store.attempts.length
    ? store.attempts.slice().sort((a, b) => b.submittedAt - a.submittedAt)[0]
    : null;
  return {
    totalQuestions: coverage.totalQuestions,
    coveredCount: coverage.coveredCount,
    totalTopics: coverage.totalTopics,
    uncoveredCount: coverage.uncoveredTopics.length,
    attempted,
    passed,
    needsReview,
    needsAssessment,
    needsAssessmentReview,
    recentAttempt: recent
      ? { id: recent.id, percentage: recent.percentage, state: recent.state, submittedAt: recent.submittedAt }
      : null,
  };
}

// --- Assessment-aware topic filter (preserves input order) ---------------------------------------------

export function normalizeAssessmentFilter(value) {
  return ASSESSMENT_FILTERS.includes(value) ? value : 'all';
}

export function filterTopicsByAssessment(bank, store, topicList, assessmentFilter = 'all') {
  const filter = normalizeAssessmentFilter(assessmentFilter);
  const list = Array.isArray(topicList) ? topicList : [];
  if (filter === 'all') return [...list];
  return list.filter((t) => {
    const state = getTopicAssessmentState(bank, store, t.courseCode, t.id);
    if (filter === 'available') return state.available;
    if (filter === 'attempted') return state.attempted;
    if (filter === 'passed') return state.passed;
    return state.needsReview;
  });
}
