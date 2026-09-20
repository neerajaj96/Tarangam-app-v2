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
} from './exam-readiness.js';
import { buildRevisionModel, REVIEW_DUE_DAYS } from './revision.js';
import { buildLearningAnalytics, getModuleAnalyticsList } from './learning-analytics.js';

export { PROGRESS_CHANGED_EVENT };

// Pure exam derivation for tests and UI: manifest + status reader ->
// deterministic exam-readiness snapshot (no DOM, no storage of its own).
export function buildDashboardExamModel(manifest, getStatus) {
  return buildExamReadiness(manifest, getStatus);
}

// Pure review derivation for tests and UI: manifest + status reader +
// timestamp reader + injected now -> deterministic revision snapshot.
// Only completed topics can enter review queues; without timestamps the
// queue stays empty (never fabricated).
export function buildDashboardReviewModel(manifest, getStatus, getTimestamp = null, now) {
  return buildRevisionModel(manifest, getStatus, getTimestamp, now);
}

// Pure analytics derivation for tests and UI: manifest + status reader +
// timestamp reader + injected now -> descriptive analytics snapshot.
// Observational only: no recommendations, predictions, or scores.
export function buildDashboardAnalyticsModel(manifest, getStatus, getTimestamp = null, now) {
  return buildLearningAnalytics(manifest, getStatus, getTimestamp, now);
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

  const renderAll = () => {
    renderHero();
    renderAnalytics();
    renderContinue();
    renderExam();
    renderReview();
    renderLists();
    renderCourses();
  };

  const toggleAndRerender = (courseCode, id) => {
    store.toggleTopicCompleted(courseCode, id);
    emitJourneyProgressChanged({ courseCode, topicId: id, source: 'dashboard' });
    renderAll();
  };

  // Cross-surface sync: progress changes from topic pages, study context,
  // explorer, or another dashboard tab re-render without reload.
  // localStorage stays the source of truth; the event only signals re-read.
  onJourneyProgressChanged(() => {
    renderAll();
  });
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (event) => {
      if (!event.key) return;
      if (event.key === 'tarangam_topic_state_v1' || event.key.startsWith('tarangam_visited_')) {
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
    box.innerHTML = `<h2>Exam readiness</h2>
      <div class="xp-path-next"><span class="xp-path-title">${exam.readinessPercent}% ready</span>
        <span class="xp-path-meta">${exam.completedExamTopics} / ${exam.totalExamTopics} exam-relevant topics · weighted ${exam.weightedCompleted}/${exam.weightedTotal}</span></div>
      <div class="db-course-bar">${bar(exam.readinessPercent)}</div>
      <div class="xp-path-row"><span class="xp-path-label">${countsLine}</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Exam focus:</span> ${focusBlock}</div>
      <div class="xp-path-row"><span class="xp-path-label">Remaining exam gaps (${exam.examGaps.length}):</span> ${gapsBlock}</div>
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
    const revision = buildRevisionModel(manifest, statusReader, timestampReader, Date.now());
    if (!revision.counts.total) {
      box.innerHTML = `<h2>Review &amp; revision</h2>
        <div class="xp-path-next"><span class="xp-path-label">No reviews due.</span>
        <span class="xp-path-meta">Only completed topics enter review — complete a topic and it will resurface here after ${REVIEW_DUE_DAYS} days.</span></div>`;
      return;
    }
    const next = revision.nextReviewTopic;
    const dueList = revision.reviewQueue.slice(0, 6).map((e) =>
      `<button class="xp-path-btn" data-review-open="${esc(e.courseCode)}/${esc(e.id)}" type="button">${esc(e.title)} · ${e.reviewState === 'review_overdue' ? 'overdue' : 'due'} ${e.daysSince} ${e.daysSince === 1 ? 'day' : 'days'}</button>`
    ).join('');
    box.innerHTML = `<h2>Review &amp; revision</h2>
      <div class="xp-path-next"><span class="xp-path-title">${revision.counts.total} due</span>
        <span class="xp-path-meta">${revision.counts.overdue} overdue · ${revision.counts.examDue} exam-relevant</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Next review:</span>
        <span class="xp-path-title">${esc(next.title)}</span>
        <span class="xp-path-meta">${esc(next.courseCode)} · M${esc(next.module)} · ${esc(next.daysSince)} ${next.daysSince === 1 ? 'day' : 'days'} since last access</span>
        <span class="xp-path-meta" data-review-reason="${esc(next.reviewState)}">${esc(next.reason)}</span>
        <button class="xp-path-btn" data-review-open="${esc(next.courseCode)}/${esc(next.id)}" type="button">View in explorer</button>
        <a class="xp-open" href="${esc(topicHref(baseUrl, next.topic))}">Open topic →</a></div>
      <div class="xp-path-row"><span class="xp-path-label">Due now (${revision.counts.total}):</span> ${dueList}</div>`;
    for (const btn of box.querySelectorAll('[data-review-open]')) {
      btn.addEventListener('click', () => {
        const [course, ...rest] = btn.getAttribute('data-review-open').split('/');
        window.location.href = explorerHref({ courseCode: course, id: rest.join('/') });
      });
    }
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
  renderLists();
  renderCourses();
}

if (typeof document !== 'undefined') {
  init();
}
