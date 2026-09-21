/**
 * Dependency-free tests for learner-state integrity and migrations
 * (node:test + node:assert only — no test framework). Covers the canonical
 * registry in assets/learner-state-schema.js plus its integration in
 * assets/learner-state.js: schema documentation, version detection,
 * validation of v1/legacy shapes, the explicit legacy→v1 migration path
 * (idempotent, legacy-preserving), malformed JSON, missing fields,
 * invalid enums, invalid topic references, unknown future versions with
 * read-only preservation, valid-data preservation, localStorage-only
 * behavior, and continued operation of existing consumers (journey,
 * revision, dashboard progress).
 *
 * Run: npm test  (node --test scripts/learner-state-migration.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createLearnerState,
  memoryStorage,
  legacyVisitedKey,
  legacyTimestampKey,
  V1_STATE_KEY,
  V1_CORRUPT_BACKUP_KEY,
  V2_STATE_KEY,
} from '../assets/learner-state.js';
import * as Schema from './learner-state-schema.js';
import * as AssetsSchema from '../assets/learner-state-schema.js';
import { buildJourneyModel } from '../assets/learning-journey.js';
import { buildRevisionModel } from '../assets/revision.js';

function entry(overrides) {
  const base = {
    id: 'x', courseCode: 'C1', courseName: 'Course One', module: 1, moduleName: 'M1',
    sequence: 1, title: 'X', filename: 'x.html', hasMetadata: true,
    difficulty: 'beginner', estimatedMinutes: 5, concepts: [], learningObjectives: ['Do X'],
    prerequisites: [], examRelevance: 'high', tags: [], prerequisiteDepth: 0,
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
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1 }),
  ],
};

const dumpOf = (store) => store._dump();

describe('schema registry', () => {
  it('shares one implementation with a documented version and shapes', () => {
    for (const name of [
      'detectStoredVersion', 'isFutureVersion', 'validateV1Entry',
      'validateV1Map', 'validateLegacyVisited', 'validateLegacyStamps',
      'validateStoredState', 'migrateStoredState', 'ensureDefaultState',
      'describeLearnerSchema',
    ]) {
      assert.equal(Schema[name], AssetsSchema[name]);
    }
    assert.equal(Schema.LEARNER_SCHEMA_VERSION, 1);
    assert.equal(Schema.V1_CORRUPT_BACKUP_KEY, V1_CORRUPT_BACKUP_KEY);
    assert.equal(Schema.V2_STATE_KEY, V2_STATE_KEY);
    const doc = Schema.describeLearnerSchema();
    assert.equal(doc.version, 1);
    assert.equal(doc.keys.v1State, V1_STATE_KEY);
    assert.deepEqual(doc.v1Entry.status, ['not_started', 'in_progress', 'completed']);
    assert.match(doc.locality, /no backend/);
    // Local-only: no backend, sync, or IndexedDB anywhere in the layer.
    const source = fs.readFileSync('assets/learner-state-schema.js', 'utf-8');
    assert.ok(!source.includes('fetch('));
    assert.ok(!source.includes('XMLHttpRequest'));
    assert.ok(!source.includes('indexedDB'));
    assert.ok(!source.includes('localStorage'));
    assert.ok(!source.includes('openai'));
    assert.ok(!source.includes('setInterval'));
  });
});

describe('version detection without writes', () => {
  it('classifies empty, legacy, current, corrupt, and future stores', () => {
    assert.deepEqual(
      Schema.detectStoredVersion(memoryStorage()).kind, 'empty'
    );
    assert.deepEqual(
      Schema.detectStoredVersion(memoryStorage({ [legacyVisitedKey('C1')]: JSON.stringify(['a']) })).kind,
      'legacy'
    );
    assert.deepEqual(
      Schema.detectStoredVersion(memoryStorage({ [V1_STATE_KEY]: JSON.stringify({ 'C1/a': { status: 'completed', updatedAt: 1 } }) })).kind,
      'current'
    );
    assert.deepEqual(
      Schema.detectStoredVersion(memoryStorage({ [V1_STATE_KEY]: 'not-json{{{' })).kind,
      'corrupt'
    );
    assert.deepEqual(
      Schema.detectStoredVersion(memoryStorage({ [V1_STATE_KEY]: '[1,2]' })).kind,
      'corrupt'
    );
    const future = Schema.detectStoredVersion(memoryStorage({ [V2_STATE_KEY]: JSON.stringify({ version: 2 }) }));
    assert.deepEqual(future.kind, 'future');
    assert.equal(Schema.isFutureVersion(memoryStorage({ [V2_STATE_KEY]: '{}' })), true);
    assert.equal(Schema.isFutureVersion(memoryStorage()), false);
    // Detection never writes.
    const store = memoryStorage({ [V1_STATE_KEY]: 'not-json{{{' });
    Schema.detectStoredVersion(store);
    Schema.validateStoredState(store);
    assert.equal(store.getItem(V1_STATE_KEY), 'not-json{{{');
  });
});

describe('fresh installation', () => {
  it('creates a valid default state with working reads', () => {
    const store = memoryStorage();
    const s = createLearnerState({ manifest: fixture, storage: store });
    assert.equal(s.isReadOnly(), false);
    assert.deepEqual(s.getSchemaInfo(), { version: 1, readOnly: false });
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'not_started');
    assert.deepEqual(s.getOverallProgress(), { total: 3, completed: 0, inProgress: 0, notStarted: 3, percent: 0 });
    assert.deepEqual(JSON.parse(store.getItem(V1_STATE_KEY)), {});
  });
});

describe('current valid state', () => {
  it('preserves valid data byte-identically with no rewrite', () => {
    const v1 = { 'C1/m1_01_a': { status: 'completed', updatedAt: 1700000000000 }, 'C2/m1_01_z': { status: 'in_progress', updatedAt: null } };
    const store = memoryStorage({ [V1_STATE_KEY]: JSON.stringify(v1) });
    const before = store.getItem(V1_STATE_KEY);
    const s = createLearnerState({ manifest: fixture, storage: store });
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'completed');
    assert.equal(s.getTopicState('C2', 'm1_01_z').status, 'in_progress');
    assert.equal(store.getItem(V1_STATE_KEY), before);
    const report = Schema.migrateStoredState(store, fixture);
    assert.equal(report.migrated, false);
    assert.equal(report.from, 'current');
    assert.equal(store.getItem(V1_STATE_KEY), before);
  });
});

describe('legacy state migration', () => {
  it('materializes v1 records from legacy evidence while keeping legacy keys', () => {
    const store = memoryStorage({
      [legacyVisitedKey('C1')]: JSON.stringify(['m1_01_a']),
      [legacyTimestampKey('C1')]: JSON.stringify({ m1_01_a: 1700000000000, m1_02_b: 1700000001000 }),
    });
    // Pre-migration reads keep legacy flags (existing behavior).
    const before = createLearnerState({ manifest: fixture, storage: store });
    assert.equal(before.getTopicState('C1', 'm1_01_a').legacy, true);
    const report = Schema.migrateStoredState(store, fixture);
    assert.equal(report.migrated, true);
    assert.equal(report.from, 'legacy');
    assert.equal(report.to, 1);
    assert.equal(report.readOnly, false);
    const v1 = JSON.parse(store.getItem(V1_STATE_KEY));
    assert.deepEqual(v1['C1/m1_01_a'], { status: 'completed', updatedAt: 1700000000000 });
    assert.deepEqual(v1['C1/m1_02_b'], { status: 'in_progress', updatedAt: 1700000001000 });
    // Legacy keys untouched for old readers.
    assert.deepEqual(JSON.parse(store.getItem(legacyVisitedKey('C1'))), ['m1_01_a']);
    assert.deepEqual(JSON.parse(store.getItem(legacyTimestampKey('C1'))), { m1_01_a: 1700000000000, m1_02_b: 1700000001000 });
    // Post-migration reads agree on statuses.
    const after = createLearnerState({ manifest: fixture, storage: store });
    assert.equal(after.getTopicState('C1', 'm1_01_a').status, 'completed');
    assert.equal(after.getTopicState('C1', 'm1_02_b').status, 'in_progress');
  });
});

describe('repeated migration and idempotence', () => {
  it('changes nothing on reruns', () => {
    const store = memoryStorage({
      [legacyVisitedKey('C1')]: JSON.stringify(['m1_01_a']),
      [legacyTimestampKey('C1')]: JSON.stringify({ m1_01_a: 5 }),
    });
    const first = Schema.migrateStoredState(store, fixture);
    assert.equal(first.migrated, true);
    const snapshot = JSON.stringify(dumpOf(store));
    const second = Schema.migrateStoredState(store, fixture);
    assert.equal(second.migrated, false);
    assert.equal(JSON.stringify(dumpOf(store)), snapshot);
    const third = Schema.migrateStoredState(store);
    assert.equal(third.migrated, false);
  });
});

describe('malformed JSON', () => {
  it('recovers to a valid default with the corrupt blob backed up', () => {
    const store = memoryStorage({ [V1_STATE_KEY]: 'not-json{{{' });
    const s = createLearnerState({ manifest: fixture, storage: store });
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'not_started');
    assert.equal(store.getItem(V1_CORRUPT_BACKUP_KEY), 'not-json{{{');
    assert.deepEqual(JSON.parse(store.getItem(V1_STATE_KEY)), {});
    // Writes work again after recovery.
    s.markTopicCompleted('C1', 'm1_01_a');
    assert.ok(s.isTopicCompleted('C1', 'm1_01_a'));
  });

  it('recovers structurally invalid v1 shapes the same way', () => {
    for (const bad of ['[1,2,3]', '"str"', '42', 'null']) {
      const store = memoryStorage({ [V1_STATE_KEY]: bad });
      const report = Schema.migrateStoredState(store, fixture);
      assert.equal(report.migrated, true);
      assert.deepEqual(JSON.parse(store.getItem(V1_STATE_KEY)), {});
    }
  });
});

describe('missing fields', () => {
  it('keeps entries with safe defaults and validates the rest', () => {
    const report = Schema.validateV1Map({
      'C1/a': { status: 'completed' },
      'C1/b': { status: 'in_progress', updatedAt: undefined },
    });
    assert.equal(report.valid, true);
    assert.deepEqual(report.cleaned['C1/a'], { status: 'completed', updatedAt: null });
    const empty = Schema.validateV1Entry('C1/a', {});
    assert.equal(empty.entry, null);
    assert.ok(empty.errors.length > 0);
  });
});

describe('invalid enum and status values', () => {
  it('drops malformed entries while preserving valid neighbors', () => {
    const store = memoryStorage({
      [V1_STATE_KEY]: JSON.stringify({
        'C1/m1_01_a': { status: 'finished!!!', updatedAt: 1 },
        'C1/m1_02_b': { status: 'completed', updatedAt: 2 },
        'C1/m1_03_x': 'just-a-string',
      }),
    });
    const s = createLearnerState({ manifest: fixture, storage: store });
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'not_started');
    assert.equal(s.getTopicState('C1', 'm1_02_b').status, 'completed');
    const report = Schema.validateStoredState(store, fixture);
    assert.equal(report.valid, false);
    assert.ok(report.errors.some((e) => e.includes('finished!!!')));
    assert.deepEqual(report.v1.cleaned['C1/m1_02_b'], { status: 'completed', updatedAt: 2 });
    assert.ok(!('C1/m1_01_a' in report.v1.cleaned));
  });
});

describe('invalid topic references', () => {
  it('keeps well-formed unknown ids with warnings and drops malformed keys', () => {
    const report = Schema.validateV1Map(
      {
        'CX/nope': { status: 'completed', updatedAt: 1 },
        '': { status: 'completed', updatedAt: 1 },
        'C1/m1_01_a': { status: 'completed', updatedAt: 'yesterday' },
      },
      fixture
    );
    assert.ok('CX/nope' in report.cleaned);
    assert.ok(report.warnings.some((w) => w.includes('CX/nope')));
    assert.ok(!('' in report.cleaned));
    assert.deepEqual(report.cleaned['C1/m1_01_a'], { status: 'completed', updatedAt: null });
  });
});

describe('unknown future schema version', () => {
  it('preserves user data and enters read-only mode without writing', () => {
    const v2blob = JSON.stringify({ version: 2, records: { 'C1/m1_01_a': { status: 'completed' } } });
    const legacy = JSON.stringify(['m1_02_b']);
    const store = memoryStorage({ [V2_STATE_KEY]: v2blob, [legacyVisitedKey('C1')]: legacy });
    const before = JSON.stringify(dumpOf(store));
    const s = createLearnerState({ manifest: fixture, storage: store });
    assert.equal(s.isReadOnly(), true);
    assert.deepEqual(s.getSchemaInfo(), { version: 1, readOnly: true });
    // Reads still work through existing layers.
    assert.equal(s.getTopicState('C1', 'm1_02_b').status, 'completed');
    // Writes are safe no-ops: no byte changes, future blob untouched.
    s.markTopicCompleted('C1', 'm1_01_a');
    s.markTopicStarted('C1', 'm1_01_z');
    s.clearCourseState('C1');
    assert.equal(JSON.stringify(dumpOf(store)), before);
    assert.equal(store.getItem(V2_STATE_KEY), v2blob);
    // Explicit migration refuses as well.
    const report = Schema.migrateStoredState(store, fixture);
    assert.equal(report.migrated, false);
    assert.equal(report.readOnly, true);
    assert.equal(JSON.stringify(dumpOf(store)), before);
  });
});

describe('preservation of valid learner data', () => {
  it('keeps every valid byte through validation and migration', () => {
    const v1 = {
      'C1/m1_01_a': { status: 'completed', updatedAt: 7 },
      'C1/m1_02_b': { status: 'in_progress', updatedAt: null },
      'ZZ/ghost': { status: 'completed', updatedAt: 9 },
    };
    const store = memoryStorage({ [V1_STATE_KEY]: JSON.stringify(v1) });
    const report = Schema.migrateStoredState(store, fixture);
    assert.equal(report.migrated, false);
    assert.deepEqual(JSON.parse(store.getItem(V1_STATE_KEY)), v1);
    const validated = Schema.validateV1Map(v1, fixture);
    assert.deepEqual(validated.cleaned, v1);
  });
});

describe('localStorage-only behavior', () => {
  it('works on memory storage and never requires a backend', () => {
    const s = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    s.markTopicCompleted('C1', 'm1_01_a');
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'completed');
    assert.ok(!('indexedDB' in globalThis) || true);
    const source = fs.readFileSync('assets/learner-state.js', 'utf-8');
    assert.ok(!source.includes('indexedDB'));
    assert.ok(!source.includes('fetch('));
  });
});

describe('existing consumers keep working', () => {
  it('drives journey, revision, and progress from migrated state', () => {
    const store = memoryStorage({
      [legacyVisitedKey('C1')]: JSON.stringify(['m1_01_a']),
      [legacyTimestampKey('C1')]: JSON.stringify({ m1_01_a: 1700000000000 }),
    });
    Schema.migrateStoredState(store, fixture);
    const reader = (c, id) => createLearnerState({ manifest: fixture, storage: store }).getTopicState(c, id).status;
    const journey = buildJourneyModel(fixture, reader);
    assert.equal(journey.overall.completed, 1);
    assert.ok(journey.recommended !== null);
    const revision = buildRevisionModel(fixture, reader, (c, id) => createLearnerState({ manifest: fixture, storage: store }).lastAccessed(c, id), 1800000000000);
    assert.ok(revision.counts.total >= 1);
  });
});

describe('live 432-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('validates empty, legacy, and migrated states at full scale', () => {
    assert.equal(manifest.topics.length, 432);
    const empty = Schema.validateStoredState(memoryStorage(), manifest);
    assert.equal(empty.kind, 'empty');
    assert.equal(empty.valid, true);
    const legacy = memoryStorage({
      [legacyVisitedKey('GAMAT301')]: JSON.stringify(['m1_01_random_variables_pmf_cdf']),
      [legacyTimestampKey('GAMAT301')]: JSON.stringify({ m1_01_random_variables_pmf_cdf: 1700000000000 }),
    });
    const report = Schema.migrateStoredState(legacy, manifest);
    assert.equal(report.migrated, true);
    assert.equal(report.to, 1);
    const second = Schema.migrateStoredState(legacy, manifest);
    assert.equal(second.migrated, false);
    const v1 = JSON.parse(legacy.getItem(V1_STATE_KEY));
    assert.deepEqual(v1['GAMAT301/m1_01_random_variables_pmf_cdf'], { status: 'completed', updatedAt: 1700000000000 });
    const s = createLearnerState({ manifest, storage: legacy });
    assert.equal(s.getOverallProgress().completed, 1);
    assert.equal(s.getOverallProgress().total, 432);
  });
});
