/**
 * Dependency-free tests for the learner path engine (node:test +
 * node:assert only — no test framework). Covers the pure engine in
 * assets/learner-path.js (via scripts/learner-path.js) with stub status
 * readers plus the bound store methods in assets/learner-state.js.
 *
 * Run: npm test
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getNextTopic,
  getReadyTopics,
  getInProgressTopics,
  getCompletedTopics,
  unfinishedTopics,
} from './learner-path.js';
import { createLearnerState, memoryStorage } from '../assets/learner-state.js';

function entry(overrides) {
  const base = {
    id: 'x', courseCode: 'C1', courseName: 'Course One', module: 1, moduleName: 'M1',
    sequence: 1, title: 'X', hasMetadata: true,
    difficulty: 'beginner', estimatedMinutes: 5, concepts: [],
    prerequisites: [], examRelevance: 'medium', tags: [], prerequisiteDepth: 0,
    ...overrides,
  };
  if (!overrides.filename) base.filename = `${base.id}.html`;
  return base;
}

const fixture = {
  version: 1,
  topics: [
    entry({ id: 'm1_01_a', title: 'Alpha', sequence: 1 }),
    entry({ id: 'm1_02_b', title: 'Beta', sequence: 2, prerequisites: ['m1_01_a'], prerequisiteDepth: 1 }),
    entry({ id: 'm1_03_c', title: 'Gamma', sequence: 3, prerequisites: ['m1_02_b'], prerequisiteDepth: 2 }),
    entry({ id: 'm2_01_l', title: 'Lambda Legacy', module: 2, moduleName: 'M2', sequence: 1, hasMetadata: false, difficulty: null, estimatedMinutes: null, examRelevance: null, prerequisiteDepth: null }),
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1 }),
  ],
  aggregates: { totalTopics: 5, metadataTopics: 4 },
};

const ids = (topics) => topics.map((t) => `${t.courseCode}/${t.id}`);
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];

describe('empty learner state', () => {
  it('recommends the first root topic with all roots ready', () => {
    const getStatus = readerFrom({});
    assert.deepEqual(ids(getReadyTopics(fixture, getStatus)),
      ['C1/m1_01_a', 'C1/m2_01_l', 'C2/m1_01_z']);
    const next = getNextTopic(fixture, getStatus);
    assert.equal(`${next.courseCode}/${next.id}`, 'C1/m1_01_a');
    assert.deepEqual(getInProgressTopics(fixture, getStatus), []);
    assert.deepEqual(getCompletedTopics(fixture, getStatus), []);
  });
});

describe('partially completed prerequisite chain', () => {
  it('moves to the dependent and prefers blockers', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    assert.deepEqual(ids(getReadyTopics(fixture, getStatus)),
      ['C1/m1_02_b', 'C1/m2_01_l', 'C2/m1_01_z']);
    const next = getNextTopic(fixture, getStatus);
    assert.equal(`${next.courseCode}/${next.id}`, 'C1/m1_02_b'); // unblocks m1_03_c
  });
});

describe('multiple ready topics', () => {
  it('orders blockers before leaves, deterministically', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const ready = ids(getReadyTopics(fixture, getStatus));
    assert.deepEqual(ready, ['C1/m1_03_c', 'C1/m2_01_l', 'C2/m1_01_z']);
    assert.equal(`${getNextTopic(fixture, getStatus).courseCode}/${getNextTopic(fixture, getStatus).id}`, 'C1/m1_03_c');
  });
});

describe('in-progress topic preference', () => {
  it('continues unfinished in-progress work first, even when not ready', () => {
    const getStatus = readerFrom({ 'C1/m1_03_c': 'in_progress' });
    const next = getNextTopic(fixture, getStatus);
    assert.equal(`${next.courseCode}/${next.id}`, 'C1/m1_03_c');
    assert.deepEqual(ids(getInProgressTopics(fixture, getStatus)), ['C1/m1_03_c']);
  });
});

describe('completed chains and courses', () => {
  it('completed prerequisite chain advances without re-suggesting', () => {
    const getStatus = readerFrom({
      'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed', 'C1/m1_03_c': 'completed',
    });
    assert.equal(`${getNextTopic(fixture, getStatus).courseCode}/${getNextTopic(fixture, getStatus).id}`, 'C1/m2_01_l');
    assert.deepEqual(ids(getCompletedTopics(fixture, getStatus)),
      ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c']);
  });

  it('fully completed course yields null with empty ready list', () => {
    const all = {};
    for (const t of fixture.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    assert.equal(getNextTopic(fixture, readerFrom(all)), null);
    assert.deepEqual(getReadyTopics(fixture, readerFrom(all)), []);
    assert.equal(unfinishedTopics(fixture, readerFrom(all)).length, 0);
  });
});

describe('legacy and invalid records', () => {
  it('legacy topic is ready when unfinished and done when completed', () => {
    assert.ok(ids(getReadyTopics(fixture, readerFrom({}))).includes('C1/m2_01_l'));
    const done = readerFrom({ 'C1/m2_01_l': 'completed' });
    assert.ok(!ids(getReadyTopics(fixture, done)).includes('C1/m2_01_l'));
    assert.equal(getNextTopic(fixture, done).id, 'm1_01_a');
  });

  it('missing and invalid records count as unfinished without crashing', () => {
    const getStatus = (c, id) => ({ 'C1/m1_01_a': undefined, 'C1/m1_02_b': 'bogus', 'C1/m1_03_c': null }[`${c}/${id}`]);
    assert.deepEqual(ids(getReadyTopics(fixture, getStatus)),
      ['C1/m1_01_a', 'C1/m2_01_l', 'C2/m1_01_z']);
    assert.equal(getNextTopic(fixture, getStatus).id, 'm1_01_a');
  });

  it('ordering is deterministic across runs', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    assert.deepEqual(
      JSON.stringify(getReadyTopics(fixture, getStatus)),
      JSON.stringify(getReadyTopics(fixture, getStatus))
    );
    assert.equal(
      `${getNextTopic(fixture, getStatus).id}`,
      `${getNextTopic(fixture, getStatus).id}`
    );
  });
});

describe('store-bound path methods', () => {
  it('delegate to the engine over live statuses', () => {
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    assert.equal(`${store.getNextTopic().courseCode}/${store.getNextTopic().id}`, 'C1/m1_01_a');
    store.markTopicCompleted('C1', 'm1_01_a');
    assert.equal(store.getNextTopic().id, 'm1_02_b');
    assert.deepEqual(store.getReadyTopics().map((t) => t.id),
      ['m1_02_b', 'm2_01_l', 'm1_01_z']);
    store.markTopicStarted('C1', 'm2_01_l');
    assert.deepEqual(store.getInProgressTopics().map((t) => t.id), ['m2_01_l']);
    assert.deepEqual(store.getIncompletePrerequisites('C1', 'm1_02_b'), []);
    store.setTopicState('C1', 'm1_01_a', 'not_started');
    assert.deepEqual(store.getIncompletePrerequisites('C1', 'm1_02_b').map((p) => p.id), ['m1_01_a']);
  });
});
