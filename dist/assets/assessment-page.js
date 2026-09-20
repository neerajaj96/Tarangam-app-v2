/**
 * Tarangam Self-Assessment page UI (browser ES module, no dependencies).
 *
 * Static-first assessment interface over data/assessments.json plus the
 * shared topic manifest: scope selection (topic/module/course/exam),
 * deterministic question display, answer selection, per-question or
 * whole-session submit with immediate correctness + explanation, final
 * result with links back to relevant topics, and start-another. Attempts
 * persist to one versioned localStorage key; completion reuses the shared
 * `tarangam:progress-changed` event so Dashboard, Explorer, Study Context,
 * and Learning Journey refresh without reload and without a second event
 * system. No backend, no AI, no gamification.
 */
import * as Data from './curriculum-data.js';
import {
  loadAssessmentBank,
  clearAssessmentBankCache,
  createAssessmentSession,
  answerQuestion,
  submitQuestionAnswer,
  submitSession,
  evaluateAnswer,
  scoreSession,
  getSessionTopics,
  parseAttemptStore,
  serializeAttemptStore,
  recordAttempt,
  ASSESSMENT_STORAGE_KEY,
} from './assessment.js';
import {
  PROGRESS_CHANGED_EVENT,
  emitJourneyProgressChanged,
} from './learning-journey.js';

export { PROGRESS_CHANGED_EVENT };

// Hash protocol (deep links from Study Context / Explorer):
// #scope=topic&course=<C>&topic=<id>
// #scope=module&course=<C>&module=<N>
// #scope=course&course=<C>
// #scope=exam&course=<C>&limit=<N>
// Pure and unit-tested; unknown keys/scopes fall back safely.
export function parseAssessmentHash(hash) {
  const out = { scope: 'topic', courseCode: null, topicId: null, module: 'all', limit: 5 };
  const text = typeof hash === 'string' ? hash.replace(/^#/, '') : '';
  if (!text) return out;
  const params = new URLSearchParams(text);
  const scope = params.get('scope');
  if (scope === 'topic' || scope === 'module' || scope === 'course' || scope === 'exam') {
    out.scope = scope;
  }
  const course = params.get('course');
  if (course) out.courseCode = course;
  const topic = params.get('topic');
  if (topic) out.topicId = topic;
  const module = params.get('module');
  if (module !== null && module !== '' && module !== 'all') out.module = module;
  const limit = Number(params.get('limit'));
  if (Number.isFinite(limit) && limit > 0) out.limit = Math.min(50, Math.floor(limit));
  return out;
}

const $ = (id) => (typeof document !== 'undefined' ? document.getElementById(id) : null);

const state = {
  manifest: null,
  baseUrl: '',
  bank: null,
  session: null,
  recorded: false,
  loadError: null,
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readAttempts() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(ASSESSMENT_STORAGE_KEY) : null;
    return parseAttemptStore(raw);
  } catch {
    return parseAttemptStore(null);
  }
}

function saveAttempt(submitted) {
  try {
    if (typeof localStorage === 'undefined') return false;
    const next = recordAttempt(readAttempts(), submitted, state.bank);
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, serializeAttemptStore(next));
    return true;
  } catch {
    return false;
  }
}

function topicLink(courseCode, topicId) {
  const topic = state.manifest ? Data.getTopic(state.manifest, courseCode, topicId) : null;
  const title = topic ? topic.title : topicId;
  const href = topic ? Data.topicPageUrl(state.baseUrl, courseCode, topic) : '#';
  return `<a class="xp-open" href="${esc(href)}">${esc(title)}</a>`;
}

function currentScope() {
  return {
    type: $('as-scope') ? $('as-scope').value : 'topic',
    courseCode: $('as-course') ? $('as-course').value || null : null,
    topicId: $('as-topic') && $('as-topic').value ? $('as-topic').value : null,
    module: $('as-module') ? $('as-module').value : 'all',
    limit: $('as-limit') ? Number($('as-limit').value) || 5 : 5,
  };
}

function refreshScopeCounts() {
  const el = $('as-scope-count');
  if (!el || !state.bank || !state.manifest) { if (el) el.textContent = ''; return; }
  const scope = currentScope();
  const session = createAssessmentSession(state.bank, state.manifest, {
    type: scope.type,
    courseCode: scope.courseCode,
    topicId: scope.topicId,
    module: scope.module === 'all' ? null : Number(scope.module),
    limit: scope.limit,
  });
  el.textContent = `${session.questionIds.length} ${session.questionIds.length === 1 ? 'question' : 'questions'} in scope`;
}

function fillSelect(select, options, value) {
  if (!select) return;
  select.innerHTML = options.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');
  if (value !== undefined && [...select.options].some((o) => o.value === value)) select.value = value;
}

function renderScopeOptions() {
  if (!state.manifest || !state.bank) return;
  const codes = Data.courseCodes(state.manifest);
  const names = new Map(state.manifest.topics.map((t) => [t.courseCode, t.courseName || t.courseCode]));
  fillSelect($('as-course'), codes.map((c) => ({ value: c, label: `${names.get(c) || c} (${Data.getCourseTopics(state.manifest, c).length})` })), state.course);
  const course = $('as-course') ? $('as-course').value : codes[0];
  state.course = course;
  const mods = Data.moduleNumbers(state.manifest, course);
  const modNames = new Map();
  for (const t of Data.getCourseTopics(state.manifest, course)) {
    if (!modNames.has(t.module)) modNames.set(t.module, t.moduleName || `Module ${t.module}`);
  }
  fillSelect($('as-module'), [{ value: 'all', label: 'All modules' },
    ...mods.map((m) => ({ value: String(m), label: `M${m} · ${modNames.get(m) || `Module ${m}`}` }))], state.module);
  const topics = Data.getCourseTopics(state.manifest, course);
  fillSelect($('as-topic'), topics.map((t) => ({ value: t.id, label: t.title })), state.topicId);
  refreshScopeCounts();
}

function questionCard(q, index) {
  const n = index + 1;
  const meta = `<div class="as-q-meta">${esc(q.courseCode)} · ${esc(q.topicId)} · ${esc(q.type.replace(/_/g, ' '))} · 🎯 ${esc(q.examRelevance)}</div>`;
  let input = '';
  if (q.type === 'multiple_choice') {
    input = `<div class="as-opts">${q.options.map((opt, i) =>
      `<button class="as-opt" data-q="${esc(q.id)}" data-opt="${i}" type="button">${esc(opt)}</button>`).join('')}</div>`;
  } else if (q.type === 'true_false') {
    input = `<div class="as-opts">
      <button class="as-opt" data-q="${esc(q.id)}" data-bool="true" type="button">True</button>
      <button class="as-opt" data-q="${esc(q.id)}" data-bool="false" type="button">False</button>
    </div>`;
  } else {
    input = `<input class="as-text" data-q="${esc(q.id)}" type="text" placeholder="Type your answer…" autocomplete="off">`;
  }
  return `<div class="as-q" data-card="${esc(q.id)}">
    <p class="as-q-title">${n}. ${esc(q.question)}</p>
    ${meta}${input}
    <div class="xp-path-row">
      <button class="xp-path-btn" data-submit-q="${esc(q.id)}" type="button">Submit answer</button>
      <span class="as-feedback" data-feedback="${esc(q.id)}"></span>
    </div>
    <div class="as-explain" data-explain="${esc(q.id)}" hidden></div>
  </div>`;
}

function showFeedback(qid) {
  const session = state.session;
  if (!session) return;
  const q = session.questions.find((x) => x.id === qid);
  if (!q) return;
  const result = evaluateAnswer(q, session.answers[qid]);
  const fb = document.querySelector(`[data-feedback="${CSS.escape(qid)}"]`);
  const ex = document.querySelector(`[data-explain="${CSS.escape(qid)}"]`);
  if (fb) {
    fb.textContent = result.correct ? '✓ Correct' : '✗ Not quite';
    fb.classList.toggle('ok', result.correct);
    fb.classList.toggle('no', !result.correct);
  }
  if (ex) {
    ex.textContent = q.explanation || '';
    ex.hidden = false;
  }
  const card = document.querySelector(`[data-card="${CSS.escape(qid)}"]`);
  if (card) {
    for (const btn of card.querySelectorAll('.as-opt')) btn.setAttribute('disabled', 'true');
    const input = card.querySelector('.as-text');
    if (input) input.setAttribute('disabled', 'true');
  }
}

function renderSession() {
  const box = $('as-questions');
  const resultBox = $('as-result');
  if (resultBox) { resultBox.hidden = true; resultBox.innerHTML = ''; }
  if (!box) return;
  const session = state.session;
  if (!session) { box.innerHTML = ''; return; }
  if (!session.questionIds.length) {
    box.innerHTML = '<div class="xp-empty">No questions match this scope — try a wider scope or another course.</div>';
    return;
  }
  box.innerHTML = session.questions.map(questionCard).join('')
    + `<div class="xp-path-row">
      <button class="xp-path-btn" id="as-submit-all" type="button">Submit session</button>
      <button class="xp-path-btn" id="as-again-top" type="button">Start another</button>
    </div>`;
  for (const btn of box.querySelectorAll('.as-opt')) {
    btn.addEventListener('click', () => {
      const qid = btn.getAttribute('data-q');
      let value = btn.textContent;
      if (btn.hasAttribute('data-bool')) value = btn.getAttribute('data-bool') === 'true';
      if (btn.hasAttribute('data-opt')) {
        const q = state.session.questions.find((x) => x.id === qid);
        value = q ? q.options[Number(btn.getAttribute('data-opt'))] : value;
      }
      state.session = answerQuestion(state.session, qid, value);
      const card = btn.closest('.as-q');
      if (card) {
        for (const b of card.querySelectorAll('.as-opt')) b.classList.remove('as-picked');
        btn.classList.add('as-picked');
      }
    });
  }
  for (const input of box.querySelectorAll('.as-text')) {
    input.addEventListener('input', (e) => {
      state.session = answerQuestion(state.session, input.getAttribute('data-q'), e.target.value);
    });
  }
  for (const btn of box.querySelectorAll('[data-submit-q]')) {
    btn.addEventListener('click', () => {
      const qid = btn.getAttribute('data-submit-q');
      state.session = submitQuestionAnswer(state.session, qid);
      showFeedback(qid);
    });
  }
  const all = box.querySelector('#as-submit-all');
  if (all) all.addEventListener('click', submitWholeSession);
  const again = box.querySelector('#as-again-top');
  if (again) again.addEventListener('click', resetToScope);
}

function submitWholeSession() {
  if (!state.session || state.session.submitted) return;
  state.session = submitSession(state.session, Date.now());
  for (const qid of state.session.questionIds) showFeedback(qid);
  const result = state.session.result;
  if (!state.recorded) {
    state.recorded = saveAttempt(state.session);
    // One shared event carries assessment completion to every surface
    // (Dashboard, Explorer, Study Context, Learning Journey) — no second
    // event system, no polling.
    emitJourneyProgressChanged({ courseCode: null, topicId: null, source: 'assessment' });
  }
  const topics = getSessionTopics(state.session);
  const box = $('as-result');
  if (box) {
    box.hidden = false;
    box.innerHTML = `<h2>Result — ${result.percentage}% (${result.state.replace(/_/g, ' ')})</h2>
      <div class="xp-path-next"><span class="xp-path-title">${result.correct} / ${result.total} correct</span>
        <span class="xp-path-meta">${result.incorrect} incorrect · ${result.unanswered} unanswered · pass mark 70%</span></div>
      <div class="xp-path-row"><span class="xp-path-label">Topics in this session:</span>
        ${topics.map((t) => topicLink(t.courseCode, t.id)).join(' ') || '<span class="xp-none">none</span>'}</div>
      <div class="xp-path-row"><button class="xp-path-btn" id="as-again" type="button">Start another assessment</button></div>`;
    const again = box.querySelector('#as-again');
    if (again) again.addEventListener('click', resetToScope);
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function resetToScope() {
  state.session = null;
  state.recorded = false;
  renderSession();
  const scope = $('as-scope');
  if (scope) scope.scrollIntoView({ behavior: 'smooth', block: 'start' });
  try {
    history.replaceState(null, '', location.pathname);
  } catch { /* ignore */ }
}

function startFromControls() {
  if (!state.bank || !state.manifest) return;
  const scope = currentScope();
  state.session = createAssessmentSession(state.bank, state.manifest, {
    type: scope.type,
    courseCode: scope.courseCode,
    topicId: scope.topicId,
    module: scope.module === 'all' ? null : Number(scope.module),
    limit: scope.limit,
  }, Date.now());
  state.recorded = false;
  try {
    const params = new URLSearchParams({ scope: scope.type });
    if (scope.courseCode) params.set('course', scope.courseCode);
    if (scope.topicId && scope.type === 'topic') params.set('topic', scope.topicId);
    if (scope.module !== 'all' && (scope.type === 'module')) params.set('module', String(scope.module));
    history.replaceState(null, '', `#${params.toString()}`);
  } catch { /* ignore */ }
  renderSession();
}

function applyHash() {
  const parsed = parseAssessmentHash(typeof location !== 'undefined' ? location.hash : '');
  const scopeSelect = $('as-scope');
  if (scopeSelect && ['topic', 'module', 'course', 'exam'].includes(parsed.scope)) {
    scopeSelect.value = parsed.scope;
  }
  if (parsed.courseCode && $('as-course')) {
    const codes = Data.courseCodes(state.manifest);
    if (codes.includes(parsed.courseCode)) {
      state.course = parsed.courseCode;
      $('as-course').value = parsed.courseCode;
    }
  }
  renderScopeOptions();
  if (parsed.topicId && $('as-topic')) {
    const topics = Data.getCourseTopics(state.manifest, state.course).map((t) => t.id);
    if (topics.includes(parsed.topicId)) {
      state.topicId = parsed.topicId;
      $('as-topic').value = parsed.topicId;
    }
  }
  if (parsed.module !== 'all' && $('as-module')) {
    $('as-module').value = parsed.module;
    state.module = parsed.module;
  }
  if ($('as-limit')) $('as-limit').value = String(parsed.limit);
}

let wired = false;

async function init() {
  if (!wired) {
    wired = true;
    if ($('as-course')) $('as-course').addEventListener('change', (e) => {
      state.course = e.target.value;
      state.module = 'all';
      state.topicId = null;
      renderScopeOptions();
    });
    if ($('as-module')) $('as-module').addEventListener('change', (e) => { state.module = e.target.value; refreshScopeCounts(); });
    if ($('as-topic')) $('as-topic').addEventListener('change', (e) => { state.topicId = e.target.value; refreshScopeCounts(); });
    if ($('as-scope')) $('as-scope').addEventListener('change', () => refreshScopeCounts());
    if ($('as-limit')) $('as-limit').addEventListener('input', () => refreshScopeCounts());
    if ($('as-start')) $('as-start').addEventListener('click', startFromControls);
    if ($('as-retry')) $('as-retry').addEventListener('click', () => {
      Data.clearManifestCache();
      clearAssessmentBankCache();
      const errBox = $('as-error');
      if (errBox) errBox.hidden = true;
      init();
    });
  }

  try {
    const { manifest, baseUrl } = await Data.loadManifest();
    state.manifest = manifest;
    state.baseUrl = baseUrl || '';
    try {
      const loaded = await loadAssessmentBank();
      state.bank = loaded.bank;
    } catch {
      state.bank = null;
    }
    state.loadError = null;
    const coverage = state.bank
      ? `${state.bank.questions.length} questions`
      : 'question bank unavailable';
    $('as-status').textContent = `${manifest.topics.length} topics · ${coverage}`;
    const codes = Data.courseCodes(manifest);
    state.course = codes[0] || null;
    state.module = 'all';
    state.topicId = null;
    $('as-app').hidden = false;
    applyHash();
    renderScopeOptions();
    refreshScopeCounts();
  } catch (e) {
    state.loadError = e;
    const box = $('as-error');
    if (box) {
      box.hidden = false;
      const msg = $('as-error-msg');
      if (msg) msg.textContent = (e && e.message) || String(e);
    }
  }
}

if (typeof document !== 'undefined') {
  init();
}
