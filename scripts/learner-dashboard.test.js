/**
 * Dependency-free tests for the learner dashboard data layer
 * (assets/dashboard.js pure helpers + assets/learner-state.js store).
 * Covers: empty/partial/multi-course/module/full/legacy/invalid states,
 * reset behavior, and dashboard wiring files.
 *
 * Run: npm test
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCourseBreakdown, buildModuleBreakdown } from '../assets/dashboard.js';
import {
  createLearnerState,
  memoryStorage,
  legacyVisitedKey,
} from '../assets/learner-state.js';

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
    entry({ id: 'm1_03_c', title: 'Gamma Legacy', sequence: 3, hasMetadata: false, difficulty: null, estimatedMinutes: null, examRelevance: null, prerequisiteDepth: null }),
    entry({ id: 'm2_01_d', title: 'Delta Legacy', module: 2, moduleName: 'M2', sequence: 1, hasMetadata: false, difficulty: null, estimatedMinutes: null, examRelevance: null, prerequisiteDepth: null }),
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1 }),
    entry({ id: 'm1_02_y', courseCode: 'C2', title: 'Yotta Legacy', sequence: 2, hasMetadata: false, difficulty: null, estimatedMinutes: null, examRelevance: null, prerequisiteDepth: null }),
  ],
  aggregates: { totalTopics: 6, metadataTopics: 3 },
};

const storeWith = (initial) => createLearnerState({ manifest: fixture, storage: memoryStorage(initial) });
const rowFor = (rows, code) => rows.find((r) => r.courseCode === code);

describe('dashboard data calculations', () => {
  it('empty state shows zeros with next available', () => {
    const s = storeWith();
    const rows = buildCourseBreakdown(fixture, s);
    assert.equal(rows.length, 2);
    assert.deepEqual(rowFor(rows, 'C1'), {
      courseCode: 'C1', courseName: 'Course One',
      total: 4, completed: 0, inProgress: 0, notStarted: 4, percent: 0,
    });
    assert.equal(s.getNextTopic().id, 'm1_01_a');
    assert.deepEqual(s.getOverallProgress(), { total: 6, completed: 0, inProgress: 0, notStarted: 6, percent: 0 });
  });

  it('partial progress counts across courses', () => {
    const s = storeWith();
    s.markTopicCompleted('C1', 'm1_01_a');
    s.markTopicCompleted('C1', 'm1_03_c');
    s.markTopicStarted('C2', 'm1_01_z');
    const rows = buildCourseBreakdown(fixture, s);
    assert.deepEqual(rowFor(rows, 'C1').completed, 2);
    assert.deepEqual(rowFor(rows, 'C1').percent, 50);
    assert.deepEqual(rowFor(rows, 'C2'), {
      courseCode: 'C2', courseName: 'Course Two',
      total: 2, completed: 0, inProgress: 1, notStarted: 1, percent: 0,
    });
  });

  it('module progress splits correctly', () => {
    const s = storeWith();
    s.markTopicCompleted('C1', 'm1_01_a');
    s.markTopicCompleted('C1', 'm2_01_d');
    const mods = buildModuleBreakdown(fixture, s, 'C1');
    assert.equal(mods.length, 2);
    assert.deepEqual([mods[0].module, mods[0].moduleName, mods[0].completed, mods[0].total], [1, 'M1', 1, 3]);
    assert.deepEqual([mods[1].module, mods[1].completed, mods[1].total, mods[1].percent], [2, 1, 1, 100]);
    assert.deepEqual(buildModuleBreakdown(fixture, s, 'CX'), []);
  });

  it('reset behavior clears one course only', () => {
    const s = storeWith();
    s.markTopicCompleted('C1', 'm1_01_a');
    s.markTopicCompleted('C2', 'm1_01_z');
    s.clearCourseState('C1');
    const rows = buildCourseBreakdown(fixture, s);
    assert.deepEqual(rowFor(rows, 'C1').completed, 0);
    assert.deepEqual(rowFor(rows, 'C2').completed, 1);
    assert.equal(s.getOverallProgress().completed, 1);
  });

  it('fully completed curriculum reports 100% with null next', () => {
    const s = storeWith();
    for (const t of fixture.topics) s.markTopicCompleted(t.courseCode, t.id);
    assert.deepEqual(s.getOverallProgress(), { total: 6, completed: 6, inProgress: 0, notStarted: 0, percent: 100 });
    assert.equal(s.getNextTopic(), null);
    for (const r of buildCourseBreakdown(fixture, s)) assert.equal(r.percent, 100);
  });

  it('legacy progress compatibility feeds the breakdown', () => {
    const s = storeWith({ [legacyVisitedKey('C1')]: JSON.stringify(['m1_03_c']) });
    assert.deepEqual(rowFor(buildCourseBreakdown(fixture, s), 'C1').completed, 1);
    assert.equal(s.getOverallProgress().completed, 1);
  });

  it('invalid storage fails safe with zeroed rows', () => {
    const s = createLearnerState({ manifest: fixture, storage: memoryStorage({ [legacyVisitedKey('C1')]: '[[[' }) });
    const rows = buildCourseBreakdown(fixture, s);
    assert.equal(rows.length, 2);
    assert.ok(rows.every((r) => r.completed === 0 && r.percent === 0));
    assert.equal(s.getNextTopic().id, 'm1_01_a');
  });
});

describe('dashboard wiring', () => {
  it('page, logic, entry point, and build outputs exist and reference each other', () => {
    for (const f of ['dashboard.html', 'assets/dashboard.js', 'index.html']) {
      assert.ok(fs.existsSync(f), `expected ${f}`);
    }
    const html = fs.readFileSync('dashboard.html', 'utf-8');
    assert.ok(html.includes('assets/dashboard.js'));
    assert.ok(html.includes('style.css'));
    assert.ok(fs.readFileSync('index.html', 'utf-8').includes('dashboard.html'));
    assert.ok(fs.readFileSync('assets/dashboard.js', 'utf-8').includes('learner-state.js'));
  });
});
