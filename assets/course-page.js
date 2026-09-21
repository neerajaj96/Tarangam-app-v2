/**
 * Tarangam Course Overview UI (browser ES module, no dependencies).
 *
 * Renders one course at a time (selected via `?course=CODE`, falling back
 * to the first course in canonical order): identity, progress, exam
 * readiness, review/attention/assessment signals from the canonical
 * modules, plus per-module sections with every topic in manifest order.
 * All numbers come from assets/course-overview.js, which itself only
 * reuses the canonical intelligence layers — no duplicated calculations,
 * no second next-topic mechanism, no ratings. Topic links reuse the
 * repository's existing page-URL convention, so they work in local
 * development and on GitHub Pages alike. Progress changes refresh via the
 * shared `tarangam:progress-changed` event (no polling); localStorage
 * stays the source of truth.
 */
import * as Data from './curriculum-data.js';
import { createLearnerState } from './learner-state.js';
import {
  PROGRESS_CHANGED_EVENT,
  emitJourneyProgressChanged,
  onJourneyProgressChanged,
} from './learning-journey.js';
import {
  getCourseOverview,
  parseCourseQuery,
} from './course-overview.js';
import {
  loadAssessmentBank,
  parseAttemptStore,
  ASSESSMENT_STORAGE_KEY,
} from './assessment.js';

export { PROGRESS_CHANGED_EVENT };

// Pure query parsing for tests and UI (no DOM of its own).
export function getCourseQueryCourse(search) {
  return parseCourseQuery(search).courseCode;
}

const $ = (id) => (typeof document !== 'undefined' ? document.getElementById(id) : null);

const state = {
  manifest: null,
  baseUrl: '',
  progress: null,
  assessmentBank: null,
  course: null,
  loadError: null,
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusReader() {
  if (!state.progress) return () => 'not_started';
  return (courseCode, topicId) => state.progress.getTopicState(courseCode, topicId).status;
}

function timestampReader() {
  if (!state.progress) return null;
  return (courseCode, topicId) => state.progress.lastAccessed(courseCode, topicId);
}

function readAttempts() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(ASSESSMENT_STORAGE_KEY) : null;
    return parseAttemptStore(raw);
  } catch {
    return parseAttemptStore(null);
  }
}

function topicHref(topic) {
  return Data.topicPageUrl(state.baseUrl, topic.courseCode, topic);
}

function explorerHref(courseCode, topicId) {
  return topicId ? `explorer.html#${courseCode}/${topicId}` : `explorer.html#${courseCode}`;
}

function assessmentHref(courseCode, topicId) {
  return `./assessment.html#scope=topic&course=${encodeURIComponent(courseCode)}&topic=${encodeURIComponent(topicId)}`;
}

function statusChip(status) {
  if (status === 'completed') return '<span class="badge xp-st-done">✓ Completed</span>';
  if (status === 'in_progress') return '<span class="badge badge-accent">… In progress</span>';
  return '<span class="badge xp-st-todo">○ Not started</span>';
}

function topicChips(t) {
  const chips = [statusChip(t.status)];
  if (t.isReady && t.status !== 'completed') chips.push('<span class="badge badge-accent">Ready</span>');
  if (t.examRelevance) chips.push(`<span class="badge badge-gold">🎯 ${esc(t.examRelevance)}</span>`);
  if (t.reviewState === 'review_overdue') chips.push('<span class="badge badge-gold">↻ Overdue</span>');
  else if (t.reviewState === 'review_due') chips.push('<span class="badge badge-accent">↻ Review due</span>');
  if (t.assessment.available) {
    if (t.assessment.needsReview) chips.push('<span class="badge badge-gold">Needs review</span>');
    else if (t.assessment.passed) chips.push('<span class="badge xp-st-done">✓ Passed</span>');
    else if (!t.assessment.attempted) chips.push('<span class="badge badge-accent">○ Quiz available</span>');
  }
  return chips.join('');
}

function currentOverview() {
  if (!state.manifest || !state.course) return null;
  return getCourseOverview(
    state.manifest, statusReader(), timestampReader(), state.course, Date.now(),
    state.assessmentBank ? { bank: state.assessmentBank, attempts: readAttempts() } : null
  );
}

function renderCourses() {
  const select = $('co-course');
  const codes = Data.courseCodes(state.manifest);
  const names = new Map(state.manifest.topics.map((t) => [t.courseCode, t.courseName || t.courseCode]));
  select.innerHTML = codes.map((c) =>
    `<option value="${esc(c)}">${esc(names.get(c) || c)} (${Data.getCourseTopics(state.manifest, c).length})</option>`
  ).join('');
  if (!state.course || !codes.includes(state.course)) state.course = codes[0] || null;
  select.value = state.course || '';
}

function renderHead(overview) {
  const box = $('co-head');
  box.innerHTML = `<h2>${esc(overview.courseName)}</h2>
    <div class="xp-path-next"><span class="xp-path-title">${esc(overview.courseCode)}</span>
      <span class="xp-path-meta">${overview.moduleCount} modules · ${overview.totalTopics} topics · ${overview.completed} completed · ${overview.inProgress} in progress · ${overview.percent}%</span></div>
    <div class="co-bar"><div class="co-fill" style="width:${overview.percent}%"></div></div>
    <div class="xp-path-row"><span class="xp-path-meta">About ${overview.remainingMinutes} min left to cover${overview.unknownMinutesCount ? ` · ${overview.unknownMinutesCount} topics without time estimates ride along` : ''}</span>
      <a class="xp-open" href="${esc(explorerHref(overview.courseCode))}">Open in explorer →</a></div>`;
}

function renderSignals(overview) {
  const box = $('co-signals');
  const exam = overview.exam;
  const review = overview.review;
  const attention = overview.attentionCounts;
  const assess = overview.assessment;
  box.innerHTML = `<h2>Course signals</h2>
    <div class="xp-path-row"><span class="xp-path-label">Exam readiness ${exam.readinessPercent}% (${exam.completed}/${exam.total} exam topics · weighted ${exam.weightedCompleted}/${exam.weightedTotal})</span></div>
    <div class="xp-path-row"><span class="xp-path-label">Review: ${review.queueTotal} due (${review.overdue} overdue · ${review.examDue} exam-relevant)</span></div>
    <div class="xp-path-row"><span class="xp-path-label">Attention: ${attention.total} topics (${attention.needsReview} assessment needs review · ${attention.overdue} overdue · ${attention.due} due · ${attention.examNotAssessed} exam-relevant not assessed · ${attention.blocking} blocking)</span></div>
    <div class="xp-path-row"><span class="xp-path-label">Self-assessment: ${assess.coveredCount}/${assess.totalTopics} topics have questions (${assess.totalQuestions} questions${assess.uncoveredCount ? ` · ${assess.uncoveredCount} not assessed` : ''})</span>
      <a class="xp-open" href="./assessment.html">Start assessment →</a></div>`;
}

function renderModules(overview) {
  const host = $('co-modules');
  host.innerHTML = overview.modules.map((m) => {
    const topics = m.topics.map((t) => {
      const pre = t.prereqCompletion.total > 0
        ? ` <span class="xp-path-meta">${t.prereqCompletion.completed}/${t.prereqCompletion.total} prereq</span>`
        : '';
      const assessLink = t.assessment.available
        ? ` <a class="xp-open" href="${esc(assessmentHref(t.courseCode, t.id))}">Quiz →</a>`
        : '';
      return `<div class="co-topic">
        <span class="co-topic-title">${esc(t.title)}</span>${pre}
        <span class="xp-path-meta">M${esc(m.module)} · #${esc(t.sequence)}</span>
        ${topicChips(t)}
        <a class="xp-open" href="${esc(topicHref(t))}">Open →</a>${assessLink}
      </div>`;
    }).join('');
    return `<section class="co-module" aria-label="Module ${esc(m.module)}">
      <h3>M${esc(m.module)} · ${esc(m.moduleName)}</h3>
      <div class="xp-path-meta">${m.completed} / ${m.totalTopics} complete · ${m.percent}% · exam readiness ${m.exam.readinessPercent}% · review due ${m.review.queueTotal} · attention ${m.attentionCounts.total} · questions ${m.assessment.totalQuestions}</div>
      <div class="co-bar"><div class="co-fill" style="width:${m.percent}%"></div></div>
      <div class="co-topics">${topics}</div>
    </section>`;
  }).join('');
}

function renderAll() {
  const overview = currentOverview();
  if (!overview) {
    const codes = Data.courseCodes(state.manifest);
    const links = codes.map((c) =>
      `<button class="xp-path-btn" data-course="${esc(c)}" type="button">${esc(c)}</button>`).join(' ');
    $('co-head').innerHTML = `<h2>Unknown course</h2>
      <div class="xp-path-next"><span class="xp-path-label">No such course in this curriculum. Pick one:</span> ${links}</div>`;
    $('co-signals').innerHTML = '';
    $('co-modules').innerHTML = '';
    for (const btn of $('co-head').querySelectorAll('[data-course]')) {
      btn.addEventListener('click', () => {
        state.course = btn.getAttribute('data-course');
        try {
          history.replaceState(null, '', `?course=${encodeURIComponent(state.course)}`);
        } catch { /* ignore */ }
        renderAll();
      });
    }
    $('co-status').textContent = `${state.manifest.topics.length} topics`;
    return;
  }
  renderHead(overview);
  renderSignals(overview);
  renderModules(overview);
  $('co-status').textContent = `${overview.courseCode} · ${overview.totalTopics} topics · your progress is stored only in this browser`;
  try {
    document.title = `Tarangam — ${overview.courseName}`;
  } catch { /* ignore */ }
}

let wired = false;

async function init() {
  if (!wired) {
    wired = true;
    if ($('co-course')) $('co-course').addEventListener('change', (e) => {
      state.course = e.target.value;
      try {
        history.replaceState(null, '', `?course=${encodeURIComponent(state.course)}`);
      } catch { /* ignore */ }
      renderAll();
    });
    if ($('co-retry')) $('co-retry').addEventListener('click', () => {
      Data.clearManifestCache();
      const errBox = $('co-error');
      if (errBox) errBox.hidden = true;
      init();
    });
    // Cross-surface sync without polling: the shared journey event plus
    // storage events re-read localStorage state (the source of truth).
    onJourneyProgressChanged(() => {
      renderCourses();
      renderAll();
    });
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', (event) => {
        if (!event.key) return;
        if (event.key === 'tarangam_topic_state_v1' || event.key.startsWith('tarangam_visited_') || event.key === ASSESSMENT_STORAGE_KEY) {
          renderCourses();
          renderAll();
        }
      });
    }
  }

  try {
    const { manifest, baseUrl } = await Data.loadManifest();
    state.manifest = manifest;
    state.baseUrl = baseUrl || '';
    state.progress = createLearnerState({ manifest });
    try {
      const loaded = await loadAssessmentBank();
      state.assessmentBank = loaded.bank;
    } catch {
      state.assessmentBank = null;
    }
    state.loadError = null;
    const asked = typeof location !== 'undefined' ? getCourseQueryCourse(location.search) : null;
    state.course = asked && Data.getCourseTopics(manifest, asked).length ? asked : null;
    $('co-app').hidden = false;
    renderCourses();
    renderAll();
  } catch (e) {
    state.loadError = e;
    const box = $('co-error');
    if (box) {
      box.hidden = false;
      const msg = $('co-error-msg');
      if (msg) msg.textContent = (e && e.message) || String(e);
    }
  }
}

if (typeof document !== 'undefined') {
  init();
}
