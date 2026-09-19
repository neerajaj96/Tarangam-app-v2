/**
 * Dependency-free tests for assets/learner-state.js (node:test +
 * node:assert only — no test framework). Covers: empty start,
 * completion/uncompletion, serialization survival, legacy tracking,
 * prerequisite math, course/module/overall progress, malformed state,
 * unknown IDs, and legacy localStorage compatibility.
 *
 * Run: npm test
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createLearnerState,
  memoryStorage,
  legacyVisitedKey,
  legacyTimestampKey,
  V1_STATE_KEY,
} from '../assets/learner-state.js';

function entry(overrides) {
  const base = {
    id: 'x', courseCode: 'C1', courseName: 'Course One', module: 1, moduleName: 'M1',
    sequence: 1, title: 'X', hasMetadata: false,
    difficulty: null, estimatedMinutes: null, concepts: [],
    prerequisites: [], examRelevance: null, tags: [], prerequisiteDepth: null,
    ...overrides,
  };
  if (!overrides.filename) base.filename = `${base.id}.html`;
  return base;
}

const fixture = {
  version: 1,
  topics: [
    entry({
      id: 'm1_01_a', title: 'Alpha', sequence: 1, hasMetadata: true,
      difficulty: 'beginner', estimatedMinutes: 5, examRelevance: 'high', prerequisiteDepth: 0,
    }),
    entry({
      id: 'm1_02_b', title: 'Beta', sequence: 2, hasMetadata: true,
      difficulty: 'beginner', estimatedMinutes: 5, examRelevance: 'high',
      prerequisites: ['m1_01_a'], prerequisiteDepth: 1,
    }),
    entry({ id: 'm1_03_c', title: 'Gamma Legacy', sequence: 3 }),
    entry({
      id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta',
      hasMetadata: true, difficulty: 'advanced', estimatedMinutes: 9,
      examRelevance: 'low', prerequisiteDepth: 0,
    }),
    entry({ id: 'm1_02_y', courseCode: 'C2', title: 'Yotta Legacy', sequence: 2 }),
  ],
  aggregates: { totalTopics: 5, metadataTopics: 3 },
};

const fresh = () => createLearnerState({ manifest: fixture, storage: memoryStorage() });

describe('fresh and basic transitions', () => {
  it('1. new learner state starts empty', () => {
    const s = fresh();
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'not_started');
    assert.deepEqual(s.getOverallProgress(), { total: 5, completed: 0, inProgress: 0, notStarted: 5, percent: 0 });
  });

  it('2. topic completion works', () => {
    const store = memoryStorage();
    const s = createLearnerState({ manifest: fixture, storage: store });
    const st = s.markTopicCompleted('C1', 'm1_01_a');
    assert.equal(st.status, 'completed');
    assert.ok(s.isTopicCompleted('C1', 'm1_01_a'));
    // legacy visited array kept for old readers
    assert.deepEqual(JSON.parse(store.getItem(legacyVisitedKey('C1'))), ['m1_01_a']);
  });

  it('3. topic uncompletion works', () => {
    const store = memoryStorage();
    const s = createLearnerState({ manifest: fixture, storage: store });
    s.markTopicCompleted('C1', 'm1_01_a');
    s.setTopicState('C1', 'm1_01_a', 'not_started');
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'not_started');
    assert.ok(!s.isTopicCompleted('C1', 'm1_01_a'));
    assert.deepEqual(JSON.parse(store.getItem(legacyVisitedKey('C1'))), []);
  });

  it('4. state survives serialization/deserialization', () => {
    const store = memoryStorage();
    createLearnerState({ manifest: fixture, storage: store }).markTopicCompleted('C1', 'm1_02_b');
    const reopened = createLearnerState({ manifest: fixture, storage: store });
    assert.equal(reopened.getTopicState('C1', 'm1_02_b').status, 'completed');
    assert.equal(reopened.getOverallProgress().completed, 1);
  });
});

describe('legacy and prerequisites', () => {
  it('5. legacy topics can be tracked', () => {
    const s = fresh();
    s.markTopicCompleted('C1', 'm1_03_c');
    assert.equal(s.getTopicState('C1', 'm1_03_c').status, 'completed');
    assert.equal(s.getCourseProgress('C1').completed, 1);
    s.markTopicStarted('C2', 'm1_02_y');
    assert.equal(s.getTopicState('C2', 'm1_02_y').status, 'in_progress');
  });

  it('6. prerequisite status is calculated correctly', () => {
    const s = fresh();
    assert.deepEqual(s.getIncompletePrerequisites('C1', 'm1_02_b').map((p) => p.id), ['m1_01_a']);
    assert.deepEqual(s.getPrerequisiteCompletion('C1', 'm1_02_b'), { completed: 0, total: 1, percent: 0 });
    s.markTopicCompleted('C1', 'm1_01_a');
    assert.deepEqual(s.getCompletedPrerequisites('C1', 'm1_02_b').map((p) => p.id), ['m1_01_a']);
    assert.deepEqual(s.getIncompletePrerequisites('C1', 'm1_02_b'), []);
    assert.deepEqual(s.getPrerequisiteCompletion('C1', 'm1_02_b'), { completed: 1, total: 1, percent: 100 });
    // legacy topics report ordinary empty prerequisite state
    assert.deepEqual(s.getPrerequisiteCompletion('C1', 'm1_03_c'), { completed: 0, total: 0, percent: 100 });
  });
});

describe('progress math', () => {
  it('7. course progress is correct', () => {
    const s = fresh();
    s.markTopicCompleted('C1', 'm1_01_a');
    s.markTopicStarted('C1', 'm1_02_b');
    assert.deepEqual(s.getCourseProgress('C1'), { total: 3, completed: 1, inProgress: 1, notStarted: 1, percent: 33 });
    assert.equal(s.formatProgress('C1', s.getCourseProgress('C1')), 'C1: 1 / 3 completed');
  });

  it('8. module progress is correct', () => {
    const s = fresh();
    s.markTopicCompleted('C1', 'm1_01_a');
    assert.deepEqual(s.getModuleProgress('C1', 1).completed, 1);
    assert.equal(s.getModuleProgress('C1', 1).total, 3);
    assert.deepEqual(s.getModuleProgress('C1', 9), { total: 0, completed: 0, inProgress: 0, notStarted: 0, percent: 0 });
  });

  it('9. overall progress uses all topics including legacy', () => {
    const s = fresh();
    s.markTopicCompleted('C1', 'm1_03_c'); // legacy
    s.markTopicCompleted('C2', 'm1_01_z');
    const overall = s.getOverallProgress();
    assert.equal(overall.total, 5);
    assert.equal(overall.completed, 2);
    assert.equal(overall.percent, 40);
  });
});

describe('robustness', () => {
  it('10. malformed state is handled safely', () => {
    const store = memoryStorage({
      [V1_STATE_KEY]: 'not-json{{{',
      [legacyVisitedKey('C1')]: '{"oops":true}',
      [legacyTimestampKey('C1')]: '[1,2,3]',
    });
    const s = createLearnerState({ manifest: fixture, storage: store });
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'not_started');
    assert.deepEqual(s.getOverallProgress().completed, 0);
    // bad enum entries are ignored, writes still work
    store.setItem(V1_STATE_KEY, JSON.stringify({ 'C1/m1_01_a': { status: 'finished!!!' } }));
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'not_started');
    s.markTopicCompleted('C1', 'm1_01_a');
    assert.ok(s.isTopicCompleted('C1', 'm1_01_a'));
  });

  it('11. unknown topic IDs do not crash the system', () => {
    const s = fresh();
    assert.equal(s.getTopicState('CX', 'nope').status, 'not_started');
    s.markTopicCompleted('CX', 'nope');
    s.setTopicState('C1', 'ghost', 'in_progress');
    assert.deepEqual(s.getCompletedPrerequisites('CX', 'nope'), []);
    assert.deepEqual(s.getPrerequisiteCompletion('CX', 'nope'), { completed: 0, total: 0, percent: 100 });
    assert.equal(s.getOverallProgress().total, 5); // unknowns excluded from math
    assert.equal(s.getCourseProgress('CX').total, 0);
  });

  it('12. existing localStorage format remains compatible', () => {
    const store = memoryStorage({
      [legacyVisitedKey('C1')]: JSON.stringify(['m1_01_a', 'm1_03_c']),
      [legacyTimestampKey('C1')]: JSON.stringify({ m1_01_a: 1700000000000 }),
    });
    const s = createLearnerState({ manifest: fixture, storage: store });
    const a = s.getTopicState('C1', 'm1_01_a');
    assert.equal(a.status, 'completed');
    assert.equal(a.legacy, true);
    assert.equal(s.getTopicState('C1', 'm1_03_c').status, 'completed');
    assert.equal(s.getCourseProgress('C1').completed, 2);
    // new writes keep the legacy array format intact
    s.markTopicCompleted('C1', 'm1_02_b');
    assert.deepEqual(JSON.parse(store.getItem(legacyVisitedKey('C1'))), ['m1_01_a', 'm1_03_c', 'm1_02_b']);
  });
});
