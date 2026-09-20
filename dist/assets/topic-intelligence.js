/**
 * Tarangam canonical Topic Intelligence Layer (browser + Node, no dependencies).
 *
 * One deterministic, explainable API over a topic manifest object for every
 * future learner feature — relationships, curriculum navigation, learning
 * classification, discovery, and progress-aware readiness. Pure functions
 * only: no DOM, no storage, no fetch, no Markdown, no AI/LLMs. Nothing here
 * locks or gates the learner; readiness only informs and suggests.
 *
 * This module is the single implementation. Node entry points
 * (scripts/topic-intelligence.js) re-export it, exactly like the
 * scripts/learner-path.js over assets/learner-path.js precedent, so browsers
 * and repo tooling share one copy. The older query copies in
 * scripts/topic-manifest.js and assets/curriculum-data.js delegate here.
 *
 * Conventions (stable contract):
 * - A manifest is `{ topics: [...] }` in deterministic curriculum order
 *   (course, module, sequence, id); every listing preserves that order.
 * - A topic key is `courseCode/id` (bare ids repeat across courses, so all
 *   prerequisite resolution is same-course, matching scripts/topic-graph.js).
 * - Unknown courses/topics yield null/[]/false (never throw), so UI code
 *   stays total. Invalid graphs (cycles, dangling ids) terminate via
 *   visited-sets and are skipped, never looped.
 * - A status reader is `(courseCode, topicId) => status` with
 *   'completed' | 'in_progress' | 'not_started'; anything else counts as
 *   unfinished, exactly like the learner-path engine.
 */

export const STATUS_COMPLETED = 'completed';
export const STATUS_IN_PROGRESS = 'in_progress';
export const STATUS_NOT_STARTED = 'not_started';

export const topicKey = (courseCode, id) => `${courseCode}/${id}`;

// --- Manifest guards -------------------------------------------------------

function manifestTopics(manifest) {
  return manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
}

function prereqIds(topic) {
  return topic && Array.isArray(topic.prerequisites) ? topic.prerequisites : [];
}

// --- Basic topic/course/module queries -------------------------------------

export function getTopic(manifest, courseCode, id) {
  return manifestTopics(manifest).find((t) => t.courseCode === courseCode && t.id === id) ?? null;
}

export function getCourseTopics(manifest, courseCode) {
  return manifestTopics(manifest).filter((t) => t.courseCode === courseCode);
}

export function getModuleTopics(manifest, courseCode, module) {
  return getCourseTopics(manifest, courseCode)
    .filter((t) => t.module === module)
    .sort((a, b) => a.sequence - b.sequence || (a.id < b.id ? -1 : 1));
}

export function courseCodes(manifest) {
  return [...new Set(manifestTopics(manifest).map((t) => t.courseCode))].sort();
}

export function moduleNumbers(manifest, courseCode) {
  return [...new Set(getCourseTopics(manifest, courseCode).map((t) => t.module))].sort((a, b) => a - b);
}

// --- Topic relationships ---------------------------------------------------

export function getPrerequisites(manifest, courseCode, id) {
  const topic = getTopic(manifest, courseCode, id);
  if (!topic) return [];
  return prereqIds(topic)
    .map((p) => getTopic(manifest, courseCode, p))
    .filter((t) => t !== null);
}

export function getDependents(manifest, courseCode, id) {
  return manifestTopics(manifest).filter((t) =>
    t.courseCode === courseCode && prereqIds(t).includes(id)
  );
}

// Transitive prerequisites in manifest (curriculum) order. Cycle-safe and
// tolerant of dangling ids (skipped). Excludes the topic itself.
export function getAncestors(manifest, courseCode, id) {
  const seen = new Set();
  const start = topicKey(courseCode, id);
  const stack = prereqIds(getTopic(manifest, courseCode, id)).map((p) => topicKey(courseCode, p));
  while (stack.length) {
    const key = stack.pop();
    if (key === start || seen.has(key)) continue;
    seen.add(key);
    const [c, ...rest] = key.split('/');
    const node = getTopic(manifest, c, rest.join('/'));
    if (!node) continue;
    for (const p of prereqIds(node)) stack.push(topicKey(c, p));
  }
  seen.delete(start);
  return manifestTopics(manifest).filter((t) => seen.has(topicKey(t.courseCode, t.id)));
}

// Transitive dependents in manifest order. Cycle-safe; excludes the topic.
export function getDescendants(manifest, courseCode, id) {
  const seen = new Set();
  const start = topicKey(courseCode, id);
  const stack = getDependents(manifest, courseCode, id).map((t) => topicKey(t.courseCode, t.id));
  while (stack.length) {
    const key = stack.pop();
    if (key === start || seen.has(key)) continue;
    seen.add(key);
    const [c, ...rest] = key.split('/');
    for (const d of getDependents(manifest, c, rest.join('/'))) {
      stack.push(topicKey(d.courseCode, d.id));
    }
  }
  seen.delete(start);
  return manifestTopics(manifest).filter((t) => seen.has(topicKey(t.courseCode, t.id)));
}

// Deterministic learning order for one topic: ancestors in curriculum order
// followed by the topic itself. Empty when the topic is unknown.
export function getDependencyChain(manifest, courseCode, id) {
  const topic = getTopic(manifest, courseCode, id);
  if (!topic) return [];
  return [...getAncestors(manifest, courseCode, id), topic];
}

// Longest prerequisite chain to a root (roots score 0). Cycle-safe via a
// visiting set; dangling ids count as roots. Null when the topic is unknown.
export function getPrerequisiteDepth(manifest, courseCode, id) {
  if (!getTopic(manifest, courseCode, id)) return null;
  const memo = new Map();
  const depthOf = (key, visiting) => {
    if (memo.has(key)) return memo.get(key);
    if (visiting.has(key)) return 0;
    const [c, ...rest] = key.split('/');
    const node = getTopic(manifest, c, rest.join('/'));
    if (!node || !prereqIds(node).length) return 0;
    visiting.add(key);
    let best = 0;
    for (const p of prereqIds(node)) {
      best = Math.max(best, 1 + depthOf(topicKey(c, p), visiting));
    }
    visiting.delete(key);
    memo.set(key, best);
    return best;
  };
  return depthOf(topicKey(courseCode, id), new Set());
}

export function isRootTopic(manifest, courseCode, id) {
  const topic = getTopic(manifest, courseCode, id);
  return topic !== null && prereqIds(topic).length === 0;
}

export function isLeafTopic(manifest, courseCode, id) {
  const topic = getTopic(manifest, courseCode, id);
  return topic !== null && getDependents(manifest, courseCode, id).length === 0;
}

// --- Curriculum navigation (manifest order; null at boundaries) ------------

function indexOfTopic(manifest, courseCode, id) {
  return manifestTopics(manifest).findIndex((t) => t.courseCode === courseCode && t.id === id);
}

function neighbor(manifest, courseCode, id, step, sameCourse, sameModule) {
  const topics = manifestTopics(manifest);
  const i = indexOfTopic(manifest, courseCode, id);
  if (i < 0) return null;
  const j = i + step;
  if (j < 0 || j >= topics.length) return null;
  const candidate = topics[j];
  if (sameCourse && candidate.courseCode !== courseCode) return null;
  if (sameModule) {
    const current = topics[i];
    if (candidate.courseCode !== current.courseCode || candidate.module !== current.module) return null;
  }
  return candidate;
}

export function getPreviousTopic(manifest, courseCode, id) {
  return neighbor(manifest, courseCode, id, -1, false, false);
}

export function getNextTopic(manifest, courseCode, id) {
  return neighbor(manifest, courseCode, id, 1, false, false);
}

export function getPreviousInCourse(manifest, courseCode, id) {
  return neighbor(manifest, courseCode, id, -1, true, false);
}

export function getNextInCourse(manifest, courseCode, id) {
  return neighbor(manifest, courseCode, id, 1, true, false);
}

export function getPreviousInModule(manifest, courseCode, id) {
  return neighbor(manifest, courseCode, id, -1, false, true);
}

export function getNextInModule(manifest, courseCode, id) {
  return neighbor(manifest, courseCode, id, 1, false, true);
}

export function getModuleBoundaries(manifest, courseCode, module) {
  const topics = getModuleTopics(manifest, courseCode, module);
  if (!topics.length) return { first: null, last: null };
  return { first: topics[0], last: topics[topics.length - 1] };
}

export function getCourseBoundaries(manifest, courseCode) {
  const topics = getCourseTopics(manifest, courseCode);
  if (!topics.length) return { first: null, last: null };
  return { first: topics[0], last: topics[topics.length - 1] };
}

// --- Learning classification (null-safe field access) ----------------------

export function getDifficulty(manifest, courseCode, id) {
  return getTopic(manifest, courseCode, id)?.difficulty ?? null;
}

export function getExamRelevance(manifest, courseCode, id) {
  return getTopic(manifest, courseCode, id)?.examRelevance ?? null;
}

export function getEstimatedMinutes(manifest, courseCode, id) {
  return getTopic(manifest, courseCode, id)?.estimatedMinutes ?? null;
}

export function getConcepts(manifest, courseCode, id) {
  const concepts = getTopic(manifest, courseCode, id)?.concepts;
  return Array.isArray(concepts) ? [...concepts] : [];
}

export function getTags(manifest, courseCode, id) {
  const tags = getTopic(manifest, courseCode, id)?.tags;
  return Array.isArray(tags) ? [...tags] : [];
}

export function getLearningObjectives(manifest, courseCode, id) {
  const objectives = getTopic(manifest, courseCode, id)?.learningObjectives;
  return Array.isArray(objectives) ? [...objectives] : [];
}

// --- Topic discovery -------------------------------------------------------

export function normalizeSearchText(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// Case-insensitive, whitespace-tolerant substring search across title, ID,
// concepts, and tags. Manifest order; empty queries match nothing.
export function searchTopics(manifest, query) {
  const q = normalizeSearchText(query);
  if (!q) return [];
  return manifestTopics(manifest).filter((t) => {
    const haystacks = [t.title, t.id, ...(t.concepts || []), ...(t.tags || [])];
    return haystacks.some((h) => normalizeSearchText(h).includes(q));
  });
}

export function searchConcepts(manifest, query) {
  const q = normalizeSearchText(query);
  if (!q) return [];
  return manifestTopics(manifest).filter((t) =>
    (t.concepts || []).some((c) => normalizeSearchText(c).includes(q))
  );
}

function asArray(value) {
  if (value === undefined || value === null) return null;
  return Array.isArray(value) ? value : [value];
}

export function filterByTags(manifest, tags, mode = 'all') {
  const wanted = asArray(tags);
  if (!wanted || !wanted.length) return manifestTopics(manifest);
  const match = mode === 'any'
    ? (t) => wanted.some((tag) => (t.tags || []).includes(tag))
    : (t) => wanted.every((tag) => (t.tags || []).includes(tag));
  return manifestTopics(manifest).filter(match);
}

export function filterByDifficulty(manifest, difficulties) {
  const wanted = asArray(difficulties);
  if (!wanted || !wanted.length) return manifestTopics(manifest);
  return manifestTopics(manifest).filter((t) => wanted.includes(t.difficulty));
}

export function filterByExamRelevance(manifest, levels) {
  const wanted = asArray(levels);
  if (!wanted || !wanted.length) return manifestTopics(manifest);
  return manifestTopics(manifest).filter((t) => wanted.includes(t.examRelevance));
}

// Legacy aliases kept so the older query import paths keep working with
// identical behavior; new code should prefer the filterBy* names.
export const getTopicsByDifficulty = filterByDifficulty;
export const getTopicsByExamRelevance = filterByExamRelevance;

// Topics with a known estimate at or under the cap. Unknown estimates never
// match an active cap (they cannot be verified against it).
export function filterByMaxMinutes(manifest, maxMinutes) {
  if (maxMinutes === undefined || maxMinutes === null) return manifestTopics(manifest);
  return manifestTopics(manifest).filter(
    (t) => typeof t.estimatedMinutes === 'number' && t.estimatedMinutes <= maxMinutes
  );
}

// Combined discovery: every provided predicate must hold (AND); array-valued
// predicates match any listed value (OR within). Manifest order preserved.
// Unknown courses/modules naturally yield [] through the scoped filters.
export function combinedFilter(manifest, filters = {}) {
  const {
    query = null,
    tags = null,
    tagsMode = 'all',
    difficulties = null,
    examRelevances = null,
    maxMinutes = null,
    courseCode = null,
    module = null,
  } = filters;
  let topics = manifestTopics(manifest);
  if (courseCode !== undefined && courseCode !== null) {
    topics = topics.filter((t) => t.courseCode === courseCode);
  }
  if (module !== undefined && module !== null) {
    topics = topics.filter((t) => t.module === module);
  }
  if (query !== undefined && query !== null && normalizeSearchText(query)) {
    const q = normalizeSearchText(query);
    topics = topics.filter((t) => {
      const haystacks = [t.title, t.id, ...(t.concepts || []), ...(t.tags || [])];
      return haystacks.some((h) => normalizeSearchText(h).includes(q));
    });
  }
  const tagList = asArray(tags);
  if (tagList && tagList.length) {
    topics = topics.filter((t) => tagsMode === 'any'
      ? tagList.some((tag) => (t.tags || []).includes(tag))
      : tagList.every((tag) => (t.tags || []).includes(tag)));
  }
  const diffList = asArray(difficulties);
  if (diffList && diffList.length) topics = topics.filter((t) => diffList.includes(t.difficulty));
  const examList = asArray(examRelevances);
  if (examList && examList.length) topics = topics.filter((t) => examList.includes(t.examRelevance));
  if (maxMinutes !== undefined && maxMinutes !== null) {
    topics = topics.filter(
      (t) => typeof t.estimatedMinutes === 'number' && t.estimatedMinutes <= maxMinutes
    );
  }
  return topics;
}

// --- Progress-aware intelligence (status-reader driven) ---------------------

function readStatus(getStatus, courseCode, topicId) {
  const status = getStatus(courseCode, topicId);
  if (status === STATUS_COMPLETED) return STATUS_COMPLETED;
  if (status === STATUS_IN_PROGRESS) return STATUS_IN_PROGRESS;
  return STATUS_NOT_STARTED;
}

export function isComplete(getStatus, courseCode, topicId) {
  return readStatus(getStatus, courseCode, topicId) === STATUS_COMPLETED;
}

export function unfinishedTopics(manifest, getStatus) {
  return manifestTopics(manifest).filter((t) => !isComplete(getStatus, t.courseCode, t.id));
}

export function getCompletedTopics(manifest, getStatus) {
  return manifestTopics(manifest).filter((t) => isComplete(getStatus, t.courseCode, t.id));
}

export function getInProgressTopics(manifest, getStatus) {
  return manifestTopics(manifest).filter(
    (t) => readStatus(getStatus, t.courseCode, t.id) === STATUS_IN_PROGRESS
  );
}

// Prerequisite entries shaped like the learner-state contract:
// [{ courseCode, id, state }] with the live status attached.
function prereqEntries(manifest, getStatus, courseCode, topicId) {
  return prereqIds(getTopic(manifest, courseCode, topicId)).map((id) => ({
    courseCode,
    id,
    state: readStatus(getStatus, courseCode, id),
  }));
}

export function getCompletedPrerequisites(manifest, getStatus, courseCode, topicId) {
  return prereqEntries(manifest, getStatus, courseCode, topicId)
    .filter((p) => p.state === STATUS_COMPLETED);
}

export function getBlockedPrerequisites(manifest, getStatus, courseCode, topicId) {
  return prereqEntries(manifest, getStatus, courseCode, topicId)
    .filter((p) => p.state !== STATUS_COMPLETED);
}

// Unfinished topics whose every prerequisite is complete (prerequisite-free
// topics qualify as soon as they are unfinished). Manifest order.
export function getReadyTopics(manifest, getStatus) {
  return unfinishedTopics(manifest, getStatus).filter((t) =>
    prereqIds(t).every((p) => isComplete(getStatus, t.courseCode, p))
  );
}

// Deterministic recommendation order: unfinished in-progress work first,
// then ready topics that unblock other unfinished work, then any other
// ready topic. Manifest order within each tier.
export function getRecommendedNextTopics(manifest, getStatus) {
  const topics = manifestTopics(manifest);
  const unfinished = topics.filter((t) => !isComplete(getStatus, t.courseCode, t.id));
  if (!unfinished.length) return [];
  const unfinishedKeys = new Set(unfinished.map((t) => topicKey(t.courseCode, t.id)));
  const inProgress = unfinished.filter(
    (t) => readStatus(getStatus, t.courseCode, t.id) === STATUS_IN_PROGRESS
  );
  const inProgressKeys = new Set(inProgress.map((t) => topicKey(t.courseCode, t.id)));
  const readyRest = getReadyTopics(manifest, getStatus)
    .filter((t) => !inProgressKeys.has(topicKey(t.courseCode, t.id)));
  const blockers = readyRest.filter((t) =>
    topics.some((u) =>
      u.courseCode === t.courseCode &&
      topicKey(u.courseCode, u.id) !== topicKey(t.courseCode, t.id) &&
      unfinishedKeys.has(topicKey(u.courseCode, u.id)) &&
      prereqIds(u).includes(t.id)
    )
  );
  const blockerKeys = new Set(blockers.map((t) => topicKey(t.courseCode, t.id)));
  const rest = readyRest.filter((t) => !blockerKeys.has(topicKey(t.courseCode, t.id)));
  return [...inProgress, ...blockers, ...rest];
}

// Next recommended unfinished topic, or null when everything is done.
// Degenerate graphs (e.g. cycles in invalid data) still suggest the first
// unfinished topic rather than locking the learner out. This is the
// singular head of getRecommendedNextTopics with the same fallbacks.
export function getNextRecommendedTopic(manifest, getStatus) {
  const recommended = getRecommendedNextTopics(manifest, getStatus);
  if (recommended.length) return recommended[0];
  const unfinished = unfinishedTopics(manifest, getStatus);
  return unfinished.length ? unfinished[0] : null;
}

// Completion across direct prerequisites only (the per-topic gate shown in
// Explorer/Dashboard detail views). 100% when there is nothing to complete.
export function getDirectPrerequisiteCompletion(manifest, getStatus, courseCode, topicId) {
  const entries = prereqEntries(manifest, getStatus, courseCode, topicId);
  const completed = entries.filter((p) => p.state === STATUS_COMPLETED).length;
  return {
    completed,
    total: entries.length,
    percent: entries.length ? Math.round((completed / entries.length) * 100) : 100,
  };
}

// Completion across the transitive dependency closure (ancestors only, not
// the topic itself). 100% when there is nothing to complete — matching the
// per-topic prerequisite-completion convention.
export function getAncestorCompletion(manifest, getStatus, courseCode, topicId) {
  const ancestors = getAncestors(manifest, courseCode, topicId);
  const completed = ancestors.filter((t) => isComplete(getStatus, t.courseCode, t.id)).length;
  return {
    completed,
    total: ancestors.length,
    percent: ancestors.length ? Math.round((completed / ancestors.length) * 100) : 100,
  };
}

// Unfinished ancestors standing between the learner and this topic.
export function getRemainingDependencyCount(manifest, getStatus, courseCode, topicId) {
  return getAncestors(manifest, courseCode, topicId)
    .filter((t) => !isComplete(getStatus, t.courseCode, t.id)).length;
}
