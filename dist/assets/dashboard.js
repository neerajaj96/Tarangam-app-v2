/**
 * Tarangam Learner Dashboard logic (browser ES module, no dependencies).
 *
 * Pure breakdown helpers (importable in Node for tests) plus the
 * browser UI: overall/course/module progress, Learning Analytics, Continue
 * Learning, Current Work, Ready to Learn, Recently Completed, completion
 * toggles, and explicit per-course reset. The unified Learning Journey
 * model (assets/learning-journey.js) over the canonical Topic Intelligence
 * Layer drives every recommendation — no second progress system, no
 * backend, no AI, no gamification.
 */
import * as Data from './curriculum-data.js';
import { createLearnerState } from './learner-state.js';
import {
  PROGRESS_CHANGED_EVENT,
  emitJourneyProgressChanged,
  onJourneyProgressChanged,
  buildDashboardModel,
  buildJourneyModel,
} from './learning-journey.js';
import {
  buildExamReadiness,
  buildCourseExamReadinessList,
  getExamAssessmentEvidence,
} from './exam-readiness.js';
import {
  buildRevisionModel,
  REVIEW_DUE_DAYS,
  buildAssessmentAwareRevisionModel,
  getAssessmentAwareReviewState,
  getAssessmentDrivenReviews,
} from './revision.js';
import {
  buildAttentionModel,
  explainAttention,
} from './weak-topic-analysis.js';
import { buildLearningAnalytics, getModuleAnalyticsList } from './learning-analytics.js';
import {
  buildStudyPlan,
  loadPlanConfig,
  savePlanConfig,
  clearPlanConfig,
  PLAN_TARGET_TYPES,
} from './study-planner.js';
import {
  loadAssessmentBank,
  clearAssessmentBankCache,
  parseAttemptStore,
  serializeAttemptStore,
  buildAssessmentSummary,
  getExamAssessmentStats,
  getAssessmentCoverage,
  getAssessmentQuestionCount,
  getQuestionsPerCourse,
  getCoveredTopicsPerCourse,
  getQuestionsPerModule,
  getQuestionTypeDistribution,
  getExamQuestionCoverage,
  ASSESSMENT_STORAGE_KEY,
} from './assessment.js';

export { PROGRESS_CHANGED_EVENT };

// Pure assessment derivation for tests and UI: bank + manifest + attempts
// store -> deterministic assessment summary plus pure coverage breakdowns
// (total questions, covered/total topics, uncovered count, exam-relevant
// coverage, per-course/per-module counts, type distribution) plus
// descriptive exam-relevant assessment evidence (attempted/passed/needs
// review/not assessed among exam topics — diagnostics only, never scores).
// No DOM, no storage of its own, no recommendations — surfaces only.
export function buildDashboardAssessmentModel(bank, manifest, attempts) {
  const summary = buildAssessmentSummary(bank, manifest, attempts);
  const coverage = getAssessmentCoverage(bank, manifest);
  const examCoverage = getExamQuestionCoverage(bank, manifest);
  let examEvidence = null;
  try {
    examEvidence = getExamAssessmentEvidence(bank, manifest, attempts);
  } catch {
    examEvidence = null;
  }
  return {
    ...summary,
    coverage,
    examCoverage,
    examEvidence,
    totalQuestions: getAssessmentQuestionCount(bank),
    coveredCount: coverage.coveredCount,
    totalTopics: coverage.totalTopics,
    uncoveredCount: coverage.uncoveredTopics.length,
    questionsPerCourse: getQuestionsPerCourse(bank),
    coveredPerCourse: getCoveredTopicsPerCourse(bank, manifest),
    questionsPerModule: getQuestionsPerModule(bank, manifest),
    typeDistribution: getQuestionTypeDistribution(bank),
  };
}

// Pure exam derivation for tests and UI: manifest + status reader ->
// deterministic exam-readiness snapshot (no DOM, no storage of its own).
export function buildDashboardExamModel(manifest, getStatus) {
  return buildExamReadiness(manifest, getStatus);
}

// Pure review derivation for tests and UI: manifest + status reader +
// timestamp reader + injected now -> deterministic revision snapshot.
// Only completed topics can enter review queues; without timestamps the
// queue stays empty (never fabricated). An optional fifth `assessment`
// argument (`{ bank, attempts }`) layers descriptive assessment evidence
// alongside the timestamp-only queue: completed topics whose latest attempt
// needs review become assessment-driven reviews without altering the
// 7/14-day schedule. Without a bank the model degrades to timestamp-only
// (never throws).
export function buildDashboardReviewModel(manifest, getStatus, getTimestamp = null, now, assessment = null) {
  const base = buildRevisionModel(manifest, getStatus, getTimestamp, now);
  const hasAssessment = assessment && typeof assessment === 'object' && assessment.bank;
  if (!hasAssessment) {
    return { ...base, assessmentDriven: [], assessmentDrivenCount: 0, assessment: null };
  }
  let aware = null;
  try {
    aware = buildAssessmentAwareRevisionModel(manifest, getStatus, getTimestamp, now, assessment);
  } catch {
    return { ...base, assessmentDriven: [], assessmentDrivenCount: 0, assessment: null };
  }
  return {
    ...base,
    assessmentAwareQueue: aware.reviewQueue,
    assessmentAwareCounts: aware.counts,
    assessmentDriven: aware.assessmentDriven,
    assessmentDrivenCount: aware.assessmentDriven.length,
    assessment: aware,
  };
}

// Pure assessment-aware review derivation: same inputs plus `{ bank,
// attempts }` -> full assessment-aware revision model (overdue > due >
// assessment-driven, then exam weight > dependents > manifest order).
// Never throws; malformed assessment degrades to the timestamp-only queue.
export function buildDashboardAssessmentReviewModel(manifest, getStatus, getTimestamp = null, now, assessment = null) {
  try {
    if (assessment && typeof assessment === 'object' && assessment.bank) {
      return buildAssessmentAwareRevisionModel(manifest, getStatus, getTimestamp, now, assessment);
    }
  } catch {
    // fall through to timestamp-only
  }
  const base = buildRevisionModel(manifest, getStatus, getTimestamp, now);
  return {
    ...base,
    assessmentDriven: [],
    counts: { ...base.counts, assessmentDriven: 0, assessmentNeedsReview: 0 },
  };
}

// Pure exam-assessment diagnostics for tests and UI: bank + manifest +
// attempts store -> descriptive exam-relevant assessment evidence
// (attempted/passed/needs review/not assessed). Diagnostics only — the
// weighted readiness percentage is never altered here.
export function buildDashboardExamAssessmentModel(bank, manifest, attempts) {
  try {
    return getExamAssessmentEvidence(bank, manifest, attempts);
  } catch {
    return {
      totalExamTopics: 0, coveredExamTopics: 0, uncoveredExamTopics: 0,
      attempted: 0, passed: 0, needsReview: 0, coveredNotAttempted: 0,
      notAssessed: 0, attemptedList: [], passedList: [],
      needsReviewList: [], coveredNotAttemptedList: [], uncoveredList: [],
    };
  }
}

// Pure attention derivation for tests and UI: manifest + status reader +
// timestamp reader + injected now + optional `{ bank, attempts }` ->
// deterministic attention snapshot (explicit reasons, never scores).
// Without a bank, assessment reasons degrade to absent (never fabricated).
export function buildDashboardAttentionModel(manifest, getStatus, getTimestamp = null, now, assessment = null) {
  return buildAttentionModel(manifest, getStatus, getTimestamp, now, assessment);
}

// Pure analytics derivation for tests and UI: manifest + status reader +
// timestamp reader + injected now -> descriptive analytics snapshot.
// Observational only: no recommendations, predictions, or scores.
export function buildDashboardAnalyticsModel(manifest, getStatus, getTimestamp = null, now) {
  return buildLearningAnalytics(manifest, getStatus, getTimestamp, now);
}

// Pure plan derivation for tests and UI: manifest + status reader +
// timestamp reader + explicit config + injected now -> deterministic plan.
// Without an explicit config there is no plan (never fabricated).
export function buildDashboardPlanModel(manifest, getStatus, getTimestamp = null, config = null, now) {
  return buildStudyPlan(manifest, getStatus, getTimestamp, config, now);
}

// Pure journey derivation for tests and UI: manifest + status reader +
// optional timestamp reader -> full dashboard model (recommended topic,
// reason, explanation, current work, ready, recently completed, progress).
// Preserves deterministic curriculum order; never fabricates timestamps.
export function buildDashboardJourneyModel(manifest, getStatus, getTimestamp = null) {
  return buildDashboardModel(manifest, getStatus, { getTimestamp });
}

export function buildJourneySnapshot(manifest, getStatus) {
  return buildJourneyModel(manifest, getStatus);
}

// --- Pure derivations (no DOM, no storage of their own). ---

// One row per course: { courseCode, courseName, total, completed,
// inProgress, notStarted, percent }. Legacy topics count equally.
export function buildCourseBreakdown(manifest, store) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const names = new Map();
  for (const t of manifest.topics) {
    if (!names.has(t.courseCode)) names.set(t.courseCode, t.courseName || t.courseCode);
  }
  return [...names.keys()].sort().map((code) => {
    const summary = store.getCourseProgress(code);
    return {
      courseCode: code,
      courseName: names.get(code),
      total: summary.total,
      completed: summary.completed,
      inProgress: summary.inProgress,
      notStarted: summary.notStarted,
      percent: summary.percent,
    };
  });
}

// One row per module of a course: { courseCode, module, moduleName,
// total, completed, inProgress, notStarted, percent }.
export function buildModuleBreakdown(manifest, store, courseCode) {
  if (!manifest || !Array.isArray(manifest.topics)) return [];
  const mods = new Map();
  for (const t of manifest.topics) {
    if (t.courseCode !== courseCode || mods.has(t.module)) continue;
    mods.set(t.module, t.moduleName || `Module ${t.module}`);
  }
  return [...mods.keys()].sort((a, b) => a - b).map((module) => {
    const summary = store.getModuleProgress(courseCode, module);
    return {
      courseCode, module, moduleName: mods.get(module),
      total: summary.total,
      completed: summary.completed,
      inProgress: summary.inProgress,
      notStarted: summary.notStarted,
      percent: summary.percent,
    };
  });
}

// --- Browser UI (guarded so Node can import the helpers). ---

const $ = (id) => document.getElementById(id);

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function topicHref(baseUrl, topic) {
  return Data.topicPageUrl(baseUrl, topic.courseCode, topic);
}

function explorerHref(topic) {
  return `explorer.html#${topic.courseCode}/${topic.id}`;
}

function statusChip(store, topic) {
  const s = store.getTopicState(topic.courseCode, topic.id).status;
  if (s === 'completed') return '<span class="badge xp-st-done">✓ Completed</span>';
  if (s === 'in_progress') return '<span class="badge badge-accent">… In progress</span>';
  return '<span class="badge xp-st-todo">○ Not started</span>';
}

function bar(percent) {
  return `<div class="progress-line"><div class="progress-fill" style="width:${percent}%"></div></div>`;
}

async function init() {
  let manifest = null;
  let baseUrl = '';
  let store = createLearnerState({});
  try {
    const loaded = await Data.loadManifest();
    manifest = loaded.manifest;
    baseUrl = loaded.baseUrl || '';
    store = createLearnerState({ manifest });
    $('db-error').hidden = true;
  } catch (e) {
    $('db-error').hidden = false;
    $('db-error-msg').textContent = (e && e.message) || String(e);
    return;
  }

  const statusReader = (courseCode, topicId) => store.getTopicState(courseCode, topicId).status;
  const timestampReader = (courseCode, topicId) => store.lastAccessed(courseCode, topicId);

  // Assessment bank + attempts ride along for the assessment section only.
  // Both load non-fatally: a missing bank/unreadable store renders an
  // explicit empty state, never fabricated numbers.
  let assessmentBank = null;
  const readAttempts = () => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(ASSESSMENT_STORAGE_KEY) : null;
      return parseAttemptStore(raw);
    } catch {
      return parseAttemptStore(null);
    }
  };
  loadAssessmentBank().then(
    ({ bank }) => { assessmentBank = bank; renderAssessment(); renderReview(); renderExam(); renderAttention(); },
    () => { assessmentBank = null; renderAssessment(); renderReview(); renderExam(); renderAttention(); }
  );

  const renderAll = () => {
    renderHero();
    renderAnalytics();
    renderContinue();
    renderExam();
    renderReview();
    renderAttention();
    renderPlan();
    renderAssessment();
    renderLists();
    renderCourses();
  };

  const toggleAndRerender = (courseCode, id) => {
    store.toggleTopicCompleted(courseCode, id);
    emitJourneyProgressChanged({ courseCode, topicId: id, source: 'dashboard' });
    renderAll();
  };

  // Cross-surface sync: progress AND assessment-result changes from topic
  // pages, study context, explorer, assessment page, or another dashboard
  // tab re-render without reload or polling. localStorage stays the source
  // of truth; the shared `tarangam:progress-changed` event only signals
  // re-read (no second event system).
  onJourneyProgressChanged(() => {
    renderAll();
  });
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (event) => {
      if (!event.key) return;
      if (event.key === 'tarangam_topic_state_v1' || event.key.startsWith('tarangam_visited_') || event.key === ASSESSMENT_STORAGE_KEY) {
        renderAll();
      }
    });
  }

  function renderHero() {
    const o = store.getOverallProgress();
    $('db-hero-pct').textContent = `${o.percent}%`;
    $('db-hero-counts').textContent =
      `${o.completed} completed · ${o.inProgress} in progress · ${o.notStarted} not started · ${o.total} total`;
    $('db-hero-bar').innerHTML = bar(o.percent);
  }

  function renderAnalytics() {
    const box = $('db-analytics');
    if (!box) return;
    const a = buildLearningAnalytics(manifest, statusReader, timestampReader, Date.now());
    const courseLines = a.courses.map((c) =>
      `<div class="db-module"><span>${esc(c.courseCode)} · ${esc(c.courseName)}</span>`
      + `<span class="db-course-nums">${c.completed} / ${c.total} · ${c.percent}% coverage</span></div>`
    ).join('');
    box.innerHTML = `<h2>Learning analytics</h2>
      <div class="xp-path-next"><span class="xp-path-title">${esc(a.summary)}</span></div>
      <div class="xp-path-row"><span class="xp-path-label">${a.totals.completed} completed · ${a.totals.inProgress} in progress · ${a.totals.notStarted} remaining · about ${a.studyTime.remainingMinutes} min left to cover</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Exam readiness ${a.examReadiness.readinessPercent}% · review due ${a.reviewDue} · overdue ${a.reviewOverdue}</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Where you stand: ${esc(a.activity.message)}</span></div>
      <div class="xp-path-row" style="flex-direction:column;align-items:stretch;"><span class="xp-path-label">Course coverage:</span>${courseLines}</div>`;
  }

  function topicRow(topic, withToggle) {
    const toggle = withToggle
      ? `<button class="xp-path-btn" data-complete="${esc(topic.courseCode)}/${esc(topic.id)}" type="button">${store.isTopicCompleted(topic.courseCode, topic.id) ? '✓ Done — undo' : 'Mark completed'}</button>`
      : '';
    return `<div class="xp-rel">
      <button class="xp-rel-btn" data-open="${esc(topic.courseCode)}/${esc(topic.id)}" type="button">${esc(topic.title)}</button>
      <span class="xp-path-meta">${esc(topic.courseCode)} · M${esc(topic.module)}</span>
      ${toggle}
      <a class="xp-open" href="${esc(topicHref(baseUrl, topic))}">↗</a>
    </div>`;
  }

  function wireRelButtons(root) {
    for (const btn of root.querySelectorAll('[data-open]')) {
      btn.addEventListener('click', () => {
        const [course, ...rest] = btn.getAttribute('data-open').split('/');
        window.location.href = explorerHref({ courseCode: course, id: rest.join('/') });
      });
    }
    for (const btn of root.querySelectorAll('[data-complete]')) {
      btn.addEventListener('click', () => {
        const [course, ...rest] = btn.getAttribute('data-complete').split('/');
        toggleAndRerender(course, rest.join('/'));
      });
    }
  }

  function renderContinue() {
    const box = $('db-continue');
    if (!box) return;
    const model = buildDashboardModel(manifest, statusReader, { getTimestamp: timestampReader });
    const next = model.recommended;
    const inProgress = model.inProgress;
    const ready = model.ready;
    let nextBlock;
    if (!next) {
      nextBlock = `<span class="xp-path-title">🎉 Curriculum complete — all ${esc(model.totalTopics)} topics done.</span>
        <span class="xp-path-meta">Explorer and all topic pages stay open — nothing is locked, progress is never auto-reset.</span>
        <a class="xp-open" href="./explorer.html">Browse the curriculum →</a>`;
    } else {
      const detail = model.recommendationDetail;
      const pre = detail.totalPrereqs > 0
        ? `<span class="xp-path-meta">prerequisites ${detail.completedPrereqs}/${detail.totalPrereqs} complete · ${detail.remainingDependencies} remaining ${detail.remainingDependencies === 1 ? 'dependency' : 'dependencies'} (never blocking)</span>`
        : '<span class="xp-path-meta">no prerequisites</span>';
      const time = detail.estimatedMinutes != null
        ? `<span class="xp-path-meta">⏱️ ${esc(detail.estimatedMinutes)} min</span>`
        : '';
      const startHint = model.isEmpty
        ? '<span class="xp-path-meta">New here? This deterministic starting point is first in curriculum order — no personalization yet.</span>'
        : '';
      nextBlock = `<span class="xp-path-title">${esc(next.title)}</span>
        <span class="xp-path-meta">${esc(next.courseCode)} · ${esc(next.courseName || '')} · M${esc(next.module)}</span>
        ${pre} ${time} ${statusChip(store, next)}
        <span class="xp-path-meta" data-journey-reason="${esc(model.recommendationReason || '')}">${esc(model.recommendationExplanation)}</span>
        ${startHint}
        <button class="xp-path-btn" data-goto-next="1" type="button">View in explorer</button>
        <a class="xp-open" href="${esc(topicHref(baseUrl, next))}">Open topic →</a>
        <button class="xp-path-btn" data-complete-next="1" type="button">${store.isTopicCompleted(next.courseCode, next.id) ? '✓ Done — undo' : 'Mark completed'}</button>`;
    }
    box.innerHTML = `<h2>Continue learning</h2>
      <div class="xp-path-next">${nextBlock}</div>
      <div class="xp-path-row"><span class="xp-path-label">In progress (${inProgress.length}):</span>
        ${inProgress.slice(0, 6).map((t) => `<button class="xp-path-btn" data-open="${esc(t.courseCode)}/${esc(t.id)}" type="button">${esc(t.title)}</button>`).join('') || '<span class="xp-path-label">none yet</span>'}
      </div>
      <div class="xp-path-row"><span class="xp-path-label">Ready to study (${ready.length}):</span>
        ${ready.slice(0, 6).map((t) => `<button class="xp-path-btn" data-open="${esc(t.courseCode)}/${esc(t.id)}" type="button">${esc(t.title)}</button>`).join('') || '<span class="xp-path-label">none — finish in-progress work or complete prerequisites</span>'}
      </div>`;
    const goNext = box.querySelector('[data-goto-next]');
    if (goNext && next) {
      goNext.addEventListener('click', () => {
        window.location.href = explorerHref(next);
      });
    }
    const doneNext = box.querySelector('[data-complete-next]');
    if (doneNext && next) {
      doneNext.addEventListener('click', () => toggleAndRerender(next.courseCode, next.id));
    }
    wireRelButtons(box);
  }

  function renderExam() {
    const box = $('db-exam');
    if (!box) return;
    const exam = buildExamReadiness(manifest, statusReader);
    const courses = buildCourseExamReadinessList(manifest, statusReader);
    const bd = exam.breakdown;
    const countsLine = ['high', 'medium', 'low']
      .map((level) => `${level} ${bd[level].completed}/${bd[level].total}`)
      .join(' · ');
    let focusBlock;
    if (!exam.totalExamTopics) {
      focusBlock = '<span class="xp-path-label">No exam-relevant topics tracked in this curriculum.</span>';
    } else if (exam.isComplete) {
      focusBlock = `<span class="xp-path-title">Exam readiness 100% — all ${exam.totalExamTopics} tracked exam-relevant topics completed.</span>
        <span class="xp-path-meta">Coverage only, not a guarantee of exam success. Explorer and topic pages stay open.</span>
        <a class="xp-open" href="./explorer.html">Browse the curriculum →</a>`;
    } else if (exam.nextExamTopic) {
      const t = exam.nextExamTopic;
      const emptyHint = exam.isEmpty
        ? '<span class="xp-path-meta">No exam-relevant topics completed yet — this deterministic target is first in exam-focused order.</span>'
        : '';
      focusBlock = `<span class="xp-path-title">${esc(t.title)}</span>
        <span class="xp-path-meta">${esc(t.courseCode)} · M${esc(t.module)} · 🎯 ${esc(t.examRelevance)} (weight ${esc(t.examRelevance === 'high' ? 3 : t.examRelevance === 'medium' ? 2 : 1)})</span>
        ${statusChip(store, t)} ${emptyHint}
        <button class="xp-path-btn" data-exam-open="${esc(t.courseCode)}/${esc(t.id)}" type="button">View in explorer</button>
        <a class="xp-open" href="${esc(topicHref(baseUrl, t))}">Open topic →</a>`;
    } else {
      focusBlock = '<span class="xp-path-label">No remaining exam-relevant topic.</span>';
    }
    const gaps = exam.examGaps.slice(0, 6);
    const gapsBlock = gaps.length
      ? gaps.map((t) => `<button class="xp-path-btn" data-exam-open="${esc(t.courseCode)}/${esc(t.id)}" type="button">${esc(t.title)} (🎯 ${esc(t.examRelevance)})</button>`).join('')
      : (exam.isComplete
        ? '<span class="xp-path-label">none — all exam-relevant dependencies complete</span>'
        : '<span class="xp-path-label">none — no exam-relevant prerequisite gaps</span>');
    const courseLines = courses.map((c) =>
      `<div class="db-module"><span>${esc(c.courseCode)} · ${esc(c.courseName)}</span>`
      + `<span class="db-course-nums">${c.completed} / ${c.total} exam topics · ${c.readinessPercent}% ready</span></div>`
    ).join('');
    // Descriptive exam-relevant assessment diagnostics (supporting only —
    // the weighted readiness percentage above is never altered by
    // assessment evidence).
    let examAssessmentLine = '';
    if (assessmentBank) {
      try {
        const evidence = buildDashboardExamAssessmentModel(assessmentBank, manifest, readAttempts());
        examAssessmentLine = `<div class="xp-path-row"><span class="xp-path-label">Exam assessment diagnostics: ${evidence.attempted} attempted · ${evidence.passed} passed · ${evidence.needsReview} needing review · ${evidence.notAssessed} not assessed (of ${evidence.totalExamTopics} exam topics).</span></div>`;
      } catch {
        examAssessmentLine = '';
      }
    }
    box.innerHTML = `<h2>Exam readiness</h2>
      <div class="xp-path-next"><span class="xp-path-title">${exam.readinessPercent}% ready</span>
        <span class="xp-path-meta">${exam.completedExamTopics} / ${exam.totalExamTopics} exam-relevant topics · weighted ${exam.weightedCompleted}/${exam.weightedTotal}</span></div>
      <div class="db-course-bar">${bar(exam.readinessPercent)}</div>
      <div class="xp-path-row"><span class="xp-path-label">${countsLine}</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Exam focus:</span> ${focusBlock}</div>
      <div class="xp-path-row"><span class="xp-path-label">Remaining exam gaps (${exam.examGaps.length}):</span> ${gapsBlock}</div>${examAssessmentLine}
      <div class="xp-path-row" style="flex-direction:column;align-items:stretch;"><span class="xp-path-label">Course readiness:</span>${courseLines}</div>`;
    for (const btn of box.querySelectorAll('[data-exam-open]')) {
      btn.addEventListener('click', () => {
        const [course, ...rest] = btn.getAttribute('data-exam-open').split('/');
        window.location.href = explorerHref({ courseCode: course, id: rest.join('/') });
      });
    }
  }

  function renderReview() {
    const box = $('db-review');
    if (!box) return;
    // Assessment evidence rides alongside the timestamp queue: completed
    // topics whose latest attempt needs review join as assessment-driven
    // reviews (descriptive only — the 7/14-day schedule is unchanged).
    const attempts = readAttempts();
    const assessment = assessmentBank ? { bank: assessmentBank, attempts } : null;
    const revision = buildDashboardReviewModel(manifest, statusReader, timestampReader, Date.now(), assessment);
    const drivenCount = revision.assessmentDrivenCount || 0;
    if (!revision.counts.total && !drivenCount) {
      box.innerHTML = `<h2>Review &amp; revision</h2>
        <div class="xp-path-next"><span class="xp-path-label">No reviews due.</span>
        <span class="xp-path-meta">Only completed topics enter review — complete a topic and it will resurface here after ${REVIEW_DUE_DAYS} days. A completed assessment that needs review also surfaces here.</span></div>`;
      return;
    }
    const next = revision.nextReviewTopic;
    const queue = revision.assessmentAwareQueue || revision.reviewQueue;
    const dueList = queue.slice(0, 6).map((e) => {
      const label = e.reviewState === 'review_overdue'
        ? 'overdue'
        : e.reviewState === 'review_due'
          ? `due ${e.daysSince} ${e.daysSince === 1 ? 'day' : 'days'}`
          : 'assessment needs review';
      return `<button class="xp-path-btn" data-review-open="${esc(e.courseCode)}/${esc(e.id)}" type="button">${esc(e.title)} · ${label}</button>`;
    }).join('');
    const drivenLine = drivenCount
      ? `<span class="xp-path-meta">${drivenCount} assessment-driven review${drivenCount === 1 ? '' : 's'} (completed topics whose latest assessment needs review)</span>`
      : '<span class="xp-path-meta">No assessment-driven reviews.</span>';
    box.innerHTML = `<h2>Review &amp; revision</h2>
      <div class="xp-path-next"><span class="xp-path-title">${revision.counts.total} due</span>
        <span class="xp-path-meta">${revision.counts.overdue} overdue · ${revision.counts.examDue} exam-relevant · ${drivenCount} assessment-driven</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Next review:</span>
        <span class="xp-path-title">${esc(next.title)}</span>
        <span class="xp-path-meta">${esc(next.courseCode)} · M${esc(next.module)}${next.daysSince !== null && next.daysSince !== undefined ? ` · ${esc(next.daysSince)} ${next.daysSince === 1 ? 'day' : 'days'} since last access` : ''}${next.isAssessmentDriven ? ' · assessment needs review' : ''}</span>
        <span class="xp-path-meta" data-review-reason="${esc(next.reviewReason || next.reviewState)}">${esc(next.reason)}</span>
        <button class="xp-path-btn" data-review-open="${esc(next.courseCode)}/${esc(next.id)}" type="button">View in explorer</button>
        <a class="xp-open" href="${esc(topicHref(baseUrl, next.topic))}">Open topic →</a></div>
      <div class="xp-path-row"><span class="xp-path-label">Due now (${revision.counts.total}):</span> ${dueList}</div>
      <div class="xp-path-row">${drivenLine}
        <a class="xp-open" href="./assessment.html">Start assessment →</a></div>`;
    for (const btn of box.querySelectorAll('[data-review-open]')) {
      btn.addEventListener('click', () => {
        const [course, ...rest] = btn.getAttribute('data-review-open').split('/');
        window.location.href = explorerHref({ courseCode: course, id: rest.join('/') });
      });
    }
  }

  function attentionAssessmentHref(topic) {
    return `./assessment.html#scope=topic&course=${encodeURIComponent(topic.courseCode)}&topic=${encodeURIComponent(topic.id)}`;
  }

  function renderAttention() {
    const box = $('db-attention');
    if (!box) return;
    // Descriptive attention lens over recorded evidence only: explicit
    // reasons, states, and dependency facts. No scores, no rankings, no
    // gamification — the canonical next-topic suggestion lives above.
    const attempts = readAttempts();
    const assessment = assessmentBank ? { bank: assessmentBank, attempts } : null;
    const model = buildDashboardAttentionModel(manifest, statusReader, timestampReader, Date.now(), assessment);
    if (!model.counts.total) {
      box.innerHTML = `<h2>Attention — needs review</h2>
        <div class="xp-path-next"><span class="xp-path-label">Nothing needs attention right now.</span>
        <span class="xp-path-meta">Topics appear here with an explicit reason: assessment needs review, review overdue/due, exam-relevant but not yet assessed, or blocking an unfinished exam-relevant topic. Topics without questions are listed under self-assessment, never here.</span></div>`;
      return;
    }
    const cards = model.topAttentionTopics.map((e) => {
      const assessLine = !e.assessmentAvailable
        ? 'No questions available.'
        : !e.assessmentAttempted
          ? `Not attempted yet (${e.assessmentState.replace(/_/g, ' ')}).`
          : e.assessmentPassed
            ? `Passed — latest ${e.assessmentLatestScore}% · best ${e.assessmentBestScore}% over ${e.assessmentAttempts} ${e.assessmentAttempts === 1 ? 'attempt' : 'attempts'}.`
            : `Needs review — latest ${e.assessmentLatestScore}% · best ${e.assessmentBestScore}% over ${e.assessmentAttempts} ${e.assessmentAttempts === 1 ? 'attempt' : 'attempts'}.`;
      const reviewLine = e.reviewState === 'review_overdue'
        ? `Review overdue${e.daysSince !== null ? ` (${e.daysSince} days)` : ''}.`
        : e.reviewState === 'review_due'
          ? `Review due${e.daysSince !== null ? ` (${e.daysSince} days)` : ''}.`
          : `Revision state: ${e.reviewState.replace(/_/g, ' ')}.`;
      const examLine = e.isExamRelevant
        ? `Exam-relevant (${e.examRelevance}, weight ${e.examWeight}).`
        : 'Not exam-relevant.';
      const depLine = e.blocksExamTopic
        ? `Blocks an unfinished exam-relevant topic (${e.unfinishedDependentCount} unfinished ${e.unfinishedDependentCount === 1 ? 'dependent' : 'dependents'}).`
        : e.unfinishedDependentCount > 0
          ? `${e.unfinishedDependentCount} unfinished ${e.unfinishedDependentCount === 1 ? 'dependent' : 'dependents'}.`
          : 'No unfinished dependents.';
      const assessLink = e.assessmentAvailable
        ? `<a class="xp-open" href="${esc(attentionAssessmentHref(e))}">Start assessment →</a>`
        : '';
      return `<div class="xp-path-row"><span class="xp-path-title">${esc(e.title)}</span>
        <span class="xp-path-meta">${esc(e.courseCode)} · M${esc(e.module)}</span>
        <span class="xp-path-meta">${esc(explainAttention(e))}</span>
        <span class="xp-path-meta">Assessment: ${esc(assessLine)} ${esc(reviewLine)} ${esc(examLine)} ${esc(depLine)}</span>
        <button class="xp-path-btn" data-attention-open="${esc(e.courseCode)}/${esc(e.id)}" type="button">View in explorer</button>
        <a class="xp-open" href="${esc(topicHref(baseUrl, e.topic))}">Open topic →</a>${assessLink}</div>`;
    }).join('');
    box.innerHTML = `<h2>Attention — needs review</h2>
      <div class="xp-path-next"><span class="xp-path-title">${model.counts.total} needing attention</span>
        <span class="xp-path-meta">${model.counts.needsReview} assessment needs review · ${model.counts.overdue} overdue · ${model.counts.due} due · ${model.counts.examNotAssessed} exam-relevant not assessed · ${model.counts.blocking} blocking</span></div>
      ${cards}`;
    for (const btn of box.querySelectorAll('[data-attention-open]')) {
      btn.addEventListener('click', () => {
        const [course, ...rest] = btn.getAttribute('data-attention-open').split('/');
        window.location.href = explorerHref({ courseCode: course, id: rest.join('/') });
      });
    }
  }

  function planCourseOptions(selected) {
    const codes = [...new Set(manifest.topics.map((t) => t.courseCode))].sort();
    return `<option value="">All courses</option>` + codes.map((c) =>
      `<option value="${esc(c)}"${selected === c ? ' selected' : ''}>${esc(c)}</option>`).join('');
  }

  function renderPlan() {
    const box = $('db-plan');
    if (!box) return;
    const saved = loadPlanConfig();
    const plan = buildStudyPlan(manifest, statusReader, timestampReader, saved, Date.now());
    const targetOptions = PLAN_TARGET_TYPES.map((t) =>
      `<option value="${t}"${saved && saved.targetType === t ? ' selected' : ''}>${t}</option>`).join('');
    const form = `<div class="xp-path-row">
      <label class="xp-path-label">Target <select id="db-plan-target">${targetOptions}</select></label>
      <label class="xp-path-label">Min/day <input id="db-plan-minutes" type="number" min="1" step="1" style="width:7em" value="${esc(saved && saved.minutesPerDay !== undefined ? saved.minutesPerDay : 30)}"></label>
      <label class="xp-path-label">Target date <input id="db-plan-date" type="date" value="${esc(saved && saved.targetDate ? String(saved.targetDate).slice(0, 10) : '')}"></label>
      <label class="xp-path-label">Course <select id="db-plan-course">${planCourseOptions(saved && saved.courseScope)}</select></label>
      <button class="xp-path-btn" id="db-plan-save" type="button">Save plan</button>
      <button class="xp-path-btn" id="db-plan-clear" type="button">Clear</button>
    </div>`;
    let body;
    if (plan.status === 'no_plan') {
      body = `<div class="xp-path-next"><span class="xp-path-label">No study plan yet — choose a target and save it. Nothing is planned until you configure one.</span></div>`;
    } else if (plan.status === 'target_reached') {
      body = `<div class="xp-path-next"><span class="xp-path-title">Target reached — nothing remaining.</span>
        <span class="xp-path-meta">${esc(plan.explanation)}</span></div>`;
    } else if (plan.status === 'insufficient_data') {
      body = `<div class="xp-path-next"><span class="xp-path-label">Plan needs a usable daily budget${plan.config && plan.config.targetDate ? ' and target date' : ''}.</span>
        <span class="xp-path-meta">${esc(plan.explanation)}</span></div>`;
    } else {
      const today = plan.todayTopics.map((t) =>
        `<button class="xp-path-btn" data-plan-open="${esc(t.courseCode)}/${esc(t.id)}" type="button">${esc(t.title)}${t.estimatedMinutes !== null && t.estimatedMinutes !== undefined ? ` · ${t.estimatedMinutes} min` : ''}</button>`
      ).join('') || '<span class="xp-path-label">none</span>';
      const upcoming = plan.upcomingDays.slice(0, 4).map((d) =>
        `<span class="xp-path-label">Day ${d.day}: ${d.topics.length} ${d.topics.length === 1 ? 'topic' : 'topics'} · about ${d.minutes} min</span>`
      ).join('') || '<span class="xp-path-label">none</span>';
      const required = plan.requiredMinutesPerDay !== null && plan.requiredMinutesPerDay !== undefined
        ? `${plan.requiredMinutesPerDay} min/day required`
        : 'required pace unknown';
      body = `<div class="xp-path-next"><span class="xp-path-title">${plan.remainingTopics.length} topics · about ${plan.remainingMinutes} min left</span>
        <span class="xp-path-meta">status ${esc(plan.status)} · ${esc(required)}${plan.dateFeasibility ? ` · date ${esc(plan.dateFeasibility)}` : ''}</span></div>
        <div class="xp-path-row"><span class="xp-path-label">Today (day 1):</span> ${today}</div>
        <div class="xp-path-row"><span class="xp-path-label">Upcoming:</span> ${upcoming}</div>
        <div class="xp-path-row"><span class="xp-path-label">${esc(plan.explanation)}</span></div>`;
    }
    box.innerHTML = `<h2>Study plan</h2>${form}${body}`;
    const save = box.querySelector('#db-plan-save');
    if (save) {
      save.addEventListener('click', () => {
        const target = box.querySelector('#db-plan-target').value;
        const minutes = Number(box.querySelector('#db-plan-minutes').value);
        const date = box.querySelector('#db-plan-date').value || undefined;
        const course = box.querySelector('#db-plan-course').value || undefined;
        savePlanConfig({ targetType: target, minutesPerDay: minutes, targetDate: date, courseScope: course });
        emitJourneyProgressChanged({ courseCode: null, topicId: null, source: 'dashboard-plan' });
        renderAll();
      });
    }
    const clear = box.querySelector('#db-plan-clear');
    if (clear) {
      clear.addEventListener('click', () => {
        clearPlanConfig();
        emitJourneyProgressChanged({ courseCode: null, topicId: null, source: 'dashboard-plan-clear' });
        renderAll();
      });
    }
    for (const btn of box.querySelectorAll('[data-plan-open]')) {
      btn.addEventListener('click', () => {
        const [course, ...rest] = btn.getAttribute('data-plan-open').split('/');
        window.location.href = explorerHref({ courseCode: course, id: rest.join('/') });
      });
    }
  }

  function renderAssessment() {
    const box = $('db-assessment');
    if (!box) return;
    if (!assessmentBank) {
      box.innerHTML = `<h2>Self-assessment</h2>
        <div class="xp-path-next"><span class="xp-path-label">Question bank unavailable — self-assessment will appear here once it loads.</span></div>`;
      return;
    }
    const attempts = readAttempts();
    const model = buildDashboardAssessmentModel(assessmentBank, manifest, attempts);
    const exam = getExamAssessmentStats(assessmentBank, manifest, attempts);
    // Pure coverage values surface directly (no recommendation logic):
    // total questions, covered/total topics, uncovered count, exam-relevant
    // coverage from the deterministic coverage APIs.
    const totalQuestions = getAssessmentQuestionCount(assessmentBank);
    const examCoverage = getExamQuestionCoverage(assessmentBank, manifest);
    const typeDist = getQuestionTypeDistribution(assessmentBank);
    // Descriptive exam-relevant assessment diagnostics (supporting only —
    // the weighted readiness percentage above is never altered).
    const examEvidence = buildDashboardExamAssessmentModel(assessmentBank, manifest, attempts);
    // Assessment-driven review count: completed topics whose latest attempt
    // needs review (descriptive, never a score).
    let drivenCount = 0;
    try {
      drivenCount = buildDashboardAssessmentReviewModel(
        manifest, statusReader, timestampReader, Date.now(),
        { bank: assessmentBank, attempts }
      ).assessmentDriven.length;
    } catch {
      drivenCount = 0;
    }
    const recent = model.recentAttempt
      ? `<span class="xp-path-meta">Recent: ${model.recentAttempt.percentage}% (${esc(model.recentAttempt.state.replace(/_/g, ' '))})</span>`
      : '<span class="xp-path-meta">No attempts yet.</span>';
    box.innerHTML = `<h2>Self-assessment</h2>
      <div class="xp-path-next"><span class="xp-path-title">${model.coveredCount} of ${model.totalTopics} topics have questions (${totalQuestions} questions)</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Assessment coverage: ${model.coveredCount} covered · ${model.uncoveredCount} not assessed · ${model.attempted} attempted · ${model.passed} passed · ${model.needsReview} needs review</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Assessment attempts: ${model.attempted} attempted · ${model.passed} passed · ${model.needsReview} needs review · ${drivenCount} assessment-driven reviews</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Exam-relevant coverage: ${examCoverage.coveredExamTopics} of ${examCoverage.totalExamTopics} exam topics have questions (${examCoverage.coverage}%) · attempted ${exam.attempted} · passed ${exam.passed} · needs review ${exam.needsReview} · not assessed ${examEvidence.notAssessed}</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Question types: multiple_choice ${typeDist.multiple_choice} · true_false ${typeDist.true_false} · short_answer ${typeDist.short_answer}</span></div>
      <div class="xp-path-row">${recent}
        <a class="xp-open" href="./assessment.html">Start assessment →</a></div>`;
  }

  function renderLists() {
    const model = buildDashboardModel(manifest, statusReader, { getTimestamp: timestampReader });
    const progressBox = $('db-progress-list');
    if (progressBox) {
      progressBox.innerHTML = model.inProgress.length
        ? model.currentWork.map((t) => topicRow(t, true)).join('')
        : '<span class="xp-none">Nothing in progress — open any topic page or pick a suggestion above.</span>';
      wireRelButtons(progressBox);
    }
    const readyBox = $('db-ready-list');
    if (readyBox) {
      readyBox.innerHTML = model.readyToLearn.length
        ? model.readyToLearn.map((t) => {
          const pc = store.getPrerequisiteCompletion(t.courseCode, t.id);
          const pre = t.prerequisites && t.prerequisites.length
            ? ` <span class="xp-path-meta">${pc.completed}/${pc.total} prereq</span>`
            : '';
          return `<div class="xp-rel">
            <button class="xp-rel-btn" data-open="${esc(t.courseCode)}/${esc(t.id)}" type="button">${esc(t.title)}</button>
            <span class="xp-path-meta">${esc(t.courseCode)} · M${esc(t.module)}</span>${pre}
            <button class="xp-path-btn" data-complete="${esc(t.courseCode)}/${esc(t.id)}" type="button">${store.isTopicCompleted(t.courseCode, t.id) ? '✓ Done — undo' : 'Mark completed'}</button>
            <a class="xp-open" href="${esc(topicHref(baseUrl, t))}">↗</a>
          </div>`;
        }).join('')
        : (model.isComplete
          ? '<span class="xp-none">Curriculum complete — every topic is done. Explorer stays open.</span>'
          : '<span class="xp-none">No ready topics right now — continue in-progress work above.</span>');
      wireRelButtons(readyBox);
      const readyCount = $('db-ready-count');
      if (readyCount) readyCount.textContent = `Ready to learn (${model.readyTotal} ready · showing ${model.readyToLearn.length})`;
    }
    const recentBox = $('db-recent-list');
    if (recentBox) {
      recentBox.innerHTML = model.recentlyCompleted.length
        ? model.recentlyCompleted.map((t) => topicRow(t, false)).join('')
        : '<span class="xp-none">Nothing completed yet — your recently finished topics will appear here.</span>';
      wireRelButtons(recentBox);
    }
  }

  function renderCourses() {
    const rows = buildCourseBreakdown(manifest, store);
    const box = $('db-courses');
    box.innerHTML = rows.map((r) => `
      <div class="db-course">
        <button class="db-course-head" data-course="${esc(r.courseCode)}" type="button" aria-expanded="${stateOpenCourse() === r.courseCode}">
          <span class="db-course-name">${esc(r.courseName)}</span>
          <span class="xp-path-meta">${esc(r.courseCode)}</span>
          <span class="db-course-nums">${r.completed} / ${r.total} · ${r.percent}%</span>
        </button>
        <div class="db-course-bar">${bar(r.percent)}</div>
        <div class="db-modules" data-modules-for="${esc(r.courseCode)}" hidden></div>
      </div>`).join('');
    for (const btn of box.querySelectorAll('[data-course]')) {
      btn.addEventListener('click', () => toggleCourse(btn.getAttribute('data-course')));
    }
    const open = stateOpenCourse();
    if (open) showModules(open);
    renderResetOptions(rows);
  }

  let openCourse = null;
  function stateOpenCourse() { return openCourse; }

  function toggleCourse(courseCode) {
    openCourse = openCourse === courseCode ? null : courseCode;
    renderCourses();
  }

  function showModules(courseCode) {
    const host = document.querySelector(`[data-modules-for="${courseCode}"]`);
    if (!host) return;
    const btn = document.querySelector(`[data-course="${courseCode}"]`);
    if (btn) btn.setAttribute('aria-expanded', 'true');
    host.hidden = false;
    const analyticsByModule = new Map(
      getModuleAnalyticsList(manifest, statusReader, timestampReader, courseCode, Date.now())
        .map((m) => [m.module, m])
    );
    host.innerHTML = buildModuleBreakdown(manifest, store, courseCode).map((m) => {
      const a = analyticsByModule.get(m.module);
      const meta = a
        ? ` · about ${a.remainingMinutes} min left · review due ${a.reviewDue} · overdue ${a.reviewOverdue}`
        : '';
      return `
      <div class="db-module">
        <span>M${esc(m.module)} · ${esc(m.moduleName)}</span>
        <span class="db-course-nums">${m.completed} / ${m.total} · ${m.percent}%${esc(meta)}</span>
      </div>
      <div class="db-course-bar">${bar(m.percent)}</div>`;
    }).join('');
  }

  function renderResetOptions(rows) {
    const select = $('db-reset-course');
    const current = select.value;
    select.innerHTML = rows.map((r) =>
      `<option value="${esc(r.courseCode)}">${esc(r.courseName)} (${r.completed} done)</option>`).join('');
    if ([...select.options].some((o) => o.value === current)) select.value = current;
  }

  $('db-reset-btn').addEventListener('click', () => {
    const code = $('db-reset-course').value;
    if (!code) return;
    const name = ($('db-reset-course').selectedOptions[0] || {}).text || code;
    if (window.confirm(`Reset all progress for ${name}? This clears completed and in-progress state for that course only.`)) {
      store.clearCourseState(code);
      emitJourneyProgressChanged({ courseCode: code, topicId: null, source: 'dashboard-reset' });
      renderHero();
      renderAnalytics();
      renderContinue();
      renderExam();
      renderReview();
      renderAttention();
      renderPlan();
      renderAssessment();
      renderLists();
      renderCourses();
    }
  });

  $('db-status').textContent = `${manifest.topics.length} topics · your progress is stored only in this browser`;
  renderHero();
  renderAnalytics();
  renderContinue();
  renderExam();
  renderReview();
  renderAttention();
  renderPlan();
  renderAssessment();
  renderLists();
  renderCourses();
}

if (typeof document !== 'undefined') {
  init();
}
