/**
 * Tarangam Topic Study Context (browser ES module, no dependencies).
 *
 * Reusable intelligence-powered study panel for generated topic pages. Pure
 * model builder + pure HTML renderer (both importable in Node for tests);
 * one thin DOM initializer wires a mount point. Data comes from the shared
 * static manifest fetched once at runtime (never inlined per page, never
 * reparsed from Markdown); learner state reuses assets/learner-state.js, so
 * localStorage stays fully compatible. Nothing here blocks access: every
 * control only informs, suggests, or records explicit learner actions.
 *
 * Mount contract (see templates/base.html): a static
 * `<section id="tsStudyContext" hidden>` after the article, plus identity
 * constants rendered by the template. Without JS (or without network for
 * the manifest fetch) the section stays hidden or degrades to a compact
 * status fallback — the article itself is untouched.
 */
import {
  topicKey,
  getTopic,
  getPrerequisites,
  getDependents,
  getAncestors,
  getDependencyChain,
  getPrerequisiteDepth,
  isRootTopic,
  isLeafTopic,
  getPreviousInCourse,
  getNextInCourse,
  getPreviousInModule,
  getNextInModule,
  getModuleBoundaries,
  getCourseBoundaries,
  getDirectPrerequisiteCompletion,
  getAncestorCompletion,
  getRemainingDependencyCount,
  getNextRecommendedTopic,
} from './topic-intelligence.js';
import {
  PROGRESS_CHANGED_EVENT as JOURNEY_EVENT,
  getRecommendationReason,
  explainRecommendation,
  getUnlockedDependents,
  getUnfinishedDescendants,
  emitJourneyProgressChanged,
  onJourneyProgressChanged,
} from './learning-journey.js';
import { buildTopicExamModel } from './exam-readiness.js';
import { buildTopicAnalyticsContribution } from './learning-analytics.js';
import {
  getReviewStateForTopic,
  explainReviewReason,
  REVIEW_STATE_DUE,
  REVIEW_STATE_OVERDUE,
} from './revision.js';
import { loadManifest } from './curriculum-data.js';
import { createLearnerState } from './learner-state.js';

export const STUDY_CONTEXT_MOUNT_ID = 'tsStudyContext';
export const PROGRESS_CHANGED_EVENT = JOURNEY_EVENT;

// Topic pages live one level below the artifact root in every hosting mode
// (Pages artifact and branch-root dev alike), so one relative candidate
// resolves the shared manifest without inlining it per page.
export const TOPIC_MANIFEST_CANDIDATES = ['../data/topic-manifest.json'];

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Same-course siblings link relatively; cross-course recommendations climb
// one level first. Pure and unit-tested.
export function topicHrefFrom(currentCourseCode, topic) {
  if (!topic || !topic.id) return '#';
  if (!topic.courseCode || topic.courseCode === currentCourseCode) {
    return `./${topic.id}.html`;
  }
  return `../${topic.courseCode}/${topic.id}.html`;
}

function linkEntry(currentCourseCode, topic, extraState) {
  return {
    courseCode: topic.courseCode,
    id: topic.id,
    title: topic.title,
    href: topicHrefFrom(currentCourseCode, topic),
    ...(extraState || {}),
  };
}

// Full study-context model for one topic. Null when the topic is unknown.
// getStatus is `(courseCode, topicId) => status` (unknown safely unfinished).
// options is an optional `{ getTimestamp, now }`: getTimestamp feeds the
// deterministic review state (completed topics only — unfinished topics are
// never marked due), now injects the clock for tests. Completing a topic
// resets its review clock through the existing learner-state timestamp
// mechanism (setTopicState touches the timestamp); no separate reset path.
export function buildStudyContextModel(manifest, getStatus, courseCode, topicId, options = {}) {
  const topic = getTopic(manifest, courseCode, topicId);
  if (!topic) return null;
  const statusOf = (c, id) => {
    const s = getStatus(c, id);
    return s === 'completed' || s === 'in_progress' ? s : 'not_started';
  };
  const prereqs = getPrerequisites(manifest, courseCode, topicId)
    .map((t) => linkEntry(courseCode, t, { state: statusOf(t.courseCode, t.id) }));
  const chain = getDependencyChain(manifest, courseCode, topicId)
    .map((t) => linkEntry(courseCode, t, { state: statusOf(t.courseCode, t.id), current: t.id === topicId }));
  const dependents = getDependents(manifest, courseCode, topicId)
    .map((t) => linkEntry(courseCode, t, { state: statusOf(t.courseCode, t.id) }));
  const nav = (t) => (t ? linkEntry(courseCode, t) : null);
  const next = getNextRecommendedTopic(manifest, getStatus);
  const explained = explainRecommendation(manifest, getStatus, next);
  const unlocked = getUnlockedDependents(manifest, getStatus, courseCode, topicId)
    .map((t) => linkEntry(courseCode, t, { state: statusOf(t.courseCode, t.id) }));
  const unfinishedUnlockCount = getUnfinishedDescendants(manifest, getStatus, courseCode, topicId).length;
  const exam = buildTopicExamModel(manifest, getStatus, courseCode, topicId);
  const getTimestamp = typeof options.getTimestamp === 'function' ? options.getTimestamp : null;
  const analytics = buildTopicAnalyticsContribution(manifest, getStatus, getTimestamp, courseCode, topicId, options.now);
  const reviewState = getReviewStateForTopic(manifest, getStatus, getTimestamp, courseCode, topicId, options.now);
  const review = {
    state: reviewState.state,
    daysSince: reviewState.daysSince,
    threshold: reviewState.threshold,
    timestamp: reviewState.timestamp,
    reason: explainReviewReason(manifest, topic, reviewState),
    isDue: reviewState.state === REVIEW_STATE_DUE,
    isOverdue: reviewState.state === REVIEW_STATE_OVERDUE,
    isExamRelevant: (exam && exam.isExamRelevant) || false,
  };
  return {
    courseCode: topic.courseCode,
    courseName: topic.courseName || topic.courseCode,
    module: topic.module,
    moduleName: topic.moduleName || `Module ${topic.module}`,
    id: topic.id,
    title: topic.title,
    difficulty: topic.difficulty ?? null,
    examRelevance: topic.examRelevance ?? null,
    estimatedMinutes: topic.estimatedMinutes ?? null,
    concepts: Array.isArray(topic.concepts) ? [...topic.concepts] : [],
    tags: Array.isArray(topic.tags) ? [...topic.tags] : [],
    learningObjectives: Array.isArray(topic.learningObjectives) ? [...topic.learningObjectives] : [],
    status: statusOf(courseCode, topicId),
    isRoot: isRootTopic(manifest, courseCode, topicId),
    isLeaf: isLeafTopic(manifest, courseCode, topicId),
    depth: getPrerequisiteDepth(manifest, courseCode, topicId),
    prereqs,
    prereqCompletion: getDirectPrerequisiteCompletion(manifest, getStatus, courseCode, topicId),
    chain,
    ancestorCompletion: getAncestorCompletion(manifest, getStatus, courseCode, topicId),
    remainingDependencies: getRemainingDependencyCount(manifest, getStatus, courseCode, topicId),
    dependents,
    navigation: {
      prev: nav(getPreviousInCourse(manifest, courseCode, topicId)),
      next: nav(getNextInCourse(manifest, courseCode, topicId)),
      prevInCourse: nav(getPreviousInCourse(manifest, courseCode, topicId)),
      nextInCourse: nav(getNextInCourse(manifest, courseCode, topicId)),
      prevInModule: nav(getPreviousInModule(manifest, courseCode, topicId)),
      nextInModule: nav(getNextInModule(manifest, courseCode, topicId)),
      moduleFirst: nav(getModuleBoundaries(manifest, courseCode, topic.module).first),
      moduleLast: nav(getModuleBoundaries(manifest, courseCode, topic.module).last),
      courseFirst: nav(getCourseBoundaries(manifest, courseCode).first),
      courseLast: nav(getCourseBoundaries(manifest, courseCode).last),
    },
    recommended: next ? {
      ...linkEntry(courseCode, next),
      current: topicKey(next.courseCode, next.id) === topicKey(courseCode, topicId),
    } : null,
    recommendationReason: explained.reason,
    recommendationExplanation: explained.message,
    recommendationUnlockCount: explained.unlockCount,
    isRecommended: next
      ? topicKey(next.courseCode, next.id) === topicKey(courseCode, topicId)
      : false,
    unlockedDependents: unlocked,
    unfinishedUnlockCount,
    exam,
    review,
    analytics,
  };
}

// Pure HTML renderer for a model (null model renders nothing). Uses the
// site's badge language; interactive bits are data-action buttons the
// initializer wires. Deterministic output for tests.
export function renderStudyContext(model) {
  if (!model) return '';
  const chips = [];
  chips.push(`<span class="badge">${esc(model.courseCode)} · ${esc(model.moduleName)}</span>`);
  if (model.difficulty) chips.push(`<span class="badge">🟢 ${esc(model.difficulty)}</span>`);
  if (model.examRelevance) chips.push(`<span class="badge badge-gold">🎯 ${esc(model.examRelevance)}</span>`);
  if (model.estimatedMinutes != null) chips.push(`<span class="badge">⏱️ ${esc(model.estimatedMinutes)} min</span>`);
  chips.push(`<span class="badge">${esc(model.status.replace(/_/g, ' '))}</span>`);
  if (model.isRoot) chips.push('<span class="badge badge-accent">🌱 start here — no prerequisites</span>');
  if (model.isLeaf) chips.push('<span class="badge">🍂 capstone — nothing builds on this yet</span>');

  const prereqItems = model.prereqs.length
    ? model.prereqs.map((p) =>
      `<li><a href="${esc(p.href)}">${esc(p.title)}</a> <span class="badge">${esc(p.state.replace(/_/g, ' '))}</span></li>`
    ).join('')
    : '<li><span class="xp-none">None — this topic stands alone.</span></li>';
  const chainItems = model.chain.map((t) =>
    `<li>${t.current ? `<strong>${esc(t.title)} (you are here)</strong>` : `<a href="${esc(t.href)}">${esc(t.title)}</a>`} <span class="badge">${esc(t.state.replace(/_/g, ' '))}</span></li>`
  ).join('');
  const depItems = model.dependents.length
    ? model.dependents.map((t) => `<li><a href="${esc(t.href)}">${esc(t.title)}</a></li>`).join('')
    : '<li><span class="xp-none">None yet.</span></li>';

  const navLink = (entry, label) => entry
    ? `<a class="xp-open" href="${esc(entry.href)}">${label}: ${esc(entry.title)}</a>`
    : `<span class="xp-none">${label}: —</span>`;
  const nav = model.navigation;
  const navBlock = [
    navLink(nav.prev, '← Prev'),
    navLink(nav.next, 'Next →'),
    navLink(nav.prevInModule, '← Module prev'),
    navLink(nav.nextInModule, 'Module next →'),
    navLink(nav.moduleFirst, 'Module first'),
    navLink(nav.moduleLast, 'Module last'),
    navLink(nav.courseFirst, 'Course first'),
    navLink(nav.courseLast, 'Course last'),
  ].map((h) => `<div class="ts-nav-row">${h}</div>`).join('');

  const objectives = model.learningObjectives.length
    ? `<ul>${model.learningObjectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>`
    : '<span class="xp-none">Not recorded.</span>';
  const concepts = model.concepts.length
    ? `<div class="xp-tags">${model.concepts.map((c) => `<span class="badge">${esc(c)}</span>`).join('')}</div>`
    : '<span class="xp-none">Not recorded.</span>';

  const done = model.status === 'completed';
  const reasonText = model.recommendationExplanation
    ? `<div class="xp-path-meta" data-journey-reason="${esc(model.recommendationReason || '')}">${esc(model.recommendationExplanation)}</div>`
    : '';
  const rec = model.recommended
    ? (model.recommended.current
      ? `<span class="xp-path-title">Up next: continue with this topic.</span>${reasonText}`
      : `<span class="xp-path-title">Up next: ${esc(model.recommended.title)}</span>
         <span class="xp-path-meta">${esc(model.recommended.courseCode)}</span>
         <a class="xp-open" href="${esc(model.recommended.href)}">Open →</a>${reasonText}`)
    : '<span class="xp-path-title">🎉 Curriculum complete.</span>';
  const unlockedList = Array.isArray(model.unlockedDependents) ? model.unlockedDependents : [];
  const unlockedBlock = (() => {
    if (!unlockedList.length) return '';
    const items = unlockedList.map((t) => `<li><a href="${esc(t.href)}">${esc(t.title)}</a> <span class="badge">${esc((t.state || 'not_started').replace(/_/g, ' '))}</span></li>`).join('');
    if (done) {
      const plural = unlockedList.length === 1 ? 'this unlocked next step' : `these ${unlockedList.length} unlocked next steps`;
      return `<div class="ts-block ts-unlocked"><h3>Unlocked by completing this topic (pick any — informational only)</h3>`
        + `<p class="xp-note">Completing “${esc(model.title)}” helped unlock ${esc(plural)}:</p>`
        + `<ul class="ts-list">${items}</ul></div>`;
    }
    return `<div class="ts-block ts-unlocked"><h3>Would help unlock (preview)</h3>`
      + `<p class="xp-note">Completing “${esc(model.title)}” would help these ready next steps stay available (informational only):</p>`
      + `<ul class="ts-list">${items}</ul></div>`;
  })();

  const examBlock = (() => {
    const exam = model.exam;
    if (!exam) return '';
    const stateLabel = exam.status === 'completed'
      ? 'completed — counted in exam readiness'
      : exam.status === 'in_progress'
        ? 'in progress — not yet counted'
        : 'remaining — not yet counted';
    const prereqLine = exam.isExamRelevant
      ? (exam.remainingExamPrereqCount > 0
        ? `<p class="xp-note">${exam.remainingExamPrereqCount} remaining exam-relevant ${exam.remainingExamPrereqCount === 1 ? 'prerequisite' : 'prerequisites'}.</p>`
        : '<p class="xp-note">No remaining exam-relevant prerequisites.</p>')
      : '';
    const prereqItems = exam.remainingExamPrereqs.length
      ? `<ul class="ts-list">${exam.remainingExamPrereqs.map((t) => `<li><a href="${esc(topicHrefFrom(model.courseCode, t))}">${esc(t.title)}</a> <span class="badge">🎯 ${esc(t.examRelevance)}</span></li>`).join('')}</ul>`
      : '';
    return `<div class="ts-block ts-exam"><h3>Exam readiness</h3>`
      + `<p class="xp-note">${esc(exam.explanation)}</p>`
      + `<p class="xp-note">State: ${esc(stateLabel)}.</p>`
      + prereqLine + prereqItems + `</div>`;
  })();

  const reviewBlock = (() => {
    // Completed topics only: unfinished topics never render as review due.
    if (model.status !== 'completed' || !model.review) return '';
    const r = model.review;
    const when = r.timestamp !== null && r.timestamp !== undefined
      ? `<p class="xp-note">Last visit ${esc(r.daysSince === null ? 'date unknown' : `${r.daysSince} ${r.daysSince === 1 ? 'day' : 'days'} ago`)} · next review threshold ${esc(r.threshold)} days.</p>`
      : '<p class="xp-note">No usable visit timestamp — treated as fresh, never marked due.</p>';
    const dueLine = r.isOverdue
      ? '<p class="xp-note">Currently overdue for review.</p>'
      : r.isDue
        ? '<p class="xp-note">Currently due for review.</p>'
        : '<p class="xp-note">Not currently due — fresh.</p>';
    const examLine = r.isExamRelevant
      ? '<p class="xp-note">Exam-relevant topic.</p>'
      : '';
    return `<div class="ts-block ts-review"><h3>Review status</h3>`
      + `<p class="xp-note">${esc(r.reason)}</p>`
      + when + dueLine + examLine + `</div>`;
  })();

  const analyticsBlock = (() => {
    const a = model.analytics;
    if (!a) return '';
    const examLine = a.contributesToExam
      ? `Contributes to exam readiness (🎯 ${esc(a.examRelevance)}).`
      : 'Does not directly contribute to exam readiness.';
    const reviewLine = `Review state: ${esc(a.reviewState.replace(/_/g, ' '))}.`;
    return `<div class="ts-block ts-analytics"><h3>Analytics</h3>`
      + `<p class="xp-note">Course ${esc(a.courseCompletion.completed)}/${esc(a.courseCompletion.total)} complete (${esc(a.courseCompletion.percent)}%) · `
      + `module ${esc(a.moduleCompletion.completed)}/${esc(a.moduleCompletion.total)} complete (${esc(a.moduleCompletion.percent)}%) · `
      + `about ${esc(a.moduleRemainingMinutes)} min left in this module.</p>`
      + `<p class="xp-note">${examLine} ${reviewLine}</p>`
      + `</div>`;
  })();

  return `<div class="ts-context-head"><h2>Study context</h2>
    <div class="topic-badges">${chips.join('')}</div></div>
  <div class="ts-actions">
    <button type="button" class="ts-complete" data-ts-action="toggle" aria-pressed="${done ? 'true' : 'false'}">${done ? '✓ Completed — mark not started' : 'Mark completed'}</button>
  </div>
  <div class="ts-grid">
    <div class="ts-block"><h3>Prerequisites (${model.prereqCompletion.completed}/${model.prereqCompletion.total} complete · ${model.remainingDependencies} remaining)</h3>
      <ul class="ts-list">${prereqItems}</ul></div>
    <div class="ts-block"><h3>Objectives</h3>${objectives}</div>
    <div class="ts-block"><h3>Concepts</h3>${concepts}</div>
  </div>
  ${examBlock}
  ${reviewBlock}
  ${analyticsBlock}
  <details class="ts-details"><summary>Dependency chain (${model.chain.length} topics · ancestors ${model.ancestorCompletion.completed}/${model.ancestorCompletion.total} complete)</summary>
    <ol class="ts-list">${chainItems}</ol></details>
  <details class="ts-details"><summary>Dependents (${model.dependents.length})</summary>
    <ul class="ts-list">${depItems}</ul></details>
  ${unlockedBlock}
  <details class="ts-details" open><summary>Study navigation</summary>
    <div class="ts-nav">${navBlock}</div></details>
  <div class="ts-next"><h3>Continue learning</h3>${rec}</div>`;
}

// Thin DOM wiring: mount point + template identity + shared store. Renders
// the full panel once the manifest loads; degrades to a compact
// status-and-actions fallback when the fetch fails (e.g. file:// without a
// server); re-renders immediately on local completion and on progress
// changes from anywhere (dashboard, explorer, topic pages) without reload.
// Shared localStorage stays the source of truth; the unified journey event
// only signals "re-read".
export function initStudyContext({ mountId = STUDY_CONTEXT_MOUNT_ID, courseCode, topicId } = {}) {
  if (typeof document === 'undefined') return null;
  const mount = document.getElementById(mountId);
  if (!mount || !courseCode || !topicId) return null;
  const store = createLearnerState({});
  const statusReader = (c, id) => store.getTopicState(c, id).status;
  const timestampReader = (c, id) => store.lastAccessed(c, id);

  function renderWith(manifest) {
    const model = manifest
      ? buildStudyContextModel(manifest, statusReader, courseCode, topicId, { getTimestamp: timestampReader, now: Date.now() })
      : null;
    if (!model) {
      const done = store.isTopicCompleted(courseCode, topicId);
      mount.innerHTML = `<div class="ts-context-head"><h2>Study context</h2></div>
        <p class="xp-note">Full study context needs the topic catalog (unavailable offline).</p>
        <div class="ts-actions"><button type="button" class="ts-complete" data-ts-action="toggle" aria-pressed="${done ? 'true' : 'false'}">${done ? '✓ Completed — mark not started' : 'Mark completed'}</button></div>`;
    } else {
      mount.innerHTML = renderStudyContext(model);
    }
    mount.hidden = false;
    const toggle = mount.querySelector('[data-ts-action="toggle"]');
    if (toggle) {
      toggle.addEventListener('click', () => {
        store.toggleTopicCompleted(courseCode, topicId);
        // Immediate local update first, then notify every other surface.
        renderWith(manifest);
        emitJourneyProgressChanged({ courseCode, topicId, source: 'study-context' });
      });
    }
  }

  const rerender = () => {
    loadManifest({ candidates: TOPIC_MANIFEST_CANDIDATES })
      .then(({ manifest }) => renderWith(manifest))
      .catch(() => renderWith(null));
  };
  onJourneyProgressChanged(() => {
    loadManifest({ candidates: TOPIC_MANIFEST_CANDIDATES })
      .then(({ manifest }) => renderWith(manifest))
      .catch(() => {});
  });
  rerender();
  return { rerender };
}
