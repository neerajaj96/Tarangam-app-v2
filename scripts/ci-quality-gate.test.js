/**
 * Deterministic static tests for the CI quality gate (node:test +
 * node:assert only — no test framework). Verifies the GitHub Actions
 * workflow exists, runs on pushes and pull requests, pins a supported
 * Node.js version, installs reproducibly, runs exactly the existing
 * commands (npm test / npm run build:notes / npm run lint) so every
 * failure fails the job, duplicates no scripts/check.js logic, adds no
 * deployment and no external services, and that learner-state handling
 * stays local-only with no network/cloud dependency.
 *
 * Run: npm test  (node --test scripts/ci-quality-gate.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const WORKFLOW_PATH = '.github/workflows/ci.yml';
const read = (f) => fs.readFileSync(f, 'utf-8');

describe('CI workflow exists and triggers correctly', () => {
  it('ships a ci workflow triggered on pushes and pull requests', () => {
    assert.ok(fs.existsSync(WORKFLOW_PATH), `expected ${WORKFLOW_PATH} — actual: missing`);
    const yml = read(WORKFLOW_PATH);
    assert.ok(yml.includes('push'), 'workflow must run on push');
    assert.ok(yml.includes('pull_request'), 'workflow must run on pull_request');
  });
});

describe('CI toolchain is pinned and reproducible', () => {
  it('pins a supported Node.js version matching the project toolchain', () => {
    const yml = read(WORKFLOW_PATH);
    assert.ok(yml.includes('actions/setup-node'), 'workflow must set up Node.js');
    // Local dev runs Node v22 (@types/node ^22); CI must match it, not float.
    assert.ok(yml.includes('node-version: 22'), 'workflow must pin node-version 22');
    assert.ok(!yml.includes('node-version: latest'), 'workflow must not float on latest');
  });

  it('installs dependencies reproducibly', () => {
    const yml = read(WORKFLOW_PATH);
    assert.ok(yml.includes('npm ci'), 'workflow must install with npm ci');
    assert.ok(fs.existsSync('package-lock.json'), 'npm ci needs package-lock.json — actual: missing');
    assert.ok(!yml.includes('run: npm install'), 'workflow must not use floating npm install');
  });
});

describe('CI runs the existing quality gate and fails loudly', () => {
  it('runs npm test, build:notes, and lint as separate failing steps', () => {
    const yml = read(WORKFLOW_PATH);
    for (const cmd of ['npm test', 'npm run build:notes', 'npm run lint']) {
      assert.ok(yml.includes(cmd), `workflow must run ${cmd}`);
    }
    // No silencers: any failing command must fail the job.
    assert.ok(!yml.includes('continue-on-error'), 'workflow must not swallow failures');
    assert.ok(!yml.includes('|| true'), 'workflow must not swallow failures');
  });

  it('builds before testing so smoke tests validate a fresh dist/', () => {
    const yml = read(WORKFLOW_PATH);
    const runLines = [...yml.matchAll(/^\s*run:\s*(.+)$/gm)].map((m) => m[1].trim());
    const indexOf = (cmd) => runLines.findIndex((line) => line.includes(cmd));
    for (const cmd of ['npm ci', 'npm run build:notes', 'npm test', 'npm run lint']) {
      assert.ok(indexOf(cmd) !== -1, `workflow must run ${cmd}`);
    }
    assert.ok(
      indexOf('npm ci') < indexOf('npm run build:notes'),
      'workflow must install before building',
    );
    assert.ok(
      indexOf('npm run build:notes') < indexOf('npm test'),
      'workflow must build before testing so smoke tests see a fresh dist/',
    );
    assert.ok(
      indexOf('npm test') < indexOf('npm run lint'),
      'workflow must test before linting',
    );
  });

  it('delegates to existing commands without duplicating check logic', () => {
    const yml = read(WORKFLOW_PATH);
    // No run: step may invoke build/check scripts directly; all logic must
    // flow through the existing npm scripts (comments may still name them).
    const runLines = [...yml.matchAll(/^\s*run:\s*(.+)$/gm)].map((m) => m[1]);
    assert.ok(runLines.length > 0, 'workflow must declare run steps');
    for (const line of runLines) {
      assert.ok(
        !line.includes('scripts/check.js') && !line.includes('scripts/build.js') && !line.includes('node scripts/'),
        `workflow must call npm scripts, not inline check logic (found: ${line})`,
      );
    }
    const pkg = JSON.parse(read('package.json'));
    assert.ok(pkg.scripts['build:notes'].includes('scripts/build.js'), 'build:notes must generate dist/');
    assert.ok(pkg.scripts['build:notes'].includes('scripts/check.js'), 'build:notes must run the QA gate');
  });

  it('adds no deployment and no external services', () => {
    const yml = read(WORKFLOW_PATH);
    for (const token of ['deploy-pages', 'configure-pages', 'upload-pages-artifact', 'firebase', 'supabase', 'aws', 'azure', 'gcp']) {
      assert.ok(!yml.toLowerCase().includes(token), `quality-gate workflow must not include ${token}`);
    }
    const uses = [...yml.matchAll(/uses:\s*([^\s#]+)/g)].map((m) => m[1]);
    assert.ok(uses.length > 0, 'workflow must declare its actions');
    for (const action of uses) {
      assert.ok(
        action.startsWith('actions/checkout@') || action.startsWith('actions/setup-node@'),
        `workflow must stay dependency-minimal (found ${action})`,
      );
    }
  });
});

describe('required commands and suites stay wired', () => {
  it('keeps test, build:notes, and lint scripts with full suite coverage', () => {
    const pkg = JSON.parse(read('package.json'));
    for (const script of ['test', 'build:notes', 'lint']) {
      assert.ok(pkg.scripts[script], `package.json must keep the "${script}" script`);
    }
    // The build/QA path verifies dist/, budgets, PWA, learner-state, and
    // backup/restore safeguards through the existing suites — spot-check
    // that none of those suites drifted out of npm test.
    for (const name of [
      'performance-budget.test.js',
      'pwa-offline.test.js',
      'learner-state.test.js',
      'learner-state-migration.test.js',
      'learner-state-backup.test.js',
      'accessibility.test.js',
      'responsive-ux.test.js',
      'assessment.test.js',
      'ci-quality-gate.test.js',
      'generated-site-smoke.test.js',
    ]) {
      assert.ok(pkg.scripts.test.includes(name), `suite must keep ${name}`);
    }
  });
});

describe('learner-state handling introduces no network/cloud dependency', () => {
  it('keeps every learner-state layer local-only', () => {
    const files = [
      'assets/learner-state.js',
      'assets/learner-state-schema.js',
      'assets/learner-state-backup.js',
      'scripts/learner-state-schema.js',
      'scripts/learner-state-backup.js',
    ];
    // localStorage itself is the legitimate on-device mechanism; everything
    // below would be a network/cloud/backend escape hatch.
    const banned = [
      'fetch(',
      'XMLHttpRequest',
      'indexedDB',
      'WebSocket',
      'EventSource',
      'sendBeacon',
      'firebase',
      'supabase',
      'openai',
      'anthropic',
    ];
    for (const file of files) {
      assert.ok(fs.existsSync(file), `expected ${file} — actual: missing`);
      const source = read(file);
      for (const token of banned) {
        const haystack = token === token.toLowerCase() && token !== 'fetch('
          ? source.toLowerCase()
          : source;
        assert.ok(!haystack.includes(token), `${file} must stay local-only (found "${token}")`);
      }
    }
    // The canonical on-device key stays intact (no storage migration smuggled in).
    assert.ok(read('assets/learner-state.js').includes('tarangam_topic_state_v1'));
  });
});
