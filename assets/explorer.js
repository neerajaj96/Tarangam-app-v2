/**
 * Tarangam Curriculum Explorer UI (browser ES module, no dependencies).
 *
 * Renders course → module → topic browsing, search/filtering, journey-aware
 * filtering, and prerequisite-aware topic details from the static topic
 * manifest via ./curriculum-data.js plus the unified Learning Journey model
 * (./learning-journey.js) over the canonical Topic Intelligence Layer.
 * Topic page links reuse the repository's existing <COURSE>/<file>.html
 * convention resolved against the manifest's own base URL — no second
 * routing system. Explorer never duplicates the Dashboard: it exposes
 * learner journey information per card/detail (status, ready state,
 * prerequisite completion, remaining dependencies, current recommendation)
 * as informational context only. Nothing locks.
 */
import * as Data from './curriculum-data.js';
import { createLearnerState } from './learner-state.js';
import {
  PROGRESS_CHANGED_EVENT,
  JOURNEY_FILTERS,
  normalizeJourneyFilter,
  buildExplorerTopicModel,
  filterTopicsByJourney,
  getNextRecommendedTopic,
  emitJourneyProgressChanged,
  onJourneyProgressChanged,
} from './learning-journey.js';
import {
  EXAM_FILTERS,
  normalizeExamFilter,
  filterTopicsByExam,
} from './exam-readiness.js';
import {
  REVIEW_FILTERS,
  REVIEW_STATE_DUE,
  REVIEW_STATE_OVERDUE,
  normalizeReviewFilter,
  filterTopicsByReview,
  getReviewStateForTopic,
} from './revision.js';

export { PROGRESS_CHANGED_EVENT, JOURNEY_FILTERS, normalizeJourneyFilter, EXAM_FILTERS, normalizeExamFilter, REVIEW_FILTERS, normalizeReviewFilter };

const $ = (id) => (typeof document !== 'undefined' ? document.getElementById(id) : null);

// Pure Explorer filtering for tests and UI: canonical combined filter
// (course/module/search/difficulty/exam) then the deterministic journey
// filter (all/not_started/in_progress/completed/ready), the exam-readiness
// view (all/exam_relevant/exam_completed/exam_remaining), and the revision
// view (all/review_due/review_overdue/exam_review_due) via the shared
// modules — no duplicated intelligence logic.
// Preserves manifest order; unknown filters fall back to 'all'. The review
// view needs a timestamp reader and injected now; without timestamps it
// yields no review matches (never fabricated).
export function getExplorerVisibleTopics(manifest, getStatus, options = {}) {
  const {
    courseCode = null,
    module = 'all',
    query = null,
    difficulties = null,
    examRelevances = null,
    journey = 'all',
    examView = 'all',
    reviewFilter = 'all',
    getTimestamp = null,
    now,
  } = options;
  if (!manifest || !courseCode) return [];
  const scoped = Data.combinedFilter(manifest, {
    courseCode,
    module: module === 'all' ? null : Number(module),
    query: query || null,
    difficulties: difficulties ? [difficulties] : null,
    examRelevances: examRelevances ? [examRelevances] : null,
  });
  const byJourney = filterTopicsByJourney(manifest, getStatus, scoped, journey);
  const byExam = filterTopicsByExam(manifest, getStatus, byJourney, examView);
  return filterTopicsByReview(manifest, getStatus, getTimestamp, byExam, reviewFilter, now);
}

export function getExplorerTopicJourney(manifest, getStatus, courseCode, topicId) {
  return buildExplorerTopicModel(manifest, getStatus, courseCode, topicId);
}

const state = {
  manifest: null,
  baseUrl: '',
  progress: null,
  course: null,
  module: 'all',
  q: '',
  difficulty: 'all',
  exam: 'all',
  journey: 'all',
  examView: 'all',
  reviewFilter: 'all',
  selectedKey: null,
  loadError: null,
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtSeq(topic) {
  return `M${topic.module} · ${String(topic.sequence).padStart(2, '0')}`;
}

function topicStatus(topic) {
  if (!state.progress) return 'not_started';
  return state.progress.getTopicState(topic.courseCode, topic.id).status;
}

function statusChip(topic) {
  const s = topicStatus(topic);
  if (s === 'completed') return '<span class="badge xp-st-done">✓ Completed</span>';
  if (s === 'in_progress') return '<span class="badge badge-accent">… In progress</span>';
  return '<span class="badge xp-st-todo">○ Not started</span>';
}

function metaChips(topic) {
  const chips = [];
  if (topic.hasMetadata) {
    chips.push('<span class="badge badge-accent">Metadata</span>');
  } else {
    chips.push('<span class="badge xp-legacy">Legacy</span>');
  }
  if (topic.estimatedMinutes != null) chips.push(`<span class="badge">⏱️ ${esc(topic.estimatedMinutes)} min</span>`);
  if (topic.difficulty) chips.push(`<span class="badge">${esc(topic.difficulty)}</span>`);
  if (topic.examRelevance) chips.push(`<span class="badge badge-gold">🎯 ${esc(topic.examRelevance)}</span>`);
  if (topic.hasMetadata) {
    chips.push(`<span class="badge">🔗 ${topic.prerequisites.length} prereq</span>`);
    if (topic.prerequisiteDepth != null) chips.push(`<span class="badge">📏 depth ${esc(topic.prerequisiteDepth)}</span>`);
  }
  return chips.join('');
}

function topicPageHref(topic) {
  return Data.topicPageUrl(state.baseUrl, topic.courseCode, topic);
}

function statusReader() {
  if (!state.progress) return () => 'not_started';
  return (courseCode, topicId) => state.progress.getTopicState(courseCode, topicId).status;
}

function timestampReader() {
  if (!state.progress) return null;
  return (courseCode, topicId) => state.progress.lastAccessed(courseCode, topicId);
}

function currentRecommendedKey() {
  if (!state.manifest || !state.progress) return null;
  const next = getNextRecommendedTopic(state.manifest, statusReader());
  return next ? `${next.courseCode}/${next.id}` : null;
}

function journeyChips(topic) {
  if (!state.manifest || !state.progress) return '';
  const model = buildExplorerTopicModel(state.manifest, statusReader(), topic.courseCode, topic.id);
  if (!model) return '';
  const chips = [];
  chips.push(`<span class="badge">${esc(model.prereqCompletion.completed)}/${esc(model.prereqCompletion.total)} prereq</span>`);
  if (model.status !== 'completed') {
    chips.push(model.isReady
      ? '<span class="badge badge-accent">Ready</span>'
      : `<span class="badge xp-st-todo">${esc(model.remainingDependencies)} remaining</span>`);
  }
  if (model.isRecommended) chips.push('<span class="badge badge-gold">★ Recommended next</span>');
  return chips.join('');
}

function reviewChips(topic) {
  // Per-card review signal from the shared revision module (completed
  // topics only; unfinished topics never show review chips).
  if (!state.manifest || !state.progress) return '';
  const rs = getReviewStateForTopic(
    state.manifest, statusReader(), timestampReader(), topic.courseCode, topic.id, Date.now()
  );
  if (rs.state === REVIEW_STATE_OVERDUE) return '<span class="badge badge-gold">↻ Overdue</span>';
  if (rs.state === REVIEW_STATE_DUE) return '<span class="badge badge-accent">↻ Review due</span>';
  return '';
}

function currentFilters() {
  return {
    q: state.q,
    difficulty: state.difficulty === 'all' ? null : state.difficulty,
    exam: state.exam === 'all' ? null : state.exam,
    journey: state.journey,
    examView: state.examView,
    reviewFilter: state.reviewFilter,
  };
}

function visibleTopics() {
  const { manifest, course, module } = state;
  if (!manifest || !course) return [];
  const f = currentFilters();
  // One canonical combined filter (see assets/topic-intelligence.js):
  // course + module scope, whole-manifest search, difficulty/exam facets,
  // then the deterministic journey, exam-readiness, and revision views.
  // Manifest order within a course already sorts module/sequence/id.
  return getExplorerVisibleTopics(manifest, statusReader(), {
    courseCode: course,
    module,
    query: f.q || null,
    difficulties: f.difficulty || null,
    examRelevances: f.exam || null,
    journey: f.journey || 'all',
    examView: f.examView || 'all',
    reviewFilter: f.reviewFilter || 'all',
    getTimestamp: timestampReader(),
    now: Date.now(),
  });
}

function renderCourses() {
  const select = $('xp-course');
  const codes = Data.courseCodes(state.manifest);
  const names = new Map(state.manifest.topics.map((t) => [t.courseCode, t.courseName || t.courseCode]));
  select.innerHTML = codes.map((c) => {
    const n = Data.getCourseTopics(state.manifest, c).length;
    return `<option value="${esc(c)}">${esc(names.get(c) || c)} (${n})</option>`;
  }).join('');
  if (!state.course || !codes.includes(state.course)) state.course = codes[0] || null;
  select.value = state.course || '';
}

function renderModules() {
  const select = $('xp-module');
  const mods = Data.moduleNumbers(state.manifest, state.course);
  const names = new Map();
  for (const t of Data.getCourseTopics(state.manifest, state.course)) {
    if (!names.has(t.module)) names.set(t.module, t.moduleName || `Module ${t.module}`);
  }
  const countFor = (m) => Data.getModuleTopics(state.manifest, state.course, m).length;
  select.innerHTML = `<option value="all">All modules</option>` + mods.map((m) =>
    `<option value="${m}">M${m} · ${esc(names.get(m) || `Module ${m}`)} (${countFor(m)})</option>`
  ).join('');
  if (state.module !== 'all' && !mods.includes(Number(state.module))) state.module = 'all';
  select.value = state.module;
}

function renderFilterOptions() {
  const topics = Data.getCourseTopics(state.manifest, state.course);
  const uniq = (vals) => [...new Set(vals.filter((v) => v != null))].sort();
  const diffs = uniq(topics.map((t) => t.difficulty));
  const exams = uniq(topics.map((t) => t.examRelevance));
  const fill = (select, values, label) => {
    if (!select) return;
    select.innerHTML = `<option value="all">${label}</option>` +
      values.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  };
  fill($('xp-difficulty'), diffs, 'All difficulties');
  fill($('xp-exam'), exams, 'All exam relevance');
  if (!diffs.includes(state.difficulty)) state.difficulty = 'all';
  if (!exams.includes(state.exam)) state.exam = 'all';
  if ($('xp-difficulty')) $('xp-difficulty').value = state.difficulty;
  if ($('xp-exam')) $('xp-exam').value = state.exam;
  const journeySelect = $('xp-journey');
  if (journeySelect) {
    const labels = {
      all: 'All progress',
      not_started: 'Not started',
      in_progress: 'In progress',
      completed: 'Completed',
      ready: 'Ready to learn',
    };
    journeySelect.innerHTML = JOURNEY_FILTERS.map((f) =>
      `<option value="${f}">${esc(labels[f] || f)}</option>`).join('');
    state.journey = normalizeJourneyFilter(state.journey);
    journeySelect.value = state.journey;
  }
  const examViewSelect = $('xp-examview');
  if (examViewSelect) {
    const examLabels = {
      all: 'All topics',
      exam_relevant: 'Exam-relevant',
      exam_completed: 'Completed exam topics',
      exam_remaining: 'Remaining exam topics',
    };
    examViewSelect.innerHTML = EXAM_FILTERS.map((f) =>
      `<option value="${f}">${esc(examLabels[f] || f)}</option>`).join('');
    state.examView = normalizeExamFilter(state.examView);
    examViewSelect.value = state.examView;
  }
  const reviewSelect = $('xp-review');
  if (reviewSelect) {
    const reviewLabels = {
      all: 'All review states',
      review_due: 'Review due',
      review_overdue: 'Review overdue',
      exam_review_due: 'Exam review due',
    };
    reviewSelect.innerHTML = REVIEW_FILTERS.map((f) =>
      `<option value="${f}">${esc(reviewLabels[f] || f)}</option>`).join('');
    state.reviewFilter = normalizeReviewFilter(state.reviewFilter);
    reviewSelect.value = state.reviewFilter;
  }
}

function renderList() {
  const list = $('xp-topics');
  const topics = visibleTopics();
  $('xp-count').textContent = `${topics.length} topic${topics.length === 1 ? '' : 's'}`;
  if (!topics.length) {
    list.innerHTML = '<div class="xp-empty">No topics match the current filters.</div>';
    return;
  }
  list.innerHTML = topics.map((t) => {
    const key = `${t.courseCode}/${t.id}`;
    const active = key === state.selectedKey ? ' xp-active' : '';
    return `<button class="xp-card${active}" data-topic="${esc(t.id)}">
      <span class="xp-card-seq">${esc(fmtSeq(t))}</span>
      <span class="xp-card-title">${esc(t.title)}</span>
      <span class="xp-card-chips">${statusChip(t)}${metaChips(t)}${journeyChips(t)}${reviewChips(t)}</span>
    </button>`;
  }).join('');
  for (const card of list.querySelectorAll('[data-topic]')) {
    card.addEventListener('click', () => selectTopic(state.course, card.getAttribute('data-topic'), true));
  }
}

function relState(topic) {
  const s = topicStatus(topic);
  if (s === 'completed') return '✓';
  if (s === 'in_progress') return '…';
  return '○';
}

function chipLink(topic, rel) {
  return `<span class="xp-rel">
    <button class="xp-rel-btn" data-go="${esc(topic.courseCode)}" data-topic="${esc(topic.id)}"><span class="xp-rel-dot">${relState(topic)}</span> ${esc(topic.title)}</button>
    <a class="xp-open" href="${esc(topicPageHref(topic))}" title="Open topic page">↗</a>
    <span class="xp-rel-tag">${rel}</span>
  </span>`;
}

function renderDetail() {
  const panel = $('xp-detail');
  const topic = state.selectedKey
    ? Data.getTopic(state.manifest, state.selectedKey.split('/')[0], state.selectedKey.split('/')[1])
    : null;
  if (!topic) {
    panel.innerHTML = '<div class="xp-empty">Select a topic to see its details, prerequisites, and dependents.</div>';
    return;
  }
  const prereqs = Data.getPrerequisites(state.manifest, topic.courseCode, topic.id);
  const dependents = Data.getDependents(state.manifest, topic.courseCode, topic.id);
  const myStatus = topicStatus(topic);
  const isDone = myStatus === 'completed';
  const journey = buildExplorerTopicModel(state.manifest, statusReader(), topic.courseCode, topic.id);
  const recommendedKey = currentRecommendedKey();
  const isRecommended = recommendedKey === `${topic.courseCode}/${topic.id}`;
  let prereqBlock = '<span class="xp-none">None</span>';
  if (topic.hasMetadata) {
    const pc = state.progress.getPrerequisiteCompletion(topic.courseCode, topic.id);
    const head = `<div class="xp-pre-head">${pc.completed}/${pc.total} complete — continuing is always allowed</div>`;
    prereqBlock = head + (prereqs.length
      ? prereqs.map((t) => chipLink(t, 'prereq')).join('')
      : '<span class="xp-none">None</span>');
  }
  const journeyBlock = journey
    ? `<div class="xp-pre-head">${esc(journey.readyLabel)} · ${journey.prereqCompletion.completed}/${journey.prereqCompletion.total} prerequisites complete · ${journey.remainingDependencies} remaining ${journey.remainingDependencies === 1 ? 'dependency' : 'dependencies'}${isRecommended ? ' · ★ current recommendation' : ''}</div>`
    : '';
  const reviewRs = getReviewStateForTopic(
    state.manifest, statusReader(), timestampReader(), topic.courseCode, topic.id, Date.now()
  );
  const reviewBlock = (reviewRs.state === REVIEW_STATE_DUE || reviewRs.state === REVIEW_STATE_OVERDUE)
    ? `<div class="xp-pre-head">↻ ${reviewRs.state === REVIEW_STATE_OVERDUE ? 'Overdue' : 'Review due'} — ${reviewRs.daysSince} ${reviewRs.daysSince === 1 ? 'day' : 'days'} since last access (threshold ${reviewRs.threshold}). Revisiting refreshes its timestamp.</div>`
    : '';
  const listOrNone = (items, kind) => items.length
    ? items.map((t) => chipLink(t, kind)).join('')
    : '<span class="xp-none">None</span>';
  panel.innerHTML = `
    <div class="xp-detail-head">
      <div class="xp-detail-seq">${esc(fmtSeq(topic))} · ${esc(topic.courseCode)}</div>
      <h2 class="xp-detail-title">${esc(topic.title)}</h2>
      <div class="xp-card-chips">${statusChip(topic)}${metaChips(topic)}${journeyChips(topic)}${reviewChips(topic)}</div>
      ${journeyBlock}
      ${reviewBlock}
      <button class="xp-toggle" data-toggle="${esc(topic.id)}" type="button">${isDone ? '✓ Completed — mark not started' : 'Mark completed'}</button>
    </div>
    <div class="xp-detail-sec"><h3>Concepts</h3>
      ${topic.concepts && topic.concepts.length
        ? `<div class="xp-tags">${topic.concepts.map((c) => `<span class="badge">${esc(c)}</span>`).join('')}</div>`
        : '<span class="xp-none">Not recorded for this topic.</span>'}
    </div>
    <div class="xp-detail-sec"><h3>Prerequisites (${prereqs.length})</h3>
      <div class="xp-rels">${prereqBlock}</div>
    </div>
    <div class="xp-detail-sec"><h3>Dependent topics (${dependents.length})</h3>
      <div class="xp-rels">${listOrNone(dependents, 'next')}</div>
    </div>
    <div class="xp-detail-sec"><h3>Tags</h3>
      ${topic.tags && topic.tags.length
        ? `<div class="xp-tags">${topic.tags.map((c) => `<span class="badge">${esc(c)}</span>`).join('')}</div>`
        : '<span class="xp-none">None</span>'}
    </div>
    <a class="xp-open-page" href="${esc(topicPageHref(topic))}">Open topic page →</a>
    ${topic.hasMetadata ? '' : '<p class="xp-note">Legacy topic: shown with catalog info only. Full details unlock as metadata migration continues.</p>'}
  `;
  for (const btn of panel.querySelectorAll('[data-go]')) {
    btn.addEventListener('click', () => selectTopic(btn.getAttribute('data-go'), btn.getAttribute('data-topic'), true));
  }
  const toggle = panel.querySelector('[data-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      state.progress.toggleTopicCompleted(topic.courseCode, topic.id);
      emitJourneyProgressChanged({ courseCode: topic.courseCode, topicId: topic.id, source: 'explorer' });
      renderAll();
    });
  }
}

function renderProgress() {
  const el = $('xp-progress');
  if (!state.progress) { el.textContent = ''; return; }
  const overall = state.progress.getOverallProgress();
  const parts = [`Overall ${overall.completed} / ${overall.total} (${overall.percent}%)`];
  if (state.course) {
    const c = state.progress.getCourseProgress(state.course);
    parts.push(`${state.course}: ${c.completed} / ${c.total}`);
    if (state.module !== 'all') {
      const m = state.progress.getModuleProgress(state.course, Number(state.module));
      parts.push(`M${state.module}: ${m.completed} / ${m.total}`);
    }
  }
  el.textContent = parts.join(' · ');
}

function renderPath() {
  const panel = $('xp-path');
  if (!panel) return;
  if (!state.progress || !state.manifest) { panel.innerHTML = ''; return; }
  const overall = state.progress.getOverallProgress();
  const remaining = overall.total - overall.completed;
  const inProgress = state.progress.getInProgressTopics().slice(0, 4);
  const reader = statusReader();
  const next = getNextRecommendedTopic(state.manifest, reader);
  let nextBlock;
  if (!next) {
    nextBlock = `<span class="xp-path-title">🎉 Curriculum complete — all ${overall.total} topics done.</span>
      <span class="xp-path-meta">Explorer stays fully open — nothing is locked.</span>`;
  } else {
    const pc = state.progress.getPrerequisiteCompletion(next.courseCode, next.id);
    const pre = next.prerequisites && next.prerequisites.length
      ? `<span class="xp-path-meta">prerequisites ${pc.completed}/${pc.total} complete (never blocking)</span>`
      : '<span class="xp-path-meta">no prerequisites</span>';
    nextBlock = `<span class="xp-path-title">${esc(next.title)}</span>
      <span class="xp-path-meta">${esc(next.courseCode)} · ${esc(fmtSeq(next))}</span>
      ${pre}
      <span class="xp-path-meta">★ current recommendation</span>
      <button class="xp-path-btn" data-view-topic="${esc(next.courseCode)}/${esc(next.id)}" type="button">View in explorer</button>
      <a class="xp-open" href="${esc(Data.topicPageUrl(state.baseUrl, next.courseCode, next))}">Open topic page →</a>`;
  }
  panel.innerHTML = `<h2>Continue learning</h2>
    <div class="xp-path-next">${nextBlock}</div>
    <div class="xp-path-row"><span class="xp-path-label">In progress (${state.progress.getInProgressTopics().length}):</span>
      ${inProgress.length
        ? inProgress.map((t) => `<button class="xp-path-btn" data-view-topic="${esc(t.courseCode)}/${esc(t.id)}" type="button">${esc(t.title)}</button>`).join('')
        : '<span class="xp-path-label">none yet</span>'}
    </div>
    <div class="xp-path-row"><span class="xp-path-label">Completed ${overall.completed} · Remaining ${remaining}</span></div>`;
  for (const btn of panel.querySelectorAll('[data-view-topic]')) {
    btn.addEventListener('click', () => {
      const [course, ...rest] = btn.getAttribute('data-view-topic').split('/');
      selectTopic(course, rest.join('/'), true);
    });
  }
}

function renderAll() {
  renderCourses();
  renderModules();
  renderFilterOptions();
  renderProgress();
  renderPath();
  // Keep selection only if still visible; otherwise select first visible.
  const topics = visibleTopics();
  if (!topics.some((t) => `${t.courseCode}/${t.id}` === state.selectedKey)) {
    state.selectedKey = topics.length ? `${topics[0].courseCode}/${topics[0].id}` : null;
  }
  renderList();
  renderDetail();
  try {
    if (state.selectedKey) history.replaceState(null, '', `#${state.selectedKey}`);
  } catch { /* non-browser or restricted context */ }
}

function selectTopic(courseCode, id, fromUser) {
  if (courseCode && courseCode !== state.course) {
    state.course = courseCode;
    state.module = 'all';
    if (fromUser) { $('xp-search').value = ''; state.q = ''; }
  }
  state.selectedKey = `${courseCode}/${id}`;
  renderAll();
  if (fromUser && typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 900px)').matches) {
    const detail = $('xp-detail');
    if (detail && typeof detail.scrollIntoView === 'function') detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function readHash() {
  const m = (location.hash || '').match(/^#([A-Za-z0-9]+)\/(.+)$/);
  if (m) return { course: m[1], id: m[2] };
  return null;
}

let wired = false;

async function init() {
  if (!wired) {
    wired = true;
    if ($('xp-course')) $('xp-course').addEventListener('change', (e) => {
      state.course = e.target.value;
      state.module = 'all';
      state.selectedKey = null;
      renderAll();
    });
    if ($('xp-module')) $('xp-module').addEventListener('change', (e) => { state.module = e.target.value; renderAll(); });
    if ($('xp-search')) $('xp-search').addEventListener('input', (e) => { state.q = e.target.value; renderList(); renderDetail(); });
    if ($('xp-difficulty')) $('xp-difficulty').addEventListener('change', (e) => { state.difficulty = e.target.value; renderAll(); });
    if ($('xp-exam')) $('xp-exam').addEventListener('change', (e) => { state.exam = e.target.value; renderAll(); });
    if ($('xp-journey')) $('xp-journey').addEventListener('change', (e) => { state.journey = normalizeJourneyFilter(e.target.value); renderAll(); });
    if ($('xp-examview')) $('xp-examview').addEventListener('change', (e) => { state.examView = normalizeExamFilter(e.target.value); renderAll(); });
    if ($('xp-review')) $('xp-review').addEventListener('change', (e) => { state.reviewFilter = normalizeReviewFilter(e.target.value); renderAll(); });
    if ($('xp-retry')) $('xp-retry').addEventListener('click', () => {
      Data.clearManifestCache();
      const errBox = $('xp-error');
      if (errBox) errBox.hidden = true;
      init();
    });
    // Cross-surface sync without polling: re-read shared localStorage state.
    onJourneyProgressChanged(() => {
      renderProgress();
      renderPath();
      renderList();
      renderDetail();
    });
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('storage', (event) => {
        if (!event.key) return;
        if (event.key === 'tarangam_topic_state_v1' || event.key.startsWith('tarangam_visited_')) {
          renderProgress();
          renderPath();
          renderList();
          renderDetail();
        }
      });
    }
  }

  try {
    const { manifest, baseUrl } = await Data.loadManifest();
    state.manifest = manifest;
    state.baseUrl = baseUrl || '';
    state.progress = createLearnerState({ manifest });
    state.loadError = null;
    $('xp-status').textContent = `${manifest.topics.length} topics · ${manifest.aggregates?.metadataTopics ?? '?'} with metadata`;
    const deep = readHash();
    if (deep && Data.getTopic(manifest, deep.course, deep.id)) {
      state.course = deep.course;
      state.selectedKey = `${deep.course}/${deep.id}`;
    }
    $('xp-app').hidden = false;
    renderAll();
  } catch (e) {
    state.loadError = e;
    const box = $('xp-error');
    if (box) {
      box.hidden = false;
      const msg = $('xp-error-msg');
      if (msg) msg.textContent = (e && e.message) || String(e);
    }
  }
}

if (typeof document !== 'undefined') {
  init();
}
