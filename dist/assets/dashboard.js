/**
 * Tarangam Learner Dashboard logic (browser ES module, no dependencies).
 *
 * Pure breakdown helpers (importable in Node for tests) plus the
 * browser UI: overall/course/module progress, Continue Learning,
 * in-progress and ready lists, completion toggles, and explicit
 * per-course reset. All progress math delegates to assets/learner-state.js
 * over the static manifest — no second progress system, no backend.
 */
import * as Data from './curriculum-data.js';
import { createLearnerState } from './learner-state.js';

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

  const renderAll = () => {
    renderHero();
    renderContinue();
    renderLists();
    renderCourses();
  };

  const toggleAndRerender = (courseCode, id) => {
    store.toggleTopicCompleted(courseCode, id);
    renderAll();
  };

  function renderHero() {
    const o = store.getOverallProgress();
    $('db-hero-pct').textContent = `${o.percent}%`;
    $('db-hero-counts').textContent =
      `${o.completed} completed · ${o.inProgress} in progress · ${o.notStarted} not started · ${o.total} total`;
    $('db-hero-bar').innerHTML = bar(o.percent);
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
    const next = store.getNextTopic();
    const inProgress = store.getInProgressTopics();
    const ready = store.getReadyTopics();
    let nextBlock;
    if (!next) {
      nextBlock = '<span class="xp-path-title">🎉 Curriculum complete — all 432 topics done.</span>';
    } else {
      const pc = store.getPrerequisiteCompletion(next.courseCode, next.id);
      const pre = next.prerequisites && next.prerequisites.length
        ? `<span class="xp-path-meta">prerequisites ${pc.completed}/${pc.total} complete (never blocking)</span>`
        : '<span class="xp-path-meta">no prerequisites</span>';
      nextBlock = `<span class="xp-path-title">${esc(next.title)}</span>
        <span class="xp-path-meta">${esc(next.courseCode)} · M${esc(next.module)}</span>
        ${pre} ${statusChip(store, next)}
        <button class="xp-path-btn" data-goto-next="1" type="button">View in explorer</button>
        <a class="xp-open" href="${esc(topicHref(baseUrl, next))}">Open topic page →</a>
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

  function renderLists() {
    const inProgress = store.getInProgressTopics();
    $('db-progress-list').innerHTML = inProgress.length
      ? inProgress.map((t) => topicRow(t, true)).join('')
      : '<span class="xp-none">Nothing in progress — open any topic page or pick a suggestion above.</span>';
    wireRelButtons($('db-progress-list'));
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
    host.innerHTML = buildModuleBreakdown(manifest, store, courseCode).map((m) => `
      <div class="db-module">
        <span>M${esc(m.module)} · ${esc(m.moduleName)}</span>
        <span class="db-course-nums">${m.completed} / ${m.total} · ${m.percent}%</span>
      </div>
      <div class="db-course-bar">${bar(m.percent)}</div>`).join('');
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
      renderHero();
      renderContinue();
      renderLists();
      renderCourses();
    }
  });

  $('db-status').textContent = `${manifest.topics.length} topics · your progress is stored only in this browser`;
  renderHero();
  renderContinue();
  renderLists();
  renderCourses();
}

if (typeof document !== 'undefined') {
  init();
}
