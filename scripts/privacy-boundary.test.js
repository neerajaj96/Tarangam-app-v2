/**
 * Deterministic privacy-boundary tests for learner data (node:test +
 * node:assert only — no test framework). Scans the relevant source and
 * runtime files and fails if any prohibited learner-data transmission or
 * persistence mechanism is introduced: learner progress, assessment
 * attempts, revision state, planner state, and backup/restore data must
 * remain browser-local (localStorage/file download only) with no network
 * transmission, no backend dependency, no IndexedDB, no cookies, and no
 * service-worker caching of learner data.
 *
 * Run: npm test  (node --test scripts/privacy-boundary.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(f, 'utf-8');

// Modules that own learner data: progress/state, schema registry, backup,
// assessment attempts, and planner configuration (plus their Node shims).
const LEARNER_MODULES = [
  'assets/learner-state.js',
  'assets/learner-state-schema.js',
  'assets/learner-state-backup.js',
  'assets/assessment.js',
  'assets/study-planner.js',
  'assets/revision.js',
  'scripts/learner-state-schema.js',
  'scripts/learner-state-backup.js',
];

// Network/transmission and non-local persistence mechanisms. `fetch(` with
// a paren avoids matching prose such as "no fetch" in comments.
const BANNED_TRANSMISSION = [
  'fetch(',
  'XMLHttpRequest',
  'sendBeacon',
  'WebSocket',
  'EventSource',
  'indexedDB',
  'document.cookie',
  'firebase',
  'supabase',
  'openai',
  'anthropic',
];

// Every localStorage key family the app may use. Any new family fails the
// suite so it gets an explicit privacy review before shipping.
const ALLOWED_KEY_PREFIXES = [
  'tarangam_topic_state_v',
  'tarangam_visited_',
  'tarangam_visited_ts_',
  'tarangam_assessments_v1',
  'tarangam_study_plan_v1',
  'tarangam_probe__',
];

describe('learner modules stay local-only', () => {
  it('use no network transmission or non-local persistence', () => {
    for (const file of LEARNER_MODULES) {
      assert.ok(fs.existsSync(file), `expected ${file} — actual: missing`);
      const source = read(file);
      for (const token of BANNED_TRANSMISSION) {
        const haystack = token === token.toLowerCase() && token !== 'fetch('
          ? source.toLowerCase()
          : source;
        assert.ok(!haystack.includes(token), `${file} must stay local-only (found "${token}")`);
      }
    }
    // The scanner looked at the right files: canonical keys must be present.
    assert.ok(read('assets/learner-state.js').includes('tarangam_topic_state_v1'));
    assert.ok(read('assets/assessment.js').includes('tarangam_assessments_v1'));
    assert.ok(read('assets/study-planner.js').includes('tarangam_study_plan_v1'));
  });
});

describe('backup and restore stays a local file round-trip', () => {
  it('exports/imports files with no network path', () => {
    const source = read('assets/learner-state-backup.js');
    assert.ok(source.includes('tarangam-learner-state-backup'), 'backup format identity must be explicit');
    for (const token of BANNED_TRANSMISSION) {
      const haystack = token === token.toLowerCase() && token !== 'fetch('
        ? source.toLowerCase()
        : source;
      assert.ok(!haystack.includes(token), `backup must stay local-only (found "${token}")`);
    }
  });
});

describe('service worker never caches learner data', () => {
  it('contains no learner-state keys or storage APIs', () => {
    assert.ok(fs.existsSync('sw.js'), 'expected sw.js — actual: missing');
    const sw = read('sw.js');
    for (const key of ['tarangam_topic_state', 'tarangam_assessments', 'tarangam_study_plan', 'tarangam_visited']) {
      assert.ok(!sw.includes(key), `sw.js must never cache learner data (found "${key}")`);
    }
    for (const token of ['localStorage', 'indexedDB']) {
      assert.ok(!sw.includes(token), `sw.js must not touch learner storage (found "${token}")`);
    }
  });
});

describe('no backend required for core learner functionality', () => {
  it('ships a static-only server with a single health endpoint', () => {
    assert.ok(fs.existsSync('server.ts'), 'expected server.ts — actual: missing');
    const server = read('server.ts');
    assert.ok(server.includes('/api/health'), 'server must keep the health endpoint');
    for (const route of ['app.post(', 'app.put(', 'app.delete(', 'app.patch(']) {
      assert.ok(!server.includes(route), `server must expose no write endpoints (found "${route}")`);
    }
    for (const endpoint of ['/api/progress', '/api/attempt', '/api/state', '/api/sync', '/api/learner']) {
      assert.ok(!server.includes(endpoint), `server must expose no learner endpoint (found "${endpoint}")`);
    }
  });

  it('keeps static data loading separate from learner data', () => {
    // assets/curriculum-data.js may fetch static curriculum JSON, but it
    // must never reference learner storage keys (no learner data in URLs).
    const data = read('assets/curriculum-data.js');
    assert.ok(!/tarangam_/.test(data), 'static data loading must never reference learner keys');
  });
});

describe('storage key allowlist', () => {
  it('introduces no unreviewed localStorage key family', () => {
    const files = fs.readdirSync('assets').filter((f) => f.endsWith('.js')).sort();
    assert.ok(files.length > 0, 'assets/ must hold runtime modules');
    for (const file of files) {
      const source = read(`assets/${file}`);
      for (const m of source.matchAll(/tarangam_[A-Za-z0-9_]+/g)) {
        assert.ok(
          ALLOWED_KEY_PREFIXES.some((prefix) => m[0].startsWith(prefix)),
          `assets/${file} introduces unreviewed storage key "${m[0]}" — update the allowlist after a privacy review`,
        );
      }
    }
  });
});

describe('privacy suite stays wired', () => {
  it('runs in npm test with developer documentation present', () => {
    const pkg = JSON.parse(read('package.json'));
    assert.ok(pkg.scripts.test.includes('privacy-boundary.test.js'), 'suite must run in npm test');
    assert.ok(fs.existsSync('docs/privacy-local-data.md'), 'expected docs/privacy-local-data.md — actual: missing');
    const doc = read('docs/privacy-local-data.md').toLowerCase();
    for (const token of ['localstorage', 'backup', 'not transmitted', 'browser-local']) {
      assert.ok(doc.includes(token), `privacy doc must cover "${token}"`);
    }
  });
});
