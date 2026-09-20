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
 * Implemented once in the canonical Topic Intelligence Layer
 * (./topic-intelligence.js, shared with Node tooling); re-exported here so
 * existing consumers keep their import path with identical behavior:
 * deterministic curriculum order, unfinished prerequisites of other
 * unfinished work before dependents, and ready-when-unfinished topics
 * without prerequisites.
 */
export {
  STATUS_COMPLETED,
  STATUS_IN_PROGRESS,
  STATUS_NOT_STARTED,
  topicKey,
  isComplete,
  unfinishedTopics,
  getCompletedTopics,
  getInProgressTopics,
  getReadyTopics,
  getNextRecommendedTopic as getNextTopic,
} from './topic-intelligence.js';
