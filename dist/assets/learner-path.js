/**
 * Tarangam learner path engine (browser + Node, no dependencies).
 *
 * Pure recommendations over a topic manifest plus a status reader —
 * no DOM, no storage, no Markdown. A status reader is any function
 * `(courseCode, topicId) => status` (e.g. bound to
 * `store.getTopicState(...).status`); unknown or invalid statuses safely
 * count as unfinished, never as completed. Nothing is ever locked:
 * every function only suggests and informs.
 *
 * Ordering is deterministic curriculum order (the manifest's own
 * course/module/sequence/id sort). Among ready topics, unfinished
 * prerequisites of other unfinished work come before dependents.
 * Legacy topics (no prerequisites) are ready whenever unfinished.
 */

export const STATUS_COMPLETED = 'completed';
export const STATUS_IN_PROGRESS = 'in_progress';
export const STATUS_NOT_STARTED = 'not_started';

export const topicKey = (courseCode, topicId) => `${courseCode}/${topicId}`;

function manifestTopics(manifest) {
  return manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
}

function readStatus(getStatus, courseCode, topicId) {
  const status = getStatus(courseCode, topicId);
  if (status === STATUS_COMPLETED) return STATUS_COMPLETED;
  if (status === STATUS_IN_PROGRESS) return STATUS_IN_PROGRESS;
  return STATUS_NOT_STARTED;
}

export function isComplete(getStatus, courseCode, topicId) {
  return readStatus(getStatus, courseCode, topicId) === STATUS_COMPLETED;
}

function prereqIds(topic) {
  return Array.isArray(topic.prerequisites) ? topic.prerequisites : [];
}

// Unfinished topics in curriculum order.
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

// Unfinished topics whose every prerequisite is complete (legacy topics
// qualify as soon as they are unfinished). Curriculum order.
export function getReadyTopics(manifest, getStatus) {
  return unfinishedTopics(manifest, getStatus).filter((t) =>
    prereqIds(t).every((p) => isComplete(getStatus, t.courseCode, p))
  );
}

// Next recommended unfinished topic, or null when everything is done:
// unfinished in-progress work first, then ready topics that unblock
// other unfinished work, then any ready topic. Degenerate graphs
// (e.g. cycles in invalid data) still suggest the first unfinished
// topic rather than locking the learner out.
export function getNextTopic(manifest, getStatus) {
  const unfinished = unfinishedTopics(manifest, getStatus);
  if (!unfinished.length) return null;
  const inProgress = unfinished.filter(
    (t) => readStatus(getStatus, t.courseCode, t.id) === STATUS_IN_PROGRESS
  );
  if (inProgress.length) return inProgress[0];
  const ready = getReadyTopics(manifest, getStatus);
  if (ready.length) {
    const unfinishedKeys = new Set(unfinished.map((t) => topicKey(t.courseCode, t.id)));
    const blockers = ready.filter((t) =>
      manifestTopics(manifest).some((u) =>
        u.courseCode === t.courseCode &&
        topicKey(u.courseCode, u.id) !== topicKey(t.courseCode, t.id) &&
        unfinishedKeys.has(topicKey(u.courseCode, u.id)) &&
        prereqIds(u).includes(t.id)
      )
    );
    return blockers.length ? blockers[0] : ready[0];
  }
  return unfinished[0];
}
