/**
 * Tarangam Curriculum Explorer UI (browser ES module, no dependencies).
 *
 * Renders course → module → topic browsing, search/filtering, and
 * prerequisite-aware topic details from the static topic manifest via
 * ./curriculum-data.js. Topic page links reuse the repository's existing
 * <COURSE>/<file>.html convention resolved against the manifest's own
 * base URL — no second routing system. Legacy topics render with
 * whatever the manifest carries (never as broken).
 */
import * as Data from './curriculum-data.js';
import { createLearnerState } from './learner-state.js';

const $ = (id) => document.getElementById(id);

const state = {
  manifest: null,
  baseUrl: '',
  progress: null,
  course: null,
  module: 'all',
  q: '',
  difficulty: 'all',
  exam: 'all',
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

function currentFilters() {
  return {
    q: state.q,
    difficulty: state.difficulty === 'all' ? null : state.difficulty,
    exam: state.exam === 'all' ? null : state.exam,
  };
}

function visibleTopics() {
  const { manifest, course, module } = state;
  if (!manifest || !course) return [];
  let topics = Data.getCourseTopics(manifest, course);
  if (module !== 'all') topics = topics.filter((t) => t.module === Number(module));
  const f = currentFilters();
  if (f.q) {
    const found = new Set(Data.searchTopics(manifest, f.q).map((t) => `${t.courseCode}/${t.id}`));
    topics = topics.filter((t) => found.has(`${t.courseCode}/${t.id}`));
  }
  if (f.difficulty) topics = topics.filter((t) => t.difficulty === f.difficulty);
  if (f.exam) topics = topics.filter((t) => t.examRelevance === f.exam);
  return topics.sort((a, b) => a.module - b.module || a.sequence - b.sequence);
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
    select.innerHTML = `<option value="all">${label}</option>` +
      values.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  };
  fill($('xp-difficulty'), diffs, 'All difficulties');
  fill($('xp-exam'), exams, 'All exam relevance');
  if (!diffs.includes(state.difficulty)) state.difficulty = 'all';
  if (!exams.includes(state.exam)) state.exam = 'all';
  $('xp-difficulty').value = state.difficulty;
  $('xp-exam').value = state.exam;
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
      <span class="xp-card-chips">${statusChip(t)}${metaChips(t)}</span>
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
  let prereqBlock = '<span class="xp-none">None</span>';
  if (topic.hasMetadata) {
    const pc = state.progress.getPrerequisiteCompletion(topic.courseCode, topic.id);
    const head = `<div class="xp-pre-head">${pc.completed}/${pc.total} complete — continuing is always allowed</div>`;
    prereqBlock = head + (prereqs.length
      ? prereqs.map((t) => chipLink(t, 'prereq')).join('')
      : '<span class="xp-none">None</span>');
  }
  const listOrNone = (items, kind) => items.length
    ? items.map((t) => chipLink(t, kind)).join('')
    : '<span class="xp-none">None</span>';
  panel.innerHTML = `
    <div class="xp-detail-head">
      <div class="xp-detail-seq">${esc(fmtSeq(topic))} · ${esc(topic.courseCode)}</div>
      <h2 class="xp-detail-title">${esc(topic.title)}</h2>
      <div class="xp-card-chips">${statusChip(topic)}${metaChips(topic)}</div>
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

function renderAll() {
  renderCourses();
  renderModules();
  renderFilterOptions();
  renderProgress();
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
  if (fromUser && window.matchMedia('(max-width: 900px)').matches) {
    $('xp-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    $('xp-course').addEventListener('change', (e) => {
      state.course = e.target.value;
      state.module = 'all';
      state.selectedKey = null;
      renderAll();
    });
    $('xp-module').addEventListener('change', (e) => { state.module = e.target.value; renderAll(); });
    $('xp-search').addEventListener('input', (e) => { state.q = e.target.value; renderList(); renderDetail(); });
    $('xp-difficulty').addEventListener('change', (e) => { state.difficulty = e.target.value; renderAll(); });
    $('xp-exam').addEventListener('change', (e) => { state.exam = e.target.value; renderAll(); });
    $('xp-retry').addEventListener('click', () => {
      Data.clearManifestCache();
      $('xp-error').hidden = true;
      init();
    });
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
    box.hidden = false;
    $('xp-error-msg').textContent = (e && e.message) || String(e);
  }
}

init();
