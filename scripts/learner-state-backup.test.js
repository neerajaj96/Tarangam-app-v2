/**
 * Dependency-free tests for learner-state backup and restore
 * (node:test + node:assert only — no test framework). Covers the canonical
 * format in assets/learner-state-backup.js plus its Dashboard wiring:
 * valid v1 export, deterministic export bytes, valid restore, malformed
 * JSON, wrong identity, missing fields, invalid statuses/timestamps,
 * unknown topic references, future-version rejection, byte-identical
 * failed imports, full record preservation, export/clear/import
 * stability, local-only behavior, dashboard integration, and
 * accessibility/responsive integration.
 *
 * Run: npm test  (node --test scripts/learner-state-backup.test.js)
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
} from '../assets/learner-state.js';
import * as Backup from './learner-state-backup.js';
import * as AssetsBackup from '../assets/learner-state-backup.js';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

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
const NOW = 1800000000000;

function populatedStore() {
  const store = memoryStorage({
    [legacyVisitedKey('C1')]: JSON.stringify(['m1_01_a']),
    [legacyTimestampKey('C1')]: JSON.stringify({ m1_01_a: 7, m1_02_b: 8 }),
  });
  const s = createLearnerState({ manifest: fixture, storage: store });
  s.markTopicCompleted('C1', 'm1_02_b', 9);
  s.markTopicCompleted('C2', 'm1_01_z', 10);
  return store;
}

describe('module identity and format contract', () => {
  it('shares one implementation with an identifiable deterministic format', () => {
    for (const name of [
      'buildBackup', 'serializeBackup', 'exportBackup', 'downloadBackup',
      'previewBackupImport', 'importBackup',
    ]) {
      assert.equal(Backup[name], AssetsBackup[name]);
    }
    assert.equal(Backup.BACKUP_FORMAT, 'tarangam-learner-state-backup');
    assert.equal(Backup.BACKUP_FORMAT_VERSION, 1);
    assert.equal(Backup.BACKUP_EXPORT_FILENAME, 'tarangam-learner-state-backup.json');
    const source = fs.readFileSync('assets/learner-state-backup.js', 'utf-8');
    assert.ok(!source.includes('fetch('));
    assert.ok(!source.includes('XMLHttpRequest'));
    assert.ok(!source.includes('indexedDB'));
    assert.ok(!source.includes('openai'));
    assert.ok(!source.includes('setInterval'));
  });
});

describe('valid v1 export', () => {
  it('exports records, legacy evidence, version, and identity', () => {
    const text = Backup.exportBackup(populatedStore(), { now: NOW });
    const backup = JSON.parse(text);
    assert.equal(backup.format, 'tarangam-learner-state-backup');
    assert.equal(backup.formatVersion, 1);
    assert.equal(backup.schemaVersion, 1);
    assert.equal(backup.exportedAt, NOW);
    assert.deepEqual(backup.records['C1/m1_02_b'], { status: 'completed', updatedAt: 9 });
    assert.deepEqual(backup.records['C2/m1_01_z'], { status: 'completed', updatedAt: 10 });
    assert.deepEqual(backup.legacy.visited.C1, ['m1_01_a', 'm1_02_b']);
    assert.equal(backup.legacy.timestamps.C1.m1_01_a, 7);
    // No curriculum duplication: titles and bodies never ship.
    assert.ok(!text.includes('Alpha'));
    assert.ok(!JSON.stringify(backup).includes('learningObjectives'));
  });
});

describe('deterministic export', () => {
  it('produces byte-identical output for identical inputs', () => {
    const store = populatedStore();
    assert.equal(Backup.exportBackup(store, { now: NOW }), Backup.exportBackup(store, { now: NOW }));
    // Key ordering is stable (sorted records, courses, ids).
    const text = Backup.exportBackup(store, { now: NOW });
    const keys = Object.keys(JSON.parse(text).records);
    assert.deepEqual(keys, [...keys].sort());
  });
});

describe('valid restore', () => {
  it('replaces storage with validated records and legacy evidence', () => {
    const text = Backup.exportBackup(populatedStore(), { now: NOW });
    const target = memoryStorage();
    const result = Backup.importBackup(target, text, fixture);
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
    // Two v1 records (Beta, Zeta); Alpha arrives via legacy evidence.
    assert.equal(result.summary.records, 2);
    assert.equal(result.summary.completed, 2);
    const s = createLearnerState({ manifest: fixture, storage: target });
    assert.equal(s.getTopicState('C1', 'm1_02_b').status, 'completed');
    assert.equal(s.getTopicState('C2', 'm1_01_z').status, 'completed');
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'completed');
    assert.deepEqual(s.getOverallProgress(), { total: 3, completed: 3, inProgress: 0, notStarted: 0, percent: 100 });
  });

  it('restores legacy backups through the canonical migration layer', () => {
    const legacyBackup = {
      format: 'tarangam-learner-state-backup',
      formatVersion: 0,
      schemaVersion: 0,
      exportedAt: NOW,
      legacy: {
        visited: { C1: ['m1_01_a'] },
        timestamps: { C1: { m1_01_a: 7, m1_02_b: 8 } },
      },
    };
    const target = memoryStorage();
    const result = Backup.importBackup(target, JSON.stringify(legacyBackup), fixture);
    assert.equal(result.ok, true);
    assert.equal(result.summary.kind, 'legacy');
    const s = createLearnerState({ manifest: fixture, storage: target });
    assert.equal(s.getTopicState('C1', 'm1_01_a').status, 'completed');
    assert.equal(s.getTopicState('C1', 'm1_02_b').status, 'in_progress');
  });
});

describe('malformed JSON', () => {
  it('rejects unparseable input with storage byte-identical', () => {
    const store = populatedStore();
    const before = JSON.stringify(dumpOf(store));
    const result = Backup.importBackup(store, 'not-json{{{', fixture);
    assert.equal(result.ok, false);
    assert.ok(result.errors.length > 0);
    assert.equal(JSON.stringify(dumpOf(store)), before);
  });
});

describe('wrong backup identity', () => {
  it('rejects foreign objects without touching storage', () => {
    const store = populatedStore();
    const before = JSON.stringify(dumpOf(store));
    for (const bad of [
      JSON.stringify({ format: 'other-app-backup', records: {} }),
      JSON.stringify({ records: {} }),
      JSON.stringify([1, 2, 3]),
      JSON.stringify('hello'),
    ]) {
      const result = Backup.importBackup(store, bad, fixture);
      assert.equal(result.ok, false);
      assert.ok(result.errors.some((e) => /identity|object/i.test(e)));
    }
    assert.equal(JSON.stringify(dumpOf(store)), before);
  });
});

describe('missing fields', () => {
  it('rejects backups without records or legacy sections', () => {
    const store = populatedStore();
    const before = JSON.stringify(dumpOf(store));
    const noRecords = { format: 'tarangam-learner-state-backup', formatVersion: 1, schemaVersion: 1, exportedAt: NOW, legacy: { visited: {}, timestamps: {} } };
    assert.equal(Backup.importBackup(store, JSON.stringify(noRecords), fixture).ok, false);
    const noLegacy = { format: 'tarangam-learner-state-backup', formatVersion: 1, schemaVersion: 1, exportedAt: NOW, records: {} };
    assert.equal(Backup.importBackup(store, JSON.stringify(noLegacy), fixture).ok, false);
    assert.equal(JSON.stringify(dumpOf(store)), before);
  });
});

describe('invalid statuses', () => {
  it('rejects bad enum values with storage unchanged', () => {
    const store = populatedStore();
    const before = JSON.stringify(dumpOf(store));
    const bad = {
      format: 'tarangam-learner-state-backup', formatVersion: 1, schemaVersion: 1, exportedAt: NOW,
      records: { 'C1/m1_01_a': { status: 'finished!!!', updatedAt: 1 } },
      legacy: { visited: {}, timestamps: {} },
    };
    const result = Backup.importBackup(store, JSON.stringify(bad), fixture);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes('finished!!!')));
    assert.equal(JSON.stringify(dumpOf(store)), before);
  });
});

describe('invalid timestamps', () => {
  it('rejects non-numeric timestamps and bad exportedAt', () => {
    const store = populatedStore();
    const before = JSON.stringify(dumpOf(store));
    // A hand-forged invalid timestamp inside legacy stamps must fail
    // validation (export itself coerces record timestamps to null, so
    // only forged legacy values reach this path).
    const badLegacy = {
      format: 'tarangam-learner-state-backup', formatVersion: 1, schemaVersion: 1, exportedAt: NOW,
      records: {},
      legacy: { visited: { C1: ['m1_01_a'] }, timestamps: { C1: { m1_01_a: 'soon' } } },
    };
    assert.equal(Backup.importBackup(store, JSON.stringify(badLegacy), fixture).ok, false);
    const badExportedAt = {
      format: 'tarangam-learner-state-backup', formatVersion: 1, schemaVersion: 1, exportedAt: 'now',
      records: {}, legacy: { visited: {}, timestamps: {} },
    };
    assert.equal(Backup.importBackup(store, JSON.stringify(badExportedAt), fixture).ok, false);
    assert.equal(JSON.stringify(dumpOf(store)), before);
  });
});

describe('unknown topic references', () => {
  it('imports with warnings while keeping unknown records', () => {
    const store = memoryStorage();
    const backup = {
      format: 'tarangam-learner-state-backup', formatVersion: 1, schemaVersion: 1, exportedAt: NOW,
      records: {
        'C1/m1_01_a': { status: 'completed', updatedAt: 1 },
        'CX/ghost': { status: 'completed', updatedAt: 2 },
      },
      legacy: { visited: {}, timestamps: {} },
    };
    const preview = Backup.previewBackupImport(JSON.stringify(backup), fixture);
    assert.equal(preview.ok, true);
    assert.ok(preview.warnings.some((w) => w.includes('CX/ghost')));
    assert.equal(preview.summary.unknownTopics, 1);
    const result = Backup.importBackup(store, JSON.stringify(backup), fixture);
    assert.equal(result.ok, true);
    assert.equal(createLearnerState({ manifest: fixture, storage: store }).getTopicState('C1', 'm1_01_a').status, 'completed');
  });
});

describe('future-version backup', () => {
  it('rejects newer schemas without downgrading and without writes', () => {
    const store = populatedStore();
    const before = JSON.stringify(dumpOf(store));
    for (const bad of [
      { format: 'tarangam-learner-state-backup', formatVersion: 2, schemaVersion: 2, exportedAt: NOW, records: {}, legacy: { visited: {}, timestamps: {} } },
      { format: 'tarangam-learner-state-backup', formatVersion: 1, schemaVersion: 99, exportedAt: NOW, records: {}, legacy: { visited: {}, timestamps: {} } },
    ]) {
      const result = Backup.importBackup(store, JSON.stringify(bad), fixture);
      assert.equal(result.ok, false);
      assert.ok(result.errors.some((e) => /future|downgrade|version/i.test(e)));
    }
    assert.equal(JSON.stringify(dumpOf(store)), before);
  });

  it('refuses restore into future-owned target storage', () => {
    const v3blob = JSON.stringify({ version: 3 });
    const store = memoryStorage({ 'tarangam_topic_state_v3': v3blob });
    const text = Backup.exportBackup(populatedStore(), { now: NOW });
    const result = Backup.importBackup(store, text, fixture);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => /future/i.test(e)));
    assert.equal(store.getItem('tarangam_topic_state_v3'), v3blob);
    assert.equal(store.getItem(V1_STATE_KEY), null);
  });
});

describe('failed import leaves storage unchanged', () => {
  it('is byte-identical across every rejection class', () => {
    const store = populatedStore();
    const before = JSON.stringify(dumpOf(store));
    const cases = [
      '[[[',
      JSON.stringify({ format: 'nope' }),
      JSON.stringify({ format: 'tarangam-learner-state-backup', formatVersion: 1, schemaVersion: 1, exportedAt: NOW }),
      JSON.stringify({
        format: 'tarangam-learner-state-backup', formatVersion: 1, schemaVersion: 1, exportedAt: NOW,
        records: { 'C1/x': { status: 'bogus', updatedAt: 1 } }, legacy: { visited: {}, timestamps: {} },
      }),
      JSON.stringify({
        format: 'tarangam-learner-state-backup', formatVersion: 9, schemaVersion: 9, exportedAt: NOW,
        records: {}, legacy: { visited: {}, timestamps: {} },
      }),
    ];
    for (const bad of cases) {
      assert.equal(Backup.importBackup(store, bad, fixture).ok, false);
      assert.equal(JSON.stringify(dumpOf(store)), before);
    }
  });
});

describe('successful restore preserves all valid learner records', () => {
  it('keeps every record, timestamp, and legacy entry exactly', () => {
    const text = Backup.exportBackup(populatedStore(), { now: NOW });
    const target = memoryStorage();
    const result = Backup.importBackup(target, text, fixture);
    assert.equal(result.ok, true);
    assert.equal(Backup.exportBackup(target, { now: NOW }), text);
  });
});

describe('repeated export/restore stability', () => {
  it('is a fixed point across cycles', () => {
    const first = Backup.exportBackup(populatedStore(), { now: NOW });
    const a = memoryStorage();
    assert.equal(Backup.importBackup(a, first, fixture).ok, true);
    const second = Backup.exportBackup(a, { now: NOW });
    assert.equal(second, first);
    const b = memoryStorage();
    assert.equal(Backup.importBackup(b, second, fixture).ok, true);
    assert.equal(Backup.exportBackup(b, { now: NOW }), first);
  });
});

describe('local-only and no-network behavior', () => {
  it('downloads locally in browsers and degrades safely without DOM', () => {
    assert.equal(Backup.downloadBackup(memoryStorage()), false);
    const source = fs.readFileSync('assets/learner-state-backup.js', 'utf-8');
    assert.ok(!source.includes('fetch('));
    assert.ok(!source.includes('XMLHttpRequest'));
    assert.ok(!source.includes('indexedDB'));
  });
});

describe('export, clear, and import verification', () => {
  it('restores progress correctly after a full clear', () => {
    const store = populatedStore();
    const text = Backup.exportBackup(store, { now: NOW });
    // Full clear of canonical learner-state keys.
    store.removeItem(V1_STATE_KEY);
    store.removeItem(legacyVisitedKey('C1'));
    store.removeItem(legacyTimestampKey('C1'));
    store.removeItem(legacyVisitedKey('C2'));
    store.removeItem(legacyTimestampKey('C2'));
    assert.equal(createLearnerState({ manifest: fixture, storage: store }).getOverallProgress().completed, 0);
    const result = Backup.importBackup(store, text, fixture);
    assert.equal(result.ok, true);
    const s = createLearnerState({ manifest: fixture, storage: store });
    assert.deepEqual(s.getOverallProgress(), { total: 3, completed: 3, inProgress: 0, notStarted: 0, percent: 100 });
    assert.equal(Backup.exportBackup(store, { now: NOW }), text);
  });
});

describe('Dashboard integration', () => {
  it('ships export, import, preview status, and restore wiring', () => {
    const html = fs.readFileSync('dashboard.html', 'utf-8');
    for (const id of ['db-backup', 'db-export-btn', 'db-import-file', 'db-import-btn', 'db-backup-status']) {
      assert.ok(html.includes(`id="${id}"`), `dashboard missing ${id}`);
    }
    assert.ok(html.includes('role="status"'));
    assert.ok(html.includes('<label') && html.includes('for="db-import-file"'));
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    for (const token of ['previewBackupImport', 'importBackup', 'downloadBackup', 'exportBackup', 'db-import-btn', 'FileReader']) {
      assert.ok(js.includes(token), `dashboard.js missing ${token}`);
    }
    assert.ok(!/fetch\(.*backup|backup.*fetch\(/i.test(js));
  });
});

describe('accessibility and responsive integration', () => {
  it('keeps section semantics, labels, and wrapping conventions', () => {
    const html = fs.readFileSync('dashboard.html', 'utf-8');
    assert.ok(html.includes('<section class="xp-path" id="db-backup"'));
    assert.ok(html.includes('aria-label="Backup and restore"'));
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('removeAttribute(\'disabled\')') || js.includes('removeAttribute("disabled")'));
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    for (const name of ['accessibility.test.js', 'responsive-ux.test.js', 'learner-state-backup.test.js']) {
      assert.ok(pkg.scripts.test.includes(name), `suite must keep ${name}`);
    }
  });
});

describe('live 486-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('round-trips live progress deterministically', () => {
    assert.equal(manifest.topics.length, 486);
    const store = memoryStorage();
    const s = createLearnerState({ manifest, storage: store });
    s.markTopicCompleted('GAMAT301', 'm1_01_random_variables_pmf_cdf', 1700000000000);
    s.markTopicStarted('GAMAT301', 'm1_02_expectation_mean_variance', 1700000001000);
    const text = Backup.exportBackup(store, { now: NOW });
    const preview = Backup.previewBackupImport(text, manifest);
    assert.equal(preview.ok, true);
    assert.equal(preview.summary.records, 2);
    const target = memoryStorage();
    assert.equal(Backup.importBackup(target, text, manifest).ok, true);
    assert.equal(Backup.exportBackup(target, { now: NOW }), text);
    const reopened = createLearnerState({ manifest, storage: target });
    assert.equal(reopened.getTopicState('GAMAT301', 'm1_01_random_variables_pmf_cdf').status, 'completed');
    assert.equal(reopened.getOverallProgress().completed, 1);
  });
});
