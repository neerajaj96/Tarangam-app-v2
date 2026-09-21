/**
 * Deterministic static tests for the GitHub Pages deployment workflow
 * (node:test + node:assert only — no test framework). Verifies
 * .github/workflows/deploy-pages.yml triggers only from the default
 * branch, installs reproducibly, runs the existing quality gate
 * (build → test → lint) before publishing, ships only the generated
 * dist/ directory via the official Pages actions with the minimum Pages
 * permissions, deploys only after a successful build, and introduces no
 * unrelated deployment service or backend behavior. The CI quality
 * workflow stays deployment-free.
 *
 * Run: npm test  (node --test scripts/pages-deployment.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const DEPLOY_PATH = '.github/workflows/deploy-pages.yml';
const CI_PATH = '.github/workflows/ci.yml';
const read = (f) => fs.readFileSync(f, 'utf-8');

describe('deployment trigger', () => {
  it('deploys only from the default branch with optional manual dispatch', () => {
    assert.ok(fs.existsSync(DEPLOY_PATH), `expected ${DEPLOY_PATH} — actual: missing`);
    const yml = read(DEPLOY_PATH);
    assert.ok(yml.includes('push'), 'deployment must trigger on push');
    assert.ok(yml.includes('- main'), 'deployment must trigger from the main branch');
    assert.ok(!yml.includes('- master'), 'deployment must not target the legacy master branch');
    assert.ok(yml.includes('workflow_dispatch'), 'deployment must allow manual dispatch');
    assert.ok(!yml.includes('pull_request'), 'deployment must not run on pull requests');
  });
});

describe('deployment quality gate', () => {
  it('installs reproducibly and validates build, tests, and lint in order', () => {
    const yml = read(DEPLOY_PATH);
    const runLines = [...yml.matchAll(/^\s*run:\s*(.+)$/gm)].map((m) => m[1].trim());
    const indexOf = (cmd) => runLines.findIndex((line) => line.includes(cmd));
    for (const cmd of ['npm ci', 'npm run build:notes', 'npm test', 'npm run lint']) {
      assert.ok(indexOf(cmd) !== -1, `deployment must run ${cmd}`);
    }
    assert.ok(!yml.includes('run: npm install'), 'deployment must not use floating npm install');
    assert.ok(indexOf('npm ci') < indexOf('npm run build:notes'), 'deployment must install before building');
    assert.ok(
      indexOf('npm run build:notes') < indexOf('npm test'),
      'deployment must build before testing so smoke tests see a fresh dist/',
    );
    assert.ok(indexOf('npm test') < indexOf('npm run lint'), 'deployment must test before linting');
    // Quality steps run before the artifact is published.
    const uploadAt = yml.indexOf('upload-pages-artifact');
    for (const cmd of ['npm run build:notes', 'npm test', 'npm run lint']) {
      assert.ok(yml.indexOf(cmd) < uploadAt, `${cmd} must run before the artifact upload`);
    }
    // No silencers: quality failures must block deployment.
    assert.ok(!yml.includes('continue-on-error'), 'deployment must not swallow quality failures');
    assert.ok(!yml.includes('|| true'), 'deployment must not swallow quality failures');
  });

  it('pins the same Node.js toolchain as the CI quality gate', () => {
    const yml = read(DEPLOY_PATH);
    assert.ok(yml.includes('actions/setup-node'), 'deployment must set up Node.js');
    assert.ok(yml.includes('node-version: 22'), 'deployment must pin node-version 22 like CI');
  });
});

describe('deployment artifact', () => {
  it('publishes only the generated dist/ directory', () => {
    const yml = read(DEPLOY_PATH);
    assert.ok(yml.includes('actions/upload-pages-artifact'), 'deployment must upload a Pages artifact');
    assert.ok(/path:\s*['"]?dist['"]?/.test(yml), 'deployment must publish the dist/ artifact');
    assert.ok(!/path:\s*['"]?\.\s*$/m.test(yml), 'deployment must not publish the repo root');
    assert.ok(!yml.includes('path: src') && !yml.includes("path: 'src'"), 'deployment must not publish source files');
  });
});

describe('deployment permissions and gating', () => {
  it('configures the minimum Pages permissions and deploys only after build', () => {
    const yml = read(DEPLOY_PATH);
    for (const perm of ['contents: read', 'pages: write', 'id-token: write']) {
      assert.ok(yml.includes(perm), `deployment must configure permission ${perm}`);
    }
    assert.ok(yml.includes('actions/configure-pages'), 'deployment must configure Pages');
    assert.ok(yml.includes('actions/deploy-pages'), 'deployment must use the official deploy action');
    assert.ok(/needs:\s*build/.test(yml), 'deployment must wait for the build job (no deploy on quality failure)');
  });
});

describe('no unrelated deployment service or backend', () => {
  it('uses only official GitHub actions with no external deploy target', () => {
    const yml = read(DEPLOY_PATH);
    const uses = [...yml.matchAll(/uses:\s*([^\s#]+)/g)].map((m) => m[1]);
    assert.ok(uses.length > 0, 'deployment must declare its actions');
    for (const action of uses) {
      assert.ok(
        action.startsWith('actions/checkout@') ||
          action.startsWith('actions/setup-node@') ||
          action.startsWith('actions/configure-pages@') ||
          action.startsWith('actions/upload-pages-artifact@') ||
          action.startsWith('actions/deploy-pages@'),
        `deployment must use only official Pages actions (found ${action})`,
      );
    }
    for (const token of ['firebase', 'vercel', 'netlify', 'cloudflare', 'heroku', 'supabase', 'openai', 'anthropic']) {
      assert.ok(!yml.toLowerCase().includes(token), `deployment must not introduce ${token}`);
    }
  });

  it('keeps the CI quality workflow separate from deployment', () => {
    assert.ok(fs.existsSync(CI_PATH), `expected ${CI_PATH} — actual: missing`);
    const ci = read(CI_PATH);
    // Only action references count (comments may name the deploy workflow).
    const uses = [...ci.matchAll(/uses:\s*([^\s#]+)/g)].map((m) => m[1]);
    for (const action of uses) {
      assert.ok(
        !action.includes('deploy-pages') &&
          !action.includes('upload-pages-artifact') &&
          !action.includes('configure-pages'),
        `CI workflow must stay deployment-free (found ${action})`,
      );
    }
  });
});
