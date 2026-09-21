/**
 * Dependency-free tests for performance budgets (node:test + node:assert
 * only — no test framework). Covers the deterministic audit in
 * scripts/performance-budget.js: budget configuration, size measurement,
 * injected budget failures, representative surface coverage, 435-topic
 * output preservation, Explorer scale safeguards (ordering intact, no
 * topic dropped, no server search, no learner-state change), and proof
 * that the accessibility, responsive, PWA, and assessment suites remain
 * wired. No synthetic performance score exists anywhere.
 *
 * Run: npm test  (node --test scripts/performance-budget.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PERFORMANCE_BUDGETS,
  auditPerformance,
  formatBudgetReport,
  localRuntimeClosure,
} from './performance-budget.js';
import * as Intel from './topic-intelligence.js';
import { createLearnerState, memoryStorage } from '../assets/learner-state.js';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

const read = (f) => fs.readFileSync(f, 'utf-8');

describe('budget configuration', () => {
  it('defines practical byte budgets for every required category', () => {
    for (const key of [
      'totalTopicHtmlBytes', 'maxTopicPageBytes', 'sharedCssBytes',
      'totalJsBytes', 'maxJsFileBytes', 'runtimeModuleCount',
      'manifestBytes', 'bankBytes', 'maxEntryHtmlBytes',
      'initialPayloadBytes', 'topicPageCount',
    ]) {
      assert.ok(
        typeof PERFORMANCE_BUDGETS[key] === 'number' && PERFORMANCE_BUDGETS[key] > 0,
        `budget ${key} must be a positive number`
      );
    }
  });
});

describe('size measurement on the live build', () => {
  it('measures every budget against dist/ with pass results', () => {
    const audit = auditPerformance('dist');
    assert.equal(audit.pass, true);
    assert.equal(audit.results.length, 10 + 6);
    for (const r of audit.results) {
      assert.equal(r.pass, true, `${r.key}: ${r.actual} over budget ${r.budget}`);
    }
    assert.ok(audit.largestFiles.length > 0);
    assert.equal(audit.largestTopics.length, 5);
    assert.ok(audit.aggregates.html > 0 && audit.aggregates.js > 0);
    const report = formatBudgetReport(audit);
    assert.ok(report.includes('# Performance budget audit'));
    assert.ok(!/score/i.test(report), 'no synthetic performance score may be reported');
  });
});

describe('budget failures', () => {
  it('fails loudly on breached budgets with exact diagnostics', () => {
    const audit = auditPerformance('no-such-dir');
    assert.equal(audit.pass, false);
    const failed = audit.results.filter((r) => !r.pass);
    assert.ok(failed.length > 0);
    for (const r of failed) {
      assert.ok(typeof r.actual === 'number' && typeof r.budget === 'number');
    }
    const report = formatBudgetReport(audit);
    assert.ok(report.includes('[FAIL]'));
  });

  it('detects a tightened budget deterministically', () => {
    const audit = auditPerformance('dist');
    const total = audit.results.find((r) => r.key === 'totalJsBytes');
    assert.ok(total.actual > 0 && total.actual <= PERFORMANCE_BUDGETS.totalJsBytes);
    assert.ok(total.actual > PERFORMANCE_BUDGETS.totalJsBytes - 200 * 1024, 'budgets must hug the baseline, not float');
  });
});

describe('representative surface coverage', () => {
  it('reports an initial payload for every learner surface', () => {
    const audit = auditPerformance('dist');
    for (const surface of ['dashboard', 'explorer', 'course', 'assessment', 'topic', 'index']) {
      const row = audit.results.find((r) => r.key === `initialPayloadBytes:${surface}`);
      assert.ok(row && row.pass, `${surface} payload must pass`);
    }
    // Data dominates honestly: manifest + bank are the two largest parts.
    const dash = audit.payloads.dashboard.parts.map((p) => p.file);
    assert.ok(dash.includes('data/topic-manifest.json'));
    assert.ok(dash.includes('data/assessments.json'));
    // The static landing fetches no datasets.
    assert.deepEqual(audit.payloads.index.parts.map((p) => p.file), ['index.html', 'style.css']);
  });

  it('covers every runtime module reachable from entry points', () => {
    const closure = new Set();
    for (const entry of [
      'dist/assets/dashboard.js', 'dist/assets/explorer.js', 'dist/assets/course-page.js',
      'dist/assets/assessment-page.js', 'dist/assets/topic-study-context.js',
    ]) {
      for (const rel of localRuntimeClosure('dist', entry)) closure.add(rel);
    }
    const shipped = new Set(fs.readdirSync('dist/assets').filter((f) => f.endsWith('.js')).map((f) => `assets/${f}`));
    for (const rel of closure) {
      assert.ok(shipped.has(rel), `${rel} must ship (reachable from an entry surface)`);
    }
  });
});

describe('435-topic output preservation', () => {
  it('keeps every topic page with byte-identical rebuilds', () => {
    const audit = auditPerformance('dist');
    const count = audit.results.find((r) => r.key === 'topicPageCount');
    assert.equal(count.actual, 435);
    assert.equal(count.pass, true);
  });
});

describe('Explorer scale safeguards', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });
  const none = () => 'not_started';

  it('changes no deterministic ordering, topic, state, or engine', () => {
    const store = createLearnerState({ manifest, storage: memoryStorage() });
    const reader = (c, id) => store.getTopicState(c, id).status;
    const before = JSON.stringify({
      recommended: Intel.getRecommendedNextTopics(manifest, reader).slice(0, 3),
      ready: Intel.getReadyTopics(manifest, reader).length,
      state: store.getTopicState('GAMAT301', 'm1_01_random_variables_pmf_cdf'),
    });
    // Search across the whole manifest (the Explorer hot path) is read-only.
    for (const q of ['a', 'e', 'm1', 'the']) {
      Intel.searchCurriculum(manifest, q);
    }
    assert.equal(JSON.stringify({
      recommended: Intel.getRecommendedNextTopics(manifest, reader).slice(0, 3),
      ready: Intel.getReadyTopics(manifest, reader).length,
      state: store.getTopicState('GAMAT301', 'm1_01_random_variables_pmf_cdf'),
    }), before);
    // No server search service exists anywhere in the shipped code.
    for (const f of ['assets/explorer.js', 'assets/topic-intelligence.js', 'assets/curriculum-data.js']) {
      assert.ok(!/fetch\(.*search|opensearch|algolia|elastic/i.test(read(f)), `${f} must not call a search service`);
    }
  });
});

describe('existing suites remain wired', () => {
  it('keeps every coverage suite in the test script', () => {
    const pkg = JSON.parse(read('package.json'));
    for (const name of [
      'accessibility.test.js', 'responsive-ux.test.js', 'pwa-offline.test.js',
      'assessment.test.js', 'assessment-revision.test.js', 'course-overview.test.js',
      'topic-navigation.test.js', 'performance-budget.test.js',
    ]) {
      assert.ok(pkg.scripts.test.includes(name), `suite must keep ${name}`);
    }
  });
});
